import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Globe, RefreshCw, Flame } from 'lucide-react';
import { FundamentalNews } from '../components/FundamentalNews';
import { Language } from '../types';

interface FundamentalPageProps {
  language: Language;
  onNavigate?: (tab: string) => void;
}

export function FundamentalPage({ language, onNavigate }: FundamentalPageProps) {
  const isRtl = language === 'fa' || language === 'ku';

  return (
    <div className="space-y-6 pb-20 relative">
      <div className="relative overflow-hidden rounded-3xl p-6 glass-card glow-blue shadow-[0_10px_40px_rgba(0,0,0,0.3)]">
        <div className="absolute top-0 right-0 w-48 h-48 bg-[#6f87a0]/10 rounded-full blur-[60px] pointer-events-none" />
        <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-[#6f87a0]/5 rounded-full blur-[50px] pointer-events-none" />

        <div className="flex justify-between items-start" dir={isRtl ? 'rtl' : 'ltr'}>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2.5 h-2.5 bg-amber-400 rounded-full animate-pulse" />
              <h1 className="text-xl font-black text-white tracking-wide">
                {language === 'ku' ? 'ڕۆژژمێر و هەواڵە فەندەمێنتەڵەکان' : (language === 'fa' ? 'تقویم و دماسنج فاندامنتال' : 'FUNDAMENTAL RADAR')}
              </h1>
            </div>
            <p className="text-[11px] text-slate-400 font-sans tracking-wide">
              {language === 'ku'
                ? 'چاودێریی ڕووداوە ئابوورییەکان، شیکاریی کاریگەریی هەواڵ و ڕەوتی نوسانی بازاڕ'
                : (language === 'fa' 
                  ? 'پایش رویدادهای اقتصادی، تحلیل اثر اخبار و دماسنج زنده نوسان بازار' 
                  : 'Economic calendar, news sentiment analysis & live volatility heat maps')}
            </p>
          </div>
        </div>
      </div>

      {/* CORE FUNDAMENTAL COMPONENT */}
      <div className="w-full">
        <FundamentalNews language={language} selectedSymbol="ALL" />
      </div>
    </div>
  );
}
