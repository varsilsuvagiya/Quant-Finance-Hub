// src/app/api/strategies/export/route.ts
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import TradingStrategy from "@/models/TradingStrategy";
import { getCurrentUser } from "@/lib/auth";

// Force dynamic rendering to prevent build-time evaluation
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const { searchParams } = new URL(request.url);
    const strategyId = searchParams.get("id");
    const format = searchParams.get("format") || "json";

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

    // Check if user owns the strategy or it's public
    if (strategy.createdBy.toString() !== user.id && !strategy.isPublic) {
      return NextResponse.json(
        { error: "Unauthorized to export this strategy" },
        { status: 403 }
      );
    }

    if (format === "json") {
      const jsonData = JSON.stringify(
        {
          name: strategy.name,
          description: strategy.description,
          parameters: strategy.parameters,
          riskLevel: strategy.riskLevel,
          assetClass: strategy.assetClass,
          backtestPerformance: strategy.backtestPerformance,
          tags: strategy.tags,
          createdAt: strategy.createdAt,
        },
        null,
        2
      );

      return new NextResponse(jsonData, {
        headers: {
          "Content-Type": "application/json",
          "Content-Disposition": `attachment; filename="strategy-${
            strategy.name
          }-${Date.now()}.json"`,
        },
      });
    } else if (format === "csv") {
      const csvRows = [
        ["Field", "Value"],
        ["Name", strategy.name],
        ["Description", strategy.description],
        ["Risk Level", strategy.riskLevel],
        ["Asset Class", strategy.assetClass],
        ["Backtest Performance", strategy.backtestPerformance || ""],
        ["Tags", strategy.tags?.join(", ") || ""],
        ["Parameters", JSON.stringify(strategy.parameters)],
        ["Created At", new Date(strategy.createdAt).toISOString()],
      ];

      const csvContent = csvRows
        .map((row) =>
          row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")
        )
        .join("\n");

      return new NextResponse(csvContent, {
        headers: {
          "Content-Type": "text/csv",
          "Content-Disposition": `attachment; filename="strategy-${
            strategy.name
          }-${Date.now()}.csv"`,
        },
      });
    } else {
      return NextResponse.json(
        { error: "Invalid format. Use 'json' or 'csv'" },
        { status: 400 }
      );
    }
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : "Failed to export strategy";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
