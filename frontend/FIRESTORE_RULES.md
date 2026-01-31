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
    
    // Users collection - only user can write their own profile
    match /users/{uid} {
      allow read: if request.auth != null;
      allow write: if request.auth.uid == uid;
    }

    // Friend requests collection
    match /friendRequests/{document=**} {
      // User can read requests where they are sender or recipient
      allow read: if request.auth != null && 
        (resource.data.toUid == request.auth.uid || 
         resource.data.fromUid == request.auth.uid);
      // User can create a request from themselves
      allow create: if request.auth != null && 
        request.resource.data.fromUid == request.auth.uid;
      // User can update/delete their own requests
      allow update, delete: if request.auth != null && 
        (resource.data.fromUid == request.auth.uid || 
         resource.data.toUid == request.auth.uid);
    }

    // Friends collection - users can read and modify their own friends list
    match /friends/{uid} {
      // Read their own friends
      allow read: if request.auth.uid == uid;
      
      match /list/{document=**} {
        // Only the user can write to their own friends list
        allow read: if request.auth.uid == uid;
        allow write: if request.auth.uid == uid;
      }
    }

    // Conversations - users can read/write those they participate in
    match /conversations/{convId} {
      allow read: if request.auth != null && 
        request.auth.uid in resource.data.participants;
      allow create: if request.auth != null && 
        request.auth.uid in request.resource.data.participants;
      allow update: if request.auth != null && 
        request.auth.uid in resource.data.participants;
      
      // Messages in conversations
      match /messages/{msgId} {
        allow read: if request.auth != null && 
          request.auth.uid in get(/databases/$(database)/documents/conversations/$(convId)).data.participants;
        allow create: if request.auth != null && 
          request.auth.uid in get(/databases/$(database)/documents/conversations/$(convId)).data.participants;
      }
    }

    // Presence - users can read all, but only write their own
    match /presence/{uid} {
      allow read: if request.auth != null;
      allow write: if request.auth.uid == uid;
    }

    // Default deny all other access
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
