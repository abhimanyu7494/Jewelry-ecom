const express = require("express");
const protect = require("../middleware/authMiddleware");

const {
  createCategory,
  getCategories,
  getCategory,
  updateCategory,
  deleteCategory,
} = require("../controllers/categoryController");

const router = express.Router();

router.post("/", protect, createCategory);

router.get("/", getCategories);

router.get("/:id", getCategory);

router.put("/:id", protect, updateCategory);

router.delete("/:id", protect, deleteCategory);

module.exports = router;
