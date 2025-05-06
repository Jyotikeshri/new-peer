import express from "express";

import { createDirectMessageChannel, getStreamToken } from "../controllers/chatController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/token", protect, getStreamToken);
router.post("/direct",protect, createDirectMessageChannel);

export default router;