// src/app/api/strategies/favorite/route.ts
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import TradingStrategy from "@/models/TradingStrategy";
import { getCurrentUser } from "@/lib/auth";
import { z } from "zod";
import mongoose from "mongoose";

// Force dynamic rendering to prevent build-time evaluation
export const dynamic = "force-dynamic";

const favoriteSchema = z.object({
  strategyId: z.string().min(1),
});

// GET - Check if strategy is favorited
export async function GET(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const { searchParams } = new URL(request.url);
    const strategyId = searchParams.get("strategyId");

    if (!strategyId) {
      return NextResponse.json(
        { error: "Strategy ID is required" },
        { status: 400 }
      );
    }

    const dbUser = await User.findById(user.id);
    if (!dbUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const favorited = dbUser.favoriteStrategies?.some(
      (id: { toString: () => string }) => id.toString() === strategyId
    );

    return NextResponse.json({ success: true, favorited: !!favorited });
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : "Failed to check favorite";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

// POST - Toggle favorite
export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const body = await request.json();
    const { strategyId } = favoriteSchema.parse(body);

    const strategy = await TradingStrategy.findById(strategyId);
    if (!strategy) {
      return NextResponse.json(
        { error: "Strategy not found" },
        { status: 404 }
      );
    }

    if (!strategy.isPublic) {
      return NextResponse.json(
        { error: "Only public strategies can be favorited" },
        { status: 400 }
      );
    }

    const dbUser = await User.findById(user.id);
    if (!dbUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const favoriteIndex = dbUser.favoriteStrategies?.findIndex(
      (id: mongoose.Types.ObjectId) => id.toString() === strategyId
    );

    let favorited = false;
    if (favoriteIndex !== undefined && favoriteIndex >= 0) {
      // Remove from favorites
      dbUser.favoriteStrategies?.splice(favoriteIndex, 1);
    } else {
      // Add to favorites
      if (!dbUser.favoriteStrategies) {
        dbUser.favoriteStrategies = [];
      }
      dbUser.favoriteStrategies.push(strategyId);
      favorited = true;
    }

    await dbUser.save();

    return NextResponse.json({ success: true, favorited });
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : "Failed to update favorite";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
