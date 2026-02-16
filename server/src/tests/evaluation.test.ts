import request from "supertest";
import express from "express";
import evaluationRoutes from "../routes/evaluation";
import axios from "axios";

jest.mock("../db", () => ({
  query: jest.fn()
}));

// Mock axios
jest.mock("axios");

import pool from "../db";

const app = express();
app.use(express.json());
app.use("/evaluation", evaluationRoutes);

describe("POST /evaluation/evaluate-intent", () => {
  test("should return 400 if required fields missing", async () => {
    const res = await request(app).post("/evaluation/evaluate-intent").send({});
    expect(res.status).toBe(400);
  });

  test("should return correct score", async () => {
    // Mock 1: Fetch reference answer
    (pool.query as jest.Mock)
      .mockResolvedValueOnce({
        rows: [{ reference_answer: "नमस्ते" }]
      })
      // Mock 2: Fetch keywords
      .mockResolvedValueOnce({
        rows: [{ keyword: "नमस्ते" }]
      });

    // Mock 3: NLP service response
    (axios.post as jest.Mock).mockResolvedValue({
      data: {
        semantic_similarity: 1,
        keyword_similarity_score: 1,
        matched_keywords: ["नमस्ते"]
      }
    });

    const res = await request(app)
      .post("/evaluation/evaluate-intent")
      .send({ lessonId: 1, evaluationIntentId: 1, answer: "नमस्ते" });

    expect(res.status).toBe(200);
    expect(res.body.finalScore).toBe(1);
    expect(res.body.feedback).toBe("Excellent understanding!");
  });

  test("should return 500 on DB error", async () => {
    (pool.query as jest.Mock).mockRejectedValueOnce(new Error("DB down"));

    const res = await request(app)
      .post("/evaluation/evaluate-intent")
      .send({ lessonId: 1, evaluationIntentId: 1, answer: "नमस्ते" });

    expect(res.status).toBe(500);
    expect(res.body.error).toBe("Intent evaluation failed");
  });

});
