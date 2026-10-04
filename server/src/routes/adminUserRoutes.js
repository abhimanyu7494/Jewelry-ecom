const express = require("express");

const {
  getAllUsers,
  deleteUser,
} = require("../controllers/adminUserController");

const protect = require("../middleware/authMiddleware");

const router = express.Router();


// =====================================================
// Get All Users
// Protected: Admin Only
// =====================================================

router.get("/", protect, getAllUsers);


// =====================================================
// Delete User
// Protected: Admin Only
// =====================================================

router.delete("/:id", protect, deleteUser);


module.exports = router;
