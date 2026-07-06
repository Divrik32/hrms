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

    leaveDetails: {
      leaveType: {
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

      leaveDates: [
        {
          date: {
            type: String,
            required: true,
          },

          duration: {
            type: Number,
            enum: [0.5, 1],
            required: true,
          },

          leaveType: {
            type: String,
            enum: [
              "Casual Leave",
              "Sick Leave",
              "Paid Leave",
              "Compensatory Off",
            ],
            required: true,
          },
        },
      ],

      compOffWorkDate: {
        type: String,
        default: "",
      },
    },

    remainingCasualLeave: {
      type: Number,
      default: 0,
    },

    remainingSickLeave: {
      type: Number,
      default: 0,
    },

    remainingPaidLeave: {
      type: Number,
      default: 0,
    },

    extraLeaveDetails: {
      extraLeaveType: {
        casualLeave: {
          type: Number,
          default: 0,
        },

        sickLeave: {
          type: Number,
          default: 0,
        },
      },

      extraLeaveDates: [
        {
          date: {
            type: String,
            required: true,
          },

          duration: {
            type: Number,
            enum: [0.5, 1],
            required: true,
          },
        },
      ],
    },

reason: {
    type: String,
    required: [true, "Please enter a reason for your leave request."],
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