import mongoose from "mongoose";

const employeeSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    empId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true,
    },
    profilePic: {
      type: String,
      default: "",
    },
    phone: {
      type: String,
      required: true,
      trim: true,
    },

    presentAddress: {
      type: String,
      required: true,
      trim: true,
    },

    gender: {
      type: String,
      required: true,
      enum: [
        "Male",
        "Female",
        "Other",
      ],
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    password: {
      type: String,
      required: true,
    },

    role: {
      type: String,
      required: true,

      enum: [
        "Vice President",

        "General Manager",

        "Senior Manager",

        "Project Manager",

        "Team Lead",

        "Senior Software Engineer",

        "Software Engineer",

        "Associate Trainee",

        "Intern",
      ],
    },

    companyId: {
      type:mongoose.Schema.Types.ObjectId,
      ref: "Company",
      required: true,
    },

    departmentId: {
      type:mongoose.Schema.Types.ObjectId,
      ref: "Department",
      required: true,
    },

    profilePic: {
      type: String,
      default: "",
    },

    status: {
      type: String,

      enum: [
        "active",
        "inactive",
      ],

      default:
        "active",
    },
        
        resetOtp: {
          type: String,
          default: "",
        },
        
        resetOtpExpire: {
          type: Date,
          default: null,
        },
  },

  {
    timestamps: true,
  }
);

const Employee =
  mongoose.model(
    "Employee",
    employeeSchema
  );

export default Employee;