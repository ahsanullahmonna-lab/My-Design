import React, { useState } from 'react';
import { ChevronRight, Clock, MapPin, Filter, X } from 'lucide-react';
import { Article, AdSlot } from '../../types/news';
import { SidebarAdSlot } from '../Ads/SidebarAdSlot';
import { SmartFillerAdCard } from '../Ads/SmartFillerAdCard';
import { fillArticlesToTarget, getAdaptiveGridClass } from '../../utils/layoutFillers';
import { BANGLADESH_DIVISIONS, getDivisionDistricts, isDistrictMatch } from '../../data/bangladeshGeoData';

interface CountrywideSectionProps {
  articles: Article[];
  onSelectArticle: (article: Article) => void;
  darkMode: boolean;
  lang: 'bn' | 'en';
  adSlots?: AdSlot[];
  onOpenDistrictFilter?: () => void;
}

const divisions = ['সকল', 'ঢাকা', 'চট্টগ্রাম', 'রাজশাহী', 'খুলনা', 'বরিশাল', 'সিলেট', 'রংপুর', 'ময়মনসিংহ'];

export const CountrywideSection: React.FC<CountrywideSectionProps> = ({
  articles,
  onSelectArticle,
  darkMode,
  lang,
  adSlots = [],
  onOpenDistrictFilter,
}) => {
  const [selectedDiv, setSelectedDiv] = useState('সকল');
  const [selectedDist, setSelectedDist] = useState<string | null>(null);
  
  const countryArticles = articles.filter(a => a.category === 'দেশজুড়ে' || a.district);
  
  // Filter logic: if district selected, filter by district; else if division selected, filter by division; else all countrywide
  const filteredArticles = selectedDist
    ? countryArticles.filter(a => isDistrictMatch(a.district, selectedDist, a.tags, a.title))
    : selectedDiv === 'সকল' 
      ? countryArticles 
      : countryArticles.filter(a => {
          const divDistricts = getDivisionDistricts(selectedDiv).map(d => d.nameBn);
          return (
            (a.division && a.division === selectedDiv) ||
            (a.district && divDistricts.includes(a.district)) ||
            (a.district && a.district.includes(selectedDiv))
          );
        });

  const hasCountryAd = adSlots.some(a => a.position === 'country_right' && a.isActive);
  const targetCount = hasCountryAd ? 3 : 4;

  // Automated fallback filler: if a district/division has fewer articles, auto-fill with trending countrywide posts
  const displayList = fillArticlesToTarget(
    filteredArticles,
    countryArticles.length > 0 ? countryArticles : articles,
    targetCount
  );

  const innerGridClass = getAdaptiveGridClass(displayList.length, hasCountryAd ? 3 : 4);

  const availableDistricts = selectedDiv !== 'সকল' ? getDivisionDistricts(selectedDiv) : [];

  return (
    <section className="w-full max-w-7xl mx-auto px-4 my-10 font-solaiman">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b-2 border-red-600 pb-2 mb-3 gap-2">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-6 bg-red-600 inline-block rounded-xs" />
          <h2 className="text-xl md:text-2xl font-bold font-solaiman text-slate-900 dark:text-white flex items-center gap-2">
            <span>{lang === 'bn' ? 'দেশজুড়ে' : 'Countrywide'}</span>
          </h2>
          <ChevronRight className="w-5 h-5 text-red-600" />
          {selectedDist && (
            <span className="text-xs px-2 py-0.5 rounded bg-red-600 text-white font-bold flex items-center gap-1">
              <MapPin className="w-3 h-3" />
              <span>{selectedDist} জেলা</span>
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedDist(null);
                }}
                className="hover:text-red-200 ml-1 text-[11px]"
              >
                ✕
              </button>
            </span>
          )}
        </div>

        {/* Division Filter Pills */}
        <div className="flex items-center gap-1 overflow-x-auto no-scrollbar py-1">
          {divisions.map((div) => (
            <button
              key={div}
              onClick={() => {
                setSelectedDiv(div);
                setSelectedDist(null);
              }}
              className={`px-2.5 py-1 text-xs font-solaiman rounded-full whitespace-nowrap transition-colors cursor-pointer ${
                selectedDiv === div && !selectedDist
                  ? 'bg-red-600 text-white font-bold'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {div}
            </button>
          ))}
        </div>
      </div>

      {/* Dependent District Pills (Shown when a division is selected) */}
      {selectedDiv !== 'সকল' && availableDistricts.length > 0 && (
        <div className="mb-4 p-2.5 rounded-lg bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          <span className="text-[11px] font-bold text-slate-500 whitespace-nowrap flex items-center gap-1 mr-1">
            <MapPin className="w-3 h-3 text-red-600" />
            <span>{selectedDiv} বিভাগের জেলা:</span>
          </span>
          <button
            onClick={() => setSelectedDist(null)}
            className={`px-2 py-0.5 text-xs rounded transition-colors whitespace-nowrap cursor-pointer ${
              selectedDist === null
                ? 'bg-slate-800 text-white dark:bg-white dark:text-slate-900 font-bold'
                : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
            }`}
          >
            সব জেলা
          </button>
          {availableDistricts.map((d) => (
            <button
              key={d.nameBn}
              onClick={() => setSelectedDist(d.nameBn)}
              className={`px-2.5 py-0.5 text-xs rounded transition-colors whitespace-nowrap cursor-pointer ${
                selectedDist === d.nameBn
                  ? 'bg-red-600 text-white font-bold shadow-2xs'
                  : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:border-red-400'
              }`}
            >
              {d.nameBn}
            </button>
          ))}
        </div>
      )}


      {/* Dynamic Grid with Smart Ad / Widget Fallback */}
      <div className={`grid grid-cols-1 ${hasCountryAd ? 'lg:grid-cols-12' : ''} gap-5 items-start`}>
        {/* News Items Column */}
        <div className={`${hasCountryAd ? 'lg:col-span-9' : 'w-full'}`}>
          <div className={`${innerGridClass} gap-5`}>
            {displayList.map((article) => (
              <article
                key={article.id}
                onClick={() => onSelectArticle(article)}
                className="group cursor-pointer space-y-2.5 bg-white dark:bg-slate-900 p-3.5 rounded-lg border border-gray-200 dark:border-slate-800 hover:border-red-500/60 dark:hover:border-red-500/60 hover:shadow-md transition-all duration-200"
              >
                <div className="relative overflow-hidden rounded aspect-16/10 bg-slate-100 dark:bg-slate-800">
                  <img
                    src={article.imageUrl?.trim() || 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?auto=format&fit=crop&w=800&q=80'}
                    alt={article.title}
                    onError={(e) => {
                      e.currentTarget.src = 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?auto=format&fit=crop&w=800&q=80';
                    }}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-102"
                  />
                  {article.district && (
                    <span className="absolute bottom-2 left-2 flex items-center gap-1 px-2 py-0.5 text-[10px] font-solaiman font-bold rounded bg-black/85 text-white backdrop-blur-xs">
                      <MapPin className="w-2.5 h-2.5 text-red-400" />
                      {article.district}
                    </span>
                  )}
                </div>
                <h3 className="text-sm md:text-base font-bold font-solaiman leading-snug text-gray-950 dark:text-white group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors line-clamp-2">
                  {lang === 'bn' ? article.title : (article.titleEn || article.title)}
                </h3>
                <p className="text-xs font-solaiman text-gray-900 dark:text-gray-100 line-clamp-2 leading-relaxed">
                  {lang === 'bn' ? article.excerpt : (article.excerptEn || article.excerpt)}
                </p>
                <div className="flex items-center gap-2 text-[11px] text-gray-700 dark:text-gray-300 font-solaiman font-medium pt-1 border-t border-gray-100 dark:border-slate-800">
                  <Clock className="w-3 h-3 text-red-600" />
                  <span>{article.timeAgo || article.date}</span>
                </div>
              </article>
            ))}

            {/* Smart filler card if 3 items and no sidebar ad */}
            {!hasCountryAd && displayList.length === 3 && (
              <SmartFillerAdCard 
                type="citizen" 
                darkMode={darkMode} 
                className="h-full min-h-[200px]"
              />
            )}
          </div>
        </div>

        {/* Right Sidebar Ad Slot or Fallback Promo Card */}
        {hasCountryAd ? (
          <div className="lg:col-span-3">
            <SidebarAdSlot
              position="country_right"
              adSlots={adSlots}
              darkMode={darkMode}
            />
          </div>
        ) : null}
      </div>
    </section>
  );
};
