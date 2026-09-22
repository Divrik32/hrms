import Company from "../models/companyModel.js";
import Employee from "../models/employeeModel.js";
import LeaveRequest from "../models/LeaveRequest.js";
import Payroll from "../models/payrollModel.js";
import Department from "../models/departmentModel.js";

// Get employee count for each company
export const getCompanyEmployeeCount = async (req, res) => {
  try {
    const companies = await Company.find()
      .select("_id companyName status")
      .lean();

    const companyEmployeeCounts = await Promise.all(
      companies.map(async (company) => {
        const employeeCount = await Employee.countDocuments({
          companyId: company._id,
          status: "active",
        });

        return {
          companyId: company._id,
          companyName: company.companyName,
          status: company.status,
          employeeCount,
        };
      })
    );

    return res.status(200).json({
      success: true,
      companies: companyEmployeeCounts,
    });
  } catch (error) {
    console.error(
      "Get company employee count error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


// Get total leave request status count
export const getLeaveRequestStatusCount = async (req, res) => {
  try {
    const [pending, approved, rejected] = await Promise.all([
      LeaveRequest.countDocuments({ status: "Pending" }),

      LeaveRequest.countDocuments({ status: "Approved" }),

      LeaveRequest.countDocuments({ status: "Rejected" }),
    ]);

    return res.status(200).json({
      success: true,
      pending,
      approved,
      rejected,
      total: pending + approved + rejected,
    });

  } catch (error) {
    console.error(
      "Get leave request status count error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get employee count for each company department
export const getDepartmentEmployeeCount = async (req, res) => {
  try {
    const departments = await Department.find({
      status: "active",
    })
      .select("_id departmentName companyId")
      .populate("companyId", "companyName")
      .lean();

    const departmentEmployeeCounts = await Promise.all(
      departments.map(async (department) => {
        const employeeCount = await Employee.countDocuments({
          companyId: department.companyId._id,
          departmentId: department._id,
          status: "active",
        });

        return {
          companyId: department.companyId._id,
          companyName: department.companyId.companyName,

          departmentId: department._id,
          departmentName: department.departmentName,

          employeeCount,
        };
      })
    );

    return res.status(200).json({
      success: true,
      departments: departmentEmployeeCounts,
    });

  } catch (error) {
    console.error(
      "Get department employee count error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get payroll generated count month-wise
export const getMonthlyPayrollCount = async (req, res) => {
  try {
    const monthlyPayroll = await Payroll.aggregate([
      {
        $group: {
          _id: {
            year: "$year",
            month: "$month",
          },
          payrollCount: {
            $sum: 1,
          },
        },
      },

      {
        $sort: {
          "_id.year": 1,
          "_id.month": 1,
        },
      },
    ]);

    const result = monthlyPayroll.map((item) => ({
      year: item._id.year,
      month: item._id.month,
      payrollCount: item.payrollCount,
    }));

    return res.status(200).json({
      success: true,
      payroll: result,
    });

  } catch (error) {
    console.error(
      "Get monthly payroll count error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get total employee count
export const getTotalEmployeeCount = async (req, res) => {
  try {
    const employeeCount = await Employee.countDocuments();

    return res.status(200).json({
      success: true,
      employeeCount,
    });

  } catch (error) {
    console.error(
      "Get total employee count error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};