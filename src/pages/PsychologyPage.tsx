import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Brain, Smile, AlertCircle, Info, CheckCircle2, ShieldAlert, TrendingUp, HelpCircle, Lock, Sparkles } from 'lucide-react';
import { StorageManager } from '../services/api';

interface PsychologyPageProps {
  language: 'fa' | 'en';
  onNavigate?: (tab: string) => void;
}

interface Tip {
  id: number;
  icon: string;
  lucideIcon: any;
  color: string;
  title: { fa: string; en: string };
  summary: { fa: string; en: string };
  content: { fa: string; en: string };
  quote: { fa: string; en: string };
}

export function PsychologyPage({ language, onNavigate }: PsychologyPageProps) {
  const [expandedTip, setExpandedTip] = useState<number | null>(null);
  const [profile, setProfile] = useState(() => StorageManager.getProfile());
  const [showLockModal, setShowLockModal] = useState(false);

  const isVip = profile.isActivated && (profile.subscriptionTier === 'vip' || profile.subscriptionTier === 'premium');

  useEffect(() => {
    setProfile(StorageManager.getProfile());
  }, []);

  const psychologyTips: Tip[] = [
    {
      id: 1,
      icon: '🎯',
      lucideIcon: Smile,
      color: '#6f87a0',
      title: {
        fa: 'مدیریت احساسات',
        en: 'Emotion Management'
      },
      summary: {
        fa: 'کنترل ترس و طمع - کلید موفقیت در تریدینگ',
        en: 'Control fear & greed - the key to trading success'
      },
      content: {
        fa: `ترس و طمع دو دشمن اصلی تریدر هستند. وقتی بازار صعودی است، طمع باعث میشود دیرتر از موقع مناسب وارد شوید یا زودتر از موقع سود بگیرید. وقتی بازار نزولی است، ترس باعث میشود زودتر از موقع از معامله خارج شوید یا اصلاً وارد نشوید.

راهحل: قبل از هر معامله، یک پلن مشخص داشته باشید. نقاط ورود، خروج، حد ضرر و حد سود را از قبل تعیین کنید و بدون توجه به احساسات، به آن پایبند باشید. هیچگاه تحت تأثیر هیجان تصمیم نگیرید.`,
        en: `Fear and greed are the two main enemies of a trader. When the market is bullish, greed causes you to enter too late or exit with a premature profit. When the market is bearish, fear makes you close trades too early or not enter at all.

Solution: Have a clear trading plan before making any transaction. Determine your entry, exit, stop loss, and take profit in advance, and stick to it regardless of your feelings. Never make decisions under execution pressure or hype.`
      },
      quote: {
        fa: '"بازار احساسات شما را میشناسد - آنها را از او پنهان کنید."',
        en: '"The market knows your emotions - hide them from it."'
      }
    },
    {
      id: 2,
      icon: '📊',
      lucideIcon: TrendingUp,
      color: '#10b981',
      title: {
        fa: 'انضباط معاملاتی',
        en: 'Trading Discipline'
      },
      summary: {
        fa: 'پایبندی به استراتژی - راز تریدرهای حرفهای',
        en: 'Rule adherence - the secret of professional traders'
      },
      content: {
        fa: `انضباط یعنی هر روز، هر معامله، به قوانین خودتان پایبند باشید. بدون استثنا. حتی اگر یکبار با شکستن قوانین سود کردید، این باعث نمیشود که بار بعد هم کار کند.

تریدرهای موفق کسانی هستند که مثل رباتها عمل میکنند - احساسی تصمیم نمیگیرند، فقط استراتژی خود را اجرا میکنند. یک ژورنال معاملاتی داشته باشید و هر معامله را ثبت کنید: چرا وارد شدید، چرا خارج شدید، چه احساسی داشتید.

قوانین طلایی:
- هرگز بیش از ۱ تا ۲ درصد سرمایه را در یک معامله ریسک نکنید
- همیشه حد ضرر تعیین کنید
- هرگز به امید برگشت قیمت، ضرر را نگه ندارید
- از Revenge Trading (معامله انتقامی) بعد از ضرر دوری کنید`,
        en: `Discipline means sticking to your rules every single day, for every single trade. No exceptions. Even if you made a profit by breaking the rules once, it won't work in the long run.

Successful traders behave like robots: they don't make emotional decisions, they just execute their statistical edge. Keep a trading journal to log every entry: why you entered, why you exited, and what your emotional state was.

Golden Rules:
- Never risk more than 1-2% of capital on a single trade
- Always place a stop loss (SL)
- Never hold a loss in hopes of a miracle reversal
- Avoid revenge trading right after taking a loss`
      },
      quote: {
        fa: '"انضباط، پل بین اهداف و موفقیت است."',
        en: '"Discipline is the bridge between goals and accomplishment."'
      }
    },
    {
      id: 3,
      icon: '💔',
      lucideIcon: AlertCircle,
      color: '#f43f5e',
      title: {
        fa: 'پذیرش ضرر',
        en: 'Accepting Losses'
      },
      summary: {
        fa: 'ضرر بخشی از بازی است - یاد بگیرید آن را بپذیرید',
        en: 'Loss is part of the game - learn to accept it'
      },
      content: {
        fa: `حتی بهترین تریدرها ۴۰ تا ۵۰ درصد معاملاتشان ضرر است. تفاوت آنها با تریدرهای ناموفق در این است که میدانند چگونه ضررهای کوچک را بپذیرند و از آنها یاد بگیرند.

وقتی معاملهای به حد ضرر میرسد، بدون تردید آن را ببندید. هرگز حد ضرر را جابهجا نکنید یا امیدوار نباشید که قیمت برمیگردد. این امید، حساب شما را خالی میکند.

ضرر یعنی بازار به شما گفت "این سناریو اشتباه بود" - گوش کنید و خارج شوید. یک ضرر ۲٪ میتواند با یک سود ۴٪ جبران شود، اما یک ضرر ۵۰٪ نیاز به سود ۱۰۰٪ دارد.`,
        en: `Even the best traders fail in 40-50% of their trades. The difference between them and unsuccessful ones is that they know how to take small losses gracefully and learn from them.

When a trade hits your stop loss, close it immediately without hesitation. Never move your stop loss or hope the price will reverse. Hope will blow your account.

A loss is just the market telling you "this scenario was wrong". Close it and prepare for the next opportunity. A 2% loss is easily recovered with a 4% profit, but a 50% loss requires a 100% gain to break even.`
      },
      quote: {
        fa: '"ضررهای کوچک، دانشگاه تریدینگ است."',
        en: '"Small losses are the tuition of trading."'
      }
    },
    {
      id: 4,
      icon: '⏳',
      lucideIcon: HelpCircle,
      color: '#fbbf24',
      title: {
        fa: 'صبر و شکیبایی',
        en: 'Patience & Waiting'
      },
      summary: {
        fa: 'بهترین معاملهها به کسانی که صبر دارند میرسد',
        en: 'The best trades find those who have patience to wait'
      },
      content: {
        fa: `تریدینگ ۹۰٪ منتظر ماندن و ۱۰٪ اجرا است. تریدرهای تازهکار فکر میکنند باید هر روز معامله کنند. اما حرفهایها میدانند که باید منتظر فرصت طلایی بمانند.

Setup ایدهآل چیست؟
- همه شاخصها در یک جهت
- حجم معاملات بالا
- ریسک به ریوارد حداقل ۱:۲
- تایید از چند تایمفریم
- سیگنال از استراتژی اصلی شما

اگر همه اینها را نداشتید، معامله نکنید. گاهی بهترین معامله، معامله نکردن است. سرمایه خود را حفظ کنید تا برای فرصت واقعی آماده باشید.`,
        en: `Trading is 90% waiting and 10% execution. Novices think they must trade every day. Professionals know that high probability trades require patience.

What is an ideal setup?
- All technical factors align in one direction
- Volume supports the trend
- Minimum 1:2 risk-to-reward ratio (R:R)
- Multiple timeframe confirmation
- Clear signal from your core strategy

If you don't have these, do not trade. Sometimes, cash is a valid position. Save your capital for real, premium opportunities.`
      },
      quote: {
        fa: '"بازار همیشه باز است - عجلهای نیست."',
        en: '"The market is always open - there is no rush."'
      }
    },
    {
      id: 5,
      icon: '📚',
      lucideIcon: Info,
      color: '#a855f7',
      title: {
        fa: 'یادگیری مداوم',
        en: 'Continuous Education'
      },
      summary: {
        fa: 'بازار تغییر میکند - شما هم باید تغییر کنید',
        en: 'The market evolves - and so must you'
      },
      content: {
        fa: `بازار مالی مثل یک موجود زنده است که دائماً در حال تکامل است. استراتژی که امسال کار میکند، ممکن است سال بعد کارایی نداشته باشد.

چطور یاد بگیریم؟
- هر روز حداقل ۳۰ دقیقه بازار را مطالعه کنید
- ژورنال معاملاتی دقیق نگه دارید
- هر هفته معاملات خود را بررسی کنید
- از اشتباهات یاد بگیرید، نه سرزنش کنید
- کتاب بخوانید، ویدیو ببینید، با تریدرهای دیگر صحبت کنید`,
        en: `Financial markets are dynamic systems that adapt constantly. A strategy that worked this year might not perform as well next year.

How to keep learning:
- Spend at least 30 minutes studying charts daily
- Maintain a meticulous trading journal
- Perform a weekly review of all recorded entries
- Learn objectively from mistakes instead of feeling guilt
- Read classic works, analyze charts, and discuss with professionals`
      },
      quote: {
        fa: '"سرمایهگذاری روی دانش، بهترین بازده را دارد."',
        en: '"An investment in knowledge pays the best interest."'
      }
    },
    {
      id: 6,
      icon: '🛡️',
      lucideIcon: ShieldAlert,
      color: '#06b6d4',
      title: {
        fa: 'مدیریت ریسک',
        en: 'Risk Management'
      },
      summary: {
        fa: 'حفظ سرمایه مهمتر از سود است',
        en: 'Preservation of capital is more critical than profits'
      },
      content: {
        fa: `قانون اول تریدینگ: پول خود را از دست ندهید. قانون دوم: قانون اول را فراموش نکنید.

فرمول طلایی مدیریت ریسک:
- هر معامله: حداکثر ۱ تا ۲ درصد کل سرمایه
- هر روز: حداکثر ۶ درصد ضرر - بعد از آن دستگاه را خاموش کنید
- اندازهگیری پوزیشن: بر اساس فاصله تا حد ضرر
- ریسک به ریوارد: حداقل ۱:۲ (اگر ۱۰۰ دلار ریسک میکنید، باید ۲۰۰ دلار سود بگیرید)`,
        en: `Rule number one of trading: Do not lose your money. Rule number two: Never forget rule number one.

The golden risk formulas:
- Per-trade risk: max 1-2% of overall capital
- Daily drawdown limit: max 6% — shut down the screen after hitting this
- Position sizing: adjust lots accurately based on SL distance
- Risk-Reward: minimum 1:2 (if risking $100, you must aim for $200+ profit)`
      },
      quote: {
        fa: '"تریدرهای حرفهای ریسک را مدیریت میکنند، نه سود را."',
        en: '"Professional traders manage risk, not profits."'
      }
    },
    {
      id: 7,
      icon: '🎲',
      lucideIcon: HelpCircle,
      color: '#ec4899',
      title: {
        fa: 'قبول ناپیوستگی نتایج',
        en: 'Probabilistic Thinking'
      },
      summary: {
        fa: 'تریدینگ یک بازی احتمالات است',
        en: 'Trading is a game of probability, not certainty'
      },
      content: {
        fa: `شما نمیتوانید پیشبینی کنید که کدام معامله سودآور است و کدام ضرر. تنها کاری که میتوانید بکنید این است که یک Edge یا مزیت آماری داشته باشید.

Edge یعنی چی؟
اگر استراتژی شما در ۶۰ معامله از ۱۰۰ معامله سود میدهد و ریسک/ریوارد شما ۱:۲ است، شما Edge دارید و در بلند مدت قطعا سودده هستید.`,
        en: `You cannot guarantee whether the next individual trade will win or lose. You can only control your statistical edge over a large sample of trades.

What is a statistical Edge?
If your strategy returns profit on 60 out of 100 entries with a 1:2 R:R ratio, you hold an active edge and will steadily capture profits mathematically over time.`
      },
      quote: {
        fa: '"در کوتاهمدت، هر اتفاقی ممکن است. در بلندمدت، احتمالات حکم میکنند."',
        en: '"In the short term, anything can happen. In the long term, probabilities rule."'
      }
    },
    {
      id: 8,
      icon: '🧘',
      lucideIcon: Brain,
      color: '#14b8a6',
      title: {
        fa: 'سلامت روان',
        en: 'Mental Well-being'
      },
      summary: {
        fa: 'ذهن سالم، معاملات سالم',
        en: 'Healthy mind, healthy trades'
      },
      content: {
        fa: `تریدینگ یکی از استرسزاترین مشاغل است. اگر سلامت روانی خود را حفظ نکنید، حتی با بهترین استراتژی هم شکست میخورید.

نشانههای خطر:
- استرس دائمی و اضطراب شدید
- چک کردن مداوم قیمتها در رختخواب یا حین کار
- نداشتن خواب آرام و با کیفیت
- تصمیمگیریهای انتقامی زودهنگام`,
        en: `Trading is highly stressful. If you do not look after your sleep, exercise, and breaks, you will eventually succumb to impulsive revenge trading.

Danger signals:
- Constant background stress and chronic anxiety
- Obsessively checking live charts in bed or during breaks
- Deteriorating sleep quality
- Impulsive and emotional revenge executions`
      },
      quote: {
        fa: '"بهترین معاملهها وقتی اتفاق میافتند که ذهن شما آرام است."',
        en: '"The best trades happen when your mind is perfectly still."'
      }
    }
  ];

  return (
    <div className="space-y-6 pb-20" dir={language === 'fa' ? 'rtl' : 'ltr'}>
      {/* HEADER SECTION */}
      <div>
        <h1 className="text-xl font-black text-white flex items-center gap-2">
          <Brain className="w-5 h-5 text-[#6f87a0]" />
          <span>{language === 'fa' ? 'روانشناسی تریدینگ' : 'Trading Psychology'}</span>
        </h1>
        <p className="text-xs text-slate-400 mt-1 flex flex-col gap-1">
          <span>
            {language === 'fa' 
              ? 'مهمترین مهارت برای موفقیت و بقا در بازارهای مالی' 
              : 'The absolute key factor of survival in financial markets'}
          </span>
          <span className="text-[10px] text-slate-500 font-semibold bg-white/2 py-1 px-2.5 rounded-lg border border-white/5 w-fit">
            {language === 'fa' 
              ? '📖 منبع: کتاب نوروتریدر (اثر دکتر بهزاد قربانی)' 
              : '📖 Source: NeuroTrader Book (Written by Dr. Behzad Ghorbani)'}
          </span>
        </p>
      </div>

      {/* RESPONSIVE LAYOUT CONTAINER */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* LEFT COLUMN: Why mind control is vital intro card */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* CORE INTRO INTRO CARD */}
          <div className="p-5 rounded-3xl glass-card border border-white/5 relative overflow-hidden space-y-4">
            <div className="absolute top-0 right-0 w-24 h-24 bg-[#6f87a0]/5 rounded-full blur-[30px] pointer-events-none" />
            
            <div>
              <h2 className="text-xs font-bold text-[#6f87a0] tracking-wider uppercase mb-2">
                {language === 'fa' ? '💡 چرا کنترل ذهن حیاتی است؟' : '💡 Why Is Mind Control Vital?'}
              </h2>
              <p className="text-xs text-slate-300 leading-relaxed">
                {language === 'fa' 
                  ? 'بیش از ۹۰٪ معامله‌گران شکست می‌خورند نه به خاطر نداشتن تحلیل یا ابزار، بلکه به خاطر عدم کنترل بر احساسات، هیجانات، و طمع. یک معامله‌گر دیسیپلین‌دار تحت هر شرایطی پیروز است.'
                  : 'Over 90% of retail traders fail not due to lack of technical analyzers, but lack of emotional mastery. A disciplined execution under strict guidance outweighs complex techniques.'}
              </p>
            </div>

            <div className="p-3 bg-white/2 rounded-2xl border border-white/5 text-center">
              <span className="text-xs font-black text-amber-300">
                {language === 'fa' 
                  ? '«تریدینگ ۱۰٪ استراتژی و ۹۰٪ روانشناسی است»' 
                  : '"Trading is 10% Strategy and 90% Psychology"'}
              </span>
            </div>

            <div className="pt-3.5 border-t border-white/5 flex gap-2 items-start">
              <Info className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
              <p className="text-[10px] text-slate-400 leading-relaxed">
                {language === 'fa' 
                  ? '✨ این مباحث روانشناسی و فرآیندهای یادگیری ذهن بر اساس کتاب ارزشمند «نوروتریدر» اثر آقای دکتر بهزاد قربانی تدوین شده‌اند که راهبری برجسته بر نوروساینس و ابعاد رفتاری بازارهای مالی است.' 
                  : '✨ These core mental guides and rules are cited from the masterwork "NeuroTrader" written by Dr. Behzad Ghorbani, an exceptional guide to neuroscience and behavioral aspects of professional trading.'}
              </p>
            </div>
          </div>

          </div>

        {/* RIGHT COLUMN: Interactive tips list & Golden checklist summary */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* TIPS ACCORDION LIST */}
          <div className="space-y-3">
        {psychologyTips.map((tip) => {
          const isExpanded = expandedTip === tip.id;
          const Icon = tip.lucideIcon;
          const isLocked = tip.id > 1 && !isVip;

          return (
            <div
              key={tip.id}
              onClick={() => {
                if (isLocked) {
                  setShowLockModal(true);
                } else {
                  setExpandedTip(isExpanded ? null : tip.id);
                }
              }}
              className={`p-4 rounded-3xl glass-card border transition-all duration-300 cursor-pointer ${
                isLocked
                  ? 'border-white/5 opacity-70 hover:opacity-100 hover:border-amber-500/20'
                  : isExpanded 
                    ? 'border-white/15 bg-white/5 shadow-md' 
                    : 'border-white/5 hover:border-white/10 hover:bg-white/3'
              }`}
            >
              <div className="flex items-start gap-3.5">
                <div 
                  className="w-10 h-10 rounded-2xl flex items-center justify-center text-lg shrink-0" 
                  style={{ backgroundColor: `${tip.color}15`, color: tip.color }}
                >
                  <Icon className="w-5 h-5" />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center">
                    <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wide flex items-center gap-1.5">
                      {language === 'fa' ? tip.title.fa : tip.title.en}
                    </h3>
                    
                    <div className="flex items-center gap-1.5 flex-row-reverse">
                      {isLocked ? (
                        <span className="text-[8.5px] font-bold text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-lg flex items-center gap-1 select-none animate-pulse">
                          <Lock className="w-2.5 h-2.5 text-amber-400 font-bold" />
                          <span>{language === 'fa' ? 'ویژهٔ VIP' : 'VIP ONLY'}</span>
                        </span>
                      ) : (
                        <span className={`text-[10px] text-slate-500 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}>
                          ▼
                        </span>
                      )}
                    </div>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-1">
                    {language === 'fa' ? tip.summary.fa : tip.summary.en}
                  </p>

                  <AnimatePresence initial={false}>
                    {isExpanded && !isLocked && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.28, ease: 'easeOut' }}
                        className="overflow-hidden"
                      >
                        <div className="pt-4 mt-3 border-t border-white/5 space-y-4">
                          <p className="text-[11.5px] text-slate-300 leading-relaxed whitespace-pre-line">
                            {language === 'fa' ? tip.content.fa : tip.content.en}
                          </p>
                          
                          <div 
                            className="p-3.5 rounded-2xl text-[11px] font-medium leading-relaxed border-l-2"
                            style={{ 
                              backgroundColor: `${tip.color}10`, 
                              borderColor: tip.color,
                              color: tip.color,
                              borderLeftWidth: language === 'fa' ? '0px' : '2px',
                              borderRightWidth: language === 'fa' ? '2px' : '0px',
                            }}
                          >
                            {language === 'fa' ? tip.quote.fa : tip.quote.en}
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* FINAL CHECKLIST SUMMARY */}
      <div className="p-5 rounded-3xl glass-card border border-white/5 bg-gradient-to-tr from-white/2 to-transparent space-y-3">
        <h3 className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
          <CheckCircle2 className="w-3.5 h-3.5 text-amber-300" />
          <span>{language === 'fa' ? 'خلاصه طلایی دیسیپلین تریدر' : 'Ultimate Trader Checklist'}</span>
        </h3>
        
        <ul className="space-y-2 text-[11px] text-slate-300">
          <li className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 bg-[#6f87a0] rounded-full shrink-0" />
            <span>{language === 'fa' ? 'احساسات را کنترل کنید - نه اینکه آن‌ها شما را کنترل کنند' : 'Take full control of your emotions - keep ego out'}</span>
          </li>
          <li className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 bg-[#6f87a0] rounded-full shrink-0" />
            <span>{language === 'fa' ? 'به پلن معاملاتی خود پایبند بمانید' : 'Stick to your preset plans with clockwork consistency'}</span>
          </li>
          <li className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 bg-[#6f87a0] rounded-full shrink-0" />
            <span>{language === 'fa' ? 'ضرر را کوچک بپذیرید و از آن یاد بگیرید' : 'Accept small losses without dynamic stop-loss dragging'}</span>
          </li>
          <li className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 bg-[#6f87a0] rounded-full shrink-0" />
            <span>{language === 'fa' ? 'صبور بمانید و دنبال فرصتهای طلایی باشید' : 'Be exceptionally patient - wait for optimum high-probability setups'}</span>
          </li>
          <li className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 bg-[#6f87a0] rounded-full shrink-0" />
            <span>{language === 'fa' ? 'ریسک دیسیپلین را مدیریت کنید (۱٪ تا ۲٪ در هر معامله)' : 'Manage your sizing accurately (never risk over 1% to 2% per run)'}</span>
          </li>
        </ul>
      </div>

         {/* GOOGLE PLAY BILLING SIMULATOR / PREMIUM LOCK WARNING MODAL */}
         <AnimatePresence>
           {showLockModal && (
             <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 transition-all duration-300 font-sans">
               <motion.div 
                 initial={{ scale: 0.95, opacity: 0 }}
                 animate={{ scale: 1, opacity: 1 }}
                 exit={{ scale: 0.95, opacity: 0 }}
                 className="bg-[#1c1c1e] text-white w-full max-w-sm rounded-3xl border border-amber-500/15 overflow-hidden shadow-2xl p-6 space-y-4"
               >
                 <div className="flex flex-col items-center text-center space-y-3">
                   <div className="p-3 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-full animate-pulse">
                     <Lock className="w-6 h-6 text-amber-400" />
                   </div>
                   <div className="space-y-1.5">
                     <h3 className="text-sm font-black text-amber-400 flex items-center gap-1.5 justify-center uppercase tracking-wider">
                       <Sparkles className="w-4 h-4 text-amber-450 animate-pulse" />
                       <span>{language === 'fa' ? 'عضویت طلایی اونیگاما (VIP)' : 'Onigama VIP Premium'}</span>
                     </h3>
                     <p className="text-xs text-slate-300 leading-relaxed font-sans font-medium">
                       {language === 'fa' 
                         ? 'بررسی تکنیک‌های پیشرفته بهبود ذهن (انضباط، روانشناسی پذیرش ضرر، یادگیری پایدار و سلامت روان تریدر) مخصوص اعضای طلایی اونیگاما است. با فعال‌سازی لایسنس آزمایشی در تنظیمات، فوراً کل برنامه را فعال کنید!'
                         : 'Advanced psychological blueprints and emotional mastery analysis are exclusive to VIP members.'}
                     </p>
                     <p className="text-[10px] text-slate-500 font-sans font-semibold">
                       {language === 'fa'
                         ? '💡 لایسنس‌های آزمایشی کاملاً رایگان در صفحه «تنظیمات» درج شده است.'
                         : '💡 Free test licenses are accessible on the "Settings" tab.'}
                     </p>
                   </div>
                 </div>

                 <div className="flex flex-col gap-2 pt-2">
                   {onNavigate && (
                     <button
                       onClick={() => {
                         setShowLockModal(false);
                         onNavigate('settings');
                       }}
                       className="py-2.5 px-4 bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-400 hover:to-yellow-500 text-slate-950 font-black rounded-xl text-xs transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-md active:scale-95"
                     >
                       <span>{language === 'fa' ? '🔑 رفتن به فعال‌سازی لایسنس' : '🔑 Grab Activation Key'}</span>
                     </button>
                   )}
                   <button
                     onClick={() => setShowLockModal(false)}
                     className="py-2 px-4 bg-white/5 hover:bg-white/10 text-slate-300 font-bold rounded-xl text-xs transition-all cursor-pointer text-center"
                   >
                     {language === 'fa' ? 'بستن' : 'Dismiss'}
                   </button>
                 </div>
               </motion.div>
             </div>
           )}
         </AnimatePresence>

        </div>
      </div>

    </div>
  );
}
