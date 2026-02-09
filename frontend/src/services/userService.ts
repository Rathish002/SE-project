/**
 * User Service
 * Handles user profile initialization and management
 * Uses Firebase Auth UID as the unique identifier
 */

import { User, updatePassword, reauthenticateWithCredential, EmailAuthProvider, deleteUser } from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp, collection, query, where, getDocs, deleteDoc, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';

export interface UserProfile {
  uid: string;
  name: string;
  email: string;
  createdAt: any; // Firestore Timestamp
  updatedAt?: any; // Firestore Timestamp
}

/**
 * Resolve username from Firebase Auth user
 * Priority: displayName > email prefix
 */
export function resolveUsername(user: User): string {
  if (user.displayName) {
    return user.displayName;
  }
  if (user.email) {
    return user.email.split('@')[0];
  }
  return 'User';
}

/**
 * Initialize or update user profile in Firestore
 * Must be called after user authentication
 */
export async function initializeUserProfile(user: User): Promise<UserProfile> {
  const uid = user.uid;
  const name = resolveUsername(user);
  const email = user.email || '';

  const userRef = doc(db, 'users', uid);
  const userSnap = await getDoc(userRef);

  const profileData: Partial<UserProfile> = {
    uid,
    name,
    email,
    updatedAt: serverTimestamp(),
  };

  if (!userSnap.exists()) {
    // New user - set createdAt
    profileData.createdAt = serverTimestamp();
  }

  await setDoc(userRef, profileData, { merge: true });

  return {
    uid,
    name,
    email,
    createdAt: userSnap.exists() ? userSnap.data().createdAt : null,
    updatedAt: null,
  };
}

/**
 * Get user profile by UID
 */
export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  const userRef = doc(db, 'users', uid);
  const userSnap = await getDoc(userRef);

  if (!userSnap.exists()) {
    return null;
  }

  const data = userSnap.data();
  return {
    uid: data.uid,
    name: data.name,
    email: data.email,
    createdAt: data.createdAt,
    updatedAt: data.updatedAt,
  };
}

/**
 * Update a user's display name and propagate to conversations participantNames.
 * This keeps the name tied to the uid and updates participant displays in real time.
 */
export async function updateUserName(uid: string, newName: string): Promise<void> {
  const userRef = doc(db, 'users', uid);
  await setDoc(userRef, { name: newName, updatedAt: serverTimestamp() }, { merge: true });

  // Propagate to conversations where this user is a participant
  try {
    const conversationsRef = collection(db, 'conversations');
    const q = query(conversationsRef, where('participants', 'array-contains', uid));
    const snaps = await getDocs(q);
    for (const snap of snaps.docs) {
      const data = snap.data();
      const participants: string[] = data.participants || [];
      const participantNames: string[] = data.participantNames || [];
      const idx = participants.indexOf(uid);
      if (idx !== -1) {
        participantNames[idx] = newName;
        const convRef = doc(conversationsRef, snap.id);
        await setDoc(convRef, { participantNames, updatedAt: serverTimestamp() }, { merge: true });
      }
    }
  } catch (e) {
    console.warn('Failed to propagate username to conversations', e);
  }
}

/**
 * Subscribe to user profile changes (real-time)
 * Useful for watching your own profile or other users
 */
export function subscribeToUserProfile(
  uid: string,
  callback: (profile: UserProfile | null) => void
): () => void {
  const userRef = doc(db, 'users', uid);

  return onSnapshot(userRef, (snapshot: any) => {
    if (snapshot.exists()) {
      const data = snapshot.data();
      callback({
        uid: data.uid,
        name: data.name,
        email: data.email,
        createdAt: data.createdAt,
        updatedAt: data.updatedAt,
      });
    } else {
      callback(null);
    }
  }, (error: any) => {
    console.error('Error subscribing to user profile:', error);
    callback(null);
  });
}

/**
 * Change user password
 * Requires the current password for reauthentication
 */
export async function changePassword(user: User, currentPassword: string, newPassword: string): Promise<void> {
  if (!user.email) {
    throw new Error('User email not found');
  }

  // Reauthenticate user
  const credential = EmailAuthProvider.credential(user.email, currentPassword);
  await reauthenticateWithCredential(user, credential);

  // Update password
  await updatePassword(user, newPassword);
}

/**
 * Delete user account
 * Requires reauthentication and deletes all user data from Firestore
 */
export async function deleteUserAccount(user: User, password: string): Promise<void> {
  if (!user.email) {
    throw new Error('User email not found');
  }

  try {
    // Reauthenticate user
    const credential = EmailAuthProvider.credential(user.email, password);
    await reauthenticateWithCredential(user, credential);

    // Delete user data from Firestore
    const uid = user.uid;

    // Delete user profile
    const userRef = doc(db, 'users', uid);
    await deleteDoc(userRef);

    // Delete user's friend list
    try {
      const friendsRef = collection(db, 'friends', uid, 'list');
      const friendSnaps = await getDocs(friendsRef);
      for (const snap of friendSnaps.docs) {
        await deleteDoc(snap.ref);
      }
    } catch (e) {
      console.warn('Error deleting friend list:', e);
    }

    // Delete user's presence
    try {
      const presenceRef = doc(db, 'presence', uid);
      await deleteDoc(presenceRef);
    } catch (e) {
      console.warn('Error deleting presence:', e);
    }

    // Delete user from Firebase Auth
    await deleteUser(user);
  } catch (error) {
    if (error instanceof Error && error.message.includes('auth/wrong-password')) {
      throw new Error('Invalid password');
    }
    throw error;
  }
}