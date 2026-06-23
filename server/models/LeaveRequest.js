import mongoose from "mongoose";

const leaveRequestSchema = new mongoose.Schema(
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

    leaveType: {
      type: String,
      required: true,
      enum: [
        "Casual Leave",
        "Sick Leave",
        "Compensatory Off",
      ],
    },

    compOffWorkDate: {
      type: String,
      default: "",
    },

    fromDate: {
      type: String,
      required: true,
    },

    toDate: {
      type: String,
      required: true,
    },

    leaveDays: {
      type: Number,
      required: true,
    },
    
    remainingCasualLeave: {
      type: Number,
      default: 6,
    },
    
    remainingSickLeave: {
      type: Number,
      default: 6,
    },

    reason: {
      type: String,
      required: true,
      trim: true,
    },

    status: {
      type: String,
      enum: [
        "Pending",
        "Approved",
        "Rejected",
      ],
      default: "Pending",
    },

    adminRemark: {
      type: String,
      default: "",
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

const LeaveRequest = mongoose.model(
  "LeaveRequest",
  leaveRequestSchema
);

export default LeaveRequest;