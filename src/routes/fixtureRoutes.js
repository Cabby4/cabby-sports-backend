const express = require("express");

const {
  createFixture,
  getAllFixtures,
  getFixtureById,
  updateFixture,
  deleteFixture,
} = require("../controllers/fixtureController");

const { protect } = require("../middlewares/authMiddleware");
const { adminOnly } = require("../middlewares/adminMiddleware");

const router = express.Router();

// Public
router.get("/", getAllFixtures);
router.get("/:id", getFixtureById);

// Admin
router.post("/", protect, adminOnly, createFixture);
router.patch("/:id", protect, adminOnly, updateFixture);
router.delete("/:id", protect, adminOnly, deleteFixture);

module.exports = router;