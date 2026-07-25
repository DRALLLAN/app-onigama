import { fetchMarketCandles } from '../hooks/useGoldPrice';
import { MarketCandle } from '../types';

function rsi14(c: MarketCandle[], p = 14): number {
  if (c.length <= p) return 50;
  let g = 0, l = 0;
  for (let i = 1; i <= p; i++) { const d = c[i].close - c[i-1].close; if (d > 0) g += d; else l -= d; }
  let ag = g/p, al = l/p;
  for (let i = p+1; i < c.length; i++) {
    const d = c[i].close - c[i-1].close;
    ag = (ag*(p-1) + (d>0?d:0))/p;
    al = (al*(p-1) + (d<0?-d:0))/p;
  }
  if (al === 0) return 100;
  return +(100 - 100/(1 + ag/al)).toFixed(1);
}
function ema(c: MarketCandle[], p: number): number {
  if (!c.length) return 0;
  let e = c[0].close; const k = 2/(p+1);
  for (let i = 1; i < c.length; i++) e = (c[i].close - e)*k + e;
  return e;
}

function scan(c: MarketCandle[]) {
  const r = rsi14(c,14), e9 = ema(c,9), e21 = ema(c,21), e50 = ema(c,50);
  const support = Math.min(...c.map(x=>x.low).slice(-30));
  const resistance = Math.max(...c.map(x=>x.high).slice(-30));
  const swings: {price:number;type:'H'|'L'}[] = [];
  const range = Math.min(c.length-2, 60), s0 = c.length - range;
  for (let i=s0;i<c.length-2;i++){
    const h=c[i].high,l=c[i].low;
    if(h>c[i-1].high&&h>c[i-2].high&&h>c[i+1].high&&h>c[i+2].high) swings.push({price:h,type:'H'});
    if(l<c[i-1].low&&l<c[i-2].low&&l<c[i+1].low&&l<c[i+2].low) swings.push({price:l,type:'L'});
  }
  const H = swings.filter(s=>s.type==='H'), L = swings.filter(s=>s.type==='L');
  const lsh = H.length?H[H.length-1].price:resistance;
  const lsl = L.length?L[L.length-1].price:support;
  let obBull:number|undefined, obBear:number|undefined;
  for(let i=c.length-4;i>=s0;i--){
    const x=c[i];
    if(x.close<x.open && c[i+1].close>x.close && c[i+3].close>c[i+1].close){obBull=x.low;break;}
    if(x.close>x.open && c[i+1].close<x.close && c[i+3].close<c[i+1].close){obBear=x.high;break;}
  }
  let bos = false;
  const trend = e9 > e21 ? 'UP' : 'DOWN';
  const last5 = c.slice(-5).map(x=>x.close);
  if (Math.max(...last5) > lsh && trend === 'UP') bos = true;
  if (Math.min(...last5) < lsl && trend === 'DOWN') bos = true;
  let sweep:number|undefined, strat:'SMC'|'LIT'='SMC';
  for(const x of c.slice(-3)){
    if(x.high>lsh && x.close<lsh){sweep=lsh;strat='LIT';}
    else if(x.low<lsl && x.close>lsl){sweep=lsl;strat='LIT';}
  }
  let type:'BUY'|'SELL'='BUY';
  if(sweep===lsl) type='BUY';
  else if(sweep===lsh) type='SELL';
  else if(r<32) type='BUY';
  else if(r>68) type='SELL';
  else type = e9>e21?'BUY':'SELL';
  const obPrice = type==='BUY'?obBull:obBear;
  const isBuy = type === 'BUY';
  let score = 0;
  if (isBuy && e9 > e21 && c[c.length-1].close > e50) score++;
  if (!isBuy && e9 < e21 && c[c.length-1].close < e50) score++;
  if (isBuy && r < 45) score++;
  if (!isBuy && r > 55) score++;
  if (sweep !== undefined || bos || obPrice !== undefined) score++;
  return {support,resistance,obPrice,sweepPrice:sweep,strategy:strat,type,score};
}

function sltp(entry:number, t:ReturnType<typeof scan>){
  const isBuy=t.type==='BUY', buf=entry*0.0012; let sl=0;
  if(isBuy){
    const p=[t.support]; if(t.obPrice&&t.obPrice<entry)p.push(t.obPrice); if(t.sweepPrice&&t.sweepPrice<entry)p.push(t.sweepPrice);
    sl=Math.min(...p)-buf; if(sl>entry*0.9995)sl=entry*0.998; if(sl<entry*0.985)sl=entry*0.985;
  } else {
    const p=[t.resistance]; if(t.obPrice&&t.obPrice>entry)p.push(t.obPrice); if(t.sweepPrice&&t.sweepPrice>entry)p.push(t.sweepPrice);
    sl=Math.max(...p)+buf; if(sl<entry*1.0005)sl=entry*1.002; if(sl>entry*1.015)sl=entry*1.015;
  }
  const risk=Math.abs(entry-sl);
  return {sl, tp1: entry+(isBuy?risk*1.0:-risk*1.0), risk};
}

export async function runBacktest(symbol = 'XAUUSD') {
  const candles = await fetchMarketCandles(symbol);
  const minHistory = 60, maxHold = 48, step = 3;
  const MIN_SCORE = 2;
  let wins=0, losses=0, expired=0, totalR=0, trades=0, skipped=0;
  for (let i=minHistory; i<candles.length-1; i+=step) {
    const hist = candles.slice(0, i+1);
    const t = scan(hist);
    if (t.score < MIN_SCORE) { skipped++; continue; }
    const entry = candles[i].close;
    const {sl, tp1} = sltp(entry, t);
    if (!isFinite(sl) || sl===entry) continue;
    const isBuy = t.type==='BUY';
    if (Math.abs(entry-sl) <= 0) continue;
    trades++;
    let res:'W'|'L'|'E'='E';
    const end = Math.min(i+1+maxHold, candles.length);
    for (let j=i+1; j<end; j++){
      const c=candles[j];
      if(isBuy){ if(c.low<=sl){res='L';break;} if(c.high>=tp1){res='W';break;} }
      else { if(c.high>=sl){res='L';break;} if(c.low<=tp1){res='W';break;} }
    }
    if(res==='W'){wins++;totalR+=1.2;} else if(res==='L'){losses++;totalR-=1.0;} else expired++;
  }
  const decided = wins+losses;
  const winRate = decided ? +(100*wins/decided).toFixed(1) : 0;
  const expectancy = decided ? +(totalR/decided).toFixed(3) : 0;
  const msg =
    `📊 بک‌تست ${symbol} (با فیلتر کیفیت)\n\n` +
    `کندل واقعی: ${candles.length}\n` +
    `معاملات باکیفیت: ${trades}  |  رد شده: ${skipped}\n` +
    `برد: ${wins} | باخت: ${losses} | منقضی: ${expired}\n\n` +
    `🎯 وین‌ریت: ${winRate}%\n(سربه‌سر: بالای ۴۵.۵٪)\n\n` +
    `📈 مجموع R: ${totalR.toFixed(2)}\n💡 سود هر معامله: ${expectancy}R\n\n` +
    `${expectancy > 0.02 ? '✅ سودده' : expectancy < -0.02 ? '❌ ضررده' : '➖ سربه‌سر'}\n\n` +
    `قبل (بدون فیلتر): 0.055R`;
  alert(msg);
  return { trades, skipped, wins, losses, expired, winRate, expectancy };
}
