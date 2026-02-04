import request from "supertest";
import express from "express";
import evaluationRoutes from "../routes/evaluation";

// ✅ mock pool.query
jest.mock("../db", () => ({
  query: jest.fn()
}));

import pool from "../db";

const app = express();
app.use(express.json());
app.use("/evaluation", evaluationRoutes);

describe("POST /evaluation/evaluate-text", () => {
  test("should return 400 if lessonId or answer missing", async () => {
    const res = await request(app).post("/evaluation/evaluate-text").send({});
    expect(res.status).toBe(400);
  });

  test("should return correct score for matched keywords", async () => {
    (pool.query as jest.Mock).mockResolvedValueOnce({
      rows: [{ keyword: "नमस्ते" }, { keyword: "स्वागत" }]
    });

    const res = await request(app)
      .post("/evaluation/evaluate-text")
      .send({ lessonId: 1, answer: "नमस्ते आपका स्वागत है" });

    expect(res.status).toBe(200);
    expect(res.body.score).toBe(1);
    expect(res.body.matchedConcepts).toContain("नमस्ते");
    expect(res.body.matchedConcepts).toContain("स्वागत");
  });

  test("should return 500 on db error", async () => {
    (pool.query as jest.Mock).mockRejectedValueOnce(new Error("DB down"));

    const res = await request(app)
      .post("/evaluation/evaluate-text")
      .send({ lessonId: 1, answer: "नमस्ते" });

    expect(res.status).toBe(500);
    expect(res.body.error).toBe("Evaluation failed");
  });
});
