import express from "express";
import multer from "multer";

import {
  createSuperAdmin,
  forgotPasswordSuperAdmin,
  getAllMonthlyAttendance,
  getAttendanceByDate,
  getEmployeeMonthlyAttendance,
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

export default router;