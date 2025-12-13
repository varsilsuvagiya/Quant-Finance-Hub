/**
 * Profile API Route Handler
 * Handles user profile updates
 * @module app/api/profile/route
 */

import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import { getCurrentUser } from "@/lib/auth";
import { z } from "zod";

// Force dynamic rendering to prevent build-time evaluation
export const dynamic = "force-dynamic";

// Validation schema for profile updates
const profileUpdateSchema = z.object({
  name: z.string().min(1).max(100).trim().optional(),
});

/**
 * PUT /api/profile
 * Update user profile
 *
 * Request Body:
 * {
 *   "name": "Updated Name"
 * }
 *
 * @returns {Promise<NextResponse>} JSON response with updated user data
 */
export async function PUT(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const body = await request.json();

    // Validate request body
    const validated = profileUpdateSchema.safeParse(body);
    if (!validated.success) {
      return NextResponse.json(
        { error: "Validation failed", details: validated.error.format() },
        { status: 400 }
      );
    }

    // Find user by email (from session)
    const dbUser = await User.findOne({ email: user.email });
    if (!dbUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Update user fields
    if (validated.data.name !== undefined) {
      dbUser.name = validated.data.name;
    }

    await dbUser.save();

    // Return updated user data (excluding sensitive fields)
    return NextResponse.json({
      success: true,
      data: {
        name: dbUser.name,
        email: dbUser.email,
        role: dbUser.role,
      },
    });
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : "Failed to update profile";
    console.error("Profile update error:", error);
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}
