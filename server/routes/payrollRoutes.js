import express from "express";
import { deletePayroll, downloadPayrollPdf, generatePayroll, generatePayrollPdf, getAllPayrolls, getEmployeePayroll, getPayrollById, previewPayroll, updatePayroll } from "../controllers/payrollController.js";
import { protectSuperAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();

// Generate Payroll
router.post("/generate", protectSuperAdmin, generatePayroll);
router.get("/employee/:employeeId", protectSuperAdmin, getEmployeePayroll);
router.get("/all", protectSuperAdmin, getAllPayrolls);
router.put("/update/:payrollId", protectSuperAdmin, updatePayroll);
router.delete("/delete/:payrollId", protectSuperAdmin, deletePayroll);
router.post("/preview", protectSuperAdmin, previewPayroll);
router.get("/pdf/:payrollId", protectSuperAdmin, generatePayrollPdf);
router.get("/download/:payrollId", protectSuperAdmin, downloadPayrollPdf);
router.get("/:payrollId", protectSuperAdmin, getPayrollById);

export default router;