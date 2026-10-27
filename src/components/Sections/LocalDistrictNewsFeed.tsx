import React from 'react';
import { MapPin, X, Clock, ChevronRight, Share2, Eye, User, Sparkles, AlertCircle } from 'lucide-react';
import { Article, AdSlot } from '../../types/news';
import { findDivisionByDistrict, isDistrictMatch } from '../../data/bangladeshGeoData';

interface LocalDistrictNewsFeedProps {
  district: string;
  articles: Article[];
  onSelectArticle: (article: Article) => void;
  onClearDistrict: () => void;
  darkMode: boolean;
  lang: 'bn' | 'en';
  adSlots?: AdSlot[];
}

export const LocalDistrictNewsFeed: React.FC<LocalDistrictNewsFeedProps> = ({
  district,
  articles,
  onSelectArticle,
  onClearDistrict,
  darkMode,
  lang,
}) => {
  const division = findDivisionByDistrict(district);

  // Filter articles matching this district strictly
  const districtArticles = articles.filter(a => 
    isDistrictMatch(a.district, district, a.tags, a.title)
  );

  const leadStory = districtArticles[0];
  const secondaryStories = districtArticles.slice(1);

  return (
    <section className="w-full max-w-7xl mx-auto px-4 my-8 font-solaiman">
      {/* ================= BROADSHEET DISTRICT BANNER ================= */}
      <div className={`p-4 sm:p-5 rounded-xl border mb-6 shadow-sm ${
        darkMode 
          ? 'bg-[#151c24] border-red-900/60' 
          : 'bg-gradient-to-r from-red-50 via-white to-red-50/40 border-red-200'
      }`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start sm:items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-red-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-red-600/30">
              <MapPin className="w-6 h-6 animate-bounce" />
            </div>

            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-bold text-red-600 dark:text-red-400 uppercase tracking-wider font-mono">
                  {division} বিভাগ ➔
                </span>
                <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <span>{district} জেলার সকল সংবাদ</span>
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-red-600 text-white font-sans font-bold">
                    {districtArticles.length}টি সংবাদ
                  </span>
                </h1>
              </div>
              <p className="text-xs text-gray-800 dark:text-gray-200 font-medium mt-0.5">
                {district} জেলা থেকে প্রকাশিত সত্য, বস্তুনিষ্ঠ ও সর্বশেষ সংবাদ সংস্করণ।
              </p>
            </div>
          </div>

          {/* Reset / View All News CTA */}
          <button
            onClick={onClearDistrict}
            className="self-start sm:self-auto px-4 py-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-lg text-xs font-bold hover:bg-slate-800 dark:hover:bg-slate-100 transition-colors cursor-pointer flex items-center gap-1.5 shadow-sm"
          >
            <X className="w-4 h-4" />
            <span>সকল সংবাদে ফিরে যান</span>
          </button>
        </div>
      </div>

      {/* ================= IF LOCAL ARTICLES EXIST ================= */}
      {districtArticles.length > 0 ? (
        <div className="space-y-6">
          {/* 1. Lead Story for this district */}
          {leadStory && (
            <div 
              onClick={() => onSelectArticle(leadStory)}
              className={`group cursor-pointer rounded-xl border p-4 sm:p-5 transition-all shadow-sm hover:shadow-md ${
                darkMode ? 'bg-[#1b222c] border-slate-800 hover:border-slate-700' : 'bg-white border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-center">
                <div className="lg:col-span-7 space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-red-600 text-white flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      <span>{district} লিড সংবাদ</span>
                    </span>
                    <span className="text-xs text-gray-700 dark:text-gray-300 font-semibold">{leadStory.timeAgo}</span>
                  </div>

                  <h2 className="text-xl sm:text-2xl lg:text-3xl font-black text-gray-950 dark:text-white group-hover:text-red-600 transition-colors leading-snug">
                    {leadStory.title}
                  </h2>

                  <p className="text-sm text-gray-800 dark:text-gray-200 font-medium leading-relaxed line-clamp-3">
                    {leadStory.excerpt}
                  </p>

                  <div className="flex items-center justify-between pt-2 border-t border-gray-200 dark:border-slate-800 text-xs text-gray-800 dark:text-gray-200">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-gray-200 dark:bg-slate-700 flex items-center justify-center text-gray-950 dark:text-white font-bold text-[10px]">
                        {leadStory.author.charAt(0)}
                      </div>
                      <span className="font-bold">{leadStory.author}</span>
                      <span className="text-gray-400 dark:text-gray-600">•</span>
                      <span className="font-medium">{leadStory.date}</span>
                    </div>

                    <span className="text-red-600 dark:text-red-400 font-bold flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                      <span>সম্পূর্ণ পড়ুন</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>

                <div className="lg:col-span-5">
                  <div className="aspect-16/10 rounded-lg overflow-hidden bg-slate-100 dark:bg-slate-800 relative">
                    <img
                      src={leadStory.imageUrl?.trim() || 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?auto=format&fit=crop&w=800&q=80'}
                      alt={leadStory.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded bg-black/75 text-white text-[10px] backdrop-blur-xs flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-red-400" />
                      <span>{district}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 2. Secondary Local Stories Grid */}
          {secondaryStories.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-base font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2 border-b-2 border-red-600 pb-1.5 w-fit">
                <span>{district} জেলার আরও খবর</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {secondaryStories.map((art) => (
                  <article
                    key={art.id}
                    onClick={() => onSelectArticle(art)}
                    className={`group cursor-pointer rounded-lg border p-3.5 space-y-2.5 transition-all hover:border-red-400 dark:hover:border-red-600 ${
                      darkMode ? 'bg-[#1b222c] border-slate-800' : 'bg-white border-slate-200'
                    }`}
                  >
                    <div className="aspect-16/10 rounded overflow-hidden bg-slate-100 dark:bg-slate-800 relative">
                      <img
                        src={art.imageUrl?.trim() || 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?auto=format&fit=crop&w=800&q=80'}
                        alt={art.title}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                      <span className="absolute bottom-1.5 left-1.5 px-1.5 py-0.2 rounded bg-black/75 text-white text-[9px] backdrop-blur-xs">
                        {district}
                      </span>
                    </div>

                    <h4 className="text-sm font-bold text-gray-950 dark:text-white group-hover:text-red-600 transition-colors line-clamp-2 leading-snug">
                      {art.title}
                    </h4>

                    <p className="text-xs text-gray-800 dark:text-gray-200 font-medium line-clamp-2 leading-relaxed">
                      {art.excerpt}
                    </p>

                    <div className="flex items-center justify-between text-[11px] text-gray-700 dark:text-gray-300 font-medium pt-1.5 border-t border-gray-100 dark:border-slate-800">
                      <span>{art.author}</span>
                      <span>{art.timeAgo}</span>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        /* ================= IF NO ARTICLES FOR THIS DISTRICT ================= */
        <div className={`p-8 sm:p-12 text-center rounded-xl border space-y-4 ${
          darkMode ? 'bg-[#151c24] border-slate-800' : 'bg-white border-slate-200'
        }`}>
          <div className="w-16 h-16 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto">
            <AlertCircle className="w-8 h-8" />
          </div>

          <div className="max-w-md mx-auto space-y-2">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              '{district}' জেলার কোনো সংবাদ পাওয়া যায়নি
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              এই মুহূর্তে {district} জেলা থেকে আলাদা কোনো তাজা সংবাদ প্রকাশিত হয়নি। আপনি আমাদের প্রতিনিধি হিসেবে সংবাদ পাঠাতে পারেন অথবা সমগ্র দেশজুড়ে প্রকাশিত খবরগুলো পড়তে পারেন।
            </p>
          </div>

          <div className="flex items-center justify-center gap-3 pt-2">
            <button
              onClick={onClearDistrict}
              className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer shadow-sm"
            >
              সকল সংবাদ দেখুন
            </button>
          </div>
        </div>
      )}
    </section>
  );
};
