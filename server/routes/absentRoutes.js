import express from "express";
import { getEmployeeAbsentDates, getMonthlyAbsents, markAbsent, removeAbsent } from "../controllers/absentController.js";
import { protectSuperAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/mark-absent", protectSuperAdmin, markAbsent);
router.delete("/remove-absent", protectSuperAdmin, removeAbsent);
router.post("/employee-absent-dates", protectSuperAdmin, getEmployeeAbsentDates);
router.post("/monthly-absents", protectSuperAdmin, getMonthlyAbsents);

export default router;