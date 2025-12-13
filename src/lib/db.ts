/**
 * MongoDB database connection utility
 * @module lib/db
 */

import mongoose from "mongoose";

/** Tracks MongoDB connection status to prevent multiple connections */
let isConnected = false;

/**
 * Connect to MongoDB database
 * Uses connection pooling and reuses existing connections
 * @returns {Promise<void>}
 * @throws {Error} If MONGODB_URI is not defined or connection fails
 * @example
 * await connectDB();
 * // Now you can use mongoose models
 */
export const connectDB = async () => {
  // Reuse existing connection if available
  if (isConnected) {
    console.log("➜ Using existing MongoDB connection");
    return;
  }

  try {
    if (!process.env.MONGODB_URI) {
      throw new Error("Please define MONGODB_URI in .env.local");
    }

    // Connect to MongoDB with optimized settings
    const db = await mongoose.connect(process.env.MONGODB_URI, {
      dbName: "quant-finance-hub",
      bufferCommands: false, // Disable mongoose buffering
    });

    // Verify connection is established
    isConnected = db.connections[0].readyState === 1;
    console.log("➜ MongoDB connected successfully");
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("MongoDB connection error:", errorMessage);
    throw new Error("Failed to connect to MongoDB");
  }
};
