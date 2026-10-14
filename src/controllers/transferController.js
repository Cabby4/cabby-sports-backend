const Transfer = require("../models/Transfer");


const createTransfer = async (req, res) => {
  try {
    const {
      playerName,
      fromClub,
      toClub,
      transferType,
      transferDate,
    } = req.body;

    // Validate required transfer details
    if (
      !playerName ||
      !fromClub ||
      !toClub ||
      !transferType ||
      !transferDate
    ) {
      return res.status(400).json({
        success: false,
        message: "Please provide all required transfer details.",
      });
    }

    // A player cannot transfer to the same club
    if (fromClub === toClub) {
      return res.status(400).json({
        success: false,
        message: "The originating club and destination club must be different.",
      });
    }

    // Validate transfer date
    const parsedDate = new Date(transferDate);

    if (Number.isNaN(parsedDate.getTime())) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid transfer date.",
      });
    }

    // Check for a duplicate transfer
    const existingTransfer = await Transfer.findOne({
      playerName: {
        $regex: `^${playerName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`,
        $options: "i",
      },
      fromClub,
      toClub,
      transferType,
      transferDate: parsedDate,
    });

    if (existingTransfer) {
      return res.status(409).json({
        success: false,
        message: "This transfer record already exists.",
      });
    }

    const transfer = await Transfer.create({
      ...req.body,
      transferDate: parsedDate,
    });

    const populatedTransfer = await Transfer.findById(transfer._id)
      .populate("fromClub", "name shortName logo")
      .populate("toClub", "name shortName logo");

    return res.status(201).json({
      success: true,
      message: "Transfer created successfully.",
      data: populatedTransfer,
    });
  } catch (error) {
    console.error("Create transfer error:", error);

    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "This transfer record already exists.",
      });
    }

    if (error.name === "ValidationError" || error.name === "CastError") {
      return res.status(400).json({
        success: false,
        message: "Invalid transfer details provided.",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to create transfer.",
    });
  }
};


// Get all transfers
const getAllTransfers = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search,
      status,
      transferType,
    } = req.query;

    const currentPage = Math.max(Number(page), 1);
    const itemsPerPage = Math.min(Math.max(Number(limit), 1), 50);

    const skip = (currentPage - 1) * itemsPerPage;

    const filter = {};

    if (search) {
      filter.playerName = {
        $regex: search,
        $options: "i",
      };
    }

    if (status) {
      filter.status = status;
    }

    if (transferType) {
      filter.transferType = transferType;
    }

    const [transfers, total] = await Promise.all([
      Transfer.find(filter)
        .populate("fromClub", "name shortName logo")
        .populate("toClub", "name shortName logo")
        .sort({ transferDate: -1 })
        .skip(skip)
        .limit(itemsPerPage),

      Transfer.countDocuments(filter),
    ]);

    const totalPages = Math.ceil(total / itemsPerPage);

    res.status(200).json({
      success: true,
      count: transfers.length,
      total,
      page: currentPage,
      limit: itemsPerPage,
      totalPages,
      data: transfers,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get single transfer
const getTransferById = async (req, res) => {
  try {
    const transfer = await Transfer.findById(req.params.id)
      .populate("fromClub", "name shortName logo")
      .populate("toClub", "name shortName logo");

    if (!transfer) {
      return res.status(404).json({
        success: false,
        message: "Transfer not found",
      });
    }

    res.status(200).json({
      success: true,
      data: transfer,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Update transfer
const updateTransfer = async (req, res) => {
  try {
    const currentTransfer = await Transfer.findById(req.params.id);

    if (!currentTransfer) {
      return res.status(404).json({
        success: false,
        message: "Transfer not found",
      });
    }

    const updatedData = {
      ...currentTransfer.toObject(),
      ...req.body,
    };

    const {
      playerName,
      fromClub,
      toClub,
      transferType,
      transferDate,
    } = updatedData;

    if (fromClub && toClub && String(fromClub) === String(toClub)) {
      return res.status(400).json({
        success: false,
        message: "The originating club and destination club must be different.",
      });
    }

    if (transferDate && Number.isNaN(new Date(transferDate).getTime())) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid transfer date.",
      });
    }

    const duplicate = await Transfer.findOne({
      _id: { $ne: currentTransfer._id },
      playerName: {
        $regex: `^${String(playerName).replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`,
        $options: "i",
      },
      fromClub,
      toClub,
      transferType,
      transferDate: new Date(transferDate),
    });

    if (duplicate) {
      return res.status(409).json({
        success: false,
        message: "This transfer record already exists.",
      });
    }

    const transfer = await Transfer.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    )
      .populate("fromClub", "name shortName logo")
      .populate("toClub", "name shortName logo");

    return res.status(200).json({
      success: true,
      message: "Transfer updated successfully",
      data: transfer,
    });
  } catch (error) {
    console.error("Update transfer error:", error);

    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "This transfer record already exists.",
      });
    }

    if (error.name === "ValidationError" || error.name === "CastError") {
      return res.status(400).json({
        success: false,
        message: "Invalid transfer details provided.",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to update transfer.",
    });
  }
};


// Delete transfer
const deleteTransfer = async (req, res) => {
  try {
    const transfer = await Transfer.findByIdAndDelete(req.params.id);

    if (!transfer) {
      return res.status(404).json({
        success: false,
        message: "Transfer not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Transfer deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  createTransfer,
  getAllTransfers,
  getTransferById,
  updateTransfer,
  deleteTransfer,
};