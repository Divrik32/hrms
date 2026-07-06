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
    } = req.body;

    if (
      !companyId ||
      !employeeId ||
      !absentDate
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Company, Employee and Date are required",
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
    selectedDate.setHours(0, 0, 0, 0);

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