/**
 * Strategies API Route Handler
 * Handles CRUD operations for trading strategies
 * @module app/api/strategies/route
 */

import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import TradingStrategy from "@/models/TradingStrategy";
import { getCurrentUser } from "@/lib/auth";
import { z } from "zod";

// Force dynamic rendering to prevent build-time evaluation
export const dynamic = "force-dynamic";

/**
 * Rate limiting configuration
 * In-memory rate limiting (suitable for demo and serverless environments like Vercel)
 * For production with multiple instances, consider Redis-based rate limiting
 */
const requestCount = new Map<string, number>();
const RATE_LIMIT = 30; // Maximum requests per minute per IP/user

/**
 * Check if a request should be rate limited
 * @param {string} identifier - Unique identifier (IP + user ID)
 * @returns {boolean} True if rate limited, false otherwise
 */
function isRateLimited(identifier: string): boolean {
  const windowMs = 60_000; // 1 minute window
  const count = requestCount.get(identifier) || 0;

  if (count === 0) {
    requestCount.set(identifier, 1);
    // Auto-cleanup after window expires
    setTimeout(() => requestCount.delete(identifier), windowMs);
    return false;
  }

  if (count >= RATE_LIMIT) return true;

  requestCount.set(identifier, count + 1);
  return false;
}

// Zod schema for validation
const strategySchema = z.object({
  name: z.string().min(3).max(100).trim(),
  description: z.string().min(10).max(2000).trim(),
  parameters: z
    .record(z.string(), z.unknown())
    .refine((val) => Object.keys(val).length > 0, {
      message: "Parameters cannot be empty",
    }),
  riskLevel: z.enum(["Low", "Medium", "High", "Very High"]),
  assetClass: z
    .enum(["Stocks", "Crypto", "Forex", "Futures", "Options"])
    .optional(),
  backtestPerformance: z.string().optional(),
  isPublic: z.boolean().optional(),
  tags: z.array(z.string().trim()).optional(),
});

// GET /api/strategies - Get all strategies for logged-in user (or public ones)
export async function GET(request: Request) {
  try {
    await connectDB();
    const user = await getCurrentUser();

    const { searchParams } = new URL(request.url);
    const publicOnly = searchParams.get("public") === "true";
    const favoritesOnly = searchParams.get("favorites") === "true";

    let filter: Record<string, unknown> = {};

    if (favoritesOnly && user) {
      // Get user's favorite strategies
      const User = (await import("@/models/User")).default;
      const userDoc = await User.findById(user.id).lean();
      const favoriteIds = userDoc?.favoriteStrategies || [];
      filter = { _id: { $in: favoriteIds } };
    } else if (!publicOnly && user) {
      filter = { $or: [{ createdBy: user.id }, { isPublic: true }] };
    } else {
      filter = { isPublic: true };
    }

    const strategies = await TradingStrategy.find(filter)
      .sort({ createdAt: -1 })
      .populate("createdBy", "name email")
      .lean();

    return NextResponse.json({ success: true, data: strategies });
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : "Server error";
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}

/**
 * POST /api/strategies
 * Create a new trading strategy
 * Requires authentication and rate limiting
 *
 * @returns {Promise<NextResponse>} JSON response with created strategy
 * @throws {401} If user is not authenticated
 * @throws {429} If rate limit is exceeded
 * @throws {400} If validation fails
 */
export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const ip = request.headers.get("x-forwarded-for") || "unknown";
    if (isRateLimited(ip + user.id)) {
      return NextResponse.json({ error: "Too many requests" }, { status: 429 });
    }

    await connectDB();
    const body = await request.json();

    const validated = strategySchema.safeParse(body);
    if (!validated.success) {
      return NextResponse.json(
        { error: "Validation failed", details: validated.error.format() },
        { status: 400 }
      );
    }

    const strategy = await TradingStrategy.create({
      ...validated.data,
      createdBy: user.id,
    });

    return NextResponse.json(
      { success: true, data: strategy },
      { status: 201 }
    );
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : "Failed to create strategy";
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}

// PUT /api/strategies - Update strategy (only owner)
export async function PUT(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const body = await request.json();
    const { _id, ...updateData } = body;

    if (!_id) {
      return NextResponse.json(
        { error: "Strategy ID is required" },
        { status: 400 }
      );
    }

    const validated = strategySchema.partial().safeParse(updateData);
    if (!validated.success) {
      return NextResponse.json(
        { error: "Validation failed", details: validated.error.format() },
        { status: 400 }
      );
    }

    const strategy = await TradingStrategy.findById(_id);
    if (!strategy) {
      return NextResponse.json(
        { error: "Strategy not found" },
        { status: 404 }
      );
    }

    if (strategy.createdBy.toString() !== user.id) {
      return NextResponse.json(
        { error: "Forbidden: Not owner" },
        { status: 403 }
      );
    }

    Object.assign(strategy, validated.data);
    await strategy.save();

    return NextResponse.json({ success: true, data: strategy });
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : "Failed to update";
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/strategies
 * Delete a strategy (owner only)
 *
 * Query Parameters:
 * - id: Strategy ID to delete
 *
 * @returns {Promise<NextResponse>} JSON response with success message
 * @throws {401} If user is not authenticated
 * @throws {403} If user is not the strategy owner
 * @throws {404} If strategy not found
 */
export async function DELETE(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Strategy ID is required" },
        { status: 400 }
      );
    }

    const strategy = await TradingStrategy.findById(id);
    if (!strategy) {
      return NextResponse.json(
        { error: "Strategy not found" },
        { status: 404 }
      );
    }

    if (strategy.createdBy.toString() !== user.id) {
      return NextResponse.json(
        { error: "Forbidden: Not owner" },
        { status: 403 }
      );
    }

    await TradingStrategy.findByIdAndDelete(id);

    return NextResponse.json({ success: true, message: "Strategy deleted" });
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : "Failed to delete";
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}
