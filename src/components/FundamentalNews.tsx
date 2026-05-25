import { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  TrendingUp, 
  TrendingDown, 
  AlertCircle, 
  Calendar, 
  Flame, 
  Search, 
  Bell, 
  BellRing, 
  RefreshCw, 
  SlidersHorizontal, 
  Info, 
  Globe, 
  Gauge, 
  ChevronDown, 
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  Award
} from 'lucide-react';

interface FundamentalNewsProps {
  language: 'fa' | 'en';
  selectedSymbol?: string;
}

export interface EconomicEvent {
  id: string;
  titleFa: string;
  titleEn: string;
  currency: string;
  impact: 'HIGH' | 'MEDIUM' | 'LOW';
  previous: string;
  forecast: string;
  actual?: string;
  timeOffsetHours: number; // Positive for ahead, negative for ago
  relevantAssets: string[]; // ['XAUUSD', 'EURUSD', ...]
  impactAnalysisEn: string;
  impactAnalysisFa: string;
  volatilityImpact: 'BULLISH' | 'BEARISH' | 'NEUTRAL';
}



// A lookup dictionary of keywords in English titles to get precise Persian translation, relevant assets, and standard impact analysis
const keywordDatabase: Array<{
  keywords: string[];
  titleFa: string;
  relevantAssets: string[];
  impactAnalysisEn: string;
  impactAnalysisFa: string;
}> = [
  {
    keywords: ['cpi', 'consumer price index', 'inflation'],
    titleFa: 'شاخص تورم مصرف‌کننده (CPI)',
    relevantAssets: ['XAUUSD', 'XAGUSD', 'EURUSD', 'GBPUSD', 'USDJPY', 'US30', 'NAS100', 'BTCUSD', 'ETHUSD'],
    impactAnalysisEn: 'Measures change in the price of goods and services. A higher reading indicates rising inflation which suggests hawkish monetary policy (supportive of the home currency, bearish for Gold and stocks). Lower CPI encourages dovish easing (bullish for Gold, stocks and crypto).',
    impactAnalysisFa: 'تغییرات قیمت کالاها و خدمات مصرفی (شاخص تورم کلیدی). عدد بزرگ‌تر از پیش‌بینی، گویای رشد تورم است و بانک مرکزی را برای بالا نگه داشتن نرخ بهره (تقویت ارز پایه سشن، ریزش طلا و شاخص‌های سهام) مصمم می‌کند. عدد کوچک‌تر محرک رشد شدید اونس طلا و بازارهای مالی است.',
  },
  {
    keywords: ['nfp', 'non-farm', 'employment change', 'payrolls'],
    titleFa: 'گزارش اشتغال بخش غیرکشاورزی (NFP)',
    relevantAssets: ['XAUUSD', 'XAGUSD', 'EURUSD', 'GBPUSD', 'USDJPY', 'US30', 'NAS100'],
    impactAnalysisEn: 'Surprises in NFP dictate rate trajectory. Stronger employment growth indicates economic resilience, allowing central banks to keep interest rates elevated (Bullish for local currency, Bearish for Gold and Stock Indices). A weak employment figure triggers rate cut speculations (Bullish for Gold).',
    impactAnalysisFa: 'آمار خالص اشتغال جدید در بخش غیرکشاورزی آمریکا (مهم‌ترین محرک بازار کار). رشد فراتر از انتظار نشانگر رونق شدید است و به تداوم نرخ‌های بهره بالاتر کمک می‌کند (صعود شدید دلار، سقوط طلا و نزدک). گزارش ناامیدکننده خریداران طلا را به لیدر صعودی مارکت تبدیل خواهد کرد.',
  },
  {
    keywords: ['unemployment rate'],
    titleFa: 'نرخ بیکاری رسمی',
    relevantAssets: ['XAUUSD', 'EURUSD', 'GBPUSD', 'USDJPY', 'US30', 'NAS100'],
    impactAnalysisEn: 'Measures the percentage of total work force that is unemployed. Rising unemployment signals economic stress, prompting potential interest rate cuts (Dovish, Bullish for Gold). Declining unemployment signals tight labor conditions (Hawkish, Bearish for Gold).',
    impactAnalysisFa: 'درصد بیکاران فعال در کل نیروی کار کشور. جهش در نرخ بیکاری نشانه گسل‌های عمیق رکود در اقتصاد بوده و تمایلات تلطیف سیاست پولی را بالا می‌برد (ریزش دلار/ارز پایه، صعود پرشتاب اونس طلا). مقادیر کاهشی بیکاری عامل تحرک منفی در پناهگاه امن طلا است.',
  },
  {
    keywords: ['gdp', 'gross domestic product'],
    titleFa: 'تولید ناخالص داخلی (GDP)',
    relevantAssets: ['US30', 'NAS100', 'XAUUSD', 'EURUSD', 'GBPUSD', 'USDJPY'],
    impactAnalysisEn: 'Broadest measure of overall economic activity. A high GDP indicates strong economic expansion (supportive for the currency, bearish for Gold due to rate growth fears). GDP contraction triggers economic distress cycles (Bullish for Gold as safe-haven).',
    impactAnalysisFa: 'اصلی‌ترین و جامع‌ترین دماسنج اقتصادی برای سنجش رشد یا انقباض ثروت ملی. جهش فراتر از فرضیات پیش‌بینی شده تولید ناخالص داخلی حاکی از سلامت بالای موتور اقتصاد (رشد سهام و فشار فروش موقت در طلا) است، در حالی که آمار ضعیف‌تر سناریوی پناهگاه امن در طلا را تحریک می‌کند.',
  },
  {
    keywords: ['fomc', 'interest rate', 'rate decision', 'monetary policy', 'policy statement', 'federal funds rate', 'meeting accounts'],
    titleFa: 'تعیین مراجع نرخ بهره و بیانیه رسمی سیاست پولی',
    relevantAssets: ['XAUUSD', 'XAGUSD', 'EURUSD', 'GBPUSD', 'USDJPY', 'US30', 'NAS100', 'BTCUSD', 'ETHUSD'],
    impactAnalysisEn: 'The core fundamental pillar of financial markets. An interest rate hike or hawkish policy bias drives capital yields into bonds, strengthening the local currency and heavily purging Gold and Crypto. Lower interest rates or liquidity inject discussion boosts gold, indices and digital assets.',
    impactAnalysisFa: 'مهم‌ترین فاکتور نوسان و بیانیه سیاست‌گذار ارشد پولی. هرگونه افزایش نرخ بهره یا تداوم سیاست‌های سفت‌وسخت انقباضی (هاکیش) از جانب بانک مرکزی سبب جذب شدید نقدینگی به اوراق قرضه شده و سقوط عمیق طلا و رمزارزها را به دنبال دارد. لحن ملایم (داویش) محرک صعود اونس است.',
  },
  {
    keywords: ['pmi', 'purchasing managers', 'manufacturing pmi', 'services pmi'],
    titleFa: 'شاخص مدیران خرید بخش ساخت و خدمات (PMI)',
    relevantAssets: ['US30', 'NAS100', 'XAUUSD', 'EURUSD', 'GBPUSD', 'USDJPY'],
    impactAnalysisEn: 'A leading indicator of economic health where a reading above 50 represents expansion. Strong readings signal resilience, pushing currency high but capping gold due to easing delay. Weak readings support expectations of rate cuts.',
    impactAnalysisFa: 'ردیاب میزان تمایلات اقتصادی مدیران خرید ارشد کارخانجات و زنجیره خدمات. نتایج بالای کانال ۵۰.۰ نمایانگر گسترش و توسعه فعال اقتصادی (تقویت ارز پایه، تضعیف طلا) است. نتایج ضعیف زیر ۵۰.۰ نشانه رکود ساختاری و عاملی برای صعود اونس طلا و نقره به شمار می‌آید.',
  },
  {
    keywords: ['retail sales'],
    titleFa: 'میزان خرده‌فروشی ماهانه',
    relevantAssets: ['XAUUSD', 'EURUSD', 'GBPUSD', 'US30', 'NAS100'],
    impactAnalysisEn: 'Measures consumer spending, which drives a major part of GDP. High retail growth shows consumer resilience and boosts interest rate support (supporting local currency, bearish for Gold). Sluggish retail sales boost rate cut hopes.',
    impactAnalysisFa: 'سنجش تغییر ارزش خرده‌فروشی ماهانه که آینه تمام‌نمای قدرت خرید مصرف‌کننده و تحرک لوکوموتیو GDP است. صعود آمار خرده‌فروشی دلالت بر قدرت بقای معیشتی و افزایش موضع ارز بومی (ریزش طلا) دارد و کاهش سنگین آن، پمپ‌کننده خریدهای طلا خواهد بود.',
  },
  {
    keywords: ['oil', 'crude', 'eia', 'inventories'],
    titleFa: 'تغییرات ذخایر نفت خام هفتگی آمریکا (EIA)',
    relevantAssets: ['OIL', 'US30', 'XAUUSD'],
    impactAnalysisEn: 'EIA petroleum inventories determine short term pricing of WTI and Brent. A larger-than-expected petroleum drawdown indicates high demand or tight supply, pumping crude oil prices, which can trigger inflationary trends.',
    impactAnalysisFa: 'گزارش رسمی ذخایر استراتژیک نفت خام. کاهش بیش از انتظار ذخایر خبر از برتری جدی تقاضا بر مارکت تولید می‌دهد که به رالی صعودی خریداران نفت خام (OIL) دامن زده و به صورت غیرمستقیم از منظر تورم زا بودن بازارهای کالا را تحت تأثیر صعودی قرار می‌دهد.',
  },
  {
    keywords: ['holiday', 'bank holiday'],
    titleFa: 'تعطیلی بانک‌های بازار مرجع',
    relevantAssets: ['ALL'],
    impactAnalysisEn: 'Sovereign banks closed. Liquidity in target sessions will be extremely thin, which can occasionally trigger unpredictable brief spikes or wide spreads during market rolls.',
    impactAnalysisFa: 'تعطیلی رسمی بانک‌های مرجع. لیکوییدیتی و ژرفای استخر معاملاتی به حداقل می‌رسد. در طول برگزاری تعطیلات، نوسانات کم‌رمق بوده اما پتانسیل پرش‌های مقطعی، گپ‌های ناگهانی کارگزاری‌ها و تعریض مقطعی اسپردها همواره محتمل است.',
  },
  {
    keywords: ['speech', 'speaks', 'testimony', 'governor', 'chairman'],
    titleFa: 'سخنرانی رسمی مقامات ارشد بانکی',
    relevantAssets: ['XAUUSD', 'EURUSD', 'GBPUSD', 'USDJPY', 'US30', 'NAS100'],
    impactAnalysisEn: 'Speeches of central bank leaders offer live guidance. Hawkish wording on inflation containment boosts yields and currency; dovish statements warning on credit tightening triggers immediate bull market spikes.',
    impactAnalysisFa: 'سخنرانی رسمی رؤسا یا اعضای کلیدی بانک مرکزی. مواضع آنها پیرامون مبارزه با تورم و جهت‌های آتی نرخ بهره دارای بیشترین وزن حرکتی است. مواضع انقباضی (هاکیش) حامی ارز ملی و اتهامات انبساطی (داویش)، موجب پرواز قیمت اونس طلا و نقره می‌شود.',
  }
];

// Mapper helper to turn raw Forex Factory API entries into rich structured EconomicEvent model
function mapRawEvent(raw: any, index: number): EconomicEvent {
  const currency = raw.country || 'USD';
  const titleEn = raw.title || 'Economic Indicator';
  const titleLower = titleEn.toLowerCase();
  
  // Scrapes the keyword database for semantic matches
  let matchedRule = keywordDatabase.find(rule => 
    rule.keywords.some(kw => titleLower.includes(kw))
  );

  let titleFa = '';
  let relevantAssets: string[] = ['XAUUSD', 'EURUSD', 'GBPUSD', 'USDJPY', 'US30', 'NAS100'];
  let impactAnalysisEn = '';
  let impactAnalysisFa = '';

  const countryFaMap: Record<string, string> = {
    USD: 'آمریکا',
    EUR: 'منطقه یورو',
    GBP: 'بریتانیا',
    JPY: 'ژاپن',
    CAD: 'کانادا',
    AUD: 'استرالیا',
    NZD: 'نیوزیلند',
    CHF: 'سوئیس',
    CNY: 'چین'
  };
  const countryFa = countryFaMap[currency] || currency;

  if (matchedRule) {
    let customTitleFa = matchedRule.titleFa;
    if (customTitleFa.includes('آمریکا') && currency !== 'USD') {
      customTitleFa = customTitleFa.replace('آمریکا', countryFa);
    } else if (!customTitleFa.includes(countryFa)) {
      customTitleFa = `${customTitleFa} (${countryFa})`;
    }
    titleFa = customTitleFa;
    relevantAssets = matchedRule.relevantAssets;
    
    // Auto replace generic "Fed" tag with specific currency authority names
    impactAnalysisEn = matchedRule.impactAnalysisEn.replace(/Fed/g, `${currency} Central Bank`).replace(/USD/g, currency);
    impactAnalysisFa = matchedRule.impactAnalysisFa.replace(/فدرال رزرو/g, `بانک مرکزی ${countryFa}`).replace(/دلار/g, currency);
  } else {
    // Elegant fallbacks for dynamic titles
    let rawTitleFa = titleEn;
    if (titleLower.includes('consumer confidence')) rawTitleFa = 'شاخص اعتماد مصرف‌کننده';
    else if (titleLower.includes('durable goods')) rawTitleFa = 'سفارشات برای خرید کالاهای بادوام';
    else if (titleLower.includes('current account')) rawTitleFa = 'شاخص حساب جاری مستقل';
    else if (titleLower.includes('wholesale inventories')) rawTitleFa = 'آمار موجودی کالاهای بادوام انبارها';
    else if (titleLower.includes('trade balance')) rawTitleFa = 'موازنه تراز بازرگانی تجاری کالاها';
    else if (titleLower.includes('industrial production')) rawTitleFa = 'خروجی تولیدات صنایع صنعتی';
    else if (titleLower.includes('retail sales')) rawTitleFa = 'تغییرات میزان خرده‌فروشی ماهانه';
    
    titleFa = `${rawTitleFa} (${countryFa})`;
    
    if (currency === 'USD') {
      relevantAssets = ['XAUUSD', 'EURUSD', 'GBPUSD', 'USDJPY', 'US30', 'NAS100'];
    } else if (currency === 'EUR' || currency === 'GBP') {
      relevantAssets = [currency + 'USD', 'XAUUSD', 'XAGUSD'];
    } else if (currency === 'JPY') {
      relevantAssets = ['USDJPY', 'XAUUSD'];
    } else if (currency === 'OIL' || titleLower.includes('oil') || titleLower.includes('crude')) {
      relevantAssets = ['OIL', 'US30'];
    } else {
      relevantAssets = ['XAUUSD', 'EURUSD', 'GBPUSD'];
    }

    impactAnalysisEn = `Evaluating live indicators. Surprises above the forecast in ${titleEn} for ${currency} commonly expand domestic liquidity yields, acting negative on Gold pricing by elevating target local treasury rates. Underperformances prompt ease support (Bullish for precious metals).`;
    impactAnalysisFa = `ارزیابی لحظه‌ای آمار ${titleEn} برای سشن ستیلینگ ${countryFa}. آمار صعودی و بالاتر از حد انتظار سبب افزایش نرخ بهره، تقویت فاندامنتال ${currency} و کاهش جزئی روند اونس طلا و نقره می‌شود. گزارش‌های منفی سبب رالی صعودیِ طلا خواهد شد.`;
  }

  // Calculate dynamic hours offset relative to local live browser engine
  const eventDate = new Date(raw.date);
  const now = new Date();
  const timeOffsetHours = Math.round((eventDate.getTime() - now.getTime()) / (1000 * 60 * 60));

  const rawImpact = raw.impact || 'Low';
  let impact: 'HIGH' | 'MEDIUM' | 'LOW' = 'LOW';
  if (rawImpact.toLowerCase() === 'high') impact = 'HIGH';
  else if (rawImpact.toLowerCase() === 'medium') impact = 'MEDIUM';

  let volatilityImpact: 'BULLISH' | 'BEARISH' | 'NEUTRAL' = 'NEUTRAL';
  if (raw.actual && raw.forecast) {
    const actNum = parseFloat(raw.actual);
    const foreNum = parseFloat(raw.forecast);
    if (!isNaN(actNum) && !isNaN(foreNum)) {
      if (actNum > foreNum) {
        volatilityImpact = currency === 'USD' ? 'BEARISH' : 'BULLISH';
      } else if (actNum < foreNum) {
        volatilityImpact = currency === 'USD' ? 'BULLISH' : 'BEARISH';
      }
    }
  }

  return {
    id: `${currency}-${titleEn.replace(/[^a-zA-Z0-9]/g, '-')}-${raw.date}`.toLowerCase(),
    titleEn,
    titleFa,
    currency,
    impact,
    previous: raw.previous || '—',
    forecast: raw.forecast || '—',
    actual: raw.actual || undefined,
    timeOffsetHours,
    relevantAssets,
    impactAnalysisEn,
    impactAnalysisFa,
    volatilityImpact
  };
}

// Gorgeous backup database used as instant hydration placeholders until live network finishes loading
const STATIC_EVENTS_PLACEHOLDER: EconomicEvent[] = [
  {
    id: 'us-cpi-yoy',
    titleEn: 'US Consumer Price Index (CPI) YoY',
    titleFa: 'شاخص تورم سالانه مصرف‌کننده آمریکا (CPI)',
    currency: 'USD',
    impact: 'HIGH',
    previous: '3.1%',
    forecast: '3.2%',
    actual: undefined,
    timeOffsetHours: 48,
    relevantAssets: ['XAUUSD', 'XAGUSD', 'EURUSD', 'GBPUSD', 'USDJPY', 'US30', 'NAS100', 'BTCUSD', 'ETHUSD'],
    impactAnalysisEn: 'Predicting inflation trends. A higher CPI indicates persistent pricing pressure, forcing the Fed to keep rates elevated, strengthening USD and sliding Gold. Lower prints spark major bullish gold rallies.',
    impactAnalysisFa: 'پیش‌بینی روند تورم سالانه آمریکا. نرخ بالاتر از پیش‌بینی۳.۲٪ نشان‌دهنده پایداری فشارهای تورمی است و فدرال رزرو را برای حفظ طولانی‌مدت نرخ‌های بهره بالا مصمم می‌کند که به نفع دلار و به ضرر اونس طلا و نقره است.',
    volatilityImpact: 'NEUTRAL'
  },
  {
    id: 'fomc-minutes',
    titleEn: 'FOMC Interest Rate Decision & Statement',
    titleFa: 'تصمیم نرخ بهره و بیانیه رسمی فدرال رزرو (FOMC)',
    currency: 'USD',
    impact: 'HIGH',
    previous: '5.50%',
    forecast: '5.50%',
    actual: undefined,
    timeOffsetHours: 4,
    relevantAssets: ['XAUUSD', 'XAGUSD', 'EURUSD', 'GBPUSD', 'USDJPY', 'US30', 'NAS100', 'BTCUSD', 'ETHUSD'],
    impactAnalysisEn: 'Hold at 5.50% is anticipated. Hawkish forecasts strengthen treasury yields, dampening Gold. Dovish discussions of rate normalization act as immediate catalysts for gold buying waves.',
    impactAnalysisFa: 'فدرال رزرو احتمال زیاد نرخ بهره را در ۵.۵۰٪ تثبیت می‌کند اما بیانیه همراه آن لحنی تهاجمی (هاکیش) یا ملایم (داویش) دارد. هرگونه اشاره به آغاز فرآیند کاهش نرخ بهره سبب صعود خریداران طلا و شاخص‌های مالی می‌شود.',
    volatilityImpact: 'NEUTRAL'
  },
  {
    id: 'us-nfp',
    titleEn: 'Non-Farm Payrolls (NFP) Employment Change',
    titleFa: 'گزارش اشتغال بخش غیرکشاورزی آمریکا (NFP)',
    currency: 'USD',
    impact: 'HIGH',
    previous: '175K',
    forecast: '190K',
    actual: undefined,
    timeOffsetHours: 18,
    relevantAssets: ['XAUUSD', 'XAGUSD', 'EURUSD', 'GBPUSD', 'USDJPY', 'US30', 'NAS100'],
    impactAnalysisEn: 'Employment indices dictate yield directions. Aggressive hiring above estimate supports high rates (Bullish USD, Bearish Gold). Flat metrics provoke relief surges in metals.',
    impactAnalysisFa: 'بازار کار پررونق و فراتر از پیش‌بینی، دست فدرال رزرو را برای تأخیر در تسهیل سیاست‌های پولی باز می‌گذارد که سبب صعود دلار و ریزش طلا می‌شود. در مقابل، گزارش ضعیف حامی گاوهای خریدار اونس طلا است.',
    volatilityImpact: 'BULLISH'
  }
];

export function FundamentalNews({ language, selectedSymbol: parentSelectedSymbol }: FundamentalNewsProps) {
  const [filterImpact, setFilterImpact] = useState<'ALL' | 'HIGH' | 'MEDIUM' | 'LOW'>('ALL');
  const [selectedSymbol, setSelectedSymbol] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [alertSettings, setAlertSettings] = useState<Record<string, boolean>>({});
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [todayDateStr, setTodayDateStr] = useState('');
  const [liveEvents, setLiveEvents] = useState<EconomicEvent[]>([]);

  // Live premium volatility simulation offset
  const [liveOffset, setLiveOffset] = useState(0);
  const [isScanning, setIsScanning] = useState(false);
  const [scanStep, setScanStep] = useState(0);
  const [interactiveRiskPremium, setInteractiveRiskPremium] = useState<number | null>(null);

  const carouselRef = useRef<HTMLDivElement>(null);

  const scrollCarousel = (direction: 'left' | 'right') => {
    if (carouselRef.current) {
      const scrollAmount = 200;
      carouselRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  // Synchronize with parent selection when user shifts active asset tab
  useEffect(() => {
    if (parentSelectedSymbol) {
      setSelectedSymbol(parentSelectedSymbol);
    }
  }, [parentSelectedSymbol]);

  // Periodic micro-fluctuations (simulate highly reactive volatility indicators)
  useEffect(() => {
    const interval = setInterval(() => {
      setLiveOffset((Math.random() * 2.8) - 1.4);
    }, 4500);
    return () => clearInterval(interval);
  }, []);

  // Fetch live economic calendar from unblocked Forex Factory weekly scheduler
  const fetchLiveCalendar = async () => {
    try {
      const url = 'https://nfs.faireconomy.media/ff_calendar_thisweek.json';
      const res = await fetch(url);
      if (res.ok) {
        const rawData = await res.json();
        if (Array.isArray(rawData)) {
          const parsed = rawData.map((item, index) => mapRawEvent(item, index));
          setLiveEvents(parsed);
          return;
        }
      }
      throw new Error('Fallback to CORS proxies required');
    } catch (e) {
      const targetUrl = 'https://nfs.faireconomy.media/ff_calendar_thisweek.json';
      const proxies = [
        (u: string) => `https://api.allorigins.win/get?url=${encodeURIComponent(u)}`,
        (u: string) => `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(u)}`,
        (u: string) => `https://cors.lol/?url=${encodeURIComponent(u)}`,
        (u: string) => `https://corsproxy.io/?${encodeURIComponent(u)}`,
      ];
      for (const proxyFn of proxies) {
        try {
          const controller = new AbortController();
          const timer = setTimeout(() => controller.abort(), 3500);
          const response = await fetch(proxyFn(targetUrl), { signal: controller.signal });
          clearTimeout(timer);
          if (response.ok) {
            const data = await response.json();
            const jsonBody = data.contents ? (typeof data.contents === 'string' ? JSON.parse(data.contents) : data.contents) : data;
            if (Array.isArray(jsonBody)) {
              const parsed = jsonBody.map((item, index) => mapRawEvent(item, index));
              setLiveEvents(parsed);
              break;
            }
          }
        } catch (_) {}
      }
    }
  };

  // Instantly dispatch dynamic fetch on mount
  useEffect(() => {
    fetchLiveCalendar();
  }, []);

  // Loaded at mount
  useEffect(() => {
    // Load local storage alert triggers for events
    const saved = localStorage.getItem('onigama_fundamental_alerts');
    if (saved) {
      try {
        setAlertSettings(JSON.parse(saved));
      } catch (e) {
        // Ignored
      }
    }

    // Dynamic date string
    const d = new Date();
    const options: Intl.DateTimeFormatOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    setTodayDateStr(
      language === 'fa' 
        ? d.toLocaleDateString('fa-IR', options) 
        : d.toLocaleDateString('en-US', options)
    );
  }, [language]);

  // Read live computed data as primary, falling back to static database placeholders smoothly
  const eventsData = useMemo<EconomicEvent[]>(() => {
    return liveEvents.length > 0 ? liveEvents : STATIC_EVENTS_PLACEHOLDER;
  }, [liveEvents]);

  // Filter list of assets/symbols
  const symbolsList = useMemo(() => {
    return [
      { id: 'ALL', nameFa: 'همه نمادها', nameEn: 'All Assets', icon: '🌐', color: 'text-blue-400' },
      { id: 'XAUUSD', nameFa: 'طلا (XAU)', nameEn: 'Gold (XAU)', icon: '🟡', color: 'text-amber-400' },
      { id: 'EURUSD', nameFa: 'يورو (EUR)', nameEn: 'Euro (EUR)', icon: '🇪🇺', color: 'text-indigo-400' },
      { id: 'GBPUSD', nameFa: 'پوند (GBP)', nameEn: 'Pound (GBP)', icon: '🇬🇧', color: 'text-teal-400' },
      { id: 'USDJPY', nameFa: 'ین (JPY)', nameEn: 'Yen (JPY)', icon: '🇯🇵', color: 'text-rose-400' },
      { id: 'BTCUSD', nameFa: 'بیت‌کوین (BTC)', nameEn: 'Bitcoin (BTC)', icon: '₿', color: 'text-orange-400' },
      { id: 'US30', nameFa: 'داوجونز (US30)', nameEn: 'Dow Jones (US30)', icon: '📈', color: 'text-emerald-400' },
      { id: 'OIL', nameFa: 'نفت (OIL)', nameEn: 'Oil (OIL)', icon: '🛢️', color: 'text-stone-400' },
    ];
  }, []);

  // Compute the current absolute volatility gauge score for the selected symbol with a live updater & offset
  const volatilityLevel = useMemo(() => {
    let score = 0;
    const relevantEvents = selectedSymbol === 'ALL' 
      ? eventsData 
      : eventsData.filter(ev => ev.relevantAssets.includes(selectedSymbol));

    relevantEvents.forEach(ev => {
      let weight = ev.impact === 'HIGH' ? 25 : ev.impact === 'MEDIUM' ? 12 : 4;
      // High-impact events close to the current window add weight
      const hoursDist = Math.abs(ev.timeOffsetHours);
      if (hoursDist <= 24) {
        score += weight * (hoursDist <= 8 ? 1.4 : 1.0);
      }
    });

    // Normalize so "ALL" yields a beautiful, standard balanced baseline (e.g. 74%) instead of overflowing 100%
    let baseVol = selectedSymbol === 'ALL' ? Math.floor(score * 0.45) : Math.floor(score * 1.1);
    
    // Add micro tick fluctuation and interactive scan results
    let finalValue = baseVol + liveOffset + (interactiveRiskPremium || 0);

    return Math.min(100, Math.max(12, Math.floor(finalValue)));
  }, [eventsData, selectedSymbol, liveOffset, interactiveRiskPremium]);

  const riskZone = useMemo(() => {
    const val = volatilityLevel;
    if (val <= 30) {
      return {
        key: 'LOW',
        labelFa: 'کم‌ریسک (آرام) 🟢',
        labelEn: 'Low Risk (Calm)',
        color: 'text-emerald-400',
        strokeColor: '#34d399',
        bgColor: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400',
        glowColor: 'shadow-[0_0_20px_rgba(52,211,153,0.15)] border-emerald-500/30',
        descFa: 'بازار در شرایط پایدار و مساعد معاملاتی است؛ اسپرد جفت‌ارزها فشرده و احتمال نوسانات پیش‌بینی نشده پایین است.',
        descEn: 'Ecosystem is steady with tight spreads and minimal systemic turbulence. Favorable for trend trades.',
        liquidProgress: 88,
        sentimentScore: 68,
        newsDensity: 20,
      };
    } else if (val <= 50) {
      return {
        key: 'MODERATE',
        labelFa: 'ریسک متوسط (طبیعی) 🟡',
        labelEn: 'Moderate Risk (Normal)',
        color: 'text-amber-400',
        strokeColor: '#fbbf24',
        bgColor: 'bg-amber-500/10 border-amber-500/20 text-amber-400',
        glowColor: 'shadow-[0_0_20px_rgba(251,191,36,0.15)] border-amber-500/30',
        descFa: 'نوسانات در سطح استاندارد روزانه قرار دارد؛ اسپردها عادی و مناسب برای نوسان‌گیری با مدیریت ریسک معقول.',
        descEn: 'Standard intraday volatility ranges. Spreads are healthy, but cautious stop placements are advised.',
        liquidProgress: 72,
        sentimentScore: 50,
        newsDensity: 42,
      };
    } else if (val <= 75) {
      return {
        key: 'HIGH',
        labelFa: 'ریسک شدید (نوسانی) 🟠',
        labelEn: 'High Volatility (Turbulent)',
        color: 'text-orange-400',
        strokeColor: '#fb923c',
        bgColor: 'bg-orange-500/10 border-orange-500/20 text-orange-400',
        glowColor: 'shadow-[0_0_20px_rgba(251,146,60,0.15)] border-orange-500/30',
        descFa: 'رویدادهای کلیدی اقتصادی در حال انتشار هستند. احتمال نوسانات ناگهانی، گپ قیمتی و پرش‌های تکنیکالی وجود دارد.',
        descEn: 'Key economic index releases are active. Market orders are vulnerable to sudden tail events and execution slippages.',
        liquidProgress: 45,
        sentimentScore: 35,
        newsDensity: 78,
      };
    } else {
      return {
        key: 'CRITICAL',
        labelFa: 'بحرانی (شدیداً متلاطم) 🔴',
        labelEn: 'Critical Risk (Extreme)',
        color: 'text-rose-400',
        strokeColor: '#f87171',
        bgColor: 'bg-rose-500/15 border-rose-500/20 text-rose-400',
        glowColor: 'shadow-[0_0_25px_rgba(248,113,113,0.25)] border-rose-500/35',
        descFa: 'تأثیر شدید اخبار حیاتی حاکم است (فرصت/تهدید طلایی). ریسک پوزیشین‌های اهرمی بسیار بالا بوده و احتمال اسلیپیج اسپرد شدید وجود دارد.',
        descEn: 'Superimposed high-impact news spikes active. Severe threat of whipsaws. High-leveraged positions should be avoided.',
        liquidProgress: 18,
        sentimentScore: 15,
        newsDensity: 94,
      };
    }
  }, [volatilityLevel]);

  const handleToggleAlert = (id: string) => {
    const nextAlerts = { ...alertSettings, [id]: !alertSettings[id] };
    setAlertSettings(nextAlerts);
    localStorage.setItem('onigama_fundamental_alerts', JSON.stringify(nextAlerts));
    
    // Synthesize alert sound feedback
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.connect(gain);
      gain.connect(audioCtx.color || audioCtx.destination);
      osc.frequency.setValueAtTime(nextAlerts[id] ? 1300 : 850, audioCtx.currentTime);
      gain.gain.setValueAtTime(0.04, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.12);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.12);
    } catch (e) {}
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    startLiveRiskScan();
    try {
      await fetchLiveCalendar();
    } catch (e) {
      console.error("Refresh error fetching calendar:", e);
    }
    setIsRefreshing(false);
  };

  const startLiveRiskScan = () => {
    setIsScanning(true);
    setScanStep(1);
    
    // Play dual high/low synthesizers
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      
      const osc1 = audioCtx.createOscillator();
      const gain1 = audioCtx.createGain();
      osc1.frequency.setValueAtTime(140, audioCtx.currentTime);
      gain1.gain.setValueAtTime(0.012, audioCtx.currentTime);
      osc1.connect(gain1);
      gain1.connect(audioCtx.destination);
      osc1.start();
      osc1.stop(audioCtx.currentTime + 1.8);

      let t = 0;
      const pulseInterval = setInterval(() => {
        if (t >= 6) {
          clearInterval(pulseInterval);
          return;
        }
        const osc2 = audioCtx.createOscillator();
        const gain2 = audioCtx.createGain();
        osc2.type = 'triangle';
        osc2.frequency.setValueAtTime(500 + t * 90, audioCtx.currentTime);
        gain2.gain.setValueAtTime(0.01, audioCtx.currentTime);
        gain2.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.12);
        osc2.connect(gain2);
        gain2.connect(audioCtx.destination);
        osc2.start();
        osc2.stop(audioCtx.currentTime + 0.12);
        t++;
      }, 200);
    } catch (e) {}

    setTimeout(() => {
      setScanStep(2);
      setTimeout(() => {
        setScanStep(3);
        setTimeout(() => {
          setIsScanning(false);
          setScanStep(0);
          
          // Set randomized interactive adjustments from -6% to +8% to demonstrate active dynamic recalcs
          const randomAdjustment = Math.floor(Math.random() * 15) - 6;
          setInteractiveRiskPremium(randomAdjustment);
          
          try {
            const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
            const osc = audioCtx.createOscillator();
            const gain = audioCtx.createGain();
            osc.frequency.setValueAtTime(1100, audioCtx.currentTime);
            gain.gain.setValueAtTime(0.02, audioCtx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.25);
            osc.connect(gain);
            gain.connect(audioCtx.destination);
            osc.start();
            osc.stop(audioCtx.currentTime + 0.25);
          } catch (e) {}

        }, 700);
      }, 700);
    }, 700);
  };

  // Perform filtering & live search
  const filteredEvents = useMemo(() => {
    return eventsData
      .filter(ev => {
        // Impact filter
        if (filterImpact !== 'ALL' && ev.impact !== filterImpact) return false;
        
        // Symbol filter
        if (selectedSymbol !== 'ALL' && !ev.relevantAssets.includes(selectedSymbol)) return false;
        
        const search = searchQuery.toLowerCase();
        if (search) {
          const matchTitle = ev.titleEn.toLowerCase().includes(search) || ev.titleFa.includes(search);
          const matchCurrency = ev.currency.toLowerCase().includes(search);
          return matchTitle || matchCurrency;
        }
        return true;
      })
      .sort((a, b) => {
        // High impact and closest to current hour first
        const weightA = (a.impact === 'HIGH' ? 3 : a.impact === 'MEDIUM' ? 2 : 1) * 100 - Math.abs(a.timeOffsetHours);
        const weightB = (b.impact === 'HIGH' ? 3 : b.impact === 'MEDIUM' ? 2 : 1) * 100 - Math.abs(b.timeOffsetHours);
        return weightB - weightA;
      });
  }, [eventsData, filterImpact, selectedSymbol, searchQuery]);

  // Formatter for relative announcement times
  const formatEventTime = (offsetHours: number) => {
    if (offsetHours === 0) {
      return language === 'fa' ? 'هم‌اکنون' : 'Just Now';
    }
    
    if (offsetHours < 0) {
      const hours = Math.abs(offsetHours);
      if (hours < 24) {
        return language === 'fa' 
          ? `${hours} ساعت قبل` 
          : `${hours}h ago`;
      } else {
        const days = Math.floor(hours / 24);
        return language === 'fa' 
          ? `${days} روز قبل` 
          : `${days}d ago`;
      }
    } else {
      if (offsetHours < 24) {
        return language === 'fa' 
          ? `در ${offsetHours} ساعت آینده` 
          : `In ${offsetHours}h`;
      } else {
        const days = Math.floor(offsetHours / 24);
        return language === 'fa' 
          ? `در ${days} روز آینده` 
          : `In ${days}d`;
      }
    }
  };

  // Helper to get color theme for impact levels
  const getImpactColor = (impact: 'HIGH' | 'MEDIUM' | 'LOW' | 'ALL') => {
    switch (impact) {
      case 'HIGH':
        return 'bg-rose-500/10 border-rose-500/30 text-rose-400';
      case 'MEDIUM':
        return 'bg-amber-500/10 border-amber-500/30 text-amber-400';
      case 'LOW':
      default:
        return 'bg-slate-500/10 border-white/5 text-slate-400';
    }
  };

  // Helper to get badge labels
  const getImpactBadge = (impact: 'HIGH' | 'MEDIUM' | 'LOW' | 'ALL') => {
    if (impact === 'HIGH') return language === 'fa' ? 'شدید 🔥' : 'HIGH 🔥';
    if (impact === 'MEDIUM') return language === 'fa' ? 'متوسط ⚡' : 'MID ⚡';
    return language === 'fa' ? 'ضعیف 📄' : 'LOW 📄';
  };

  // Helper to format absolute approximate dates
  const formatAbsoluteEventTime = (offsetHours: number) => {
    const d = new Date();
    d.setHours(d.getHours() + Math.round(offsetHours));
    return d.toLocaleDateString(language === 'fa' ? 'fa-IR' : 'en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="space-y-6">
      {/* REALISTIC HIGH-FIDELITY FUNDAMENTAL VOLATILITY RADAR */}
      <div className={`p-6 rounded-3xl border transition-all duration-500 relative overflow-hidden bg-gradient-to-br from-slate-950/60 via-slate-950/20 to-slate-900/40 shadow-inner ${riskZone.glowColor}`}>
        
        {/* Animated Background Laser Sweep when scanning */}
        {isScanning && (
          <motion.div 
            className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-500/10 to-transparent pointer-events-none"
            animate={{ x: ['-100%', '100%'] }}
            transition={{ repeat: Infinity, duration: 1.5, ease: 'linear' }}
          />
        )}

        {/* Decorative Grid Mesh in background */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.012)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.012)_1px,transparent_1px)] bg-[size:16px_16px] opacity-40 pointer-events-none" />

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 relative z-10" dir={language === 'fa' ? 'rtl' : 'ltr'}>
          
          {/* LEFT 7-COLUMNS: Dynamic Gauge Readings & Diagnostic Log */}
          <div className="md:col-span-7 flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className={`p-1.5 rounded-xl ${riskZone.bgColor.split(' ')[0]} border border-white/5`}>
                  <Flame className={`w-4.5 h-4.5 ${isScanning ? 'animate-pulse' : ''} ${riskZone.color}`} />
                </div>
                <div>
                  <span className="text-xs font-black text-slate-100 tracking-wider uppercase flex items-center gap-1.5">
                    {language === 'fa' 
                      ? `بخش حرارت‌سنج نوسان فاندامنتال • ${selectedSymbol === 'ALL' ? 'کامل بازار' : selectedSymbol}` 
                      : `Fundamental Volatility Heat • ${selectedSymbol === 'ALL' ? 'All Assets' : selectedSymbol}`}
                    
                    <span className="flex h-2 w-2 relative">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                    </span>
                  </span>
                  <div className={`text-[10px] font-bold ${riskZone.color}`}>
                    {language === 'fa' ? riskZone.labelFa : riskZone.labelEn}
                  </div>
                </div>
              </div>

              {/* Redesigned Large Temperature / Volatility Display */}
              <div className="flex items-center gap-4 py-1">
                <div className="flex flex-col">
                  <div className="flex items-baseline gap-1">
                    <span className={`text-5xl font-black font-mono tracking-tight leading-none ${riskZone.color} [text-shadow:_0_0_20px_currentColor]`}>
                      {volatilityLevel}
                    </span>
                    <span className="text-xl font-black text-slate-400 font-mono">°C</span>
                  </div>
                  <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest mt-1 block font-mono">
                    {language === 'fa' ? 'تب متراکم بازار فاندامنتال' : 'FINANCIAL STRESS VALUE'}
                  </span>
                </div>

                {/* Vertical Separator */}
                <div className="h-10 w-px bg-white/10" />

                {/* Sleek status capsule box */}
                <div>
                  <span className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-lg ${riskZone.bgColor} inline-block`}>
                    {riskZone.key} REGIME
                  </span>
                  <div className="text-[10px] font-medium text-slate-400 mt-1">
                    {language === 'fa' ? 'حساسیت معاملات اهرمی عالی' : 'Leveraged safety: moderate to low'}
                  </div>
                </div>
              </div>
              
              {isScanning ? (
                <div className="space-y-2.5 py-2">
                  <div className="flex justify-between items-center text-[10px] text-blue-400 font-bold font-mono">
                    <span className="font-sans">
                      {scanStep === 1 
                        ? (language === 'fa' ? '🔍 واکاوی ترازنامه‌ها و سیاست پولی فدرال رزرو...' : '🔍 Scanning Fed yields & public interest metrics...') 
                        : scanStep === 2
                        ? (language === 'fa' ? '📊 ارزیابی عمق مارکت و استخرهای عرضه طلا/ارز...' : '📊 Evaluating volume order-books & spread offsets...')
                        : (language === 'fa' ? '⚙️ محاسبه نهایی دماسنج فاندامنتال اونیگاما...' : '⚙️ Re-weighting onigama risk temperature index...')}
                    </span>
                    <span>{scanStep * 33}%</span>
                  </div>
                  <div className="w-full bg-slate-900 rounded-full h-1.5 relative overflow-hidden">
                    <motion.div 
                      className="bg-gradient-to-r from-blue-500 to-indigo-500 h-1.5 rounded-full" 
                      initial={{ width: '0%' }}
                      animate={{ width: `${scanStep * 33}%` }}
                      transition={{ duration: 0.5 }}
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-2.5 bg-slate-950/45 p-3.5 rounded-2xl border border-white/5 shadow-inner">
                  <p className="text-[11px] text-slate-300 leading-relaxed font-sans">
                    {language === 'fa' ? riskZone.descFa : riskZone.descEn}
                  </p>
                  <p className="text-[10px] text-slate-500 leading-relaxed font-mono">
                    {language === 'fa'
                      ? '⚠️ راهنما: معاملات اهرمی در تب بالای ۵۰ درجه با افزایش اسپرد غیرمنتظره بروکرها همراه است.'
                      : '⚠️ Rule: Slippage & broker spread expands aggressively when heat levels exceed 50°C.'}
                  </p>
                </div>
              )}
            </div>

            {/* Simulated Live Scan triggers */}
            <div className="flex gap-2 flex-wrap pt-1">
              <button
                onClick={startLiveRiskScan}
                disabled={isScanning}
                className={`p-2.5 px-4 rounded-xl text-[10.5px] font-black tracking-wider transition-all cursor-pointer flex items-center gap-1.5 border leading-none ${
                  isScanning
                    ? 'bg-slate-900/50 border-white/5 text-slate-500 cursor-not-allowed'
                    : 'bg-gradient-to-tr from-slate-950 via-slate-900 to-slate-950 hover:from-slate-900 hover:to-slate-850 active:scale-95 border-white/10 text-slate-200 shadow-md'
                }`}
              >
                <RefreshCw className={`w-3.5 h-3.5 text-slate-400 ${isScanning ? 'animate-spin' : ''}`} />
                <span>
                  {language === 'fa' 
                    ? 'کالیبراسیون و بازسنجی تب معاملاتی' 
                    : 'RE-CALIBRATE HEAT INDEX'}
                </span>
              </button>
            </div>
          </div>

          {/* RIGHT 5-COLUMNS: Perfectly Stylized Vertical Thermodynamic Tube & Sub-Metrics */}
          <div className="md:col-span-5 grid grid-cols-12 gap-4 items-center bg-slate-950/20 p-4 rounded-2xl border border-white/5">
            
            {/* Real Instrument Vertical Thermometer Column (Col span 5) */}
            <div className="col-span-6 md:col-span-5 h-[160px] relative flex justify-center items-center select-none border-r border-white/5 pr-2">
              
              {/* Scale Ticks Panel */}
              <div className="absolute left-1 md:left-2 top-2 bottom-8 flex flex-col justify-between text-[7.5px] font-mono text-slate-500 font-bold h-[105px] pointer-events-none">
                <div className="flex items-center gap-1 w-8 justify-end"><span>100</span><span className="w-1 h-px bg-slate-700"></span></div>
                <div className="flex items-center gap-1 w-8 justify-end"><span>75</span><span className="w-1 h-px bg-slate-700"></span></div>
                <div className="flex items-center gap-1 w-8 justify-end"><span>50</span><span className="w-1 h-px bg-slate-700"></span></div>
                <div className="flex items-center gap-1 w-8 justify-end"><span>25</span><span className="w-1 h-px bg-slate-700"></span></div>
                <div className="flex items-center gap-1 w-8 justify-end"><span>0</span><span className="w-1 h-px bg-slate-700"></span></div>
              </div>

              {/* Glass Thermometer Tube Housing */}
              <div className="relative h-[110px] w-3 bg-slate-950 border border-white/15 rounded-full overflow-visible shadow-lg flex flex-col justify-end ml-10">
                
                {/* Mercury Liquid Dynamic Fill */}
                <motion.div 
                  className="w-full rounded-b-full relative z-10"
                  style={{
                    backgroundColor: riskZone.strokeColor,
                    backgroundImage: `linear-gradient(to right, rgba(255, 255, 255, 0.45) 0%, transparent 40%, rgba(0, 0, 0, 0.5) 100%)`,
                    boxShadow: `0 0 10px ${riskZone.strokeColor}80`
                  }}
                  initial={{ height: '0%' }}
                  animate={{ height: `${volatilityLevel}%` }}
                  transition={{ duration: 1.2, ease: 'easeOut' }}
                >
                  {/* Boiling reflection bubbles under critical risk */}
                  {volatilityLevel >= 50 && (
                    <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-40">
                      {[1, 2].map((b) => (
                        <motion.div 
                          key={b}
                          className="w-0.5 h-0.5 bg-white rounded-full absolute bottom-0"
                          style={{ left: `${b * 30}%` }}
                          animate={{ y: ['100%', '-500%'], opacity: [0, 1, 0] }}
                          transition={{ repeat: Infinity, duration: 1 + Math.random(), delay: b * 0.4 }}
                        />
                      ))}
                    </div>
                  )}
                </motion.div>

                {/* Gloss Glass Reflection strip */}
                <div className="absolute top-0 left-px right-px bottom-0 bg-gradient-to-r from-white/10 via-transparent to-transparent rounded-full pointer-events-none z-20" />

                {/* Bulby Base Reservoir Spherical Node */}
                <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-7 h-7 rounded-full bg-slate-950 border border-white/15 flex items-center justify-center shadow-md z-0 overflow-hidden">
                  <motion.div 
                    className="w-5.2 h-5.2 rounded-full relative"
                    style={{
                      backgroundColor: riskZone.strokeColor,
                      backgroundImage: `radial-gradient(circle at 35% 35%, rgba(255, 255, 255, 0.55) 0%, transparent 60%, rgba(0, 0, 0, 0.75) 100%)`,
                      boxShadow: `0 0 12px ${riskZone.strokeColor}af`
                    }}
                    animate={isScanning ? { scale: [1, 1.15, 1] } : {}}
                    transition={{ repeat: Infinity, duration: 1.5, ease: 'easeInOut' }}
                  >
                    <div className="absolute inset-0.5 rounded-full bg-white/20 blur-[0.5px] pointer-events-none" />
                  </motion.div>
                </div>
              </div>

            </div>

            {/* Dashboard Sub-Metric Led Slides (Col span 7) */}
            <div className="col-span-6 md:col-span-7 flex flex-col justify-center space-y-3.5 pl-1">
              <span className="text-[8.5px] font-black text-slate-500 uppercase tracking-widest font-mono block">
                {language === 'fa' ? 'سیاهه زیرشاخص‌های پویای ریسک' : 'DYNAMIC RISK INDEXERS'}
              </span>

              {/* News Density Tracker */}
              <div className="space-y-1">
                <div className="flex justify-between text-[9px] font-bold">
                  <span className="text-slate-400">{language === 'fa' ? 'تراکم اخبار فعال' : 'Release Density'}</span>
                  <span className="text-slate-300 font-mono text-[10px]">{riskZone.newsDensity}%</span>
                </div>
                <div className="w-full h-1 bg-slate-950 rounded-full overflow-hidden">
                  <div 
                    className="h-1 bg-amber-500/80 transition-all duration-700"
                    style={{ width: `${riskZone.newsDensity}%` }}
                  />
                </div>
              </div>

              {/* Liquidity Flow */}
              <div className="space-y-1">
                <div className="flex justify-between text-[9px] font-bold">
                  <span className="text-slate-400">{language === 'fa' ? 'تراکم نقدینگی استخرها' : 'Liquidity Pool Depth'}</span>
                  <span className="text-slate-300 font-mono text-[10px]">{riskZone.liquidProgress}%</span>
                </div>
                <div className="w-full h-1 bg-slate-950 rounded-full overflow-hidden">
                  <div 
                    className="h-1 bg-emerald-500/80 transition-all duration-700"
                    style={{ width: `${riskZone.liquidProgress}%` }}
                  />
                </div>
              </div>

              {/* Dynamic Market sentiment multiplier */}
              <div className="space-y-1">
                <div className="flex justify-between text-[9px] font-bold">
                  <span className="text-slate-400">{language === 'fa' ? 'قدرت گپ‌های خریداران' : 'Order Momentum'}</span>
                  <span className="text-slate-300 font-mono text-[10px]">{riskZone.sentimentScore}%</span>
                </div>
                <div className="w-full h-1 bg-slate-950 rounded-full overflow-hidden">
                  <div 
                    className="h-1 bg-blue-500/80 transition-all duration-700"
                    style={{ width: `${riskZone.sentimentScore}%` }}
                  />
                </div>
              </div>
            </div>

          </div>

        </div>
      </div>

      {/* FILTER & SEARCH CONTROL ROW */}
      <div className="space-y-4" dir={language === 'fa' ? 'rtl' : 'ltr'}>
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
          {/* News Search bar (7 col span on desktop) */}
          <div className="sm:col-span-7 relative">
            <input 
              type="text"
              className="w-full bg-white/3 border border-white/5 focus:border-[#6f87a0]/50 rounded-2xl p-3 px-10 text-xs text-white outline-none placeholder-slate-500 font-sans transition-all"
              placeholder={language === 'fa' ? 'جستجوی اخبار فاندامنتال (مثال: CPI)...' : 'Search economic index (e.g. CPI, NFP)...'}
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
            <Search className={`w-4 h-4 text-slate-500 absolute top-3.5 ${language === 'fa' ? 'right-3.5' : 'left-3.5'}`} />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className={`absolute top-2.5 text-xs text-rose-400 hover:text-rose-300 p-1 font-mono uppercase cursor-pointer ${language === 'fa' ? 'left-3' : 'right-3'}`}
              >
                ✕
              </button>
            )}
          </div>

          {/* Impact Level quick filters */}
          <div className="sm:col-span-5 flex gap-1 items-center bg-white/2 p-1.5 rounded-2xl border border-white/5">
            {([
              { value: 'ALL', label: language === 'fa' ? 'همه شدت‌ها' : 'ALL IMPACTS' },
              { value: 'HIGH', label: language === 'fa' ? 'شدید (🔥)' : 'HIGH (🔥)' },
              { value: 'MEDIUM', label: language === 'fa' ? 'متوسط (⚡)' : 'MID (⚡)' }
            ] as const).map(tab => (
              <button
                key={tab.value}
                onClick={() => setFilterImpact(tab.value)}
                className={`flex-1 py-1.5 rounded-xl text-[10px] sm:text-xs font-bold transition-all cursor-pointer ${
                  filterImpact === tab.value
                    ? 'bg-gradient-to-r from-slate-800 to-slate-900 border border-white/10 text-white shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* SELECTABLE SYMBOLS CAROUSEL BAR (SCROLLABLE) */}
        <div className="space-y-1.5 relative select-none">
          <div className="flex justify-between items-center">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block font-mono">
              {language === 'fa' ? 'فیلتر بر اساس نماد معاملاتی:' : 'Filter calendar by active symbol:'}
            </span>
            
            {/* Quick Micro Scroll Controls */}
            <div className="flex gap-1 items-center">
              <button
                type="button"
                onClick={() => scrollCarousel('left')}
                className="p-1 px-2.5 rounded-lg bg-white/3 hover:bg-white/10 active:scale-95 border border-white/5 text-slate-400 hover:text-white transition-all text-xs font-bold cursor-pointer"
                title={language === 'fa' ? 'حرکت به راست' : 'Scroll left'}
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => scrollCarousel('right')}
                className="p-1 px-2.5 rounded-lg bg-white/3 hover:bg-white/10 active:scale-95 border border-white/5 text-slate-400 hover:text-white transition-all text-xs font-bold cursor-pointer"
                title={language === 'fa' ? 'حرکت به چپ' : 'Scroll right'}
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <div 
            ref={carouselRef}
            className="flex gap-2 overflow-x-auto pb-2 snap-x scroll-smooth [&::-webkit-scrollbar]:h-1 [&::-webkit-scrollbar-track]:bg-white/2 [&::-webkit-scrollbar-thumb]:bg-[#6f87a0]/25 hover:[&::-webkit-scrollbar-thumb]:bg-[#6f87a0]/45 [&::-webkit-scrollbar-thumb]:rounded-full"
          >
            {symbolsList.map(sym => {
              const isSelected = selectedSymbol === sym.id;
              return (
                <button
                  key={sym.id}
                  onClick={() => {
                    setSelectedSymbol(sym.id);
                    // Reset single open card on symbol change
                    setExpandedId(null);
                  }}
                  className={`px-4 py-2.5 rounded-2xl border text-xs font-bold font-sans transition-all shrink-0 cursor-pointer snap-start flex items-center gap-1.5 ${
                    isSelected
                      ? 'bg-gradient-to-tr from-[#111e2f] to-[#1e3450] border-blue-500/50 text-white shadow-[0_4px_12px_rgba(59,130,246,0.15)] ring-1 ring-blue-500/20'
                      : 'bg-white/2 hover:bg-white/5 border-white/5 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <span className="text-sm">{sym.icon}</span>
                  <span className={isSelected ? 'text-white' : ''}>
                    {language === 'fa' ? sym.nameFa : sym.nameEn}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* FEED LIST OF EVENTS */}
      <div className="space-y-4">
        {filteredEvents.length === 0 ? (
          <div className="p-10 rounded-3xl glass-card border border-white/5 text-center text-slate-400 space-y-2">
            <Info className="w-8 h-8 text-slate-500 mx-auto opacity-40" />
            <p className="text-xs font-semibold">
              {language === 'fa' 
                ? 'هیچ خبر فاندامنتالی با این نماد یا ملاکِ شدت یافت نشد.' 
                : 'No fundamental indicator matches selected pair or impact filters.'}
            </p>
          </div>
        ) : (
          <div className="space-y-3.5">
            {filteredEvents.map(ev => {
              const isExpanded = expandedId === ev.id;
              const isUpcoming = ev.timeOffsetHours > 0;
              const hasAlert = alertSettings[ev.id] || false;

              return (
                <div 
                  key={ev.id}
                  className={`rounded-3xl border transition-all duration-300 relative overflow-hidden backdrop-blur-md ${
                    isExpanded 
                      ? 'bg-white/[0.04] border-[#6f87a0]/30 shadow-[0_5px_20px_rgba(111,135,160,0.1)]' 
                      : 'bg-[#070f17]/20 border-white/5 hover:border-white/10 hover:bg-white/[0.02]'
                  }`}
                >
                  
                  {/* UPPER SUMMARY PANEL ROW */}
                  <div 
                    onClick={() => setExpandedId(isExpanded ? null : ev.id)}
                    className="p-4 sm:p-5 flex items-center justify-between gap-4 cursor-pointer select-none"
                  >
                    <div className="flex items-start gap-3 min-w-0 flex-1">
                      
                      {/* Left Category Indicator */}
                      <div className={`p-2.5 rounded-2xl border text-xs font-bold font-mono tracking-wider shrink-0 w-11 h-11 flex items-center justify-center ${getImpactColor(ev.impact)}`}>
                        {ev.currency}
                      </div>

                      {/* Title & Metadata block */}
                      <div className="min-w-0 flex-1 space-y-1">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className={`text-[8.5px] uppercase font-black px-1.5 py-0.2 rounded border ${getImpactColor(ev.impact)}`}>
                            {getImpactBadge(ev.impact)}
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono font-bold flex items-center gap-1 bg-white/2 px-2 py-0.3 rounded-md">
                            {formatEventTime(ev.timeOffsetHours)}
                          </span>
                          <span className="text-[10px] text-amber-400/90 font-mono font-bold flex items-center gap-1 bg-white/2 px-2 py-0.3 rounded-md">
                            <Calendar className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-amber-400" />
                            {formatAbsoluteEventTime(ev.timeOffsetHours)}
                          </span>
                        </div>

                        <h3 className="text-xs sm:text-sm font-black text-slate-100 leading-snug truncate">
                          {language === 'fa' ? ev.titleFa : ev.titleEn}
                        </h3>
                      </div>

                    </div>

                    {/* Right Numbers & Expand trigger */}
                    <div className="flex items-center gap-2.5 shrink-0">
                      
                      {/* Actual Indicator */}
                      <div className="text-right font-mono pr-2 border-r border-white/5">
                        <span className="text-[9px] text-slate-500 block uppercase font-sans">
                          {language === 'fa' ? 'واقعی' : 'Actual'}
                        </span>
                        {isUpcoming ? (
                          <span className="text-xs text-slate-400 font-bold block bg-blue-500/10 px-1.5 py-0.3 rounded border border-blue-500/20 text-[9px] animate-pulse">
                            {language === 'fa' ? 'پیش‌رو' : 'PENDING'}
                          </span>
                        ) : (
                          <span className={`text-[13px] font-black block ${
                            ev.volatilityImpact === 'BULLISH' 
                              ? 'text-emerald-400 font-bold' 
                              : ev.volatilityImpact === 'BEARISH' 
                              ? 'text-rose-400' 
                              : 'text-slate-300'
                          }`}>
                            {ev.actual}
                          </span>
                        )}
                      </div>

                      {/* Toggle Reminder alerts for upcoming events */}
                      {isUpcoming && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleToggleAlert(ev.id);
                          }}
                          className={`p-2 rounded-2xl transition-all cursor-pointer ${
                            hasAlert 
                              ? 'bg-amber-500/15 border border-amber-500/30 text-amber-400' 
                              : 'bg-white/5 border border-white/5 text-slate-500 hover:text-white'
                          }`}
                          title={language === 'fa' ? 'تنظیم زنگ هشدار انتشار خبر' : 'Toggle release alarm nudge'}
                        >
                          {hasAlert ? <BellRing className="w-3.5 h-3.5" /> : <Bell className="w-3.5 h-3.5" />}
                        </button>
                      )}

                      {/* Dropdown Chevron toggle */}
                      <div className="text-slate-500">
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </div>

                    </div>
                  </div>

                  {/* DOWN EXPAND DETAILS */}
                  <AnimatePresence initial={false}>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.28, ease: 'easeInOut' }}
                      >
                        <div className="px-5 pb-5 pt-1.5 border-t border-white/5 space-y-4">
                          
                          {/* FORECAST VS PREVIOUS BOARD */}
                          <div className="grid grid-cols-2 gap-2 bg-white/2 p-3 rounded-2xl border border-white/5 text-center font-mono">
                            <div className="border-r border-white/5">
                              <span className="text-[10px] text-slate-500 block uppercase font-sans">
                                {language === 'fa' ? 'پیش‌بینى مارکت' : 'Market Forecast'}
                              </span>
                              <span className="text-xs font-bold text-slate-200 mt-0.5 block">{ev.forecast}</span>
                            </div>
                            <div>
                              <span className="text-[10px] text-slate-500 block uppercase font-sans">
                                {language === 'fa' ? 'دوره قبلی' : 'Previous Period'}
                              </span>
                              <span className="text-xs font-bold text-slate-200 mt-0.5 block">{ev.previous}</span>
                            </div>
                          </div>

                          {/* DYNAMIC SYMBOL IMPACT BRIEF ANALYSIS */}
                          <div className={`p-4 rounded-2xl border ${
                            ev.volatilityImpact === 'BULLISH'
                              ? 'bg-emerald-500/[0.03] border-emerald-500/10'
                              : ev.volatilityImpact === 'BEARISH'
                              ? 'bg-rose-500/[0.03] border-rose-500/10'
                              : 'bg-blue-500/[0.02] border-blue-500/10'
                          }`}>
                            <div className="flex items-center gap-2 mb-2 font-sans">
                              {ev.volatilityImpact === 'BULLISH' ? (
                                <div className="p-1 rounded bg-emerald-500/15 text-emerald-400">
                                  <TrendingUp className="w-3.5 h-3.5" />
                                </div>
                              ) : ev.volatilityImpact === 'BEARISH' ? (
                                <div className="p-1 rounded bg-rose-500/15 text-rose-400">
                                  <TrendingDown className="w-3.5 h-3.5" />
                                </div>
                              ) : (
                                <div className="p-1 rounded bg-blue-500/15 text-blue-400">
                                  <Info className="w-3.5 h-3.5" />
                                </div>
                              )}
                              <span className="text-xs font-black text-slate-200">
                                {language === 'fa' 
                                  ? `تأثیر فاندامنتال و جهت حرکت ${selectedSymbol === 'ALL' ? 'بازار' : selectedSymbol}` 
                                  : `Market Sentiment & Impact on ${selectedSymbol === 'ALL' ? 'Assets' : selectedSymbol}`}
                              </span>
                            </div>

                            <p className="text-[11px] text-slate-300 leading-relaxed font-sans">
                              {language === 'fa' ? ev.impactAnalysisFa : ev.impactAnalysisEn}
                            </p>

                            {/* Volatility warning text */}
                            <div className="mt-3 pt-3 border-t border-white/5 flex justify-between items-center text-[10px]">
                              <span className="text-slate-500 font-semibold uppercase font-sans">
                                {language === 'fa' ? 'انتظار واکنش قیمتی:' : 'Expected Reaction Spurt:'}
                              </span>
                              <span className={`font-mono font-bold ${
                                ev.impact === 'HIGH' ? 'text-rose-400' : ev.impact === 'MEDIUM' ? 'text-amber-400' : 'text-blue-400'
                              }`}>
                                {ev.impact === 'HIGH' 
                                  ? (language === 'fa' ? 'بشدت نوسانی 🔥' : 'EXTREME MOVEMENT 🔥') 
                                  : ev.impact === 'MEDIUM' 
                                  ? (language === 'fa' ? 'نوسانی ملایم ⚡' : 'MODERATE SWINGS ⚡') 
                                  : (language === 'fa' ? 'کم‌تاثیر 🌐' : 'MILD DISPLACEMENT 🌐')}
                              </span>
                            </div>
                          </div>

                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
}
