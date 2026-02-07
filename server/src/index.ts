import express, { Request, Response, NextFunction } from "express";
import dotenv from "dotenv";
import pool from "./db"
import lessonRoutes from "./routes/lessons";
import evaluationRoutes from "./routes/evaluation";
import exerciseRoutes from "./routes/exercises";
import translationRoutes from "./routes/translations";
import preferencesRoutes from "./routes/preferences";

dotenv.config();

const app = express();
app.use(express.json());

// Enable CORS for frontend
app.use((req: Request, res: Response, next: NextFunction) => {
  res.header('Access-Control-Allow-Origin', process.env.FRONTEND_URL || '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

app.get("/db-test", async (_req: Request, res: Response) => {
  try {
    const result = await pool.query("SELECT NOW()");
    res.json(result.rows[0]);
  } catch (err) {
    console.error("DB ERROR:", err);
    res.status(500).json({ error: "DB connection failed" });
  }
});

app.get("/", (_req: Request, res: Response) => {
  res.send("Server running");
});

app.use("/lesson", lessonRoutes);
app.use("/evaluation", evaluationRoutes);
app.use("/exercise", exerciseRoutes);
app.use("/translations", translationRoutes);
app.use("/preferences", preferencesRoutes);

// Global error handler
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  console.error("Unhandled error:", err);
  res.status(err.status || 500).json({ error: err.message || "Internal server error" });
});

app.listen(3001, () => {
  console.log("Server running on port 3001");
});