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

newsSchema.index({ title: "text", summary: "text", content: "text" });
newsSchema.index({ category: 1 });
newsSchema.index({ featured: 1 });
newsSchema.index({ createdAt: -1 });

module.exports = mongoose.model("News", newsSchema);