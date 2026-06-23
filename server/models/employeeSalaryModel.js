import mongoose from "mongoose";

const employeeSalarySchema =
  new mongoose.Schema(
    {
      employeeId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Employee",
        required: true,
        unique: true,
      },

      companyId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Company",
        required: true,
      },

      inHandSalary: {
        type: Number,
        required: true,
      },

      pf: {
        type: Number,
        default: 0,
      },

      esi: {
        type: Number,
        default: 0,
      },

      tax: {
        type: Number,
        default: 0,
      },

      ctc: {
        type: Number,
        required: true,
      },

      effectiveFrom: {
        type: Date,
        default: Date.now,
      },

      status: {
        type: String,
        enum: ["active", "inactive"],
        default: "active",
      },
    },
    {
      timestamps: true,
    }
  );

const EmployeeSalary =
  mongoose.model(
    "EmployeeSalary",
    employeeSalarySchema
  );

export default EmployeeSalary;