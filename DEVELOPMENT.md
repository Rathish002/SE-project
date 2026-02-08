# Development Setup Guide

Complete guide for setting up your local development environment for the SE-Project.

## 📋 Table of Contents

- [System Requirements](#system-requirements)
- [Installation Steps](#installation-steps)
- [Environment Configuration](#environment-configuration)
- [Running the Application](#running-the-application)
- [Database Setup](#database-setup)
- [Troubleshooting](#troubleshooting)
- [IDE Setup](#ide-setup)
- [Development Tools](#development-tools)

## 💻 System Requirements

### Required Software

| Software | Version | Purpose |
|----------|---------|---------|
| Node.js | 18.20 | Frontend & Backend runtime |
| npm | 8+ | Package management |
| Python | 3.8+ | NLP service |
| PostgreSQL | 13+ | Database |
| Git | 2.30+ | Version control |

### Operating Systems

- ✅ Windows 10/11
- ✅ macOS 11+
- ✅ Linux (Ubuntu 20.04+)

### Hardware Recommendations

- **CPU:** 4+ cores
- **RAM:** 8GB minimum, 16GB recommended
- **Storage:** 10GB free space
- **Internet:** Stable connection for Firebase

## 🚀 Installation Steps

### Method 1: Automated Setup (Recommended)

For **Windows** users:

```powershell
# Navigate to project directory
cd SE-project

# Run automated setup script
.\setup-team-member.ps1

# Follow the prompts:
# 1. Enter your Firebase API key when prompted
# 2. Wait for dependencies to install
# 3. Setup completes automatically
```

The script will:
- ✅ Install all npm dependencies (frontend, server, root)
- ✅ Configure Firebase credentials
- ✅ Validate the setup
- ✅ Display next steps

### Method 2: Manual Setup

If automated setup fails or you're on macOS/Linux:

#### Step 1: Install Dependencies

```bash
# Root dependencies
npm install

# Frontend dependencies
cd frontend
npm install

# Server dependencies
cd ../server
npm install

# NLP service dependencies
cd ../nlp-service
pip install -r requirements.txt
```

#### Step 2: Configure Environment

Create environment files:

**Frontend: `frontend/.env`**
```env
REACT_APP_FIREBASE_API_KEY=your_api_key_here
REACT_APP_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=your_project_id
REACT_APP_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
REACT_APP_FIREBASE_APP_ID=your_app_id
```

**Server: `server/.env`**
```env
DATABASE_URL=postgresql://username:password@localhost:5432/se_project
PORT=5000
NODE_ENV=development
```

**NLP Service: `nlp-service/.env`**
```env
MODEL_PATH=./models
PORT=8000
```

## 🔧 Environment Configuration

### Firebase Setup

1. **Get Firebase Credentials** from your team lead
2. **Create** `frontend/src/firebase.ts`:

```typescript
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
```

3. **Never commit** `.env` files or credentials to Git

### PostgreSQL Configuration

#### Install PostgreSQL

**Windows:**
```powershell
# Download from https://www.postgresql.org/download/windows/
# Or use Chocolatey:
choco install postgresql
```

**macOS:**
```bash
brew install postgresql
brew services start postgresql
```

**Linux:**
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
```

#### Create Database

```bash
# Connect to PostgreSQL
psql -U postgres

# In psql shell:
CREATE DATABASE se_project;
CREATE USER se_user WITH ENCRYPTED PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE se_project TO se_user;

# Exit
\q
```

#### Run Schema

```bash
cd server
psql -U se_user -d se_project -f sql/schema.sql
```

## 🏃 Running the Application

### Quick Start (All Services)

```powershell
# Start everything with one command
.\start-dev.ps1
```

This starts:
- Frontend on http://localhost:3000
- Backend on http://localhost:5000
- NLP Service on http://localhost:8000

### Individual Services

#### Frontend Only

```powershell
cd frontend
npm start
```

Access at: http://localhost:3000

**Available Scripts:**
- `npm start` - Development server
- `npm test` - Run tests
- `npm run build` - Production build
- `npm run eject` - Eject from Create React App

#### Backend Server Only

```powershell
cd server
npm run dev
```

Access at: http://localhost:5000

**Available Scripts:**
- `npm run dev` - Development server with hot reload
- `npm run build` - Compile TypeScript
- `npm start` - Production server
- `npm test` - Run tests

#### NLP Service Only

```powershell
cd nlp-service
uvicorn app:app --reload --port 8000
```

Access at: http://localhost:8000

**Documentation:** http://localhost:8000/docs

## 🗄️ Database Setup

### Schema Overview

Located in: `server/sql/schema.sql`

Key tables:
- `users` - User accounts
- `messages` - Chat messages
- `groups` - Group chats
- `exercises` - Learning exercises
- `progress` - User progress tracking

### Running Migrations

```bash
# Apply schema
psql -U se_user -d se_project -f server/sql/schema.sql

# Verify tables created
psql -U se_user -d se_project -c "\dt"
```

### Seed Data (Optional)

```sql
-- Example seed data
INSERT INTO users (username, email) VALUES 
  ('test_user', 'test@example.com'),
  ('demo_user', 'demo@example.com');
```

### Database Tools

**Recommended GUI Clients:**
- [pgAdmin](https://www.pgadmin.org/) - Full-featured
- [DBeaver](https://dbeaver.io/) - Cross-platform
- [TablePlus](https://tableplus.com/) - Modern UI

**Connection Details:**
```
Host: localhost
Port: 5432
Database: se_project
Username: se_user
Password: [your_password]
```

## 🔍 Troubleshooting

### Common Issues

#### Port Already in Use

**Error:**
```
Error: listen EADDRINUSE: address already in use :::3000
```

**Solution:**
```powershell
# Windows - Kill process on port 3000
Get-Process -Id (Get-NetTCPConnection -LocalPort 3000).OwningProcess | Stop-Process -Force

# Or use different port
$env:PORT=3001; npm start
```

#### Firebase Configuration Error

**Error:**
```
FirebaseError: Firebase: Error (auth/invalid-api-key)
```

**Solution:**
1. Verify `.env` file exists in `frontend/`
2. Check API key is correct (no extra spaces)
3. Restart development server
4. Re-run setup script: `.\setup-team-member.ps1`

#### Database Connection Failed

**Error:**
```
Error: connect ECONNREFUSED 127.0.0.1:5432
```

**Solution:**
```powershell
# Check if PostgreSQL is running
Get-Service postgresql*

# Start PostgreSQL
Start-Service postgresql-x64-13

# Verify connection
psql -U postgres -c "SELECT version();"
```

#### Node Modules Issues

**Error:**
```
Module not found: Can't resolve 'xyz'
```

**Solution:**
```powershell
# Clear cache and reinstall
rm -r node_modules package-lock.json
npm cache clean --force
npm install
```

#### Python Package Issues

**Error:**
```
ModuleNotFoundError: No module named 'fastapi'
```

**Solution:**
```powershell
cd nlp-service

# Use virtual environment
python -m venv venv
.\venv\Scripts\Activate.ps1  # Windows
source venv/bin/activate      # macOS/Linux

pip install -r requirements.txt
```

#### TypeScript Compilation Errors

**Solution:**
```powershell
# Clear TypeScript cache
rm -r node_modules/.cache

# Rebuild
npm run build
```

### Getting More Help

If issues persist:

1. Check `TROUBLESHOOTING.md` in project root
2. Search existing GitHub issues
3. Create new issue with:
   - Error message
   - Steps to reproduce
   - System information
   - Screenshots

## 🛠️ IDE Setup

### Visual Studio Code (Recommended)

#### Required Extensions

```json
{
  "recommendations": [
    "dbaeumer.vscode-eslint",
    "esbenp.prettier-vscode",
    "ms-python.python",
    "ms-python.vscode-pylance",
    "bradlc.vscode-tailwindcss",
    "formulahendry.auto-rename-tag",
    "christian-kohler.path-intellisense",
    "eamodio.gitlens"
  ]
}
```

Install all:
```powershell
code --install-extension dbaeumer.vscode-eslint
code --install-extension esbenp.prettier-vscode
code --install-extension ms-python.python
```

#### Workspace Settings

Create `.vscode/settings.json`:

```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "typescript.tsdk": "node_modules/typescript/lib",
  "python.linting.enabled": true,
  "python.linting.pylintEnabled": true,
  "[python]": {
    "editor.defaultFormatter": "ms-python.python"
  }
}
```

#### Debug Configuration

Create `.vscode/launch.json`:

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Frontend",
      "type": "chrome",
      "request": "launch",
      "url": "http://localhost:3000",
      "webRoot": "${workspaceFolder}/frontend/src"
    },
    {
      "name": "Server",
      "type": "node",
      "request": "launch",
      "program": "${workspaceFolder}/server/src/index.ts",
      "preLaunchTask": "npm: dev",
      "outFiles": ["${workspaceFolder}/server/dist/**/*.js"]
    }
  ]
}
```

### Other IDEs

- **WebStorm:** Import as Node.js project
- **PyCharm:** Use for NLP service development
- **Sublime Text:** Install TypeScript and ESLint packages

## 🧰 Development Tools

### Code Quality

```powershell
# Linting
npm run lint

# Format code
npm run format

# Type checking
npm run type-check
```

### Testing

```powershell
# Run all tests
npm test

# Watch mode
npm test -- --watch

# Coverage report
npm test -- --coverage
```

### Git Hooks (Pre-commit)

Install Husky for automatic checks:

```powershell
npm install --save-dev husky
npx husky install

# Add pre-commit hook
npx husky add .husky/pre-commit "npm test"
```

### Browser DevTools

**React Developer Tools:**
- [Chrome Extension](https://chrome.google.com/webstore/detail/react-developer-tools/fmkadmapgofadopljbjfkapdkoienihi)
- [Firefox Add-on](https://addons.mozilla.org/en-US/firefox/addon/react-devtools/)

**Firebase Extension:**
- [Firestore DevTools](https://chrome.google.com/webstore/detail/firestore-devtools/dnjkdmnafkkmhendbobebbhkdkdkfbll)

## 📊 Performance Monitoring

### Frontend

```typescript
// Using React Profiler
import { Profiler } from 'react';

<Profiler id="ChatUI" onRender={onRenderCallback}>
  <ChatUI />
</Profiler>
```

### Backend

```typescript
// Response time logging
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`${req.method} ${req.path} - ${duration}ms`);
  });
  next();
});
```

## 🔐 Security Validation

Before committing:

```powershell
# Run security check
.\validate-security.ps1

# Output should show:
# ✓ No sensitive data found
# ✓ All environment variables properly configured
# ✓ Firebase rules validated
```

## 🎯 Next Steps

After setup is complete:

1. ✅ Read [CONTRIBUTING.md](CONTRIBUTING.md) for contribution guidelines
2. ✅ Review [ARCHITECTURE.md](ARCHITECTURE.md) for project structure
3. ✅ Check open issues on GitHub for tasks
4. ✅ Join team communication channels
5. ✅ Start with "good first issue" labeled tasks

## 📚 Additional Resources

- [Project Wiki](https://github.com/Rathish002/SE-project/wiki)
- [API Documentation](API.md)
- [Component Library](./frontend/README.md)
- [Security Guidelines](./SECURITY_CHECKLIST.md)

## 💡 Tips for Productivity

1. **Use auto-reload:** Development servers restart automatically on file changes
2. **Browser sync:** Multiple devices can test simultaneously
3. **Hot module replacement:** React components update without full refresh
4. **Console logs:** Use browser console for debugging
5. **Git aliases:** Speed up common commands

```powershell
# Useful Git aliases
git config --global alias.co checkout
git config --global alias.br branch
git config --global alias.st status
git config --global alias.cm "commit -m"
```

Happy coding! 🚀
