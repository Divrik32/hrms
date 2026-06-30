// models/Holiday.js

import mongoose from "mongoose";

const holidaySchema =
  new mongoose.Schema(
    {
      holidayName: {
        type: String,
        required: true,
        trim: true,
      },

      holidayDate: {
        type: Date,
        required: true,
        unique: true,
      },

      description: {
        type: String,
        default: "",
        trim: true,
      },

      createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "SuperAdmin",
      },
    },
    {
      timestamps: true,
    }
  );

const Holiday =
  mongoose.model(
    "Holiday",
    holidaySchema
  );

export default Holiday;