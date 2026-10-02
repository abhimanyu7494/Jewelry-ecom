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

router.post("/", protect, createProduct);

router.get("/", getProducts);

router.get("/:id", getProduct);

router.put("/:id", protect, updateProduct);

router.delete("/:id", protect, deleteProduct);

router.patch("/:id/stock", protect, updateStock);

module.exports = router;
