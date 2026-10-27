import React from 'react';
import { ExternalLink, Sparkles, Megaphone } from 'lucide-react';
import { AdSlot } from '../../types/news';
import { useSiteConfig } from '../../context/SiteConfigContext';

interface SidebarAdSlotProps {
  position: 'hero_right' | 'politics_right' | 'world_right' | 'country_right' | 'header_top' | 'footer_top' | string;
  adSlots: AdSlot[];
  darkMode: boolean;
  className?: string;
  fallbackLabel?: string;
  showFallbackPlaceholder?: boolean;
}

export const SidebarAdSlot: React.FC<SidebarAdSlotProps> = ({
  position,
  adSlots,
  darkMode,
  className = '',
  fallbackLabel,
  showFallbackPlaceholder = true,
}) => {
  const { siteName, domain, contactEmail } = useSiteConfig();

  // Find matching active ad for this position with alias support
  const ad = adSlots.find((s) => {
    if (!s.isActive) return false;
    if (s.isAutoExpire && s.expiresAt) {
      try {
        if (new Date(s.expiresAt).getTime() < Date.now()) return false;
      } catch {
        // ignore
      }
    }
    if (s.position === position) return true;
    if (position === 'hero_right' && s.position === 'sidebar_top') return true;
    if (position === 'sidebar_top' && s.position === 'hero_right') return true;
    if (position === 'politics_right' && s.position === 'sidebar_middle') return true;
    if (position === 'sidebar_middle' && s.position === 'politics_right') return true;
    if ((position === 'world_right' || position === 'country_right') && s.position === 'sidebar_bottom') return true;
    if (position === 'sidebar_bottom' && (s.position === 'world_right' || s.position === 'country_right')) return true;
    return false;
  });

  // If slot is inactive or not found, gracefully render promotional widget fallback
  if (!ad) {
    if (!showFallbackPlaceholder) return null;

    return (
      <div
        className={`group relative rounded-md border overflow-hidden transition-all duration-200 shadow-2xs hover:shadow-md ${
          darkMode
            ? 'bg-gradient-to-b from-slate-900 via-slate-900 to-[#141b24] border-slate-800'
            : 'bg-gradient-to-b from-slate-50 via-white to-red-50/20 border-slate-200'
        } ${className}`}
      >
        <div className="flex items-center justify-between px-3 py-1.5 text-[10px] text-slate-400 font-solaiman border-b border-slate-100 dark:border-slate-800/80 bg-slate-50/60 dark:bg-slate-800/40">
          <span className="flex items-center gap-1 font-semibold text-slate-500 dark:text-slate-400">
            <span className="w-1.5 h-1.5 rounded-full bg-red-600" />
            বিজ্ঞাপন স্লট
          </span>
          <span className="font-medium text-slate-500 dark:text-slate-400">
            {fallbackLabel || 'বিজ্ঞাপন দিন'}
          </span>
        </div>
        <div className="p-4 text-center space-y-2.5">
          <div className="w-9 h-9 mx-auto rounded-full bg-red-600/10 dark:bg-red-950/60 text-red-600 flex items-center justify-center font-bold shadow-2xs">
            <Sparkles className="w-4 h-4" />
          </div>
          <h4 className="text-sm font-bold font-solaiman text-slate-900 dark:text-white leading-snug">
            {siteName}-এ আপনার ব্যবসার বিজ্ঞাপন দিন
          </h4>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 font-solaiman leading-relaxed">
            ডিজিটাল পোর্টাল ও ই-পেপারে দেশ-বিদেশের লাখো সচেতন পাঠকের কাছে পৌঁছান।
          </p>
          <div className="pt-1 flex flex-col gap-1 items-center">
            <span className="text-[10px] font-mono text-slate-400">বিজ্ঞাপন হটলাইন: {contactEmail || `ads@${domain}`}</span>
            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-red-600 dark:text-red-400 group-hover:underline font-solaiman">
              <span>যোগাযোগ করুন</span>
              <ExternalLink className="w-3 h-3" />
            </span>
          </div>
        </div>
      </div>
    );
  }

  // Custom AdSense / Code snippet ad
  if (ad.type === 'code' && ad.codeSnippet) {
    return (
      <div
        className={`w-full rounded-md border p-3 overflow-hidden transition-all shadow-xs ${
          darkMode ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-200'
        } ${className}`}
      >
        <div className="flex items-center justify-between text-[10px] text-slate-400 font-solaiman mb-2 border-b border-slate-100 dark:border-slate-800/80 pb-1">
          <span className="flex items-center gap-1 font-semibold text-slate-500">
            <Megaphone className="w-2.5 h-2.5 text-red-600" />
            বিজ্ঞাপন (AdSense)
          </span>
          <span className="font-mono text-[9px] uppercase tracking-wider text-slate-400">
            {ad.size || 'Responsive'}
          </span>
        </div>
        <div 
          className="w-full flex items-center justify-center min-h-[120px] text-xs font-mono text-slate-400 bg-slate-50 dark:bg-slate-800/50 rounded p-2 overflow-x-auto"
          dangerouslySetInnerHTML={{ __html: ad.codeSnippet }}
        />
        {ad.sponsorName && (
          <div className="text-[10px] text-right text-slate-400 mt-1 font-solaiman">
            স্পন্সর: {ad.sponsorName}
          </div>
        )}
      </div>
    );
  }

  // Text Announcement Ad
  if (ad.type === 'text') {
    return (
      <div
        className={`w-full rounded-md border p-4 overflow-hidden transition-all shadow-xs ${
          darkMode ? 'bg-slate-900 border-slate-800' : 'bg-amber-50/30 border-amber-200'
        } ${className}`}
      >
        <div className="flex items-center justify-between text-[10px] text-slate-400 font-solaiman mb-2 border-b border-amber-200/60 dark:border-slate-800 pb-1.5">
          <span className="flex items-center gap-1 font-bold text-amber-600 dark:text-amber-400">
            <Megaphone className="w-2.5 h-2.5 text-amber-600" />
            বিজ্ঞাপন ঘোষণা
          </span>
          <span className="font-semibold text-slate-500">
            {ad.sponsorName || 'স্পন্সরড'}
          </span>
        </div>
        <h4 className="text-sm font-bold font-solaiman text-slate-900 dark:text-white leading-snug">
          {ad.textHeadline || ad.title}
        </h4>
        {ad.textDescription && (
          <p className="text-xs text-slate-600 dark:text-slate-300 mt-1.5 font-solaiman line-clamp-3 leading-relaxed">
            {ad.textDescription}
          </p>
        )}
        {ad.targetUrl && (
          <div className="mt-3 pt-2 border-t border-slate-200 dark:border-slate-800 flex justify-end">
            <a
              href={ad.targetUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs font-bold text-amber-600 dark:text-amber-400 hover:underline font-solaiman"
            >
              <span>{ad.textCtaLabel || 'বিস্তারিত জানুন'}</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        )}
      </div>
    );
  }

  // Image Banner Ad - Strictly bounded to standard responsive slot dimensions (e.g. 300x250)
  const is300x250 = !ad.size || ad.size === '300x250';

  return (
    <div
      className={`group relative w-full max-w-full mx-auto rounded-lg border overflow-hidden transition-all duration-200 shadow-xs hover:shadow-md ${
        darkMode
          ? 'bg-slate-900 border-slate-800'
          : 'bg-white border-slate-200'
      } ${className}`}
    >
      {/* Ad Header Tag */}
      <div className="flex items-center justify-between px-3 py-1.5 text-[10px] text-slate-400 font-solaiman border-b border-slate-100 dark:border-slate-800/80 bg-slate-50/80 dark:bg-slate-800/40">
        <span className="flex items-center gap-1 font-semibold text-slate-500 dark:text-slate-400">
          <span className="w-1.5 h-1.5 rounded-full bg-red-600 shrink-0" />
          বিজ্ঞাপন
        </span>
        <span className="font-medium text-slate-600 dark:text-slate-300 truncate max-w-[170px]">
          {ad.sponsorName || fallbackLabel || 'SPONSORED'}
        </span>
      </div>

      {/* Clickable Ad Banner */}
      <a
        href={ad.targetUrl || '#'}
        target="_blank"
        rel="noopener noreferrer"
        className="block relative overflow-hidden bg-slate-50 dark:bg-slate-950/60"
      >
        {ad.imageUrl && ad.imageUrl.trim() !== '' ? (
          <div className="relative w-full aspect-[300/250] max-h-[250px] overflow-hidden flex items-center justify-center p-1 bg-slate-50 dark:bg-slate-900/60">
            <img
              src={ad.imageUrl.trim()}
              alt={ad.title}
              referrerPolicy="no-referrer"
              className="w-full h-full max-w-full max-h-full object-contain transition-transform duration-300 group-hover:scale-[1.02]"
            />
          </div>
        ) : (
          /* Styled Fallback Vector Banner if no custom image is supplied */
          <div className="p-4 text-center space-y-2 bg-gradient-to-br from-red-600/10 via-amber-500/5 to-blue-600/10 dark:from-red-950/40 dark:to-slate-900">
            <div className="w-9 h-9 mx-auto rounded-full bg-red-600 text-white flex items-center justify-center font-bold text-sm shadow-xs">
              <Sparkles className="w-4 h-4" />
            </div>
            <h4 className="text-sm font-bold font-solaiman text-slate-900 dark:text-white leading-snug">
              {ad.title}
            </h4>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 font-solaiman">
              {ad.sponsorName ? `${ad.sponsorName}-এর সৌজন্যে` : 'আজই ভিজিট করুন'}
            </p>
            <div className="pt-1">
              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-red-600 dark:text-red-400 group-hover:underline">
                <span>বিস্তারিত দেখুন</span>
                <ExternalLink className="w-3 h-3" />
              </span>
            </div>
          </div>
        )}
      </a>

      {/* Title / Description caption bar if provided */}
      {ad.title && (
        <div className="px-3 py-1.5 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800">
          <p className="text-[11px] font-solaiman font-bold text-slate-800 dark:text-slate-200 line-clamp-1 group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors">
            {ad.title}
          </p>
        </div>
      )}

      {/* Ad Footer Action Bar */}
      <div className="px-3 py-1.5 bg-slate-50 dark:bg-slate-800/40 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[10px]">
        <span className="text-slate-400 font-mono">Slot: {ad.size || '300x250'}</span>
        <a
          href={ad.targetUrl || '#'}
          target="_blank"
          rel="noopener noreferrer"
          className="text-red-600 dark:text-red-400 font-bold hover:underline flex items-center gap-1 font-solaiman"
        >
          <span>অফার দেখুন</span>
          <ExternalLink className="w-2.5 h-2.5" />
        </a>
      </div>
    </div>
  );
};
