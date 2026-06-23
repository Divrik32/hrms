import express from "express";
import {
  checkIn,
  checkOut,
} from "../controllers/attendanceController.js";
import { protectEmployee } from "../middleware/protectEmployee.js";

const router = express.Router();


// ======================
// CHECK IN
// ======================
router.post("/checkin", protectEmployee, checkIn);


// ======================
// CHECK OUT
// ======================
router.post("/checkout", protectEmployee, checkOut);


export default router;