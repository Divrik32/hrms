import express from "express";
import { protectSuperAdmin } from "../middleware/authMiddleware.js";
import { createRole, deleteRole, getRoles } from "../controllers/roleController.js";


const router = express.Router();

// Create Role
router.post("/", protectSuperAdmin, createRole);

// Get All Roles
router.get("/", protectSuperAdmin, getRoles);

// Delete Role
router.delete("/:id", protectSuperAdmin, deleteRole);

export default router;