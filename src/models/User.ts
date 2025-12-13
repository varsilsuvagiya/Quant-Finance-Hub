/**
 * User Mongoose Model
 * Defines the schema and model for application users
 * @module models/User
 */

import mongoose from "mongoose";

/**
 * User Schema
 *
 * Fields:
 * - email: User email (required, unique, lowercase)
 * - password: Hashed password (required, min 6 chars)
 * - name: User's full name
 * - role: User role (user, admin)
 * - emailVerified: Whether email has been verified
 * - emailVerificationToken: Token for email verification
 * - emailVerificationExpires: Expiration date for verification token
 * - passwordResetToken: Token for password reset
 * - passwordResetExpires: Expiration date for reset token
 * - favoriteStrategies: Array of favorited strategy IDs
 */
const userSchema = new mongoose.Schema({
  /** User email - required, unique, automatically lowercased */
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  password: {
    type: String,
    required: true,
    minlength: 6,
  },
  name: {
    type: String,
    trim: true,
  },
  role: {
    type: String,
    enum: ["user", "admin"],
    default: "user",
  },
  emailVerified: {
    type: Boolean,
    default: false,
  },
  emailVerificationToken: {
    type: String,
    default: null,
  },
  emailVerificationExpires: {
    type: Date,
    default: null,
  },
  passwordResetToken: {
    type: String,
    default: null,
  },
  passwordResetExpires: {
    type: Date,
    default: null,
  },
  favoriteStrategies: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "TradingStrategy",
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.models.User || mongoose.model("User", userSchema);
