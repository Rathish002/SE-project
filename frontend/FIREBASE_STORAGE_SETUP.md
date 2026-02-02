# 🔥 Firebase Security Rules Setup - URGENT

## ⚠️ Current Issue

Your app is experiencing permission errors because Firebase Storage rules are not configured. You need to set up security rules in the Firebase Console.

## 🚀 Quick Fix (5 minutes)

### Step 1: Configure Firebase Storage Rules

1. Open [Firebase Console](https://console.firebase.google.com/)
2. Select project: **se-01-18cc8**
3. Click **Storage** in left sidebar
4. Click **Rules** tab at the top
5. Copy the rules from [STORAGE_RULES.md](./STORAGE_RULES.md) (lines 13-58)
6. Paste and click **Publish**

### Step 2: Update Firestore Rules (if needed)

1. While in Firebase Console, click **Firestore Database**
2. Click **Rules** tab
3. Copy the rules from [FIRESTORE_RULES.md](./FIRESTORE_RULES.md) (lines 12-100)
4. Paste and click **Publish**

## 📋 Rules Summary

### Storage Rules Allow:
- ✅ Authenticated users to upload/read media in their conversations
- ✅ Images, videos, documents: 10MB limit
- ✅ Voice messages: 50MB limit
- ❌ Deny uploads to conversations user is not part of
- ❌ Deny unauthenticated access

### Firestore Rules Allow:
- ✅ Users to manage their own profiles, friends, and blocks
- ✅ Conversation participants to read/write messages
- ✅ All users to see presence status
- ❌ Deny writing to other users' data

## 🧪 Test After Setup

1. Refresh your app (http://localhost:3000)
2. Try uploading an image in a conversation
3. Image should upload and display successfully
4. No CORS or permission errors in console

## 📄 Rule Files

- **Storage Rules**: [STORAGE_RULES.md](./STORAGE_RULES.md)
- **Firestore Rules**: [FIRESTORE_RULES.md](./FIRESTORE_RULES.md)
- **Security Overview**: [SECURITY.md](./SECURITY.md)

## 🐛 Still Getting Errors?

If you still see errors after publishing rules:

1. **Clear browser cache** (Ctrl+Shift+Delete)
2. **Wait 1-2 minutes** for rules to propagate
3. **Check Firebase Console → Storage** - ensure bucket exists
4. **Verify authentication** - make sure you're logged in
5. **Check browser console** for specific error messages

## 💡 Why This Happened

Firebase Storage requires explicit security rules before allowing uploads. The default rules deny all access. Once you publish the rules above, authenticated users in conversations will be able to upload and view media.
