import express from "express";
import multer from "multer";

import {
  createCompany,
  getAllCompanies,
  getCompanyById,
} from "../controllers/companyController.js";
import { protectSuperAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },

  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({ storage });

// Create Company
router.post(
  "/",
  protectSuperAdmin,
  upload.single("logo"),
  createCompany
);

// Get Company By Id
router.get("/:companyId", getCompanyById);
router.get("/", getAllCompanies);

export default router;