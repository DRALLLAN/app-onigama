path = 'src/components/FundamentalNews.tsx'
with open(path, 'r', encoding='utf-8') as f:
    src = f.read()

if '/api/live-news' in src:
    print("!! Local news fetch already exists — file untouched.")
    raise SystemExit

anchor = "      const rssUrl = 'https://www.forexlive.com/feed';"

if anchor not in src:
    print("!! ANCHOR NOT FOUND — file untouched.")
    raise SystemExit

injection = """      // Primary source: internal server proxy (no CORS, parsed JSON)
      try {
        const localRes = await fetch('/api/live-news');
        if (localRes.ok) {
          const j = await localRes.json();
          if (j && j.success && Array.isArray(j.news) && j.news.length > 0) {
            const list: LiveHeadline[] = j.news.map((n: any) => ({
              id: n.id,
              title: n.title,
              titleFa: translateHeadline(n.title),
              link: n.link,
              pubDate: new Date(n.pubDate).toLocaleTimeString(language === 'fa' ? 'fa-IR' : 'en-US', { hour: '2-digit', minute: '2-digit' }),
              pubDateFull: new Date(n.pubDate),
              sentiment: n.sentiment,
              relatedSymbol: n.relatedSymbol,
              source: n.source
            }));
            setLiveHeadlines(list);
            setIsFetchingNews(false);
            return;
          }
        }
      } catch (_) {}
"""

src = src.replace(anchor, injection + anchor, 1)

with open(path, 'w', encoding='utf-8') as f:
    f.write(src)

checks = {
    "injection added": "/api/live-news" in src,
    "anchor intact": anchor in src,
    "translateHeadline used": "titleFa: translateHeadline(n.title)" in src,
    "setLiveHeadlines(list)": "setLiveHeadlines(list)" in src,
    "early return": "setIsFetchingNews(false);\n            return;" in src,
}
allok = True
for k, v in checks.items():
    print(("PASS" if v else "FAIL"), k)
    if not v:
        allok = False
print("ALL GOOD" if allok else "SOME FAILED")
