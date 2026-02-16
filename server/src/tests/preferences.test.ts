import request from "supertest";
import express from "express";
import preferencesRoutes from "../routes/preferences";

// ✅ mock pool.query
jest.mock("../db", () => ({
  query: jest.fn()
}));

import pool from "../db";

const app = express();
app.use(express.json());
app.use("/preferences", preferencesRoutes);

describe("GET /preferences", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  test("should return default preferences when no user found", async () => {
    const res = await request(app).get("/preferences");
    expect(res.status).toBe(401);
    expect(res.body.message).toBe("Unauthorized");
  });

  test("should return default preferences when no preferences exist in DB", async () => {
    (pool.query as jest.Mock).mockResolvedValueOnce({
      rows: []
    });

    const res = await request(app)
      .get("/preferences")
      .set("x-user-id", "user123");

    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      theme: "light",
      fontSize: "medium",
      audioSpeed: "normal",
      contrastMode: false,
      distractionFreeMode: false,
      reducedMotion: false,
      dyslexiaFont: false,
      blueLightFilter: false,
      readingMask: false
    });
  });

  test("should return saved preferences from DB using x-user-id header", async () => {
    (pool.query as jest.Mock).mockResolvedValueOnce({
      rows: [
        {
          user_id: "user123",
          theme: "dark",
          font_size: "large",
          audio_speed: "slow",
          contrast_mode: true,
          distraction_free_mode: true,
          reduced_motion: true,
          dyslexia_font: true,
          blue_light_filter: true,
          reading_mask: true
        }
      ]
    });

    const res = await request(app)
      .get("/preferences")
      .set("x-user-id", "user123");

    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      theme: "dark",
      fontSize: "large",
      audioSpeed: "slow",
      contrastMode: true,
      distractionFreeMode: true,
      reducedMotion: true,
      dyslexiaFont: true,
      blueLightFilter: true,
      readingMask: true
    });
    expect(pool.query).toHaveBeenCalledWith(
      "SELECT * FROM accessibility_preferences WHERE user_id = $1",
      ["user123"]
    );
  });

  test("should get user ID from Bearer token", async () => {
    (pool.query as jest.Mock).mockResolvedValueOnce({
      rows: []
    });

    const res = await request(app)
      .get("/preferences")
      .set("Authorization", "Bearer user456");

    expect(res.status).toBe(200);
    expect(pool.query).toHaveBeenCalledWith(
      "SELECT * FROM accessibility_preferences WHERE user_id = $1",
      ["user456"]
    );
  });

  test("should handle array of x-user-id headers correctly", async () => {
    (pool.query as jest.Mock).mockResolvedValueOnce({
      rows: []
    });

    const res = await request(app)
      .get("/preferences")
      .set("x-user-id", "user789");

    expect(res.status).toBe(200);
    expect(pool.query).toHaveBeenCalledWith(
      "SELECT * FROM accessibility_preferences WHERE user_id = $1",
      ["user789"]
    );
  });

  test("should return 500 on database error", async () => {
    (pool.query as jest.Mock).mockRejectedValueOnce(
      new Error("Database connection failed")
    );

    const res = await request(app)
      .get("/preferences")
      .set("x-user-id", "user123");

    expect(res.status).toBe(500);
  });
});

describe("POST /preferences", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  test("should return 401 when no user information provided", async () => {
    const res = await request(app)
      .post("/preferences")
      .send({
        theme: "dark",
        fontSize: "large"
      });

    expect(res.status).toBe(401);
    expect(res.body.message).toBe(
      "Unauthorized: user information missing"
    );
  });

  test("should save preferences using x-user-id header", async () => {
    (pool.query as jest.Mock).mockResolvedValueOnce({});

    const preferencesData = {
      theme: "dark",
      fontSize: "large",
      audioSpeed: "slow",
      contrastMode: true,
      distractionFreeMode: true,
      reducedMotion: false,
      dyslexiaFont: true,
      blueLightFilter: false,
      readingMask: true
    };

    const res = await request(app)
      .post("/preferences")
      .set("x-user-id", "user123")
      .send(preferencesData);

    expect(res.status).toBe(200);
    expect(res.body.message).toBe("Accessibility preferences updated");
    expect(pool.query).toHaveBeenCalled();
  });

  test("should save preferences using Bearer token", async () => {
    (pool.query as jest.Mock).mockResolvedValueOnce({});

    const preferencesData = {
      theme: "light",
      fontSize: "small",
      audioSpeed: "fast",
      contrastMode: false,
      distractionFreeMode: false,
      reducedMotion: true,
      dyslexiaFont: false,
      blueLightFilter: true,
      readingMask: false
    };

    const res = await request(app)
      .post("/preferences")
      .set("Authorization", "Bearer user456")
      .send(preferencesData);

    expect(res.status).toBe(200);
    expect(res.body.message).toBe("Accessibility preferences updated");
  });

  test("should handle partial preference updates", async () => {
    (pool.query as jest.Mock).mockResolvedValueOnce({});

    const res = await request(app)
      .post("/preferences")
      .set("x-user-id", "user123")
      .send({
        theme: "dark",
        fontSize: "large"
      });

    expect(res.status).toBe(200);
    expect(pool.query).toHaveBeenCalledWith(
      expect.stringContaining("INSERT INTO accessibility_preferences"),
      expect.arrayContaining(["user123", "dark", "large"])
    );
  });

  test("should use ON CONFLICT to update existing preferences", async () => {
    (pool.query as jest.Mock).mockResolvedValueOnce({});

    const preferencesData = {
      theme: "dark",
      fontSize: "large",
      audioSpeed: "slow",
      contrastMode: true,
      distractionFreeMode: true,
      reducedMotion: false,
      dyslexiaFont: true,
      blueLightFilter: false,
      readingMask: true
    };

    const res = await request(app)
      .post("/preferences")
      .set("x-user-id", "user123")
      .send(preferencesData);

    expect(res.status).toBe(200);
    
    // Verify the query contains ON CONFLICT clause
    const callArgs = (pool.query as jest.Mock).mock.calls[0];
    expect(callArgs[0]).toContain("ON CONFLICT (user_id)");
    expect(callArgs[0]).toContain("DO UPDATE SET");
  });

  test("should return 500 on database error during save", async () => {
    (pool.query as jest.Mock).mockRejectedValueOnce(
      new Error("Database connection failed")
    );

    const res = await request(app)
      .post("/preferences")
      .set("x-user-id", "user123")
      .send({
        theme: "dark",
        fontSize: "large",
        audioSpeed: "slow",
        contrastMode: true,
        distractionFreeMode: true,
        reducedMotion: false,
        dyslexiaFont: true,
        blueLightFilter: false,
        readingMask: true
      });

    expect(res.status).toBe(500);
  });

  test("should pass correct parameters to database query", async () => {
    (pool.query as jest.Mock).mockResolvedValueOnce({});

    const preferencesData = {
      theme: "dark",
      fontSize: "large",
      audioSpeed: "slow",
      contrastMode: true,
      distractionFreeMode: false,
      reducedMotion: true,
      dyslexiaFont: false,
      blueLightFilter: true,
      readingMask: false
    };

    await request(app)
      .post("/preferences")
      .set("x-user-id", "user123")
      .send(preferencesData);

    const callArgs = (pool.query as jest.Mock).mock.calls[0];
    const params = callArgs[1];

    expect(params[0]).toBe("user123"); // user_id
    expect(params[1]).toBe("dark"); // theme
    expect(params[2]).toBe("large"); // fontSize
    expect(params[3]).toBe("slow"); // audioSpeed
    expect(params[4]).toBe(true); // contrastMode
    expect(params[5]).toBe(false); // distractionFreeMode
    expect(params[6]).toBe(true); // reducedMotion
    expect(params[7]).toBe(false); // dyslexiaFont
    expect(params[8]).toBe(true); // blueLightFilter
    expect(params[9]).toBe(false); // readingMask
  });
});

describe("Authentication priority", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  test("should prioritize req.user.id over headers during GET", async () => {
    (pool.query as jest.Mock).mockResolvedValueOnce({
      rows: []
    });

    // Create a custom app with middleware that sets req.user
    const testApp = express();
    testApp.use(express.json());
    testApp.use((req, res, next) => {
      (req as any).user = { id: "user_from_middleware" };
      next();
    });
    testApp.use("/preferences", preferencesRoutes);

    const res = await request(testApp)
      .get("/preferences")
      .set("x-user-id", "user_from_header");

    expect(res.status).toBe(200);
    expect(pool.query).toHaveBeenCalledWith(
      "SELECT * FROM accessibility_preferences WHERE user_id = $1",
      ["user_from_middleware"]
    );
  });

  test("should use x-user-id when req.user.id is not available", async () => {
    (pool.query as jest.Mock).mockResolvedValueOnce({
      rows: []
    });

    const res = await request(app)
      .get("/preferences")
      .set("x-user-id", "user_from_header")
      .set("Authorization", "Bearer user_from_token");

    expect(res.status).toBe(200);
    expect(pool.query).toHaveBeenCalledWith(
      "SELECT * FROM accessibility_preferences WHERE user_id = $1",
      ["user_from_header"]
    );
  });

  test("should use Bearer token when req.user and x-user-id are not available", async () => {
    (pool.query as jest.Mock).mockResolvedValueOnce({
      rows: []
    });

    const res = await request(app)
      .get("/preferences")
      .set("Authorization", "Bearer user_from_token");

    expect(res.status).toBe(200);
    expect(pool.query).toHaveBeenCalledWith(
      "SELECT * FROM accessibility_preferences WHERE user_id = $1",
      ["user_from_token"]
    );
  });
});
