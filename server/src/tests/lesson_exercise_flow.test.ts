import request from "supertest";
import express from "express";
import lessonRoutes from "../routes/lessons";
import exerciseRoutes from "../routes/exercises";

// Mock pool.query
jest.mock("../db", () => ({
    query: jest.fn()
}));

import pool from "../db";

const app = express();
app.use(express.json());
app.use("/lesson", lessonRoutes);
app.use("/exercises", exerciseRoutes);

describe("Lesson and Exercise Flow API Tests", () => {

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe("GET /lesson/:id", () => {
        test("should return lesson data and keywords for valid ID", async () => {
            const mockLesson = { id: 1, title: "Test Lesson", content: "Content" };
            const mockKeywords = [{ keyword: "test", explanation: "test explanation" }];

            (pool.query as jest.Mock).mockImplementation((query, values) => {
                if (query.includes("FROM lessons")) {
                    return Promise.resolve({ rows: [mockLesson] });
                }
                if (query.includes("FROM lesson_keywords")) {
                    return Promise.resolve({ rows: mockKeywords });
                }
                return Promise.resolve({ rows: [] });
            });

            const res = await request(app).get("/lesson/1");

            expect(res.status).toBe(200);
            expect(res.body.lesson).toEqual(mockLesson);
            expect(res.body.keywords).toEqual(mockKeywords);
        });

        test("should return 404 if lesson not found", async () => {
            (pool.query as jest.Mock).mockResolvedValueOnce({ rows: [] });

            const res = await request(app).get("/lesson/999");

            expect(res.status).toBe(404);
            expect(res.body.message).toBe("Lesson not found");
        });

        test("should return 500 on database error", async () => {
            (pool.query as jest.Mock).mockRejectedValueOnce(new Error("DB Error"));

            const res = await request(app).get("/lesson/1");

            expect(res.status).toBe(500);
            expect(res.body.error).toBe("Failed to fetch lesson");
        });
    });

    describe("GET /exercises/lesson/:lessonId", () => {
        test("should return list of exercises for a lesson", async () => {
            const mockExercises = [
                { id: 1, title: "Ex 1", lesson_id: 1 },
                { id: 2, title: "Ex 2", lesson_id: 1 }
            ];
            const mockSteps = [
                { id: 101, step_number: 1, prompt: "Step 1" }
            ];

            (pool.query as jest.Mock).mockImplementation((query, values) => {
                if (query.includes("FROM exercises WHERE lesson_id")) {
                    return Promise.resolve({ rows: mockExercises });
                }
                if (query.includes("FROM exercise_steps")) {
                    return Promise.resolve({ rows: mockSteps });
                }
                return Promise.resolve({ rows: [] });
            });

            const res = await request(app).get("/exercises/lesson/1");

            expect(res.status).toBe(200);
            expect(res.body.exercises).toHaveLength(2);
            expect(res.body.exercises[0].steps).toEqual(mockSteps);
        });

        test("should return empty array if no exercises found", async () => {
            (pool.query as jest.Mock).mockResolvedValueOnce({ rows: [] });

            const res = await request(app).get("/exercises/lesson/999");

            expect(res.status).toBe(200);
            expect(res.body.exercises).toEqual([]);
        });

        test("should return 400 for invalid lesson ID", async () => {
            const res = await request(app).get("/exercises/lesson/abc");
            expect(res.status).toBe(400);
            expect(res.body.message).toBe("Invalid lesson id");
        });
    });
});
