// src/app/api/strategies/rating/route.ts
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import TradingStrategy from "@/models/TradingStrategy";
import { getSessionUser } from "@/lib/auth";
import { z } from "zod";

const ratingSchema = z.object({
  rating: z.number().min(1).max(5),
});

// POST - Add/Update rating
export async function POST(request: Request) {
  try {
    const user = await getSessionUser();
    await connectDB();

    const body = await request.json();
    const { strategyId, rating } = body;

    if (!strategyId) {
      return NextResponse.json(
        { error: "Strategy ID is required" },
        { status: 400 }
      );
    }

    const validated = ratingSchema.safeParse({ rating });
    if (!validated.success) {
      return NextResponse.json(
        { error: "Invalid rating", details: validated.error.format() },
        { status: 400 }
      );
    }

    const strategy = await TradingStrategy.findById(strategyId);
    if (!strategy) {
      return NextResponse.json(
        { error: "Strategy not found" },
        { status: 404 }
      );
    }

    if (!strategy.isPublic) {
      return NextResponse.json(
        { error: "Cannot rate private strategies" },
        { status: 403 }
      );
    }

    // Check if user already rated
    const existingRatingIndex = strategy.ratings.findIndex(
      (r: any) => r.user.toString() === user.id
    );

    if (existingRatingIndex >= 0) {
      // Update existing rating
      strategy.ratings[existingRatingIndex].rating = validated.data.rating;
    } else {
      // Add new rating
      strategy.ratings.push({
        user: user.id,
        rating: validated.data.rating,
        createdAt: new Date(),
      });
    }

    await strategy.save();

    // Recalculate average
    if (strategy.ratings && strategy.ratings.length > 0) {
      const sum = strategy.ratings.reduce(
        (acc: number, r: any) => acc + r.rating,
        0
      );
      strategy.averageRating = sum / strategy.ratings.length;
      await strategy.save();
    }

    return NextResponse.json({
      success: true,
      data: {
        averageRating: strategy.averageRating,
        totalRatings: strategy.ratings.length,
      },
    });
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : "Failed to add rating";
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}

// GET - Get rating
export async function GET(request: Request) {
  try {
    const user = await getSessionUser();
    await connectDB();

    const { searchParams } = new URL(request.url);
    const strategyId = searchParams.get("strategyId");

    if (!strategyId) {
      return NextResponse.json(
        { error: "Strategy ID is required" },
        { status: 400 }
      );
    }

    const strategy = await TradingStrategy.findById(strategyId).lean();

    if (!strategy) {
      return NextResponse.json(
        { error: "Strategy not found" },
        { status: 404 }
      );
    }

    const userRating = strategy.ratings?.find(
      (r: any) => r.user.toString() === user.id
    );

    return NextResponse.json({
      success: true,
      data: {
        userRating: userRating?.rating || null,
        averageRating: strategy.averageRating || 0,
        totalRatings: strategy.ratings?.length || 0,
      },
    });
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : "Failed to get rating";
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}
