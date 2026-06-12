import React, { useState, useEffect } from 'react';
import { useGoldPrice } from '../hooks/useGoldPrice';
import { Signal, Trade, MarketStats } from '../types';
import { StorageManager } from '../services/api';
import { 
  TrendingUp, 
  TrendingDown, 
  Activity, 
  Clock, 
  Target, 
  Zap, 
  Bell, 
  Plus, 
  ArrowUpRight, 
  ArrowDownRight, 
  Percent, 
  CheckCircle2, 
  XCircle,
  Coins,
  Gem,
  Globe
} from 'lucide-react';

interface HomePageProps {
  onNavigate: (tab: string) => void;
  language: 'fa' | 'en';
}

export function HomePage({ onNavigate, language }: HomePageProps) {
  const { assets, refresh } = useGoldPrice(4);
  const [selectedSymbol, setSelectedSymbol] = useState('XAUUSD');
  const activeAsset = assets.find(a => a.symbol === selectedSymbol) || assets[0];
  const { price, prevPrice, change24h, high24h, low24h } = activeAsset;

  const [signals, setSignals] = useState<Signal[]>([]);
  const [stats, setStats] = useState<MarketStats>({ tradesCount: 0, winRate: 0, totalProfit: 0, winCount: 0, lossCount: 0 });
  const [isAddingSignal, setIsAddingSignal] = useState(false);
  const [autoAlert, setAutoAlert] = useState<{ show: boolean, symbol: string, type: 'BUY' | 'SELL', message: string }>({ show: false, symbol: '', type: 'BUY', message: '' });
  
  // Quick signal creator state
  const [sigType, setSigType] = useState<'BUY' | 'SELL'>('BUY');
  const [sigEntry, setSigEntry] = useState('');
  const [sigSl, setSigSl] = useState('');
  const [sigTp1, setSigTp1] = useState('');
  const [sigSession, setSigSession] = useState<'ASIA' | 'LONDON' | 'NY'>('LONDON');
  const [sigStrategy, setSigStrategy] = useState<'SMC' | 'LIT'>('SMC');

  // Signals display filters state
  const [filterSession, setFilterSession] = useState<'ALL' | 'ASIA' | 'LONDON' | 'NY'>('ALL');
  const [filterStrategy, setFilterStrategy] = useState<'ALL' | 'SMC' | 'LIT'>('ALL');

  useEffect(() => {
    const loadedSignals = StorageManager.getSignals();
    const loadedTrades = StorageManager.getTrades();
    setSignals(loadedSignals);
    setStats(StorageManager.getStats(loadedTrades));

    // Listen for custom persistent updates to trades list (to sync state instantly)
    const handleStorageChange = () => {
      setSignals(StorageManager.getSignals());
      setStats(StorageManager.getStats(StorageManager.getTrades()));
    };
    window.addEventListener('storage', handleStorageChange);
    // Poll updates to synchronize local changes in the same window
    const interval = setInterval(handleStorageChange, 2000);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, []);

  // Periodic background automated signal simulator for different symbols
  useEffect(() => {
    const timer = setInterval(() => {
      // 22% chance to automatically generate a fresh signal for a random symbol every 30 seconds
      if (Math.random() > 0.22) return;
      if (!assets || assets.length === 0) return;

      const randomAsset = assets[Math.floor(Math.random() * assets.length)];
      
      const generated = generateSmartSignal(randomAsset);
      const latestSignals = StorageManager.getSignals();
      const updated = [generated, ...latestSignals].slice(0, 20);
      
      setSignals(updated);
      StorageManager.saveSignals(updated);

      // Trigger beautiful temporary local notification banner
      setAutoAlert({
        show: true,
        symbol: randomAsset.symbol,
        type: generated.type,
        message: language === 'fa'
          ? `⚡️ سیگنال جدید سیستم Onigama برای جفت‌ارز ${randomAsset.symbol} صادر شد!`
          : `⚡️ New premium automated signal issued for ${randomAsset.symbol}!`
      });

      // Clear alert banner after 5.5 seconds
      setTimeout(() => {
        setAutoAlert(prev => ({ ...prev, show: false }));
      }, 5500);

    }, 30000);

    return () => clearInterval(timer);
  }, [assets, language, signals]);

  const isUp = price >= prevPrice;

  const handleCreateSignal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!sigEntry || !sigSl || !sigTp1) return;

    const entry = parseFloat(sigEntry);
    const slVal = parseFloat(sigSl);
    const tp1Val = parseFloat(sigTp1);

    if (isNaN(entry) || isNaN(slVal) || isNaN(tp1Val)) return;

    const diff = Math.abs(entry - tp1Val);
    const isForex = activeAsset.type === 'FOREX';
    const decimals = isForex ? 4 : (activeAsset.symbol === 'BTCUSD' ? 1 : 2);

    // Generate advanced automatic analytical note based on chosen strategy + session
    const sessFa = sigSession === 'ASIA' ? 'آسیا' : sigSession === 'LONDON' ? 'لندن' : 'نیویورک';
    const sessEn = sigSession === 'ASIA' ? 'Asia' : sigSession === 'LONDON' ? 'London' : 'New York';

    const notesBuySMC = [
      `تاییدیه اردر بلاک صعودی (Bullish OB) در سشن ${sessFa} همراه با جابجایی حجمی سنگین و پر شدن گپ ارزش منصفانه (FVG).`,
      `شکست ساختار صعودی (BOS) معتبر در تایم‌فریم کوتاه‌مدت پس از برخورد به محدوده تقاضای سشن ${sessFa}.`
    ];
    const notesBuyLIT = [
      `هانت بی‌‌امان نقدینگی القایی (Inducement Sweep) و پاکسازی استاپ‌های خریداران خرده‌پا در سشن ${sessFa} طبق سبک LIT.`,
      `تشکیل محدوده نقدینگی مهندسی‌شده (Engineered Liquidity) و جهش صعودی پرقدرت پس از فعال شدن لیمیت‌های نهادی.`
    ];

    const notesSellSMC = [
      `تست میتیگیشن بلاک نزولی در سشن ${sessFa} همزمان با تاییدیه شکست ساختار نزولی (Market Structure Break) در تایم پایین.`,
      `ری‌جکشن قدرتمند از نقطه تعادل عرضه سشن ${sessFa} همگام با عدم تعادل قیمتی شدید به سمت پایین.`
    ];
    const notesSellLIT = [
      `سوئیپ نقدینگی سقف (BSL Sweep) در سشن ${sessFa} جهت به دام انداختن خریداران زودرس و شکار استاپ‌لاس‌ها بر اساس سبک القای LIT.`,
      `تله نقدینگی القایی سقف سشن ${sessFa} به خوبی پاکسازی شد؛ آغاز ریزش پس از هانت تله شکست خریداران.`
    ];

    const notesBuySMC_En = [
      `Bullish Order Block mitigation conformed in ${sessEn} session with dynamic FVG filling and high buy volume.`,
      `Bullish Break of Structure (BOS) in lower timeframe after institutional demand tap in ${sessEn} session.`
    ];
    const notesBuyLIT_En = [
      `LIT style Inducement sweep and Buy-Side retail trap pool liquidation in ${sessEn} session.`,
      `Engineered Liquidity pool mitigation triggering heavy institutional buy orders inside ${sessEn} session.`
    ];
    const notesSellSMC_En = [
      `Bearish Market Structure Break conformed during ${sessEn} session, verifying deep supply block mitigation.`,
      `Bearish Mitigation Block test during high volume ${sessEn} session open with negative volume gap.`
    ];
    const notesSellLIT_En = [
      `Buy-Side Liquidity (BSL) sweep above key highs to trap breakout buyers in ${sessEn} session under LIT strategy.`,
      `LIT Liquidity Inducement sweep targeting engineered resistance and Asian high traps in ${sessEn} session.`
    ];

    const pickIdx = Math.floor(Math.random() * 2);
    let manualNote = '';
    
    if (language === 'fa') {
      if (sigType === 'BUY') {
        manualNote = sigStrategy === 'SMC' ? notesBuySMC[pickIdx] : notesBuyLIT[pickIdx];
      } else {
        manualNote = sigStrategy === 'SMC' ? notesSellSMC[pickIdx] : notesSellLIT[pickIdx];
      }
    } else {
      if (sigType === 'BUY') {
        manualNote = sigStrategy === 'SMC' ? notesBuySMC_En[pickIdx] : notesBuyLIT_En[pickIdx];
      } else {
        manualNote = sigStrategy === 'SMC' ? notesSellSMC_En[pickIdx] : notesSellLIT_En[pickIdx];
      }
    }

    const newSignal: Signal = {
      id: `sig-${Date.now()}`,
      symbol: activeAsset.symbol,
      type: sigType,
      entryPrice: entry,
      tp1: tp1Val,
      tp2: +(entry + (sigType === 'BUY' ? diff * 2 : -diff * 2)).toFixed(decimals),
      tp3: +(entry + (sigType === 'BUY' ? diff * 3 : -diff * 3)).toFixed(decimals),
      sl: slVal,
      timestamp: new Date().toISOString(),
      status: 'ACTIVE',
      notes: manualNote,
      session: sigSession,
      strategy: sigStrategy
    };

    const updated = [newSignal, ...signals];
    setSignals(updated);
    StorageManager.saveSignals(updated);
    setIsAddingSignal(false);
    setSigEntry('');
    setSigSl('');
    setSigTp1('');
  };

  const handleResolveSignal = (id: string, outcome: 'TP1' | 'TP2' | 'TP3' | 'SL' | 'CLOSED') => {
    const updated = signals.map(sig => {
      if (sig.id === id) {
        return { ...sig, status: outcome };
      }
      return sig;
    });
    setSignals(updated);
    StorageManager.saveSignals(updated);

    // If signal hit target or sl, let's automatically log a trade in the Journal to show real-time synchronization!
    const targetSig = signals.find(s => s.id === id);
    if (targetSig && (outcome === 'TP1' || outcome === 'TP2' || outcome === 'TP3' || outcome === 'SL')) {
      const isWin = outcome !== 'SL';
      let exitStr = targetSig.entryPrice;
      if (outcome === 'TP1') exitStr = targetSig.tp1;
      if (outcome === 'TP2') exitStr = targetSig.tp2;
      if (outcome === 'TP3') exitStr = targetSig.tp3;
      if (outcome === 'SL') exitStr = targetSig.sl;

      const volume = 0.5; // Standard mock lots
      const sym = targetSig.symbol.toUpperCase().trim();
      let contractSize = 100000; // default for major forex pairs

      if (sym.includes('XAU') || sym.includes('GOLD')) {
        contractSize = 100; // Standard Gold: 1 Lot = 100 oz
      } else if (sym.includes('XAG') || sym.includes('SILVER')) {
        contractSize = 5000; // Standard Silver: 1 Lot = 5000 oz
      } else if (sym.includes('BTC') || sym.includes('BITCOIN')) {
        contractSize = 1;
      } else if (sym.includes('ETH') || sym.includes('ETHEREUM')) {
        contractSize = 1;
      } else if (sym.includes('JPY')) {
        contractSize = 1000; // USDJPY, GBPJPY JPY-base multiplier
      } else if (sym.includes('US30') || sym.includes('DJI') || sym.includes('SPX') || sym.includes('NAS100') || sym.includes('NDX')) {
        contractSize = 10;
      }

      const priceDiff = targetSig.type === 'BUY' ? (exitStr - targetSig.entryPrice) : (targetSig.entryPrice - exitStr);
      const profit = priceDiff * volume * contractSize;

      const newJournalTrade: Trade = {
        id: `trade-${Date.now()}`,
        symbol: targetSig.symbol,
        type: targetSig.type,
        entryPrice: targetSig.entryPrice,
        exitPrice: exitStr,
        volume,
        profit: +profit.toFixed(2),
        date: language === 'fa' ? 'امروز - لایو' : 'Today (Live)',
        outcome: isWin ? 'WIN' : 'LOSS',
        notes: `سیگنال خودکار ثبت شده بعد از رسیدن به وضعیت: ${outcome}`
      };

      const originalTrades = StorageManager.getTrades();
      const updatedTrades = [newJournalTrade, ...originalTrades];
      StorageManager.saveTrades(updatedTrades);
      setStats(StorageManager.getStats(updatedTrades));
    }
  };

  const handleDeleteSignal = (id: string) => {
    const filtered = signals.filter(s => s.id !== id);
    setSignals(filtered);
    StorageManager.saveSignals(filtered);
  };

  const getDecimalsForSymbol = (sym: string) => {
    const symUpper = sym.toUpperCase();
    const findAsset = assets.find(a => a.symbol === symUpper);
    if (findAsset) {
      if (findAsset.type === 'FOREX') {
        return symUpper === 'USDJPY' ? 2 : 4;
      }
      if (symUpper === 'BTCUSD' || symUpper === 'US30' || symUpper === 'NAS100') {
        return 0;
      }
      return 2;
    }
    return symUpper.includes('USD') && symUpper.length === 6 && !symUpper.includes('JPY') ? 4 : 2;
  };

  const formatValue = (val: number, sym: string) => {
    const findAsset = assets.find(a => a.symbol === sym.toUpperCase());
    const isFx = findAsset?.type === 'FOREX';
    const decs = getDecimalsForSymbol(sym);
    if (isFx) {
      return val.toFixed(decs);
    }
    return '$' + val.toLocaleString(undefined, { minimumFractionDigits: decs, maximumFractionDigits: decs });
  };

  const generateSmartSignal = (asset: any, forceType?: 'BUY' | 'SELL') => {
    const type = forceType || (Math.random() > 0.5 ? 'BUY' : 'SELL');
    const symbolUpper = asset.symbol.toUpperCase();
    const isForex = asset.type === 'FOREX';
    const decs = getDecimalsForSymbol(asset.symbol);

    // Randomize Session and Strategy Style
    const sessions: ('ASIA' | 'LONDON' | 'NY')[] = ['ASIA', 'LONDON', 'NY'];
    const strategies: ('SMC' | 'LIT')[] = ['SMC', 'LIT'];
    const chosenSession = sessions[Math.floor(Math.random() * sessions.length)];
    const chosenStrategy = strategies[Math.floor(Math.random() * strategies.length)];

    // Calculate dynamic delta based on price and asset type
    let delta = asset.price * 0.003; // default
    if (symbolUpper === 'XAUUSD') {
      delta = 16.0;
    } else if (symbolUpper === 'XAGUSD') {
      delta = 0.45;
    } else if (symbolUpper === 'BTCUSD') {
      delta = 650.0;
    } else if (symbolUpper === 'ETHUSD') {
      delta = 45.0;
    } else if (symbolUpper === 'USDJPY') {
      delta = 0.65;
    } else if (symbolUpper === 'US30') {
      delta = 250.0;
    } else if (symbolUpper === 'NAS100') {
      delta = 120.0;
    } else if (symbolUpper === 'OIL') {
      delta = 0.95;
    } else if (isForex) {
      delta = 0.0025; // forex micro pips
    }

    const entry = asset.price;
    const tp1Val = +(entry + (type === 'BUY' ? delta * 0.5 : -delta * 0.5)).toFixed(decs);
    const tp2Val = +(entry + (type === 'BUY' ? delta * 1.2 : -delta * 1.2)).toFixed(decs);
    const tp3Val = +(entry + (type === 'BUY' ? delta * 2.1 : -delta * 2.1)).toFixed(decs);
    const slVal = +(entry - (type === 'BUY' ? delta * 0.6 : -delta * 0.6)).toFixed(decs);

    // Advanced structural / inducement notes generators based on strategy & session
    const sessFa = chosenSession === 'ASIA' ? 'آسیا' : chosenSession === 'LONDON' ? 'لندن' : 'نیویورک';
    const sessEn = chosenSession === 'ASIA' ? 'Asia' : chosenSession === 'LONDON' ? 'London' : 'New York';

    const notesBuySMC = [
      `تاییدیه اردر بلاک صعودی (Bullish OB) در سشن ${sessFa} همراه با جابجایی حجمی خریداران بزرگ و FVG یک‌ساعته.`,
      `شکست ساختار صعودی (BOS) معتبر پس از برخورد به بلاک تقاضای روزانه در جریان معاملات سشن ${sessFa}.`
    ];
    const notesBuyLIT = [
      `بر غلبه خریداران خرده‌پا تله گذاشته شد؛ شکار استاپ‌لاس‌ها و سوئیپ نقدینگی القایی (IDM Sweep) در کف سشن ${sessFa} (تاکتیک LIT).`,
      `پاکسازی نقدینگی مهندسی‌شده سشن ${sessFa} و فعال شدن سفارشات خرید بانک‌های بزرگ روی قیمت ارزان.`
    ];

    const notesSellSMC = [
      `میتیگیشن بی‌نقص اردر بلاک نزولی چهارساعته همزمان با آغاز معاملات پرحجم سشن ${sessFa}.`,
      `تست بلاک کاهنده عرضه و تشکیل ساختار نزولی جدید در سشن ${sessFa} متعاقب فشار فروش قدرتمند.`
    ];
    const notesSellLIT = [
      `سوئیپ فوق‌العاده نقدینگی سقف (BSL Sweep) در سشن ${sessFa} با هدف القای خرید کاذب به معامله‌گران خرد و هانت استاپ‌ها.`,
      `تله نقدینگی القایی سقف سشن ${sessFa} با کندل سنجاقی شکل شکار شد؛ نقدینگی جذب شده و آماده ریزش است.`
    ];

    const notesBuySMC_En = [
      `Mitigation of bullish H4 Order Block during high volume ${sessEn} session with clean FVG gap.`,
      `Bullish Market Structure Shift (MSS) conformed inside ${sessEn} session buyer demand zone.`
    ];
    const notesBuyLIT_En = [
      `LIT Strategy: Inducement sweep and retail buyer stop grab at the base of ${sessEn} session range.`,
      `Engineered Liquidity pool clearance during ${sessEn} session initiating heavy institutional buy triggers.`
    ];
    const notesSellSMC_En = [
      `H4 Bearish Supply block mitigation with solid bearish displacement during ${sessEn} session.`,
      `Mitigation of premium balance level leading to downward market structure break in ${sessEn} session.`
    ];
    const notesSellLIT_En = [
      `Buy-Side Liquidity (BSL) sweep above preceding highs during ${sessEn} session under LIT inducement guidelines.`,
      `LIT Liquidity sweep catching Asian high breakout traps inside ${sessEn} session prior to strong markdown.`
    ];

    const randomIndex = Math.floor(Math.random() * 2);
    let note = '';
    if (language === 'fa') {
      if (type === 'BUY') {
        note = chosenStrategy === 'SMC' ? notesBuySMC[randomIndex] : notesBuyLIT[randomIndex];
      } else {
        note = chosenStrategy === 'SMC' ? notesSellSMC[randomIndex] : notesSellLIT[randomIndex];
      }
    } else {
      if (type === 'BUY') {
        note = chosenStrategy === 'SMC' ? notesBuySMC_En[randomIndex] : notesBuyLIT_En[randomIndex];
      } else {
        note = chosenStrategy === 'SMC' ? notesSellSMC_En[randomIndex] : notesSellLIT_En[randomIndex];
      }
    }

    return {
      id: `sig-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      symbol: asset.symbol,
      type,
      entryPrice: entry,
      tp1: tp1Val,
      tp2: tp2Val,
      tp3: tp3Val,
      sl: slVal,
      timestamp: new Date().toISOString(),
      status: 'ACTIVE' as const,
      notes: note,
      session: chosenSession,
      strategy: chosenStrategy
    };
  };

  const handleAutoIssueSignal = () => {
    const currentProfile = StorageManager.getProfile();
    const currentIsActive = currentProfile.isActivated && (currentProfile.subscriptionTier === 'vip' || currentProfile.subscriptionTier === 'premium');

    if (!currentIsActive) {
      setAutoAlert({
        show: true,
        symbol: activeAsset.symbol,
        type: 'BUY',
        message: language === 'fa'
          ? `🔒 قابلیت صدور دستی سیگنال اونیگاما محدود به نسخه طلایی (VIP) است. کلید فعال‌سازی آزمایشی را از بخش تنظیمات وارد کنید.`
          : `🔒 Autogenerating signals requires a VIP license. Activate a free demo key via the Settings tab.`
      });
      setTimeout(() => {
        setAutoAlert(prev => ({ ...prev, show: false }));
      }, 6505);
      return;
    }

    const generated = generateSmartSignal(activeAsset);
    const updated = [generated, ...signals];
    setSignals(updated);
    StorageManager.saveSignals(updated);
    
    setAutoAlert({
      show: true,
      symbol: activeAsset.symbol,
      type: generated.type,
      message: language === 'fa'
        ? `⚡️ سیگنال معاملاتی جدید سیستم Onigama برای نماد ${activeAsset.symbol} با موفقیت صادر شد!`
        : `⚡️ New Premium Onigama signal issued for ${activeAsset.symbol}!`
    });

    setTimeout(() => {
      setAutoAlert(prev => ({ ...prev, show: false }));
    }, 5500);
  };

  const activeDecimals = getDecimalsForSymbol(selectedSymbol);
  const inputStep = activeAsset.type === 'FOREX' ? (selectedSymbol === 'USDJPY' ? '0.01' : '0.0001') : (selectedSymbol === 'BTCUSD' ? '1' : '0.01');

  return (
    <div className="space-y-6 pb-20 relative">
      
      {/* FLOATING REAL-TIME SYSTEM NOTIFICATION BANNER */}
      {autoAlert.show && (
        <div 
          className="fixed top-5 left-1/2 -translate-x-1/2 z-50 w-[90%] max-w-sm p-4 rounded-2xl glass-card border border-amber-500/20 bg-slate-950/90 backdrop-blur-xl shadow-[0_12px_45px_rgba(245,158,11,0.2)] flex items-start gap-3 transition-all duration-300"
          dir={language === 'fa' ? 'rtl' : 'ltr'}
        >
          <div className="p-1.5 rounded-xl bg-amber-500/10 text-amber-400 shrink-0 mt-0.5">
            <Bell className="w-4 h-4 text-amber-400 animate-pulse" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex justify-between items-baseline mb-0.5">
              <span className="text-[10px] uppercase font-black tracking-wider text-[#6f87a0]">{language === 'fa' ? 'صدور سیگنال سیستم' : 'SYSTEM TRADE ALERT'}</span>
              <span className={`text-[9px] font-black px-1.5 py-0.2 rounded uppercase ${autoAlert.type === 'BUY' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'}`}>
                {autoAlert.type}
              </span>
            </div>
            <p className="text-[11px] text-slate-100 font-bold leading-relaxed">{autoAlert.message}</p>
          </div>
          <button 
            type="button" 
            onClick={() => setAutoAlert(prev => ({ ...prev, show: false }))}
            className="text-slate-500 hover:text-white transition-colors text-xs font-bold leading-none cursor-pointer p-0.5"
          >
            ✕
          </button>
        </div>
      )}
      
      {/* BRAND HEADER & GLOW */}
      <div className="relative overflow-hidden rounded-3xl p-6 glass-card glow-blue shadow-[0_10px_40px_rgba(0,0,0,0.3)]">
        <div className="absolute top-0 right-0 w-48 h-48 bg-[#6f87a0]/10 rounded-full blur-[60px] pointer-events-none" />
        <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-[#6f87a0]/5 rounded-full blur-[50px] pointer-events-none" />

        <div className="flex justify-between items-start" dir={language === 'fa' ? 'rtl' : 'ltr'}>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2.5 h-2.5 bg-emerald-400 rounded-full animate-ping" />
              <h1 className="text-xl font-black text-white tracking-wide">
                ONIGAMA <span className="text-[#6f87a0] font-medium font-mono">FX</span>
              </h1>
            </div>
            <p className="text-[11px] text-slate-400 font-sans tracking-wide">
              {language === 'fa' ? 'داشبورد معاملاتی هوشمند چنددارایی Onigama' : 'Onigama Multi-Asset Premium Monitor'}
            </p>
          </div>
          <button 
            onClick={() => refresh()}
            className="p-2 rounded-2xl bg-white/5 hover:bg-white/10 text-slate-300 border border-white/5 transition-all cursor-pointer"
          >
            <Clock className="w-4 h-4 text-[#6f87a0] animate-spin-slow" />
          </button>
        </div>

        {/* LIVE TICKER CARD */}
        <div 
          className="mt-6 p-4 sm:p-5 rounded-2xl bg-white/2 border border-white/5 backdrop-blur-md relative flex flex-col sm:flex-row gap-4 sm:items-center justify-between"
          dir={language === 'fa' ? 'rtl' : 'ltr'}
        >
          <div className="space-y-1">
            <span className="text-xs sm:text-sm font-semibold text-slate-400 font-sans uppercase tracking-wide">
              {language === 'fa' ? activeAsset.nameFa : `${activeAsset.symbol} (${activeAsset.name})`}
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-xl sm:text-2xl font-bold font-mono tracking-tight text-white transition-all duration-300">
                {formatValue(price, selectedSymbol)}
              </span>
              <span className={`flex items-center text-xs font-mono font-semibold ${isUp ? 'text-emerald-400' : 'text-rose-400'}`}>
                {isUp ? <ArrowUpRight className="w-3.5 h-3.5 mx-0.5" /> : <ArrowDownRight className="w-3.5 h-3.5 mx-0.5" />}
                {change24h > 0 ? '+' : ''}{change24h.toFixed(2)}%
              </span>
            </div>
          </div>

          <div className="flex sm:flex-col gap-4 sm:gap-1 text-xs font-mono text-slate-400 sm:items-end">
            <div className="flex items-center gap-1.5 justify-between w-full sm:w-auto">
              <span className="text-slate-500 font-medium uppercase text-[10px] sm:text-[11px]">
                {language === 'fa' ? 'بیشترین (HIGH):' : 'HIGH:'}
              </span>
              <span className="text-emerald-400 font-bold">{formatValue(high24h, selectedSymbol)}</span>
            </div>
            <div className="flex items-center gap-1.5 justify-between w-full sm:w-auto">
              <span className="text-slate-500 font-medium uppercase text-[10px] sm:text-[11px]">
                {language === 'fa' ? 'کمترین (LOW):' : 'LOW:'}
              </span>
              <span className="text-rose-400 font-bold">{formatValue(low24h, selectedSymbol)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* RESPONSIVE LAYOUT COLUMNS GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* LEFT COLUMN: Market categories (metals, crypto, forex) */}
        <div className="lg:col-span-7 space-y-4">
          
          {/* MULTI-ASSET DASHBOARD GRID */}
          <div className="space-y-4" dir={language === 'fa' ? 'rtl' : 'ltr'}>
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-[#6f87a0] animate-pulse" />
          <h2 className="text-sm font-black text-slate-200 uppercase tracking-wider">
            {language === 'fa' ? 'پایش لحظه‌ای بازار چند دارایی' : 'Multi-Asset Market Monitor'}
          </h2>
        </div>

        {/* Categories Grid - Structured cleanly as 2 columns on larger screens to prevent cramped cards inside col-span-7 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-5">
          
          {/* PRECIOUS METALS - Amber/Golden Vibe */}
          <div className="space-y-3 bg-gradient-to-b from-amber-500/[0.03] to-transparent p-4 rounded-3xl border border-amber-500/10 shadow-lg shadow-amber-950/[0.02]">
            <div className="flex items-center gap-2 pb-2 border-b border-white/5">
              <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400">
                <Gem className="w-4 h-4" />
              </div>
              <div>
                <span className="text-xs font-black text-amber-200 block tracking-tight uppercase">
                  {language === 'fa' ? 'فلزات گرانبها' : 'Precious Metals'}
                </span>
                <span className="text-[9px] text-amber-500/70 font-semibold block uppercase tracking-widest leading-none">
                  Metals Spot
                </span>
              </div>
            </div>

            <div className="space-y-2">
              {assets.filter(a => a.type === 'METALS').map(asset => {
                const isSel = asset.symbol === selectedSymbol;
                const isAssetUp = asset.price >= asset.prevPrice;
                return (
                  <div 
                    key={asset.symbol}
                    onClick={() => setSelectedSymbol(asset.symbol)}
                    className={`p-3 rounded-2xl border transition-all duration-300 cursor-pointer flex justify-between items-center ${
                      isSel 
                        ? 'border-amber-500/50 bg-amber-500/10 shadow-[0_0_15px_rgba(245,158,11,0.15)] ring-1 ring-amber-500/20' 
                        : 'bg-white/[0.02] border-white/5 hover:border-amber-500/20 hover:bg-amber-500/[0.02]'
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-black text-white font-mono">{asset.symbol}</span>
                        <span className="text-[8px] px-1 bg-amber-500/10 text-amber-400 font-bold rounded">SPOT</span>
                      </div>
                      <span className="text-[10px] text-slate-400/80 font-medium block mt-0.5">
                        {language === 'fa' ? asset.nameFa : asset.name}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-bold font-mono text-white block">
                        {formatValue(asset.price, asset.symbol)}
                      </span>
                      <span className={`text-[10px] font-mono font-bold flex items-center justify-end ${isAssetUp ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {isAssetUp ? '▲' : '▼'} {asset.change24h > 0 ? '+' : ''}{asset.change24h.toFixed(2)}%
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* CRYPTO - Purple/Violet Vibe */}
          <div className="space-y-3 bg-gradient-to-b from-purple-500/[0.03] to-transparent p-4 rounded-3xl border border-purple-500/10 shadow-lg shadow-purple-950/[0.02]">
            <div className="flex items-center gap-2 pb-2 border-b border-white/5">
              <div className="p-1.5 rounded-lg bg-purple-500/10 text-purple-400">
                <Coins className="w-4 h-4" />
              </div>
              <div>
                <span className="text-xs font-black text-purple-200 block tracking-tight uppercase">
                  {language === 'fa' ? 'ارزهای دیجیتال' : 'Cryptocurrencies'}
                </span>
                <span className="text-[9px] text-purple-500/70 font-semibold block uppercase tracking-widest leading-none">
                  Digital Assets
                </span>
              </div>
            </div>

            <div className="space-y-2">
              {assets.filter(a => a.type === 'CRYPTO').map(asset => {
                const isSel = asset.symbol === selectedSymbol;
                const isAssetUp = asset.price >= asset.prevPrice;
                return (
                  <div 
                    key={asset.symbol}
                    onClick={() => setSelectedSymbol(asset.symbol)}
                    className={`p-3 rounded-2xl border transition-all duration-300 cursor-pointer flex justify-between items-center ${
                      isSel 
                        ? 'border-purple-500/50 bg-purple-500/10 shadow-[0_0_15px_rgba(168,85,247,0.15)] ring-1 ring-purple-500/20' 
                        : 'bg-white/[0.02] border-white/5 hover:border-purple-500/20 hover:bg-purple-500/[0.02]'
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-black text-white font-mono">{asset.symbol}</span>
                        <span className="text-[8px] px-1 bg-purple-500/10 text-purple-400 font-bold rounded">WEB3</span>
                      </div>
                      <span className="text-[10px] text-slate-400/80 font-medium block mt-0.5">
                        {language === 'fa' ? asset.nameFa : asset.name}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-bold font-mono text-white block">
                        {formatValue(asset.price, asset.symbol)}
                      </span>
                      <span className={`text-[10px] font-mono font-bold flex items-center justify-end ${isAssetUp ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {isAssetUp ? '▲' : '▼'} {asset.change24h > 0 ? '+' : ''}{asset.change24h.toFixed(2)}%
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* FOREX - Emerald/Teal Vibe */}
          <div className="space-y-3 bg-gradient-to-b from-emerald-500/[0.03] to-transparent p-4 rounded-3xl border border-emerald-500/10 shadow-lg shadow-emerald-950/[0.02]">
            <div className="flex items-center gap-2 pb-2 border-b border-white/5">
              <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400">
                <Globe className="w-4 h-4" />
              </div>
              <div>
                <span className="text-xs font-black text-emerald-200 block tracking-tight uppercase">
                  {language === 'fa' ? 'جفت ارزهای اصلی فارکس' : 'Major Forex Pairs'}
                </span>
                <span className="text-[9px] text-emerald-500/70 font-semibold block uppercase tracking-widest leading-none">
                  FX Markets
                </span>
              </div>
            </div>

            <div className="space-y-2">
              {assets.filter(a => a.type === 'FOREX').map(asset => {
                const isSel = asset.symbol === selectedSymbol;
                const isAssetUp = asset.price >= asset.prevPrice;
                return (
                  <div 
                    key={asset.symbol}
                    onClick={() => setSelectedSymbol(asset.symbol)}
                    className={`p-2.5 rounded-2xl border transition-all duration-300 cursor-pointer flex justify-between items-center ${
                      isSel 
                        ? 'border-emerald-500/50 bg-emerald-500/10 shadow-[0_0_15px_rgba(16,185,129,0.15)] ring-1 ring-emerald-500/20' 
                        : 'bg-white/[0.02] border-white/5 hover:border-emerald-500/20 hover:bg-emerald-500/[0.02]'
                    }`}
                  >
                    <div className="truncate">
                      <div className="flex items-center gap-1 max-w-full">
                        <span className="text-xs font-black text-white font-mono break-all leading-none">{asset.symbol}</span>
                        <span className="text-[7.5px] px-1 bg-emerald-500/10 text-emerald-400 font-bold rounded shrink-0">FIAT</span>
                      </div>
                      <span className="text-[9px] text-slate-400/80 font-medium block mt-1 truncate max-w-[100px] lg:max-w-xs">
                        {language === 'fa' ? asset.nameFa : asset.name}
                      </span>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="text-xs font-bold font-mono text-white block">
                        {formatValue(asset.price, asset.symbol)}
                      </span>
                      <span className={`text-[9.5px]/none font-mono font-bold flex items-center justify-end ${isAssetUp ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {isAssetUp ? '▲' : '▼'} {asset.change24h > 0 ? '+' : ''}{asset.change24h.toFixed(2)}%
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* INDICES & ENERGY - Indigo/Sky Vibe */}
          <div className="space-y-3 bg-gradient-to-b from-indigo-500/[0.03] to-transparent p-4 rounded-3xl border border-indigo-500/10 shadow-lg shadow-indigo-950/[0.02]">
            <div className="flex items-center gap-2 pb-2 border-b border-white/5">
              <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-400">
                <Zap className="w-4 h-4 animate-bounce" />
              </div>
              <div>
                <span className="text-xs font-black text-indigo-200 block tracking-tight uppercase">
                  {language === 'fa' ? 'شاخص‌ها و انرژی' : 'Indices & Energies'}
                </span>
                <span className="text-[9px] text-indigo-500/70 font-semibold block uppercase tracking-widest leading-none">
                  Global CFD
                </span>
              </div>
            </div>

            <div className="space-y-2">
              {assets.filter(a => a.type === 'INDICES_COMMODITIES').map(asset => {
                const isSel = asset.symbol === selectedSymbol;
                const isAssetUp = asset.price >= asset.prevPrice;
                const isOil = asset.symbol === 'OIL';
                return (
                  <div 
                    key={asset.symbol}
                    onClick={() => setSelectedSymbol(asset.symbol)}
                    className={`p-2.5 rounded-2xl border transition-all duration-300 cursor-pointer flex justify-between items-center ${
                      isSel 
                        ? 'border-indigo-500/50 bg-indigo-500/10 shadow-[0_0_15px_rgba(99,102,241,0.15)] ring-1 ring-indigo-500/20' 
                        : 'bg-white/[0.02] border-white/5 hover:border-indigo-500/20 hover:bg-indigo-500/[0.02]'
                    }`}
                  >
                    <div className="truncate">
                      <div className="flex items-center gap-1 max-w-full">
                        <span className="text-xs font-black text-white font-mono break-all leading-none">{asset.symbol}</span>
                        <span className={`text-[7.5px] px-1 font-bold rounded shrink-0 ${isOil ? 'bg-orange-500/10 text-orange-400' : 'bg-indigo-500/10 text-indigo-400'}`}>
                          {isOil ? 'COMMODITY' : 'CFD'}
                        </span>
                      </div>
                      <span className="text-[9px] text-slate-400/80 font-medium block mt-1 truncate max-w-[100px] lg:max-w-xs">
                        {language === 'fa' ? asset.nameFa : asset.name}
                      </span>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="text-xs font-bold font-mono text-white block">
                        {formatValue(asset.price, asset.symbol)}
                      </span>
                      <span className={`text-[9.5px]/none font-mono font-bold flex items-center justify-end ${isAssetUp ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {isAssetUp ? '▲' : '▼'} {asset.change24h > 0 ? '+' : ''}{asset.change24h.toFixed(2)}%
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>



      </div>
    </div>
        
        {/* RIGHT COLUMN: Performance metrics and active signals tracking list */}
        <div className="lg:col-span-5 space-y-6">

          {/* CORE MARKET METRICS GRID */}
      <div className="grid grid-cols-3 gap-3" dir={language === 'fa' ? 'rtl' : 'ltr'}>
        <div className="p-4 rounded-2xl glass-card text-center">
          <span className="text-[10px] text-slate-400 block font-semibold mb-1 uppercase tracking-wider">
            {language === 'fa' ? 'کل معاملات' : 'Total Trades'}
          </span>
          <span className="text-xl font-black font-mono text-white">
            {stats.tradesCount}
          </span>
        </div>
        <div className="p-4 rounded-2xl glass-card text-center relative overflow-hidden">
          <span className="text-[10px] text-emerald-400 block font-bold mb-1 uppercase tracking-wider">
            {language === 'fa' ? 'وین ریت امروز' : 'Win Rate'}
          </span>
          <span className="text-xl font-black font-mono text-white">
            {stats.winRate}%
          </span>
        </div>
        <div className="p-4 rounded-2xl glass-card text-center">
          <span className="text-[10px] text-[#6f87a0] block font-bold mb-1 uppercase tracking-wider">
            {language === 'fa' ? 'سود کل (USD)' : 'Net PnL'}
          </span>
          <span className={`text-sm font-black font-mono block mt-0.5 ${stats.totalProfit >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
            ${stats.totalProfit >= 0 ? '+' : ''}{stats.totalProfit.toLocaleString(undefined, { maximumFractionDigits: 0 })}
          </span>
        </div>
      </div>

      {/* QUICK WORKFLOW ROW */}
      <div className="flex flex-col sm:flex-row gap-3">
        <button
          onClick={() => onNavigate('analysis')}
          className="flex-1 py-3.5 px-4 rounded-2xl bg-gradient-to-r from-[#6f87a0] to-[#516579] hover:from-[#5e748d] hover:to-[#45576a] text-white font-bold text-xs flex justify-center items-center gap-2 shadow-lg transition-all cursor-pointer"
        >
          <Zap className="w-4 h-4 text-white" />
          {language === 'fa' ? 'نمودار و سطوح SMC' : 'View SMC Charts & Levels'}
        </button>

        <button
          onClick={() => setIsAddingSignal(!isAddingSignal)}
          className="flex-1 py-3.5 px-4 rounded-2xl bg-white/5 hover:bg-white/10 text-white border border-white/10 font-bold text-xs flex items-center justify-center gap-2 cursor-pointer transition-all"
        >
          <Plus className="w-4 h-4 text-[#6f87a0]" />
          {language === 'fa' ? `سیگنال جدید (${selectedSymbol})` : `New ${selectedSymbol} Signal`}
        </button>

        <button
          onClick={handleAutoIssueSignal}
          className="flex-1 py-3.5 px-4 rounded-2xl bg-gradient-to-r from-amber-500/10 to-amber-600/15 hover:from-amber-500/20 hover:to-amber-600/25 text-amber-300 border border-amber-500/30 font-bold text-xs flex items-center justify-center gap-2 cursor-pointer transition-all shadow-[0_0_15px_rgba(245,158,11,0.08)]"
          title={language === 'fa' ? 'صدور خودکار سیگنال سودآوری با استفاده از هوش Onigama' : 'Auto-Generate Premium Signal'}
        >
          <Activity className="w-4 h-4 text-amber-400 animate-pulse" />
          {language === 'fa' ? 'صدور سیگنال خودکار' : 'Issue Auto Signal'}
        </button>
      </div>

      {/* ADD SIGNAL CONTAINER */}
      {isAddingSignal && (
        <form 
          onSubmit={handleCreateSignal} 
          className="p-5 rounded-2xl glass-card border border-white/10 shadow-xl space-y-4"
          dir={language === 'fa' ? 'rtl' : 'ltr'}
        >
          <div className="flex justify-between items-center mb-1">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">
              {language === 'fa' ? `افزودن سیگنال شبیه‌ساز ${selectedSymbol}` : `Create ${selectedSymbol} Signal Simulator`}
            </h3>
            <button 
              type="button" 
              onClick={() => setIsAddingSignal(false)}
              className="text-xs text-rose-400 underline font-mono"
            >
              {language === 'fa' ? 'لغو' : 'Cancel'}
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] text-slate-400 font-semibold block mb-1.5 uppercase tracking-wide">{language === 'fa' ? 'نوع معامله' : 'Signal Type'}</label>
              <div className="flex gap-1.5">
                <button
                  type="button"
                  onClick={() => setSigType('BUY')}
                  className={`flex-1 py-1.5 px-2 rounded-xl text-xs font-bold text-center border transition-all ${
                    sigType === 'BUY' 
                      ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40 glow-emerald' 
                      : 'bg-white/5 text-slate-400 border-transparent'
                  }`}
                >
                  BUY
                </button>
                <button
                  type="button"
                  onClick={() => setSigType('SELL')}
                  className={`flex-1 py-1.5 px-2 rounded-xl text-xs font-bold text-center border transition-all ${
                    sigType === 'SELL' 
                      ? 'bg-rose-500/20 text-rose-400 border-rose-500/40' 
                      : 'bg-white/5 text-slate-400 border-transparent'
                  }`}
                >
                  SELL
                </button>
              </div>
            </div>
            <div>
              <label className="text-[10px] text-slate-400 font-semibold block mb-1.5 uppercase tracking-wide">{language === 'fa' ? 'قیمت ورود' : 'Entry Price'}</label>
              <input
                type="number"
                step={inputStep}
                required
                placeholder={price.toFixed(activeDecimals)}
                value={sigEntry}
                onChange={e => setSigEntry(e.target.value)}
                className="w-full bg-white/5 border border-white/10 focus:border-[#6f87a0] font-mono text-xs rounded-xl p-2.5 text-white outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] text-slate-400 font-semibold block mb-1.5 uppercase tracking-wide">Take Profit (TP1)</label>
              <input
                type="number"
                step={inputStep}
                required
                placeholder={(price + (sigType === 'BUY' ? (activeAsset.type === 'FOREX' ? 0.0020 : 5) : (activeAsset.type === 'FOREX' ? -0.0020 : -5))).toFixed(activeDecimals)}
                value={sigTp1}
                onChange={e => setSigTp1(e.target.value)}
                className="w-full bg-white/5 border border-white/10 focus:border-emerald-400 font-mono text-xs rounded-xl p-2.5 text-white outline-none"
              />
            </div>
            <div>
              <label className="text-[10px] text-slate-400 font-semibold block mb-1.5 uppercase tracking-wide">Stop Loss (SL)</label>
              <input
                type="number"
                step={inputStep}
                required
                placeholder={(price - (sigType === 'BUY' ? (activeAsset.type === 'FOREX' ? 0.0035 : 8) : (activeAsset.type === 'FOREX' ? -0.0035 : -8))).toFixed(activeDecimals)}
                value={sigSl}
                onChange={e => setSigSl(e.target.value)}
                className="w-full bg-white/5 border border-white/10 focus:border-rose-400 font-mono text-xs rounded-xl p-2.5 text-white outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] text-slate-400 font-semibold block mb-1.5 uppercase tracking-wide">
                {language === 'fa' ? 'سشن معاملاتی' : 'Trading Session'}
              </label>
              <div className="flex gap-1">
                {(['ASIA', 'LONDON', 'NY'] as const).map(sess => (
                  <button
                    key={sess}
                    type="button"
                    onClick={() => setSigSession(sess)}
                    className={`flex-1 py-1.5 px-1 rounded-xl text-[10px] font-bold text-center border transition-all ${
                      sigSession === sess 
                        ? 'bg-[#6f87a0]/25 text-white border-[#6f87a0]/40' 
                        : 'bg-white/5 text-slate-400 border-transparent hover:bg-white/8'
                    }`}
                  >
                    {sess}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-[10px] text-slate-400 font-semibold block mb-1.5 uppercase tracking-wide">
                {language === 'fa' ? 'سبک معاملاتی' : 'Strategy Style'}
              </label>
              <div className="flex gap-1.5">
                {(['SMC', 'LIT'] as const).map(strat => (
                  <button
                    key={strat}
                    type="button"
                    onClick={() => setSigStrategy(strat)}
                    className={`flex-1 py-1.5 px-2 rounded-xl text-xs font-bold text-center border transition-all ${
                      sigStrategy === strat 
                        ? 'bg-amber-500/15 text-amber-300 border-amber-500/30' 
                        : 'bg-white/5 text-slate-400 border-transparent hover:bg-white/8'
                    }`}
                  >
                    {strat}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-[#6f87a0] text-white hover:bg-[#5e748d] text-xs font-black rounded-xl transition-all uppercase tracking-wider cursor-pointer"
          >
            {language === 'fa' ? `ثبت سیگنال ${selectedSymbol}` : `Publish ${selectedSymbol} Signal`}
          </button>
        </form>
      )}

      {/* TRADING SIGNALS SECTION */}
      <div className="space-y-3" dir={language === 'fa' ? 'rtl' : 'ltr'}>
        {(() => {
          const filteredSignals = signals.filter(s => {
            const sym = s.symbol.toUpperCase();
            const symbolMatches = sym === selectedSymbol.toUpperCase() || (selectedSymbol === 'XAUUSD' && sym.includes('GOLD'));
            if (!symbolMatches) return false;

            const sSession = s.session || 'LONDON';
            const sStrategy = s.strategy || 'SMC';

            if (filterSession !== 'ALL' && sSession !== filterSession) return false;
            if (filterStrategy !== 'ALL' && sStrategy !== filterStrategy) return false;

            return true;
          });

          return (
            <>
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <Bell className="w-4 h-4 text-[#6f87a0]" />
                  <h2 className="text-base font-bold text-white tracking-wide">
                    {language === 'fa' 
                      ? `سیگنال‌های معاملاتی ${selectedSymbol}` 
                      : `Trading Signals (${selectedSymbol})`}
                  </h2>
                </div>
                <span className="text-[10.5px] bg-white/5 border border-white/5 px-2.5 py-0.5 rounded-full text-white font-mono font-bold">
                  {filteredSignals.filter(s => s.status === 'ACTIVE').length} {language === 'fa' ? 'فعال' : 'Active'}
                </span>
              </div>

              {/* SESSION & STRATEGY FILTERS CONTROL PANEL */}
              <div className="p-4 rounded-2xl bg-white/2 border border-white/5 space-y-3">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs">
                  {/* Session Filters */}
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider whitespace-nowrap">
                      {language === 'fa' ? 'فیلتر سشن:' : 'Session Filter:'}
                    </span>
                    <div className="flex gap-1 flex-wrap">
                      {([
                        { value: 'ALL', label: language === 'fa' ? 'همه' : 'ALL' },
                        { value: 'ASIA', label: 'ASIA' },
                        { value: 'LONDON', label: 'LONDON' },
                        { value: 'NY', label: 'NY' }
                      ] as const).map(item => (
                        <button
                          key={item.value}
                          type="button"
                          onClick={() => setFilterSession(item.value)}
                          className={`px-2.5 py-1 text-[10px] font-bold rounded-lg border transition-all cursor-pointer ${
                            filterSession === item.value
                              ? 'bg-[#6f87a0]/30 text-white border-[#6f87a0]/50 shadow-[0_0_12px_rgba(111,135,160,0.15)]'
                              : 'bg-white/3 text-slate-400 border-transparent hover:bg-white/8'
                          }`}
                        >
                          {item.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Strategy Styles Filters */}
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider whitespace-nowrap">
                      {language === 'fa' ? 'فیلتر سبک:' : 'Style Filter:'}
                    </span>
                    <div className="flex gap-1 flex-wrap">
                      {([
                        { value: 'ALL', label: language === 'fa' ? 'همه' : 'ALL' },
                        { value: 'SMC', label: 'SMC' },
                        { value: 'LIT', label: 'LIT' }
                      ] as const).map(item => (
                        <button
                          key={item.value}
                          type="button"
                          onClick={() => setFilterStrategy(item.value)}
                          className={`px-2.5 py-1 text-[10px] font-bold rounded-lg border transition-all cursor-pointer ${
                            filterStrategy === item.value
                              ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 shadow-[0_0_12px_rgba(245,158,11,0.12)]'
                              : 'bg-white/3 text-slate-400 border-transparent hover:bg-white/8'
                          }`}
                        >
                          {item.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {filteredSignals.length === 0 ? (
                <div className="p-10 text-center glass-card rounded-2xl">
                  <p className="text-xs text-slate-400 font-sans">
                    {language === 'fa' 
                      ? `هیچ سیگنالی با فیلترهای کنونی یافت نشد. با دکمه بالا می‌توانید اولین شبیه‌ساز را ثبت کنید!` 
                      : `No trade signals found matching corporate filters. Use the buttons above to publish one!`}
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredSignals.map((sig) => {
                    const isActive = sig.status === 'ACTIVE';
                    const isBuy = sig.type === 'BUY';
                    const decs = getDecimalsForSymbol(sig.symbol);

                    return (
                      <div 
                        key={sig.id}
                        className={`p-5 rounded-3xl glass-card transition-all flex flex-col justify-between ${
                          isActive ? 'glow-emerald border-emerald-500/20' : 'hover:border-white/12'
                        }`}
                      >
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded tracking-wide ${
                                isBuy 
                                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                                  : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                              }`}>
                                {sig.type}
                              </span>
                              <span className="text-xs font-bold text-white font-mono">{sig.symbol}</span>

                              {/* Session Badge */}
                              <span className="text-[9px] font-black px-1.5 py-0.5 rounded-md bg-white/5 border border-white/8 text-[#8da6c0] font-mono tracking-wider">
                                {sig.session || 'LONDON'}
                              </span>

                              {/* Strategy Badge */}
                              <span className={`text-[9px] font-black px-1.5 py-0.5 rounded-md font-mono tracking-wider ${
                                (sig.strategy || 'SMC') === 'LIT'
                                  ? 'bg-amber-500/10 text-amber-300 border border-amber-500/15'
                                  : 'bg-[#6f87a0]/10 text-slate-200 border border-[#6f87a0]/15'
                              }`}>
                                {sig.strategy || 'SMC'}
                              </span>
                            </div>
                            <span className="text-[9px] text-slate-500 font-mono block mt-1">
                              {new Date(sig.timestamp).toLocaleTimeString(undefined, {hour: '2-digit', minute:'2-digit'})} | {new Date(sig.timestamp).toLocaleDateString()}
                            </span>
                          </div>

                          <div className="flex items-center gap-1.5">
                            <span className={`text-[9.5px] font-bold font-mono px-1.5 py-0.5 rounded uppercase ${
                              isActive 
                                ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-504/20 animate-pulse' 
                                : sig.status === 'SL'
                                ? 'bg-rose-500/15 text-rose-400 border border-rose-500/15'
                                : 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/15'
                            }`}>
                              {sig.status}
                            </span>
                            
                            <button 
                              onClick={() => handleDeleteSignal(sig.id)}
                              className="p-1 rounded bg-white/5 hover:bg-white/10 text-slate-500 hover:text-rose-400 text-xs transition-colors cursor-pointer"
                              title="Delete Signal"
                            >
                              ✕
                            </button>
                          </div>
                        </div>

                        {/* KEY METRICS OF SIGNAL */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-y-3.5 gap-x-2 bg-white/2 p-3.5 rounded-2xl border border-white/5 font-mono text-center mb-3">
                          <div className="border-r border-white/5 last:border-r-0 sm:border-r-0">
                            <span className="text-[9px] text-slate-500 block mb-1 font-sans">{language === 'fa' ? 'ورود' : 'ENTRY'}</span>
                            <span className="text-xs sm:text-sm font-bold text-slate-300 break-all">{formatValue(sig.entryPrice, sig.symbol)}</span>
                          </div>
                          <div>
                            <span className="text-[9px] text-slate-500 block mb-1 font-sans">{language === 'fa' ? 'حد سود ۱' : 'TP 1'}</span>
                            <span className={`text-xs sm:text-sm font-bold break-all ${['TP1','TP2','TP3'].includes(sig.status) ? 'text-emerald-400 line-through decoration-1 text-opacity-65' : 'text-slate-300'}`}>
                              {formatValue(sig.tp1, sig.symbol)}
                            </span>
                          </div>
                          <div className="border-r border-white/5 last:border-r-0 sm:border-r-0">
                            <span className="text-[9px] text-slate-500 block mb-1 font-sans">{language === 'fa' ? 'حد سود ۲' : 'TP 2'}</span>
                            <span className={`text-xs sm:text-sm font-bold break-all ${['TP2','TP3'].includes(sig.status) ? 'text-emerald-400 line-through decoration-1 text-opacity-65' : 'text-slate-300'}`}>
                              {formatValue(sig.tp2, sig.symbol)}
                            </span>
                          </div>
                          <div>
                            <span className="text-[9px] text-slate-400 block mb-1 font-sans">{language === 'fa' ? 'حد ضرر (SL)' : 'STOP LOSS'}</span>
                            <span className={`text-xs sm:text-sm font-bold break-all ${sig.status === 'SL' ? 'text-rose-400 line-through decoration-1 text-opacity-65' : 'text-slate-300'}`}>
                              {formatValue(sig.sl, sig.symbol)}
                            </span>
                          </div>
                        </div>

                        {sig.notes && (
                          <p className="text-[11px] text-slate-400 mb-2 leading-relaxed bg-white/2 p-2.5 rounded-xl border border-white/5">
                            {sig.notes}
                          </p>
                        )}

                        {/* ACTIVE ACTIONS SIMULATOR FOR CONVENIENT USER MANAGEMENT */}
                        {isActive && (
                          <div className="flex gap-1 mt-1 justify-end">
                            <span className="text-[10px] text-slate-500 self-center mr-auto font-sans">
                              {language === 'fa' ? 'حرکت به هدف:' : 'Hit Target:'}
                            </span>
                            <button 
                              onClick={() => handleResolveSignal(sig.id, 'TP1')}
                              className="px-2.5 py-1 text-[10px] font-bold bg-emerald-500/10 hover:bg-emerald-500/25 border border-emerald-500/25 rounded-lg text-emerald-400 cursor-pointer"
                            >
                              TP1
                            </button>
                            <button 
                              onClick={() => handleResolveSignal(sig.id, 'TP2')}
                              className="px-2.5 py-1 text-[10px] font-bold bg-emerald-500/10 hover:bg-emerald-500/25 border border-emerald-500/25 rounded-lg text-emerald-400 cursor-pointer"
                            >
                              TP2
                            </button>
                            <button 
                              onClick={() => handleResolveSignal(sig.id, 'TP3')}
                              className="px-2.5 py-1 text-[10px] font-bold bg-emerald-500/10 hover:bg-emerald-500/25 border border-emerald-500/25 rounded-lg text-emerald-400 cursor-pointer"
                            >
                              TP3
                            </button>
                            <button 
                              onClick={() => handleResolveSignal(sig.id, 'SL')}
                              className="px-2.5 py-1 text-[10px] font-bold bg-rose-500/10 hover:bg-rose-500/25 border border-rose-500/25 rounded-lg text-rose-400 cursor-pointer"
                            >
                              SL
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          );
        })()}
      </div>

        </div>
      </div>

    </div>
  );
}
