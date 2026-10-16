
const express = require("express");

const router = express.Router();

const {
  register,
  login,
  getMe,
  forgotPassword,
  resetPassword,
} = require("../controllers/authController");

const { protect } = require("../middlewares/authMiddleware");
const { authLimiter } = require("../middlewares/rateLimitMiddleware");

// Login and registration routes
router.post("/register", authLimiter, register);

router.post("/login", authLimiter, login);

router.get("/me", protect, getMe);

// Password reset routes
router.post("/forgot-password", authLimiter, forgotPassword);

router.post("/reset-password/:token", authLimiter, resetPassword);

module.exports = router;
