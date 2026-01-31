import { Router, Request, Response } from "express";
import pool from "../db";

const router = Router();

// GET /exercise/:id
router.get("/:id", async (req: Request, res: Response) => {
  const exerciseId = Number(req.params.id);

  if (isNaN(exerciseId)) {
    return res.status(400).json({ message: "Invalid exercise id" });
  }

  try {
    const exerciseResult = await pool.query(
      "SELECT * FROM exercises WHERE id = $1",
      [exerciseId]
    );

    if (exerciseResult.rows.length === 0) {
      return res.status(404).json({ message: "Exercise not found" });
    }

    const stepsResult = await pool.query(
      `SELECT step_number, prompt, hint_1, hint_2, hint_3
       FROM exercise_steps
       WHERE exercise_id = $1
       ORDER BY step_number ASC`,
      [exerciseId]
    );

    res.json({
      exercise: exerciseResult.rows[0],
      steps: stepsResult.rows
    });
  } catch (err) {
    console.error("Exercise fetch error:", err);
    res.status(500).json({ error: "Failed to fetch exercise" });
  }
});

// POST /exercise/progress
router.post("/progress", async (req: Request, res: Response) => {
  const { userId, exerciseId, currentStep, completedSteps, isCompleted } =
    req.body;

  if (!userId || !exerciseId) {
    return res.status(400).json({ message: "Missing userId or exerciseId" });
  }

  try {
    const upsertResult = await pool.query(
      `
      INSERT INTO exercise_progress (user_id, exercise_id, current_step, completed_steps, is_completed)
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
      progress: upsertResult.rows[0],
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    console.error("Progress save error:", err);
    res.status(500).json({ error: "Failed to save progress" });
  }
});

export default router;
