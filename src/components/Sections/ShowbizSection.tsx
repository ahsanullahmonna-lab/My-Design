import React from 'react';
import { ChevronRight, Clock, Film } from 'lucide-react';
import { Article } from '../../types/news';
import { fillArticlesToTarget } from '../../utils/layoutFillers';

interface ShowbizSectionProps {
  articles: Article[];
  onSelectArticle: (article: Article) => void;
  darkMode: boolean;
  lang: 'bn' | 'en';
}

export const ShowbizSection: React.FC<ShowbizSectionProps> = ({
  articles,
  onSelectArticle,
  darkMode,
  lang,
}) => {
  const primaryShowbiz = articles.filter(a => a.category === 'শোবিজ' || a.category === 'বিনোদন');
  const showbizArticles = fillArticlesToTarget(primaryShowbiz, articles, 7);
  
  const centerSpotlight = showbizArticles[0] || articles[0];
  const leftCards = showbizArticles.slice(1, 4);
  const rightCards = showbizArticles.slice(4, 7);

  return (
    <section className="w-full max-w-7xl mx-auto px-4 my-10 font-solaiman">
      {/* Header */}
      <div className="flex items-center justify-between border-b-2 border-red-600 pb-2 mb-5">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-6 bg-red-600 inline-block rounded-xs" />
          <h2 className="text-xl md:text-2xl font-bold font-solaiman text-gray-950 dark:text-white flex items-center gap-2">
            <span>{lang === 'bn' ? 'বিনোদন' : 'Entertainment & Showbiz'}</span>
          </h2>
          <ChevronRight className="w-5 h-5 text-red-600" />
        </div>
        <span className="text-xs font-bold text-gray-800 dark:text-gray-200 font-solaiman hover:text-red-600 cursor-pointer">
          {lang === 'bn' ? 'সকল বিনোদন খবর' : 'All Showbiz'} →
        </span>
      </div>

      {/* 3-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column (3 vertical cards) */}
        <div className="lg:col-span-3 space-y-3">
          {leftCards.slice(0, 3).map((item) => (
            <div
              key={`left-${item.id}`}
              onClick={() => onSelectArticle(item)}
              className="group cursor-pointer flex gap-3 p-2.5 rounded-lg bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 hover:shadow-xs transition-shadow"
            >
              <div className="flex-1 space-y-1">
                <h4 className="text-xs md:text-sm font-bold font-solaiman leading-snug text-gray-950 dark:text-white group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors line-clamp-2">
                  {lang === 'bn' ? item.title : (item.titleEn || item.title)}
                </h4>
                <span className="text-[10px] text-gray-700 dark:text-gray-300 font-solaiman font-medium block">
                  {item.date}
                </span>
              </div>
              <div className="w-20 h-14 rounded overflow-hidden bg-slate-100 dark:bg-slate-800 shrink-0">
                <img
                  src={item.imageUrl?.trim() || 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?auto=format&fit=crop&w=800&q=80'}
                  alt={item.title}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover group-hover:scale-103 transition-transform"
                />
              </div>
            </div>
          ))}
        </div>

        {/* Center Spotlight: Large Photo Card */}
        {centerSpotlight && (
          <div 
            onClick={() => onSelectArticle(centerSpotlight)}
            className="lg:col-span-6 group cursor-pointer space-y-3 p-3.5 rounded-lg bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 hover:border-red-500/60 dark:hover:border-red-500/60 hover:shadow-md transition-all duration-200"
          >
            <div className="relative overflow-hidden rounded aspect-16/10 bg-slate-100 dark:bg-slate-800">
              <img
                src={centerSpotlight.imageUrl?.trim() || 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?auto=format&fit=crop&w=800&q=80'}
                alt={centerSpotlight.title}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-102"
              />
              <div className="absolute top-3 left-3">
                <span className="px-2.5 py-1 text-xs font-bold font-solaiman rounded bg-red-600 text-white shadow-xs">
                  বিনোদন
                </span>
              </div>
            </div>
            <h3 className="text-lg md:text-xl font-bold font-solaiman leading-snug text-gray-950 dark:text-white group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors">
              {lang === 'bn' ? centerSpotlight.title : (centerSpotlight.titleEn || centerSpotlight.title)}
            </h3>
            <p className="text-xs md:text-sm font-solaiman text-gray-900 dark:text-gray-100 line-clamp-3 leading-relaxed">
              {lang === 'bn' ? centerSpotlight.excerpt : (centerSpotlight.excerptEn || centerSpotlight.excerpt)}
            </p>
            <div className="flex items-center gap-2 text-[11px] text-gray-700 dark:text-gray-300 font-solaiman font-medium pt-2 border-t border-gray-100 dark:border-slate-800">
              <Clock className="w-3 h-3 text-red-600" />
              <span>{centerSpotlight.date}</span>
            </div>
          </div>
        )}

        {/* Right Column (3 vertical cards) */}
        <div className="lg:col-span-3 space-y-3">
          {rightCards.slice(0, 3).map((item) => (
            <div
              key={`right-${item.id}`}
              onClick={() => onSelectArticle(item)}
              className="group cursor-pointer flex gap-3 p-2.5 rounded-lg bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 hover:shadow-xs transition-shadow"
            >
              <div className="w-20 h-14 rounded overflow-hidden bg-slate-100 dark:bg-slate-800 shrink-0">
                <img
                  src={item.imageUrl?.trim() || 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?auto=format&fit=crop&w=800&q=80'}
                  alt={item.title}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover group-hover:scale-103 transition-transform"
                />
              </div>
              <div className="flex-1 space-y-1">
                <h4 className="text-xs md:text-sm font-bold font-solaiman leading-snug text-gray-950 dark:text-white group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors line-clamp-2">
                  {lang === 'bn' ? item.title : (item.titleEn || item.title)}
                </h4>
                <span className="text-[10px] text-gray-700 dark:text-gray-300 font-solaiman font-medium block">
                  {item.date}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
