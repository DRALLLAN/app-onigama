import { Home, BarChart2, Flame, Brain, BookOpen, Settings, Sparkles } from 'lucide-react';

interface BottomNavigationProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  language: 'fa' | 'en';
}

export function BottomNavigation({ activeTab, setActiveTab, language }: BottomNavigationProps) {
  const tabs = [
    {
      id: 'home',
      label: language === 'fa' ? 'خانه' : 'Home',
      icon: Home,
    },
    {
      id: 'analysis',
      label: language === 'fa' ? 'تحلیل' : 'Analysis',
      icon: BarChart2,
    },
    {
      id: 'fundamental',
      label: language === 'fa' ? 'فاندامنتال' : 'Fund',
      icon: Flame,
    },
    {
      id: 'catalog',
      label: language === 'fa' ? 'کاتالوگ' : 'Specs',
      icon: Sparkles,
    },
    {
      id: 'psychology',
      label: language === 'fa' ? 'روانشناسی' : 'Mindset',
      icon: Brain,
    },
    {
      id: 'journal',
      label: language === 'fa' ? 'ژورنال' : 'Journal',
      icon: BookOpen,
    },
    {
      id: 'settings',
      label: language === 'fa' ? 'تنظیمات' : 'Settings',
      icon: Settings,
    },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-[#070f17]/30 backdrop-blur-xl border-t border-white/10 shadow-xl px-2 py-3 pb-safe">
      <div className="max-w-md md:max-w-xl lg:max-w-2xl mx-auto flex justify-around items-center">
        {tabs.map((tab) => {
          const IconComponent = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex flex-col items-center justify-center flex-1 py-1.5 px-1 sm:px-3 rounded-2xl transition-all duration-300 relative ${
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
                className={`w-5 h-5 mb-1 transition-transform duration-300 ${
                  isActive ? 'stroke-[2.5px] text-[#6f87a0]' : 'stroke-[1.8px]'
                }`} 
              />
              
              <span className="text-[10px] tracking-wide uppercase transition-all duration-300 select-none">
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
