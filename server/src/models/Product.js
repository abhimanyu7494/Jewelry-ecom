const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    // =========================
    // CATEGORY
    // =========================

    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: [true, "Category is required"],
    },

    // =========================
    // PRODUCT NAME
    // =========================

    name: {
      type: String,
      required: [true, "Product name is required"],
      trim: true,
      minlength: [2, "Product name must be at least 2 characters"],
      maxlength: [150, "Product name cannot exceed 150 characters"],
    },

    // =========================
    // STOCK
    // =========================

    stock: {
      type: Number,
      required: [true, "Stock is required"],
      min: [0, "Stock cannot be negative"],
      default: 0,
      validate: {
        validator: Number.isFinite,
        message: "Stock must be a valid number",
      },
    },

    // =========================
    // BUY PRICE
    // =========================

    buyPrice: {
      type: Number,
      required: [true, "Buy price is required"],
      min: [0, "Buy price cannot be negative"],
      validate: {
        validator: Number.isFinite,
        message: "Buy price must be a valid number",
      },
    },

    // =========================
    // SELL PRICE
    // =========================

    sellPrice: {
      type: Number,
      required: [true, "Sell price is required"],
      min: [0, "Sell price cannot be negative"],
      validate: {
        validator: Number.isFinite,
        message: "Sell price must be a valid number",
      },
    },

    // =========================
    // IMAGE
    // =========================

    image: {
      type: String,
      required: [true, "Product image is required"],
      trim: true,
    },

    // =========================
    // PRODUCT POSITIONS
    // =========================

    // Home page - All Products
    allPosition: {
      type: Number,
      min: [1, "All position must be at least 1"],
      default: null,
      validate: {
        validator: (value) =>
          value === null ||
          Number.isInteger(value),
        message: "All position must be an integer",
      },
    },

    // Category wise product position
    categoryPosition: {
      type: Number,
      min: [1, "Category position must be at least 1"],
      default: null,
      validate: {
        validator: (value) =>
          value === null ||
          Number.isInteger(value),
        message:
          "Category position must be an integer",
      },
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model(
  "Product",
  productSchema
);
