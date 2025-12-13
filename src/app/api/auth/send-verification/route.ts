// src/app/api/auth/send-verification/route.ts
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import { getCurrentUser } from "@/lib/auth";
import crypto from "crypto";

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const dbUser = await User.findById(user.id);
    if (!dbUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (dbUser.emailVerified) {
      return NextResponse.json(
        { error: "Email already verified" },
        { status: 400 }
      );
    }

    // Generate verification token
    const token = crypto.randomBytes(32).toString("hex");
    dbUser.emailVerificationToken = token;
    dbUser.emailVerificationExpires = new Date(
      Date.now() + 24 * 60 * 60 * 1000
    ); // 24 hours
    await dbUser.save();

    // In production, send email here
    // For now, return the verification link
    const verificationUrl = `${process.env.NEXTAUTH_URL}/verify-email?token=${token}`;

    return NextResponse.json({
      success: true,
      message: "Verification email sent",
      verificationUrl, // Remove in production, only for development
    });
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : "Failed to send verification";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
