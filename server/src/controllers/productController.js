const mongoose = require("mongoose");
const Product = require("../models/Product");
const Category = require("../models/Category");

// =====================================================
// HELPERS
// =====================================================

const isValidObjectId = (id) => {
  return mongoose.Types.ObjectId.isValid(id);
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
// NORMALIZE STRING
// =====================================================

const normalizeString = (value) => {
  if (
    value === undefined ||
    value === null
  ) {
    return "";
  }

  return String(value).trim();
};

// =====================================================
// NORMALIZE OPTIONAL NUMBER
// =====================================================

const normalizeOptionalNumber = (value) => {
  if (
    value === undefined ||
    value === null ||
    value === ""
  ) {
    return null;
  }

  const number = Number(value);

  if (!Number.isFinite(number)) {
    return null;
  }

  return number;
};

// =====================================================
// NORMALIZE ARRAY
// =====================================================

const normalizeStringArray = (value) => {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((item) => String(item).trim())
    .filter(Boolean);
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
  gender,
  mrp,
}) => {
  // =========================
  // Name
  // =========================

  if (
    typeof name !== "string" ||
    !name.trim()
  ) {
    return "Product name is required";
  }

  if (name.trim().length < 2) {
    return "Product name must be at least 2 characters";
  }

  if (name.trim().length > 150) {
    return "Product name cannot exceed 150 characters";
  }

  // =========================
  // Stock
  // =========================

  const numericStock = Number(stock);

  if (
    stock === undefined ||
    stock === null ||
    stock === "" ||
    !Number.isFinite(numericStock) ||
    !Number.isInteger(numericStock) ||
    numericStock < 0
  ) {
    return "Stock must be a valid non-negative integer";
  }

  // =========================
  // Buy Price
  // =========================

  const numericBuyPrice = Number(buyPrice);

  if (
    buyPrice === undefined ||
    buyPrice === null ||
    buyPrice === "" ||
    !Number.isFinite(numericBuyPrice) ||
    numericBuyPrice < 0
  ) {
    return "Buy price must be a valid non-negative number";
  }

  // =========================
  // Sell Price
  // =========================

  const numericSellPrice = Number(sellPrice);

  if (
    sellPrice === undefined ||
    sellPrice === null ||
    sellPrice === "" ||
    !Number.isFinite(numericSellPrice) ||
    numericSellPrice < 0
  ) {
    return "Selling price must be a valid non-negative number";
  }

  // =========================
  // MRP
  // =========================

  if (
    mrp !== undefined &&
    mrp !== null &&
    mrp !== ""
  ) {
    const numericMrp = Number(mrp);

    if (
      !Number.isFinite(numericMrp) ||
      numericMrp < 0
    ) {
      return "MRP must be a valid non-negative number";
    }
  }

  // =========================
  // Image
  // =========================

  if (
    typeof image !== "string" ||
    !image.trim()
  ) {
    return "Product image is required";
  }

  if (image.trim().length > 2000) {
    return "Product image value is too long";
  }

  // =========================
  // Gender
  // =========================

  if (
    gender !== undefined &&
    gender !== null &&
    gender !== "" &&
    !["Men", "Women", "Unisex"].includes(gender)
  ) {
    return "Gender must be Men, Women or Unisex";
  }

  return null;
};

// =====================================================
// GET AVAILABLE POSITION
// =====================================================

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
// BUILD PRODUCT DATA
// =====================================================

const buildProductData = (body) => {
  const {
    category,
    name,
    brand,
    sku,
    shortDescription,
    description,

    stock,
    buyPrice,
    sellPrice,
    mrp,

    image,
    images,

    metal,
    purity,
    metalColor,

    grossWeight,
    netWeight,

    stoneType,
    stoneWeight,
    stoneColor,
    stoneClarity,

    sizes,

    dimensions,

    gender,
    occasion,
    certification,
    warranty,
    careInstructions,

    allPosition,
    categoryPosition,
  } = body;

  return {
    category,

    name: normalizeString(name),

    brand: normalizeString(brand),

    sku:
      normalizeString(sku) || null,

    shortDescription:
      normalizeString(shortDescription),

    description:
      normalizeString(description),

    stock: Number(stock),

    buyPrice: Number(buyPrice),

    sellPrice: Number(sellPrice),

    mrp: normalizeOptionalNumber(mrp),

    image: normalizeString(image),

    images:
      normalizeStringArray(images),

    metal: normalizeString(metal),

    purity: normalizeString(purity),

    metalColor:
      normalizeString(metalColor),

    grossWeight:
      normalizeOptionalNumber(grossWeight),

    netWeight:
      normalizeOptionalNumber(netWeight),

    stoneType:
      normalizeString(stoneType),

    stoneWeight:
      normalizeOptionalNumber(stoneWeight),

    stoneColor:
      normalizeString(stoneColor),

    stoneClarity:
      normalizeString(stoneClarity),

    sizes:
      normalizeStringArray(sizes),

    dimensions: {
      length:
        normalizeOptionalNumber(
          dimensions?.length
        ),

      width:
        normalizeOptionalNumber(
          dimensions?.width
        ),

      height:
        normalizeOptionalNumber(
          dimensions?.height
        ),
    },

    gender:
      ["Men", "Women", "Unisex"].includes(
        gender
      )
        ? gender
        : "Unisex",

    occasion:
      normalizeString(occasion),

    certification:
      normalizeString(certification),

    warranty:
      normalizeString(warranty),

    careInstructions:
      normalizeString(careInstructions),

    allPosition:
      normalizePosition(allPosition),

    categoryPosition:
      normalizePosition(categoryPosition),
  };
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
      gender,
      mrp,
    } = req.body;

    // =========================
    // Category Required
    // =========================

    if (!category) {
      return res.status(400).json({
        message: "Category is required",
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
    // Validate Product
    // =========================

    const validationError =
      validateProductValues({
        name,
        stock,
        buyPrice,
        sellPrice,
        image,
        gender,
        mrp,
      });

    if (validationError) {
      return res.status(400).json({
        message: validationError,
      });
    }

    // =========================
    // Check Category
    // =========================

    const categoryExists =
      await Category.exists({
        _id: category,
      });

    if (!categoryExists) {
      return res.status(404).json({
        message: "Category not found",
      });
    }

    // =========================
    // Count Products
    // =========================

    const totalProducts =
      await Product.countDocuments();

    const categoryProducts =
      await Product.countDocuments({
        category,
      });

    // =========================
    // Product Data
    // =========================

    const productData =
      buildProductData(req.body);

    // =========================
    // ALL POSITION
    // =========================

    if (
      productData.allPosition === null
    ) {
      productData.allPosition =
        await getAvailablePosition({
          field: "allPosition",
          maxPosition:
            totalProducts + 1,
        });
    } else {
      const maxPosition =
        totalProducts + 1;

      if (
        productData.allPosition >
        maxPosition
      ) {
        return res.status(400).json({
          message: `All position must be between 1 and ${maxPosition}`,
        });
      }

      const occupied =
        await Product.exists({
          allPosition:
            productData.allPosition,
        });

      if (occupied) {
        return res.status(400).json({
          message: `All position ${productData.allPosition} is already occupied`,
        });
      }
    }

    // =========================
    // CATEGORY POSITION
    // =========================

    if (
      productData.categoryPosition === null
    ) {
      productData.categoryPosition =
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
        productData.categoryPosition >
        maxPosition
      ) {
        return res.status(400).json({
          message: `Category position must be between 1 and ${maxPosition}`,
        });
      }

      const occupied =
        await Product.exists({
          category,
          categoryPosition:
            productData.categoryPosition,
        });

      if (occupied) {
        return res.status(400).json({
          message: `Category position ${productData.categoryPosition} is already occupied in this category`,
        });
      }
    }

    // =========================
    // SKU DUPLICATE CHECK
    // =========================

    if (productData.sku) {
      const existingSku =
        await Product.exists({
          sku: productData.sku,
        });

      if (existingSku) {
        return res.status(409).json({
          message: "SKU already exists",
        });
      }
    }

    // =========================
    // CREATE
    // =========================

    const product =
      await Product.create(
        productData
      );

    // =========================
    // POPULATE CATEGORY
    // =========================

    await product.populate(
      "category",
      "name image"
    );

    return res.status(201).json({
      message:
        "Product created successfully",
      product,
    });
  } catch (error) {
    console.error(
      "Create product error:",
      error
    );

    // Duplicate key
    if (error.code === 11000) {
      if (error.keyPattern?.sku) {
        return res.status(409).json({
          message: "SKU already exists",
        });
      }
    }

    // Mongoose validation
    if (
      error.name ===
      "ValidationError"
    ) {
      const messages = Object.values(
        error.errors
      ).map(
        (item) => item.message
      );

      return res.status(400).json({
        message: messages[0] ||
          "Product validation failed",
      });
    }

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
      gender = "",
      metal = "",
      page = 1,
      limit = 24,
    } = req.query;

    const productQuery = {};

    // =========================
    // Category
    // =========================

    if (category) {
      if (!isValidObjectId(category)) {
        return res.status(400).json({
          message: "Invalid category",
        });
      }

      const categoryExists =
        await Category.exists({
          _id: category,
        });

      if (!categoryExists) {
        return res.status(404).json({
          message: "Category not found",
        });
      }

      productQuery.category =
        category;
    }

    // =========================
    // Search
    // =========================

    if (
      typeof search === "string" &&
      search.trim()
    ) {
      const escapedSearch =
        search
          .trim()
          .replace(
            /[.*+?^${}()|[\]\\]/g,
            "\\$&"
          );

      const searchRegex =
        new RegExp(
          escapedSearch,
          "i"
        );

      const matchingCategories =
        await Category.find({
          name: searchRegex,
        }).select("_id");

      const categoryIds =
        matchingCategories.map(
          (item) => item._id
        );

      productQuery.$or = [
        {
          name: searchRegex,
        },
        {
          brand: searchRegex,
        },
        {
          sku: searchRegex,
        },
        {
          category: {
            $in: categoryIds,
          },
        },
      ];
    }

    // =========================
    // Gender
    // =========================

    if (gender) {
      if (
        !["Men", "Women", "Unisex"].includes(
          gender
        )
      ) {
        return res.status(400).json({
          message: "Invalid gender",
        });
      }

      productQuery.gender =
        gender;
    }

    // =========================
    // Metal
    // =========================

    if (
      typeof metal === "string" &&
      metal.trim()
    ) {
      productQuery.metal =
        new RegExp(
          metal.trim().replace(
            /[.*+?^${}()|[\]\\]/g,
            "\\$&"
          ),
          "i"
        );
    }

    // =========================
    // Pagination
    // =========================

    const pageNumber = Math.max(
      1,
      Number(page) || 1
    );

    const limitNumber = Math.min(
      100,
      Math.max(
        1,
        Number(limit) || 24
      )
    );

    const skip =
      (pageNumber - 1) *
      limitNumber;

    // =========================
    // Sort
    // =========================

    let sortOption = {
      allPosition: 1,
      createdAt: -1,
    };

    if (sort === "price_asc") {
      sortOption = {
        sellPrice: 1,
        createdAt: -1,
      };
    }

    if (sort === "price_desc") {
      sortOption = {
        sellPrice: -1,
        createdAt: -1,
      };
    }

    if (sort === "newest") {
      sortOption = {
        createdAt: -1,
      };
    }

    if (sort === "name_asc") {
      sortOption = {
        name: 1,
      };
    }

    // =========================
    // Query
    // =========================

    const [products, total] =
      await Promise.all([
        Product.find(productQuery)
          .populate(
            "category",
            "name image"
          )
          .sort(sortOption)
          .skip(skip)
          .limit(limitNumber)
          .lean(),

        Product.countDocuments(
          productQuery
        ),
      ]);

    return res.status(200).json({
      products,
      pagination: {
        page: pageNumber,
        limit: limitNumber,
        total,
        totalPages: Math.ceil(
          total / limitNumber
        ),
        hasNextPage:
          pageNumber <
          Math.ceil(
            total / limitNumber
          ),
        hasPreviousPage:
          pageNumber > 1,
      },
    });
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
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        message: "Invalid product ID",
      });
    }

    const product =
      await Product.findById(id)
        .populate(
          "category",
          "name image"
        )
        .lean();

    if (!product) {
      return res.status(404).json({
        message: "Product not found",
      });
    }

    return res.status(200).json(
      product
    );
  } catch (error) {
    console.error(
      "Get product error:",
      error
    );

    return res.status(500).json({
      message:
        "Failed to get product",
    });
  }
};


// =====================================================
// UPDATE PRODUCT
// =====================================================

const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;

    // =================================================
    // VALIDATE PRODUCT ID
    // =================================================

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        message: "Invalid product ID",
      });
    }

    // =================================================
    // FIND CURRENT PRODUCT
    // =================================================

    const currentProduct = await Product.findById(id);

    if (!currentProduct) {
      return res.status(404).json({
        message: "Product not found",
      });
    }

    // =================================================
    // BASIC REQUIRED FIELDS
    // =================================================

    const {
      category,
      name,
      stock,
      buyPrice,
      sellPrice,
      image,
      gender,
      mrp,
    } = req.body;

    // =================================================
    // CATEGORY VALIDATION
    // =================================================

    if (!category) {
      return res.status(400).json({
        message: "Category is required",
      });
    }

    if (!isValidObjectId(category)) {
      return res.status(400).json({
        message: "Invalid category",
      });
    }

    const categoryExists = await Category.exists({
      _id: category,
    });

    if (!categoryExists) {
      return res.status(404).json({
        message: "Category not found",
      });
    }

    // =================================================
    // PRODUCT VALIDATION
    // =================================================

    const validationError = validateProductValues({
      name,
      stock,
      buyPrice,
      sellPrice,
      image,
      gender,
      mrp,
    });

    if (validationError) {
      return res.status(400).json({
        message: validationError,
      });
    }

    // =================================================
    // BUILD PRODUCT DATA
    // =================================================

    const productData = buildProductData(req.body);

    // =================================================
    // TOTAL PRODUCTS
    // =================================================

    const totalProducts = await Product.countDocuments();

    // =================================================
    // ALL PRODUCT POSITION
    // =================================================

    if (productData.allPosition === null) {
      productData.allPosition =
        await getAvailablePosition({
          field: "allPosition",
          excludeId: id,
          maxPosition: totalProducts,
        });
    } else {
      if (productData.allPosition > totalProducts) {
        return res.status(400).json({
          message: `All position must be between 1 and ${totalProducts}`,
        });
      }

      const occupied = await Product.exists({
        allPosition: productData.allPosition,
        _id: {
          $ne: id,
        },
      });

      if (occupied) {
        return res.status(400).json({
          message: `All position ${productData.allPosition} is already occupied`,
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
          $ne: id,
        },
      });

    if (productData.categoryPosition === null) {
      productData.categoryPosition =
        await getAvailablePosition({
          field: "categoryPosition",
          categoryId: category,
          excludeId: id,
          maxPosition: targetCategoryCount + 1,
        });
    } else {
      if (
        productData.categoryPosition >
        targetCategoryCount + 1
      ) {
        return res.status(400).json({
          message: `Category position must be between 1 and ${
            targetCategoryCount + 1
          }`,
        });
      }

      const occupied = await Product.exists({
        category,
        categoryPosition:
          productData.categoryPosition,
        _id: {
          $ne: id,
        },
      });

      if (occupied) {
        return res.status(400).json({
          message: `Category position ${productData.categoryPosition} is already occupied in this category`,
        });
      }
    }

    // =================================================
    // SKU DUPLICATE CHECK
    // =================================================

    if (productData.sku) {
      const existingSku = await Product.exists({
        sku: productData.sku,
        _id: {
          $ne: id,
        },
      });

      if (existingSku) {
        return res.status(409).json({
          message: "SKU already exists",
        });
      }
    }

    // =================================================
    // UPDATE PRODUCT
    // =================================================

    const updatedProduct =
      await Product.findByIdAndUpdate(
        id,
        productData,
        {
          new: true,
          runValidators: true,
        }
      ).populate(
        "category",
        "name image"
      );

    // =================================================
    // SAFETY CHECK
    // =================================================

    if (!updatedProduct) {
      return res.status(404).json({
        message: "Product not found",
      });
    }

    // =================================================
    // SUCCESS RESPONSE
    // =================================================

    return res.status(200).json({
      message: "Product updated successfully",
      product: updatedProduct,
    });
  } catch (error) {
    console.error(
      "Update product error:",
      error
    );

    // =================================================
    // DUPLICATE KEY
    // =================================================

    if (error.code === 11000) {
      if (error.keyPattern?.sku) {
        return res.status(409).json({
          message: "SKU already exists",
        });
      }

      return res.status(409).json({
        message: "Duplicate product value",
      });
    }

    // =================================================
    // MONGOOSE VALIDATION
    // =================================================

    if (error.name === "ValidationError") {
      const messages = Object.values(
        error.errors
      ).map((item) => item.message);

      return res.status(400).json({
        message:
          messages[0] ||
          "Product validation failed",
      });
    }

    // =================================================
    // CAST ERROR
    // =================================================

    if (error.name === "CastError") {
      return res.status(400).json({
        message: `Invalid value for ${error.path}`,
      });
    }

    // =================================================
    // SERVER ERROR
    // =================================================

    return res.status(500).json({
      message: "Failed to update product",
    });
  }
};


// =====================================================
// DELETE PRODUCT
// =====================================================

const deleteProduct = async (
  req,
  res
) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        message: "Invalid product ID",
      });
    }

    const product =
      await Product.findById(id);

    if (!product) {
      return res.status(404).json({
        message: "Product not found",
      });
    }

    await Product.deleteOne({
      _id: id,
    });

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

const updateStock = async (
  req,
  res
) => {
  try {
    const { id } = req.params;
    const { action } = req.body;

    // =========================
    // Product ID
    // =========================

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        message: "Invalid product ID",
      });
    }

    // =========================
    // Action
    // =========================

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

    // =========================
    // Atomic Stock Update
    // =========================

    let updatedProduct;

    if (action === "increase") {
      updatedProduct =
        await Product.findOneAndUpdate(
          {
            _id: id,
          },
          {
            $inc: {
              stock: 1,
            },
          },
          {
            new: true,
            runValidators: true,
          }
        );
    }

    if (action === "decrease") {
      updatedProduct =
        await Product.findOneAndUpdate(
          {
            _id: id,
            stock: {
              $gt: 0,
            },
          },
          {
            $inc: {
              stock: -1,
            },
          },
          {
            new: true,
            runValidators: true,
          }
        );

      if (!updatedProduct) {
        const exists =
          await Product.exists({
            _id: id,
          });

        if (!exists) {
          return res.status(404).json({
            message:
              "Product not found",
          });
        }

        return res.status(400).json({
          message:
            "Stock cannot be less than 0",
        });
      }
    }

    if (!updatedProduct) {
      return res.status(404).json({
        message: "Product not found",
      });
    }

    await updatedProduct.populate(
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
