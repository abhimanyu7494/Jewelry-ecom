const mongoose = require("mongoose");

const Category = require("../models/Category");
const Product = require("../models/Product");

// =====================================================
// HELPER
// =====================================================

const isValidObjectId = (id) => {
  return mongoose.Types.ObjectId.isValid(id);
};

const normalizeName = (name) => {
  if (typeof name !== "string") {
    return "";
  }

  return name.trim().replace(/\s+/g, " ");
};

// =====================================================
// CREATE CATEGORY
// =====================================================

const createCategory = async (req, res) => {
  try {
    const { name, image } = req.body;

    const cleanName = normalizeName(name);

    // Required fields
    if (!cleanName || !image) {
      return res.status(400).json({
        message: "Category name and image are required",
      });
    }

    // Name length
    if (cleanName.length < 2) {
      return res.status(400).json({
        message: "Category name must be at least 2 characters",
      });
    }

    if (cleanName.length > 100) {
      return res.status(400).json({
        message: "Category name cannot exceed 100 characters",
      });
    }

    // Check duplicate
    const existingCategory = await Category.findOne({
      name: {
        $regex: `^${cleanName.replace(
          /[.*+?^${}()|[\]\\]/g,
          "\\$&"
        )}$`,
        $options: "i",
      },
    });

    if (existingCategory) {
      return res.status(409).json({
        message: "Category already exists",
      });
    }

    const category = await Category.create({
      name: cleanName,
      image,
    });

    return res.status(201).json({
      message: "Category created successfully",
      category,
    });
  } catch (error) {
    console.error("Create category error:", error);

    // MongoDB duplicate key
    if (error.code === 11000) {
      return res.status(409).json({
        message: "Category already exists",
      });
    }

    return res.status(500).json({
      message: "Failed to create category",
    });
  }
};

// =====================================================
// GET ALL CATEGORIES
// =====================================================

const getCategories = async (req, res) => {
  try {
    const categories = await Category.find()
      .sort({ createdAt: -1 })
      .lean();

    return res.status(200).json(categories);
  } catch (error) {
    console.error("Get categories error:", error);

    return res.status(500).json({
      message: "Failed to get categories",
    });
  }
};

// =====================================================
// GET SINGLE CATEGORY
// =====================================================

const getCategory = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        message: "Invalid category ID",
      });
    }

    const category = await Category.findById(id).lean();

    if (!category) {
      return res.status(404).json({
        message: "Category not found",
      });
    }

    return res.status(200).json(category);
  } catch (error) {
    console.error("Get category error:", error);

    return res.status(500).json({
      message: "Failed to get category",
    });
  }
};

// =====================================================
// UPDATE CATEGORY
// =====================================================

const updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, image } = req.body;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        message: "Invalid category ID",
      });
    }

    const cleanName = normalizeName(name);

    // Required fields
    if (!cleanName || !image) {
      return res.status(400).json({
        message: "Category name and image are required",
      });
    }

    // Name length
    if (cleanName.length < 2) {
      return res.status(400).json({
        message: "Category name must be at least 2 characters",
      });
    }

    if (cleanName.length > 100) {
      return res.status(400).json({
        message: "Category name cannot exceed 100 characters",
      });
    }

    // Check category exists
    const existingCategory = await Category.findById(id);

    if (!existingCategory) {
      return res.status(404).json({
        message: "Category not found",
      });
    }

    // Check duplicate name excluding current category
    const duplicateCategory = await Category.findOne({
      _id: {
        $ne: id,
      },
      name: {
        $regex: `^${cleanName.replace(
          /[.*+?^${}()|[\]\\]/g,
          "\\$&"
        )}$`,
        $options: "i",
      },
    });

    if (duplicateCategory) {
      return res.status(409).json({
        message: "Category already exists",
      });
    }

    const category = await Category.findByIdAndUpdate(
      id,
      {
        name: cleanName,
        image,
      },
      {
        new: true,
        runValidators: true,
      }
    );

    return res.status(200).json({
      message: "Category updated successfully",
      category,
    });
  } catch (error) {
    console.error("Update category error:", error);

    if (error.code === 11000) {
      return res.status(409).json({
        message: "Category already exists",
      });
    }

    return res.status(500).json({
      message: "Failed to update category",
    });
  }
};

// =====================================================
// DELETE CATEGORY
// =====================================================

const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        message: "Invalid category ID",
      });
    }

    const category = await Category.findById(id);

    if (!category) {
      return res.status(404).json({
        message: "Category not found",
      });
    }

    // Delete related products
    await Product.deleteMany({
      category: id,
    });

    // Delete category
    await Category.findByIdAndDelete(id);

    return res.status(200).json({
      message:
        "Category and related products deleted successfully",
    });
  } catch (error) {
    console.error("Delete category error:", error);

    return res.status(500).json({
      message: "Failed to delete category",
    });
  }
};

module.exports = {
  createCategory,
  getCategories,
  getCategory,
  updateCategory,
  deleteCategory,
};
