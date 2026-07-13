import SuperAdmin from "../models/superAdminModel.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import Attendance from "../models/attendanceModel.js";
import Employee from "../models/employeeModel.js";
import sendEmail from "../utils/sendEmail.js";
import Company from "../models/companyModel.js";
import LeaveRequest from "../models/LeaveRequest.js";
import RejectedLeave from "../models/RejectedLeave.js";
import Holiday from "../models/Holiday.js";
import EmployeeLeaveBalance from "../models/EmployeeLeaveBalance.js";
import Department from "../models/departmentModel.js";

// Create Super Admin
export const createSuperAdmin = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const existing = await SuperAdmin.findOne({
      email,
    });

    if (existing) {
      return res.status(400).json({
        success: false,
        message: "Super Admin already exists",
      });
    }

    const hashedPassword =
      await bcrypt.hash(password, 10);

    const admin = await SuperAdmin.create({
      name,
      email,
      password: hashedPassword,
      profilePic: req.file
        ? req.file.filename
        : "",
    });

    return res.status(201).json({
      success: true,
      message:
        "Super Admin created successfully",

      admin: {
        _id: admin._id,
        name: admin.name,
        email: admin.email,
        profilePic: admin.profilePic,
        role: admin.role,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getSuperAdminProfile = async (req, res) => {
  try {
    const superAdmin = await SuperAdmin.findById(
      req.admin._id
    ).select("-password -resetOtp -resetOtpExpire");

    if (!superAdmin) {
      return res.status(404).json({
        success: false,
        message: "Super Admin not found",
      });
    }

    return res.status(200).json({
      success: true,
      superAdmin,
    });
  } catch (error) {
    console.log(error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const updateSuperAdminProfile = async (
  req,
  res
) => {
  try {
    const superAdmin =
      await SuperAdmin.findById(req.admin._id);

    if (!superAdmin) {
      return res.status(404).json({
        success: false,
        message: "Super Admin not found",
      });
    }

    const { name, email } = req.body;

    // -----------------------
    // Name
    // -----------------------

    if (name) {
      superAdmin.name = name.trim();
    }

    // -----------------------
    // Email
    // -----------------------

    if (
      email &&
      email !== superAdmin.email
    ) {
      const existingEmail =
        await SuperAdmin.findOne({
          email: email.toLowerCase(),
          _id: { $ne: req.admin._id },
        });

      if (existingEmail) {
        return res.status(400).json({
          success: false,
          message: "Email already exists",
        });
      }

      superAdmin.email =
        email.toLowerCase();
    }

    // -----------------------
    // Profile Picture
    // -----------------------

    if (req.file) {
      superAdmin.profilePic =
        req.file.filename;
    }

    await superAdmin.save();

    const updatedAdmin =
      await SuperAdmin.findById(
        req.admin._id
      ).select(
        "-password -resetOtp -resetOtpExpire"
      );

    return res.status(200).json({
      success: true,
      message:
        "Profile updated successfully",
      superAdmin: updatedAdmin,
    });
  } catch (error) {
    console.log(error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Login
export const loginSuperAdmin = async (
  req,
  res
) => {
  try {
    const { email, password } = req.body;

    const admin =
      await SuperAdmin.findOne({
        email,
      });

    if (!admin) {
      return res.status(404).json({
        success: false,
        message: "Admin not found",
      });
    }

    const isMatch =
      await bcrypt.compare(
        password,
        admin.password
      );

    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    const token = jwt.sign(
      {
        _id: admin._id,
        role: admin.role,
      },
      "secretkey",
      {
        expiresIn: "7d",
      }
    );

    res.cookie("token", token, {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.status(200).json({
      success: true,
      message:
        "Login successful",

      user: {
        _id: admin._id,
        name: admin.name,
        email: admin.email,
        profilePic:
          admin.profilePic,
        role: admin.role,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Logout
export const logoutSuperAdmin =
  async (req, res) => {
    try {
      res.clearCookie(
        "token"
      );

      return res
        .status(200)
        .json({
          success: true,
          message:
            "Logout successful",
        });
    } catch (error) {
      return res
        .status(500)
        .json({
          success: false,
          message:
            error.message,
        });
    }
  };

export const getAttendanceByDate = async (req, res) => {
  try {
    const { date } = req.body; // "2026-06-13"

    const [year, month, day] = date.split("-").map(Number);

    // IST day start -> UTC
    const startUTC = new Date(
      Date.UTC(year, month - 1, day - 1, 18, 30, 0, 0)
    );

    // IST day end -> UTC
    const endUTC = new Date(
      Date.UTC(year, month - 1, day, 18, 29, 59, 999)
    );

    const attendance = await Attendance.find({
      date: {
        $gte: startUTC,
        $lte: endUTC,
      },
    }).populate({
      path: "employeeId",
      select: "name empId email",
    });

    const shiftSummary = {
      day: attendance.filter((a) => a.shift === "day").length,
      afternoon: attendance.filter((a) => a.shift === "afternoon").length,
      night: attendance.filter((a) => a.shift === "night").length,
    };

    const converted = attendance.map((item) => {
      const obj = item.toObject();

      obj.date = new Date(obj.date).toLocaleDateString("en-IN", {
        timeZone: "Asia/Kolkata",
      });

      obj.createdAt = new Date(obj.createdAt).toLocaleString("en-IN", {
        timeZone: "Asia/Kolkata",
      });

      obj.updatedAt = new Date(obj.updatedAt).toLocaleString("en-IN", {
        timeZone: "Asia/Kolkata",
      });

      return obj;
    });
    console.log(converted);
    

    return res.status(200).json({
      success: true,
      shiftSummary,
      attendance: converted,
    });
  } catch (error) {
    console.log(error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getEmployeeMonthlyAttendance = async (req, res) => {
  try {
    const { employeeId, month, year } = req.body;

    const employee = await Employee.findById(employeeId);

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: "Employee not found",
      });
    }

    const startDate = new Date(Date.UTC(
      Number(year),
      Number(month) - 1,
      1,
      0, 0, 0, 0
    ));

    const endDate = new Date(Date.UTC(
      Number(year),
      Number(month),
      0,
      23, 59, 59, 999
    ));

    const attendance = await Attendance.find({
      employeeId,
      date: {
        $gte: startDate,
        $lte: endDate,
      },
    }).sort({ date: 1 });

    const shiftSummary = {
  day: attendance.filter(a => a.shift === "day").length,
  afternoon: attendance.filter(a => a.shift === "afternoon").length,
  night: attendance.filter(a => a.shift === "night").length,
};

    const monthlyAttendance = attendance.map((item) => {
      const obj = item.toObject();

      obj.date = new Date(obj.date).toLocaleDateString("en-IN", {
        timeZone: "Asia/Kolkata",
      });

      obj.createdAt = new Date(obj.createdAt).toLocaleString("en-IN", {
        timeZone: "Asia/Kolkata",
      });

      obj.updatedAt = new Date(obj.updatedAt).toLocaleString("en-IN", {
        timeZone: "Asia/Kolkata",
      });

      return obj;
    });

return res.status(200).json({
  success: true,

  employee: {
    _id: employee._id,
    name: employee.name,
    empId: employee.empId,
  },

  totalDays: monthlyAttendance.length,

  shiftSummary,

  attendance: monthlyAttendance,
});

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getAllMonthlyAttendance = async (req, res) => {
  try {
    const { companyId, month, year } = req.body;

    const company = await Company.findById(companyId);

    if (!company) {
      return res.status(404).json({
        success: false,
        message: "Company not found",
      });
    }

    const employees = await Employee.find({
      companyId,
    }).select("name empId");

    const startDate = new Date(
      Date.UTC(
        Number(year),
        Number(month) - 1,
        1,
        0,
        0,
        0,
        0
      )
    );

    const endDate = new Date(
      Date.UTC(
        Number(year),
        Number(month),
        0,
        23,
        59,
        59,
        999
      )
    );

    const attendance = await Attendance.find({
      employeeId: {
        $in: employees.map((e) => e._id),
      },
      date: {
        $gte: startDate,
        $lte: endDate,
      },
    });

    const totalDays = new Date(
      Number(year),
      Number(month),
      0
    ).getDate();

    const attendanceMap = {};

attendance.forEach((att) => {
  const empId = att.employeeId.toString();

  const day = new Date(att.date).toLocaleDateString(
    "en-IN",
    {
      timeZone: "Asia/Kolkata",
      day: "numeric",
    }
  );

  if (!attendanceMap[empId]) {
    attendanceMap[empId] = {};
  }

  attendanceMap[empId][day] = {
    shift: att.shift || "-",
    checkInTime: att.checkInTime || "-",
    checkOutTime: att.checkOutTime || "-",
    timing: att.timing || "-",
  };
});

    const tableData = employees.map((employee) => {
      const row = {
        employeeId: employee._id,
        empId: employee.empId,
        employeeName: employee.name,
      };

    for (let day = 1; day <= totalDays; day++) {
      row[day] =
        attendanceMap[
          employee._id.toString()
        ]?.[day] || {
          shift: "-",
          checkInTime: "-",
          checkOutTime: "-",
          timing: "-",
        };
    }

      return row;
    });

    return res.status(200).json({
      success: true,

      company: {
        _id: company._id,
        companyName: company.companyName,
      },

      month,
      year,

      totalDays,

      employeesCount:
        employees.length,

      tableData,
    });
  } catch (error) {
    console.log(error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const forgotPasswordSuperAdmin = async (
  req,
  res
) => {
  try {
    const { email } = req.body;

    const admin = await SuperAdmin.findOne({
      email,
    });

    if (!admin) {
      return res.status(404).json({
        success: false,
        message: "Admin not found",
      });
    }

    const otp = Math.floor(
      100000 + Math.random() * 900000
    ).toString();

    admin.resetOtp = otp;

    admin.resetOtpExpire =
      Date.now() + 10 * 60 * 1000;

    await admin.save();

    await sendEmail(
      admin.email,
      "Super Admin Password Reset OTP",
      `
        <h2>Password Reset</h2>
        <p>Your OTP is:</p>
        <h1>${otp}</h1>
        <p>Valid for 10 minutes.</p>
      `
    );

    return res.status(200).json({
      success: true,
      message: "OTP sent successfully",
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const verifySuperAdminOtp = async (
  req,
  res
) => {
  try {
    const { email, otp } = req.body;

    const admin = await SuperAdmin.findOne({
      email,
    });

    if (
      !admin ||
      admin.resetOtp !== otp
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid OTP",
      });
    }

    if (
      admin.resetOtpExpire < Date.now()
    ) {
      return res.status(400).json({
        success: false,
        message: "OTP expired",
      });
    }

    return res.status(200).json({
      success: true,
      message: "OTP verified",
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const resetSuperAdminPassword =
  async (req, res) => {
    try {
      const {
        email,
        otp,
        newPassword,
      } = req.body;

      const admin =
        await SuperAdmin.findOne({
          email,
        });

      if (
        !admin ||
        admin.resetOtp !== otp
      ) {
        return res.status(400).json({
          success: false,
          message: "Invalid OTP",
        });
      }

      if (
        admin.resetOtpExpire <
        Date.now()
      ) {
        return res.status(400).json({
          success: false,
          message: "OTP expired",
        });
      }

      const hashedPassword =
        await bcrypt.hash(
          newPassword,
          10
        );

      admin.password =
        hashedPassword;

      admin.resetOtp = "";

      admin.resetOtpExpire =
        null;

      await admin.save();

      return res.status(200).json({
        success: true,
        message:
          "Password reset successful",
      });

    } catch (error) {
      return res.status(500).json({
        success: false,
        message:
          error.message,
      });
    }
  };

  export const resendSuperAdminOtp =
  async (req, res) => {
    try {
      const { email } = req.body;

      const admin =
        await SuperAdmin.findOne({
          email,
        });

      if (!admin) {
        return res.status(404).json({
          success: false,
          message: "Admin not found",
        });
      }

      const otp = Math.floor(
        100000 +
          Math.random() * 900000
      ).toString();

      admin.resetOtp = otp;

      admin.resetOtpExpire =
        Date.now() +
        10 * 60 * 1000;

      await admin.save();

      await sendEmail(
        email,
        "New OTP",
        `<h1>${otp}</h1>`
      );

      return res.status(200).json({
        success: true,
        message:
          "OTP resent successfully",
      });

    } catch (error) {
      return res.status(500).json({
        success: false,
        message:
          error.message,
      });
    }
  };

export const getMonthWeeks = async (req, res) => {
  try {
    const { month, year } = req.body;

    const totalDays = new Date(
      Number(year),
      Number(month),
      0
    ).getDate();

    const weeks = [];

    let currentWeek = [];
    let weekNo = 1;

    for (let day = 1; day <= totalDays; day++) {
      const date = new Date(
        Number(year),
        Number(month) - 1,
        day
      );

      currentWeek.push(day);

      if (
        date.getDay() === 6 ||
        day === totalDays
      ) {
        weeks.push({
          weekNo,
          days: [...currentWeek],
          startDay: currentWeek[0],
          endDay:
            currentWeek[
              currentWeek.length - 1
            ],
        });

        weekNo++;
        currentWeek = [];
      }
    }

    return res.status(200).json({
      success: true,
      weeks,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getWeeklyAttendance = async (req, res) => {
  try {
    const {
      companyId,
      month,
      year,
      weekNo,
    } = req.body;

    if (
      !companyId ||
      !month ||
      !year ||
      !weekNo
    ) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields",
      });
    }

    // Company এর সব employee
    const employees = await Employee.find({
      companyId,
    }).select(
      "name empId departmentId"
    );

    const totalDays = new Date(
      Number(year),
      Number(month),
      0
    ).getDate();

    const weeks = [];
    let currentWeek = [];

    for (
      let day = 1;
      day <= totalDays;
      day++
    ) {
      const date = new Date(
        Number(year),
        Number(month) - 1,
        day
      );

      currentWeek.push(day);

      if (
        date.getDay() === 6 ||
        day === totalDays
      ) {
        weeks.push([...currentWeek]);
        currentWeek = [];
      }
    }

    const selectedWeek =
      weeks[Number(weekNo) - 1];

    if (!selectedWeek) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid week selected",
      });
    }

    const startDate = new Date(
      Number(year),
      Number(month) - 1,
      selectedWeek[0]
    );

    startDate.setHours(
      0,
      0,
      0,
      0
    );

    const endDate = new Date(
      Number(year),
      Number(month) - 1,
      selectedWeek[
        selectedWeek.length - 1
      ]
    );

    endDate.setHours(
      23,
      59,
      59,
      999
    );

    const attendance =
      await Attendance.find({
        employeeId: {
          $in: employees.map(
            (e) => e._id
          ),
        },
        date: {
          $gte: startDate,
          $lte: endDate,
        },
      });

    const attendanceMap = {};

    attendance.forEach((att) => {
      const empId =
        att.employeeId.toString();

      const day = new Date(
        att.date
      ).getDate();

      if (!attendanceMap[empId]) {
        attendanceMap[empId] = {};
      }

      attendanceMap[empId][day] = {
        shift: att.shift,
        checkInTime:
          att.checkInTime,
        checkOutTime:
          att.checkOutTime,
        status: att.status,
        timing: att.timing,
      };
    });

    const tableData =
      employees.map((emp) => {
        const row = {
          employeeId: emp._id,
          empId: emp.empId,
          employeeName: emp.name,
          departmentId:
            emp.departmentId,
        };

      selectedWeek.forEach((day) => {
        const dateKey = new Date(
          Number(year),
          Number(month) - 1,
          day
        ).toISOString().split("T")[0];
      
        row[dateKey] = attendanceMap[
            emp._id.toString()
          ]?.[day] || null;
      });

        return row;
      });

const weekDates = selectedWeek.map(
  (day) =>
    new Date(
      Number(year),
      Number(month) - 1,
      day
    )
      .toISOString()
      .split("T")[0]
);

return res.status(200).json({
  success: true,
  companyId,
  weekNo,
  days: weekDates,
  totalEmployees:
    employees.length,
  tableData,
});
  } catch (error) {
    console.error(
      "Weekly Attendance Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getEmployeeByIdForAdmin = async (
  req,
  res
) => {
  try {
    const { employeeId } = req.body;

    if (!employeeId) {
      return res.status(400).json({
        success: false,
        message: "Employee ID is required",
      });
    }

    const employee =
      await Employee.findById(
        employeeId
      )
    .populate("companyId")
    .populate("departmentId")
    .select("-password");

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: "Employee not found",
      });
    }

    return res.status(200).json({
      success: true,
      employee,
    });
  } catch (error) {
    console.log(error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getEmployeeLeaveSummary = async (
  req,
  res
) => {
  try {
    const { employeeId } = req.body;

    if (!employeeId) {
      return res.status(400).json({
        success: false,
        message: "Employee ID is required",
      });
    }

    const approvedLeaves = await LeaveRequest.find({employeeId, status: "Approved",
      }).sort({
        createdAt: -1,
      });

    const approvedLeaveCount = approvedLeaves.length;

    let remainingCasualLeave = 6;
    let remainingSickLeave = 6;

    if (approvedLeaveCount > 0) {
      remainingCasualLeave = approvedLeaves[0].remainingCasualLeave;
      remainingSickLeave = approvedLeaves[0].remainingSickLeave;
    }

    return res.status(200).json({
      success: true,
      approvedLeaveCount,
      remainingCasualLeave,
      remainingSickLeave,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getRejectedLeaveCount = async (req, res) => {
  try {
    const { employeeId } = req.body;

    if (!employeeId) {
      return res.status(400).json({
        success: false,
        message: "Employee ID is required",
      });
    }

    const rejectedLeaveCount =
      await RejectedLeave.countDocuments({
        employeeId,
      });

    return res.status(200).json({
      success: true,
      employeeId,
      rejectedLeaveCount,
    });

  } catch (error) {
    console.log(error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const formatLeave = (leave) => {
  const normalLeaveDates = leave.leaveDetails?.leaveDates || [];
  const extraLeaveDates = leave.extraLeaveDetails?.extraLeaveDates || [];

  // FIX 1: merge instead of either/or, so no dates get dropped
  const allDates = [...normalLeaveDates, ...extraLeaveDates];

  const sortedDates = [...allDates].sort(
    (a, b) => new Date(a.date) - new Date(b.date)
  );

  const fromDate = sortedDates[0]?.date || "";
  const toDate = sortedDates[sortedDates.length - 1]?.date || "";

  const normalLeaveDays = normalLeaveDates.reduce(
    (sum, item) => sum + item.duration,
    0
  );
  const extraLeaveDays = extraLeaveDates.reduce(
    (sum, item) => sum + item.duration,
    0
  );
  const leaveDays = normalLeaveDays + extraLeaveDays;

  // FIX 2: build the type list from BOTH normal and extra allocations
  const types = [];

  if (leave.leaveDetails?.leaveType?.casualLeave > 0) {
    types.push("Casual Leave");
  }
  if (leave.leaveDetails?.leaveType?.sickLeave > 0) {
    types.push("Sick Leave");
  }
  if (leave.leaveDetails?.leaveType?.paidLeave > 0) {
    types.push("Paid Leave");
  }
  if (leave.leaveDetails?.leaveType?.compOff > 0) {
    types.push("Comp Off");
  }

  if (leave.extraLeaveDetails?.extraLeaveType?.casualLeave > 0) {
    types.push("Extra Casual Leave");
  }
  if (leave.extraLeaveDetails?.extraLeaveType?.sickLeave > 0) {
    types.push("Extra Sick Leave");
  }

  // fallback: extra dates exist but neither casual/sick flag was set > 0
  if (types.length === 0 && extraLeaveDates.length > 0) {
    types.push("Extra Leave");
  }

  const leaveType = types.join(", ");

  return {
    _id: leave._id,
    leaveType,
    fromDate,
    toDate,
    leaveDays,
    normalLeaveDays,
    extraLeaveDays,
    reason: leave.reason,
    adminRemark: leave.adminRemark,
  };
};

export const getApprovedLeavesByEmployee = async (req, res) => {
  try {
    const { employeeId } = req.body;

    if (!employeeId) {
      return res.status(400).json({
        success: false,
        message: "Employee ID is required",
      });
    }

    const approvedLeaves = await LeaveRequest.find({
      employeeId,
      status: "Approved",
    }).sort({ updatedAt: -1 });

    const formattedLeaves = approvedLeaves.map((leave) => ({
      ...formatLeave(leave),
      approvedAt: leave.updatedAt,
      remainingCasualLeave: leave.remainingCasualLeave,
      remainingSickLeave: leave.remainingSickLeave,
      remainingPaidLeave: leave.remainingPaidLeave,
    }));

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

export const getRejectedLeavesByEmployee = async (req, res) => {
  try {
    const { employeeId } = req.body;

    if (!employeeId) {
      return res.status(400).json({
        success: false,
        message: "Employee ID is required",
      });
    }

    const rejectedLeaves = await LeaveRequest.find({
      employeeId,
      status: "Rejected",
    }).sort({ updatedAt: -1 });

    const formattedLeaves = rejectedLeaves.map((leave) => ({
      ...formatLeave(leave),
      rejectedAt: leave.updatedAt,
    }));

    return res.status(200).json({
      success: true,
      totalRejectedLeaves: formattedLeaves.length,
      rejectedLeaves: formattedLeaves,
    });
  } catch (error) {
    console.log(error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const createHoliday = async (req, res) => {
  try {
    const { holidayName, holidayDate, description } = req.body;

    if (!holidayName || !holidayDate) {
      return res.status(400).json({
        success: false,
        message: "Holiday name and date are required",
      });
    }

    const selectedDate = new Date(holidayDate);

    const today = new Date();

    today.setHours(0, 0, 0, 0);

    selectedDate.setHours(0, 0, 0, 0);

    if (selectedDate < today) {
      return res.status(400).json({
        success: false,
        message: "Past date cannot be marked as holiday",
      });
    }

    const existingHoliday = await Holiday.findOne({
      holidayDate: selectedDate,
    });

    if (existingHoliday) {
      return res.status(400).json({
        success: false,
        message: "Holiday already exists on this date",
      });
    }

    const holiday = await Holiday.create({
      holidayName,
      holidayDate: selectedDate,
      description,
      createdBy: req.user?._id,
    });

    return res.status(201).json({
      success: true,
      message: "Holiday created successfully",
      holiday,
    });
  } catch (error) {
    console.log(error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getEmployeeLeaveCountsAndBalance =
  async (req, res) => {
    try {
      const { employeeId } = req.body;

      if (!employeeId) {
        return res.status(400).json({
          success: false,
          message: "Employee ID is required",
        });
      }

      const month =
        new Date().getMonth() + 1;

      const year =
        new Date().getFullYear();

      const approvedLeaveCount =
        await LeaveRequest.countDocuments({
          employeeId,
          status: "Approved",
        });

      const rejectedLeaveCount =
        await LeaveRequest.countDocuments({
          employeeId,
          status: "Rejected",
        });

      const leaveBalance =
        await EmployeeLeaveBalance.findOne({
          employeeId,
          month,
          year,
        });

      return res.status(200).json({
        success: true,

        approvedLeaveCount,
        rejectedLeaveCount,

        remainingCasualLeave:
          leaveBalance
            ?.remainingCasualLeave ?? 0,

        remainingSickLeave:
          leaveBalance
            ?.remainingSickLeave ?? 0,

        remainingPaidLeave:
          leaveBalance
            ?.remainingPaidLeave ?? 0,
      });
    } catch (error) {
      console.log(error);

      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  };
  
export const editEmployeeForSuperAdmin = async (req, res) => {
  try {
    const { employeeId, departmentId, role } = req.body;

    if (!employeeId) {
      return res.status(400).json({
        success: false,
        message: "Employee ID is required",
      });
    }

    const employee = await Employee.findById(employeeId);

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: "Employee not found",
      });
    }

    // Update Department
    if (departmentId) {
      const department = await Department.findOne({
        _id: departmentId,
        companyId: employee.companyId,
        status: "active",
      });

      if (!department) {
        return res.status(404).json({
          success: false,
          message: "Department not found for this company",
        });
      }

      employee.departmentId = department._id;
    }

    // Update Role
    if (role) {
      const allowedRoles = Employee.schema.path("role").enumValues;

      if (!allowedRoles.includes(role)) {
        return res.status(400).json({
          success: false,
          message: "Invalid role selected",
        });
      }

      employee.role = role;
    }

    await employee.save();

    const updatedEmployee = await Employee.findById(employeeId)
      .populate({
        path: "companyId",
        select: "-createdAt -updatedAt -__v",
      })
      .populate({
        path: "departmentId",
        select: "-createdAt -updatedAt -__v",
      })
      .select("-password");

    return res.status(200).json({
      success: true,
      message: "Employee updated successfully",
      employee: updatedEmployee,
    });
  } catch (error) {
    console.log(error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};