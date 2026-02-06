# Architecture Documentation

Technical architecture overview for the SE-Project learning platform.

## 📋 Table of Contents

- [System Overview](#system-overview)
- [Technology Stack](#technology-stack)
- [Architecture Diagram](#architecture-diagram)
- [Component Architecture](#component-architecture)
- [Data Flow](#data-flow)
- [Database Design](#database-design)
- [API Design](#api-design)
- [Security Architecture](#security-architecture)
- [Deployment Architecture](#deployment-architecture)

## 🏗️ System Overview

SE-Project is a full-stack learning platform designed for specially-abled learners with:
- Real-time collaboration features
- Accessibility-first design
- Multi-language support
- NLP-powered content processing

### High-Level Architecture

```
┌─────────────┐         ┌──────────────┐         ┌─────────────┐
│   Frontend  │ ◄─────► │    Server    │ ◄─────► │  PostgreSQL │
│  (React)    │         │  (Express)   │         │  Database   │
└─────────────┘         └──────────────┘         └─────────────┘
       │                        │
       │                        ▼
       │                ┌──────────────┐
       │                │ NLP Service  │
       │                │  (FastAPI)   │
       │                └──────────────┘
       │
       ▼
┌─────────────┐
│  Firebase   │
│  Services   │
└─────────────┘
```

## 🛠️ Technology Stack

### Frontend
| Technology | Version | Purpose |
|------------|---------|---------|
| React | 19.2.3 | UI framework |
| TypeScript | 4.9.5 | Type safety |
| React Router | Latest | Navigation |
| i18next | 23.16.8 | Internationalization |
| Firebase SDK | 10.13.0 | Authentication & storage |

### Backend
| Technology | Version | Purpose |
|------------|---------|---------|
| Node.js | 16+ | Runtime |
| Express | 5.2.1 | Web framework |
| TypeScript | 5.9.3 | Type safety |
| PostgreSQL | 13+ | Database |
| Socket.IO | 4.7 | Real-time communication |

### NLP Service
| Technology | Version | Purpose |
|------------|---------|---------|
| Python | 3.8+ | Runtime |
| FastAPI | Latest | API framework |
| Sentence Transformers | Latest | NLP models |
| scikit-learn | Latest | ML utilities |

### Infrastructure
| Service | Purpose |
|---------|---------|
| Firebase Auth | User authentication |
| Firestore | Real-time database |
| Firebase Storage | Media storage |
| PostgreSQL | Relational data |

## 📐 Architecture Diagram

### System Architecture

```
┌───────────────────────────────────────────────────────────────┐
│                         Client Layer                           │
│  ┌────────────────────────────────────────────────────────┐  │
│  │  React Application (Port 3000)                         │  │
│  │  ┌─────────┐  ┌──────────┐  ┌──────────┐  ┌────────┐ │  │
│  │  │ ChatUI  │  │ Learning │  │Exercises │  │Settings│ │  │
│  │  └─────────┘  └──────────┘  └──────────┘  └────────┘ │  │
│  │  ┌─────────────────────────────────────────────────┐  │  │
│  │  │     Context API (Accessibility, Auth, i18n)     │  │  │
│  │  └─────────────────────────────────────────────────┘  │  │
│  └────────────────────────────────────────────────────────┘  │
└───────────────────────────────────────────────────────────────┘
                            │
                            │ HTTPS
                            │
┌───────────────────────────────────────────────────────────────┐
│                      Application Layer                         │
│  ┌────────────────────────────────────────────────────────┐  │
│  │  Express Server (Port 5000)                            │  │
│  │  ┌─────────┐  ┌──────────┐  ┌──────────┐  ┌────────┐ │  │
│  │  │ Routes  │  │Middleware│  │Controllers│  │Services│ │  │
│  │  └─────────┘  └──────────┘  └──────────┘  └────────┘ │  │
│  └────────────────────────────────────────────────────────┘  │
│                            │                                   │
│  ┌────────────────────────────────────────────────────────┐  │
│  │  FastAPI NLP Service (Port 8000)                       │  │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐│  │
│  │  │ Translation  │  │ Embeddings   │  │Classification││  │
│  │  └──────────────┘  └──────────────┘  └──────────────┘│  │
│  └────────────────────────────────────────────────────────┘  │
└───────────────────────────────────────────────────────────────┘
                            │
                            │
┌───────────────────────────────────────────────────────────────┐
│                         Data Layer                             │
│  ┌──────────────┐  ┌─────────────┐  ┌────────────────────┐  │
│  │  PostgreSQL  │  │  Firestore  │  │  Firebase Storage  │  │
│  │   (Relational)│  │  (NoSQL)    │  │    (Media Files)  │  │
│  └──────────────┘  └─────────────┘  └────────────────────┘  │
└───────────────────────────────────────────────────────────────┘
```

## 🧩 Component Architecture

### Frontend Component Hierarchy

```
App
├── AccessibilityContext.Provider
│   ├── Navigation
│   │   ├── LanguageSwitcher
│   │   └── AccessibilitySettings
│   │
│   ├── Routes
│   │   ├── Home
│   │   ├── Login / Signup
│   │   ├── Learning
│   │   │   ├── LessonSelection
│   │   │   └── ExercisesContent
│   │   │       ├── ExercisesFeedback
│   │   │       └── ExercisesTTSButton
│   │   │
│   │   ├── Collaboration
│   │   │   ├── ChatUI
│   │   │   │   ├── GroupMembers
│   │   │   │   └── GroupChatSettings
│   │   │   ├── FriendList
│   │   │   ├── FriendRequests
│   │   │   └── FriendSearch
│   │   │
│   │   └── UnifiedSettings
│   │       └── AccessibilityOverlays
│   │
│   └── ErrorFallback
```

### Key Component Responsibilities

#### ChatUI Component
**Location:** [frontend/src/components/ChatUI.tsx](frontend/src/components/ChatUI.tsx)

**Features:**
- Real-time messaging with Firestore
- Message translation
- Message states (sending/sent/failed)
- Media attachments
- Group chat support
- Blocking/unblocking users
- Archive conversations
- Keyboard accessibility (Enter to send, Shift+Enter for newline)

**State Management:**
```typescript
interface ChatUIState {
  messages: Message[];
  currentChat: Chat | null;
  participants: User[];
  isLoading: boolean;
  messageState: 'sending' | 'sent' | 'failed';
  archivedChats: string[];
  blockedUsers: string[];
}
```

#### Accessibility Context
**Location:** [frontend/src/contexts/AccessibilityContext.tsx](frontend/src/contexts/AccessibilityContext.tsx)

**Features:**
- Font size adjustment
- High contrast mode
- Text-to-speech
- Keyboard navigation preferences
- Screen reader support

**Context Shape:**
```typescript
interface AccessibilityContextType {
  fontSize: 'small' | 'medium' | 'large';
  setFontSize: (size: string) => void;
  highContrast: boolean;
  toggleHighContrast: () => void;
  ttsEnabled: boolean;
  toggleTTS: () => void;
}
```

## 🔄 Data Flow

### Authentication Flow

```
1. User enters credentials
   └─> Frontend validates input
       └─> Firebase Auth API call
           ├─> Success: Store user token
           │   └─> Redirect to Home
           └─> Failure: Show error message
```

### Message Sending Flow

```
1. User types message
   └─> ChatUI validates input
       └─> Set message state: 'sending'
           └─> Firestore write operation
               ├─> Success
               │   ├─> Update message state: 'sent'
               │   ├─> Real-time listener updates UI
               │   └─> Notify recipients
               └─> Failure
                   └─> Update message state: 'failed'
                       └─> Show retry option
```

### Translation Flow

```
1. Message received in original language
   └─> Check user's UI language preference
       └─> If different from message language
           └─> Call NLP Service translation endpoint
               └─> Display translated text
                   └─> Store originalLang metadata
```

### Exercise Completion Flow

```
1. User completes exercise
   └─> Frontend calculates score
       └─> POST /api/progress
           └─> Server validates
               └─> PostgreSQL INSERT
                   └─> Return updated progress
                       └─> Update UI with feedback
```

## 🗄️ Database Design

### PostgreSQL Schema

**Users Table:**
```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  firebase_uid VARCHAR(128) UNIQUE NOT NULL,
  username VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  display_name VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Progress Table:**
```sql
CREATE TABLE progress (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  lesson_id VARCHAR(50) NOT NULL,
  exercise_id VARCHAR(50) NOT NULL,
  score INTEGER CHECK (score >= 0 AND score <= 100),
  completed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  time_spent_seconds INTEGER
);
```

**Groups Table:**
```sql
CREATE TABLE groups (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  created_by INTEGER REFERENCES users(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Group Members Table:**
```sql
CREATE TABLE group_members (
  group_id INTEGER REFERENCES groups(id),
  user_id INTEGER REFERENCES users(id),
  role VARCHAR(20) DEFAULT 'member',
  joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (group_id, user_id)
);
```

### Firestore Collections

**messages:**
```typescript
{
  id: string;
  chatId: string;
  senderId: string;
  content: string;
  timestamp: Timestamp;
  type: 'text' | 'image' | 'audio';
  mediaUrl?: string;
  originalLang?: string;
  state: 'sending' | 'sent' | 'failed';
}
```

**chats:**
```typescript
{
  id: string;
  type: 'direct' | 'group';
  participants: string[];
  lastMessage: string;
  lastMessageTime: Timestamp;
  groupName?: string;
  createdBy?: string;
}
```

**userPreferences:**
```typescript
{
  userId: string;
  language: 'en' | 'hi';
  accessibility: {
    fontSize: string;
    highContrast: boolean;
    ttsEnabled: boolean;
  };
  blockedUsers: string[];
  archivedChats: string[];
  lastClearedAt: { [chatId: string]: Timestamp };
}
```

## 🔌 API Design

### REST Endpoints

#### Authentication
```
POST /api/auth/register
POST /api/auth/login
POST /api/auth/logout
GET  /api/auth/verify
```

#### User Management
```
GET    /api/users/:id
PUT    /api/users/:id
DELETE /api/users/:id
GET    /api/users/:id/progress
```

#### Friends
```
GET    /api/friends
POST   /api/friends/request
PUT    /api/friends/accept/:requestId
DELETE /api/friends/:friendId
```

#### Progress
```
GET  /api/progress/:userId
POST /api/progress
GET  /api/progress/:userId/lesson/:lessonId
```

### NLP Service Endpoints

```
POST /translate
Body: { text: string, sourceLang: string, targetLang: string }
Response: { translatedText: string }

POST /embeddings
Body: { text: string }
Response: { embedding: number[] }

POST /classify
Body: { text: string }
Response: { category: string, confidence: number }
```

### WebSocket Events

**Client → Server:**
```typescript
// Join chat room
socket.emit('join-chat', { chatId: string });

// Send message
socket.emit('send-message', { 
  chatId: string, 
  content: string 
});

// Typing indicator
socket.emit('typing', { chatId: string, userId: string });
```

**Server → Client:**
```typescript
// New message
socket.on('new-message', (message: Message) => {});

// User typing
socket.on('user-typing', ({ userId, chatId }) => {});

// User online status
socket.on('user-status', ({ userId, online }) => {});
```

## 🔒 Security Architecture

### Authentication & Authorization

```
┌─────────────┐
│   Client    │
└──────┬──────┘
       │ 1. Login request
       ▼
┌─────────────┐
│  Firebase   │ 2. Validates credentials
│    Auth     │ 3. Returns JWT token
└──────┬──────┘
       │ 4. Token stored in localStorage
       ▼
┌─────────────┐
│   Client    │ 5. Includes token in requests
└──────┬──────┘
       │ Authorization: Bearer <token>
       ▼
┌─────────────┐
│   Server    │ 6. Verifies token
│ Middleware  │ 7. Extracts user info
└──────┬──────┘
       │ 8. Allows/denies access
       ▼
┌─────────────┐
│   Route     │
│  Handler    │
└─────────────┘
```

### Security Layers

1. **Firebase Authentication**
   - Email/password authentication
   - JWT token validation
   - Automatic token refresh

2. **Firestore Security Rules**
   - User can only read their own data
   - Message validation
   - Group membership verification

3. **API Middleware**
   - Token verification
   - Rate limiting
   - Input validation
   - SQL injection prevention

4. **Environment Variables**
   - Sensitive data in `.env` files
   - Never committed to Git
   - Validated on startup

### Firestore Security Rules

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Messages readable by chat participants
    match /messages/{messageId} {
      allow read: if request.auth != null &&
        request.auth.uid in resource.data.participants;
      allow create: if request.auth != null;
    }
    
    // User preferences private to owner
    match /userPreferences/{userId} {
      allow read, write: if request.auth.uid == userId;
    }
  }
}
```

## 🚀 Deployment Architecture

### Development Environment

```
Local Machine
├── Frontend (localhost:3000)
├── Server (localhost:5000)
├── NLP Service (localhost:8000)
└── PostgreSQL (localhost:5432)
```

### Production Environment (Recommended)

```
Cloud Infrastructure
├── Frontend → Vercel / Firebase Hosting
├── Server → Heroku / AWS EC2
├── NLP Service → AWS Lambda / Google Cloud Run
├── PostgreSQL → AWS RDS / Heroku Postgres
└── Firebase → Firebase Production Project
```

### CI/CD Pipeline (Recommended)

```
GitHub Push
    │
    ▼
GitHub Actions
    ├─> Run Tests
    ├─> Run Linting
    ├─> Build Project
    └─> Security Scan
        │
        ▼ (if main branch)
    Deploy
    ├─> Frontend → Vercel
    ├─> Server → Heroku
    └─> NLP → Cloud Run
```

## 📊 Performance Considerations

### Frontend Optimization

1. **Code Splitting**
   ```typescript
   const ChatUI = lazy(() => import('./components/ChatUI'));
   ```

2. **Memoization**
   ```typescript
   const memoizedValue = useMemo(() => computeExpensive(data), [data]);
   ```

3. **Virtual Scrolling** for large lists

4. **Image Optimization**
   - Lazy loading
   - Compressed formats (WebP)
   - Responsive images

### Backend Optimization

1. **Database Indexing**
   ```sql
   CREATE INDEX idx_messages_chat ON messages(chat_id, timestamp);
   ```

2. **Caching** (Redis recommended)

3. **Connection Pooling**
   ```typescript
   const pool = new Pool({ max: 20 });
   ```

4. **Query Optimization**
   - Use prepared statements
   - Limit result sets
   - Eager loading for relations

### Real-time Optimization

1. **Firestore Listeners** - Limit to active chats only
2. **Socket.IO Rooms** - Namespace by chat
3. **Debounce** typing indicators

## 🧪 Testing Strategy

### Unit Tests
- Individual functions
- React components (React Testing Library)
- Service layer

### Integration Tests
- API endpoints (Supertest)
- Database operations
- Firebase integration

### E2E Tests
- User flows (Cypress recommended)
- Accessibility testing (axe-core)
- Cross-browser testing

## 📈 Monitoring & Logging

### Frontend
- Console errors
- User analytics (optional)
- Performance metrics (Web Vitals)

### Backend
- Request logging
- Error tracking (Sentry recommended)
- Database query performance
- API response times

## 🔮 Future Enhancements

Based on current architecture:

1. **Microservices** - Split server into separate services
2. **GraphQL** - Replace REST with GraphQL
3. **Mobile Apps** - React Native sharing code
4. **Video Chat** - WebRTC integration
5. **Advanced NLP** - Custom ML models
6. **Offline Mode** - Service workers + local storage

## 📚 Additional Resources

- [Component Documentation](./frontend/README.md)
- [API Documentation](./server/README.md)
- [Database Schema](./server/sql/schema.sql)
- [Security Guidelines](./SECURITY_CHECKLIST.md)

---

**Last Updated:** Based on commit history through February 2026

**Contributors:** See Git history for architectural decisions and implementations
