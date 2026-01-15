# SE Project - Software Engineering Project

A full-stack learning platform for specially-abled learners with Firebase Authentication.

## 🚀 Quick Start

### Prerequisites

- **Node.js** (v14 or higher recommended) - [Download here](https://nodejs.org/)
- **npm** (comes automatically with Node.js)
- A modern web browser

### Installation & Running

**Yes! If you have Node.js, you can clone and run it immediately:**

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd SE-project
   ```

2. **Install dependencies (this installs Firebase and all other packages):**
   ```bash
   cd frontend
   npm install
   ```

3. **Run the development server:**
   ```bash
   npm start
   ```

4. **The app will automatically:**
   - Open in your browser at [http://localhost:3000](http://localhost:3000)
   - Use the default Firebase configuration (no setup needed!)

**That's it!** The app works out-of-the-box. No Firebase setup, no environment variables, no additional configuration needed.

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

## 🔧 Configuration (Optional)

### Using Your Own Firebase Project

If you want to use your own Firebase project instead of the default one:

1. **Create a Firebase project** (see `frontend/FIREBASE_SETUP.md`)

2. **Set up environment variables:**
   ```bash
   cd frontend
   cp .env.example .env.local
   ```
   
3. **Edit `.env.local`** with your Firebase config values

4. **Restart the development server:**
   ```bash
   npm start
   ```

See `frontend/ENV_SETUP.md` for detailed instructions.

## ✨ Features

- ✅ Email/Password Authentication
- ✅ Google Sign-In
- ✅ User session management
- ✅ Simple, accessible UI

## 📚 Documentation

- `frontend/FIREBASE_SETUP.md` - Firebase project setup guide
- `frontend/ENV_SETUP.md` - Environment variables setup
- `frontend/SECURITY.md` - Security best practices

## 🛠️ Available Scripts

In the `frontend` directory:

- `npm start` - Runs the app in development mode
- `npm run build` - Builds the app for production
- `npm test` - Launches the test runner

## 🔒 Security

This project uses Firebase Authentication. Firebase API keys are safe to expose in client-side code. See `frontend/SECURITY.md` for more information.

## 📝 Notes

- The app works out-of-the-box with the default Firebase configuration
- No backend setup required for authentication
- All sensitive files (`.env.local`) are already in `.gitignore`

## 🤝 Contributing

This is a college-level software engineering project. Contributions and improvements are welcome!

## 📄 License


