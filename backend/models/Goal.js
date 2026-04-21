const mongoose = require("mongoose");

const goalSchema = new mongoose.Schema(
  {
    goalName: {
      type: String,
      required: true,
      trim: true
    },
    targetAmount: {
      type: Number,
      required: true,
      min: 0
    },
    savedAmount: {
      type: Number,
      required: true,
      default: 0,
      min: 0
    },
    deadline: {
      type: Date,
      required: true
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    }
  },
  {
    timestamps: true
  }
);

goalSchema.index({ userId: 1, deadline: 1 });

module.exports = mongoose.model("Goal", goalSchema);

