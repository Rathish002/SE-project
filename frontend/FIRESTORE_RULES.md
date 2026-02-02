# Firestore Security Rules

These rules enable full collaboration features including friend requests, chats, and presence tracking.

## Setup Instructions

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Click **Firestore Database** → **Rules** tab
4. Clear the default rules and paste the rules below
5. Click **Publish**

## Security Rules

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    /* =========================
       USERS
       ========================= */
    match /users/{uid} {
      allow read: if request.auth != null;
      allow write: if request.auth != null &&
        request.auth.uid == uid;
    }

    /* =========================
       FRIEND REQUESTS
       ========================= */
    match /friendRequests/{requestId} {
      allow read: if request.auth != null &&
        (resource.data.fromUid == request.auth.uid ||
         resource.data.toUid == request.auth.uid);

      allow create: if request.auth != null &&
        request.resource.data.fromUid == request.auth.uid;

      allow update, delete: if request.auth != null &&
        (resource.data.fromUid == request.auth.uid ||
         resource.data.toUid == request.auth.uid);
    }

    /* =========================
       FRIEND LIST
       ========================= */
    match /friends/{uid}/list/{friendUid} {
      allow read: if request.auth != null &&
        request.auth.uid == uid;
      
      allow write: if request.auth != null &&
        request.auth.uid == uid;
    }

    /* =========================
       CONVERSATIONS
       ========================= */
    match /conversations/{convId} {
      allow create: if request.auth != null &&
        request.auth.uid in request.resource.data.participants &&
        request.resource.data.participants.size() >= 2;

      allow read: if request.auth != null &&
        request.auth.uid in resource.data.participants;
      
      allow update: if request.auth != null &&
        request.auth.uid in resource.data.participants;
      
      allow delete: if request.auth != null &&
        request.auth.uid in resource.data.participants;
    }

    /* =========================
       MESSAGES
       ========================= */
    match /conversations/{convId}/messages/{msgId} {
      allow read, write: if request.auth != null &&
        request.auth.uid in
        get(/databases/$(database)/documents/conversations/$(convId))
          .data.participants;
    }

    /* =========================
       PRESENCE
       ========================= */
    match /presence/{uid} {
      allow read: if request.auth != null;
      allow write: if request.auth != null &&
        request.auth.uid == uid;
    }

    /* =========================
       BLOCKS
       ========================= */
    match /blocks/{uid}/list/{blockedUid} {
      allow read: if request.auth != null &&
        request.auth.uid == uid;
      
      allow write: if request.auth != null &&
        request.auth.uid == uid;
    }

    /* =========================
       DEFAULT DENY
       ========================= */
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

## What These Rules Allow

✅ **Users**: Each user can read all profiles and write only their own  
✅ **Friend Requests**: Users can create requests, read their own, and accept/reject  
✅ **Friends List**: Each user can manage their own bidirectional friend list  
✅ **Conversations**: Users can create chats and read/write messages in conversations they're part of  
✅ **Presence**: Users can update their own online status; everyone can see all presence status  
✅ **Blocks**: Each user can manage their own blocked users list  

## Testing the Rules

After publishing, try:
1. Send a friend request (should succeed)
2. Accept a friend request (should succeed)
3. Send a message in a conversation (should succeed)
4. Try writing to another user's profile (should fail)

If you get permission errors, ensure:
- The authenticated user is logged in (`request.auth != null`)
- The user is modifying their own data (for user/presence/friends collections)
- The user is a participant in the conversation (for messages)
