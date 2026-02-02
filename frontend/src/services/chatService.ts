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
  deleteDoc,
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
import { db, auth } from '../firebase';
import { getUserProfile, resolveUsername } from './userService';

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
  groupName?: string;
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
  if (!user1Uid || !user2Uid) {
    throw new Error('Both user IDs are required');
  }

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

  // Ensure both users are in participants array and user1 is first (creator)
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
  // Ensure creator and all participants are unique and included
  const uniqueParticipants = Array.from(new Set([creatorUid, ...participantUids]));
  
  if (uniqueParticipants.length < 2) {
    throw new Error('Group must have at least 2 participants');
  }

  const participantNames: string[] = [];
  for (const uid of uniqueParticipants) {
    const profile = await getUserProfile(uid);
    participantNames.push(profile?.name || 'User');
  }

  const conversationsRef = collection(db, 'conversations');
  const newDocRef = doc(conversationsRef);

  await setDoc(newDocRef, {
    type: 'group' as const,
    participants: uniqueParticipants,
    participantNames,
    groupName: groupName.trim(),
    createdBy: creatorUid,
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
  
  // Fallback: if profile has no name or is stale, use auth user
  let senderName = senderProfile?.name || 'User';
  
  // Extra fallback: get current auth user and resolve username
  if (!senderProfile && auth.currentUser?.uid === senderUid) {
    senderName = resolveUsername(auth.currentUser);
  }
  
  const messagesRef = collection(db, 'conversations', conversationId, 'messages');

  await addDoc(messagesRef, {
    senderUid,
    senderName,
    text: text.trim(),
    timestamp: serverTimestamp(),
  });

  // Update conversation timestamp
  const conversationRef = doc(db, 'conversations', conversationId);
  await setDoc(conversationRef, { updatedAt: serverTimestamp() }, { merge: true });
}

/**
 * Leave a group chat by removing the user from participants
 */
export async function leaveGroupChat(
  conversationId: string,
  uid: string
): Promise<void> {
  const conversationRef = doc(db, 'conversations', conversationId);
  const conversationSnap = await getDoc(conversationRef);

  if (!conversationSnap.exists()) {
    throw new Error('Conversation not found');
  }

  const data = conversationSnap.data();
  
  if (data.type !== 'group') {
    throw new Error('Can only leave group chats');
  }

  // Remove user from participants
  const participants: string[] = data.participants || [];
  const participantNames: string[] = data.participantNames || [];
  
  const userIndex = participants.indexOf(uid);
  if (userIndex === -1) {
    throw new Error('User is not a member of this group');
  }

  // Remove participant
  participants.splice(userIndex, 1);
  participantNames.splice(userIndex, 1);

  // If group is empty, delete it. Otherwise, update it.
  if (participants.length === 0) {
    // Delete all messages first
    const messagesRef = collection(db, 'conversations', conversationId, 'messages');
    const messagesSnap = await getDocs(messagesRef);
    for (const msgDoc of messagesSnap.docs) {
      await deleteDoc(msgDoc.ref);
    }
    // Delete the conversation
    await deleteDoc(conversationRef);
  } else {
    // Update participants
    await setDoc(
      conversationRef,
      {
        participants,
        participantNames,
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );
  }
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
        groupName: data.groupName,
        createdAt: data.createdAt,
        updatedAt: data.updatedAt,
      });
    }

    // Sort by updatedAt descending (most recent first) using toMillis()
    conversations.sort((a, b) => {
      const aTime = a.updatedAt?.toMillis?.() || 0;
      const bTime = b.updatedAt?.toMillis?.() || 0;
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
    groupName: data.groupName,
    createdAt: data.createdAt,
    updatedAt: data.updatedAt,
  };
}
