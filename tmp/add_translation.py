path = 'server.ts'
with open(path, 'r', encoding='utf-8') as f:
    src = f.read()

orig = src

# --- 1) Add translateToFa helper before the news cache declaration ---
if 'async function translateToFa' not in src:
    helper_anchor = '  let __newsCache: { data: any[]; ts: number } | null = null;'
    if helper_anchor not in src:
        print("!! NEWS CACHE ANCHOR NOT FOUND — file untouched.")
        raise SystemExit
    helper = '''  async function translateToFa(text: string): Promise<string> {
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
'''
    src = src.replace(helper_anchor, helper + helper_anchor, 1)

# --- 2) Insert translation step after news array is built, before caching ---
# Anchor on the line that builds the cache from news.
cache_anchor = '      if (news.length === 0) throw new Error("no items parsed");\n      __newsCache = { data: news, ts: Date.now() };'

if cache_anchor not in src:
    print("!! CACHE-BUILD ANCHOR NOT FOUND — file untouched.")
    raise SystemExit

cache_replacement = '''      if (news.length === 0) throw new Error("no items parsed");
      // Translate each headline to Persian (parallel; fall back to English on failure)
      const translated = await Promise.all(news.map(async (n: any) => {
        const titleFa = await translateToFa(n.title);
        return { ...n, titleFa };
      }));
      __newsCache = { data: translated, ts: Date.now() };'''

src = src.replace(cache_anchor, cache_replacement, 1)

# --- 3) Update the success response to use translated array ---
old_resp = '      __newsCache = { data: translated, ts: Date.now() };\n      res.json({ success: true, count: news.length, news });'
new_resp = '      __newsCache = { data: translated, ts: Date.now() };\n      res.json({ success: true, count: translated.length, news: translated });'
if old_resp in src:
    src = src.replace(old_resp, new_resp, 1)

if src == orig:
    print("!! NO CHANGES — aborting.")
    raise SystemExit

with open(path, 'w', encoding='utf-8') as f:
    f.write(src)

checks = {
    "translateToFa helper": "async function translateToFa" in src,
    "parallel translate": "await Promise.all(news.map" in src,
    "titleFa built": "const titleFa = await translateToFa(n.title)" in src,
    "cache uses translated": "__newsCache = { data: translated" in src,
    "response uses translated": "news: translated" in src,
}
allok = True
for k, v in checks.items():
    print(("PASS" if v else "FAIL"), k)
    if not v:
        allok = False
print("ALL GOOD" if allok else "SOME FAILED")
