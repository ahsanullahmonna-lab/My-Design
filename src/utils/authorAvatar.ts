/**
 * High quality editorial journalist portraits and avatar generator
 * Ensures authentic journalist profile display across news cards, headers, and bio boxes.
 * Includes automatic Site Logo / default avatar fallback for external writers and manual authors.
 */

import React, { useState } from 'react';

export const DEFAULT_AVATAR_DATA_URI = `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" fill="none">
  <circle cx="32" cy="32" r="32" fill="#f1f5f9"/>
  <circle cx="32" cy="24" r="11" fill="#94a3b8"/>
  <path d="M14 54 C16 42, 23 37, 32 37 C41 37, 48 42, 50 54 Z" fill="#94a3b8"/>
</svg>
`)}`;

/**
 * Retrieves the current site logo from localStorage settings
 */
export function getSiteLogoFallback(): string | null {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      const raw = localStorage.getItem('kolom24_settings') || localStorage.getItem('kolom24_settings_v2');
      if (raw) {
        const parsed = JSON.parse(raw);
        const logo = parsed.lightLogoUrl?.trim() || parsed.darkLogoUrl?.trim();
        if (logo && logo.length > 5) return logo;
      }
    }
  } catch {
    // ignore
  }
  return null;
}

/**
 * Helper to check registered users list from localStorage
 */
export function getRegisteredUsersList(): Array<{ name: string; avatar?: string }> {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      const raw = localStorage.getItem('kolom24_users');
      if (raw) return JSON.parse(raw);
    }
  } catch {
    // ignore
  }
  return [];
}

const journalistAvatars: Record<string, string> = {
  editor: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
  court: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80',
  chattogram: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=200&q=80',
  entertainment: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&q=80',
  kolkata: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=200&q=80',
  sports: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=200&q=80',
  politics: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=200&q=80',
  world: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=200&q=80',
  investigative: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=200&q=80',
};

/**
 * Resolves author profile image with automatic Site Logo / default avatar fallback for external/manual authors
 */
export function getAuthorAvatar(
  authorName?: string, 
  customAvatar?: string, 
  customSiteLogoUrl?: string | null,
  registeredUsers?: Array<{ name: string; avatar?: string }>
): string {
  // 1. If explicit valid custom avatar provided
  if (customAvatar && customAvatar.trim() && !customAvatar.includes('undefined') && !customAvatar.includes('null')) {
    return customAvatar.trim();
  }

  // 2. Check if author matches an active registered site user account with avatar
  const users = registeredUsers || getRegisteredUsersList();
  if (authorName && users.length > 0) {
    const cleanName = authorName.trim().toLowerCase();
    const matched = users.find(u => u.name && u.name.trim().toLowerCase() === cleanName);
    if (matched && matched.avatar && matched.avatar.trim()) {
      return matched.avatar.trim();
    }
  }

  // 3. Departmental keywords for known internal desks
  if (authorName) {
    const lower = authorName.toLowerCase();
    if (lower.includes('আদালত') || lower.includes('আইন')) return journalistAvatars.court;
    if (lower.includes('চট্টগ্রাম')) return journalistAvatars.chattogram;
    if (lower.includes('বিনোদন') || lower.includes('শোবিজ')) return journalistAvatars.entertainment;
    if (lower.includes('কলকাতা')) return journalistAvatars.kolkata;
    if (lower.includes('খেলা') || lower.includes('ক্রীড়া')) return journalistAvatars.sports;
    if (lower.includes('রাজনীতি') || lower.includes('কূটনীতি')) return journalistAvatars.politics;
    if (lower.includes('আন্তর্জাতিক') || lower.includes('বিশ্ব')) return journalistAvatars.world;
    if (lower.includes('অনুসন্ধানী') || lower.includes('বিশেষ')) return journalistAvatars.investigative;
    if (lower.includes('সম্পাদক') || lower.includes('শামীম')) return journalistAvatars.editor;
  }

  // 4. Fallback for External / Manual Authors: Automatically display the Site Logo
  const siteLogo = (customSiteLogoUrl && customSiteLogoUrl.trim()) ? customSiteLogoUrl.trim() : getSiteLogoFallback();
  if (siteLogo && siteLogo.length > 5) {
    return siteLogo;
  }

  // 5. Clean vector default avatar (guaranteed never to break)
  return DEFAULT_AVATAR_DATA_URI;
}

/**
 * Universal AuthorProfileImage component with auto-fallback to Site Logo and clean avatar on image error
 */
export const AuthorProfileImage: React.FC<{
  authorName?: string;
  avatarUrl?: string;
  siteLogoUrl?: string | null;
  className?: string;
  alt?: string;
}> = ({ authorName, avatarUrl, siteLogoUrl, className = 'w-4 h-4 rounded-full object-cover', alt = '' }) => {
  const resolvedLogo = siteLogoUrl || getSiteLogoFallback();
  const initialSrc = getAuthorAvatar(authorName, avatarUrl, resolvedLogo);
  const [currentSrc, setCurrentSrc] = useState(initialSrc);
  const [hasError, setHasError] = useState(false);

  const handleError = () => {
    if (!hasError) {
      setHasError(true);
      // Fallback 1: Site logo if different
      if (resolvedLogo && currentSrc !== resolvedLogo) {
        setCurrentSrc(resolvedLogo);
      } else {
        // Fallback 2: Clean SVG avatar
        setCurrentSrc(DEFAULT_AVATAR_DATA_URI);
      }
    } else {
      setCurrentSrc(DEFAULT_AVATAR_DATA_URI);
    }
  };

  return React.createElement('img', {
    src: currentSrc,
    alt: alt || authorName || 'Author',
    onError: handleError,
    className: `${className} bg-slate-100 dark:bg-slate-800`,
  });
};
