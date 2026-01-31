import { Router, Request, Response } from "express";
import pool from "../db";

const router = Router();

router.post("/evaluate-text", async (req: Request, res: Response) => {
  const { lessonId, answer } = req.body;

  if (!lessonId || !answer) {
    return res.status(400).json({ message: "Invalid input" });
  }

  try {
    const keywordsResult = await pool.query(
      "SELECT keyword FROM lesson_keywords WHERE lesson_id = $1",
      [lessonId]
    );

    const keywords: string[] = keywordsResult.rows.map(
      (r: { keyword: string }) => r.keyword.toLowerCase()
    );

    const normalized = answer.toLowerCase();

    const matched = keywords.filter(k => normalized.includes(k));
    const score = keywords.length === 0 ? 0 : matched.length / keywords.length;

    res.json({
      score,
      matchedConcepts: matched,
      missingConcepts: keywords.filter(k => !matched.includes(k)),
      feedback:
        score > 0.7
          ? "Good understanding of key concepts."
          : "Partial understanding. Review highlighted terms.",
    });
  } catch (err) {
    console.error("Evaluation error:", err);
    res.status(500).json({ error: "Evaluation failed" });
  }
});

export default router;
