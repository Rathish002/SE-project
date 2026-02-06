# Step-by-Step Firebase Setup Guide

## Step 1: Access Firebase Console
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Sign in with your Google account
3. You should see your "SE-01-18CC8" project listed (or similar)
4. Click on it to open the project

## Step 2: Find Your Firebase Configuration

### Option A: From Project Settings (Recommended)
1. In Firebase Console, click the **gear icon ⚙️** at the top-left (next to "Project Overview")
2. Click **Project Settings**
3. Scroll down to the **"Your apps"** section
4. Find your **Web app** (should show an icon like `</>`  )
5. Click on it or look for a **"Config"** button
6. You'll see a code block with your configuration - copy the entire `firebaseConfig` object

### Option B: From Firebase SDK Setup
1. Click **"</>  Add app"** in the main section if you don't have a web app
2. Select **Web**
3. Give it a name (e.g., "SE-Project Frontend")
4. You'll get the configuration immediately

## Step 3: Extract Your Credentials

The Firebase config will look like this:
```javascript
const firebaseConfig = {
  apiKey: "AIzaSyDCdnY6dl65ajLQjY9XiVy2V9z0jHDsZtA",
  authDomain: "se-01-18cc8.firebaseapp.com",
  projectId: "se-01-18cc8",
  storageBucket: "se-01-18cc8.firebasestorage.app",
  messagingSenderId: "698206432143",
  appId: "1:698206432143:web:762b399aaf23fa584bb9fa",
  measurementId: "G-C23HP9D8GH"
};
```

Copy these values - you'll need them for the next step.

## Step 4: Update Your .env.local File

1. Open the file: `frontend/.env.local`
2. Replace each placeholder with your actual values:

```
REACT_APP_FIREBASE_API_KEY=AIzaSyDCdnY6dl65ajLQjY9XiVy2V9z0jHDsZtA
REACT_APP_FIREBASE_AUTH_DOMAIN=se-01-18cc8.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=se-01-18cc8
REACT_APP_FIREBASE_STORAGE_BUCKET=se-01-18cc8.firebasestorage.app
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=698206432143
REACT_APP_FIREBASE_APP_ID=1:698206432143:web:762b399aaf23fa584bb9fa
REACT_APP_FIREBASE_MEASUREMENT_ID=G-C23HP9D8GH
```

**Replace the values on the right with YOUR actual values from Step 3**

## Step 5: Save and Restart the App

1. Save the `.env.local` file
2. Stop the React app if it's running (Ctrl+C in the terminal)
3. Restart the app: `npm start`

The app should now connect to Firebase successfully!

## Verification Checklist

- [ ] Firebase Console opened and project selected
- [ ] Found the Web app configuration
- [ ] Copied all 7 configuration values
- [ ] Updated `.env.local` with real values (not placeholders)
- [ ] Saved the file
- [ ] Restarted `npm start`
- [ ] App loads without "invalid-api-key" error

## Troubleshooting

**Still getting "invalid-api-key" error?**
- Make sure you restarted `npm start` AFTER saving `.env.local`
- Check that the values are copied correctly with no extra spaces
- Verify the file is named exactly `.env.local` (not `.env` or `.env.example`)

**Can't find the configuration?**
- Go to https://console.firebase.google.com/
- Make sure you're in the correct Firebase project
- Click the gear icon ⚙️ → Project Settings
- Scroll down to "Your apps" section

**Need a new Firebase project?**
- If you don't have one, click "Create a project" in Firebase Console
- Follow the wizard to set it up
- Then get the configuration as described above

