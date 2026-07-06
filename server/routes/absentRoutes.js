import express from "express";
import { markAbsent, removeAbsent } from "../controllers/absentController.js";
import { protectSuperAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/mark-absent", protectSuperAdmin, markAbsent);
router.delete("/remove-absent", protectSuperAdmin, removeAbsent);

export default router;