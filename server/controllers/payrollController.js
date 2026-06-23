import LeaveRequest from "../models/LeaveRequest.js";
import Employee from "../models/employeeModel.js";
import EmployeeSalary from "../models/employeeSalaryModel.js";

export const getEmployeeLeaveSummary =
async (req, res) => {
  try {
    const employeeId = req.user._id;
    const employee =
      await Employee.findById(
        employeeId
      );

    if (!employee) {
      return res.status(404).json({
        success: false,
        message:
          "Employee not found",
      });
    }

    const currentYear =
      new Date().getFullYear();

    const currentMonth =
      new Date().getMonth();

    const approvedLeaves =
      await LeaveRequest.find({
        employeeId,
        status: "Approved",
      });

    const monthNames = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];

    const monthlyLeaves =
      Array.from(
        { length: currentMonth + 1 },
        (_, index) => ({
          month:
            monthNames[index],
          leaveCount: 0,
        })
      );

    approvedLeaves.forEach(
      (leave) => {

        const leaveDate =
          new Date(
            leave.fromDate
          );

        const year =
          leaveDate.getFullYear();

        const month =
          leaveDate.getMonth();

        if (
          year === currentYear &&
          month <= currentMonth
        ) {
          monthlyLeaves[
            month
          ].leaveCount +=
            leave.leaveDays;
        }
      }
    );

    const totalLeaves =
      monthlyLeaves.reduce(
        (sum, item) =>
          sum +
          item.leaveCount,
        0
      );

    return res.status(200).json({
      success: true,

      employee:
        employee.name,

      year: currentYear,

      monthlyLeaves,

      totalLeaves,
    });

  } catch (error) {

    console.log(error);

    return res.status(500).json({
      success: false,
      message:
        error.message,
    });
  }
};

export const createEmployeeSalaryStructure =
async (req, res) => {

  try {

    const {
      companyId,
      employeeId,
      inHandSalary,
      pf,
      esi,
      tax,
    } = req.body;

    const employee =
      await Employee.findById(
        employeeId
      );

    if (!employee) {
      return res.status(404).json({
        success: false,
        message:
          "Employee not found",
      });
    }

    const existingSalary =
      await EmployeeSalary.findOne({
        employeeId,
      });

    if (existingSalary) {
      return res.status(400).json({
        success: false,
        message:
          "Salary structure already exists",
      });
    }

    const ctc =
      Number(inHandSalary || 0) +
      Number(pf || 0) +
      Number(esi || 0) +
      Number(tax || 0);

    const salaryStructure =
      await EmployeeSalary.create({
        companyId,
        employeeId,

        inHandSalary,
        pf,
        esi,
        tax,

        ctc,

        effectiveFrom:
          new Date(),
      });

    return res.status(201).json({
      success: true,

      message:
        "Employee salary structure created successfully",

      salaryStructure,
    });

  } catch (error) {

    console.log(error);

    return res.status(500).json({
      success: false,
      message:
        error.message,
    });
  }
};

export const getEmployeeSalaryStructure =
async (req, res) => {

  try {

    const { employeeId } =
      req.params;

    const salaryStructure =
      await EmployeeSalary
        .findOne({
          employeeId,
        })
        .populate(
          "employeeId",
          "name empId"
        )
        .populate(
          "companyId",
          "companyName"
        );

    if (!salaryStructure) {
      return res.status(404).json({
        success: false,
        message:
          "Salary structure not found",
      });
    }

    return res.status(200).json({
      success: true,

      salaryStructure,
    });

  } catch (error) {

    console.log(error);

    return res.status(500).json({
      success: false,
      message:
        error.message,
    });
  }
};


export const editEmployeeSalaryStructure =
async (req, res) => {

  try {

    const { employeeId } =
      req.params;

    const {
      inHandSalary,
      pf,
      esi,
      tax,
      status,
    } = req.body;

    const salaryStructure =
      await EmployeeSalary.findOne({
        employeeId,
      });

    if (!salaryStructure) {
      return res.status(404).json({
        success: false,
        message:
          "Salary structure not found",
      });
    }

    const updatedInHandSalary =
      Number(
        inHandSalary ??
        salaryStructure.inHandSalary
      );

    const updatedPf =
      Number(
        pf ??
        salaryStructure.pf
      );

    const updatedEsi =
      Number(
        esi ??
        salaryStructure.esi
      );

    const updatedTax =
      Number(
        tax ??
        salaryStructure.tax
      );

    const updatedCtc =
      updatedInHandSalary +
      updatedPf +
      updatedEsi +
      updatedTax;

    salaryStructure.inHandSalary =
      updatedInHandSalary;

    salaryStructure.pf =
      updatedPf;

    salaryStructure.esi =
      updatedEsi;

    salaryStructure.tax =
      updatedTax;

    salaryStructure.ctc =
      updatedCtc;

    if (status) {
      salaryStructure.status =
        status;
    }

    await salaryStructure.save();

    return res.status(200).json({
      success: true,

      message:
        "Salary structure updated successfully",

      salaryStructure,
    });

  } catch (error) {

    console.log(error);

    return res.status(500).json({
      success: false,
      message:
        error.message,
    });
  }
};