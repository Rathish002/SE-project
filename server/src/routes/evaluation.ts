/*import { Router, Request, Response } from "express";
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
*/

import { Router, Request, Response } from "express";
import pool from "../db";
import OpenAI from "openai";
import { cosineSimilarity } from "../utils/similarity";
import { splitIntoSentences } from "../utils/text";

const router = Router();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const CONCEPT_THRESHOLD = 0.6;

router.post("/evaluate-hybrid", async (req: Request, res: Response) => {
  const { lessonId, answer } = req.body;

  if (!lessonId || !answer) {
    return res.status(400).json({ message: "Invalid input" });
  }

  try {
    /* -----------------------------
       1️⃣ Fetch reference answers
    ------------------------------ */
    const intentResult = await pool.query(
      "SELECT reference_answer FROM evaluation_intents WHERE lesson_id = $1",
      [lessonId]
    );

    if (intentResult.rows.length === 0) {
      return res.status(404).json({ message: "No reference answers found" });
    }

    const referenceAnswers = intentResult.rows.map(r => r.reference_answer);

    /* -----------------------------
       2️⃣ Fetch evaluation rules
    ------------------------------ */
    const rulesResult = await pool.query(
      "SELECT keyword, weight FROM evaluation_rules WHERE lesson_id = $1",
      [lessonId]
    );

    /* -----------------------------
       3️⃣ Sentence chunking
    ------------------------------ */
    const sentences = splitIntoSentences(answer);

    /* -----------------------------
       4️⃣ Embed full answer (semantic score)
    ------------------------------ */
    const userEmbeddingResult = await openai.embeddings.create({
      model: "text-embedding-3-small",
      input: answer,
    });

    const userVector = userEmbeddingResult.data[0].embedding;

    let bestSemanticScore = 0;

    for (const ref of referenceAnswers) {
      const refEmbedding = await openai.embeddings.create({
        model: "text-embedding-3-small",
        input: ref,
      });
      
      const similarity = cosineSimilarity(
        userVector,
        refEmbedding.data[0].embedding
      );

      if (similarity > bestSemanticScore) {
        bestSemanticScore = similarity;
      }
    }

    /* -----------------------------
       5️⃣ Concept coverage (sentence-level)
    ------------------------------ */
    let matchedWeight = 0;
    let totalWeight = 0;
    const matchedConcepts: string[] = [];
    const missingConcepts: string[] = [];

    for (const rule of rulesResult.rows) {
      totalWeight += rule.weight;

      const keywordEmbedding = await openai.embeddings.create({
        model: "text-embedding-3-small",
        input: rule.keyword,
      });

      let bestConceptSimilarity = 0;

      for (const sentence of sentences) {
        const sentenceEmbedding = await openai.embeddings.create({
          model: "text-embedding-3-small",
          input: sentence,
        });

        const similarity = cosineSimilarity(
          keywordEmbedding.data[0].embedding,
          sentenceEmbedding.data[0].embedding
        );

        if (similarity > bestConceptSimilarity) {
          bestConceptSimilarity = similarity;
        }
      }

      if (bestConceptSimilarity >= CONCEPT_THRESHOLD) {
        matchedWeight += rule.weight;
        matchedConcepts.push(rule.keyword);
      } else {
        missingConcepts.push(rule.keyword);
      }
    }

    const coverageScore =
      totalWeight === 0 ? 0 : matchedWeight / totalWeight;

    /* -----------------------------
       6️⃣ Final hybrid score
    ------------------------------ */
    const finalScore =
      0.7 * bestSemanticScore + 0.3 * coverageScore;

    /* -----------------------------
       7️⃣ Feedback
    ------------------------------ */
    let feedback = "Partial understanding. Try again.";

    if (finalScore >= 0.8) {
      feedback = "Excellent! You understood the meaning and key concepts.";
    } else if (finalScore >= 0.65) {
      feedback = "Good understanding, but some important ideas are missing.";
    }

    res.json({
      semanticScore: bestSemanticScore,
      conceptCoverageScore: coverageScore,
      finalScore,
      matchedConcepts,
      missingConcepts,
      feedback,
    });
  } catch (err) {
    console.error("Hybrid evaluation error:", err);
    res.status(500).json({ error: "Hybrid evaluation failed" });
  }
});

export default router;
