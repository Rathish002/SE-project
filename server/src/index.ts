import express from "express";
import dotenv from "dotenv";
import pool from "./db"
import lessonRoutes from "./routes/lessons";
import evaluationRoutes from "./routes/evaluation";
import exerciseRoutes from "./routes/exercises";

dotenv.config();

const app = express();
app.use(express.json());  

app.get("/db-test", async (_req, res) => {
  try {
    const result = await pool.query("SELECT NOW()");
    res.json(result.rows[0]);
  } catch (err) {
    console.error("DB ERROR:", err);
    res.status(500).json({ error: "DB connection failed" });
  }
});

app.get("/", (_req, res) => {
  res.send("Server running");
});

app.use("/lesson", lessonRoutes);
app.use("/evaluation", evaluationRoutes);
app.use("/exercise", exerciseRoutes);

app.listen(3000, () => {
  console.log("Server running on port 3000");
});