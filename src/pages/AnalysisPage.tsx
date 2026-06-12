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
  Zap
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
  const [selectedSymbol, setSelectedSymbol] = useState('XAUUSD');
  
  const activeAsset = assets.find(a => a.symbol === selectedSymbol) || assets[0];
  const { price } = activeAsset;

  const [timeframe, setTimeframe] = useState<Timeframe>('15m');
  const [activeStrategy, setActiveStrategy] = useState<'SMC' | 'LIT'>('SMC');
  const [hoveredLevelId, setHoveredLevelId] = useState<string | null>(null);

  const [profile, setProfile] = useState(() => StorageManager.getProfile());
  const isVip = profile.isActivated && (profile.subscriptionTier === 'vip' || profile.subscriptionTier === 'premium');

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
                <div className="flex justify-end gap-1 items-center text-[10px] text-blue-400 font-bold hover:text-blue-300 transition-colors cursor-pointer pt-1 relative z-10">
                  <span>{language === 'fa' ? 'مشاهده دفترچه آموزشی کامل' : 'Read Full Educational Blueprint'}</span>
                  <ChevronRight className="w-3 h-3 transform rotate-180" />
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>

    </div>
  );
}
