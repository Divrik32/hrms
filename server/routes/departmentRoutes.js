import express from "express";
import {
  createDepartment,
  getDepartmentsByCompany,
  getDepartmentById,
} from "../controllers/departmentController.js";
import { protectSuperAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();


// Create Department
router.post("/", protectSuperAdmin, createDepartment);


// Get all departments of a specific company
router.get("/company/:companyId", getDepartmentsByCompany);


// Get single department by id
router.get("/:id", getDepartmentById);


export default router;