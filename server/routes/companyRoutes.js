import express from "express";
import multer from "multer";

import {
  createCompany,
  getAllCompanies,
  getCompanyById,
  updateCompany,
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
  upload.fields([
    {
      name: "logo",
      maxCount: 1,
    },
    {
      name: "signature",
      maxCount: 1,
    },
  ]),
  createCompany
);

// Update Company
router.put(
  "/:companyId",
  protectSuperAdmin,
  upload.fields([
    {
      name: "logo",
      maxCount: 1,
    },
    {
      name: "signature",
      maxCount: 1,
    },
  ]),
  updateCompany
);

// Get Company By Id
router.get("/:companyId", getCompanyById);

// Get All Companies
router.get("/", getAllCompanies);

export default router;