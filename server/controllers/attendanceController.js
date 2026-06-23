import Attendance from "../models/attendanceModel.js";
import Employee from "../models/employeeModel.js";


// ===============================
// Helper: Date (dd-mm-yyyy)
// ===============================
const getFormattedDate = () => {
  const d = new Date();

  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();

  return `${day}-${month}-${year}`;
};


// ===============================
// Helper: Time (HH:MM:SS AM/PM)
// ===============================
const getFormattedTime = () => {
  return new Date().toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });
};


// ===============================
// CHECK-IN
// ===============================
export const checkIn = async (req, res) => {
  try {
    const employeeId = req.user._id;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const now = new Date();
    const time = getFormattedTime();

    const employee = await Employee.findById(employeeId);

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: "Employee not found",
      });
    }

    let attendance = await Attendance.findOne({
      employeeId,
      date: today,
    });

    // Attendance already exists
    if (attendance) {
      if (attendance.checkInTime) {
        return res.status(400).json({
          success: false,
          message: "Already checked in today",
          attendance,
        });
      }

      attendance.checkInTime = time;
      attendance.status = "Present";

      await attendance.save();

      return res.status(200).json({
        success: true,
        message: "Check-in successful",
        attendance,
      });
    }

    // First check-in of the day
    // Calculate timing only once

    let timing = "inTime";

    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();

    const totalMinutes = currentHour * 60 + currentMinute;

    const earlyLimit = 9 * 60 + 50; // 09:50
    const lateLimit = 10 * 60 + 25; // 10:25

    if (totalMinutes <= earlyLimit) {
      timing = "early";
    } else if (totalMinutes >= lateLimit) {
      timing = "late";
    } else {
      timing = "inTime";
    }

    attendance = await Attendance.create({
      employeeId,
      companyId: employee.companyId,
      departmentId: employee.departmentId,
      date: today,
      status: "Present",
      timing,
      checkInTime: time,
      checkOutTime: "",
    });

    return res.status(200).json({
      success: true,
      message: "Check-in successful",
      attendance,
    });
  } catch (error) {
    console.log("CheckIn Error:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


// ===============================
// CHECK-OUT
// ===============================
export const checkOut = async (req, res) => {
  try {
    const employeeId = req.user._id;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const time = getFormattedTime();
    const attendance =
      await Attendance.findOne({
        employeeId,
        date: today,
      });
    if (!attendance) {
      return res.status(404).json({
        success: false,
        message:
          "No check-in found for today",
      });
    }
    attendance.checkOutTime = time;
    await attendance.save();
    return res.status(200).json({
      success: true,
      message:
        "Check-out successful",
      attendance,
    });
  } catch (error) {
    console.log(
      "CheckOut Error:",
      error
    );
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};