// src/app/api/strategies/use-template/route.ts
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import TradingStrategy from "@/models/TradingStrategy";
import { getCurrentUser } from "@/lib/auth";
import { z } from "zod";

// Force dynamic rendering to prevent build-time evaluation
export const dynamic = "force-dynamic";

const useTemplateSchema = z.object({
  templateId: z.string().min(1),
  name: z.string().min(3).max(100).optional(),
});

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const body = await request.json();
    const { templateId, name } = useTemplateSchema.parse(body);

    const template = await TradingStrategy.findById(templateId);
    if (!template) {
      return NextResponse.json(
        { error: "Template not found" },
        { status: 404 }
      );
    }

    if (!template.isTemplate) {
      return NextResponse.json(
        { error: "This strategy is not a template" },
        { status: 400 }
      );
    }

    // Create a new strategy from template
    const newStrategy = await TradingStrategy.create({
      name: name || `${template.name} (From Template)`,
      description: template.description,
      parameters: template.parameters,
      riskLevel: template.riskLevel,
      assetClass: template.assetClass,
      backtestPerformance: template.backtestPerformance,
      tags: template.tags,
      createdBy: user.id,
      isPublic: false,
      isTemplate: false,
      copiedFrom: templateId,
    });

    return NextResponse.json({
      success: true,
      data: newStrategy,
      message: "Strategy created from template",
    });
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : "Failed to use template";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
