
const mongoose = require("mongoose");

const newsSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },

    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    summary: {
      type: String,
      required: true,
      trim: true,
      maxlength: 500,
    },

    content: {
      type: String,
      required: true,
    },

    image: {
      type: String,
      default: "",
    },

    category: {
      type: String,
      required: true,
      enum: [
        "Football",
        "Transfers",
        "Champions League",
        "Premier League",
        "La Liga",
        "Serie A",
        "International",
        "Other",
      ],
    },

    // New: overall football section
    section: {
      type: String,
      enum: ["football", "africa", "grassroots"],
    },

    // New: African competition
    competition: {
      type: String,
      enum: [
        "caf-champions-league",
        "caf-confederation-cup",
        "domestic-league",
        "other",
      ],
    },

    // New: country associated with the article
    country: {
      type: String,
      trim: true,
      lowercase: true,
    },

    // New: type of grassroots content
    grassrootsType: {
      type: String,
      enum: [
        "news",
        "academy",
        "tournament",
        "player-profile",
      ],
    },

    author: {
      type: String,
      default: "Cabby Sports",
      trim: true,
    },

    tags: [
      {
        type: String,
        trim: true,
        lowercase: true,
      },
    ],

    featured: {
      type: Boolean,
      default: false,
    },

    published: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

newsSchema.index({
  title: "text",
  summary: "text",
  content: "text",
});

newsSchema.index({ category: 1 });
newsSchema.index({ featured: 1 });
newsSchema.index({ createdAt: -1 });

// New indexes for section filtering
newsSchema.index({ section: 1 });
newsSchema.index({ competition: 1 });
newsSchema.index({ country: 1 });
newsSchema.index({ grassrootsType: 1 });

module.exports = mongoose.model("News", newsSchema);
