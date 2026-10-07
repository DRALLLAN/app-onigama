import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Brain, 
  Smile, 
  AlertCircle, 
  Info, 
  CheckCircle2, 
  ShieldAlert, 
  TrendingUp, 
  HelpCircle, 
  Lock, 
  Sparkles,
  Play,
  Pause,
  Volume2,
  VolumeX,
  RotateCcw,
  Headphones,
  Disc,
  Bookmark,
  Upload,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  BookOpen,
  Music
} from 'lucide-react';
import { StorageManager } from '../services/api';
import { Language } from '../types';

interface PodcastChapter {
  id: number;
  title: { fa: string; en: string; ku?: string };
  durationStr: string;
  startTime: number; // in seconds
  endTime: number;
  summary: { fa: string; en: string; ku?: string };
}

const podcastChapters: PodcastChapter[] = [
  {
    id: 1,
    title: { 
      fa: 'مقدمه: سیم‌کشی ذهن برای معامله‌گری', 
      en: 'Intro: Re-wiring the Trader’s Mind',
      ku: 'پێشەکی: ڕێکخستنەوەی مێشک بۆ بازرگانی'
    },
    durationStr: '03:15',
    startTime: 0,
    endTime: 195,
    summary: {
      fa: 'دکتر بهزاد قربانی تلاقی علوم اعصاب و دینامیک‌های بازار را شرح می‌دهد. مغز انسان برای بقا تکامل یافته است نه تریدینگ؛ غلبه بر فریب‌های غریزی ضرورت دارد.',
      en: 'Dr. Behzad Ghorbani outlines how our primal brain processes threats. Re-wiring neuro-synaptic associations is the very first step toward sustainable execution.',
      ku: 'دکتۆر بەهزاد قوربانی زانستی دەمار و کاردانەوەکانی بازاڕ ڕوون دەکاتەوە. مێشکی مرۆڤ بۆ مانەوە دروست بووە نەک مامەڵەکردن؛ زاڵبوون بەسەر غەریزەکان پێویستە.'
    }
  },
  {
    id: 2,
    title: { 
      fa: 'بخش ۱: آمیگدال و کنترل فوبیای ضرر', 
      en: 'Part 1: Amygdala & Fear of Loss',
      ku: 'بەشی ١: ئامیگدالا و کۆنتڕۆڵی ترسی زیان'
    },
    durationStr: '04:20',
    startTime: 195,
    endTime: 455,
    summary: {
      fa: 'بررسی علمی ترس از دست دادن سرمایه که آمیگدال را فعال کرده و باعث خروج زودهنگام از سود یا جابجا کردن غیرمنطقی حد ضرر (پیش رفتن در زیان) می‌شود.',
      en: 'Deep scientific analysis of loss-aversion. The amygdala fires a fight-or-flight bypass during active drawdowns, triggering premature exiting or stop dragging.',
      ku: 'شیکاریی زانستی بۆ ترسی لەدەستدانی سەرمایە کە ئامیگدالا چالاک دەکات و دەبێتە هۆی دەرچوونی پێشوەختە لە قازانج یان دەستکاریی ستۆپ لۆس.'
    }
  },
  {
    id: 3,
    title: { 
      fa: 'بخش ۲: گیرنده‌های دوپامین و مدیریت طمع', 
      en: 'Part 2: Dopamine & Greed Mastery',
      ku: 'بەشی ٢: وەرگرەکانی دۆپامین و بەڕێوەبردنی تەماح'
    },
    durationStr: '04:45',
    startTime: 455,
    endTime: 740,
    summary: {
      fa: 'هیجان سودهای پیاپی که گیرنده‌های دوپامین بازرگان را اشباع کرده و منشا تصمیمات هیجانی، ترید بیش از حد (Over-trade) و تخلفات لاتیج ارزیابی می‌شود.',
      en: 'Winning streaks fill dopamine receptors with euphoria. This results in toxic overconfidence, over-trading, and catastrophic leverage violations.',
      ku: 'خرۆشانی قازانجی لەسەریەک کە دۆپامین پڕ دەکات و دەبێتە هۆی بڕیاری هەڵەشە، بازرگانیی زۆر (Over-trading) و بەکارهێنانی قەبارەی گەورە.'
    }
  },
  {
    id: 4,
    title: { 
      fa: 'بخش ۳: ساخت عضله انضباط عصبی', 
      en: 'Part 3: Building Biological Discipline',
      ku: 'بەشی ٣: دروستکردنی ماسوولکەی دیسیپلینی دەماری'
    },
    durationStr: '04:10',
    startTime: 740,
    endTime: 990,
    summary: {
      fa: 'انضباط یک تمرین فیزیکی برای قشر پیش‌پیشانی مغز است. تکنیک‌های مدیریت ریسک زیر ۱.۵٪ و پر کردن ژورنال معاملاتی به تقویت بیولوژیک این مدار ارزشمند می‌انجامد.',
      en: 'Discipline is a physical prefrontal cortex muscle. Rigorous logging and standardizing risk below 2% biochemically overrides primitive impulses.',
      ku: 'دیسیپلین ڕاهێنانێکی فیزیایییە بۆ مێشک. بەڕێوەبردنی مەترسی ژێر ١.٥٪ و تۆمارکردنی ژوورناڵ هێزی کۆنتڕۆڵی خود بەهێز دەکات.'
    }
  },
  {
    id: 5,
    title: { 
      fa: 'نتیجه‌گیری: تولد یک نوروتریدر دیسیپلین‌دار', 
      en: 'Conclusion: The Emergence of a NeuroTrader',
      ku: 'دەرەنجام: لەدایکبوونی نۆڕۆتریدرێکی بەدیسیپلین'
    },
    durationStr: '02:15',
    startTime: 990,
    endTime: 1125,
    summary: {
      fa: 'بسته‌بندی آموخته‌ها و دستورالعمل اجرایی روزانه ذهن جهت آمادگی ورود به سشن‌های معاملاتی در سطح تریدرهای نخبه و آرام.',
      en: 'Translating cognitive research into a simple daily checklist for ultimate calm and focused high-probability trading sessions.',
      ku: 'کۆکردنەوەی ئەزموونەکان و ڕێنمایی ڕۆژانە بۆ ئامادەکردنی مێشک پێش چوونەژوورەوەی سێشنەکان وەک بازرگانێکی ئارام و پرۆفیشناڵ.'
    }
  }
];

class AmbientWebSynth {
  private ctx: AudioContext | null = null;
  private oscs: OscillatorNode[] = [];
  private filter: BiquadFilterNode | null = null;
  private gain: GainNode | null = null;

  start() {
    try {
      const AudioCtxConstructor = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtxConstructor) return;
      this.ctx = new AudioCtxConstructor();
      this.gain = this.ctx.createGain();
      this.gain.gain.value = 0.15; // smooth background level

      this.filter = this.ctx.createBiquadFilter();
      this.filter.type = 'lowpass';
      this.filter.frequency.value = 220; // warm bass pad

      // Low frequency warm binaural carriers
      const frequencies = [110, 110.5, 220, 220.8];
      frequencies.forEach((f) => {
        if (!this.ctx || !this.filter) return;
        const osc = this.ctx.createOscillator();
        osc.type = 'sine';
        osc.frequency.value = f;
        osc.connect(this.filter);
        osc.start(0);
        this.oscs.push(osc);
      });

      this.filter.connect(this.gain);
      this.gain.connect(this.ctx.destination);
    } catch (e) {
      console.warn("Synth failed", e);
    }
  }

  setVolume(vol: number) {
    if (this.gain && this.ctx) {
      this.gain.gain.setValueAtTime(vol * 0.15, this.ctx.currentTime);
    }
  }

  stop() {
    this.oscs.forEach((osc) => {
      try { osc.stop(0); } catch(e){}
    });
    this.oscs = [];
    if (this.ctx && this.ctx.state !== 'closed') {
      this.ctx.close();
    }
    this.ctx = null;
  }
}

interface PsychologyPageProps {
  language: Language;
  onNavigate?: (tab: string) => void;
}

interface Tip {
  id: number;
  icon: string;
  lucideIcon: any;
  color: string;
  title: { fa: string; en: string; ku?: string };
  summary: { fa: string; en: string; ku?: string };
  content: { fa: string; en: string; ku?: string };
  quote: { fa: string; en: string; ku?: string };
}

export function PsychologyPage({ language, onNavigate }: PsychologyPageProps) {
  const [expandedTip, setExpandedTip] = useState<number | null>(null);
  const [profile, setProfile] = useState(() => StorageManager.getProfile());
  const [showLockModal, setShowLockModal] = useState(false);

  const isVip = profile.isActivated && (profile.subscriptionTier === 'vip' || profile.subscriptionTier === 'premium');

  // Audio Player States
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(1125); // total duration (18:45)
  const [playbackRate, setPlaybackRate] = useState<number>(1);
  const [volume, setVolume] = useState<number>(0.8);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [currentChapterIndex, setCurrentChapterIndex] = useState<number>(0);
  const [customAudioSrc, setCustomAudioSrc] = useState<string | null>('/podcast.mp3');
  const [customAudioName, setCustomAudioName] = useState<string | null>('NeuroTrader_Podcast_Summary.mp3');
  const [enableBinaural, setEnableBinaural] = useState<boolean>(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const synthRef = useRef<AmbientWebSynth | null>(null);
  const progressIntervalRef = useRef<any>(null);

  // Web Audio API refs for visualizer & analysis
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const sourceNodeRef = useRef<MediaElementAudioSourceNode | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  // Initializing static Pacings for SoundCloud-style representation
  const staticWaveform = [
    12, 18, 25, 35, 42, 22, 18, 30, 48, 62, 55, 38, 25, 18, 28, 45, 60, 75, 48, 32,
    20, 15, 26, 42, 58, 70, 78, 65, 45, 30, 22, 18, 30, 48, 68, 75, 62, 45, 35, 26,
    18, 12, 18, 30, 52, 65, 78, 85, 70, 50, 35, 22, 15, 24, 40, 55, 62, 45, 20, 12
  ];

  // Initialize Web Audio configuration safely on play gesture
  const initWebAudio = () => {
    if (!audioRef.current) return;
    try {
      if (!audioContextRef.current) {
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        audioContextRef.current = new AudioContextClass();
      }
      const ctx = audioContextRef.current;
      if (ctx.state === 'suspended') {
        ctx.resume();
      }
      
      if (!analyserRef.current) {
        const analyser = ctx.createAnalyser();
        analyser.fftSize = 64; // nice small size for visualizer
        analyserRef.current = analyser;
      }
      
      if (!sourceNodeRef.current && audioRef.current) {
        const src = audioRef.current.src || '';
        const isSameOrigin = src.startsWith('/') || src.startsWith(window.location.origin);
        if (!isSameOrigin && src.startsWith('http') && !src.includes('localhost') && !src.includes('127.0.0.1')) {
          audioRef.current.crossOrigin = 'anonymous';
        }
        const source = ctx.createMediaElementSource(audioRef.current);
        source.connect(analyserRef.current);
        analyserRef.current.connect(ctx.destination);
        sourceNodeRef.current = source;
      }
    } catch (err) {
      console.warn("Web Audio API Connection failed, run simulation fallback:", err);
    }
  };

  // Real-time Web Audio API Animating Spectrograph Canvas Runner
  useEffect(() => {
    if (!isPlaying) {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
      return;
    }

    // Try starting context or fallback
    initWebAudio();

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const analyser = analyserRef.current;
    const bufferLength = analyser ? analyser.frequencyBinCount : 32;
    const dataArray = new Uint8Array(bufferLength);

    const draw = () => {
      animationFrameRef.current = requestAnimationFrame(draw);

      const width = canvas.width;
      const height = canvas.height;
      ctx.clearRect(0, 0, width, height);

      if (analyser) {
        analyser.getByteFrequencyData(dataArray);
      } else {
        // Multi-frequency biological wave pulse simulation
        for (let i = 0; i < bufferLength; i++) {
          const timeFactor = Date.now() * 0.005;
          dataArray[i] = Math.max(
            8,
            Math.sin(i * 0.35 + timeFactor) * 60 + 
            Math.cos(i * 0.15 - timeFactor * 1.8) * 40 + 
            65 + 
            Math.random() * 20
          ) * volume * (isMuted ? 0 : 1);
        }
      }

      // Render high-fidelity premium visual bands
      const barWidth = (width / bufferLength) * 1.25;
      let barHeight;
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        barHeight = (dataArray[i] / 255) * height * 0.9;

        // Custom linear multicolor styling
        const gradient = ctx.createLinearGradient(0, height, 0, height - barHeight);
        gradient.addColorStop(0, 'rgba(245, 158, 11, 0.08)'); // glowing base
        gradient.addColorStop(0.5, 'rgba(56, 189, 248, 0.65)'); // sky cyan
        gradient.addColorStop(1, 'rgba(245, 158, 11, 0.95)'); // sharp gold head

        ctx.fillStyle = gradient;
        ctx.shadowBlur = 4;
        ctx.shadowColor = 'rgba(245, 158, 11, 0.25)';

        ctx.beginPath();
        if (ctx.roundRect) {
          ctx.roundRect(x, height - barHeight, barWidth - 1.5, barHeight, 1.5);
        } else {
          ctx.rect(x, height - barHeight, barWidth - 1.5, barHeight);
        }
        ctx.fill();

        x += barWidth;
      }
    };

    draw();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
    };
  }, [isPlaying, volume, isMuted, customAudioSrc]);

  // Interactive Waveform Drag, Move and Click Seeker Controls
  const handleWaveformClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const width = rect.width;
    const percentage = Math.max(0, Math.min(1, clickX / width));
    const targetTime = percentage * duration;
    
    setCurrentTime(targetTime);
    if (audioRef.current) {
      audioRef.current.currentTime = targetTime;
    }
  };

  const handleWaveformMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.buttons === 1) { // Left mouse button hold down dragging
      const rect = e.currentTarget.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const width = rect.width;
      const percentage = Math.max(0, Math.min(1, clickX / width));
      const targetTime = percentage * duration;
      
      setCurrentTime(targetTime);
      if (audioRef.current) {
        audioRef.current.currentTime = targetTime;
      }
    }
  };

  // Initialize synth on demand
  const getSynth = () => {
    if (!synthRef.current) {
      synthRef.current = new AmbientWebSynth();
    }
    return synthRef.current;
  };

  // Start/Stop synthesiser based on enableBinaural toggle state and playback state dynamically
  useEffect(() => {
    if (isPlaying && enableBinaural) {
      try {
        const synth = getSynth();
        synth.start();
        synth.setVolume(isMuted ? 0 : volume);
      } catch (err) {
        console.warn("Could not start binaural synth background:", err);
      }
    } else {
      if (synthRef.current) {
        try {
          synthRef.current.stop();
        } catch (err) {
          console.warn("Could not stop binaural synth cleanly:", err);
        }
      }
    }
  }, [enableBinaural, isPlaying, volume, isMuted]);

  // Sync volume changes
  useEffect(() => {
    const activeVolume = isMuted ? 0 : volume;
    if (audioRef.current) {
      audioRef.current.volume = activeVolume;
    }
    if (synthRef.current && enableBinaural && isPlaying) {
      synthRef.current.setVolume(activeVolume);
    }
  }, [volume, isMuted, enableBinaural, isPlaying]);

  // Sync playback speed changes
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.playbackRate = playbackRate;
    }
  }, [playbackRate]);

  // Track chapter based on current time
  useEffect(() => {
    const chapterIndex = podcastChapters.findIndex(
      ch => currentTime >= ch.startTime && currentTime <= ch.endTime
    );
    if (chapterIndex !== -1 && chapterIndex !== currentChapterIndex) {
      setCurrentChapterIndex(chapterIndex);
    }
  }, [currentTime, currentChapterIndex]);

  // Playback Toggle Trigger (pure speaker speech, optionally matches binaural oscillations)
  const handlePlayPause = () => {
    if (isPlaying) {
      // Pause
      if (audioRef.current) {
        audioRef.current.pause();
      }
      setIsPlaying(false);
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
        progressIntervalRef.current = null;
      }
    } else {
      // Play
      setIsPlaying(true);
      
      // Play podcast audio/soundtrack file
      if (audioRef.current) {
        audioRef.current.play().catch(e => console.warn("Audio play failed", e));
      }

      // Seamlessly keep time & visual synchronized
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
      progressIntervalRef.current = setInterval(() => {
        if (audioRef.current) {
          setCurrentTime(audioRef.current.currentTime);
          if (audioRef.current.duration) {
            setDuration(audioRef.current.duration);
          }
        }
      }, 300);
    }
  };

  // Skip Chapter Forward/Backward
  const handleNextChapter = () => {
    const nextIdx = Math.min(podcastChapters.length - 1, currentChapterIndex + 1);
    const targetTime = podcastChapters[nextIdx].startTime;
    setCurrentTime(targetTime);
    if (audioRef.current) {
      audioRef.current.currentTime = targetTime;
    }
  };

  const handlePrevChapter = () => {
    const prevIdx = Math.max(0, currentChapterIndex - 1);
    const targetTime = podcastChapters[prevIdx].startTime;
    setCurrentTime(targetTime);
    if (audioRef.current) {
      audioRef.current.currentTime = targetTime;
    }
  };

  // Restart / Reset
  const handleRestart = () => {
    setCurrentTime(0);
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
    }
  };

  // Drag and drop or input file change handler
  const handleAudioFileChange = (file: File) => {
    if (file) {
      const src = URL.createObjectURL(file);
      setCustomAudioSrc(src);
      setCustomAudioName(file.name);
      setIsPlaying(false);
      setCurrentTime(0);
      if (synthRef.current) {
        synthRef.current.stop();
      }
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
        progressIntervalRef.current = null;
      }
    }
  };

  // Clean-up refs on destroy
  useEffect(() => {
    return () => {
      if (synthRef.current) {
        synthRef.current.stop();
      }
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close().catch(e => console.warn("Teardown ctx failed:", e));
        audioContextRef.current = null;
      }
      sourceNodeRef.current = null;
      analyserRef.current = null;
    };
  }, []);

  const formatAudioTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

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
        en: 'Emotion Management',
        ku: 'بەڕێوەبردنی هەستەکان'
      },
      summary: {
        fa: 'کنترل ترس و طمع - کلید موفقیت در تریدینگ',
        en: 'Control fear & greed - the key to trading success',
        ku: 'کۆنتڕۆڵکردنی ترس و تەماح - کلیلی سەرکەوتن لە مامەڵەدا'
      },
      content: {
        fa: `ترس و طمع دو دشمن اصلی تریدر هستند. وقتی بازار صعودی است، طمع باعث میشود دیرتر از موقع مناسب وارد شوید یا زودتر از موقع سود بگیرید. وقتی بازار نزولی است، ترس باعث میشود زودتر از موقع از معامله خارج شوید یا اصلاً وارد نشوید.

راهحل: قبل از هر معامله، یک پلن مشخص داشته باشید. نقاط ورود، خروج، حد ضرر و حد سود را از قبل تعیین کنید و بدون توجه به احساسات، به آن پایبند باشید. هیچگاه تحت تأثیر هیجان تصمیم نگیرید.`,
        en: `Fear and greed are the two main enemies of a trader. When the market is bullish, greed causes you to enter too late or exit with a premature profit. When the market is bearish, fear makes you close trades too early or not enter at all.

Solution: Have a clear trading plan before making any transaction. Determine your entry, exit, stop loss, and take profit in advance, and stick to it regardless of your feelings. Never make decisions under execution pressure or hype.`,
        ku: `ترس و تەماح دوو گەورەترین دوژمنی بازرگانن. کاتێک بازاڕ بەرز دەبێتەوە، تەماح دەبێتە هۆی ئەوەی درەنگ بچیتە ناو مامەڵە یان زوو قازانجەکەت ببەستیتەوە. کاتێک بازاڕ دادەبەزێت، ترس دەبێتە هۆی ئەوەی پێشوەختە لە مامەڵە دەربچیت یان هەرگیز نەچیتە ناوی.

چارەسەر: پێش هەر مامەڵەیەک پلانێکی ڕوون دابنێ. خاڵەکانی چوونەژوور، دەرچوون، ڕاگرتنی زیان و دەستنیشانکردنی قازانج پێشوەختە دیاری بکە و بەبێ گوێدان بە هەستەکانت پێوەی پابەندبە. هەرگیز لەژێر کاریگەریی هەست و سۆزدا بڕیار مەدە.`
      },
      quote: {
        fa: '"بازار احساسات شما را میشناسد - آنها را از او پنهان کنید."',
        en: '"The market knows your emotions - hide them from it."',
        ku: '"بازاڕ هەستەکانت دەناسێت - لێی بشارەوە."'
      }
    },
    {
      id: 2,
      icon: '📊',
      lucideIcon: TrendingUp,
      color: '#10b981',
      title: {
        fa: 'انضباط معاملاتی',
        en: 'Trading Discipline',
        ku: 'دیسیپلین و ڕێکوپێکیی بازرگانی'
      },
      summary: {
        fa: 'پایبندی به استراتژی - راز تریدرهای حرفهای',
        en: 'Rule adherence - the secret of professional traders',
        ku: 'پابەندبوون بە ستراتیژ - نهێنیی بازرگانانی لێهاتوو'
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
- Avoid revenge trading right after taking a loss`,
        ku: `دیسیپلین واتە هەموو ڕۆژێک لە هەموو مامەڵەیەکدا پابەندبیت بە یاساکانی خۆتەوە بەبێ هیچ جیاوازییەک. تەنانەت ئەگەر جارێک بە شکاندنی یاساکان قازانجت کردبێت، لە درێژخایەندا سەرکەوتوو نابی.

بازرگانە سەرکەوتووەکان وەک ڕۆبۆت کار دەکەن - بڕیاری سۆزداری نادەن، تەنها ستراتیژەکەیان جێبەجێ دەکەن. دەفتەری یاداشتی مامەڵەکانت هەبێت و هەموو مامەڵەیەک بنووسە: بۆچی چوویتە ژوور، بۆچی هاتیتە دەرەوە و هەستت چۆن بوو.

یاسا زێڕینەکان:
- هەرگیز لە یەک مامەڵەدا زیاتر لە ١٪ تا ٢٪ی سەرمایەکەت مەخە مەترسییەوە
- هەمیشە سنوری ڕاگرتنی زیان (Stop Loss) دیاری بکە
- هەرگیز بە هیوای گەڕانەوەی نرخ زیان ڕامەگرە
- دووربکەوە لە مامەڵەی تۆڵەسەندنەوە پاش زیانپێگەیشتن`
      },
      quote: {
        fa: '"انضباط، پل بین اهداف و موفقیت است."',
        en: '"Discipline is the bridge between goals and accomplishment."',
        ku: '"دیسیپلین پردی نێوان ئامانجەکان و سەرکەوتنە."'
      }
    },
    {
      id: 3,
      icon: '💔',
      lucideIcon: AlertCircle,
      color: '#f43f5e',
      title: {
        fa: 'پذیرش ضرر',
        en: 'Accepting Losses',
        ku: 'قبووڵکردنی زیان'
      },
      summary: {
        fa: 'ضرر بخشی از بازی است - یاد بگیرید آن را بپذیرید',
        en: 'Loss is part of the game - learn to accept it',
        ku: 'زیان بەشێکە لە یارییەکە - فێربە قبووڵی بکەیت'
      },
      content: {
        fa: `حتی بهترین تریدرها ۴۰ تا ۵۰ درصد معاملاتشان ضرر است. تفاوت آنها با تریدرهای ناموفق در این است که میدانند چگونه ضررهای کوچک را بپذیرند و از آنها یاد بگیرند.

وقتی معاملهای به حد ضرر میرسد، بدون تردید آن را ببندید. هرگز حد ضرر را جابهجا نکنید یا امیدوار نباشید که قیمت برمیگردد. این امید، حساب شما را خالی میکند.

ضرر یعنی بازار به شما گفت "این سناریو اشتباه بود" - گوش کنید و خارج شوید. یک ضرر ۲٪ میتواند با یک سود ۴٪ جبران شود، اما یک ضرر ۵۰٪ نیاز به سود ۱۰۰٪ دارد.`,
        en: `Even the best traders fail in 40-50% of their trades. The difference between them and unsuccessful ones is that they know how to take small losses gracefully and learn from them.

When a trade hits your stop loss, close it immediately without hesitation. Never move your stop loss or hope the price will reverse. Hope will blow your account.

A loss is just the market telling you "this scenario was wrong". Close it and prepare for the next opportunity. A 2% loss is easily recovered with a 4% profit, but a 50% loss requires a 100% gain to break even.`,
        ku: `تەنانەت باشترین بازرگانانیش لە ٤٠٪ تا ٥٠٪ی مامەڵەکانیاندا زیان دەکەن. جیاوازیی ئەوان لەگەڵ ئەوانی تر ئەوەیە دەزانن چۆن زیانی کەم قبووڵ بکەن و وانەی لێ وەرگرن.

کاتێک مامەڵەیەک دەگاتە سنوری دیاریکراوی زیان، بێ دوودڵی دایبخە. هەرگیز سنوری زیان دوور مەخەرەوە و هیوامەخوازە کە نرخ بگەڕێتەوە. ئەو هیوایە ئەژمێرەکەت بەتاڵ دەکات.

زیان واتە بازاڕ پێت دەڵێت "ئەم شیکارییە هەڵە بوو" - گوێ بگرە و وەرە دەرەوە. زیانی ٢٪ بە قازانجی ٤٪ قەرەبوو دەبێتەوە، بەڵام زیانی ٥٠٪ پێویستی بە ١٠٠٪ قازانجە بۆ گەیشتنەوە بە سەرمایەی سەرەتا.`
      },
      quote: {
        fa: '"ضررهای کوچک، دانشگاه تریدینگ است."',
        en: '"Small losses are the tuition of trading."',
        ku: '"زیانە بچووکەکان، کرێی خوێندنی بازرگانیین."'
      }
    },
    {
      id: 4,
      icon: '⏳',
      lucideIcon: HelpCircle,
      color: '#fbbf24',
      title: {
        fa: 'صبر و شکیبایی',
        en: 'Patience & Waiting',
        ku: 'ئارامگرتن و چاوەڕوانی'
      },
      summary: {
        fa: 'بهترین معاملهها به کسانی که صبر دارند میرسد',
        en: 'The best trades find those who have patience to wait',
        ku: 'باشترین مامەڵەکان بۆ ئەوانەن کە ئارامی دەگرن'
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

If you don't have these, do not trade. Sometimes, cash is a valid position. Save your capital for real, premium opportunities.`,
        ku: `مامەڵەکردن ٩٠٪ چاوەڕوانییە و ١٠٪ جێبەجێکردنە. بازرگانە سەرەتایییەکان وا دەزانن دەبێت هەموو ڕۆژێک مامەڵە بکەن، بەڵام پسپۆڕەکان دەزانن دەبێت چاوەڕێی دەرفەتی زێڕین بن.

دەرفەتی تەواو و بێ وێنە چییە؟
- هەموو نیشاندەرەکان لە یەک ئاراستەدا بن
- قەبارەی بازاڕ پشتگیری ئاراستەکە بکات
- ڕێژەی مەترسی بۆ دەستکەوت لانی کەم ١:٢ بێت
- پشتڕاستکردنەوە لە چەندین تایم‌فرەیمەوە
- سیگناڵی ڕوون لە ستراتیژی سەرەکیی خۆتەوە

ئەگەر هەموو ئەمانەت نەبوو، مامەڵە مەکە. هەندێک جار باشترین مامەڵە، مامەڵەنەکردنە. سەرمایەکەت بپارێزە تا بۆ هەلی ڕاستەقینە ئامادە بیت.`
      },
      quote: {
        fa: '"بازار همیشه باز است - عجلهای نیست."',
        en: '"The market is always open - there is no rush."',
        ku: '"بازاڕ هەمیشە کراوەیە - هیچ پەلەیەک نییە."'
      }
    },
    {
      id: 5,
      icon: '📚',
      lucideIcon: Info,
      color: '#a855f7',
      title: {
        fa: 'یادگیری مداوم',
        en: 'Continuous Education',
        ku: 'فێربوونی بەردەوام'
      },
      summary: {
        fa: 'بازار تغییر میکند - شما هم باید تغییر کنید',
        en: 'The market evolves - and so must you',
        ku: 'بازاڕ دەگۆڕێت - پێویستە تۆش خۆت بگونجێنیت'
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
- Read classic works, analyze charts, and discuss with professionals`,
        ku: `بازاڕە دارایییەکان وەک گیانلەبەرێکی زیندوون کە بەردەوام گۆڕانکارییان بەسەردا دێت. ئەو ستراتیژەی ئەمساڵ کار دەکات، رەنگە ساڵی داهاتوو دەستکەوتی نەبێت.

چۆن فێرببین؟
- ڕۆژانە لانی کەم ٣٠ خولەک چارتەکان بخوێنەرەوە
- دەفتەری وردی مامەڵەکانت تۆمار بکە
- هەفتانە چاو بە مامەڵەکانتدا بخشێنەرەوە
- وانە لە هەڵەکانت فێربە نەک خۆت سەرزەنشت بکەیت
- کتێب بخوێنەرەوە، فیدیۆ ببینە و لەگەڵ بازرگانانی دیکە گفتوگۆ بکە`
      },
      quote: {
        fa: '"سرمایهگذاری روی دانش، بهترین بازده را دارد."',
        en: '"An investment in knowledge pays the best interest."',
        ku: '"وەبەرهێنان لە زانیاریدا باشترین قازانجی هەیە."'
      }
    },
    {
      id: 6,
      icon: '🛡️',
      lucideIcon: ShieldAlert,
      color: '#06b6d4',
      title: {
        fa: 'مدیریت ریسک',
        en: 'Risk Management',
        ku: 'بەڕێوەبردنی مەترسی'
      },
      summary: {
        fa: 'حفظ سرمایه مهمتر از سود است',
        en: 'Preservation of capital is more critical than profits',
        ku: 'پاراستنی سەرمایە لە قازانج گرنگترە'
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
- Risk-Reward: minimum 1:2 (if risking $100, you must aim for $200+ profit)`,
        ku: `یاسای یەکەمی بازرگانی: پارەکەت لەدەست مەدە. یاسای دووەم: یاسای یەکەم لەبیر مەکە.

هاوکێشەی زێڕینی بەڕێوەبردنی مەترسی:
- لە هەر مامەڵەیەکدا: زۆرترین مەترسی ١٪ تا ٢٪ی سەرمایە بێت
- ڕۆژانە: زۆرترین زیان ٦٪ بێت - دوای ئەوە شاشەکەت بکوژێنەرەوە
- دیاریکردنی قەبارەی مامەڵە: بەپێی دووریی سنوری ڕاگرتنی زیان بێت
- ڕێژەی مەترسی بۆ قازانج: لانی کەم ١:٢ (ئەگەر ١٠٠ دۆلار بخەیتە مەترسی، دەبێت لانی کەم ٢٠٠ دۆلار قازانج بکەیت)`
      },
      quote: {
        fa: '"تریدرهای حرفهای ریسک را مدیریت میکنند، نه سود را."',
        en: '"Professional traders manage risk, not profits."',
        ku: '"بازرگانانی پیشەیی مەترسی بەڕێوەدەبەن نەک قازانج."'
      }
    },
    {
      id: 7,
      icon: '🎲',
      lucideIcon: HelpCircle,
      color: '#ec4899',
      title: {
        fa: 'قبول ناپیوستگی نتایج',
        en: 'Probabilistic Thinking',
        ku: 'بیرکردنەوەی ئەگەریی'
      },
      summary: {
        fa: 'تریدینگ یک بازی احتمالات است',
        en: 'Trading is a game of probability, not certainty',
        ku: 'مامەڵەکردن یاریی ئەگەرەکانە نەک دڵنیایی'
      },
      content: {
        fa: `شما نمیتوانید پیشبینی کنید که کدام معامله سودآور است و کدام ضرر. تنها کاری که میتوانید بکنید این است که یک Edge یا مزیت آماری داشته باشید.

Edge یعنی چی؟
اگر استراتژی شما در ۶۰ معامله از ۱۰۰ معامله سود میدهد و ریسک/ریوارد شما ۱:۲ است، شما Edge دارید و در بلند مدت قطعا سودده هستید.`,
        en: `You cannot guarantee whether the next individual trade will win or lose. You can only control your statistical edge over a large sample of trades.

What is a statistical Edge?
If your strategy returns profit on 60 out of 100 entries with a 1:2 R:R ratio, you hold an active edge and will steadily capture profits mathematically over time.`,
        ku: `تۆ ناتوانی پێشبینی بکەیت کام مامەڵە بە قازانج کۆتایی دێت و کامیان بە زیان. تاکە شتێک کە دەتوانی بیکەیت ئەوەیە کە باڵادەستییەکی ئاماریت (Edge) هەبێت.

باڵادەستیی ئاماری چییە؟
ئەگەر ستراتیژەکەت لە ٦٠ مامەڵە لە کۆی ١٠٠ مامەڵەدا قازانج بکات و ڕێژەی مەترسی بۆ قازانجت ١:٢ بێت، تۆ باڵادەستیت هەیە و لە درێژخایەندا بە دڵنیایییەوە سەرکەوتووی.`
      },
      quote: {
        fa: '"در کوتاهمدت، هر اتفاقی ممکن است. در بلندمدت، احتمالات حکم میکنند."',
        en: '"In the short term, anything can happen. In the long term, probabilities rule."',
        ku: '"لە کورتخایەندا هەموو شتێک ئەگەری هەیە، بەڵام لە درێژخایەندا ئەگەرەکان بڕیار دەدەن."'
      }
    },
    {
      id: 8,
      icon: '🧘',
      lucideIcon: Brain,
      color: '#14b8a6',
      title: {
        fa: 'سلامت روان',
        en: 'Mental Well-being',
        ku: 'تەندروستیی دەروونی'
      },
      summary: {
        fa: 'ذهن سالم، معاملات سالم',
        en: 'Healthy mind, healthy trades',
        ku: 'مێشکی ئارام، مامەڵەی تەندروست'
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
- Impulsive and emotional revenge executions`,
        ku: `بازرگانی یەکێکە لە پڕ فشارترین پیشەکان. ئەگەر تەندروستی دەروونی خۆت نەپارێزیت، تەنانەت بە باشترین ستراتیژیش شکست دەهێنیت.

نیشانەکانی مەترسی:
- فشاری بەردەوام و دڵەڕاوکێی زۆر
- سەیرکردنی بەردەوامی نرخەکان لە کاتی پشوو یان لە ناو جێگادا
- نەبوونی خەوێکی ئارام و بەکوالێتی
- بڕیاردانی بەپەلەی تۆڵەسەندنەوە پاش زیان`
      },
      quote: {
        fa: '"بهترین معاملهها وقتی اتفاق میافتند که ذهن شما آرام است."',
        en: '"The best trades happen when your mind is perfectly still."',
        ku: '"باشترین مامەڵەکان ئەوکاتە ڕوودەدەن کە مێشکت بەتەواوی ئارامە."'
      }
    }
  ];

  const isRtl = language === 'fa' || language === 'ku';

  return (
    <div className="space-y-6 pb-20" dir={isRtl ? 'rtl' : 'ltr'}>
      {/* HEADER SECTION */}
      <div>
        <h1 className="text-xl font-black text-white flex items-center gap-2">
          <Brain className="w-5 h-5 text-[#6f87a0]" />
          <span>{language === 'ku' ? 'دەروونناسی بازرگان' : (language === 'fa' ? 'روانشناسی تریدینگ' : 'Trading Psychology')}</span>
        </h1>
        <p className="text-xs text-slate-400 mt-1 flex flex-col gap-1">
          <span>
            {language === 'ku'
              ? 'گرنگترین کارامەیی بۆ سەرکەوتن و مانەوە لە بازاڕە دارایییەکان'
              : (language === 'fa' 
                ? 'مهمترین مهارت برای موفقیت و بقا در بازارهای مالی' 
                : 'The absolute key factor of survival in financial markets')}
          </span>
          <span className="text-[10px] text-slate-500 font-semibold bg-white/2 py-1 px-2.5 rounded-lg border border-white/5 w-fit">
            {language === 'ku'
              ? '📖 سەرچاوە: کتێبی نۆڕۆتریدر (نووسینی د. بەهزاد قوربانی)'
              : (language === 'fa' 
                ? '📖 منبع: کتاب نوروتریدر (اثر دکتر بهزاد قربانی)' 
                : '📖 Source: NeuroTrader Book (Written by Dr. Behzad Ghorbani)')}
          </span>
        </p>
      </div>

      {/* RESPONSIVE LAYOUT CONTAINER */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* LEFT COLUMN: Why mind control is vital & NeuroTrader Podcast Player */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* COMPACT STYLISH PODCAST PLAYER */}
          <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-tr from-[#0b131e]/70 via-[#0a111a]/60 to-[#050b13]/50 border border-white/5 relative overflow-hidden space-y-5 backdrop-blur-xl">
            <style>{`
              @keyframes bounceSynth {
                0% { transform: scaleY(0.25); }
                100% { transform: scaleY(1); }
              }
            `}</style>
            
            {/* Embedded native audio tag for custom file upload */}
            <audio 
              ref={audioRef}
              src={customAudioSrc || undefined}
              onTimeUpdate={() => {
                if (customAudioSrc && audioRef.current) {
                  setCurrentTime(audioRef.current.currentTime);
                }
              }}
              onLoadedMetadata={() => {
                if (customAudioSrc && audioRef.current) {
                  setDuration(audioRef.current.duration);
                }
              }}
              onEnded={() => {
                setIsPlaying(false);
                setCurrentTime(0);
              }}
            />

            <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/[0.03] rounded-full filter blur-2xl pointer-events-none" />
            <div className="absolute -bottom-10 -left-10 w-44 h-44 bg-cyan-500/[0.02] rounded-full filter blur-3xl pointer-events-none" />

            {/* Header: Title and Loader options */}
            <div className="flex justify-between items-start pb-3.5 border-b border-white/5">
              <div className="space-y-1">
                <span className="text-[9px] font-black text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-lg uppercase tracking-wider">
                  {language === 'ku' ? '📻 پۆدکاستی ڕادیۆی دەروونناسی' : (language === 'fa' ? '📻 پادکست رادیو روانشناسی' : '📻 Psychology Audio Podcast')}
                </span>
                <h3 className="text-xs font-black text-white tracking-wide uppercase mt-1">
                  {language === 'ku' ? 'پوختەی دەنگیی کتێبی نۆڕۆتریدر' : (language === 'fa' ? 'خلاصه صوتی کتاب نوروتریدر' : 'NeuroTrader Book Podcast')}
                </h3>
                <p className="text-[10px] text-slate-400">
                  {language === 'ku' ? 'مامۆستا: د. بەهزاد قوربانی' : (language === 'fa' ? 'مدرس: دکتر بهزاد قربانی' : 'Author: Dr. Behzad Ghorbani')}
                </p>
              </div>

              {/* Loader Button */}
              <label className="text-[9.5px] font-bold text-slate-400 hover:text-white transition-all cursor-pointer flex items-center gap-1.5 bg-white/5 px-2.5 py-1.5 rounded-xl border border-white/5 active:scale-95 shadow-lg select-none">
                <Upload className="w-3.5 h-3.5 text-amber-400" />
                <span>{customAudioName ? (customAudioName.length > 12 ? customAudioName.substring(0, 9) + '...' : customAudioName) : (language === 'ku' ? 'بارکردنی دەنگ' : (language === 'fa' ? 'لود پادکست' : 'Upload File'))}</span>
                <input 
                  type="file" 
                  accept="audio/*,video/*" 
                  className="hidden" 
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleAudioFileChange(file);
                  }}
                />
              </label>
            </div>

            {/* Disk art & Active chapter waveform */}
            <div className="flex gap-4 items-center p-3.5 bg-white/[0.02] border border-white/5 rounded-2xl">
              
              {/* Onigama Disc Cover art */}
              <div className="relative w-16 h-16 shrink-0 rounded-2xl bg-gradient-to-tr from-slate-900 via-[#07101a] to-[#040810] border border-white/10 overflow-hidden flex items-center justify-center shadow-lg">
                <div className="absolute inset-0 bg-radial-gradient from-blue-500/20 to-transparent pointer-events-none" />
                
                <motion.div 
                  animate={{ rotate: isPlaying ? 360 : 0 }}
                  transition={{ repeat: Infinity, duration: 8, ease: "linear" }}
                  className="w-12 h-12 rounded-full border border-slate-700/50 flex items-center justify-center relative shadow-[0_0_12px_rgba(59,130,246,0.3)] bg-[#020509]"
                >
                  <div className="absolute inset-1 rounded-full border border-dashed border-sky-500/40" />
                  <Headphones className="w-5 h-5 text-amber-400 relative z-10" />
                  <div className="absolute top-0 right-1 w-2 h-2 bg-sky-400 rounded-full shadow-[0_0_8px_#38bdf8]" />
                </motion.div>
              </div>

              {/* Active Chapter name & visualizer */}
              <div className="flex-1 min-w-0 space-y-1.5">
                <span className="text-[8px] font-black text-sky-400 tracking-widest uppercase block">
                  {language === 'ku' ? `بەشی ${currentChapterIndex + 1} لە ٥` : (language === 'fa' ? `بخش ${currentChapterIndex + 1} از ۵` : `CHAPTER ${currentChapterIndex + 1} OF 5`)}
                </span>
                <p className="text-[11.5px] font-extrabold text-slate-200 uppercase tracking-wide truncate">
                  {language === 'ku' 
                    ? (podcastChapters[currentChapterIndex].title.ku || podcastChapters[currentChapterIndex].title.fa)
                    : (language === 'fa' ? podcastChapters[currentChapterIndex].title.fa : podcastChapters[currentChapterIndex].title.en)}
                </p>
                
                {/* Real-time Web Audio API Spectrograph frequency visualizer */}
                <div className="h-5 w-full pt-0.5 overflow-hidden relative">
                  <canvas 
                    ref={canvasRef} 
                    className="w-full h-full opacity-90"
                    width={180}
                    height={20}
                  />
                </div>
              </div>

            </div>

            {/* Interactive Tactile Waveform Progress Bar */}
            <div className="space-y-2 mt-1 select-none">
              <div className="relative group p-1 bg-white/[0.01] hover:bg-white/[0.02] border border-white/[0.03] rounded-2xl transition-all">
                <div 
                  className="h-10 flex items-end justify-between gap-[2px] cursor-pointer relative"
                  onClick={handleWaveformClick}
                  onMouseMove={handleWaveformMouseMove}
                >
                  {staticWaveform.map((height, idx) => {
                    const progressRatio = currentTime / (duration || 100);
                    const activeIdx = Math.floor(progressRatio * staticWaveform.length);
                    const isActive = idx === activeIdx;
                    const isCompleted = idx < activeIdx;
                    
                    return (
                      <div
                        key={idx}
                        className="flex-1 rounded-t-sm transition-all duration-150"
                        style={{
                          height: `${height}%`,
                          background: isCompleted
                            ? 'linear-gradient(to top, rgba(245, 158, 11, 0.8), rgba(251, 191, 36, 0.95))'
                            : isActive && isPlaying
                              ? 'linear-gradient(to top, rgba(56, 189, 248, 0.9), rgba(14, 165, 233, 1))'
                              : 'rgba(71, 85, 105, 0.45)',
                          boxShadow: isCompleted
                            ? '0 0 3px rgba(245, 158, 11, 0.15)'
                            : isActive && isPlaying
                              ? '0 0 6px rgba(56, 189, 248, 0.5)'
                              : 'none',
                          transform: isActive && isPlaying ? 'scaleY(1.15) translateY(-2px)' : 'none',
                        }}
                      />
                    );
                  })}
                </div>
                
                {/* Drag-for-seeking instruction on hover */}
                <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 bg-[#121b26] text-white border border-white/5 text-[8.5px] px-2 py-0.5 rounded shadow-lg pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap tracking-wide">
                  {language === 'ku' ? '🎛️ کرتە بکە یان ڕابکێشە بۆ پێش و پاش' : (language === 'fa' ? '🎛️ برای جلو/عقب کشیدن کلیک کنید یا بکشید' : '🎛️ Click or Drag to Scrub Timeline')}
                </div>
              </div>
              
              <div className="flex justify-between items-center text-[10px] font-mono text-slate-500 font-bold px-1">
                <span className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-ping" style={{ display: isPlaying ? 'inline-block' : 'none' }} />
                  <span className="text-slate-400">{formatAudioTime(currentTime)}</span>
                </span>
                <span className="text-slate-500">{formatAudioTime(duration)}</span>
              </div>
            </div>

            {/* Audiophile player dashboard controls */}
            <div className="flex justify-between items-center bg-black/40 p-2 rounded-2xl border border-white/5 font-sans">
              
              {/* Playback rate speed selector */}
              <div className="flex items-center gap-1">
                {[1, 1.25, 1.5, 2].map((rate) => (
                  <button
                    key={rate}
                    type="button"
                    onClick={() => setPlaybackRate(rate)}
                    className={`w-7 h-7 rounded-lg text-[9px] font-black transition-all cursor-pointer ${
                      playbackRate === rate 
                        ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                        : 'text-slate-500 hover:text-slate-300'
                    }`}
                  >
                    {rate}x
                  </button>
                ))}
              </div>

              {/* Main control buttons */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handlePrevChapter}
                  className="p-1.5 rounded-xl hover:bg-white/5 text-slate-400 hover:text-white transition-all cursor-pointer"
                  title={language === 'ku' ? 'بەشی پێشوو' : (language === 'fa' ? 'فصل قبلی' : 'Previous chapter')}
                >
                  <ChevronLeft className={`w-4 h-4 ${language === 'fa' || language === 'ku' ? 'transform rotate-180' : ''}`} />
                </button>

                <button
                  type="button"
                  onClick={handlePlayPause}
                  className="w-10 h-10 rounded-full bg-amber-500 hover:bg-amber-400 text-slate-950 flex items-center justify-center transition-all cursor-pointer shadow-[0_0_15px_rgba(245,158,11,0.3)] font-bold active:scale-95 animate-pulse"
                >
                  {isPlaying ? <Pause className="w-5 h-5 fill-slate-950" /> : <Play className="w-5 h-5 fill-slate-950 ml-0.5" />}
                </button>

                <button
                  type="button"
                  onClick={handleNextChapter}
                  className="p-1.5 rounded-xl hover:bg-white/5 text-slate-400 hover:text-white transition-all cursor-pointer"
                  title={language === 'ku' ? 'بەشی دواتر' : (language === 'fa' ? 'فصل بعدی' : 'Next chapter')}
                >
                  <ChevronRight className={`w-4 h-4 ${language === 'fa' || language === 'ku' ? 'transform rotate-180' : ''}`} />
                </button>
              </div>

              {/* Volume sliders */}
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setIsMuted(!isMuted)}
                  className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-all cursor-pointer"
                >
                  {isMuted ? <VolumeX className="w-4 h-4 text-rose-450" /> : <Volume2 className="w-4 h-4 text-amber-400" />}
                </button>
                <input 
                  type="range"
                  min={0}
                  max={1}
                  step={0.05}
                  value={volume}
                  onChange={(e) => {
                    setVolume(parseFloat(e.target.value) || 0.8);
                    setIsMuted(false);
                  }}
                  className="w-12 h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-amber-500"
                />
              </div>

            </div>

            {/* Ambient Alpha Beat frequency toggle switch */}
            <div className="flex justify-between items-center bg-white/[0.015] hover:bg-white/[0.03] duration-150 p-2.5 px-3 rounded-2xl border border-white/[0.04]">
              <div className="flex items-center gap-2.5">
                <Brain className={`w-4 h-4 text-sky-450 ${enableBinaural && isPlaying ? 'animate-pulse' : ''}`} />
                <div className="flex flex-col text-left">
                  <span className="text-[10px] font-bold text-slate-200">
                    {language === 'ku' ? 'فریکوێنسیی پاشبنەما (شەپۆلی ئەلفا)' : (language === 'fa' ? 'فرکانس پس‌زمینه (امواج آلفا دوگوشی)' : 'Binaural Alpha Wave Background')}
                  </span>
                  <span className="text-[8.5px] text-slate-400">
                    {language === 'ku' ? 'تەرکیز زیاد دەکات و مێشک ئارام دەکاتەوە' : (language === 'fa' ? 'امواج شبیه‌ساز مغزی (پیش‌فرض خاموش)' : 'Enhances focus & calms the mind (disabled by default)')}
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setEnableBinaural(!enableBinaural)}
                className={`text-[9.5px] font-black p-1.5 px-3 rounded-xl transition-all cursor-pointer ${
                  enableBinaural 
                    ? 'bg-sky-500/20 text-sky-400 border border-sky-500/30 shadow-[0_0_8px_rgba(56,189,248,0.2)] animate-pulse'
                    : 'bg-white/5 text-slate-400 border border-white/5 hover:text-slate-200'
                }`}
              >
                {enableBinaural ? (language === 'ku' ? 'چالاکە' : (language === 'fa' ? 'روشن' : 'ENABLED')) : (language === 'ku' ? 'ناچالاکە' : (language === 'fa' ? 'خاموش' : 'DISABLED'))}
              </button>
            </div>

            {/* Chapters active details description (Bilingual, matches high edification) */}
            <div className="p-3 bg-white/[0.015] border border-white/5 rounded-2xl relative space-y-1">
              <div className="flex items-center gap-1.5 text-[9.5px] text-amber-300 font-extrabold uppercase">
                <Bookmark className="w-3.5 h-3.5 text-amber-400" />
                <span>{language === 'ku' ? 'ڕوونکردنەوەی ئەم بەشە:' : (language === 'fa' ? 'شرح موضوعی این بخش:' : 'Chapter Core Concept:')}</span>
              </div>
              <p className="text-[10.5px] text-slate-300 leading-relaxed font-medium">
                {language === 'ku'
                  ? (podcastChapters[currentChapterIndex].summary.ku || podcastChapters[currentChapterIndex].summary.fa)
                  : (language === 'fa' ? podcastChapters[currentChapterIndex].summary.fa : podcastChapters[currentChapterIndex].summary.en)}
              </p>
            </div>
          </div>

          {/* CORE INTRO INTRO CARD */}
          <div className="p-5 rounded-3xl glass-card border border-white/5 relative overflow-hidden space-y-4">
            <div className="absolute top-0 right-0 w-24 h-24 bg-[#6f87a0]/5 rounded-full blur-[30px] pointer-events-none" />
            
            <div>
              <h2 className="text-xs font-bold text-[#6f87a0] tracking-wider uppercase mb-2">
                {language === 'ku' ? '💡 بۆچی کۆنتڕۆڵی مێشک گرنگە؟' : (language === 'fa' ? '💡 چرا کنترل ذهن حیاتی است؟' : '💡 Why Is Mind Control Vital?')}
              </h2>
              <p className="text-xs text-slate-300 leading-relaxed">
                {language === 'ku'
                  ? 'زیاتر لە ٩٠٪ی بازرگانان شکست دەهێنن نەک بەهۆی نەبوونی شیکاری یان ئامراز، بەڵکو بەهۆی نەبوونی کۆنتڕۆڵ بەسەر هەست، ترسی لەدەستدان و تەماحدا. بازرگانێکی بەدیسیپلین هەمیشە سەردەکەوێت.'
                  : (language === 'fa' 
                    ? 'بیش از ۹۰٪ معامله‌گران شکست می‌خورند نه به خاطر نداشتن تحلیل یا ابزار، بلکه به خاطر عدم کنترل بر احساسات، هیجانات، و طمع. یک معامله‌گر دیسیپلین‌دار تحت هر شرایطی پیروز است.'
                    : 'Over 90% of retail traders fail not due to lack of technical analyzers, but lack of emotional mastery. A disciplined execution under strict guidance outweighs complex techniques.'
                  )}
              </p>
            </div>

            <div className="p-3 bg-white/2 rounded-2xl border border-white/5 text-center">
              <span className="text-xs font-black text-amber-300">
                {language === 'ku'
                  ? '«مامەڵەکردن ١٠٪ ستراتیژییە و ٩٠٪ دەروونناسییە»'
                  : (language === 'fa' 
                    ? '«تریدینگ ۱۰٪ استراتژی و ۹۰٪ روانشناسی است»' 
                    : '"Trading is 10% Strategy and 90% Psychology"')}
              </span>
            </div>

            <div className="pt-3.5 border-t border-white/5 flex gap-2 items-start">
              <Info className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
              <p className="text-[10px] text-slate-400 leading-relaxed">
                {language === 'ku'
                  ? '✨ ئەم بابەتە دەروونناسییانە لەسەر بنەمای کتێبی «نۆڕۆتریدر»ی دکتۆر بەهزاد قوربانی داڕێژراون کە شارەزایە لە زانستی دەمار و ڕەفتاری بازاڕە دارایییەکان.'
                  : (language === 'fa' 
                    ? '✨ این مباحث روانشناسی و فرآیندهای یادگیری ذهن بر اساس کتاب ارزشمند «نوروتریدر» اثر آقای دکتر بهزاد قربانی تدوین شده‌اند که راهبری برجسته بر نوروساینس و ابعاد رفتاری بازارهای مالی است.' 
                    : '✨ These core mental guides and rules are cited from the masterwork "NeuroTrader" written by Dr. Behzad Ghorbani, an exceptional guide to neuroscience and behavioral aspects of professional trading.')}
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
                      {language === 'ku' ? (tip.title.ku || tip.title.fa) : (language === 'fa' ? tip.title.fa : tip.title.en)}
                    </h3>
                    
                    <div className="flex items-center gap-1.5 flex-row-reverse">
                      {isLocked ? (
                        <span className="text-[8.5px] font-bold text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-lg flex items-center gap-1 select-none animate-pulse">
                          <Lock className="w-2.5 h-2.5 text-amber-400 font-bold" />
                          <span>{language === 'ku' ? 'تایبەت بە VIP' : (language === 'fa' ? 'ویژهٔ VIP' : 'VIP ONLY')}</span>
                        </span>
                      ) : (
                        <span className={`text-[10px] text-slate-500 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}>
                          ▼
                        </span>
                      )}
                    </div>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-1">
                    {language === 'ku' ? (tip.summary.ku || tip.summary.fa) : (language === 'fa' ? tip.summary.fa : tip.summary.en)}
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
                            {language === 'ku' ? (tip.content.ku || tip.content.fa) : (language === 'fa' ? tip.content.fa : tip.content.en)}
                          </p>
                          
                          <div 
                            className="p-3.5 rounded-2xl text-[11px] font-medium leading-relaxed"
                            style={{ 
                              backgroundColor: `${tip.color}10`, 
                              borderColor: tip.color,
                              color: tip.color,
                              borderLeftWidth: (language === 'fa' || language === 'ku') ? '0px' : '2px',
                              borderRightWidth: (language === 'fa' || language === 'ku') ? '2px' : '0px',
                            }}
                          >
                            {language === 'ku' ? (tip.quote.ku || tip.quote.fa) : (language === 'fa' ? tip.quote.fa : tip.quote.en)}
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
      <div className="p-5 rounded-3xl glass-card border border-white/5 bg-gradient-to-tr from-white/2 to-transparent space-y-3" dir={language === 'fa' || language === 'ku' ? 'rtl' : 'ltr'}>
        <h3 className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
          <CheckCircle2 className="w-3.5 h-3.5 text-amber-300" />
          <span>{language === 'ku' ? 'پوختەی زێڕینی دیسیپلینی بازرگان' : (language === 'fa' ? 'خلاصه طلایی دیسیپلین تریدر' : 'Ultimate Trader Checklist')}</span>
        </h3>
        
        <ul className="space-y-2 text-[11px] text-slate-300">
          <li className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 bg-[#6f87a0] rounded-full shrink-0" />
            <span>{language === 'ku' ? 'کۆنتڕۆڵی هەستەکانت بکە - نەک ئەوان کۆنتڕۆڵت بکەن' : (language === 'fa' ? 'احساسات را کنترل کنید - نه اینکه آن‌ها شما را کنترل کنند' : 'Take full control of your emotions - keep ego out')}</span>
          </li>
          <li className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 bg-[#6f87a0] rounded-full shrink-0" />
            <span>{language === 'ku' ? 'پابەندبە بە پلانی مامەڵەکردنت بە وردی' : (language === 'fa' ? 'به پلن معاملاتی خود پایبند بمانید' : 'Stick to your preset plans with clockwork consistency')}</span>
          </li>
          <li className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 bg-[#6f87a0] rounded-full shrink-0" />
            <span>{language === 'ku' ? 'زیانی بچووک قبووڵ بکە و وانەی لێ وەرگرە' : (language === 'fa' ? 'ضرر را کوچک بپذیرید و از آن یاد بگیرید' : 'Accept small losses without dynamic stop-loss dragging')}</span>
          </li>
          <li className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 bg-[#6f87a0] rounded-full shrink-0" />
            <span>{language === 'ku' ? 'ئارامبە و چاوەڕێی دەرفەتی زێڕین بکە' : (language === 'fa' ? 'صبور بمانید و دنبال فرصتهای طلایی باشید' : 'Be exceptionally patient - wait for optimum high-probability setups')}</span>
          </li>
          <li className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 bg-[#6f87a0] rounded-full shrink-0" />
            <span>{language === 'ku' ? 'بەڕێوەبردنی مەترسی (١٪ تا ٢٪ لە هەر مامەڵەیەکدا)' : (language === 'fa' ? 'ریسک دیسیپلین را مدیریت کنید (۱٪ تا ۲٪ در هر معامله)' : 'Manage your sizing accurately (never risk over 1% to 2% per run)')}</span>
          </li>
        </ul>
      </div>

         {/* GOOGLE PLAY BILLING SIMULATOR / PREMIUM LOCK WARNING MODAL */}
         <AnimatePresence>
           {showLockModal && (
             <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 transition-all duration-300 font-sans" dir={language === 'fa' || language === 'ku' ? 'rtl' : 'ltr'}>
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
                       <span>{language === 'ku' ? 'ئابوونەی زێڕینی Onigama (VIP)' : (language === 'fa' ? 'عضویت طلایی اونیگاما (VIP)' : 'Onigama VIP Premium')}</span>
                     </h3>
                     <p className="text-xs text-slate-300 leading-relaxed font-sans font-medium">
                       {language === 'ku'
                         ? 'شیکاریی تەکنیکە پێشکەوتووەکانی دەروونناسی و بەڕێوەبردنی هەستەکان تایبەتە بە ئەندامانی زێڕینی Onigama. بە چالاککردنی لایسەنس لە ڕێکخستنەکان، دەستبەجێ ئەپەکە بەتەواوی بکەرەوە!'
                         : (language === 'fa' 
                           ? 'بررسی تکنیک‌های پیشرفته بهبود ذهن (انضباط، روانشناسی پذیرش ضرر، یادگیری پایدار و سلامت روان تریدر) مخصوص اعضای طلایی اونیگاما است. با فعال‌سازی لایسنس آزمایشی در تنظیمات، فوراً کل برنامه را فعال کنید!'
                           : 'Advanced psychological blueprints and emotional mastery analysis are exclusive to VIP members.')}
                     </p>
                     <p className="text-[10px] text-slate-500 font-sans font-semibold">
                       {language === 'ku'
                         ? '💡 لایسەنسی تاقیکاریی بێبەرامبەر لە بەشی «ڕێکخستنەکان» بەردەستە.'
                         : (language === 'fa'
                           ? '💡 لایسنس‌های آزمایشی کاملاً رایگان در صفحه «تنظیمات» درج شده است.'
                           : '💡 Free test licenses are accessible on the "Settings" tab.')}
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
                       <span>{language === 'ku' ? '🔑 چوون بۆ چالاککردنی لایسەنس' : (language === 'fa' ? '🔑 رفتن به فعال‌سازی لایسنس' : '🔑 Grab Activation Key')}</span>
                     </button>
                   )}
                   <button
                     onClick={() => setShowLockModal(false)}
                     className="py-2 px-4 bg-white/5 hover:bg-white/10 text-slate-300 font-bold rounded-xl text-xs transition-all cursor-pointer text-center"
                   >
                     {language === 'ku' ? 'داخستن' : (language === 'fa' ? 'بستن' : 'Dismiss')}
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
