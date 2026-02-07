/**
 * Preferences Service
 * Handles user accessibility preferences via Firestore (real-time sync)
 * Mirrors the pattern of friendService and userService
 */

import {
  doc,
  setDoc,
  getDoc,
  onSnapshot,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';
import { db } from '../firebase';

export interface AccessibilityPreferences {
  uid: string;
  theme: 'light' | 'dark';
  fontSize: 'small' | 'medium' | 'large';
  audioSpeed: 'slow' | 'normal' | 'fast';
  contrastMode: boolean;
  distractionFreeMode: boolean;
  reducedMotion: boolean;
  dyslexiaFont: boolean;
  blueLightFilter: boolean;
  readingMask: boolean;
  updatedAt?: Timestamp;
}

/**
 * Default accessibility preferences
 */
export const DEFAULT_PREFERENCES: Omit<AccessibilityPreferences, 'uid' | 'updatedAt'> = {
  theme: 'light',
  fontSize: 'medium',
  audioSpeed: 'normal',
  contrastMode: false,
  distractionFreeMode: false,
  reducedMotion: false,
  dyslexiaFont: false,
  blueLightFilter: false,
  readingMask: false,
};

/**
 * Get accessibility preferences for a user
 * Returns defaults if preferences not yet created
 */
export async function getPreferences(uid: string): Promise<AccessibilityPreferences> {
  if (!uid) {
    throw new Error('uid is required');
  }

export async function getPreferences(uid: string): Promise<AccessibilityPreferences> {
  if (!uid) {
    throw new Error('uid is required');
  }

  const prefRef = doc(db, 'users', uid, 'settings', 'accessibility');
  const prefSnap = await getDoc(prefRef);

  if (prefSnap.exists()) {
    const data = prefSnap.data();
    return {
      uid,
      theme: data.theme || DEFAULT_PREFERENCES.theme,
      fontSize: data.fontSize || DEFAULT_PREFERENCES.fontSize,
      audioSpeed: data.audioSpeed || DEFAULT_PREFERENCES.audioSpeed,
      contrastMode: data.contrastMode ?? DEFAULT_PREFERENCES.contrastMode,
      distractionFreeMode:
        data.distractionFreeMode ?? DEFAULT_PREFERENCES.distractionFreeMode,
      reducedMotion: data.reducedMotion ?? DEFAULT_PREFERENCES.reducedMotion,
      dyslexiaFont: data.dyslexiaFont ?? DEFAULT_PREFERENCES.dyslexiaFont,
      blueLightFilter:
        data.blueLightFilter ?? DEFAULT_PREFERENCES.blueLightFilter,
      readingMask: data.readingMask ?? DEFAULT_PREFERENCES.readingMask,
      updatedAt: data.updatedAt,
    };
  }

  // Return defaults if document doesn't exist yet
  return {
    uid,
    ...DEFAULT_PREFERENCES,
  };
}

/**
 * Save/update accessibility preferences
 * Automatically merges with existing data and sets updatedAt
 */
export async function setPreferences(
  uid: string,
  preferences: Partial<Omit<AccessibilityPreferences, 'uid' | 'updatedAt'>>
): Promise<void> {
  if (!uid) {
    throw new Error('uid is required');
  }

  const prefRef = doc(db, 'users', uid, 'settings', 'accessibility');
  await setDoc(
    prefRef,
    {
      ...preferences,
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  );
}

/**
 * Subscribe to accessibility preferences in real-time
 * Returns unsubscribe function; resolves to defaults if not yet set
 */
export function subscribeToPreferences(
  uid: string,
  callback: (preferences: AccessibilityPreferences) => void
): () => void {
  if (!uid) {
    console.error('uid is required for preferences subscription');
    return () => {};
  }

  const prefRef = doc(db, 'users', uid, 'settings', 'accessibility');

  return onSnapshot(
    prefRef,
    (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data();
        callback({
          uid,
          theme: data.theme || DEFAULT_PREFERENCES.theme,
          fontSize: data.fontSize || DEFAULT_PREFERENCES.fontSize,
          audioSpeed: data.audioSpeed || DEFAULT_PREFERENCES.audioSpeed,
          contrastMode: data.contrastMode ?? DEFAULT_PREFERENCES.contrastMode,
          distractionFreeMode:
            data.distractionFreeMode ?? DEFAULT_PREFERENCES.distractionFreeMode,
          reducedMotion:
            data.reducedMotion ?? DEFAULT_PREFERENCES.reducedMotion,
          dyslexiaFont: data.dyslexiaFont ?? DEFAULT_PREFERENCES.dyslexiaFont,
          blueLightFilter:
            data.blueLightFilter ?? DEFAULT_PREFERENCES.blueLightFilter,
          readingMask: data.readingMask ?? DEFAULT_PREFERENCES.readingMask,
          updatedAt: data.updatedAt,
        });
      } else {
        // Return defaults if document doesn't exist
        callback({
          uid,
          ...DEFAULT_PREFERENCES,
        });
      }
    },
    (error) => {
      console.error('Error subscribing to preferences:', error);
      // Return defaults on error
      callback({
        uid,
        ...DEFAULT_PREFERENCES,
      });
    }
  );
}
