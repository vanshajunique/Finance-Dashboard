const mongoose = require("mongoose");

const accountSchema = new mongoose.Schema(
  {
    accountName: {
      type: String,
      required: true,
      trim: true
    },
    accountType: {
      type: String,
      enum: ["Savings Account", "Salary Account", "Digital Wallet", "Cash"],
      required: true
    },
    provider: {
      type: String,
      required: true,
      trim: true
    },
    balance: {
      type: Number,
      required: true,
      default: 0
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

accountSchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model("Account", accountSchema);

