// src/app/api/strategies/templates/route.ts
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import TradingStrategy from "@/models/TradingStrategy";
import { getCurrentUser } from "@/lib/auth";
import { z } from "zod";

// GET - Get all templates
export async function GET(request: Request) {
  try {
    await connectDB();

    const templates = await TradingStrategy.find({ isTemplate: true })
      .sort({ createdAt: -1 })
      .populate("createdBy", "name email")
      .lean();

    return NextResponse.json({ success: true, data: templates });
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : "Failed to fetch templates";
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}

// POST - Create template from strategy
export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const body = await request.json();
    const { strategyId } = z.object({ strategyId: z.string() }).parse(body);

    const strategy = await TradingStrategy.findById(strategyId);
    if (!strategy) {
      return NextResponse.json(
        { error: "Strategy not found" },
        { status: 404 }
      );
    }

    // Check if user owns the strategy
    if (strategy.createdBy.toString() !== user.id) {
      return NextResponse.json(
        { error: "You can only create templates from your own strategies" },
        { status: 403 }
      );
    }

    // Mark as template
    strategy.isTemplate = true;
    await strategy.save();

    return NextResponse.json({
      success: true,
      data: strategy,
      message: "Strategy marked as template",
    });
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : "Failed to create template";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

// DELETE - Remove template status
export async function DELETE(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const { searchParams } = new URL(request.url);
    const strategyId = searchParams.get("id");

    if (!strategyId) {
      return NextResponse.json(
        { error: "Strategy ID is required" },
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

    if (strategy.createdBy.toString() !== user.id) {
      return NextResponse.json(
        {
          error: "You can only remove template status from your own strategies",
        },
        { status: 403 }
      );
    }

    strategy.isTemplate = false;
    await strategy.save();

    return NextResponse.json({
      success: true,
      message: "Template status removed",
    });
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : "Failed to remove template";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
