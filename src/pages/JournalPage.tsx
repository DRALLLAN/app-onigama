import React, { useState, useEffect } from 'react';
import { Trade, MarketStats } from '../types';
import { StorageManager } from '../services/api';
import { 
  BookOpen, 
  TrendingUp, 
  TrendingDown, 
  Plus, 
  Trash2, 
  Filter, 
  Briefcase, 
  Calendar, 
  DollarSign, 
  PieChart, 
  ListFilter,
  Download,
  FileText,
  Printer,
  X,
  Share2,
  Award,
  Lock,
  Sparkles
} from 'lucide-react';

interface JournalPageProps {
  language: 'fa' | 'en';
  onNavigate?: (tab: string) => void;
}

export function JournalPage({ language, onNavigate }: JournalPageProps) {
  const [trades, setTrades] = useState<Trade[]>([]);
  const [stats, setStats] = useState<MarketStats>({ tradesCount: 0, winRate: 0, totalProfit: 0, winCount: 0, lossCount: 0 });
  const [profile, setProfile] = useState(() => StorageManager.getProfile());
  const [isLoggingTrade, setIsLoggingTrade] = useState(false);

  const isVip = profile.isActivated && (profile.subscriptionTier === 'vip' || profile.subscriptionTier === 'premium');
  
  // New journal entry form states
  const [symbol, setSymbol] = useState('XAUUSD');
  const [type, setType] = useState<'BUY' | 'SELL'>('BUY');
  const [entry, setEntry] = useState('');
  const [exit, setExit] = useState('');
  const [volume, setVolume] = useState('0.1');
  const [profit, setProfit] = useState('');
  const [notes, setNotes] = useState('');

  // Auto-calculate profit mathematically based on standard financial contracts
  useEffect(() => {
    const entryNum = parseFloat(entry);
    const exitNum = parseFloat(exit);
    const volumeNum = parseFloat(volume);
    
    if (!isNaN(entryNum) && !isNaN(exitNum) && !isNaN(volumeNum)) {
      const sym = symbol.toUpperCase().trim();
      let contractSize = 100000; // default for forex pairs

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

      const calculated = type === 'BUY' ? (exitNum - entryNum) : (entryNum - exitNum);
      const totalProfit = calculated * volumeNum * contractSize;
      setProfit(totalProfit.toFixed(2));
    }
  }, [entry, exit, volume, type, symbol]);

  // Filters state
  const [filterOutcome, setFilterOutcome] = useState<'ALL' | 'WIN' | 'LOSS'>('ALL');
  const [filterType, setFilterType] = useState<'ALL' | 'BUY' | 'SELL'>('ALL');

  // Statement Export & Formal Audit report states
  const [showReportModal, setShowReportModal] = useState(false);
  const [initialBalance, setInitialBalance] = useState('10000');
  const [isCopying, setIsCopying] = useState(false);

  const exportToCSV = async () => {
    if (trades.length === 0) {
      alert(language === 'fa' 
        ? '⚠️ هیچ معامله‌ای در ژورنال شما برای خروجی گرفتن یافت نشد. ابتدا چند معامله ثبت کنید.' 
        : '⚠️ No trades found in your journal to export. Please log some trades first.');
      return;
    }

    // Set standard columns for the spreadsheet
    const headers = [
      language === 'fa' ? 'شناسه معامله' : 'Trade ID',
      language === 'fa' ? 'تاریخ و زمان ثبت' : 'Date & Time',
      language === 'fa' ? 'نماد معاملاتی' : 'Symbol',
      language === 'fa' ? 'نوع معامله' : 'Type',
      language === 'fa' ? 'حجم (لات)' : 'Volume (Lots)',
      language === 'fa' ? 'قیمت ورود' : 'Entry Price',
      language === 'fa' ? 'قیمت خروج' : 'Exit Price',
      language === 'fa' ? 'سود/ضرر دلار' : 'Profit/Loss (USD)',
      language === 'fa' ? 'نتیجه معامله' : 'Outcome',
      language === 'fa' ? 'یادداشت‌ها' : 'Journal Notes'
    ];

    const rows = trades.map(t => [
      t.id,
      t.date.replace(/,/g, ' '), // remove commas to avoid breaking CSV columns
      t.symbol,
      t.type,
      t.volume,
      t.entryPrice,
      t.exitPrice,
      t.profit,
      t.outcome,
      (t.notes || '').replace(/"/g, '""').replace(/,/g, ';')
    ]);

    // Prepend UTF-8 BOM so Excel decodes Persian/Farsi letters perfectly
    const csvContent = "\uFEFF" + [
      headers.join(','),
      ...rows.map(row => row.map(val => `"${val}"`).join(','))
    ].join('\n');

    const fileName = `Onigama_Trading_Statement_${new Date().toISOString().split('T')[0]}.csv`;
    const mimeType = 'text/csv;charset=utf-8;';

    // 1. Mobile Web Share API (Primary for iPhone / iOS Safari & Android Chrome)
    if (typeof navigator !== 'undefined' && navigator.share && navigator.canShare) {
      try {
        const file = new File([csvContent], fileName, { type: mimeType });
        if (navigator.canShare({ files: [file] })) {
          await navigator.share({
            files: [file],
            title: 'Onigama Trading Ledger Statement',
            text: language === 'fa' ? 'گزارش معاملات اونیگاما (CSV / اکسل)' : 'Onigama Trading Statement CSV'
          });
          return;
        }
      } catch (err: any) {
        if (err.name === 'AbortError') return;
      }
    }

    // 2. Standard Browser Download Link
    try {
      const blob = new Blob([csvContent], { type: mimeType });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', fileName);
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      document.body.appendChild(link);
      link.click();
      setTimeout(() => {
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      }, 1000);
    } catch (e) {
      // 3. Direct Data URL fallback for WebViews
      const encodedUri = 'data:text/csv;charset=utf-8,' + encodeURIComponent(csvContent);
      window.open(encodedUri, '_blank');
    }
  };

  const exportToHTML = async () => {
    if (trades.length === 0) return;

    const startCap = parseFloat(initialBalance || '10000');
    const finalBalanceValue = startCap + stats.totalProfit;

    const tradesRowsHtml = trades.map((trade, idx) => {
      const isProfit = trade.profit >= 0;
      const profitStr = isProfit ? `+${trade.profit.toFixed(2)}` : `${trade.profit.toFixed(2)}`;
      const profitClass = isProfit ? 'text-emerald-400 font-bold' : 'text-rose-450' ;
      const actionClass = trade.type === 'BUY' ? 'background-color: rgba(16,185,129,0.12); color: #34d399;' : 'background-color: rgba(244,63,94,0.12); color: #fb7185;';
      
      return `
        <tr style="border-bottom: 1px solid rgba(255,255,255,0.06); transition: background-color 0.2s;" onmouseover="this.style.backgroundColor='rgba(255,255,255,0.02)'" onmouseout="this.style.backgroundColor='transparent'">
          <td style="padding: 12px; color: #64748b; font-size: 11px; text-align: center;">ONG-${trade.id.split('-')[1] || idx}</td>
          <td style="padding: 12px; color: #94a3b8; font-size: 11px;">${trade.date}</td>
          <td style="padding: 12px; font-weight: bold; color: #ffffff;">${trade.symbol}</td>
          <td style="padding: 12px; text-align: center;">
            <span style="padding: 3px 8px; border-radius: 4px; font-size: 10px; font-weight: bold; display: inline-block; ${actionClass}">
              ${trade.type}
            </span>
          </td>
          <td style="padding: 12px; text-align: center; color: #ffffff; font-weight: bold;">${trade.volume}</td>
          <td style="padding: 12px; text-align: right; color: #94a3b8;">$${trade.entryPrice.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
          <td style="padding: 12px; text-align: right; color: #94a3b8;">$${trade.exitPrice.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
          <td style="padding: 12px; text-align: right; font-weight: 950;" class="${profitClass}">${isProfit ? '+' : ''}$${Math.abs(trade.profit).toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
        </tr>
      `;
    }).join('');

    const htmlContent = `<!DOCTYPE html>
<html lang="${language === 'fa' ? 'fa' : 'en'}" dir="${language === 'fa' ? 'rtl' : 'ltr'}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Onigama Performance Statement</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;650;700;900&display=swap');
    body {
      font-family: 'Inter', sans-serif;
      background-color: #040911;
      color: #ffffff;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    @media print {
      body {
        background-color: #ffffff !important;
        color: #000000 !important;
      }
      .no-print {
        display: none !important;
      }
      .print-invert {
        color: #000000 !important;
      }
      .print-border {
        border-color: #e2e8f0 !important;
      }
      .print-bg {
        background-color: #f8fafc !important;
      }
      tr {
        border-bottom: 1px solid #e2e8f0 !important;
        color: #000000 !important;
      }
      th {
        background-color: #f1f5f9 !important;
        color: #475569 !important;
        border-bottom: 2px solid #cbd5e1 !important;
      }
      td, th {
        color: #000000 !important;
      }
    }
  </style>
</head>
<body class="p-4 sm:p-8 md:p-12 max-w-5xl mx-auto space-y-6">
  
  <!-- FLOATING PRINT BAR (HIDDEN IN PRINT) -->
  <div class="no-print bg-slate-900/95 border border-white/10 backdrop-blur-md p-4 rounded-3xl sticky top-4 z-50 flex flex-col sm:flex-row gap-3 items-center justify-between shadow-2xl">
    <div class="flex items-center gap-2">
      <div class="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse"></div>
      <span class="text-xs text-slate-350 font-medium font-sans">
        ${language === 'fa' ? 'سند کارنامه آماده چاپ و ذخیره به عنوان فایل PDF است.' : 'Statement ready for direct printing or PDF saving.'}
      </span>
    </div>
    <button onclick="window.print()" class="w-full sm:w-auto px-5 py-2.5 bg-gradient-to-tr from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-slate-950 font-sans font-black text-xs rounded-2xl flex items-center justify-center gap-2 cursor-pointer transition-all shadow-md active:scale-95">
      🖨️ ${language === 'fa' ? 'چاپ یا دریافت فایل PDF' : 'Print or Save as PDF'}
    </button>
  </div>

  <!-- MAIN DOCUMENT CONTAINER -->
  <div class="p-6 md:p-10 bg-black/60 border border-white/10 rounded-[32px] space-y-8 shadow-2xl overflow-hidden print:border-none print:shadow-none print:p-0">
    
    <!-- BRANDING HEADER -->
    <div class="flex flex-col sm:flex-row justify-between items-start gap-4 pb-6 border-b border-white/10 print-border">
      <div class="space-y-1">
        <div class="flex items-center gap-2">
          <div class="w-8 h-8 rounded-lg bg-gradient-to-tr from-amber-600 to-amber-700 flex items-center justify-center text-slate-950 font-sans font-black text-sm">
            Ω
          </div>
          <span class="text-lg font-black tracking-wider text-white print-invert">ONIGAMA TRADERS SYSTEM</span>
        </div>
        <p class="text-[10px] text-slate-500 tracking-widest uppercase font-mono">
          ${language === 'fa' ? 'بخش حسابرسی و ارزیابی عملکرد استراتژی معاملاتی' : 'Audited Institutional Performance & Strategy Ledger'}
        </p>
      </div>

      <div class="text-left font-mono text-[10.5px] text-slate-400 space-y-0.5 sm:text-right print-invert">
        <div><span class="text-slate-500">STATEMENT ID:</span> <span class="font-bold text-slate-200 print-invert">ONG-ST-${Date.now().toString().slice(-6)}</span></div>
        <div><span class="text-slate-500">CLIENT EMAIL:</span> <span class="text-slate-250 print-invert">${profile.email || 'N/A'}</span></div>
        <div><span class="text-slate-500">GENERATION TIME:</span> <span class="text-amber-400 font-bold">${new Date().toISOString()}</span></div>
        <div><span class="text-slate-500">SECURITY TIER:</span> <span class="text-emerald-400 font-bold">CLIENT SECURE SANDBOX</span></div>
      </div>
    </div>

    <!-- SUMMARY GRID CARDS -->
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-4" dir="${language === 'fa' ? 'rtl' : 'ltr'}">
      <div class="p-4 rounded-2xl bg-white/2 border border-white/5 print-bg print-border">
        <span class="text-[9.5px] uppercase tracking-wider text-slate-500 block font-bold">${language === 'fa' ? 'سرمایه اولیه ترازنامه' : 'Starting Capital'}</span>
        <span class="text-base font-bold text-slate-300 mt-1 block print-invert">$${startCap.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
      </div>

      <div class="p-4 rounded-2xl bg-white/2 border border-white/5 print-bg print-border">
        <span class="text-[9.5px] uppercase tracking-wider text-slate-500 block font-bold">${language === 'fa' ? 'سود/ضرر بازده خالص' : 'Total Net Profit/Loss'}</span>
        <span class="text-base font-black mt-1 block print-invert ${stats.totalProfit >= 0 ? 'text-emerald-400' : 'text-rose-400'}">
          ${stats.totalProfit >= 0 ? '+' : ''}$${stats.totalProfit.toLocaleString(undefined, { minimumFractionDigits: 2 })}
        </span>
      </div>

      <div class="p-4 rounded-2xl bg-white/2 border border-white/5 print-bg print-border">
        <span class="text-[9.5px] uppercase tracking-wider text-slate-500 block font-bold">${language === 'fa' ? 'ارزش نهایی پورتفو' : 'Final Balance Value'}</span>
        <span class="text-base font-black text-white mt-1 block print-invert">$${finalBalanceValue.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
      </div>

      <div class="p-4 rounded-2xl bg-white/2 border border-white/5 print-bg print-border">
        <span class="text-[9.5px] uppercase tracking-wider text-slate-500 block font-bold">${language === 'fa' ? 'نسبت معاملات موفق' : 'Success Win Rate'}</span>
        <span class="text-base font-bold text-emerald-400 mt-1 block print-invert">${stats.winRate}% (Wins ${stats.winCount}/${stats.tradesCount})</span>
      </div>
    </div>

    <!-- ADVANCED INDICES -->
    <div class="p-4 bg-white/2 border border-white/5 rounded-2xl print-bg print-border" dir="${language === 'fa' ? 'rtl' : 'ltr'}">
      <h4 class="text-[10px] font-black tracking-wider text-slate-400 uppercase mb-3 font-mono">${language === 'fa' ? '📌 شاخص‌های پیشرفته سودآوری سیستم' : '📌 PERFORMANCE MULTIPLIER INDICES'}</h4>
      <div class="grid grid-cols-3 gap-4 text-center">
        <div>
          <span class="text-[9px] text-slate-500 block">${language === 'fa' ? 'ضریب سودآوری (Profit Factor)' : 'Profit Factor'}</span>
          <span class="text-xs font-bold text-slate-200 font-mono print-invert">${profitFactor}</span>
        </div>
        <div style="border-left: 1px solid rgba(255,255,255,0.06); border-right: 1px solid rgba(255,255,255,0.06);" class="print-border">
          <span class="text-[9px] text-slate-500 block">${language === 'fa' ? 'میانگین سود در هر معامله' : 'Avg Profit Per Trade'}</span>
          <span class="text-xs font-bold font-mono print-invert ${parseFloat(avgProfitPerTrade) >= 0 ? 'text-emerald-400' : 'text-rose-455'}">$${parseFloat(avgProfitPerTrade).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
        </div>
        <div>
          <span class="text-[9px] text-slate-500 block">${language === 'fa' ? 'حجم کل قراردادهای اسمی' : 'Total Traded Volumes'}</span>
          <span class="text-xs font-bold text-slate-200 font-mono print-invert">${totalVolumeTraded} Lots</span>
        </div>
      </div>
    </div>

    <!-- LEDGER TABLE -->
    <div class="space-y-3">
      <span class="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono block print-invert">${language === 'fa' ? 'لیست تراکنش‌های ثبت‌شده (دفتر کل):' : 'AUDITED HISTORICAL JOURNAL LEDGER:'}</span>
      <div class="w-full overflow-x-auto rounded-2xl border border-white/5 print-border">
        <table class="w-full min-w-[680px] text-left border-collapse text-xs font-mono" style="direction: ltr;">
          <thead>
            <tr class="bg-white/5 text-[9.5px] text-slate-400 border-b border-white/10 print-bg print-border">
              <th style="padding: 12px; text-align: center;"># Ticket</th>
              <th style="padding: 12px; text-align: left;">Date & Time</th>
              <th style="padding: 12px; text-align: left;">Asset</th>
              <th style="padding: 12px; text-align: center;">Action</th>
              <th style="padding: 12px; text-align: center;">Size (Lots)</th>
              <th style="padding: 12px; text-align: right;">Entry</th>
              <th style="padding: 12px; text-align: right;">Exit</th>
              <th style="padding: 12px; text-align: right;">Net Return (USD)</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-white/5 text-slate-300 print-border">
            ${tradesRowsHtml}
          </tbody>
        </table>
      </div>
    </div>

    <!-- SEAL & SIGNATURE FOOTER -->
    <div class="pt-10 border-t border-white/10 flex flex-col sm:flex-row justify-between items-center gap-6 print-border" dir="${language === 'fa' ? 'rtl' : 'ltr'}">
      <div class="space-y-1 text-center sm:text-right">
        <div class="flex items-center gap-1.5 justify-center sm:justify-start">
          <span class="text-amber-500">🏆</span>
          <span class="text-[11px] font-black text-slate-200 uppercase tracking-wider print-invert">${language === 'fa' ? 'مورد ممیزی و تایید رسمی سیستم فام Onigama' : 'Onigama Audited Strategy Certification'}</span>
        </div>
        <p class="text-[9.5px] text-slate-500 leading-relaxed max-w-lg font-sans">
          ${language === 'fa'
            ? 'این گزارش تراز معتبر بر اساس معاملات آزمایشی و شبیه‌سازی کلاینت بصورت محلی محاسبه و تایید شده است. به عنوان تاییدیه معتبر معاملاتی Onigama صادر می‌گردد.'
            : 'This certified performance ledger represents offline local sandbox testing logged actions. Issued by Onigama Core Engine Security, conforming completely with platform trading rules.'}
        </p>
      </div>

      <div class="border-2 border-dashed border-emerald-500/40 p-3.5 rounded-2xl text-center rotate-3 scale-95 select-none shrink-0 font-mono">
        <div class="text-[8px] font-black text-emerald-500/60 uppercase tracking-widest">${language === 'fa' ? 'کنترل سیستم‌های مالی' : 'FINANCIAL SYSTEMS CHECK'}</div>
        <div class="text-sm font-black text-emerald-400 my-0.5 tracking-tight">★ VERIFIED PASSED ★</div>
        <div class="text-[8px] font-semibold text-slate-500">${new Date().toISOString().split('T')[0]} ONIGAMA-Q</div>
      </div>
    </div>

  </div>
</body>
</html>`;

    const fileName = `Onigama_Official_Statement_${new Date().toISOString().split('T')[0]}.html`;
    const mimeType = 'text/html;charset=utf-8;';

    // 1. Mobile Web Share API (Primary for iPhone / iOS Safari & Android Chrome)
    if (typeof navigator !== 'undefined' && navigator.share && navigator.canShare) {
      try {
        const file = new File([htmlContent], fileName, { type: mimeType });
        if (navigator.canShare({ files: [file] })) {
          await navigator.share({
            files: [file],
            title: 'Onigama Official Performance Statement',
            text: language === 'fa' ? 'کارنامه معاملاتی اونیگاما' : 'Onigama Trading Ledger Statement'
          });
          return;
        }
      } catch (err: any) {
        if (err.name === 'AbortError') return;
      }
    }

    // 2. Open rendered document in a clean new tab/window for immediate viewing & printing on mobile & desktop
    try {
      const blob = new Blob([htmlContent], { type: mimeType });
      const url = URL.createObjectURL(blob);
      const win = window.open(url, '_blank');
      if (!win || win.closed || typeof win.closed === 'undefined') {
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', fileName);
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
        document.body.appendChild(link);
        link.click();
        setTimeout(() => {
          document.body.removeChild(link);
          URL.revokeObjectURL(url);
        }, 1000);
      }
    } catch (e) {
      const win = window.open('', '_blank');
      if (win) {
        win.document.write(htmlContent);
        win.document.close();
      }
    }
  };

  const copyAsTableText = () => {
    if (trades.length === 0) return;
    setIsCopying(true);
    
    // Format trade journal list into a beautiful text table summary
    let textSummary = `=== ONIGAMA TRADING SYSTEMS STATEMENT ===\n= Generated on: ${new Date().toUTCString()} =\n\n`;
    textSummary += `| SYMBOL | TYPE | VOLUME | ENTRY  | EXIT   | PROFIT ($) | OUTCOME |\n`;
    textSummary += `|--------|------|--------|--------|--------|------------|---------|\n`;
    
    trades.forEach(t => {
      textSummary += `| ${t.symbol.padEnd(6)} | ${t.type.padEnd(4)} | ${String(t.volume).padEnd(6)} | ${String(t.entryPrice).padEnd(6)} | ${String(t.exitPrice).padEnd(6)} | ${String(t.profit).padEnd(10)} | ${t.outcome.padEnd(7)} |\n`;
    });
    
    textSummary += `\nTotal Trades: ${stats.tradesCount} | Win-Rate: ${stats.winRate}% | Net Profit: $${stats.totalProfit.toFixed(2)}`;
    
    navigator.clipboard.writeText(textSummary).then(() => {
      setTimeout(() => setIsCopying(false), 2000);
    }).catch(() => {
      setIsCopying(false);
    });
  };

  const totalVolumeTraded = React.useMemo(() => {
    return trades.reduce((acc, t) => acc + (t.volume || 0), 0).toFixed(2);
  }, [trades]);

  const avgProfitPerTrade = React.useMemo(() => {
    if (trades.length === 0) return '0.00';
    return (stats.totalProfit / trades.length).toFixed(2);
  }, [trades, stats]);

  const profitFactor = React.useMemo(() => {
    let winsSum = 0;
    let lossesSum = 0;
    trades.forEach(t => {
      if (t.profit >= 0) winsSum += t.profit;
      else lossesSum += Math.abs(t.profit);
    });
    if (lossesSum === 0) return winsSum > 0 ? 'Infinite' : '1.00';
    return (winsSum / lossesSum).toFixed(2);
  }, [trades]);

  useEffect(() => {
    const loaded = StorageManager.getTrades();
    setTrades(loaded);
    setStats(StorageManager.getStats(loaded));
    setProfile(StorageManager.getProfile());

    // Listen to local changes
    const handleStorage = () => {
      const refreshed = StorageManager.getTrades();
      setTrades(refreshed);
      setStats(StorageManager.getStats(refreshed));
      setProfile(StorageManager.getProfile());
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  const handleLogTradeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!entry || !exit || !profit) return;

    const entryNum = parseFloat(entry);
    const exitNum = parseFloat(exit);
    const volumeNum = parseFloat(volume);
    const profitNum = parseFloat(profit);

    if (isNaN(entryNum) || isNaN(exitNum) || isNaN(volumeNum) || isNaN(profitNum)) return;

    // Generate Persian datetime string
    const formatPersianDateTime = () => {
      const gDate = new Date();
      // Simple approximate Persian converter for realistic UI demonstration
      const prOption = { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' } as const;
      return new Intl.DateTimeFormat('fa-IR', prOption).format(gDate);
    };

    const newTrade: Trade = {
      id: `trade-${Date.now()}`,
      symbol: symbol.toUpperCase(),
      type,
      entryPrice: entryNum,
      exitPrice: exitNum,
      volume: volumeNum,
      profit: profitNum,
      date: language === 'fa' ? formatPersianDateTime() : new Date().toLocaleString(),
      outcome: profitNum >= 0 ? 'WIN' : 'LOSS',
      notes: notes.trim() || undefined
    };

    const updated = [newTrade, ...trades];
    setTrades(updated);
    StorageManager.saveTrades(updated);
    setStats(StorageManager.getStats(updated));

    // Reset fields
    setIsLoggingTrade(false);
    setEntry('');
    setExit('');
    setVolume('0.1');
    setProfit('');
    setNotes('');
  };

  const handleDeleteTrade = (id: string) => {
    const filtered = trades.filter(t => t.id !== id);
    setTrades(filtered);
    StorageManager.saveTrades(filtered);
    setStats(StorageManager.getStats(filtered));
  };

  const handleClearAllTrades = () => {
    if (confirm(language === 'fa' ? 'آیا از پاک کردن کامل ژورنال معاملات اطمینان دارید؟' : 'Are you sure you want to clear your trade journal history?')) {
      setTrades([]);
      StorageManager.saveTrades([]);
      setStats(StorageManager.getStats([]));
    }
  };

  const filteredTrades = trades.filter(t => {
    const matchOutcome = filterOutcome === 'ALL' || t.outcome === filterOutcome;
    const matchType = filterType === 'ALL' || t.type === filterType;
    return matchOutcome && matchType;
  });

  return (
    <div className="space-y-6 pb-20">
      
      {/* HEADER ROW */}
      <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4" dir={language === 'fa' ? 'rtl' : 'ltr'}>
        <div>
          <h1 className="text-xl font-bold text-white tracking-wide">
            {language === 'fa' ? 'ژورنال معاملاتی Onigama' : 'Trading Journal'}
          </h1>
          <p className="text-xs text-slate-400 font-mono">
            {language === 'fa' ? 'آمار کل و تحلیل عملکرد شخصی' : 'Track and optimize your trading history'}
          </p>
        </div>
        
        <div className="flex flex-row gap-2 self-stretch sm:self-auto justify-end">
          {trades.length > 0 && (
            <button
              type="button"
              onClick={() => setShowReportModal(true)}
              className="flex-1 sm:flex-initial py-2.5 px-3.5 rounded-2xl bg-gradient-to-tr from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-white font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer transition-all border border-amber-500/20 shadow-lg shadow-amber-950/20 active:scale-95"
            >
              <FileText className="w-3.5 h-3.5 text-amber-100 shrink-0" />
              <span>{language === 'fa' ? 'کارنامه رسمی' : 'Official Statement'}</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => setIsLoggingTrade(!isLoggingTrade)}
            className="flex-1 sm:flex-initial py-2.5 px-4 rounded-2xl bg-[#6f87a0] hover:bg-[#5e748d] text-white font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer transition-all active:scale-95"
          >
            {!isVip ? (
              <Lock className="w-3.5 h-3.5 text-amber-350 shrink-0 animate-pulse" />
            ) : (
              <Plus className="w-3.5 h-3.5 shrink-0" />
            )}
            <span>
              {language === 'fa' ? 'ثبت معامله' : 'Log Trade'}
              {!isVip && (language === 'fa' ? ' (ویژه)' : ' (VIP)')}
            </span>
          </button>
        </div>
      </div>

      {/* RESPONSIVE JOURNAL GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* LEFT COLUMN: Stats summary card & quick trade creation form */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* DETAILED STATS ROW */}
          <div className="p-5 rounded-3xl glass-card glow-blue shadow-lg relative" dir={language === 'fa' ? 'rtl' : 'ltr'}>
        <div className="absolute top-0 right-0 w-32 h-32 bg-[#6f87a0]/5 rounded-full blur-[40px] pointer-events-none" />
        
        <h2 className="text-xs font-bold text-slate-400 tracking-wider uppercase mb-4 flex items-center gap-1.5">
          <PieChart className="w-3.5 h-3.5 text-[#6f87a0]" />
          {language === 'fa' ? 'خلاصه عملکرد معاملاتی' : 'PnL Metrics Analytics'}
        </h2>

        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 rounded-2xl bg-white/3 border border-white/5">
            <span className="text-[10px] text-slate-400 block font-semibold uppercase tracking-wider">
              {language === 'fa' ? 'بازده خالص (PnL)' : 'Total Net Profit'}
            </span>
            <span className={`text-xl font-black font-mono tracking-tight block mt-1 ${stats.totalProfit >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
              ${stats.totalProfit.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-white/3 border border-white/5">
            <span className="text-[10px] text-slate-400 block font-semibold uppercase tracking-wider">
              {language === 'fa' ? 'نسبت پیروزی' : 'Win Rate Ratio'}
            </span>
            <span className="text-xl font-black font-mono text-emerald-400 block mt-1">
              {stats.winRate}%
            </span>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2 mt-3 font-mono text-center">
          <div className="py-1.5 px-3 bg-white/2 rounded-xl border border-white/5 text-[10px] text-slate-400 font-bold">
            {language === 'fa' ? 'برد:' : 'WINS:'} <span className="text-emerald-400 font-bold">{stats.winCount}</span>
          </div>
          <div className="py-1.5 px-3 bg-white/2 rounded-xl border border-white/5 text-[10px] text-slate-400 font-bold">
            {language === 'fa' ? 'باخت:' : 'LOSSES:'} <span className="text-rose-400 font-bold">{stats.lossCount}</span>
          </div>
          <div className="py-1.5 px-3 bg-white/2 rounded-xl border border-white/5 text-[10px] text-slate-400 font-bold">
            {language === 'fa' ? 'مجموع:' : 'TOTAL:'} <span className="text-white font-black">{stats.tradesCount}</span>
          </div>
        </div>
      </div>

      {/* DYNAMIC LOG TRADE CONTAINER */}
      {isLoggingTrade && (
        !isVip ? (
          <div 
            className="p-5 rounded-3xl glass-card border border-amber-500/15 space-y-4 shadow-xl text-center flex flex-col items-center justify-center py-8 relative overflow-hidden"
            dir={language === 'fa' ? 'rtl' : 'ltr'}
          >
            <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-full blur-2xl pointer-events-none" />
            
            <div className="p-3 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-full animate-pulse">
              <Lock className="w-5 h-5 text-amber-400" />
            </div>
            
            <div className="space-y-2 max-w-[280px]">
              <h3 className="text-xs font-black text-amber-400 flex items-center gap-1.5 justify-center uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5 text-amber-450 animate-pulse" />
                <span>{language === 'fa' ? 'ثبت معامله ویژه (VIP)' : 'Onigama VIP Trading Ledger'}</span>
              </h3>
              <p className="text-[11px] text-slate-300 leading-relaxed font-sans font-medium">
                {language === 'fa' 
                  ? 'ثبت و ارزیابی پیشرفته معامله در ژورنال کلاینت مخصوص دارندگان لایسنس فعال طلایی است. به راحتی با کدهای رایگان موجود در تنظیمات لایسنس خود را فعال کنید!'
                  : 'Logging interactive trades to run official audited spreadsheets is exclusive to Premium VIP members.'}
              </p>
              <p className="text-[9px] text-slate-500 font-sans font-semibold">
                {language === 'fa'
                  ? '💡 لایسنس‌های موقت رایگان در بخش تنظیمات تعبیه شده است.'
                  : '💡 Temporary free credentials are provided in the settings tab.'}
              </p>
            </div>

            {onNavigate && (
              <button
                type="button"
                onClick={() => onNavigate('settings')}
                className="w-full mt-2 py-2.5 px-4 bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-400 hover:to-yellow-500 text-slate-950 font-black rounded-xl text-xs transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-md active:scale-95"
              >
                <span>{language === 'fa' ? '🔑 بازکردن با لایسنس طلایی' : '🔑 Activate VIP license'}</span>
              </button>
            )}
            
            <button 
              type="button" 
              onClick={() => setIsLoggingTrade(false)}
              className="text-[10px] text-slate-500 hover:text-slate-400 underline cursor-pointer"
            >
              {language === 'fa' ? 'بستن پیام' : 'Dismiss'}
            </button>
          </div>
        ) : (
          <form 
            onSubmit={handleLogTradeSubmit}
            className="p-5 rounded-3xl glass-card border border-white/10 space-y-4 shadow-xl"
            dir={language === 'fa' ? 'rtl' : 'ltr'}
          >
            <div className="flex justify-between items-center mb-1">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                {language === 'fa' ? 'ثبت معامله جدید در ژورنال' : 'Add Manual Trade Journal Entry'}
              </h3>
              <button 
                type="button" 
                onClick={() => setIsLoggingTrade(false)}
                className="text-xs text-rose-400 underline font-mono"
              >
                {language === 'fa' ? 'لغو' : 'Cancel'}
              </button>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="text-[10px] text-slate-400 font-semibold block mb-1.5 uppercase tracking-wide">{language === 'fa' ? 'نماد' : 'Symbol'}</label>
                <input
                  type="text"
                  required
                  value={symbol}
                  onChange={e => setSymbol(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 focus:border-[#6f87a0] font-mono text-xs rounded-xl p-2.5 text-white outline-none"
                />
              </div>
              <div>
                <label className="text-[10px] text-slate-400 font-semibold block mb-1.5 uppercase tracking-wide">{language === 'fa' ? 'نوع معامله' : 'Type'}</label>
                <select
                  value={type}
                  onChange={e => setType(e.target.value as any)}
                  className="w-full bg-[#070f17]/80 border border-white/10 hover:border-white/20 text-xs rounded-xl p-2.5 text-white outline-none"
                >
                  <option value="BUY">BUY</option>
                  <option value="SELL">SELL</option>
                </select>
              </div>
              <div>
                <label className="text-[10px] text-slate-400 font-semibold block mb-1.5 uppercase tracking-wide">{language === 'fa' ? 'حجم (لات)' : 'Lot Size'}</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={volume}
                  onChange={e => setVolume(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 focus:border-[#6f87a0] font-mono text-xs rounded-xl p-2.5 text-white outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="text-[10px] text-slate-400 font-semibold block mb-1.5 uppercase tracking-wide">{language === 'fa' ? 'قیمت ورود' : 'Entry Price'}</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  placeholder="4540"
                  value={entry}
                  onChange={e => setEntry(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 focus:border-[#6f87a0] font-mono text-xs rounded-xl p-2.5 text-white outline-none"
                />
              </div>
              <div>
                <label className="text-[10px] text-slate-400 font-semibold block mb-1.5 uppercase tracking-wide">{language === 'fa' ? 'قیمت خروج' : 'Exit Price'}</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  placeholder="4555"
                  value={exit}
                  onChange={e => setExit(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 focus:border-[#6f87a0] font-mono text-xs rounded-xl p-2.5 text-white outline-none"
                />
              </div>
              <div>
                <label className="text-[10px] text-slate-400 font-semibold block mb-1.5 uppercase tracking-wide">{language === 'fa' ? 'سود/ضرر (محاسبه خودکار)' : 'Profit USD (Auto)'}</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  placeholder="400"
                  value={profit}
                  onChange={e => setProfit(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 focus:border-[#6f87a0] font-mono text-xs rounded-xl p-2.5 text-white outline-none font-bold text-emerald-400"
                />
              </div>
            </div>

            <div>
              <label className="text-[10px] text-slate-400 font-semibold block mb-1.5 uppercase tracking-wide">{language === 'fa' ? 'توضیحات معامله' : 'Trade Journal Notes'}</label>
              <input
                type="text"
                placeholder={language === 'fa' ? 'مثال: بریک اوت لندن، تاچ اوردربلاک' : 'e.g. London BOS, mitigated OB'}
                value={notes}
                onChange={e => setNotes(e.target.value)}
                className="w-full bg-white/5 border border-white/10 focus:border-[#6f87a0] text-xs rounded-xl p-2.5 text-white outline-none"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-[#6f87a0] hover:bg-[#5e748d] text-white text-xs font-black rounded-xl transition-all uppercase tracking-wider"
            >
              {language === 'fa' ? 'ثبت در دفترچه ژورنال کلاینت' : 'Record in Local Journal'}
            </button>
          </form>
        )
      )}

        </div>

        {/* RIGHT COLUMN: Filter bar and interactive journal list logs */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* FILTERS & SEARCH ROW */}
          <div className="space-y-3" dir={language === 'fa' ? 'rtl' : 'ltr'}>
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-1.5">
            <ListFilter className="w-4 h-4 text-[#6f87a0]" />
            <span className="text-xs font-semibold text-slate-300">
              {language === 'fa' ? 'فیلتر کردن معاملات' : 'Filter Trade Log'}
            </span>
          </div>
          {trades.length > 0 && (
            <button 
              onClick={handleClearAllTrades} 
              className="text-[10px] text-rose-400 underline cursor-pointer"
            >
              {language === 'fa' ? 'پاک کردن تاریخچه' : 'Clear Journal'}
            </button>
          )}
        </div>

        <div className="flex gap-2.5 bg-white/2 p-2 rounded-2xl border border-white/5">
          <select
            value={filterOutcome}
            onChange={(e) => setFilterOutcome(e.target.value as any)}
            className="flex-1 bg-[#070f17]/95 text-slate-300 p-2.5 rounded-xl border border-white/5 hover:border-white/10 transition-colors cursor-pointer outline-none text-[11px] font-sans"
          >
            <option value="ALL">{language === 'fa' ? 'همه (برد/باخت)' : 'All Outcomes'}</option>
            <option value="WIN">{language === 'fa' ? 'فقط بردها' : 'Wins Only'}</option>
            <option value="LOSS">{language === 'fa' ? 'فقط باختها' : 'Losses Only'}</option>
          </select>

          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value as any)}
            className="flex-1 bg-[#070f17]/95 text-slate-300 p-2.5 rounded-xl border border-white/5 hover:border-white/10 transition-colors cursor-pointer outline-none text-[11px] font-sans"
          >
            <option value="ALL">{language === 'fa' ? 'همه (خرید/فروش)' : 'All Types'}</option>
            <option value="BUY">BUY Only</option>
            <option value="SELL">SELL Only</option>
          </select>
        </div>

        {trades.length > 0 && (
          <div className="flex flex-col sm:flex-row gap-2.5 sm:items-center text-xs mt-2" dir={language === 'fa' ? 'rtl' : 'ltr'}>
            <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider mr-1 ml-1 hidden sm:inline-block">
              {language === 'fa' ? 'عملیات کارنامه و استخراج داده‌ها:' : 'Extract trading ledger data:'}
            </span>
            <div className="flex flex-row gap-2 items-center justify-end w-full sm:w-auto">
              <button
                onClick={exportToCSV}
                type="button"
                className="flex-1 sm:flex-auto px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 text-slate-300 hover:text-white transition-all text-[10px] font-bold flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 animate-fade-in"
                title={language === 'fa' ? 'دانلود به صورت فایل اکسل / CSV' : 'Download spreadsheet CSV format'}
              >
                <Download className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>{language === 'fa' ? 'دانلود فایل اکسل (CSV)' : 'Export CSV (Excel)'}</span>
              </button>
              <button
                onClick={copyAsTableText}
                type="button"
                className="flex-1 sm:flex-auto px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 text-slate-300 hover:text-white transition-all text-[10px] font-bold flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
                title={language === 'fa' ? 'کپی کل جدول معاملات' : 'Copy markdown formatted ledger'}
              >
                <Share2 className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                <span>{isCopying ? (language === 'fa' ? 'کپی شد!' : 'Copied!') : (language === 'fa' ? 'کپی متنی' : 'Copy Text')}</span>
              </button>
            </div>
          </div>
        )}

        {/* TRADES GRID / LIST representation */}
        {filteredTrades.length === 0 ? (
          <div className="p-10 text-center glass-card rounded-2xl">
            <p className="text-xs text-slate-400 font-sans">
              {language === 'fa' ? 'هیچ معاملهای با فیلتر کنونی پیدا نشد.' : 'No trades matching current filters found.'}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredTrades.map((trade) => {
              const isWin = trade.outcome === 'WIN';
              return (
                <div
                  key={trade.id}
                  className="p-4 sm:p-5 rounded-3xl glass-card hover:border-white/12 transition-all text-right relative overflow-hidden flex flex-col justify-between"
                >
                  <div className="flex justify-between items-start mb-2">
                    <button
                      onClick={() => handleDeleteTrade(trade.id)}
                      className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-500 hover:text-rose-400 text-xs transition-colors self-start cursor-pointer"
                      title="Delete Entry"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>

                    <div className="text-right">
                      <div className="flex items-center gap-1.5 justify-end">
                        <span className="text-[10px] font-mono text-slate-500">
                          {trade.volume} Lot
                        </span>
                        <span className={`text-[9.5px] font-bold px-1.5 py-0.5 rounded ${
                          trade.type === 'BUY' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'
                        }`}>
                          {trade.type}
                        </span>
                        <span className="text-xs font-bold text-white font-sans">
                          {trade.symbol}
                        </span>
                      </div>
                      <span className="text-[9px] text-slate-500 font-mono block mt-1">
                        {trade.date}
                      </span>
                    </div>
                  </div>

                  {/* PRICE POINTS */}
                  <div className="grid grid-cols-3 gap-1.5 sm:gap-2 bg-white/2 p-2.5 sm:p-3 rounded-2xl border border-white/5 font-mono text-center mb-2.5">
                    <div>
                      <span className="text-[8.5px] sm:text-[9.5px] text-slate-500 block">{language === 'fa' ? 'قیمت ورود' : 'ENTRY'}</span>
                      <span className="text-[10.5px] sm:text-xs font-bold text-slate-200">${trade.entryPrice.toFixed(2)}</span>
                    </div>
                    <div>
                      <span className="text-[8.5px] sm:text-[9.5px] text-slate-500 block">{language === 'fa' ? 'قیمت خروج' : 'EXIT'}</span>
                      <span className="text-[10.5px] sm:text-xs font-bold text-slate-200">${trade.exitPrice.toFixed(2)}</span>
                    </div>
                    <div>
                      <span className="text-[8.5px] sm:text-[9.5px] text-slate-500 block">{language === 'fa' ? 'سود ناخالص' : 'RETURN'}</span>
                      <span className={`text-[10.5px] sm:text-xs font-black ${isWin ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {isWin ? '+' : ''}${trade.profit.toFixed(2)}
                      </span>
                    </div>
                  </div>

                  {trade.notes && (
                    <p className="text-[10.5px] text-slate-400 mb-0.5 line-clamp-3 leading-relaxed bg-white/2 p-2.5 rounded-xl">
                      {trade.notes}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

        </div>
      </div>

      {/* DETAILED PRINTABLE STATEMENT MODAL OVERLAY */}
      {showReportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-md p-4 overflow-y-auto no-print">
          
          {/* Print Isolation styles inside the document dynamically */}
          <style dangerouslySetInnerHTML={{ __html: `
            @media print {
              html, body {
                background: #ffffff !important;
                color: #000000 !important;
              }
              body * {
                visibility: hidden !important;
              }
              #onigama-printable-statement, #onigama-printable-statement * {
                visibility: visible !important;
              }
              #onigama-printable-statement {
                position: absolute !important;
                left: 0 !important;
                top: 0 !important;
                width: 100% !important;
                background: #ffffff !important;
                color: #000000 !important;
                box-shadow: none !important;
                border: none !important;
                padding: 0 !important;
                margin: 0 !important;
              }
              .no-print {
                display: none !important;
              }
              .text-white {
                color: #000000 !important;
              }
              .text-slate-400, .text-slate-500 {
                color: #4b5563 !important;
              }
              .border-white\\/5, .border-white\\/10 {
                border-color: #e5e7eb !important;
              }
              .bg-white\\/3, .bg-white\\/5 {
                background-color: #f3f4f6 !important;
              }
            }
          `}} />

          <div 
            className="bg-slate-950 border border-white/10 rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col relative"
            dir={language === 'fa' ? 'rtl' : 'ltr'}
          >
            {/* Top Toolbar (Hidden during print) */}
            <div className="p-3 sm:p-4 bg-slate-900 border-b border-white/5 flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between sticky top-0 z-20 no-print">
              <div className="flex items-center gap-2 justify-between">
                <span className="text-xs text-slate-400 font-bold">{language === 'fa' ? 'سرمایه اولیه برای کارنامه ($):' : 'Starting Capital ($):'}</span>
                <input
                  type="number"
                  value={initialBalance}
                  onChange={(e) => setInitialBalance(e.target.value)}
                  className="w-20 sm:w-24 bg-white/5 border border-white/10 rounded-xl px-2.5 py-1 text-xs text-white outline-none focus:border-[#6f87a0] font-mono text-center"
                  placeholder="10000"
                />
              </div>

              <div className="flex gap-2 items-center justify-end">
                <button
                  onClick={exportToHTML}
                  type="button"
                  className="flex-1 sm:flex-initial py-1.5 px-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-[10.5px] sm:text-xs flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 transition-all"
                  title={language === 'fa' ? 'دانلود کارنامه به عنوان سند دیجیتال آفلاین چاپی' : 'Download statement as printable offline document'}
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>{language === 'fa' ? 'دریافت سند آفلاین (HTML/PDF)' : 'Download Offline Document'}</span>
                </button>

                <button
                  onClick={() => {
                    try {
                      window.print();
                    } catch (e) {
                      alert(language === 'fa' 
                        ? '⚠️ پرینت مستقیم در این محیط پشتیبانی نمیشود. لطفا از دکمه دریافت سند آفلاین استفاده کنید.' 
                        : '⚠️ Direct print is not supported in this environment. Please use Download Offline Document.');
                    }
                  }}
                  type="button"
                  className="flex-1 sm:flex-initial py-1.5 px-3 rounded-xl bg-gradient-to-tr from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-white font-bold text-[10.5px] sm:text-xs flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 transition-all"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>{language === 'fa' ? 'پرینت مستقیم' : 'Direct Print'}</span>
                </button>

                <button
                  onClick={() => setShowReportModal(false)}
                  type="button"
                  className="p-1 px-2.5 text-slate-400 hover:text-white rounded-lg bg-white/5 hover:bg-white/10 text-[10.5px] sm:text-xs transition-colors flex items-center justify-center gap-1 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                  <span>{language === 'fa' ? 'بستن' : 'Close'}</span>
                </button>
              </div>
            </div>

            {/* The actual Printable Statement document container layout */}
            <div 
              id="onigama-printable-statement"
              className="p-4 sm:p-8 md:p-12 space-y-8 bg-[#040911] text-white overflow-x-hidden"
            >
              
              {/* BRANDING HEADER HEADER */}
              <div className="flex flex-col sm:flex-row justify-between items-start gap-4 pb-6 border-b border-white/10">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-amber-600 to-amber-500 flex items-center justify-center text-slate-950 font-black text-sm">
                      Ω
                    </div>
                    <span className="text-lg font-black tracking-wider text-white">ONIGAMA TRADERS SYSTEM</span>
                  </div>
                  <p className="text-[10px] text-slate-500 tracking-widest uppercase font-mono">
                    {language === 'fa' ? 'بخش حسابرسی و ارزیابی عملکرد استراتژی معاملاتی' : 'Audited Institutional Performance & Strategy Ledger'}
                  </p>
                </div>

                <div className="text-left font-mono text-[10.5px] text-slate-400 space-y-0.5 sm:text-right">
                  <div><span className="text-slate-500">STATEMENT ID:</span> <span className="font-bold text-slate-200">ONG-ST-{Date.now().toString().slice(-6)}</span></div>
                  <div><span className="text-slate-500">CLIENT EMAIL:</span> <span className="text-slate-200">{profile.email || 'N/A'}</span></div>
                  <div><span className="text-slate-500">GENERATION TIME:</span> <span className="text-amber-400 font-bold">{new Date().toISOString()}</span></div>
                  <div><span className="text-slate-500">SECURITY TIER:</span> <span className="text-emerald-400 font-bold">CLIENT SECURE SANDBOX</span></div>
                </div>
              </div>

              {/* OVERVIEW KEY PERFORMANCE CARDS */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4" dir={language === 'fa' ? 'rtl' : 'ltr'}>
                
                <div className="p-4 rounded-2xl bg-white/3 border border-white/5">
                  <span className="text-[9.5px] uppercase tracking-wider text-slate-500 block font-bold">
                    {language === 'fa' ? 'سرمایه اولیه ترازنامه' : 'Starting Capital'}
                  </span>
                  <span className="text-base font-bold font-mono text-slate-300 mt-1 block">
                    ${parseFloat(initialBalance || '10000').toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </span>
                </div>

                <div className="p-4 rounded-2xl bg-white/3 border border-white/5">
                  <span className="text-[9.5px] uppercase tracking-wider text-slate-500 block font-bold">
                    {language === 'fa' ? 'سود/ضرر بازده خالص' : 'Total Net Profit/Loss'}
                  </span>
                  <span className={`text-base font-black font-mono mt-1 block ${stats.totalProfit >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {stats.totalProfit >= 0 ? '+' : ''}${stats.totalProfit.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </span>
                </div>

                <div className="p-4 rounded-2xl bg-[#6f87a0]/10 border border-[#6f87a0]/20">
                  <span className="text-[9.5px] uppercase tracking-wider text-slate-400 block font-bold">
                    {language === 'fa' ? 'ارزش نهایی پورتفو' : 'Final Balance Value'}
                  </span>
                  <span className="text-base font-black font-mono text-white mt- block">
                    ${(parseFloat(initialBalance || '10000') + stats.totalProfit).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </span>
                </div>

                <div className="p-4 rounded-2xl bg-white/3 border border-white/5">
                  <span className="text-[9.5px] uppercase tracking-wider text-slate-500 block font-bold">
                    {language === 'fa' ? 'نسبت معاملات موفق' : 'Success Win Rate'}
                  </span>
                  <span className="text-base font-bold font-mono text-emerald-400 mt-1 block">
                    {stats.winRate}% (Wins {stats.winCount}/{stats.tradesCount})
                  </span>
                </div>

              </div>

              {/* DETAILED STATISTICAL SUB-METRICS LIST */}
              <div className="p-4 bg-white/2 rounded-2xl border border-white/5" dir={language === 'fa' ? 'rtl' : 'ltr'}>
                <h4 className="text-[10px] font-black tracking-wider text-slate-400 uppercase mb-3 font-mono">
                  {language === 'fa' ? '📌 شاخص‌های پیشرفته سودآوری سیستم' : '📌 PERFORMANCE MULTIPLIER INDICES'}
                </h4>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div className="space-y-0.5">
                    <span className="text-[9px] text-slate-500 block">{language === 'fa' ? 'ضریب سودآوری (Profit Factor)' : 'Profit Factor'}</span>
                    <span className="text-xs font-bold text-slate-200 font-mono">{profitFactor}</span>
                  </div>
                  <div className="space-y-0.5 border-x border-white/5">
                    <span className="text-[9px] text-slate-500 block">{language === 'fa' ? 'میانگین سود در هر معامله' : 'Avg Profit Per Trade'}</span>
                    <span className={`text-xs font-bold font-mono ${parseFloat(avgProfitPerTrade) >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                      ${parseFloat(avgProfitPerTrade).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                  <div className="space-y-0.5">
                    <span className="text-[9px] text-slate-500 block">{language === 'fa' ? 'حجم کل قراردادهای اسمی' : 'Total Traded Volumes'}</span>
                    <span className="text-xs font-bold text-slate-200 font-mono">{totalVolumeTraded} Lots</span>
                  </div>
                </div>
              </div>

              {/* TRADING RECORDS LEDGER REPORT */}
              <div className="space-y-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono block">
                  {language === 'fa' ? 'لیست تراکنش‌های ثبت‌شده (دفتر کل):' : 'AUDITED HISTORICAL JOURNAL LEDGER:'}
                </span>

                <div className="w-full overflow-x-auto rounded-xl border border-white/5">
                  <table className="w-full min-w-[680px] text-left border-collapse text-xs font-mono" dir="ltr">
                    <thead>
                      <tr className="bg-white/5 text-[9.5px] text-slate-400 border-b border-white/10">
                        <th className="p-3 text-center"># Ticket</th>
                        <th className="p-3">Date & Time</th>
                        <th className="p-3">Asset</th>
                        <th className="p-3 text-center">Action</th>
                        <th className="p-3 text-center">Size (Lots)</th>
                        <th className="p-3 text-right">Entry</th>
                        <th className="p-3 text-right">Exit</th>
                        <th className="p-3 text-right">Net Return (USD)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5 text-slate-300">
                      {trades.map((trade, idx) => {
                        const isProfit = trade.profit >= 0;
                        return (
                          <tr key={trade.id} className="hover:bg-white/2 transition-colors">
                            <td className="p-3 text-center text-slate-500 text-[10.5px]">ONG-{trade.id.split('-')[1] || idx}</td>
                            <td className="p-3 text-slate-400 text-[10.5px]">{trade.date}</td>
                            <td className="p-3 font-bold text-white">{trade.symbol}</td>
                            <td className="p-3 text-center">
                              <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                trade.type === 'BUY' ? 'bg-emerald-500/15 text-emerald-400' : 'bg-rose-500/15 text-rose-400'
                              }`}>
                                {trade.type}
                              </span>
                            </td>
                            <td className="p-3 text-center font-bold">{trade.volume}</td>
                            <td className="p-3 text-right text-slate-400">${trade.entryPrice.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                            <td className="p-3 text-right text-slate-400">${trade.exitPrice.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                            <td className={`p-3 text-right font-black ${isProfit ? 'text-emerald-400' : 'text-rose-400'}`}>
                              {isProfit ? '+' : ''}${trade.profit.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* AUDIT SEAL STAMP & LEGAL SIGNATURE FOOTER */}
              <div className="pt-10 border-t border-white/10 flex flex-col sm:flex-row justify-between items-center gap-6" dir={language === 'fa' ? 'rtl' : 'ltr'}>
                <div className="space-y-1 text-center sm:text-right">
                  <div className="flex items-center gap-1.5 justify-center sm:justify-start">
                    <Award className="w-4 h-4 text-amber-500" />
                    <span className="text-[11px] font-black text-slate-200 uppercase tracking-wider">
                      {language === 'fa' ? 'مورد ممیزی و تایید رسمی سیستم فام Onigama' : 'Onigama Audited Strategy Certification'}
                    </span>
                  </div>
                  <p className="text-[9.5px] text-slate-500 font-sans leading-relaxed max-w-lg">
                    {language === 'fa'
                      ? 'این گزارش تراز معتبر بر اساس معاملات آزمایشی و شبیه‌سازی کلاینت بصورت محلی محاسبه و تایید شده است. به عنوان تاییدیه معتبر معاملاتی Onigama صادر می‌گردد.'
                      : 'This certified performance ledger represents offline local sandbox testing logged actions. Issued by Onigama Core Engine Security, conforming completely with platform trading rules.'}
                  </p>
                </div>

                {/* Simulated Stamp Badge */}
                <div className="border-2 border-dashed border-emerald-500/40 p-3.5 rounded-2xl text-center rotate-3 scale-95 select-none shrink-0 font-mono no-print">
                  <div className="text-[8px] font-black text-emerald-500/60 uppercase tracking-widest">{language === 'fa' ? 'کنترل سیستم‌های مالی' : 'FINANCIAL SYSTEMS CHECK'}</div>
                  <div className="text-sm font-black text-emerald-400 my-0.5 tracking-tight">★ VERIFIED PASSED ★</div>
                  <div className="text-[8px] font-semibold text-slate-400">{new Date().toISOString().split('T')[0]} ONIGAMA-Q</div>
                </div>

              </div>

            </div>
          </div>
        </div>
      )}

    </div>
  );
}
