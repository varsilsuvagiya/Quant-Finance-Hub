// src/app/api/strategies/ratings/route.ts
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import TradingStrategy from "@/models/TradingStrategy";
import { getCurrentUser } from "@/lib/auth";
import { z } from "zod";

// Force dynamic rendering to prevent build-time evaluation
export const dynamic = "force-dynamic";

const ratingSchema = z.object({
  strategyId: z.string().min(1),
  rating: z.number().min(1).max(5),
});

// GET - Get rating for a strategy
export async function GET(request: Request) {
  try {
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

    const user = await getCurrentUser();
    let userRating = null;

    if (user && strategy.ratings) {
      const rating = strategy.ratings.find(
        (r: { user: { toString: () => string } }) =>
          r.user.toString() === user.id
      );
      if (rating) {
        userRating = rating.rating;
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        averageRating: strategy.averageRating || 0,
        totalRatings: strategy.ratings?.length || 0,
        userRating,
      },
    });
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : "Failed to fetch rating";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

// POST - Add or update a rating
export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const body = await request.json();
    const { strategyId, rating } = ratingSchema.parse(body);

    const strategy = await TradingStrategy.findById(strategyId);
    if (!strategy) {
      return NextResponse.json(
        { error: "Strategy not found" },
        { status: 404 }
      );
    }

    if (!strategy.isPublic) {
      return NextResponse.json(
        { error: "Only public strategies can be rated" },
        { status: 400 }
      );
    }

    if (!strategy.ratings) {
      strategy.ratings = [];
    }

    // Check if user already rated
    const existingRatingIndex = strategy.ratings.findIndex(
      (r: { user: { toString: () => string } }) => r.user.toString() === user.id
    );

    if (existingRatingIndex >= 0) {
      // Update existing rating
      strategy.ratings[existingRatingIndex].rating = rating;
      strategy.ratings[existingRatingIndex].createdAt = new Date();
    } else {
      // Add new rating
      strategy.ratings.push({
        user: user.id,
        rating,
        createdAt: new Date(),
      });
    }

    // Calculate average rating
    const sum = strategy.ratings.reduce(
      (acc: number, r: { rating: number }) => acc + r.rating,
      0
    );
    strategy.averageRating = sum / strategy.ratings.length;

    await strategy.save();

    return NextResponse.json({
      success: true,
      data: {
        averageRating: strategy.averageRating,
        totalRatings: strategy.ratings.length,
        userRating: rating,
      },
      message: "Rating saved successfully",
    });
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : "Failed to save rating";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
