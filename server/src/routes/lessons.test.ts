import request from 'supertest';
import express from 'express';
import lessonRouter from './lessons';
import pool from '../db';

jest.mock('../db', () => ({
    query: jest.fn(),
}));

const mockPool = pool as jest.Mocked<any>;

describe('Lessons Routes', () => {
    let app: express.Application;

    beforeEach(() => {
        jest.clearAllMocks();
        app = express();
        app.use(express.json());
        app.use('/lesson', lessonRouter);
    });

    describe('GET /lesson/:id', () => {
        test('should fetch lesson and keywords successfully', async () => {
            mockPool.query
                .mockResolvedValueOnce({ rows: [{ id: 1, title: 'Lesson 1' }] }) // Lesson
                .mockResolvedValueOnce({ rows: [{ keyword: 'test', explanation: 'test explanation' }] }); // Keywords

            const response = await request(app).get('/lesson/1');

            expect(response.status).toBe(200);
            expect(response.body).toEqual({
                lesson: { id: 1, title: 'Lesson 1' },
                keywords: [{ keyword: 'test', explanation: 'test explanation' }],
            });
            expect(mockPool.query).toHaveBeenCalledTimes(2);
        });

        test('should return 404 if lesson not found', async () => {
            mockPool.query.mockResolvedValueOnce({ rows: [] }); // Lesson empty

            const response = await request(app).get('/lesson/999');

            expect(response.status).toBe(404);
            expect(response.body).toEqual({ message: 'Lesson not found' });
            expect(mockPool.query).toHaveBeenCalledTimes(1);
        });

        test('should handle database errors gracefully', async () => {
            mockPool.query.mockRejectedValue(new Error('DB Error'));

            const response = await request(app).get('/lesson/1');

            expect(response.status).toBe(500);
            expect(response.body).toEqual({ error: 'Failed to fetch lesson' });
        });
    });
});
