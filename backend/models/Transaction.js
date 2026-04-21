const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    accountId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Account",
      required: true
    },
    type: {
      type: String,
      enum: ["income", "expense"],
      required: true
    },
    amount: {
      type: Number,
      required: true,
      min: 0
    },
    category: {
      type: String,
      required: true,
      trim: true
    },
    description: {
      type: String,
      trim: true,
      default: ""
    },
    transactionDate: {
      type: Date,
      default: Date.now
    },
    fingerprint: {
      type: String,
      trim: true
    },
    source: {
      type: String,
      default: "manual"
    }
  },
  {
    timestamps: true
  }
);

transactionSchema.index({ user: 1, accountId: 1, transactionDate: -1, createdAt: -1 });
transactionSchema.index({ user: 1, fingerprint: 1 });

module.exports = mongoose.model("Transaction", transactionSchema);
