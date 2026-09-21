import express from "express";
import { protectSuperAdmin } from "../middleware/authMiddleware.js";
import { getCompanyEmployeeCount, getLeaveRequestStatusCount } from "../controllers/superAdminDashboardController.js";

const router = express.Router();

// Get employee count for each company
router.get("/company-employee-count", protectSuperAdmin, getCompanyEmployeeCount);
// Get total leave request status count 
router.get( "/leave-request-status-count", protectSuperAdmin, getLeaveRequestStatusCount );
export default router;