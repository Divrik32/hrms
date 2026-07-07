import Absent from "../models/absentModel.js";

export const markAbsent = async (
  req,
  res
) => {
  try {
    const {
      companyId,
      employeeId,
      absentDate,
      duration,
    } = req.body;

    if (
      !companyId ||
      !employeeId ||
      !absentDate ||
      !duration
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Company, Employee, Date and Duration are required",
      });
    }

    const existingAbsent =
      await Absent.findOne({
        employeeId,
        absentDate: new Date(
          absentDate
        ),
      });

    if (existingAbsent) {
      return res.status(400).json({
        success: false,
        message:
          "Employee already marked absent on this date",
      });
    }

    const absent =
      await Absent.create({
        companyId,
        employeeId,
        absentDate,
        duration,
        markedBy:
          req.admin?._id,
      });

    return res.status(201).json({
      success: true,
      message:
        "Employee marked absent successfully",
      absent,
    });
  } catch (error) {
    console.log(error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const removeAbsent = async (req, res) => {
  try {
    const { employeeId, absentDate } = req.body;

    if (!employeeId || !absentDate) {
      return res.status(400).json({
        success: false,
        message: "Employee ID and absent date are required",
      });
    }

    const selectedDate = new Date(absentDate);

    const absent = await Absent.findOne({
      employeeId,
      absentDate: selectedDate,
    });

    if (!absent) {
      return res.status(404).json({
        success: false,
        message: "Absent record not found",
      });
    }

    await Absent.findByIdAndDelete(absent._id);

    return res.status(200).json({
      success: true,
      message: "Absent record removed successfully",
    });
  } catch (error) {
    console.log(error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getEmployeeAbsentDates = async (req, res) => {
  try {
    const { employeeId, month, year } = req.body;

    if (!employeeId || !month || !year) {
      return res.status(400).json({
        success: false,
        message: "Employee ID, month and year are required",
      });
    }

    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 1);

    const absents = await Absent.find({
      employeeId,
      absentDate: {
        $gte: startDate,
        $lt: endDate,
      },
    }).sort({ absentDate: 1 });

    return res.status(200).json({
  success: true,

  totalAbsentDays: absents.reduce(
    (sum, item) => sum + item.duration,
    0
  ),

  absentDates: absents.map((item) => ({
    absentDate: item.absentDate,
    duration: item.duration,
  })),
});
  } catch (error) {
    console.log(error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getMonthlyAbsents = async (req, res) => {
  try {
    const { companyId, month, year } = req.body;

    if (!companyId || !month || !year) {
      return res.status(400).json({
        success: false,
        message: "Company ID, month and year are required",
      });
    }

    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 1);

    const absents = await Absent.find({
      companyId,
      absentDate: {
        $gte: startDate,
        $lt: endDate,
      },
    })
      .populate({
        path: "employeeId",
        select: "name empId email departmentId profilePic",
        populate: {
          path: "departmentId",
          select: "departmentName",
        },
      })
      .populate({
        path: "markedBy",
        select: "name email",
      })
      .sort({
        absentDate: 1,
      });

return res.status(200).json({
  success: true,

  totalAbsents: absents.reduce(
    (sum, item) => sum + item.duration,
    0
  ),

  absents,
});
  } catch (error) {
    console.log(error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};