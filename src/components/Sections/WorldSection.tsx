import React from 'react';
import { ChevronRight, Clock, Globe } from 'lucide-react';
import { Article, AdSlot } from '../../types/news';
import { BannerAd } from '../Ads/BannerAd';
import { fillArticlesToTarget } from '../../utils/layoutFillers';

interface WorldSectionProps {
  articles: Article[];
  onSelectArticle: (article: Article) => void;
  darkMode: boolean;
  lang: 'bn' | 'en';
  adSlots?: AdSlot[];
}

export const WorldSection: React.FC<WorldSectionProps> = ({
  articles,
  onSelectArticle,
  darkMode,
  lang,
  adSlots = [],
}) => {
  const primaryWorld = articles.filter(a => a.category === 'বিশ্ব');
  const worldArticles = fillArticlesToTarget(primaryWorld, articles, 6);
  const worldLead = worldArticles[0] || articles[0];
  const midItems = worldArticles.slice(1, 4);
  const rightItems = worldArticles.slice(4, 6);

  return (
    <section className="w-full max-w-7xl mx-auto px-4 my-10">
      {/* Header */}
      <div className="flex items-center justify-between border-b-2 border-red-600 pb-2 mb-5">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-6 bg-red-600 inline-block rounded-xs" />
          <h2 className="text-xl md:text-2xl font-bold font-solaiman text-gray-950 dark:text-white flex items-center gap-2">
            <span>{lang === 'bn' ? 'বিশ্ব' : 'World'}</span>
          </h2>
          <ChevronRight className="w-5 h-5 text-red-600" />
        </div>
        <span className="text-xs font-bold text-gray-800 dark:text-gray-200 font-solaiman hover:text-red-600 cursor-pointer">
          {lang === 'bn' ? 'সব আন্তর্জাতিক সংবাদ' : 'All International'} →
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column (col-span-5): Dominant World Lead */}
        {worldLead && (
          <div 
            onClick={() => onSelectArticle(worldLead)}
            className="lg:col-span-5 group cursor-pointer space-y-3 p-3.5 rounded-lg bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 hover:border-red-500/60 dark:hover:border-red-500/60 hover:shadow-md transition-all duration-200"
          >
            <div className="relative overflow-hidden rounded aspect-16/10 bg-slate-100 dark:bg-slate-800">
              <img
                src={worldLead.imageUrl?.trim() || 'https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?auto=format&fit=crop&w=800&q=80'}
                alt={worldLead.title}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300"
              />
              <div className="absolute top-2.5 left-2.5">
                <span className="px-2.5 py-0.5 text-xs font-bold font-solaiman rounded bg-red-600 text-white shadow-xs">
                  আন্তর্জাতিক
                </span>
              </div>
            </div>
            <h3 className="text-base sm:text-lg font-bold font-solaiman leading-snug text-gray-950 dark:text-white group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors">
              {lang === 'bn' ? worldLead.title : (worldLead.titleEn || worldLead.title)}
            </h3>
            <p className="text-xs font-solaiman text-gray-900 dark:text-gray-100 line-clamp-3 leading-relaxed">
              {lang === 'bn' ? worldLead.excerpt : (worldLead.excerptEn || worldLead.excerpt)}
            </p>
            <div className="flex items-center gap-2 text-[11px] text-gray-700 dark:text-gray-300 font-solaiman font-medium">
              <Clock className="w-3 h-3 text-red-600" />
              <span>{worldLead.date}</span>
            </div>
          </div>
        )}

        {/* Middle Column (col-span-4): 3 News Items with Thumbnails */}
        <div className="lg:col-span-4 space-y-4 divide-y divide-gray-100 dark:divide-slate-800">
          {midItems.map((item) => (
            <div
              key={item.id}
              onClick={() => onSelectArticle(item)}
              className="group cursor-pointer flex gap-3 pt-3 first:pt-0"
            >
              <div className="w-24 h-16 rounded overflow-hidden bg-slate-100 dark:bg-slate-800 shrink-0">
                <img
                  src={item.imageUrl?.trim() || 'https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?auto=format&fit=crop&w=800&q=80'}
                  alt={item.title}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover group-hover:scale-103 transition-transform"
                />
              </div>
              <div className="flex-1 space-y-1">
                <h4 className="text-xs md:text-sm font-bold font-solaiman leading-snug text-gray-950 dark:text-white group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors line-clamp-2">
                  {lang === 'bn' ? item.title : (item.titleEn || item.title)}
                </h4>
                <div className="flex items-center gap-1.5 text-[10px] text-gray-700 dark:text-gray-300 font-solaiman font-medium">
                  <Clock className="w-3 h-3 text-red-600" />
                  <span>{item.date}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Right Column (col-span-3): 2 News Items */}
        <div className="lg:col-span-3 space-y-4">
          {rightItems.map((item) => (
            <div
              key={item.id}
              onClick={() => onSelectArticle(item)}
              className="group cursor-pointer p-3 rounded-lg bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 hover:shadow-xs transition-shadow space-y-2"
            >
              <div className="relative overflow-hidden rounded aspect-16/10 bg-slate-100 dark:bg-slate-800">
                <img
                  src={item.imageUrl?.trim() || 'https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?auto=format&fit=crop&w=800&q=80'}
                  alt={item.title}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover group-hover:scale-102 transition-transform"
                />
              </div>
              <h4 className="text-xs md:text-sm font-bold font-solaiman leading-snug text-gray-950 dark:text-white group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors line-clamp-2">
                {lang === 'bn' ? item.title : (item.titleEn || item.title)}
              </h4>
              <div className="flex items-center gap-1 text-[10px] text-gray-700 dark:text-gray-300 font-solaiman font-medium">
                <Clock className="w-3 h-3 text-red-600" />
                <span>{item.date}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
