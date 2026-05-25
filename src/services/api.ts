import { Signal, Trade, MarkerLevel, MarketStats, UserSettings, UserProfile } from '../types';

// Helper to generate ISO strings relative to current time
function getRelativeISOString(hoursOffset: number): string {
  return new Date(Date.now() - hoursOffset * 60 * 60 * 1000).toISOString();
}

// Helper to format clean Persian date representation based on user current time
function getPersianDateString(date: Date): string {
  try {
    const formatter = new Intl.DateTimeFormat('fa-IR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
    // Remove Persian comma symbol and control characters for clean presentation
    return formatter.format(date)
      .replace(/،/g, '')
      .replace(/\u200f/g, '')
      .replace(/\u200e/g, '')
      .replace(/\s+/g, ' ')
      .trim();
  } catch (e) {
    return date.toISOString().replace('T', ' ').slice(0, 16);
  }
}

// Default mock signals to initialize the dashboard dynamically
const getInitialSignals = (): Signal[] => [
  {
    id: 'sig-1',
    symbol: 'XAUUSD',
    type: 'BUY',
    entryPrice: 2420.50,
    tp1: 2428.00,
    tp2: 2435.00,
    tp3: 2445.00,
    sl: 2410.00,
    timestamp: getRelativeISOString(1.5), // 1.5 hours ago
    status: 'TP2',
    notes: 'Premium ICT Setup: H4 Fair Value Gap (FVG) mitigating Order Block with liquidity sweep.',
    session: 'NY',
    strategy: 'SMC'
  },
  {
    id: 'sig-2',
    symbol: 'XAUUSD',
    type: 'SELL',
    entryPrice: 2438.20,
    tp1: 2432.00,
    tp2: 2424.00,
    tp3: 2415.00,
    sl: 2445.50,
    timestamp: getRelativeISOString(4), // 4 hours ago
    status: 'ACTIVE',
    notes: 'Asian Range high sweep into premium level with bearish Break of Structure (BOS).',
    session: 'ASIA',
    strategy: 'LIT'
  },
  {
    id: 'sig-3',
    symbol: 'XAUUSD',
    type: 'BUY',
    entryPrice: 2412.00,
    tp1: 2418.00,
    tp2: 2425.00,
    tp3: 2435.00,
    sl: 2404.00,
    timestamp: getRelativeISOString(10), // 10 hours ago
    status: 'TP1',
    notes: 'Mitigation of bullish H1 Order Block after equal lows sweep.',
    session: 'LONDON',
    strategy: 'SMC'
  },
  {
    id: 'sig-4',
    symbol: 'XAUUSD',
    type: 'SELL',
    entryPrice: 2442.00,
    tp1: 2435.00,
    tp2: 2427.00,
    tp3: 2418.00,
    sl: 2450.00,
    timestamp: getRelativeISOString(26), // 26 hours ago
    status: 'SL',
    notes: 'London Open liquidity grab. High volume run breached our protective stop-loss.',
    session: 'LONDON',
    strategy: 'LIT'
  },
  {
    id: 'sig-5',
    symbol: 'BTCUSD',
    type: 'BUY',
    entryPrice: 67120.00,
    tp1: 67600.00,
    tp2: 68100.00,
    tp3: 69000.00,
    sl: 66400.00,
    timestamp: getRelativeISOString(18), // 18 hours ago
    status: 'ACTIVE',
    notes: 'Weekly high sweep and H4 demand zone mitigation. Institutional volume is rising.',
    session: 'NY',
    strategy: 'SMC'
  },
  {
    id: 'sig-6',
    symbol: 'EURUSD',
    type: 'SELL',
    entryPrice: 1.0865,
    tp1: 1.0835,
    tp2: 1.0810,
    tp3: 1.0780,
    sl: 1.0895,
    timestamp: getRelativeISOString(3), // 3 hours ago
    status: 'ACTIVE',
    notes: 'Premium pool mitigation during NY Session open. High sell volume at supply level.',
    session: 'NY',
    strategy: 'SMC'
  }
];

const getInitialTrades = (): Trade[] => [
  {
    id: 'trade-1',
    symbol: 'XAUUSD',
    type: 'BUY',
    entryPrice: 2415.50,
    exitPrice: 2430.20,
    volume: 0.5,
    profit: 735.00,
    date: getPersianDateString(new Date(Date.now() - 3.5 * 60 * 60 * 1000)), // 3.5 hours ago
    outcome: 'WIN',
    notes: 'Mitigated H1 bullish order block. Stopped out manually near H4 liquidity sweep.'
  },
  {
    id: 'trade-2',
    symbol: 'XAUUSD',
    type: 'SELL',
    entryPrice: 2434.00,
    exitPrice: 2439.50,
    volume: 0.3,
    profit: -165.00,
    date: getPersianDateString(new Date(Date.now() - 20 * 60 * 60 * 1000)), // 20 hours ago
    outcome: 'LOSS',
    notes: 'Premature entries in consolidated range before sweeps. Hit tight Stop Loss.'
  },
  {
    id: 'trade-3',
    symbol: 'XAUUSD',
    type: 'BUY',
    entryPrice: 2402.10,
    exitPrice: 2418.50,
    volume: 0.4,
    profit: 656.00,
    date: getPersianDateString(new Date(Date.now() - 44 * 60 * 60 * 1000)), // 44 hours ago
    outcome: 'WIN',
    notes: 'HTF daily support fill with bullish divergence. Perfect alignment.'
  },
  {
    id: 'trade-4',
    symbol: 'XAUUSD',
    type: 'SELL',
    entryPrice: 2428.80,
    exitPrice: 2420.20,
    volume: 0.5,
    profit: 430.00,
    date: getPersianDateString(new Date(Date.now() - 68 * 60 * 60 * 1000)), // 68 hours ago
    outcome: 'WIN',
    notes: 'New York Session Open. Distribution phase on M15 chart.'
  }
];

const INITIAL_LEVELS: MarkerLevel[] = [
  {
    id: 'lvl-1',
    type: 'OB_BEARISH',
    price: 2442.50,
    label: 'Bearish OB (H4)',
    description: 'Fresh H4 Order Block starting point of NY distribution drive.'
  },
  {
    id: 'lvl-2',
    type: 'BSL',
    price: 2448.00,
    label: 'Buy-Side Liquidity (Daily High)',
    description: 'High liquidity cluster above equal daily peaks.'
  },
  {
    id: 'lvl-3',
    type: 'FVG',
    price: 2431.20,
    label: 'Fair Value Gap (H1)',
    description: 'Inefficiency range waiting for price mitigation.'
  },
  {
    id: 'lvl-4',
    type: 'OB_BULLISH',
    price: 2412.80,
    label: 'Bullish OB (H1)',
    description: 'Strong buying block from London session breakout.'
  },
  {
    id: 'lvl-5',
    type: 'SSL',
    price: 2398.50,
    label: 'Sell-Side Liquidity (Weekly Low)',
    description: 'Important liquidity pool representing strong support zones.'
  }
];

const DEFAULT_SETTINGS: UserSettings = {
  notifications: true,
  soundEnabled: true,
  language: 'fa',
  theme: 'dark',
  riskTolerance: 'medium'
};

const DEFAULT_PROFILE: UserProfile = {
  fullName: '',
  email: '',
  experience: 'intermediate',
  capital: 'under10k',
  subscriptionTier: 'free',
  activationKey: '',
  isActivated: false
};

// Local storage management module
export const StorageManager = {
  getSignals(): Signal[] {
    const saved = localStorage.getItem('onigama_signals');
    if (!saved) {
      const initial = getInitialSignals();
      localStorage.setItem('onigama_signals', JSON.stringify(initial));
      return initial;
    }
    try {
      let signals: Signal[] = JSON.parse(saved);
      // Auto-migrate if the stored signals contain static old 2026-05-21/19 timestamps
      if (signals.some(s => s.timestamp.startsWith('2026-05-21') || s.timestamp.startsWith('2026-05-19') || s.timestamp.startsWith('2026-05-20'))) {
        const fresh = getInitialSignals();
        localStorage.setItem('onigama_signals', JSON.stringify(fresh));
        return fresh;
      }
      return signals;
    } catch {
      const fresh = getInitialSignals();
      localStorage.setItem('onigama_signals', JSON.stringify(fresh));
      return fresh;
    }
  },

  saveSignals(signals: Signal[]) {
    localStorage.setItem('onigama_signals', JSON.stringify(signals));
  },

  getTrades(): Trade[] {
    const saved = localStorage.getItem('onigama_trades');
    if (!saved) {
      const initial = getInitialTrades();
      localStorage.setItem('onigama_trades', JSON.stringify(initial));
      return initial;
    }
    try {
      let trades: Trade[] = JSON.parse(saved);
      // Auto-migrate if the stored trades contain old hardcoded Persian dates
      if (trades.some(t => t.date.includes('۱۴۰۵/۰۳/۰۱') || t.date.includes('۱۴۰۵/۰۲/'))) {
        const fresh = getInitialTrades();
        localStorage.setItem('onigama_trades', JSON.stringify(fresh));
        return fresh;
      }
      return trades;
    } catch {
      const fresh = getInitialTrades();
      localStorage.setItem('onigama_trades', JSON.stringify(fresh));
      return fresh;
    }
  },

  saveTrades(trades: Trade[]) {
    localStorage.setItem('onigama_trades', JSON.stringify(trades));
  },

  getLevels(): MarkerLevel[] {
    return INITIAL_LEVELS;
  },

  getSettings(): UserSettings {
    const saved = localStorage.getItem('onigama_settings');
    if (!saved) {
      localStorage.setItem('onigama_settings', JSON.stringify(DEFAULT_SETTINGS));
      return DEFAULT_SETTINGS;
    }
    try {
      return JSON.parse(saved);
    } catch {
      return DEFAULT_SETTINGS;
    }
  },

  saveSettings(settings: UserSettings) {
    localStorage.setItem('onigama_settings', JSON.stringify(settings));
  },

  getProfile(): UserProfile {
    const saved = localStorage.getItem('onigama_profile');
    if (!saved) {
      localStorage.setItem('onigama_profile', JSON.stringify(DEFAULT_PROFILE));
      return DEFAULT_PROFILE;
    }
    try {
      return JSON.parse(saved);
    } catch {
      return DEFAULT_PROFILE;
    }
  },

  saveProfile(profile: UserProfile) {
    localStorage.setItem('onigama_profile', JSON.stringify(profile));
  },

  getStats(trades: Trade[]): MarketStats {
    const tradesCount = trades.length;
    if (tradesCount === 0) {
      return { tradesCount: 0, winRate: 0, totalProfit: 0, winCount: 0, lossCount: 0 };
    }
    const wins = trades.filter(t => t.outcome === 'WIN');
    const winRate = Math.round((wins.length / tradesCount) * 100);
    const totalProfit = trades.reduce((acc, t) => acc + t.profit, 0);

    return {
      tradesCount,
      winRate,
      totalProfit,
      winCount: wins.length,
      lossCount: tradesCount - wins.length
    };
  }
};
