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
import { db, auth } from '../firebase';
import { getUserProfile, resolveUsername } from './userService';

export interface Message {
  id: string;
  senderUid: string;
  senderName: string;
  text?: string; // null for media-only or system with placeholder
  timestamp: Timestamp;
  type?: 'user' | 'system' | 'image' | 'video' | 'voice' | 'file';
  
  // System message fields (when type === 'system')
  actionType?: 'join' | 'leave' | 'add_member';
  actorUid?: string; // who performed action
  actorUsername?: string; // cached username
  targetUid?: string; // who was affected (add_member only)
  targetUsername?: string; // cached username
  i18nKey?: string; // 'collaboration.chat.systemMessages.userJoined'
  
  // Media fields (when type is 'image' | 'video' | 'voice' | 'file')
  mediaUrl?: string; // Firebase Storage URL
  mediaSize?: number; // bytes
  mediaDuration?: number; // seconds (voice/video only)
  mediaFilename?: string; // original filename
  mediaType?: string; // MIME type
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
  archived?: boolean; // True if group is empty and archived (for audit purposes)
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
 * Create a system-generated message (for joins, leaves, etc)
 * Stores i18n key and actor data instead of localized text
 * Text is rendered at display time
 * @internal - not exported, used internally by service
 */
async function createSystemMessage(
  conversationId: string,
  i18nKey: string,
  actorUid: string,
  actorUsername: string,
  actionType: 'join' | 'leave' | 'add_member',
  targetUid?: string,
  targetUsername?: string
): Promise<void> {
  const messagesRef = collection(db, 'conversations', conversationId, 'messages');

  await addDoc(messagesRef, {
    senderUid: 'system',
    senderName: 'System',
    text: null, // Don't store localized text - render at display time
    type: 'system',
    actionType,
    actorUid,
    actorUsername,
    targetUid: targetUid || null,
    targetUsername: targetUsername || null,
    i18nKey,
    timestamp: serverTimestamp(),
  });
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
    type: 'user',
    timestamp: serverTimestamp(),
  });

  // Update conversation timestamp
  const conversationRef = doc(db, 'conversations', conversationId);
  await setDoc(conversationRef, { updatedAt: serverTimestamp() }, { merge: true });
}

/**
 * Leave a group chat by removing the user from participants
 * Creates a system message for the leave event
 * Archives group if it becomes empty (audit purposes)
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

  // Get the user's name for the system message
  const userProfile = await getUserProfile(uid);
  const userName = userProfile?.name || 'User';

  // Create system message for the leave event (using i18n key)
  await createSystemMessage(
    conversationId,
    'collaboration.chat.systemMessages.userLeft',
    uid,
    userName,
    'leave'
  );

  // Remove participant
  participants.splice(userIndex, 1);
  participantNames.splice(userIndex, 1);

  // If group is now empty, archive it (don't delete - for audit purposes)
  if (participants.length === 0) {
    await setDoc(
      conversationRef,
      {
        participants: [],
        participantNames: [],
        archived: true,
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );
  } else {
    // Update participants list and timestamp
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
 * Record a user joining a group (creates system message)
 * Used internally when members are added to existing group
 * @internal
 */
export async function recordGroupJoin(
  conversationId: string,
  uid: string
): Promise<void> {
  const userProfile = await getUserProfile(uid);
  const userName = userProfile?.name || 'User';
  await createSystemMessage(
    conversationId,
    'collaboration.chat.systemMessages.userJoined',
    uid,
    userName,
    'join'
  );
}

/**
 * Add a member to an existing group chat
 * Validates that:
 * - Target user exists and is not already a member
 * - Actor hasn't blocked target or vice versa
 * - Group is not archived
 * Creates system message: "{{actor}} added {{target}} to the group"
 */
export async function addMemberToGroup(
  conversationId: string,
  targetUid: string,
  actorUid: string
): Promise<void> {
  // Get the conversation
  const conversationRef = doc(db, 'conversations', conversationId);
  const conversationSnap = await getDoc(conversationRef);

  if (!conversationSnap.exists()) {
    throw new Error('Conversation not found');
  }

  const data = conversationSnap.data();

  // Validate it's a group chat
  if (data.type !== 'group') {
    throw new Error('Can only add members to group chats');
  }

  // Validate group is not archived
  if (data.archived) {
    throw new Error('Cannot add members to archived group');
  }

  // Get current participants
  const participants: string[] = data.participants || [];
  const participantNames: string[] = data.participantNames || [];

  // Check if target is already a member
  if (participants.includes(targetUid)) {
    throw new Error('User is already a member of this group');
  }

  // Check if target user exists
  const targetProfile = await getUserProfile(targetUid);
  if (!targetProfile) {
    throw new Error('Target user not found');
  }

  // Get actor profile for system message
  const actorProfile = await getUserProfile(actorUid);
  const actorName = actorProfile?.name || 'User';
  const targetName = targetProfile.name || 'User';

  // Check if actor has blocked target or target has blocked actor
  let actorBlockedUsers: Set<string> = new Set();
  let targetBlockedUsers: Set<string> = new Set();

  try {
    const actorBlocksSnap = await getDocs(
      collection(db, 'blocks', actorUid, 'list')
    );
    actorBlockedUsers = new Set(
      actorBlocksSnap.docs.map(doc => doc.id)
    );

    const targetBlocksSnap = await getDocs(
      collection(db, 'blocks', targetUid, 'list')
    );
    targetBlockedUsers = new Set(
      targetBlocksSnap.docs.map(doc => doc.id)
    );
  } catch (error) {
    // If blocks don't exist yet, that's okay
  }

  if (actorBlockedUsers.has(targetUid)) {
    throw new Error('You have blocked this user');
  }

  if (targetBlockedUsers.has(actorUid)) {
    throw new Error('This user has blocked you');
  }

  // Add target to participants
  participants.push(targetUid);
  participantNames.push(targetName);

  // Create system message: "{{actor}} added {{target}} to the group"
  await createSystemMessage(
    conversationId,
    'collaboration.chat.systemMessages.userAdded',
    actorUid,
    actorName,
    'add_member',
    targetUid,
    targetName
  );

  // Update conversation with new member
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

/**
 * Subscribe to conversation messages (real-time)
 * Includes both user messages and system messages (joins, leaves)
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
        type: data.type || 'user',
        // System message fields
        actionType: data.actionType,
        actorUid: data.actorUid,
        actorUsername: data.actorUsername,
        targetUid: data.targetUid,
        targetUsername: data.targetUsername,
        i18nKey: data.i18nKey,
        // Media fields (for future use)
        mediaUrl: data.mediaUrl,
        mediaSize: data.mediaSize,
        mediaDuration: data.mediaDuration,
        mediaFilename: data.mediaFilename,
        mediaType: data.mediaType,
      });
    });
    callback(messages);
  });
}

/**
 * Subscribe to user conversations (real-time)
 * Filters out archived groups and does not maintain listeners for them
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
      
      // Skip archived groups (don't maintain listeners for them)
      if (data.archived) {
        continue;
      }

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
          type: lastMsgData.type,
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
        archived: data.archived,
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
    archived: data.archived,
  };
}
