import request from "supertest";
import express from "express";
import evaluationRoutes from "../routes/evaluation";
import axios from "axios";

jest.mock("../db", () => ({
  query: jest.fn()
}));

jest.mock("axios");

import pool from "../db";

const app = express();
app.use(express.json());
app.use("/evaluation", evaluationRoutes);

describe("POST /evaluation/evaluate-intent", () => {

  test("should return 400 if missing fields", async () => {
    const res = await request(app)
      .post("/evaluation/evaluate-intent")
      .send({});
    expect(res.status).toBe(400);
  });

  test("should return 404 if intent not found", async () => {
    (pool.query as jest.Mock).mockResolvedValueOnce({ rows: [] });

    const res = await request(app)
      .post("/evaluation/evaluate-intent")
      .send({ lessonId: 1, evaluationIntentId: 2, answer: "test" });

    expect(res.status).toBe(404);
  });

  test("should return correct hybrid score", async () => {
    // 1️⃣ Mock reference fetch
    (pool.query as jest.Mock)
      .mockResolvedValueOnce({
        rows: [{ reference_answer: "नमस्ते नमस्कार सुप्रभात" }]
      })
      // 2️⃣ Mock keyword fetch
      .mockResolvedValueOnce({
        rows: [{ keyword: "नमस्ते" }, { keyword: "नमस्कार" }]
      });

    // 3️⃣ Mock NLP response
    (axios.post as jest.Mock).mockResolvedValueOnce({
      data: {
        semantic_similarity: 0.8,
        keyword_similarity_score: 1,
        matched_keywords: ["नमस्ते", "नमस्कार"]
      }
    });

    const res = await request(app)
      .post("/evaluation/evaluate-intent")
      .send({
        lessonId: 1,
        evaluationIntentId: 2,
        answer: "namaste namaskar"
      });

    expect(res.status).toBe(200);
    expect(res.body.finalScore).toBeCloseTo(0.7 * 0.8 + 0.3 * 1);
  });

  test("should return 500 on DB error", async () => {
    (pool.query as jest.Mock).mockRejectedValueOnce(new Error("DB down"));

    const res = await request(app)
      .post("/evaluation/evaluate-intent")
      .send({
        lessonId: 1,
        evaluationIntentId: 2,
        answer: "test"
      });

    expect(res.status).toBe(500);
  });

});
