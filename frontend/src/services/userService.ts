/**
 * User Service
 * Handles user profile initialization and management
 * Uses Firebase Auth UID as the unique identifier
 */

import { User } from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
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
