import React, { useState } from 'react';
import { ExternalLink, Megaphone, Info } from 'lucide-react';
import { AdSlot, AdPlacementPosition } from '../../types/news';

interface UniversalAdSlotProps {
  slot?: AdSlot;
  position?: AdPlacementPosition;
  adSlots?: AdSlot[];
  darkMode?: boolean;
  className?: string;
  fallbackPlaceholder?: boolean;
  showPlacementLabelInPreview?: boolean;
}

export const UniversalAdSlot: React.FC<UniversalAdSlotProps> = ({
  slot: directSlot,
  position,
  adSlots = [],
  darkMode = false,
  className = '',
  fallbackPlaceholder = false,
  showPlacementLabelInPreview = false,
}) => {
  const [imageError, setImageError] = useState(false);

  // Resolve matching ad slot
  const resolvedSlot = directSlot || (position ? adSlots.find((s) => {
    if (!s.isActive) return false;
    
    // Check auto-expire
    if (s.isAutoExpire && s.expiresAt) {
      try {
        const expiryDate = new Date(s.expiresAt);
        if (expiryDate.getTime() < Date.now()) {
          return false;
        }
      } catch {
        // invalid date format
      }
    }

    // Direct match
    if (s.position === position) return true;

    // Positional aliases
    if (position === 'sidebar_top' && s.position === 'hero_right') return true;
    if (position === 'hero_right' && s.position === 'sidebar_top') return true;

    if (position === 'sidebar_middle' && s.position === 'politics_right') return true;
    if (position === 'politics_right' && s.position === 'sidebar_middle') return true;

    if (position === 'sidebar_bottom' && (s.position === 'world_right' || s.position === 'country_right')) return true;
    if ((position === 'world_right' || position === 'country_right') && s.position === 'sidebar_bottom') return true;

    // Automated E-Paper BroadSheet Ad Sync (Requirement 2)
    if (position === 'epaper_top' && (s.position === 'header_top' || s.position === 'below_ticker')) return true;
    if (position === 'epaper_strip' && (s.position === 'home_inter_grid' || s.position === 'below_ticker')) return true;
    if (position === 'epaper_sidebar' && (s.position === 'sidebar_top' || s.position === 'sidebar_middle')) return true;
    if (position === 'epaper_bottom' && (s.position === 'footer_top' || s.position === 'article_bottom')) return true;

    return false;
  }) : undefined);

  if (!resolvedSlot) {
    if (!fallbackPlaceholder) return null;

    return (
      <div className={`w-full border border-dashed border-slate-300 dark:border-slate-700 rounded p-4 text-center text-xs text-slate-400 bg-slate-50/50 dark:bg-slate-900/30 ${className}`}>
        <p className="font-solaiman">বিজ্ঞাপন স্লট খালি ({position || 'Ad Slot'})</p>
      </div>
    );
  }

  // Dimension styling map
  const getDimensionStyles = () => {
    if (resolvedSlot.size === 'custom' && resolvedSlot.customWidth && resolvedSlot.customHeight) {
      return {
        maxWidth: `${resolvedSlot.customWidth}px`,
        minHeight: `${resolvedSlot.customHeight}px`,
        width: '100%',
      };
    }

    switch (resolvedSlot.size) {
      case '728x90':
        return { maxWidth: '728px', minHeight: '90px', width: '100%' };
      case '970x90':
        return { maxWidth: '970px', minHeight: '90px', width: '100%' };
      case '970x250':
        return { maxWidth: '970px', minHeight: '250px', width: '100%' };
      case '300x250':
        return { maxWidth: '300px', minHeight: '250px', width: '100%' };
      case '300x500':
        return { maxWidth: '300px', minHeight: '500px', width: '100%' };
      case '300x600':
        return { maxWidth: '300px', minHeight: '600px', width: '100%' };
      case '320x100':
        return { maxWidth: '320px', minHeight: '100px', width: '100%' };
      case 'responsive':
      default:
        return { width: '100%', maxWidth: '100%' };
    }
  };

  const dimensionStyles = getDimensionStyles();

  return (
    <div className={`relative flex flex-col items-center justify-center my-2 select-none mx-auto ${className}`}>
      {/* Top Meta Label */}
      <div className="w-full max-w-full flex items-center justify-between text-[10px] text-slate-400 mb-1 px-1 font-solaiman">
        <span className="flex items-center gap-1 opacity-80">
          <Megaphone className="w-2.5 h-2.5 text-amber-500" />
          <span>বিজ্ঞাপন</span>
          {resolvedSlot.sponsorName && (
            <span className="font-medium text-slate-500 dark:text-slate-400">
              • {resolvedSlot.sponsorName}
            </span>
          )}
        </span>
        {showPlacementLabelInPreview && (
          <span className="font-mono text-[9px] bg-slate-200 dark:bg-slate-800 px-1.5 py-0.2 rounded text-slate-600 dark:text-slate-300">
            {resolvedSlot.position} ({resolvedSlot.size})
          </span>
        )}
      </div>

      {/* Ad Container */}
      <div 
        style={dimensionStyles}
        className={`w-full overflow-hidden rounded border border-slate-200 dark:border-slate-800 transition-all duration-200 relative ${
          darkMode ? 'bg-slate-900/90' : 'bg-white'
        }`}
      >
        {/* Type 1: Image Banner */}
        {resolvedSlot.type === 'banner' && (
          <a
            href={resolvedSlot.targetUrl || '#'}
            target="_blank"
            rel="noopener noreferrer"
            className="group block relative w-full h-full overflow-hidden"
            title={resolvedSlot.altText || resolvedSlot.title}
          >
            {resolvedSlot.imageUrl && !imageError ? (
              <img
                src={resolvedSlot.imageUrl}
                alt={resolvedSlot.altText || resolvedSlot.title || 'বিজ্ঞাপন'}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.01]"
                onError={() => setImageError(true)}
                loading="lazy"
              />
            ) : (
              <div className="p-6 text-center bg-linear-to-br from-amber-500/10 to-red-500/10 flex flex-col items-center justify-center min-h-[140px]">
                <Megaphone className="w-8 h-8 text-amber-500 mb-2 opacity-80" />
                <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200 font-solaiman line-clamp-2">
                  {resolvedSlot.title}
                </h4>
                {resolvedSlot.sponsorName && (
                  <span className="text-xs text-amber-600 dark:text-amber-400 mt-1 font-solaiman">
                    স্পন্সর: {resolvedSlot.sponsorName}
                  </span>
                )}
              </div>
            )}
          </a>
        )}

        {/* Type 2: Code Snippet / Google AdSense / HTML */}
        {resolvedSlot.type === 'code' && (
          <div className="w-full h-full min-h-[90px] flex items-center justify-center p-2 text-center overflow-hidden">
            {resolvedSlot.codeSnippet ? (
              <div 
                className="w-full overflow-x-auto text-xs leading-relaxed"
                dangerouslySetInnerHTML={{ __html: resolvedSlot.codeSnippet }}
              />
            ) : (
              <div className="p-4 text-xs font-mono text-slate-400">
                [Google AdSense / HTML Code Slot Active]
              </div>
            )}
          </div>
        )}

        {/* Type 3: Dynamic Text Ad Announcement */}
        {resolvedSlot.type === 'text' && (
          <div className="p-4 sm:p-5 flex flex-col justify-between h-full bg-linear-to-r from-slate-50 to-amber-50/40 dark:from-slate-900 dark:to-amber-950/20">
            <div>
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-amber-500 text-white font-solaiman">
                  {resolvedSlot.sponsorName || 'বিশেষ ঘোষণা'}
                </span>
                <span className="text-[10px] text-slate-400 flex items-center gap-1 font-solaiman">
                  <Info className="w-3 h-3" /> স্পন্সরড বার্তা
                </span>
              </div>
              <h4 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white font-solaiman leading-snug line-clamp-2">
                {resolvedSlot.textHeadline || resolvedSlot.title}
              </h4>
              {resolvedSlot.textDescription && (
                <p className="text-xs text-slate-600 dark:text-slate-300 mt-1.5 font-solaiman line-clamp-3 leading-relaxed">
                  {resolvedSlot.textDescription}
                </p>
              )}
            </div>

            {resolvedSlot.targetUrl && (
              <div className="mt-3 pt-2 border-t border-slate-200/60 dark:border-slate-800 flex justify-end">
                <a
                  href={resolvedSlot.targetUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-700 dark:text-amber-400 hover:text-amber-800 dark:hover:text-amber-300 font-solaiman transition-colors"
                >
                  <span>{resolvedSlot.textCtaLabel || 'বিস্তারিত জানুন'}</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
