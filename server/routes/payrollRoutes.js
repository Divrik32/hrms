import express from "express";
import { deletePayroll, generatePayroll, getAllPayrolls, getEmployeePayroll, updatePayroll } from "../controllers/payrollController.js";
import { protectSuperAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();

// Generate Payroll
router.post("/generate", protectSuperAdmin, generatePayroll);
router.get("/employee/:employeeId", protectSuperAdmin, getEmployeePayroll);
router.get("/all", protectSuperAdmin, getAllPayrolls);
router.put("/update/:payrollId", protectSuperAdmin, updatePayroll);
router.delete("/delete/:payrollId", protectSuperAdmin, deletePayroll);

export default router;