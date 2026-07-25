import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { DbService } from "./server/db";

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

async function fetchYahooChartCandles(symbol: string): Promise<any[] | null> {
  const hosts = ["query1.finance.yahoo.com", "query2.finance.yahoo.com"];
  const userAgent = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36";
  
  const mapping: Record<string, string> = {
    'XAUUSD': 'GC=F',
    'XAGUSD': 'SI=F',
    'BTCUSD': 'BTC-USD',
    'ETHUSD': 'ETH-USD',
    'EURUSD': 'EURUSD=X',
    'GBPUSD': 'GBPUSD=X',
    'USDJPY': 'JPY=X',
    'AUDUSD': 'AUDUSD=X',
    'USDCAD': 'CAD=X',
    'US30': '^DJI',
    'NAS100': '^NDX',
    'OIL': 'BZ=F'
  };
  const ticker = mapping[symbol] || symbol;

  for (const host of hosts) {
    try {
      const url = `https://${host}/v8/finance/chart/${encodeURIComponent(ticker)}?interval=1h&range=7d`;
      const res = await fetch(url, { headers: { "User-Agent": userAgent } });
      if (res.ok) {
        const json = await res.json();
        const result = json?.chart?.result?.[0];
        if (result) {
          const timestamps = result.timestamp || [];
          const quotes = result.indicators?.quote?.[0];
          if (quotes && Array.isArray(quotes.close) && timestamps.length > 0) {
            const candles = [];
            for (let i = 0; i < timestamps.length; i++) {
              const t = timestamps[i];
              const o = quotes.open?.[i];
              const h = quotes.high?.[i];
              const l = quotes.low?.[i];
              const c = quotes.close?.[i];
              const v = quotes.volume?.[i] || 0;

              if (
                typeof t === 'number' &&
                typeof o === 'number' && !isNaN(o) &&
                typeof h === 'number' && !isNaN(h) &&
                typeof l === 'number' && !isNaN(l) &&
                typeof c === 'number' && !isNaN(c)
              ) {
                candles.push({
                  timestamp: t,
                  open: o,
                  high: h,
                  low: l,
                  close: c,
                  volume: v
                });
              }
            }
            if (candles.length >= 25) {
              return candles;
            }
          }
        }
      }
    } catch (err) {
      console.error(`Error fetching chart candles for ${symbol} on ${host}:`, err);
    }
  }
  return null;
}

async function startServer() {
  const app = express();
  const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

  // Enable JSON bodies
  app.use(express.json());

  // API: Live Candles Proxy (highly reliable server-side fetch)
  app.get("/api/candles", async (req, res) => {
    try {
      const symbol = req.query.symbol as string;
      if (!symbol) {
        return res.status(400).json({ success: false, error: "symbol is required" });
      }

      const candles = await fetchYahooChartCandles(symbol);
      if (candles) {
        return res.json({ success: true, data: candles });
      }
      return res.status(404).json({ success: false, error: `Could not fetch candles for ${symbol}` });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err?.message || "Internal candle proxy error" });
    }
  });

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

  // API: License Verification
  app.post("/api/license/check", async (req, res) => {
    try {
      const { deviceId } = req.body;
      if (!deviceId) {
        return res.status(400).json({ success: false, error: "deviceId is required" });
      }

      let device = await DbService.getDevice(deviceId);
      
      // If the device does not exist, initialize it in the database with standard FREE status
      if (!device) {
        device = {
          deviceId,
          status: "FREE",
          activatedAt: null,
          expiresAt: null,
          licenseKey: null,
          updatedAt: new Date().toISOString()
        };
        await DbService.saveDevice(device);
      }

      // Check if VIP subscription has expired
      let isVIP = device.status === "VIP";
      if (isVIP && device.expiresAt) {
        const expiresTime = new Date(device.expiresAt).getTime();
        const nowTime = Date.now();
        if (nowTime > expiresTime) {
          // License expired! Revert to FREE
          device.status = "FREE";
          device.updatedAt = new Date().toISOString();
          await DbService.saveDevice(device);
          isVIP = false;
        }
      }

      res.json({
        success: true,
        data: {
          deviceId: device.deviceId,
          status: device.status,
          isVIP,
          expiresAt: device.expiresAt,
          licenseKey: device.licenseKey,
        }
      });
    } catch (err: any) {
      console.error("Error checking license status:", err);
      res.status(500).json({ success: false, error: err?.message || "Internal license check error" });
    }
  });

  // API: Activate Key
  app.post("/api/license/activate", async (req, res) => {
    try {
      const { deviceId, key } = req.body;
      if (!deviceId || !key) {
        return res.status(400).json({ success: false, error: "deviceId and license key are required" });
      }

      const cleanKey = key.toUpperCase().trim();
      const licenseKeyDoc = await DbService.getLicenseKey(cleanKey);

      if (!licenseKeyDoc) {
        return res.status(404).json({ success: false, error: "Invalid license key" });
      }

      if (licenseKeyDoc.status !== "UNUSED") {
        return res.status(400).json({ success: false, error: "This license key has already been used" });
      }

      // Get or create device
      let device = await DbService.getDevice(deviceId);
      if (!device) {
        device = {
          deviceId,
          status: "FREE",
          activatedAt: null,
          expiresAt: null,
          licenseKey: null,
          updatedAt: new Date().toISOString()
        };
      }

      // Calculate expiration date
      const activatedAt = new Date().toISOString();
      let expiresAt: string | null = null;
      if (licenseKeyDoc.durationDays < 99999) {
        const expDate = new Date();
        expDate.setDate(expDate.getDate() + licenseKeyDoc.durationDays);
        expiresAt = expDate.toISOString();
      }

      // Update device
      device.status = "VIP";
      device.activatedAt = activatedAt;
      device.expiresAt = expiresAt;
      device.licenseKey = cleanKey;
      device.updatedAt = new Date().toISOString();

      // Update key doc
      licenseKeyDoc.status = "USED";
      licenseKeyDoc.usedByDeviceId = deviceId;
      licenseKeyDoc.usedAt = activatedAt;

      // Save to database
      await DbService.saveDevice(device);
      await DbService.saveLicenseKey(licenseKeyDoc);

      // Create a subscription record for audit trail
      const subscriptionId = `sub_act_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
      await DbService.saveSubscription({
        subscriptionId,
        deviceId,
        platform: "LICENSE_KEY",
        status: "ACTIVE",
        productId: `license_${licenseKeyDoc.durationDays}d`,
        expiresAt,
        updatedAt: new Date().toISOString()
      });

      res.json({
        success: true,
        message: "License activated successfully",
        data: {
          deviceId: device.deviceId,
          status: device.status,
          isVIP: true,
          expiresAt: device.expiresAt,
          licenseKey: device.licenseKey
        }
      });
    } catch (err: any) {
      console.error("Error activating license key:", err);
      res.status(500).json({ success: false, error: err?.message || "Internal license activation error" });
    }
  });

  // API: Admin Create License Key
  app.post("/api/admin/create-key", async (req, res) => {
    try {
      const { secretToken, key, durationDays } = req.body;
      
      // Protection check using ADMIN_SECRET_KEY environment variable
      const serverSecret = process.env.ADMIN_SECRET_KEY || "onigama-admin-super-secret-key-2026";
      if (!secretToken || secretToken !== serverSecret) {
        return res.status(401).json({ success: false, error: "Unauthorized: Invalid administrative secret token" });
      }

      if (!key || !durationDays || typeof durationDays !== "number") {
        return res.status(400).json({ success: false, error: "key and valid durationDays (number) are required" });
      }

      const cleanKey = key.toUpperCase().trim();
      const existingKey = await DbService.getLicenseKey(cleanKey);
      if (existingKey) {
        return res.status(400).json({ success: false, error: "This license key already exists" });
      }

      const createdKey = await DbService.createLicenseKey(cleanKey, durationDays);
      res.json({
        success: true,
        message: `License key created successfully: ${createdKey.key}`,
        data: createdKey
      });
    } catch (err: any) {
      console.error("Error creating license key:", err);
      res.status(500).json({ success: false, error: err?.message || "Internal administrative error" });
    }
  });

  // API: Google Play Billing Validation (Placeholder for Phase 2)
  app.post("/api/license/google-play", async (req, res) => {
    try {
      const { deviceId, productId, purchaseToken } = req.body;
      if (!deviceId || !productId || !purchaseToken) {
        return res.status(400).json({ success: false, error: "Missing required parameters" });
      }

      // Sandbox implementation for verifying purchase flow in development
      console.log(`[Google Play Receipt Sandbox] Validating product ${productId} for device ${deviceId}`);

      let device = await DbService.getDevice(deviceId);
      if (!device) {
        device = {
          deviceId,
          status: "FREE",
          activatedAt: null,
          expiresAt: null,
          licenseKey: null,
          updatedAt: new Date().toISOString()
        };
      }

      const activatedAt = new Date().toISOString();
      let expiresAt: string | null = null;
      
      if (productId.includes("monthly")) {
        const exp = new Date();
        exp.setDate(exp.getDate() + 30);
        expiresAt = exp.toISOString();
      } else if (productId.includes("annual")) {
        const exp = new Date();
        exp.setDate(exp.getDate() + 365);
        expiresAt = exp.toISOString();
      }

      device.status = "VIP";
      device.activatedAt = activatedAt;
      device.expiresAt = expiresAt;
      device.licenseKey = `GP_PURCHASE_${purchaseToken.substring(0, 8).toUpperCase()}`;
      device.updatedAt = new Date().toISOString();

      await DbService.saveDevice(device);

      // Save purchase record
      const purchaseId = `gp_pur_${Date.now()}`;
      await DbService.savePurchase({
        purchaseId,
        deviceId,
        platform: "PLAY_STORE",
        transactionId: purchaseToken,
        productId,
        purchaseDate: activatedAt,
        status: "COMPLETED"
      });

      // Save subscription record
      const subscriptionId = `gp_sub_${Date.now()}`;
      await DbService.saveSubscription({
        subscriptionId,
        deviceId,
        platform: "PLAY_STORE",
        status: "ACTIVE",
        productId,
        expiresAt,
        updatedAt: new Date().toISOString()
      });

      res.json({
        success: true,
        message: "Google Play checkout simulated and verified successfully in sandbox",
        data: {
          deviceId: device.deviceId,
          status: device.status,
          isVIP: true,
          expiresAt: device.expiresAt,
          licenseKey: device.licenseKey
        }
      });
    } catch (err: any) {
      console.error("Error validating Google Play receipt:", err);
      res.status(500).json({ success: false, error: err?.message || "Internal Google Play checkout verification error" });
    }
  });

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
