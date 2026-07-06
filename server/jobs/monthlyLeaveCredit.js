import cron from "node-cron";
import Employee from "../models/employeeModel.js";
import EmployeeLeaveBalance from "../models/EmployeeLeaveBalance.js";

export const startMonthlyLeaveCreditJob = () => {
    cron.schedule(
      "0 0 1 * *",
      async () => {
        try {
          console.log("Monthly leave credit running...");
          const employees = await Employee.find();
          const currentMonth = new Date().getMonth() + 1;
          const currentYear = new Date().getFullYear();
          for (const employee of employees) {
          const existing = await EmployeeLeaveBalance.findOne(
                {
                  employeeId: employee._id,
                  month: currentMonth,
                  year: currentYear,
                }
              );

            if (existing) { continue; }

         const lastBalance = await EmployeeLeaveBalance.findOne({employeeId: employee._id,}).sort({ year: -1, month: -1,});

            const casual = (lastBalance?.remainingCasualLeave || 0) + 0.5;
            const sick = (lastBalance?.remainingSickLeave || 0) + 0.5;
            const paid = (lastBalance?.remainingPaidLeave || 0) + 0.5;

            await EmployeeLeaveBalance.create(
              {
                employeeId: employee._id,
                companyId: employee.companyId,
                departmentId: employee.departmentId,
                month: currentMonth,
                year: currentYear,
                remainingCasualLeave: casual,
                remainingSickLeave: sick,
                remainingPaidLeave:paid,
              }
            );
          }
          console.log("Monthly leave credit completed");
        } catch (error) {
          console.log(error);
        }
      }
    );
  };