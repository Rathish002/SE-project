# Team Member Setup Guide

## Quick Start (30 seconds)

```powershell
# 1. Clone the repository
git clone https://github.com/Rathish002/SE-project.git
cd SE-project

# 2. Run the setup script
.\setup-team-member.ps1

# 3. Follow the prompts to add your Firebase credentials
```

That's it! The script handles everything else.

---

## What the Script Does

1. ✅ Creates `.env.local` from the template
2. ✅ Guides you to get Firebase credentials
3. ✅ Validates that all credentials are present
4. ✅ Installs npm dependencies
5. ✅ Ready to run `npm start`

---

## How to Get Firebase Credentials

### Option 1: Ask Your Team Lead (Easiest)
Ask for these values from your team lead:
- `REACT_APP_FIREBASE_API_KEY`
- `REACT_APP_FIREBASE_AUTH_DOMAIN`
- `REACT_APP_FIREBASE_PROJECT_ID`
- `REACT_APP_FIREBASE_STORAGE_BUCKET`
- `REACT_APP_FIREBASE_MESSAGING_SENDER_ID`
- `REACT_APP_FIREBASE_APP_ID`
- `REACT_APP_FIREBASE_MEASUREMENT_ID`

### Option 2: Get from Firebase Console (If You Have Access)
1. Go to: https://console.firebase.google.com/
2. Select the **SE-01-18CC8** project
3. Click **⚙️ Settings** → **Project Settings**
4. Scroll to **"Your apps"** section
5. Find and click your **Web app**
6. Copy the config values

---

## Troubleshooting

### "Cannot find module" or "firebase not found"
```powershell
cd frontend
npm install
npm start
```

### Firebase 403 error (invalid-api-key)
- Check that you copied the API key correctly
- Make sure there are no extra spaces in `.env.local`
- Contact your team lead for the correct credentials

### .env.local file not found
```powershell
# Run the setup script again
.\setup-team-member.ps1
```

### Still having issues?
1. Delete `frontend/node_modules` folder
2. Delete `frontend/package-lock.json` file
3. Run `npm install` again in the frontend directory
4. Run `npm start`

---

## Important: Never Commit `.env.local`

The `.env.local` file is **automatically ignored** by Git. This keeps credentials safe.

You should NEVER see `.env.local` when you run:
```powershell
git status
```

If you do see it, something is wrong. Contact your team lead immediately.

---

## For Team Leads: Sharing Credentials

To help your team members set up, share ONLY the non-sensitive values:

**SAFE TO SHARE:**
```
REACT_APP_FIREBASE_AUTH_DOMAIN=se-01-18cc8.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=se-01-18cc8
REACT_APP_FIREBASE_STORAGE_BUCKET=se-01-18cc8.firebasestorage.app
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=698206432143
REACT_APP_FIREBASE_APP_ID=1:698206432143:web:762b399aaf23fa584bb9fa
REACT_APP_FIREBASE_MEASUREMENT_ID=G-C23HP9D8GH
```

**MUST BE OBTAINED FROM FIREBASE CONSOLE:**
```
REACT_APP_FIREBASE_API_KEY=<team lead only - never share>
```

---

## Running the App

Once setup is complete:

```powershell
cd frontend
npm start
```

The app should open in your browser at `http://localhost:3000`

---

## Questions?

Contact your team lead or see [ENV_SETUP.md](frontend/ENV_SETUP.md) for more details.
