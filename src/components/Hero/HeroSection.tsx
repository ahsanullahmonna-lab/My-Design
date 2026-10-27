import React from 'react';
import { Clock, Eye, Share2, Flame, ArrowRight } from 'lucide-react';
import { Article, AdSlot } from '../../types/news';
import { SidebarAdSlot } from '../Ads/SidebarAdSlot';
import { getAuthorAvatar, DEFAULT_AVATAR_DATA_URI } from '../../utils/authorAvatar';
import { ArchiveCalendarWidget } from '../Archive/ArchiveCalendarWidget';
import { WeatherPrayerWidget } from '../Widgets/WeatherPrayerWidget';
import { LocalDistrictNewsWidget } from '../Widgets/LocalDistrictNewsWidget';
import { fillArticlesToTarget } from '../../utils/layoutFillers';

interface HeroSectionProps {
  articles: Article[];
  onSelectArticle: (article: Article) => void;
  darkMode: boolean;
  lang: 'bn' | 'en';
  adSlots?: AdSlot[];
  onSelectArchiveDate?: (dateStr: string, matchedArticles: Article[]) => void;
  selectedArchiveDate?: string | null;
  selectedDistrict?: string | null;
  onSelectDistrict?: (district: string | null) => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  articles,
  onSelectArticle,
  darkMode,
  lang,
  adSlots = [],
  onSelectArchiveDate,
  selectedArchiveDate,
  selectedDistrict,
  onSelectDistrict,
}) => {
  // Find lead story
  const leadArticle = articles.find(a => a.isLead) || articles[0];
  
  // Left column articles (fill up to 3 items to balance vertical column height)
  const primaryLeft = articles.filter(a => a.id === 'art-hero-left-1' || a.id === 'art-hero-left-2' || a.id === 'art-hero-left-3');
  const leftArticles = fillArticlesToTarget(primaryLeft, articles, 3, new Set([leadArticle?.id]));
  
  // Center sub-stories (3 horizontal cards below lead)
  const primaryCenter = articles.filter(a => 
    a.id === 'art-sub-1' || a.id === 'art-sub-2' || a.id === 'art-sub-3'
  );
  const centerSubArticles = fillArticlesToTarget(
    primaryCenter, 
    articles, 
    3, 
    new Set([leadArticle?.id, ...leftArticles.map(a => a.id)])
  );

  // Center secondary spotlight stories (2 cards to ensure the center column harmonizes with right column widgets)
  const excludeSet = new Set([leadArticle?.id, ...leftArticles.map(a => a.id), ...centerSubArticles.map(a => a.id)]);
  const remainingForCenter = articles.filter(a => !excludeSet.has(a.id));
  const centerSecondaryArticles = fillArticlesToTarget([], remainingForCenter, 2, excludeSet);

  // Right column article
  const excludeSetForRight = new Set([...excludeSet, ...centerSecondaryArticles.map(a => a.id)]);
  const rightArticle = articles.find(a => a.id === 'art-hero-right-1') || 
    articles.find(a => !excludeSetForRight.has(a.id)) || 
    articles[0];

  return (
    <section className="w-full py-5 max-w-7xl mx-auto px-4 font-solaiman">
      {/* 3-Column Broadsheet Top Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        
        {/* LEFT COLUMN (lg:col-span-3) - 3 Stacked Broadsheet Stories */}
        <div className="lg:col-span-3 space-y-4 order-2 lg:order-1 flex flex-col justify-between">
          {leftArticles.map((article) => (
            <article
              key={article.id}
              onClick={() => onSelectArticle(article)}
              className="group cursor-pointer p-3 sm:p-4 rounded-lg bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 hover:border-red-500/60 dark:hover:border-red-500/60 hover:shadow-md transition-all duration-200 space-y-2.5 flex-1 flex flex-col justify-between"
            >
              <div>
                <div className="relative overflow-hidden rounded aspect-16/10 bg-slate-100 dark:bg-slate-800 mb-2">
                  <img
                    src={article.imageUrl?.trim() || 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?auto=format&fit=crop&w=800&q=80'}
                    alt={article.title}
                    onError={(e) => {
                      e.currentTarget.src = 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?auto=format&fit=crop&w=800&q=80';
                    }}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300"
                  />
                </div>
                <div className="text-[11px] font-solaiman font-bold text-red-600 dark:text-red-400">
                  {article.category}
                </div>
                <h2 className="text-sm sm:text-base font-bold font-solaiman leading-snug tracking-tight text-gray-950 dark:text-white group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors line-clamp-2 mt-0.5">
                  {lang === 'bn' ? article.title : (article.titleEn || article.title)}
                </h2>
                <p className="text-xs font-solaiman text-gray-900 dark:text-gray-200 line-clamp-2 leading-relaxed mt-1">
                  {lang === 'bn' ? article.excerpt : (article.excerptEn || article.excerpt)}
                </p>
              </div>
              <div className="flex items-center justify-between text-[11px] text-gray-800 dark:text-gray-300 font-solaiman pt-2 border-t border-gray-100 dark:border-slate-800 mt-2">
                <div className="flex items-center gap-1.5">
                  <img 
                    src={getAuthorAvatar(article.author, article.authorAvatar)} 
                    alt="" 
                    onError={(e) => {
                      e.currentTarget.src = DEFAULT_AVATAR_DATA_URI;
                    }}
                    className="w-4 h-4 rounded-full object-cover border border-red-500 bg-slate-100" 
                  />
                  <span className="font-bold text-gray-950 dark:text-white truncate max-w-[110px]">{article.author}</span>
                </div>
                <div className="flex items-center gap-1 font-semibold text-gray-800 dark:text-gray-300">
                  <Clock className="w-3 h-3 text-red-600" />
                  <span>{article.timeAgo || article.date}</span>
                </div>
              </div>
            </article>
          ))}
        </div>

        {/* CENTER COLUMN (lg:col-span-6) - Dominant Lead Story + 3 Sub-Cards + 2 Spotlight Cards */}
        <div className="lg:col-span-6 order-1 lg:order-2 space-y-4 flex flex-col justify-between">
          {leadArticle && (
            <article
              onClick={() => onSelectArticle(leadArticle)}
              className="group cursor-pointer p-4 sm:p-5 rounded-lg bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 hover:border-red-500/60 dark:hover:border-red-500/60 hover:shadow-md transition-all duration-200 space-y-3"
            >
              {/* Main Lead Photo */}
              <div className="relative overflow-hidden rounded aspect-16/9 bg-slate-100 dark:bg-slate-800">
                <img
                  src={leadArticle.imageUrl?.trim() || 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?auto=format&fit=crop&w=800&q=80'}
                  alt={leadArticle.title}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300"
                />
              </div>

              {/* Unboxed Broadsheet Category Kicker */}
              <div className="text-xs font-bold font-solaiman text-red-600 dark:text-red-400 uppercase tracking-wider">
                {leadArticle.category}
              </div>

              {/* Lead Headline - Solid Black SolaimanLipi */}
              <h1 className="text-xl sm:text-2xl md:text-3xl font-black font-solaiman leading-snug tracking-tight text-gray-950 dark:text-white group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors">
                {lang === 'bn' ? leadArticle.title : (leadArticle.titleEn || leadArticle.title)}
              </h1>

              {/* Lead Excerpt */}
              <p className="text-sm md:text-base font-solaiman text-gray-900 dark:text-gray-100 leading-relaxed line-clamp-3 font-normal">
                {lang === 'bn' ? leadArticle.excerpt : (leadArticle.excerptEn || leadArticle.excerpt)}
              </p>

              {/* Lead Meta */}
              <div className="flex items-center justify-between text-xs text-gray-800 dark:text-gray-300 border-t border-gray-100 dark:border-slate-800 pt-3 font-solaiman font-medium">
                <div className="flex items-center gap-2">
                  <img
                    src={getAuthorAvatar(leadArticle.author, leadArticle.authorAvatar)}
                    alt=""
                    onError={(e) => {
                      e.currentTarget.src = DEFAULT_AVATAR_DATA_URI;
                    }}
                    className="w-5 h-5 rounded-full object-cover border border-red-600 bg-slate-100"
                  />
                  <span className="font-bold text-gray-950 dark:text-white">{leadArticle.author}</span>
                  <span>•</span>
                  <span>{leadArticle.date}</span>
                </div>
                <div className="flex items-center gap-1 font-bold text-gray-900 dark:text-gray-200">
                  <Eye className="w-3.5 h-3.5 text-red-600" />
                  <span>{leadArticle.views.toLocaleString()}</span>
                </div>
              </div>
            </article>
          )}

          {/* 3 Horizontal Sub-Stories right under Lead */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {centerSubArticles.map((subArt) => (
              <article
                key={subArt.id}
                onClick={() => onSelectArticle(subArt)}
                className="group cursor-pointer p-3 rounded-lg bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 hover:border-red-500/60 dark:hover:border-red-500/60 hover:shadow-xs transition-all duration-200 flex sm:flex-col gap-2.5 flex-1"
              >
                <div className="w-24 sm:w-full aspect-16/10 rounded overflow-hidden bg-slate-100 dark:bg-slate-800 shrink-0">
                  <img
                    src={subArt.imageUrl?.trim() || 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?auto=format&fit=crop&w=800&q=80'}
                    alt={subArt.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover group-hover:scale-103 transition-transform"
                  />
                </div>
                <div className="flex-1 space-y-1">
                  <span className="text-[10px] font-solaiman font-bold text-red-600 dark:text-red-400">
                    {subArt.category}
                  </span>
                  <h3 className="text-xs font-bold font-solaiman leading-snug text-gray-950 dark:text-white group-hover:text-red-600 dark:group-hover:text-red-400 line-clamp-2 transition-colors">
                    {lang === 'bn' ? subArt.title : (subArt.titleEn || subArt.title)}
                  </h3>
                  <div className="text-[10px] font-solaiman text-gray-700 dark:text-gray-300 pt-1">
                    {subArt.timeAgo || subArt.date}
                  </div>
                </div>
              </article>
            ))}
          </div>

          {/* 2 Horizontal Spotlight Cards below Sub-Stories to balance vertical height */}
          {centerSecondaryArticles.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              {centerSecondaryArticles.map((spotArt) => (
                <article
                  key={`spot-${spotArt.id}`}
                  onClick={() => onSelectArticle(spotArt)}
                  className="group cursor-pointer p-3 rounded-lg bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 hover:border-red-500/60 dark:hover:border-red-500/60 hover:shadow-xs transition-all duration-200 flex gap-3 items-center"
                >
                  <div className="w-24 h-18 rounded overflow-hidden bg-slate-100 dark:bg-slate-800 shrink-0">
                    <img
                      src={spotArt.imageUrl?.trim() || 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?auto=format&fit=crop&w=800&q=80'}
                      alt={spotArt.title}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover group-hover:scale-103 transition-transform"
                    />
                  </div>
                  <div className="flex-1 min-w-0 space-y-1">
                    <span className="text-[10px] font-bold text-red-600 dark:text-red-400">
                      {spotArt.category}
                    </span>
                    <h4 className="text-xs font-bold font-solaiman leading-snug text-gray-950 dark:text-white group-hover:text-red-600 dark:group-hover:text-red-400 line-clamp-2 transition-colors">
                      {lang === 'bn' ? spotArt.title : (spotArt.titleEn || spotArt.title)}
                    </h4>
                    <span className="text-[10px] text-gray-600 dark:text-gray-300 block">
                      {spotArt.timeAgo || spotArt.date}
                    </span>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>

        {/* RIGHT COLUMN (lg:col-span-3) - Featured Broadsheet Story & Live Bulletin & Sidebar Widgets */}
        <div className="lg:col-span-3 space-y-4 order-3 flex flex-col justify-between">
          {rightArticle && (
            <article
              onClick={() => onSelectArticle(rightArticle)}
              className="group cursor-pointer p-3 sm:p-4 rounded-lg bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 hover:border-red-500/60 dark:hover:border-red-500/60 hover:shadow-md transition-all duration-200 space-y-2.5"
            >
              <div className="relative overflow-hidden rounded aspect-16/10 bg-slate-100 dark:bg-slate-800">
                <img
                  src={rightArticle.imageUrl?.trim() || 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?auto=format&fit=crop&w=800&q=80'}
                  alt={rightArticle.title}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover group-hover:scale-102 transition-transform"
                />
              </div>
              <div className="text-[11px] font-solaiman font-bold text-red-600 dark:text-red-400">
                {rightArticle.category}
              </div>
              <h2 className="text-base font-bold font-solaiman leading-snug tracking-tight text-gray-950 dark:text-white group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors">
                {lang === 'bn' ? rightArticle.title : (rightArticle.titleEn || rightArticle.title)}
              </h2>
              <p className="text-xs font-solaiman text-gray-900 dark:text-gray-200 line-clamp-3 leading-relaxed">
                {lang === 'bn' ? rightArticle.excerpt : (rightArticle.excerptEn || rightArticle.excerpt)}
              </p>
              <div className="flex items-center justify-between text-[11px] text-gray-800 dark:text-gray-300 font-solaiman pt-2 border-t border-gray-100 dark:border-slate-800">
                <div className="flex items-center gap-1.5">
                  <img 
                    src={getAuthorAvatar(rightArticle.author, rightArticle.authorAvatar)} 
                    alt="" 
                    onError={(e) => {
                      e.currentTarget.src = DEFAULT_AVATAR_DATA_URI;
                    }}
                    className="w-4 h-4 rounded-full object-cover border border-red-500 bg-slate-100" 
                  />
                  <span className="font-bold text-gray-950 dark:text-white truncate max-w-[110px]">{rightArticle.author}</span>
                </div>
                <div className="flex items-center gap-1 font-semibold text-gray-800 dark:text-gray-300">
                  <Clock className="w-3 h-3 text-red-600" />
                  <span>{rightArticle.timeAgo || rightArticle.date}</span>
                </div>
              </div>
            </article>
          )}

          {/* Clean Broadsheet Bulletin Box */}
          <div className="p-4 rounded-lg bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 shadow-2xs">
            <div className="flex items-center justify-between pb-2 border-b border-gray-200 dark:border-slate-800">
              <span className="text-xs font-black font-solaiman text-red-600 flex items-center gap-1.5 uppercase">
                <Flame className="w-3.5 h-3.5 text-red-600" />
                তাজা বুলেটিন
              </span>
              <span className="text-[10px] text-red-600 dark:text-red-400 font-bold font-mono tracking-wider">LIVE</span>
            </div>
            <ul className="mt-3 space-y-2.5 text-xs font-solaiman text-gray-950 dark:text-gray-100">
              <li className="flex items-start gap-2 hover:text-red-600 dark:hover:text-red-400 cursor-pointer transition-colors leading-relaxed font-bold">
                <span className="text-red-600 mt-0.5">•</span>
                <span>নির্বাচন কমিশনের সংস্কার বিষয়ক মতবিনিময় সভা শুরু</span>
              </li>
              <li className="flex items-start gap-2 hover:text-red-600 dark:hover:text-red-400 cursor-pointer transition-colors leading-relaxed font-bold">
                <span className="text-red-600 mt-0.5">•</span>
                <span>চট্টগ্রাম বন্দরে কনটেইনার জট নিরসনে বিশেষ টাস্কফোর্স</span>
              </li>
              <li className="flex items-start gap-2 hover:text-red-600 dark:hover:text-red-400 cursor-pointer transition-colors leading-relaxed font-bold">
                <span className="text-red-600 mt-0.5">•</span>
                <span>শেয়ারবাজারে ইতিবাচক লেনদেন, সূচক ঊর্ধ্বমুখী</span>
              </li>
            </ul>
          </div>

          {/* Weather & Prayer Times Widget */}
          <div>
            <WeatherPrayerWidget darkMode={darkMode} />
          </div>

          {/* Archive Calendar Widget */}
          {onSelectArchiveDate && (
            <div>
              <ArchiveCalendarWidget
                articles={articles}
                onSelectDate={onSelectArchiveDate}
                selectedDate={selectedArchiveDate || null}
                darkMode={darkMode}
              />
            </div>
          )}

          {/* Sidebar Advertisement Slot */}
          <div>
            <SidebarAdSlot darkMode={darkMode} adSlots={adSlots} position="sidebar_1" />
          </div>
        </div>

      </div>

      {/* FULL-WIDTH DISTRICT NEWS BANNER - 100% Responsive Grid with zero layout shifts */}
      {onSelectDistrict && (
        <div id="local-district-news-widget" className="mt-8 w-full scroll-mt-20">
          <LocalDistrictNewsWidget 
            articles={articles}
            onSelectDistrict={onSelectDistrict} 
            selectedDistrict={selectedDistrict || null}
            darkMode={darkMode}
            lang={lang}
            variant="inline-banner"
          />
        </div>
      )}
    </section>
  );
};
