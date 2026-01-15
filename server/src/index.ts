import express from "express";
import dotenv from "dotenv";
dotenv.config();

const app = express();

app.get("/", (_req, res) => {
  res.send("Server running");
});

app.listen(3000, () => {
  console.log("Server running on port 3000");
});
