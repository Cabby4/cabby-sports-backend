const mongoose = require("mongoose");

const transferSchema = new mongoose.Schema(
  {
    playerName: {
      type: String,
      required: true,
      trim: true,
    },

    playerImage: {
      type: String,
      default: "",
    },

    position: {
      type: String,
      default: "",
      trim: true,
    },

    fromClub: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Team",
      required: true,
    },

    toClub: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Team",
      required: true,
    },

    transferType: {
      type: String,
      enum: [
        "Permanent",
        "Loan",
        "Free Transfer",
        "Loan Return",
      ],
      default: "Permanent",
    },

    transferFee: {
      type: String,
      default: "Undisclosed",
      trim: true,
    },

    transferDate: {
      type: Date,
      required: true,
    },

    status: {
      type: String,
      enum: [
        "Rumour",
        "Negotiating",
        "Medical",
        "Completed",
        "Cancelled",
      ],
      default: "Rumour",
    },

    contractLength: {
      type: String,
      default: "",
      trim: true,
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

transferSchema.index({ playerName: "text" });
transferSchema.index({ transferDate: -1 });
transferSchema.index({ status: 1 });
transferSchema.index({ fromClub: 1 });
transferSchema.index({ toClub: 1 });

module.exports = mongoose.model("Transfer", transferSchema);