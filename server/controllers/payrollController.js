import Payroll from "../models/payrollModel.js";
import { getDaysInMonth } from "../utils/calendarUtils.js";
import { getEmployeeLeaveSummary } from "../services/leaveSummaryService.js";
import { getEmployeeAbsentCount } from "../services/absentService.js";
import EmployeeSalary from "../models/employeeSalaryModel.js";

export const generatePayroll = async (req, res) => {
  try {
    const {
      employeeId,
      month,
      year,
    } = req.body;

    if (!employeeId || !month || !year) {
      return res.status(400).json({
        success: false,
        message: "Employee, Month and Year are required",
      });
    }

    // Salary Structure
    const salaryStructure = await EmployeeSalary.findOne({
      employeeId,
      status: "active",
    });

    if (!salaryStructure) {
      return res.status(404).json({
        success: false,
        message: "Salary structure not found",
      });
    }

    const companyId = salaryStructure.companyId;

    // Total Days
    const totalDays = getDaysInMonth(month, year);

    // Leave Summary
    const leaveSummary = await getEmployeeLeaveSummary(
      companyId,
      employeeId,
      month,
      year
    );

    // Absent Count
    const absentCount = await getEmployeeAbsentCount(
      companyId,
      employeeId,
      month,
      year
    );

    // Salary Calculation
    const inHandSalary = salaryStructure.inHandSalary;

    const perDaySalary = Number(
      (inHandSalary / totalDays).toFixed(2)
    );

    const unpaidLeaveDays =
      leaveSummary.unpaidLeave.extraCasualLeave +
      leaveSummary.unpaidLeave.extraSickLeave;

    const totalLOPDays =
      unpaidLeaveDays + absentCount;

    const deduction = Number(
      (perDaySalary * totalLOPDays).toFixed(2)
    );

    const payableSalary = Number(
      (inHandSalary - deduction).toFixed(2)
    );

    // Create Payroll
    const payroll = await Payroll.create({
      employeeId,
      companyId,
      month,
      year,
      totalDays,
      inHandSalary,
      ctc: salaryStructure.ctc,
      pf: salaryStructure.pf,
      esi: salaryStructure.esi,
      tax: salaryStructure.tax,
      perDaySalary,
      paidLeave: leaveSummary.paidLeave,
      unpaidLeave: leaveSummary.unpaidLeave,
      absentDays: absentCount,
      totalLOPDays,
      deduction,
      payableSalary,
      generatedBy: req.admin._id,
    });

    return res.status(201).json({
      success: true,
      message: "Payroll generated successfully.",
      payroll,
    });

  } catch (error) {
    console.log(error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getEmployeePayroll = async (req, res) => {
  try {
    const { employeeId } = req.params;

    const payrolls = await Payroll.find({
      employeeId,
    })
      .populate("employeeId", "name empId")
      .populate("companyId", "companyName")
      .populate("generatedBy", "name email")
      .sort({
        year: -1,
        month: -1,
      });

    return res.status(200).json({
      success: true,
      totalPayrolls: payrolls.length,
      payrolls,
    });

  } catch (error) {
    console.log(error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getAllPayrolls = async (req, res) => {
  try {

    const payrolls = await Payroll.find()
      .populate("employeeId", "name empId")
      .populate("companyId", "companyName")
      .populate("generatedBy", "name email")
      .sort({
        year: -1,
        month: -1,
      });

    return res.status(200).json({
      success: true,
      totalPayrolls: payrolls.length,
      payrolls,
    });

  } catch (error) {
    console.log(error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};