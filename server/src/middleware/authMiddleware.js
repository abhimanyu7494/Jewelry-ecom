const jwt = require("jsonwebtoken");
const Admin = require("../models/Admin");

const protect = async (req, res, next) => {
  try {
    // ==========================================
    // CHECK AUTHORIZATION HEADER
    // ==========================================

    const authHeader = req.headers.authorization;

    if (
      !authHeader ||
      !authHeader.startsWith("Bearer ")
    ) {
      return res.status(401).json({
        message: "Not authorized",
      });
    }

    // ==========================================
    // GET TOKEN
    // ==========================================

    const token = authHeader.split(" ")[1];

    if (!token) {
      return res.status(401).json({
        message: "Not authorized",
      });
    }

    // ==========================================
    // CHECK JWT SECRET
    // ==========================================

    if (!process.env.JWT_SECRET) {
      console.error("JWT_SECRET is missing");

      return res.status(500).json({
        message: "Server configuration error",
      });
    }

    // ==========================================
    // VERIFY JWT
    // ==========================================

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    // ==========================================
    // CHECK ADMIN ID
    // ==========================================

    if (!decoded.id) {
      return res.status(401).json({
        message: "Not authorized",
      });
    }

    // ==========================================
    // CHECK ADMIN STILL EXISTS
    // ==========================================

    const admin = await Admin.findById(decoded.id)
      .select("_id username email");

    if (!admin) {
      return res.status(401).json({
        message: "Not authorized",
      });
    }

    // ==========================================
    // ATTACH ADMIN TO REQUEST
    // ==========================================

    req.admin = admin;

    next();
  } catch (error) {
    // Invalid / expired / malformed JWT
    return res.status(401).json({
      message: "Not authorized",
    });
  }
};

module.exports = protect;
