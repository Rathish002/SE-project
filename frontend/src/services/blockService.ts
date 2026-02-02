/**
 * Block Service
 * Handle user blocking functionality
 */

import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  getDoc,
  getDocs,
  serverTimestamp,
  onSnapshot,
} from 'firebase/firestore';
import { db } from '../firebase';

export interface BlockedUser {
  uid: string;
  blockedAt: any;
}

/**
 * Block a user
 */
export async function blockUser(blockerUid: string, blockedUid: string): Promise<void> {
  if (blockerUid === blockedUid) {
    throw new Error('Cannot block yourself');
  }

  const blockRef = doc(db, 'blocks', blockerUid, 'list', blockedUid);
  await setDoc(blockRef, {
    uid: blockedUid,
    blockedAt: serverTimestamp(),
  });
}

/**
 * Unblock a user
 */
export async function unblockUser(blockerUid: string, blockedUid: string): Promise<void> {
  const blockRef = doc(db, 'blocks', blockerUid, 'list', blockedUid);
  await deleteDoc(blockRef);
}

/**
 * Check if user is blocked
 */
export async function isUserBlocked(blockerUid: string, blockedUid: string): Promise<boolean> {
  const blockRef = doc(db, 'blocks', blockerUid, 'list', blockedUid);
  const blockSnap = await getDoc(blockRef);
  return blockSnap.exists();
}

/**
 * Get all blocked users
 */
export async function getBlockedUsers(uid: string): Promise<string[]> {
  const blocksRef = collection(db, 'blocks', uid, 'list');
  const snapshot = await getDocs(blocksRef);
  return snapshot.docs.map(doc => doc.data().uid);
}

/**
 * Subscribe to blocked users list
 */
export function subscribeToBlockedUsers(
  uid: string,
  callback: (blockedUids: string[]) => void
): () => void {
  const blocksRef = collection(db, 'blocks', uid, 'list');
  
  return onSnapshot(blocksRef, (snapshot) => {
    const blockedUids = snapshot.docs.map(doc => doc.data().uid);
    callback(blockedUids);
  });
}
