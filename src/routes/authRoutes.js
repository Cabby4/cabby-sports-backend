const express = require("express");

const router = express.Router();

const {
  register,
  login,
  getMe,
} = require("../controllers/authController");

const { protect } = require("../middlewares/authMiddleware");
const { authLimiter } = require("../middlewares/rateLimitMiddleware");


router.post("/register", authLimiter, register);

router.post("/login", authLimiter, login);

router.get("/me", protect, getMe);

module.exports = router;