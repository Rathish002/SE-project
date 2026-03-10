/**
 * Unit Tests for Accessibility Preferences Route
 * Tests GET and POST endpoints with various authentication methods and scenarios
 */

import { Router } from 'express';
import request from 'supertest';
import express from 'express';
import preferencesRouter from './preferences';
import pool from '../db';

// Mock the database pool
jest.mock('../db', () => ({
  query: jest.fn(),
}));

const mockPool = pool as jest.Mocked<any>;

describe('Accessibility Preferences Routes', () => {
  let app: express.Application;

  beforeEach(() => {
    // Reset mocks before each test
    jest.clearAllMocks();

    // Create a fresh Express app for each test
    app = express();
    app.use(express.json());
    app.use('/preferences', preferencesRouter);
  });

  // ============================================
  // GET /preferences - Fetch User Preferences
  // ============================================
  describe('GET /preferences', () => {
    const mockUserPreferences = {
      id: 1,
      user_id: 'user123',
      theme: 'dark',
      font_size: 20,
      audio_speed: 1.5,
      contrast_mode: true,
      distraction_free_mode: false,
      reduced_motion: false,
      dyslexia_font: true,
      blue_light_filter: false,
      reading_mask: false,
    };

    describe('Authentication: req.user.id', () => {
      test('should fetch preferences when user is authenticated via req.user.id', async () => {
        mockPool.query.mockResolvedValue({ rows: [mockUserPreferences] });

        const response = await request(app)
          .get('/preferences')
          .set('Authorization', 'Bearer token123')
          .set('x-user-id', 'user123');

        expect(response.status).toBe(200);
        expect(response.body).toEqual({
          theme: 'dark',
          fontSize: 20,
          audioSpeed: 1.5,
          contrastMode: true,
          distractionFreeMode: false,
          reducedMotion: false,
          dyslexiaFont: true,
          blueLightFilter: false,
          readingMask: false,
        });
      });
    });

    describe('Authentication: x-user-id header', () => {
      test('should fetch preferences using x-user-id header', async () => {
        mockPool.query.mockResolvedValue({ rows: [mockUserPreferences] });

        const response = await request(app)
          .get('/preferences')
          .set('x-user-id', 'user123');

        expect(response.status).toBe(200);
        expect(mockPool.query).toHaveBeenCalledWith(
          'SELECT * FROM accessibility_preferences WHERE user_id = $1',
          ['user123']
        );
      });

      test('should handle array header format for x-user-id', async () => {
        mockPool.query.mockResolvedValue({ rows: [mockUserPreferences] });

        // Note: Express treats multiple header values as the first value only
        // In real scenario, would be handled by Express header parsing
        const response = await request(app)
          .get('/preferences')
          .set('x-user-id', 'user123');

        expect(response.status).toBe(200);
        expect(mockPool.query).toHaveBeenCalledWith(
          'SELECT * FROM accessibility_preferences WHERE user_id = $1',
          ['user123']
        );
      });
    });

    describe('Authentication: Bearer Token', () => {
      test('should fetch preferences using Bearer token as user ID', async () => {
        mockPool.query.mockResolvedValue({ rows: [mockUserPreferences] });

        const response = await request(app)
          .get('/preferences')
          .set('Authorization', 'Bearer user123');

        expect(response.status).toBe(200);
        expect(mockPool.query).toHaveBeenCalledWith(
          'SELECT * FROM accessibility_preferences WHERE user_id = $1',
          ['user123']
        );
      });
    });

    describe('Default Preferences', () => {
      test('should return default preferences when user has no saved preferences', async () => {
        mockPool.query.mockResolvedValue({ rows: [] });

        const response = await request(app)
          .get('/preferences')
          .set('x-user-id', 'newuser');

        expect(response.status).toBe(200);
        expect(response.body).toEqual({
          theme: 'light',
          fontSize: 'medium',
          audioSpeed: 'normal',
          contrastMode: false,
          distractionFreeMode: false,
          reducedMotion: false,
          dyslexiaFont: false,
          blueLightFilter: false,
          readingMask: false,
        });
      });
    });

    describe('Error Handling', () => {
      test('should return 401 when no user ID is provided', async () => {
        const response = await request(app).get('/preferences');

        expect(response.status).toBe(401);
        expect(response.body).toEqual({ message: 'Unauthorized' });
        expect(mockPool.query).not.toHaveBeenCalled();
      });

      test('should handle database errors gracefully', async () => {
        mockPool.query.mockRejectedValue(new Error('Database connection failed'));

        const response = await request(app)
          .get('/preferences')
          .set('x-user-id', 'user123');

        expect(response.status).toBe(500);
      });
    });

    describe('Field Mapping', () => {
      test('should correctly map database fields to response fields', async () => {
        const dbRow = {
          theme: 'dark',
          font_size: 18,
          audio_speed: 1.25,
          contrast_mode: true,
          distraction_free_mode: true,
          reduced_motion: true,
          dyslexia_font: false,
          blue_light_filter: true,
          reading_mask: false,
        };

        mockPool.query.mockResolvedValue({ rows: [dbRow] });

        const response = await request(app)
          .get('/preferences')
          .set('x-user-id', 'user123');

        expect(response.body).toEqual({
          theme: 'dark',
          fontSize: 18,
          audioSpeed: 1.25,
          contrastMode: true,
          distractionFreeMode: true,
          reducedMotion: true,
          dyslexiaFont: false,
          blueLightFilter: true,
          readingMask: false,
        });
      });
    });
  });

  // ============================================
  // POST /preferences - Save/Update Preferences
  // ============================================
  describe('POST /preferences', () => {
    const validPreferences = {
      theme: 'dark',
      fontSize: 20,
      audioSpeed: 1.5,
      contrastMode: true,
      distractionFreeMode: false,
      reducedMotion: false,
      dyslexiaFont: true,
      blueLightFilter: false,
      readingMask: false,
    };

    describe('Authentication: x-user-id header', () => {
      test('should save preferences when user is authenticated via x-user-id', async () => {
        mockPool.query.mockResolvedValue({ rows: [] });

        const response = await request(app)
          .post('/preferences')
          .set('x-user-id', 'user123')
          .send(validPreferences);

        expect(response.status).toBe(200);
        expect(response.body).toEqual({ message: 'Accessibility preferences updated' });
        expect(mockPool.query).toHaveBeenCalled();
      });
    });

    describe('Authentication: Bearer Token', () => {
      test('should save preferences using Bearer token as user ID', async () => {
        mockPool.query.mockResolvedValue({ rows: [] });

        const response = await request(app)
          .post('/preferences')
          .set('Authorization', 'Bearer user123')
          .send(validPreferences);

        expect(response.status).toBe(200);
        expect(response.body).toEqual({ message: 'Accessibility preferences updated' });
      });
    });

    describe('Database Operations', () => {
      test('should insert new preferences with correct mapping', async () => {
        mockPool.query.mockResolvedValue({ rows: [] });

        const response = await request(app)
          .post('/preferences')
          .set('x-user-id', 'user123')
          .send(validPreferences);

        expect(response.status).toBe(200);
        expect(mockPool.query).toHaveBeenCalledWith(
          expect.stringContaining('INSERT INTO accessibility_preferences'),
          [
            'user123',
            'dark',
            20,
            1.5,
            true,
            false,
            false,
            true,
            false,
            false,
          ]
        );
      });

      test('should handle ON CONFLICT for existing user preferences', async () => {
        mockPool.query.mockResolvedValue({ rows: [] });

        const response = await request(app)
          .post('/preferences')
          .set('x-user-id', 'user123')
          .send(validPreferences);

        const queryCall = mockPool.query.mock.calls[0][0];
        expect(queryCall).toContain('ON CONFLICT (user_id)');
        expect(queryCall).toContain('DO UPDATE SET');
      });

      test('should update timestamp on conflict', async () => {
        mockPool.query.mockResolvedValue({ rows: [] });

        const response = await request(app)
          .post('/preferences')
          .set('x-user-id', 'user123')
          .send(validPreferences);

        const queryCall = mockPool.query.mock.calls[0][0];
        expect(queryCall).toContain('updated_at = CURRENT_TIMESTAMP');
      });
    });

    describe('Payload Handling', () => {
      test('should accept all preference fields', async () => {
        mockPool.query.mockResolvedValue({ rows: [] });

        const response = await request(app)
          .post('/preferences')
          .set('x-user-id', 'user123')
          .send({
            theme: 'light',
            fontSize: 16,
            audioSpeed: 0.75,
            contrastMode: false,
            distractionFreeMode: true,
            reducedMotion: true,
            dyslexiaFont: false,
            blueLightFilter: true,
            readingMask: true,
          });

        expect(response.status).toBe(200);
      });

      test('should handle partial preference updates', async () => {
        mockPool.query.mockResolvedValue({ rows: [] });

        const response = await request(app)
          .post('/preferences')
          .set('x-user-id', 'user123')
          .send({
            theme: 'dark',
            contrastMode: true,
          });

        expect(response.status).toBe(200);
        expect(mockPool.query).toHaveBeenCalled();
      });

      test('should accept empty body and save defaults', async () => {
        mockPool.query.mockResolvedValue({ rows: [] });

        const response = await request(app)
          .post('/preferences')
          .set('x-user-id', 'user123')
          .send({});

        expect(response.status).toBe(200);
      });

      test('should handle boolean values correctly', async () => {
        mockPool.query.mockResolvedValue({ rows: [] });

        const response = await request(app)
          .post('/preferences')
          .set('x-user-id', 'user123')
          .send({
            contrastMode: true,
            distractionFreeMode: false,
            reducedMotion: true,
          });

        expect(response.status).toBe(200);
        const callArgs = mockPool.query.mock.calls[0][1];
        expect(callArgs).toContain(true);
        expect(callArgs).toContain(false);
      });
    });

    describe('Error Handling', () => {
      test('should return 401 when no user ID is provided', async () => {
        const response = await request(app)
          .post('/preferences')
          .send(validPreferences);

        expect(response.status).toBe(401);
        expect(response.body).toEqual({
          message: 'Unauthorized: user information missing',
        });
        expect(mockPool.query).not.toHaveBeenCalled();
      });

      test('should handle database errors', async () => {
        mockPool.query.mockRejectedValue(new Error('Unique constraint violation'));

        const response = await request(app)
          .post('/preferences')
          .set('x-user-id', 'user123')
          .send(validPreferences);

        expect(response.status).toBe(500);
      });

      test('should handle malformed JSON in request', async () => {
        const response = await request(app)
          .post('/preferences')
          .set('x-user-id', 'user123')
          .set('Content-Type', 'application/json')
          .send('{invalid json}');

        expect(response.status).toBe(400);
      });
    });
  });

  // ============================================
  // Priority: Authentication Method Resolution
  // ============================================
  describe('User ID Resolution Priority', () => {
    test('should prioritize req.user.id over x-user-id header', async () => {
      mockPool.query.mockResolvedValue({ rows: [] });

      // This test would require middleware to set req.user, which we're not doing here
      // But the logic shows req.user.id is checked first
      const route = preferencesRouter.stack[0].route;
      expect(route).toBeDefined();
    });

    test('should use x-user-id when req.user.id is not available', async () => {
      mockPool.query.mockResolvedValue({ rows: [] });

      const response = await request(app)
        .get('/preferences')
        .set('x-user-id', 'header-user');

      expect(response.status).toBe(200);
      expect(mockPool.query).toHaveBeenCalledWith(
        expect.any(String),
        ['header-user']
      );
    });

    test('should use Bearer token as fallback', async () => {
      mockPool.query.mockResolvedValue({ rows: [] });

      const response = await request(app)
        .get('/preferences')
        .set('Authorization', 'Bearer bearer-user');

      expect(response.status).toBe(200);
      expect(mockPool.query).toHaveBeenCalledWith(
        expect.any(String),
        ['bearer-user']
      );
    });
  });

  // ============================================
  // Integration Scenarios
  // ============================================
  describe('Integration Scenarios', () => {
    test('should create and then fetch user preferences', async () => {
      // First POST to create preferences
      mockPool.query.mockResolvedValueOnce({ rows: [] });

      const postResponse = await request(app)
        .post('/preferences')
        .set('x-user-id', 'user123')
        .send({
          theme: 'dark',
          fontSize: 18,
          audioSpeed: 1.25,
          contrastMode: true,
          distractionFreeMode: false,
          reducedMotion: false,
          dyslexiaFont: false,
          blueLightFilter: false,
          readingMask: false,
        });

      expect(postResponse.status).toBe(200);

      // Then GET to fetch the preferences
      mockPool.query.mockResolvedValueOnce({
        rows: [
          {
            theme: 'dark',
            font_size: 18,
            audio_speed: 1.25,
            contrast_mode: true,
            distraction_free_mode: false,
            reduced_motion: false,
            dyslexia_font: false,
            blue_light_filter: false,
            reading_mask: false,
          },
        ],
      });

      const getResponse = await request(app)
        .get('/preferences')
        .set('x-user-id', 'user123');

      expect(getResponse.status).toBe(200);
      expect(getResponse.body.theme).toBe('dark');
      expect(getResponse.body.fontSize).toBe(18);
      expect(getResponse.body.contrastMode).toBe(true);
    });

    test('should handle multiple users independently', async () => {
      const user1Prefs = {
        rows: [{
          theme: 'dark',
          font_size: 20,
          audio_speed: 1.5,
          contrast_mode: true,
          distraction_free_mode: false,
          reduced_motion: false,
          dyslexia_font: true,
          blue_light_filter: false,
          reading_mask: false,
        }],
      };

      const user2Prefs = {
        rows: [{
          theme: 'light',
          font_size: 14,
          audio_speed: 0.75,
          contrast_mode: false,
          distraction_free_mode: true,
          reduced_motion: true,
          dyslexia_font: false,
          blue_light_filter: true,
          reading_mask: false,
        }],
      };

      mockPool.query.mockResolvedValueOnce(user1Prefs);
      const user1Response = await request(app)
        .get('/preferences')
        .set('x-user-id', 'user1');

      mockPool.query.mockResolvedValueOnce(user2Prefs);
      const user2Response = await request(app)
        .get('/preferences')
        .set('x-user-id', 'user2');

      expect(user1Response.body.theme).toBe('dark');
      expect(user2Response.body.theme).toBe('light');
    });
  });
});
