/**
 * Unit tests for StrategyCard component
 * @module __tests__/components/strategy-card.test
 */

import { render, screen } from "@testing-library/react";
import { StrategyCard } from "@/components/strategy-card";
import { TradingStrategy } from "@/types";

// Mock next/link
jest.mock("next/link", () => {
  return ({ children, href }: { children: React.ReactNode; href: string }) => {
    return <a href={href}>{children}</a>;
  };
});

// Mock sonner toast
jest.mock("sonner", () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

const mockStrategy: TradingStrategy = {
  _id: "1",
  name: "Test Strategy",
  description: "This is a test strategy description",
  parameters: { entry: "RSI < 30", exit: "RSI > 70", timeframe: "1h" },
  riskLevel: "Medium",
  assetClass: "Stocks",
  isPublic: true,
  tags: ["momentum", "RSI"],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  createdBy: "user1",
};

describe("StrategyCard", () => {
  it("renders strategy name and description", () => {
    render(<StrategyCard strategy={mockStrategy} />);
    expect(screen.getByText("Test Strategy")).toBeInTheDocument();
    expect(screen.getByText(/This is a test strategy/i)).toBeInTheDocument();
  });

  it("displays risk level and asset class badges", () => {
    render(<StrategyCard strategy={mockStrategy} />);
    expect(screen.getByText("Medium")).toBeInTheDocument();
    expect(screen.getByText("Stocks")).toBeInTheDocument();
  });

  it("shows template badge when strategy is a template", () => {
    const templateStrategy = { ...mockStrategy, isTemplate: true };
    render(<StrategyCard strategy={templateStrategy} />);
    expect(screen.getByText("Template")).toBeInTheDocument();
  });

  it("hides actions when showActions is false", () => {
    render(<StrategyCard strategy={mockStrategy} showActions={false} />);
    // Actions should not be visible
    expect(
      screen.queryByRole("button", { name: /edit/i })
    ).not.toBeInTheDocument();
  });
});
