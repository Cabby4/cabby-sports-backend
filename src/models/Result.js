const mongoose = require("mongoose");

const resultSchema = new mongoose.Schema(
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

    homeScore: {
      type: Number,
      required: true,
      min: 0,
    },

    awayScore: {
      type: Number,
      required: true,
      min: 0,
    },

    venue: {
      type: String,
      default: "",
      trim: true,
    },

    status: {
      type: String,
      enum: ["Completed", "Abandoned"],
      default: "Completed",
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

resultSchema.index({ matchDate: -1 });
resultSchema.index({ competition: 1 });
resultSchema.index({ homeTeam: 1 });
resultSchema.index({ awayTeam: 1 });

module.exports = mongoose.model("Result", resultSchema);