import request from "supertest";
import express from "express";
import axios from "axios";
import evaluationRoutes from "../routes/evaluation";

// ✅ mock pool.query
jest.mock("../db", () => ({
  query: jest.fn()
}));

// ✅ mock axios for NLP service calls
jest.mock("axios");

import pool from "../db";

const app = express();
app.use(express.json());
app.use("/evaluation", evaluationRoutes);

describe("GET /evaluation/lesson/:lessonId/questions", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  test("should fetch evaluation questions for a lesson", async () => {
    (pool.query as jest.Mock).mockResolvedValueOnce({
      rows: [
        { id: 1, question: "What is the greeting?" },
        { id: 2, question: "How do you introduce yourself?" }
      ]
    });

    const res = await request(app).get("/evaluation/lesson/1/questions");

    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(2);
    expect(res.body[0].question).toBe("What is the greeting?");
    expect(pool.query).toHaveBeenCalledWith(
      expect.stringContaining("SELECT id, question"),
      ["1"]
    );
  });

  test("should return empty array when no questions found", async () => {
    (pool.query as jest.Mock).mockResolvedValueOnce({
      rows: []
    });

    const res = await request(app).get("/evaluation/lesson/999/questions");

    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });

  test("should return 500 on database error", async () => {
    (pool.query as jest.Mock).mockRejectedValueOnce(
      new Error("Database connection failed")
    );

    const res = await request(app).get("/evaluation/lesson/1/questions");

    expect(res.status).toBe(500);
    expect(res.body.error).toBe("Failed to fetch evaluation questions");
  });
});

describe("POST /evaluation/evaluate-intent", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  test("should return 400 if required fields are missing", async () => {
    const res = await request(app)
      .post("/evaluation/evaluate-intent")
      .send({});

    expect(res.status).toBe(400);
    expect(res.body.message).toBe("Invalid input");
  });

  test("should return 400 if lessonId is missing", async () => {
    const res = await request(app)
      .post("/evaluation/evaluate-intent")
      .send({ evaluationIntentId: 1, answer: "नमस्ते" });

    expect(res.status).toBe(400);
    expect(res.body.message).toBe("Invalid input");
  });

  test("should return 400 if evaluationIntentId is missing", async () => {
    const res = await request(app)
      .post("/evaluation/evaluate-intent")
      .send({ lessonId: 1, answer: "नमस्ते" });

    expect(res.status).toBe(400);
    expect(res.body.message).toBe("Invalid input");
  });

  test("should return 400 if answer is missing", async () => {
    const res = await request(app)
      .post("/evaluation/evaluate-intent")
      .send({ lessonId: 1, evaluationIntentId: 1 });

    expect(res.status).toBe(400);
    expect(res.body.message).toBe("Invalid input");
  });

  test("should return 404 when evaluation intent not found", async () => {
    (pool.query as jest.Mock).mockResolvedValueOnce({
      rows: []
    });

    const res = await request(app)
      .post("/evaluation/evaluate-intent")
      .send({ lessonId: 1, evaluationIntentId: 999, answer: "नमस्ते" });

    expect(res.status).toBe(404);
    expect(res.body.message).toBe("Evaluation intent not found");
  });

  test("should evaluate intent and return score with good understanding", async () => {
    (pool.query as jest.Mock)
      .mockResolvedValueOnce({
        rows: [{ reference_answer: "नमस्ते" }]
      })
      .mockResolvedValueOnce({
        rows: [
          { keyword: "नमस्ते", weight: 0.5 },
          { keyword: "स्वागत", weight: 0.5 }
        ]
      });

    (axios.post as jest.Mock).mockResolvedValueOnce({
      data: {
        semantic_similarity: 0.75,
        keyword_similarity_score: 0.5,
        matched_keywords: ["नमस्ते"]
      }
    });

    const res = await request(app)
      .post("/evaluation/evaluate-intent")
      .send({ lessonId: 1, evaluationIntentId: 1, answer: "नमस्ते" });

    expect(res.status).toBe(200);
    expect(res.body.semanticScore).toBe(0.75);
    expect(res.body.keywordScore).toBe(0.5);
    expect(res.body.feedback).toBe("Good understanding.");
  });

  test("should evaluate intent and return excellent feedback for high score", async () => {
    (pool.query as jest.Mock)
      .mockResolvedValueOnce({
        rows: [{ reference_answer: "नमस्ते" }]
      })
      .mockResolvedValueOnce({
        rows: [{ keyword: "नमस्ते", weight: 1 }]
      });

    (axios.post as jest.Mock).mockResolvedValueOnce({
      data: {
        semantic_similarity: 0.95,
        keyword_similarity_score: 0.9,
        matched_keywords: ["नमस्ते"]
      }
    });

    const res = await request(app)
      .post("/evaluation/evaluate-intent")
      .send({ lessonId: 1, evaluationIntentId: 1, answer: "नमस्ते" });

    expect(res.status).toBe(200);
    expect(res.body.finalScore).toBeGreaterThanOrEqual(0.8);
    expect(res.body.feedback).toBe("Excellent understanding!");
  });

  test("should calculate final score correctly with hybrid formula", async () => {
    (pool.query as jest.Mock)
      .mockResolvedValueOnce({
        rows: [{ reference_answer: "नमस्ते आपका स्वागत है" }]
      })
      .mockResolvedValueOnce({
        rows: [{ keyword: "नमस्ते", weight: 1 }]
      });

    (axios.post as jest.Mock).mockResolvedValueOnce({
      data: {
        semantic_similarity: 0.8,
        keyword_similarity_score: 0.6,
        matched_keywords: ["नमस्ते"]
      }
    });

    const res = await request(app)
      .post("/evaluation/evaluate-intent")
      .send({
        lessonId: 1,
        evaluationIntentId: 1,
        answer: "नमस्ते आपका स्वागत है"
      });

    expect(res.status).toBe(200);
    // finalScore = 0.7 * 0.8 + 0.3 * 0.6 = 0.56 + 0.18 = 0.74
    expect(res.body.finalScore).toBeCloseTo(0.74, 2);
  });

  test("should return 500 on database error during intent fetch", async () => {
    (pool.query as jest.Mock).mockRejectedValueOnce(
      new Error("Database connection failed")
    );

    const res = await request(app)
      .post("/evaluation/evaluate-intent")
      .send({ lessonId: 1, evaluationIntentId: 1, answer: "नमस्ते" });

    expect(res.status).toBe(500);
    expect(res.body.error).toBe("Intent evaluation failed");
  });

  test("should return 500 on NLP service error", async () => {
    (pool.query as jest.Mock)
      .mockResolvedValueOnce({
        rows: [{ reference_answer: "नमस्ते" }]
      })
      .mockResolvedValueOnce({
        rows: [{ keyword: "नमस्ते", weight: 1 }]
      });

    (axios.post as jest.Mock).mockRejectedValueOnce(
      new Error("NLP service unavailable")
    );

    const res = await request(app)
      .post("/evaluation/evaluate-intent")
      .send({ lessonId: 1, evaluationIntentId: 1, answer: "नमस्ते" });

    expect(res.status).toBe(500);
    expect(res.body.error).toBe("Intent evaluation failed");
  });
});
