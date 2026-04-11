import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import reviewRoutes from "./routes/reviewRoutes.js";
import githubRoutes from "./routes/githubRoutes.js";

 
dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/review", reviewRoutes);
app.use("/api/github", githubRoutes);
app.listen(5001, () => {
  console.log("Server running on port 5001");
});
