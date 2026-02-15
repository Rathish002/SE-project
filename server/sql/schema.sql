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
  prompt_audio_url TEXT,

  correct_option_id INT, -- FK added later

  hint_1 TEXT,
  hint_2 TEXT,
  hint_3 TEXT
);


-- ✅ 5) exercise_progress
CREATE TABLE IF NOT EXISTS exercise_progress (
  id SERIAL PRIMARY KEY,
  user_id TEXT NOT NULL,
  exercise_id INT REFERENCES exercises(id) ON DELETE CASCADE,

  current_step INT DEFAULT 1,
  completed_steps INT DEFAULT 0,
  is_completed BOOLEAN DEFAULT FALSE,

  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  UNIQUE(user_id, exercise_id)
);

-- 6) exercise_step_options
CREATE TABLE IF NOT EXISTS exercise_step_options (
  id SERIAL PRIMARY KEY,
  step_id INT REFERENCES exercise_steps(id) ON DELETE CASCADE,
  option_text TEXT NOT NULL,
  option_audio_url TEXT,
  option_order INT NOT NULL
);

-- 7) exercise_answers
CREATE TABLE IF NOT EXISTS exercise_answers (
  id SERIAL PRIMARY KEY,
  user_id TEXT NOT NULL,
  step_id INT REFERENCES exercise_steps(id) ON DELETE CASCADE,
  selected_option_id INT REFERENCES exercise_step_options(id),
  is_correct BOOLEAN,
  answered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


-- ✅ 7) evaluation_intents
-- Questions and reference answers for lesson evaluation
CREATE TABLE IF NOT EXISTS evaluation_intents (
  id SERIAL PRIMARY KEY,
  lesson_id INT NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
  question TEXT NOT NULL,
  reference_answer TEXT NOT NULL
);

-- ✅ 6) evaluation_rules
CREATE TABLE IF NOT EXISTS evaluation_rules (
  id SERIAL PRIMARY KEY,
  lesson_id INT NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
  keyword TEXT NOT NULL,
  weight DOUBLE PRECISION NOT NULL,
  evaluation_intent_id INT NOT NULL REFERENCES evaluation_intents(id) ON DELETE CASCADE
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
