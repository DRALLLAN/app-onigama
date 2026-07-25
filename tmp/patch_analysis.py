import re

path = 'src/pages/AnalysisPage.tsx'
with open(path, 'r', encoding='utf-8') as f:
    src = f.read()

orig = src

# ---------- 1) Add imports ----------
import_anchor = "import { useGoldPrice } from '../hooks/useGoldPrice';"
import_add = ("import { useGoldPrice, fetchMarketCandles } from '../hooks/useGoldPrice';\n"
              "import { scanSMCAndLIT } from '../utils/marketStructure';\n"
              "import { MarketCandle } from '../types';")
if "fetchMarketCandles" not in src:
    src = src.replace(import_anchor, import_add, 1)

# ---------- 2) Add state + effect right after activeStrategy state ----------
state_anchor = "  const [activeStrategy, setActiveStrategy] = useState<'SMC' | 'LIT'>('SMC');"
state_add = state_anchor + """
  const [realLevels, setRealLevels] = useState<any[]>([]);
  const [levelsLoading, setLevelsLoading] = useState<boolean>(false);"""
src = src.replace(state_anchor, state_add, 1)

# ---------- 3) Replace the two fake level generators with a real builder ----------
# Find from 'const getLITLevelsForAsset' up to end of 'getSMCLevelsForAsset' closing.
# We anchor on the exact start line and the 'const levels =' that follows the SMC generator.
start_marker = "  const getLITLevelsForAsset = (sym: string, spotPrice: number) => {"
end_marker = "  const levels = activeStrategy === 'SMC'\n    ? getSMCLevelsForAsset(selectedSymbol, price)\n    : getLITLevelsForAsset(selectedSymbol, price);"

start_idx = src.find(start_marker)
end_idx = src.find(end_marker)

if start_idx == -1 or end_idx == -1:
    print("!! MARKERS NOT FOUND — file untouched.")
    raise SystemExit

end_idx_full = end_idx + len(end_marker)

replacement = '''  // Build REAL SMC/LIT levels from live market structure (no fabricated prices)
  const buildLevelsFromStructure = (tech: any, spot: number, strat: 'SMC' | 'LIT') => {
    const decs = (selectedSymbol === 'EURUSD' || selectedSymbol === 'GBPUSD' || selectedSymbol === 'AUDUSD' || selectedSymbol === 'USDCAD') ? 4 : (selectedSymbol === 'USDJPY' ? 2 : (selectedSymbol === 'BTCUSD' || selectedSymbol === 'US30' || selectedSymbol === 'NAS100' ? 0 : 2));
    const fmt = (p: number) => +p.toFixed(decs);
    // Real distance-to-price label instead of fabricated lot volume
    const dist = (p: number) => {
      const pct = ((p - spot) / spot) * 100;
      const dir = pct >= 0 ? (language === 'fa' ? 'بالای قیمت' : 'above price') : (language === 'fa' ? 'زیر قیمت' : 'below price');
      return `${Math.abs(pct).toFixed(2)}% ${dir}`;
    };
    const out: any[] = [];

    if (strat === 'SMC') {
      if (tech.bearishOBPrice !== undefined) {
        out.push({ id: 'lvl-ob-bear', type: 'OB_BEARISH', price: fmt(tech.bearishOBPrice),
          label: language === 'fa' ? 'بلاک سفارش فروش' : 'Bearish Order Block',
          description: language === 'fa' ? 'ناحیه عرضه نزولی که آخرین کندل صعودی پیش از حرکت نزولی را نشان می‌دهد.' : 'Bearish supply zone: last up candle before an impulsive move down.',
          volProfile: dist(tech.bearishOBPrice), status: 'UNMITIGATED' });
      }
      out.push({ id: 'lvl-bsl', type: 'BSL', price: fmt(tech.lastSwingHigh),
        label: language === 'fa' ? 'نقدینگی خریداران (سقف نوسان)' : 'Buy-Side Liquidity (Swing High)',
        description: language === 'fa' ? 'استخر استاپ خریداران بالای آخرین سقف نوسانی؛ هدف بالقوه سوئیپ نقدینگی.' : 'Buy stops resting above the last swing high; potential liquidity sweep target.',
        volProfile: dist(tech.lastSwingHigh), status: tech.sweepPrice === tech.lastSwingHigh ? 'SWEPT' : 'HIGH INTENSITY' });
      if (tech.fvgPrice !== undefined) {
        out.push({ id: 'lvl-fvg', type: 'FVG', price: fmt(tech.fvgPrice),
          label: language === 'fa' ? 'شکاف ارزش منصفانه' : 'Fair Value Gap',
          description: language === 'fa' ? 'ناکارآمدی قیمتی برجا مانده از حرکت پرشتاب که به‌عنوان مغناطیس قیمت عمل می‌کند.' : 'Price inefficiency left by an impulsive move, acting as a magnet.',
          volProfile: dist(tech.fvgPrice), status: 'IMBALANCE' });
      }
      if (tech.bullishOBPrice !== undefined) {
        out.push({ id: 'lvl-ob-bull', type: 'OB_BULLISH', price: fmt(tech.bullishOBPrice),
          label: language === 'fa' ? 'بلاک سفارش خرید' : 'Bullish Order Block',
          description: language === 'fa' ? 'ناحیه تقاضای صعودی که آخرین کندل نزولی پیش از حرکت صعودی را نشان می‌دهد.' : 'Bullish demand zone: last down candle before an impulsive move up.',
          volProfile: dist(tech.bullishOBPrice), status: 'KEY DECISION BAR' });
      }
      out.push({ id: 'lvl-ssl', type: 'SSL', price: fmt(tech.lastSwingLow),
        label: language === 'fa' ? 'نقدینگی فروشندگان (کف نوسان)' : 'Sell-Side Liquidity (Swing Low)',
        description: language === 'fa' ? 'استخر استاپ فروشندگان زیر آخرین کف نوسانی؛ ناحیه حمایتی کلیدی.' : 'Sell stops resting below the last swing low; key support pool.',
        volProfile: dist(tech.lastSwingLow), status: tech.sweepPrice === tech.lastSwingLow ? 'SWEPT' : 'CRITICAL SUPPORT' });
    } else {
      // LIT
      out.push({ id: 'lit-trap-high', type: 'LIT_TRAP', price: fmt(tech.resistance),
        label: language === 'fa' ? 'تله بریک‌اوت خریداران' : 'Retail Breakout Trap',
        description: language === 'fa' ? 'محدوده نقدینگی مهندسی‌شده در سقف برای به دام انداختن خریداران عجول پیش از برگشت.' : 'Engineered liquidity trap at the highs to induce breakout buyers before a reversal.',
        volProfile: dist(tech.resistance), status: 'ACTIVE TRAP' });
      out.push({ id: 'lit-idm-high', type: 'IDM_HIGH', price: fmt(tech.lastSwingHigh),
        label: language === 'fa' ? 'القاء نزولی (Inducement)' : 'Bearish Inducement',
        description: language === 'fa' ? 'سطح القاء فروشندگان خرد برای ورود زودهنگام پیش از سوئیپ اصلی.' : 'Inducement level attracting early retail sellers prior to the real sweep.',
        volProfile: dist(tech.lastSwingHigh), status: tech.sweepPrice === tech.lastSwingHigh ? 'SWEPT' : 'UNMITIGATED' });
      if (tech.sweepPrice !== undefined) {
        out.push({ id: 'lit-sweep', type: 'SWEEP', price: fmt(tech.sweepPrice),
          label: language === 'fa' ? 'سوئیپ نقدینگی' : 'Liquidity Sweep',
          description: language === 'fa' ? 'نقطه‌ای که قیمت نقدینگی را جارو کرد و بازگشت؛ هسته اصلی ستاپ LIT.' : 'Point where price swept liquidity and reversed; the core of the LIT setup.',
          volProfile: dist(tech.sweepPrice), status: 'TRIGGERED' });
      } else if (tech.bosPrice !== undefined) {
        out.push({ id: 'lit-bos', type: 'BOS', price: fmt(tech.bosPrice),
          label: language === 'fa' ? 'شکست ساختار (BOS)' : 'Break of Structure',
          description: language === 'fa' ? 'تأیید ادامه روند پس از شکست آخرین سطح ساختاری.' : 'Trend continuation confirmed after breaking the last structural level.',
          volProfile: dist(tech.bosPrice), status: 'CONFIRMED' });
      }
      out.push({ id: 'lit-idm-low', type: 'IDM_LOW', price: fmt(tech.lastSwingLow),
        label: language === 'fa' ? 'القاء صعودی (Inducement)' : 'Bullish Inducement',
        description: language === 'fa' ? 'سطح القاء خریداران خرد برای ورود زودهنگام پیش از سوئیپ اصلی.' : 'Inducement level attracting early retail buyers prior to the real sweep.',
        volProfile: dist(tech.lastSwingLow), status: tech.sweepPrice === tech.lastSwingLow ? 'SWEPT' : 'UNMITIGATED' });
      out.push({ id: 'lit-support', type: 'LIT_SUPPORT', price: fmt(tech.support),
        label: language === 'fa' ? 'نقدینگی فروشندگان (کف)' : 'Sell-Side Liquidity (Low)',
        description: language === 'fa' ? 'سطح کلیدی نقدینگی فروشندگان زیر کلاستر حمایتی.' : 'Key sell-side liquidity pool below the support cluster.',
        volProfile: dist(tech.support), status: 'CRITICAL SUPPORT' });
    }
    return out;
  };

  // Fetch real candles and recompute levels when symbol or strategy changes
  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      if (!selectedSymbol) return;
      setLevelsLoading(true);
      try {
        const candles: MarketCandle[] = await fetchMarketCandles(selectedSymbol);
        if (cancelled || !candles || candles.length < 10) {
          if (!cancelled) setRealLevels([]);
          return;
        }
        const spot = price || candles[candles.length - 1].close;
        // Calibrate candles to live price so levels align with the current quote
        const offset = spot - candles[candles.length - 1].close;
        const calibrated = candles.map(c => ({ ...c, open: c.open + offset, high: c.high + offset, low: c.low + offset, close: c.close + offset }));
        const tech = scanSMCAndLIT(calibrated, selectedSymbol);
        const built = buildLevelsFromStructure(tech, spot, activeStrategy);
        if (!cancelled) setRealLevels(built);
      } catch (e) {
        if (!cancelled) setRealLevels([]);
      } finally {
        if (!cancelled) setLevelsLoading(false);
      }
    };
    run();
    return () => { cancelled = true; };
  }, [selectedSymbol, activeStrategy, language]);

  const levels = realLevels;'''

src = src[:start_idx] + replacement + src[end_idx_full:]

if src == orig:
    print("!! NO CHANGES — something did not match.")
    raise SystemExit

with open(path, 'w', encoding='utf-8') as f:
    f.write(src)

# ---------- verify ----------
checks = {
    "import fetchMarketCandles": "import { useGoldPrice, fetchMarketCandles }" in src,
    "import scanSMCAndLIT": "import { scanSMCAndLIT } from '../utils/marketStructure';" in src,
    "realLevels state": "const [realLevels, setRealLevels]" in src,
    "buildLevelsFromStructure": "buildLevelsFromStructure" in src,
    "useEffect fetch": "await fetchMarketCandles(selectedSymbol)" in src,
    "levels = realLevels": "const levels = realLevels;" in src,
    "fake LIT gone": "getLITLevelsForAsset" not in src,
    "fake SMC gone": "getSMCLevelsForAsset" not in src,
}
allok = True
for k, v in checks.items():
    print(("PASS" if v else "FAIL"), k)
    if not v: allok = False
print("ALL GOOD" if allok else "SOME FAILED")
