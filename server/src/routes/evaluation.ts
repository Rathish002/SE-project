import { Router, Request, Response } from "express";
import axios from "axios";
import pool from "../db";
import multer from "multer";
import FormData from "form-data";
import { getAdaptiveThreshold, saveEvaluationProgress, thresholdToLabel } from "../utils/adaptive_threshold";

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });
const rawNlpUrl = process.env.NLP_SERVICE_URL || "http://localhost:8000";
const normalizedNlpBase = rawNlpUrl
  .replace(/\/$/, "")
  .replace(/\/semantic-similarity$/, "")
  .replace(/\/speech-similarity$/, "");
const NLP_SERVICE_URL = `${normalizedNlpBase}/semantic-similarity`;
const NLP_SPEECH_SERVICE_URL = `${normalizedNlpBase}/speech-similarity`;

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
    const { lessonId, evaluationIntentId, answer, userId } = req.body;

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

      // 2️⃣ Keyword-based scoring (intent-specific concept coverage)
      const keywordsResult = await pool.query(
        `
        SELECT keyword, weight
        FROM evaluation_rules
        WHERE evaluation_intent_id = $1
        `,
        [evaluationIntentId]
      );

      const keywords = keywordsResult.rows.map(r => r.keyword);

      // 3️⃣ Compute adaptive threshold from user's history
      const adaptiveThreshold = userId
        ? await getAdaptiveThreshold(userId, lessonId)
        : 0.60;

      console.log(`Adaptive threshold for user ${userId ?? 'anonymous'}: ${adaptiveThreshold}`);

      // 4️⃣ Call NLP service for semantic similarity
      const nlpResponse = await axios.post(NLP_SERVICE_URL, {
        reference_answers: [referenceAnswer],
        user_answer: answer,
        keywords: keywords,
        threshold: adaptiveThreshold
      });

      const semanticScore = nlpResponse.data.semantic_similarity;
      const keywordScore = nlpResponse.data.keyword_similarity_score;
      const matchedKeywords = nlpResponse.data.matched_keywords || [];
      const missedKeywords = keywords.filter(k => !matchedKeywords.includes(k));

      // 5️⃣ Hybrid scoring formula
      const finalScore = 0.7 * semanticScore + 0.3 * keywordScore;

      // 6️⃣ Feedback
      let feedback = "Needs improvement.";
      if (finalScore >= 0.8) feedback = "Excellent understanding!";
      else if (finalScore >= 0.6) feedback = "Good understanding.";
      else if (finalScore >= 0.4) feedback = "Fair understanding.";

      // 7️⃣ Persist progress asynchronously (non-blocking)
      if (userId) {
        saveEvaluationProgress(userId, lessonId, evaluationIntentId, finalScore);
      }

      res.json({
        semanticScore,
        keywordScore,
        finalScore,
        feedback,
        matchedKeywords,
        missedKeywords,
        adaptiveThreshold,
        difficultyLabel: thresholdToLabel(adaptiveThreshold)
      });

    } catch (err) {
      console.error("Intent evaluation error:", err);
      res.status(500).json({ error: "Intent evaluation failed" });
    }
  }
);

/**
 * Evaluate ONE audio answer for ONE question (intent-level)
 */
router.post(
  "/evaluate-speech-intent",
  upload.single("audio"),
  async (req: Request, res: Response): Promise<any> => {
    const { lessonId, evaluationIntentId } = req.body;
    const audioContent = req.file;

    if (!lessonId || !evaluationIntentId || !audioContent) {
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

      // 2️⃣ Keyword-based scoring (intent-specific concept coverage)
      const keywordsResult = await pool.query(
        `
        SELECT keyword, weight
        FROM evaluation_rules
        WHERE evaluation_intent_id = $1
        `,
        [evaluationIntentId]
      );

      const keywords = keywordsResult.rows.map(r => r.keyword);

      // 3️⃣ Get user ID for adaptive threshold (fallback to body if not in auth)
      const userId = req.body.userId;

      // 4️⃣ Compute adaptive threshold
      const adaptiveThreshold = userId
        ? await getAdaptiveThreshold(userId, Number(lessonId))
        : 0.60;

      console.log(`Adaptive speech threshold for user ${userId ?? 'anonymous'}: ${adaptiveThreshold}`);

      // 5️⃣ Call NLP service for speech similarity with form data
      const formData = new FormData();
      formData.append("audio", audioContent.buffer, {
        filename: audioContent.originalname || "recording.webm",
        contentType: audioContent.mimetype || "audio/webm",
      });

      formData.append("reference_answers", JSON.stringify([referenceAnswer]));
      formData.append("keywords", JSON.stringify(keywords));
      formData.append("threshold", String(adaptiveThreshold)); // Pass threshold to NLP

      const nlpResponse = await axios.post(NLP_SPEECH_SERVICE_URL, formData, {
        headers: {
          ...formData.getHeaders(),
        },
      });

      const semanticScore = nlpResponse.data.semantic_similarity;
      const keywordScore = nlpResponse.data.keyword_similarity_score;
      const matchedKeywords = nlpResponse.data.matched_keywords || [];
      const missedKeywords = keywords.filter(k => !matchedKeywords.includes(k));
      const transcript = nlpResponse.data.transcript;
      const normalizedAnswer = nlpResponse.data.normalized_user_answer;

      // 6️⃣ Hybrid scoring formula
      const finalScore = 0.7 * semanticScore + 0.3 * keywordScore;

      // 7️⃣ Feedback
      let feedback = "Needs improvement.";
      if (finalScore >= 0.8) feedback = "Excellent understanding!";
      else if (finalScore >= 0.6) feedback = "Good understanding.";
      else if (finalScore >= 0.4) feedback = "Fair understanding.";

      // 8️⃣ Persist progress asynchronously
      if (userId) {
        saveEvaluationProgress(userId, Number(lessonId), Number(evaluationIntentId), finalScore);
      }

      res.json({
        semanticScore,
        keywordScore,
        finalScore,
        feedback,
        matchedKeywords,
        missedKeywords,
        transcript,
        normalizedAnswer,
        adaptiveThreshold,
        difficultyLabel: thresholdToLabel(adaptiveThreshold)
      });

    } catch (err: any) {
      console.error("Speech intent evaluation error:", err.message);
      if (err.response) {
        console.error("NLP service error details:", err.response.data);
      }
      res.status(500).json({ error: "Speech intent evaluation failed" });
    }
  }
);

export default router;
