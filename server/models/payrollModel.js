import mongoose from "mongoose";

const payrollSchema =
  new mongoose.Schema(
    {
      employeeId: {
        type:
          mongoose.Schema.Types.ObjectId,
        ref: "Employee",
        required: true,
      },

      companyId: {
        type:
          mongoose.Schema.Types.ObjectId,
        ref: "Company",
        required: true,
      },

      month: {
        type: Number,
        required: true,
        min: 1,
        max: 12,
      },

      year: {
        type: Number,
        required: true,
      },

      ctc: {
        type: Number,
        required: true,
        default: 0,
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

      deduction: {
        type: Number,
        default: 0,
      },

      inHandSalary: {
        type: Number,
        required: true,
        default: 0,
      },

      leaveDeduction: {
        type: Number,
        default: 0,
      },

      payableSalary: {
        type: Number,
        required: true,
        default: 0,
      },

      paymentStatus: {
        type: String,
        enum: [
          "pending",
          "paid",
        ],
        default: "pending",
      },

      paymentDate: Date,

      remarks: {
        type: String,
        default: "",
      },
    },
    {
      timestamps: true,
    }
  );

payrollSchema.index(
  {
    employeeId: 1,
    month: 1,
    year: 1,
  },
  {
    unique: true,
  }
);

const Payroll =
  mongoose.model(
    "Payroll",
    payrollSchema
  );

export default Payroll;