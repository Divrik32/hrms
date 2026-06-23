import mongoose from "mongoose";

const companySchema = new mongoose.Schema(
  {
    companyName: {
      type: String,
      required: [true, "Company name is required"],
      trim: true,
      unique: true,
    },

    companyType: {
      type: String,
      required: [true, "Company type is required"],
      enum: [
        "Private Limited",
        "Public Limited",
        "LLP",
        "Partnership",
        "Proprietorship",
      ],
    },

    gstNumber: {
      type: String,
      trim: true,
      unique: true,
      sparse: true,
      uppercase: true,
    },

    panNumber: {
      type: String,
      trim: true,
      unique: true,
      sparse: true,
      uppercase: true,
    },

    email: {
      type: String,
      required: [true, "Company email is required"],
      trim: true,
      lowercase: true,
      unique: true,
    },

    phone: {
      type: String,
      required: [true, "Phone number is required"],
      trim: true,
    },

    website: {
      type: String,
      trim: true,
    },

    industry: {
      type: String,
      trim: true,
    },

    address: {
      type: String,
      required: [true, "Address is required"],
      trim: true,
    },

    logo: {
      type: String,
      default: "",
    },

    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },
  },
  {
    timestamps: true,
  }
);

const Company = mongoose.model("Company", companySchema);

export default Company;