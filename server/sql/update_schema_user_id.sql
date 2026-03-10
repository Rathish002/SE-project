-- Migration to change user_id from INT to TEXT to support Firebase UIDs

-- 1. Alter exercise_progress
ALTER TABLE exercise_progress 
  ALTER COLUMN user_id TYPE TEXT;

-- 2. Alter exercise_answers
ALTER TABLE exercise_answers 
  ALTER COLUMN user_id TYPE TEXT;

-- 3. If there were any foreign keys to a 'users' table (which doesn't exist yet in schema.sql), we would need to handle them.
-- Since there are no 'users' table in schema.sql, we are good.
