
const mongoose = require("mongoose");

const fixtureSchema = new mongoose.Schema(
  {
    homeTeam: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Team",
      required: true,
    },

    awayTeam: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Team",
      required: true,
    },

    competition: {
      type: String,
      required: true,
      trim: true,
    },

    matchDate: {
      type: Date,
      required: true,
    },

    venue: {
      type: String,
      default: "",
      trim: true,
    },

    status: {
      type: String,
      enum: ["Scheduled", "Postponed", "Cancelled"],
      default: "Scheduled",
    },

    matchweek: {
      type: Number,
    },

    description: {
      type: String,
      default: "",
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

fixtureSchema.index({ matchDate: 1 });
fixtureSchema.index({ competition: 1 });
fixtureSchema.index({ homeTeam: 1 });
fixtureSchema.index({ awayTeam: 1 });

module.exports = mongoose.model("Fixture", fixtureSchema);