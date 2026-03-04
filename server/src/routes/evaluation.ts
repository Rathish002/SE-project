import { Router, Request, Response } from "express";
import axios from "axios";
import pool from "../db";

const router = Router();
const NLP_SERVICE_URL = "http://localhost:8000/semantic-similarity";

/**
 * ============================================================
 * EXISTING WORKING FLOW (DO NOT REMOVE / DO NOT CHANGE)
 * Lesson-level hybrid evaluation (diagnostic style)
 * ============================================================

router.post("/evaluate-hybrid", async (req: Request, res: Response) => {
  const { lessonId, answer } = req.body;

  if (!lessonId || !answer) {
    return res.status(400).json({ message: "Invalid input" });
  }

  try {
    // 1️⃣ Fetch ALL reference answers (paraphrase set)
    const intentResult = await pool.query(
      "SELECT reference_answer FROM evaluation_intents WHERE lesson_id = $1",
      [lessonId]
    );

    if (intentResult.rows.length === 0) {
      return res.status(404).json({ message: "No evaluation intents found" });
    }

    const referenceAnswers: string[] = intentResult.rows.map(
      (r: { reference_answer: string }) => r.reference_answer
    );

    // 2️⃣ Call NLP service ONCE with correct structure
    const nlpResponse = await axios.post(NLP_SERVICE_URL, {
      reference_answers: referenceAnswers,
      user_answer: answer
    });

    // 🔍 DEBUG: see exactly what NLP service returns
    console.log("NLP SERVICE RESPONSE:", nlpResponse.data);

    const semanticScore: number = nlpResponse.data.similarity;

    // 3️⃣ Keyword-based scoring (concept coverage)
    const keywordsResult = await pool.query(
      "SELECT keyword, weight FROM evaluation_rules WHERE lesson_id = $1",
      [lessonId]
    );

    let keywordScore = 0;
    let totalWeight = 0;
    const matchedKeywords: string[] = [];

    for (const row of keywordsResult.rows) {
      totalWeight += row.weight;

      if (answer.toLowerCase().includes(row.keyword.toLowerCase())) {
        keywordScore += row.weight;
        matchedKeywords.push(row.keyword);
      }
    }

    const normalizedKeywordScore =
      totalWeight === 0 ? 0 : keywordScore / totalWeight;

    // 4️⃣ Hybrid scoring formula
    const finalScore =
      0.7 * semanticScore + 0.3 * normalizedKeywordScore;

    // 5️⃣ Feedback
    let feedback = "Needs improvement.";
    if (finalScore >= 0.8) feedback = "Excellent understanding!";
    else if (finalScore >= 0.6) feedback = "Good understanding.";

    res.json({
      semanticScore,
      keywordScore: normalizedKeywordScore,
      finalScore,
      matchedKeywords,
      feedback
    });

  } catch (err) {
    console.error("Hybrid evaluation error:", err);
    res.status(500).json({ error: "Hybrid evaluation failed" });
  }
});
 */

/**
 * ============================================================
 * NEW FLOW (ADDED)
 * Sequential, question-by-question evaluation
 * ============================================================
 */

/**
 * Fetch evaluation questions for a lesson (ordered)
 */
router.get(
  "/lesson/:lessonId/questions",
  async (req: Request, res: Response) => {
    const { lessonId } = req.params;

    try {
      const result = await pool.query(
        `
        SELECT id, question
        FROM evaluation_intents
        WHERE lesson_id = $1
        ORDER BY id
        `,
        [lessonId]
      );

      res.json(result.rows);
    } catch (err) {
      console.error("Fetch questions error:", err);
      res.status(500).json({ error: "Failed to fetch evaluation questions" });
    }
  }
);

/**
 * Evaluate ONE answer for ONE question (intent-level)
 */
router.post(
  "/evaluate-intent",
  async (req: Request, res: Response) => {
    const { lessonId, evaluationIntentId, answer } = req.body;

    if (!lessonId || !evaluationIntentId || !answer) {
      return res.status(400).json({ message: "Invalid input" });
    }

    try {
      // 1️⃣ Fetch reference answer for this specific question
      const intentResult = await pool.query(
        `
        SELECT reference_answer
        FROM evaluation_intents
        WHERE id = $1 AND lesson_id = $2
        `,
        [evaluationIntentId, lessonId]
      );

      if (intentResult.rows.length === 0) {
        return res.status(404).json({ message: "Evaluation intent not found" });
      }

      const referenceAnswer = intentResult.rows[0].reference_answer;

      // 3️⃣ Keyword-based scoring (intent-specific concept coverage)
      const keywordsResult = await pool.query(
        `
        SELECT keyword, weight
        FROM evaluation_rules
        WHERE evaluation_intent_id = $1
        `,
        [evaluationIntentId]
      );

      const keywords = keywordsResult.rows.map(r => r.keyword);

      // 2️⃣ Call NLP service for semantic similarity
      const nlpResponse = await axios.post(NLP_SERVICE_URL, {
        reference_answers: [referenceAnswer],  // Must be array!
        user_answer: answer,
        keywords: keywords
      });

      
      const semanticScore = nlpResponse.data.semantic_similarity;
      const keywordScore = nlpResponse.data.keyword_similarity_score;
      const matchedKeywords = nlpResponse.data.matched_keywords;
      
      // 4️⃣ Hybrid scoring formula
      const finalScore = 0.7 * semanticScore + 0.3 * keywordScore;

      // 5️⃣ Feedback
      let feedback = "Needs improvement.";
      if (finalScore >= 0.8) feedback = "Excellent understanding!";
      else if (finalScore >= 0.6) feedback = "Good understanding.";
      else if (finalScore >= 0.4) feedback = "Fair understanding.";

      /*semanticScore,
        keywordScore: normalizedKeywordScore,
        matchedKeywords,*/
      res.json({
        semanticScore,
        keywordScore,
        finalScore,
        feedback
      });

    } catch (err) {
      console.error("Intent evaluation error:", err);
      res.status(500).json({ error: "Intent evaluation failed" });
    }
  }
);

export default router;
