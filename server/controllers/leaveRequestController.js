import Holiday from "../models/Holiday.js";
import LeaveRequest from "../models/LeaveRequest.js";
import RejectedLeave from "../models/RejectedLeave.js";
import Employee from "../models/employeeModel.js";

export const applyLeave = async (req, res) => {
  try {
    const employeeId = req.user._id;

    const {
      leaveType,
      fromDate,
      toDate,
      reason,
      compOffWorkDate,
    } = req.body;

    const employee = await Employee.findById(employeeId);

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: "Employee not found",
      });
    }

    const allowedLeaveTypes = [
      "Casual Leave",
      "Sick Leave",
      "Compensatory Off",
    ];

    if (
      !allowedLeaveTypes.includes(
        leaveType
      )
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid leave type",
      });
    }

    // Calculate leave days
    const startDate =
      new Date(fromDate);

    const endDate =
      new Date(toDate);

    const leaveDays =
      Math.floor(
        (endDate - startDate) /
          (1000 * 60 * 60 * 24)
      ) + 1;

    if (leaveDays <= 0) {
      return res.status(400).json({
        success: false,
        message:
          "To Date must be greater than or equal to From Date",
      });
    }

    if (
      leaveType ===
      "Compensatory Off"
    ) {
      if (!compOffWorkDate) {
        return res.status(400).json({
          success: false,
          message:
            "Worked date is required for Comp Off",
        });
      }

      const day = new Date(
        compOffWorkDate
      ).getDay();

      // Sunday = 0, Saturday = 6
      if (day !== 0 && day !== 6) {
        return res.status(400).json({
          success: false,
          message:
            "Selected worked date must be Saturday or Sunday",
        });
      }
    }

    let warningMessage = "";

let remainingCasualLeave = 6;
let remainingSickLeave = 6;

const currentYear = new Date(fromDate).getFullYear();

if (leaveType === "Casual Leave") {
  const casualLeaves =
    await LeaveRequest.find({
      employeeId,
      leaveType: "Casual Leave",
    });

  const totalUsedCasualLeave =
    casualLeaves
      .filter(
        (leave) =>
          new Date(
            leave.fromDate
          ).getFullYear() === currentYear
      )
      .reduce(
        (sum, leave) =>
          sum + leave.leaveDays,
        0
      );

  remainingCasualLeave = Math.max( 0, 6 - totalUsedCasualLeave - leaveDays );
}

if (leaveType === "Sick Leave") {
  const sickLeaves =
    await LeaveRequest.find({
      employeeId,
      leaveType: "Sick Leave",
    });

  const totalUsedSickLeave =
    sickLeaves
      .filter(
        (leave) =>
          new Date(
            leave.fromDate
          ).getFullYear() === currentYear
      )
      .reduce(
        (sum, leave) =>
          sum + leave.leaveDays,
        0
      );

  remainingSickLeave = Math.max( 0, 6 - totalUsedSickLeave - leaveDays );
}

    const leaveRequest =
      await LeaveRequest.create({
        employeeId,
        companyId:
          employee.companyId,
        departmentId:
          employee.departmentId,
        leaveType,
        fromDate,
        toDate,
        leaveDays,
        remainingCasualLeave,
        remainingSickLeave,
        reason,
        compOffWorkDate:
          leaveType ===
          "Compensatory Off"
            ? compOffWorkDate
            : "",
      });

    return res.status(201).json({
      success: true,
      message: "Leave request submitted successfully",
      warningMessage,
      leaveRequest,
    });
  } catch (error) {
    console.log(error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Approve Leave
export const approveLeave = async (req, res) => {
  try {
    const { leaveId } = req.params;
    const { adminRemark } = req.body;
    const leave = await LeaveRequest.findById(leaveId);
    if (!leave) {
      return res.status(404).json({
        success: false,
        message: "Leave request not found",
      });
    }
    if (leave.status !== "Pending") {
      return res.status(400).json({
        success: false,
        message:
          "Leave request already processed",
      });
    }
    leave.status = "Approved";
    leave.adminRemark = adminRemark || "";
    await leave.save();
    return res.status(200).json({
      success: true,
      message: "Leave approved successfully",
      leave,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Reject Leave
export const rejectLeave =
async (req, res) => {
  try {
    const { leaveId } = req.params;

    const {
      adminRemark,
    } = req.body;

    const leave =
      await LeaveRequest.findById(
        leaveId
      );

    if (!leave) {
      return res.status(404).json({
        success: false,
        message:
          "Leave request not found",
      });
    }

    await RejectedLeave.create({
      employeeId:
        leave.employeeId,

      companyId:
        leave.companyId,

      departmentId:
        leave.departmentId,

      leaveType:
        leave.leaveType,

      compOffWorkDate:
        leave.compOffWorkDate,

      fromDate:
        leave.fromDate,

      toDate:
        leave.toDate,

      leaveDays:
        leave.leaveDays,

      remainingCasualLeave:
        leave.remainingCasualLeave,

      remainingSickLeave:
        leave.remainingSickLeave,

      reason:
        leave.reason,

      adminRemark:
        adminRemark || "",
    });

    await LeaveRequest.findByIdAndDelete(
      leaveId
    );

    return res.status(200).json({
      success: true,
      message: "Leave rejected successfully",
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getAllLeaveRequests = async (req, res) => {
  try {
    const leaves = await LeaveRequest.find()
        .populate({
          path: "employeeId",
          select: "name empId email",
        })
        .populate({
          path: "companyId",
          select: "companyName",
        })
        .populate({
          path: "departmentId",
          select: "departmentName",
        })
        .sort({
          createdAt: -1,
        });

    return res.status(200).json({
      success: true,
      totalLeaves:
        leaves.length,
      leaves,
    });

  } catch (error) {
    console.log(error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getPendingLeaves =
async (req, res) => {
  try {

    const leaves =
      await LeaveRequest.find({
        status: "Pending",
      })

        .populate({
          path: "employeeId",
          select:
            "name empId email",
        })

        .populate({
          path: "departmentId",
          select:
            "departmentName",
        })

        .sort({
          createdAt: -1,
        });

    return res.status(200).json({
      success: true,
      totalLeaves:
        leaves.length,
      leaves,
    });

  } catch (error) {
    console.log(error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getMyLeaves =
async (req, res) => {
  try {
    const employeeId = req.user._id;

    const leaves =
      await LeaveRequest.find({
        employeeId,
      }).sort({
        createdAt: -1,
      });

    return res.status(200).json({
      success: true,
      totalLeaves:
        leaves.length,
      leaves,
    });

  } catch (error) {
    console.log(error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Employee Withdraw Leave Request
export const withdrawLeaveRequest =
  async (req, res) => {
    try {
      const { leaveId } = req.params;

      const employeeId =
        req.user._id;

      const leave =
        await LeaveRequest.findOne({
          _id: leaveId,
          employeeId,
        });

      if (!leave) {
        return res.status(404).json({
          success: false,
          message:
            "Leave request not found",
        });
      }

      if (
        leave.status !== "Pending"
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Only pending leave requests can be withdrawn",
        });
      }

      await LeaveRequest.findByIdAndDelete(
        leaveId
      );

      return res.status(200).json({
        success: true,
        message:
          "Leave request withdrawn successfully",
      });
    } catch (error) {
      console.log(error);

      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  };


export const getMyRejectedLeaves =
  async (req, res) => {
    try {
      const employeeId =
        req.user._id;

      const leaves =
        await RejectedLeave.find({
          employeeId,
        }).sort({
          rejectedAt: -1,
        });

      return res.status(200).json({
        success: true,
        totalLeaves:
          leaves.length,
        leaves,
      });

    } catch (error) {
      console.log(error);

      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  };

  export const getAllHolidays = async (req, res) => {
  try {
    const holidays = await Holiday.find()
      .sort({ holidayDate: 1 });

    return res.status(200).json({
      success: true,
      totalHolidays: holidays.length,
      holidays,
    });

  } catch (error) {
    console.log(error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};