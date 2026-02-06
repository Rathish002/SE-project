import { Router, Request, Response } from "express";
import axios from "axios";
import pool from "../db";

const router = Router();
const NLP_SERVICE_URL = "http://localhost:8000/semantic-similarity";

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
    const finalScore = semanticScore
    //0.7 * semanticScore + 0.3 * normalizedKeywordScore;

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

export default router;
