import pool from '../db';

/**
 * Compute an adaptive semantic-similarity threshold based on a user's
 * recent evaluation performance for a given lesson.
 *
 * Thresholds:
 *   avg > 0.80 → 0.75  (user is doing well → stricter grading)
 *   avg 0.50–0.80 → 0.60  (average → balanced)
 *   avg < 0.50 → 0.45  (struggling → more lenient)
 *
 * Falls back to 0.60 if no prior scores exist.
 */
export async function getAdaptiveThreshold(
    userId: string,
    lessonId: number
): Promise<number> {
    try {
        const result = await pool.query(
            `SELECT final_score
       FROM user_evaluation_progress
       WHERE user_id = $1 AND lesson_id = $2
       ORDER BY evaluated_at DESC
       LIMIT 5`,
            [userId, lessonId]
        );

        if (result.rows.length === 0) {
            return 0.60; // no history → balanced default
        }

        const scores: number[] = result.rows.map((r: { final_score: number }) => r.final_score);
        const avg = scores.reduce((a, b) => a + b, 0) / scores.length;

        if (avg > 0.80) return 0.75;   // performing well → strict
        if (avg >= 0.50) return 0.60;  // average → balanced
        return 0.45;                    // struggling → lenient
    } catch (err) {
        console.error('Error fetching adaptive threshold:', err);
        return 0.60; // safe fallback
    }
}

/**
 * Save an evaluation result to user_evaluation_progress.
 */
export async function saveEvaluationProgress(
    userId: string,
    lessonId: number,
    evaluationIntentId: number,
    finalScore: number
): Promise<void> {
    try {
        await pool.query(
            `INSERT INTO user_evaluation_progress
         (user_id, lesson_id, evaluation_intent_id, final_score)
       VALUES ($1, $2, $3, $4)`,
            [userId, lessonId, evaluationIntentId, finalScore]
        );
    } catch (err) {
        console.error('Error saving evaluation progress:', err);
        // Non-fatal: don't throw — the evaluation result still gets returned
    }
}

/**
 * Map a threshold value to a human-readable difficulty label for the UI.
 */
export function thresholdToLabel(threshold: number): string {
    if (threshold >= 0.75) return 'Challenging';
    if (threshold >= 0.60) return 'Balanced';
    return 'Supportive';
}
