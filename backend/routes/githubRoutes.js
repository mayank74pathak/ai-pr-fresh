import express from "express";
import { handleWebhook } from "../controllers/githubController.js";

const router = express.Router();

router.post("/webhook", handleWebhook);

export default router;