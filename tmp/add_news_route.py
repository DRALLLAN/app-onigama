path = 'server.ts'
with open(path, 'r', encoding='utf-8') as f:
    src = f.read()

if '/api/live-news' in src:
    print("!! Route already exists — file untouched.")
    raise SystemExit

# Anchor: insert right before the econ-events cache declaration block.
anchor = '  let __econCache: { data: any[]; ts: number } | null = null;'

if anchor not in src:
    print("!! ANCHOR NOT FOUND — file untouched.")
    raise SystemExit

new_route = '''  let __newsCache: { data: any[]; ts: number } | null = null;
  const __NEWS_TTL = 5 * 60 * 1000; // 5 minutes
  app.get("/api/live-news", async (req, res) => {
    if (__newsCache && Date.now() - __newsCache.ts < __NEWS_TTL) {
      return res.json({ success: true, count: __newsCache.data.length, news: __newsCache.data, cached: true });
    }
    try {
      const { parseStringPromise } = require("xml2js");
      const rssUrl = "https://investinglive.com/feed/";
      const r = await fetch(rssUrl, {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
          "Accept": "application/rss+xml, application/xml, text/xml"
        }
      });
      if (!r.ok) throw new Error("upstream status " + r.status);
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
        return { id: String(guid), title: String(title), link: String(link), pubDate: String(pubDate), sentiment, relatedSymbol, source: "InvestingLive Feed" };
      });
      if (news.length === 0) throw new Error("no items parsed");
      __newsCache = { data: news, ts: Date.now() };
      res.json({ success: true, count: news.length, news });
    } catch (err: any) {
      console.error("[/api/live-news] failed:", err?.message);
      if (__newsCache) {
        return res.json({ success: true, count: __newsCache.data.length, news: __newsCache.data, stale: true });
      }
      res.status(502).json({ success: false, error: "Live news temporarily unavailable" });
    }
  });
'''

src = src.replace(anchor, new_route + anchor, 1)

with open(path, 'w', encoding='utf-8') as f:
    f.write(src)

# verify
checks = {
    "route added": '/api/live-news' in src,
    "news cache": "__newsCache" in src,
    "ttl present": "__NEWS_TTL" in src,
    "xml2js used": "parseStringPromise" in src,
    "stale handler": 'stale: true' in src and 'news:' in src,
    "econ anchor intact": '  let __econCache: { data: any[]; ts: number } | null = null;' in src,
}
allok = True
for k, v in checks.items():
    print(("PASS" if v else "FAIL"), k)
    if not v:
        allok = False
print("ALL GOOD" if allok else "SOME FAILED")
