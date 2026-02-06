# SE Project - Software Engineering Project

A full-stack learning platform for specially-abled learners with Firebase Authentication.

## 🚀 Quick Start

### New Team Members (First Time)

```powershell
# 1. Clone the repository
git clone <repository-url>
cd SE-project

# 2. Run one-time setup
.\setup-team-member.ps1

# 3. When prompted, paste your API Key and press Enter
# That's it! Dependencies install automatically
```

### Existing Team Members (Already Cloned Repo)

If you cloned the repo before and it's still set up, just run:

```powershell
cd SE-project
git pull origin main

# If you get a message about old firebase.ts code, run:
.\setup-team-member.ps1
```

---

### Run the App

```powershell
.\start-dev.ps1
```

Your app opens automatically on [http://localhost:3000](http://localhost:3000) ✅

---

### What You Need From Your Team Lead

**Only 1 thing:** Your Firebase API Key

Ask them via secure message (Slack DM, Teams, etc.):
```
"Can you send me the Firebase API Key for this project?"
```

Everything else is pre-configured automatically.

## 📁 Project Structure

```
SE-project/
├── frontend/          # React frontend application
│   ├── src/
│   │   ├── components/    # React components (Login, Signup)
│   │   ├── firebase.ts   # Firebase configuration
│   │   └── App.tsx       # Main app component
│   └── package.json
└── server/            # Express backend (future implementation)
```

## 🔧 Configuration

Your Firebase credentials go in `.env.local` (which is created by `setup-team-member.ps1`). 

**Never commit this file** - it's automatically ignored by Git for security.

See `frontend/ENV_SETUP.md` for detailed environment variable information.

## ✨ Features

- ✅ Email/Password Authentication
- ✅ Google Sign-In
- ✅ User session management
- ✅ Simple, accessible UI

## 📚 Documentation

- [QUICK_START.md](./QUICK_START.md) - Simple setup guide for developers
- [TEAM_SETUP_GUIDE.md](./TEAM_SETUP_GUIDE.md) - Team member onboarding guide
- `frontend/ENV_SETUP.md` - Environment variables setup
- `frontend/FIREBASE_SETUP.md` - Firebase project setup
- `frontend/SECURITY.md` - Security best practices
- [SECURITY_CHECKLIST.md](./SECURITY_CHECKLIST.md) - Pre-publication checklist

## 🛠️ Development Scripts

**In the project root directory:**

- `.\setup-team-member.ps1` - Initial setup (one time)
- `.\start-dev.ps1` - Start development server (every time)
- `.\validate-security.ps1` - Validate no credentials are exposed
- `.\clean-git-history.ps1` - Clean git history of old credentials (admin only)

**In the `frontend` directory:**

- `npm start` - Runs the app in development mode (called by `start-dev.ps1`)
- `npm run build` - Builds the app for production
- `npm test` - Launches the test runner

## 🔒 Security

This project uses **Firebase** for backend services. Credentials are managed securely:

- ✅ API keys are restricted to specific domains and APIs
- ✅ Credentials are never committed to Git (`.env.local` is gitignored)
- ✅ Team members get credentials through secure channels
- ✅ Git history is cleaned to remove any exposed credentials

See [SECURITY_CHECKLIST.md](./SECURITY_CHECKLIST.md) and `frontend/SECURITY.md` for more information.

## ⚠️ Troubleshooting

### I cloned the repo before these changes. What do I do?

```powershell
# 1. Pull the latest changes
git pull origin main

# 2. Run setup to get the new .env.local
.\setup-team-member.ps1

# 3. Start developing
.\start-dev.ps1
```

### I'm getting "Firebase error" or "invalid-api-key"

Your `.env.local` is missing or has incorrect values:

```powershell
# Recreate it
.\setup-team-member.ps1
```

### Old code still running?

The old hardcoded Firebase config has been removed. You must now:

1. Have `.env.local` in the `frontend` directory
2. It must contain a valid `REACT_APP_FIREBASE_API_KEY`
3. Run `.\setup-team-member.ps1` if you don't have it

### Need a fresh start?

```powershell
# Delete node_modules and cache
cd frontend
Remove-Item -Recurse -Force node_modules, .cache, build
cd ..

# Run setup again
.\setup-team-member.ps1
.\start-dev.ps1
```

### Still having issues?

Check [QUICK_START.md](./QUICK_START.md) or [TEAM_SETUP_GUIDE.md](./TEAM_SETUP_GUIDE.md) for detailed help.

## 📝 Notes

- The app requires proper Firebase credentials to run
- All sensitive data (`.env.local`) is automatically in `.gitignore`
- Never commit `.env.local` or API keys to Git

## 🤝 Contributing

This is a college-level software engineering project. Contributions and improvements are welcome!

## 📄 License


