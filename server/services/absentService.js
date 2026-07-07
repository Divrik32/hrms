import Absent from "../models/absentModel.js";

export const getEmployeeAbsentCount = async (
  companyId,
  employeeId,
  month,
  year
) => {
  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 1);

  const totalAbsent = await Absent.countDocuments({
    companyId,
    employeeId,
    absentDate: {
      $gte: startDate,
      $lt: endDate,
    },
  });

  return totalAbsent;
};