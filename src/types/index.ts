// src/types/index.ts
export type RiskLevel = 'Low' | 'Medium' | 'High' | 'Very High';
export type AssetClass = 'Stocks' | 'Crypto' | 'Forex' | 'Futures' | 'Options';

export interface Comment {
  _id: string;
  user: {
    _id: string;
    name?: string;
    email: string;
  };
  text: string;
  createdAt: string;
}

export interface Rating {
  _id: string;
  user: string;
  rating: number;
  createdAt: string;
}

export interface TradingStrategy {
  _id: string;
  name: string;
  description: string;
  parameters: Record<string, unknown>;
  riskLevel: RiskLevel;
  assetClass: AssetClass;
  backtestPerformance?: string;
  createdBy: string;
  isPublic: boolean;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  isTemplate?: boolean;
  copiedFrom?: string;
  copyCount?: number;
  comments?: Comment[];
  ratings?: Rating[];
  averageRating?: number;
}

export interface User {
  _id: string;
  email: string;
  name?: string;
  role: 'user' | 'admin';
}