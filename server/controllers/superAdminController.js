import SuperAdmin from "../models/superAdminModel.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import Attendance from "../models/attendanceModel.js";
import Employee from "../models/employeeModel.js";


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