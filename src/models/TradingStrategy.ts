// src/models/TradingStrategy.ts
import mongoose from 'mongoose';

const strategySchema = new mongoose.Schema({
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
    enum: ['Low', 'Medium', 'High', 'Very High'],
    default: 'Medium',
  },
  assetClass: {
    type: String,
    enum: ['Stocks', 'Crypto', 'Forex', 'Futures', 'Options'],
    default: 'Stocks',
  },
  backtestPerformance: {
    type: String, // e.g., "Win Rate: 68%, Sharpe: 1.8"
    default: '',
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  isPublic: {
    type: Boolean,
    default: false,
  },
  tags: [{
    type: String,
    trim: true,
  }],
}, {
  timestamps: true,
});

export default mongoose.models.TradingStrategy || mongoose.model('TradingStrategy', strategySchema);