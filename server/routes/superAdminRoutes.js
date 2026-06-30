import express from "express";
import multer from "multer";

import {
  createHoliday,
  createSuperAdmin,
  forgotPasswordSuperAdmin,
  getAllMonthlyAttendance,
  getApprovedLeavesByEmployee,
  getAttendanceByDate,
  getEmployeeByIdForAdmin,
  getEmployeeLeaveSummary,
  getEmployeeMonthlyAttendance,
  getMonthWeeks,
  getRejectedLeaveCount,
  getRejectedLeavesByEmployee,
  getWeeklyAttendance,
  loginSuperAdmin,
  logoutSuperAdmin,
  resendSuperAdminOtp,
  resetSuperAdminPassword,
  verifySuperAdminOtp,
} from "../controllers/superAdminController.js";

import { protectSuperAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();

// Multer Config
const storage = multer.diskStorage({
  destination: "uploads/",
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({ storage });

// Create Super Admin
router.post("/register", upload.single("profilePic"), createSuperAdmin);
// Login
router.post("/login", loginSuperAdmin);
// Logout
router.post("/logout", logoutSuperAdmin);
// Attendance By Date
router.post("/date", protectSuperAdmin, getAttendanceByDate);
// Employee Monthly Attendance
router.post("/monthly", protectSuperAdmin, getEmployeeMonthlyAttendance);
// All Employee Monthly Attendance
router.post("/all-monthly", getAllMonthlyAttendance);
router.post("/forgot-password", forgotPasswordSuperAdmin);
router.post("/verify-otp", verifySuperAdminOtp);
router.post("/reset-password", resetSuperAdminPassword);
router.post("/resend-otp", resendSuperAdminOtp);
router.post("/month-weeks", protectSuperAdmin, getMonthWeeks);
router.post("/weekly-attendance", protectSuperAdmin, getWeeklyAttendance);
router.post("/get-by-id", protectSuperAdmin, getEmployeeByIdForAdmin);
router.post("/employee-leave-summary", protectSuperAdmin, getEmployeeLeaveSummary);
router.post("/rejected-leave-count", protectSuperAdmin, getRejectedLeaveCount);
router.post("/approved-leaves", protectSuperAdmin, getApprovedLeavesByEmployee);
router.post("/employee-rejected-leaves", protectSuperAdmin, getRejectedLeavesByEmployee);
router.post("/create-holiday", protectSuperAdmin, createHoliday);

export default router;