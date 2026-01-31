import express from "express";
import dotenv from "dotenv";
import pool from "./db"
import lessonRoutes from "./routes/lessons";
dotenv.config();

const app = express();
app.use(express.json());

// Enable CORS for frontend
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});  

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

app.listen(3000, () => {
  console.log("Server running on port 3000");
});