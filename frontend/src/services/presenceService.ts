/**
 * Presence Service
 * Tracks user online/offline status in real-time
 */

import { doc, setDoc, serverTimestamp, onDisconnect } from 'firebase/firestore';
import { db } from '../firebase';

/**
 * Set user as online
 * Must be called on login
 */
export async function setUserOnline(uid: string): Promise<void> {
  const presenceRef = doc(db, 'presence', uid);
  
  await setDoc(presenceRef, {
    online: true,
    lastActive: serverTimestamp(),
  }, { merge: true });

  // Set offline when user disconnects
  await onDisconnect(presenceRef).set({
    online: false,
    lastActive: serverTimestamp(),
  });
}

/**
 * Set user as offline
 * Called on logout
 */
export async function setUserOffline(uid: string): Promise<void> {
  const presenceRef = doc(db, 'presence', uid);
  
  await setDoc(presenceRef, {
    online: false,
    lastActive: serverTimestamp(),
  }, { merge: true });
}
