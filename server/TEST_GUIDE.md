# Server Testing Guide

## Prerequisites

### 1. Set up Environment Variables
Create a `.env` file in the `server/` directory:

```bash
DATABASE_URL=postgresql://username:password@localhost:5432/your_database
FRONTEND_URL=http://localhost:3000
NODE_ENV=development
```

**Getting your DATABASE_URL:**
- PostgreSQL connection format: `postgresql://user:password@host:port/database`
- Example: `postgresql://postgres:mypassword@localhost:5432/se_project`

### 2. Ensure PostgreSQL is Running
Make sure your PostgreSQL server is running and accessible.

### 3. Database Schema
Create these tables in your PostgreSQL database:

```sql
-- Lessons table
CREATE TABLE lessons (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  content TEXT,
  difficulty_level VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Lesson keywords
CREATE TABLE lesson_keywords (
  id SERIAL PRIMARY KEY,
  lesson_id INT REFERENCES lessons(id),
  keyword VARCHAR(255) NOT NULL,
  explanation TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Exercises table
CREATE TABLE exercises (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  difficulty_level VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Exercise steps
CREATE TABLE exercise_steps (
  id SERIAL PRIMARY KEY,
  exercise_id INT REFERENCES exercises(id),
  step_number INT NOT NULL,
  prompt TEXT,
  hint_1 TEXT,
  hint_2 TEXT,
  hint_3 TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Exercise progress
CREATE TABLE exercise_progress (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL,
  exercise_id INT REFERENCES exercises(id),
  current_step INT DEFAULT 1,
  completed_steps INT DEFAULT 0,
  is_completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, exercise_id)
);
```

## Running the Server

### Option 1: Development Mode (with auto-reload)
```bash
cd server
npm run dev
```
Server will start on `http://localhost:3000`

### Option 2: Production Build
```bash
cd server
npm run build
npm start
```

## Testing Endpoints

### 1. Health Check
```bash
curl http://localhost:3000/
```
Expected: `Server running`

### 2. Database Connection Test
```bash
curl http://localhost:3000/db-test
```
Expected: `{ "now": "2026-02-01T..." }`

### 3. Insert Test Data (SQL)
```sql
-- Insert a lesson
INSERT INTO lessons (title, content, difficulty_level)
VALUES ('Introduction to Variables', 'Learn about variables...', 'beginner');

-- Insert keywords
INSERT INTO lesson_keywords (lesson_id, keyword, explanation)
VALUES (1, 'variable', 'A named storage for data values');

INSERT INTO lesson_keywords (lesson_id, keyword, explanation)
VALUES (1, 'declaration', 'Creating a variable');

-- Insert an exercise
INSERT INTO exercises (title, description, difficulty_level)
VALUES ('Variable Exercise 1', 'Practice declaring variables', 'beginner');

-- Insert exercise steps
INSERT INTO exercise_steps (exercise_id, step_number, prompt, hint_1, hint_2, hint_3)
VALUES (1, 1, 'Declare a variable named x', 'Use the var keyword', 'Type: var x', 'Complete: var x = 5;');

INSERT INTO exercise_steps (exercise_id, step_number, prompt, hint_1, hint_2, hint_3)
VALUES (1, 2, 'Assign value 10', 'Use = operator', 'Type: x = 10', 'Complete: x = 10;');
```

### 4. Test Lesson Endpoint
```bash
curl http://localhost:3000/lesson/1
```
Expected response:
```json
{
  "lesson": {
    "id": 1,
    "title": "Introduction to Variables",
    "content": "Learn about variables...",
    "difficulty_level": "beginner",
    "created_at": "2026-02-01T..."
  },
  "keywords": [
    {
      "keyword": "variable",
      "explanation": "A named storage for data values"
    },
    {
      "keyword": "declaration",
      "explanation": "Creating a variable"
    }
  ]
}
```

### 5. Test Evaluation Endpoint
```bash
curl -X POST http://localhost:3000/evaluation/evaluate-text \
  -H "Content-Type: application/json" \
  -d '{"lessonId": 1, "answer": "A variable is a named storage for data values and declaration means creating one"}'
```
Expected response:
```json
{
  "score": 1,
  "matchedConcepts": ["variable", "declaration"],
  "missingConcepts": [],
  "feedback": "Good understanding of key concepts."
}
```

### 6. Test Exercise Endpoint
```bash
curl http://localhost:3000/exercise/1
```
Expected response:
```json
{
  "exercise": {
    "id": 1,
    "title": "Variable Exercise 1",
    "description": "Practice declaring variables",
    "difficulty_level": "beginner"
  },
  "steps": [
    {
      "step_number": 1,
      "prompt": "Declare a variable named x",
      "hint_1": "Use the var keyword",
      "hint_2": "Type: var x",
      "hint_3": "Complete: var x = 5;"
    },
    {
      "step_number": 2,
      "prompt": "Assign value 10",
      "hint_1": "Use = operator",
      "hint_2": "Type: x = 10",
      "hint_3": "Complete: x = 10;"
    }
  ]
}
```

### 7. Test Exercise Progress Endpoint
```bash
curl -X POST http://localhost:3000/exercise/progress \
  -H "Content-Type: application/json" \
  -d '{"userId": "user123", "exerciseId": 1, "currentStep": 2, "completedSteps": 1, "isCompleted": false}'
```
Expected response:
```json
{
  "message": "Progress saved",
  "progress": {
    "id": 1,
    "user_id": "user123",
    "exercise_id": 1,
    "current_step": 2,
    "completed_steps": 1,
    "is_completed": false,
    "created_at": "2026-02-01T...",
    "updated_at": "2026-02-01T..."
  },
  "timestamp": "2026-02-01T..."
}
```

### 8. Test Translations Endpoint
```bash
curl http://localhost:3000/translations/en
```
Expected response: English translations object

```bash
curl http://localhost:3000/translations/hi
```
Expected response: Hindi translations object

## Using Postman or VS Code REST Client

### For VS Code REST Client Extension
Create `test.http` file:

```http
### Health Check
GET http://localhost:3000/

### DB Test
GET http://localhost:3000/db-test

### Get Lesson
GET http://localhost:3000/lesson/1

### Evaluate Text
POST http://localhost:3000/evaluation/evaluate-text
Content-Type: application/json

{
  "lessonId": 1,
  "answer": "A variable is a named storage for data values"
}

### Get Exercise
GET http://localhost:3000/exercise/1

### Save Progress
POST http://localhost:3000/exercise/progress
Content-Type: application/json

{
  "userId": "user123",
  "exerciseId": 1,
  "currentStep": 2,
  "completedSteps": 1,
  "isCompleted": false
}

### Get English Translations
GET http://localhost:3000/translations/en

### Get Hindi Translations
GET http://localhost:3000/translations/hi
```

## Troubleshooting

### Error: "DATABASE_URL is not set"
- Create `.env` file with DATABASE_URL

### Error: "Cannot connect to database"
- Check PostgreSQL is running
- Verify DATABASE_URL is correct
- Check database credentials

### Error: "relation does not exist"
- Create the database tables (run SQL schema above)

### Port 3000 already in use
- Kill the process: `lsof -ti:3000 | xargs kill -9`
- Or use different port in code

### TypeScript errors after fixing
- Run `npm run build` to verify
- All errors should be resolved

## Expected Compilation Output
```
npm run build
> server@1.0.0 build
> tsc

(No errors - clean compilation)
```
