# Testing & CI/CD Guide

Comprehensive guide for testing and continuous integration/deployment practices.

## 📋 Table of Contents

- [Testing Strategy](#testing-strategy)
- [Frontend Testing](#frontend-testing)
- [Backend Testing](#backend-testing)
- [NLP Service Testing](#nlp-service-testing)
- [E2E Testing](#e2e-testing)
- [Accessibility Testing](#accessibility-testing)
- [CI/CD Pipeline](#cicd-pipeline)
- [Pre-commit Hooks](#pre-commit-hooks)
- [Code Coverage](#code-coverage)

## 🎯 Testing Strategy

### Testing Pyramid

```
        ┌─────────────┐
        │  E2E Tests  │  (Few - High confidence)
        └─────────────┘
      ┌───────────────────┐
      │ Integration Tests │  (Some - Medium confidence)
      └───────────────────┘
    ┌───────────────────────┐
    │     Unit Tests        │  (Many - Fast & Isolated)
    └───────────────────────┘
```

### Test Coverage Goals

- **Unit Tests:** 80%+ coverage
- **Integration Tests:** Critical paths covered
- **E2E Tests:** Core user journeys
- **Accessibility:** WCAG AA compliance

## 🎨 Frontend Testing

### Setup

**Test Framework:** Jest + React Testing Library

**Installation (already included):**
```powershell
cd frontend
npm install --save-dev @testing-library/react @testing-library/jest-dom @testing-library/user-event
```

### Running Tests

```powershell
cd frontend

# Run all tests
npm test

# Run in watch mode
npm test -- --watch

# Run with coverage
npm test -- --coverage

# Run specific test file
npm test ChatUI.test.tsx
```

### Test Report (Frontend)

Test report with inputs, outputs, and expected values:
- [frontend/TEST_REPORT.md](frontend/TEST_REPORT.md)

Use this report to show the exact test command (input), observed results (output), and expected values for each unit test. The raw execution log is in [frontend/test-report.txt](frontend/test-report.txt), and the coverage report is in [frontend/coverage/lcov-report/index.html](frontend/coverage/lcov-report/index.html).

### Unit Testing Components

**Example: ChatUI Component Test**

Location: `frontend/src/components/ChatUI.test.tsx`

```typescript
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ChatUI } from './ChatUI';
import { auth } from '../firebase';

// Mock Firebase
jest.mock('../firebase', () => ({
  auth: { currentUser: { uid: 'test-user-123' } },
  db: {},
}));

describe('ChatUI Component', () => {
  test('renders chat interface', () => {
    render(<ChatUI />);
    expect(screen.getByPlaceholderText(/type a message/i)).toBeInTheDocument();
  });

  test('sends message on Enter key press', async () => {
    render(<ChatUI />);
    const input = screen.getByRole('textbox');
    
    // Type message
    fireEvent.change(input, { target: { value: 'Hello World' } });
    
    // Press Enter
    fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' });
    
    // Wait for message to appear
    await waitFor(() => {
      expect(screen.getByText('Hello World')).toBeInTheDocument();
    });
  });

  test('adds newline on Shift+Enter', () => {
    render(<ChatUI />);
    const input = screen.getByRole('textbox') as HTMLTextAreaElement;
    
    fireEvent.change(input, { target: { value: 'Line 1' } });
    fireEvent.keyDown(input, { key: 'Enter', code: 'Enter', shiftKey: true });
    
    expect(input.value).toContain('Line 1\n');
  });

  test('displays message state indicators', async () => {
    render(<ChatUI />);
    const input = screen.getByRole('textbox');
    
    fireEvent.change(input, { target: { value: 'Test' } });
    fireEvent.keyDown(input, { key: 'Enter' });
    
    // Should show "sending" state
    expect(screen.getByText(/sending/i)).toBeInTheDocument();
    
    // Wait for "sent" state
    await waitFor(() => {
      expect(screen.getByText(/sent/i)).toBeInTheDocument();
    });
  });

  test('shows translation when language differs', async () => {
    render(<ChatUI />);
    
    // Mock message in Hindi
    const hindiMessage = { 
      content: 'नमस्ते', 
      originalLang: 'hi' 
    };
    
    // User's UI language is English
    await waitFor(() => {
      expect(screen.getByText(/translated/i)).toBeInTheDocument();
    });
  });
});
```

### Testing Context and Hooks

**Example: AccessibilityContext Test**

```typescript
import { render, screen } from '@testing-library/react';
import { AccessibilityProvider, useAccessibility } from '../contexts/AccessibilityContext';

const TestComponent = () => {
  const { fontSize, setFontSize } = useAccessibility();
  return (
    <div>
      <span data-testid="font-size">{fontSize}</span>
      <button onClick={() => setFontSize('large')}>Increase</button>
    </div>
  );
};

describe('AccessibilityContext', () => {
  test('provides default font size', () => {
    render(
      <AccessibilityProvider>
        <TestComponent />
      </AccessibilityProvider>
    );
    expect(screen.getByTestId('font-size')).toHaveTextContent('medium');
  });

  test('updates font size', () => {
    render(
      <AccessibilityProvider>
        <TestComponent />
      </AccessibilityProvider>
    );
    
    fireEvent.click(screen.getByText('Increase'));
    expect(screen.getByTestId('font-size')).toHaveTextContent('large');
  });
});
```

### Mocking Firebase

```typescript
// __mocks__/firebase.ts
export const auth = {
  currentUser: { uid: 'mock-user-id', email: 'test@example.com' },
  signInWithEmailAndPassword: jest.fn(),
  createUserWithEmailAndPassword: jest.fn(),
  signOut: jest.fn(),
};

export const db = {
  collection: jest.fn(() => ({
    doc: jest.fn(() => ({
      get: jest.fn(),
      set: jest.fn(),
      update: jest.fn(),
    })),
  })),
};

export const storage = {
  ref: jest.fn(() => ({
    put: jest.fn(),
    getDownloadURL: jest.fn(),
  })),
};
```

### Snapshot Testing

```typescript
import { render } from '@testing-library/react';
import { Navigation } from './Navigation';

test('matches snapshot', () => {
  const { container } = render(<Navigation />);
  expect(container).toMatchSnapshot();
});
```

## 🔧 Backend Testing

### Setup

**Test Framework:** Jest + Supertest

Location: `server/TEST_GUIDE.md` (already exists)

### Running Tests

```powershell
cd server

# Run all tests
npm test

# Run with coverage
npm test -- --coverage

# Run specific test
npm test -- routes/auth.test.ts

# Watch mode
npm test -- --watch
```

### Unit Testing API Routes

**Example: Auth Route Test**

```typescript
import request from 'supertest';
import app from '../app';
import { pool } from '../db';

describe('POST /api/auth/register', () => {
  afterAll(async () => {
    // Clean up test data
    await pool.query('DELETE FROM users WHERE email = $1', ['test@example.com']);
    await pool.end();
  });

  test('creates new user with valid data', async () => {
    const response = await request(app)
      .post('/api/auth/register')
      .send({
        username: 'testuser',
        email: 'test@example.com',
        password: 'SecurePass123!',
      })
      .expect(201);

    expect(response.body).toHaveProperty('userId');
    expect(response.body).toHaveProperty('token');
  });

  test('rejects duplicate email', async () => {
    // First registration
    await request(app)
      .post('/api/auth/register')
      .send({
        username: 'user1',
        email: 'duplicate@example.com',
        password: 'Password123!',
      });

    // Duplicate attempt
    const response = await request(app)
      .post('/api/auth/register')
      .send({
        username: 'user2',
        email: 'duplicate@example.com',
        password: 'Password456!',
      })
      .expect(400);

    expect(response.body.error).toMatch(/email already exists/i);
  });

  test('validates password strength', async () => {
    const response = await request(app)
      .post('/api/auth/register')
      .send({
        username: 'testuser',
        email: 'test2@example.com',
        password: 'weak',
      })
      .expect(400);

    expect(response.body.error).toMatch(/password too weak/i);
  });
});
```

### Testing Database Operations

```typescript
import { getUserProgress, saveProgress } from '../services/progressService';
import { pool } from '../db';

describe('Progress Service', () => {
  let testUserId: number;

  beforeAll(async () => {
    // Create test user
    const result = await pool.query(
      'INSERT INTO users (username, email) VALUES ($1, $2) RETURNING id',
      ['testuser', 'test@example.com']
    );
    testUserId = result.rows[0].id;
  });

  afterAll(async () => {
    // Clean up
    await pool.query('DELETE FROM progress WHERE user_id = $1', [testUserId]);
    await pool.query('DELETE FROM users WHERE id = $1', [testUserId]);
  });

  test('saves progress correctly', async () => {
    const progress = await saveProgress({
      userId: testUserId,
      lessonId: 'lesson-1',
      exerciseId: 'ex-1',
      score: 85,
    });

    expect(progress).toHaveProperty('id');
    expect(progress.score).toBe(85);
  });

  test('retrieves user progress', async () => {
    const progress = await getUserProgress(testUserId);
    expect(Array.isArray(progress)).toBe(true);
    expect(progress.length).toBeGreaterThan(0);
  });
});
```

### Mocking External Services

```typescript
// Mock NLP service
jest.mock('../services/nlpService', () => ({
  translateText: jest.fn(async (text) => `Translated: ${text}`),
  getEmbeddings: jest.fn(async () => [0.1, 0.2, 0.3]),
}));

// Use in tests
import { translateText } from '../services/nlpService';

test('handles translation', async () => {
  const result = await translateText('Hello', 'en', 'hi');
  expect(result).toBe('Translated: Hello');
  expect(translateText).toHaveBeenCalledWith('Hello', 'en', 'hi');
});
```

## 🐍 NLP Service Testing

### Setup

**Test Framework:** pytest

```powershell
cd nlp-service

# Install test dependencies
pip install pytest pytest-asyncio httpx

# Run tests
pytest

# With coverage
pytest --cov=app --cov-report=html
```

### Creating Tests

**Location:** `nlp-service/tests/test_app.py`

```python
import pytest
from fastapi.testclient import TestClient
from app import app

client = TestClient(app)

def test_health_check():
    """Test API health endpoint"""
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "healthy"}

def test_translate_endpoint():
    """Test translation functionality"""
    response = client.post("/translate", json={
        "text": "Hello World",
        "source_lang": "en",
        "target_lang": "hi"
    })
    
    assert response.status_code == 200
    data = response.json()
    assert "translated_text" in data
    assert len(data["translated_text"]) > 0

def test_embeddings_endpoint():
    """Test text embeddings generation"""
    response = client.post("/embeddings", json={
        "text": "Sample text for embedding"
    })
    
    assert response.status_code == 200
    data = response.json()
    assert "embedding" in data
    assert isinstance(data["embedding"], list)
    assert len(data["embedding"]) > 0

def test_invalid_input():
    """Test error handling for invalid input"""
    response = client.post("/translate", json={
        "text": "",  # Empty text
        "source_lang": "en",
        "target_lang": "hi"
    })
    
    assert response.status_code == 400
    assert "error" in response.json()

@pytest.mark.asyncio
async def test_async_translation():
    """Test async translation processing"""
    from app import translate_text
    
    result = await translate_text("Hello", "en", "hi")
    assert result is not None
    assert len(result) > 0
```

## 🎭 E2E Testing

### Setup with Cypress (Recommended)

```powershell
cd frontend

# Install Cypress
npm install --save-dev cypress

# Open Cypress
npx cypress open
```

### E2E Test Example

**Location:** `frontend/cypress/e2e/chat.cy.ts`

```typescript
describe('Chat Functionality', () => {
  beforeEach(() => {
    // Login before each test
    cy.visit('http://localhost:3000/login');
    cy.get('[data-testid="email-input"]').type('test@example.com');
    cy.get('[data-testid="password-input"]').type('password123');
    cy.get('[data-testid="login-button"]').click();
    cy.url().should('include', '/home');
  });

  it('sends a message successfully', () => {
    // Navigate to chat
    cy.get('[data-testid="chat-tab"]').click();
    
    // Select a conversation
    cy.get('[data-testid="chat-list"]').first().click();
    
    // Type and send message
    cy.get('[data-testid="message-input"]').type('Hello from Cypress!');
    cy.get('[data-testid="message-input"]').type('{enter}');
    
    // Verify message appears
    cy.contains('Hello from Cypress!').should('be.visible');
  });

  it('creates a group chat', () => {
    cy.get('[data-testid="new-group-button"]').click();
    cy.get('[data-testid="group-name-input"]').type('Test Group');
    
    // Add members
    cy.get('[data-testid="member-search"]').type('friend@example.com');
    cy.get('[data-testid="add-member-button"]').first().click();
    
    // Create group
    cy.get('[data-testid="create-group-button"]').click();
    
    // Verify group created
    cy.contains('Test Group').should('be.visible');
  });

  it('archives a conversation', () => {
    cy.get('[data-testid="chat-list"]').first().rightClick();
    cy.get('[data-testid="archive-option"]').click();
    
    // Check archived section
    cy.get('[data-testid="archived-chats-tab"]').click();
    cy.get('[data-testid="archived-list"]').should('contain', 'Archived');
  });
});
```

### Visual Regression Testing

```typescript
describe('Visual Tests', () => {
  it('matches ChatUI snapshot', () => {
    cy.visit('/chat');
    cy.get('[data-testid="chat-container"]').matchImageSnapshot('chat-ui');
  });
});
```

## ♿ Accessibility Testing

### Automated Testing

**Using jest-axe:**

```typescript
import { render } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import { ChatUI } from './ChatUI';

expect.extend(toHaveNoViolations);

test('ChatUI has no accessibility violations', async () => {
  const { container } = render(<ChatUI />);
  const results = await axe(container);
  expect(results).toHaveNoViolations();
});
```

**Using Cypress axe:**

```typescript
describe('Accessibility', () => {
  it('has no detectable a11y violations on load', () => {
    cy.visit('/');
    cy.injectAxe();
    cy.checkA11y();
  });

  it('chat interface is accessible', () => {
    cy.visit('/chat');
    cy.injectAxe();
    cy.checkA11y('[data-testid="chat-container"]');
  });
});
```

### Manual Accessibility Checklist

- [ ] **Keyboard Navigation**
  - Tab through all interactive elements
  - Enter/Space activate buttons
  - Escape closes modals
  
- [ ] **Screen Reader**
  - ARIA labels present
  - Form labels associated
  - Status announcements work
  
- [ ] **Visual**
  - Color contrast meets WCAG AA (4.5:1)
  - Focus indicators visible
  - Text resizable to 200%
  
- [ ] **Cognitive**
  - Clear error messages
  - Consistent navigation
  - Instructions provided

### WCAG Compliance Testing

```bash
# Install pa11y
npm install -g pa11y

# Test single page
pa11y http://localhost:3000

# Test with specific WCAG level
pa11y --standard WCAG2AA http://localhost:3000/chat
```

## 🔄 CI/CD Pipeline

### GitHub Actions Workflow

**Location:** `.github/workflows/ci.yml`

```yaml
name: CI/CD Pipeline

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

jobs:
  frontend-test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '16'
          cache: 'npm'
          cache-dependency-path: frontend/package-lock.json
      
      - name: Install dependencies
        working-directory: ./frontend
        run: npm ci
      
      - name: Run linter
        working-directory: ./frontend
        run: npm run lint
      
      - name: Run tests
        working-directory: ./frontend
        run: npm test -- --coverage --watchAll=false
      
      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          files: ./frontend/coverage/lcov.info
          flags: frontend

  backend-test:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:13
        env:
          POSTGRES_PASSWORD: postgres
          POSTGRES_DB: test_db
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
        ports:
          - 5432:5432
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '16'
          cache: 'npm'
          cache-dependency-path: server/package-lock.json
      
      - name: Install dependencies
        working-directory: ./server
        run: npm ci
      
      - name: Run database migrations
        working-directory: ./server
        env:
          DATABASE_URL: postgresql://postgres:postgres@localhost:5432/test_db
        run: psql $DATABASE_URL -f sql/schema.sql
      
      - name: Run tests
        working-directory: ./server
        env:
          DATABASE_URL: postgresql://postgres:postgres@localhost:5432/test_db
        run: npm test -- --coverage
      
      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          files: ./server/coverage/lcov.info
          flags: backend

  nlp-test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Python
        uses: actions/setup-python@v4
        with:
          python-version: '3.9'
          cache: 'pip'
          cache-dependency-path: nlp-service/requirements.txt
      
      - name: Install dependencies
        working-directory: ./nlp-service
        run: |
          python -m pip install --upgrade pip
          pip install -r requirements.txt
          pip install pytest pytest-cov
      
      - name: Run tests
        working-directory: ./nlp-service
        run: pytest --cov=app --cov-report=xml
      
      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          files: ./nlp-service/coverage.xml
          flags: nlp

  security-scan:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Run security validation
        run: |
          # Check for exposed secrets
          if grep -r "AIza" . --exclude-dir=node_modules --exclude-dir=.git; then
            echo "Exposed API keys found!"
            exit 1
          fi
      
      - name: Dependency audit (Frontend)
        working-directory: ./frontend
        run: npm audit --audit-level=moderate
      
      - name: Dependency audit (Backend)
        working-directory: ./server
        run: npm audit --audit-level=moderate

  build:
    needs: [frontend-test, backend-test, nlp-test, security-scan]
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Build frontend
        working-directory: ./frontend
        run: |
          npm ci
          npm run build
      
      - name: Build backend
        working-directory: ./server
        run: |
          npm ci
          npm run build
      
      - name: Deploy to production
        run: echo "Deploying to production..."
        # Add deployment steps here
```

## 🪝 Pre-commit Hooks

### Setup Husky

```powershell
cd SE-project

# Install Husky
npm install --save-dev husky

# Initialize
npx husky install

# Add to package.json
npm set-script prepare "husky install"
```

### Pre-commit Hook

**Location:** `.husky/pre-commit`

```bash
#!/bin/sh
. "$(dirname "$0")/_/husky.sh"

echo "🔍 Running pre-commit checks..."

# Run linter
echo "📝 Linting code..."
cd frontend && npm run lint
cd ../server && npm run lint

# Run tests
echo "🧪 Running tests..."
cd ../frontend && npm test -- --watchAll=false
cd ../server && npm test

# Security check
echo "🔒 Running security validation..."
cd ..
./validate-security.ps1

echo "✅ All checks passed!"
```

### Pre-push Hook

**Location:** `.husky/pre-push`

```bash
#!/bin/sh
. "$(dirname "$0")/_/husky.sh"

echo "🚀 Running pre-push checks..."

# Full test suite
npm test -- --coverage

# Build check
cd frontend && npm run build
cd ../server && npm run build

echo "✅ Ready to push!"
```

## 📊 Code Coverage

### Viewing Coverage Reports

```powershell
# Frontend
cd frontend
npm test -- --coverage
# Open: frontend/coverage/lcov-report/index.html

# Backend
cd server
npm test -- --coverage
# Open: server/coverage/lcov-report/index.html

# NLP
cd nlp-service
pytest --cov=app --cov-report=html
# Open: nlp-service/htmlcov/index.html
```

### Coverage Requirements

**package.json configuration:**

```json
{
  "jest": {
    "coverageThreshold": {
      "global": {
        "branches": 70,
        "functions": 80,
        "lines": 80,
        "statements": 80
      }
    }
  }
}
```

### Ignoring Files from Coverage

```javascript
// jest.config.js
module.exports = {
  coveragePathIgnorePatterns: [
    '/node_modules/',
    '/dist/',
    '/.test.tsx?$/',
    '/setupTests.ts'
  ]
};
```

## 🏆 Best Practices

### Test Naming

```typescript
// Good
test('sends message when Enter key is pressed')
test('displays error when API call fails')
test('archives conversation on user action')

// Bad
test('test1')
test('it works')
test('check message')
```

### Test Organization

```typescript
describe('ChatUI Component', () => {
  describe('Message Sending', () => {
    test('sends on Enter key')
    test('adds newline on Shift+Enter')
    test('validates input before sending')
  });

  describe('Message Display', () => {
    test('shows timestamp')
    test('groups by sender')
    test('displays read receipts')
  });
});
```

### Async Testing

```typescript
// Good - Using waitFor
test('loads messages', async () => {
  render(<ChatUI />);
  await waitFor(() => {
    expect(screen.getByText('Message 1')).toBeInTheDocument();
  });
});

// Good - Using findBy (implicit wait)
test('loads messages', async () => {
  render(<ChatUI />);
  expect(await screen.findByText('Message 1')).toBeInTheDocument();
});
```

## 🎓 Learning Resources

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [Cypress Documentation](https://docs.cypress.io/)
- [GitHub Actions](https://docs.github.com/en/actions)
- [WCAG Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)

## 📈 Monitoring Test Health

### Key Metrics

- **Test Pass Rate:** Should be 100%
- **Coverage:** 80%+ for critical code
- **Test Speed:** Fast unit tests, reasonable E2E
- **Flakiness:** <1% flaky tests

### Continuous Improvement

1. Review failed tests immediately
2. Refactor slow tests
3. Remove outdated tests
4. Add tests for new bugs
5. Regular dependency updates

---

**Happy Testing! 🧪**

For questions or issues, refer to [CONTRIBUTING.md](CONTRIBUTING.md) or create a GitHub issue.
