/**
 * Chat Service
 * Handles conversations and messages
 */

import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  onSnapshot,
  QuerySnapshot,
  DocumentData,
  Timestamp,
  addDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '../firebase';
import { getUserProfile, type UserProfile } from './userService';

export interface Message {
  id: string;
  senderUid: string;
  senderName: string;
  text: string;
  timestamp: Timestamp;
}

export interface Conversation {
  id: string;
  type: 'direct' | 'group';
  participants: string[];
  participantNames: string[];
  lastMessage?: Message;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

/**
 * Create or get direct conversation between two users
 */
export async function getOrCreateDirectConversation(
  user1Uid: string,
  user2Uid: string
): Promise<string> {
  // Check if conversation already exists
  const conversationsRef = collection(db, 'conversations');
  const q = query(
    conversationsRef,
    where('type', '==', 'direct'),
    where('participants', 'array-contains', user1Uid)
  );

  const snapshot = await getDocs(q);
  for (const docSnap of snapshot.docs) {
    const data = docSnap.data();
    if (
      data.participants.includes(user1Uid) &&
      data.participants.includes(user2Uid) &&
      data.participants.length === 2
    ) {
      return docSnap.id;
    }
  }

  // Create new conversation
  const user1Profile = await getUserProfile(user1Uid);
  const user2Profile = await getUserProfile(user2Uid);

  const conversationData = {
    type: 'direct' as const,
    participants: [user1Uid, user2Uid],
    participantNames: [
      user1Profile?.name || 'User',
      user2Profile?.name || 'User',
    ],
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  const newDocRef = doc(conversationsRef);
  await setDoc(newDocRef, conversationData);

  return newDocRef.id;
}

/**
 * Create group conversation
 */
export async function createGroupConversation(
  creatorUid: string,
  participantUids: string[],
  groupName: string
): Promise<string> {
  const allParticipants = [creatorUid, ...participantUids];
  const participantNames: string[] = [];

  for (const uid of allParticipants) {
    const profile = await getUserProfile(uid);
    participantNames.push(profile?.name || 'User');
  }

  const conversationsRef = collection(db, 'conversations');
  const newDocRef = doc(conversationsRef);

  await setDoc(newDocRef, {
    type: 'group' as const,
    participants: allParticipants,
    participantNames,
    groupName,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  return newDocRef.id;
}

/**
 * Send message to conversation
 */
export async function sendMessage(
  conversationId: string,
  senderUid: string,
  text: string
): Promise<void> {
  const senderProfile = await getUserProfile(senderUid);
  const messagesRef = collection(db, 'conversations', conversationId, 'messages');

  await addDoc(messagesRef, {
    senderUid,
    senderName: senderProfile?.name || 'User',
    text: text.trim(),
    timestamp: serverTimestamp(),
  });

  // Update conversation timestamp
  const conversationRef = doc(db, 'conversations', conversationId);
  await setDoc(conversationRef, { updatedAt: serverTimestamp() }, { merge: true });
}

/**
 * Subscribe to conversation messages (real-time)
 */
export function subscribeToMessages(
  conversationId: string,
  callback: (messages: Message[]) => void
): () => void {
  const messagesRef = collection(db, 'conversations', conversationId, 'messages');
  const q = query(messagesRef, orderBy('timestamp', 'asc'));

  return onSnapshot(q, (snapshot: QuerySnapshot<DocumentData>) => {
    const messages: Message[] = [];
    snapshot.forEach((docSnap) => {
      const data = docSnap.data();
      messages.push({
        id: docSnap.id,
        senderUid: data.senderUid,
        senderName: data.senderName,
        text: data.text,
        timestamp: data.timestamp,
      });
    });
    callback(messages);
  });
}

/**
 * Subscribe to user conversations (real-time)
 */
export function subscribeToConversations(
  uid: string,
  callback: (conversations: Conversation[]) => void
): () => void {
  const conversationsRef = collection(db, 'conversations');
  const q = query(
    conversationsRef,
    where('participants', 'array-contains', uid)
  );

  return onSnapshot(q, async (snapshot: QuerySnapshot<DocumentData>) => {
    const conversations: Conversation[] = [];

    for (const docSnap of snapshot.docs) {
      const data = docSnap.data();
      
      // Get last message
      const messagesRef = collection(db, 'conversations', docSnap.id, 'messages');
      const messagesQuery = query(messagesRef, orderBy('timestamp', 'desc'));
      const messagesSnap = await getDocs(messagesQuery);
      
      let lastMessage: Message | undefined;
      if (!messagesSnap.empty) {
        const lastMsgDoc = messagesSnap.docs[0];
        const lastMsgData = lastMsgDoc.data();
        lastMessage = {
          id: lastMsgDoc.id,
          senderUid: lastMsgData.senderUid,
          senderName: lastMsgData.senderName,
          text: lastMsgData.text,
          timestamp: lastMsgData.timestamp,
        };
      }

      conversations.push({
        id: docSnap.id,
        type: data.type,
        participants: data.participants,
        participantNames: data.participantNames || [],
        lastMessage,
        createdAt: data.createdAt,
        updatedAt: data.updatedAt,
      });
    }

    // Sort by updatedAt descending (most recent first)
    conversations.sort((a, b) => {
      const aTime = a.updatedAt?.toMillis?.() || a.updatedAt?._seconds * 1000 || 0;
      const bTime = b.updatedAt?.toMillis?.() || b.updatedAt?._seconds * 1000 || 0;
      return bTime - aTime;
    });

    callback(conversations);
  });
}

/**
 * Get conversation by ID
 */
export async function getConversation(conversationId: string): Promise<Conversation | null> {
  const conversationRef = doc(db, 'conversations', conversationId);
  const conversationSnap = await getDoc(conversationRef);

  if (!conversationSnap.exists()) {
    return null;
  }

  const data = conversationSnap.data();
  return {
    id: conversationSnap.id,
    type: data.type,
    participants: data.participants,
    participantNames: data.participantNames || [],
    createdAt: data.createdAt,
    updatedAt: data.updatedAt,
  };
}
