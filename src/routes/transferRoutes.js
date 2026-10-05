const express = require("express");

const {
  createTransfer,
  getAllTransfers,
  getTransferById,
  updateTransfer,
  deleteTransfer,
} = require("../controllers/transferController");

const { protect } = require("../middlewares/authMiddleware");
const { adminOnly } = require("../middlewares/adminMiddleware");

const router = express.Router();

// Public
router.get("/", getAllTransfers);
router.get("/:id", getTransferById);

// Admin
router.post("/", protect, adminOnly, createTransfer);
router.patch("/:id", protect, adminOnly, updateTransfer);
router.delete("/:id", protect, adminOnly, deleteTransfer);

module.exports = router;