/**
 * TradingStrategy Mongoose Model
 * Defines the schema and model for trading strategies
 * @module models/TradingStrategy
 */

import mongoose from "mongoose";

/**
 * Trading Strategy Schema
 *
 * Fields:
 * - name: Strategy name (required, max 100 chars)
 * - description: Detailed description (required, max 2000 chars)
 * - parameters: Trading parameters (entry, exit, timeframe, etc.)
 * - riskLevel: Risk assessment (Low, Medium, High, Very High)
 * - assetClass: Asset type (Stocks, Crypto, Forex, Futures, Options)
 * - backtestPerformance: Performance metrics string
 * - createdBy: Reference to User who created the strategy
 * - isPublic: Whether strategy is visible to all users
 * - isTemplate: Whether strategy is a template
 * - tags: Array of tags for categorization
 * - comments: Array of user comments
 * - ratings: Array of user ratings (1-5 stars)
 * - averageRating: Calculated average rating
 * - copiedFrom: Reference to original strategy if this is a copy
 * - copyCount: Number of times this strategy has been copied
 */
const strategySchema = new mongoose.Schema(
  {
    /** Strategy name - required, trimmed, max 100 characters */
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    description: {
      type: String,
      required: true,
      maxlength: 2000,
    },
    parameters: {
      type: mongoose.Schema.Types.Mixed, // Stores JSON/object like { entry: "RSI<30", exit: "RSI>70", timeframe: "1h" }
      required: true,
    },
    riskLevel: {
      type: String,
      enum: ["Low", "Medium", "High", "Very High"],
      default: "Medium",
    },
    assetClass: {
      type: String,
      enum: ["Stocks", "Crypto", "Forex", "Futures", "Options"],
      default: "Stocks",
    },
    backtestPerformance: {
      type: String, // e.g., "Win Rate: 68%, Sharpe: 1.8"
      default: "",
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    isPublic: {
      type: Boolean,
      default: false,
    },
    tags: [
      {
        type: String,
        trim: true,
      },
    ],
    isTemplate: {
      type: Boolean,
      default: false,
    },
    copiedFrom: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "TradingStrategy",
      default: null,
    },
    copyCount: {
      type: Number,
      default: 0,
    },
    comments: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
        text: {
          type: String,
          required: true,
          maxlength: 500,
        },
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    ratings: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
        rating: {
          type: Number,
          required: true,
          min: 1,
          max: 5,
        },
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    averageRating: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

/**
 * Pre-save hook to calculate average rating
 * Automatically calculates and updates averageRating when strategy is saved
 * This ensures the average is always up-to-date
 */
strategySchema.pre("save", function () {
  if (this.ratings && this.ratings.length > 0) {
    const sum = this.ratings.reduce((acc, r) => acc + r.rating, 0);
    this.averageRating = sum / this.ratings.length;
  }
});

export default mongoose.models.TradingStrategy ||
  mongoose.model("TradingStrategy", strategySchema);
