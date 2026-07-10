import puppeteer from "puppeteer";
import path from "path";
import Payroll from "../models/payrollModel.js";
import { getDaysInMonth } from "../utils/calendarUtils.js";
import { getEmployeeLeaveSummary } from "../services/leaveSummaryService.js";
import { getEmployeeAbsentCount } from "../services/absentService.js";
import EmployeeSalary from "../models/employeeSalaryModel.js";
import { getEmployeeWorkingDays } from "../services/workingDaysService.js";
import { validatePayrollMonth } from "../utils/payrollValidation.js";
import Attendance from "../models/attendanceModel.js";
import Employee from "../models/employeeModel.js";
import Company from "../models/companyModel.js";
import Department from "../models/departmentModel.js";

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
if (
  !validatePayrollMonth(
    month,
    year
  )
) {
  return res.status(400).json({
    success: false,
    message:
      "Payroll can only be generated after the selected month has ended.",
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

    const workingDays =
  await getEmployeeWorkingDays(
    companyId,
    employeeId,
    month,
    year
  );

// Total Absent Days (supports 0.5 day)
const absentDays = await getEmployeeAbsentCount(
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

    const totalLOPDays = Number(
      (unpaidLeaveDays + absentDays).toFixed(1)
    );

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
      absentDays,
      workingDays,
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

export const previewPayroll = async (req, res) => {
  try {
    const {
      employeeId,
      month,
      year,
    } = req.body;

    if (!employeeId || !month || !year) {
      return res.status(400).json({
        success: false,
        message:
          "Employee, month and year are required.",
      });
    }

    const salaryStructure =
      await EmployeeSalary.findOne({
        employeeId,
        status: "active",
      });

    if (!salaryStructure) {
      return res.status(404).json({
        success: false,
        message: "Salary structure not found.",
      });
    }

    const companyId =
      salaryStructure.companyId;

    const totalDays =
      getDaysInMonth(month, year);

    const leaveSummary =
      await getEmployeeLeaveSummary(
        companyId,
        employeeId,
        month,
        year
      );

    const absentDays =
      await getEmployeeAbsentCount(
        companyId,
        employeeId,
        month,
        year
      );

    const startDate = new Date(
      year,
      month - 1,
      1
    );

    const endDate = new Date(
      year,
      month,
      0,
      23,
      59,
      59
    );

    const workingDays =
      await Attendance.countDocuments({
        employeeId,
        date: {
          $gte: startDate,
          $lte: endDate,
        },
      });

    const inHandSalary =
      salaryStructure.inHandSalary;

    const perDaySalary = Number(
      (
        inHandSalary / totalDays
      ).toFixed(2)
    );

    const unpaidLeaveDays =
      leaveSummary.unpaidLeave
        .extraCasualLeave +
      leaveSummary.unpaidLeave
        .extraSickLeave;

    const totalLOPDays = Number(
      (
        unpaidLeaveDays +
        absentDays
      ).toFixed(1)
    );

    const deduction = Number(
      (
        perDaySalary *
        totalLOPDays
      ).toFixed(2)
    );

    const payableSalary = Number(
      (
        inHandSalary -
        deduction
      ).toFixed(2)
    );

    return res.status(200).json({
      success: true,

      preview: {
        totalDays,

        workingDays,

        absentDays,

        unpaidLeaveDays,

        totalLOPDays,

        perDaySalary,

        deduction,

        payableSalary,
      },
    });

  } catch (error) {

    console.log(error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });

  }
};

export const generatePayrollPdf = async (
  req,
  res
) => {
  try {
    const { payrollId } = req.params;

    const payroll =
      await Payroll.findById(
        payrollId
      );

    if (!payroll) {
      return res.status(404).json({
        message:
          "Payroll not found",
      });
    }

    const employee =
      await Employee.findById(
        payroll.employeeId
      );

    const company =
      await Company.findById(
        payroll.companyId
      );

    const department =
      await Department.findById(
        employee.departmentId
      );

    if (
      !employee ||
      !company ||
      !department
    ) {
      return res.status(404).json({
        message:
          "Required data not found",
      });
    }

    const monthName =
      new Date(
        payroll.year,
        payroll.month - 1
      ).toLocaleString(
        "en-IN",
        {
          month: "long",
        }
      );

    const logoUrl = company.logo
      ? `${process.env.BACKEND_URL}/uploads/${company.logo}`
      : "";

    const signatureUrl =
      company.signature
        ? `${process.env.BACKEND_URL}/uploads/${company.signature}`
        : "";

    const html = `
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8"/>

<style>

*{
  box-sizing:border-box;
}

body{
  font-family:Arial,sans-serif;
  padding:25px;
  color:#1e293b;
  font-size:13px;
}

.payslip{
  border:1px solid #d1d5db;
  border-radius:12px;
  overflow:hidden;
}

.header{
  background:#0f172a;
  color:white;
  padding:25px;
  text-align:center;
}

.logo{
  height:70px;
  margin-bottom:10px;
  object-fit:contain;
}

.company-name{
  font-size:28px;
  font-weight:700;
}

.company-info{
  margin-top:10px;
  line-height:1.8;
  font-size:12px;
}

.title{
  background:#f8fafc;
  text-align:center;
  padding:18px;
  border-bottom:1px solid #e5e7eb;
}

.title h2{
  margin:0;
  font-size:24px;
}

.title p{
  margin-top:6px;
  color:#64748b;
}

.section{
  padding:18px 25px;
}

.section-title{
  font-size:15px;
  font-weight:700;
  margin-bottom:10px;
  color:#2563eb;
}

.table{
  width:100%;
  border-collapse:collapse;
}

.table td{
  border:1px solid #e5e7eb;
  padding:10px;
}

.table tr:nth-child(even){
  background:#f8fafc;
}

.salary-highlight{
  background:#ecfdf5;
  border:2px solid #22c55e;
  border-radius:12px;
  padding:20px;
  text-align:center;
  margin:20px 25px;
}

.salary-highlight h3{
  margin:0;
  color:#15803d;
}

.salary-highlight h1{
  margin-top:8px;
  color:#166534;
  font-size:34px;
}

.footer{
  padding:25px;
}

.sign-area{
  text-align:right;
  margin-top:40px;
}

.signature{
  height:60px;
  object-fit:contain;
}

.authorized{
  margin-top:8px;
  font-weight:600;
}

</style>
</head>

<body>

<div class="payslip">

<div class="header">

${
  logoUrl
    ? `<img src="${logoUrl}" class="logo"/>`
    : ""
}

<div class="company-name">
${company.companyName}
</div>

<div class="company-info">
${company.address}<br>
Phone: ${company.phone}<br>
Email: ${company.email}<br>
Website: ${company.website || "-"}<br>
GST No: ${company.gstNumber || "-"}
</div>

</div>

<div class="title">
<h2>SALARY SLIP</h2>
<p>${monthName} ${payroll.year}</p>
</div>

<div class="section">

<div class="section-title">
Employee Information
</div>

<table class="table">
<tr>
<td><b>Employee Name</b></td>
<td>${employee.name}</td>
</tr>

<tr>
<td><b>Employee ID</b></td>
<td>${employee.empId}</td>
</tr>

<tr>
<td><b>Department</b></td>
<td>${department.departmentName}</td>
</tr>

<tr>
<td><b>Designation</b></td>
<td>${employee.role}</td>
</tr>

<tr>
<td><b>Email</b></td>
<td>${employee.email}</td>
</tr>

<tr>
<td><b>Phone</b></td>
<td>${employee.phone}</td>
</tr>
</table>

</div>

<div class="section">

<div class="section-title">
Attendance Summary
</div>

<table class="table">
<tr>
<td>Total Days</td>
<td>${payroll.totalDays}</td>
</tr>

<tr>
<td>Working Days</td>
<td>${payroll.workingDays}</td>
</tr>

<tr>
<td>Absent Days</td>
<td>${payroll.absentDays}</td>
</tr>

<tr>
<td>LOP Days</td>
<td>${payroll.totalLOPDays}</td>
</tr>
</table>

</div>

<div class="section">

<div class="section-title">
Leave Summary
</div>

<table class="table">
<tr>
<td>Casual Leave</td>
<td>${payroll.paidLeave.casualLeave}</td>
</tr>

<tr>
<td>Sick Leave</td>
<td>${payroll.paidLeave.sickLeave}</td>
</tr>

<tr>
<td>Paid Leave</td>
<td>${payroll.paidLeave.paidLeave}</td>
</tr>

<tr>
<td>Comp Off</td>
<td>${payroll.paidLeave.compOff}</td>
</tr>

<tr>
<td>Extra Casual Leave</td>
<td>${payroll.unpaidLeave.extraCasualLeave}</td>
</tr>

<tr>
<td>Extra Sick Leave</td>
<td>${payroll.unpaidLeave.extraSickLeave}</td>
</tr>
</table>

</div>

<div class="section">

<div class="section-title">
Salary Breakdown
</div>

<table class="table">

<tr>
<td>CTC</td>
<td>₹${payroll.ctc.toLocaleString("en-IN")}</td>
</tr>

<tr>
<td>In-Hand Salary</td>
<td>₹${payroll.inHandSalary.toLocaleString("en-IN")}</td>
</tr>

<tr>
<td>Per Day Salary</td>
<td>₹${payroll.perDaySalary}</td>
</tr>

<tr>
<td>PF</td>
<td>₹${payroll.pf}</td>
</tr>

<tr>
<td>ESI</td>
<td>₹${payroll.esi}</td>
</tr>

<tr>
<td>Tax</td>
<td>₹${payroll.tax}</td>
</tr>

<tr>
<td>LOP Deduction</td>
<td>₹${payroll.deduction}</td>
</tr>

</table>

</div>

<div class="salary-highlight">

<h3>NET PAYABLE SALARY</h3>

<h1>
₹${payroll.payableSalary.toLocaleString("en-IN")}
</h1>

</div>

<div class="footer">

<div>
Generated On :
${new Date(payroll.createdAt).toLocaleDateString("en-IN")}
</div>

<div style="margin-top:5px;">
Status :
${payroll.status}
</div>

<div class="sign-area">

${
  signatureUrl
    ? `<img src="${signatureUrl}" class="signature"/>`
    : ""
}

<div class="authorized">
Authorized Signatory
</div>

</div>

</div>

</div>

</body>
</html>
`;

    const browser =
      await puppeteer.launch({
        headless: true,
      });

    const page =
      await browser.newPage();

    await page.setContent(
      html,
      {
        waitUntil:
          "networkidle0",
      }
    );

    const pdf =
      await page.pdf({
        format: "A4",
        printBackground: true,
        margin: {
          top: "20px",
          bottom: "20px",
          left: "20px",
          right: "20px",
        },
      });

    await browser.close();

    res.setHeader(
      "Content-Type",
      "application/pdf"
    );

    res.setHeader(
      "Content-Disposition",
      `inline; filename=salary-slip-${employee.empId}.pdf`
    );

    res.send(pdf);
  } catch (error) {
    console.log(error);

    res.status(500).json({
      message:
        "Failed to generate PDF",
    });
  }
};

export const downloadPayrollPdf = async (
  req,
  res
) => {
  try {
    const { payrollId } = req.params;
   
    const payroll = await Payroll.findById(payrollId);

    if (!payroll) {
      return res.status(404).json({
        message: "Payroll not found",
      });
    }

    const employee = await Employee.findById(
      payroll.employeeId
    );

    const company = await Company.findById(
      payroll.companyId
    );

    const department =
      await Department.findById(
        employee.departmentId
      );

    if (
      !employee ||
      !company ||
      !department
    ) {
      return res.status(404).json({
        message: "Required data not found",
      });
    }

    const monthName = new Date(
      payroll.year,
      payroll.month - 1
    ).toLocaleString("en-IN", {
      month: "long",
    });

    const logoUrl = company.logo
      ? `${process.env.BACKEND_URL}/uploads/${company.logo}`
      : "";

    const signatureUrl =
      company.signature
        ? `${process.env.BACKEND_URL}/uploads/${company.signature}`
        : "";

    const html = `
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8"/>

<style>

*{
  box-sizing:border-box;
}

body{
  font-family:Arial,sans-serif;
  padding:25px;
  color:#1e293b;
  font-size:13px;
}

.payslip{
  border:1px solid #d1d5db;
  border-radius:12px;
  overflow:hidden;
}

.header{
  background:#0f172a;
  color:white;
  padding:25px;
  text-align:center;
}

.logo{
  height:70px;
  margin-bottom:10px;
  object-fit:contain;
}

.company-name{
  font-size:28px;
  font-weight:700;
}

.company-info{
  margin-top:10px;
  line-height:1.8;
  font-size:12px;
}

.title{
  background:#f8fafc;
  text-align:center;
  padding:18px;
  border-bottom:1px solid #e5e7eb;
}

.title h2{
  margin:0;
  font-size:24px;
}

.title p{
  margin-top:6px;
  color:#64748b;
}

.section{
  padding:18px 25px;
}

.section-title{
  font-size:15px;
  font-weight:700;
  margin-bottom:10px;
  color:#2563eb;
}

.table{
  width:100%;
  border-collapse:collapse;
}

.table td{
  border:1px solid #e5e7eb;
  padding:10px;
}

.table tr:nth-child(even){
  background:#f8fafc;
}

.salary-highlight{
  background:#ecfdf5;
  border:2px solid #22c55e;
  border-radius:12px;
  padding:20px;
  text-align:center;
  margin:20px 25px;
}

.salary-highlight h3{
  margin:0;
  color:#15803d;
}

.salary-highlight h1{
  margin-top:8px;
  color:#166534;
  font-size:34px;
}

.footer{
  padding:25px;
}

.sign-area{
  text-align:right;
  margin-top:40px;
}

.signature{
  height:60px;
  object-fit:contain;
}

.authorized{
  margin-top:8px;
  font-weight:600;
}

</style>
</head>

<body>

<div class="payslip">

<div class="header">

${
  logoUrl
    ? `<img src="${logoUrl}" class="logo"/>`
    : ""
}

<div class="company-name">
${company.companyName}
</div>

<div class="company-info">
${company.address}<br>
Phone: ${company.phone}<br>
Email: ${company.email}<br>
Website: ${company.website || "-"}<br>
GST No: ${company.gstNumber || "-"}
</div>

</div>

<div class="title">
<h2>SALARY SLIP</h2>
<p>${monthName} ${payroll.year}</p>
</div>

<div class="section">

<div class="section-title">
Employee Information
</div>

<table class="table">
<tr>
<td><b>Employee Name</b></td>
<td>${employee.name}</td>
</tr>

<tr>
<td><b>Employee ID</b></td>
<td>${employee.empId}</td>
</tr>

<tr>
<td><b>Department</b></td>
<td>${department.departmentName}</td>
</tr>

<tr>
<td><b>Designation</b></td>
<td>${employee.role}</td>
</tr>

<tr>
<td><b>Email</b></td>
<td>${employee.email}</td>
</tr>

<tr>
<td><b>Phone</b></td>
<td>${employee.phone}</td>
</tr>
</table>

</div>

<div class="section">

<div class="section-title">
Attendance Summary
</div>

<table class="table">
<tr>
<td>Total Days</td>
<td>${payroll.totalDays}</td>
</tr>

<tr>
<td>Working Days</td>
<td>${payroll.workingDays}</td>
</tr>

<tr>
<td>Absent Days</td>
<td>${payroll.absentDays}</td>
</tr>

<tr>
<td>LOP Days</td>
<td>${payroll.totalLOPDays}</td>
</tr>
</table>

</div>

<div class="section">

<div class="section-title">
Leave Summary
</div>

<table class="table">
<tr>
<td>Casual Leave</td>
<td>${payroll.paidLeave.casualLeave}</td>
</tr>

<tr>
<td>Sick Leave</td>
<td>${payroll.paidLeave.sickLeave}</td>
</tr>

<tr>
<td>Paid Leave</td>
<td>${payroll.paidLeave.paidLeave}</td>
</tr>

<tr>
<td>Comp Off</td>
<td>${payroll.paidLeave.compOff}</td>
</tr>

<tr>
<td>Extra Casual Leave</td>
<td>${payroll.unpaidLeave.extraCasualLeave}</td>
</tr>

<tr>
<td>Extra Sick Leave</td>
<td>${payroll.unpaidLeave.extraSickLeave}</td>
</tr>
</table>

</div>

<div class="section">

<div class="section-title">
Salary Breakdown
</div>

<table class="table">

<tr>
<td>CTC</td>
<td>₹${payroll.ctc.toLocaleString("en-IN")}</td>
</tr>

<tr>
<td>In-Hand Salary</td>
<td>₹${payroll.inHandSalary.toLocaleString("en-IN")}</td>
</tr>

<tr>
<td>Per Day Salary</td>
<td>₹${payroll.perDaySalary}</td>
</tr>

<tr>
<td>PF</td>
<td>₹${payroll.pf}</td>
</tr>

<tr>
<td>ESI</td>
<td>₹${payroll.esi}</td>
</tr>

<tr>
<td>Tax</td>
<td>₹${payroll.tax}</td>
</tr>

<tr>
<td>LOP Deduction</td>
<td>₹${payroll.deduction}</td>
</tr>

</table>

</div>

<div class="salary-highlight">

<h3>NET PAYABLE SALARY</h3>

<h1>
₹${payroll.payableSalary.toLocaleString("en-IN")}
</h1>

</div>

<div class="footer">

<div>
Generated On :
${new Date(payroll.createdAt).toLocaleDateString("en-IN")}
</div>

<div style="margin-top:5px;">
Status :
${payroll.status}
</div>

<div class="sign-area">

${
  signatureUrl
    ? `<img src="${signatureUrl}" class="signature"/>`
    : ""
}

<div class="authorized">
Authorized Signatory
</div>

</div>

</div>

</div>

</body>
</html>
`;

    const browser =
      await puppeteer.launch({
        headless: true,
      });

    const page =
      await browser.newPage();

    await page.setContent(html, {
      waitUntil: "networkidle0",
    });

    const pdf = await page.pdf({
      format: "A4",
      printBackground: true,
      margin: {
        top: "20px",
        bottom: "20px",
        left: "20px",
        right: "20px",
      },
    });

    await browser.close();

    res.setHeader(
      "Content-Type",
      "application/pdf"
    );

    res.setHeader(
      "Content-Disposition",
      `attachment; filename=Salary-Slip-${employee.empId}-${monthName}-${payroll.year}.pdf`
    );

    res.send(pdf);

  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: "Failed to download PDF",
    });
  }
};

export const getEmployeePayroll = async (req, res) => {
  try {
    const { employeeId } = req.params;

    const payrolls = await Payroll.find({
      employeeId,
    })
      .populate({
        path: "employeeId",
        select:
          "name empId email phone role profilePic departmentId companyId",
        populate: {
          path: "departmentId",
          select: "departmentName",
        },
      })
      .populate("companyId", "companyName logo")
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
    .populate({
      path: "employeeId",
      select:
        "name empId role profilePic departmentId",
      populate: {
        path: "departmentId",
        select: "departmentName",
      },
    })
    .populate("companyId", "companyName logo")
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

export const updatePayroll = async (req, res) => {
  try {
    const { payrollId } = req.params;

    const payroll = await Payroll.findById(payrollId);

    if (!payroll) {
      return res.status(404).json({
        success: false,
        message: "Payroll not found.",
      });
    }

    const {
      casualLeave,
      sickLeave,
      paidLeave,
      compOff,

      extraCasualLeave,
      extraSickLeave,

      absentDays,
      workingDays,
    } = req.body;

    payroll.paidLeave = {
      casualLeave: Number(casualLeave),
      sickLeave: Number(sickLeave),
      paidLeave: Number(paidLeave),
      compOff: Number(compOff),
    };

    payroll.unpaidLeave = {
      extraCasualLeave: Number(extraCasualLeave),
      extraSickLeave: Number(extraSickLeave),
    };

    payroll.absentDays = Number(absentDays);
    payroll.workingDays = Number(workingDays);

    const unpaidLeaveDays =
      payroll.unpaidLeave.extraCasualLeave +
      payroll.unpaidLeave.extraSickLeave;

    payroll.totalLOPDays = Number(
      (
        unpaidLeaveDays +
        payroll.absentDays
      ).toFixed(1)
    );

    payroll.deduction = Number(
      (
        payroll.perDaySalary *
        payroll.totalLOPDays
      ).toFixed(2)
    );

    payroll.payableSalary = Number(
      (
        payroll.inHandSalary -
        payroll.deduction
      ).toFixed(2)
    );

    await payroll.save();

    const updatedPayroll =
      await Payroll.findById(payroll._id)
        .populate({
          path: "employeeId",
          select:
            "name empId email phone role profilePic departmentId companyId",
          populate: [
            {
              path: "departmentId",
              select: "departmentName",
            },
            {
              path: "companyId",
              select: "companyName logo",
            },
          ],
        })
        .populate(
          "companyId",
          "companyName logo address phone email website gstNumber signature"
        )
        .populate(
          "generatedBy",
          "name email"
        );

    return res.status(200).json({
      success: true,
      message: "Payroll updated successfully.",
      payroll: updatedPayroll,
    });

  } catch (error) {

    console.log(error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });

  }
};

export const deletePayroll = async (req, res) => {
  try {

    const { payrollId } = req.params;

    const payroll =
      await Payroll.findById(payrollId);

    if (!payroll) {
      return res.status(404).json({
        success: false,
        message: "Payroll not found",
      });
    }

    await Payroll.findByIdAndDelete(payrollId);

    return res.status(200).json({
      success: true,
      message: "Payroll deleted successfully.",
    });

  } catch (error) {

    console.log(error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });

  }
};

export const getPayrollById = async (req, res) => {
  try {
    const { payrollId } = req.params;

    const payroll = await Payroll.findById(payrollId)
      .populate({
        path: "employeeId",
        select:
          "name empId email phone role profilePic departmentId companyId",
        populate: [
          {
            path: "departmentId",
            select: "departmentName",
          },
          {
            path: "companyId",
            select: "companyName logo",
          },
        ],
      })
      .populate(
        "companyId",
        "companyName logo address phone email website gstNumber signature"
      )
      .populate(
        "generatedBy",
        "name email profilePic"
      );

    if (!payroll) {
      return res.status(404).json({
        success: false,
        message: "Payroll not found.",
      });
    }

    return res.status(200).json({
      success: true,
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