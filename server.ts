async function fetchYahooCandles(symbol: string) {
    const map: Record<string, string> = {
      XAUUSD: "GC=F", XAGUSD: "SI=F", EURUSD: "EURUSD=X",
      GBPUSD: "GBPUSD=X", USDJPY: "USDJPY=X", BTCUSD: "BTC-USD",
      ETHUSD: "ETH-USD", OIL: "CL=F"
    };
    const ticker = map[symbol.toUpperCase()] || symbol;
    const ua = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36";
    for (const host of ["query1.finance.yahoo.com", "query2.finance.yahoo.com"]) {
      try {
        const url = `https://${host}/v8/finance/chart/${encodeURIComponent(ticker)}?interval=1h&range=60d`;
        const r = await fetch(url, { headers: { "User-Agent": ua } });
        if (!r.ok) continue;
        const j = await r.json();
        const result = j?.chart?.result?.[0];
        if (!result) continue;
        const ts = result.timestamp || [];
        const q = result.indicators?.quote?.[0];
        if (!q || !Array.isArray(q.close) || ts.length === 0) continue;
        const candles = [];
        for (let i = 0; i < ts.length; i++) {
          const o = q.open?.[i], h = q.high?.[i], l = q.low?.[i], c = q.close?.[i];
          if (typeof ts[i] === "number" && typeof o === "number" && !isNaN(o) &&
              typeof h === "number" && !isNaN(h) && typeof l === "number" && !isNaN(l) &&
              typeof c === "number" && !isNaN(c)) {
            candles.push({ timestamp: ts[i], open: o, high: h, low: l, close: c, volume: q.volume?.[i] || 0 });
          }
        }
        if (candles.length >= 25) return candles;
      } catch { continue; }
    }
    throw new Error(`Could not fetch candles for ${symbol}`);

  }import express from "express";
import { query } from "./db";
import crypto from "crypto";
import path from "path";
import { createServer as createViteServer } from "vite";
import { parseStringPromise } from "xml2js";

async function fetchYahooChartPrice(symbol: string): Promise<{ price: number; high: number; low: number; change: number } | null> {
  const hosts = ["query1.finance.yahoo.com", "query2.finance.yahoo.com"];
  const userAgent = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36";
  
  for (const host of hosts) {
    try {
      const url = `https://${host}/v8/finance/chart/${encodeURIComponent(symbol)}?interval=1d&range=1d`;
      const res = await fetch(url, { headers: { "User-Agent": userAgent } });
      if (res.ok) {
        const json = await res.json();
        const result = json?.chart?.result?.[0];
        if (result) {
          const meta = result.meta;
          const quote = result.indicators?.quote?.[0];
          
          if (meta && meta.regularMarketPrice !== undefined) {
            const price = meta.regularMarketPrice;
            const prevClose = meta.chartPreviousClose || price;
            const change = prevClose ? ((price - prevClose) / prevClose) * 100 : 0;
            
            const high = (quote?.high && Math.max(...quote.high.filter(Boolean))) || meta.regularMarketDayHigh || price;
            const low = (quote?.low && Math.min(...quote.low.filter(Boolean))) || meta.regularMarketDayLow || price;
            
            return {
              price,
              high,
              low,
              change
            };
          }
        }
      }
    } catch (err) {
      console.error(`Error fetching chart fallback for ${symbol} on ${host}:`, err);
    }
  }
  return null;
}

async function startServer() {
  const app = express();
  const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

  // Enable JSON bodies
  app.use(express.json());

  // API: Live Market Prices Proxy
  app.get("/api/market-prices", async (req, res) => {
    try {
      const pricesMap: Record<string, { price: number; high: number; low: number; change: number }> = {};

      // 1. Fetch from Yahoo Finance (Indices, Oil, Forex, and Metals)
      // Tickers to pull: Gold (GC=F), Silver (SI=F), Bitcoin (BTC-USD), Ethereum (ETH-USD),
      // EURUSD (EURUSD=X), GBPUSD (GBPUSD=X), USDJPY (USDJPY=X), AUDUSD (AUDUSD=X), USDCAD (USDCAD=X),
      // Dow Jones (^DJI), Nasdaq (^NDX), Brent Crude (BZ=F)
      const symbols = [
        "GC=F", "SI=F", "BTC-USD", "ETH-USD",
        "EURUSD=X", "GBPUSD=X", "USDJPY=X", "AUDUSD=X", "USDCAD=X",
        "^DJI", "^NDX", "BZ=F"
      ];

      const yahooUrl = `https://query1.finance.yahoo.com/v7/finance/quote?symbols=${symbols.join(",")}`;
      
      try {
        const yahooRes = await fetch(yahooUrl, {
          headers: {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36"
          }
        });
        if (yahooRes.ok) {
          const data = await yahooRes.json();
          const results = data?.quoteResponse?.result;
          if (Array.isArray(results)) {
            results.forEach((q: any) => {
              let appKey = "";
              switch (q.symbol) {
                case "GC=F": appKey = "XAUUSD"; break;
                case "SI=F": appKey = "XAGUSD"; break;
                case "BTC-USD": appKey = "BTCUSD"; break;
                case "ETH-USD": appKey = "ETHUSD"; break;
                case "EURUSD=X": appKey = "EURUSD"; break;
                case "GBPUSD=X": appKey = "GBPUSD"; break;
                case "USDJPY=X": appKey = "USDJPY"; break;
                case "AUDUSD=X": appKey = "AUDUSD"; break;
                case "USDCAD=X": appKey = "USDCAD"; break;
                case "^DJI": appKey = "US30"; break;
                case "^NDX": appKey = "NAS100"; break;
                case "BZ=F": appKey = "OIL"; break;
              }

              if (appKey && q.regularMarketPrice !== undefined) {
                pricesMap[appKey] = {
                  price: q.regularMarketPrice,
                  high: q.regularMarketDayHigh || q.regularMarketPrice,
                  low: q.regularMarketDayLow || q.regularMarketPrice,
                  change: q.regularMarketChangePercent || 0
                };
              }
            });
          }
        }
      } catch (e) {
        console.error("Yahoo Finance server-side fetch error:", e);
      }

      // 1.5. INDICES & OIL SECURE FALLBACKS (using unblocked chart/v8 API)
      if (!pricesMap["US30"]) {
        const data = await fetchYahooChartPrice("^DJI");
        if (data) pricesMap["US30"] = data;
      }
      if (!pricesMap["NAS100"]) {
        const data = await fetchYahooChartPrice("^NDX");
        if (data) pricesMap["NAS100"] = data;
      }
      if (!pricesMap["OIL"]) {
        const data = await fetchYahooChartPrice("BZ=F");
        if (data) pricesMap["OIL"] = data;
      }

      // 2. Fallback fetch from Binance (highly reliable 24/7 for Crypto)
      if (!pricesMap["BTCUSD"] || !pricesMap["ETHUSD"]) {
        try {
          const [btcRes, ethRes] = await Promise.all([
            fetch("https://api.binance.com/api/v3/ticker/24hr?symbol=BTCUSDT").then(r => r.json()),
            fetch("https://api.binance.com/api/v3/ticker/24hr?symbol=ETHUSDT").then(r => r.json())
          ]);
          if (btcRes && btcRes.lastPrice) {
            pricesMap["BTCUSD"] = {
              price: parseFloat(btcRes.lastPrice),
              high: parseFloat(btcRes.highPrice),
              low: parseFloat(btcRes.lowPrice),
              change: parseFloat(btcRes.priceChangePercent)
            };
          }
          if (ethRes && ethRes.lastPrice) {
            pricesMap["ETHUSD"] = {
              price: parseFloat(ethRes.lastPrice),
              high: parseFloat(ethRes.highPrice),
              low: parseFloat(ethRes.lowPrice),
              change: parseFloat(ethRes.priceChangePercent)
            };
          }
        } catch (e) {
          console.error("Binance fallback fetch error:", e);
        }
      }

      // 3. Fallback fetch from Gold Price API (for gold/silver spot prices)
      if (!pricesMap["XAUUSD"] || !pricesMap["XAGUSD"]) {
        try {
          const [goldRes, silverRes] = await Promise.all([
            fetch("https://api.gold-api.com/price/XAU").then(r => r.json()),
            fetch("https://api.gold-api.com/price/XAG").then(r => r.json())
          ]);
          if (goldRes && typeof goldRes.price === 'number') {
            pricesMap["XAUUSD"] = {
              price: goldRes.price,
              high: goldRes.price * 1.005,
              low: goldRes.price * 0.995,
              change: 0.15
            };
          }
          if (silverRes && typeof silverRes.price === 'number') {
            pricesMap["XAGUSD"] = {
              price: silverRes.price,
              high: silverRes.price * 1.008,
              low: silverRes.price * 0.992,
              change: 0.28
            };
          }
        } catch (e) {
          console.error("Gold API fallback fetch error:", e);
        }
      }

      res.json({ success: true, data: pricesMap });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err?.message || "Internal pricing fetch error" });
    }
  });

  async function translateToFa(text: string): Promise<string> {
    try {
      const url = "https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=fa&dt=t&q=" + encodeURIComponent(text);
      const r = await fetch(url, { headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36" } });
      if (!r.ok) return text;
      const data = await r.json();
      if (Array.isArray(data) && Array.isArray(data[0])) {
        const parts = data[0].map((seg: any) => (Array.isArray(seg) ? seg[0] : "")).filter(Boolean);
        const joined = parts.join("").trim();
        return joined || text;
      }
      return text;
    } catch (_) {
      return text;
    }
  }
  let __newsCache: { data: any[]; ts: number } | null = null;
  const __NEWS_TTL = 5 * 60 * 1000; // 5 minutes
  app.get("/api/live-news", async (req, res) => {
    if (__newsCache && Date.now() - __newsCache.ts < __NEWS_TTL) {
      return res.json({ success: true, count: __newsCache.data.length, news: __newsCache.data, cached: true });
    }
    const rssUrls = [
      "https://www.forexlive.com/feed",
      "https://investinglive.com/feed/",
      "https://m.investing.com/rss/news.rss"
    ];

    for (const rssUrl of rssUrls) {
      try {
        const r = await fetch(rssUrl, {
          headers: {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
            "Accept": "application/rss+xml, application/xml, text/xml"
          }
        });
        if (!r.ok) continue;
        const xml = await r.text();
        const parsed = await parseStringPromise(xml);
        const items = parsed?.rss?.channel?.[0]?.item || [];
        const news = items.slice(0, 30).map((item: any) => {
          const title = (item.title && item.title[0]) || "";
          const link = (item.link && item.link[0]) || "";
          const pubDate = (item.pubDate && item.pubDate[0]) || "";
          const guid = (item.guid && (item.guid[0]?._ || item.guid[0])) || link || title;
          const lt = String(title).toLowerCase();
          let sentiment: "BULLISH" | "BEARISH" | "NEUTRAL" = "NEUTRAL";
          if (/(rise|climb|surge|rally|bull|higher|gain|jump)/.test(lt)) sentiment = "BULLISH";
          else if (/(fall|slide|drop|plunge|bear|lower|sink|tumble)/.test(lt)) sentiment = "BEARISH";
          let relatedSymbol = "ALL";
          if (/(gold|xau)/.test(lt)) relatedSymbol = "XAUUSD";
          else if (/(euro|eur)/.test(lt)) relatedSymbol = "EURUSD";
          else if (/(gbp|pound|sterling)/.test(lt)) relatedSymbol = "GBPUSD";
          else if (/(yen|jpy)/.test(lt)) relatedSymbol = "USDJPY";
          else if (/(bitcoin|btc|crypto)/.test(lt)) relatedSymbol = "BTCUSD";
          else if (/(oil|crude|wti|brent)/.test(lt)) relatedSymbol = "OIL";
          else if (/(dow|nasdaq|s&p|index|equities|stocks)/.test(lt)) relatedSymbol = "US30";
          return { id: String(guid), title: String(title), link: String(link), pubDate: String(pubDate), sentiment, relatedSymbol, source: "Live RSS Feed" };
        });
        if (news.length === 0) continue;

        // Translate each headline to Persian (parallel; fall back to English on failure)
        const translated = await Promise.all(news.map(async (n: any) => {
          const titleFa = await translateToFa(n.title);
          return { ...n, titleFa };
        }));

        __newsCache = { data: translated, ts: Date.now() };
        return res.json({ success: true, count: translated.length, news: translated });
      } catch (err: any) {
        console.error(`[/api/live-news] failed for ${rssUrl}:`, err?.message);
      }
    }

    if (__newsCache) {
      return res.json({ success: true, count: __newsCache.data.length, news: __newsCache.data, stale: true });
    }
    res.status(502).json({ success: false, error: "Live news temporarily unavailable" });
  });
  let __econCache: { data: any[]; ts: number } | null = null;
  const __ECON_TTL = 10 * 60 * 1000; // 10 minutes
  app.get("/api/econ-events", async (req, res) => {
    // Serve fresh cache without hitting upstream (prevents 429 rate limiting)
    if (__econCache && Date.now() - __econCache.ts < __ECON_TTL) {
      return res.json({ success: true, count: __econCache.data.length, events: __econCache.data, cached: true });
    }
    try {
      const url = "https://nfs.faireconomy.media/ff_calendar_thisweek.json";
      const r = await fetch(url, {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
          "Accept": "application/json"
        }
      });
      if (!r.ok) throw new Error("upstream status " + r.status);
      const data = await r.json();
      if (!Array.isArray(data)) throw new Error("unexpected payload shape");
      __econCache = { data, ts: Date.now() };
      res.json({ success: true, count: data.length, events: data });
    } catch (err: any) {
      console.error("[/api/econ-events] failed:", err?.message);
      // Stale-while-error: if we have any old cache, serve it rather than failing
      if (__econCache) {
        return res.json({ success: true, count: __econCache.data.length, events: __econCache.data, stale: true });
      }
      res.status(502).json({ success: false, error: "Economic calendar temporarily unavailable" });
    }
  });
 app.get("/api/candles", async (req, res) => {
    try {
      const symbol = String(req.query.symbol || "XAUUSD");
      const candles = await fetchYahooCandles(symbol);
      res.json({ symbol, count: candles.length, candles });
    } catch (err: any) {
      console.error("[/api/candles] failed:", err?.message);
      res.status(502).json({ error: "Market data temporarily unavailable" });
    }
  });
   app.post("/api/license/check", async (req, res) => {
    try {
      const { deviceId, fullName, email } = req.body || {};
      if (!deviceId || typeof deviceId !== "string") {
        return res.status(400).json({ error: "deviceId لازم است" });
      }

      // دستگاه را ثبت یا last_seen را به‌روز کن
      await query(
        `INSERT INTO devices (device_id, full_name, email, last_seen)
         VALUES ($1, $2, $3, now())
         ON CONFLICT (device_id)
         DO UPDATE SET last_seen = now(),
                       full_name = COALESCE(EXCLUDED.full_name, devices.full_name),
                       email = COALESCE(EXCLUDED.email, devices.email)`,
        [deviceId, fullName || null, email || null]
      );

      // وضعیت اشتراک را بخوان
      const sub = await query(
        `SELECT tier, source, expires_at, is_active
         FROM subscriptions
         WHERE device_id = $1`,
        [deviceId]
      );

      if (sub.rows.length === 0) {
        return res.json({ tier: "free", isActivated: false });
      }

      const row = sub.rows[0];
      // اگر منقضی شده، free برگردان
      if (row.expires_at && new Date(row.expires_at) < new Date()) {
        await query(
          `UPDATE subscriptions SET is_active = false WHERE device_id = $1`,
          [deviceId]
        );
        return res.json({ tier: "free", isActivated: false, expired: true });
      }

      if (!row.is_active) {
        return res.json({ tier: "free", isActivated: false });
      }

      return res.json({
        tier: row.tier,
        isActivated: row.tier !== "free",
        source: row.source,
        expiresAt: row.expires_at,
      });
    } catch (e) {
      console.error("license/check error:", e);
      return res.status(500).json({ error: "خطای سرور" });
    }
  });

  // --- فعال‌سازی با کد دستی ---
  // کاربر کدی که خریده وارد می‌کند؛ سرور چک و فعال می‌کند.
  app.post("/api/license/activate", async (req, res) => {
    try {
      const { deviceId, keyCode } = req.body || {};
      if (!deviceId || !keyCode) {
        return res.status(400).json({ error: "deviceId و keyCode لازم است" });
      }

      // دستگاه باید از قبل ثبت شده باشد (check قبلا صدا زده شده)
      await query(
        `INSERT INTO devices (device_id, last_seen)
         VALUES ($1, now())
         ON CONFLICT (device_id) DO UPDATE SET last_seen = now()`,
        [deviceId]
      );

      // کد را پیدا کن
      const keyRes = await query(
        `SELECT key_code, tier, duration_days, is_used FROM license_keys WHERE key_code = $1`,
        [keyCode.trim()]
      );

      if (keyRes.rows.length === 0) {
        return res.status(404).json({ error: "کد لایسنس نامعتبر است", ok: false });
      }
      const key = keyRes.rows[0];
      if (key.is_used) {
        return res.status(409).json({ error: "این کد قبلا استفاده شده است", ok: false });
      }

      // محاسبه تاریخ انقضا
      let expiresAt: string | null = null;
      if (key.duration_days) {
        const d = new Date();
        d.setDate(d.getDate() + key.duration_days);
        expiresAt = d.toISOString();
      }

      // کد را مصرف‌شده علامت بزن
      await query(
        `UPDATE license_keys SET is_used = true, used_by = $1, used_at = now() WHERE key_code = $2`,
        [deviceId, key.key_code]
      );

      // اشتراک را بساز یا به‌روز کن
      await query(
        `INSERT INTO subscriptions (device_id, tier, source, started_at, expires_at, is_active)
         VALUES ($1, $2, 'manual_key', now(), $3, true)
         ON CONFLICT (device_id)
         DO UPDATE SET tier = EXCLUDED.tier, source = 'manual_key',
                       started_at = now(), expires_at = EXCLUDED.expires_at, is_active = true`,
        [deviceId, key.tier, expiresAt]
      );

      return res.json({ ok: true, tier: key.tier, expiresAt });
    } catch (e) {
      console.error("license/activate error:", e);
      return res.status(500).json({ error: "خطای سرور", ok: false });
    }
  });

  // --- ساخت کد جدید (فقط برای ادمین/خودت) ---
  // با هدر مخفی محافظت می‌شود تا فقط تو بتوانی کد بسازی.
  app.post("/api/admin/create-key", async (req, res) => {
    try {
      const adminToken = req.headers["x-admin-token"];
      // این مقدار را به یک رشته طولانی و مخفی عوض کن (در سند توضیح داده شده)
      const ADMIN_TOKEN = process.env.ADMIN_TOKEN || "CHANGE_THIS_ADMIN_TOKEN";
      if (adminToken !== ADMIN_TOKEN) {
        return res.status(403).json({ error: "دسترسی غیرمجاز" });
      }

      const { tier = "vip", durationDays = null, count = 1 } = req.body || {};
      const created: string[] = [];

      for (let i = 0; i < Math.min(count, 50); i++) {
        // کد تصادفی به شکل ONG-XXXX-XXXX
        const rand = crypto.randomBytes(4).toString("hex").toUpperCase();
        const rand2 = crypto.randomBytes(4).toString("hex").toUpperCase();
        const code = `ONG-${rand.slice(0, 4)}-${rand2.slice(0, 4)}`;
        await query(
          `INSERT INTO license_keys (key_code, tier, duration_days) VALUES ($1, $2, $3)`,
          [code, tier, durationDays]
        );
        created.push(code);
      }

      return res.json({ ok: true, keys: created });
    } catch (e) {
      console.error("admin/create-key error:", e);
      return res.status(500).json({ error: "خطای سرور" });
    }
  });

// ============================================================
// پایان LICENSE ENDPOINTS
// 
 // Vite middleware for development or Static server for production
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer().catch((err) => {
  console.error("Failed to start server:", err);
});
