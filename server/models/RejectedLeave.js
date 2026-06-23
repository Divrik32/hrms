// models/RejectedLeave.js

import mongoose from "mongoose";

const rejectedLeaveSchema =
  new mongoose.Schema(
    {
      employeeId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Employee",
      },

      companyId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Company",
      },

      departmentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Department",
      },

      leaveType: String,

      compOffWorkDate: String,

      fromDate: String,

      toDate: String,

      leaveDays: Number,

      remainingCasualLeave: Number,

      remainingSickLeave: Number,

      reason: String,

      adminRemark: String,

      rejectedAt: {
        type: Date,
        default: Date.now,
      },
    }
  );

export default mongoose.model(
  "RejectedLeave",
  rejectedLeaveSchema
);