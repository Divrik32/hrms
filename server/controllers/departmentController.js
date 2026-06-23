import Department from "../models/departmentModel.js";
import Company from "../models/companyModel.js";

export const createDepartment = async (req, res) => {
  try {
    const { departmentName, companyId, description } = req.body;

    // validation
    if (!departmentName || !companyId) {
      return res.status(400).json({
        success: false,
        message: "departmentName and companyId are required",
      });
    }

    // check company exists or not
    const company = await Company.findById(companyId);

    if (!company) {
      return res.status(404).json({
        success: false,
        message: "Company not found",
      });
    }

    // duplicate department check under same company
    const existingDept = await Department.findOne({
      departmentName,
      companyId,
    });

    if (existingDept) {
      return res.status(400).json({
        success: false,
        message: "Department already exists in this company",
      });
    }

    // create department
    const department = await Department.create({
      departmentName,
      companyId,
      description,
    });

    return res.status(201).json({
      success: true,
      message: "Department created successfully",
      department,
    });
  } catch (error) {
    console.error("Create Department Error:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getDepartmentsByCompany = async (req, res) => {
  try {
    const { companyId } = req.params;

    const departments = await Department.find({ companyId })
      .populate("companyId", "companyName companyType email");

    return res.status(200).json({
      success: true,
      count: departments.length,
      departments,
    });
  } catch (error) {
    console.error("Get Departments Error:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getDepartmentById = async (req, res) => {
  try {
    const { id } = req.params;

    const department = await Department.findById(id).populate(
      "companyId",
      "companyName"
    );

    if (!department) {
      return res.status(404).json({
        success: false,
        message: "Department not found",
      });
    }

    return res.status(200).json({
      success: true,
      department,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};