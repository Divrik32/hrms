import express from "express";
import { generatePayroll, getAllPayrolls, getEmployeePayroll } from "../controllers/payrollController.js";
import { protectSuperAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();

// Generate Payroll
router.post("/generate", protectSuperAdmin, generatePayroll);
router.get("/employee/:employeeId", protectSuperAdmin, getEmployeePayroll);
router.get("/all", protectSuperAdmin, getAllPayrolls);

export default router;