/**
 * Integration tests for strategies API
 * @module __tests__/api/strategies.test
 */

import { POST, GET, PUT, DELETE } from "@/app/api/strategies/route";
import { connectDB } from "@/lib/db";
import TradingStrategy from "@/models/TradingStrategy";
import User from "@/models/User";
import bcrypt from "bcryptjs";

// Mock dependencies
jest.mock("@/lib/db");
jest.mock("@/lib/auth");
jest.mock("@/models/TradingStrategy");
jest.mock("@/models/User");

const mockConnectDB = connectDB as jest.MockedFunction<typeof connectDB>;
const mockGetCurrentUser = require("@/lib/auth")
  .getCurrentUser as jest.MockedFunction<any>;

describe("Strategies API", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockConnectDB.mockResolvedValue(undefined);
  });

  describe("POST /api/strategies", () => {
    it("should create a new strategy", async () => {
      mockGetCurrentUser.mockResolvedValue({ id: "user1" });

      const mockStrategy = {
        _id: "strategy1",
        name: "Test Strategy",
        description: "Test description",
        parameters: { entry: "RSI < 30" },
        riskLevel: "Medium",
        assetClass: "Stocks",
        createdBy: "user1",
        save: jest.fn(),
      };

      (TradingStrategy.create as jest.Mock).mockResolvedValue(mockStrategy);

      const request = new Request("http://localhost/api/strategies", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: "Test Strategy",
          description: "Test description",
          parameters: { entry: "RSI < 30" },
          riskLevel: "Medium",
          assetClass: "Stocks",
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.success).toBe(true);
      expect(data.data.name).toBe("Test Strategy");
    });

    it("should return 401 if user is not authenticated", async () => {
      mockGetCurrentUser.mockResolvedValue(null);

      const request = new Request("http://localhost/api/strategies", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: "Test Strategy",
          description: "Test description",
          parameters: { entry: "RSI < 30" },
        }),
      });

      const response = await POST(request);
      expect(response.status).toBe(401);
    });
  });

  describe("GET /api/strategies", () => {
    it("should return user strategies", async () => {
      mockGetCurrentUser.mockResolvedValue({ id: "user1" });

      const mockStrategies = [
        {
          _id: "strategy1",
          name: "Strategy 1",
          createdBy: "user1",
          isPublic: false,
        },
      ];

      (TradingStrategy.find as jest.Mock).mockReturnValue({
        sort: jest.fn().mockReturnValue({
          populate: jest.fn().mockReturnValue({
            lean: jest.fn().mockResolvedValue(mockStrategies),
          }),
        }),
      });

      const request = new Request("http://localhost/api/strategies");
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data).toHaveLength(1);
    });
  });
});
