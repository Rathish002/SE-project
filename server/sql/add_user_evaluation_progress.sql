-- Migration: Add user_evaluation_progress table for adaptive evaluation strictness
-- Run: psql -U postgres -d se_project_db -f server/sql/add_user_evaluation_progress.sql

CREATE TABLE IF NOT EXISTS user_evaluation_progress (
  id SERIAL PRIMARY KEY,
  user_id TEXT NOT NULL,
  lesson_id INT NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
  evaluation_intent_id INT NOT NULL REFERENCES evaluation_intents(id) ON DELETE CASCADE,
  final_score DOUBLE PRECISION NOT NULL,
  evaluated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Index for fast lookup of user's recent scores per lesson
CREATE INDEX IF NOT EXISTS idx_user_eval_progress_user_lesson
  ON user_evaluation_progress(user_id, lesson_id, evaluated_at DESC);
