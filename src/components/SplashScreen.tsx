import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, TrendingUp, ShieldCheck, Zap } from 'lucide-react';
import { Language } from '../types';

interface SplashScreenProps {
  language: Language;
  onFinished: () => void;
}

export function SplashScreen({ language, onFinished }: SplashScreenProps) {
  const [progress, setProgress] = useState(0);
  const [loadingText, setLoadingText] = useState('');

  // Multi-language status updates for high-fidelity execution aesthetic
  const steps = language === 'ku' ? [
    { threshold: 0, text: 'پەیوەستبوون بە بازاڕی زێڕ و کاڵاکان...' },
    { threshold: 25, text: 'شیکاریی پێکهاتەی بازاڕ (SMC) و ئۆردەربلۆکەکان...' },
    { threshold: 55, text: 'دیاریکردنی زۆنەکانی خستنەڕوو، داواکاری و نەختینە...' },
    { threshold: 80, text: 'ئامادەکردنی سەکۆی بازرگانیی ئۆنیگاما...' },
    { threshold: 100, text: 'پەیوەندی بە سەرکەوتوویی جێگیر کرا!' }
  ] : (language === 'fa' ? [
    { threshold: 0, text: 'در حال اتصال به مارکت طلا...' },
    { threshold: 25, text: 'بارگذاری الگوهای ساختار بازار (SMC)...' },
    { threshold: 55, text: 'محاسبه سطوح عرضه، تقاضا و نقدینگی...' },
    { threshold: 80, text: 'آماده‌سازی کابین کاربری اونیگاما...' },
    { threshold: 100, text: 'اتصال با موفقیت برقرار شد!' }
  ] : [
    { threshold: 0, text: 'Connecting to Gold & Commodity feeds...' },
    { threshold: 25, text: 'Parsing Smart Money Concepts (SMC) patterns...' },
    { threshold: 55, text: 'Calculating Supply, Demand & Liquidity zones...' },
    { threshold: 80, text: 'Optimizing Onigama FX client dashboard...' },
    { threshold: 100, text: 'Gateway established successfully!' }
  ]);

  useEffect(() => {
    // Dynamic loading interval that fills in 2.2 seconds
    const startTime = Date.now();
    const duration = 2200;

    const timer = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const calculatedProgress = Math.min(100, (elapsed / duration) * 100);
      
      setProgress(calculatedProgress);

      // Dynamically select the best status text based on current percentage
      const currentStep = [...steps].reverse().find(s => calculatedProgress >= s.threshold);
      if (currentStep) {
        setLoadingText(currentStep.text);
      }

      if (elapsed >= duration) {
        clearInterval(timer);
        setTimeout(() => {
          onFinished();
        }, 300); // Small breathing space after 100%
      }
    }, 30);

    return () => clearInterval(timer);
  }, [language]);

  return (
    <div 
      onClick={onFinished}
      role="button"
      tabIndex={0}
      title={language === 'ku' ? 'کرتە بکە بۆ چوونەژوورەوەی خێرا' : (language === 'fa' ? 'برای ورود سریع کلیک کنید' : 'Click to skip')}
      className="fixed inset-0 z-[9999] bg-[#030712] flex flex-col items-center justify-between p-8 overflow-hidden select-none cursor-pointer"
    >
      
      {/* GLOW DECORATIONS */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-amber-500/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 left-1/4 w-[200px] h-[200px] bg-blue-500/5 rounded-full blur-[80px] pointer-events-none" />

      {/* spacer */}
      <div className="h-4" />

      {/* CENTRE BRAND PIECE */}
      <div className="flex flex-col items-center justify-center text-center max-w-sm">
        
        {/* PREMIUM BRAND EMBLEM WITH LAYERED GOLD GLOWS */}
        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="relative w-24 h-24 mb-6 flex items-center justify-center"
        >
          {/* Outer Rotating Diamond Accent */}
          <div className="absolute inset-0 border border-amber-500/30 rounded-3xl rotate-45 animate-[spin_12s_linear_infinite]" />
          
          {/* Secondary Counter-rotating Ring */}
          <div className="absolute inset-1.5 border border-blue-500/20 rounded-full animate-[spin_8s_linear_infinite_reverse]" />

          {/* Golden Pulse Aura */}
          <div className="absolute inset-3 bg-gradient-to-tr from-amber-500/10 via-yellow-500/15 to-transparent rounded-2xl rotate-12 blur-[1px]" />

          {/* Core Graphic Icon */}
          <div className="relative z-10 w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#050b14] to-[#111e2f] border border-amber-500/40 shadow-xl overflow-hidden flex items-center justify-center">
            <img 
              src="/logo.jpg" 
              alt="Onigama Dragon Logo" 
              className="w-full h-full object-cover rounded-2xl"
              referrerPolicy="no-referrer"
            />
          </div>

          {/* External orbital badge elements */}
          <div className="absolute -bottom-1 -right-1 bg-blue-500/20 border border-blue-500/40 text-[8px] text-blue-300 font-bold px-1.5 py-0.5 rounded-full font-mono flex items-center gap-0.5 shadow-md">
            <Zap className="w-2 h-2 fill-current" />
            SMC
          </div>
        </motion.div>

        {/* LOGO TYPOGRAPHY */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="space-y-2"
        >
          <div className="flex items-center justify-center gap-1.5">
            <h1 className="text-2xl font-black text-white tracking-[0.25em] font-sans">
              ONIGAMA <span className="text-amber-400 font-bold tracking-normal">FX</span>
            </h1>
          </div>
          
          <p className="text-[10px] text-slate-400 uppercase tracking-[0.16em] font-bold">
            {language === 'ku'
              ? 'ئیکۆسیستەمی ژیرانەی شیکاریی مارکێت و بازاڕە دارایییەکان'
              : (language === 'fa' 
                ? 'اکوسیستم هوشمند تحلیل مارکت و بازارهای مالی' 
                : 'Smart Financial Intelligence Engine')}
          </p>
        </motion.div>
      </div>

      {/* FOOTER LOADER & SYSTEM SPECS */}
      <div className="w-full max-w-xs space-y-6">
        
        {/* PROGRESS BAR BOARD */}
        <div className="space-y-2.5">
          <div className="flex justify-between items-end text-[10px]">
            {/* Status updates fade in and out cleanly */}
            <span className="text-slate-300 font-medium truncate shrink min-w-0 pr-2">
              {loadingText}
            </span>
            <span className="text-amber-400 font-mono font-bold shrink-0">
              {Math.floor(progress)}%
            </span>
          </div>

          {/* Loader track */}
          <div className="h-1 lg:h-1.5 bg-slate-900 rounded-full overflow-hidden border border-white/5 relative">
            <motion.div 
              className="absolute left-0 top-0 bottom-0 bg-gradient-to-r from-amber-500 via-yellow-400 to-blue-400 rounded-full"
              style={{ width: `${progress}%` }}
              layoutId="splash-loader"
            />
          </div>
        </div>

        {/* ECOSYSTEM SPECIFICATION */}
        <div className="flex justify-between items-center text-[9px] text-slate-500 font-mono border-t border-white/5 pt-4">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-[#6f87a0]/80" />
            <span>SECURE GATEWAY</span>
          </div>
          <div>v2.1.0-CYBER</div>
        </div>

      </div>

    </div>
  );
}
