const mongoose = require("mongoose");

const teamSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },

    shortName: {
      type: String,
      required: true,
      trim: true,
      maxlength: 10,
    },

    logo: {
      type: String,
      default: "",
    },

    country: {
      type: String,
      required: true,
      trim: true,
    },

    league: {
      type: String,
      required: true,
      trim: true,
    },

    stadium: {
      type: String,
      default: "",
      trim: true,
    },

    founded: {
      type: Number,
    },

    description: {
      type: String,
      default: "",
      trim: true,
    },

    website: {
      type: String,
      default: "",
      trim: true,
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

teamSchema.index({ name: "text", shortName: "text" });
teamSchema.index({ league: 1 });
teamSchema.index({ country: 1 });

module.exports = mongoose.model("Team", teamSchema);