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
      logo: req.file ? req.file.filename : "",
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