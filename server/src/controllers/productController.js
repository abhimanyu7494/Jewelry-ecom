const mongoose = require("mongoose");
const Product = require("../models/Product");
const Category = require("../models/Category");

// =====================================================
// HELPER FUNCTIONS
// =====================================================

// Find first available position from 1...maxPosition
const getAvailablePosition = async ({
  field,
  categoryId = null,
  excludeId = null,
  maxPosition,
}) => {
  const query = {};

  if (categoryId) {
    query.category = categoryId;
  }

  if (excludeId) {
    query._id = {
      $ne: excludeId,
    };
  }

  const products = await Product.find(query)
    .select(field)
    .sort({ [field]: 1 })
    .lean();

  const occupiedPositions = new Set();

  products.forEach((product) => {
    const position = product[field];

    if (
      Number.isInteger(position) &&
      position >= 1
    ) {
      occupiedPositions.add(position);
    }
  });

  for (
    let position = 1;
    position <= maxPosition;
    position++
  ) {
    if (!occupiedPositions.has(position)) {
      return position;
    }
  }

  return maxPosition;
};

// =====================================================
// NORMALIZE POSITION
// =====================================================

const normalizePosition = (value) => {
  if (
    value === undefined ||
    value === null ||
    value === ""
  ) {
    return null;
  }

  const number = Number(value);

  if (
    !Number.isInteger(number) ||
    number < 1
  ) {
    return null;
  }

  return number;
};

// =====================================================
// VALIDATE OBJECT ID
// =====================================================

const isValidObjectId = (id) => {
  return mongoose.Types.ObjectId.isValid(id);
};

// =====================================================
// VALIDATE PRODUCT VALUES
// =====================================================

const validateProductValues = ({
  name,
  stock,
  buyPrice,
  sellPrice,
  image,
}) => {
  if (
    typeof name !== "string" ||
    !name.trim()
  ) {
    return "Product name is required";
  }

  if (name.trim().length > 200) {
    return "Product name is too long";
  }

  if (
    stock === undefined ||
    stock === null ||
    stock === ""
  ) {
    return "Stock is required";
  }

  if (
    buyPrice === undefined ||
    buyPrice === null ||
    buyPrice === ""
  ) {
    return "Buy price is required";
  }

  if (
    sellPrice === undefined ||
    sellPrice === null ||
    sellPrice === ""
  ) {
    return "Sell price is required";
  }

  if (
    typeof image !== "string" ||
    !image.trim()
  ) {
    return "Product image is required";
  }

  const numericStock = Number(stock);
  const numericBuyPrice = Number(buyPrice);
  const numericSellPrice = Number(sellPrice);

  if (
    !Number.isFinite(numericStock) ||
    !Number.isInteger(numericStock) ||
    numericStock < 0
  ) {
    return "Stock must be a valid non-negative integer";
  }

  if (
    !Number.isFinite(numericBuyPrice) ||
    numericBuyPrice < 0
  ) {
    return "Buy price must be a valid non-negative number";
  }

  if (
    !Number.isFinite(numericSellPrice) ||
    numericSellPrice < 0
  ) {
    return "Sell price must be a valid non-negative number";
  }

  if (image.trim().length > 2000) {
    return "Image value is too long";
  }

  return null;
};

// =====================================================
// CREATE PRODUCT
// =====================================================

const createProduct = async (req, res) => {
  try {
    const {
      category,
      name,
      stock,
      buyPrice,
      sellPrice,
      image,
      allPosition,
      categoryPosition,
    } = req.body;

    // =========================
    // Required Fields
    // =========================

    if (!category) {
      return res.status(400).json({
        message: "Category is required",
      });
    }

    const validationError =
      validateProductValues({
        name,
        stock,
        buyPrice,
        sellPrice,
        image,
      });

    if (validationError) {
      return res.status(400).json({
        message: validationError,
      });
    }

    // =========================
    // Validate Category ID
    // =========================

    if (!isValidObjectId(category)) {
      return res.status(400).json({
        message: "Invalid category",
      });
    }

    // =========================
    // Check Category
    // =========================

    const categoryExists =
      await Category.findById(category);

    if (!categoryExists) {
      return res.status(404).json({
        message: "Category not found",
      });
    }

    // =========================
    // Count Existing Products
    // =========================

    const totalProducts =
      await Product.countDocuments();

    const categoryProducts =
      await Product.countDocuments({
        category,
      });

    // =========================
    // Normalize Positions
    // =========================

    let finalAllPosition =
      normalizePosition(allPosition);

    let finalCategoryPosition =
      normalizePosition(categoryPosition);

    // =========================
    // ALL PRODUCT POSITION
    // =========================

    if (finalAllPosition === null) {
      finalAllPosition =
        await getAvailablePosition({
          field: "allPosition",
          maxPosition: totalProducts + 1,
        });
    } else {
      const maxPosition =
        totalProducts + 1;

      if (
        finalAllPosition > maxPosition
      ) {
        return res.status(400).json({
          message: `All position must be between 1 and ${maxPosition}`,
        });
      }

      const existingProduct =
        await Product.findOne({
          allPosition: finalAllPosition,
        });

      if (existingProduct) {
        return res.status(400).json({
          message: `All position ${finalAllPosition} is already occupied`,
        });
      }
    }

    // =========================
    // CATEGORY POSITION
    // =========================

    if (finalCategoryPosition === null) {
      finalCategoryPosition =
        await getAvailablePosition({
          field: "categoryPosition",
          categoryId: category,
          maxPosition:
            categoryProducts + 1,
        });
    } else {
      const maxPosition =
        categoryProducts + 1;

      if (
        finalCategoryPosition >
        maxPosition
      ) {
        return res.status(400).json({
          message: `Category position must be between 1 and ${maxPosition}`,
        });
      }

      const existingProduct =
        await Product.findOne({
          category,
          categoryPosition:
            finalCategoryPosition,
        });

      if (existingProduct) {
        return res.status(400).json({
          message: `Category position ${finalCategoryPosition} is already occupied in this category`,
        });
      }
    }

    // =========================
    // CREATE
    // =========================

    const product =
      await Product.create({
        category,
        name: name.trim(),
        stock: Number(stock),
        buyPrice: Number(buyPrice),
        sellPrice: Number(sellPrice),
        image: image.trim(),
        allPosition: finalAllPosition,
        categoryPosition:
          finalCategoryPosition,
      });

    const populatedProduct =
      await product.populate(
        "category",
        "name image"
      );

    return res.status(201).json({
      message:
        "Product created successfully",
      product: populatedProduct,
    });
  } catch (error) {
    console.error(
      "Create product error:",
      error
    );

    return res.status(500).json({
      message: "Failed to create product",
    });
  }
};

// =====================================================
// GET PRODUCTS
// =====================================================

const getProducts = async (req, res) => {
  try {
    const {
      search = "",
      category = "",
      sort = "",
    } = req.query;

    const productQuery = {};

    // =========================
    // Category Filter
    // =========================

    if (category) {
      if (!isValidObjectId(category)) {
        return res.status(400).json({
          message: "Invalid category",
        });
      }

      const categoryExists =
        await Category.findById(category);

      if (!categoryExists) {
        return res.status(404).json({
          message: "Category not found",
        });
      }

      productQuery.category = category;
    }

    // =========================
    // Search
    // =========================

    if (
      typeof search === "string" &&
      search.trim()
    ) {
      // Escape regex special characters.
      const escapedSearch = search
        .trim()
        .replace(
          /[.*+?^${}()|[\]\\]/g,
          "\\$&"
        );

      const searchRegex = new RegExp(
        escapedSearch,
        "i"
      );

      const matchingCategories =
        await Category.find({
          name: searchRegex,
        }).select("_id");

      const categoryIds =
        matchingCategories.map(
          (cat) => cat._id
        );

      productQuery.$or = [
        {
          name: searchRegex,
        },
        {
          category: {
            $in: categoryIds,
          },
        },
      ];
    }

    // =========================
    // Price Sort
    // =========================

    if (sort === "price_asc") {
      const products =
        await Product.find(productQuery)
          .populate(
            "category",
            "name image"
          )
          .sort({
            sellPrice: 1,
            createdAt: -1,
          });

      return res.status(200).json(products);
    }

    if (sort === "price_desc") {
      const products =
        await Product.find(productQuery)
          .populate(
            "category",
            "name image"
          )
          .sort({
            sellPrice: -1,
            createdAt: -1,
          });

      return res.status(200).json(products);
    }

    // =========================
    // Default Position Sort
    // =========================

    const products =
      await Product.find(productQuery)
        .populate(
          "category",
          "name image"
        )
        .sort({
          allPosition: 1,
          createdAt: -1,
        });

    return res.status(200).json(products);
  } catch (error) {
    console.error(
      "Get products error:",
      error
    );

    return res.status(500).json({
      message: "Failed to get products",
    });
  }
};

// =====================================================
// GET SINGLE PRODUCT
// =====================================================

const getProduct = async (req, res) => {
  try {
    if (
      !isValidObjectId(req.params.id)
    ) {
      return res.status(400).json({
        message: "Invalid product ID",
      });
    }

    const product =
      await Product.findById(
        req.params.id
      ).populate(
        "category",
        "name image"
      );

    if (!product) {
      return res.status(404).json({
        message: "Product not found",
      });
    }

    return res.status(200).json(product);
  } catch (error) {
    console.error(
      "Get product error:",
      error
    );

    return res.status(500).json({
      message: "Failed to get product",
    });
  }
};

// =====================================================
// UPDATE PRODUCT
// =====================================================

const updateProduct = async (req, res) => {
  try {
    const {
      category,
      name,
      stock,
      buyPrice,
      sellPrice,
      image,
      allPosition,
      categoryPosition,
    } = req.body;

    // =========================
    // Validate Product ID
    // =========================

    if (
      !isValidObjectId(req.params.id)
    ) {
      return res.status(400).json({
        message: "Invalid product ID",
      });
    }

    // =========================
    // Required Category
    // =========================

    if (!category) {
      return res.status(400).json({
        message: "Category is required",
      });
    }

    // =========================
    // Validate Product Values
    // =========================

    const validationError =
      validateProductValues({
        name,
        stock,
        buyPrice,
        sellPrice,
        image,
      });

    if (validationError) {
      return res.status(400).json({
        message: validationError,
      });
    }

    // =========================
    // Validate Category ID
    // =========================

    if (!isValidObjectId(category)) {
      return res.status(400).json({
        message: "Invalid category",
      });
    }

    // =========================
    // Current Product
    // =========================

    const currentProduct =
      await Product.findById(
        req.params.id
      );

    if (!currentProduct) {
      return res.status(404).json({
        message: "Product not found",
      });
    }

    // =========================
    // Check Category
    // =========================

    const categoryExists =
      await Category.findById(category);

    if (!categoryExists) {
      return res.status(404).json({
        message: "Category not found",
      });
    }

    // =========================
    // Total Products
    // =========================

    const totalProducts =
      await Product.countDocuments();

    // =========================
    // Normalize Positions
    // =========================

    let finalAllPosition =
      normalizePosition(allPosition);

    let finalCategoryPosition =
      normalizePosition(categoryPosition);

    // =================================================
    // ALL POSITION
    // =================================================

    if (finalAllPosition === null) {
      finalAllPosition =
        await getAvailablePosition({
          field: "allPosition",
          excludeId: req.params.id,
          maxPosition: totalProducts,
        });
    } else {
      if (
        finalAllPosition > totalProducts
      ) {
        return res.status(400).json({
          message: `All position must be between 1 and ${totalProducts}`,
        });
      }

      const existingProduct =
        await Product.findOne({
          allPosition:
            finalAllPosition,
          _id: {
            $ne: req.params.id,
          },
        });

      if (existingProduct) {
        return res.status(400).json({
          message: `All position ${finalAllPosition} is already occupied`,
        });
      }
    }

    // =================================================
    // CATEGORY POSITION
    // =================================================

    const targetCategoryCount =
      await Product.countDocuments({
        category,
        _id: {
          $ne: req.params.id,
        },
      });

    if (finalCategoryPosition === null) {
      finalCategoryPosition =
        await getAvailablePosition({
          field: "categoryPosition",
          categoryId: category,
          excludeId: req.params.id,
          maxPosition:
            targetCategoryCount + 1,
        });
    } else {
      if (
        finalCategoryPosition >
        targetCategoryCount + 1
      ) {
        return res.status(400).json({
          message: `Category position must be between 1 and ${
            targetCategoryCount + 1
          }`,
        });
      }

      const existingProduct =
        await Product.findOne({
          category,
          categoryPosition:
            finalCategoryPosition,
          _id: {
            $ne: req.params.id,
          },
        });

      if (existingProduct) {
        return res.status(400).json({
          message: `Category position ${finalCategoryPosition} is already occupied in this category`,
        });
      }
    }

    // =================================================
    // UPDATE
    // =================================================

    const product =
      await Product.findByIdAndUpdate(
        req.params.id,
        {
          category,
          name: name.trim(),
          stock: Number(stock),
          buyPrice: Number(buyPrice),
          sellPrice: Number(sellPrice),
          image: image.trim(),
          allPosition:
            finalAllPosition,
          categoryPosition:
            finalCategoryPosition,
        },
        {
          new: true,
          runValidators: true,
        }
      ).populate(
        "category",
        "name image"
      );

    return res.status(200).json({
      message:
        "Product updated successfully",
      product,
    });
  } catch (error) {
    console.error(
      "Update product error:",
      error
    );

    return res.status(500).json({
      message: "Failed to update product",
    });
  }
};

// =====================================================
// DELETE PRODUCT
// =====================================================

const deleteProduct = async (req, res) => {
  try {
    if (
      !isValidObjectId(req.params.id)
    ) {
      return res.status(400).json({
        message: "Invalid product ID",
      });
    }

    const product =
      await Product.findByIdAndDelete(
        req.params.id
      );

    if (!product) {
      return res.status(404).json({
        message: "Product not found",
      });
    }

    return res.status(200).json({
      message:
        "Product deleted successfully",
    });
  } catch (error) {
    console.error(
      "Delete product error:",
      error
    );

    return res.status(500).json({
      message:
        "Failed to delete product",
    });
  }
};

// =====================================================
// UPDATE STOCK
// =====================================================

const updateStock = async (req, res) => {
  try {
    // =========================
    // Validate Product ID
    // =========================

    if (
      !isValidObjectId(req.params.id)
    ) {
      return res.status(400).json({
        message: "Invalid product ID",
      });
    }

    const { action } = req.body;

    if (
      !["increase", "decrease"].includes(
        action
      )
    ) {
      return res.status(400).json({
        message:
          "Action must be increase or decrease",
      });
    }

    const product =
      await Product.findById(
        req.params.id
      );

    if (!product) {
      return res.status(404).json({
        message: "Product not found",
      });
    }

    // =========================
    // Increase
    // =========================

    if (action === "increase") {
      product.stock += 1;
    }

    // =========================
    // Decrease
    // =========================

    if (action === "decrease") {
      if (product.stock <= 0) {
        return res.status(400).json({
          message:
            "Stock cannot be less than 0",
        });
      }

      product.stock -= 1;
    }

    await product.save();

    const updatedProduct =
      await product.populate(
        "category",
        "name image"
      );

    return res.status(200).json({
      message:
        "Stock updated successfully",
      product: updatedProduct,
    });
  } catch (error) {
    console.error(
      "Update stock error:",
      error
    );

    return res.status(500).json({
      message:
        "Failed to update stock",
    });
  }
};

// =====================================================
// EXPORTS
// =====================================================

module.exports = {
  createProduct,
  getProducts,
  getProduct,
  updateProduct,
  deleteProduct,
  updateStock,
};
