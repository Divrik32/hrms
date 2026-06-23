import express from "express";
import {createEmployeeSalaryStructure, editEmployeeSalaryStructure, getEmployeeLeaveSummary, getEmployeeSalaryStructure} from "../controllers/payrollController.js";
import { protectSuperAdmin } from "../middleware/authMiddleware.js";
import { protectEmployee } from "../middleware/protectEmployee.js";

const router = express.Router();

router.get("/leave-summary", protectEmployee, getEmployeeLeaveSummary);
router.post("/create-salary-structure", protectSuperAdmin, createEmployeeSalaryStructure);
router.put("/update-salary-structure/:employeeId", protectSuperAdmin, editEmployeeSalaryStructure);
router.get("/salary-structure/:employeeId", protectSuperAdmin, getEmployeeSalaryStructure);

export default router;