const express = require("express");

const {
  createTeam,
  getAllTeams,
  getTeamById,
  updateTeam,
  deleteTeam,
} = require("../controllers/teamController");

const { protect } = require("../middlewares/authMiddleware");
const { adminOnly } = require("../middlewares/adminMiddleware");

const router = express.Router();

// Public
router.get("/", getAllTeams);
router.get("/:id", getTeamById);

// Admin
router.post("/", protect, adminOnly, createTeam);
router.patch("/:id", protect, adminOnly, updateTeam);
router.delete("/:id", protect, adminOnly, deleteTeam);

module.exports = router;