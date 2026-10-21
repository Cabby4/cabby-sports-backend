
const News = require("../models/News");

      const cleanNewsPayload = (payload) => {
        const cleaned = { ...payload };

        ["competition", "country", "grassrootsType"].forEach((field) => {
          if (cleaned[field] === "") {
            delete cleaned[field];
          }
        });

        return cleaned;
      };

// Create news
const createNews = async (req, res) => {
  try {
    const news = await News.create(cleanNewsPayload(req.body));

    res.status(201).json({
      success: true,
      message: "News created successfully",
      data: news,
    });
  } catch (error) {
    res.status(400).json({
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
      section,
      competition,
      country,
      grassrootsType,
    } = req.query;

    const currentPage = Math.max(Number(page) || 1, 1);
    const itemsPerPage = Math.min(
      Math.max(Number(limit) || 10, 1),
      50
    );

    const skip = (currentPage - 1) * itemsPerPage;
    const filter = {};

    // Search by title, summary or content
    if (search) {
      const searchRegex = {
        $regex: search,
        $options: "i",
      };

      filter.$or = [
        { title: searchRegex },
        { summary: searchRegex },
        { content: searchRegex },
      ];
    }

    // Existing filters
    if (category) filter.category = category;

    if (featured !== undefined) {
      filter.featured = featured === "true";
    }

    // Africa Football and Grassroots filters
    if (section) filter.section = section;
    if (competition) filter.competition = competition;

    if (country) {
      filter.country = country.toLowerCase();
    }

    if (grassrootsType) {
      filter.grassrootsType = grassrootsType;
    }

    const [news, total] = await Promise.all([
      News.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(itemsPerPage),

      News.countDocuments(filter),
    ]);

    res.status(200).json({
      success: true,
      count: news.length,
      total,
      page: currentPage,
      limit: itemsPerPage,
      totalPages: Math.ceil(total / itemsPerPage),
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
  cleanNewsPayload(req.body),
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
    res.status(400).json({
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
