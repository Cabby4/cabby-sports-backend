const Result = require("../models/Result");


const createResult = async (req, res) => {
  try {
    const {
      homeTeam,
      awayTeam,
      competition,
      matchDate,
    } = req.body;

    // Prevent a team from playing against itself
    if (homeTeam === awayTeam) {
      return res.status(400).json({
        success: false,
        message: "A team cannot play against itself.",
      });
    }

    // Check for an existing result
    const existingResult = await Result.findOne({
      homeTeam,
      awayTeam,
      competition,
      matchDate: new Date(matchDate),
    });

    if (existingResult) {
      return res.status(409).json({
        success: false,
        message: "This match result already exists.",
      });
    }

    // Create the result
    const result = await Result.create(req.body);

    // Return the result with team details
    const populatedResult = await Result.findById(result._id)
      .populate("homeTeam", "name shortName logo")
      .populate("awayTeam", "name shortName logo");

    return res.status(201).json({
      success: true,
      message: "Result created successfully.",
      data: populatedResult,
    });
  } catch (error) {
    console.error("Create result error:", error);

    // Handle database-level duplicate protection
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "This match result already exists.",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to create result.",
    });
  }
};


// Get all results
const getAllResults = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      competition,
    } = req.query;

    const currentPage = Math.max(Number(page), 1);
    const itemsPerPage = Math.min(Math.max(Number(limit), 1), 50);

    const skip = (currentPage - 1) * itemsPerPage;

    const filter = {};

    if (competition) {
      filter.competition = competition;
    }

    const [results, total] = await Promise.all([
      Result.find(filter)
        .populate("homeTeam", "name shortName logo")
        .populate("awayTeam", "name shortName logo")
        .sort({ matchDate: -1 })
        .skip(skip)
        .limit(itemsPerPage),

      Result.countDocuments(filter),
    ]);

    const totalPages = Math.ceil(total / itemsPerPage);

    res.status(200).json({
      success: true,
      count: results.length,
      total,
      page: currentPage,
      limit: itemsPerPage,
      totalPages,
      data: results,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get single result
const getResultById = async (req, res) => {
  try {
    const result = await Result.findById(req.params.id)
      .populate("homeTeam", "name shortName logo")
      .populate("awayTeam", "name shortName logo");

    if (!result) {
      return res.status(404).json({
        success: false,
        message: "Result not found",
      });
    }

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Update result
const updateResult = async (req, res) => {
  try {
    const result = await Result.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    )
      .populate("homeTeam", "name shortName logo")
      .populate("awayTeam", "name shortName logo");

    if (!result) {
      return res.status(404).json({
        success: false,
        message: "Result not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Result updated successfully",
      data: result,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Delete result
const deleteResult = async (req, res) => {
  try {
    const result = await Result.findByIdAndDelete(req.params.id);

    if (!result) {
      return res.status(404).json({
        success: false,
        message: "Result not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Result deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  createResult,
  getAllResults,
  getResultById,
  updateResult,
  deleteResult,
};