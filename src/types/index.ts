// src/types/index.ts
export type RiskLevel = 'Low' | 'Medium' | 'High' | 'Very High';
export type AssetClass = 'Stocks' | 'Crypto' | 'Forex' | 'Futures' | 'Options';

export interface TradingStrategy {
  _id: string;
  name: string;
  description: string;
  parameters: Record<string, any>;
  riskLevel: RiskLevel;
  assetClass: AssetClass;
  backtestPerformance?: string;
  createdBy: string;
  isPublic: boolean;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface User {
  _id: string;
  email: string;
  name?: string;
  role: 'user' | 'admin';
}