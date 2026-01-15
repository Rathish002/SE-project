# Firebase Setup Instructions

## Step 1: Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project" or select an existing project
3. Follow the setup wizard:
   - Enter a project name (e.g., "se-project")
   - Choose whether to enable Google Analytics (optional)
   - Click "Create project"

## Step 2: Enable Email/Password Authentication

1. In your Firebase project, go to **Authentication** in the left sidebar
2. Click **Get Started** (if you haven't enabled it yet)
3. Click on the **Sign-in method** tab
4. Find **Email/Password** in the list
5. Click on it and toggle **Enable** to ON
6. Click **Save**

## Step 3: Get Your Firebase Configuration

1. In Firebase Console, click the gear icon ⚙️ next to "Project Overview"
2. Select **Project settings**
3. Scroll down to **Your apps** section
4. If you don't have a web app yet:
   - Click the **</>** (Web) icon
   - Register your app with a nickname (e.g., "Frontend")
   - Click **Register app**
5. Copy the `firebaseConfig` object that appears

## Step 4: Add Configuration to Your Project

1. Open `frontend/src/firebase.ts`
2. Replace the placeholder values with your actual Firebase config:

```typescript
const firebaseConfig = {
  apiKey: "YOUR_ACTUAL_API_KEY",
  authDomain: "YOUR_ACTUAL_AUTH_DOMAIN",
  projectId: "YOUR_ACTUAL_PROJECT_ID",
  storageBucket: "YOUR_ACTUAL_STORAGE_BUCKET",
  messagingSenderId: "YOUR_ACTUAL_MESSAGING_SENDER_ID",
  appId: "YOUR_ACTUAL_APP_ID"
};
```

## Step 5: Test the Application

1. Run `npm start` in the `frontend` directory
2. You should see the Login page
3. Click "Sign Up" to create a new account
4. After signing up, you'll be logged in automatically
5. Try logging out and logging back in

## Important Notes

- **Security**: The Firebase config keys are safe to include in client-side code. Firebase has built-in security rules.
- **Email Verification**: Currently, email verification is not required. Users can sign up and log in immediately.
- **Password Requirements**: Minimum 6 characters (Firebase default).

## Troubleshooting

- **"Firebase: Error (auth/invalid-api-key)"**: Check that you copied the config correctly
- **"Firebase: Error (auth/operation-not-allowed)"**: Make sure Email/Password authentication is enabled in Firebase Console
- **"Firebase: Error (auth/network-request-failed)"**: Check your internet connection
