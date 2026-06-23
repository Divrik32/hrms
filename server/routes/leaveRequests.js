import express from "express";

import {
  applyLeave,
  getAllLeaveRequests,
  getPendingLeaves,
  getMyLeaves,
  approveLeave,
  rejectLeave,
  withdrawLeaveRequest,
  getMyRejectedLeaves
} from "../controllers/leaveRequestController.js";

import { protectEmployee } from "../middleware/protectEmployee.js";
import { protectSuperAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();

// Employee Apply Leave
router.post("/apply", protectEmployee, applyLeave);

// Employee Own Leave History
router.get("/my-leaves", protectEmployee, getMyLeaves);

// Super Admin All Leave Requests
router.get("/all", protectSuperAdmin, getAllLeaveRequests);

// Super Admin Pending Leaves
router.get("/pending", protectSuperAdmin, getPendingLeaves);

// Super Admin Approve Leave
router.put("/approve/:leaveId", protectSuperAdmin, approveLeave);

// Super Admin Reject Leave
router.put("/reject/:leaveId", protectSuperAdmin, rejectLeave);

router.delete("/withdraw/:leaveId", protectEmployee, withdrawLeaveRequest);
router.get("/my-rejected-leaves", protectEmployee, getMyRejectedLeaves);

export default router;