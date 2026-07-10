import fs from "fs";
import path from "path";
import Company from "../models/companyModel.js";

// Create Company
export const createCompany = async (req, res) => {
  try {
    const {
      companyName,
      companyType,
      gstNumber,
      panNumber,
      email,
      phone,
      website,
      industry,
      address,
      status,
    } = req.body;

    const existingCompany = await Company.findOne({
      $or: [
        { companyName },
        { email },
        ...(gstNumber ? [{ gstNumber }] : []),
        ...(panNumber ? [{ panNumber }] : []),
      ],
    });

    if (existingCompany) {
      return res.status(400).json({
        success: false,
        message:
          "Company already exists with the same name, email, GST number, or PAN number",
      });
    }

    const company = await Company.create({
      companyName,
      companyType,
      gstNumber,
      panNumber,
      email,
      phone,
      website,
      industry,
      address,
      logo: req.files?.logo ? req.files.logo[0].filename : "",
      signature: req.files?.signature ? req.files.signature[0].filename : "",
      status,
    });

    return res.status(201).json({
      success: true,
      message: "Company created successfully",
      company,
    });
  } catch (error) {
    console.error("Create Company Error:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get Company By Id
export const getCompanyById = async (req, res) => {
  try {
    const { companyId } = req.params;

    const company = await Company.findById(companyId);

    if (!company) {
      return res.status(404).json({
        success: false,
        message: "Company not found",
      });
    }

    return res.status(200).json({
      success: true,
      company,
    });
  } catch (error) {
    console.error("Get Company Error:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getAllCompanies = async (req, res) => {
  try {
    const companies = await Company.find().sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: companies.length,
      companies,
    });
  } catch (error) {
    console.error("Get All Companies Error:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const updateCompany = async (req, res) => {
  try {
    const { companyId } = req.params;

    const company = await Company.findById(companyId);

    if (!company) {
      return res.status(404).json({
        success: false,
        message: "Company not found",
      });
    }

    const {
      companyName,
      companyType,
      gstNumber,
      panNumber,
      email,
      phone,
      website,
      industry,
      address,
      status,
    } = req.body;

    // Duplicate Check
    const existingCompany = await Company.findOne({
      _id: { $ne: companyId },
      $or: [
        { companyName },
        { email },
        ...(gstNumber ? [{ gstNumber }] : []),
        ...(panNumber ? [{ panNumber }] : []),
      ],
    });

    if (existingCompany) {
      return res.status(400).json({
        success: false,
        message:
          "Another company already exists with the same Company Name, Email, GST or PAN.",
      });
    }

    // --------------------------
    // Logo Replace
    // --------------------------

    if (req.files?.logo?.length > 0) {
      if (company.logo) {
        const logoPath = path.join("uploads", company.logo);

        if (fs.existsSync(logoPath)) {
          fs.unlinkSync(logoPath);
        }
      }

      company.logo = req.files.logo[0].filename;
    }

    // --------------------------
    // Signature Replace
    // --------------------------

    if (req.files?.signature?.length > 0) {
      if (company.signature) {
        const signaturePath = path.join(
          "uploads",
          company.signature
        );

        if (fs.existsSync(signaturePath)) {
          fs.unlinkSync(signaturePath);
        }
      }

      company.signature =
        req.files.signature[0].filename;
    }

    // --------------------------
    // Update Fields
    // --------------------------

    company.companyName = companyName;
    company.companyType = companyType;
    company.gstNumber = gstNumber;
    company.panNumber = panNumber;
    company.email = email;
    company.phone = phone;
    company.website = website;
    company.industry = industry;
    company.address = address;
    company.status = status;

    await company.save();

    return res.status(200).json({
      success: true,
      message: "Company updated successfully.",
      company,
    });

  } catch (error) {
    console.log(error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};