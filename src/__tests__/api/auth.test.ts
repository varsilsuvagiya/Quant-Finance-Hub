/**
 * Integration tests for authentication API
 * @module __tests__/api/auth.test
 */

import { POST as RegisterPOST } from "@/app/api/register/route";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import bcrypt from "bcryptjs";

jest.mock("@/lib/db");
jest.mock("@/models/User");
jest.mock("bcryptjs");

const mockConnectDB = connectDB as jest.MockedFunction<typeof connectDB>;
const mockBcryptHash = bcrypt.hash as jest.MockedFunction<typeof bcrypt.hash>;

describe("Auth API", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockConnectDB.mockResolvedValue(undefined);
  });

  describe("POST /api/register", () => {
    it("should register a new user", async () => {
      (User.findOne as jest.Mock).mockResolvedValue(null);
      (User.create as jest.Mock).mockResolvedValue({
        _id: "user1",
        name: "Test User",
        email: "test@example.com",
        emailVerificationToken: "token123",
      });
      mockBcryptHash.mockResolvedValue("hashedPassword" as never);

      const request = new Request("http://localhost/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: "Test User",
          email: "test@example.com",
          password: "password123",
        }),
      });

      const response = await RegisterPOST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.user.email).toBe("test@example.com");
    });

    it("should return error if user already exists", async () => {
      (User.findOne as jest.Mock).mockResolvedValue({
        _id: "user1",
        email: "test@example.com",
      });

      const request = new Request("http://localhost/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: "Test User",
          email: "test@example.com",
          password: "password123",
        }),
      });

      const response = await RegisterPOST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe("User already exists");
    });
  });
});
