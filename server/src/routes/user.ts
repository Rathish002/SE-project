import express, { Request, Response } from "express";
import pool from "../db";

const router = express.Router();

/**
 * GET /user/:userId/stats
 * Fetches "Lessons Started" and "Lessons Completed" for a specific user.
 */
router.get("/:userId/stats", async (req: Request, res: Response): Promise<any> => {
    const { userId } = req.params;

    if (!userId) {
        return res.status(400).json({ error: "User ID is required" });
    }

    try {
        // 1. Lessons Started: 
        // Count distinct lesson_ids that have any entry in exercise_progress OR user_evaluation_progress
        const startedQuery = `
      SELECT COUNT(DISTINCT lesson_id) as count FROM (
        SELECT e.lesson_id 
        FROM exercise_progress ep
        JOIN exercises e ON ep.exercise_id = e.id
        WHERE ep.user_id = $1
        UNION
        SELECT lesson_id 
        FROM user_evaluation_progress
        WHERE user_id = $1
      ) as started_lessons
    `;

        // 2. Lessons Completed:
        // A lesson is considered completed if:
        // - At least one exercise for that lesson is marked as is_completed = TRUE
        // - OR there is an evaluation score >= 0.8
        const completedQuery = `
      SELECT COUNT(DISTINCT lesson_id) as count FROM (
        SELECT e.lesson_id 
        FROM exercise_progress ep
        JOIN exercises e ON ep.exercise_id = e.id
        WHERE ep.user_id = $1 AND ep.is_completed = TRUE
        UNION
        SELECT lesson_id 
        FROM user_evaluation_progress
        WHERE user_id = $1 AND final_score >= 0.8
      ) as completed_lessons
    `;

        const [startedRes, completedRes] = await Promise.all([
            pool.query(startedQuery, [userId]),
            pool.query(completedQuery, [userId])
        ]);

        res.json({
            lessonsStarted: parseInt(startedRes.rows[0].count || "0"),
            lessonsCompleted: parseInt(completedRes.rows[0].count || "0")
        });

    } catch (err) {
        console.error("Error fetching user stats:", err);
        res.status(500).json({ error: "Failed to fetch user stats" });
    }
});

/**
 * GET /user/:userId/completed-lessons
 * Returns a list of lesson IDs that the user has completed.
 */
router.get("/:userId/completed-lessons", async (req: Request, res: Response): Promise<any> => {
    const { userId } = req.params;

    try {
        const query = `
      SELECT DISTINCT lesson_id FROM (
        SELECT e.lesson_id 
        FROM exercise_progress ep
        JOIN exercises e ON ep.exercise_id = e.id
        WHERE ep.user_id = $1 AND ep.is_completed = TRUE
        UNION
        SELECT lesson_id 
        FROM user_evaluation_progress
        WHERE user_id = $1 AND final_score >= 0.8
      ) as completed_lessons
    `;

        const result = await pool.query(query, [userId]);
        const lessonIds = result.rows.map(r => r.lesson_id);

        res.json({ completedLessonIds: lessonIds });

    } catch (err) {
        console.error("Error fetching completed lessons:", err);
        res.status(500).json({ error: "Failed to fetch completed lessons" });
    }
});

export default router;
