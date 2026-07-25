path = 'src/pages/HomePage.tsx'
with open(path, 'r', encoding='utf-8') as f:
    src = f.read()

orig = src

# --- 1) Add import for scanSMCAndLIT (after the runBacktest import) ---
import_anchor = "import { runBacktest } from '../utils/runBacktest';"
import_line = import_anchor + "\nimport { scanSMCAndLIT } from '../utils/marketStructure';"
if "scanSMCAndLIT } from '../utils/marketStructure'" not in src:
    if import_anchor not in src:
        print("!! IMPORT ANCHOR NOT FOUND — file untouched.")
        raise SystemExit
    src = src.replace(import_anchor, import_line, 1)

# --- 2) Remove the four local helper functions ---
# Block starts at calculateRealRSI definition, ends right before generateSmartSignal.
start_marker = "  const calculateRealRSI = (candles: MarketCandle[], period: number = 14): number => {"
end_marker = "  const generateSmartSignal = async (asset: any, forceType?: 'BUY' | 'SELL') => {"

start_idx = src.find(start_marker)
end_idx = src.find(end_marker)

if start_idx == -1 or end_idx == -1:
    print("!! FUNCTION MARKERS NOT FOUND — file untouched.")
    raise SystemExit

if start_idx >= end_idx:
    print("!! MARKER ORDER WRONG — file untouched.")
    raise SystemExit

# Keep everything before start, drop the block, keep generateSmartSignal onward.
# Preserve indentation before the removed block by cutting exactly at start_idx.
removed = src[start_idx:end_idx]

# Safety: make sure the removed block actually contains scanSMCAndLIT and not generateSmartSignal
if "scanSMCAndLIT" not in removed:
    print("!! Removed block missing scanSMCAndLIT — aborting.")
    raise SystemExit
if "generateSmartSignal" in removed:
    print("!! Removed block would include generateSmartSignal — aborting.")
    raise SystemExit

src = src[:start_idx] + src[end_idx:]

if src == orig:
    print("!! NO CHANGES — aborting.")
    raise SystemExit

with open(path, 'w', encoding='utf-8') as f:
    f.write(src)

# --- verify ---
checks = {
    "import added": "scanSMCAndLIT } from '../utils/marketStructure'" in src,
    "local scan removed": "const scanSMCAndLIT = (candles" not in src,
    "local RSI removed": "const calculateRealRSI = (candles" not in src,
    "local EMA removed": "const calculateRealEMA = (candles" not in src,
    "local aggregate removed": "const aggregateToH4 = (c: MarketCandle" not in src,
    "generateSmartSignal intact": "const generateSmartSignal = async" in src,
    "scanSMCAndLIT still called": "scanSMCAndLIT(calibratedCandles" in src,
}
allok = True
for k, v in checks.items():
    print(("PASS" if v else "FAIL"), k)
    if not v:
        allok = False
print("ALL GOOD" if allok else "SOME FAILED")
