import request from 'supertest';
import express from 'express';
import exercisesRouter from './exercises';
import pool from '../db';

jest.mock('../db', () => ({
    connect: jest.fn(),
    query: jest.fn(),
}));

const mockPool = pool as jest.Mocked<any>;

describe('Exercises Routes', () => {
    let app: express.Application;
    let mockClient: any;

    beforeEach(() => {
        jest.clearAllMocks();
        app = express();
        app.use(express.json());
        app.use('/exercises', exercisesRouter);

        mockClient = {
            query: jest.fn(),
            release: jest.fn(),
        };
        mockPool.connect.mockResolvedValue(mockClient);
        mockPool.query.mockImplementation(() => Promise.resolve({ rows: [] }));
    });

    describe('POST /exercises/answer', () => {
        test('should return 400 if required fields are missing', async () => {
            const response = await request(app).post('/exercises/answer').send({});
            expect(response.status).toBe(400);
            expect(response.body.message).toBe('Missing required fields');
        });

        test('should return 400 if option is invalid for this step', async () => {
            mockClient.query.mockResolvedValueOnce({ rows: [] }); // optionCheck
            mockClient.query.mockResolvedValueOnce({ rows: [] }); // commit/rollback

            const response = await request(app)
                .post('/exercises/answer')
                .send({ userId: 'u1', stepId: 1, selectedOptionId: 2 });

            expect(response.status).toBe(400);
            expect(response.body.message).toBe('Invalid option for this step');
            expect(mockClient.query).toHaveBeenCalledWith('ROLLBACK');
        });

        test('should process a correct answer', async () => {
            mockClient.query
                .mockResolvedValueOnce({ rows: [] }) // BEGIN
                .mockResolvedValueOnce({ rows: [{ correct_option_id: 2 }] }) // optionCheck
                .mockResolvedValueOnce({ rows: [] }) // DELETE old
                .mockResolvedValueOnce({ rows: [] }) // INSERT
                .mockResolvedValueOnce({ rows: [] }); // COMMIT

            const response = await request(app)
                .post('/exercises/answer')
                .send({ userId: 'u1', stepId: 1, selectedOptionId: 2 });

            expect(response.status).toBe(200);
            expect(response.body.correct).toBe(true);
            expect(mockClient.query).toHaveBeenCalledWith('COMMIT');
        });

        test('should handle database errors gracefully', async () => {
            mockClient.query.mockRejectedValue(new Error('DB Error'));

            const response = await request(app)
                .post('/exercises/answer')
                .send({ userId: 'u1', stepId: 1, selectedOptionId: 2 });

            expect(response.status).toBe(500);
            expect(response.body.error).toBe('Answer validation failed');
            expect(mockClient.query).toHaveBeenCalledWith('ROLLBACK');
        });
    });

    describe('POST /exercises/progress', () => {
        test('should save progress successfully', async () => {
            mockPool.query.mockResolvedValueOnce({ rows: [{ id: 1, current_step: 2 }] });

            const response = await request(app)
                .post('/exercises/progress')
                .send({ userId: 'u1', exerciseId: 1, currentStep: 2, completedSteps: 1, isCompleted: false });

            expect(response.status).toBe(200);
            expect(response.body.progress.current_step).toBe(2);
        });

        test('should return 400 if userId or exerciseId missing', async () => {
            const response = await request(app)
                .post('/exercises/progress')
                .send({});
            expect(response.status).toBe(400);
        });
    });

    describe('GET /exercises/:id', () => {
        test('should return 400 for invalid id', async () => {
            const response = await request(app).get('/exercises/abc');
            expect(response.status).toBe(400);
        });

        test('should return exercise with its steps', async () => {
            mockPool.query
                .mockResolvedValueOnce({ rows: [{ id: 1 }] }) // Exercise
                .mockResolvedValueOnce({ rows: [{ step_id: 1 }] }); // Steps

            const response = await request(app).get('/exercises/1');

            expect(response.status).toBe(200);
            expect(response.body.exercise.id).toBe(1);
            expect(response.body.steps.length).toBe(1);
        });

        test('should return 404 if exercise not found', async () => {
            mockPool.query.mockResolvedValueOnce({ rows: [] });

            const response = await request(app).get('/exercises/1');

            expect(response.status).toBe(404);
        });
    });

    describe('GET /exercises/lesson/:lessonId', () => {
        test('should return exercises for lesson', async () => {
            mockPool.query
                .mockResolvedValueOnce({ rows: [{ id: 1 }] }) // Exercises
                .mockResolvedValueOnce({ rows: [{ step_id: 1 }] }); // Steps for exp

            const response = await request(app).get('/exercises/lesson/1');

            expect(response.status).toBe(200);
            expect(response.body.exercises.length).toBe(1);
        });
    });
});
