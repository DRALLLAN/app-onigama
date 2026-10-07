import { Home, BarChart2, Flame, Brain, BookOpen, Settings, Sparkles } from 'lucide-react';
import { Language } from '../types';

interface BottomNavigationProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  language: Language;
}

export function BottomNavigation({ activeTab, setActiveTab, language }: BottomNavigationProps) {
  const tabs = [
    {
      id: 'home',
      label: language === 'ku' ? 'سەرەکی' : (language === 'fa' ? 'خانه' : 'Home'),
      icon: Home,
    },
    {
      id: 'analysis',
      label: language === 'ku' ? 'شیکاری' : (language === 'fa' ? 'تحلیل' : 'Analysis'),
      icon: BarChart2,
    },
    {
      id: 'fundamental',
      label: language === 'ku' ? 'فەندەمێنتەڵ' : (language === 'fa' ? 'فاندامنتال' : 'Fund'),
      icon: Flame,
    },
    {
      id: 'catalog',
      label: language === 'ku' ? 'کەتەلۆگ' : (language === 'fa' ? 'کاتالوگ' : 'Specs'),
      icon: Sparkles,
    },
    {
      id: 'psychology',
      label: language === 'ku' ? 'دەروونناسی' : (language === 'fa' ? 'روانشناسی' : 'Mindset'),
      icon: Brain,
    },
    {
      id: 'journal',
      label: language === 'ku' ? 'ژوورناڵ' : (language === 'fa' ? 'ژورنال' : 'Journal'),
      icon: BookOpen,
    },
    {
      id: 'settings',
      label: language === 'ku' ? 'ڕێکخستن' : (language === 'fa' ? 'تنظیمات' : 'Settings'),
      icon: Settings,
    },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-[#070f17]/90 backdrop-blur-2xl border-t border-white/10 shadow-[0_-10px_35px_rgba(0,0,0,0.6)] px-1 sm:px-3 pt-2 pb-[max(8px,env(safe-area-inset-bottom,0px))]" style={{ WebkitBackdropFilter: 'blur(16px)' }}>
      <div className="w-full max-w-md md:max-w-xl lg:max-w-2xl mx-auto flex justify-around items-center">
        {tabs.map((tab) => {
          const IconComponent = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex flex-col items-center justify-center flex-1 py-1 px-0.5 sm:px-2 rounded-2xl transition-all duration-300 relative ${
                isActive 
                  ? 'text-white font-bold scale-105' 
                  : 'text-slate-400 hover:text-slate-300'
              }`}
              style={{ touchAction: 'manipulation' }}
            >
              {/* Highlight background glow */}
              {isActive && (
                <span className="absolute inset-x-2 inset-y-0.5 bg-white/8 rounded-xl blur-[1px] pointer-events-none" />
              )}
              
              <IconComponent 
                className={`w-5 h-5 mb-0.5 sm:mb-1 transition-transform duration-300 ${
                  isActive ? 'stroke-[2.5px] text-[#6f87a0] scale-110' : 'stroke-[1.8px]'
                }`} 
              />
              
              <span className={`text-[10px] tracking-wide transition-all duration-300 select-none ${
                isActive ? 'block text-xs font-black' : 'hidden sm:block text-slate-400'
              }`}>
                {tab.label}
              </span>

              {/* Little active dot indicators */}
              {isActive && (
                <span className="absolute -bottom-1 w-1.5 h-1 bg-[#6f87a0] rounded-full shadow-[0_0_8px_#6f87a0]" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
