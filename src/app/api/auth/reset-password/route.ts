// src/app/api/auth/reset-password/route.ts
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import bcrypt from "bcryptjs";
import { z } from "zod";
import crypto from "crypto";

const requestResetSchema = z.object({
  email: z.string().email(),
});

const resetPasswordSchema = z.object({
  token: z.string().min(1),
  password: z.string().min(6),
});

// Request password reset
export async function POST(request: Request) {
  try {
    await connectDB();
    const body = await request.json();

    // Check if it's a reset request or actual reset
    if (body.email && !body.token) {
      // Request reset
      const { email } = requestResetSchema.parse(body);

      const user = await User.findOne({ email: email.toLowerCase() });
      if (!user) {
        // Don't reveal if user exists
        return NextResponse.json({
          success: true,
          message: "If the email exists, a reset link has been sent",
        });
      }

      const token = crypto.randomBytes(32).toString("hex");
      user.passwordResetToken = token;
      user.passwordResetExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
      await user.save();

      // In production, send email here
      const resetUrl = `${process.env.NEXTAUTH_URL}/reset-password?token=${token}`;

      return NextResponse.json({
        success: true,
        message: "Password reset email sent",
        resetUrl, // Remove in production
      });
    } else if (body.token && body.password) {
      // Reset password
      const { token, password } = resetPasswordSchema.parse(body);

      const user = await User.findOne({
        passwordResetToken: token,
        passwordResetExpires: { $gt: new Date() },
      });

      if (!user) {
        return NextResponse.json(
          { error: "Invalid or expired reset token" },
          { status: 400 }
        );
      }

      const hashedPassword = await bcrypt.hash(password, 12);
      user.password = hashedPassword;
      user.passwordResetToken = null;
      user.passwordResetExpires = null;
      await user.save();

      return NextResponse.json({
        success: true,
        message: "Password reset successfully",
      });
    } else {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : "Failed to process request";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
