/**
 * Integration tests for authentication flow
 * @module __tests__/integration/auth-flow.test
 */

import { POST as RegisterPOST } from "@/app/api/register/route";
import { POST as VerifyEmailPOST } from "@/app/api/auth/verify-email/route";
import { connectDB } from "@/lib/db";
import User from "@/models/User";

jest.mock("@/lib/db");
jest.mock("@/models/User");

describe("Authentication Flow Integration", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should complete full registration and verification flow", async () => {
    // Step 1: Register user
    (User.findOne as jest.Mock).mockResolvedValue(null);
    const mockUser = {
      _id: "user1",
      name: "Test User",
      email: "test@example.com",
      emailVerificationToken: "token123",
      emailVerificationExpires: new Date(Date.now() + 24 * 60 * 60 * 1000),
      emailVerified: false,
      save: jest.fn().mockResolvedValue(true),
    };
    (User.create as jest.Mock).mockResolvedValue(mockUser);

    const registerRequest = new Request("http://localhost/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "Test User",
        email: "test@example.com",
        password: "password123",
      }),
    });

    const registerResponse = await RegisterPOST(registerRequest);
    const registerData = await registerResponse.json();

    expect(registerData.success).toBe(true);
    expect(registerData.user.email).toBe("test@example.com");

    // Step 2: Verify email
    (User.findOne as jest.Mock).mockResolvedValue(mockUser);

    const verifyRequest = new Request(
      "http://localhost/api/auth/verify-email",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: "token123" }),
      }
    );

    const verifyResponse = await VerifyEmailPOST(verifyRequest);
    const verifyData = await verifyResponse.json();

    expect(verifyData.success).toBe(true);
    expect(mockUser.emailVerified).toBe(true);
  });
});
