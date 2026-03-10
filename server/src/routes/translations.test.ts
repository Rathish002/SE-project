import request from 'supertest';
import express from 'express';
import translationsRouter from './translations';

describe('Translations Routes', () => {
    let app: express.Application;

    beforeEach(() => {
        app = express();
        app.use('/translations', translationsRouter);
    });

    describe('GET /translations/:lang', () => {
        test('should return translation object for supported language (en)', async () => {
            const response = await request(app).get('/translations/en');
            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('buttons');
            expect(response.body).toHaveProperty('labels');
        });

        test('should return translation object for supported language (hi)', async () => {
            const response = await request(app).get('/translations/hi');
            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('buttons');
        });

        test('should return 404 for unsupported language', async () => {
            const response = await request(app).get('/translations/es');
            expect(response.status).toBe(404);
            expect(response.body.message).toBe('Language not supported');
        });
    });
});
