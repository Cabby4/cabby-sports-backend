// const express = require("express");

// const {
//   createFixture,
//   getAllFixtures,
//   getFixtureById,
//   updateFixture,
//   deleteFixture,
// } = require("../controllers/fixtureController");

// const { protect } = require("../middlewares/authMiddleware");
// const { adminOnly } = require("../middlewares/adminMiddleware");

// const router = express.Router();

// // Public

// router.get("/", getAllFixtures);
// router.get("/:id", getFixtureById);

// // Admin

// router.post("/", protect, adminOnly, createFixture);
// router.patch("/:id", protect, adminOnly, updateFixture);
// router.delete("/:id", protect, adminOnly, deleteFixture);

// module.exports = router;


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
const { syncFixtures } = require("../services/footballSyncService");

const router = express.Router();

// Public
router.get("/", getAllFixtures);

// Admin: synchronize fixtures from API-Football
// Keep this route before "/:id".
router.post("/sync", protect, adminOnly, async (req, res) => {
  try {
    const { leagueId, season } = req.body;

    const parsedLeagueId = Number(leagueId);
    const parsedSeason = Number(season);

    if (
      !Number.isInteger(parsedLeagueId) ||
      parsedLeagueId <= 0 ||
      !Number.isInteger(parsedSeason) ||
      parsedSeason < 2000 ||
      parsedSeason > 2100
    ) {
      return res.status(400).json({
        success: false,
        message: "Provide a valid leagueId and season.",
      });
    }

    const result = await syncFixtures({
      leagueId: parsedLeagueId,
      season: parsedSeason,
    });

    return res.status(200).json({
      success: true,
      message: "Fixture synchronization completed.",
      data: result,
    });
  } catch (error) {
    console.error("Fixture synchronization failed:", error.message);

    return res.status(502).json({
      success: false,
      message: "Fixture synchronization failed. Check the server logs.",
    });
  }
});

router.get("/:id", getFixtureById);

// Admin: existing fixture management
router.post("/", protect, adminOnly, createFixture);
router.patch("/:id", protect, adminOnly, updateFixture);
router.delete("/:id", protect, adminOnly, deleteFixture);

module.exports = router;
