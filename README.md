# SE Project - Learning Platform for All

> A full-stack accessible learning platform with real-time collaboration, NLP-powered features, and multilingual support designed for specially-abled learners.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/node-%3E%3D16.0.0-brightgreen)](https://nodejs.org/)
[![React](https://img.shields.io/badge/react-19.2.3-blue)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/typescript-4.9.5-blue)](https://www.typescriptlang.org/)
[![Python](https://img.shields.io/badge/python-3.8%2B-blue)](https://www.python.org/)

---

## 📖 Table of Contents

- [Overview](#-overview)
- [Quick Start](#-quick-start)
- [Features](#-features)
- [Project Structure](#-project-structure)
- [Documentation](#-documentation)
- [Technology Stack](#-technology-stack)
- [Development](#-development)
- [Contributing](#-contributing)
- [Security](#-security)
- [License](#-license)

---

## 🌟 Overview

SE-Project is an innovative learning platform that prioritizes accessibility and inclusion. Built with modern web technologies, it offers:

- **Real-time collaboration** with group chats and messaging
- **Accessibility-first design** with keyboard navigation, screen readers, and TTS
- **Multilingual support** (English, Hindi, and expandable)
- **NLP-powered features** for translation and content processing
- **Interactive learning** with exercises and progress tracking

### Built For

Students with diverse abilities including:
- Visual impairments (screen reader support, high contrast)
- Motor disabilities (keyboard-only navigation)
- Cognitive differences (adjustable text size, clear UI)

---

## 🚀 Quick Start

### For New Contributors

```powershell
# 1. Clone the repository
git clone https://github.com/Rathish002/SE-project.git
cd SE-project

# 2. Run automated setup (Windows)
.\setup-team-member.ps1

# 3. Enter Firebase API key when prompted
# Get this from your team lead

# 4. Start development
.\start-dev.ps1
```

That's it! The app opens at http://localhost:3000 ✅

### For Existing Team Members

```powershell
# Pull latest changes
git pull origin main

# Start development
.\start-dev.ps1
```

**Need help?** See [DEVELOPMENT.md](DEVELOPMENT.md) for detailed setup instructions.

---

## ✨ Features

### 🎨 User Interface
- **Responsive Design** - Works on desktop, tablet, and mobile
- **Dark/Light Theme** - High contrast mode for accessibility
- **Adjustable Text** - Font size controls
- **Keyboard Navigation** - Full keyboard support (Tab, Enter, Escape)

### 💬 Collaboration
- **Real-time Chat** - Powered by Firebase Firestore
- **Group Chats** - Create and manage group conversations
- **Message Translation** - Auto-translate based on language preference
- **Message States** - Visual indicators (sending/sent/failed)
- **Media Sharing** - Share images and audio
- **User Blocking** - Block/unblock functionality
- **Archive Chats** - Organize conversations

### 📚 Learning
- **Interactive Lessons** - Structured learning content
- **Exercises** - Practice with immediate feedback
- **Progress Tracking** - Monitor learning journey
- **TTS Support** - Text-to-speech for content

### ♿ Accessibility
- **WCAG AA Compliant** - Meets accessibility standards
- **Screen Reader Support** - ARIA labels throughout
- **Keyboard Shortcuts**
  - `Enter` - Send message
  - `Shift+Enter` - New line
  - `Esc` - Close dialogs
- **Focus Indicators** - Clear visual focus
- **Alt Text** - All images described

### 🌍 Internationalization
- **Multiple Languages** - English, Hindi (more coming)
- **Easy Translation** - i18next framework
- **RTL Support** - Ready for right-to-left languages

---

## 📁 Project Structure

```
SE-project/
├── frontend/              # React TypeScript application
│   ├── src/
│   │   ├── components/   # UI components (30+ components)
│   │   ├── contexts/     # React contexts (Accessibility, etc.)
│   │   ├── services/     # API and Firebase services
│   │   ├── i18n/         # Internationalization files
│   │   ├── data/         # Static data (lessons, exercises)
│   │   └── utils/        # Utility functions
│   └── public/           # Static assets
│
├── server/               # Express TypeScript backend
│   ├── src/
│   │   ├── routes/      # API routes
│   │   └── tests/       # Backend tests
│   └── sql/             # Database schemas
│
├── nlp-service/         # Python FastAPI NLP service
│   ├── app.py          # Main application
│   └── utils/          # NLP utilities (translation, etc.)
│
└── docs/               # Documentation files
```

---

## 📚 Documentation

### For Contributors

| Document | Description |
|----------|-------------|
| **[CONTRIBUTING.md](CONTRIBUTING.md)** | 📝 Complete guide to contributing code |
| **[DEVELOPMENT.md](DEVELOPMENT.md)** | 🛠️ Development environment setup |
| **[ARCHITECTURE.md](ARCHITECTURE.md)** | 🏗️ System architecture and design |
| **[TESTING.md](TESTING.md)** | 🧪 Testing strategies and CI/CD |

### For Users

| Document | Description |
|----------|-------------|
| [QUICK_START.md](QUICK_START.md) | ⚡ Fast setup guide |
| [TEAM_SETUP_GUIDE.md](TEAM_SETUP_GUIDE.md) | 👥 Team onboarding |

### Technical Documentation

| Document | Description |
|----------|-------------|
| [frontend/README.md](frontend/README.md) | Frontend-specific documentation |
| [server/README.md](server/README.md) | Backend API documentation |
| [server/TEST_GUIDE.md](server/TEST_GUIDE.md) | Backend testing guide |
| [SECURITY_CHECKLIST.md](SECURITY_CHECKLIST.md) | 🔒 Security guidelines |
| [frontend/FIREBASE_SETUP.md](frontend/FIREBASE_SETUP.md) | Firebase configuration |

---

## 🛠️ Technology Stack

### Frontend
- **React 19.2.3** - UI framework
- **TypeScript 4.9.5** - Type safety
- **Firebase** - Authentication, Firestore, Storage
- **i18next** - Internationalization
- **React Testing Library** - Testing

### Backend
- **Node.js 16+** - Runtime
- **Express 5.2.1** - Web framework
- **TypeScript 5.9.3** - Type safety
- **PostgreSQL 13+** - Database
- **Socket.IO 4.7** - Real-time communication

### NLP Service
- **Python 3.8+** - Runtime
- **FastAPI** - API framework
- **Sentence Transformers** - NLP models
- **scikit-learn** - ML utilities

### Development Tools
- **Jest** - Testing framework
- **ESLint** - Code linting
- **Prettier** - Code formatting
- **Husky** - Git hooks

---

## 💻 Development

### Prerequisites

- Node.js 16+
- Python 3.8+
- PostgreSQL 13+
- Git 2.30+
- Firebase account

### Development Scripts

**Root Directory:**
```powershell
.\setup-team-member.ps1      # One-time setup
.\start-dev.ps1              # Start all services
.\validate-security.ps1      # Security validation
```

**Frontend:**
```bash
cd frontend
npm start         # Development server (port 3000)
npm test          # Run tests
npm run build     # Production build
```

**Backend:**
```bash
cd server
npm run dev       # Development server (port 5000)
npm test          # Run tests
npm run build     # Compile TypeScript
```

**NLP Service:**
```bash
cd nlp-service
pip install -r requirements.txt
uvicorn app:app --reload  # Development server (port 8000)
```

### Environment Variables

Required environment files:
- `frontend/.env` - Firebase configuration
- `server/.env` - Database and API configuration
- `nlp-service/.env` - Model configuration

**Never commit these files!** They're in `.gitignore` for security.

### Running Tests

```bash
# All tests
npm test

# Frontend tests with coverage
cd frontend
npm test -- --coverage

# Backend tests
cd server
npm test

# NLP tests
cd nlp-service
pytest
```

See [TESTING.md](TESTING.md) for comprehensive testing guide.

---

## 🤝 Contributing

We welcome contributions! Here's how to get started:

1. **Read the guides**
   - [CONTRIBUTING.md](CONTRIBUTING.md) - Contribution guidelines
   - [DEVELOPMENT.md](DEVELOPMENT.md) - Setup instructions
   - [ARCHITECTURE.md](ARCHITECTURE.md) - System design

2. **Find an issue**
   - Check [GitHub Issues](https://github.com/Rathish002/SE-project/issues)
   - Look for `good first issue` labels
   - Or propose new features

3. **Create a branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

4. **Make changes**
   - Write code following our standards
   - Add tests for new features
   - Update documentation

5. **Submit PR**
   - Push your branch
   - Create Pull Request
   - Describe your changes

### Recent Contributions

Based on commit history, recent work includes:
- ✅ Group chat with accessibility features
- ✅ Message translation system
- ✅ User blocking functionality
- ✅ Message state indicators
- ✅ Exercise page improvements
- ✅ NLP service enhancements
- ✅ Security improvements

---

## 🔒 Security

Security is a top priority:

- ✅ **No credentials in code** - Environment variables only
- ✅ **Firebase Security Rules** - Firestore and Storage protected
- ✅ **Input validation** - Prevent injection attacks
- ✅ **Rate limiting** - API protection
- ✅ **Regular audits** - Dependency scanning

**Found a security issue?** Email the maintainers directly, don't open a public issue.

See [SECURITY_CHECKLIST.md](SECURITY_CHECKLIST.md) for details.

---

## 📊 Project Status

**Current Version:** 1.0.0  
**Status:** Active Development  
**Last Updated:** February 2026

### Roadmap

- [ ] Mobile app (React Native)
- [ ] Video chat functionality
- [ ] More language support
- [ ] Advanced analytics
- [ ] Gamification features

---

## 👥 Team

This is a collaborative Software Engineering project by students committed to inclusive education.

**Contributors:** See [GitHub Contributors](https://github.com/Rathish002/SE-project/graphs/contributors)

---

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

## 🙏 Acknowledgments

- **Firebase** - For backend infrastructure
- **React Community** - For excellent tooling
- **Accessibility Community** - For guidance and standards
- **Our Users** - For feedback and inspiration

---

## 📞 Support

- **Documentation:** Check the docs/ folder
- **Issues:** [GitHub Issues](https://github.com/Rathish002/SE-project/issues)
- **Discussions:** [GitHub Discussions](https://github.com/Rathish002/SE-project/discussions)

---

**Made with ❤️ for inclusive education**


