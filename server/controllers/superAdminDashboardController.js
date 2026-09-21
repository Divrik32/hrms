import Company from "../models/companyModel.js";
import Employee from "../models/employeeModel.js";
import LeaveRequest from "../models/LeaveRequest.js";


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