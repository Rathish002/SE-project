# SE Project - Software Engineering Project

A full-stack learning platform for specially-abled learners with Firebase Authentication.

## 🚀 Quick Start

### Prerequisites

- **Node.js** (v14 or higher) - [Download](https://nodejs.org/)
- **Your Firebase API Key** (ask your team lead via secure message)

### Setup (2 Minutes)

```powershell
# 1. Clone the repository
git clone <repository-url>
cd SE-project

# 2. Run one-time setup
.\setup-team-member.ps1

# 3. When prompted, paste your API Key and press Enter
# That's it! Dependencies install automatically
```

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

## 📝 Notes

- The app works out-of-the-box with the default Firebase configuration
- No backend setup required for authentication
- All sensitive files (`.env.local`) are already in `.gitignore`

## 🤝 Contributing

This is a college-level software engineering project. Contributions and improvements are welcome!

## 📄 License


