import express from "express";

import {
  checkIn,
  checkOut,
  afternoonCheckIn,
  afternoonCheckOut,
  nightCheckIn,
  nightCheckOut,
} from "../controllers/attendanceController.js";

import { protectEmployee } from "../middleware/protectEmployee.js";

const router = express.Router();

// ======================
// DAY SHIFT
// ======================

router.post(
  "/checkin",
  protectEmployee,
  checkIn
);

router.post(
  "/checkout",
  protectEmployee,
  checkOut
);

// ======================
// AFTERNOON SHIFT
// ======================

router.post(
  "/afternoon-checkin",
  protectEmployee,
  afternoonCheckIn
);

router.post(
  "/afternoon-checkout",
  protectEmployee,
  afternoonCheckOut
);

// ======================
// NIGHT SHIFT
// ======================

router.post(
  "/night-checkin",
  protectEmployee,
  nightCheckIn
);

router.post(
  "/night-checkout",
  protectEmployee,
  nightCheckOut
);

export default router;