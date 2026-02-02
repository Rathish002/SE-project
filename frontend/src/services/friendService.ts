/**
 * Friend Service
 * Handles friend search, friend requests, and friend list management
 */

import { 
  collection, 
  query, 
  where, 
  getDocs, 
  doc, 
  setDoc,
  getDoc,
  onSnapshot,
  QuerySnapshot,
  DocumentData,
  Timestamp,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '../firebase';
import { getUserProfile, type UserProfile } from './userService';

export interface FriendRequest {
  id: string;
  fromUid: string;
  toUid: string;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: Timestamp;
}

export interface Friend {
  uid: string;
  name: string;
  email: string;
  online: boolean;
  lastActive?: Timestamp;
}

/**
 * Search users by email
 * Excludes current user
 */
export async function searchUsersByEmail(
  email: string,
  currentUid: string
): Promise<UserProfile[]> {
  if (!email || email.trim() === '') {
    return [];
  }

  const usersRef = collection(db, 'users');
  const q = query(usersRef, where('email', '==', email.trim().toLowerCase()));
  const querySnapshot = await getDocs(q);

  const results: UserProfile[] = [];
  querySnapshot.forEach((docSnap) => {
    const data = docSnap.data();
    if (data.uid !== currentUid) {
      results.push({
        uid: data.uid,
        name: data.name,
        email: data.email,
        createdAt: data.createdAt,
        updatedAt: data.updatedAt,
      });
    }
  });

  return results;
}

/**
 * Send friend request
 */
export async function sendFriendRequest(
  fromUid: string,
  toUid: string
): Promise<string> {
  if (fromUid === toUid) {
    throw new Error('Cannot send friend request to yourself');
  }

  // Check if request already exists
  const requestsRef = collection(db, 'friendRequests');
  const q = query(
    requestsRef,
    where('fromUid', '==', fromUid),
    where('toUid', '==', toUid)
  );
  const existing = await getDocs(q);

  if (!existing.empty) {
    throw new Error('Friend request already sent');
  }

  // Create request document with auto-generated ID
  const requestRef = doc(requestsRef);
  
  await setDoc(requestRef, {
    fromUid,
    toUid,
    status: 'pending',
    createdAt: serverTimestamp(),
  });
  
  return requestRef.id;
}

/**
 * Accept friend request
 * 
 * Secure bidirectional friendship pattern:
 * 1. Recipient (toUid) writes their own friend list entry
 * 2. Update request to "accepted" status
 * 3. Sender (fromUid) listens for status change and writes their own entry
 * 
 * This maintains security: each user only writes their own list
 */
export async function acceptFriendRequest(
  requestId: string,
  fromUid: string,
  toUid: string
): Promise<void> {
  // Step 1: Recipient writes to their own friend list
  const recipientFriendRef = doc(db, 'friends', toUid, 'list', fromUid);
  await setDoc(recipientFriendRef, {
    uid: fromUid,
    addedAt: serverTimestamp(),
  });

  // Step 2: Update request status - triggers sender's listener
  const requestRef = doc(db, 'friendRequests', requestId);
  await setDoc(requestRef, { 
    status: 'accepted',
    acceptedAt: serverTimestamp(),
  }, { merge: true });

  // Step 3: Sender will automatically write their own list when they 
  // detect the status change (see setupAcceptanceListener)
}

/**
 * Reject friend request
 */
export async function rejectFriendRequest(requestId: string): Promise<void> {
  const requestRef = doc(db, 'friendRequests', requestId);
  await setDoc(requestRef, { status: 'rejected' }, { merge: true });
}

/**
 * Setup acceptance listener for sent requests
 * 
 * When sender sees their outgoing request is "accepted",
 * automatically writes their own friend list entry.
 * This completes the bidirectional friendship securely.
 */
export function setupAcceptanceListener(uid: string): () => void {
  const requestsRef = collection(db, 'friendRequests');
  // Query for requests sent BY this user
  const q = query(
    requestsRef,
    where('fromUid', '==', uid),
    where('status', '==', 'accepted')
  );

  return onSnapshot(q, async (snapshot: QuerySnapshot<DocumentData>) => {
    // For each accepted request, write to sender's own friend list
    for (const docSnap of snapshot.docs) {
      const data = docSnap.data();
      const toUid = data.toUid;

      // Write to sender's friend list (the sender's own list - always allowed)
      const senderFriendRef = doc(db, 'friends', uid, 'list', toUid);
      
      // Check if already in list to avoid re-writing
      const existing = await getDoc(senderFriendRef);
      if (!existing.exists()) {
        await setDoc(senderFriendRef, {
          uid: toUid,
          addedAt: serverTimestamp(),
        });
      }
    }
  });
}

/**
 * Subscribe to friend requests (real-time)
 */
export function subscribeToFriendRequests(
  uid: string,
  callback: (requests: FriendRequest[]) => void
): () => void {
  const requestsRef = collection(db, 'friendRequests');
  const q = query(
    requestsRef,
    where('toUid', '==', uid),
    where('status', '==', 'pending')
  );

  return onSnapshot(q, async (snapshot: QuerySnapshot<DocumentData>) => {
    const requests: FriendRequest[] = [];
    
    for (const docSnap of snapshot.docs) {
      const data = docSnap.data();
      requests.push({
        id: docSnap.id,
        fromUid: data.fromUid,
        toUid: data.toUid,
        status: data.status,
        createdAt: data.createdAt,
      });
    }

    callback(requests);
  });
}

/**
 * Subscribe to friend list (real-time)
 * Watches both friend list changes and individual friend profile/presence updates
 */
export function subscribeToFriends(
  uid: string,
  callback: (friends: Friend[]) => void
): () => void {
  const friendsRef = collection(db, 'friends', uid, 'list');
  const profileUnsubscribes: Map<string, () => void> = new Map();
  let currentFriends: Map<string, Friend> = new Map();

  const friendsUnsubscribe = onSnapshot(friendsRef, async (snapshot: QuerySnapshot<DocumentData>) => {
    // Track which friend UIDs are currently in the list
    const friendUids = new Set<string>();
    
    for (const docSnap of snapshot.docs) {
      const friendUid = docSnap.data().uid;
      friendUids.add(friendUid);
      
      // If we're not already watching this friend's profile, start watching
      if (!profileUnsubscribes.has(friendUid)) {
        const profile = await getUserProfile(friendUid);
        const presenceRef = doc(db, 'presence', friendUid);
        const presenceSnap = await getDoc(presenceRef);
        const presence = presenceSnap.data();
        
        if (profile) {
          currentFriends.set(friendUid, {
            uid: profile.uid,
            name: profile.name,
            email: profile.email,
            online: presence?.online || false,
            lastActive: presence?.lastActive,
          });
        }
        
        // Subscribe to profile changes
        const profileUnsubscribe = onSnapshot(doc(db, 'users', friendUid), (profileSnap) => {
          if (profileSnap.exists()) {
            const profileData = profileSnap.data();
            const existing = currentFriends.get(friendUid);
            if (existing) {
              currentFriends.set(friendUid, {
                ...existing,
                name: profileData.name,
                email: profileData.email,
              });
              callback(Array.from(currentFriends.values()));
            }
          }
        });
        
        // Subscribe to presence changes
        const presenceUnsubscribe = onSnapshot(presenceRef, (presenceSnap) => {
          const presenceData = presenceSnap.data();
          const existing = currentFriends.get(friendUid);
          if (existing) {
            currentFriends.set(friendUid, {
              ...existing,
              online: presenceData?.online || false,
              lastActive: presenceData?.lastActive,
            });
            callback(Array.from(currentFriends.values()));
          }
        });
        
        profileUnsubscribes.set(friendUid, () => {
          profileUnsubscribe();
          presenceUnsubscribe();
        });
      }
    }
    
    // Unsubscribe from friends who are no longer in the list
    Array.from(profileUnsubscribes.entries()).forEach(([trackedUid, unsubscribe]) => {
      if (!friendUids.has(trackedUid)) {
        unsubscribe();
        profileUnsubscribes.delete(trackedUid);
        currentFriends.delete(trackedUid);
      }
    });
    
    callback(Array.from(currentFriends.values()));
  });

  // Return cleanup function
  return () => {
    friendsUnsubscribe();
    profileUnsubscribes.forEach(unsub => unsub());
    profileUnsubscribes.clear();
    currentFriends.clear();
  };
}
