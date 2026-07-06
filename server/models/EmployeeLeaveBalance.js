import mongoose from "mongoose";

const employeeLeaveBalanceSchema =
  new mongoose.Schema(
    {
      employeeId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Employee",
        required: true,
      },

      companyId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Company",
        required: true,
      },

      departmentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Department",
        required: true,
      },

      month: {
        type: Number,
        required: true,
      },

      year: {
        type: Number,
        required: true,
      },

      remainingCasualLeave: {
        type: Number,
        default: 0.5,
      },

      remainingSickLeave: {
        type: Number,
        default: 0.5,
      },

      remainingPaidLeave: {
        type: Number,
        default: 0.5,
      },
    },
    {
      timestamps: true,
    }
  );

employeeLeaveBalanceSchema.index(
  {
    employeeId: 1,
    month: 1,
    year: 1,
  },
  {
    unique: true,
  }
);

const EmployeeLeaveBalance =
  mongoose.model(
    "EmployeeLeaveBalance",
    employeeLeaveBalanceSchema
  );

export default EmployeeLeaveBalance;