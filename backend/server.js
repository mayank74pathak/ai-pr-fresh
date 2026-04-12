import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import reviewRoutes from "./routes/reviewRoutes.js";
import githubRoutes from "./routes/githubRoutes.js";

dotenv.config();

console.log(
  "TOKEN CHECK:",
  process.env.GITHUB_TOKEN ? "✅ Loaded" : "❌ Missing",
);
const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/review", reviewRoutes);
app.use("/api/github", githubRoutes);
app.listen(5001, () => {
  console.log("Server running on port 5001");
});
