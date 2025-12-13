// src/app/api/strategies/copy/route.ts
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import TradingStrategy from "@/models/TradingStrategy";
import { getCurrentUser } from "@/lib/auth";
import { z } from "zod";

// Force dynamic rendering to prevent build-time evaluation
export const dynamic = "force-dynamic";

const copySchema = z.object({
  strategyId: z.string().min(1),
});

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const body = await request.json();
    const { strategyId } = copySchema.parse(body);

    const originalStrategy = await TradingStrategy.findById(strategyId);
    if (!originalStrategy) {
      return NextResponse.json(
        { error: "Strategy not found" },
        { status: 404 }
      );
    }

    if (!originalStrategy.isPublic) {
      return NextResponse.json(
        { error: "Only public strategies can be copied" },
        { status: 400 }
      );
    }

    // Check if user already has a copy
    const existingCopy = await TradingStrategy.findOne({
      createdBy: user.id,
      copiedFrom: strategyId,
    });

    if (existingCopy) {
      return NextResponse.json({
        success: true,
        data: existingCopy,
        message: "Strategy already copied",
      });
    }

    // Create a copy
    const copiedStrategy = await TradingStrategy.create({
      name: `${originalStrategy.name} (Copy)`,
      description: originalStrategy.description,
      parameters: originalStrategy.parameters,
      riskLevel: originalStrategy.riskLevel,
      assetClass: originalStrategy.assetClass,
      backtestPerformance: originalStrategy.backtestPerformance,
      tags: originalStrategy.tags,
      createdBy: user.id,
      isPublic: false,
      copiedFrom: strategyId,
    });

    // Increment copy count
    originalStrategy.copyCount = (originalStrategy.copyCount || 0) + 1;
    await originalStrategy.save();

    return NextResponse.json({
      success: true,
      data: copiedStrategy,
      message: "Strategy copied successfully",
    });
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : "Failed to copy strategy";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
