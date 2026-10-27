import React, { useState, useMemo, useEffect, useRef } from 'react';
import { 
  Printer, 
  ZoomIn, 
  ZoomOut, 
  RotateCcw, 
  Share2, 
  ArrowLeft, 
  X, 
  Calendar, 
  Clock, 
  Layers, 
  FileText, 
  Sparkles, 
  Eye, 
  Check, 
  Maximize2, 
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Bookmark,
  Volume2
} from 'lucide-react';
import { Article, SiteSettings, AdSlot } from '../../types/news';
import { useSiteConfig } from '../../context/SiteConfigContext';
import { WeatherPrayerWidget } from '../Widgets/WeatherPrayerWidget';
import { UniversalAdSlot } from '../Ads/UniversalAdSlot';

interface EPaperViewProps {
  articles: Article[];
  settings?: SiteSettings;
  adSlots?: AdSlot[];
  darkMode: boolean;
  lang: 'bn' | 'en';
  onSelectArticle: (article: Article) => void;
  onBackToPortal: () => void;
}

interface PageConfig {
  pageNumber: number;
  nameBn: string;
  nameEn: string;
  sectionCode: string;
  categoryFilter: string[];
}

export const EPaperView: React.FC<EPaperViewProps> = ({
  articles,
  settings: propSettings,
  adSlots = [],
  darkMode,
  lang,
  onSelectArticle,
  onBackToPortal,
}) => {
  const siteConfig = useSiteConfig();
  const settings = propSettings || siteConfig.settings;
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [zoomLevel, setZoomLevel] = useState<number>(100);
  const [isFitToScreen, setIsFitToScreen] = useState<boolean>(true);
  const [windowWidth, setWindowWidth] = useState<number>(() => {
    if (typeof window !== 'undefined') return window.innerWidth;
    return 1240;
  });
  const [canvasHeight, setCanvasHeight] = useState<number>(1850);
  const newspaperRef = useRef<HTMLDivElement>(null);
  const [selectedDayOffset, setSelectedDayOffset] = useState<number>(0);
  const [readingArticle, setReadingArticle] = useState<Article | null>(null);
  const [modalFontSize, setModalFontSize] = useState<number>(16);
  const [copyToast, setCopyToast] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  // Track window resizing for responsive auto-fit scaling
  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Measure actual rendered canvas height for flawless wrapper containment
  useEffect(() => {
    const node = newspaperRef.current;
    if (!node) return;
    const updateHeight = () => {
      if (node.scrollHeight > 0) {
        setCanvasHeight(Math.max(1200, node.scrollHeight));
      }
    };
    updateHeight();
    const ro = new ResizeObserver((entries) => {
      for (const entry of entries) {
        if (entry.contentRect.height > 0) {
          setCanvasHeight(Math.max(1200, Math.round(node.scrollHeight || entry.contentRect.height)));
        }
      }
    });
    ro.observe(node);
    return () => ro.disconnect();
  }, [currentPage, selectedDayOffset]);

  // Proportional Fit-to-Screen Auto Scale Factor
  // Ensures entire broadsheet fits completely within mobile screen width with zero clipping
  const autoFitScale = useMemo(() => {
    if (windowWidth >= 1280) return 1;
    // Leave 16px horizontal breathing room so broadsheet margins never touch or clip
    const available = Math.max(280, windowWidth - 16);
    return Math.min(1, available / 1240);
  }, [windowWidth]);

  const effectiveScale = (isFitToScreen ? autoFitScale : 1) * (zoomLevel / 100);

  // Close modal on Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setReadingArticle(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Bengali Number Formatter
  const toBn = (num: number | string): string => {
    const banglaDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
    return num.toString().replace(/\d/g, (d) => banglaDigits[parseInt(d, 10)] || d);
  };

  // Past 7 Days Archive Generator with Gregorian, Bangla Seasonal & Hijri dates
  const past7Days = useMemo(() => {
    const days = [];
    const baseDate = new Date();
    const bnDays = ['রবিবার', 'সোমবার', 'মঙ্গলবার', 'বুধবার', 'বৃহস্পতিবার', 'শুক্রবার', 'শনিবার'];
    const bnMonths = [
      'জানুয়ারি', 'ফেব্রুয়ারি', 'মার্চ', 'এপ্রিল', 'মে', 'জুন',
      'জুলাই', 'আগস্ট', 'সেপ্টেম্বর', 'অক্টোবর', 'নভেম্বর', 'ডিসেম্বর'
    ];

    for (let i = 0; i < 7; i++) {
      const d = new Date(baseDate);
      d.setDate(baseDate.getDate() - i);
      const dayName = bnDays[d.getDay()];
      const dayNum = d.getDate();
      const monthName = bnMonths[d.getMonth()];

      const labelBn = i === 0 ? 'আজকের মুদ্রিত রূপ' : i === 1 ? 'গতকাল' : `${toBn(dayNum)} ${monthName}`;
      const fullDateBn = `${dayName}, ${toBn(dayNum)} ${monthName} ২০২৬`;
      const fullDateEn = d.toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'short', year: 'numeric' });

      // Mid-October corresponds to Bengali month Kartik (e.g. 17 Oct = 1 Kartik 1433)
      const kDay = 1 - i <= 0 ? 30 + (1 - i) : 1 - i;
      const kMonth = i === 0 ? '১ কার্তিক ১৪৩৩' : `${toBn(kDay)} ${i > 1 ? 'আশ্বিন' : 'কার্তিক'} ১৪৩৩`;
      const hijriDate = `${toBn(Math.max(1, 5 - i))} জমাদিউল আউয়াল ১৪৪৬`;

      days.push({
        offset: i,
        labelBn,
        dayName,
        dayNum: toBn(dayNum),
        monthName,
        fullDateBn,
        fullDateEn,
        banglaSeasonalDate: kMonth,
        hijriDate,
      });
    }
    return days;
  }, []);

  const activeDateInfo = past7Days[selectedDayOffset] || past7Days[0];

  // 8-Page Broadsheet Page Structure
  const pageConfigs: PageConfig[] = [
    {
      pageNumber: 1,
      nameBn: 'প্রথম পাতা (জাতীয় ও প্রধান খবর)',
      nameEn: 'Page 1: Front Page & National Lead',
      sectionCode: 'প্রধান খবর',
      categoryFilter: ['জাতীয়', 'জাতীয়', 'প্রধান', 'রাজনীতি'],
    },
    {
      pageNumber: 2,
      nameBn: 'দ্বিতীয় পাতা (রাজধানী ও নগর জীবন)',
      nameEn: 'Page 2: City & Capital Affairs',
      sectionCode: 'মহানগর পরিক্রমা',
      categoryFilter: ['সারাদেশ', 'আইন-আদালত', 'অপরাধ', 'জাতীয়'],
    },
    {
      pageNumber: 3,
      nameBn: 'তৃতীয় পাতা (মতামত, বিশ্লেষণ ও সম্পাদকীয়)',
      nameEn: 'Page 3: Editorial & Columns',
      sectionCode: 'সম্পাদকীয় ও মতামত',
      categoryFilter: ['মতামত', 'কলাম', 'বিশ্লেষণ', 'রাজনীতি'],
    },
    {
      pageNumber: 4,
      nameBn: 'চতুর্থ পাতা (আন্তর্জাতিক ও বিশ্বসংবাদ)',
      nameEn: 'Page 4: International & World',
      sectionCode: 'বিশ্ব পরিক্রমা',
      categoryFilter: ['আন্তর্জাতিক', 'বিশ্ব', 'প্রবাস'],
    },
    {
      pageNumber: 5,
      nameBn: 'পঞ্চম পাতা (বাণিজ্য, শেয়ারবাজার ও অর্থনীতি)',
      nameEn: 'Page 5: Business & Economy',
      sectionCode: 'অর্থনীতি ও বাণিজ্য',
      categoryFilter: ['অর্থনীতি', 'বাণিজ্য', 'শেয়ারবাজার', 'ব্যাংক'],
    },
    {
      pageNumber: 6,
      nameBn: 'ষষ্ঠ পাতা (খেলার মাঠ ও ক্রীড়াঙ্গন)',
      nameEn: 'Page 6: Sports & Cricket',
      sectionCode: 'খেলার দুনিয়া',
      categoryFilter: ['খেলা', 'খেলাধুলা', 'ক্রিকেট', 'ফুটবল'],
    },
    {
      pageNumber: 7,
      nameBn: 'সপ্তম পাতা (বিনোদন, শিল্প ও সংস্কৃতি)',
      nameEn: 'Page 7: Entertainment & Culture',
      sectionCode: 'রঙিন ভুবন',
      categoryFilter: ['বিনোদন', 'লাইফস্টাইল', 'জীবনযাপন', 'চলচ্চিত্র'],
    },
    {
      pageNumber: 8,
      nameBn: 'অষ্টম পাতা (শেষ পাতা ও তথ্যপ্রযুক্তি)',
      nameEn: 'Page 8: Back Page & Tech Special',
      sectionCode: 'শেষ পাতা ও প্রযুক্তি',
      categoryFilter: ['প্রযুক্তি', 'বিজ্ঞান ও প্রযুক্তি', 'শিক্ষা', 'সারাদেশ'],
    },
  ];

  const activePageConfig = pageConfigs.find(p => p.pageNumber === currentPage) || pageConfigs[0];

  // Distribute news articles intelligently for authentic broadsheet columns
  const pageArticles = useMemo(() => {
    const valid = articles.filter(a => a.status !== 'rejected');
    const matched = valid.filter(a => 
      activePageConfig.categoryFilter.some(cat => a.category?.includes(cat) || a.title?.includes(cat))
    );

    const pool = matched.length >= 6 ? matched : [...matched, ...valid.filter(a => !matched.includes(a))];

    // Priority ordering
    const sorted = [...pool].sort((a, b) => {
      if (a.isLead && !b.isLead) return -1;
      if (!a.isLead && b.isLead) return 1;
      if (a.isBreaking && !b.isBreaking) return -1;
      if (!a.isBreaking && b.isBreaking) return 1;
      return 0;
    });

    const lead = sorted[0] || valid[0] || null;
    const col1Articles = sorted.slice(1, 3);
    const col2Articles = sorted.slice(3, 5);
    const col3Articles = sorted.slice(5, 7);
    const col4Articles = sorted.slice(7, 10);

    return {
      lead,
      col1Articles,
      col2Articles,
      col3Articles,
      col4Articles,
    };
  }, [articles, activePageConfig]);

  // Top 4 Ear News Highlights for Sub-Masthead (Matching the reference layout)
  const earArticles = useMemo(() => {
    const valid = articles.filter(a => a.status !== 'rejected' && a.id !== pageArticles.lead?.id);
    const withImages = valid.filter(a => a.imageUrl);
    return (withImages.length >= 4 ? withImages : valid).slice(0, 4);
  }, [articles, pageArticles.lead]);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopyToast(true);
    setTimeout(() => setCopyToast(false), 3000);
  };

  const handlePrint = () => {
    window.print();
  };

  const toggleSpeech = (text: string) => {
    if (!('speechSynthesis' in window)) return;
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    } else {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'bn-BD';
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);
      window.speechSynthesis.speak(utterance);
      setIsSpeaking(true);
    }
  };

  // Paper Tone Configuration (Crisp White broadsheet aesthetic like Bangladesh Pratidin)
  const paperTone = settings?.epaperConfig?.paperTone || 'crisp_white';
  const paperBgColor = paperTone === 'crisp_white'
    ? '#ffffff'
    : paperTone === 'natural_newsprint'
    ? '#faf9f5'
    : '#fdfcf7';

  // Dedicated E-Paper Logo or Main Logo
  const epaperLogoToUse = settings?.epaperConfig?.epaperLogoUrl || settings?.lightLogoUrl;
  const logoMaxHeight = settings?.epaperConfig?.epaperLogoHeight || 75;

  return (
    <div className="min-h-screen bg-[#f4f3ee] text-slate-900 font-solaiman antialiased selection:bg-red-200 selection:text-red-950 pb-20">
      
      {/* Toast Notification */}
      {copyToast && (
        <div className="fixed top-5 right-5 z-50 bg-slate-900 text-amber-200 border border-amber-400 px-4 py-2 rounded shadow-2xl flex items-center gap-2 text-xs font-bold animate-in fade-in">
          <Check className="w-4 h-4 text-emerald-400" />
          <span>ই-পেপারের লিংক কপি করা হয়েছে!</span>
        </div>
      )}

      {/* TOP CONTROLS & ARCHIVE TOOLBAR (Sticky Professional Nav) */}
      <header className="no-print sticky top-0 z-40 bg-slate-900 border-b border-slate-800 text-slate-100 shadow-md px-4 py-2.5">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
          
          {/* Back & Title */}
          <div className="flex items-center gap-3">
            <button
              onClick={onBackToPortal}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-colors border border-slate-700 cursor-pointer"
              title="মূল অনলাইন পোর্টালে ফিরে যান"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>অনলাইন পোর্টাল</span>
            </button>

            <div className="h-5 w-px bg-slate-700" />

            <div className="flex items-center gap-2">
              <span className="text-white font-black text-sm tracking-wide">
                মুদ্রিত ব্রডশিট ই-পেপার
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-600/30 text-red-300 border border-red-500/40">
                প্রিন্ট সংস্করণ
              </span>
            </div>
          </div>

          {/* Date Picker (7-Day Archive) */}
          <div className="flex items-center gap-1 overflow-x-auto py-1 max-w-full">
            <span className="text-[11px] text-slate-400 mr-1 flex items-center gap-1 shrink-0">
              <Calendar className="w-3.5 h-3.5 text-red-500" />
              <span>তারিখ:</span>
            </span>
            {past7Days.map((d) => {
              const isSelected = selectedDayOffset === d.offset;
              return (
                <button
                  key={d.offset}
                  onClick={() => setSelectedDayOffset(d.offset)}
                  className={`px-2.5 py-1 rounded text-[11px] font-bold whitespace-nowrap transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-red-600 text-white shadow-xs'
                      : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                  }`}
                >
                  {d.labelBn}
                </button>
              );
            })}
          </div>

          {/* Zoom, Screen-Fit, Print & Share Controls */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Screen-Fit Toggle (Guarantees Full Broadsheet Page Fits on Mobile Screens) */}
            <button
              onClick={() => {
                setIsFitToScreen((prev) => !prev);
                setZoomLevel(100);
              }}
              className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer border ${
                isFitToScreen
                  ? 'bg-red-600 text-white border-red-500 shadow-xs'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
              }`}
              title={isFitToScreen ? 'ফিট-টু-স্ক্রিন সক্রিয় (পুরো ব্রডশিট পৃষ্ঠা স্ক্রিনে দৃশ্যমান)' : 'আসল আকার ভিউ'}
            >
              <Maximize2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">স্ক্রিন ফিট</span>
            </button>

            <div className="flex items-center bg-slate-800 rounded-lg border border-slate-700 p-0.5 text-xs">
              <button
                onClick={() => setZoomLevel((z) => Math.max(z - 15, 30))}
                className="p-1 hover:text-red-400 text-slate-300 transition-colors cursor-pointer"
                title="ছোট করুন"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
              <span className="px-1.5 font-mono text-[11px] text-slate-300 font-bold min-w-[38px] text-center">
                {Math.round(effectiveScale * 100)}%
              </span>
              <button
                onClick={() => setZoomLevel((z) => Math.min(z + 15, 250))}
                className="p-1 hover:text-red-400 text-slate-300 transition-colors cursor-pointer"
                title="বড় করুন"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => {
                  setZoomLevel(100);
                  setIsFitToScreen(true);
                }}
                className="p-1 hover:text-red-400 text-slate-400 border-l border-slate-700 transition-colors cursor-pointer"
                title="রিসেট (স্ক্রিন ফিট)"
              >
                <RotateCcw className="w-3 h-3" />
              </button>
            </div>

            <button
              onClick={handlePrint}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-bold transition-colors cursor-pointer shadow-xs"
              title="ব্রডশিট পৃষ্ঠা প্রিন্ট করুন"
            >
              <Printer className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">প্রিন্ট</span>
            </button>

            <button
              onClick={handleCopyLink}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs border border-slate-700 transition-colors cursor-pointer"
              title="ই-পেপার লিংক কপি করুন"
            >
              <Share2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Page Switcher Bar */}
        <div className="max-w-7xl mx-auto pt-2 mt-1 border-t border-slate-800/80 flex items-center justify-between gap-2 overflow-x-auto">
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] text-slate-400 flex items-center gap-1 mr-1">
              <Layers className="w-3.5 h-3.5 text-red-500" />
              <span>পাতা নির্বাচন:</span>
            </span>
            {pageConfigs.map((p) => {
              const isSelected = p.pageNumber === currentPage;
              return (
                <button
                  key={p.pageNumber}
                  onClick={() => setCurrentPage(p.pageNumber)}
                  className={`px-3 py-1 rounded text-xs font-bold transition-all border cursor-pointer ${
                    isSelected
                      ? 'bg-red-600 text-white border-red-600 shadow-xs'
                      : 'bg-slate-800/80 hover:bg-slate-700 text-slate-300 border-slate-700'
                  }`}
                >
                  <span>পাতা {toBn(p.pageNumber)}</span>
                  <span className="hidden md:inline text-[10px] opacity-80 ml-1">
                    ({p.sectionCode})
                  </span>
                </button>
              );
            })}
          </div>

          <div className="text-[11px] text-slate-400 hidden lg:flex items-center gap-2">
            <span>ক্লিকযোগ্য ব্রডশিট: যেকোনো শিরোনামে ক্লিক করে পুরো সংবাদ পড়ুন</span>
          </div>
        </div>
      </header>

      {/* MAIN NEWSPAPER CANVAS CONTAINER (Full-Page Broadsheet Scaled to Fit Mobile & Synchronized) */}
      <div className="w-full max-w-full overflow-x-auto overflow-y-visible px-1 sm:px-4 pt-3 sm:pt-4 pb-16 flex flex-col items-center">
        
        {/* Broadsheet Quick Page Navigation / Page-Flip Bar */}
        <div 
          style={{ width: `${Math.min(1240, Math.max(280, Math.round(1240 * effectiveScale)))}px` }}
          className="max-w-[1240px] mb-3 flex items-center justify-between text-xs text-slate-700 font-solaiman no-print px-1 transition-all"
        >
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage <= 1}
            className="flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3.5 py-1.5 rounded-lg bg-slate-800 text-white font-bold text-xs disabled:opacity-40 hover:bg-red-600 transition-colors cursor-pointer shadow-xs"
            title="পূর্ববর্তী পৃষ্ঠা উল্টান"
          >
            <ChevronLeft className="w-4 h-4" />
            <span className="hidden sm:inline">পূর্ববর্তী পাতা</span>
            <span className="sm:hidden">পূর্ববর্তী</span>
          </button>
          
          <div className="flex items-center gap-1 sm:gap-2 text-center">
            <span className="font-bold text-slate-800 bg-white px-2.5 sm:px-3.5 py-1 rounded border border-slate-300 shadow-2xs text-[11px] sm:text-xs">
              পাতা {toBn(currentPage)} / {toBn(pageConfigs.length)} • {activePageConfig.sectionCode}
            </span>
            <span className="text-[11px] text-slate-500 hidden md:inline">
              (মুদ্রিত ব্রডশিট লেআউট)
            </span>
          </div>

          <button
            onClick={() => setCurrentPage((p) => Math.min(pageConfigs.length, p + 1))}
            disabled={currentPage >= pageConfigs.length}
            className="flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3.5 py-1.5 rounded-lg bg-slate-800 text-white font-bold text-xs disabled:opacity-40 hover:bg-red-600 transition-colors cursor-pointer shadow-xs"
            title="পরবর্তী পৃষ্ঠা উল্টান"
          >
            <span className="hidden sm:inline">পরবর্তী পাতা</span>
            <span className="sm:hidden">পরবর্তী</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Top Leaderboard Broadsheet Ad */}
        <div 
          style={{ width: `${Math.min(1240, Math.max(280, Math.round(1240 * effectiveScale)))}px` }}
          className="max-w-[1240px] mb-3 no-print flex justify-center overflow-hidden"
        >
          <UniversalAdSlot position="epaper_top" adSlots={adSlots} darkMode={false} />
        </div>

        {/* Scaled Canvas Container Wrapper (Guarantees entire broadsheet fits inside screen without clipping) */}
        <div
          className="epaper-canvas-wrapper flex justify-center items-start transition-all duration-150 mx-auto"
          style={{
            width: `${Math.round(1240 * effectiveScale)}px`,
            height: `${Math.round(canvasHeight * effectiveScale)}px`,
            position: 'relative',
            overflow: effectiveScale > 1 ? 'auto' : 'hidden',
          }}
        >
          {/* Physical Newspaper Sheet with Pristine Broadsheet Newsprint Background */}
          <div
            ref={newspaperRef}
            id="newspaper-print-canvas"
            style={{
              transform: `scale(${effectiveScale})`,
              transformOrigin: 'top left',
              backgroundColor: paperBgColor,
              color: '#0f172a',
              width: '1240px',
              position: 'absolute',
              top: 0,
              left: 0,
            }}
            className="newspaper-paper w-[1240px] min-w-[1240px] shrink-0 bg-white border border-[#cbd5e1] shadow-[0_8px_30px_rgba(0,0,0,0.08),_0_2px_8px_rgba(0,0,0,0.04)] p-6 select-text rounded-xs"
          >
          
          {/* ========================================================= */}
          {/* 1. CLASSIC PROFESSIONAL BROADSHEET MASTHEAD (মুদ্রিত রূপ) */}
          {/* ========================================================= */}
          <header className="border-b-2 border-black pb-2.5 mb-4">
            
            {/* Top Micro-Rule Bar: Issue, Registration, Edition & Price */}
            <div className="flex items-center justify-between text-[11px] text-slate-800 border-b border-black pb-1 mb-2 font-serif-bangla">
              <div className="flex items-center gap-2 sm:gap-4">
                <span className="font-bold">{settings?.epaperConfig?.editionDetails || `ঢাকা | বর্ষ ১৭ | সংখ্যা ${toBn(200 + selectedDayOffset)}`}</span>
                <span>•</span>
                <span>রেজিস্ট্রেশন নং: ডিএ-১৯৪৫</span>
                <span>•</span>
                <span className="bg-red-700 text-white px-2 py-0.2 text-[10px] font-bold rounded-xs">
                  {settings?.epaperConfig?.editionName || 'দ্বিতীয় সংস্করণ'}
                </span>
              </div>
              <div className="flex items-center gap-2 sm:gap-4 font-bold text-slate-900">
                <span>{activeDateInfo.fullDateBn}</span>
                <span>•</span>
                <span>{settings?.epaperConfig?.pagePriceDetails || '১২ পৃষ্ঠা | ১০ টাকা'}</span>
                <span>•</span>
                <span className="bg-black text-white px-2 py-0.2 text-[10px] uppercase font-mono">
                  পৃষ্ঠা: {toBn(currentPage)}/{toBn(8)}
                </span>
              </div>
            </div>

            {/* Tri-Part Masthead: Left Box (Edition Details), Center (Clean Logo & Slogan), Right Box (3 Calendars) */}
            <div className="grid grid-cols-12 items-center gap-3 py-2 border-b border-black">
              
              {/* Left Box: Edition, Issue, Pages/Price & Website */}
              <div className="flex col-span-3 border border-slate-300 p-2.5 text-[11px] flex-col justify-between h-full bg-slate-50/80">
                <div>
                  <span className="inline-block bg-red-600 text-white font-bold text-[10px] px-2 py-0.5 rounded-xs mb-1">
                    {settings?.epaperConfig?.editionName || 'দ্বিতীয় সংস্করণ'}
                  </span>
                  <p className="font-bold text-slate-900 leading-tight">
                    {settings?.epaperConfig?.editionDetails || `ঢাকা | বর্ষ ১৭ | সংখ্যা ${toBn(200 + selectedDayOffset)}`}
                  </p>
                  <p className="text-slate-700 text-[10.5px] mt-0.5 font-medium">
                    {settings?.epaperConfig?.pagePriceDetails || '১২ পৃষ্ঠা | ১০ টাকা'}
                  </p>
                </div>
                <div className="pt-1.5 mt-1.5 border-t border-slate-200">
                  <a 
                    href={`https://${settings?.epaperConfig?.websiteDisplayUrl || settings?.domain || 'dailybangladesh.com'}`} 
                    target="_blank" 
                    rel="noreferrer" 
                    className="font-mono text-[10.5px] text-blue-700 hover:underline block truncate"
                  >
                    {settings?.epaperConfig?.websiteDisplayUrl || `www.${settings?.domain || 'dailybangladesh.com'}`}
                  </a>
                </div>
              </div>

              {/* Center Box: Authentic Slogan Banner + Clean Masthead Logo (NO REDUNDANT TEXT!) (Requirement 1) */}
              <div className="col-span-6 text-center flex flex-col items-center justify-center">
                {/* Top Slogan Badge / Circulation Line (matching reference layout) */}
                <div className="mb-1.5 flex flex-col items-center">
                  <span className="inline-block px-2.5 py-0.5 border border-red-600/80 text-[10.5px] font-bold text-red-700 bg-red-50/60 rounded-xs mb-0.5">
                    {settings?.epaperConfig?.sloganBoxText || 'আমরা জনগণের পক্ষে'}
                  </span>
                  <span className="text-[11px] font-black tracking-widest text-slate-800 font-serif-bangla uppercase">
                    {settings?.epaperConfig?.circulationClaim || 'বা ংলা দে শের  স র্বাধি ক  প্র চা রি ত  জা তী য়  দৈ নি ক'}
                  </span>
                </div>

                {/* Main Logo - PURE, CRISP & UNCLUTTERED */}
                {epaperLogoToUse ? (
                  <div className="flex items-center justify-center py-1">
                    <img 
                      src={epaperLogoToUse} 
                      alt={settings?.siteName || 'নিউজ পোর্টাল'} 
                      style={{ 
                        maxHeight: `${logoMaxHeight}px`
                      }}
                      className="object-contain max-w-[95%] mx-auto" 
                    />
                  </div>
                ) : (
                  <h1 className="text-4xl sm:text-6xl md:text-7xl font-black tracking-tight font-serif-bangla leading-none my-1">
                    <span className="text-red-600 font-extrabold">{settings?.siteName?.slice(0, 4) || 'দৈনিক'}</span>
                    <span className="text-slate-950">{settings?.siteName?.slice(4) || ' বাংলাদেশ'}</span>
                  </h1>
                )}

                {/* Only render text if explicitly toggled on by admin; otherwise KEEP CLEAN (Requirement 1) */}
                {settings?.epaperConfig?.showSiteNameWithLogo && epaperLogoToUse && (
                  <span className="text-sm font-bold text-slate-800 font-serif-bangla mt-1">
                    {settings?.siteName}
                  </span>
                )}
              </div>

              {/* Right Box: Triple Calendar (Gregorian, Bangla Seasonal, Hijri Date) */}
              <div className="flex col-span-3 border border-slate-300 p-2.5 text-[11px] flex-col justify-between h-full bg-slate-50/80 text-right">
                <div>
                  <h3 className="text-base font-black text-slate-950 font-serif-bangla leading-tight">
                    {activeDateInfo.dayName}
                  </h3>
                  <p className="text-xs font-bold text-red-700 mt-0.5">
                    {activeDateInfo.dayNum} {activeDateInfo.monthName} ২০২৬
                  </p>
                </div>
                <div className="pt-1.5 mt-1.5 border-t border-slate-200 text-slate-700 text-[10px] space-y-0.5 font-serif-bangla">
                  <p className="font-semibold text-slate-800">{activeDateInfo.banglaSeasonalDate || '১ কার্তিক ১৪৩৩'}</p>
                  <p className="text-slate-600">{activeDateInfo.hijriDate || '৫ জমাদিউল আউয়াল ১৪৪৬'}</p>
                </div>
              </div>

            </div>

            {/* Sub-Masthead: 4-Story Ear Cards Row (Matching reference layout) */}
            {settings?.epaperConfig?.showTopEarCards !== false && (
              <div className="grid grid-cols-4 gap-2.5 pt-2.5 pb-1">
                {earArticles.map((art, idx) => (
                  <div 
                    key={art.id || idx}
                    onClick={() => setReadingArticle(art)}
                    className="flex items-center gap-2 p-1.5 border border-slate-200 hover:border-red-600 transition-colors bg-white cursor-pointer group shadow-2xs"
                  >
                    {art.imageUrl && (
                      <img 
                        src={art.imageUrl} 
                        alt="" 
                        className="w-12 h-12 object-cover shrink-0 border border-slate-200"
                      />
                    )}
                    <div className="min-w-0">
                      <span className="text-[9px] font-bold text-red-700 block line-clamp-1">{art.category}</span>
                      <h4 className="text-[11px] font-bold leading-tight text-slate-900 group-hover:text-red-700 line-clamp-2 font-serif-bangla">
                        {art.title}
                      </h4>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Sub-Masthead: Automated Commercial Strip Banner (Requirement 2: Automated Ad Sync) */}
            <div className="mt-2.5">
              <UniversalAdSlot position="epaper_strip" adSlots={adSlots} darkMode={false} />
            </div>

            {/* Sub-Masthead Fallback Commercial Strip Banner if no dedicated ad */}
            {settings?.epaperConfig?.showPrintStripBanner !== false && !adSlots?.some(s => s.isActive && (s.position === 'epaper_strip' || s.position === 'home_inter_grid')) && (
              <div className="mt-2 p-2 bg-gradient-to-r from-sky-50 via-white to-sky-50 border border-sky-200 flex flex-wrap items-center justify-between gap-2 text-xs">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 bg-blue-700 text-white font-black text-[11px] rounded-xs font-mono">
                    ১০ টাকা
                  </span>
                  <span className="font-bold text-slate-800 text-[11.5px]">
                    {settings?.epaperConfig?.printStripBannerTitle || 'স্পা ন্যাচারাল ড্রিংকিং ওয়াটার — ৩৩০ মি.লি. ১০ টাকা | ৫০০ মি.লি. ১৫ টাকা'}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-[10.5px] text-slate-600">
                  <span className="hidden sm:inline font-medium">
                    {settings?.epaperConfig?.printStripBannerSubtitle || 'বাংলাদেশের একমাত্র ব্যালেন্সড পিএইচ ওয়াটার'}
                  </span>
                  <span className="px-1.5 py-0.5 bg-slate-100 border text-slate-800 font-mono font-bold text-[10px]">
                    হটলাইন: ০৮ ০০০১ ২১২১২
                  </span>
                </div>
              </div>
            )}

            {/* Live Weather & Prayer Times Integration (Requirement 1: Synchronized with main online portal) */}
            <div className="mt-2.5">
              <WeatherPrayerWidget variant="epaper" darkMode={false} />
            </div>

            {/* Classic Double-Rule Below Masthead Strip */}
            <div className="border-t-2 border-b border-black py-1 mt-2.5 flex items-center justify-between text-xs font-bold tracking-wider text-slate-900 uppercase font-serif-bangla">
              <span>{activePageConfig.nameBn}</span>
              <span className="hidden sm:inline text-red-800 font-black">
                {activeDateInfo.dayName} • {activeDateInfo.dayNum} {activeDateInfo.monthName} ২০২৬ • {activeDateInfo.banglaSeasonalDate || '১ কার্তিক ১৪৩৩'}
              </span>
              <span>ই-পেপার সংস্করণ • পাতা {toBn(currentPage)}/{toBn(8)}</span>
            </div>
          </header>

          {/* ========================================================= */}
          {/* 2. TOP BROADSHEET LEAD SECTION                            */}
          {/* ========================================================= */}
          {pageArticles.lead && (
            <section className="border-b-2 border-black pb-5 mb-5">
              <div className="grid grid-cols-12 gap-5">
                
                {/* Lead Headline and Story Spanning 8 Columns */}
                <div className="col-span-8 border-r border-slate-300 pr-5">
                  {/* Lead Kicker / Shoulder Line */}
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="bg-black text-white text-[11px] font-bold px-2 py-0.5 uppercase tracking-wider font-mono">
                      {pageArticles.lead.category || activePageConfig.sectionCode}
                    </span>
                    {pageArticles.lead.isBreaking && (
                      <span className="text-red-700 font-bold text-xs animate-pulse">
                        • বিশেষ প্রতিবেদন
                      </span>
                    )}
                    <span className="text-xs text-slate-600 ml-auto italic">
                      {pageArticles.lead.author || 'নিজস্ব প্রতিবেদক'}
                    </span>
                  </div>

                  {/* Mega Lead Headline */}
                  <h2 
                    onClick={() => setReadingArticle(pageArticles.lead)}
                    className="text-3xl md:text-4xl font-black leading-tight text-slate-950 font-serif-bangla cursor-pointer hover:text-red-800 transition-colors mb-3"
                    title="সম্পূর্ণ সংবাদ পড়তে ক্লিক করুন"
                  >
                    {pageArticles.lead.title}
                  </h2>

                  {/* Lead Image & Under-Caption */}
                  {pageArticles.lead.imageUrl && (
                    <div className="mb-3">
                      <div className="relative border border-slate-800 overflow-hidden aspect-16/9 bg-slate-100">
                        <img
                          src={pageArticles.lead.imageUrl}
                          alt={pageArticles.lead.title}
                          className="w-full h-full object-cover grayscale-[10%] contrast-105"
                        />
                      </div>
                      <p className="text-[11px] text-slate-700 italic border-b border-slate-200 pb-1 mt-1 text-center font-serif-bangla">
                        {pageArticles.lead.imageCaption || `${pageArticles.lead.title} — সংগৃহীত আলোকচিত্র`}
                      </p>
                    </div>
                  )}

                  {/* Two Sub-Columns for Lead Body Text */}
                  <div className="grid grid-cols-2 gap-4 text-[13px] leading-[1.4] newspaper-justify text-slate-900 font-solaiman">
                    <div>
                      <p className="newspaper-dropcap font-semibold text-slate-950 mb-2">
                        {pageArticles.lead.excerpt || pageArticles.lead.content?.substring(0, 220)}...
                      </p>
                      <p className="text-slate-800">
                        {pageArticles.lead.content?.substring(220, 520) || 'সার্বিক পরিস্থিতি ও নীতি নির্ধারকদের সাম্প্রতিক সিদ্ধান্ত নিয়ে বিস্তারিত পর্যবেক্ষণ করা হয়েছে। সংশ্লিষ্ট মন্ত্রণালয় ও দপ্তরগুলো থেকে প্রাপ্ত তথ্যের ভিত্তিতে এই প্রতিবেদন প্রণীত।'}
                      </p>
                    </div>
                    <div>
                      <p className="text-slate-800 mb-2">
                        {pageArticles.lead.content?.substring(520, 850) || 'বিশেষজ্ঞদের মতে, এই উদ্যোগ কার্যকরভাবে বাস্তবায়ন করা গেলে সার্বিক অর্থনীতি ও জনজীবনে এর ইতিবাচক প্রভাব পড়বে। তবে দ্রুত পদক্ষেপ গ্রহণ নিশ্চিত করার ওপর জোর দিয়েছেন সংশ্লিষ্ট ব্যক্তিবর্গ।'}
                      </p>
                      <button
                        onClick={() => setReadingArticle(pageArticles.lead)}
                        className="inline-flex items-center gap-1 text-xs font-bold text-red-700 hover:text-red-950 underline underline-offset-2 mt-1 cursor-pointer"
                      >
                        <span>সম্পূর্ণ সংবাদ ও ভেতরের প্রতিবেদন পড়ুন...</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Top Side Column (4 Columns on Desktop & Mobile) */}
                <div className="col-span-4 flex flex-col justify-between space-y-4">
                  {pageArticles.col1Articles[0] && (
                    <article className="border-b border-slate-300 pb-3">
                      <span className="text-[10px] font-bold uppercase text-red-700 block mb-0.5">
                        {pageArticles.col1Articles[0].category || 'সরেজমিন'}
                      </span>
                      <h3
                        onClick={() => setReadingArticle(pageArticles.col1Articles[0])}
                        className="text-lg sm:text-xl font-bold leading-snug text-slate-950 font-serif-bangla cursor-pointer hover:text-red-800 transition-colors mb-1.5"
                      >
                        {pageArticles.col1Articles[0].title}
                      </h3>
                      {pageArticles.col1Articles[0].imageUrl && (
                        <div className="border border-slate-300 aspect-16/10 mb-2 overflow-hidden bg-slate-100">
                          <img
                            src={pageArticles.col1Articles[0].imageUrl}
                            alt=""
                            className="w-full h-full object-cover grayscale-[15%]"
                          />
                        </div>
                      )}
                      <p className="text-[12.5px] leading-snug newspaper-justify text-slate-800 line-clamp-3">
                        {pageArticles.col1Articles[0].excerpt || pageArticles.col1Articles[0].content?.substring(0, 160)}
                      </p>
                      <button
                        onClick={() => setReadingArticle(pageArticles.col1Articles[0])}
                        className="text-[11px] font-bold text-red-700 hover:underline mt-1 block cursor-pointer"
                      >
                        [বিস্তারিত পড়ুন]
                      </button>
                    </article>
                  )}

                  {/* Editorial Ear / Broadsheet Notice Box */}
                  <div className="border border-slate-800 p-2.5 bg-slate-50 text-center">
                    <p className="text-xs font-bold font-serif-bangla text-slate-950 uppercase border-b border-slate-300 pb-1 mb-1">
                      {settings?.epaperConfig?.editorialNoteTitle || 'সম্পাদকের কলম থেকে'}
                    </p>
                    <p className="text-[11px] leading-tight text-slate-700 italic mb-2">
                      &ldquo;{settings?.epaperConfig?.editorialNoteQuote || 'সংবাদপত্রের স্বাধীনতা ও বস্তুনিষ্ঠ তথ্য পরিবেশনই গণতান্ত্রিক সমাজব্যবস্থার মূল স্তম্ভ।'}&rdquo;
                    </p>
                    <span className="text-[10px] font-bold text-slate-900 block">
                      — সম্পাদক ও প্রকাশক, {settings?.siteName || 'নিউজ পোর্টাল'}
                    </span>
                  </div>
                </div>

              </div>
            </section>
          )}

          {/* ========================================================= */}
          {/* 3. DYNAMIC BROADSHEET GRID CONTROLLED BY epaperConfig     */}
          {/* ========================================================= */}
          <section className={`grid ${
            settings?.epaperConfig?.gridColumns === 3
              ? 'grid-cols-3'
              : settings?.epaperConfig?.gridColumns === 5
              ? 'grid-cols-5'
              : 'grid-cols-4'
          } gap-0 divide-x divide-slate-300`}>
            
            {/* COLUMN 1: National & Legal Reports */}
            <div className="pr-4 space-y-4">
              <div className="border-b-2 border-black pb-1 mb-2">
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-950 font-serif-bangla">
                  জাতীয় ও প্রশাসনিক ঘটনা
                </h4>
              </div>

              {pageArticles.col1Articles.slice(1).map((art) => (
                <article key={art.id} className="border-b border-slate-200 pb-3 last:border-b-0">
                  <span className="text-[10px] font-bold text-red-700 uppercase block">
                    {art.category}
                  </span>
                  <h3
                    onClick={() => setReadingArticle(art)}
                    className="text-base font-bold leading-tight text-slate-950 font-serif-bangla cursor-pointer hover:text-red-800 transition-colors my-1"
                  >
                    {art.title}
                  </h3>
                  <p className="text-[12.5px] leading-snug newspaper-justify text-slate-800 line-clamp-4">
                    {art.excerpt || art.content?.substring(0, 180)}
                  </p>
                  <div className="flex items-center justify-between text-[11px] text-slate-600 mt-2">
                    <span>{art.author || 'স্টাফ রিপোর্টার'}</span>
                    <button
                      onClick={() => setReadingArticle(art)}
                      className="font-bold text-red-700 hover:underline cursor-pointer"
                    >
                      পড়ুন →
                    </button>
                  </div>
                </article>
              ))}

              {/* Brief Ticker Column Block */}
              <div className="bg-slate-50 p-2.5 border border-slate-300">
                <span className="text-[11px] font-black uppercase text-slate-900 block border-b border-slate-200 pb-1 mb-1">
                  সংক্ষিপ্ত সংবাদ
                </span>
                <ul className="text-[11.5px] leading-tight space-y-2 text-slate-800 list-disc list-inside">
                  <li>বিদ্যুৎ ও জ্বালানি খাতের সংস্কারে টাস্কফোর্স গঠন।</li>
                  <li>রপ্তানি বাণিজ্যে নতুন প্রণোদনা প্যাকেজ ঘোষণা সরকারের।</li>
                  <li>মহাসড়কে যানজট নিরসনে নতুন ডিজিটাল কন্ট্রোল রুম চালু।</li>
                </ul>
              </div>
            </div>

            {/* COLUMN 2: Economy & City News */}
            <div className="px-4 space-y-4">
              <div className="border-b-2 border-black pb-1 mb-2">
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-950 font-serif-bangla">
                  বাণিজ্য ও নাগরিক বার্তা
                </h4>
              </div>

              {pageArticles.col2Articles.map((art) => (
                <article key={art.id} className="border-b border-slate-200 pb-3 last:border-b-0">
                  {art.imageUrl && (
                    <div className="border border-slate-300 aspect-16/10 mb-2 overflow-hidden bg-slate-100">
                      <img
                        src={art.imageUrl}
                        alt=""
                        className="w-full h-full object-cover grayscale-[10%]"
                      />
                    </div>
                  )}
                  <span className="text-[10px] font-bold text-emerald-800 uppercase block">
                    {art.category || 'অর্থনীতি'}
                  </span>
                  <h3
                    onClick={() => setReadingArticle(art)}
                    className="text-base font-bold leading-tight text-slate-950 font-serif-bangla cursor-pointer hover:text-red-800 transition-colors my-1"
                  >
                    {art.title}
                  </h3>
                  <p className="text-[12.5px] leading-snug newspaper-justify text-slate-800 line-clamp-3">
                    {art.excerpt || art.content?.substring(0, 160)}
                  </p>
                  <div className="flex items-center justify-between text-[11px] text-slate-600 mt-2">
                    <span>{art.author || 'অর্থনৈতিক প্রতিবেদক'}</span>
                    <button
                      onClick={() => setReadingArticle(art)}
                      className="font-bold text-red-700 hover:underline cursor-pointer"
                    >
                      পড়ুন →
                    </button>
                  </div>
                </article>
              ))}
            </div>

            {/* COLUMN 3: Global & Countrywide Regional Grid */}
            <div className="px-4 space-y-4">
              <div className="border-b-2 border-black pb-1 mb-2">
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-950 font-serif-bangla">
                  বিশ্বমঞ্চ ও আঞ্চলিক দর্পণ
                </h4>
              </div>

              {pageArticles.col3Articles.map((art) => (
                <article key={art.id} className="border-b border-slate-200 pb-3 last:border-b-0">
                  <span className="text-[10px] font-bold text-blue-900 uppercase block">
                    {art.category || 'বিশ্বসংবাদ'}
                  </span>
                  <h3
                    onClick={() => setReadingArticle(art)}
                    className="text-base font-bold leading-tight text-slate-950 font-serif-bangla cursor-pointer hover:text-red-800 transition-colors my-1"
                  >
                    {art.title}
                  </h3>
                  <p className="text-[12.5px] leading-snug newspaper-justify text-slate-800 line-clamp-4">
                    {art.excerpt || art.content?.substring(0, 170)}
                  </p>
                  <div className="flex items-center justify-between text-[11px] text-slate-600 mt-2">
                    <span>{art.author || 'আন্তর্জাতিক ডেস্ক'}</span>
                    <button
                      onClick={() => setReadingArticle(art)}
                      className="font-bold text-red-700 hover:underline cursor-pointer"
                    >
                      পড়ুন →
                    </button>
                  </div>
                </article>
              ))}
            </div>

            {/* COLUMN 4: Sports, Opinion & Broadsheet Box */}
            <div className="pl-4 space-y-4">
              <div className="border-b-2 border-black pb-1 mb-2">
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-950 font-serif-bangla">
                  ক্রীড়াঙ্গন ও বিশেষ প্রতিবেদন
                </h4>
              </div>

              {pageArticles.col4Articles.map((art) => (
                <article key={art.id} className="border-b border-slate-200 pb-3 last:border-b-0">
                  <span className="text-[10px] font-bold text-amber-900 uppercase block">
                    {art.category || 'খেলাধুলা'}
                  </span>
                  <h3
                    onClick={() => setReadingArticle(art)}
                    className="text-base font-bold leading-tight text-slate-950 font-serif-bangla cursor-pointer hover:text-red-800 transition-colors my-1"
                  >
                    {art.title}
                  </h3>
                  <p className="text-[12.5px] leading-snug newspaper-justify text-slate-800 line-clamp-3">
                    {art.excerpt || art.content?.substring(0, 150)}
                  </p>
                  <div className="flex items-center justify-between text-[11px] text-slate-600 mt-2">
                    <span>{art.author || 'ক্রীড়া প্রতিবেদক'}</span>
                    <button
                      onClick={() => setReadingArticle(art)}
                      className="font-bold text-red-700 hover:underline cursor-pointer"
                    >
                      পড়ুন →
                    </button>
                  </div>
                </article>
              ))}

              {/* Automated Ad Sync for Column Display Box (Requirement 2) */}
              <div className="my-3">
                <UniversalAdSlot position="epaper_sidebar" adSlots={adSlots} darkMode={false} />
              </div>

              {/* Classic Advertisement / Sponsorship Print Box (Fallback if no ad configured) */}
              {settings?.epaperConfig?.showAdBox !== false && !adSlots?.some(s => s.isActive && (s.position === 'epaper_sidebar' || s.position === 'sidebar_top')) && (
                <div className="border-2 border-dashed border-slate-400 p-3 text-center bg-slate-50">
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">
                    {settings?.epaperConfig?.adBoxTitle || 'বিজ্ঞাপন স্থান'}
                  </p>
                  <div className="py-3">
                    <span className="text-lg font-black font-serif-bangla text-slate-900 block">
                      {settings?.siteName || 'নিউজ পোর্টাল'}
                    </span>
                    <span className="text-xs text-slate-600">ডিজিটাল ও মুদ্রিত বিজ্ঞাপনের জন্য যোগাযোগ করুন</span>
                  </div>
                  <p className="text-[10px] font-mono font-bold text-red-700">
                    ইমেইল: {settings?.epaperConfig?.adBoxEmail || `ads@${settings?.domain || 'dailybangladesh.com'}`}
                  </p>
                </div>
              )}
            </div>

          </section>

          {/* Bottom Broadsheet Footer Ad (Requirement 2: Automated Ad Sync) */}
          <div className="mt-4 pt-2 border-t border-slate-300 no-print flex justify-center">
            <UniversalAdSlot position="epaper_bottom" adSlots={adSlots} darkMode={false} />
          </div>

          {/* ========================================================= */}
          {/* 4. BROADSHEET FOOTER BAR                                  */}
          {/* ========================================================= */}
          <footer className="border-t-2 border-black mt-6 pt-3 flex flex-wrap items-center justify-between text-[11px] text-slate-700 font-serif-bangla">
            <div>
              <span>{settings?.epaperConfig?.footerCredits || `ভারপ্রাপ্ত সম্পাদক: ${settings?.editorName || 'সম্পাদকীয় বিভাগ'} • প্রকাশক: ${settings?.publisherName || `${settings?.siteName || 'নিউজ পোর্টাল'} পাবলিকেশনস`}`}</span>
            </div>
            <div className="flex items-center gap-4">
              <span>মুদ্রিত রূপ: {activeDateInfo.fullDateBn}</span>
              <span>•</span>
              <span className="font-bold">পাতা {toBn(currentPage)} সমাপ্ত</span>
            </div>
          </footer>

          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 5. CLICKABLE POPUP READING MODAL                          */}
      {/* ========================================================= */}
      {readingArticle && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/75 backdrop-blur-xs animate-in fade-in"
          onClick={() => setReadingArticle(null)}
        >
          <div
            className="relative w-full max-w-3xl max-h-[90vh] bg-white text-slate-950 border-2 border-slate-800 rounded-lg shadow-2xl flex flex-col overflow-hidden font-solaiman"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header Bar */}
            <div className="border-b border-slate-200 px-5 py-3 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2">
                <span className="bg-black text-white text-[11px] font-bold px-2.5 py-0.5 uppercase tracking-wider font-mono">
                  {readingArticle.category || 'সংবাদ'}
                </span>
                <span className="text-xs text-slate-600 font-serif-bangla">
                  মুদ্রিত রূপ থেকে সরাসরি পাঠ
                </span>
              </div>

              {/* Font Sizer, TTS & Close Buttons */}
              <div className="flex items-center gap-2">
                <div className="flex items-center bg-slate-200/80 border border-slate-300 rounded px-1.5 py-0.5 text-xs">
                  <button
                    onClick={() => setModalFontSize((s) => Math.max(s - 2, 12))}
                    className="px-1 font-bold hover:text-red-700 cursor-pointer"
                    title="ফন্ট ছোট করুন"
                  >
                    A-
                  </button>
                  <span className="px-1 font-mono text-[11px] text-slate-600">
                    {modalFontSize}
                  </span>
                  <button
                    onClick={() => setModalFontSize((s) => Math.min(s + 2, 24))}
                    className="px-1 font-bold hover:text-red-700 cursor-pointer"
                    title="ফন্ট বড় করুন"
                  >
                    A+
                  </button>
                </div>

                <button
                  onClick={() => toggleSpeech(`${readingArticle.title}। ${readingArticle.content || readingArticle.excerpt}`)}
                  className={`p-1.5 rounded border transition-colors cursor-pointer ${
                    isSpeaking 
                      ? 'bg-red-600 text-white border-red-700' 
                      : 'bg-slate-200 hover:bg-slate-300 text-slate-800 border-slate-300'
                  }`}
                  title={isSpeaking ? 'পড়া বন্ধ করুন' : 'সংবাদটি শুনুন (অডিও)'}
                >
                  <Volume2 className="w-4 h-4" />
                </button>

                <button
                  onClick={() => setReadingArticle(null)}
                  className="p-1.5 rounded bg-slate-200 hover:bg-red-600 hover:text-white transition-colors cursor-pointer"
                  title="বন্ধ করুন"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Modal Scrollable Content Area */}
            <div className="overflow-y-auto p-5 sm:p-7 space-y-4">
              
              {/* Meta Byline & Date */}
              <div className="flex flex-wrap items-center justify-between text-xs text-slate-600 border-b border-slate-200 pb-2">
                <span className="font-bold text-slate-900">
                  প্রতিবেদক: {readingArticle.author || 'স্টাফ রিপোর্টার'}
                </span>
                <span>
                  প্রকাশ: {readingArticle.date || activeDateInfo.fullDateBn}
                </span>
              </div>

              {/* Title */}
              <h2 className="text-xl sm:text-2xl md:text-3xl font-black text-slate-950 font-serif-bangla leading-snug">
                {readingArticle.title}
              </h2>

              {/* Image */}
              {readingArticle.imageUrl && (
                <div className="border border-slate-300 rounded overflow-hidden">
                  <img
                    src={readingArticle.imageUrl}
                    alt={readingArticle.title}
                    className="w-full max-h-[380px] object-cover"
                  />
                  {readingArticle.imageCaption && (
                    <p className="text-[11px] text-slate-600 italic p-1.5 text-center bg-slate-50 border-t border-slate-200">
                      {readingArticle.imageCaption}
                    </p>
                  )}
                </div>
              )}

              {/* Body */}
              <div 
                style={{ fontSize: `${modalFontSize}px` }} 
                className="leading-relaxed newspaper-justify space-y-3 font-solaiman text-slate-900"
              >
                {readingArticle.content ? (
                  readingArticle.content.split('\n\n').map((paragraph, index) => (
                    <p key={index}>{paragraph}</p>
                  ))
                ) : (
                  <p>{readingArticle.excerpt}</p>
                )}
              </div>

              {/* Actions Footer */}
              <div className="pt-4 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
                <button
                  onClick={() => {
                    onSelectArticle(readingArticle);
                    setReadingArticle(null);
                    onBackToPortal();
                  }}
                  className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>অনলাইন ভার্সনে বিস্তারিত ও মন্তব্য দেখুন</span>
                </button>

                <button
                  onClick={() => setReadingArticle(null)}
                  className="px-4 py-2 rounded-lg border border-slate-300 hover:bg-slate-100 text-slate-700 font-bold transition-colors cursor-pointer"
                >
                  বন্ধ করুন
                </button>
              </div>

            </div>

          </div>
        </div>
      )}

    </div>
  );
};
