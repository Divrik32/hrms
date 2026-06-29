import SuperAdmin from "../models/superAdminModel.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import Attendance from "../models/attendanceModel.js";
import Employee from "../models/employeeModel.js";
import sendEmail from "../utils/sendEmail.js";
import Company from "../models/companyModel.js";


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
        id: admin._id,
        role: admin.role,
      },
      "secretkey",
      {
        expiresIn: "1d",
      }
    );

    res.cookie("token", token, {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      maxAge:
        24 * 60 * 60 * 1000,
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

        selectedWeek.forEach(
          (day) => {
            row[day] =
              attendanceMap[
                emp._id.toString()
              ]?.[day] || null;
          }
        );

        return row;
      });

    return res.status(200).json({
      success: true,
      companyId,
      weekNo,
      days: selectedWeek,
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