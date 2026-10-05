const Fixture = require("../models/Fixture");

// Create fixture
const createFixture = async (req, res) => {
  try {
    const fixture = await Fixture.create(req.body);

    const populatedFixture = await Fixture.findById(fixture._id)
      .populate("homeTeam", "name shortName logo")
      .populate("awayTeam", "name shortName logo");

    res.status(201).json({
      success: true,
      message: "Fixture created successfully",
      data: populatedFixture,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
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