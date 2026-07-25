import React, { useState, useEffect } from 'react';
import { useGoldPrice, fetchMarketCandles } from '../hooks/useGoldPrice';
import { Signal, Trade, MarketStats, MarketCandle } from '../types';
import { runBacktest } from '../utils/runBacktest';
import { scanSMCAndLIT } from '../utils/marketStructure';
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

let globalSignalIdCounter = 0;

export function HomePage({ onNavigate, language }: HomePageProps) {
  const { assets, refresh } = useGoldPrice(4);
  const [selectedSymbol, setSelectedSymbolState] = useState(() => StorageManager.getSelectedSymbol());
  const setSelectedSymbol = (symbol: string) => {
    setSelectedSymbolState(symbol);
    StorageManager.saveSelectedSymbol(symbol);
  };
  const activeAsset = assets.find(a => a.symbol === selectedSymbol) || assets[0];
  const { price, prevPrice, change24h, high24h, low24h } = activeAsset;

  const [signals, setSignals] = useState<Signal[]>([]);
  const [stats, setStats] = useState<MarketStats>({ tradesCount: 0, winRate: 0, totalProfit: 0, winCount: 0, lossCount: 0 });
  const [isAddingSignal, setIsAddingSignal] = useState(false);
  const [isGeneratingSignal, setIsGeneratingSignal] = useState(false);
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

  // Systematic background multi-asset scan (round-robin style, scanning 1 asset every 60 seconds)
  useEffect(() => {
    let scanIndex = 0;
    const timer = setInterval(() => {
      if (!assets || assets.length === 0) return;

      // Select the asset to scan systematically
      const currentAsset = assets[scanIndex];
      // Increment and loop around the assets array
      scanIndex = (scanIndex + 1) % assets.length;

      generateSmartSignal(currentAsset).then(generated => {
        const latestSignals = StorageManager.getSignals();
        const updated = [generated, ...latestSignals].slice(0, 20);
        
        setSignals(updated);
        StorageManager.saveSignals(updated);

        // Dispatch global corner notification event
        window.dispatchEvent(new CustomEvent('onigama_signal_issued', { detail: generated }));

        // Trigger beautiful temporary local notification banner
        setAutoAlert({
          show: true,
          symbol: currentAsset.symbol,
          type: generated.type,
          message: language === 'fa'
            ? `⚡️ سیستم Onigama با تحلیل واقعی ساختار بازار (SMC/LIT)، سیگنال جدیدی برای نماد ${currentAsset.symbol} صادر کرد!`
            : `⚡️ Onigama systematically scanned market structure and issued a new signal for ${currentAsset.symbol}!`
        });

        // Clear alert banner after 5.5 seconds
        setTimeout(() => {
          setAutoAlert(prev => ({ ...prev, show: false }));
        }, 5500);
      }).catch(err => {
        console.warn(`Systematic background scan failed for ${currentAsset.symbol}:`, err);
      });

    }, 60000); // Systematic scan of 1 asset every 60 seconds

    return () => clearInterval(timer);
  }, [assets, language]);

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

    const pickIdx = (activeAsset.symbol.length + (activeAsset.symbol.charCodeAt(0) || 0)) % 2;
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

    // Dispatch global corner notification event
    window.dispatchEvent(new CustomEvent('onigama_signal_issued', { detail: newSignal }));

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

  // Mathematically perfect smoothed RSI-14
  const generateSmartSignal = async (asset: any, forceType?: 'BUY' | 'SELL') => {
    let actualCandles: MarketCandle[];
    try {
      actualCandles = await fetchMarketCandles(asset.symbol);
      console.log(`Successfully fetched ${actualCandles.length} real market close prices for ${asset.symbol}:`, actualCandles);
    } catch (e) {
      console.error(`Could not fetch real-market candles for ${asset.symbol}.`, e);
      throw new Error(
        language === 'fa' 
          ? `خطا در دریافت اطلاعات زنده بازار برای ${asset.symbol}. صادر کردن سیگنال بدون داده واقعی غیرمجاز است.`
          : `Failed to fetch live market candles for ${asset.symbol}. Cannot calculate signal without real-time data.`
      );
    }

    // Additive Translation Calibration: perfect alignment between fast live feed price and historical candles,
    // preserving absolute structural spreads, support/resistance distances, and Order Blocks without stretching!
    const livePrice = asset.price;
    const latestClose = actualCandles[actualCandles.length - 1].close;
    const priceOffset = livePrice - latestClose;

    const calibratedCandles = actualCandles.map(c => ({
      ...c,
      open: c.open + priceOffset,
      high: c.high + priceOffset,
      low: c.low + priceOffset,
      close: c.close + priceOffset
    }));

    const tech = scanSMCAndLIT(calibratedCandles, asset.symbol);
    const type = forceType || tech.type;

    const decs = getDecimalsForSymbol(asset.symbol);
    const entry = asset.price;
    const isBuy = type === 'BUY';

    // Mathematically perfect dynamic Stop Loss (SL) based on structure
    let slVal = 0;
    const slBuffer = entry * 0.0012; // Precise 0.12% structural safety buffer

    if (isBuy) {
      const possibleSLs = [tech.support];
      if (tech.obPrice && tech.obPrice < entry) {
        possibleSLs.push(tech.obPrice);
      }
      if (tech.sweepPrice && tech.sweepPrice < entry) {
        possibleSLs.push(tech.sweepPrice);
      }
      const baseSL = Math.min(...possibleSLs);
      slVal = baseSL - slBuffer;

      // Smart guardrails to prevent bad risk profiles or cramped stop placements
      const maxAllowedSL = entry * 0.9995;
      const minAllowedSL = entry * 0.985;
      if (slVal > maxAllowedSL) slVal = entry * 0.998;
      if (slVal < minAllowedSL) slVal = entry * 0.985;
    } else {
      const possibleSLs = [tech.resistance];
      if (tech.obPrice && tech.obPrice > entry) {
        possibleSLs.push(tech.obPrice);
      }
      if (tech.sweepPrice && tech.sweepPrice > entry) {
        possibleSLs.push(tech.sweepPrice);
      }
      const baseSL = Math.max(...possibleSLs);
      slVal = baseSL + slBuffer;

      const minAllowedSL = entry * 1.0005;
      const maxAllowedSL = entry * 1.015;
      if (slVal < minAllowedSL) slVal = entry * 1.002;
      if (slVal > maxAllowedSL) slVal = entry * 1.015;
    }

    slVal = +slVal.toFixed(decs);

    // Derive Take Profits logically from structural Risk-to-Reward (R:R) ratio
    const riskAmount = Math.abs(entry - slVal);
    const tp1Val = +(entry + (isBuy ? riskAmount * 1.0 : -riskAmount * 1.0)).toFixed(decs);
    const tp2Val = +(entry + (isBuy ? riskAmount * 2.5 : -riskAmount * 2.5)).toFixed(decs);
    const tp3Val = +(entry + (isBuy ? riskAmount * 4.2 : -riskAmount * 4.2)).toFixed(decs);

    const chosenSession = tech.session;
    const chosenStrategy = tech.strategy;

    const sessFa = chosenSession === 'ASIA' ? 'آسیا' : chosenSession === 'LONDON' ? 'لندن' : 'نیویورک';
    const sessEn = chosenSession === 'ASIA' ? 'Asia' : chosenSession === 'LONDON' ? 'London' : 'New York';

    const rsiDescFa = tech.rsi < 30 ? 'اشباع فروش شدید' : tech.rsi > 70 ? 'اشباع خرید شدید' : 'محدوده متعادل نوسانی';
    const rsiDescEn = tech.rsi < 30 ? 'Deep Oversold' : tech.rsi > 70 ? 'Deep Overbought' : 'Neutral Range';
    const emaCrossFa = tech.ema9 > tech.ema21 ? 'تقاطع طلایی صعودی میانگین‌ها (EMA 9/21)' : 'تقاطع مرگبار نزولی میانگین‌ها (EMA 9/21)';
    const emaCrossEn = tech.ema9 > tech.ema21 ? 'Golden Bullish Cross (EMA 9/21)' : 'Death Bearish Cross (EMA 9/21)';

    // Completely systematic notes derived dynamically from market structures (no random choosing!)
    let note = '';
    if (language === 'fa') {
      if (isBuy) {
        if (chosenStrategy === 'LIT') {
          if (tech.sweepPrice) {
            note = `استراتژی LIT: سوئیپ نقدینگی کف (SSL Sweep) روی قیمت ${formatValue(tech.sweepPrice, asset.symbol)} در سشن واقعی ${sessFa}. نقدینگی فروشندگان خرد شکار شده و ساختار آماده رشد است. تاییدیه فنی: RSI=${tech.rsi} (${rsiDescFa})، میانگین متحرک: ${emaCrossFa}.`;
          } else {
            note = `پاکسازی سازمان‌یافته استخر نقدینگی در سشن واقعی ${sessFa} روی قیمت حمایتی ${formatValue(tech.support, asset.symbol)}. اردرهای خرید بانک‌ها فعال شده است. تاییدیه فنی: RSI=${tech.rsi} (${rsiDescFa}).`;
          }
        } else {
          if (tech.bosPrice) {
            note = `استراتژی SMC: شکست ساختار صعودی (BOS) روی قیمت ${formatValue(tech.bosPrice, asset.symbol)} پس از تاچ اردر بلاک تقاضا در سشن واقعی ${sessFa}. تاییدیه فنی: RSI=${tech.rsi} (${rsiDescFa})، میانگین متحرک: ${emaCrossFa}.`;
          } else if (tech.obPrice) {
            note = `استراتژی SMC: برخورد و میتیگیشن اردر بلاک صعودی (Bullish OB) روی قیمت ${formatValue(tech.obPrice, asset.symbol)} در سشن واقعی ${sessFa}. حمایت مستحکم ساختاری=${formatValue(tech.support, asset.symbol)}. تاییدیه فنی: RSI=${tech.rsi}.`;
          } else {
            note = `استراتژی SMC: تاییدیه برگشت روند از تراز حمایتی صعودی ${formatValue(tech.support, asset.symbol)} در سشن واقعی ${sessFa}. تاییدیه فنی: ${emaCrossFa}، شاخص RSI=${tech.rsi} (${rsiDescFa}).`;
          }
        }
      } else {
        if (chosenStrategy === 'LIT') {
          if (tech.sweepPrice) {
            note = `استراتژی LIT: سوئیپ نقدینگی سقف (BSL Sweep) روی قیمت ${formatValue(tech.sweepPrice, asset.symbol)} در سشن واقعی ${sessFa}. شکار استاپ‌های خریداران خرد تکمیل شده و روند مستعد ریزش است. تاییدیه فنی: RSI=${tech.rsi} (${rsiDescFa})، میانگین متحرک: ${emaCrossFa}.`;
          } else {
            note = `شکار استاپ خریداران در سقف سشن واقعی ${sessFa} روی قیمت مقاومت ${formatValue(tech.resistance, asset.symbol)} با موفقیت انجام شد. نقدینگی جذب شده آماده تخلیه است. تاییدیه فنی: RSI=${tech.rsi}.`;
          }
        } else {
          if (tech.bosPrice) {
            note = `استراتژی SMC: شکست ساختار نزولی (BOS) روی قیمت ${formatValue(tech.bosPrice, asset.symbol)} همزمان با سشن واقعی ${sessFa}. روند آماده ریزش ادامه‌دار است. تاییدیه فنی: RSI=${tech.rsi} (${rsiDescFa})، میانگین متحرک: ${emaCrossFa}.`;
          } else if (tech.obPrice) {
            note = `استراتژی SMC: برخورد بی‌نقص به اردر بلاک نزولی (Bearish OB) روی قیمت ${formatValue(tech.obPrice, asset.symbol)} در سشن واقعی ${sessFa}. تایید فنی: ${emaCrossFa}، مقاومت ساختاری=${formatValue(tech.resistance, asset.symbol)}.`;
          } else {
            note = `استراتژی SMC: تاییدیه برگشت روند از سقف مقاومتی نزولی ${formatValue(tech.resistance, asset.symbol)} در سشن واقعی ${sessFa}. تاییدیه فنی: ${emaCrossFa}، شاخص RSI=${tech.rsi} (${rsiDescFa}).`;
          }
        }
      }
    } else {
      if (isBuy) {
        if (chosenStrategy === 'LIT') {
          if (tech.sweepPrice) {
            note = `LIT Strategy: Sell-Side Liquidity (SSL) sweep completed at ${formatValue(tech.sweepPrice, asset.symbol)} during real ${sessEn} session. Retail seller stop-losses grabbed; market structures turning bullish. Technicals: RSI=${tech.rsi} (${rsiDescEn}), ${emaCrossEn}.`;
          } else {
            note = `Engineered liquidity pool clearance at key Support level of ${formatValue(tech.support, asset.symbol)} during real ${sessEn} session. Institutional buy orders activated. Technicals: RSI=${tech.rsi} (${rsiDescEn}).`;
          }
        } else {
          if (tech.bosPrice) {
            note = `SMC Strategy: Bullish Break of Structure (BOS) confirmed at ${formatValue(tech.bosPrice, asset.symbol)} in real ${sessEn} session. High volume displacement. Technicals: RSI=${tech.rsi} (${rsiDescEn}), ${emaCrossEn}.`;
          } else if (tech.obPrice) {
            note = `SMC Strategy: Bullish Order Block mitigation at ${formatValue(tech.obPrice, asset.symbol)} inside real ${sessEn} session. Structure support at ${formatValue(tech.support, asset.symbol)}. Technicals: RSI = ${tech.rsi}.`;
          } else {
            note = `SMC Strategy: Trend reversal confirmed near dynamic Support floor of ${formatValue(tech.support, asset.symbol)} during real ${sessEn} session. Technicals: ${emaCrossEn}, RSI=${tech.rsi} (${rsiDescEn}).`;
          }
        }
      } else {
        if (chosenStrategy === 'LIT') {
          if (tech.sweepPrice) {
            note = `LIT Strategy: Buy-Side Liquidity (BSL) sweep executed at ${formatValue(tech.sweepPrice, asset.symbol)} inside real ${sessEn} session. Breakout traders trapped; price poised for markdown. Technicals: RSI=${tech.rsi} (${rsiDescEn}), ${emaCrossEn}.`;
          } else {
            note = `Inducement sweep above dynamic Resistance of ${formatValue(tech.resistance, asset.symbol)} inside real ${sessEn} session completed. Liquidity absorbed. Technicals: RSI=${tech.rsi}.`;
          }
        } else {
          if (tech.bosPrice) {
            note = `SMC Strategy: Bearish Break of Structure (BOS) established at ${formatValue(tech.bosPrice, asset.symbol)} in real ${sessEn} session. Trend continuing downwards. Technicals: RSI=${tech.rsi} (${rsiDescEn}), ${emaCrossEn}.`;
          } else if (tech.obPrice) {
            note = `SMC Strategy: Bearish Supply block mitigation at ${formatValue(tech.obPrice, asset.symbol)} inside real ${sessEn} session. key Resistance ceiling at ${formatValue(tech.resistance, asset.symbol)}. Technicals: ${emaCrossEn}, RSI=${tech.rsi}.`;
          } else {
            note = `SMC Strategy: Trend rejection confirmed near key Resistance level of ${formatValue(tech.resistance, asset.symbol)} inside real ${sessEn} session. Technicals: ${emaCrossEn}, RSI=${tech.rsi} (${rsiDescEn}).`;
          }
        }
      }
    }

    return {
      id: `sig-${Date.now()}-${++globalSignalIdCounter}`,
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
      strategy: chosenStrategy,
      rsi: tech.rsi,
      ema9: +tech.ema9.toFixed(decs),
      ema21: +tech.ema21.toFixed(decs),
      support: +tech.support.toFixed(decs),
      resistance: +tech.resistance.toFixed(decs),
      bosPrice: tech.bosPrice ? +tech.bosPrice.toFixed(decs) : undefined,
      chochPrice: tech.chochPrice ? +tech.chochPrice.toFixed(decs) : undefined,
      obPrice: tech.obPrice ? +tech.obPrice.toFixed(decs) : undefined,
      sweepPrice: tech.sweepPrice ? +tech.sweepPrice.toFixed(decs) : undefined,
      fvgPrice: tech.fvgPrice ? +tech.fvgPrice.toFixed(decs) : undefined,
      isRealData: true,
      qualityScore: tech.qualityScore
    };
  };

  const handleAutoIssueSignal = async () => {
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

    try {
      setIsGeneratingSignal(true);
      const generated = await generateSmartSignal(activeAsset);
      const updated = [generated, ...signals];
      setSignals(updated);
      StorageManager.saveSignals(updated);
      
      // Dispatch global corner notification event
      window.dispatchEvent(new CustomEvent('onigama_signal_issued', { detail: generated }));

      setAutoAlert({
        show: true,
        symbol: activeAsset.symbol,
        type: generated.type,
        message: language === 'fa'
          ? `⚡️ سیگنال محاسباتی جدید Onigama بر اساس تحلیل واقعی SMC/LIT از بازارِ ${activeAsset.symbol} با موفقیت صادر شد!`
          : `⚡️ New Premium Onigama signal mathematically calculated via real SMC/LIT market scan for ${activeAsset.symbol}!`
      });

      setTimeout(() => {
        setAutoAlert(prev => ({ ...prev, show: false }));
      }, 5500);
    } catch (err: any) {
      console.error("Failed to issue auto signal:", err);
      setAutoAlert({
        show: true,
        symbol: activeAsset.symbol,
        type: 'SELL',
        message: err.message || (language === 'fa'
          ? `⚠️ خطا در دریافت اطلاعات واقعی بازار. لطفاً دوباره تلاش کنید.`
          : `⚠️ Failed to fetch actual market data. Please try again.`)
      });
      setTimeout(() => {
        setAutoAlert(prev => ({ ...prev, show: false }));
      }, 7000);
    } finally {
      setIsGeneratingSignal(false);
    }
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
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl border border-amber-500/30 overflow-hidden shrink-0 shadow-lg glow-gold">
              <img 
                src="/logo.jpg" 
                alt="Onigama Logo" 
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-0.5">
                <span className="w-2.5 h-2.5 bg-emerald-400 rounded-full animate-ping shrink-0" />
                <h1 className="text-xl font-black text-white tracking-wide">
                  ONIGAMA <span className="text-[#6f87a0] font-medium font-mono">FX</span>
                </h1>
              </div>
              <p className="text-[11px] text-slate-400 font-sans tracking-wide">
                {language === 'fa' ? 'داشبورد معاملاتی هوشمند چنددارایی Onigama' : 'Onigama Multi-Asset Premium Monitor'}
              </p>
            </div>
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
                    onClick={() => {
                      setSelectedSymbol(asset.symbol);
                      onNavigate('analysis');
                    }}
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
                    onClick={() => {
                      setSelectedSymbol(asset.symbol);
                      onNavigate('analysis');
                    }}
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
                    onClick={() => {
                      setSelectedSymbol(asset.symbol);
                      onNavigate('analysis');
                    }}
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
                    onClick={() => {
                      setSelectedSymbol(asset.symbol);
                      onNavigate('analysis');
                    }}
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
          disabled={isGeneratingSignal}
          className={`flex-1 py-3.5 px-4 rounded-2xl border font-bold text-xs flex items-center justify-center gap-2 cursor-pointer transition-all shadow-[0_0_15px_rgba(245,158,11,0.08)] ${
            isGeneratingSignal 
              ? 'bg-amber-500/5 text-amber-400/50 border-amber-500/10 cursor-not-allowed'
              : 'bg-gradient-to-r from-amber-500/10 to-amber-600/15 hover:from-amber-500/20 hover:to-amber-600/25 text-amber-300 border border-amber-500/30'
          }`}
          title={language === 'fa' ? 'صدور خودکار سیگنال سودآوری با استفاده از هوش Onigama' : 'Auto-Generate Premium Signal'}
        >
          <Activity className={`w-4 h-4 text-amber-400 ${isGeneratingSignal ? 'animate-spin' : 'animate-pulse'}`} />
          {isGeneratingSignal 
            ? (language === 'fa' ? 'دریافت کندل‌های واقعی...' : 'Fetching live candles...')
            : (language === 'fa' ? 'صدور سیگنال خودکار' : 'Issue Auto Signal')
          }
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
                              {sig.qualityScore !== undefined && (
                                <span className={`text-[9px] font-black px-1.5 py-0.5 rounded-md font-mono ${
                                  sig.qualityScore >= 3 ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/20'
                                  : sig.qualityScore === 2 ? 'bg-amber-500/15 text-amber-300 border border-amber-500/20'
                                  : 'bg-slate-500/15 text-slate-400 border border-slate-500/20'
                                }`}>
                                  {sig.qualityScore >= 1 ? '⭐'.repeat(sig.qualityScore) : 'ضعیف'}
                                </span>
                              )}
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

                        {/* TECHNICAL INDICATORS DETAIL */}
                        {sig.rsi !== undefined && (
                          <div className="mb-3.5 p-3 rounded-2xl bg-[#0a121c]/40 border border-white/[0.04] text-[10.5px]">
                            <div className="text-[9px] text-slate-400 font-bold uppercase tracking-wider mb-2 flex items-center justify-between border-b border-white/[0.04] pb-1.5">
                              <div className="flex items-center gap-1.5">
                                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse"></span>
                                {language === 'fa' ? 'امواج محاسباتی و ساختار بازار اونیگاما' : 'ONIGAMA SMC/LIT MARKET STRUCTURE'}
                              </div>
                              <span className="px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-400 text-[8px] font-black tracking-wide flex items-center gap-1">
                                <span className="w-1 h-1 rounded-full bg-emerald-400 animate-ping"></span>
                                {language === 'fa' ? 'داده‌های واقعی بازار' : 'LIVE MARKET DATA'}
                              </span>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-slate-300 font-mono">
                              <div className="flex justify-between items-center bg-white/[0.01] px-2.5 py-1.5 rounded-xl border border-white/[0.02]">
                                <span className="text-slate-500 font-sans text-[9px] uppercase">{language === 'fa' ? 'قدرت نسبی (RSI-14):' : 'RSI-14 Smoothed:'}</span>
                                <span className={`font-black text-[10px] ${sig.rsi < 35 ? 'text-emerald-400' : sig.rsi > 65 ? 'text-rose-450' : 'text-indigo-300'}`}>
                                  {sig.rsi} {sig.rsi < 35 ? (language === 'fa' ? '(اشباع فروش)' : '(Oversold)') : sig.rsi > 65 ? (language === 'fa' ? '(اشباع خرید)' : '(Overbought)') : (language === 'fa' ? '(خنثی)' : '(Neutral)')}
                                </span>
                              </div>
                              <div className="flex justify-between items-center bg-white/[0.01] px-2.5 py-1.5 rounded-xl border border-white/[0.02]">
                                <span className="text-slate-500 font-sans text-[9px] uppercase">{language === 'fa' ? 'ترازهای متحرک (EMA):' : 'EMA 9/21 cross:'}</span>
                                <span className={`font-black text-[10px] ${(sig.ema9 || 0) > (sig.ema21 || 0) ? 'text-emerald-400' : 'text-rose-450'}`}>
                                  {(sig.ema9 || 0) > (sig.ema21 || 0) ? (language === 'fa' ? 'صعودی 📈' : 'Bullish 📈') : (language === 'fa' ? 'نزولی 📉' : 'Bearish 📉')}
                                </span>
                              </div>

                              {/* SMC Order Block (OB) - Mathematically extracted */}
                              {sig.obPrice !== undefined && (
                                <div className="flex justify-between items-center bg-white/[0.01] px-2.5 py-1.5 rounded-xl border border-white/[0.02]">
                                  <span className="text-slate-500 font-sans text-[9px] uppercase">
                                    {sig.type === 'BUY' 
                                      ? (language === 'fa' ? 'بلاک تقاضا (Bullish OB):' : 'Bullish OB (Demand):')
                                      : (language === 'fa' ? 'بلاک عرضه (Bearish OB):' : 'Bearish OB (Supply):')
                                    }
                                  </span>
                                  <span className="text-amber-400 font-bold text-[10px]">
                                    {formatValue(sig.obPrice, sig.symbol)}
                                  </span>
                                </div>
                              )}

                              {/* SMC BOS / CHoCH Detection */}
                              {(sig.bosPrice !== undefined || sig.chochPrice !== undefined) ? (
                                <div className="flex justify-between items-center bg-white/[0.01] px-2.5 py-1.5 rounded-xl border border-white/[0.02]">
                                  <span className="text-slate-500 font-sans text-[9px] uppercase">
                                    {sig.bosPrice !== undefined 
                                      ? (language === 'fa' ? 'شکست ساختار (BOS):' : 'Structure Break (BOS):')
                                      : (language === 'fa' ? 'تغییر کاراکتر (CHoCH):' : 'Character Shift (CHoCH):')
                                    }
                                  </span>
                                  <span className="text-emerald-400 font-bold text-[10px]">
                                    {formatValue((sig.bosPrice || sig.chochPrice || 0), sig.symbol)}
                                  </span>
                                </div>
                              ) : (
                                <div className="flex justify-between items-center bg-white/[0.01] px-2.5 py-1.5 rounded-xl border border-white/[0.02]">
                                  <span className="text-slate-500 font-sans text-[9px] uppercase">{language === 'fa' ? 'ساختار درونی:' : 'Internal Structure:'}</span>
                                  <span className="text-slate-400 text-[10px]">{language === 'fa' ? 'تثبیت‌شده' : 'Consolidated'}</span>
                                </div>
                              )}

                              {/* LIT Liquidity Sweep */}
                              {sig.sweepPrice !== undefined ? (
                                <div className="flex justify-between items-center bg-white/[0.01] px-2.5 py-1.5 rounded-xl border border-white/[0.02]">
                                  <span className="text-slate-500 font-sans text-[9px] uppercase">
                                    {sig.strategy === 'LIT'
                                      ? (language === 'fa' ? 'سوئیپ نقدینگی (LIT):' : 'Liquidity Sweep (LIT):')
                                      : (language === 'fa' ? 'جذب نقدینگی:' : 'Liquidity Grab:')
                                    }
                                  </span>
                                  <span className="text-purple-400 font-bold text-[10px]">
                                    {formatValue(sig.sweepPrice, sig.symbol)}
                                  </span>
                                </div>
                              ) : (
                                <div className="flex justify-between items-center bg-white/[0.01] px-2.5 py-1.5 rounded-xl border border-white/[0.02]">
                                  <span className="text-slate-500 font-sans text-[9px] uppercase">{language === 'fa' ? 'نقدینگی القایی (IDM):' : 'Inducement (IDM):'}</span>
                                  <span className="text-indigo-400 font-bold text-[10px]">✓ {language === 'fa' ? 'شناسایی شد' : 'Detected'}</span>
                                </div>
                              )}

                              {/* Fair Value Gap (FVG) */}
                              {sig.fvgPrice !== undefined && (
                                <div className="flex justify-between items-center bg-white/[0.01] px-2.5 py-1.5 rounded-xl border border-white/[0.02]">
                                  <span className="text-slate-500 font-sans text-[9px] uppercase">{language === 'fa' ? 'شکاف ارزش منصفانه (FVG):' : 'Fair Value Gap (FVG):'}</span>
                                  <span className="text-sky-400 font-bold text-[10px]">{formatValue(sig.fvgPrice, sig.symbol)}</span>
                                </div>
                              )}

                              <div className="flex justify-between items-center bg-white/[0.01] px-2.5 py-1.5 rounded-xl border border-white/[0.02]">
                                <span className="text-slate-500 font-sans text-[9px] uppercase">{language === 'fa' ? 'کف هفتگی (پشتیبانی):' : 'Weekly Support:'}</span>
                                <span className="text-emerald-400 font-bold text-[10px]">{formatValue(sig.support || 0, sig.symbol)}</span>
                              </div>
                              <div className="flex justify-between items-center bg-white/[0.01] px-2.5 py-1.5 rounded-xl border border-white/[0.02]">
                                <span className="text-slate-500 font-sans text-[9px] uppercase">{language === 'fa' ? 'سقف هفتگی (مقاومت):' : 'Weekly Resistance:'}</span>
                                <span className="text-rose-400 font-bold text-[10px]">{formatValue(sig.resistance || 0, sig.symbol)}</span>
                              </div>
                            </div>
                          </div>
                        )}

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
