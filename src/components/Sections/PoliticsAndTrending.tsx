import React, { useState } from 'react';
import { ChevronRight, Clock, Flame, TrendingUp, Briefcase, Scale } from 'lucide-react';
import { Article, AdSlot } from '../../types/news';
import { SidebarAdSlot } from '../Ads/SidebarAdSlot';
import { fillArticlesToTarget } from '../../utils/layoutFillers';

interface PoliticsAndTrendingProps {
  articles: Article[];
  onSelectArticle: (article: Article) => void;
  darkMode: boolean;
  lang: 'bn' | 'en';
  adSlots?: AdSlot[];
}

export const PoliticsAndTrending: React.FC<PoliticsAndTrendingProps> = ({
  articles,
  onSelectArticle,
  darkMode,
  lang,
  adSlots = [],
}) => {
  const [activeTab, setActiveTab] = useState<'trending' | 'law' | 'jobs'>('trending');

  // Filter trending items with automated filler
  const primaryTrending = articles.filter(a => a.trendRank).sort((a, b) => (a.trendRank || 0) - (b.trendRank || 0));
  const trendingArticles = fillArticlesToTarget(primaryTrending, articles, 5);

  // Law court items with automated filler
  const primaryLaw = articles.filter(a => a.category === 'আইন-আদালত');
  const lawArticles = fillArticlesToTarget(primaryLaw, articles, 4);

  // Politics items with automated filler
  const polLead = articles.find(a => a.id === 'art-pol-lead') || articles.find(a => a.category === 'রাজনীতি') || articles[0];
  const primaryPol = articles.filter(a => a.category === 'রাজনীতি' && a.id !== polLead?.id);
  const polStack = fillArticlesToTarget(primaryPol, articles, 4, new Set([polLead?.id]));
  const primaryBottom = articles.filter(a => a.category === 'রাজনীতি' && a.id !== polLead?.id && !polStack.some(s => s.id === a.id));
  const polBottom = fillArticlesToTarget(primaryBottom, articles, 2, new Set([polLead?.id, ...polStack.map(s => s.id)]));

  // Bengali numerals
  const banglaDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
  const toBanglaNum = (n: number) => {
    return n.toString().split('').map(d => banglaDigits[parseInt(d, 10)] || d).join('');
  };

  return (
    <section className="w-full max-w-7xl mx-auto px-4 my-10">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* LEFT COLUMN: 3-Tab Widget (আলোচিত / আইন-আদালত / চাকরি) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="border border-gray-200 dark:border-slate-800 rounded-lg overflow-hidden bg-white dark:bg-slate-900 shadow-2xs">
            {/* Tab Headers */}
            <div className="flex border-b border-gray-200 dark:border-slate-800 bg-gray-50/80 dark:bg-slate-800/60 text-xs font-solaiman font-bold">
              <button
                onClick={() => setActiveTab('trending')}
                className={`flex-1 py-2.5 text-center transition-colors relative flex items-center justify-center gap-1.5 cursor-pointer ${
                  activeTab === 'trending'
                    ? 'text-red-600 bg-white dark:bg-slate-900 font-black'
                    : 'text-gray-900 dark:text-gray-200 hover:text-red-600'
                }`}
              >
                <TrendingUp className="w-3.5 h-3.5" />
                <span>{lang === 'bn' ? 'আলোচিত' : 'Trending'}</span>
                {activeTab === 'trending' && (
                  <span className="absolute top-0 left-0 right-0 h-0.5 bg-red-600" />
                )}
              </button>
              <button
                onClick={() => setActiveTab('law')}
                className={`flex-1 py-2.5 text-center transition-colors relative flex items-center justify-center gap-1.5 cursor-pointer ${
                  activeTab === 'law'
                    ? 'text-red-600 bg-white dark:bg-slate-900 font-black'
                    : 'text-gray-900 dark:text-gray-200 hover:text-red-600'
                }`}
              >
                <Scale className="w-3.5 h-3.5" />
                <span>{lang === 'bn' ? 'আইন-আদালত' : 'Law & Court'}</span>
                {activeTab === 'law' && (
                  <span className="absolute top-0 left-0 right-0 h-0.5 bg-red-600" />
                )}
              </button>
              <button
                onClick={() => setActiveTab('jobs')}
                className={`flex-1 py-2.5 text-center transition-colors relative flex items-center justify-center gap-1.5 cursor-pointer ${
                  activeTab === 'jobs'
                    ? 'text-red-600 bg-white dark:bg-slate-900 font-black'
                    : 'text-gray-900 dark:text-gray-200 hover:text-red-600'
                }`}
              >
                <Briefcase className="w-3.5 h-3.5" />
                <span>{lang === 'bn' ? 'চাকরি' : 'Jobs'}</span>
                {activeTab === 'jobs' && (
                  <span className="absolute top-0 left-0 right-0 h-0.5 bg-red-600" />
                )}
              </button>
            </div>

            {/* Tab Contents: Numbered Ranking List (১, ২, ৩, ৪, ৫) */}
            <div className="p-4 space-y-3.5">
              {activeTab === 'trending' && (
                trendingArticles.map((art, idx) => (
                  <div
                    key={art.id}
                    onClick={() => onSelectArticle(art)}
                    className="group cursor-pointer flex items-start gap-3 pb-3 border-b border-gray-100 dark:border-slate-800 last:border-b-0 last:pb-0"
                  >
                    <span className="flex items-center justify-center w-6 h-6 rounded-full bg-gray-100 dark:bg-slate-800 text-gray-950 dark:text-gray-100 font-bold font-solaiman text-xs shrink-0 group-hover:bg-red-600 group-hover:text-white transition-colors">
                      {lang === 'bn' ? toBanglaNum(idx + 1) : (idx + 1)}
                    </span>
                    <div className="flex-1">
                      <h4 className="text-xs md:text-sm font-solaiman font-bold text-gray-950 dark:text-white group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors line-clamp-2">
                        {lang === 'bn' ? art.title : (art.titleEn || art.title)}
                      </h4>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="inline-flex items-center gap-1 text-[9px] font-bold text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/60 px-1.5 py-0.5 rounded border border-red-200 dark:border-red-900/60 font-mono">
                          TRENDING
                        </span>
                        <span className="text-[10px] text-gray-700 dark:text-gray-300 font-solaiman font-medium">
                          {art.views?.toLocaleString()} বার পঠিত
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              )}

              {activeTab === 'law' && (
                lawArticles.map((art, idx) => (
                  <div
                    key={art.id}
                    onClick={() => onSelectArticle(art)}
                    className="group cursor-pointer flex items-start gap-3 pb-3 border-b border-gray-100 dark:border-slate-800 last:border-b-0 last:pb-0"
                  >
                    <span className="flex items-center justify-center w-6 h-6 rounded-full bg-gray-100 dark:bg-slate-800 text-gray-950 dark:text-gray-100 font-bold font-solaiman text-xs shrink-0 group-hover:bg-red-600 group-hover:text-white transition-colors">
                      {lang === 'bn' ? toBanglaNum(idx + 1) : (idx + 1)}
                    </span>
                    <div className="flex-1">
                      <h4 className="text-xs md:text-sm font-solaiman font-bold text-gray-950 dark:text-white group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors line-clamp-2">
                        {lang === 'bn' ? art.title : (art.titleEn || art.title)}
                      </h4>
                      <span className="text-[10px] text-gray-700 dark:text-gray-300 font-solaiman font-medium mt-0.5 block">
                        {art.date}
                      </span>
                    </div>
                  </div>
                ))
              )}

              {activeTab === 'jobs' && (
                <div className="space-y-3">
                  {[
                    'বাংলাদেশ ব্যাংকে সহকারী পরিচালক পদে ১০০ জনের নিয়োগ বিজ্ঞপ্তি',
                    '৪৬তম বিসিএস প্রিলিমিনারি পরীক্ষার ফল প্রকাশ',
                    'সরকারি প্রাথমিক বিদ্যালয়ে সহকারী শিক্ষক নিয়োগের ৩য় ধাপের ফল',
                    'বেসরকারি শিক্ষক নিবন্ধন (NTRCA) সার্কুলার ২০২৬',
                    'সমাজসেবা অধিদপ্তরে বিভিন্ন পদে নিয়োগ পরীক্ষা শুক্রবার',
                  ].map((jobTitle, idx) => (
                    <div
                      key={idx}
                      onClick={() => onSelectArticle(articles[0])}
                      className="group cursor-pointer flex items-start gap-3 pb-3 border-b border-gray-100 dark:border-slate-800 last:border-b-0 last:pb-0"
                    >
                      <span className="flex items-center justify-center w-6 h-6 rounded-full bg-gray-100 dark:bg-slate-800 text-gray-950 dark:text-gray-100 font-bold font-solaiman text-xs shrink-0 group-hover:bg-red-600 group-hover:text-white transition-colors">
                        {lang === 'bn' ? toBanglaNum(idx + 1) : (idx + 1)}
                      </span>
                      <div className="flex-1">
                        <h4 className="text-xs md:text-sm font-solaiman font-bold text-gray-950 dark:text-white group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors line-clamp-2">
                          {jobTitle}
                        </h4>
                        <span className="text-[10px] text-emerald-700 dark:text-emerald-400 font-solaiman font-bold mt-0.5 block">
                          আবেদনের শেষ সময়: ৩০ অক্টোবর
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: রাজনীতি (Politics) Section */}
        <div className="lg:col-span-8 space-y-5">
          {/* Section Header */}
          <div className="flex items-center justify-between border-b-2 border-red-600 pb-2">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-6 bg-red-600 inline-block rounded-xs" />
              <h2 className="text-xl md:text-2xl font-bold font-solaiman text-gray-950 dark:text-white">
                {lang === 'bn' ? 'রাজনীতি' : 'Politics'}
              </h2>
              <ChevronRight className="w-5 h-5 text-red-600" />
            </div>
            <span className="text-xs font-bold font-solaiman text-gray-800 dark:text-gray-200 hover:text-red-600 cursor-pointer">
              {lang === 'bn' ? 'আরও খবর' : 'More'} →
            </span>
          </div>

          {/* Politics Layout: Big featured card on left + 4 stacked cards on right */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
            {/* Politics Main Lead Card (col-span-7) */}
            {polLead && (
              <div 
                onClick={() => onSelectArticle(polLead)}
                className="md:col-span-7 group cursor-pointer space-y-3 p-3.5 rounded-lg bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 hover:border-red-500/60 dark:hover:border-red-500/60 hover:shadow-md transition-all duration-200"
              >
                <div className="relative overflow-hidden rounded aspect-16/10 bg-slate-100 dark:bg-slate-800">
                  <img
                    src={polLead.imageUrl?.trim() || 'https://images.unsplash.com/photo-1541872703-74c5e44368f9?auto=format&fit=crop&w=800&q=80'}
                    alt={polLead.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300"
                  />
                  <div className="absolute top-2.5 left-2.5">
                    <span className="px-2 py-0.5 text-xs font-bold font-solaiman rounded bg-red-600 text-white shadow-xs">
                      সর্বশেষ
                    </span>
                  </div>
                </div>
                <h3 className="text-base md:text-lg font-bold font-solaiman leading-snug text-gray-950 dark:text-white group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors">
                  {lang === 'bn' ? polLead.title : (polLead.titleEn || polLead.title)}
                </h3>
                <p className="text-xs font-solaiman text-gray-900 dark:text-gray-100 line-clamp-3 leading-relaxed">
                  {lang === 'bn' ? polLead.excerpt : (polLead.excerptEn || polLead.excerpt)}
                </p>
                <div className="flex items-center gap-2 text-[11px] text-gray-700 dark:text-gray-300 font-solaiman font-medium">
                  <Clock className="w-3 h-3 text-red-600" />
                  <span>{polLead.date}</span>
                </div>
              </div>
            )}

            {/* Politics Right Stack (col-span-5): 4 Horizontal Items with Thumbnails */}
            <div className="md:col-span-5 space-y-3 divide-y divide-gray-100 dark:divide-slate-800">
              {polStack.map((item) => (
                <div
                  key={item.id}
                  onClick={() => onSelectArticle(item)}
                  className="group cursor-pointer flex gap-3 pt-3 first:pt-0"
                >
                  <div className="w-20 h-14 rounded overflow-hidden shadow-2xs bg-slate-100 dark:bg-slate-800 shrink-0">
                    <img
                      src={item.imageUrl?.trim() || 'https://images.unsplash.com/photo-1541872703-74c5e44368f9?auto=format&fit=crop&w=800&q=80'}
                      alt={item.title}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover group-hover:scale-103 transition-transform"
                    />
                  </div>
                  <div className="flex-1 space-y-1">
                    <h4 className="text-xs font-bold font-solaiman leading-snug text-gray-950 dark:text-white group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors line-clamp-2">
                      {lang === 'bn' ? item.title : (item.titleEn || item.title)}
                    </h4>
                    <span className="text-[10px] text-gray-700 dark:text-gray-300 font-solaiman font-medium block">
                      {item.timeAgo}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Politics Bottom 2 Split Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-gray-200 dark:border-slate-800">
            {polBottom.slice(0, 2).map((item, idx) => (
              <div
                key={`${item.id}-${idx}`}
                onClick={() => onSelectArticle(item)}
                className="group cursor-pointer flex gap-3 p-2.5 rounded-lg bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 hover:shadow-xs transition-shadow"
              >
                <div className="w-24 h-16 rounded overflow-hidden bg-slate-100 dark:bg-slate-800 shrink-0">
                  <img
                    src={item.imageUrl?.trim() || 'https://images.unsplash.com/photo-1541872703-74c5e44368f9?auto=format&fit=crop&w=800&q=80'}
                    alt={item.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover group-hover:scale-103 transition-transform"
                  />
                </div>
                <div className="flex-1 space-y-1">
                  <h4 className="text-xs font-bold font-solaiman leading-snug text-gray-950 dark:text-white group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors line-clamp-2">
                    {lang === 'bn' ? item.title : (item.titleEn || item.title)}
                  </h4>
                  <span className="text-[10px] text-gray-700 dark:text-gray-300 font-solaiman font-medium block">
                    {item.date}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Politics Right Sidebar Ad */}
          <SidebarAdSlot
            position="politics_right"
            adSlots={adSlots}
            darkMode={darkMode}
            className="mt-4"
          />

        </div>

      </div>
    </section>
  );
};
