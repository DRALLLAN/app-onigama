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
  rsi?: number;
  ema9?: number;
  ema21?: number;
  support?: number;
  resistance?: number;
  bosPrice?: number;
  chochPrice?: number;
  obPrice?: number;
  sweepPrice?: number;
  fvgPrice?: number;
  isRealData?: boolean;
  qualityScore?: number;
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

export type Language = 'fa' | 'en' | 'ku';

export interface UserSettings {
  notifications: boolean;
  soundEnabled: boolean;
  language: Language;
  theme: 'dark' | 'glass';
  riskTolerance: 'low' | 'medium' | 'high';
  signalCornerNotification?: boolean;
  signalSoundAlert?: boolean;
}

export interface UserProfile {
  fullName: string;
  email: string;
  experience: 'beginner' | 'intermediate' | 'expert';
  capital: 'under10k' | '10k_50k' | 'above50k';
  subscriptionTier: 'free' | 'premium' | 'vip';
  activationKey: string;
  isActivated: boolean;
  deviceId?: string;
}

export interface MarketCandle {
  timestamp: number; // in seconds
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface BotSettings {
  botName: string;
  businessName: string;
  autoReplyEnabled: boolean;
  responseDelaySec: number;
  welcomeMessage: string;
  fallbackMessage: string;
  contactEmail: string;
  contactPhone: string;
  systemPrompt: string;
}

export interface ChatMessage {
  id: string;
  role: 'customer' | 'ai' | 'agent';
  text: string;
  timestamp: string;
  status: 'sent' | 'delivered' | 'read';
}

export interface ChatConversation {
  id: string;
  customerName: string;
  customerEmail?: string;
  customerPhone?: string;
  avatarUrl?: string;
  status: 'active' | 'needs_human' | 'resolved' | 'active_ai' | 'needs_agent';
  lastMessageTime: string;
  lastMessageText?: string;
  unreadCount: number;
  messages: ChatMessage[];
}

export interface FaqItem {
  id: string;
  category: string;
  question: string;
  answer: string;
  keywords?: string[];
}

export interface AnalyticsData {
  totalReceived: number;
  totalAiReplies: number;
  totalAgentReplies: number;
  avgResponseTimeMs: number;
  satisfactionRate: number;
  activeChats: number;
  volumeHistory: { date: string; customer: number; ai: number }[];
  categoryHits: { name: string; value: number }[];
}

