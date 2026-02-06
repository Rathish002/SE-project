# API Documentation

Complete API reference for the SE-Project backend services.

## 📋 Table of Contents

- [Overview](#overview)
- [Base URLs](#base-urls)
- [Authentication](#authentication)
- [Rate Limiting](#rate-limiting)
- [Error Handling](#error-handling)
- [API Endpoints](#api-endpoints)
  - [Authentication](#authentication-endpoints)
  - [Users](#users-endpoints)
  - [Friends](#friends-endpoints)
  - [Messages](#messages-endpoints)
  - [Progress](#progress-endpoints)
- [NLP Service](#nlp-service-endpoints)
- [WebSocket Events](#websocket-events)
- [Response Formats](#response-formats)

## 🌐 Overview

The SE-Project API follows REST principles and uses JSON for request/response payloads.

### Base URLs

**Development:**
```
Backend:     http://localhost:5000
NLP Service: http://localhost:8000
```

**Production:**
```
Backend:     https://api.se-project.com
NLP Service: https://nlp.se-project.com
```

### API Versions

Current version: **v1**

All endpoints are prefixed with `/api` (backend) or no prefix (NLP service).

## 🔐 Authentication

Most endpoints require authentication using Firebase JWT tokens.

### Getting a Token

1. User signs in via Firebase Auth (handled by frontend)
2. Firebase returns a JWT token
3. Include token in all authenticated requests

### Using the Token

Include the token in the Authorization header:

```http
Authorization: Bearer <your-jwt-token>
```

**Example:**
```javascript
fetch('http://localhost:5000/api/users/me', {
  headers: {
    'Authorization': `Bearer ${userToken}`,
    'Content-Type': 'application/json'
  }
});
```

### Token Expiration

- Tokens expire after 1 hour
- Frontend automatically refreshes tokens
- If token is invalid, API returns 401 Unauthorized

## ⏱️ Rate Limiting

API requests are rate-limited to prevent abuse:

- **Anonymous:** 100 requests/hour
- **Authenticated:** 1000 requests/hour

**Rate limit headers:**
```http
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 1612345678
```

When exceeded:
```json
{
  "error": "Rate limit exceeded",
  "retryAfter": 3600
}
```

## ❌ Error Handling

### Error Response Format

```json
{
  "error": "Error message here",
  "code": "ERROR_CODE",
  "details": {
    "field": "Additional context"
  }
}
```

### HTTP Status Codes

| Code | Meaning |
|------|---------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request (invalid input) |
| 401 | Unauthorized (missing/invalid token) |
| 403 | Forbidden (insufficient permissions) |
| 404 | Not Found |
| 409 | Conflict (duplicate resource) |
| 429 | Too Many Requests (rate limit) |
| 500 | Internal Server Error |

### Common Error Codes

```javascript
'AUTH_REQUIRED'       // Authentication needed
'INVALID_TOKEN'       // Token expired or malformed
'USER_NOT_FOUND'      // User doesn't exist
'INVALID_INPUT'       // Validation failed
'DUPLICATE_ENTRY'     // Resource already exists
'PERMISSION_DENIED'   // Insufficient permissions
'RESOURCE_NOT_FOUND'  // Requested resource not found
```

---

## 📡 API Endpoints

### Authentication Endpoints

#### Register User

Creates a new user account.

```http
POST /api/auth/register
```

**Request Body:**
```json
{
  "username": "johndoe",
  "email": "john@example.com",
  "password": "SecurePass123!",
  "displayName": "John Doe"
}
```

**Response:** `201 Created`
```json
{
  "userId": 123,
  "username": "johndoe",
  "email": "john@example.com",
  "token": "eyJhbGciOiJIUzI1NiIs..."
}
```

**Validation Rules:**
- Username: 3-50 characters, alphanumeric + underscore
- Email: Valid email format
- Password: Min 8 characters, 1 uppercase, 1 number, 1 special char

---

#### Login

Authenticates existing user.

```http
POST /api/auth/login
```

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "SecurePass123!"
}
```

**Response:** `200 OK`
```json
{
  "userId": 123,
  "username": "johndoe",
  "email": "john@example.com",
  "token": "eyJhbGciOiJIUzI1NiIs..."
}
```

---

#### Logout

Invalidates current session.

```http
POST /api/auth/logout
```

**Headers:** `Authorization: Bearer <token>`

**Response:** `200 OK`
```json
{
  "message": "Logged out successfully"
}
```

---

#### Verify Token

Validates authentication token.

```http
GET /api/auth/verify
```

**Headers:** `Authorization: Bearer <token>`

**Response:** `200 OK`
```json
{
  "valid": true,
  "userId": 123,
  "expiresAt": "2026-02-07T12:00:00Z"
}
```

---

### Users Endpoints

#### Get Current User

Retrieves authenticated user's profile.

```http
GET /api/users/me
```

**Headers:** `Authorization: Bearer <token>`

**Response:** `200 OK`
```json
{
  "id": 123,
  "username": "johndoe",
  "email": "john@example.com",
  "displayName": "John Doe",
  "createdAt": "2026-01-01T00:00:00Z",
  "updatedAt": "2026-02-01T00:00:00Z"
}
```

---

#### Get User by ID

Retrieves specific user's public profile.

```http
GET /api/users/:id
```

**Headers:** `Authorization: Bearer <token>`

**Response:** `200 OK`
```json
{
  "id": 123,
  "username": "johndoe",
  "displayName": "John Doe",
  "createdAt": "2026-01-01T00:00:00Z"
}
```

---

#### Update User Profile

Updates current user's profile.

```http
PUT /api/users/me
```

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "displayName": "John Updated Doe",
  "bio": "Software Engineer",
  "avatar": "https://example.com/avatar.jpg"
}
```

**Response:** `200 OK`
```json
{
  "id": 123,
  "displayName": "John Updated Doe",
  "bio": "Software Engineer",
  "avatar": "https://example.com/avatar.jpg"
}
```

---

#### Delete User

Deletes current user's account.

```http
DELETE /api/users/me
```

**Headers:** `Authorization: Bearer <token>`

**Response:** `200 OK`
```json
{
  "message": "Account deleted successfully"
}
```

---

### Friends Endpoints

#### Get Friend List

Retrieves user's friends.

```http
GET /api/friends
```

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 20, max: 100)

**Response:** `200 OK`
```json
{
  "friends": [
    {
      "id": 456,
      "username": "janedoe",
      "displayName": "Jane Doe",
      "status": "online",
      "lastSeen": "2026-02-07T10:30:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 45,
    "pages": 3
  }
}
```

---

#### Send Friend Request

Sends a friend request to another user.

```http
POST /api/friends/request
```

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "userId": 456
}
```

**Response:** `201 Created`
```json
{
  "requestId": 789,
  "status": "pending",
  "sentTo": {
    "id": 456,
    "username": "janedoe",
    "displayName": "Jane Doe"
  }
}
```

---

#### Get Friend Requests

Retrieves pending friend requests.

```http
GET /api/friends/requests
```

**Headers:** `Authorization: Bearer <token>`

**Response:** `200 OK`
```json
{
  "requests": [
    {
      "id": 789,
      "from": {
        "id": 456,
        "username": "janedoe",
        "displayName": "Jane Doe"
      },
      "createdAt": "2026-02-07T10:00:00Z"
    }
  ]
}
```

---

#### Accept Friend Request

Accepts a pending friend request.

```http
PUT /api/friends/accept/:requestId
```

**Headers:** `Authorization: Bearer <token>`

**Response:** `200 OK`
```json
{
  "message": "Friend request accepted",
  "friend": {
    "id": 456,
    "username": "janedoe",
    "displayName": "Jane Doe"
  }
}
```

---

#### Reject Friend Request

Rejects a pending friend request.

```http
DELETE /api/friends/reject/:requestId
```

**Headers:** `Authorization: Bearer <token>`

**Response:** `200 OK`
```json
{
  "message": "Friend request rejected"
}
```

---

#### Remove Friend

Removes a friend from friend list.

```http
DELETE /api/friends/:friendId
```

**Headers:** `Authorization: Bearer <token>`

**Response:** `200 OK`
```json
{
  "message": "Friend removed successfully"
}
```

---

### Messages Endpoints

**Note:** Real-time messaging is handled via Firebase Firestore. These endpoints are for additional functionality.

#### Get Message History

Retrieves message history for a chat.

```http
GET /api/messages/:chatId
```

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**
- `before` (optional): Timestamp for pagination
- `limit` (optional): Number of messages (default: 50, max: 100)

**Response:** `200 OK`
```json
{
  "messages": [
    {
      "id": "msg-123",
      "senderId": "user-456",
      "content": "Hello!",
      "timestamp": "2026-02-07T10:30:00Z",
      "type": "text",
      "state": "sent"
    }
  ],
  "hasMore": true,
  "nextCursor": "2026-02-07T10:00:00Z"
}
```

---

#### Search Messages

Searches messages by content.

```http
GET /api/messages/search
```

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**
- `q`: Search query (required)
- `chatId` (optional): Limit to specific chat
- `limit` (optional): Results limit (default: 20)

**Response:** `200 OK`
```json
{
  "results": [
    {
      "id": "msg-123",
      "chatId": "chat-789",
      "content": "Matched text here...",
      "timestamp": "2026-02-07T10:30:00Z",
      "highlight": "...matched <mark>text</mark> here..."
    }
  ],
  "total": 42
}
```

---

### Progress Endpoints

#### Get User Progress

Retrieves learning progress for a user.

```http
GET /api/progress/:userId
```

**Headers:** `Authorization: Bearer <token>`

**Response:** `200 OK`
```json
{
  "userId": 123,
  "overallProgress": 65.5,
  "lessons": [
    {
      "lessonId": "lesson-1",
      "completed": true,
      "score": 85,
      "completedAt": "2026-02-05T14:30:00Z"
    },
    {
      "lessonId": "lesson-2",
      "completed": false,
      "progress": 40
    }
  ],
  "totalTimeSpent": 7200,
  "exercisesCompleted": 24
}
```

---

#### Record Progress

Saves progress for an exercise.

```http
POST /api/progress
```

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "lessonId": "lesson-1",
  "exerciseId": "ex-5",
  "score": 90,
  "timeSpentSeconds": 180,
  "answers": {
    "q1": "answer1",
    "q2": "answer2"
  }
}
```

**Response:** `201 Created`
```json
{
  "id": 456,
  "lessonId": "lesson-1",
  "exerciseId": "ex-5",
  "score": 90,
  "timeSpent": 180,
  "completedAt": "2026-02-07T11:00:00Z",
  "feedback": {
    "message": "Great job!",
    "improvements": ["Consider reviewing topic X"]
  }
}
```

---

#### Get Lesson Progress

Retrieves progress for a specific lesson.

```http
GET /api/progress/:userId/lesson/:lessonId
```

**Headers:** `Authorization: Bearer <token>`

**Response:** `200 OK`
```json
{
  "lessonId": "lesson-1",
  "title": "Introduction to Programming",
  "completed": true,
  "score": 85,
  "exercises": [
    {
      "exerciseId": "ex-1",
      "completed": true,
      "score": 90
    },
    {
      "exerciseId": "ex-2",
      "completed": true,
      "score": 80
    }
  ]
}
```

---

## 🤖 NLP Service Endpoints

### Health Check

Checks if NLP service is running.

```http
GET /health
```

**Response:** `200 OK`
```json
{
  "status": "healthy",
  "version": "1.0.0"
}
```

---

### Translate Text

Translates text between languages.

```http
POST /translate
```

**Request Body:**
```json
{
  "text": "Hello, how are you?",
  "sourceLang": "en",
  "targetLang": "hi"
}
```

**Response:** `200 OK`
```json
{
  "translatedText": "नमस्ते, आप कैसे हैं?",
  "sourceLang": "en",
  "targetLang": "hi",
  "confidence": 0.95
}
```

**Supported Languages:**
- `en` - English
- `hi` - Hindi
- More coming soon

---

### Generate Embeddings

Generates text embeddings for semantic search.

```http
POST /embeddings
```

**Request Body:**
```json
{
  "text": "This is a sample text for embedding generation"
}
```

**Response:** `200 OK`
```json
{
  "embedding": [0.123, -0.456, 0.789, ...],
  "dimensions": 384,
  "model": "all-MiniLM-L6-v2"
}
```

---

### Classify Text

Classifies text into categories.

```http
POST /classify
```

**Request Body:**
```json
{
  "text": "This is a question about programming"
}
```

**Response:** `200 OK`
```json
{
  "category": "programming",
  "confidence": 0.92,
  "alternatives": [
    { "category": "technology", "confidence": 0.75 },
    { "category": "education", "confidence": 0.65 }
  ]
}
```

---

## 🔌 WebSocket Events

Real-time communication uses Socket.IO.

### Connection

```javascript
import io from 'socket.io-client';

const socket = io('http://localhost:5000', {
  auth: {
    token: userToken
  }
});
```

### Client → Server Events

#### Join Chat

Join a chat room to receive messages.

```javascript
socket.emit('join-chat', {
  chatId: 'chat-123'
});
```

---

#### Send Message

Send a message in a chat.

```javascript
socket.emit('send-message', {
  chatId: 'chat-123',
  content: 'Hello!',
  type: 'text'
});
```

---

#### Typing Indicator

Notify others user is typing.

```javascript
socket.emit('typing', {
  chatId: 'chat-123',
  userId: 'user-456'
});

// Stop typing
socket.emit('stop-typing', {
  chatId: 'chat-123',
  userId: 'user-456'
});
```

---

#### Leave Chat

Leave a chat room.

```javascript
socket.emit('leave-chat', {
  chatId: 'chat-123'
});
```

---

### Server → Client Events

#### New Message

Receive new message.

```javascript
socket.on('new-message', (message) => {
  console.log(message);
  // {
  //   id: 'msg-123',
  //   chatId: 'chat-123',
  //   senderId: 'user-456',
  //   content: 'Hello!',
  //   timestamp: '2026-02-07T11:00:00Z'
  // }
});
```

---

#### User Typing

Receive typing notification.

```javascript
socket.on('user-typing', ({ userId, chatId }) => {
  console.log(`${userId} is typing in ${chatId}`);
});

socket.on('user-stop-typing', ({ userId, chatId }) => {
  console.log(`${userId} stopped typing in ${chatId}`);
});
```

---

#### User Status

Receive user online/offline status.

```javascript
socket.on('user-status', ({ userId, online, lastSeen }) => {
  console.log(`${userId} is ${online ? 'online' : 'offline'}`);
});
```

---

#### Message State Update

Receive message delivery status.

```javascript
socket.on('message-state', ({ messageId, state }) => {
  console.log(`Message ${messageId} is ${state}`);
  // state: 'sending' | 'sent' | 'delivered' | 'read' | 'failed'
});
```

---

## 📦 Response Formats

### Success Response

```json
{
  "data": { /* response data */ },
  "meta": {
    "timestamp": "2026-02-07T11:00:00Z",
    "requestId": "req-abc123"
  }
}
```

### Paginated Response

```json
{
  "data": [ /* array of items */ ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "pages": 5,
    "hasNext": true,
    "hasPrev": false
  }
}
```

### Error Response

```json
{
  "error": "Error message",
  "code": "ERROR_CODE",
  "details": {
    "field": "Additional context"
  },
  "meta": {
    "timestamp": "2026-02-07T11:00:00Z",
    "requestId": "req-abc123"
  }
}
```

---

## 🔧 Testing the API

### Using cURL

```bash
# Get user profile
curl -H "Authorization: Bearer YOUR_TOKEN" \
     http://localhost:5000/api/users/me

# Create friend request
curl -X POST \
     -H "Authorization: Bearer YOUR_TOKEN" \
     -H "Content-Type: application/json" \
     -d '{"userId": 456}' \
     http://localhost:5000/api/friends/request
```

### Using Postman

1. Import collection from `docs/postman-collection.json`
2. Set environment variable `token` to your JWT
3. Run requests

### Using JavaScript

```javascript
// Helper function
async function apiRequest(endpoint, options = {}) {
  const response = await fetch(`http://localhost:5000${endpoint}`, {
    ...options,
    headers: {
      'Authorization': `Bearer ${userToken}`,
      'Content-Type': 'application/json',
      ...options.headers
    }
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error);
  }
  
  return response.json();
}

// Usage
const user = await apiRequest('/api/users/me');
```

---

## 📚 Additional Resources

- [Backend README](../server/README.md)
- [Testing Guide](TESTING.md)
- [Architecture](ARCHITECTURE.md)
- [Contributing](CONTRIBUTING.md)

---

**API Version:** 1.0.0  
**Last Updated:** February 2026

For questions or issues, create a GitHub issue or contact the development team.
