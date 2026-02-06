-- ==========================================
-- SE Project Database Schema (FINAL)
-- Matches your current PostgreSQL tables
-- ==========================================

-- ✅ 1) lessons
CREATE TABLE IF NOT EXISTS lessons (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  language_code VARCHAR(10) NOT NULL,
  text_content TEXT NOT NULL,
  audio_url TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  english_text_content TEXT,
  english_audio_url TEXT
);

-- ✅ 2) lesson_keywords
-- NOTE: column name is "expanation" (typo) because your DB currently has it
CREATE TABLE IF NOT EXISTS lesson_keywords (
  id SERIAL PRIMARY KEY,
  lesson_id INT REFERENCES lessons(id) ON DELETE CASCADE,
  keyword TEXT NOT NULL,
  expanation TEXT
);

-- ✅ 3) exercises
CREATE TABLE IF NOT EXISTS exercises (
  id SERIAL PRIMARY KEY,
  lesson_id INT REFERENCES lessons(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  instructions_text TEXT NOT NULL,
  instructions_audio_url TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ✅ 4) exercise_steps
CREATE TABLE IF NOT EXISTS exercise_steps (
  id SERIAL PRIMARY KEY,
  exercise_id INT REFERENCES exercises(id) ON DELETE CASCADE,
  step_number INT NOT NULL,
  prompt TEXT NOT NULL,
  expected_answer TEXT,
  hint_1 TEXT,
  hint_2 TEXT,
  hint_3 TEXT
);

-- ✅ 5) exercise_progress
CREATE TABLE IF NOT EXISTS exercise_progress (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL,
  exercise_id INT REFERENCES exercises(id) ON DELETE CASCADE,
  UNIQUE(user_id, exercise_id)
);

-- ✅ 6) evaluation_rules
CREATE TABLE IF NOT EXISTS evaluation_rules (
  id SERIAL PRIMARY KEY,
  lesson_id INT REFERENCES lessons(id) ON DELETE CASCADE,
  keyword TEXT NOT NULL,
  weight DOUBLE PRECISION NOT NULL DEFAULT 1.0
);

/* 
"create db":
psql -U postgres
CREATE DATABASE se_project_db;
\q

"run schema file":
psql -U postgres -d se_project_db -f server/sql/schema.sql

"check creation of tables":
psql -U postgres -d se_project_db
\dt

*/
