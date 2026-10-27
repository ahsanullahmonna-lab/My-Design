import React from 'react';
import { useSiteConfig } from '../../context/SiteConfigContext';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  darkMode?: boolean;
  customLogoUrl?: string;
  customHeight?: number;
  customWidth?: number;
  siteName?: string;
  siteNameEn?: string;
  tagline?: string;
}

export const Logo: React.FC<LogoProps> = ({ 
  className = '', 
  size = 'md', 
  darkMode = false,
  customLogoUrl,
  customHeight,
  customWidth,
  siteName: propSiteName,
  siteNameEn: propSiteNameEn,
  tagline: propTagline,
}) => {
  const globalConfig = useSiteConfig();

  // Resolve dynamically from global config with prop overrides if provided
  const siteName = (propSiteName || globalConfig.siteName || 'দৈনিক বাংলাদেশ').trim();
  const siteNameEn = (propSiteNameEn || globalConfig.siteNameEn || 'Daily Bangladesh').trim();
  const tagline = (propTagline || globalConfig.tagline || 'পজিটিভ বাংলাদেশ').trim();
  
  // Custom logo resolution (takes prop or dark/light from config)
  const resolvedLogoUrl = (
    customLogoUrl || 
    (darkMode ? globalConfig.darkLogoUrl : globalConfig.lightLogoUrl)
  )?.trim();

  const isSmall = size === 'sm';

  // Dynamic Height & Width resolution controlled directly by Admin Logo Size Controller (Zero Restrictions)
  const configuredHeight = isSmall 
    ? (globalConfig.footerLogoHeight ?? globalConfig.settings?.footerLogoHeight ?? 22)
    : (globalConfig.headerLogoHeight ?? globalConfig.settings?.headerLogoHeight ?? 28);
  
  const configuredWidth = isSmall
    ? (globalConfig.footerLogoWidth ?? globalConfig.settings?.footerLogoWidth ?? 0)
    : (globalConfig.headerLogoWidth ?? globalConfig.settings?.headerLogoWidth ?? 0);

  const finalHeight = (customHeight !== undefined && customHeight > 0) ? customHeight : configuredHeight;
  const finalWidth = (customWidth !== undefined && customWidth > 0) ? customWidth : configuredWidth;

  // Unrestricted scaling ratio (allows admin to scale freely from tiny to ultra-jumbo)
  const scaleRatio = Math.max(0.2, finalHeight / 28);

  // If the user uploaded a custom logo via Admin Settings, display it with unrestricted sizing
  if (resolvedLogoUrl && resolvedLogoUrl !== '') {
    const containerStyle: React.CSSProperties = {
      minHeight: `${finalHeight}px`,
      width: finalWidth && finalWidth > 0 ? `${finalWidth}px` : 'auto',
      minWidth: finalWidth && finalWidth > 0 ? `${finalWidth}px` : undefined,
    };

    const imgStyle: React.CSSProperties = {
      height: `${finalHeight}px`,
      maxHeight: 'none',
      width: finalWidth && finalWidth > 0 ? `${finalWidth}px` : 'auto',
      maxWidth: finalWidth && finalWidth > 0 ? `${finalWidth}px` : 'none',
      objectFit: finalWidth && finalWidth > 0 ? 'fill' : 'contain',
    };

    return (
      <div style={containerStyle} className={`shrink-0 flex items-center select-none overflow-visible transition-all ${className}`}>
        <img 
          src={resolvedLogoUrl} 
          alt={siteName} 
          style={imgStyle}
          className="transition-all block overflow-visible" 
        />
      </div>
    );
  }

  // Broadsheet vector emblem + typography with dynamic pixel scaling from Admin Controller:
  const emblemPx = Math.round(28 * scaleRatio);
  const svgPx = Math.round(16 * scaleRatio);
  const titleFontPx = Math.round(18 * scaleRatio);
  const enFontPx = Math.max(8, Math.round(10.5 * scaleRatio));
  const tagFontPx = Math.max(7, Math.round(9 * scaleRatio));

  const wrapperStyle: React.CSSProperties = {
    minHeight: `${finalHeight}px`,
    width: finalWidth && finalWidth > 0 ? `${finalWidth}px` : 'auto',
  };

  return (
    <div 
      style={wrapperStyle}
      className={`shrink-0 flex items-center gap-2 select-none overflow-visible transition-all ${className}`}
    >
      {/* Dynamic Pen Nib Emblem */}
      <div 
        style={{ width: `${emblemPx}px`, height: `${emblemPx}px`, minWidth: `${emblemPx}px` }}
        className="relative flex items-center justify-center rounded-full bg-red-600 shadow-xs shrink-0 transition-transform hover:scale-105"
      >
        <svg 
          viewBox="0 0 40 40" 
          fill="none" 
          style={{ width: `${svgPx}px`, height: `${svgPx}px` }}
        >
          <circle cx="20" cy="20" r="18" fill="#dc2626" />
          <path 
            d="M20 7 C22 13, 27 18, 27 25 C27 29, 23 33, 20 33 C17 33, 13 29, 13 25 C13 18, 18 13, 20 7 Z" 
            fill="#ffffff" 
          />
          <path 
            d="M20 18 L20 28" 
            stroke="#dc2626" 
            strokeWidth="2" 
            strokeLinecap="round" 
          />
          <circle cx="20" cy="20" r="2.5" fill="#dc2626" />
          <path 
            d="M17 12 C14 16, 12 21, 14 26" 
            stroke="#ffffff" 
            strokeWidth="1.5" 
            strokeLinecap="round" 
            fill="none" 
          />
        </svg>
      </div>

      {/* Brand Typography dynamically scaled by Admin Controller */}
      <div className="flex flex-col justify-center leading-none">
        <div className="flex items-baseline gap-1.5 leading-none">
          <span 
            style={{ fontSize: `${titleFontPx}px` }}
            className={`font-black tracking-tight font-solaiman leading-none whitespace-nowrap ${
              darkMode ? 'text-white' : 'text-slate-900'
            }`}
          >
            {siteName.includes('২৪') ? (
              <>
                {siteName.replace('২৪', '')}<span className="text-red-600">২৪</span>
              </>
            ) : (
              siteName
            )}
          </span>
          <span 
            style={{ fontSize: `${enFontPx}px` }}
            className="font-latin font-black text-gray-800 dark:text-gray-200 tracking-wide leading-none whitespace-nowrap"
          >
            {siteNameEn}
          </span>
        </div>
        <span 
          style={{ fontSize: `${tagFontPx}px`, marginTop: `${Math.max(1, Math.round(3 * scaleRatio))}px` }}
          className="font-solaiman font-bold tracking-wider text-emerald-600 leading-none whitespace-nowrap"
        >
          {tagline}
        </span>
      </div>
    </div>
  );
};
