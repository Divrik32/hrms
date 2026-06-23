import express from "express";
import multer from "multer";

import {
  createEmployee,
  forgotPassword,
  getEmployeeById,
  getEmployeesByCompany,
  getEmployeesByDepartment,
  loginEmployee,
  logoutEmployee,
  resendOtp,
  resetPassword,
  verifyOtp,
} from "../controllers/employeeController.js";
import { protectEmployee } from "../middleware/protectEmployee.js";

const storage = multer.diskStorage({
  destination: "uploads/",
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({ storage });

const router = express.Router();

router.post("/", upload.single("profilePic"), createEmployee);

router.get("/profile/me", protectEmployee, getEmployeeById);

// Company wise employees
router.get("/company/:companyId", getEmployeesByCompany);

router.get("/department/:departmentId", getEmployeesByDepartment);

router.post("/login", loginEmployee);
router.post("/logout", logoutEmployee);

router.post(
  "/forgot-password",
  forgotPassword
);

router.post(
  "/verify-otp",
  verifyOtp
);

router.post(
  "/reset-password",
  resetPassword
);

router.post(
  "/resend-otp",
  resendOtp
);

export default router;