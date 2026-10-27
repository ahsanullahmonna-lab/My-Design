import React, { useState } from 'react';
import { Flame, Pause, Play } from 'lucide-react';
import { Article, TickerItem } from '../types/news';

interface BreakingTickerProps {
  articles: Article[];
  customTickers?: TickerItem[];
  onSelectArticle: (article: Article) => void;
  darkMode: boolean;
  lang: 'bn' | 'en';
}

interface TickerDisplayItem {
  id: string;
  text: string;
  category?: string;
  article?: Article;
  url?: string;
}

export const BreakingTicker: React.FC<BreakingTickerProps> = ({
  articles,
  customTickers = [],
  onSelectArticle,
  darkMode,
  lang,
}) => {
  const [isPaused, setIsPaused] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  // Collect active custom tickers
  const activeCustom: TickerDisplayItem[] = customTickers
    .filter(t => t.isActive)
    .map(t => {
      const linkedArticle = t.linkArticleId ? articles.find(a => a.id === t.linkArticleId) : undefined;
      return {
        id: t.id,
        text: t.text,
        category: linkedArticle?.category || 'বিশেষ বার্তা',
        article: linkedArticle,
        url: t.linkUrl,
      };
    });

  // Collect breaking articles
  const breakingArticles: TickerDisplayItem[] = articles
    .filter(a => a.isBreaking && a.status !== 'pending' && a.status !== 'rejected')
    .map(a => ({
      id: `art-${a.id}`,
      text: lang === 'bn' ? a.title : (a.titleEn || a.title),
      category: a.category,
      article: a,
    }));

  // Pool up to latest 10 items
  let pool = [...activeCustom, ...breakingArticles];
  if (pool.length < 10) {
    const existingIds = new Set(pool.map(p => p.article?.id).filter(Boolean));
    const recentArticles = articles
      .filter(a => !existingIds.has(a.id) && a.status !== 'pending' && a.status !== 'rejected')
      .slice(0, 10 - pool.length)
      .map(a => ({
        id: `rec-${a.id}`,
        text: lang === 'bn' ? a.title : (a.titleEn || a.title),
        category: a.category,
        article: a,
      }));
    pool = [...pool, ...recentArticles];
  }

  const latestTenList = pool.slice(0, 10);
  if (latestTenList.length === 0) return null;

  const effectivelyPaused = isPaused || isHovered;

  return (
    <section 
      className="w-full overflow-x-hidden pt-2 pb-1 transition-colors select-none" 
      aria-label="ব্রেকিং নিউজ"
    >
      {/* Strict Container Alignment - Identical to Header, Navbar & Main News Grid Bounds */}
      <div className="max-w-7xl mx-auto px-4">
        <div 
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          className={`w-full overflow-hidden rounded-md border flex items-center h-9 sm:h-10 relative shadow-2xs transition-colors group/ticker ${
            darkMode 
              ? 'bg-[#121820] border-slate-800 text-slate-100' 
              : 'bg-white border-red-200/90 text-slate-900'
          }`}
        >
          {/* 1. Left Breaking News Badge */}
          <div className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-gradient-to-r from-red-600 via-rose-600 to-red-600 text-white text-xs font-bold font-solaiman shrink-0 z-20 shadow-sm relative">
            <Flame className="w-3.5 h-3.5 text-amber-300 animate-bounce shrink-0" />
            <span className="tracking-wide whitespace-nowrap">
              {lang === 'bn' ? 'ব্রেকিং নিউজ' : 'BREAKING'}
            </span>
            <span className="hidden sm:inline-block w-2 h-2 rounded-full bg-white ring-4 ring-white/20 animate-pulse ml-0.5" />
          </div>

          {/* 2. Left Horizon Soft Fade Mask (Directly following the Badge) */}
          <div className={`w-6 sm:w-10 h-full shrink-0 z-10 pointer-events-none -ml-1 ${
            darkMode 
              ? 'bg-gradient-to-r from-[#121820] to-transparent' 
              : 'bg-gradient-to-r from-white to-transparent'
          }`} />

          {/* 3. Continuous Smooth Scrolling Marquee Track */}
          <div className="relative flex-1 overflow-hidden whitespace-nowrap min-w-0">
            <div 
              style={{ animationPlayState: effectivelyPaused ? 'paused' : 'running' }}
              className={`inline-flex items-center gap-8 sm:gap-10 animate-marquee font-solaiman text-xs font-medium cursor-pointer ${
                effectivelyPaused ? 'is-paused' : ''
              }`}
            >
              {latestTenList.concat(latestTenList).map((item, idx) => (
                <div
                  key={`${item.id}-${idx}`}
                  onClick={() => {
                    if (item.article) onSelectArticle(item.article);
                    else if (item.url) window.open(item.url, '_blank', 'noopener,noreferrer');
                  }}
                  className="inline-flex items-center gap-2 py-1 px-1.5 rounded transition-colors text-slate-800 dark:text-slate-100 hover:text-red-600 dark:hover:text-red-400 group cursor-pointer"
                  title="সংবাদটি পড়তে ক্লিক করুন"
                >
                  <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-black font-mono bg-red-100 dark:bg-red-950/80 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-900/60 shrink-0 shadow-2xs">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-600 animate-ping inline-block shrink-0" />
                    LIVE
                  </span>
                  {item.category && (
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200/80 dark:border-slate-700/80 shrink-0">
                      {item.category}
                    </span>
                  )}
                  <span className="leading-snug truncate hover:underline underline-offset-2 font-bold text-gray-950 dark:text-white">
                    {item.text}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* 4. Right Horizon Soft Fade Mask */}
          <div className={`w-8 sm:w-12 h-full shrink-0 z-10 pointer-events-none ${
            darkMode 
              ? 'bg-gradient-to-l from-[#121820] to-transparent' 
              : 'bg-gradient-to-l from-white to-transparent'
          }`} />

          {/* 5. Right Action Controls: Pause / Play Toggle & Reading Status Badge */}
          <div className="flex items-center gap-1 sm:gap-1.5 pr-2 sm:pr-3 shrink-0 z-20">
            {effectivelyPaused && (
              <span className="hidden md:inline-flex text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 font-solaiman">
                {lang === 'bn' ? 'স্থগিত' : 'PAUSED'}
              </span>
            )}
            <button
              onClick={() => setIsPaused(!isPaused)}
              className="p-1 sm:p-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-slate-800 text-gray-700 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-400 transition-colors cursor-pointer"
              title={isPaused ? (lang === 'bn' ? 'চালু করুন' : 'Resume') : (lang === 'bn' ? 'বিরতি দিন' : 'Pause')}
              aria-label="Toggle Marquee Scroll"
            >
              {isPaused ? <Play className="w-3 h-3 text-red-600" /> : <Pause className="w-3 h-3" />}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};
