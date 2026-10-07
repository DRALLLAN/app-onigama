import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sparkles, 
  Target, 
  Flame, 
  Brain, 
  Layers, 
  BookOpen, 
  TrendingUp, 
  TrendingDown, 
  ChevronRight, 
  Award, 
  Zap, 
  CheckCircle, 
  ShieldAlert, 
  Rocket, 
  Globe, 
  Smartphone, 
  Lock,
  Compass,
  DollarSign
} from 'lucide-react';
import { Language } from '../types';

interface CatalogPageProps {
  language: Language;
  onNavigate?: (tab: string) => void;
}

export function CatalogPage({ language, onNavigate }: CatalogPageProps) {
  const isRtl = language === 'fa' || language === 'ku';
  const [activeFeature, setActiveFeature] = useState<number>(0);
  const [showPromoAlert, setShowPromoAlert] = useState<boolean>(false);

  const keyFeatures = [
    {
      id: 0,
      icon: Layers,
      titleFa: 'ترسیم فنی ساختار بازار (SMC & LIT)',
      titleEn: 'Algorithmic Structure Mapping (SMC & LIT)',
      titleKu: 'نەخشەی تەکنیکیی پێکهاتەی بازاڕ (SMC & LIT)',
      descFa: 'موقعیت‌یابی هوشمند اردر بلاک‌ها، ارزیابی گپ منصفانه (FVG) و نمایش سطوح هانت و القاء نقدینگی بر اساس استراتژی‌های پیشرفته موسساتی.',
      descEn: 'Smart tracking of institutional order blocks, FVG mitigation zones, and LIT inducement sweep targets to avoid retail sentiment traps.',
      descKu: 'دیاریکردنی ژیرانەی ئۆردەربلۆکەکان، بۆشایی نرخی دادپەروەرانە (FVG) و ئاستەکانی ڕاوکردنی نەختینە بەپێی ستراتیژییە دامەزراوەیییەکان.',
      color: 'from-blue-500 to-indigo-600',
      tag: 'TECHNICAL'
    },
    {
      id: 1,
      icon: Flame,
      titleFa: 'خبرخوان هوشمند و تحلیل فاندامنتال لایو',
      titleEn: 'Smart Real-time News Sentiment Engine',
      titleKu: 'هەواڵخوێنی ژیرانە و شیکاریی فەندەمێنتەڵ',
      descFa: 'دریافت آنی اخبار حساس و پردازش عمیق جهت تحلیل بار معنایی بازار در سه سطح صعودی (BULLISH)، نزولی (BEARISH) و خنثی (NEUTRAL).',
      descEn: 'Instant ingestion of critical geopolitical high impact events paired with automated logical market sentiment evaluation.',
      descKu: 'وەرگرتنی دەستبەجێی هەواڵە گرنگەکان و شیکاریی قووڵی هەستی بازاڕ بە شێوەی بەرەوسەر، بەرەوخوار و بێ‌لایەن.',
      color: 'from-rose-500 to-orange-500',
      tag: 'FUNDAMENTAL'
    },
    {
      id: 2,
      icon: Brain,
      titleFa: 'دستیار خودکار روانشناسی و مربی معامله‌گر',
      titleEn: 'Dynamic Market Psychology Coach',
      titleKu: 'یاریدەدەری دەروونناسی و ڕاهێنەری بازرگان',
      descFa: 'مدیریت و تحلیل احساسات قالب معامله‌گر (مانند فومو، طمع و ترس) قبل و بعد از معاملات برای بازیافت ساختاری ذهن معامله‌گری شما.',
      descEn: 'Assess emotional trends (FOMO, Greed, Fear) before and after placing trades to build a bulletproof core trader psychology.',
      descKu: 'بەڕێوەبردن و شیکاریی هەستەکانی بازرگان (وەک فۆمۆ، تەماح و ترس) پێش و دوای مامەڵە بۆ دروستکردنی عەقڵییەتێکی پۆڵایین.',
      color: 'from-purple-500 to-pink-500',
      tag: 'PSYCHOLOGY'
    },
    {
      id: 3,
      icon: BookOpen,
      titleFa: 'ژورنال دیجیتال با محاسبه دقیق سود و زیان',
      titleEn: 'Advanced Auto-Calculating Journal',
      titleKu: 'ژوورناڵی دیجیتاڵ بە هەژمارکردنی قازانج و زیان',
      descFa: 'سیستم ثبت معاملات دستیار هوشمند با محاسبه لحظه‌ای اسپرد، سود خالص، درصد برد و شبیه‌سازی آماری بازدهی حساب.',
      descEn: 'Effortlessly document standard setups, evaluate trade outcomes, auto-calculate win rates, and verify performance indices.',
      descKu: 'تۆمارکردنی ئاسانی مامەڵەکان بە هەژمارکردنی دەستبەجێی سپڕێد، قازانجی پوخت، ڕێژەی سەرکەوتن و ئامارەکان.',
      color: 'from-emerald-500 to-teal-500',
      tag: 'ANALYTICS'
    }
  ];

  const appSpecifications = [
    { 
      labelFa: 'تکنولوژی بک‌اند', 
      labelEn: 'Core Backend', 
      labelKu: 'تەکنەلۆژیای بنچینەیی',
      valueFa: 'تایپ‌اسکریپت و الگوریتم‌های فوق سریع اونیگاما', 
      valueEn: 'TypeScript & Ultra-fast Onigama Engine',
      valueKu: 'تایپ‌سکریپت و مەکینەی خێرای Onigama'
    },
    { 
      labelFa: 'نمودار زنده بازار', 
      labelEn: 'Live Stream Chart', 
      labelKu: 'چارتی ڕاستەوخۆی بازاڕ',
      valueFa: 'نمودارهای مستقیم و لحظه‌ای TradingView', 
      valueEn: 'Direct integration with TradingView stream node',
      valueKu: 'چارتی ڕاستەوخۆ و پەیوەستکراوی TradingView'
    },
    { 
      labelFa: 'متدهای تحلیلی', 
      labelEn: 'Supported Systems', 
      labelKu: 'میتۆدە شیکارییەکان',
      valueFa: 'مفاهیم SMC و تئوری نقدینگی پیشرفته LIT', 
      valueEn: 'Advanced SMC logic & LIT structures',
      valueKu: 'یاساکانی SMC و تیۆری پێشکەوتووی LIT'
    },
    { 
      labelFa: 'زبان‌های پشتیبانی شده', 
      labelEn: 'Supported Languages', 
      labelKu: 'زمانە بەردەستەکان',
      valueFa: 'سه زبانه کامل (کوردی سورانی | فارسی | انگلیسی)', 
      valueEn: 'Trilingual Native (Kurdish | Persian | English)',
      valueKu: 'سێ زمان بە تەواوی (کوردی سۆرانی | فارسی | ئینگلیزی)'
    },
    { 
      labelFa: 'امنیت داده‌ها', 
      labelEn: 'Data Privacy', 
      labelKu: 'پاراستنی داتاکان',
      valueFa: 'ذخیره‌سازی رمزگذاری‌شده محلی و همگام‌سازی ابری امن', 
      valueEn: 'Encrypted local state persistence & optional cloud sync',
      valueKu: 'پاشەکەوتکردنی نهێنی لەناو ئامێر و هەوردا'
    }
  ];

  return (
    <div className="space-y-10 pb-24 font-sans">
      
      {/* LUXURY GLOW HERO POSTER SECTION */}
      <div className="relative rounded-3xl overflow-hidden border border-white/10 bg-gradient-to-b from-[#0b1424] via-[#050b13] to-[#070f17] p-8 md:p-12 text-center space-y-6 shadow-2xl">
        {/* Floating lighting overlays */}
        <div className="absolute top-0 left-1/4 w-72 h-72 bg-blue-500/10 rounded-full blur-[80px] pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-72 h-72 bg-yellow-500/5 rounded-full blur-[80px] pointer-events-none" />
        
        {/* VIP Premium Diamond Badge */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 text-xs font-black tracking-widest uppercase">
          <Award className="w-4 h-4 animate-spin" />
          <span>{language === 'ku' ? 'بڵاوبوونەوەی جیهانیی وەشانی Onigama V1.1.0' : (language === 'fa' ? 'انتشار جهانی نسخه ۱.۱.۰ اونیگاما' : 'ONIGAMA GLOBAL RELEASE V1.1.0')}</span>
        </div>

        <h1 className="text-3xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-100 to-[#6f87a0] tracking-tight leading-tight max-w-4xl mx-auto">
          {language === 'ku' ? 'نەوەی نوێی یاریدەدەرە ژیرەکانی بازرگانی' : (language === 'fa' ? 'نسل نوظهور دستیارهای معاملاتی هوشمند' : 'The Next Generation of Intelligent Trading Assistants')}
        </h1>
        
        <p className="text-xs sm:text-sm md:text-base text-slate-400 max-w-2xl mx-auto leading-relaxed">
          {language === 'ku'
            ? 'ئەپڵیکەیشنی Onigama پلاتفۆرمێکی پێشکەوتووە بۆ شیکاریی پێکهاتەی بازاڕ، تۆمارکردنی پیشەگەریانەی مامەڵەکان، شیکاریی قووڵی هەواڵە فەندەمێنتەڵەکان و چاودێریی دەروونناسی.'
            : (language === 'fa' 
              ? 'اپلیکیشن اونیگاما یک پلتفرم فوق پیشرفته و انقلابی برای آنالیز ساختار بازار، ژورنال‌نویسی حرفه‌ای، تحلیل عمیق اخبار حساس فاندامنتال و پایش روانشناسی معامله‌گر است.'
              : 'Onigama is an elite multi-lingual software suite engineered for real-time market structure mapping, news sentiment tracking, emotional trading diagnostics, and high-fidelity journaling.'
            )
          }
        </p>

        {/* Action Call for navigation */}
        <div className="flex flex-wrap justify-center items-center gap-4 pt-4">
          <button
            type="button"
            onClick={() => onNavigate?.('home')}
            className="px-6 py-3.5 bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-500 hover:to-indigo-600 text-white font-black rounded-2xl text-xs sm:text-sm tracking-wide transition-all shadow-xl active:scale-95 flex items-center gap-2 cursor-pointer"
          >
            <Rocket className="w-4 h-4" />
            <span>{language === 'ku' ? '🚀 چوونەژوورەوە بۆ سەکۆی بازرگانی' : (language === 'fa' ? '🚀 ورود به پلتفرم معاملاتی' : '🚀 Launch Active Terminal')}</span>
          </button>
          
          <button
            type="button"
            onClick={() => {
              setShowPromoAlert(true);
              setTimeout(() => setShowPromoAlert(false), 5000);
            }}
            className="px-6 py-3.5 bg-white/5 hover:bg-white/10 text-slate-200 border border-white/10 hover:border-white/20 font-bold rounded-2xl text-xs sm:text-sm transition-all flex items-center gap-2 cursor-pointer"
          >
            <Compass className="w-4 h-4" />
            <span>{language === 'ku' ? 'وەرگرتنی مۆڵەتی تایبەت (VIP)' : (language === 'fa' ? 'دریافت لایسنس ویژه (VIP)' : 'Activate Golden License')}</span>
          </button>
        </div>
      </div>

      {/* FLOATING SUCCESS NOTIFICATION */}
      <AnimatePresence>
        {showPromoAlert && (
          <motion.div
            initial={{ opacity: 0, y: -50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="fixed top-6 left-1/2 -translate-x-1/2 z-[99999] w-full max-w-sm p-4 rounded-2xl bg-slate-900 border border-yellow-500/30 text-white shadow-2xl flex items-start gap-3"
            dir={isRtl ? 'rtl' : 'ltr'}
          >
            <span className="p-2 bg-yellow-500/10 text-yellow-400 rounded-xl">
              <Sparkles className="w-5 h-5 animate-pulse" />
            </span>
            <div className="space-y-1 flex-1 text-right">
              <h4 className="text-xs font-black text-yellow-400 uppercase tracking-wider">
                {language === 'ku' ? 'مۆڵەتی تاقیکاری بە سەرکەوتوویی دروستکرا!' : (language === 'fa' ? 'کد فعال‌سازی رایگان صادر شد!' : 'Free Pass Activated!')}
              </h4>
              <p className="text-[10px] text-slate-300 leading-normal">
                {language === 'ku'
                  ? 'وەشانێکی تاقیکاریی VIPـی ئۆنیگاما لە ئێستادا بۆت چالاکە. دەتوانیت کلیلی هەمیشەیی لە بەشی ڕێکخستنەکان وەربگریت.'
                  : (language === 'fa' 
                    ? 'یک نسخه لایسنس تستی طلایی اونیگاما هم‌اکنون برای شما فعال است. کدهای فعال‌سازی دائمی را در برگه تنظیمات کپی کنید.'
                    : 'Your complimentary golden trial is actively running! Copy permanent licenses in the Settings tab.')}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* INTERACTIVE FEATURE SHOWCASE TAB BOARD */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
        
        {/* Tab Buttons Side */}
        <div className="lg:col-span-5 space-y-4" dir={isRtl ? 'rtl' : 'ltr'}>
          <div className="space-y-1">
            <span className="text-[10px] text-blue-400 font-extrabold uppercase tracking-widest font-mono">
              CORE SYSTEM MODULES
            </span>
            <h2 className="text-xl md:text-2xl font-black text-white tracking-tight leading-relaxed">
              {language === 'ku' ? 'کۆڵەکەکانی پلاتفۆرمی ئۆنیگاما' : (language === 'fa' ? 'ستون‌های اصلی پتانسیل اونیگاما' : 'Core Architectural Pillars')}
            </h2>
            <p className="text-xs text-slate-400 font-medium">
              {language === 'ku'
                ? 'بۆ پشکنینی وردتری هەر مۆدیولێکی پێشکەوتوو، کرتە لەسەر بەشی دڵخواز بکە:'
                : (language === 'fa'
                  ? 'برای بررسی کارایی عمیق تر هر ماژول پیشرفته، روی بخش مورد نظر کلیک کنید:'
                  : 'Click through each core module below to explore its algorithmic blueprint:')}
            </p>
          </div>

          <div className="space-y-3 pt-2">
            {keyFeatures.map((feat) => {
              const isSel = activeFeature === feat.id;
              const IconComp = feat.icon;
              return (
                <button
                  key={feat.id}
                  type="button"
                  onClick={() => setActiveFeature(feat.id)}
                  className={`w-full p-4 rounded-2xl border transition-all cursor-pointer text-right flex items-center justify-between gap-3 ${
                    isSel
                      ? 'bg-gradient-to-r from-slate-900 via-[#0a1424] to-[#0d1e34] border-blue-500/30 shadow-[0_4px_15px_rgba(59,130,246,0.1)]'
                      : 'bg-[#09101b]/40 border-white/5 hover:border-white/10 hover:bg-[#09101b]/60'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className={`p-2.5 rounded-xl ${isSel ? 'bg-blue-600 text-white' : 'bg-white/5 text-slate-400'}`}>
                      <IconComp className="w-4.5 h-4.5" />
                    </span>
                    <div className="space-y-0.5">
                      <span className="text-[9px] font-bold text-blue-400 font-mono tracking-wider">{feat.tag}</span>
                      <h3 className="text-xs font-black text-white leading-tight">
                        {language === 'ku' ? feat.titleKu : (language === 'fa' ? feat.titleFa : feat.titleEn)}
                      </h3>
                    </div>
                  </div>
                  <ChevronRight className={`w-4 h-4 text-slate-500 transition-transform ${isSel ? 'transform rotate-90 text-blue-400' : ''}`} />
                </button>
              );
            })}
          </div>
        </div>

        {/* Detailed Showcase Board Card */}
        <div className="lg:col-span-7 flex">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeFeature}
              initial={{ opacity: 0, scale: 0.98, x: 20 }}
              animate={{ opacity: 1, scale: 1, x: 0 }}
              exit={{ opacity: 0, scale: 0.98, x: -25 }}
              transition={{ duration: 0.25 }}
              className="w-full rounded-3xl border border-white/10 bg-[#070f17]/30 backdrop-blur-xl p-6 md:p-8 flex flex-col justify-between relative overflow-hidden"
              dir={isRtl ? 'rtl' : 'ltr'}
            >
              {/* Background gradient bulb */}
              <div className={`absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl ${keyFeatures[activeFeature].color} opacity-[0.035] rounded-full filter blur-3xl pointer-events-none`} />

              <div className="space-y-6 relative z-10">
                <div className="flex justify-between items-center">
                  <span className="px-3 py-1 bg-white/5 rounded-xl border border-white/5 text-[9px] font-mono tracking-widest text-slate-400 uppercase">
                    MODULE 0{activeFeature + 1}
                  </span>
                  <div className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
                </div>

                <div className="space-y-3">
                  <h3 className="text-lg md:text-xl font-black text-white leading-snug tracking-tight">
                    {language === 'ku' ? keyFeatures[activeFeature].titleKu : (language === 'fa' ? keyFeatures[activeFeature].titleFa : keyFeatures[activeFeature].titleEn)}
                  </h3>
                  <p className="text-xs md:text-sm text-slate-400/90 leading-relaxed">
                    {language === 'ku' ? keyFeatures[activeFeature].descKu : (language === 'fa' ? keyFeatures[activeFeature].descFa : keyFeatures[activeFeature].descEn)}
                  </p>
                </div>

                {/* Simulated visual asset mockup inside the showcase card */}
                <div className="p-4 rounded-2xl bg-[#03080e]/90 border border-white/5 font-mono space-y-2.5">
                  <div className="flex justify-between items-center pb-2 border-b border-white/5">
                    <span className="text-[10px] text-blue-400 font-bold uppercase tracking-wider">ONIGAMA SYSTEM LINKAGE</span>
                    <span className="text-[9px] text-slate-400">STATE: RUNNING // OK</span>
                  </div>
                  <div className="grid grid-cols-2 gap-3 text-[10px]">
                    <div className="space-y-1">
                      <span className="text-slate-500 block">ENHANCED SECURITY</span>
                      <span className="text-white font-bold">SHA-256 SECURED ✔</span>
                    </div>
                    <div className="space-y-1">
                      <span className="text-slate-500 block">LATENCY RESPONSE</span>
                      <span className="text-emerald-400 font-bold">~14ms TICK FEED</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t border-white/5 relative z-10 flex flex-wrap gap-3 items-center justify-between">
                <span className="text-[10px] text-slate-500">
                  {language === 'ku' ? 'دیزاینێکی مینیماڵ و ورد بە زۆرترین چڕیی زانیارییەکان' : (language === 'fa' ? 'طراحی مینی‌مالیست با بالاترین چگالی اطلاعاتی' : 'Minimalist design engineered with maximum data density')}
                </span>
                
                <button
                  type="button"
                  onClick={() => {
                    const sections = ['home', 'analysis', 'fundamental', 'psychology'];
                    const targetTab = sections[activeFeature] || 'home';
                    onNavigate?.(targetTab);
                  }}
                  className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white font-bold rounded-xl text-[10px] sm:text-xs transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <span>{language === 'ku' ? 'تاقیکردنەوەی ڕاستەوخۆی ئەم بەشە' : (language === 'fa' ? 'امتحان کردن زنده این بخش' : 'Interactive Playground')}</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

      </div>

      {/* WHY CHOOSE ONIGAMA ADVANTAGE GRID (BENTO CARD STYLE) */}
      <div className="space-y-4" dir={isRtl ? 'rtl' : 'ltr'}>
        <div className="text-center space-y-1">
          <h2 className="text-xl md:text-2xl font-black text-white tracking-tight uppercase">
            {language === 'ku' ? 'بۆچی بازرگانان Onigama هەڵدەبژێرن؟' : (language === 'fa' ? 'چرا معامله‌گران اونیگاما را انتخاب می‌کنند؟' : 'Why Traders Prefer Onigama?')}
          </h2>
          <p className="text-xs text-slate-400 max-w-xl mx-auto">
            {language === 'ku'
              ? 'تێکەڵکردنێکی ژیرانە لە نوێترین تەکنەلۆژیاکانی بازرگانیی نێودەوڵەتی و دیزاینێکی خۆماڵی و ناوازە'
              : (language === 'fa'
                ? 'تلفیقی هوشمندانه از جدیدترین تکنولوژی‌های معامله‌گری غربی و طراحی چشم‌نوار بومی'
                : 'The pristine fusion of contemporary institutional concepts with multi-lingual workflow optimization')}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
          
          <div className="p-5 rounded-3xl border border-white/5 bg-[#0b1424]/20 backdrop-blur-md relative overflow-hidden group hover:border-[#6f87a0]/20 transition-all duration-300">
            <div className="p-3 bg-blue-500/10 text-blue-400 rounded-2xl w-fit mb-4">
              <Zap className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-black text-white mb-2">
              {language === 'ku' ? 'ڕاستەوخۆ و بێ دواکەوتن (Instant UI)' : (language === 'fa' ? 'لایو و بدون تاخیر (Instant UI)' : 'Zero Latency Live State')}
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              {language === 'ku'
                ? 'چارتی ڕاستەوخۆی بازاڕی زێڕ و دراوە دیجیتاڵییەکان بە نوێبوونەوەی بەردەوام لە چەند میلی‌چرکەدا.'
                : (language === 'fa'
                  ? 'نمودارهای لایو بازار طلا و رمز ارزها با فرکانس بالای همگام‌سازی اطلاعات در کمتر از چند میلی‌ثانیه.'
                  : 'Highly responsive spot currency pipelines that retrieve live market valuations with flawless integrity.')}
            </p>
          </div>

          <div className="p-5 rounded-3xl border border-white/5 bg-[#0b1424]/20 backdrop-blur-md relative overflow-hidden group hover:border-emerald-500/20 transition-all duration-300">
            <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-2xl w-fit mb-4">
              <CheckCircle className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-black text-white mb-2">
              {language === 'ku' ? 'ژینگەیەکی مۆدێرن و کاریگەر' : (language === 'fa' ? 'محیط کاری مدرن و بهینه' : 'High Performance Density')}
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              {language === 'ku'
                ? 'ڕووکارێکی سەرنجڕاکێش بە ڕووکاری تاریک کە ڕێگری دەکات لە ماندووبوونی چاو لە کاتی چاودێریی درێژخایەندا.'
                : (language === 'fa'
                  ? 'رابط کاربری چشم‌نواز با تم تیره تیتانیومی که خستگی چشم را در تایم فریم‌های طولانی به صفر می‌رساند.'
                  : 'Pristine aesthetic choices paired with clean spacious padding to support extended session analytics safely.')}
            </p>
          </div>

          <div className="p-5 rounded-3xl border border-white/5 bg-[#0b1424]/20 backdrop-blur-md relative overflow-hidden group hover:border-purple-500/20 transition-all duration-300">
            <div className="p-3 bg-purple-500/10 text-purple-400 rounded-2xl w-fit mb-4">
              <Globe className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-black text-white mb-2">
              {language === 'ku' ? 'پشتیوانی تەواوی فرەزمان (Full Native)' : (language === 'fa' ? 'جهانی و کاربردی (Full Native)' : 'Flawless Multi-Language')}
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              {language === 'ku'
                ? 'گۆڕینی دەستبەجێ لەنێوان زمانی کوردی سۆرانی، فارسی و ئینگلیزی بە ڕێکخستنی تەواوی ڕاست‌بۆچەپ.'
                : (language === 'fa'
                  ? 'امکان تعویض آنی زبان‌ها بین فارسی، کوردی و انگلیسی با حفظ ساختار پیکسلی مینی‌مال ابزارها.'
                  : 'Dynamic trilingual support translating complex financial metrics and trade parameters with ultimate accuracy.')}
            </p>
          </div>

        </div>
      </div>

      {/* DETAILED TECHNICAL SPECIFICATIONS BAR */}
      <div className="p-6 md:p-8 rounded-3xl border border-white/5 bg-[#0a111c]/30 backdrop-blur-2xl space-y-6" dir={isRtl ? 'rtl' : 'ltr'}>
        <div className="flex items-center gap-2">
          <Award className="w-5 h-5 text-yellow-500 animate-pulse" />
          <h2 className="text-sm font-black text-white tracking-widest uppercase">
            {language === 'ku' ? 'تایبەتمەندییە تەکنیکییەکان و ستانداردەکان' : (language === 'fa' ? 'مشخصات فنی و استانداردهای طراحی' : 'System Specifications & Parameters')}
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {appSpecifications.map((spec, idx) => (
            <div key={idx} className="flex justify-between items-center p-3 rounded-xl bg-white/[0.01] border border-white/5 text-xs font-mono">
              <span className="text-slate-400 font-sans font-semibold">
                {language === 'ku' ? spec.labelKu : (language === 'fa' ? spec.labelFa : spec.labelEn)}
              </span>
              <span className="text-white font-extrabold text-right">
                {language === 'ku' ? spec.valueKu : (language === 'fa' ? spec.valueFa : spec.valueEn)}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* FINAL PROMOTIONAL VIP REGISTER BANNER */}
      <div className="p-6 sm:p-8 rounded-3xl border border-yellow-500/10 bg-gradient-to-tr from-[#1b150c]/80 via-[#070f17]/40 to-[#0c1b0c]/35 backdrop-blur-xl flex flex-col sm:flex-row justify-between items-center gap-6" dir={isRtl ? 'rtl' : 'ltr'}>
        <div className="space-y-2 text-center sm:text-right">
          <div className="flex items-center gap-1.5 justify-center sm:justify-start">
            <Sparkles className="w-4 h-4 text-yellow-400 animate-pulse" />
            <span className="text-[10px] font-black tracking-widest text-yellow-400 uppercase font-mono">
              ONIGAMA SYNDICATE MEMBER ACCESS
            </span>
          </div>
          <h3 className="text-base sm:text-lg font-black text-white">
            {language === 'ku' ? 'ببە بە ئەندامی خانەوادە و بەشداربووانی زێڕینی Onigama' : (language === 'fa' ? 'به خانواده اعضا و مشتریان طلایی اونیگاما بپیوندید' : 'Become a Gold Syndicate Member Today')}
          </h3>
          <p className="text-[11px] text-slate-400 leading-normal max-w-xl">
            {language === 'ku'
              ? 'تیۆرییەکانی ئەلگۆریتمی نەهێنی بازاڕ وەک نوقمکردن و ڕاوکردنی نەختینەی LIT و سیگناڵە پێشکەوتووەکان چالاک بکە.'
              : (language === 'fa'
                ? 'تئوری‌های الگوریتم مخفی بازار مثل نقدینگی مهندسی شده LIT و سیگنال‌دهی پیشرفته موسسات مالی را فعال کنید.'
                : 'Unlock advanced algorithmic theories such as LIT premium inducement vectors and full structural news notifications.')}
          </p>
        </div>

        <button
          type="button"
          onClick={() => onNavigate?.('settings')}
          className="shrink-0 py-3.5 px-6 bg-gradient-to-r from-yellow-500 to-amber-600 hover:from-yellow-400 hover:to-amber-500 text-slate-950 font-black rounded-xl text-xs sm:text-sm tracking-wide transition-all shadow-xl active:scale-95 cursor-pointer flex items-center gap-1.5"
        >
          <Lock className="w-4 h-4" />
          <span>{language === 'ku' ? 'چالاککردن لە بەشی ڕێکخستنەکان' : (language === 'fa' ? 'فعال‌سازی از برگه تنظیمات' : 'Upgrade via Settings')}</span>
        </button>
      </div>

    </div>
  );
}
