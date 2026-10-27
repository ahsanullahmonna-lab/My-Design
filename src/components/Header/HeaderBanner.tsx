import React from 'react';
import { AdSlot } from '../../types/news';
import { useSiteConfig } from '../../context/SiteConfigContext';
import { UniversalAdSlot } from '../Ads/UniversalAdSlot';

interface HeaderBannerProps {
  darkMode: boolean;
  lang: 'bn' | 'en';
  adSlots?: AdSlot[];
}

export const HeaderBanner: React.FC<HeaderBannerProps> = ({ 
  darkMode, 
  lang,
  adSlots = []
}) => {
  const siteConfig = useSiteConfig();
  const headerAd = adSlots.find(s => s.position === 'header_top');

  // If slot is explicitly inactive
  if (headerAd && !headerAd.isActive) {
    return null;
  }

  // If slot is code or text or custom dimensions
  if (headerAd && (headerAd.type === 'code' || headerAd.type === 'text' || headerAd.size === 'custom')) {
    return (
      <header className={`w-full py-2 px-4 transition-colors ${
        darkMode ? 'bg-slate-950 border-b border-slate-800' : 'bg-white border-b border-slate-200'
      }`}>
        <div className="max-w-7xl mx-auto flex justify-center">
          <UniversalAdSlot slot={headerAd} darkMode={darkMode} />
        </div>
      </header>
    );
  }

  const activeAd = (headerAd && headerAd.isActive) ? headerAd : {
    title: 'স্পেশাল ক্যাম্পেইন ও বাণিজ্যিক প্রচার পার্টনার',
    sponsorName: `${siteConfig.siteNameEn || siteConfig.siteName} Partner`,
    imageUrl: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1200&q=80',
    targetUrl: `https://${siteConfig.domain || 'example.com'}`,
  };

  return (
    <header className={`w-full py-3 px-4 transition-colors ${
      darkMode ? 'bg-slate-950 border-b border-slate-800' : 'bg-white border-b border-slate-200'
    }`}>
      <div className="max-w-7xl mx-auto">
        {/* Full Width Ad Banner Area as requested */}
        <a
          href={activeAd.targetUrl || 'https://example.com'}
          target="_blank"
          rel="noreferrer"
          className={`relative block overflow-hidden rounded-lg border p-2 md:p-3 flex items-center justify-between gap-4 shadow-sm group transition-all hover:shadow-md ${
            darkMode 
              ? 'bg-slate-900 border-slate-800 text-slate-200' 
              : 'bg-slate-50 border-slate-200 text-slate-800'
          }`}
        >
          <div className="flex items-center gap-4 flex-1 overflow-hidden">
            {activeAd.imageUrl?.trim() ? (
              <img
                src={activeAd.imageUrl.trim()}
                alt={activeAd.title}
                className="w-24 h-12 md:w-36 md:h-14 object-contain bg-white dark:bg-slate-800/80 rounded shrink-0 border border-slate-300 dark:border-slate-700 group-hover:scale-102 transition-transform p-0.5"
              />
            ) : (
              <div className="w-24 h-12 md:w-36 md:h-14 bg-red-600 text-white rounded flex items-center justify-center font-bold text-xs shrink-0 font-solaiman">
                বিজ্ঞাপন
              </div>
            )}
            <div className="truncate space-y-0.5">
              <div className="text-xs md:text-sm font-bold font-solaiman truncate group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors">
                {activeAd.title}
              </div>
              <div className="text-[11px] text-gray-700 dark:text-gray-300 font-latin font-medium flex items-center gap-2">
                <span>স্পন্সরড: {activeAd.sponsorName || 'পার্টনার স্পন্সর'}</span>
                <span>•</span>
                <span className="text-red-600 font-black">বিশেষ অফার</span>
              </div>
            </div>
          </div>
          <div className="text-[10px] uppercase font-bold text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-slate-700 px-2.5 py-1 rounded bg-white dark:bg-slate-800 shrink-0 font-latin">
            ADVERTISEMENT
          </div>
        </a>
      </div>
    </header>
  );
};
