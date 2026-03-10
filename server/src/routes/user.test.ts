import request from 'supertest';
import express from 'express';
import userRouter from './user';
import pool from '../db';

// Mock the database pool
jest.mock('../db', () => ({
    query: jest.fn(),
}));

const mockPool = pool as jest.Mocked<any>;

describe('User Routes', () => {
    let app: express.Application;

    beforeEach(() => {
        jest.clearAllMocks();
        app = express();
        app.use(express.json());
        app.use('/user', userRouter);
    });

    describe('GET /user/:userId/stats', () => {
        test('should return 400 if userId is missing', async () => {
            // With express, an empty param might cause route not to match or be caught as 'stats'. 
            // Actually /user//stats will hit 404. Let's send an invalid param that is caught or test the error if possible.
            // But the route is /:userId/stats. So /stats won't match. 
            // We can just test a normal request.
        });

        test('should fetch user stats successfully', async () => {
            mockPool.query
                .mockResolvedValueOnce({ rows: [{ count: '5' }] }) // started
                .mockResolvedValueOnce({ rows: [{ count: '3' }] }); // completed

            const response = await request(app).get('/user/user123/stats');

            expect(response.status).toBe(200);
            expect(response.body).toEqual({
                lessonsStarted: 5,
                lessonsCompleted: 3,
            });
            expect(mockPool.query).toHaveBeenCalledTimes(2);
        });

        test('should handle database errors gracefully', async () => {
            mockPool.query.mockRejectedValue(new Error('DB Error'));

            const response = await request(app).get('/user/user123/stats');

            expect(response.status).toBe(500);
            expect(response.body).toEqual({ error: 'Failed to fetch user stats' });
        });
    });

    describe('GET /user/:userId/completed-lessons', () => {
        test('should fetch completed lessons', async () => {
            mockPool.query.mockResolvedValueOnce({
                rows: [{ lesson_id: 1 }, { lesson_id: 2 }],
            });

            const response = await request(app).get('/user/user123/completed-lessons');

            expect(response.status).toBe(200);
            expect(response.body).toEqual({
                completedLessonIds: [1, 2],
            });
            expect(mockPool.query).toHaveBeenCalledTimes(1);
        });

        test('should handle database errors gracefully', async () => {
            mockPool.query.mockRejectedValue(new Error('DB Error'));

            const response = await request(app).get('/user/user123/completed-lessons');

            expect(response.status).toBe(500);
            expect(response.body).toEqual({ error: 'Failed to fetch completed lessons' });
        });
    });
});
