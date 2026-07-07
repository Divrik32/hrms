import mongoose from "mongoose";

const payrollSchema = new mongoose.Schema(
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

    totalDays: {
      type: Number,
      required: true,
    },

    inHandSalary: {
      type: Number,
      required: true,
    },

    ctc: {
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

    perDaySalary: {
      type: Number,
      required: true,
    },

    paidLeave: {
      casualLeave: {
        type: Number,
        default: 0,
      },

      sickLeave: {
        type: Number,
        default: 0,
      },

      paidLeave: {
        type: Number,
        default: 0,
      },

      compOff: {
        type: Number,
        default: 0,
      },
    },

    unpaidLeave: {
      extraCasualLeave: {
        type: Number,
        default: 0,
      },

      extraSickLeave: {
        type: Number,
        default: 0,
      },
    },

    absentDays: {
      type: Number,
      default: 0,
    },

    totalLOPDays: {
      type: Number,
      default: 0,
    },

    deduction: {
      type: Number,
      default: 0,
    },

    payableSalary: {
      type: Number,
      required: true,
    },

    generatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SuperAdmin",
      required: true,
    },

    status: {
      type: String,
      enum: ["Generated", "Paid"],
      default: "Generated",
    },
  },
  {
    timestamps: true,
  }
);

// Prevent duplicate payroll for same employee/month/year
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

const Payroll = mongoose.model(
  "Payroll",
  payrollSchema
);

export default Payroll;