import request from 'supertest';
import express from 'express';
import evaluationRouter from './evaluation';
import pool from '../db';
import axios from 'axios';

jest.mock('../db', () => ({
    query: jest.fn(),
}));

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

const mockPool = pool as jest.Mocked<any>;

// Mocking adaptive threshold util to avoid actual db calls during tests
jest.mock('../utils/adaptive_threshold', () => ({
    getAdaptiveThreshold: jest.fn().mockResolvedValue(0.6),
    saveEvaluationProgress: jest.fn(),
    thresholdToLabel: jest.fn().mockReturnValue('Medium'),
}));

describe('Evaluation Routes', () => {
    let app: express.Application;

    beforeEach(() => {
        jest.clearAllMocks();
        app = express();
        app.use(express.json());
        app.use('/evaluation', evaluationRouter);
    });

    describe('GET /lesson/:lessonId/questions', () => {
        test('should fetch questions successfully', async () => {
            mockPool.query.mockResolvedValueOnce({
                rows: [{ id: 1, question: 'What is this?' }]
            });

            const response = await request(app).get('/evaluation/lesson/1/questions');

            expect(response.status).toBe(200);
            expect(response.body).toEqual([{ id: 1, question: 'What is this?' }]);
            expect(mockPool.query).toHaveBeenCalledTimes(1);
        });

        test('should handle database errors gracefully', async () => {
            mockPool.query.mockRejectedValue(new Error('DB Error'));

            const response = await request(app).get('/evaluation/lesson/1/questions');

            expect(response.status).toBe(500);
            expect(response.body).toEqual({ error: 'Failed to fetch evaluation questions' });
        });
    });

    describe('POST /evaluate-intent', () => {
        test('should return 400 if required fields are missing', async () => {
            const response = await request(app).post('/evaluation/evaluate-intent').send({});
            expect(response.status).toBe(400);
            expect(response.body.message).toBe('Invalid input');
        });

        test('should process intent evaluation and return scoring', async () => {
            mockPool.query
                .mockResolvedValueOnce({ rows: [{ reference_answer: 'Ref answer' }] }) // intentResult
                .mockResolvedValueOnce({ rows: [{ keyword: 'test', weight: 1 }] }); // keywordsResult

            mockedAxios.post.mockResolvedValueOnce({
                data: {
                    semantic_similarity: 0.9,
                    keyword_similarity_score: 1.0,
                    matched_keywords: ['test']
                }
            });

            const response = await request(app)
                .post('/evaluation/evaluate-intent')
                .send({ lessonId: 1, evaluationIntentId: 1, answer: 'My answer', userId: 'user1' });

            expect(response.status).toBe(200);
            expect(response.body.semanticScore).toBe(0.9);
            expect(response.body.finalScore).toBeCloseTo(0.7 * 0.9 + 0.3 * 1.0);
            expect(mockPool.query).toHaveBeenCalledTimes(2);
            expect(mockedAxios.post).toHaveBeenCalledTimes(1);
        });

        test('should return 404 if intent not found', async () => {
            mockPool.query.mockResolvedValueOnce({ rows: [] });

            const response = await request(app)
                .post('/evaluation/evaluate-intent')
                .send({ lessonId: 1, evaluationIntentId: 1, answer: 'My answer' });

            expect(response.status).toBe(404);
            expect(response.body.message).toBe('Evaluation intent not found');
        });

        test('should handle service errors gracefully', async () => {
            mockPool.query.mockRejectedValue(new Error('DB Error'));

            const response = await request(app)
                .post('/evaluation/evaluate-intent')
                .send({ lessonId: 1, evaluationIntentId: 1, answer: 'My answer', userId: 'user1' });

            expect(response.status).toBe(500);
            expect(response.body.error).toBe('Intent evaluation failed');
        });
    });

    describe('POST /evaluate-speech-intent', () => {
        test('should return 400 if audio missing', async () => {
            const response = await request(app).post('/evaluation/evaluate-speech-intent').send({
                lessonId: 1, evaluationIntentId: 1
            });
            // multer won't parse fields correctly if not form-data, but missing audio triggers 400
            expect(response.status).toBe(400);
        });

        // We can test the actual upload endpoint by attaching a file using supertest
        test('should process speech intent evaluation', async () => {
            mockPool.query
                .mockResolvedValueOnce({ rows: [{ reference_answer: 'Ref answer' }] }) // intentResult
                .mockResolvedValueOnce({ rows: [{ keyword: 'test', weight: 1 }] }); // keywordsResult

            mockedAxios.post.mockResolvedValueOnce({
                data: {
                    semantic_similarity: 0.8,
                    keyword_similarity_score: 1.0,
                    matched_keywords: ['test'],
                    transcript: 'My answer',
                    normalized_user_answer: 'my answer'
                }
            });

            const response = await request(app)
                .post('/evaluation/evaluate-speech-intent')
                .field('lessonId', '1')
                .field('evaluationIntentId', '1')
                .field('userId', 'user1')
                .attach('audio', Buffer.from('fake audio data'), 'audio.webm');

            expect(response.status).toBe(200);
            expect(response.body.semanticScore).toBe(0.8);
            expect(response.body.transcript).toBe('My answer');
        });
    });
});
