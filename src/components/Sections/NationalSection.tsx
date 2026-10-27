import React from 'react';
import { ChevronRight, Clock } from 'lucide-react';
import { Article } from '../../types/news';
import { getAuthorAvatar, DEFAULT_AVATAR_DATA_URI } from '../../utils/authorAvatar';
import { fillArticlesToTarget, getAdaptiveGridClass } from '../../utils/layoutFillers';
import { SmartFillerAdCard } from '../Ads/SmartFillerAdCard';

interface NationalSectionProps {
  articles: Article[];
  onSelectArticle: (article: Article) => void;
  darkMode: boolean;
  lang: 'bn' | 'en';
}

export const NationalSection: React.FC<NationalSectionProps> = ({
  articles,
  onSelectArticle,
  darkMode,
  lang,
}) => {
  const primaryNational = articles.filter(a => a.category === 'জাতীয়');
  const nationalArticles = fillArticlesToTarget(primaryNational, articles, 4);
  const gridClass = getAdaptiveGridClass(nationalArticles.length, 4);

  return (
    <section className="w-full max-w-7xl mx-auto px-4 my-10">
      {/* Section Header */}
      <div className="flex items-center justify-between border-b-2 border-red-600 pb-2.5 mb-6">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-6 bg-red-600 inline-block rounded-xs" />
          <h2 className="text-xl md:text-2xl font-bold font-solaiman text-gray-950 dark:text-white tracking-tight">
            {lang === 'bn' ? 'জাতীয়' : 'National'}
          </h2>
          <ChevronRight className="w-5 h-5 text-red-600" />
        </div>
        <span className="text-xs font-bold text-gray-800 dark:text-gray-200 font-solaiman hover:text-red-600 cursor-pointer transition-colors">
          {lang === 'bn' ? 'সব খবর দেখুন' : 'View All'} →
        </span>
      </div>

      {/* Grid Layout with Clean Broadsheet Cards */}
      <div className={`${gridClass} gap-6`}>
        {nationalArticles.map((article) => {
          const isFiller = article.category !== 'জাতীয়';
          return (
            <article
              key={article.id}
              onClick={() => onSelectArticle(article)}
              className="group cursor-pointer flex flex-col justify-between p-3.5 rounded-lg bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 hover:border-red-500/60 dark:hover:border-red-500/60 hover:shadow-md transition-all duration-200"
            >
              <div className="space-y-3">
                <div className="relative overflow-hidden rounded aspect-16/10 bg-slate-100 dark:bg-slate-800">
                  <img
                    src={article.imageUrl?.trim() || 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?auto=format&fit=crop&w=800&q=80'}
                    alt={article.title}
                    onError={(e) => {
                      e.currentTarget.src = 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?auto=format&fit=crop&w=800&q=80';
                    }}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300"
                  />
                  {isFiller && (
                    <span className="absolute top-2 left-2 px-2 py-0.5 text-[10px] font-bold font-solaiman rounded bg-amber-600 text-white shadow-xs">
                      {article.category || 'আলোচিত'}
                    </span>
                  )}
                </div>
                <h3 className="text-sm md:text-base font-bold font-solaiman leading-snug tracking-tight text-gray-950 dark:text-white group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors line-clamp-2">
                  {lang === 'bn' ? article.title : (article.titleEn || article.title)}
                </h3>
                <p className="text-xs font-solaiman text-gray-900 dark:text-gray-100 line-clamp-3 leading-relaxed">
                  {lang === 'bn' ? article.excerpt : (article.excerptEn || article.excerpt)}
                </p>
              </div>
              <div className="flex items-center justify-between text-[11px] text-gray-800 dark:text-gray-300 font-solaiman pt-2 mt-2 border-t border-gray-100 dark:border-slate-800">
                <div className="flex items-center gap-1.5">
                  <img
                    src={getAuthorAvatar(article.author, article.authorAvatar)}
                    alt=""
                    onError={(e) => {
                      e.currentTarget.src = DEFAULT_AVATAR_DATA_URI;
                    }}
                    className="w-4 h-4 rounded-full object-cover border border-red-500 bg-slate-100"
                  />
                  <span className="truncate max-w-[95px] text-gray-950 dark:text-white font-bold">{article.author}</span>
                </div>
                <div className="flex items-center gap-1 font-semibold text-gray-800 dark:text-gray-300">
                  <Clock className="w-3 h-3 text-red-600" />
                  <span>{article.timeAgo || article.date}</span>
                </div>
              </div>
            </article>
          );
        })}

        {/* If fewer than 4 items were returned, render smart filler promo card */}
        {nationalArticles.length < 4 && (
          <SmartFillerAdCard 
            type="epaper" 
            darkMode={darkMode} 
          />
        )}
      </div>
    </section>
  );
};
