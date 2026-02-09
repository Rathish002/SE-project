import { Router, Request, Response } from "express";
import pool from "../db";

const router = Router();

/* ======================================================
   POST /exercise/answer
   Validate answer & store response (SAFE)
   ====================================================== */
router.post("/answer", async (req: Request, res: Response) => {
  const { userId, stepId, selectedOptionId } = req.body;

  if (!userId || !stepId || !selectedOptionId) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    // 1. Validate option belongs to step
    const optionCheck = await client.query(
      `
      SELECT s.correct_option_id
      FROM exercise_steps s
      JOIN exercise_step_options o ON o.step_id = s.id
      WHERE s.id = $1 AND o.id = $2
      `,
      [stepId, selectedOptionId]
    );

    if (optionCheck.rows.length === 0) {
      await client.query("ROLLBACK");
      return res.status(400).json({ message: "Invalid option for this step" });
    }

    const isCorrect =
      optionCheck.rows[0].correct_option_id === selectedOptionId;

    // 2. Prevent duplicate answers
    await client.query(
      `
      DELETE FROM exercise_answers
      WHERE user_id = $1 AND step_id = $2
      `,
      [userId, stepId]
    );

    // 3. Store answer
    await client.query(
      `
      INSERT INTO exercise_answers
      (user_id, step_id, selected_option_id, is_correct)
      VALUES ($1, $2, $3, $4)
      `,
      [userId, stepId, selectedOptionId, isCorrect]
    );

    await client.query("COMMIT");

    res.json({
      correct: isCorrect,
      feedback: isCorrect ? "Great job! 🎉" : "Try again 💡"
    });
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("Answer error:", err);
    res.status(500).json({ error: "Answer validation failed" });
  } finally {
    client.release();
  }
});

/* ======================================================
   POST /exercise/progress
   Save guided progress
   ====================================================== */
router.post("/progress", async (req: Request, res: Response) => {
  const { userId, exerciseId, currentStep, completedSteps, isCompleted } =
    req.body;

  if (!userId || !exerciseId) {
    return res.status(400).json({ message: "Missing userId or exerciseId" });
  }

  try {
    const result = await pool.query(
      `
      INSERT INTO exercise_progress
      (user_id, exercise_id, current_step, completed_steps, is_completed)
      VALUES ($1, $2, $3, $4, $5)
      ON CONFLICT (user_id, exercise_id)
      DO UPDATE SET
        current_step = EXCLUDED.current_step,
        completed_steps = EXCLUDED.completed_steps,
        is_completed = EXCLUDED.is_completed,
        updated_at = CURRENT_TIMESTAMP
      RETURNING *;
      `,
      [
        userId,
        exerciseId,
        currentStep ?? 1,
        completedSteps ?? 0,
        isCompleted ?? false
      ]
    );

    res.json({
      message: "Progress saved",
      progress: result.rows[0]
    });
  } catch (err) {
    console.error("Progress error:", err);
    res.status(500).json({ error: "Failed to save progress" });
  }
});

/* ======================================================
   GET /exercise/:id
   Fetch exercise with steps + options
   ====================================================== */
router.get("/:id", async (req: Request, res: Response) => {
  const exerciseId = Number(req.params.id);

  if (isNaN(exerciseId)) {
    return res.status(400).json({ message: "Invalid exercise id" });
  }

  try {
    const exercise = await pool.query(
      "SELECT * FROM exercises WHERE id = $1",
      [exerciseId]
    );

    if (exercise.rows.length === 0) {
      return res.status(404).json({ message: "Exercise not found" });
    }

    const steps = await pool.query(
      `
      SELECT 
        s.id AS step_id,
        s.step_number,
        s.prompt,
        s.prompt_audio_url,
        s.hint_1,
        s.hint_2,
        s.hint_3,
        json_agg(
          json_build_object(
            'id', o.id,
            'text', o.option_text,
            'audio', o.option_audio_url,
            'order', o.option_order
          )
          ORDER BY o.option_order
        ) AS options
      FROM exercise_steps s
      JOIN exercise_step_options o ON o.step_id = s.id
      WHERE s.exercise_id = $1
      GROUP BY s.id
      ORDER BY s.step_number;
      `,
      [exerciseId]
    );

    res.json({
      exercise: exercise.rows[0],
      steps: steps.rows
    });
  } catch (err) {
    console.error("Exercise fetch error:", err);
    res.status(500).json({ error: "Failed to fetch exercise" });
  }
});

export default router;
