
const Team = require("../models/Team");

// @desc    Get all teams
// @route   GET /api/teams
// @access  Public
const getAllTeams = async (req, res) => {
  try {
    const {
      search,
      league,
      country,
      page = 1,
      limit = 10,
    } = req.query;

    const filter = {};

    // Search by team name or short name
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { shortName: { $regex: search, $options: "i" } },
      ];
    }

    // Filter by league
    if (league) {
      filter.league = { $regex: league, $options: "i" };
    }

    // Filter by country
    if (country) {
      filter.country = { $regex: country, $options: "i" };
    }

    const pageNumber = Math.max(Number(page), 1);
    const limitNumber = Math.min(Math.max(Number(limit), 1), 100);
    const skip = (pageNumber - 1) * limitNumber;

    const [teams, total] = await Promise.all([
      Team.find(filter)
        .sort({ name: 1 })
        .skip(skip)
        .limit(limitNumber),

      Team.countDocuments(filter),
    ]);

    res.status(200).json({
      success: true,
      count: teams.length,
      total,
      page: pageNumber,
      limit: limitNumber,
      totalPages: Math.ceil(total / limitNumber),
      data: teams,
    });
  } catch (error) {
    console.error("Get teams error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch teams",
      error: error.message,
    });
  }
};


// @desc    Get single team
// @route   GET /api/teams/:id
// @access  Public
const getTeamById = async (req, res) => {
  try {
    const team = await Team.findById(req.params.id);

    if (!team) {
      return res.status(404).json({
        success: false,
        message: "Team not found",
      });
    }

    res.status(200).json({
      success: true,
      data: team,
    });
  } catch (error) {
    console.error("Get team error:", error);

    if (error.name === "CastError") {
      return res.status(400).json({
        success: false,
        message: "Invalid team ID",
      });
    }

    res.status(500).json({
      success: false,
      message: "Failed to fetch team",
      error: error.message,
    });
  }
};


// @desc    Create team
// @route   POST /api/teams
// @access  Admin
const createTeam = async (req, res) => {
  try {
    const {
      name,
      shortName,
      logo,
      country,
      league,
      stadium,
      founded,
      description,
      website,
      isActive,
    } = req.body;

    // Check if team already exists
    const existingTeam = await Team.findOne({
      name: { $regex: `^${name}$`, $options: "i" },
    });

    if (existingTeam) {
      return res.status(409).json({
        success: false,
        message: "A team with this name already exists",
      });
    }

    const team = await Team.create({
      name,
      shortName,
      logo,
      country,
      league,
      stadium,
      founded,
      description,
      website,
      isActive,
    });

    res.status(201).json({
      success: true,
      message: "Team created successfully",
      data: team,
    });
  } catch (error) {
    console.error("Create team error:", error);

    // Handle MongoDB duplicate key error
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "A team with this name already exists",
      });
    }

    res.status(500).json({
      success: false,
      message: "Failed to create team",
      error: error.message,
    });
  }
};


// @desc    Update team
// @route   PATCH /api/teams/:id
// @access  Admin
const updateTeam = async (req, res) => {
  try {
    const team = await Team.findById(req.params.id);

    if (!team) {
      return res.status(404).json({
        success: false,
        message: "Team not found",
      });
    }

    // If name is being changed, check for duplicate
    if (req.body.name && req.body.name !== team.name) {
      const existingTeam = await Team.findOne({
        name: { $regex: `^${req.body.name}$`, $options: "i" },
        _id: { $ne: req.params.id },
      });

      if (existingTeam) {
        return res.status(409).json({
          success: false,
          message: "A team with this name already exists",
        });
      }
    }

    const allowedFields = [
      "name",
      "shortName",
      "logo",
      "country",
      "league",
      "stadium",
      "founded",
      "description",
      "website",
      "isActive",
    ];

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        team[field] = req.body[field];
      }
    });

    const updatedTeam = await team.save();

    res.status(200).json({
      success: true,
      message: "Team updated successfully",
      data: updatedTeam,
    });
  } catch (error) {
    console.error("Update team error:", error);

    if (error.name === "CastError") {
      return res.status(400).json({
        success: false,
        message: "Invalid team ID",
      });
    }

    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "A team with this name already exists",
      });
    }

    res.status(500).json({
      success: false,
      message: "Failed to update team",
      error: error.message,
    });
  }
};


// @desc    Delete team
// @route   DELETE /api/teams/:id
// @access  Admin
const deleteTeam = async (req, res) => {
  try {
    const team = await Team.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );

    if (!team) {
      return res.status(404).json({
        success: false,
        message: "Team not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Team deactivated successfully",
      data: team,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  getAllTeams,
  getTeamById,
  createTeam,
  updateTeam,
  deleteTeam,
};
