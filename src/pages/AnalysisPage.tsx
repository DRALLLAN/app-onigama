import React, { useState, useEffect } from 'react';
import { useGoldPrice } from '../hooks/useGoldPrice';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Layers, 
  HelpCircle, 
  Lock, 
  Sparkles, 
  TrendingUp, 
  TrendingDown, 
  Activity, 
  ChevronRight, 
  Compass, 
  Tag, 
  Target,
  Zap,
  Calculator,
  Percent,
  Coins,
  Scale,
  DollarSign,
  RefreshCw,
  BookOpen,
  X
} from 'lucide-react';
import { TradingViewWidget } from '../components/TradingViewWidget';
import { StorageManager } from '../services/api';

interface AnalysisPageProps {
  language: 'fa' | 'en';
  onNavigate?: (tab: string) => void;
}

type Timeframe = '1m' | '5m' | '15m' | '1h' | '4h' | '1d';

// Map symbol identifier to TV's standard product ticker
const getTradingViewSymbol = (sym: string): string => {
  const mapping: Record<string, string> = {
    'XAUUSD': 'OANDA:XAUUSD',
    'XAGUSD': 'OANDA:XAGUSD',
    'BTCUSD': 'BINANCE:BTCUSDT',
    'ETHUSD': 'BINANCE:ETHUSDT',
    'EURUSD': 'OANDA:EURUSD',
    'GBPUSD': 'OANDA:GBPUSD',
    'USDJPY': 'OANDA:USDJPY',
    'AUDUSD': 'OANDA:AUDUSD',
    'US30': 'FOREXCOM:DJI',
    'NAS100': 'FOREXCOM:NDX',
    'OIL': 'TVC:UKOIL'
  };
  return mapping[sym] || sym;
};

// Map timeframes to standard TradingView Widget intervals
const mapTimeframeToTvInterval = (tf: Timeframe): string => {
  if (tf === '1m') return '1';
  if (tf === '5m') return '5';
  if (tf === '15m') return '15';
  if (tf === '1h') return '60';
  if (tf === '4h') return '240';
  if (tf === '1d') return 'D';
  return '15';
};

export function AnalysisPage({ language, onNavigate }: AnalysisPageProps) {
  const { assets } = useGoldPrice(4);
  const [selectedSymbol, setSelectedSymbolState] = useState(() => StorageManager.getSelectedSymbol());
  
  const setSelectedSymbol = (symbol: string) => {
    setSelectedSymbolState(symbol);
    StorageManager.saveSelectedSymbol(symbol);
  };
  
  const activeAsset = assets.find(a => a.symbol === selectedSymbol) || assets[0];
  const { price } = activeAsset;

  const [timeframe, setTimeframe] = useState<Timeframe>('15m');
  const [activeStrategy, setActiveStrategy] = useState<'SMC' | 'LIT'>('SMC');
  const [hoveredLevelId, setHoveredLevelId] = useState<string | null>(null);
  const [showEduHandbook, setShowEduHandbook] = useState<boolean>(false);
  const [eduActiveTab, setEduActiveTab] = useState<'smc' | 'lit' | 'risk'>('smc');

  const [profile, setProfile] = useState(() => StorageManager.getProfile());
  const isVip = profile.isActivated && (profile.subscriptionTier === 'vip' || profile.subscriptionTier === 'premium');

  // Master Position Size, Lot, and Profit/Loss Calculator States
  const [calcBalance, setCalcBalance] = useState<number>(10000);
  const [calcRiskPercent, setCalcRiskPercent] = useState<number>(1);
  const [calcEntryPrice, setCalcEntryPrice] = useState<string>('');
  const [calcStopLoss, setCalcStopLoss] = useState<string>('');
  const [calcTakeProfit, setCalcTakeProfit] = useState<string>('');
  const [calcDirection, setCalcDirection] = useState<'buy' | 'sell'>('buy');

  // Trigger sync of active symbol price only on symbol or direction changes to preserve typing state
  useEffect(() => {
    if (price) {
      setCalcEntryPrice(price.toString());
      const decimals = getDecimalsForSymbol(selectedSymbol);
      
      let slOffset = 0.01; // default 1%
      let tpOffset = 0.02; // default 2%
      
      if (selectedSymbol === 'XAUUSD') {
        slOffset = 0.004; // ~$10 for gold
        tpOffset = 0.008; // ~$20 for gold
      } else if (selectedSymbol === 'BTCUSD') {
        slOffset = 0.02; // 2%
        tpOffset = 0.05; // 5%
      } else if (selectedSymbol === 'US30' || selectedSymbol === 'NAS100') {
        slOffset = 0.005; // 0.5%
        tpOffset = 0.015; // 1.5%
      } else if (selectedSymbol === 'OIL') {
        slOffset = 0.015; // 1.5%
        tpOffset = 0.03; // 3%
      }
      
      const slPrice = calcDirection === 'buy' ? price * (1 - slOffset) : price * (1 + slOffset);
      const tpPrice = calcDirection === 'buy' ? price * (1 + tpOffset) : price * (1 - tpOffset);
      setCalcStopLoss(slPrice.toFixed(decimals));
      setCalcTakeProfit(tpPrice.toFixed(decimals));
    }
  }, [selectedSymbol, calcDirection]);

  const syncWithLivePrice = () => {
    if (price) {
      setCalcEntryPrice(price.toString());
      const decimals = getDecimalsForSymbol(selectedSymbol);
      let slOffset = 0.01;
      let tpOffset = 0.02;
      if (selectedSymbol === 'XAUUSD') {
        slOffset = 0.004;
        tpOffset = 0.008;
      } else if (selectedSymbol === 'BTCUSD') {
        slOffset = 0.02;
        tpOffset = 0.05;
      }
      const slPrice = calcDirection === 'buy' ? price * (1 - slOffset) : price * (1 + slOffset);
      const tpPrice = calcDirection === 'buy' ? price * (1 + tpOffset) : price * (1 - tpOffset);
      setCalcStopLoss(slPrice.toFixed(decimals));
      setCalcTakeProfit(tpPrice.toFixed(decimals));
    }
  };

  useEffect(() => {
    setProfile(StorageManager.getProfile());
  }, []);

  const getLITLevelsForAsset = (sym: string, spotPrice: number) => {
    return [
      {
        id: 'lit-1',
        type: 'LIT_TRAP',
        price: +(spotPrice * 1.0055).toFixed(sym === 'EURUSD' || sym === 'GBPUSD' || sym === 'AUDUSD' || sym === 'USDCAD' ? 4 : 2),
        label: language === 'fa' ? 'تله القایی خریداران (LIT Trap)' : 'Retail Breakout Trap (LIT)',
        description: language === 'fa'
          ? 'محدوده نقدینگی مهندسی‌شده برای به دام انداختن خریداران عجول در سقف سشن.'
          : 'Engineered liquidity trap built to induce breakout buyers before a sharp reversal.',
        volProfile: 'High Density (85k Lots)',
        status: 'ACTIVE TRAP'
      },
      {
        id: 'lit-2',
        type: 'IDM_HIGH',
        price: +(spotPrice * 1.0022).toFixed(sym === 'EURUSD' || sym === 'GBPUSD' || sym === 'AUDUSD' || sym === 'USDCAD' ? 4 : 2),
        label: language === 'fa' ? 'القاء نزولی (Inducement High)' : 'Bearish Inducement (LIT IDM)',
        description: language === 'fa'
          ? 'نقطه القاء فروشندگان خرد برای ورود زودهنگام به پوزیشن فروش قبل از سوئیپ اصلی.'
          : 'High inducement level attracting early retail sellers prior to the real sweep.',
        volProfile: 'Moderate (42k Lots)',
        status: 'UNMITIGATED'
      },
      {
        id: 'lit-3',
        type: 'ENG_LIQ',
        price: +(spotPrice * 1.0005).toFixed(sym === 'EURUSD' || sym === 'GBPUSD' || sym === 'AUDUSD' || sym === 'USDCAD' ? 4 : 2),
        label: language === 'fa' ? 'نقدینگی مهندسی شده (Engineered Liq)' : 'Engineered Liquidity (EQH)',
        description: language === 'fa'
          ? 'ترکیب سقف‌های برابر (Equal Highs) که بهعنوان آهنربای جذب سفارشات موسسات عمل می‌کند.'
          : 'Double highs structures creating a massive liquidity pool for institutional sweeps.',
        volProfile: 'Extremely Heavy (124k Lots)',
        status: 'IMMEDIATE GAIN'
      },
      {
        id: 'lit-4',
        type: 'IDM_LOW',
        price: +(spotPrice * 0.9978).toFixed(sym === 'EURUSD' || sym === 'GBPUSD' || sym === 'AUDUSD' || sym === 'USDCAD' ? 4 : 2),
        label: language === 'fa' ? 'القاء صعودی (Inducement Low)' : 'Bullish Inducement (LIT IDM)',
        description: language === 'fa'
          ? 'القای معامله‌گران به خرید زودرس در محدوده حمایتی ضعیف کلاسیک پیش از سابیده شدن کف.'
          : 'Low-level inducement to trap early buyers prior to the final stop-loss hunt.',
        volProfile: 'Light Vol (19k Lots)',
        status: 'UNMITIGATED'
      },
      {
        id: 'lit-5',
        type: 'LIT_SWEEP',
        price: +(spotPrice * 0.9925).toFixed(sym === 'EURUSD' || sym === 'GBPUSD' || sym === 'AUDUSD' || sym === 'USDCAD' ? 4 : 2),
        label: language === 'fa' ? 'سوئیپ نقدینگی القایی (Sweep Zone)' : 'Inducement Sweep Zone (SSL)',
        description: language === 'fa'
          ? 'سطح شکار نهایی استاپ‌لاس‌های معامله‌گران سبک کلاسیک جهت تجمیع سفارشات خرید بانک‌های بزرگ.'
          : 'Major stop-loss sweep tier under Liquidity Inducement Theorem to trigger institutional buy orders.',
        volProfile: 'Super-Cluster (240k Lots)',
        status: 'STRONG DEMAND'
      }
    ];
  };

  const getSMCLevelsForAsset = (sym: string, spotPrice: number) => {
    return [
      {
        id: 'lvl-1',
        type: 'OB_BEARISH',
        price: +(spotPrice * 1.0042).toFixed(sym === 'EURUSD' || sym === 'GBPUSD' || sym === 'AUDUSD' || sym === 'USDCAD' ? 4 : 2),
        label: language === 'fa' ? 'بلاک سفارش فروش (H4)' : 'Bearish OB (H4)',
        description: language === 'fa' 
          ? 'بلاک سفارش نزولی قدرتمند مجهز به نقدینگی بالا در سقف تایم فریم.'
          : 'High-probability bearish supply zone with institutional mitigation bias.',
        volProfile: '95k Lots Blocked',
        status: 'UNMITIGATED'
      },
      {
        id: 'lvl-2',
        type: 'BSL',
        price: +(spotPrice * 1.0085).toFixed(sym === 'EURUSD' || sym === 'GBPUSD' || sym === 'AUDUSD' || sym === 'USDCAD' ? 4 : 2),
        label: language === 'fa' ? 'نقدینگی خریداران (سقف روزانه)' : 'Buy-Side Liquidity (Daily High)',
        description: language === 'fa'
          ? 'استخر نقدینگی خرید فعال واقع در بالای اوج قیمت امروز.'
          : 'Buy stops cluster indicating potential stop-run or breakout zone.',
        volProfile: 'Active Pool (110k Lots)',
        status: 'HIGH INTENSITY'
      },
      {
        id: 'lvl-3',
        type: 'FVG',
        price: +(spotPrice * 1.0015).toFixed(sym === 'EURUSD' || sym === 'GBPUSD' || sym === 'AUDUSD' || sym === 'USDCAD' ? 4 : 2),
        label: language === 'fa' ? 'شکاف ارزش منصفانه (H1)' : 'Fair Value Gap (H1)',
        description: language === 'fa'
          ? 'ناکارآمدی قیمتی برجا مانده از حرکت پرشتاب بازار صعودی.'
          : 'Inefficient price delivery zone that acts as a physical magnet.',
        volProfile: 'Gap Size: 12.5 Pips',
        status: 'IMBALANCE'
      },
      {
        id: 'lvl-4',
        type: 'OB_BULLISH',
        price: +(spotPrice * 0.9958).toFixed(sym === 'EURUSD' || sym === 'GBPUSD' || sym === 'AUDUSD' || sym === 'USDCAD' ? 4 : 2),
        label: language === 'fa' ? 'بلاک سفارش خرید (H1)' : 'Bullish OB (H1)',
        description: language === 'fa'
          ? 'بستر انباشت خرید بزرگ موسساتی مناسب برای اردرگذاری مجدد.'
          : 'Premium institutional buying tier aligned with discount zone.',
        volProfile: '142k Institutional Lots',
        status: 'KEY DECISION BAR'
      },
      {
        id: 'lvl-5',
        type: 'SSL',
        price: +(spotPrice * 0.9902).toFixed(sym === 'EURUSD' || sym === 'GBPUSD' || sym === 'AUDUSD' || sym === 'USDCAD' ? 4 : 2),
        label: language === 'fa' ? 'نقدینگی فروشندگان (کف هفتگی)' : 'Sell-Side Liquidity (Weekly Low)',
        description: language === 'fa'
          ? 'سطح کلیدی نقدینگی فروشندگان مستقر در زیر کلاستر حمایتی پهن.'
          : 'Sell stops pool representing heavy sell pressure mitigations.',
        volProfile: 'Active Pool (185k Lots)',
        status: 'CRITICAL SUPPORT'
      }
    ];
  };

  const levels = activeStrategy === 'SMC'
    ? getSMCLevelsForAsset(selectedSymbol, price)
    : getLITLevelsForAsset(selectedSymbol, price);

  const getDecimalsForSymbol = (sym: string) => {
    return sym === 'EURUSD' || sym === 'GBPUSD' || sym === 'AUDUSD' || sym === 'USDCAD' ? 4 : (sym === 'USDJPY' ? 2 : (sym === 'BTCUSD' || sym === 'US30' || sym === 'NAS100' ? 0 : 2));
  };

  const formatValue = (val: number, sym: string) => {
    const isFx = sym === 'EURUSD' || sym === 'GBPUSD' || sym === 'AUDUSD' || sym === 'USDCAD' || sym === 'USDJPY';
    const decs = getDecimalsForSymbol(sym);
    if (isFx) {
      return val.toFixed(decs);
    }
    return '$' + val.toLocaleString(undefined, { minimumFractionDigits: decs, maximumFractionDigits: decs });
  };

  // LOT SIZE & POSITION CALCULATOR CALCULATIONS
  const numEntry = parseFloat(calcEntryPrice) || price || 0;
  const numSL = parseFloat(calcStopLoss) || 0;
  const numTP = parseFloat(calcTakeProfit) || 0;

  const calcRiskAmountEx = (calcBalance * calcRiskPercent) / 100;
  const isCalcBuy = calcDirection === 'buy';
  const calcSlDiff = isCalcBuy ? numEntry - numSL : numSL - numEntry;
  const calcTpDiff = isCalcBuy ? numTP - numEntry : numEntry - numTP;

  // Lot multipliers depending on symbol type
  let calcLotMultiplier = 100000;
  if (selectedSymbol === 'XAUUSD') {
    calcLotMultiplier = 100; 
  } else if (selectedSymbol === 'XAGUSD') {
    calcLotMultiplier = 5000;
  } else if (selectedSymbol === 'USDJPY') {
    calcLotMultiplier = 1000;
  } else if (selectedSymbol === 'BTCUSD' || selectedSymbol === 'ETHUSD') {
    calcLotMultiplier = 1;
  } else if (selectedSymbol === 'US30' || selectedSymbol === 'NAS100') {
    calcLotMultiplier = 1;
  } else if (selectedSymbol === 'OIL') {
    calcLotMultiplier = 1000;
  }

  // Position lot sizing
  let calcFormattedLots = '0.00';
  if (calcSlDiff > 0) {
    const rawLots = calcRiskAmountEx / (calcSlDiff * calcLotMultiplier);
    calcFormattedLots = rawLots >= 0.01 ? rawLots.toFixed(2) : rawLots.toFixed(4);
  }

  // Pips Conversion
  let calcSlPips = 0;
  let calcTpPips = 0;
  if (selectedSymbol === 'XAUUSD' || selectedSymbol === 'XAGUSD') {
    calcSlPips = Math.round(calcSlDiff * 10);
    calcTpPips = Math.round(calcTpDiff * 10);
  } else if (selectedSymbol === 'EURUSD' || selectedSymbol === 'GBPUSD' || selectedSymbol === 'AUDUSD' || selectedSymbol === 'USDCAD') {
    calcSlPips = Math.round(calcSlDiff * 10000);
    calcTpPips = Math.round(calcTpDiff * 10000);
  } else if (selectedSymbol === 'USDJPY') {
    calcSlPips = Math.round(calcSlDiff * 100);
    calcTpPips = Math.round(calcTpDiff * 100);
  } else {
    // Other assets (BTC, Indices, Oil etc)
    calcSlPips = Math.round(calcSlDiff);
    calcTpPips = Math.round(calcTpDiff);
  }

  const calcPotentialProfitEx = calcTpDiff * calcLotMultiplier * (parseFloat(calcFormattedLots) || 0);
  const calcRrRatio = calcSlDiff > 0 && calcTpDiff > 0 ? (calcTpDiff / calcSlDiff).toFixed(2) : '0.00';
  const calcReturnPercentage = calcBalance > 0 ? (calcPotentialProfitEx / calcBalance) * 100 : 0;

  return (
    <div className="space-y-8 pb-20 select-none font-sans overflow-hidden">
      
      {/* HEADER SECTION WITH MODERN GLASS NESTING */}
      <div className="p-6 md:p-8 rounded-3xl border border-white/5 bg-[#0b1424]/40 backdrop-blur-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-6 shadow-xl relative" dir={language === 'fa' ? 'rtl' : 'ltr'}>
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className={`h-2.5 w-2.5 rounded-full ${activeStrategy === 'SMC' ? 'bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]' : 'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]'}`}></span>
            <span className="text-[10px] font-bold tracking-widest text-slate-400 uppercase font-mono">
              {activeStrategy === 'SMC' ? 'SMART MONEY CONCEPTS (SMC)' : 'LIQUIDITY INDUCEMENT THEOREM (LIT)'}
            </span>
          </div>
          <h1 className="text-xl md:text-2xl font-black text-white tracking-tight leading-none leading-relaxed">
            {activeStrategy === 'SMC' ? (
              language === 'fa' ? `ترسیم فنی ساختار بازار SMC (${activeAsset.symbol})` : `SMC Market Structure Mapping (${activeAsset.symbol})`
            ) : (
              language === 'fa' ? `تحلیل نقدینگی و هانت پیشرفته LIT (${activeAsset.symbol})` : `LIT Algorithmic Inducement (${activeAsset.symbol})`
            )}
          </h1>
          <p className="text-xs text-slate-400 font-medium">
            {activeStrategy === 'SMC' ? (
              language === 'fa' 
                ? `شناسایی نواحی تقاضا، عرضه و بلاک‌های سفارش معتبر برای ${activeAsset.nameFa}` 
                : `Precision supply/demand order blocks with real-time volatility estimates for ${activeAsset.name}`
            ) : (
              language === 'fa'
                ? `نقشه‌برداری سطوح فریب خرده‌پاها و پوزیشن‌های القایی برای ${activeAsset.nameFa}`
                : `Engineered breakout traps and liquidity inducement boundaries for ${activeAsset.name}`
            )}
          </p>
        </div>
        
        <div className="shrink-0 font-mono text-right flex flex-col items-start md:items-end justify-center p-4 rounded-2xl bg-white/[0.02] border border-white/5 min-w-[140px] shadow-inner">
          <span className="text-[10px] text-slate-400 font-sans font-semibold tracking-wider uppercase mb-1 flex items-center gap-1.5 self-start md:self-auto">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-ping inline-block"></span>
            Spot live ticker
          </span>
          <span className="text-lg font-black text-yellow-400 tracking-wider">
            {formatValue(price, selectedSymbol)}
          </span>
          <span className={`text-[10px] font-bold ${activeAsset.change24h >= 0 ? 'text-emerald-400' : 'text-rose-400'} mt-0.5`}>
            {activeAsset.change24h >= 0 ? '▲' : '▼'} {activeAsset.change24h}%
          </span>
        </div>
      </div>

      {/* RESPONSIVE TERMINAL GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* LEFT COLUMN: Chart switcher, timeframe, and candlestick board */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* SYMBOL SWITCHER FOR CHART */}
          <div className="space-y-2" dir={language === 'fa' ? 'rtl' : 'ltr'}>
            <div className="flex items-center gap-1.5 justify-between">
              <span className="text-[10px] text-slate-400 block font-bold uppercase tracking-wider">
                {language === 'fa' ? 'دیده بان و انتخاب جفت‌ارز معاملاتی:' : 'Live Asset Tickers Selector:'}
              </span>
              <span className="text-[9px] text-slate-500 font-mono font-medium tracking-widest hidden sm:inline-block">
                TOTAL: {assets.length} TRADABLES
              </span>
            </div>
            
            {/* Horizontal scrollable glass bar for active assets with detailed layout */}
            <div className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-4 xl:grid-cols-6 gap-2">
              {assets.map(asset => {
                const isSel = asset.symbol === selectedSymbol;
                const isPositive = asset.change24h >= 0;
                
                return (
                  <button
                    key={asset.symbol}
                    type="button"
                    onClick={() => {
                      setSelectedSymbol(asset.symbol);
                    }}
                    className={`p-2.5 rounded-2xl flex flex-col items-center justify-center transition-all cursor-pointer relative ${
                      isSel
                        ? 'bg-gradient-to-b from-blue-700/80 to-blue-900/80 border border-blue-500 text-white shadow-lg shadow-blue-500/10'
                        : 'bg-[#09101b]/50 hover:bg-[#0e1726]/80 text-slate-400 hover:text-slate-200 border border-white/5 hover:border-white/10'
                    }`}
                  >
                    <span className="text-xs font-mono font-extrabold tracking-tight">
                      {asset.symbol}
                    </span>
                    <span className="text-[9px] font-mono mt-1 font-bold text-slate-300">
                      {asset.price.toLocaleString(undefined, { maximumFractionDigits: asset.symbol.includes('JPY') ? 2 : 1 })}
                    </span>
                    
                    {/* Live tiny visual trend chip */}
                    <span className={`text-[8px] font-mono font-bold px-1 rounded-md mt-1 ${
                      isPositive ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'
                    }`}>
                      {isPositive ? '+' : ''}{asset.change24h}%
                    </span>

                    {isSel && (
                      <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-4 h-1 bg-sky-400 rounded-full" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* TIMEFRAME SELECTOR PILLS */}
          <div className="flex bg-[#050b13]/80 border border-white/5 p-1 rounded-2xl gap-1">
            {(['1m', '5m', '15m', '1h', '4h', '1d'] as Timeframe[]).map((tf) => (
              <button
                key={tf}
                type="button"
                onClick={() => setTimeframe(tf)}
                className={`flex-1 py-2 px-1 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer text-center ${
                  timeframe === tf
                    ? 'bg-blue-600 border border-white/10 text-white font-black shadow-lg scale-[1.02]'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                {tf.toUpperCase()}
              </button>
            ))}
          </div>

          {/* CHART CANVAS BOARD */}
          <div className="p-4 sm:p-5 rounded-3xl bg-[#09101b]/40 border border-white/5 relative overflow-hidden backdrop-blur-xl">
            {/* Glowing gradient background behind chart */}
            <div className="absolute top-0 left-0 w-44 h-44 bg-blue-500/5 rounded-full filter blur-2xl pointer-events-none"></div>
            
            <div className="flex justify-between items-center mb-3">
              <div className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-sky-400 animate-pulse"></span>
                <span className="text-[10px] text-sky-400/90 font-mono font-bold">
                  TV DIRECT NODE LINK ACTIVE
                </span>
              </div>
              <div className="bg-white/5 border border-white/5 px-2.5 py-0.5 rounded-lg text-[9px] text-slate-300 font-mono">
                {selectedSymbol} • {language === 'fa' ? 'تایم‌فریم ' + timeframe : timeframe + ' TIMEFRAME'}
              </div>
            </div>

            <div className="w-full relative z-0 h-[360px] rounded-2xl overflow-hidden border border-white/5">
              <TradingViewWidget
                symbol={getTradingViewSymbol(selectedSymbol)}
                interval={mapTimeframeToTvInterval(timeframe)}
              />
            </div>
          </div>

          {/* DYNAMIC PREMIUM LOT & POSITION SIZE CALCULATOR */}
          <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-tr from-slate-900/60 via-[#0d141e]/50 to-[#0a1b24]/40 border border-white/5 relative overflow-hidden backdrop-blur-xl space-y-5" dir={language === 'fa' ? 'rtl' : 'ltr'}>
            <div className="absolute top-0 left-0 w-32 h-32 bg-amber-500/[0.02] rounded-full filter blur-2xl pointer-events-none" />
            <div className="absolute -bottom-10 -right-10 w-44 h-44 bg-blue-500/[0.015] rounded-full filter blur-3xl pointer-events-none" />

            {/* Header */}
            <div className="flex justify-between items-center pb-3 border-b border-white/5">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-500">
                  <Calculator className="w-4 h-4 text-amber-400" />
                </div>
                <div>
                  <h3 className="text-xs font-black text-white tracking-wide uppercase">
                    {language === 'fa' ? 'محاسبه‌گر حرفه‌ای لات خط‌مشی و مدیریت ریسک' : 'Premium Risk & Position Size Calculator'}
                  </h3>
                  <p className="text-[9px] text-slate-400 font-medium">
                    {language === 'fa' ? 'همگام‌سازی هوشمند با مشخصات هر دارایی معاملاتی' : 'Auto-tailored to contract specs of selected ticker'}
                  </p>
                </div>
              </div>
              <button 
                type="button"
                onClick={() => syncWithLivePrice()}
                className="p-1.5 hover:bg-white/5 rounded-lg text-slate-400 hover:text-white transition-all border border-white/5 flex items-center gap-1 text-[9px] font-bold cursor-pointer"
                title={language === 'fa' ? 'همگام‌سازی قیمت با بازار لایو' : 'Sync to live price'}
              >
                <RefreshCw className="w-3 h-3 text-sky-400" />
                <span>{language === 'fa' ? 'زنده' : 'Live'}</span>
              </button>
            </div>

            {/* Direction Tab Switcher */}
            <div className="grid grid-cols-2 p-1 bg-[#050b13]/80 border border-white/5 rounded-xl gap-1">
              <button
                type="button"
                onClick={() => setCalcDirection('buy')}
                className={`py-1.5 rounded-lg text-[10px] sm:text-[11px] font-extrabold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  calcDirection === 'buy'
                    ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-black shadow-[0_0_12px_rgba(16,185,129,0.1)]'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <TrendingUp className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-emerald-400 shrink-0" />
                <span>{language === 'fa' ? 'خرید (BUY / LONG)' : 'BUY (Long)'}</span>
              </button>
              <button
                type="button"
                onClick={() => setCalcDirection('sell')}
                className={`py-1.5 rounded-lg text-[10px] sm:text-[11px] font-extrabold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  calcDirection === 'sell'
                    ? 'bg-rose-500/15 text-rose-450 border border-rose-500/30 font-black shadow-[0_0_12px_rgba(239,68,68,0.1)]'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <TrendingDown className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-rose-400 shrink-0" />
                <span>{language === 'fa' ? 'فروش (SELL / SHORT)' : 'SELL (Short)'}</span>
              </button>
            </div>

            {/* Input Controls Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {/* Balances & Risk */}
              <div className="space-y-3 p-3.5 bg-white/2 rounded-2xl border border-white/5">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-300 flex items-center gap-1 text-right">
                    <span>{language === 'fa' ? 'موجودی حساب (دلار):' : 'Account Balance (USD):'}</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[10px] text-slate-500 font-mono font-bold">$</span>
                    <input 
                      type="number" 
                      value={calcBalance}
                      onChange={(e) => setCalcBalance(Math.max(0, parseFloat(e.target.value) || 0))}
                      className="w-full bg-[#050b13]/80 border border-white/10 rounded-xl py-1.5 pl-7 pr-3 text-xs font-mono text-white text-left focus:outline-none focus:border-amber-500/40"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-300 flex justify-between items-center text-right">
                    <span>{language === 'fa' ? 'درصد ریسک معامله (%)' : 'Risk Percentage:'}</span>
                    <span className="text-[9px] font-mono font-extrabold text-[#6f87a0]">{calcRiskPercent}%</span>
                  </label>
                  <div className="flex gap-2 items-center">
                    <input 
                      type="range" 
                      min="0.1" 
                      max="10" 
                      step="0.1"
                      value={calcRiskPercent}
                      onChange={(e) => setCalcRiskPercent(parseFloat(e.target.value) || 1)}
                      className="flex-1 accent-amber-500 bg-[#050b13] h-1 rounded-lg outline-none cursor-pointer"
                    />
                    <input 
                      type="number" 
                      value={calcRiskPercent}
                      step="0.1"
                      min="0.1" 
                      onChange={(e) => setCalcRiskPercent(Math.max(0.1, parseFloat(e.target.value) || 1))}
                      className="w-14 bg-[#050b13]/80 border border-white/10 rounded-lg py-1 text-center text-xs font-mono text-white focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Trade Settings Prices */}
              <div className="space-y-3 p-3.5 bg-white/2 rounded-2xl border border-white/5">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-300 flex justify-between items-center text-right">
                    <span>{language === 'fa' ? 'قیمت ورود:' : 'Entry Price:'}</span>
                    <span className="text-[8px] font-semibold text-slate-500 uppercase font-mono">{selectedSymbol} specs</span>
                  </label>
                  <input 
                    type="number" 
                    step="0.0001"
                    value={calcEntryPrice}
                    onChange={(e) => setCalcEntryPrice(e.target.value)}
                    placeholder={price.toString()}
                    className="w-full bg-[#050b13]/80 border border-white/10 rounded-xl py-1.5 px-3 text-xs font-mono text-white text-left focus:outline-none focus:border-amber-500/40"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-300 flex items-center gap-1 text-right">
                      <span className="w-1.5 h-1.5 rounded-full bg-rose-500 inline-block shrink-0" />
                      <span>{language === 'fa' ? 'حد ضرر (SL):' : 'Stop Loss (SL):'}</span>
                    </label>
                    <input 
                      type="number" 
                      step="0.0001"
                      value={calcStopLoss}
                      onChange={(e) => setCalcStopLoss(e.target.value)}
                      className="w-full bg-[#050b13]/80 border border-white/10 rounded-xl py-1.5 px-2.5 text-xs font-mono text-white text-left focus:outline-none focus:border-rose-500/30"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-300 flex items-center gap-1 text-right">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block shrink-0" />
                      <span>{language === 'fa' ? 'حد سود (TP):' : 'Take Profit (TP):'}</span>
                    </label>
                    <input 
                      type="number" 
                      step="0.0001"
                      value={calcTakeProfit}
                      onChange={(e) => setCalcTakeProfit(e.target.value)}
                      className="w-full bg-[#050b13]/80 border border-white/10 rounded-xl py-1.5 px-2.5 text-xs font-mono text-white text-left focus:outline-none focus:border-emerald-500/30"
                    />
                  </div>
                </div>
              </div>

            </div>

            {/* Calculations Outputs Matrix Card */}
            <div className="p-4 rounded-2xl bg-[#040911]/90 border border-white/5 space-y-4">
              
              {/* Critical Target Lots Showcase */}
              <div className="flex flex-col sm:flex-row justify-between items-center gap-3 bg-gradient-to-tr from-amber-500/[0.03] to-[#6f87a0]/[0.05] p-3.5 rounded-xl border border-amber-500/10">
                <div className="text-center sm:text-right">
                  <span className="text-[9px] text-[#6f87a0] font-black uppercase tracking-wider block">
                    {language === 'fa' ? 'حجم بهینه برای ورود ایمن به پوزیشن' : 'SUGGESTED LOT SIZE FOR SAFE RISK LIMIT'}
                  </span>
                  <span className="text-xs text-slate-200 block font-medium mt-0.5">
                    {language === 'fa' 
                      ? `بابت دارایی ${selectedSymbol} با اهرم پیش‌فرض` 
                      : `Tailored position structure for active ${selectedSymbol}`}
                  </span>
                </div>
                
                <div className="flex items-center gap-2">
                  <div className="px-5 py-2.5 rounded-xl bg-slate-900 border border-amber-500/30 shadow-[0_4px_24px_rgba(245,158,11,0.08)] flex flex-col items-center justify-center">
                    <span className="text-lg font-black text-amber-400 font-mono tracking-wider">{calcFormattedLots}</span>
                    <span className="text-[8px] font-black tracking-widest text-[#6f87a0] uppercase mt-0.5">
                      {language === 'fa' ? 'لات استاندارد' : 'STD LOTS'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Grid 4 pillars */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                
                <div className="p-2.5 rounded-xl bg-white/2 border border-white/5">
                  <span className="text-[9px] text-slate-500 font-bold block">
                    {language === 'fa' ? 'زیان احتمالی (ریسک)' : 'Potential USD Risk'}
                  </span>
                  <span className="text-xs font-mono font-black text-rose-400 block mt-1">
                    -${calcRiskAmountEx.toFixed(1)}
                  </span>
                  <span className="text-[8.5px] font-mono font-semibold text-slate-400 block">
                    {calcRiskPercent}% {language === 'fa' ? 'موجودی' : 'account'}
                  </span>
                </div>

                <div className="p-2.5 rounded-xl bg-white/2 border border-white/5">
                  <span className="text-[9px] text-slate-500 font-bold block">
                    {language === 'fa' ? 'سود احتمالی (ریوارد)' : 'Potential USD Reward'}
                  </span>
                  <span className="text-xs font-mono font-black text-emerald-400 block mt-1">
                    +${calcPotentialProfitEx.toLocaleString(undefined, { maximumFractionDigits: 1 })}
                  </span>
                  <span className="text-[8.5px] font-mono font-semibold text-slate-400 block">
                    {calcReturnPercentage.toFixed(1)}% {language === 'fa' ? 'رشد' : 'growth'}
                  </span>
                </div>

                <div className="p-2.5 rounded-xl bg-white/2 border border-white/5">
                  <span className="text-[9px] text-slate-500 font-bold block font-mono">
                    {language === 'fa' ? 'نسبت ریسک/ریوارد' : 'Risk/Reward Ratio'}
                  </span>
                  <span className={`text-xs font-mono font-black block mt-1 ${parseFloat(calcRrRatio) >= 1.5 ? 'text-indigo-400' : 'text-slate-200'}`}>
                    1 : {calcRrRatio}
                  </span>
                  <span className="text-[8.5px] font-bold text-slate-500 block">
                    {parseFloat(calcRrRatio) >= 1.5 ? (language === 'fa' ? '🎯 عالی' : '🎯 IDEAL') : (language === 'fa' ? '⚠️ ریسکی' : '⚠️ HIGH RISK')}
                  </span>
                </div>

                <div className="p-2.5 rounded-xl bg-white/2 border border-white/5">
                  <span className="text-[9px] text-slate-500 font-bold block">
                    {language === 'fa' ? 'فاصله حد ضرر (پیپ)' : 'SL Distance (Pips)'}
                  </span>
                  <span className="text-xs font-mono font-black text-slate-200 block mt-1">
                    {calcSlPips} {language === 'fa' ? 'پیپ' : 'Pips'}
                  </span>
                  <span className="text-[8.5px] font-bold text-slate-500 block">
                    TP: {calcTpPips} {language === 'fa' ? 'پیپ' : 'Pips'}
                  </span>
                </div>

              </div>

            </div>
          </div>

        </div>

        {/* RIGHT COLUMN: SMC / LIT Levels & Technical Guideline details */}
        <div className="lg:col-span-5 space-y-6">

          {/* STRATEGY SWITCHER (SMC / LIT) */}
          <div className="space-y-4" dir={language === 'fa' ? 'rtl' : 'ltr'}>
            <span className="text-[10px] text-slate-400 block font-bold uppercase tracking-wider">
              {language === 'fa' ? 'انتخاب متدولوژی پیاده‌سازی نقشه سطوح:' : 'Analytical Methodology:'}
            </span>
            <div className="grid grid-cols-2 bg-[#050b13]/80 border border-white/5 p-1 rounded-2xl gap-1">
              <button
                type="button"
                onClick={() => {
                  setActiveStrategy('SMC');
                  setHoveredLevelId(null);
                }}
                className={`py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeStrategy === 'SMC'
                    ? 'bg-blue-600 text-white shadow-xl font-extrabold'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                {language === 'fa' ? 'مفاهیم پول هوشمند (SMC)' : 'Smart Money (SMC)'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setActiveStrategy('LIT');
                  setHoveredLevelId(null);
                }}
                className={`py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer relative ${
                  activeStrategy === 'LIT'
                    ? 'bg-amber-600 text-slate-950 font-black shadow-xl ring-2 ring-amber-500/20'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                {language === 'fa' ? 'تئوری القاء نقدینگی (LIT)' : 'Liquidity Theory (LIT)'}
                {!isVip && (
                  <span className="absolute -top-1.5 -right-1.5 h-4 px-1 rounded-md bg-amber-500 text-[8px] text-slate-950 font-black tracking-widest flex items-center justify-center border border-slate-900 uppercase">
                    VIP
                  </span>
                )}
              </button>
            </div>

            <div className="flex items-center gap-2 flex-row-reverse md:flex-row justify-between">
              <div className="flex items-center gap-2">
                <Layers className={`w-4 h-4 ${activeStrategy === 'SMC' ? 'text-blue-500' : 'text-amber-500'}`} />
                <h2 className="text-sm font-black text-white tracking-tight uppercase">
                  {activeStrategy === 'SMC' ? (
                    language === 'fa' ? `کلاستر سطوح و اردر بلاک‌های فعال` : `Smart Money Order Clusters`
                  ) : (
                    language === 'fa' ? `استخرهای القایی و سطوح شکار نقدینگی` : `LIT Inducement & Sweeps Mappings`
                  )}
                </h2>
              </div>
              <span className="text-[10px] text-slate-500 font-mono uppercase bg-white/5 px-2 py-0.5 rounded">
                {levels.length} levels
              </span>
            </div>
          </div>

          {/* WRAP IN ACTIVE RELATIVE SUBSCRIPTION PROTECTION CONTAINER */}
          <div className="relative">
            {activeStrategy === 'LIT' && !isVip && (
              <div className="absolute inset-0 z-20 backdrop-blur-md bg-[#050b13]/90 border border-amber-500/20 rounded-3xl p-6 flex flex-col justify-center items-center text-center space-y-4 shadow-2xl">
                <div className="p-3 bg-amber-500/10 border border-amber-500/20 text-amber-500 rounded-2xl animate-pulse">
                  <Lock className="w-6 h-6 text-amber-400" />
                </div>
                <div className="space-y-1.5 max-w-[290px]">
                  <h3 className="text-xs font-black text-amber-400 flex items-center gap-1.5 justify-center uppercase font-mono tracking-widest">
                    <Sparkles className="w-4 h-4 text-amber-400 animate-spin" />
                    <span>{language === 'fa' ? 'نسخه ویژه اونیگاما (VIP)' : 'Onigama VIP Premium'}</span>
                  </h3>
                  <p className="text-[11px] text-slate-300 leading-relaxed font-sans font-medium">
                    {language === 'fa' 
                      ? 'دسترسی فعال به تئوری القای نقدینگی و تله‌های هوشمند LIT مخصوص اعضای طلایی اونیگاما است. با ثبت لایسنس آزمایشی در تنظیمات فوراً این بخش را فعال کنید!'
                      : 'Liquidity Inducement Theorem structures and advanced stop sweeps are reserved for premium members.'}
                  </p>
                  <p className="text-[10px] text-slate-500 font-sans font-semibold">
                    {language === 'fa'
                      ? '💡 کلیدهای آزمایشی رایگان در صفحه «تنظیمات» درج شده است.'
                      : '💡 Free license keys are provided in the "Settings" tab.'}
                  </p>
                </div>
                {onNavigate && (
                  <button
                    type="button"
                    onClick={() => {
                      onNavigate('settings');
                    }}
                    className="py-3 px-5 bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-400 hover:to-yellow-500 text-slate-950 font-black rounded-xl text-xs transition-all cursor-pointer flex items-center gap-1.5 shadow-xl active:scale-95"
                  >
                    <span>{language === 'fa' ? '🔑 رفتن به فعال‌سازی لایسنس' : '🔑 Grab Activation Key'}</span>
                  </button>
                )}
              </div>
            )}

            <div className={`space-y-4 transition-all duration-300 ${activeStrategy === 'LIT' && !isVip ? 'opacity-10 pointer-events-none filter blur-sm' : ''}`}>
              {/* LEVELS CONTAINER LIST WITH ANIMATION AND PROXIMITY SCALING */}
              <div className="space-y-3" dir={language === 'fa' ? 'rtl' : 'ltr'}>
                <AnimatePresence mode="popLayout" initial={false}>
                  {levels.map((lvl) => {
                    const distance = Math.abs(price - lvl.price);
                    const percentDiff = ((lvl.price - price) / price) * 100;
                    const percentStr = percentDiff > 0 ? `+${percentDiff.toFixed(2)}%` : `${percentDiff.toFixed(2)}%`;
                    const isNear = distance < (price * 0.0035);
                    const isAbove = lvl.price > price;

                    let badgeColor = 'bg-slate-800 text-slate-400';
                    let accentThemeColor = 'border-slate-800';
                    let glowColor = '';
                    
                    if (lvl.type === 'OB_BULLISH' || lvl.type === 'LIT_SWEEP') {
                      badgeColor = 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20';
                      accentThemeColor = 'hover:border-emerald-500/20';
                      glowColor = 'bg-emerald-500/5';
                    } else if (lvl.type === 'OB_BEARISH' || lvl.type === 'LIT_TRAP') {
                      badgeColor = 'bg-rose-500/10 text-rose-400 border border-rose-500/20';
                      accentThemeColor = 'hover:border-rose-500/20';
                      glowColor = 'bg-rose-500/5';
                    } else if (lvl.type === 'FVG' || lvl.type === 'ENG_LIQ') {
                      badgeColor = 'bg-yellow-500/10 text-yellow-500 border border-yellow-500/20';
                      accentThemeColor = 'hover:border-yellow-500/20';
                      glowColor = 'bg-yellow-500/5';
                    } else if (lvl.type === 'BSL' || lvl.type === 'IDM_HIGH') {
                      badgeColor = 'bg-sky-500/10 text-sky-450 border border-sky-500/20';
                      accentThemeColor = 'hover:border-sky-550/20';
                      glowColor = 'bg-sky-500/5';
                    } else {
                      badgeColor = 'bg-purple-500/10 text-purple-400 border border-purple-500/20';
                      accentThemeColor = 'hover:border-purple-500/24';
                      glowColor = 'bg-purple-500/5';
                    }

                    const isHovered = hoveredLevelId === lvl.id;
                    const activeNearBorder = activeStrategy === 'SMC'
                      ? 'border-blue-500/30 shadow-[0_4px_20px_rgba(30,58,138,0.15)] bg-[#0b1424]/40'
                      : 'border-amber-500/30 shadow-[0_4px_20px_rgba(245,158,11,0.12)] bg-[#1c150c]/30';

                    return (
                      <motion.div
                        key={lvl.id}
                        layout="position"
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ type: "spring", stiffness: 450, damping: 30 }}
                        onMouseEnter={() => setHoveredLevelId(lvl.id)}
                        onMouseLeave={() => setHoveredLevelId(null)}
                        className={`p-4 rounded-2xl border transition-all relative overflow-hidden backdrop-blur-xl ${
                          isNear 
                            ? `${activeNearBorder} scale-[1.01]` 
                            : `border-white/5 ${accentThemeColor} bg-[#0b1424]/20 hover:bg-[#0b1424]/40`
                        }`}
                      >
                        {/* Shimmer glowing backdrop for active hover */}
                        {isHovered && (
                          <div className={`absolute inset-0 ${glowColor} backdrop-blur-md transition-all duration-300 pointer-events-none`} />
                        )}

                        <div className="flex justify-between items-start mb-2 relative z-10">
                          <div className="text-right">
                            <span className="text-xs font-mono font-black text-white">
                              {formatValue(lvl.price, selectedSymbol)}
                            </span>
                            <span className={`text-[9px] font-mono block font-bold ${isAbove ? 'text-rose-400' : 'text-emerald-400'}`}>
                              {percentStr} {isAbove ? (language === 'fa' ? 'بالای لایو' : 'above spot') : (language === 'fa' ? 'پایین لایو' : 'below spot')}
                            </span>
                          </div>
                          
                          <div className="flex flex-col items-end gap-1 relative z-10">
                            <span className={`text-[9px] font-black px-2.5 py-0.5 rounded-lg tracking-wider uppercase font-mono ${badgeColor}`}>
                              {lvl.label}
                            </span>
                            {isNear && (
                              <span className={`text-[8px] font-black tracking-widest uppercase ${activeStrategy === 'SMC' ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' : 'text-amber-400 bg-amber-500/10 border-amber-500/20'} px-1.5 py-0.5 rounded-md border animate-pulse`}>
                                {language === 'fa' ? 'در بحران تماس قیمت' : 'PRICE IN ZONE'}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Middle metadata expansion bar */}
                        <div className="flex justify-between items-center text-[9px] text-slate-500 py-1.5 my-1 border-t border-b border-white/5 relative z-10 font-mono font-semibold">
                          <span>VOL: {lvl.volProfile}</span>
                          <span>STATE: {lvl.status}</span>
                        </div>

                        <p className="text-[10.5px] text-slate-400/90 font-sans tracking-wide leading-relaxed mt-2 relative z-10">
                          {lvl.description}
                        </p>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>

              {/* DYNAMIC INFORMATION GUIDELINE */}
              <div className="p-5 bg-white/2 border border-white/5 rounded-3xl space-y-3 text-right relative overflow-hidden backdrop-blur-md group" dir={language === 'fa' ? 'rtl' : 'ltr'}>
                {/* Diagonal background visual */}
                <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/[0.02] group-hover:bg-blue-500/5 rounded-full filter blur-xl transition-all duration-500"></div>

                <div className="flex items-center gap-2 justify-end relative z-10">
                  <span className="text-xs font-black text-slate-200 tracking-wider font-mono">
                    {activeStrategy === 'SMC' ? (
                      language === 'fa' ? 'راهنمای جامع سبک SMC نوین' : 'SMC ADVANCED CONCEPTS GUIDE'
                    ) : (
                      language === 'fa' ? 'راهنمای جامع سبک القاء نقدینگی LIT' : 'LIT LIQUIDITY INDUCEMENT GUIDE'
                    )}
                  </span>
                  <HelpCircle className={`w-4 h-4 ${activeStrategy === 'SMC' ? 'text-blue-500' : 'text-amber-500'}`} />
                </div>
                
                <p className="text-slate-400 text-[11px] leading-relaxed relative z-10">
                  {activeStrategy === 'SMC' ? (
                    language === 'fa' 
                      ? 'بلاکهای خرید (Bullish OB) در کفهای حمایتی و بلاکهای فروش (Bearish OB) در سقفهای مقاومتی نشاندهنده ورود بانکها هستند. فایپها (FVG) بهعنوان آهنربای قیمتی عمل کرده و شکافها را میپوشانند.'
                      : 'Bullish Order Blocks represent heavy institutional buying limits. Bearish Order Blocks mark premium supply distribution zones. Fair Value Gaps (FVGs) act as magnets that pull prices toward market mitigation points.'
                  ) : (
                    language === 'fa'
                      ? 'استراتژی LIT (تئوری القاء نقدینگی) بر شناسایی تله‌ها و مهندسی نقدینگی تمرکز دارد. در این سبک، نقاط القای قیمت (Inducement) و نقدینگی مهندسی شده (Engineered Liq) به عنوان آهنربا معامله‌گران خرد را وسوسه کرده و مارکت با هانت استاپ‌های آنان شتاب می‌گیرد.'
                      : 'LIT strategy (Liquidity Inducement Theorem) focuses on identifying institutional traps and engineered liquidity. Breakouts and early swings are lured in (induced) and swept before real smart money moves are initiated.'
                  )}
                </p>

                {/* Footnote interactive link back to educational index or guidelines */}
                <div 
                  onClick={() => setShowEduHandbook(true)}
                  className="flex justify-end gap-1 items-center text-[10px] text-blue-400 font-bold hover:text-blue-350 transition-colors cursor-pointer pt-1 relative z-10"
                >
                  <span>{language === 'fa' ? 'مشاهده دفترچه آموزشی کامل' : 'Read Full Educational Blueprint'}</span>
                  <ChevronRight className="w-3 h-3 transform rotate-180" />
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* COMPREHENSIVE EDUCATIONAL HANDBOOK MODAL (BILINGUAL & INTERACTIVE) */}
      <AnimatePresence>
        {showEduHandbook && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md"
            dir={language === 'fa' ? 'rtl' : 'ltr'}
          >
            <motion.div 
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              transition={{ type: "spring", damping: 25, stiffness: 350 }}
              className="w-full max-w-2xl bg-gradient-to-b from-[#0b131e] to-[#04080e] border border-white/10 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden flex flex-col max-h-[85vh]"
            >
              {/* Modal Head Header */}
              <div className="p-5 border-b border-white/5 flex justify-between items-center bg-[#070f17]">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
                    <BookOpen className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-sm font-black text-white tracking-wide uppercase">
                      {language === 'fa' ? 'دفترچه راهنمای آموزشی جامع اونیگاما' : 'Onigama Comprehensive Academy Guide'}
                    </h2>
                    <p className="text-[10px] text-slate-400">
                      {language === 'fa' ? 'آموزش گام‌به‌گام سبک‌های معاملاتی SMC و LIT' : 'Step-by-step masterclass on SMC & LIT methodologies'}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowEduHandbook(false)}
                  className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Navigation Tabs */}
              <div className="flex border-b border-white/5 bg-[#050b13] p-1.5 gap-1.5 shrink-0">
                <button
                  type="button"
                  onClick={() => setEduActiveTab('smc')}
                  className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                    eduActiveTab === 'smc'
                      ? 'bg-blue-500/15 text-blue-400 border border-blue-500/30'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Layers className="w-3.5 h-3.5" />
                  <span>{language === 'fa' ? 'مفاهیم SMC' : 'SMC Theory'}</span>
                </button>
                
                <button
                  type="button"
                  onClick={() => setEduActiveTab('lit')}
                  className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                    eduActiveTab === 'lit'
                      ? 'bg-amber-500/15 text-amber-450 border border-amber-500/30'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Activity className="w-3.5 h-3.5" />
                  <span>{language === 'fa' ? 'تئوری نقدینگی LIT' : 'LIT Theory'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setEduActiveTab('risk')}
                  className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                    eduActiveTab === 'risk'
                      ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Target className="w-3.5 h-3.5" />
                  <span>{language === 'fa' ? 'استراتژی و محاسبات' : 'Strategy & Lots'}</span>
                </button>
              </div>

              {/* Scrollable Material Container */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-thin scrollbar-thumb-white/10">
                
                {/* TAB 1: SMART MONEY CONCEPTS (SMC) */}
                {eduActiveTab === 'smc' && (
                  <div className="space-y-5 animate-fadeIn">
                    <div className="p-4 rounded-2xl bg-blue-500/5 border border-blue-500/10 space-y-2">
                      <h4 className="text-xs font-extrabold text-blue-400 flex items-center gap-1.5 uppercase">
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>{language === 'fa' ? 'مکانیزم سفارشات پول هوشمند (SMC)' : 'Institutional Order Management (SMC)'}</span>
                      </h4>
                      <p className="text-[11px] text-slate-300 leading-relaxed">
                        {language === 'fa' 
                          ? 'سبک مفاهیم پول هوشمند به ردپای بانک‌ها و موسسات بزرگ در بازار می‌پردازد. حجم‌های سنگین مالی باعث عدم تعادل و به جای گذاشتن بیس‌های معاملاتی ارزشمند می‌شود.'
                          : 'Smart Money Concepts analyzes the footprint of major banking entities. Heavy block order distributions leave behind massive order imbalances and premium mitigation blocks.'}
                      </p>
                    </div>

                    <div className="space-y-4">
                      {/* Concept 1 */}
                      <div className="space-y-1">
                        <span className="text-[11px] font-black text-blue-400 block font-mono">1. Order Block (OB) - بلاک سفارشات</span>
                        <p className="text-[10.5px] text-slate-400 leading-relaxed">
                          {language === 'fa' 
                            ? 'آخرین کندل مخالف قبل از حرکت شارپ و جابجایی قیمت. اردر بلاک خرید (Bullish OB) در کفی است که قبل از صعود تشکیل شده و قیمت با بازگشت به آن به دنبال میتیگیشن (تخلیه سفارشات باقی‌مانده) صعود می‌کند.'
                            : 'The final counter-trend candle before a strong displacement. A Bullish OB is the demand origin candle left behind, and a Bearish OB is the supply origin. Institutions protect these levels carefully.'}
                        </p>
                      </div>

                      {/* Concept 2 */}
                      <div className="space-y-1">
                        <span className="text-[11px] font-black text-blue-450 block font-mono">2. Fair Value Gap (FVG) - فایپ</span>
                        <p className="text-[10.5px] text-slate-400 leading-relaxed">
                          {language === 'fa' 
                            ? 'شکاف یا عدم تعادل سه کندلی در بازار که ناشی از فشار خرید یا فروش خشن است. سایه کندل اول و سوم با هم هم‌پوشانی ندارند و این فضای خالی مانند مغناطیس سحرآمیز عمل کرده و بازار برای تکمیل قیمت مجدداً به این سمت کشیده می‌شود.'
                            : 'An imbalance created by explosive unidirectional candle ranges where high/low shadows do not overlap. The market tends to treat this empty pocket like a vacuum, drafting prices inside to balance orders.'}
                        </p>
                      </div>

                      {/* Concept 3 */}
                      <div className="space-y-1">
                        <span className="text-[11px] font-black text-blue-400 block font-mono">3. BOS & CHoCH - تغییر ساختار بازار</span>
                        <p className="text-[10.5px] text-slate-400 leading-relaxed">
                          {language === 'fa' 
                            ? 'تغییر ماهیت قیمت (CHoCH) یعنی اولین نشانه شکسته شدن سقف یا کف قبلی در جهت مخالف که مژده از تغییر روند می‌دهد. شکست ساختار (BOS) تداوم همان روند جاری را تأیید می‌کند.'
                            : 'Change of Character (CHoCH) is the first structural shift signaling trend reversal. Break of Structure (BOS) is successive breakups in the trend direction confirming momentum stability.'}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* TAB 2: LIQUIDITY INDUCEMENT THEOREM (LIT) */}
                {eduActiveTab === 'lit' && (
                  <div className="space-y-5 animate-fadeIn">
                    <div className="p-4 rounded-2xl bg-amber-500/5 border border-amber-500/10 space-y-2">
                      <h4 className="text-xs font-extrabold text-amber-400 flex items-center gap-1.5 uppercase">
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>{language === 'fa' ? 'تئوری نقدینگی و تله‌گذاری موسساتی (LIT)' : 'Liquidity Inducement Theorem (LIT)'}</span>
                      </h4>
                      <p className="text-[11px] text-slate-300 leading-relaxed">
                        {language === 'fa' 
                          ? 'استراتژی LIT بر پایه این است که بازار برای حرکت به بنزین نیاز دارد و این بنزین چیزی جز حد ضرر (Stop Loss) معامله‌گران خرد نیست. مارکت طوری سازماندهی می‌شود که شما را به تله بیندازد.'
                          : 'Liquidity Inducement Theorem (LIT) asserts that markets require fuel to move, and this fuel is the stop losses of retail traders. Major players engineer specific structures to trick retail strategies.'}
                      </p>
                    </div>

                    <div className="space-y-4">
                      {/* Concept 1 */}
                      <div className="space-y-1">
                        <span className="text-[11px] font-black text-amber-400 block font-mono">1. Inducement (IDM) - القاء نقدینگی</span>
                        <p className="text-[10.5px] text-slate-400 leading-relaxed">
                          {language === 'fa' 
                            ? 'تله معروفی که معامله‌گر خرد را فریب داده تا فکر کند بازار روندی را شروع کرده است. برای مثال یک شکست سقف فیک ایجاد می‌شود که معامله‌گران خرد در آن اقدام به خرید سنگین می‌کنند در حالی که بانک در حال آماده‌سازی هانت است.'
                            : 'An early trap designed to lure retail traders into taking positions prematurely (e.g., buying a minor breakout). Once they trigger their entries, institutions hunt those piled stops to power their actual execution.'}
                        </p>
                      </div>

                      {/* Concept 2 */}
                      <div className="space-y-1">
                        <span className="text-[11px] font-black text-amber-500 block font-mono">2. Engineered Liquidity - نقدینگی مهندسی شده</span>
                        <p className="text-[10.5px] text-slate-400 leading-relaxed">
                          {language === 'fa' 
                            ? 'ساخت نماهای حمایت و مقاومت تمیز یا شکست‌های خط روند. این سطوح صاف و کلاسیک باعث می‌شوند افراد فکر کنند سد محکمی است و استاپ‌های پشت آن را انباشته کنند. موسسات با خیالی آسوده تمام این استاپ‌ها را به یکباره درو می‌کنند.'
                            : 'Clean double bottoms/tops or trendlines designed to look structurally heavy. Sizable stop-loss pools accumulate behind these transparent levels, which are later swept clean in a single flush.'}
                        </p>
                      </div>

                      {/* Concept 3 */}
                      <div className="space-y-1">
                        <span className="text-[11px] font-black text-amber-400 block font-mono">3. Sweep & Hunt - پاکسازی استاپ‌ها</span>
                        <p className="text-[10.5px] text-slate-400 leading-relaxed">
                          {language === 'fa' 
                            ? 'هانت یا پاکسازی نقدینگی زمانی رخ می‌دهد که قیمت به سرعت سایه بلندی زیر یک سطح مهم حمایت می‌کشد، استاپ خریداران را جمع می‌کند و بلافاصله به بالا شلیک می‌شود. این مطلوب‌ترین تاییدیه برای معامله‌گر ال‌آی‌تی است.'
                            : 'A rapid piercing wick that sweeps accumulated liquidity pools below major lows or above major highs before sharp reverse ignition. Sweeps offer high-probability entry criteria for LIT specialists.'}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* TAB 3: STRATEGY & RISK MANAGEMENT */}
                {eduActiveTab === 'risk' && (
                  <div className="space-y-5 animate-fadeIn">
                    <div className="p-4 rounded-2xl bg-emerald-500/5 border border-emerald-500/10 space-y-2">
                      <h4 className="text-xs font-extrabold text-emerald-400 flex items-center gap-1.5 uppercase">
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>{language === 'fa' ? 'راهنمای گام‌به‌گام ورود ایمن همراه با محاسبات' : 'Strict Entry Standard & Sizing Strategy'}</span>
                      </h4>
                      <p className="text-[11px] text-slate-300 leading-relaxed">
                        {language === 'fa' 
                          ? 'داشتن تحلیل درست کافی نیست؛ جادوی سوددهی مستمر تریدر در ادغام ساختار بازار با مدیریت سرمایه آهنین و محاسبه لحظه‌ای حجم پوزیشن نهفته است.'
                          : 'High win-rate analysis is meaningless without matching capital limits. True traders blend structure maps directly with rigid lot sizing calculators to survive the random noise of institutional sweeps.'}
                      </p>
                    </div>

                    <div className="space-y-4 text-slate-300 text-[10.5px] leading-relaxed">
                      <div className="space-y-2">
                        <span className="font-extrabold text-emerald-400 block">
                          {language === 'fa' ? 'چک‌لیست ۳ مرحله‌ای ورود به پوزیشن اونیگاما:' : 'Onigama 3-Step Execution Checklist:'}
                        </span>
                        <ul className="list-disc list-inside space-y-2 pr-2 text-slate-400">
                          <li>
                            <strong className="text-white">{language === 'fa' ? 'گام ۱: تایید سطح اونیگاما: ' : 'Step 1: Check Onigama Level: '}</strong>
                            {language === 'fa' 
                              ? 'صبر کنید قیمت به یکی از سطوح اردر بلاک (SMC) یا نقاط هانت/Sweep راهنمای تحلیل اونیگاما برسد.'
                              : 'Wait for the asset price to touch marked order blocks (SMC) or inducement sweeps in the Onigama guide.'}
                          </li>
                          <li>
                            <strong className="text-white">{language === 'fa' ? 'گام ۲: تاییدیه تایم‌پایین: ' : 'Step 2: Low Timeframe Confirm: '}</strong>
                            {language === 'fa' 
                              ? 'به تایم‌فریم کوتاه‌تر (مثل ۵m یا ۱m) بروید و منتظر ایجاد تغییر ساختار رادیکال (CHoCH) یا هانت نقدینگی کندل‌ها (Sweep) بمانید.'
                              : 'Switch to lower timeframes (e.g. 5m/1m) and secure reaction signals such as CHoCH or a sharp candle wick sweep.'}
                          </li>
                          <li>
                            <strong className="text-white">{language === 'fa' ? 'گام ۳: محاسبه دقیق لات با ماشین حساب: ' : 'Step 3: Auto-Calculate Lot Size: '}</strong>
                            {language === 'fa' 
                              ? 'قیمت ورود تایم‌پایین و حد ضرر را در ماشین حساب بالای همین صفحه قرار دهید. درصد ریسک دلخواه خود (پیکربندی هوشمند ۱٪ تا ۲٪) را وارد کرده و فقط با حجم "لات" به دست آمده توسط سیستم معامله را ثبت کنید.'
                              : 'Input entry and SL targets directly into the premium positioning calculator above. Limit risk to 1% or 2%, and open precisely the lot size computed by the system.'}
                          </li>
                        </ul>
                      </div>

                      <div className="p-3 rounded-xl bg-orange-500/[0.03] border border-orange-500/15 text-orange-350 text-[10px] space-y-1">
                        <span className="font-black">⚠️ {language === 'fa' ? 'خط قرمز معامله‌گر:' : 'TRADER COMMANDMENT:'}</span>
                        <p>
                          {language === 'fa' 
                            ? 'هیچ‌گاه بدون محاسبه حجم با حد ضرر مشخص معامله نکنید. پوزیشن‌هایی که بدون حد ضرر یا بر اساس حدس حجم باز می‌شوند منشأ کال‌مارجین و شکست تریدرها در مارکت جهانی هستند.'
                            : 'Never execute positions without predefined stop levels or custom calculations. Over-leveraged, blind lots are the absolute main source of retail failure.'}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

              </div>

              {/* Footer Closer button */}
              <div className="p-4 border-t border-white/5 bg-[#050b13] flex justify-between items-center text-xs">
                <span className="text-[10px] text-slate-500 font-bold">
                  {language === 'fa' ? 'اونیگاما مربی معامله‌گری شما' : 'Onigama Trading Mentor'}
                </span>
                <button
                  type="button"
                  onClick={() => setShowEduHandbook(false)}
                  className="px-4 py-1.5 rounded-xl bg-[#6f87a0] hover:bg-[#5e748d] text-white font-extrabold cursor-pointer transition-all"
                >
                  {language === 'fa' ? 'فهمیدم، با تشکر' : 'Understood, Thanks'}
                </button>
              </div>

            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}

