const Transfer = require("../models/Transfer");

// Create transfer
const createTransfer = async (req, res) => {
  try {
    const transfer = await Transfer.create(req.body);

    const populatedTransfer = await Transfer.findById(transfer._id)
      .populate("fromClub", "name shortName logo")
      .populate("toClub", "name shortName logo");

    res.status(201).json({
      success: true,
      message: "Transfer created successfully",
      data: populatedTransfer,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
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

    if (!transfer) {
      return res.status(404).json({
        success: false,
        message: "Transfer not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Transfer updated successfully",
      data: transfer,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
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