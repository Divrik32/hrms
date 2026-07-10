import Attendance from "../models/attendanceModel.js";

export const getEmployeeWorkingDays = async (
  companyId,
  employeeId,
  month,
  year
) => {
  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 1);

  const workingDays = await Attendance.countDocuments({
    companyId,
    employeeId,
    date: {
      $gte: startDate,
      $lt: endDate,
    },
  });

  return workingDays;
};