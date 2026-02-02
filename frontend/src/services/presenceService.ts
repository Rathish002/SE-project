/**
 * Presence Service
 * Tracks user online/offline status in real-time
 */

import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
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

/**
 * Update lastActive timestamp without changing online flag.
 * Use this on user actions to indicate activity.
 */
export async function updateLastActive(uid: string): Promise<void> {
  const presenceRef = doc(db, 'presence', uid);
  await setDoc(presenceRef, { lastActive: serverTimestamp() }, { merge: true });
}

/**
 * Setup presence system for current user
 * Handles:
 * - Initial online status
 * - Browser close/refresh (beforeunload)
 * - Tab visibility changes
 * - Periodic heartbeat
 * 
 * Returns cleanup function
 */
export function setupPresenceSystem(uid: string): () => void {
  // Set initial online status
  setUserOnline(uid);
  
  // Heartbeat interval - update lastActive every 30 seconds
  const heartbeatInterval = setInterval(() => {
    updateLastActive(uid);
  }, 30000);
  
  // Handle page visibility changes
  const handleVisibilityChange = () => {
    if (document.visibilityState === 'visible') {
      setUserOnline(uid);
    } else {
      // Tab hidden - update lastActive but stay online
      updateLastActive(uid);
    }
  };
  
  // Handle browser close/refresh
  const handleBeforeUnload = () => {
    // Use synchronous approach for reliable delivery during page unload
    // Note: This is best-effort as browsers may terminate the connection
    setUserOffline(uid).catch(() => {
      // Silent fail - offline status will be detected by timeout eventually
    });
  };
  
  // Attach event listeners
  document.addEventListener('visibilitychange', handleVisibilityChange);
  window.addEventListener('beforeunload', handleBeforeUnload);
  
  // Cleanup function
  return () => {
    clearInterval(heartbeatInterval);
    document.removeEventListener('visibilitychange', handleVisibilityChange);
    window.removeEventListener('beforeunload', handleBeforeUnload);
    setUserOffline(uid);
  };
}

/**
 * Monitor presence system health
 * Detects stale online statuses (users who appear online but haven't updated lastActive)
 */
export async function checkStalePresence(uid: string): Promise<boolean> {
  const presenceRef = doc(db, 'presence', uid);
  const presenceSnap = await getDoc(presenceRef);
  
  if (!presenceSnap.exists()) return false;
  
  const data = presenceSnap.data();
  if (!data.online) return false;
  
  // If lastActive is older than 5 minutes and user is marked online, consider stale
  const lastActive = data.lastActive?.toDate?.() || new Date(0);
  const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
  
  return lastActive < fiveMinutesAgo;
}

