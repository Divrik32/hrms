import Employee from "../models/employeeModel.js";
import Company from "../models/companyModel.js";
import Department from "../models/departmentModel.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import sendEmail from "../utils/sendEmail.js";
import path from "path";
import fs from "fs";
import RejectedLeave from "../models/RejectedLeave.js";

// Create Employee
export const createEmployee = async (
  req,
  res
) => {
  try {
    const {
      name,
      empId,
      phone,
      presentAddress,
      gender,
      email,
      password,
      role,
      companyId,
      departmentId,
    } = req.body;

    // check duplicate employee
    const existingEmployee =
      await Employee.findOne({
        $or: [
          { empId },
          { email },
        ],
      });

    if (
      existingEmployee
    ) {
      return res
        .status(400)
        .json({
          success:
            false,

          message:
            "Employee already exists",
        });
    }

    // company exists
    const company =
      await Company.findById(
        companyId
      );

    if (
      !company
    ) {
      return res
        .status(404)
        .json({
          success:
            false,

          message:
            "Company not found",
        });
    }

    // department exists
    const department =
      await Department.findById(
        departmentId
      );

    if (
      !department
    ) {
      return res
        .status(404)
        .json({
          success:
            false,

          message:
            "Department not found",
        });
    }

    // hash password
    const hashedPassword =
      await bcrypt.hash(
        password,
        10
      );

    // create employee
    const employee =
      await Employee.create(
        {
          name,

          empId,

          phone,

          presentAddress,

          gender,

          email,

          password:
            hashedPassword,

          role,

          companyId,

          departmentId,

          profilePic:
            req.file
              ? req.file
                  .filename
              : "",
        }
      );

    return res
      .status(201)
      .json({
        success:
          true,

        message:
          "Employee created successfully",

        employee,
      });
  } catch (
    error
  ) {
    console.log(
      error
    );

    return res
      .status(500)
      .json({
        success:
          false,

        message:
          error.message,
      });
  }
};

export const editEmployeeDetails = async (req, res) => {
  try {
    const employeeId = req.user._id;

    const {
      name,
      phone,
      presentAddress,
      gender,
      email,
    } = req.body;

    const employee = await Employee.findById(employeeId);

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: "Employee not found",
      });
    }

    // Email duplicate check
    if (email && email !== employee.email) {
      const existingEmail = await Employee.findOne({
        email,
        _id: { $ne: employeeId },
      });

      if (existingEmail) {
        return res.status(400).json({
          success: false,
          message: "Email already exists",
        });
      }
    }

    employee.name = name || employee.name;
    employee.phone = phone || employee.phone;
    employee.presentAddress = presentAddress || employee.presentAddress;
    employee.gender = gender || employee.gender;
    employee.email = email || employee.email;

if (req.file) {

  if (employee.profilePic) {

    const oldPath = path.join(
      "uploads",
      employee.profilePic
    );

    if (fs.existsSync(oldPath)) {
      fs.unlinkSync(oldPath);
    }
  }

  employee.profilePic = req.file.filename;
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
  message: "Employee details updated successfully",
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

// Get Employee By Id
export const getEmployeeById =
async (req, res) => {
  try {
    const employeeId = req.user._id;

    const employee =
      await Employee
        .findById(
          employeeId
        )
        .populate({
          path:
            "companyId",

          select:
            "-createdAt -updatedAt -__v",
        })
        .populate({
          path:
            "departmentId",

          select:
            "-createdAt -updatedAt -__v",
        })
        .select(
          "-password"
        );

    if (
      !employee
    ) {
      return res
        .status(404)
        .json({
          success:
            false,

          message:
            "Employee not found",
        });
    }

    return res
      .status(200)
      .json({
        success:
          true,

        employee,
      });
  } catch (
    error
  ) {
    console.log(
      error
    );

    return res
      .status(500)
      .json({
        success:
          false,

        message:
          error.message,
      });
  }
};

// Get All Employees Of Particular Company
export const getEmployeesByCompany =
async (req, res) => {
  try {
    const {
      companyId,
    } = req.params;

    // company exists?
    const company =
      await Company.findById(
        companyId
      );

    if (
      !company
    ) {
      return res
        .status(404)
        .json({
          success:
            false,

          message:
            "Company not found",
        });
    }

    const employees =
      await Employee
        .find({
          companyId,
        })

        .populate({
          path:
            "departmentId",

          select:
            "departmentName",
        })

        .select(
          "-password"
        )

        .sort({
          createdAt:
            -1,
        });

    return res
      .status(200)
      .json({
        success:
          true,

        totalEmployees:
          employees.length,

        company:
          company.companyName,

        employees,
      });
  } catch (
    error
  ) {
    console.log(
      error
    );

    return res
      .status(500)
      .json({
        success:
          false,

        message:
          error.message,
      });
  }
};

// Employee Login
export const loginEmployee = async (req, res) => {
  try {    
    const { email, password } = req.body;

    // find employee
    const employee = await Employee.findOne({ email });

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: "Employee not found",
      });
    }

    // check password
    const isMatch = await bcrypt.compare(
      password,
      employee.password
    );

    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    // create token
    const token = jwt.sign(
      {
        id: employee._id,
        role: employee.role,
        companyId: employee.companyId,
        departmentId: employee.departmentId,
      },
      "secretkey",
      {
        expiresIn: "7d",
      }
    );

    // set cookie
    res.cookie("employeeToken", token, {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.status(200).json({
      success: true,
      message: "Employee login successful",

      employee: {
        _id: employee._id,
        name: employee.name,
        email: employee.email,
        role: employee.role,
        companyId: employee.companyId,
        departmentId: employee.departmentId,
        profilePic: employee.profilePic,
      },

      token,
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const logoutEmployee = async (req, res) => {
  try {
    res.clearCookie("employeeToken", {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
    });

    return res.status(200).json({
      success: true,
      message: "Employee logout successful",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get All Employees Of Particular Department
export const getEmployeesByDepartment = async (
  req,
  res
) => {
  try {
    const { departmentId, } = req.params;

    const department =
      await Department.findById(
        departmentId
      );

    if (
      !department
    ) {
      return res.status(404).json({
        success: false,
        message: "Department not found",
      });
    }

    const employees =
      await Employee.find({
        departmentId,
      })
        .populate({
          path: "companyId",
          select: "companyName",
        })
        .select("-password")
        .sort({
          createdAt: -1,
        });

    return res.status(200).json({
      success: true,
      totalEmployees:
        employees.length,
      department:
        department.departmentName,
      employees,
    });

  } catch (error) {
    console.log(error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const forgotPassword =
  async (req, res) => {
    try {
      const { email } =
        req.body;

      const employee =
        await Employee.findOne({
          email,
        });

      if (!employee) {
        return res.status(404).json({
          success: false,
          message:
            "Employee not found",
        });
      }

      const otp =
        Math.floor(
          100000 +
            Math.random() *
              900000
        ).toString();

      employee.resetOtp =
        otp;

      employee.resetOtpExpire =
        Date.now() +
        10 * 60 * 1000;

      await employee.save();

      await sendEmail(
        employee.email,

        "Password Reset OTP",

        `
        <h2>Password Reset</h2>
        <p>Your OTP is:</p>
        <h1>${otp}</h1>
        <p>Valid for 10 minutes.</p>
      `
      );

      return res.status(200).json({
        success: true,
        message:
          "OTP sent successfully",
      });

    } catch (error) {
      return res.status(500).json({
        success: false,
        message:
          error.message,
      });
    }
  };

export const verifyOtp =
  async (req, res) => {
    try {
      const {
        email,
        otp,
      } = req.body;

      const employee =
        await Employee.findOne({
          email,
        });

      if (
        !employee ||
        employee.resetOtp !==
          otp
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid OTP",
        });
      }

      if (
        employee.resetOtpExpire <
        Date.now()
      ) {
        return res.status(400).json({
          success: false,
          message:
            "OTP expired",
        });
      }

      return res.status(200).json({
        success: true,
        message:
          "OTP verified",
      });

    } catch (error) {
      return res.status(500).json({
        success: false,
        message:
          error.message,
      });
    }
  };

export const resetPassword =
  async (req, res) => {
    try {
      const {
        email,
        otp,
        newPassword,
      } = req.body;

      const employee =
        await Employee.findOne({
          email,
        });

      if (
        !employee ||
        employee.resetOtp !==
          otp
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid OTP",
        });
      }

      if (
        employee.resetOtpExpire <
        Date.now()
      ) {
        return res.status(400).json({
          success: false,
          message:
            "OTP expired",
        });
      }

      const hashedPassword =
        await bcrypt.hash(
          newPassword,
          10
        );

      employee.password =
        hashedPassword;

      employee.resetOtp = "";

      employee.resetOtpExpire =
        null;

      await employee.save();

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

export const resendOtp =
  async (req, res) => {
    try {
      const { email } =
        req.body;

      const employee =
        await Employee.findOne({
          email,
        });

      if (!employee) {
        return res.status(404).json({
          success: false,
          message:
            "Employee not found",
        });
      }

      const otp =
        Math.floor(
          100000 +
            Math.random() *
              900000
        ).toString();

      employee.resetOtp =
        otp;

      employee.resetOtpExpire =
        Date.now() +
        10 * 60 * 1000;

      await employee.save();

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