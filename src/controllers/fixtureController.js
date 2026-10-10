const Fixture = require("../models/Fixture");


 // Create fixture
const createFixture = async (req, res) => {
  try {
    const {
      homeTeam,
      awayTeam,
      competition,
      matchDate,
    } = req.body;

    // 1. Prevent a team from playing against itself
    if (homeTeam === awayTeam) {
      return res.status(400).json({
        success: false,
        message: "A team cannot play against itself.",
      });
    }

    // 2. Check for an existing fixture
    const existingFixture = await Fixture.findOne({
      homeTeam,
      awayTeam,
      competition,
      matchDate: new Date(matchDate),
    });

    if (existingFixture) {
      return res.status(409).json({
        success: false,
        message: "This fixture already exists.",
      });
    }

    // 3. Create the fixture only after validation
    const fixture = await Fixture.create(req.body);

    // 4. Populate team details
    const populatedFixture = await Fixture.findById(fixture._id)
      .populate("homeTeam", "name shortName logo")
      .populate("awayTeam", "name shortName logo");

    // 5. Return success
    return res.status(201).json({
      success: true,
      message: "Fixture created successfully",
      data: populatedFixture,
    });
  } catch (error) {
    console.error("Create fixture error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to create fixture.",
    });
  }
};


// Get all fixtures
const getAllFixtures = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      competition,
      status,
    } = req.query;

    const currentPage = Math.max(Number(page), 1);
    const itemsPerPage = Math.min(Math.max(Number(limit), 1), 50);

    const skip = (currentPage - 1) * itemsPerPage;

    const filter = {};

    if (competition) {
      filter.competition = competition;
    }

    if (status) {
      filter.status = status;
    }

    const [fixtures, total] = await Promise.all([
      Fixture.find(filter)
        .populate("homeTeam", "name shortName logo")
        .populate("awayTeam", "name shortName logo")
        .sort({ matchDate: 1 })
        .skip(skip)
        .limit(itemsPerPage),

      Fixture.countDocuments(filter),
    ]);

    const totalPages = Math.ceil(total / itemsPerPage);

    res.status(200).json({
      success: true,
      count: fixtures.length,
      total,
      page: currentPage,
      limit: itemsPerPage,
      totalPages,
      data: fixtures,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get single fixture
const getFixtureById = async (req, res) => {
  try {
    const fixture = await Fixture.findById(req.params.id)
      .populate("homeTeam", "name shortName logo")
      .populate("awayTeam", "name shortName logo");

    if (!fixture) {
      return res.status(404).json({
        success: false,
        message: "Fixture not found",
      });
    }

    res.status(200).json({
      success: true,
      data: fixture,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Update fixture
const updateFixture = async (req, res) => {
  try {
    const fixture = await Fixture.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    )
      .populate("homeTeam", "name shortName logo")
      .populate("awayTeam", "name shortName logo");

    if (!fixture) {
      return res.status(404).json({
        success: false,
        message: "Fixture not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Fixture updated successfully",
      data: fixture,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Delete fixture
const deleteFixture = async (req, res) => {
  try {
    const fixture = await Fixture.findByIdAndDelete(req.params.id);

    if (!fixture) {
      return res.status(404).json({
        success: false,
        message: "Fixture not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Fixture deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  createFixture,
  getAllFixtures,
  getFixtureById,
  updateFixture,
  deleteFixture,
};