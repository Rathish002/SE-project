# Contributing to SE-Project

Welcome! This guide will help you contribute to our learning platform for specially-abled learners.

## 📋 Table of Contents

- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Branch Strategy](#branch-strategy)
- [Code Standards](#code-standards)
- [Commit Guidelines](#commit-guidelines)
- [Pull Request Process](#pull-request-process)
- [Testing Requirements](#testing-requirements)

## 🚀 Getting Started

### Prerequisites

- **Node.js** 18.20 and npm
- **Python** 3.8+ (for NLP service)
- **PostgreSQL** (for backend database)
- **Git** for version control
- **Firebase Account** (API key from team lead)

### First-Time Setup

1. **Clone the repository**
   ```powershell
   git clone https://github.com/Rathish002/SE-project.git
   cd SE-project
   ```

2. **Run automated setup**
   ```powershell
   .\setup-team-member.ps1
   ```
   
3. **Get your Firebase API key** from the team lead and paste it when prompted

4. **Start development**
   ```powershell
   .\start-dev.ps1
   ```

### Project Structure

```
SE-project/
├── frontend/          # React TypeScript application
├── server/            # Express TypeScript backend
├── nlp-service/       # Python FastAPI NLP service
└── sql/              # Database schemas
```

## 💻 Development Workflow

### Running Services Individually

**Frontend (React):**
```powershell
cd frontend
npm start
# Runs on http://localhost:3000
```

**Backend Server:**
```powershell
cd server
npm run dev
# Runs on http://localhost:5000
```

**NLP Service (Python):**
```powershell
cd nlp-service
pip install -r requirements.txt
uvicorn app:app --reload
# Runs on http://localhost:8000
```

### Database Setup

```powershell
# Connect to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE se_project;

# Run schema
\i server/sql/schema.sql
```

## 🌿 Branch Strategy

We follow a feature-branch workflow:

### Branch Naming Convention

- `feature/<feature-name>` - New features
- `bug/<bug-name>` - Bug fixes
- `docs/<doc-name>` - Documentation updates
- `refactor/<refactor-name>` - Code refactoring

### Examples from Recent Work

Based on our commit history:
- `feature-exercises` - Exercise page implementation
- `feature-NLP` - NLP service enhancements
- `bug-NLP` - NLP bug fixes
- `collaboration-groupchat` - Group chat features
- `collaboration-groupchat-accessibility` - Accessibility features
- `collaboration-groupchat-message-translation` - Message translation
- `collaboration-groupchat-blocking-ui` - User blocking UI
- `collaboration-groupchat-message-state` - Message state indicators

### Workflow Steps

1. **Create a feature branch**
   ```powershell
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes and commit**
   ```powershell
   git add .
   git commit -m "feat: add your feature description"
   ```

3. **Keep your branch updated**
   ```powershell
   git fetch origin
   git rebase origin/main
   ```

4. **Push your branch**
   ```powershell
   git push origin feature/your-feature-name
   ```

5. **Create a Pull Request** on GitHub

## 📝 Code Standards

### TypeScript/JavaScript (Frontend & Server)

- Use **TypeScript** for type safety
- Follow **React Hooks** patterns
- Use **functional components**
- Follow **ESLint** rules
- Use **async/await** over promises

**Example:**
```typescript
// Good
const fetchUserData = async (userId: string): Promise<User> => {
  const response = await fetch(`/api/users/${userId}`);
  return response.json();
};

// Bad
const fetchUserData = (userId) => {
  return fetch('/api/users/' + userId).then(r => r.json());
};
```

### Python (NLP Service)

- Follow **PEP 8** style guide
- Use **type hints**
- Document functions with docstrings
- Use **async** for I/O operations

**Example:**
```python
# Good
async def process_text(text: str) -> Dict[str, Any]:
    """
    Process input text with NLP models.
    
    Args:
        text: Input text to process
        
    Returns:
        Processed text data with embeddings
    """
    result = await nlp_model.process(text)
    return result
```

### Component Structure

Follow our established patterns:

```typescript
// Component structure
import React, { useState, useEffect } from 'react';
import './ComponentName.css';

interface ComponentProps {
  // Props with types
}

export const ComponentName: React.FC<ComponentProps> = ({ prop }) => {
  // State
  const [state, setState] = useState<Type>(initialValue);
  
  // Effects
  useEffect(() => {
    // Side effects
  }, [dependencies]);
  
  // Handlers
  const handleAction = () => {
    // Logic
  };
  
  return (
    <div className="component-name">
      {/* JSX */}
    </div>
  );
};
```

## 📋 Commit Guidelines

We use **Conventional Commits** format:

### Commit Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types

- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation changes
- `style:` - Code style changes (formatting)
- `refactor:` - Code refactoring
- `test:` - Adding or updating tests
- `chore:` - Maintenance tasks
- `perf:` - Performance improvements
- `security:` - Security fixes

### Real Examples from Our Project

```bash
feat: add accessibility - Enter to send, Shift+Enter newline, ARIA labels
feat: add message translation - auto-translate based on UI language
feat: add blocking UI - block/unblock in chat header
feat: add message states (sending/sent/failed) with visual indicators
fix: resolve merge conflicts and improve chat UI
fix: keep add members panel open and filter added members from list
docs: add instructions for existing team members
security: remove exposed credentials and add team setup automation
```

### Scope Examples

- `chat` - Chat UI components
- `auth` - Authentication
- `exercises` - Exercise features
- `nlp` - NLP service
- `db` - Database
- `accessibility` - Accessibility features

## 🔄 Pull Request Process

### Before Creating a PR

1. **Run tests**
   ```powershell
   # Frontend
   cd frontend
   npm test
   
   # Server
   cd server
   npm test
   ```

2. **Run security validation**
   ```powershell
   .\validate-security.ps1
   ```

3. **Check for linting errors**
   ```powershell
   npm run lint
   ```

### PR Title Format

Use the same format as commits:
```
feat: Add user profile management
fix: Resolve chat message ordering issue
```

### PR Description Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Related Issues
Fixes #123

## Testing
- [ ] Unit tests added/updated
- [ ] Manual testing completed
- [ ] Accessibility tested

## Screenshots (if applicable)
[Add screenshots]

## Checklist
- [ ] Code follows project style guidelines
- [ ] Self-review completed
- [ ] Comments added for complex code
- [ ] Documentation updated
- [ ] No new warnings
- [ ] Tests pass locally
```

### Review Process

1. At least **1 reviewer** must approve
2. All **tests must pass**
3. No **merge conflicts**
4. **Security scan** passes
5. Team lead **final approval** for main branch

## 🧪 Testing Requirements

### Frontend Tests

```typescript
// Component test example
import { render, screen, fireEvent } from '@testing-library/react';
import { ChatUI } from './ChatUI';

describe('ChatUI', () => {
  it('should send message on Enter key', () => {
    render(<ChatUI />);
    const input = screen.getByRole('textbox');
    
    fireEvent.change(input, { target: { value: 'Hello' } });
    fireEvent.keyDown(input, { key: 'Enter' });
    
    expect(screen.getByText('Hello')).toBeInTheDocument();
  });
});
```

### Backend Tests

```typescript
// API test example
import request from 'supertest';
import app from '../app';

describe('POST /api/messages', () => {
  it('should create a new message', async () => {
    const response = await request(app)
      .post('/api/messages')
      .send({ content: 'Test message', userId: '123' })
      .expect(201);
      
    expect(response.body).toHaveProperty('id');
  });
});
```

### Test Coverage

- Aim for **80%+ code coverage**
- All **new features** must have tests
- **Bug fixes** should include regression tests

## 🎨 UI/UX Guidelines

### Accessibility First

Our project focuses on specially-abled learners, so accessibility is critical:

- ✅ **Keyboard navigation** must work everywhere
- ✅ **ARIA labels** for screen readers
- ✅ **High contrast** mode support
- ✅ **Text-to-speech** integration
- ✅ **Font size** adjustments
- ✅ **Focus indicators** visible

### Key Accessibility Features

Based on our codebase:

1. **Keyboard Shortcuts**
   - Enter: Send message
   - Shift+Enter: New line
   - Esc: Close dialogs

2. **Screen Reader Support**
   - All buttons have labels
   - Status updates announced
   - Form validation messages

3. **Visual Accessibility**
   - Color contrast ratios meet WCAG AA
   - Font sizes adjustable
   - High contrast themes

## 🔒 Security Best Practices

1. **Never commit sensitive data**
   - API keys
   - Passwords
   - Database credentials

2. **Use environment variables**
   ```typescript
   // Good
   const apiKey = process.env.REACT_APP_FIREBASE_API_KEY;
   
   // Bad
   const apiKey = "AIzaSyC...";
   ```

3. **Run security validation**
   ```powershell
   .\validate-security.ps1
   ```

4. **Follow Firebase Security Rules**
   - Check `frontend/FIRESTORE_RULES.md`
   - Review `frontend/STORAGE_RULES.md`

## 📚 Additional Resources

- [React Documentation](https://react.dev/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Firebase Documentation](https://firebase.google.com/docs)
- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [Web Accessibility Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)

## 🤝 Getting Help

- **Questions?** Open a GitHub Discussion
- **Found a bug?** Create an issue with the `bug` label
- **Need features?** Create an issue with the `enhancement` label
- **Security concerns?** Email the team lead directly

## 🎯 Focus Areas for New Contributors

Based on our recent work, here are good starting points:

### Frontend
- Accessibility improvements
- UI/UX enhancements
- Internationalization (i18n)
- Component testing

### Backend
- API endpoints
- Database optimization
- Integration tests
- Error handling

### NLP Service
- Model improvements
- Translation accuracy
- Performance optimization

### Documentation
- Code comments
- API documentation
- User guides
- Tutorial videos

## 📊 Project Metrics

Current state based on structure:
- **Frontend Components:** 30+
- **Backend Routes:** Multiple API endpoints
- **Languages Supported:** English, Hindi (more coming)
- **Accessibility Features:** Keyboard nav, TTS, adjustable fonts

## 🌟 Recognition

Contributors are recognized in:
- GitHub contributors page
- Project README
- Release notes

Thank you for contributing to making learning accessible for everyone! 🎉
