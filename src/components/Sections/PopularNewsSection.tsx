import React, { useState } from 'react';
import { Flame, Eye, Clock, TrendingUp, Sparkles, ChevronRight, Award } from 'lucide-react';
import { Article } from '../../types/news';
import { getAuthorAvatar, DEFAULT_AVATAR_DATA_URI } from '../../utils/authorAvatar';

interface PopularNewsSectionProps {
  articles: Article[];
  onSelectArticle: (article: Article) => void;
  darkMode: boolean;
  lang?: 'bn' | 'en';
}

const BENGALI_NUMERALS = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
function toBengaliNumber(num: number): string {
  return num
    .toString()
    .split('')
    .map(digit => BENGALI_NUMERALS[parseInt(digit, 10)] || digit)
    .join('');
}

export const PopularNewsSection: React.FC<PopularNewsSectionProps> = ({
  articles,
  onSelectArticle,
  darkMode,
  lang = 'bn',
}) => {
  const [filterPeriod, setFilterPeriod] = useState<'today' | 'week' | 'month'>('today');

  // Filter published articles and sort by popularity / views
  const published = articles.filter(a => a.status === 'published' || !a.status);
  
  // Sort articles based on period and views
  const sortedArticles = [...published].sort((a, b) => {
    if (filterPeriod === 'today') {
      return (b.views || 0) - (a.views || 0);
    }
    if (filterPeriod === 'week') {
      return ((b.views || 0) + (b.sharesCount || 0) * 10) - ((a.views || 0) + (a.sharesCount || 0) * 10);
    }
    return ((b.views || 0) * 1.5) - ((a.views || 0) * 1.5);
  });

  const popularList = sortedArticles.slice(0, 8);
  if (popularList.length === 0) return null;

  return (
    <section className="w-full max-w-7xl mx-auto px-4 my-10 font-solaiman">
      {/* Section Header */}
      <div className="flex flex-wrap items-center justify-between border-b-2 border-red-600 pb-2.5 mb-6 gap-3">
        <div className="flex items-center gap-2.5">
          <span className="p-1.5 rounded-md bg-red-600 text-white shadow-xs">
            <Flame className="w-5 h-5 text-amber-300 animate-pulse" />
          </span>
          <div>
            <h2 className="text-xl md:text-2xl font-bold font-solaiman text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
              <span>{lang === 'bn' ? 'সর্বাধিক পঠিত সংবাদ' : 'Most Read & Popular News'}</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-red-100 dark:bg-red-950/70 text-red-700 dark:text-red-300 font-extrabold uppercase font-mono tracking-wider">
                TOP RANKED
              </span>
            </h2>
          </div>
        </div>

        {/* Period Selector Tabs */}
        <div className="flex items-center gap-1.5 p-1 rounded-lg bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs font-bold">
          <button
            onClick={() => setFilterPeriod('today')}
            className={`px-3 py-1 rounded-md transition-all cursor-pointer ${
              filterPeriod === 'today'
                ? 'bg-red-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            আজকের পঠিত
          </button>
          <button
            onClick={() => setFilterPeriod('week')}
            className={`px-3 py-1 rounded-md transition-all cursor-pointer ${
              filterPeriod === 'week'
                ? 'bg-red-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            সপ্তাহের সেরা
          </button>
          <button
            onClick={() => setFilterPeriod('month')}
            className={`px-3 py-1 rounded-md transition-all cursor-pointer ${
              filterPeriod === 'month'
                ? 'bg-red-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            মাসিক ট্রেন্ড
          </button>
        </div>
      </div>

      {/* Ranked Grid (8 Ranked Items) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {popularList.map((article, index) => {
          const rank = index + 1;
          const isTopThree = rank <= 3;

          return (
            <article
              key={article.id}
              onClick={() => onSelectArticle(article)}
              className="group cursor-pointer p-3.5 rounded-lg border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-red-500/60 dark:hover:border-red-500/60 hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                {/* Ranking Number & Category */}
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-gray-100 dark:border-slate-800">
                  <div className="flex items-center gap-1.5">
                    <span className={`w-6 h-6 rounded flex items-center justify-center font-black text-xs font-mono shadow-2xs ${
                      rank === 1
                        ? 'bg-red-600 text-white'
                        : rank === 2
                        ? 'bg-amber-500 text-white'
                        : rank === 3
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 dark:bg-slate-800 text-gray-950 dark:text-gray-100'
                    }`}>
                      {toBengaliNumber(rank)}
                    </span>
                    <span className="text-[11px] font-bold text-red-600 dark:text-red-400">
                      {article.category}
                    </span>
                  </div>

                  {article.views && (
                    <span className="flex items-center gap-1 text-[11px] font-bold text-gray-700 dark:text-gray-300">
                      <Eye className="w-3 h-3 text-red-600" />
                      <span>{toBengaliNumber(article.views)} পঠিত</span>
                    </span>
                  )}
                </div>

                {/* News Image */}
                <div className="relative overflow-hidden rounded aspect-16/10 bg-slate-100 dark:bg-slate-800 mb-2.5">
                  <img
                    src={article.imageUrl?.trim() || 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?auto=format&fit=crop&w=800&q=80'}
                    alt={article.title}
                    onError={(e) => {
                      e.currentTarget.src = 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?auto=format&fit=crop&w=800&q=80';
                    }}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300"
                  />
                  {rank === 1 && (
                    <span className="absolute bottom-2 left-2 px-2 py-0.5 rounded text-[10px] font-bold bg-red-600 text-white flex items-center gap-1 shadow-md">
                      <Award className="w-3 h-3" />
                      <span>১ নম্বর সর্বাধিক পঠিত</span>
                    </span>
                  )}
                </div>

                {/* Headline */}
                <h3 className="text-sm md:text-base font-bold font-solaiman text-gray-950 dark:text-white group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors line-clamp-2 leading-snug">
                  {article.title}
                </h3>

                {/* Excerpt */}
                <p className="text-xs text-gray-900 dark:text-gray-100 font-solaiman line-clamp-2 mt-1.5 leading-relaxed">
                  {article.excerpt}
                </p>
              </div>

              {/* Author & Date Footer */}
              <div className="mt-3 pt-2.5 border-t border-gray-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-gray-800 dark:text-gray-300 font-solaiman">
                <div className="flex items-center gap-1.5 truncate max-w-[130px]">
                  <img
                    src={getAuthorAvatar(article.author, article.authorAvatar)}
                    alt=""
                    onError={(e) => {
                      e.currentTarget.src = DEFAULT_AVATAR_DATA_URI;
                    }}
                    className="w-4 h-4 rounded-full object-cover border border-red-500 bg-slate-100 dark:bg-slate-800"
                  />
                  <span className="truncate font-bold text-gray-950 dark:text-white">{article.author}</span>
                </div>
                <div className="flex items-center gap-1 shrink-0 font-semibold">
                  <Clock className="w-3 h-3 text-red-600" />
                  <span>{article.timeAgo || article.date}</span>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
};
