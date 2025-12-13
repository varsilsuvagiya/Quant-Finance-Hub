/**
 * AI Strategy Generation API Route
 * Generates trading strategies using Groq AI (Llama 3.3 70B)
 * @module app/api/strategies/generate/route
 */

import { NextResponse } from "next/server";
import Groq from "groq-sdk";
import { getCurrentUser } from "@/lib/auth";
import { z } from "zod";

// Initialize Groq client
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

/**
 * Validation schema for strategy generation request
 */
const generateSchema = z.object({
  prompt: z.string().min(10).max(500),
  assetClass: z
    .enum(["Stocks", "Crypto", "Forex", "Futures", "Options"])
    .optional(),
  riskLevel: z.enum(["Low", "Medium", "High", "Very High"]).optional(),
});

/**
 * POST /api/strategies/generate
 * Generate a trading strategy using AI
 * 
 * Request Body:
 * {
 *   "prompt": "Create a momentum strategy for crypto",
 *   "assetClass": "Crypto", // Optional
 *   "riskLevel": "Medium"   // Optional
 * }
 * 
 * @param {Request} request - HTTP request object
 * @returns {Promise<NextResponse>} JSON response with generated strategy
 * @throws {401} If user is not authenticated
 * @throws {400} If validation fails
 * @throws {500} If AI service is unavailable or generation fails
 */
export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!process.env.GROQ_API_KEY) {
      return NextResponse.json(
        { error: "AI service not configured" },
        { status: 500 }
      );
    }

    const body = await request.json();
    const validated = generateSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json(
        { error: "Validation failed", details: validated.error.format() },
        { status: 400 }
      );
    }

    const { prompt, assetClass, riskLevel } = validated.data;

    const systemPrompt = `You are an expert quantitative finance strategist. Generate a detailed trading strategy based on user requirements. 
Return a JSON object with the following structure:
{
  "name": "Strategy name (max 100 chars)",
  "description": "Detailed description (200-2000 chars) explaining the strategy, entry/exit conditions, and rationale",
  "parameters": {
    "entry": "Entry condition description",
    "exit": "Exit condition description",
    "timeframe": "Trading timeframe",
    "indicators": "Key indicators used"
  },
  "riskLevel": "Low" | "Medium" | "High" | "Very High",
  "assetClass": "Stocks" | "Crypto" | "Forex" | "Futures" | "Options",
  "backtestPerformance": "Expected performance metrics (e.g., 'Win Rate: 65%, Sharpe Ratio: 1.5')",
  "tags": ["tag1", "tag2", "tag3"]
}

${assetClass ? `Focus on ${assetClass} markets.` : ""}
${riskLevel ? `Target risk level: ${riskLevel}.` : ""}
Only return valid JSON, no markdown formatting.`;

    const completion = await groq.chat.completions.create({
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: prompt },
      ],
      model: "llama-3.3-70b-versatile",
      temperature: 0.7,
      max_tokens: 2000,
    });

    const responseText = completion.choices[0]?.message?.content || "";

    // Try to extract JSON from response
    let strategyData;
    try {
      // Remove markdown code blocks if present
      const cleaned = responseText
        .replace(/```json\n?/g, "")
        .replace(/```\n?/g, "")
        .trim();
      strategyData = JSON.parse(cleaned);
    } catch (parseError) {
      // If parsing fails, create a basic strategy from the response
      strategyData = {
        name: `AI Generated Strategy - ${new Date().toLocaleDateString()}`,
        description: responseText.substring(0, 2000),
        parameters: {
          entry: "AI generated",
          exit: "AI generated",
          timeframe: "1h",
        },
        riskLevel: riskLevel || "Medium",
        assetClass: assetClass || "Stocks",
        backtestPerformance: "To be backtested",
        tags: ["AI Generated"],
      };
    }

    // Validate and sanitize the response
    const finalStrategy = {
      name: (strategyData.name || "AI Generated Strategy").substring(0, 100),
      description: (strategyData.description || "").substring(0, 2000),
      parameters: strategyData.parameters || {},
      riskLevel: strategyData.riskLevel || riskLevel || "Medium",
      assetClass: strategyData.assetClass || assetClass || "Stocks",
      backtestPerformance: strategyData.backtestPerformance || "",
      tags: Array.isArray(strategyData.tags)
        ? strategyData.tags.slice(0, 10)
        : [],
    };

    return NextResponse.json({ success: true, data: finalStrategy });
  } catch (error: unknown) {
    let errorMessage = "Failed to generate strategy";

    if (error instanceof Error) {
      errorMessage = error.message;
      // Try to extract more detailed error from Groq API responses
      try {
        const errorStr = error.message;
        if (errorStr.includes("{")) {
          const errorObj = JSON.parse(errorStr);
          if (errorObj.error?.message) {
            errorMessage = errorObj.error.message;
          }
        }
      } catch {
        // If parsing fails, use the original error message
      }
    }

    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}
