// src/app/api/test-db/route.ts
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import TradingStrategy from "@/models/TradingStrategy";

export async function GET() {
  try {
    await connectDB();

    const count = await TradingStrategy.countDocuments();

    return NextResponse.json({
      success: true,
      message: "Database connected successfully!",
      strategiesCount: count,
    });
  } catch (error: unknown) {
    return NextResponse.json(
      { success: false, error: "Database connection error" },
      { status: 500 }
    );
  }
}
