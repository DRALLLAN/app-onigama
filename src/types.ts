export interface Signal {
  id: string;
  symbol: string;
  type: 'BUY' | 'SELL';
  entryPrice: number;
  tp1: number;
  tp2: number;
  tp3: number;
  sl: number;
  timestamp: string;
  status: 'ACTIVE' | 'TP1' | 'TP2' | 'TP3' | 'SL' | 'CLOSED';
  notes?: string;
  session?: 'ASIA' | 'LONDON' | 'NY';
  strategy?: 'SMC' | 'LIT';
}

export interface Trade {
  id: string;
  symbol: string;
  type: 'BUY' | 'SELL';
  entryPrice: number;
  exitPrice: number;
  volume: number; // lot size
  profit: number; // USD
  date: string; // Persian or ISO date
  outcome: 'WIN' | 'LOSS';
  notes?: string;
}

export interface MarkerLevel {
  id: string;
  type: 'OB_BULLISH' | 'OB_BEARISH' | 'FVG' | 'BSL' | 'SSL' | 'SUPPORT' | 'RESISTANCE';
  price: number;
  label: string;
  description: string;
}

export interface MarketStats {
  tradesCount: number;
  winRate: number; // as percentage, e.g. 74
  totalProfit: number; // in USD
  winCount: number;
  lossCount: number;
}

export interface UserSettings {
  notifications: boolean;
  soundEnabled: boolean;
  language: 'fa' | 'en';
  theme: 'dark' | 'glass';
  riskTolerance: 'low' | 'medium' | 'high';
}

export interface UserProfile {
  fullName: string;
  email: string;
  experience: 'beginner' | 'intermediate' | 'expert';
  capital: 'under10k' | '10k_50k' | 'above50k';
  subscriptionTier: 'free' | 'premium' | 'vip';
  activationKey: string;
  isActivated: boolean;
}

