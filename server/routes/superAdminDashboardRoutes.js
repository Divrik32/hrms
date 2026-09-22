import express from "express";
import { protectSuperAdmin } from "../middleware/authMiddleware.js";
import { getCompanyEmployeeCount, getDepartmentEmployeeCount, getLeaveRequestStatusCount, getMonthlyPayrollCount, getTotalEmployeeCount } from "../controllers/superAdminDashboardController.js";

const router = express.Router();

// Get employee count for each company
router.get("/company-employee-count", protectSuperAdmin, getCompanyEmployeeCount);
// Get total leave request status count 
router.get( "/leave-request-status-count", protectSuperAdmin, getLeaveRequestStatusCount );
router.get("/department-employee-count", protectSuperAdmin, getDepartmentEmployeeCount);
router.get("/monthly-payroll-count", protectSuperAdmin, getMonthlyPayrollCount);
router.get("/total-employee-count", protectSuperAdmin, getTotalEmployeeCount);

export default router;