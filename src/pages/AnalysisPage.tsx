import { useState, useEffect } from 'react';
import { useGoldPrice } from '../hooks/useGoldPrice';
import { Layers, HelpCircle, Lock, Sparkles } from 'lucide-react';
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
  const [hoveredLevel, setHoveredLevel] = useState<any | null>(null);

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
          : 'Engineered liquidity trap built to induce breakout buyers before a sharp reversal.'
      },
      {
        id: 'lit-2',
        type: 'IDM_HIGH',
        price: +(spotPrice * 1.0022).toFixed(sym === 'EURUSD' || sym === 'GBPUSD' || sym === 'AUDUSD' || sym === 'USDCAD' ? 4 : 2),
        label: language === 'fa' ? 'القاء نزولی (Inducement High)' : 'Bearish Inducement (LIT IDM)',
        description: language === 'fa'
          ? 'نقطه القاء فروشندگان خرد برای ورود زودهنگام به پوزیشن فروش قبل از سوئیپ اصلی.'
          : 'High inducement level attracting early retail sellers prior to the real sweep.'
      },
      {
        id: 'lit-3',
        type: 'ENG_LIQ',
        price: +(spotPrice * 1.0005).toFixed(sym === 'EURUSD' || sym === 'GBPUSD' || sym === 'AUDUSD' || sym === 'USDCAD' ? 4 : 2),
        label: language === 'fa' ? 'نقدینگی مهندسی شده (Engineered Liq)' : 'Engineered Liquidity (EQH)',
        description: language === 'fa'
          ? 'ترکیب سقف‌های برابر (Equal Highs) که بهعنوان آهنربای جذب سفارشات موسسات عمل می‌کند.'
          : 'Double highs structures creating a massive liquidity pool for institutional sweeps.'
      },
      {
        id: 'lit-4',
        type: 'IDM_LOW',
        price: +(spotPrice * 0.9978).toFixed(sym === 'EURUSD' || sym === 'GBPUSD' || sym === 'AUDUSD' || sym === 'USDCAD' ? 4 : 2),
        label: language === 'fa' ? 'القاء صعودی (Inducement Low)' : 'Bullish Inducement (LIT IDM)',
        description: language === 'fa'
          ? 'القای معامله‌گران به خرید زودرس در محدوده حمایتی ضعیف کلاسیک پیش از سابیده شدن کف.'
          : 'Low-level inducement to trap early buyers prior to the final stop-loss hunt.'
      },
      {
        id: 'lit-5',
        type: 'LIT_SWEEP',
        price: +(spotPrice * 0.9925).toFixed(sym === 'EURUSD' || sym === 'GBPUSD' || sym === 'AUDUSD' || sym === 'USDCAD' ? 4 : 2),
        label: language === 'fa' ? 'سوئیپ نقدینگی القایی (Sweep Zone)' : 'Inducement Sweep Zone (SSL)',
        description: language === 'fa'
          ? 'سطح شکار نهایی استاپ‌لاس‌های معامله‌گران سبک کلاسیک جهت تجمیع سفارشات خرید بانک‌های بزرگ.'
          : 'Major stop-loss sweep tier under Liquidity Inducement Theorem to trigger institutional buy orders.'
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
          : 'High-probability bearish supply zone with institutional mitigation bias.'
      },
      {
        id: 'lvl-2',
        type: 'BSL',
        price: +(spotPrice * 1.0085).toFixed(sym === 'EURUSD' || sym === 'GBPUSD' || sym === 'AUDUSD' || sym === 'USDCAD' ? 4 : 2),
        label: language === 'fa' ? 'نقدینگی خریداران (سقف روزانه)' : 'Buy-Side Liquidity (Daily High)',
        description: language === 'fa'
          ? 'استخر نقدینگی خرید فعال واقع در بالای اوج قیمت امروز.'
          : 'Buy stops cluster indicating potential stop-run or breakout zone.'
      },
      {
        id: 'lvl-3',
        type: 'FVG',
        price: +(spotPrice * 1.0015).toFixed(sym === 'EURUSD' || sym === 'GBPUSD' || sym === 'AUDUSD' || sym === 'USDCAD' ? 4 : 2),
        label: language === 'fa' ? 'شکاف ارزش منصفانه (H1)' : 'Fair Value Gap (H1)',
        description: language === 'fa'
          ? 'ناکارآمدی قیمتی برجا مانده از حرکت پرشتاب بازار صعودی.'
          : 'Inefficient price delivery zone that acts as a physical magnet.'
      },
      {
        id: 'lvl-4',
        type: 'OB_BULLISH',
        price: +(spotPrice * 0.9958).toFixed(sym === 'EURUSD' || sym === 'GBPUSD' || sym === 'AUDUSD' || sym === 'USDCAD' ? 4 : 2),
        label: language === 'fa' ? 'بلاک سفارش خرید (H1)' : 'Bullish OB (H1)',
        description: language === 'fa'
          ? 'بستر انباشت خرید بزرگ موسساتی مناسب برای اردرگذاری مجدد.'
          : 'Premium institutional buying tier aligned with discount zone.'
      },
      {
        id: 'lvl-5',
        type: 'SSL',
        price: +(spotPrice * 0.9902).toFixed(sym === 'EURUSD' || sym === 'GBPUSD' || sym === 'AUDUSD' || sym === 'USDCAD' ? 4 : 2),
        label: language === 'fa' ? 'نقدینگی فروشندگان (کف هفتگی)' : 'Sell-Side Liquidity (Weekly Low)',
        description: language === 'fa'
          ? 'سطح کلیدی نقدینگی فروشندگان مستقر در زیر کلاستر حمایتی پهن.'
          : 'Sell stops pool representing heavy sell pressure mitigations.'
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
    <div className="space-y-6 pb-20">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3" dir={language === 'fa' ? 'rtl' : 'ltr'}>
        <div>
          <h1 className="text-xl font-bold text-white tracking-wide">
            {activeStrategy === 'SMC' ? (
              language === 'fa' ? `تحلیل تکنیکال هوشمند SMC (${activeAsset.symbol})` : `SMC Technical Chart (${activeAsset.symbol})`
            ) : (
              language === 'fa' ? `تحلیل تکنیکال پیشرفته LIT (${activeAsset.symbol})` : `LIT Advanced Chart (${activeAsset.symbol})`
            )}
          </h1>
          <p className="text-xs text-slate-400 font-sans">
            {activeStrategy === 'SMC' ? (
              language === 'fa' 
                ? `نقشه‌برداری سطوح نقدینگی هوشمند SMC برای ${activeAsset.nameFa}` 
                : `Smart Money Concepts levels custom-mapped for ${activeAsset.name}`
            ) : (
              language === 'fa'
                ? `نقشه‌برداری سطوح القای نقدینگی و هانت LIT برای ${activeAsset.nameFa}`
                : `Liquidity Inducement Theorem structures custom-mapped for ${activeAsset.name}`
            )}
          </p>
        </div>
        <div className="text-right">
          <span className="text-[10px] text-slate-500 block">LIVE price</span>
          <span className="text-sm font-bold font-mono text-yellow-400 tracking-wider animate-pulse">
            {formatValue(price, selectedSymbol)}
          </span>
        </div>
      </div>

      {/* RESPONSIVE TERMINAL GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* LEFT COLUMN: Chart switcher, timeframe, and candlestick board */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* SYMBOL SWITCHER FOR CHART */}
          <div className="space-y-1.5" dir={language === 'fa' ? 'rtl' : 'ltr'}>
        <span className="text-[10px] text-slate-400 block font-bold uppercase tracking-wider">
          {language === 'fa' ? 'انتخاب جفت‌ارز یا دارایی جهت پایش نموداری:' : 'Select Asset to Load SMC Levels & Price Chart:'}
        </span>
        <div className="flex flex-wrap gap-1.5 p-1 bg-white/2 border border-white/5 rounded-2xl">
          {assets.map(asset => {
            const isSel = asset.symbol === selectedSymbol;
            return (
              <button
                key={asset.symbol}
                onClick={() => setSelectedSymbol(asset.symbol)}
                className={`py-1.5 px-3 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer ${
                  isSel
                    ? 'bg-[#6f87a0] text-white shadow-md font-extrabold'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                {asset.symbol}
              </button>
            );
          })}
        </div>
      </div>

      {/* TIMEFRAME SELECTOR */}
      <div className="flex bg-white/2 border border-white/5 p-1 rounded-2xl gap-1">
        {(['1m', '5m', '15m', '1h', '4h', '1d'] as Timeframe[]).map((tf) => (
          <button
            key={tf}
            onClick={() => setTimeframe(tf)}
            className={`flex-1 py-1.5 px-1 rounded-xl text-xs font-mono font-bold transition-all ${
              timeframe === tf
                ? 'bg-[#6f87a0] text-white font-extrabold shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            {tf}
          </button>
        ))}
      </div>

          {/* CHART CANVAS BOARD */}
          <div className="p-5 rounded-3xl glass-card glow-blue shadow-2xl relative">
            <div className="absolute top-3 right-3 bg-white/10 backdrop-blur border border-white/5 px-2.5 py-0.5 rounded-full text-[10px] text-slate-300 font-mono z-10 animate-pulse">
              {selectedSymbol} • {language === 'fa' ? 'نمودار زنده تریدینگ‌ویو' : 'Live TradingView'}
            </div>

            <div className="w-full relative z-0 mt-4 h-[340px] rounded-2xl overflow-hidden">
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
              {language === 'fa' ? 'انتخاب استراتژی نقشه سطوح مارکت:' : 'Select Market Mapping Strategy:'}
            </span>
            <div className="flex bg-white/2 border border-white/5 p-1 rounded-2xl gap-1">
              <button
                type="button"
                onClick={() => {
                  setActiveStrategy('SMC');
                  setHoveredLevel(null);
                }}
                className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeStrategy === 'SMC'
                    ? 'bg-[#6f87a0] text-white shadow-md font-extrabold'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                {language === 'fa' ? 'سطوح SMC (سیستم بانکی)' : 'SMC Strategy'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setActiveStrategy('LIT');
                  setHoveredLevel(null);
                }}
                className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeStrategy === 'LIT'
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/35 shadow-md font-extrabold'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                {language === 'fa' ? 'سطوح LIT (تئوری القاء)' : 'LIT Strategy'}
              </button>
            </div>

            <div className="flex items-center gap-2">
              <Layers className={`w-4 h-4 ${activeStrategy === 'SMC' ? 'text-[#6f87a0]' : 'text-amber-400'}`} />
              <h2 className="text-base font-bold text-white tracking-wide">
                {activeStrategy === 'SMC' ? (
                  language === 'fa' ? `سطوح نقدینگی و بلاک‌های SMC (${selectedSymbol})` : `Onigama Smart SMC Levels for ${selectedSymbol}`
                ) : (
                  language === 'fa' ? `سطوح تله و القای نقدینگی LIT (${selectedSymbol})` : `Onigama Liquidity LIT Levels for ${selectedSymbol}`
                )}
              </h2>
            </div>
          </div>

          {/* WRAP IN ACTIVE RELATIVE SUBSCRIPTION PROTECTION CONTAINER */}
          <div className="relative">
            {activeStrategy === 'LIT' && !isVip && (
              <div className="absolute inset-0 z-20 backdrop-blur-md bg-slate-950/80 border border-amber-500/15 rounded-3xl p-5 flex flex-col justify-center items-center text-center space-y-4 shadow-xl">
                <div className="p-3 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-full animate-pulse">
                  <Lock className="w-5 h-5 text-amber-400" />
                </div>
                <div className="space-y-1.5 max-w-[280px]">
                  <h3 className="text-xs font-black text-amber-350 flex items-center gap-1.5 justify-center uppercase font-mono tracking-wider">
                    <Sparkles className="w-4 h-4 text-amber-450 animate-pulse" />
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
                    onClick={() => onNavigate('settings')}
                    className="py-2 px-3.5 bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-400 hover:to-yellow-500 text-slate-950 font-black rounded-xl text-xs transition-all cursor-pointer flex items-center gap-1.5 shadow-md active:scale-95"
                  >
                    <span>{language === 'fa' ? '🔑 رفتن به فعال‌سازی لایسنس' : '🔑 Grab Activation Key'}</span>
                  </button>
                )}
              </div>
            )}

            <div className={`space-y-6 transition-all duration-300 ${activeStrategy === 'LIT' && !isVip ? 'opacity-25 pointer-events-none filter blur-[2px]' : ''}`}>
              {/* LEVELS CONTAINER LIST */}
              <div className="space-y-3" dir={language === 'fa' ? 'rtl' : 'ltr'}>
                {levels.map((lvl) => {
                  const distance = Math.abs(price - lvl.price);
                  const isNear = distance < (price * 0.0035);

                  let badgeColor = 'bg-slate-800 text-slate-400';
                  if (lvl.type === 'OB_BULLISH') badgeColor = 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20';
                  if (lvl.type === 'OB_BEARISH') badgeColor = 'bg-rose-500/10 text-rose-400 border border-rose-500/20';
                  if (lvl.type === 'FVG') badgeColor = 'bg-yellow-500/10 text-yellow-500 border border-yellow-500/20';
                  if (lvl.type === 'BSL') badgeColor = 'bg-[#6f87a0]/10 text-[#6f87a0] border border-[#6f87a0]/20';
                  if (lvl.type === 'SSL') badgeColor = 'bg-purple-500/10 text-purple-400 border border-purple-500/20';

                  // LIT specific level badges
                  if (lvl.type === 'LIT_TRAP') badgeColor = 'bg-rose-500/20 text-rose-400 border border-rose-500/30';
                  if (lvl.type === 'IDM_HIGH') badgeColor = 'bg-orange-500/15 text-orange-400 border border-orange-500/25';
                  if (lvl.type === 'ENG_LIQ') badgeColor = 'bg-amber-500/15 text-amber-300 border border-amber-500/25';
                  if (lvl.type === 'IDM_LOW') badgeColor = 'bg-sky-500/15 text-sky-450 border border-sky-500/25';
                  if (lvl.type === 'LIT_SWEEP') badgeColor = 'bg-emerald-500/20 text-emerald-450 border border-emerald-500/30';

                  const activeNearBorder = activeStrategy === 'SMC'
                    ? 'border-[#6f87a0]/40 shadow-[0_0_15px_rgba(111,135,160,0.1)]'
                    : 'border-amber-500/30 shadow-[0_0_15px_rgba(245,158,11,0.08)]';

                  return (
                    <div
                      key={lvl.id}
                      onMouseEnter={() => setHoveredLevel(lvl)}
                      onMouseLeave={() => setHoveredLevel(null)}
                      className={`p-4 rounded-2xl border bg-white/2 hover:bg-white/5 text-right transition-all cursor-pointer ${
                        isNear 
                          ? `${activeNearBorder} scale-[1.01]` 
                          : 'border-white/5 hover:border-white/10'
                      }`}
                    >
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-[10px] bg-white/5 border border-white/5 px-2.5 py-0.5 rounded-full text-white font-mono font-bold">
                          {formatValue(lvl.price, selectedSymbol)}
                        </span>
                        
                        <div className="flex items-center gap-1.5 flex-row-reverse w-fit">
                          <span className={`text-[9.5px] font-bold px-2 py-0.5 rounded-lg tracking-wide ${badgeColor}`}>
                            {lvl.label}
                          </span>
                          {isNear && (
                            <span className={`text-[8.5px] font-bold ${activeStrategy === 'SMC' ? 'text-emerald-400 bg-emerald-500/10' : 'text-amber-400 bg-amber-500/10'} px-1.5 py-0.5 rounded-md animate-pulse`}>
                              {language === 'fa' ? 'نزدیک قیمت' : 'Price Near'}
                            </span>
                          )}
                        </div>
                      </div>

                      <p className="text-[11px] text-slate-400 font-sans mt-1.5">
                        {lvl.description}
                      </p>
                    </div>
                  );
                })}
              </div>

              {/* DYNAMIC INFORMATION GUIDELINE */}
              <div className="p-4 bg-white/2 border border-white/5 rounded-2xl space-y-2 text-right" dir={language === 'fa' ? 'rtl' : 'ltr'}>
                <div className="flex items-center gap-2 justify-end">
                  <span className="text-xs font-bold text-slate-300">
                    {activeStrategy === 'SMC' ? (
                      language === 'fa' ? 'راهنمای جامع سبک SMC نوین' : 'SMC Advanced Concepts Guide'
                    ) : (
                      language === 'fa' ? 'راهنمای جامع سبک القاء نقدینگی LIT' : 'LIT Liquidity Inducement Guide'
                    )}
                  </span>
                  <HelpCircle className={`w-3.5 h-3.5 ${activeStrategy === 'SMC' ? 'text-[#6f87a0]' : 'text-amber-400'}`} />
                </div>
                <p className="text-slate-400 text-[11px] leading-relaxed">
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
              </div>
            </div>
          </div>

        </div>
      </div>

    </div>
  );
}
