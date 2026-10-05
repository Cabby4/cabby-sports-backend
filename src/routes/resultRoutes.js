const express = require("express");

const {
  createResult,
  getAllResults,
  getResultById,
  updateResult,
  deleteResult,
} = require("../controllers/resultController");

const { protect } = require("../middlewares/authMiddleware");
const { adminOnly } = require("../middlewares/adminMiddleware");

const router = express.Router();

// Public
router.get("/", getAllResults);
router.get("/:id", getResultById);

// Admin
router.post("/", protect, adminOnly, createResult);
router.patch("/:id", protect, adminOnly, updateResult);
router.delete("/:id", protect, adminOnly, deleteResult);

module.exports = router;