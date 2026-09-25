import RoleModel from "../models/RoleModel.js";

// Create Role
export const createRole = async (req, res) => {
  try {
    const { roleName } = req.body;

    if (!roleName || !roleName.trim()) {
      return res.status(400).json({
        message: "Role name is required",
      });
    }

    const existingRole = await RoleModel.findOne({
      roleName: roleName.trim(),
    });

    if (existingRole) {
      return res.status(400).json({
        message: "Role already exists",
      });
    }

    const role = await RoleModel.create({
      roleName: roleName.trim(),
    });

    res.status(201).json({
      message: "Role created successfully",
      role,
    });
  } catch (error) {
    console.error("Create role error:", error);

    res.status(500).json({
      message: "Server error",
    });
  }
};

// Get All Roles
export const getRoles = async (req, res) => {
  try {
    const roles = await RoleModel.find().sort({
      roleName: 1,
    });

    res.status(200).json({
      roles,
    });
  } catch (error) {
    console.error("Get roles error:", error);

    res.status(500).json({
      message: "Server error",
    });
  }
};

// Delete Role
export const deleteRole = async (req, res) => {
  try {
    const { id } = req.params;

    const role = await RoleModel.findById(id);

    if (!role) {
      return res.status(404).json({
        message: "Role not found",
      });
    }

    await RoleModel.findByIdAndDelete(id);

    res.status(200).json({
      message: "Role deleted successfully",
    });
  } catch (error) {
    console.error("Delete role error:", error);

    res.status(500).json({
      message: "Server error",
    });
  }
};