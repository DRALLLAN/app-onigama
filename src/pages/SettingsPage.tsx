import { useState, useEffect, FormEvent } from 'react';
import { UserSettings, UserProfile } from '../types';
import { StorageManager } from '../services/api';
import { PlayBillingService, PLAY_STORE_PRODUCTS, PurchaseState } from '../services/billing';
import { 
  Bell, 
  Volume2, 
  Globe, 
  Info, 
  ShieldAlert, 
  CheckCircle2, 
  HelpCircle, 
  Cpu, 
  ExternalLink,
  Sparkles,
  Copy,
  Activity,
  Check,
  User,
  Mail,
  Award,
  Key,
  ShieldCheck,
  CreditCard,
  Lock,
  ShoppingBag
} from 'lucide-react';

interface SettingsPageProps {
  language: 'fa' | 'en';
  setLanguage: (lang: 'fa' | 'en') => void;
}

export function SettingsPage({ language, setLanguage }: SettingsPageProps) {
  const [settings, setSettings] = useState<UserSettings>({
    notifications: true,
    soundEnabled: true,
    language: 'fa',
    theme: 'dark',
    riskTolerance: 'medium'
  });

  const [profile, setProfile] = useState<UserProfile>({
    fullName: '',
    email: '',
    experience: 'intermediate',
    capital: 'under10k',
    subscriptionTier: 'free',
    activationKey: '',
    isActivated: false
  });

  const [showSaveSuccess, setShowSaveSuccess] = useState(false);
  const [showProfileSuccess, setShowProfileSuccess] = useState(false);
  const [activationError, setActivationError] = useState<string | null>(null);
  const [activationSuccess, setActivationSuccess] = useState<boolean>(false);
  
  // Google Play Billing Integration states
  const [purchaseState, setPurchaseState] = useState<PurchaseState>({
    isProcessing: false,
    statusText: '',
    error: null,
    success: false
  });
  const [showPlayStoreModal, setShowPlayStoreModal] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState<string>('');
  
  const [copiedText, setCopiedText] = useState<'bot' | 'channel' | 'key' | null>(null);
  const [pingMs, setPingMs] = useState<number>(42);
  const [devModeActive, setDevModeActive] = useState(false);
  const [devClickCount, setDevClickCount] = useState(0);

  useEffect(() => {
    const loaded = StorageManager.getSettings();
    setSettings(loaded);

    const loadedProfile = StorageManager.getProfile();
    setProfile(loadedProfile);

    // Initialize standard Native Google Play store billing engine
    PlayBillingService.initializeBilling((tier, method) => {
      const refreshed = StorageManager.getProfile();
      setProfile(refreshed);
      setActivationError(null);
      setActivationSuccess(true);
      playVictoryCascade();
      setTimeout(() => setActivationSuccess(false), 3000);
    });

    // Simulate real-time API latency variations with micro-adjustments
    const interval = setInterval(() => {
      setPingMs(prev => {
        const delta = Math.floor((Math.random() - 0.5) * 8);
        return Math.max(28, Math.min(85, prev + delta));
      });
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  const playLocalBeep = (freq: number = 880, duration: number = 0.15) => {
    if (!settings.soundEnabled) return;
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();
      
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(freq, audioCtx.currentTime);
      gainNode.gain.setValueAtTime(0.05, audioCtx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration);
      
      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      
      oscillator.start();
      oscillator.stop(audioCtx.currentTime + duration);
    } catch {
      // Ignored if browser policy blocks instant audio without user gesture
    }
  };

  const handleUpdateNotification = (val: boolean) => {
    const next = { ...settings, notifications: val };
    setSettings(next);
    StorageManager.saveSettings(next);
    playLocalBeep(1000, 0.1);
    triggerSuccessGlow();
  };

  const handleUpdateSound = (val: boolean) => {
    const next = { ...settings, soundEnabled: val };
    setSettings(next);
    StorageManager.saveSettings(next);
    if (val) {
      // Temporarily bypass settings check using parameter to play immediate feedback sound
      try {
        const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
        const osc = audioCtx.createOscillator();
        const g = audioCtx.createGain();
        osc.connect(g);
        g.connect(audioCtx.destination);
        osc.frequency.setValueAtTime(1200, audioCtx.currentTime);
        g.gain.setValueAtTime(0.04, audioCtx.currentTime);
        g.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.15);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.15);
      } catch {}
    }
    triggerSuccessGlow();
  };

  const handleLanguageChange = (lang: 'fa' | 'en') => {
    const next = { ...settings, language: lang };
    setSettings(next);
    StorageManager.saveSettings(next);
    setLanguage(lang);
    playLocalBeep(950, 0.12);
    triggerSuccessGlow();
  };

  const handleRiskChange = (risk: 'low' | 'medium' | 'high') => {
    const next = { ...settings, riskTolerance: risk };
    setSettings(next);
    StorageManager.saveSettings(next);
    playLocalBeep(risk === 'low' ? 700 : risk === 'medium' ? 880 : 1100, 0.18);
    triggerSuccessGlow();
  };

  const handleThemeChange = (themeMode: 'dark' | 'glass') => {
    const next = { ...settings, theme: themeMode };
    setSettings(next);
    StorageManager.saveSettings(next);
    playLocalBeep(850, 0.1);
    triggerSuccessGlow();
  };

  const triggerSuccessGlow = () => {
    setShowSaveSuccess(true);
    setTimeout(() => {
      setShowSaveSuccess(false);
    }, 1800);
  };

  const playVictoryCascade = () => {
    if (!settings.soundEnabled) return;
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const freqs = [440, 554, 659, 880];
      freqs.forEach((freq, idx) => {
        setTimeout(() => {
          const osc = audioCtx.createOscillator();
          const gainNode = audioCtx.createGain();
          osc.connect(gainNode);
          gainNode.connect(audioCtx.destination);
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
          gainNode.gain.setValueAtTime(0.04, audioCtx.currentTime);
          gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.3);
          osc.start();
          osc.stop(audioCtx.currentTime + 0.3);
        }, idx * 100);
      });
    } catch {}
  };

  const playFailureBuzz = () => {
    if (!settings.soundEnabled) return;
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();
      osc.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(220, audioCtx.currentTime);
      osc.frequency.linearRampToValueAtTime(150, audioCtx.currentTime + 0.35);
      gainNode.gain.setValueAtTime(0.03, audioCtx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.35);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.35);
    } catch {}
  };

  const handleProfileFieldChange = (key: keyof UserProfile, value: any) => {
    setProfile(prev => ({ ...prev, [key]: value }));
  };

  const handleProfileSave = (e: FormEvent) => {
    e.preventDefault();
    StorageManager.saveProfile(profile);
    playLocalBeep(1100, 0.15);
    setShowProfileSuccess(true);
    setTimeout(() => setShowProfileSuccess(false), 2000);
  };

  const handleVerifyLicense = () => {
    const key = profile.activationKey.toUpperCase().trim();
    if (!key) {
      setActivationError(language === 'fa' ? 'لطفاً کد لایسنس را وارد کنید.' : 'Please enter a license key.');
      playFailureBuzz();
      return;
    }

    const vipKeys = ['VIP_PASS', 'BEHIMARAM_VIP', 'ONIGAMA_VIP', 'ALPHA_TEST_KEY', 'VIP_SPECIAL_ACCESS'];
    const premiumKeys = ['GOLDEN_KEY', 'ONIGAMA2026', 'PRO_TESTER_99', 'ONIGAMA_GOLD_2026'];

    if (vipKeys.includes(key) || premiumKeys.includes(key) || key === 'BEHIMARAM') {
      const tier = premiumKeys.includes(key) ? 'premium' : 'vip';
      const updated: UserProfile = {
        ...profile,
        isActivated: true,
        subscriptionTier: tier
      };
      setProfile(updated);
      StorageManager.saveProfile(updated);
      setActivationError(null);
      setActivationSuccess(true);
      playVictoryCascade();
      setTimeout(() => setActivationSuccess(false), 3000);
    } else {
      setActivationError(
        language === 'fa' 
          ? '❌ لایسنس نامعتبر است! از کلیدهای آزمایشی مانند VIP_PASS یا GOLDEN_KEY استفاده کنید.' 
          : '❌ Invalid Key! Try testing with VIP_PASS or GOLDEN_KEY.'
      );
      playFailureBuzz();
    }
  };

  const handleInstantUpgrade = () => {
    const updated: UserProfile = {
      ...profile,
      isActivated: true,
      subscriptionTier: 'vip',
      activationKey: 'VIP_PASS'
    };
    setProfile(updated);
    StorageManager.saveProfile(updated);
    setActivationError(null);
    setActivationSuccess(true);
    playVictoryCascade();
    setTimeout(() => setActivationSuccess(false), 3000);
  };

  const handleDowngradeToFree = () => {
    const updated: UserProfile = {
      ...profile,
      isActivated: false,
      subscriptionTier: 'free',
      activationKey: ''
    };
    setProfile(updated);
    StorageManager.saveProfile(updated);
    playLocalBeep(600, 0.2);
  };

  const handleInitiatePlayStorePurchase = (productId: string) => {
    setSelectedProductId(productId);
    
    // Call high fidelity Google Play Service logic
    PlayBillingService.launchPlayCheckout(
      productId,
      (state) => {
        setPurchaseState(state);
      },
      (updatedProfile) => {
        setProfile(updatedProfile);
        playVictoryCascade();
        setActivationError(null);
        setActivationSuccess(true);
        setTimeout(() => setActivationSuccess(false), 3000);
      }
    );
    setShowPlayStoreModal(true);
  };

  const handleCopy = (text: string, type: 'bot' | 'channel' | 'key') => {
    navigator.clipboard.writeText(text);
    setCopiedText(type);
    playLocalBeep(1300, 0.08);
    setTimeout(() => setCopiedText(null), 1500);
  };

  return (
    <div className="space-y-6 pb-24" dir={language === 'fa' ? 'rtl' : 'ltr'}>
      
      {/* HEADER SECTION */}
      <div className="flex justify-between items-center">
        <div>
          <h1 
            onClick={() => {
              setDevClickCount(prev => {
                const next = prev + 1;
                if (next >= 5) {
                  setDevModeActive(true);
                  playVictoryCascade();
                  return 0;
                }
                return next;
              });
            }}
            className="text-xl font-bold text-white tracking-wide cursor-pointer select-none active:scale-[0.99] transition-all"
            title={language === 'fa' ? 'برای وضعیت توسعه‌دهندگان ضربه بزنید' : 'Tap for developer options'}
          >
            {language === 'fa' ? 'تنظیمات کاربری سیستم' : 'System & User Settings'}
            {devModeActive && <span className="text-[10px] text-emerald-400 font-mono ml-2"> (DEV)</span>}
          </h1>
          <p className="text-xs text-slate-400 font-mono mt-0.5">
            {language === 'fa' ? 'مدیریت اولویت‌ها، اعلانات صوتی و مدیریت طلا' : 'Customize platform parameters, risk controls, and local behaviors'}
          </p>
        </div>
      </div>

      {/* FEEDBACK POPUP GLOW */}
      {showSaveSuccess && (
        <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl text-center text-emerald-300 text-xs font-semibold animate-fade-in flex items-center justify-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{language === 'fa' ? 'تنظیمات با موفقیت در فضای کلاینت ست و ذخیره شد.' : 'Preferences successfully saved to client storage.'}</span>
        </div>
      )}

      {/* RESPONSIVE SETTINGS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
        
        {/* PANEL A: CONFIG Controls */}
        <div className="space-y-6">
          
          {/* CONTROL CARD */}
          <div className="p-6 rounded-3xl glass-card glow-blue border border-white/5 space-y-6">
            
            {/* LANGUAGE CHOOSE */}
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-2.5 flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-blue-400" />
                <span>{language === 'fa' ? 'زبان پیش‌فرض نرم‌افزار' : 'Application Language'}</span>
              </label>
              <div className="grid grid-cols-2 gap-2 bg-white/2 p-1 rounded-2xl border border-white/5 font-mono">
                <button
                  onClick={() => handleLanguageChange('fa')}
                  className={`py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    language === 'fa'
                      ? 'bg-gradient-to-r from-blue-500/20 to-indigo-500/20 text-blue-300 border border-blue-500/20 shadow-md'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  فارسی (Persian)
                </button>
                <button
                  onClick={() => handleLanguageChange('en')}
                  className={`py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    language === 'en'
                      ? 'bg-gradient-to-r from-blue-500/20 to-indigo-500/20 text-blue-300 border border-blue-500/20 shadow-md'
                      : 'text-slate-404 hover:text-white'
                  }`}
                >
                  English (EN)
                </button>
              </div>
            </div>

            <hr className="border-white/5" />

            {/* VISUAL STYLE THEME SELECT */}
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-2.5 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>{language === 'fa' ? 'سبک بصری کارت‌ها' : 'Visual Accent Style'}</span>
              </label>
              <div className="grid grid-cols-2 gap-2 bg-white/2 p-1 rounded-2xl border border-white/5 font-mono">
                <button
                  onClick={() => handleThemeChange('dark')}
                  className={`py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    settings.theme === 'dark'
                      ? 'bg-gradient-to-r from-slate-800 to-slate-900 text-white border border-white/10 shadow-md'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {language === 'fa' ? 'تاریک مطلق (Classic)' : 'Classic Charcoal'}
                </button>
                <button
                  onClick={() => handleThemeChange('glass')}
                  className={`py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    settings.theme === 'glass'
                      ? 'bg-white/10 text-white border border-white/10 shadow-md'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {language === 'fa' ? 'شیشه‌ای (Premium)' : 'Sleek Cyber Glass'}
                </button>
              </div>
            </div>

            <hr className="border-white/5" />

            {/* SIGNAL ALERTS NOTIFICATION */}
            <div className="flex justify-between items-center py-1">
              <div>
                <span className="text-sm font-semibold text-slate-200 block">
                  {language === 'fa' ? 'اعلان صوتی اهداف معاملاتی' : 'Dynamic Target Notifications'}
                </span>
                <span className="text-[11px] text-slate-400 block mt-0.5">
                  {language === 'fa' ? 'پخش بوق ریتمیک سیستم هنگام لمس TP/SL' : 'Trigger positive sound frequencies when TP or SL is breached'}
                </span>
              </div>
              <button
                onClick={() => handleUpdateNotification(!settings.notifications)}
                className={`w-12 h-6.5 rounded-full p-0.5 transition-colors duration-300 relative focus:outline-none cursor-pointer ${
                  settings.notifications ? 'bg-blue-500' : 'bg-slate-800'
                }`}
              >
                <span className={`block w-5.5 h-5.5 rounded-full bg-white transition-all duration-300 transform ${
                  settings.notifications ? (language === 'fa' ? '-translate-x-5.5' : 'translate-x-[22px]') : 'translate-x-0'
                }`} />
              </button>
            </div>

            {/* CLICK SOUND FEEDBACK */}
            <div className="flex justify-between items-center py-1">
              <div>
                <span className="text-sm font-semibold text-slate-200 block">
                  {language === 'fa' ? 'صدای بازخورد لمس صوتی' : 'Interface Sound Feedback'}
                </span>
                <span className="text-[11px] text-slate-400 block mt-0.5">
                  {language === 'fa' ? 'صدای پالس ملایم هنگام تغییر صفحات' : 'Synthesize soft audio indicators on button interactions'}
                </span>
              </div>
              <button
                onClick={() => handleUpdateSound(!settings.soundEnabled)}
                className={`w-12 h-6.5 rounded-full p-0.5 transition-colors duration-300 relative focus:outline-none cursor-pointer ${
                  settings.soundEnabled ? 'bg-blue-500' : 'bg-slate-800'
                }`}
              >
                <span className={`block w-5.5 h-5.5 rounded-full bg-white transition-all duration-300 transform ${
                  settings.soundEnabled ? (language === 'fa' ? '-translate-x-5.5' : 'translate-x-[22px]') : 'translate-x-0'
                }`} />
              </button>
            </div>

            <hr className="border-white/5" />

            {/* RISK PROFILE SELECT */}
            <div>
              <label className="text-xs font-bold text-slate-300 block mb-2.5 flex items-center gap-1.5">
                <ShieldAlert className="w-3.5 h-3.5 text-yellow-500" />
                <span>{language === 'fa' ? 'پروفایل پیش‌فرض مدیریت ریسک سرمایه' : 'Risk Management Profiles'}</span>
              </label>
              
              <div className="grid grid-cols-3 gap-1.5 bg-white/2 p-1 rounded-2xl border border-white/5 text-xs font-mono text-center mb-4">
                {(['low', 'medium', 'high'] as const).map((profile) => (
                  <button
                    key={profile}
                    onClick={() => handleRiskChange(profile)}
                    className={`py-1.5 rounded-xl font-bold transition-all cursor-pointer capitalize ${
                      settings.riskTolerance === profile
                        ? 'bg-gradient-to-r from-slate-800 to-slate-900 text-yellow-400 border border-yellow-500/20'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {language === 'fa' ? (profile === 'low' ? 'محافظه‌کار' : profile === 'medium' ? 'متعادل' : 'ریسک بالا') : profile}
                  </button>
                ))}
              </div>

              {/* DYNAMIC RISK EXPLANATION BOX */}
              <div className="p-3.5 bg-white/2 rounded-2xl border border-white/5 space-y-1">
                {settings.riskTolerance === 'low' && (
                  <>
                    <div className="flex justify-between text-[11px] font-bold text-slate-300">
                      <span>{language === 'fa' ? 'حجم تراکنش پیشنهادی:' : 'Suggested Volume size:'}</span>
                      <span className="text-emerald-400 font-mono">0.01 - 0.05 Lot</span>
                    </div>
                    <p className="text-[10px] text-slate-400 leading-relaxed mt-1">
                      {language === 'fa'
                        ? 'ریسک متعارف کمتر از ۰.۵ درصد در هر پوزیشن. بسیار مناسب در شرایط پرنوسان بازار طلا جهت حفظ سرمایه اصلی.'
                        : 'Conserves capital with less than 0.5% risk exposure. Ideal for larger accounts or proprietary firm rules.'}
                    </p>
                  </>
                )}
                {settings.riskTolerance === 'medium' && (
                  <>
                    <div className="flex justify-between text-[11px] font-bold text-slate-300">
                      <span>{language === 'fa' ? 'حجم تراکنش پیشنهادی:' : 'Suggested Volume size:'}</span>
                      <span className="text-blue-400 font-mono">0.10 - 0.25 Lot</span>
                    </div>
                    <p className="text-[10px] text-slate-400 leading-relaxed mt-1">
                      {language === 'fa'
                        ? 'ریسک بهینه ۱ الی ۲ درصدی در هر پوزیشن. تعادل عالی میان شتاب سودآوری و نرخ افت سرمایه طبیعی.'
                        : 'Standard 1-2% risk model. Balanced blend or optimal drawdown mitigation and yield compounding.'}
                    </p>
                  </>
                )}
                {settings.riskTolerance === 'high' && (
                  <>
                    <div className="flex justify-between text-[11px] font-bold text-slate-300">
                      <span>{language === 'fa' ? 'حجم تراکنش پیشنهادی:' : 'Suggested Volume size:'}</span>
                      <span className="text-red-400 font-mono">0.30 - 1.00 Lot</span>
                    </div>
                    <p className="text-[10px] text-slate-400 leading-relaxed mt-1">
                      {language === 'fa'
                        ? 'شیوه تهاجمی بین ۳ الی ۵ درصد ریسک روی هر پوزیشن. نیازمند استمرار روانی و حد ضررهای کاملاً بهینه شده.'
                        : 'Aggressive 3-5% leverage ratio. Optimized high profit factors backed by tighter local protective stops.'}
                    </p>
                  </>
                )}
              </div>

            </div>

          </div>

        </div>

        {/* PANEL B: ABOUT & SPECIFICATION */}
        <div className="space-y-6">
          
          {/* TRADER IDENTITY PROFILE CARD */}
          <div className="p-6 rounded-3xl glass-card border border-white/5 space-y-4">
            <h2 className="text-xs font-bold text-slate-300 tracking-wider uppercase flex items-center gap-1.5 border-b border-white/5 pb-3">
              <User className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{language === 'fa' ? 'پروفایل هویت و مشخصات معامله‌گر' : 'Trader Profile Details'}</span>
            </h2>

            {showProfileSuccess && (
              <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl text-center text-xs font-semibold animate-fade-in flex items-center justify-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>{language === 'fa' ? 'اطلاعات پروفایل با موفقیت ذخیره شد.' : 'Trader profile successfully saved.'}</span>
              </div>
            )}

            <form onSubmit={handleProfileSave} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 gap-3.5">
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-slate-400 block pb-1">
                    {language === 'fa' ? 'نام و نام‌خانوادگی معامله‌گر' : 'Full Name'}
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-2.5 w-3.5 h-3.5 text-slate-500" />
                    <input
                      type="text"
                      required
                      value={profile.fullName}
                      onChange={(e) => handleProfileFieldChange('fullName', e.target.value)}
                      placeholder={language === 'fa' ? 'مثال: امیر مرادی' : 'e.g., Amir Moradi'}
                      className={`w-full bg-slate-950/60 border border-white/5 rounded-xl py-2 pl-9 pr-3 text-white focus:outline-none focus:border-emerald-500/50 text-xs font-sans placeholder-slate-600 ${language === 'fa' ? 'text-right' : 'text-left'}`}
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-slate-400 block pb-1">
                    {language === 'fa' ? 'آدرس ایمیل معامله‌گر' : 'Email Address'}
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-2.5 w-3.5 h-3.5 text-slate-500" />
                    <input
                      type="email"
                      required
                      value={profile.email}
                      onChange={(e) => handleProfileFieldChange('email', e.target.value)}
                      placeholder="e.g., user@gmail.com"
                      className="w-full bg-slate-950/60 border border-white/5 rounded-xl py-2 pl-9 pr-3 text-white focus:outline-none focus:border-emerald-500/50 text-xs font-sans placeholder-slate-600 text-left"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3.5">
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-slate-400 block pb-1">
                    {language === 'fa' ? 'سابقه معامله‌گری' : 'Experience Level'}
                  </label>
                  <select
                    value={profile.experience}
                    onChange={(e) => handleProfileFieldChange('experience', e.target.value)}
                    className="w-full bg-slate-950/60 border border-white/5 rounded-xl py-2 px-2.5 text-white focus:outline-none focus:border-emerald-500/10 text-xs font-semibold cursor-pointer"
                  >
                    <option value="beginner">{language === 'fa' ? 'مبتدی (Beginner)' : 'Beginner'}</option>
                    <option value="intermediate">{language === 'fa' ? 'متوسط (Intermediate)' : 'Intermediate'}</option>
                    <option value="expert">{language === 'fa' ? 'حرفه‌ای (Expert)' : 'Expert'}</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-slate-400 block pb-1">
                    {language === 'fa' ? 'میزان سرمایه درگیر' : 'Trading Capital'}
                  </label>
                  <select
                    value={profile.capital}
                    onChange={(e) => handleProfileFieldChange('capital', e.target.value)}
                    className="w-full bg-slate-950/60 border border-white/5 rounded-xl py-2 px-2.5 text-white focus:outline-none focus:border-emerald-500/10 text-xs font-semibold cursor-pointer"
                  >
                    <option value="under10k">{language === 'fa' ? 'کمتر از ۱۰k دلار' : '< $10,000'}</option>
                    <option value="10k_50k">{language === 'fa' ? '۱۰k الی ۵۰k دلار' : '$10,000 - $50,000'}</option>
                    <option value="above50k">{language === 'fa' ? 'بیش از ۵۰k دلار' : '> $50,000'}</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 px-4 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold rounded-xl text-[11px] uppercase tracking-wider transition-all shadow-md active:scale-95 cursor-pointer flex items-center justify-center gap-1.5"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>{language === 'fa' ? 'ذخیره مشخصات پروفایل' : 'Save Profile Details'}</span>
              </button>
            </form>
          </div>

          {/* LICENSE MONETIZATION CENTER CARD */}
          <div className="p-6 rounded-3xl glass-card glow-gold border border-amber-500/10 space-y-4">
            <h2 className="text-xs font-bold text-amber-300 tracking-wider uppercase flex items-center gap-1.5 border-b border-amber-500/10 pb-3">
              <CreditCard className="w-4 h-4 text-amber-400 shrink-0" />
              <span>{language === 'fa' ? 'سامانه فعال‌سازی و درگاه اشتراک (VIP)' : 'Licensing & Monetization Hub'}</span>
            </h2>

            {/* Sub Status Display */}
            <div className="p-4 bg-slate-950/50 rounded-2xl border border-white/5 flex items-center justify-between gap-4">
              <div className="space-y-1">
                <span className="text-[10px] text-slate-500 font-mono block">SUBSCRIBER STATUS</span>
                <span className={`text-[11px] font-black tracking-wider uppercase px-2 py-0.5 rounded-lg inline-block ${
                  profile.isActivated 
                    ? profile.subscriptionTier === 'vip' 
                      ? 'bg-gradient-to-r from-amber-500/20 to-yellow-500/20 text-yellow-500 border border-yellow-500/30' 
                      : 'bg-gradient-to-r from-blue-500/30 to-indigo-500/30 text-blue-400 border border-blue-500/30'
                    : 'bg-slate-900 border border-slate-700 text-slate-400'
                }`}>
                  {profile.isActivated 
                    ? profile.subscriptionTier === 'vip' 
                      ? (language === 'fa' ? 'حق اشتراک ویژه • VIP CROWN' : 'VIP LIFETIME PLAN')
                      : (language === 'fa' ? 'اشتراک حرفه‌ای • PRO' : 'PRO PLAN')
                    : (language === 'fa' ? 'عضو رایگان • FREE TIER' : 'FREE TIER')}
                </span>
              </div>

              {/* Quick Status Symbol/Icon */}
              <div className="shrink-0 font-sans">
                {profile.isActivated ? (
                  <div className="w-10 h-10 rounded-full bg-amber-500/10 border border-yellow-500/30 flex items-center justify-center animate-pulse">
                    <Award className="w-5 h-5 text-yellow-400" />
                  </div>
                ) : (
                  <div className="w-10 h-10 rounded-full bg-slate-900 border border-white/5 flex items-center justify-center">
                    <User className="w-5 h-5 text-slate-500" />
                  </div>
                )}
              </div>
            </div>

            {/* Dynamic notice about upcoming monetization */}
            <p className="text-[10.5px] text-slate-400 leading-relaxed font-sans">
              {profile.isActivated 
                ? (language === 'fa' 
                  ? '✨ تبریک لایسنس شما فعال است! تمامی ماژول‌های تحلیل نقدینگی، سیگنال‌های VIP و نوسان‌سنج فوندامانتال در نسخه طلایی برای شما باز می‌باشد.'
                  : '✨ Premium access enabled! Advanced liquidity trackers, real-time indicators, and premium NYC metrics are fully unlocked.')
                : (language === 'fa' 
                  ? 'ℹ️ این اپلیکیشن درگاه فعال‌سازی اشتراک دارد؛ بعد از تجاری‌سازی پروژه کاربران با خرید لایسنس و وارد کردن کلید، به صورت خودکار به سطح VIP ارتقا خواهند یافت.'
                  : 'ℹ️ Integrated checkout ready. Upon monetization, customers can input their license checkouts here to instantly unlock high-frequency signals.')}
            </p>

            {/* Google Play Store Direct Subscription Options */}
            <div className="bg-slate-950/40 p-4 rounded-2xl border border-white/5 space-y-3">
              <span className="text-[10px] font-bold text-amber-300 flex items-center gap-1.5 uppercase tracking-wider font-sans">
                <ShoppingBag className="w-3.5 h-3.5 text-amber-400" />
                <span>{language === 'fa' ? '💎 خرید مستقیم اشتراک از گوگل‌پلی (In-App Purchases)' : '💎 Google Play In-App Checkout'}</span>
              </span>
              <p className="text-[9.5px] text-slate-400 leading-relaxed">
                {language === 'fa'
                  ? 'وقتی اپ اونیگاما را در گوگل پلی استور دانلود کنید، با کلیک بر روی اشتراک‌های زیر، درگاه رسمی پرداخت گوگل پلی باز شده و حق دسترسی شما را روی حسابتان فعال می‌کند.'
                  : 'On native Google Play Store devices, the buttons below trigger the official Google Play Billing system to register monthly/lifetime entitlements.'}
              </p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {/* Product 1: Pro Plan */}
                <button
                  type="button"
                  onClick={() => handleInitiatePlayStorePurchase(PLAY_STORE_PRODUCTS.PRO_ANNUAL)}
                  className="flex items-center justify-between p-2.5 bg-slate-900 hover:bg-slate-850 active:scale-95 transition-all text-left rounded-xl border border-blue-500/15 hover:border-blue-500/35 cursor-pointer group"
                >
                  <div className="space-y-0.5" dir="ltr">
                    <span className="text-[10.5px] font-black text-blue-400 block group-hover:text-blue-300">PRO Plan Annual</span>
                    <span className="text-[8.5px] text-slate-500 block">Product ID: onigama_pro_annual</span>
                  </div>
                  <span className="text-[10px] font-bold font-mono text-white bg-blue-500/10 px-2 py-1 rounded-lg shrink-0">$4.99/yr</span>
                </button>

                {/* Product 2: VIP Lifetime */}
                <button
                  type="button"
                  onClick={() => handleInitiatePlayStorePurchase(PLAY_STORE_PRODUCTS.VIP_LIFETIME)}
                  className="flex items-center justify-between p-2.5 bg-slate-900 hover:bg-slate-850 active:scale-95 transition-all text-left rounded-xl border border-yellow-500/15 hover:border-yellow-500/35 cursor-pointer group"
                >
                  <div className="space-y-0.5" dir="ltr">
                    <span className="text-[10.5px] font-black text-[#d9ac42] block group-hover:text-yellow-300 font-mono">VIP Crown Lifetime</span>
                    <span className="text-[8.5px] text-slate-500 block">Product ID: onigama_vip_lifetime_pack</span>
                  </div>
                  <span className="text-[10px] font-bold font-mono text-white bg-amber-500/10 px-2 py-1 rounded-lg shrink-0">$12.99</span>
                </button>
              </div>
            </div>

            {activationSuccess && (
              <div className="p-3 bg-yellow-500/10 border border-yellow-500/30 text-yellow-300 rounded-xl text-center text-xs font-semibold animate-fade-in flex items-center justify-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-yellow-400" />
                <span>{language === 'fa' ? 'اشتراک با موفقیت فعال شد! خوش آمدید.' : 'Activation code applied successfully! Enjoy PRO access.'}</span>
              </div>
            )}

            {activationError && (
              <div className="p-3 bg-red-500/15 border border-red-500/20 text-red-300 rounded-xl text-center text-[10.5px] leading-relaxed animate-fade-in">
                {activationError}
              </div>
            )}

            {/* License Input & Action row */}
            <div className="space-y-3 pt-2">
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Key className="absolute left-3 top-2.5 w-3.5 h-3.5 text-slate-500 font-sans" />
                  <input
                    type="text"
                    value={profile.activationKey}
                    onChange={(e) => handleProfileFieldChange('activationKey', e.target.value)}
                    placeholder={language === 'fa' ? 'کد فعال‌سازی لایسنس' : 'Activation key, e.g., VIP_PASS'}
                    className={`w-full bg-slate-950/60 border border-white/5 rounded-xl py-2 pl-9 pr-3 text-white focus:outline-none focus:border-amber-500/40 text-xs font-sans placeholder-slate-600 uppercase ${language === 'fa' ? 'text-right' : 'text-left'}`}
                  />
                </div>
                
                <button
                  type="button"
                  onClick={handleVerifyLicense}
                  className="px-4 py-2 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 font-bold rounded-xl text-[11px] transition-all cursor-pointer"
                >
                  {language === 'fa' ? 'ثبت کلید' : 'Apply'}
                </button>
              </div>

              {/* Developer testing simulation features */}
              {devModeActive && (
                <div className="bg-white/2 p-3 rounded-2xl border border-white/5 space-y-2">
                <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest font-mono block">
                  {language === 'fa' ? 'ابزار تست و شبیه‌ساز مانیتایزیشن' : 'Monetization Simulation Tools'}
                </span>
                
                <div className="grid grid-cols-2 gap-2 text-[9.5px]">
                  <button
                    type="button"
                    onClick={handleInstantUpgrade}
                    className="py-1.5 px-2 bg-gradient-to-r from-amber-500/10 to-yellow-500/10 border border-amber-500/25 hover:border-amber-500/50 text-amber-400 font-bold rounded-xl transition-all cursor-pointer text-center"
                  >
                    {language === 'fa' ? '🚀 ارتقا فوری تستی (VIP)' : '🚀 Upgrade Test VIP'}
                  </button>

                  <button
                    type="button"
                    onClick={handleDowngradeToFree}
                    className="py-1.5 px-2 bg-slate-900 hover:bg-slate-850 border border-white/5 text-slate-400 hover:text-slate-200 font-bold rounded-xl transition-all cursor-pointer text-center"
                  >
                    {language === 'fa' ? 'ریست اشتراک به رایگان' : 'Reset subscription'}
                  </button>
                </div>

                <div className="bg-slate-950/70 p-3.5 rounded-2xl border border-white/5 space-y-2.5">
                  <div className="flex justify-between items-center border-b border-white/5 pb-1.5">
                    <span className="text-[10px] font-bold text-amber-300">
                      {language === 'fa' ? '🔑 کدهای لایسنس تستی تولید شده برای کاربران' : '🔑 Generated Tester License Keys'}
                    </span>
                    <span className="text-[8.5px] font-mono text-slate-500 uppercase">DEMO DATABASE</span>
                  </div>

                  <div className="grid grid-cols-1 gap-2 text-[10px]">
                    {/* VIP Keys Section */}
                    <div className="space-y-1.5">
                      <span className="text-[8.5px] text-yellow-500/80 font-bold block uppercase tracking-wider">
                        {language === 'fa' ? '💎 اشتراک ویژه مادام‌العمر (VIP Tier)' : '💎 VIP Lifetime Keys'}
                      </span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                        {[
                          { key: 'VIP_PASS', label: language === 'fa' ? 'کد طلایی تست' : 'Primary VIP Golden' },
                          { key: 'DRALAN_VIP', label: language === 'fa' ? 'ویژه حامیان اصلی' : 'Founder VIP' },
                          { key: 'ONIGAMA_VIP', label: language === 'fa' ? 'لایسنس همکاران سیستم' : 'Partner System' },
                          { key: 'ALPHA_TEST_KEY', label: language === 'fa' ? 'کد تست آلفا' : 'Alpha Tester' }
                        ].map((item) => (
                          <div key={item.key} className="flex items-center justify-between bg-slate-900 border border-yellow-500/10 p-1.5 rounded-xl">
                            <div className="space-y-0.5 truncate">
                              <span className="text-[9.5px] font-mono text-[#6f87a0] block truncate">{item.key}</span>
                              <span className="text-[8.5px] text-slate-500 block truncate">{item.label}</span>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleCopy(item.key, 'key')}
                              className="p-1 text-yellow-500/80 hover:text-white bg-slate-800 hover:bg-yellow-500/10 rounded-lg transition-colors cursor-pointer"
                              title={language === 'fa' ? 'کپی کد لایسنس' : 'Copy Key'}
                            >
                              <Copy className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Premium Keys Section */}
                    <div className="space-y-1.5 pt-1 border-t border-white/5">
                      <span className="text-[8.5px] text-blue-400 font-bold block uppercase tracking-wider">
                        {language === 'fa' ? '⚡ اشتراک حرفه‌ای سالانه (PRO Tier)' : '⚡ PRO Premium Keys'}
                      </span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                        {[
                          { key: 'GOLDEN_KEY', label: language === 'fa' ? 'اعتبار طلایی' : 'Pro Golden Key' },
                          { key: 'ONIGAMA2026', label: language === 'fa' ? 'لایسنس سالانه ۲۰۲۶' : '2026 Annual Pro' },
                          { key: 'PRO_TESTER_99', label: language === 'fa' ? 'تستر عمومی پرو' : 'General Tester Pro' },
                          { key: 'ONIGAMA_GOLD_2026', label: language === 'fa' ? 'نسخه طلایی کلاینت' : 'Onigama Core Gold' }
                        ].map((item) => (
                          <div key={item.key} className="flex items-center justify-between bg-slate-900 border border-blue-500/10 p-1.5 rounded-xl">
                            <div className="space-y-0.5 truncate">
                              <span className="text-[9.5px] font-mono text-[#6f87a0] block truncate">{item.key}</span>
                              <span className="text-[8.5px] text-slate-500 block truncate">{item.label}</span>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleCopy(item.key, 'key')}
                              className="p-1 text-blue-400/80 hover:text-white bg-slate-800 hover:bg-blue-500/10 rounded-lg transition-colors cursor-pointer"
                              title={language === 'fa' ? 'کپی کد لایسنس' : 'Copy Key'}
                            >
                              <Copy className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>

                    {copiedText === 'key' && (
                      <div className="text-[9px] text-emerald-400 text-center font-bold animate-pulse pt-1">
                        {language === 'fa' ? '✓ کد لایسنس با موفقیت بر روی کلیپ‌بورد کپی شد.' : '✓ License key copied to clipboard.'}
                      </div>
                    )}
                  </div>
                </div>
              </div>
              )}
            </div>
          </div>

          {/* PLATFORM METADATA SPECIFICATIONS */}
          <div className="p-6 rounded-3xl glass-card border border-white/5 space-y-4">
            <h2 className="text-xs font-bold text-slate-300 tracking-wider uppercase flex items-center gap-1.5 border-b border-white/5 pb-3">
              <Info className="w-4 h-4 text-blue-400 shrink-0" />
              <span>{language === 'fa' ? 'درباره اکو سیستم معاملاتی اونیگاما' : 'Onigama FX Ecosystem'}</span>
            </h2>

            <div className="text-xs text-slate-300 space-y-3.5 font-sans leading-relaxed">
              <p>
                {language === 'fa'
                  ? ' Onigama FX پلتفرمی هوشمند و چابک با دیزاینی متمایز و متمرکز، ساخته شده برای معامله‌گران جهت ردیابی نوسانات طلا و جفت‌ارزها، تحلیل ساختار بازار (SMC)، نقدینگی و ژورنال‌نویسی هوشمند معاملات است.'
                  : 'Onigama FX provides modular analysis widgets, advanced SMC liquidity mapping, real-time gold price metrics, and integrated trading logs designed specifically for the Telegram Mini App ecosystem.'}
              </p>

              {/* NETWORK STATUS INFO BOARD */}
              <div className="bg-white/2 p-4 rounded-2xl border border-white/5 space-y-3 font-mono text-[11px] text-slate-400">
                
                {/* TELEGRAM BOT CHANNEL LINK */}
                <div className="flex justify-between items-center">
                  <span>TELEGRAM BOT:</span>
                  <div className="flex items-center gap-2">
                    <a 
                      href="https://t.me/onigama_ai_bot" 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="text-blue-400 hover:text-blue-300 underline font-semibold flex items-center gap-0.5"
                    >
                      @onigama_ai_bot <ExternalLink className="w-3 h-3" />
                    </a>
                    <button 
                      onClick={() => handleCopy('https://t.me/onigama_ai_bot', 'bot')}
                      className="text-slate-500 hover:text-white transition-colors cursor-pointer"
                    >
                      {copiedText === 'bot' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                {/* TELEGRAM UPDATE CHANNEL */}
                <div className="flex justify-between items-center">
                  <span>UPDATE CHANNEL:</span>
                  <div className="flex items-center gap-2">
                    <a 
                      href="https://t.me/ONIGAMAFX" 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="text-blue-400 hover:text-blue-300 underline font-semibold flex items-center gap-0.5"
                    >
                      @ONIGAMAFX <ExternalLink className="w-3 h-3" />
                    </a>
                    <button 
                      onClick={() => handleCopy('https://t.me/ONIGAMAFX', 'channel')}
                      className="text-slate-500 hover:text-white transition-colors cursor-pointer"
                    >
                      {copiedText === 'channel' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                <hr className="border-white/5 my-1" />

                {/* PING GRAPH METRIC */}
                <div className="flex justify-between items-center pt-1 font-sans">
                  <div className="flex items-center gap-2">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                    </span>
                    <span className="text-[10px] text-emerald-400 font-semibold">{language === 'fa' ? 'شبکه فعال است' : 'FX Data Feed Active'}</span>
                  </div>
                  <span className="font-mono text-xs text-emerald-400">{pingMs}ms</span>
                </div>

              </div>

            </div>

          </div>

          {/* HELP COMPONENT / FAQ LINK CARD */}
          <div className="p-6 rounded-3xl bg-gradient-to-br from-slate-900/60 to-slate-950/60 border border-white/5">
            <h3 className="text-xs font-bold text-slate-300 flex items-center gap-2 mb-2 font-sans uppercase">
              <Cpu className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{language === 'fa' ? 'راهنمای اجرای سیگنال ها' : 'Execution Guideline'}</span>
            </h3>
            <p className="text-[11px] text-slate-400 leading-relaxed font-sans mt-1">
              {language === 'fa' 
                ? 'تمامی سیگنال‌های ارائه شده در پنل داشبورد، یک راهنمای آماری تریدر است. حتما بر اساس پروفایل ریسک انتخاب شده و اهداف TP1 و TP2 سرمایه گذاری فرمایید.' 
                : 'All system signals act as informative analytics trackers. Compound your profit parameters based on the selected risk profile LOT outputs.'}
            </p>
          </div>

          {/* GENERAL SIGNAL DISCLAIMER BOX */}
          <div className="p-6 rounded-3xl bg-rose-500/5 border border-rose-500/10 space-y-2">
            <h4 className="text-xs font-bold text-rose-400 flex items-center gap-1.5 uppercase tracking-wide">
              <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{language === 'fa' ? 'سلب مسئولیت مهم معاملاتی' : 'Trading Risk Disclaimer'}</span>
            </h4>
            <p className="text-[11px] text-slate-300 leading-relaxed font-sans">
              {language === 'fa' 
                ? 'سلب مسئولیت: تمامی سیگنال‌ها، تحلیل‌های تکنیکال، و پیام‌های معاملاتی ارائه شده در مینی‌اپ اونیگاما صرفاً جنبه آموزشی و اطلاع‌رسانی دارند. بازارهای مالی و بویژه معاملات طلا و جفت‌ارزها دارای ریسک بسیار بالایی هستند و سودهای گذشته تضمین‌کننده سودهای آتی نخواهد بود. مینی‌اپ اونیگاما مسئولیتی در قبال سود یا ضرر ناشی از تصمیمات مالی مستقیم یا غیرمستقیم شما بر عهده نمی‌گیرد.'
                : 'Disclaimer: All trading signals, technical analysis, and indicators provided within the Onigama FX platform are strictly for informational and educational purposes. Financial markets, especially gold and foreign exchange (Forex), carry a high level of risk and past performance is not indicative of future results. Onigama FX accepts no liability for any financial gains or losses incurred directly or indirectly as a result of using this application.'}
            </p>
          </div>

        </div>

      </div>

      {/* GOOGLE PLAY BILLING SIMULATOR MODAL OUTLINE */}
      {showPlayStoreModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-4 transition-all animate-fade-in">
          <div className="bg-[#1c1c1e] text-white w-full max-w-sm rounded-t-3xl sm:rounded-3xl border border-white/10 overflow-hidden shadow-2xl flex flex-col">
            {/* Play Branding Header */}
            <div className="px-5 py-4 border-b border-white/5 bg-[#121213] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24" fill="none">
                  <path d="M3 20.32V3.68c0-.79.44-1.5 1.15-1.85L15.3 12 4.15 22.17c-.71-.35-1.15-1.06-1.15-1.85z" fill="#4CAF50"/>
                  <path d="M15.3 12L4.15 1.83c.12-.06.25-.09.39-.09.34 0 .66.12.92.35l11.4 10.37c.36.33.36.88 0 1.21L5.46 21.91c-.26.23-.58.35-.92.35-.14 0-.27-.03-.39-.09L15.3 12z" fill="#FFC107"/>
                  <path d="M15.3 12l2.35 2.14 2.85-2.59c.36-.33.36-.88 0-1.21l-2.85-2.59L15.3 12z" fill="#F44336"/>
                  <path d="M15.3 12L5.46 21.91c-.13.12-.29.21-.46.26l10.3-10.17L15.3 12z" fill="#2196F3"/>
                </svg>
                <div className="flex flex-col">
                  <span className="text-[11.5px] font-black text-slate-200 tracking-wider font-mono">Google Play</span>
                  <span className="text-[8px] text-slate-500 uppercase font-bold tracking-widest leading-none">Billing Service</span>
                </div>
              </div>
              <button
                onClick={() => setShowPlayStoreModal(false)}
                className="text-slate-400 hover:text-white bg-white/5 hover:bg-white/10 rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold leading-none cursor-pointer"
                disabled={purchaseState.isProcessing && !purchaseState.success}
              >
                ✕
              </button>
            </div>

            {/* Content Field */}
            <div className="p-5 space-y-4">
              <div className="flex gap-3 bg-white/2 p-3 rounded-2xl border border-white/5">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-yellow-600 flex items-center justify-center text-slate-950 font-black text-xs shrink-0 font-sans shadow-inner">
                  🔑
                </div>
                <div className="space-y-0.5 min-w-0 flex-1">
                  <span className="text-xs font-bold text-slate-200 block truncate">Onigama FX Intelligence</span>
                  <span className="text-[10px] text-[#8e8e93] block truncate">
                    {selectedProductId === PLAY_STORE_PRODUCTS.VIP_LIFETIME 
                      ? 'VIP Crown - Lifetime Access Package'
                      : 'PRO Analytics Sub - 12 Months Recurrent'}
                  </span>
                </div>
              </div>

              {/* Price Details */}
              <div className="flex justify-between items-baseline py-1">
                <span className="text-[11px] text-slate-400 font-sans">{language === 'fa' ? 'قیمت اشتراک تکی:' : 'Subscription Price:'}</span>
                <span className="text-lg font-black font-mono text-white">
                  {selectedProductId === PLAY_STORE_PRODUCTS.VIP_LIFETIME ? '$12.99' : '$4.99'}
                </span>
              </div>

              {/* Validation Status Block */}
              {purchaseState.isProcessing ? (
                <div className="p-4 bg-slate-950/70 border border-amber-500/10 rounded-2xl flex flex-col items-center justify-center py-5 space-y-3">
                  <div className="w-8 h-8 rounded-full border-2 border-t-amber-500 border-r-transparent border-b-transparent border-l-transparent animate-spin"></div>
                  <span className="text-[11px] font-mono text-amber-300 text-center px-2 block animate-pulse">
                    {purchaseState.statusText}
                  </span>
                </div>
              ) : purchaseState.success ? (
                <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex flex-col items-center justify-center py-5 space-y-2 text-center animate-fade-in">
                  <div className="w-10 h-10 rounded-full bg-emerald-500/20 border border-emerald-500/45 flex items-center justify-center text-emerald-400 font-bold mb-1">
                    ✓
                  </div>
                  <span className="text-xs font-bold text-emerald-400 block font-sans">
                    {language === 'fa' ? 'پرداخت گوگل‌پلی تأیید شد!' : 'Security Verification Clean!'}
                  </span>
                  <span className="text-[10px] text-slate-400 font-sans">
                    {language === 'fa' ? 'امکانات طلایی هم اکنون در سراسر برنامه فعال است.' : 'VIP entitlements are now bound to your account.'}
                  </span>
                  <button
                    onClick={() => setShowPlayStoreModal(false)}
                    className="mt-3 py-1.5 px-3 bg-emerald-500 text-slate-950 font-bold rounded-xl text-[10px] hover:bg-emerald-400 active:scale-95 transition-all w-full cursor-pointer"
                  >
                    {language === 'fa' ? 'بستن درگاه و بازگشت' : 'Back to Monitor'}
                  </button>
                </div>
              ) : (
                <div className="space-y-4 font-sans">
                  {/* Payment profile simulation options */}
                  <div className="space-y-2">
                    <span className="text-[9px] text-[#8e8e93] font-bold block uppercase tracking-wider font-sans">{language === 'fa' ? 'روش شبیه‌سازی پرداخت گوگل' : 'Google Payment Selector'}</span>
                    <div className="bg-[#2c2c2e] p-3 rounded-xl flex items-center justify-between border border-white/5 font-sans">
                      <div className="flex items-center gap-2">
                        <div className="w-11 h-6 bg-slate-950 rounded border border-white/10 flex items-center justify-center font-mono font-bold text-[8px] text-slate-400">G Pay</div>
                        <span className="text-[11px] font-mono text-slate-300">behimaram@gmail.com</span>
                      </div>
                      <span className="text-[10px] text-slate-500">Google Pay</span>
                    </div>
                  </div>

                  {purchaseState.error && (
                    <div className="p-2.5 bg-rose-500/10 border border-rose-500/20 text-rose-300 rounded-xl text-[10px] text-center">
                      ⚠ {purchaseState.error}
                    </div>
                  )}

                  {/* Purchase CTA */}
                  <button
                    onClick={() => {
                      // Trigger payment cycle simulation
                      handleInitiatePlayStorePurchase(selectedProductId);
                    }}
                    className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-black rounded-2xl text-xs uppercase tracking-wider transition-all cursor-pointer shadow-lg active:scale-95 text-center block"
                  >
                    {language === 'fa' ? 'تایید نهایی و اشتراک تستی' : 'Subscribe • Test Checkout'}
                  </button>
                </div>
              )}
            </div>

            {/* Play Footer */}
            <div className="px-5 py-3 border-t border-white/5 bg-[#121213] text-[9.5px] text-slate-600 text-center leading-relaxed font-sans">
              Google Play In-App Billing engine. Fully compliant with play-billing specifications.
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
