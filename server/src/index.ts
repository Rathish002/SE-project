import express from "express";
import dotenv from "dotenv";
import pool from "./db"
dotenv.config();

const app = express();

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

app.listen(3000, () => {
  console.log("Server running on port 3000");
});
