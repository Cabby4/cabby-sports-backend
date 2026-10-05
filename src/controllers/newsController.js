const News = require("../models/News");

// Create news
const createNews = async (req, res) => {
  try {
    const news = await News.create(req.body);

    res.status(201).json({
      success: true,
      message: "News created successfully",
      data: news,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get all news
const getAllNews = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search,
      category,
      featured,
    } = req.query;

    const currentPage = Math.max(Number(page), 1);
    const itemsPerPage = Math.min(Math.max(Number(limit), 1), 50);

    const skip = (currentPage - 1) * itemsPerPage;

    const filter = {};

    // Search by title, summary or content
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: "i" } },
        { summary: { $regex: search, $options: "i" } },
        { content: { $regex: search, $options: "i" } },
      ];
    }

    // Filter by category
    if (category) {
      filter.category = category;
    }

    // Filter featured articles
    if (featured !== undefined) {
      filter.featured = featured === "true";
    }

    const [news, total] = await Promise.all([
      News.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(itemsPerPage),

      News.countDocuments(filter),
    ]);

    const totalPages = Math.ceil(total / itemsPerPage);

    res.status(200).json({
      success: true,
      count: news.length,
      total,
      page: currentPage,
      limit: itemsPerPage,
      totalPages,
      data: news,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get single news
const getNewsById = async (req, res) => {
  try {
    const news = await News.findById(req.params.id);

    if (!news) {
      return res.status(404).json({
        success: false,
        message: "News article not found",
      });
    }

    res.status(200).json({
      success: true,
      data: news,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Update news
const updateNews = async (req, res) => {
  try {
    const news = await News.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!news) {
      return res.status(404).json({
        success: false,
        message: "News article not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "News updated successfully",
      data: news,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Delete news
const deleteNews = async (req, res) => {
  try {
    const news = await News.findByIdAndDelete(req.params.id);

    if (!news) {
      return res.status(404).json({
        success: false,
        message: "News article not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "News deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  createNews,
  getAllNews,
  getNewsById,
  updateNews,
  deleteNews,
};