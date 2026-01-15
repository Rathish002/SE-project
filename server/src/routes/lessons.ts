import express from "express"
import pool from "../db"
import { Router } from "express";
const router = Router();

router.get("/:id", async (req, res) => {
  const lessonId = req.params.id;

  try {
    const lessonResult = await pool.query(
      "SELECT * FROM lessons WHERE id = $1",
      [lessonId]
    );

    if (lessonResult.rows.length === 0) {
      return res.status(404).json({ message: "Lesson not found" });
    }

    const keywordsResult = await pool.query(
      "SELECT keyword, explanation FROM lesson_keywords WHERE lesson_id = $1",
      [lessonId]
    );

    res.json({
      lesson: lessonResult.rows[0],
      keywords: keywordsResult.rows
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch lesson" });
  }
});

export default router;