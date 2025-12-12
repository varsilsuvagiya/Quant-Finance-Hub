// src/lib/db.ts
import mongoose from "mongoose";

let isConnected = false; // Track connection status

export const connectDB = async () => {
  if (isConnected) {
    console.log("➜ Using existing MongoDB connection");
    return;
  }

  try {
    if (!process.env.MONGODB_URI) {
      throw new Error("Please define MONGODB_URI in .env.local");
    }

    const db = await mongoose.connect(process.env.MONGODB_URI, {
      dbName: "quant-finance-hub",
      bufferCommands: false,
    });

    isConnected = db.connections[0].readyState === 1;
    console.log("➜ MongoDB connected successfully");
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("MongoDB connection error:", errorMessage);
    throw new Error("Failed to connect to MongoDB");
  }
};
