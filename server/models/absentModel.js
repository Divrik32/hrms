import mongoose from "mongoose";

const absentSchema = new mongoose.Schema(
  {
    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
      required: true,
    },

    employeeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
      required: true,
    },

    absentDate: {
      type: Date,
      required: true,
    },

    duration: {
      type: Number,
      enum: [0.5, 1],
      default: 1,
      required: true,
    },

    markedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SuperAdmin",
    },
  },
  {
    timestamps: true,
  }
);

const Absent = mongoose.model("Absent", absentSchema);

export default Absent;