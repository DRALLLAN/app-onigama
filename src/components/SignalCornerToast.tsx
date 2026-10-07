import React, { useState, useEffect, useRef } from 'react';
import { Signal, Language } from '../types';
import { StorageManager } from '../services/api';
import { Zap, Bell, Target, ShieldAlert, ArrowUpRight, ArrowDownRight, Check, X, ExternalLink } from 'lucide-react';

interface SignalCornerToastProps {
  language: Language;
  onNavigate?: (tab: string) => void;
}

export function SignalCornerToast({ language, onNavigate }: SignalCornerToastProps) {
  const [activeSignal, setActiveSignal] = useState<Signal | null>(null);
  const [visible, setVisible] = useState<boolean>(false);
  const timerRef = useRef<any>(null);

  // Play audio chime when signal notification pops up
  const playSignalChime = () => {
    try {
      const settings = StorageManager.getSettings();
      if (settings.soundEnabled === false) return;

      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) return;

      const ctx = new AudioContextClass();
      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      const now = ctx.currentTime;

      // Two-tone harmonic chime (880Hz -> 1320Hz)
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(880, now);
      osc1.frequency.exponentialRampToValueAtTime(1320, now + 0.15);

      gain1.gain.setValueAtTime(0.18, now);
      gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.45);

      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      osc1.start(now);
      osc1.stop(now + 0.45);

      // Second harmonic accent
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = 'triangle';
      osc2.frequency.setValueAtTime(1760, now + 0.1);
      gain2.gain.setValueAtTime(0.1, now + 0.1);
      gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.5);

      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      osc2.start(now + 0.1);
      osc2.stop(now + 0.5);
    } catch (e) {
      console.warn('Audio chime fallback:', e);
    }
  };

  useEffect(() => {
    const handleSignalIssued = (event: Event) => {
      const customEvent = event as CustomEvent<Signal>;
      if (!customEvent.detail) return;

      const settings = StorageManager.getSettings();
      // Check if notifications are disabled in user settings
      if (settings.notifications === false || settings.signalCornerNotification === false) {
        return;
      }

      const signal = customEvent.detail;
      setActiveSignal(signal);
      setVisible(true);

      // Play audio chime
      if (settings.signalSoundAlert !== false) {
        playSignalChime();
      }

      // Vibrate if supported
      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        try {
          navigator.vibrate([120, 60, 120]);
        } catch {}
      }

      // Auto dismiss after 8 seconds
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => {
        setVisible(false);
      }, 8000);
    };

    window.addEventListener('onigama_signal_issued', handleSignalIssued);

    return () => {
      window.removeEventListener('onigama_signal_issued', handleSignalIssued);
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  if (!visible || !activeSignal) return null;

  const isBuy = activeSignal.type === 'BUY';
  const sessionFa = activeSignal.session === 'ASIA' ? 'آسیا' : activeSignal.session === 'LONDON' ? 'لندن' : 'نیویورک';
  const sessionEn = activeSignal.session || 'LONDON';

  return (
    <div 
      className="fixed bottom-[calc(env(safe-area-inset-bottom,0px)+72px)] left-2.5 right-2.5 sm:left-auto sm:right-6 sm:bottom-6 z-[99999] w-auto max-w-[390px] animate-slide-up transition-all duration-300 font-sans"
      dir={language === 'fa' || language === 'ku' ? 'rtl' : 'ltr'}
    >
      <div className={`relative overflow-hidden p-4 rounded-2xl glass-card backdrop-blur-2xl border shadow-[0_20px_50px_rgba(0,0,0,0.6)] ${
        isBuy 
          ? 'border-emerald-500/40 bg-slate-950/95 shadow-emerald-950/30' 
          : 'border-rose-500/40 bg-slate-950/95 shadow-rose-950/30'
      }`}>
        {/* BACKGROUND GLOW ACCENT */}
        <div className={`absolute top-0 right-0 w-32 h-32 rounded-full blur-[45px] pointer-events-none -z-10 ${
          isBuy ? 'bg-emerald-500/15' : 'bg-rose-500/15'
        }`} />

        {/* TOP BAR / HEADER */}
        <div className="flex items-center justify-between gap-2 pb-2.5 border-b border-white/10 mb-3">
          <div className="flex items-center gap-2 min-w-0">
            <div className={`p-1.5 rounded-xl shrink-0 ${
              isBuy ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
            }`}>
              <Zap className="w-4 h-4 animate-pulse" />
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-black tracking-wider uppercase text-amber-400">
                  {language === 'ku' ? 'سیگناڵی نوێی Onigama' : (language === 'fa' ? 'سیگنال جدید Onigama' : 'NEW ONIGAMA SIGNAL')}
                </span>
                <span className="text-[9px] px-1.5 py-0.2 rounded font-mono font-bold bg-white/10 text-slate-300">
                  {activeSignal.symbol}
                </span>
              </div>
              <p className="text-[11px] font-bold text-slate-200 truncate">
                {language === 'ku'
                  ? `دەرفەتی نوێی مامەڵە (${activeSignal.strategy || 'SMC'})`
                  : (language === 'fa' 
                    ? `فرصت معامله جدید (${activeSignal.strategy || 'SMC'})` 
                    : `Trade Setup Issued (${activeSignal.strategy || 'SMC'})`)}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setVisible(false)}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer shrink-0"
            title={language === 'ku' ? 'داخستن' : (language === 'fa' ? 'بستن' : 'Close')}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* SIGNAL PARAMETERS GRID */}
        <div className="grid grid-cols-3 gap-2 mb-3 text-center">
          <div className="p-2 rounded-xl bg-white/5 border border-white/5">
            <span className="text-[9px] text-slate-400 block font-semibold mb-0.5">
              {language === 'ku' ? 'جۆری سیگناڵ' : (language === 'fa' ? 'نوع سیگنال' : 'Type')}
            </span>
            <span className={`text-xs font-black px-2 py-0.5 rounded uppercase inline-flex items-center gap-0.5 ${
              isBuy ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
            }`}>
              {isBuy ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
              {activeSignal.type}
            </span>
          </div>

          <div className="p-2 rounded-xl bg-white/5 border border-white/5">
            <span className="text-[9px] text-slate-400 block font-semibold mb-0.5">
              {language === 'ku' ? 'نرخی چوونەژوورەوە' : (language === 'fa' ? 'نقطه ورود (Entry)' : 'Entry')}
            </span>
            <span className="text-xs font-mono font-bold text-slate-100">
              {activeSignal.entryPrice}
            </span>
          </div>

          <div className="p-2 rounded-xl bg-white/5 border border-white/5">
            <span className="text-[9px] text-slate-400 block font-semibold mb-0.5">
              {language === 'ku' ? 'دیاریکردنی قازانج' : (language === 'fa' ? 'حد سود (TP1)' : 'Take Profit')}
            </span>
            <span className="text-xs font-mono font-bold text-emerald-400">
              {activeSignal.tp1}
            </span>
          </div>
        </div>

        {/* SL & STRATEGY ROW */}
        <div className="flex items-center justify-between text-[11px] px-2 py-1.5 rounded-xl bg-white/5 border border-white/5 mb-3 font-mono">
          <div className="flex items-center gap-1 text-slate-300">
            <span className="text-slate-400 font-sans">{language === 'ku' ? 'ڕاگرتنی زیان:' : (language === 'fa' ? 'حد ضرر:' : 'SL:')}</span>
            <span className="text-rose-400 font-bold">{activeSignal.sl}</span>
          </div>
          <div className="flex items-center gap-1.5 text-slate-300">
            <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 font-bold">
              {language === 'ku' ? (activeSignal.session === 'ASIA' ? 'ئاسیا' : (activeSignal.session === 'NEWYORK' ? 'نیویۆرک' : 'لەندەن')) : (language === 'fa' ? sessionFa : sessionEn)}
            </span>
            <span className="text-[10px] px-1.5 py-0.2 rounded bg-blue-500/20 text-blue-300 font-bold">
              {activeSignal.strategy || 'SMC'}
            </span>
          </div>
        </div>

        {/* NOTE / REASON IF AVAILABLE */}
        {activeSignal.note && (
          <p className="text-[10px] text-slate-300/90 leading-relaxed mb-3 bg-white/5 p-2 rounded-xl border border-white/5 line-clamp-2">
            {activeSignal.note}
          </p>
        )}

        {/* ACTION BUTTONS */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              setVisible(false);
              if (onNavigate) {
                onNavigate('home');
              }
              // Save symbol as selected
              StorageManager.saveSelectedSymbol(activeSignal.symbol);
            }}
            className="flex-1 py-2 px-3 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 shadow-lg shadow-amber-500/20 transition-all active:scale-95 cursor-pointer"
          >
            <span>{language === 'ku' ? 'بینین لە داشبۆردی سیگناڵدا' : (language === 'fa' ? 'مشاهده در داشبورد سیگنال' : 'View In Signal Dashboard')}</span>
            <ExternalLink className="w-3.5 h-3.5 shrink-0" />
          </button>

          <button
            type="button"
            onClick={() => setVisible(false)}
            className="py-2 px-3 bg-white/10 hover:bg-white/15 text-slate-300 text-xs font-semibold rounded-xl transition-all cursor-pointer"
          >
            {language === 'ku' ? 'تێگەیشتم' : (language === 'fa' ? 'متوجه شدم' : 'Dismiss')}
          </button>
        </div>

        {/* ANIMATED AUTO-DISMISS PROGRESS BAR */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/10 overflow-hidden rounded-b-2xl">
          <div 
            className={`h-full transition-all ease-linear ${isBuy ? 'bg-emerald-400' : 'bg-rose-400'}`}
            style={{ 
              animation: 'toast-timer 8s linear forwards'
            }}
          />
        </div>
      </div>

      <style>{`
        @keyframes toast-timer {
          from { width: 100%; }
          to { width: 0%; }
        }
      `}</style>
    </div>
  );
}
