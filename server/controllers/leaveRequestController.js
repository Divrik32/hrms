import Holiday from "../models/Holiday.js";
import LeaveRequest from "../models/LeaveRequest.js";
import RejectedLeave from "../models/RejectedLeave.js";
import Employee from "../models/employeeModel.js";
import EmployeeLeaveBalance from "../models/EmployeeLeaveBalance.js";
import mongoose from "mongoose";

export const getCurrentLeaveBalance = async (req, res) => {
  try {
    const employeeId = req.user._id;
    const month = new Date().getMonth() + 1;
    const year = new Date().getFullYear();

    const leaveBalance = await EmployeeLeaveBalance.findOne({
      employeeId,
      month,
      year,
    });

    if (!leaveBalance) {
      return res.status(404).json({
        success: false,
        message: "Leave balance not found",
      });
    }

    return res.status(200).json({
      success: true,
      leaveBalance,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const createCurrentLeaveBalance = async () => {
  try {
    console.log("Checking employee leave balance...");

    const employees = await Employee.find();
    const month = new Date().getMonth() + 1;
    const year = new Date().getFullYear();

    for (const employee of employees) {
      const existing = await EmployeeLeaveBalance.findOne({
        employeeId: employee._id,
        month,
        year,
      });

      if (existing) continue;

      const lastBalance = await EmployeeLeaveBalance.findOne({
        employeeId: employee._id,
      }).sort({
        year: -1,
        month: -1,
      });

      await EmployeeLeaveBalance.create({
        employeeId: employee._id,
        companyId: employee.companyId,
        departmentId: employee.departmentId,
        month,
        year,
        remainingCasualLeave: lastBalance ? lastBalance.remainingCasualLeave + 0.5 : 0.5,
        remainingSickLeave: lastBalance ? lastBalance.remainingSickLeave + 0.5 : 0.5,
        remainingPaidLeave: lastBalance ? lastBalance.remainingPaidLeave + 0.5 : 0.5,
      });
    }

    console.log("Leave balance initialization completed");
  } catch (error) {
    console.log(error);
  }
};

export const applyLeave = async (req, res) => {
  try {
    const employeeId = req.user._id;
    const { leaveDetails, extraLeaveDetails, reason } = req.body;

    const employee = await Employee.findById(employeeId);

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: "Employee not found",
      });
    }
    
    let balance = null;

if (leaveDetails) {

  const firstLeaveDate = leaveDetails.leaveDates?.[0]?.date;

  if (!firstLeaveDate) {
    return res.status(400).json({
      success: false,
      message: "Please select at least one leave date.",
    });
  }

  const leaveMonth = new Date(firstLeaveDate).getMonth() + 1;
  const leaveYear = new Date(firstLeaveDate).getFullYear();

  balance = await EmployeeLeaveBalance.findOne({
    employeeId,
    month: leaveMonth,
    year: leaveYear,
  });

  if (!balance) {
    return res.status(404).json({
      success: false,
      message: "Leave balance not found",
    });
  }

}

    if (!leaveDetails && !extraLeaveDetails) {
      return res.status(400).json({
        success: false,
        message: "No leave selected",
      });
    }

    let casualRequested = 0;
    let sickRequested = 0;
    let paidRequested = 0;
    let compOffRequested = 0;
    let allLeaveDates = [];

    if (leaveDetails) {
      casualRequested = Number(leaveDetails.leaveType?.casualLeave || 0);
      sickRequested = Number(leaveDetails.leaveType?.sickLeave || 0);
      paidRequested = Number(leaveDetails.leaveType?.paidLeave || 0);
      compOffRequested = Number(leaveDetails.leaveType?.compOff || 0);

      if (casualRequested > balance.remainingCasualLeave) {
        return res.status(400).json({
          success: false,
          message: "Not enough Casual Leave",
        });
      }

      if (sickRequested > balance.remainingSickLeave) {
        return res.status(400).json({
          success: false,
          message: "Not enough Sick Leave",
        });
      }

      if (paidRequested > balance.remainingPaidLeave) {
        return res.status(400).json({
          success: false,
          message: "Not enough Paid Leave",
        });
      }

if (leaveDetails.leaveDates) {
  allLeaveDates = [...leaveDetails.leaveDates];

  const sortedDates = [...allLeaveDates].sort((a, b) => new Date(a.date) - new Date(b.date));

  for (let i = 0; i < sortedDates.length; i++) {
    if (sortedDates[i].date !== allLeaveDates[i].date) {
      return res.status(400).json({
        success: false,
        message: "Leave dates must be in ascending order",
      });
    }
  }

const dateMap = new Map();

for (const item of allLeaveDates) {

  if (!dateMap.has(item.date)) {
    dateMap.set(item.date, {
      totalDuration: 0,
      leaveTypes: new Set(),
    });
  }

  const current = dateMap.get(item.date);

  // Same leave type twice on same day
  if (current.leaveTypes.has(item.leaveType)) {
    return res.status(400).json({
      success: false,
      message: `${item.leaveType} selected multiple times on ${item.date}`,
    });
  }

  current.leaveTypes.add(item.leaveType);

  current.totalDuration += item.duration;

  // More than 1 day on same date
  if (current.totalDuration > 1) {
    return res.status(400).json({
      success: false,
      message: `Total leave exceeds 1 day on ${item.date}`,
    });
  }
}
}

// for (const item of allLeaveDates) {
//   if (existingDates.has(item.date)) {
//     return res.status(400).json({
//       success: false,
//       message: `Leave already exists on ${item.date}`,
//     });
//   }
// }

const totalLeaveDuration = allLeaveDates.reduce((sum, item) => sum + item.duration, 0);

const typeWiseDuration = {
  casualLeave: 0,
  sickLeave: 0,
  paidLeave: 0,
  compOff: 0,
};

allLeaveDates.forEach(item => {
  typeWiseDuration[item.leaveType] += item.duration;
});

if (
  typeWiseDuration.casualLeave !== casualRequested ||
  typeWiseDuration.sickLeave !== sickRequested ||
  typeWiseDuration.paidLeave !== paidRequested ||
  typeWiseDuration.compOff !== compOffRequested
) {
        return res.status(400).json({
          success: false,
          message: "Selected leave and leave dates do not match",
        });
      }

if (compOffRequested > 0) {

  if (!leaveDetails.compOffWorkDate) {
    return res.status(400).json({
      success: false,
      message: "Comp Off work date is required.",
    });
  }

  const existingCompOff = await LeaveRequest.findOne({
    employeeId,
    status: { $ne: "Rejected" },
    "leaveDetails.compOffWorkDate": leaveDetails.compOffWorkDate,
  });

  if (existingCompOff) {
    return res.status(400).json({
      success: false,
      message: `Comp Off work date ${leaveDetails.compOffWorkDate} has already been used.`,
    });
  }

}
    }

    let extraCasual = 0;
    let extraSick = 0;

    const hasExtraLeave =
  extraLeaveDetails?.extraLeaveDates?.some(
    item => item.date
  );

if (hasExtraLeave) {
      extraCasual = Number(extraLeaveDetails.extraLeaveType?.casualLeave || 0);
      extraSick = Number(extraLeaveDetails.extraLeaveType?.sickLeave || 0);

const extraDates = extraLeaveDetails.extraLeaveDates || [];

const totalExtraDuration = extraDates.reduce(
  (sum, item) => sum + item.duration,
  0
);

const duplicateExtra = new Map();

for (const item of extraDates) {

  if (!duplicateExtra.has(item.date)) {
    duplicateExtra.set(item.date, 0);
  }

  duplicateExtra.set(
    item.date,
    duplicateExtra.get(item.date) + item.duration
  );

  if (duplicateExtra.get(item.date) > 1) {
    return res.status(400).json({
      success: false,
      message: `Extra leave exceeds 1 day on ${item.date}`,
    });
  }

}

if (totalExtraDuration !== extraCasual + extraSick) {
  return res.status(400).json({
    success: false,
    message: "Extra leave duration mismatch",
  });
}
    }
const session = await mongoose.startSession();

let leaveRequest;

try {
  session.startTransaction();

  const existingLeaves = await LeaveRequest.find({
  employeeId,
  status: { $ne: "Rejected" },
});

const existingDates = new Set();

for (const leave of existingLeaves) {

  if (leave.leaveDetails?.leaveDates) {
    leave.leaveDetails.leaveDates.forEach(item => {
      existingDates.add(item.date);
    });
  }

  if (leave.extraLeaveDetails?.extraLeaveDates) {
    leave.extraLeaveDetails.extraLeaveDates.forEach(item => {
      existingDates.add(item.date);
    });
  }

}

// Check normal leave dates
for (const item of allLeaveDates) {
  if (existingDates.has(item.date)) {
    throw new Error(`Leave already exists on ${item.date}`);
  }
}

// Check extra leave dates
if (hasExtraLeave) {
  for (const item of extraLeaveDetails.extraLeaveDates) {
    if (existingDates.has(item.date)) {
      throw new Error(
        `Leave already exists on ${item.date}`
      );
    }
  }
}

  if (leaveDetails) {
    balance.remainingCasualLeave -= casualRequested;
    balance.remainingSickLeave -= sickRequested;
    balance.remainingPaidLeave -= paidRequested;

    await balance.save({ session });
  }

leaveRequest = await LeaveRequest.create(
  [{
    employeeId,
    companyId: employee.companyId,
    departmentId: employee.departmentId,

    leaveDetails: leaveDetails
      ? {
          leaveType: leaveDetails.leaveType,
          leaveDates: leaveDetails.leaveDates.map(item => ({
            date: item.date,
            duration: item.duration,
            leaveType:
              item.leaveType === "casualLeave"
                ? "Casual Leave"
                : item.leaveType === "sickLeave"
                ? "Sick Leave"
                : item.leaveType === "paidLeave"
                ? "Paid Leave"
                : "Compensatory Off",
          })),
          compOffWorkDate: leaveDetails.compOffWorkDate,
        }
      : undefined,

remainingCasualLeave: balance?.remainingCasualLeave ?? 0,
remainingSickLeave: balance?.remainingSickLeave ?? 0,
remainingPaidLeave: balance?.remainingPaidLeave ?? 0,

    extraLeaveDetails: extraLeaveDetails
      ? {
          extraLeaveType: extraLeaveDetails.extraLeaveType,
          extraLeaveDates: extraLeaveDetails.extraLeaveDates,
        }
      : undefined,

    reason,
  }],
  { session }
);

  await session.commitTransaction();
} catch (err) {
  await session.abortTransaction();
  throw err;
} finally {
  session.endSession();
}

leaveRequest = leaveRequest[0];

    return res.status(201).json({
      success: true,
      message: "Leave request submitted successfully",
      leaveRequest,
    });
  } catch (error) {
  console.log(error.errors);
  if (error.name === "ValidationError") {
    const firstError = Object.values(error.errors)[0];
    return res.status(400).json({
      success: false,
      message: firstError.message,
    });
  }
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
        message: `Leave already ${leave.status}`,
      });
    }

    leave.status = "Approved";

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
export const rejectLeave = async (req, res) => {
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
        message: `Leave already ${leave.status}`,
      });
    }

if (leave.leaveDetails?.leaveDates?.length) {
  const firstLeaveDate =
    leave.leaveDetails.leaveDates[0].date;

  const month = new Date(firstLeaveDate).getMonth() + 1;
  const year = new Date(firstLeaveDate).getFullYear();

  const balance = await EmployeeLeaveBalance.findOne({
    employeeId: leave.employeeId,
    month,
    year,
  });

  if (!balance) {
    return res.status(404).json({
      success: false,
      message: "Leave balance not found",
    });
  }

  leave.leaveDetails.leaveDates.forEach(item => {
    if (item.leaveType === "Casual Leave")
      balance.remainingCasualLeave += item.duration;

    if (item.leaveType === "Sick Leave")
      balance.remainingSickLeave += item.duration;

    if (item.leaveType === "Paid Leave")
      balance.remainingPaidLeave += item.duration;
  });

  await balance.save();
}

    leave.status = "Rejected";
    leave.adminRemark = adminRemark || "";

    await leave.save();

    return res.status(200).json({
      success: true,
      message: "Leave rejected successfully",
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

export const getAllMyLeaves = async (req, res) => {
  try {
    const employeeId = req.user._id;

    const leaves = await LeaveRequest.find({
      employeeId,
    }).sort({ createdAt: -1 }); // latest applied first

    const formattedLeaves = leaves.map((leave) => {
      const normalDates =
        leave.leaveDetails?.leaveDates || [];

      const extraDates =
        leave.extraLeaveDetails?.extraLeaveDates || [];

      const allDates = [
        ...normalDates,
        ...extraDates,
      ];

      // latest leave dates first
      const sortedDates = [...allDates].sort(
        (a, b) =>
          new Date(b.date) - new Date(a.date)
      );

      const totalDays = allDates.reduce(
        (sum, item) => sum + item.duration,
        0
      );

      return {
        _id: leave._id,

        leaveDates: sortedDates,

        leaveDetails: leave.leaveDetails,
        extraLeaveDetails:
          leave.extraLeaveDetails,

        totalDays,

        reason: leave.reason,
        status: leave.status,
        adminRemark: leave.adminRemark,

        remainingCasualLeave:
          leave.remainingCasualLeave,
        remainingSickLeave:
          leave.remainingSickLeave,
        remainingPaidLeave:
          leave.remainingPaidLeave,

        createdAt: leave.createdAt,
      };
    });

    return res.status(200).json({
      success: true,
      totalLeaves: formattedLeaves.length,
      leaves: formattedLeaves,
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
export const withdrawPendingLeaveRequest =
  async (req, res) => {
    try {
      const { leaveId } = req.params;
      const employeeId = req.user._id;

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

      if (
        leave.employeeId.toString() !==
        employeeId.toString()
      ) {
        return res.status(403).json({
          success: false,
          message:
            "Unauthorized access",
        });
      }

      if (
        leave.status !== "Pending"
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Only pending leave can be withdrawn",
        });
      }

      if (
        leave.leaveDetails
          ?.leaveDates?.length
      ) {
        const firstLeaveDate =
          leave.leaveDetails
            .leaveDates[0].date;

        const month =
          new Date(
            firstLeaveDate
          ).getMonth() + 1;

        const year =
          new Date(
            firstLeaveDate
          ).getFullYear();

        const balance =
          await EmployeeLeaveBalance.findOne(
            {
              employeeId,
              month,
              year,
            }
          );

        if (!balance) {
          return res.status(404).json({
            success: false,
            message:
              "Leave balance not found",
          });
        }

        leave.leaveDetails.leaveDates.forEach(
          (item) => {
            if (
              item.leaveType ===
              "Casual Leave"
            ) {
              balance.remainingCasualLeave +=
                item.duration;
            }

            if (
              item.leaveType ===
              "Sick Leave"
            ) {
              balance.remainingSickLeave +=
                item.duration;
            }

            if (
              item.leaveType ===
              "Paid Leave"
            ) {
              balance.remainingPaidLeave +=
                item.duration;
            }
          }
        );

        await balance.save();
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