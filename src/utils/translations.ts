import { Language } from '../types';

export const isRtlLang = (lang: Language): boolean => lang === 'fa' || lang === 'ku';

export const translations = {
  // Navigation
  nav: {
    home: { fa: 'خانه', en: 'Home', ku: 'سەرەکی' },
    analysis: { fa: 'تحلیل', en: 'Analysis', ku: 'شیکاری' },
    fundamental: { fa: 'فاندامنتال', en: 'Fund', ku: 'فەندەمێنتەڵ' },
    catalog: { fa: 'کاتالوگ', en: 'Specs', ku: 'کەتەلۆگ' },
    psychology: { fa: 'روانشناسی', en: 'Mindset', ku: 'دەروونناسی' },
    journal: { fa: 'ژورنال', en: 'Journal', ku: 'تۆمارگە' },
    settings: { fa: 'تنظیمات', en: 'Settings', ku: 'ڕێکخستنەکان' },
  },

  // Common terms
  common: {
    gold: { fa: 'طلا (XAU/USD)', en: 'Gold (XAU/USD)', ku: 'زێڕ (XAU/USD)' },
    buy: { fa: 'خرید (BUY)', en: 'BUY', ku: 'کڕین (BUY)' },
    sell: { fa: 'فروش (SELL)', en: 'SELL', ku: 'فرۆشتن (SELL)' },
    active: { fa: 'فعال', en: 'ACTIVE', ku: 'چالاک' },
    closed: { fa: 'بسته شده', en: 'CLOSED', ku: 'داخراو' },
    profit: { fa: 'سود', en: 'Profit', ku: 'قازانج' },
    loss: { fa: 'ضرر', en: 'Loss', ku: 'زیان' },
    winRate: { fa: 'نرخ برد', en: 'Win Rate', ku: 'ڕێژەی سەرکەوتن' },
    totalTrades: { fa: 'کل معاملات', en: 'Total Trades', ku: 'کۆی مامەڵەکان' },
    entry: { fa: 'نقطه ورود', en: 'Entry Price', ku: 'نرخی چوونەژوورەوە' },
    tp: { fa: 'حد سود', en: 'Take Profit', ku: 'دیاریکردنی قازانج (TP)' },
    sl: { fa: 'حد ضرر', en: 'Stop Loss', ku: 'ڕاگرتنی زیان (SL)' },
    save: { fa: 'ذخیره', en: 'Save', ku: 'پاشەکەوتکردن' },
    cancel: { fa: 'انصراف', en: 'Cancel', ku: 'پەشیمانبوونەوە' },
    delete: { fa: 'حذف', en: 'Delete', ku: 'سڕینەوە' },
    close: { fa: 'بستن', en: 'Close', ku: 'داخستن' },
    live: { fa: 'زنده', en: 'LIVE', ku: 'ڕاستەوخۆ' },
    search: { fa: 'جستجو', en: 'Search', ku: 'گەڕان' },
    filter: { fa: 'فیلتر', en: 'Filter', ku: 'فلتەر' },
    loading: { fa: 'در حال بارگذاری...', en: 'Loading...', ku: 'بارکردن...' },
    status: { fa: 'وضعیت', en: 'Status', ku: 'بارودۆخ' },
    date: { fa: 'تاریخ', en: 'Date', ku: 'بەروار' },
    all: { fa: 'همه', en: 'All', ku: 'هەموو' },
    time: { fa: 'زمان', en: 'Time', ku: 'کاتژمێر' },
    details: { fa: 'جزئیات', en: 'Details', ku: 'وردەکارییەکان' },
  },

  // Home Page
  home: {
    heroTitle: {
      fa: 'داشبورد پیشرفته تریدینگ طلا',
      en: 'Advanced Gold Trading Hub',
      ku: 'سەکۆی پێشکەوتووی بازرگانی زێڕ',
    },
    heroSubtitle: {
      fa: 'تحلیل‌های هوشمند لحظه‌ای، سیگنال‌های پرایس اکشن و مدیریت ریسک حرفه‌ای',
      en: 'Smart real-time analysis, price action signals & pro risk management',
      ku: 'شیکاریی ژیرانەی ڕاستەوخۆ، سیگناڵەکانی پرایس ئاکشن و بەڕێوەبردنی مەترسی',
    },
    generateSignal: {
      fa: 'صدور سیگنال هوشمند',
      en: 'Generate Smart Signal',
      ku: 'دەرکردنی سیگناڵی ژیرانە',
    },
    generating: {
      fa: 'در حال بررسی بازار و صدور...',
      en: 'Analyzing market & issuing...',
      ku: 'لە پرۆسەی شیکاریی بازاڕ و دەرکردندا...',
    },
    activeSignalsTitle: {
      fa: 'سیگنال‌های فعال و لایو',
      en: 'Active & Live Signals',
      ku: 'سیگناڵە چالاک و ڕاستەوخۆکان',
    },
    noSignals: {
      fa: 'در حال حاضر سیگنال فعالی وجود ندارد',
      en: 'No active signals at the moment',
      ku: 'لە ئێستادا هیچ سیگناڵێکی چالاک بەردەست نییە',
    },
    quickStats: {
      fa: 'آمار عملکرد سیستم',
      en: 'Performance Overview',
      ku: 'ئاماری گشتیی ئەنجامەکان',
    },
    marketSentiment: {
      fa: 'تمایلات بازار طلا',
      en: 'Gold Market Sentiment',
      ku: 'ئاڕاستە و هەستی بازاڕی زێڕ',
    },
    bullish: {
      fa: 'صعودی 🟢',
      en: 'Bullish 🟢',
      ku: 'بەرەوسەر (Bullish) 🟢',
    },
    bearish: {
      fa: 'نزولی 🔴',
      en: 'Bearish 🔴',
      ku: 'بەرەوخوار (Bearish) 🔴',
    },
    neutral: {
      fa: 'خنثی ⚪',
      en: 'Neutral ⚪',
      ku: 'بێ‌لایەن (Neutral) ⚪',
    },
    sessions: {
      london: { fa: 'لندن', en: 'London', ku: 'لەندەن' },
      newyork: { fa: 'نیویورک', en: 'New York', ku: 'نیویۆرک' },
      asia: { fa: 'آسیا', en: 'Asian', ku: 'ئاسیا' },
    },
  },

  // Signal Corner Toast
  toast: {
    newSignal: {
      fa: 'سیگنال جدید Onigama',
      en: 'NEW ONIGAMA SIGNAL',
      ku: 'سیگناڵی نوێی Onigama',
    },
    viewDashboard: {
      fa: 'مشاهده در داشبورد سیگنال',
      en: 'View In Signal Dashboard',
      ku: 'بینین لە داشبۆردی سیگناڵدا',
    },
    dismiss: {
      fa: 'متوجه شدم',
      en: 'Dismiss',
      ku: 'تێگەیشتم',
    },
    type: {
      fa: 'نوع سیگنال',
      en: 'Type',
      ku: 'جۆری سیگناڵ',
    },
  },

  // Settings Page
  settings: {
    title: { fa: 'تنظیمات و سفارشی‌سازی', en: 'Settings & Config', ku: 'ڕێکخستنەکان و شێواز' },
    appLanguage: { fa: 'زبان پیش‌فرض نرم‌افزار', en: 'Application Language', ku: 'زمانی بەرنامە' },
    persian: { fa: 'فارسی (Persian)', en: 'Persian (فارسی)', ku: 'فارسی (Persian)' },
    english: { fa: 'English (EN)', en: 'English (EN)', ku: 'ئینگلیزی (English)' },
    kurdish: { fa: 'کوردی سۆرانی عێراق', en: 'Kurdish Sorani (Iraq)', ku: 'کوردی سۆرانی (عێراق)' },
    visualStyle: { fa: 'سبک بصری کارت‌ها', en: 'Visual Accent Style', ku: 'شێوازی بینراوی کارتەکان' },
    themeDark: { fa: 'تاریک استاندارد (OLED)', en: 'Dark Theme (OLED)', ku: 'تاریکی ستاندارد (Dark)' },
    themeGlass: { fa: 'شیشه‌ای مدرن (Glassmorphism)', en: 'Glass Aesthetic', ku: 'شوشەیی مۆدێرن (Glass)' },
    notifications: { fa: 'اعلان‌ها و هشدارهای سیستم', en: 'Alerts & Notifications', ku: 'ئاگادارکردنەوە و زەنگەکان' },
    pushNotice: { fa: 'دریافت نوتیفیکیشن سیگنال‌ها', en: 'Signal Push Notifications', ku: 'وەرگرتنی ئاگاداریی سیگناڵەکان' },
    soundNotice: { fa: 'پخش صدای هشدار', en: 'Sound Effects', ku: 'لێدانی دەنگی زەنگ' },
    toastNotice: { fa: 'نمایش پاپ‌آپ گوشه صفحه', en: 'Corner Toast Notification', ku: 'پیشاندانی ئاگاداریی گۆشەی پەنجەرە' },
    riskTolerance: { fa: 'تحمل ریسک و مدیریت سرمایه', en: 'Risk Tolerance', ku: 'ئاستی قبووڵکردنی مەترسی' },
    riskLow: { fa: 'کم‌ریسک (محافظه‌کارانه)', en: 'Conservative (Low)', ku: 'کەم‌مەترسی (پارێزگارانە)' },
    riskMedium: { fa: 'متعادل (پیش‌فرض)', en: 'Balanced (Standard)', ku: 'مامناوەند (ستاندارد)' },
    riskHigh: { fa: 'پرریسک (حرفه‌ای)', en: 'Aggressive (High)', ku: 'پڕمەترسی (توند)' },
    accountTier: { fa: 'پلن و حساب کاربری', en: 'Membership Tier', ku: 'پلانی بەکارهێنەر' },
    vipStatus: { fa: 'اشتراک طلایی VIP', en: 'VIP Golden Pass', ku: 'ئابوونەی زێڕینی VIP' },
    deviceSync: { fa: 'شناسه سخت‌افزاری دستگاه', en: 'Hardware Device ID', ku: 'ناسنامەی ئامێر (Device ID)' },
    systemDiagnostics: { fa: 'وضعیت ارتباط و پینگ سرور', en: 'System Network Latency', ku: 'خێرایی پەیوەندی و پینگی سێرڤەر' },
  },

  // Splash Screen
  splash: {
    step1: { fa: 'اتصال به شبکه نودهای متاتریدر...', en: 'Connecting to MetaTrader node cluster...', ku: 'پەیوەستبوون بە تۆڕی نۆدە بازرگانییەکان...' },
    step2: { fa: 'استخراج داده‌های اوردر بلاک و FVG طلا...', en: 'Extracting live Gold OB & FVG matrix...', ku: 'دەرهێنانی داتاکانی ئۆردەربلۆک و FVG زێڕ...' },
    step3: { fa: 'بررسی شاخص‌های نوسان و لیکوییدیتی...', en: 'Parsing volatility delta & liquidity pool...', ku: 'پشکنینی نەختینە و داتای هەڵچوونی بازاڕ...' },
    step4: { fa: 'آماده‌سازی پنل باینری و الگوریتم معاملاتی...', en: 'Finalizing high-frequency algorithmic engine...', ku: 'ئامادەکردنی سەکۆ و مەکینەی ئەلگۆریتمەکان...' },
    tagline: {
      fa: 'سیستم معاملاتی هوشمند طلا و بازارهای مالی بین‌المللی',
      en: 'Institutional Smart Algorithm for Global Gold Markets',
      ku: 'سیستەمی ژیرانەی بازرگانیی زێڕ و بازاڕە دارایییەکان',
    },
  },

  // Analysis Page
  analysis: {
    title: { fa: 'شیکاری تەکنیکی پێشکەوتوو', en: 'Advanced Technical Analysis', ku: 'شیکاری تەکنیکیی پێشکەوتوو' },
    marketStructure: { fa: 'ساختار مارکت (BOS / CHoCH)', en: 'Market Structure (BOS / CHoCH)', ku: 'پێکهاتەی بازاڕ (BOS / CHoCH)' },
    indicators: { fa: 'اندیکاتورها و فیبوناچی', en: 'Indicators & Fibonacci', ku: 'ئیندیکەیتەرەکان و فیبۆناچی' },
    orderFlow: { fa: 'جریان سفارشات (Order Flow)', en: 'Order Flow Matrix', ku: 'ئاڕاستەی داواکارییەکان (Order Flow)' },
    timeframes: { fa: 'تایم‌فریم', en: 'Timeframe', ku: 'تایم‌فرەیم' },
  },

  // Fundamental Page
  fundamental: {
    title: { fa: 'اخبار و تقویم اقتصادی', en: 'Economic Calendar & News', ku: 'هەواڵ و ڕۆژژمێری ئابووری' },
    highImpact: { fa: 'رویدادهای با اهمیت بالا 🔥', en: 'High Impact Events 🔥', ku: 'ڕووداوە پڕکاریگەرەکان 🔥' },
    forecast: { fa: 'پیش‌بینی مارکت', en: 'Market Forecast', ku: 'پێشبینیی بازاڕ' },
    previous: { fa: 'دوره قبلی', en: 'Previous Period', ku: 'ماوەی پێشوو' },
    actual: { fa: 'واقعی', en: 'Actual', ku: 'ژمارەی ڕاستەقینە' },
    pending: { fa: 'پیش‌رو', en: 'PENDING', ku: 'چاوەڕوانکراو' },
  },

  // Psychology Page
  psychology: {
    title: { fa: 'روانشناسی معامله‌گری و دیسیپلین', en: 'Trading Psychology & Discipline', ku: 'دەروونناسی بازرگان و ڕێکوپێکی' },
    dailyAffirmation: { fa: 'جمله تاکیدی و تمرکز روز', en: 'Daily Focus & Affirmation', ku: 'تەرکیزی ڕۆژ و دروشمی سەرکەوتن' },
    fearGreedIndex: { fa: 'شاخص ترس و طمع', en: 'Fear & Greed Meter', ku: 'پێوەری ترس و تەماح' },
    emotionalState: { fa: 'وضعیت احساسی امروز', en: 'Today Emotional Baseline', ku: 'دۆخی دەروونیی ئەمڕۆ' },
  },

  // Journal Page
  journal: {
    title: { fa: 'ژورنال و دفترچه معاملات شخصی', en: 'Trading Journal & Execution Log', ku: 'تۆماری مامەڵەکان و ژوورناڵی کەسی' },
    addTrade: { fa: 'ثبت معامله جدید', en: 'Record New Trade', ku: 'تۆمارکردنی مامەڵەی نوێ' },
    exportPdf: { fa: 'خروجی گزارش', en: 'Export Report', ku: 'دەرهێنانی ڕاپۆرت' },
    winRateStat: { fa: 'درصد موفقیت سیستم', en: 'Win Rate Efficiency', ku: 'ڕێژەی سەرکەوتنی گشتی' },
  },

  // Catalog Page
  catalog: {
    title: { fa: 'کاتالوگ و اشتراک هوشمند Onigama', en: 'Onigama Catalog & Tiers', ku: 'کەتەلۆگ و پلانەکانی Onigama' },
    features: { fa: 'ویژگی‌های انحصاری', en: 'Exclusive Features', ku: 'تایبەتمەندییە تایبەتەکان' },
    upgrade: { fa: 'ارتقا به اشتراک VIP', en: 'Upgrade to VIP', ku: 'بەرزکردنەوە بۆ VIP' },
  },
};

/**
 * Universal translate helper:
 * Falls back gracefully: Kurdish -> Persian (for missing keys) or English.
 */
export function getLangText(
  lang: Language,
  texts: { fa: string; en: string; ku?: string }
): string {
  if (lang === 'ku') {
    return texts.ku || texts.fa;
  }
  return texts[lang] || texts.fa;
}
