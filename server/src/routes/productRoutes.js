const express = require("express");
const protect = require("../middleware/authMiddleware");

const {
  createProduct,
  getProducts,
  getProduct,
  updateProduct,
  deleteProduct,
  updateStock,
} = require("../controllers/productController");

const router = express.Router();

// =====================================================
// PUBLIC
// =====================================================

router.get("/", getProducts);

router.get("/:id", getProduct);

// =====================================================
// ADMIN / PROTECTED
// =====================================================

router.post("/", protect, createProduct);

router.put("/:id", protect, updateProduct);

router.delete("/:id", protect, deleteProduct);

router.patch(
  "/:id/stock",
  protect,
  updateStock
);

module.exports = router;
