import { Router, Request, Response } from "express";
import pool from "../db";

const router = Router();

// extend Request type locally for handlers that may have `user` attached by auth middleware
interface AuthRequest extends Request {
  user?: { id?: string | number } | any;
}

/**
 * GET /preferences
 * Fetch accessibility settings for logged-in user
 */
router.get("/", async (req: Request, res: Response) => {
  const r = req as AuthRequest;

  // Resolve user id from several possible sources:
  // 1) req.user?.id (set by authentication middleware)
  // 2) x-user-id header (useful for local/dev testing)
  // 3) Authorization: Bearer <id> (simple token containing the user id)
  let userId: string | number | undefined = r.user?.id;
  if (!userId) {
    const xUser = req.headers["x-user-id"];
    if (xUser) userId = Array.isArray(xUser) ? xUser[0] : xUser;
  }
  if (!userId) {
    const auth = req.headers["authorization"] as string | undefined;
    if (auth && auth.startsWith("Bearer ")) {
      const token = auth.split(" ")[1];
      // In this project we may use a JWT; if so, middleware should decode it.
      // For a minimal fallback, if the token is a plain user id, use it.
      userId = token;
    }
  }

  if (!userId) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const result = await pool.query(
    "SELECT * FROM accessibility_preferences WHERE user_id = $1",
    [userId]
  );

  if (result.rows.length === 0) {
    // return defaults if not created yet
    return res.json({
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
  }

  const row = result.rows[0];

  res.json({
    theme: row.theme,
    fontSize: row.font_size,
    audioSpeed: row.audio_speed,
    contrastMode: row.contrast_mode,
    distractionFreeMode: row.distraction_free_mode,
    reducedMotion: row.reduced_motion,
    dyslexiaFont: row.dyslexia_font,
    blueLightFilter: row.blue_light_filter,
    readingMask: row.reading_mask
  });
});

/**
 * POST /preferences
 * Save/update accessibility settings
 */
router.post("/", async (req: Request, res: Response) => {
  const r = req as AuthRequest;

  let userId: string | number | undefined = r.user?.id;
  if (!userId) {
    const xUser = req.headers["x-user-id"];
    if (xUser) userId = Array.isArray(xUser) ? xUser[0] : xUser;
  }
  if (!userId) {
    const auth = req.headers["authorization"] as string | undefined;
    if (auth && auth.startsWith("Bearer ")) {
      userId = auth.split(" ")[1];
    }
  }

  if (!userId) {
    return res.status(401).json({ message: "Unauthorized: user information missing" });
  }

  const {
    theme,
    fontSize,
    audioSpeed,
    contrastMode,
    distractionFreeMode,
    reducedMotion,
    dyslexiaFont,
    blueLightFilter,
    readingMask
  } = req.body;

  await pool.query(
    `
    INSERT INTO accessibility_preferences (
      user_id, theme, font_size, audio_speed,
      contrast_mode, distraction_free_mode,
      reduced_motion, dyslexia_font,
      blue_light_filter, reading_mask
    )
    VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
    ON CONFLICT (user_id)
    DO UPDATE SET
      theme = EXCLUDED.theme,
      font_size = EXCLUDED.font_size,
      audio_speed = EXCLUDED.audio_speed,
      contrast_mode = EXCLUDED.contrast_mode,
      distraction_free_mode = EXCLUDED.distraction_free_mode,
      reduced_motion = EXCLUDED.reduced_motion,
      dyslexia_font = EXCLUDED.dyslexia_font,
      blue_light_filter = EXCLUDED.blue_light_filter,
      reading_mask = EXCLUDED.reading_mask,
      updated_at = CURRENT_TIMESTAMP
    `,
    [
      userId,
      theme,
      fontSize,
      audioSpeed,
      contrastMode,
      distractionFreeMode,
      reducedMotion,
      dyslexiaFont,
      blueLightFilter,
      readingMask
    ]
  );

  res.json({ message: "Accessibility preferences updated" });
});

export default router;
