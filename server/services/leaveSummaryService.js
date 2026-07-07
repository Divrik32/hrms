import LeaveRequest from "../models/LeaveRequest.js";

export const getEmployeeLeaveSummary = async (
  companyId,
  employeeId,
  month,
  year
) => {
  const leaveRequests = await LeaveRequest.find({
    companyId,
    employeeId,
    status: "Approved",
  }).select("leaveDetails extraLeaveDetails");

  const leaveSummary = {
    paidLeave: {
      casualLeave: 0,
      sickLeave: 0,
      paidLeave: 0,
      compOff: 0,
    },

    unpaidLeave: {
      extraCasualLeave: 0,
      extraSickLeave: 0,
    },
  };

  for (const request of leaveRequests) {
    // ---------- Normal Leave ----------
    request.leaveDetails?.leaveDates?.forEach((leave) => {
      const date = new Date(leave.date);

      if (
        date.getMonth() + 1 !== month ||
        date.getFullYear() !== year
      ) {
        return;
      }

      switch (leave.leaveType) {
        case "Casual Leave":
          leaveSummary.paidLeave.casualLeave += leave.duration;
          break;

        case "Sick Leave":
          leaveSummary.paidLeave.sickLeave += leave.duration;
          break;

        case "Paid Leave":
          leaveSummary.paidLeave.paidLeave += leave.duration;
          break;

        case "Compensatory Off":
          leaveSummary.paidLeave.compOff += leave.duration;
          break;
      }
    });

    // ---------- Extra Leave ----------
    request.extraLeaveDetails?.extraLeaveDates?.forEach((leave) => {
      const date = new Date(leave.date);

      if (
        date.getMonth() + 1 !== month ||
        date.getFullYear() !== year
      ) {
        return;
      }

      const type =
        request.extraLeaveDetails.extraLeaveType;

      if (type?.casualLeave > 0) {
        leaveSummary.unpaidLeave.extraCasualLeave +=
          leave.duration;
      } else if (type?.sickLeave > 0) {
        leaveSummary.unpaidLeave.extraSickLeave +=
          leave.duration;
      }
    });
  }

  return leaveSummary;
};