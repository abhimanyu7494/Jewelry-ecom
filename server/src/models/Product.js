const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    // =====================================================
    // CATEGORY
    // =====================================================

    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: [true, "Category is required"],
    },

    // =====================================================
    // BASIC PRODUCT INFO
    // =====================================================

    name: {
      type: String,
      required: [true, "Product name is required"],
      trim: true,
      minlength: [
        2,
        "Product name must be at least 2 characters",
      ],
      maxlength: [
        150,
        "Product name cannot exceed 150 characters",
      ],
    },

    brand: {
      type: String,
      trim: true,
      maxlength: [
        100,
        "Brand name cannot exceed 100 characters",
      ],
      default: "",
    },

    sku: {
      type: String,
      trim: true,
      uppercase: true,
      maxlength: [
        50,
        "SKU cannot exceed 50 characters",
      ],
      default: null,
    },

    shortDescription: {
      type: String,
      trim: true,
      maxlength: [
        500,
        "Short description cannot exceed 500 characters",
      ],
      default: "",
    },

    description: {
      type: String,
      trim: true,
      maxlength: [
        5000,
        "Description cannot exceed 5000 characters",
      ],
      default: "",
    },

    // =====================================================
    // PRICING / STOCK
    // =====================================================

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

    buyPrice: {
      type: Number,
      required: [true, "Buy price is required"],
      min: [0, "Buy price cannot be negative"],
      validate: {
        validator: Number.isFinite,
        message: "Buy price must be a valid number",
      },
    },

    sellPrice: {
      type: Number,
      required: [true, "Selling price is required"],
      min: [0, "Selling price cannot be negative"],
      validate: {
        validator: Number.isFinite,
        message: "Selling price must be a valid number",
      },
    },

    mrp: {
      type: Number,
      min: [0, "MRP cannot be negative"],
      default: null,
      validate: {
        validator: function (value) {
          return value === null || Number.isFinite(value);
        },
        message: "MRP must be a valid number",
      },
    },

    // =====================================================
    // IMAGES
    // =====================================================

    image: {
      type: String,
      required: [true, "Product image is required"],
      trim: true,
    },

    images: {
      type: [
        {
          type: String,
          trim: true,
        },
      ],
      default: [],
      validate: {
        validator: function (images) {
          return images.length <= 10;
        },
        message:
          "A product can have maximum 10 gallery images",
      },
    },

    // =====================================================
    // METAL
    // =====================================================

    metal: {
      type: String,
      trim: true,
      maxlength: [
        50,
        "Metal name cannot exceed 50 characters",
      ],
      default: "",
    },

    purity: {
      type: String,
      trim: true,
      maxlength: [
        30,
        "Purity cannot exceed 30 characters",
      ],
      default: "",
    },

    metalColor: {
      type: String,
      trim: true,
      maxlength: [
        30,
        "Metal color cannot exceed 30 characters",
      ],
      default: "",
    },

    // =====================================================
    // WEIGHT
    // =====================================================

    grossWeight: {
      type: Number,
      min: [0, "Gross weight cannot be negative"],
      default: null,
      validate: {
        validator: function (value) {
          return value === null || Number.isFinite(value);
        },
        message:
          "Gross weight must be a valid number",
      },
    },

    netWeight: {
      type: Number,
      min: [0, "Net weight cannot be negative"],
      default: null,
      validate: {
        validator: function (value) {
          return value === null || Number.isFinite(value);
        },
        message:
          "Net weight must be a valid number",
      },
    },

    // =====================================================
    // STONE
    // =====================================================

    stoneType: {
      type: String,
      trim: true,
      maxlength: [
        50,
        "Stone type cannot exceed 50 characters",
      ],
      default: "",
    },

    stoneWeight: {
      type: Number,
      min: [0, "Stone weight cannot be negative"],
      default: null,
      validate: {
        validator: function (value) {
          return value === null || Number.isFinite(value);
        },
        message:
          "Stone weight must be a valid number",
      },
    },

    stoneColor: {
      type: String,
      trim: true,
      maxlength: [
        30,
        "Stone color cannot exceed 30 characters",
      ],
      default: "",
    },

    stoneClarity: {
      type: String,
      trim: true,
      maxlength: [
        30,
        "Stone clarity cannot exceed 30 characters",
      ],
      default: "",
    },

    // =====================================================
    // SIZES
    // =====================================================

    sizes: {
      type: [
        {
          type: String,
          trim: true,
          maxlength: 30,
        },
      ],
      default: [],
      validate: {
        validator: function (sizes) {
          return sizes.length <= 30;
        },
        message:
          "A product can have maximum 30 sizes",
      },
    },

    // =====================================================
    // DIMENSIONS
    // =====================================================

    dimensions: {
      length: {
        type: Number,
        min: [0, "Length cannot be negative"],
        default: null,
      },

      width: {
        type: Number,
        min: [0, "Width cannot be negative"],
        default: null,
      },

      height: {
        type: Number,
        min: [0, "Height cannot be negative"],
        default: null,
      },
    },

    // =====================================================
    // EXTRA INFORMATION
    // =====================================================

    gender: {
      type: String,
      enum: {
        values: ["Men", "Women", "Unisex"],
        message:
          "Gender must be Men, Women or Unisex",
      },
      default: "Unisex",
    },

    occasion: {
      type: String,
      trim: true,
      maxlength: [
        100,
        "Occasion cannot exceed 100 characters",
      ],
      default: "",
    },

    certification: {
      type: String,
      trim: true,
      maxlength: [
        100,
        "Certification cannot exceed 100 characters",
      ],
      default: "",
    },

    warranty: {
      type: String,
      trim: true,
      maxlength: [
        200,
        "Warranty cannot exceed 200 characters",
      ],
      default: "",
    },

    careInstructions: {
      type: String,
      trim: true,
      maxlength: [
        2000,
        "Care instructions cannot exceed 2000 characters",
      ],
      default: "",
    },

    // =====================================================
    // POSITIONS
    // =====================================================

    allPosition: {
      type: Number,
      min: [
        1,
        "All position must be at least 1",
      ],
      default: null,
      validate: {
        validator: (value) =>
          value === null || Number.isInteger(value),
        message:
          "All position must be an integer",
      },
    },

    categoryPosition: {
      type: Number,
      min: [
        1,
        "Category position must be at least 1",
      ],
      default: null,
      validate: {
        validator: (value) =>
          value === null || Number.isInteger(value),
        message:
          "Category position must be an integer",
      },
    },
  },

  {
    timestamps: true,
    strict: true,
    versionKey: false,
  }
);

// =====================================================
// INDEXES
// =====================================================

// Category index
productSchema.index({
  category: 1,
});

// All products ordering
productSchema.index({
  allPosition: 1,
});

// Category ordering
productSchema.index({
  category: 1,
  categoryPosition: 1,
});

// Price sorting
productSchema.index({
  sellPrice: 1,
});

// Newest products
productSchema.index({
  createdAt: -1,
});

// SKU
productSchema.index({
  sku: 1,
});

// =====================================================
// PRE SAVE
// =====================================================

productSchema.pre("save", function () {
  if (this.sku) {
    this.sku = this.sku.trim().toUpperCase();
  }
});

// =====================================================
// MODEL
// =====================================================

module.exports = mongoose.model(
  "Product",
  productSchema
);
