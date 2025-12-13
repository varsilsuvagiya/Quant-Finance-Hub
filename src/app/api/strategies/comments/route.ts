// src/app/api/strategies/comments/route.ts
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import TradingStrategy from "@/models/TradingStrategy";
import { getCurrentUser } from "@/lib/auth";
import { z } from "zod";

// Force dynamic rendering to prevent build-time evaluation
export const dynamic = "force-dynamic";

const commentSchema = z.object({
  strategyId: z.string().min(1),
  text: z.string().min(1).max(500),
});

// GET - Get comments for a strategy
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

    const strategy = await TradingStrategy.findById(strategyId)
      .populate("comments.user", "name email")
      .lean();

    if (!strategy) {
      return NextResponse.json(
        { error: "Strategy not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: strategy.comments || [],
    });
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : "Failed to fetch comments";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

// POST - Add a comment
export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const body = await request.json();
    const { strategyId, text } = commentSchema.parse(body);

    const strategy = await TradingStrategy.findById(strategyId);
    if (!strategy) {
      return NextResponse.json(
        { error: "Strategy not found" },
        { status: 404 }
      );
    }

    if (!strategy.isPublic) {
      return NextResponse.json(
        { error: "Only public strategies can be commented on" },
        { status: 400 }
      );
    }

    if (!strategy.comments) {
      strategy.comments = [];
    }

    strategy.comments.push({
      user: user.id,
      text: text.trim(),
      createdAt: new Date(),
    });

    await strategy.save();

    const populatedStrategy = await TradingStrategy.findById(strategyId)
      .populate("comments.user", "name email")
      .lean();

    return NextResponse.json({
      success: true,
      data: populatedStrategy?.comments || [],
      message: "Comment added successfully",
    });
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : "Failed to add comment";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

// DELETE - Delete a comment
export async function DELETE(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const { searchParams } = new URL(request.url);
    const strategyId = searchParams.get("strategyId");
    const commentIndex = searchParams.get("index");

    if (!strategyId || commentIndex === null) {
      return NextResponse.json(
        { error: "Strategy ID and comment index are required" },
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

    const index = parseInt(commentIndex, 10);
    if (!strategy.comments || index < 0 || index >= strategy.comments.length) {
      return NextResponse.json(
        { error: "Invalid comment index" },
        { status: 400 }
      );
    }

    const comment = strategy.comments[index];
    // Only allow deletion if user is the comment author or strategy owner
    if (
      comment.user.toString() !== user.id &&
      strategy.createdBy.toString() !== user.id
    ) {
      return NextResponse.json(
        { error: "Unauthorized to delete this comment" },
        { status: 403 }
      );
    }

    strategy.comments.splice(index, 1);
    await strategy.save();

    return NextResponse.json({
      success: true,
      message: "Comment deleted successfully",
    });
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : "Failed to delete comment";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
