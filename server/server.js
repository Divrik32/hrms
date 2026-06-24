import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import dns from 'dns';
import cors from "cors";
import cookieParser from "cookie-parser";
import companyRoutes from "./routes/companyRoutes.js";
import departmentRoutes from "./routes/departmentRoutes.js";
import superAdminRoutes from "./routes/superAdminRoutes.js";
import employeeRoutes from "./routes/employeeRoutes.js";
import attendanceRoutes from "./routes/attendanceRoutes.js";
import leaveRoutes from "./routes/leaveRequests.js";
import payrollRoutes from "./routes/payrollRoutes.js";
dotenv.config();
dns.setServers(["1.1.1.1","8.8.8.8"])

const app = express();
app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
  })
);
app.use(cookieParser());

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static("uploads"));

// Routes
app.use("/api/companies", companyRoutes);
app.use("/api/departments", departmentRoutes);
app.use("/api/superadmin", superAdminRoutes);
app.use("/api/employees", employeeRoutes);
app.use("/api/attendance", attendanceRoutes);
app.use("/api/leaves", leaveRoutes);
app.use("/api/payroll", payrollRoutes);
// Test Route
app.get("/", (req, res) => {
  res.send("Server Running...");
});

// MongoDB Connection
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log("MongoDB Connected");

    app.listen(process.env.PORT || 5000, () => {
      console.log(
        `Server running on port ${process.env.PORT || 5000}`
      );
    });
  })
  .catch((error) => {
    console.log("MongoDB Connection Error:", error);
  });