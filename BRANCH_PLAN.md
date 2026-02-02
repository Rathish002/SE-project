# Collaboration Identity & Presence - Implementation Plan

## Git Branch Structure
```
main
 └── main/collaboration
     └── main/collaboration/identity
         ├── main/collaboration/identity/username-consistency
         ├── main/collaboration/identity/realtime-username-updates
         ├── main/collaboration/identity/presence-edge-cases
         ├── main/collaboration/identity/presence-lastactive-ui
         ├── main/collaboration/identity/blocked-users
         └── main/collaboration/identity/friendship-lifecycle
```

---

## BRANCH 1: username-consistency
**Branch**: `main/collaboration/identity/username-consistency`
**Parent**: `main/collaboration/identity`
**Goal**: Ensure consistent auth.uid usage and displayName → email prefix fallback

### Files to Modify:
1. **src/services/chatService.ts**
   - Ensure all message sending uses `resolveUsername` from userService
   - Update participantNames to always use resolved usernames

2. **src/components/ChatUI.tsx**
   - Display participant names from conversation.participantNames
   - Add fallback to resolveUsername for display

3. **src/components/FriendList.tsx**
   - Already uses friend.name from profile - verify consistency

4. **src/components/GroupMembers.tsx**
   - Use participantNames from conversation data

### Code Changes:

#### chatService.ts - Update sendMessage
```typescript
// BEFORE (line 140-150)
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

// AFTER
import { getUserProfile, resolveUsername } from './userService';
import { auth } from '../firebase';

export async function sendMessage(
  conversationId: string,
  senderUid: string,
  text: string
): Promise<void> {
  const senderProfile = await getUserProfile(senderUid);
  // Fallback: if profile has no name or is stale, use auth user
  let senderName = senderProfile?.name || 'User';
  
  // Extra fallback: get current auth user and resolve
  if (!senderProfile && auth.currentUser?.uid === senderUid) {
    senderName = resolveUsername(auth.currentUser);
  }
  
  const messagesRef = collection(db, 'conversations', conversationId, 'messages');

  await addDoc(messagesRef, {
    senderUid,
    senderName,
    text: text.trim(),
    timestamp: serverTimestamp(),
```

#### ChatUI.tsx - Consistent Display Names
```typescript
// Add at top
import { resolveUsername } from '../services/userService';

// In component, when displaying chat title (line 144-149)
<h2 className="chat-title">
  {conversation?.type === 'group' 
    ? (conversation.groupName || conversation.participantNames.join(', '))
    : conversation?.participantNames.find((name, idx) => 
        conversation.participants[idx] !== currentUser!.uid
      ) || 'Unknown User'
  }
</h2>
```

---

## BRANCH 2: realtime-username-updates
**Branch**: `main/collaboration/identity/realtime-username-updates`
**Parent**: `main/collaboration/identity`
**Goal**: Propagate username changes across all views in real-time

### Files to Modify:
1. **src/services/userService.ts** (updateUserName already exists)
2. **src/components/Collaboration.tsx** - Add listener for user profile changes
3. **src/services/friendService.ts** - Update subscribeToFriends to listen for profile changes

### Code Changes:

#### userService.ts - Add real-time profile subscription
```typescript
// Add new function after updateUserName (around line 100)

/**
 * Subscribe to user profile changes (real-time)
 * Useful for watching your own profile or other users
 */
export function subscribeToUserProfile(
  uid: string,
  callback: (profile: UserProfile | null) => void
): () => void {
  const userRef = doc(db, 'users', uid);
  
  return onSnapshot(userRef, (snapshot) => {
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
  }, (error) => {
    console.error('Error subscribing to user profile:', error);
    callback(null);
  });
}
```

#### friendService.ts - Update subscribeToFriends to watch profiles
```typescript
// Replace subscribeToFriends (line 215-254)
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
    for (const [trackedUid, unsubscribe] of profileUnsubscribes.entries()) {
      if (!friendUids.has(trackedUid)) {
        unsubscribe();
        profileUnsubscribes.delete(trackedUid);
        currentFriends.delete(trackedUid);
      }
    }
    
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
```

---

## BRANCH 3: presence-edge-cases
**Branch**: `main/collaboration/identity/presence-edge-cases`
**Parent**: `main/collaboration/identity`
**Goal**: Handle browser close, abrupt logout, session refresh

### Files to Modify:
1. **src/services/presenceService.ts** - Add beforeunload and visibility listeners
2. **src/components/Home.tsx** or **App.tsx** - Initialize presence listeners

### Code Changes:

#### presenceService.ts - Add edge case handlers
```typescript
// Add after updateLastActive function

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
    // Use sendBeacon for reliable delivery during page unload
    const presenceData = {
      online: false,
      lastActive: Date.now(),
    };
    
    // Try to set offline immediately (may not complete)
    setUserOffline(uid).catch(() => {
      // If setDoc fails, try navigator.sendBeacon as fallback
      // Note: This requires a backend endpoint, so we'll just do best effort
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
```

#### Home.tsx or App.tsx - Initialize presence
```typescript
// In Home.tsx (around line 30-50, in useEffect for currentUser)
useEffect(() => {
  if (currentUser?.uid) {
    // Initialize presence system
    const cleanupPresence = setupPresenceSystem(currentUser.uid);
    
    // Also setup friend request acceptance listener
    const cleanupAcceptance = setupAcceptanceListener(currentUser.uid);
    
    return () => {
      cleanupPresence();
      cleanupAcceptance();
    };
  }
}, [currentUser?.uid]);
```

---

## BRANCH 4: presence-lastactive-ui
**Branch**: `main/collaboration/identity/presence-lastactive-ui`
**Parent**: `main/collaboration/identity`
**Goal**: Display lastActive timestamps in friend list and chat UI

### Files to Modify:
1. **src/components/FriendList.tsx**
2. **src/components/ChatUI.tsx**
3. **src/utils/timeUtils.ts** (new file)

### Code Changes:

#### utils/timeUtils.ts - NEW FILE
```typescript
/**
 * Time utilities for displaying timestamps
 */
import { Timestamp } from 'firebase/firestore';

export function formatLastActive(lastActive: Timestamp | undefined): string {
  if (!lastActive) return 'Unknown';
  
  const date = lastActive.toDate ? lastActive.toDate() : new Date(lastActive);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMinutes = Math.floor(diffMs / 60000);
  
  if (diffMinutes < 1) return 'Just now';
  if (diffMinutes < 60) return `${diffMinutes}m ago`;
  
  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `${diffDays}d ago`;
  
  return date.toLocaleDateString();
}
```

#### FriendList.tsx - Show lastActive
```typescript
// Import timeUtils at top
import { formatLastActive } from '../utils/timeUtils';

// Update friend item rendering (line 30-50)
{friends.map((friend) => (
  <div key={friend.uid} className="friend-item">
    <div className="friend-info">
      <div className="friend-name-row">
        <span className="friend-name">{friend.name}</span>
        <span className={`friend-status ${friend.online ? 'online' : 'offline'}`}>
          {friend.online 
            ? t('collaboration.friends.online')
            : `Last seen ${formatLastActive(friend.lastActive)}`
          }
        </span>
      </div>
      <span className="friend-email">{friend.email}</span>
    </div>
    <div className="friend-actions">
      <button
        className="friend-action-button"
        onClick={() => onStartChat(friend.uid)}
        aria-label={t('collaboration.friends.startChat')}
      >
        {t('collaboration.friends.startChat')}
      </button>
    </div>
  </div>
))}
```

#### ChatUI.tsx - Show participant lastActive in sidebar
```typescript
// Import formatLastActive
import { formatLastActive } from '../utils/timeUtils';
import { onSnapshot } from 'firebase/firestore';

// Update participant display in sidebar (line 195-210)
<div className="chat-participants">
  {participants.map((participant) => (
    <div key={participant.uid} className="chat-participant">
      <span className={`chat-participant-status ${participant.online ? 'online' : 'offline'}`}></span>
      <div className="chat-participant-info">
        <span className="chat-participant-name">{participant.name}</span>
        {!participant.online && participant.lastActive && (
          <span className="chat-participant-lastactive">
            {formatLastActive(participant.lastActive)}
          </span>
        )}
      </div>
      {participant.uid === currentUser!.uid && (
        <span className="chat-participant-you">({t('collaboration.chat.you')})</span>
      )}
    </div>
  ))}
</div>
```

---

## BRANCH 5: blocked-users
**Branch**: `main/collaboration/identity/blocked-users`
**Parent**: `main/collaboration/identity`
**Goal**: Add blocked user functionality

### Files to Create/Modify:
1. **src/services/blockService.ts** (NEW)
2. **src/services/friendService.ts** - Update search to exclude blocked
3. **src/components/FriendList.tsx** - Add block/unblock UI
4. **src/components/FriendSearch.tsx** - Filter blocked users

### Code Changes:

#### services/blockService.ts - NEW FILE
```typescript
/**
 * Block Service
 * Handle user blocking functionality
 */

import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  getDocs,
  query,
  where,
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
```

#### friendService.ts - Filter blocked users in search
```typescript
// Update searchUsersByEmail (line 40-70)
import { getBlockedUsers } from './blockService';

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

  // Get blocked users
  const blockedUids = await getBlockedUsers(currentUid);
  const blockedSet = new Set(blockedUids);

  const results: UserProfile[] = [];
  querySnapshot.forEach((docSnap) => {
    const data = docSnap.data();
    // Exclude current user and blocked users
    if (data.uid !== currentUid && !blockedSet.has(data.uid)) {
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
```

#### friendService.ts - Hide presence for blocked users
```typescript
// Update subscribeToFriends to check blocked status
// Modify the existing function to filter blocked users
export function subscribeToFriends(
  uid: string,
  callback: (friends: Friend[]) => void
): () => void {
  const friendsRef = collection(db, 'friends', uid, 'list');
  let blockedUids: Set<string> = new Set();
  
  // Subscribe to blocked users
  const blockedUnsubscribe = subscribeToBlockedUsers(uid, (blocked) => {
    blockedUids = new Set(blocked);
    // Re-fetch friends to apply new block list
  });

  const friendsUnsubscribe = onSnapshot(friendsRef, async (snapshot: QuerySnapshot<DocumentData>) => {
    const friends: Friend[] = [];

    for (const docSnap of snapshot.docs) {
      const friendUid = docSnap.data().uid;
      
      // Skip if blocked
      if (blockedUids.has(friendUid)) continue;
      
      const profile = await getUserProfile(friendUid);
      
      if (profile) {
        // Get presence - but show as offline if blocked
        const presenceRef = doc(db, 'presence', friendUid);
        const presenceSnap = await getDoc(presenceRef);
        const presence = presenceSnap.data();

        friends.push({
          uid: profile.uid,
          name: profile.name,
          email: profile.email,
          online: presence?.online || false,
          lastActive: presence?.lastActive,
        });
      }
    }

    callback(friends);
  });
  
  return () => {
    friendsUnsubscribe();
    blockedUnsubscribe();
  };
}
```

#### FriendList.tsx - Add block button
```typescript
// Add block functionality
import { blockUser } from '../services/blockService';

// Add state for confirmation
const [blockConfirm, setBlockConfirm] = useState<string | null>(null);

// Add handler
const handleBlock = async (friendUid: string) => {
  if (!currentUid) return;
  
  if (blockConfirm !== friendUid) {
    setBlockConfirm(friendUid);
    return;
  }
  
  try {
    await blockUser(currentUid, friendUid);
    setBlockConfirm(null);
  } catch (error) {
    console.error('Error blocking user:', error);
  }
};

// Update UI to include block button
<div className="friend-actions">
  <button onClick={() => onStartChat(friend.uid)}>
    {t('collaboration.friends.startChat')}
  </button>
  <button 
    onClick={() => handleBlock(friend.uid)}
    className="friend-block-btn"
  >
    {blockConfirm === friend.uid ? 'Confirm Block?' : 'Block'}
  </button>
</div>
```

---

## BRANCH 6: friendship-lifecycle
**Branch**: `main/collaboration/identity/friendship-lifecycle`
**Parent**: `main/collaboration/identity`
**Goal**: Improve friend request lifecycle and add unfriend confirmation

### Files to Modify:
1. **src/services/friendService.ts** - Add unfriend, cleanup stale requests
2. **src/components/FriendList.tsx** - Add unfriend confirmation UI
3. **src/components/FriendRequests.tsx** - Handle stale requests gracefully

### Code Changes:

#### friendService.ts - Add unfriend and cleanup
```typescript
// Add after acceptFriendRequest

/**
 * Remove a friend (unfriend)
 * Removes bidirectional friendship entries
 */
export async function removeFriend(
  user1Uid: string,
  user2Uid: string
): Promise<void> {
  // Remove from both friend lists
  const user1FriendRef = doc(db, 'friends', user1Uid, 'list', user2Uid);
  const user2FriendRef = doc(db, 'friends', user2Uid, 'list', user1Uid);
  
  await Promise.all([
    deleteDoc(user1FriendRef),
    deleteDoc(user2FriendRef),
  ]);
}

/**
 * Cleanup stale friend requests
 * Removes requests older than 30 days or for users that don't exist
 */
export async function cleanupStaleFriendRequests(uid: string): Promise<void> {
  const requestsRef = collection(db, 'friendRequests');
  
  // Get all requests involving this user
  const sentQuery = query(requestsRef, where('fromUid', '==', uid));
  const receivedQuery = query(requestsRef, where('toUid', '==', uid));
  
  const [sentSnapshot, receivedSnapshot] = await Promise.all([
    getDocs(sentQuery),
    getDocs(receivedQuery),
  ]);
  
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  
  const deletePromises: Promise<void>[] = [];
  
  for (const docSnap of [...sentSnapshot.docs, ...receivedSnapshot.docs]) {
    const data = docSnap.data();
    const createdAt = data.createdAt?.toDate?.() || new Date(0);
    
    // Delete if older than 30 days or if status is not pending
    if (createdAt < thirtyDaysAgo || data.status !== 'pending') {
      deletePromises.push(deleteDoc(doc(db, 'friendRequests', docSnap.id)));
    }
  }
  
  await Promise.all(deletePromises);
}

/**
 * Check if friend request exists and is valid
 */
export async function validateFriendRequest(requestId: string): Promise<{
  valid: boolean;
  reason?: string;
}> {
  const requestRef = doc(db, 'friendRequests', requestId);
  const requestSnap = await getDoc(requestRef);
  
  if (!requestSnap.exists()) {
    return { valid: false, reason: 'Request not found' };
  }
  
  const data = requestSnap.data();
  
  if (data.status !== 'pending') {
    return { valid: false, reason: 'Request already handled' };
  }
  
  // Check if both users still exist
  const fromUserRef = doc(db, 'users', data.fromUid);
  const toUserRef = doc(db, 'users', data.toUid);
  
  const [fromSnap, toSnap] = await Promise.all([
    getDoc(fromUserRef),
    getDoc(toUserRef),
  ]);
  
  if (!fromSnap.exists()) {
    return { valid: false, reason: 'Sender account not found' };
  }
  
  if (!toSnap.exists()) {
    return { valid: false, reason: 'Recipient account not found' };
  }
  
  return { valid: true };
}
```

#### FriendList.tsx - Add unfriend confirmation
```typescript
// Add props
interface FriendListProps {
  friends: Friend[];
  currentUid: string;
  onStartChat: (friendUid: string) => void;
  onStartGroup?: (friendUids: string[]) => void;
}

// Add state
const [unfriendConfirm, setUnfriendConfirm] = useState<string | null>(null);
const [unfriending, setUnfriending] = useState(false);

// Import removeFriend
import { removeFriend } from '../services/friendService';

// Add handler
const handleUnfriend = async (friendUid: string) => {
  if (unfriendConfirm !== friendUid) {
    setUnfriendConfirm(friendUid);
    setTimeout(() => setUnfriendConfirm(null), 5000); // Auto-cancel after 5s
    return;
  }
  
  try {
    setUnfriending(true);
    await removeFriend(currentUid, friendUid);
    setUnfriendConfirm(null);
  } catch (error) {
    console.error('Error removing friend:', error);
    alert(t('collaboration.friends.unfriendError'));
  } finally {
    setUnfriending(false);
  }
};

// Update UI
<div className="friend-actions">
  <button
    className="friend-action-button"
    onClick={() => onStartChat(friend.uid)}
    disabled={unfriending}
  >
    {t('collaboration.friends.startChat')}
  </button>
  <button
    className="friend-action-button friend-unfriend-button"
    onClick={() => handleUnfriend(friend.uid)}
    disabled={unfriending}
  >
    {unfriendConfirm === friend.uid 
      ? t('collaboration.friends.confirmUnfriend')
      : t('collaboration.friends.unfriend')
    }
  </button>
</div>
```

#### FriendRequests.tsx - Handle stale requests
```typescript
// Import validation
import { validateFriendRequest } from '../services/friendService';

// Add state for validation
const [validRequests, setValidRequests] = useState<Set<string>>(new Set());

// Validate requests on load
useEffect(() => {
  const validateAll = async () => {
    const valid = new Set<string>();
    
    for (const request of requests) {
      const validation = await validateFriendRequest(request.id);
      if (validation.valid) {
        valid.add(request.id);
      }
    }
    
    setValidRequests(valid);
  };
  
  validateAll();
}, [requests]);

// Filter display
const displayRequests = requests.filter(req => validRequests.has(req.id));

// Update render
if (displayRequests.length === 0) {
  return null;
}

return (
  <div className="friend-requests">
    <h3>{t('collaboration.requests.title')}</h3>
    <div className="friend-requests-list">
      {displayRequests.map((request) => {
        const profile = requestProfiles.get(request.id);
        return (
          // ... existing rendering
        );
      })}
    </div>
  </div>
);
```

---

## Testing Checklist

### Branch 1 - Username Consistency
- [ ] Send message in direct chat - verify displayName shows
- [ ] Send message with email-only account - verify email prefix shows
- [ ] Check group chat participant names match profiles

### Branch 2 - Real-time Updates
- [ ] Change username in one tab, verify it updates in another
- [ ] Check friend list updates immediately
- [ ] Verify chat UI shows updated name

### Branch 3 - Presence Edge Cases
- [ ] Close browser tab - verify offline status sets
- [ ] Refresh page - verify user comes back online
- [ ] Hide tab - verify lastActive updates
- [ ] Open multiple tabs - verify heartbeat works

### Branch 4 - LastActive UI
- [ ] Check friend list shows "2m ago", "1h ago", etc.
- [ ] Verify chat sidebar shows lastActive for offline users
- [ ] Confirm "Just now" shows for recent activity

### Branch 5 - Blocked Users
- [ ] Block user - verify hidden from friend list
- [ ] Block user - verify excluded from search
- [ ] Block user - verify no presence shown
- [ ] Unblock user - verify they reappear

### Branch 6 - Friendship Lifecycle
- [ ] Send friend request - accept - verify bidirectional
- [ ] Unfriend - verify confirmation required
- [ ] Unfriend - verify removes both directions
- [ ] Old friend requests cleanup
- [ ] Handle deleted user accounts gracefully

---

## Merge Strategy

1. Complete Branch 1 → merge to `main/collaboration/identity`
2. Complete Branch 2 → merge to `main/collaboration/identity`
3. Complete Branch 3 → merge to `main/collaboration/identity`
4. Complete Branch 4 → merge to `main/collaboration/identity`
5. Complete Branch 5 → merge to `main/collaboration/identity`
6. Complete Branch 6 → merge to `main/collaboration/identity`
7. When ALL features complete → merge `main/collaboration/identity` to `main/collaboration`

**DO NOT merge directly to main at any point.**
