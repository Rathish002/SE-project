# Firebase Storage Security Rules

These rules enable secure media uploads (images, videos, voice messages, documents) for authenticated users in conversations.

## Setup Instructions

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Click **Storage** → **Rules** tab
4. Clear the default rules and paste the rules below
5. Click **Publish**

## Security Rules

```javascript
rules_version = '2';

service firebase.storage {
  match /b/{bucket}/o {
    
    /* =========================
       CONVERSATION MEDIA
       Images, videos, voice messages, and files
       Path: /conversations/{conversationId}/{mediaType}/{filename}
       ========================= */
    match /conversations/{conversationId}/{mediaType}/{filename} {
      // Allow authenticated users to read any conversation media
      allow read: if request.auth != null;
      
      // Allow upload only if:
      // 1. User is authenticated
      // 2. User is a participant in the conversation (check Firestore)
      // 3. File size is within limits (handled in app, but enforced here too)
      allow write: if request.auth != null &&
        request.auth.uid in firestore.get(/databases/(default)/documents/conversations/$(conversationId)).data.participants &&
        (
          // Images: max 10MB
          (mediaType == 'images' && request.resource.size < 10 * 1024 * 1024) ||
          // Videos: max 10MB
          (mediaType == 'videos' && request.resource.size < 10 * 1024 * 1024) ||
          // Voice: unlimited (small files)
          (mediaType == 'voice' && request.resource.size < 50 * 1024 * 1024) ||
          // Documents: max 10MB
          (mediaType == 'files' && request.resource.size < 10 * 1024 * 1024)
        );
      
      // Allow delete only for conversation participants
      allow delete: if request.auth != null &&
        request.auth.uid in firestore.get(/databases/(default)/documents/conversations/$(conversationId)).data.participants;
    }
    
    /* =========================
       DEFAULT DENY
       ========================= */
    match /{allPaths=**} {
      allow read, write: if false;
    }
  }
}
```

## Size Limits Summary

- **Images**: 10 MB
- **Videos**: 10 MB
- **Voice Messages**: 50 MB (effectively unlimited for voice)
- **Documents**: 10 MB

## Validation

The rules validate:
1. User authentication (must be signed in)
2. User is a participant in the conversation
3. File size is within limits
4. Proper folder structure (images/videos/voice/files)

## Testing

After publishing, test by:
1. Upload an image in a conversation you're part of ✅
2. Try uploading to another user's conversation ❌ (should fail)
3. Try uploading without authentication ❌ (should fail)
4. Try uploading a file > 10MB ❌ (should fail)
