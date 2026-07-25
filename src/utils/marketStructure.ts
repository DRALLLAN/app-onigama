import { MarketCandle } from '../types';

// Mathematically precise RSI (Wilder smoothing)
export function calculateRealRSI(candles: MarketCandle[], period: number = 14): number {
  if (candles.length <= period) return 50;
  let gains = 0;
  let losses = 0;

  for (let i = 1; i <= period; i++) {
    const diff = candles[i].close - candles[i - 1].close;
    if (diff > 0) gains += diff;
    else losses -= diff;
  }

  let avgGain = gains / period;
  let avgLoss = losses / period;

  for (let i = period + 1; i < candles.length; i++) {
    const diff = candles[i].close - candles[i - 1].close;
    const gain = diff > 0 ? diff : 0;
    const loss = diff < 0 ? -diff : 0;

    avgGain = (avgGain * (period - 1) + gain) / period;
    avgLoss = (avgLoss * (period - 1) + loss) / period;
  }

  if (avgLoss === 0) return 100;
  const rs = avgGain / avgLoss;
  return +(100 - 100 / (1 + rs)).toFixed(1);
}

// Mathematically perfect EMA
export function calculateRealEMA(candles: MarketCandle[], period: number): number {
  if (candles.length === 0) return 0;
  let ema = candles[0].close;
  const multiplier = 2 / (period + 1);
  for (let i = 1; i < candles.length; i++) {
    ema = (candles[i].close - ema) * multiplier + ema;
  }
  return ema;
}

// Aggregate 1H candles into 4H candles
export function aggregateToH4(c: MarketCandle[]): MarketCandle[] {
  const out: MarketCandle[] = [];
  for (let i = 0; i < c.length; i += 4) {
    const ch = c.slice(i, i + 4);
    if (!ch.length) continue;
    out.push({
      timestamp: ch[0].timestamp,
      open: ch[0].open,
      high: Math.max(...ch.map(x => x.high)),
      low: Math.min(...ch.map(x => x.low)),
      close: ch[ch.length - 1].close,
      volume: 0,
    });
  }
  return out;
}

export interface MarketStructure {
  rsi: number;
  ema9: number;
  ema21: number;
  support: number;
  resistance: number;
  bosPrice: number | undefined;
  chochPrice: number | undefined;
  obPrice: number | undefined;
  bullishOBPrice: number | undefined;
  bearishOBPrice: number | undefined;
  sweepPrice: number | undefined;
  fvgPrice: number | undefined;
  lastSwingHigh: number;
  lastSwingLow: number;
  session: 'ASIA' | 'LONDON' | 'NY';
  strategy: 'SMC' | 'LIT';
  type: 'BUY' | 'SELL';
  qualityScore: number;
}

// True SMC (Smart Money Concepts) & LIT (Liquidity Inducement Theorem) Scanner
export function scanSMCAndLIT(candles: MarketCandle[], symbol: string): MarketStructure {
  const latest = candles[candles.length - 1];

  // Determine Market Session deterministically from latest candle's UTC hour
  const date = new Date(latest.timestamp * 1000);
  const utcHour = date.getUTCHours();
  let session: 'ASIA' | 'LONDON' | 'NY' = 'ASIA';
  if (utcHour >= 8 && utcHour < 16) {
    session = 'LONDON';
  } else if (utcHour >= 16 || utcHour < 0) {
    session = 'NY';
  } else {
    session = 'ASIA';
  }

  // 1. Core Technical Indicators
  const rsi = calculateRealRSI(candles, 14);
  const ema9 = calculateRealEMA(candles, 9);
  const ema21 = calculateRealEMA(candles, 21);
  const ema50 = calculateRealEMA(candles, 50);

  const support = Math.min(...candles.map(c => c.low).slice(-30));
  const resistance = Math.max(...candles.map(c => c.high).slice(-30));

  // 2. Locate Swing Highs and Swing Lows (Fractals) over past 60 candles
  interface SwingPoint {
    index: number;
    price: number;
    type: 'HIGH' | 'LOW';
  }
  const swings: SwingPoint[] = [];
  const scanRange = Math.min(candles.length - 2, 60);
  const startIdx = candles.length - scanRange;

  for (let i = startIdx; i < candles.length - 2; i++) {
    const h = candles[i].high;
    const l = candles[i].low;

    if (
      h > candles[i - 1].high &&
      h > candles[i - 2].high &&
      h > candles[i + 1].high &&
      h > candles[i + 2].high
    ) {
      swings.push({ index: i, price: h, type: 'HIGH' });
    }

    if (
      l < candles[i - 1].low &&
      l < candles[i - 2].low &&
      l < candles[i + 1].low &&
      l < candles[i + 2].low
    ) {
      swings.push({ index: i, price: l, type: 'LOW' });
    }
  }

  const highSwings = swings.filter(s => s.type === 'HIGH');
  const lowSwings = swings.filter(s => s.type === 'LOW');

  const lastSwingHigh = highSwings.length > 0 ? highSwings[highSwings.length - 1] : { price: resistance, index: candles.length - 5 };
  const lastSwingLow = lowSwings.length > 0 ? lowSwings[lowSwings.length - 1] : { price: support, index: candles.length - 5 };

  // 3. Find Order Blocks (OB)
  let bullishOBPrice: number | undefined = undefined;
  let bearishOBPrice: number | undefined = undefined;

  for (let i = candles.length - 4; i >= startIdx; i--) {
    const c = candles[i];
    const isDownCandle = c.close < c.open;
    const isUpCandle = c.close > c.open;

    const moveAfterBullish = candles[i + 1].close > c.close && candles[i + 3].close > candles[i + 1].close;
    if (isDownCandle && moveAfterBullish) {
      bullishOBPrice = c.low;
      break;
    }

    const moveAfterBearish = candles[i + 1].close < c.close && candles[i + 3].close < candles[i + 1].close;
    if (isUpCandle && moveAfterBearish) {
      bearishOBPrice = c.high;
      break;
    }
  }

  // 4. Check for BOS (Break of Structure) & CHoCH (Change of Character)
  let bosPrice: number | undefined;
  let chochPrice: number | undefined;
  const currentTrend = ema9 > ema21 ? 'UP' : 'DOWN';

  const last5Closes = candles.slice(-5).map(c => c.close);
  const maxClose = Math.max(...last5Closes);
  const minClose = Math.min(...last5Closes);

  if (maxClose > lastSwingHigh.price) {
    if (currentTrend === 'UP') {
      bosPrice = lastSwingHigh.price;
    } else {
      chochPrice = lastSwingHigh.price;
    }
  } else if (minClose < lastSwingLow.price) {
    if (currentTrend === 'DOWN') {
      bosPrice = lastSwingLow.price;
    } else {
      chochPrice = lastSwingLow.price;
    }
  }

  // 5. Check for Liquidity Sweeps (LIT guidelines)
  let sweepPrice: number | undefined;
  let strategy: 'SMC' | 'LIT' = 'SMC';

  const last3Candles = candles.slice(-3);
  for (const c of last3Candles) {
    if (c.high > lastSwingHigh.price && c.close < lastSwingHigh.price) {
      sweepPrice = lastSwingHigh.price;
      strategy = 'LIT';
    } else if (c.low < lastSwingLow.price && c.close > lastSwingLow.price) {
      sweepPrice = lastSwingLow.price;
      strategy = 'LIT';
    }
  }

  // 6. Fair Value Gap (FVG)
  let fvgPrice: number | undefined;
  for (let i = candles.length - 3; i >= startIdx; i--) {
    const c1 = candles[i];
    const c3 = candles[i + 2];
    if (c3.low > c1.high) {
      fvgPrice = (c3.low + c1.high) / 2;
      break;
    } else if (c3.high < c1.low) {
      fvgPrice = (c3.high + c1.low) / 2;
      break;
    }
  }

  // 7. Signal Type
  let type: 'BUY' | 'SELL' = 'BUY';
  const isSSL = sweepPrice === lastSwingLow.price;
  const isBSL = sweepPrice === lastSwingHigh.price;

  if (isSSL) {
    type = 'BUY';
  } else if (isBSL) {
    type = 'SELL';
  } else if (rsi < 32) {
    type = 'BUY';
  } else if (rsi > 68) {
    type = 'SELL';
  } else {
    type = ema9 > ema21 ? 'BUY' : 'SELL';
  }

  const obForScore = type === 'BUY' ? bullishOBPrice : bearishOBPrice;
  let qualityScore = 0;
  if (type === 'BUY' && ema9 > ema21 && latest.close > ema50) qualityScore++;
  if (type === 'SELL' && ema9 < ema21 && latest.close < ema50) qualityScore++;
  if (type === 'BUY' && rsi < 45) qualityScore++;
  if (type === 'SELL' && rsi > 55) qualityScore++;
  if (sweepPrice !== undefined || bosPrice !== undefined || obForScore !== undefined) qualityScore++;

  const h4Candles = aggregateToH4(candles);
  if (h4Candles.length >= 21) {
    const h4closes = h4Candles.map(x => x.close);
    let h4ema9 = h4closes[0], h4ema21 = h4closes[0];
    const k9 = 2 / 10, k21 = 2 / 22;
    for (let i = 1; i < h4closes.length; i++) {
      h4ema9 = (h4closes[i] - h4ema9) * k9 + h4ema9;
      h4ema21 = (h4closes[i] - h4ema21) * k21 + h4ema21;
    }
    if (type === 'BUY' && h4ema9 > h4ema21) qualityScore++;
    if (type === 'SELL' && h4ema9 < h4ema21) qualityScore++;
  }

  return {
    rsi,
    ema9,
    ema21,
    support,
    resistance,
    bosPrice,
    chochPrice,
    obPrice: type === 'BUY' ? bullishOBPrice : bearishOBPrice,
    bullishOBPrice,
    bearishOBPrice,
    sweepPrice,
    fvgPrice,
    lastSwingHigh: lastSwingHigh.price,
    lastSwingLow: lastSwingLow.price,
    session,
    strategy,
    type,
    qualityScore,
  };
}
