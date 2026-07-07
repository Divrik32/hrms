import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import dns from 'dns';
import cors from "cors";
import cookieParser from "cookie-parser";
import path from "path";
import companyRoutes from "./routes/companyRoutes.js";
import departmentRoutes from "./routes/departmentRoutes.js";
import superAdminRoutes from "./routes/superAdminRoutes.js";
import employeeRoutes from "./routes/employeeRoutes.js";
import attendanceRoutes from "./routes/attendanceRoutes.js";
import leaveRoutes from "./routes/leaveRequests.js";
import salaryRoutes from "./routes/salaryRoutes.js";
import absentRoutes from "./routes/absentRoutes.js";
import payrollRoutes from "./routes/payrollRoutes.js";
import { fileURLToPath } from "url";
import { createCurrentLeaveBalance } from "./controllers/leaveRequestController.js";
import { startMonthlyLeaveCreditJob } from "./jobs/monthlyLeaveCredit.js";
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

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Routes
app.use("/api/companies", companyRoutes);
app.use("/api/departments", departmentRoutes);
app.use("/api/superadmin", superAdminRoutes);
app.use("/api/employees", employeeRoutes);
app.use("/api/attendance", attendanceRoutes);
app.use("/api/leaves", leaveRoutes);
app.use("/api/salary", salaryRoutes);
app.use("/api/absent", absentRoutes);
app.use("/api/payroll", payrollRoutes);

// Test Route
app.get("/", (req, res) => {
  res.send("Server Running...");
});

// MongoDB Connection
mongoose
  .connect(process.env.MONGODB_URI)
  .then(async () => {
    console.log("MongoDB Connected");
    await createCurrentLeaveBalance();
    startMonthlyLeaveCreditJob();
    app.listen(
      process.env.PORT || 5000,
      () => {
        console.log(
          `Server running on port ${
            process.env.PORT || 5000
          }`
        );
      }
    );
  })
  .catch((error) => {
    console.log(
      "MongoDB Connection Error:",
      error
    );
  });