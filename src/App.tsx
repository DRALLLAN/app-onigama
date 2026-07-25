import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { BottomNavigation } from './components/BottomNavigation';
import { SplashScreen } from './components/SplashScreen';
import { HomePage } from './pages/HomePage';
import { AnalysisPage } from './pages/AnalysisPage';
import { FundamentalPage } from './pages/FundamentalPage';
import { PsychologyPage } from './pages/PsychologyPage';
import { JournalPage } from './pages/JournalPage';
import { SettingsPage } from './pages/SettingsPage';
import { CatalogPage } from './pages/CatalogPage';
import { StorageManager } from './services/api';
import { SignalCornerToast } from './components/SignalCornerToast';

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('home');
  const [language, setLanguage] = useState<'fa' | 'en'>('fa');
  const [showSplash, setShowSplash] = useState<boolean>(true);
  const [theme, setTheme] = useState<'dark' | 'glass'>('dark');

  useEffect(() => {
    // Read cached language selection from stored dashboard preferences
    const settings = StorageManager.getSettings();
    if (settings && settings.language) {
      setLanguage(settings.language);
    }
    const currentTheme = settings?.theme || 'dark';
    setTheme(currentTheme);
    document.documentElement.className = `theme-${currentTheme}`;
  }, []);

  const handleThemeChange = (newTheme: 'dark' | 'glass') => {
    setTheme(newTheme);
    document.documentElement.className = `theme-${newTheme}`;
  };

  const renderActiveScreen = () => {
    switch (activeTab) {
      case 'home':
        return <HomePage onNavigate={setActiveTab} language={language} />;
      case 'analysis':
        return <AnalysisPage language={language} onNavigate={setActiveTab} />;
      case 'fundamental':
        return <FundamentalPage language={language} onNavigate={setActiveTab} />;
      case 'psychology':
        return <PsychologyPage language={language} onNavigate={setActiveTab} />;
      case 'journal':
        return <JournalPage language={language} onNavigate={setActiveTab} />;
      case 'catalog':
        return <CatalogPage language={language} onNavigate={setActiveTab} />;
      case 'settings':
        return <SettingsPage language={language} setLanguage={setLanguage} onThemeChange={handleThemeChange} />;
      default:
        return <HomePage onNavigate={setActiveTab} language={language} />;
    }
  };

  return (
    <>
      {/* HIGH FIDELITY ANIMATED SPLASH SCREEN OVERLAY */}
      <AnimatePresence mode="wait">
        {showSplash && (
          <motion.div
            key="onigama-splash"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 1.04, filter: 'blur(10px)' }}
            transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
            className="fixed inset-0 z-[9999]"
          >
            <SplashScreen 
              language={language} 
              onFinished={() => setShowSplash(false)} 
            />
          </motion.div>
        )}
      </AnimatePresence>

      <div className="min-h-screen bg-gradient-radial text-slate-100 flex flex-col font-sans selection:bg-yellow-400 selection:text-black antialiased relative overflow-x-hidden">
        
        {/* BRAND GLOW GRAPHICS */}
        <div className="absolute top-[-100px] left-1/2 -translate-x-1/2 w-[380px] h-[380px] bg-[#6f87a0]/15 rounded-full blur-[85px] pointer-events-none z-0" />
        <div className="absolute bottom-[25%] right-[-60px] w-[280px] h-[280px] bg-emerald-500/5 rounded-full blur-[90px] pointer-events-none z-0" />
        <div className="absolute top-[40%] left-[-80px] w-[240px] h-[240px] bg-sky-500/5 rounded-full blur-[80px] pointer-events-none z-0" />

        {/* RESPONSIVE APP FRAME */}
        <div className="w-full lg:max-w-5xl xl:max-w-6xl 2xl:max-w-7xl mx-auto flex-1 flex flex-col px-3.5 sm:px-4 pt-4 sm:pt-5 pb-28 md:pb-32 z-10 relative">
          <AnimatePresence mode="wait">
            {!showSplash && (
              <motion.main
                key={activeTab}
                initial={{ opacity: 0, y: 12, filter: 'blur(3px)' }}
                animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                exit={{ opacity: 0, y: -12, filter: 'blur(3px)' }}
                transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
                className="flex-1 flex flex-col justify-start"
              >
                {renderActiveScreen()}
              </motion.main>
            )}
          </AnimatePresence>
        </div>

        {/* FLOATING MOBILE NAVBAR */}
        {!showSplash && (
          <>
            <BottomNavigation 
              activeTab={activeTab} 
              setActiveTab={setActiveTab} 
              language={language} 
            />
            <SignalCornerToast 
              language={language} 
              onNavigate={setActiveTab} 
            />
          </>
        )}
      </div>
    </>
  );
}
