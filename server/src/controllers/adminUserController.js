const mongoose = require("mongoose");
const User = require("../models/User");

// =====================================================
// Get All Users
// =====================================================

const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({})
      .select("_id fullName email phone createdAt")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: users.length,
      users,
    });
  } catch (error) {
    console.error("Get all users error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch users",
    });
  }
};


// =====================================================
// Delete User
// =====================================================

const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    // Check valid MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID",
      });
    }

    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    await User.findByIdAndDelete(id);

    return res.status(200).json({
      success: true,
      message: "User deleted successfully",
    });
  } catch (error) {
    console.error("Delete user error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to delete user",
    });
  }
};


module.exports = {
  getAllUsers,
  deleteUser,
};
