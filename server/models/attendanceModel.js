import mongoose from "mongoose";

const attendanceSchema = new mongoose.Schema(
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

    date: {
      type: Date,
      required: true,
    },

    status: {
      type: String,
      enum: ["Present", "Absent", "Leave", "Half Day"],
      default: "Present",
    },

    shift: {
      type: String,
      enum: [
        "day",
        "afternoon",
        "night",
      ],
      required: true,
      default: "day",
    },

    checkInTime: {
      type: String,
      default: "",
    },
    
    timing: {
      type: String,
      enum: [
        "early",
        "inTime",
        "late",
      ],
      default: "inTime"
    },

    checkOutTime: {
      type: String,
      default: "",
    },

    workingHours: {
      type: Number,
      default: 0,
    },

    note: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

const Attendance = mongoose.model(
  "Attendance",
  attendanceSchema
);

export default Attendance;