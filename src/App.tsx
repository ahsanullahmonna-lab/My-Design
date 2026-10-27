/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { 
  initialArticles, 
  initialCategories, 
  initialSettings, 
  initialAdSlots, 
  initialTickers,
  initialPhotoPosts,
  initialVideoPosts,
  initialUsers,
  initialFamilyMembers,
  initialJobApplications,
  initialQuotes
} from './data/mockNewsData';
import { 
  Article, 
  CategoryItem, 
  SiteSettings, 
  AdSlot, 
  TickerItem, 
  PhotoCardItem, 
  VideoNewsItem, 
  UserItem,
  FamilyMember,
  JobApplication,
  QuoteItem
} from './types/news';
import { TopBar } from './components/Header/TopBar';
import { HeaderBanner } from './components/Header/HeaderBanner';
import { Navbar } from './components/Header/Navbar';
import { BreakingTicker } from './components/BreakingTicker';
import { HeroSection } from './components/Hero/HeroSection';
import { BannerAd } from './components/Ads/BannerAd';
import { SpecialCards } from './components/SpecialCards';
import { NationalSection } from './components/Sections/NationalSection';
import { PopularNewsSection } from './components/Sections/PopularNewsSection';
import { PoliticsAndTrending } from './components/Sections/PoliticsAndTrending';
import { WorldSection } from './components/Sections/WorldSection';
import { CountrywideSection } from './components/Sections/CountrywideSection';
import { ShowbizSection } from './components/Sections/ShowbizSection';
import { MultiCategoryGrid } from './components/Sections/MultiCategoryGrid';
import { PhotoGallery } from './components/Sections/PhotoGallery';
import { QuotesSection } from './components/Quotes/QuotesSection';
import { VideoGallery } from './components/Sections/VideoGallery';
import { FamilySection } from './components/Sections/FamilySection';
import { globalArticleIndex } from './utils/dataIndexAndCache';
import { EPaperView } from './components/EPaper/EPaperView';
import { WebStoriesModal } from './components/WebStories/WebStoriesModal';
import { Footer } from './components/Footer/Footer';
import { ArticlePage } from './components/ArticleDetail/ArticlePage';
import { SearchModal } from './components/SearchModal';
import { AdminDashboard } from './components/Admin/AdminDashboard';
import { ArchiveArticlesModal } from './components/Archive/ArchiveArticlesModal';
import { CitizenNewsModal } from './components/CitizenNewsModal';
import { RecruitmentPortalModal } from './components/Recruitment/RecruitmentPortalModal';
import { UserProfileModal } from './components/User/UserProfileModal';
import { LoginModal } from './components/Auth/LoginModal';
import { SecretAdminGuardModal } from './components/Auth/SecretAdminGuardModal';
import { isSecretAdminAuthorized, checkUrlForSecretToken, revokeAdminGatewayAccess } from './utils/adminSecurity';
import { ErrorBoundary } from './components/Common/ErrorBoundary';
import { SiteConfigProvider } from './context/SiteConfigContext';
import { requestGoogleIndexing } from './utils/securityAndSeo';
import { SmartFillerAdCard } from './components/Ads/SmartFillerAdCard';
import { fillArticlesToTarget, getAdaptiveGridClass } from './utils/layoutFillers';
import { ArrowLeft, Clock, Sparkles, Send, ShieldCheck, Briefcase, CreditCard } from 'lucide-react';
import { apiCreatePost, apiUpdatePost, apiDeletePost, apiUpdateSettings } from './utils/api';
import { canAccessAdmin } from './utils/rbac';
import { LocalDistrictNewsWidget } from './components/Widgets/LocalDistrictNewsWidget';
import { LocalDistrictNewsFeed } from './components/Sections/LocalDistrictNewsFeed';
import { UniversalAdSlot } from './components/Ads/UniversalAdSlot';
import { initVisitorTracking } from './utils/visitorTracker';

export default function App() {
  // Persistent State Initializers using localStorage
  const [articles, setArticles] = useState<Article[]>(() => {
    try {
      const saved = localStorage.getItem('kolom24_articles');
      if (saved) {
        const parsed: Article[] = JSON.parse(saved);
        return parsed.map((art) => {
          if (art.content && art.content.includes('কলম২৪')) {
            return {
              ...art,
              content: art.content.replace(/কলম২৪/g, initialSettings.siteName),
              author: art.author ? art.author.replace(/কলম২৪/g, initialSettings.siteName) : art.author,
            };
          }
          return art;
        });
      }
      return initialArticles;
    } catch {
      return initialArticles;
    }
  });

  const [categories, setCategories] = useState<CategoryItem[]>(() => {
    try {
      const saved = localStorage.getItem('kolom24_categories');
      return saved ? JSON.parse(saved) : initialCategories;
    } catch {
      return initialCategories;
    }
  });

  const [settings, setSettings] = useState<SiteSettings>(() => {
    try {
      const saved = localStorage.getItem('kolom24_settings');
      if (saved) {
        const parsed = JSON.parse(saved);
        // Automatic White-Label normalization: upgrade stale brand values if unchanged
        if (
          parsed.siteName === 'কলম২৪' || 
          parsed.siteNameEn === 'Kolom24' || 
          parsed.siteName === 'দৈনিক বাংলাদেশ' || 
          parsed.siteNameEn === 'Daily Bangladesh'
        ) {
          return {
            ...parsed,
            siteName: initialSettings.siteName,
            siteNameEn: initialSettings.siteNameEn,
            domain: initialSettings.domain,
            tagline: initialSettings.tagline,
            publisherName: initialSettings.publisherName,
            contactEmail: initialSettings.contactEmail,
            footerAbout: initialSettings.footerAbout,
            copyrightText: initialSettings.copyrightText,
            idCardTemplate: {
              ...(parsed.idCardTemplate || {}),
              organizationName: initialSettings.siteName,
            },
            epaperConfig: {
              ...(parsed.epaperConfig || {}),
              websiteDisplayUrl: `www.${initialSettings.domain}`,
              footerCredits: `ভারপ্রাপ্ত সম্পাদক: শামীম রেজা নূরুল • প্রকাশক: ${initialSettings.publisherName}`,
              adBoxEmail: `ads@${initialSettings.domain}`,
            }
          };
        }
        return parsed;
      }
      return initialSettings;
    } catch {
      return initialSettings;
    }
  });

  // Dynamic Browser Document Title & Meta Tag Synchronization with Site Name
  useEffect(() => {
    const title = settings.siteName 
      ? (settings.tagline ? `${settings.siteName} | ${settings.tagline}` : settings.siteName)
      : 'নতুন দৃষ্টি | Notun Drishti';
    document.title = title;
    
    const ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle) ogTitle.setAttribute('content', title);
  }, [settings.siteName, settings.tagline]);

  // Database Query Indexing (Requirement 4: Rebuild index on state updates)
  useEffect(() => {
    globalArticleIndex.rebuildIndex(articles);
  }, [articles]);

  const [adSlots, setAdSlots] = useState<AdSlot[]>(() => {
    try {
      const saved = localStorage.getItem('kolom24_adslots');
      return saved ? JSON.parse(saved) : initialAdSlots;
    } catch {
      return initialAdSlots;
    }
  });

  const [customTickers, setCustomTickers] = useState<TickerItem[]>(() => {
    try {
      const saved = localStorage.getItem('kolom24_tickers');
      return saved ? JSON.parse(saved) : initialTickers;
    } catch {
      return initialTickers;
    }
  });

  const [photoPosts, setPhotoPosts] = useState<PhotoCardItem[]>(() => {
    try {
      const saved = localStorage.getItem('kolom24_photos');
      return saved ? JSON.parse(saved) : initialPhotoPosts;
    } catch {
      return initialPhotoPosts;
    }
  });

  const [videoPosts, setVideoPosts] = useState<VideoNewsItem[]>(() => {
    try {
      const saved = localStorage.getItem('kolom24_videos');
      return saved ? JSON.parse(saved) : initialVideoPosts;
    } catch {
      return initialVideoPosts;
    }
  });

  const [users, setUsers] = useState<UserItem[]>(() => {
    try {
      const saved = localStorage.getItem('kolom24_users');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          // Keep updated role descriptions from initialUsers for accuracy
          return parsed.map(u => {
            const initial = initialUsers.find(iu => iu.id === u.id);
            if (initial && (u.role === 'author' || u.role === 'subscriber' || !u.roleBn)) {
              return { ...u, role: initial.role, roleBn: initial.roleBn };
            }
            return u;
          });
        }
      }
      return initialUsers;
    } catch {
      return initialUsers;
    }
  });

  // Current Logged-in User Session & Authentication Management (Default to 'guest' for visitors)
  const [currentUserId, setCurrentUserId] = useState<string>(() => {
    try {
      const saved = localStorage.getItem('kolom24_current_user_id');
      return saved ? saved : 'guest';
    } catch {
      return 'guest';
    }
  });
  const currentUser = (!currentUserId || currentUserId === 'guest')
    ? undefined 
    : users.find(u => u.id === currentUserId);
  const isLoggedIn = Boolean(currentUser);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isSecretGuardOpen, setIsSecretGuardOpen] = useState(false);

  // Automatic URL Secret Token verification on mount & route synchronization
  useEffect(() => {
    const matched = checkUrlForSecretToken(settings);
    const hash = window.location.hash;
    const path = window.location.pathname;
    const isAdminTarget = hash === '#admin' || path === '/admin';

    if (matched || (isSecretAdminAuthorized() && isAdminTarget)) {
      if (isAdminTarget) {
        if (!isLoggedIn) {
          setIsLoginModalOpen(true);
        } else if (currentUser && canAccessAdmin(currentUser.role)) {
          setViewMode('admin');
        } else {
          setIsLoginModalOpen(true);
        }
      }
    }
  }, [settings, isLoggedIn, currentUser]);

  const handleLogin = (userId: string) => {
    setCurrentUserId(userId);
    setIsLoginModalOpen(false);

    const loggedUser = users.find(u => u.id === userId);
    if (loggedUser && canAccessAdmin(loggedUser.role) && isSecretAdminAuthorized()) {
      if (window.location.hash === '#admin' || window.location.pathname === '/admin' || viewMode === 'admin') {
        setViewMode('admin');
      }
    }
  };

  const handleLogout = () => {
    setCurrentUserId('guest');
    revokeAdminGatewayAccess();
    setViewMode('portal');
  };

  const handleRegister = (newUser: UserItem) => {
    setUsers(prev => [newUser, ...prev]);
    setCurrentUserId(newUser.id);
  };

  useEffect(() => {
    try {
      localStorage.setItem('kolom24_current_user_id', currentUserId);
    } catch {}
  }, [currentUserId]);

  // Secure Admin & Photo Card Studio Route Access Guard (Protected by Secret Token)
  const handleOpenAdmin = useCallback(() => {
    if (!isSecretAdminAuthorized()) {
      setIsSecretGuardOpen(true);
      return;
    }
    if (!isLoggedIn) {
      setIsLoginModalOpen(true);
      return;
    }
    if (!canAccessAdmin(currentUser?.role)) {
      alert('প্রবেশাধিকার সংরক্ষিত: শুধুমাত্র অনুমোদিত অ্যাডমিন ও সম্পাদকীয় সদস্যগণ অ্যাক্সেস করতে পারবেন।');
      return;
    }
    setViewMode('admin');
  }, [isLoggedIn, currentUser]);

  // Citizen Journalism News Submission Modal (Requirement 4)
  const [isCitizenNewsModalOpen, setIsCitizenNewsModalOpen] = useState(false);

  // Recruitment / Career Application Portal (Requirement 1)
  const [isRecruitmentModalOpen, setIsRecruitmentModalOpen] = useState(false);
  const [jobApplications, setJobApplications] = useState<JobApplication[]>(() => {
    try {
      const saved = localStorage.getItem('kolom24_job_applications');
      return saved ? JSON.parse(saved) : initialJobApplications;
    } catch {
      return initialJobApplications;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('kolom24_job_applications', JSON.stringify(jobApplications));
    } catch (e) {
      console.error(e);
    }
  }, [jobApplications]);

  // User Profile & Digital ID Card Modal (Requirement 2 & 3)
  const [isUserProfileModalOpen, setIsUserProfileModalOpen] = useState(false);

  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>(() => {
    try {
      const saved = localStorage.getItem('kolom24_family');
      return saved ? JSON.parse(saved) : initialFamilyMembers;
    } catch {
      return initialFamilyMembers;
    }
  });

  // Quotes Section (কথা / উক্তি) State & Persistence
  const [quotes, setQuotes] = useState<QuoteItem[]>(() => {
    try {
      const saved = localStorage.getItem('kolom24_quotes');
      return saved ? JSON.parse(saved) : initialQuotes;
    } catch {
      return initialQuotes;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('kolom24_quotes', JSON.stringify(quotes));
    } catch (e) {
      console.error(e);
    }
  }, [quotes]);

  // Navigation & View States
  const [activeCategory, setActiveCategory] = useState<string>('latest');
  const [viewMode, setViewMode] = useState<'portal' | 'admin' | 'epaper'>('portal');
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);

  // Automated Visitor Tracking & Intelligence Logger (Requirement 1)
  useEffect(() => {
    initVisitorTracking(window.location.pathname || '/').catch(() => {});
  }, [viewMode, activeCategory, selectedArticle]);
  const [searchOpen, setSearchOpen] = useState(false);
  const [webStoriesOpen, setWebStoriesOpen] = useState(false);
  
  // Frontend Archive Calendar Filter States (Requirement 3)
  const [archiveModalOpen, setArchiveModalOpen] = useState(false);
  const [selectedArchiveDate, setSelectedArchiveDate] = useState<string | null>('2026-10-08');
  const [archiveMatchedArticles, setArchiveMatchedArticles] = useState<Article[]>([]);

  // "নিজ জেলার নিউজ দেখুন" (View Local News by District) Filter Feature
  const [selectedDistrictFilter, setSelectedDistrictFilter] = useState<string | null>(null);

  // Theme & Language
  const [darkMode, setDarkMode] = useState(false);
  const [lang, setLang] = useState<'bn' | 'en'>('bn');

  // Check URL hash and pathname for direct links (e.g., #epaper, #stories, /apply, #apply)
  useEffect(() => {
    const handleUrlRoute = () => {
      const hash = window.location.hash;
      const path = window.location.pathname;
      if (hash === '#epaper') {
        setViewMode('epaper');
      } else if (hash === '#admin') {
        if (!isLoggedIn) {
          setIsLoginModalOpen(true);
          setViewMode('portal');
          window.location.hash = '';
        } else if (!canAccessAdmin(currentUser?.role)) {
          setViewMode('portal');
          window.location.hash = '';
        } else {
          setViewMode('admin');
        }
      } else if (hash === '#stories') {
        setWebStoriesOpen(true);
      } else if (hash === '#apply' || path === '/apply') {
        setIsRecruitmentModalOpen(true);
      }
    };
    handleUrlRoute();
    window.addEventListener('hashchange', handleUrlRoute);
    window.addEventListener('popstate', handleUrlRoute);
    return () => {
      window.removeEventListener('hashchange', handleUrlRoute);
      window.removeEventListener('popstate', handleUrlRoute);
    };
  }, []);

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('kolom24_articles', JSON.stringify(articles));
    } catch (e) {
      console.error(e);
    }
  }, [articles]);

  useEffect(() => {
    try {
      localStorage.setItem('kolom24_categories', JSON.stringify(categories));
    } catch (e) {
      console.error(e);
    }
  }, [categories]);

  useEffect(() => {
    try {
      localStorage.setItem('kolom24_settings', JSON.stringify(settings));
    } catch (e) {
      console.error(e);
    }

    // Global Single Source of Truth: Sync HTML Document Title, Slogan, and Open Graph tags
    if (typeof document !== 'undefined') {
      const siteTitle = (settings.siteName || 'নিউজ পোর্টাল').trim();
      const siteTagline = (settings.tagline || 'পজিটিভ বাংলাদেশ').trim();
      const siteDomain = (settings.domain || 'newsportal.com').trim();
      document.title = `${siteTitle} | ${siteTagline}`;

      // Update base font-size CSS variable (2 steps larger: default 18px)
      const baseFontSize = settings.themeConfig?.baseFontSizePx || 18;
      document.documentElement.style.setProperty('--site-base-font-size', `${baseFontSize}px`);

      // Update primary color theme
      const primaryColor = settings.primaryColor || settings.themeConfig?.primaryColor || '#dc2626';
      document.documentElement.style.setProperty('--primary-color', primaryColor);

      // Update meta description
      const metaDesc = document.querySelector('meta[name="description"]');
      if (metaDesc) {
        metaDesc.setAttribute('content', settings.metaDescription || `${siteTitle} - ${siteTagline}`);
      }

      // Update theme-color
      const themeColorMeta = document.querySelector('meta[name="theme-color"]');
      if (themeColorMeta) {
        themeColorMeta.setAttribute('content', primaryColor);
      }

      // Update dynamic Favicon & Apple Touch Icon across browser tabs and mobile devices
      if (settings.faviconUrl && settings.faviconUrl.trim()) {
        const favUrl = settings.faviconUrl.trim();
        ['icon', 'shortcut icon', 'apple-touch-icon'].forEach((rel) => {
          let linkEl = document.querySelector(`link[rel="${rel}"]`) as HTMLLinkElement | null;
          if (!linkEl) {
            linkEl = document.createElement('link');
            linkEl.rel = rel;
            document.head.appendChild(linkEl);
          }
          linkEl.href = favUrl;
        });
      }

      // Update Open Graph and Twitter tags
      const updateOrCreateMeta = (attr: string, key: string, content: string) => {
        let el = document.querySelector(`meta[${attr}="${key}"]`);
        if (!el) {
          el = document.createElement('meta');
          el.setAttribute(attr, key);
          document.head.appendChild(el);
        }
        el.setAttribute('content', content);
      };

      updateOrCreateMeta('property', 'og:title', `${siteTitle} | ${siteTagline}`);
      updateOrCreateMeta('property', 'og:description', settings.metaDescription || `${siteTitle} - ${siteTagline}`);
      updateOrCreateMeta('property', 'og:site_name', siteTitle);
      updateOrCreateMeta('name', 'twitter:title', `${siteTitle} | ${siteTagline}`);
      updateOrCreateMeta('name', 'twitter:description', settings.metaDescription || `${siteTitle} - ${siteTagline}`);
      updateOrCreateMeta('name', 'apple-mobile-web-app-title', siteTitle);

      if (settings.ogImage) {
        updateOrCreateMeta('property', 'og:image', settings.ogImage);
      }

      // Sync Schema.org JSON-LD
      const schemaScript = document.querySelector('script[type="application/ld+json"]');
      if (schemaScript) {
        try {
          const structuredData = {
            "@context": "https://schema.org",
            "@type": "NewsMediaOrganization",
            "name": siteTitle,
            "alternateName": settings.siteNameEn || siteTitle,
            "url": `https://${siteDomain}`,
            "logo": settings.lightLogoUrl || `https://${siteDomain}/logo.png`,
            "sameAs": [
              settings.facebookUrl || `https://www.facebook.com/${siteDomain.split('.')[0]}`,
            ],
            "contactPoint": {
              "@type": "ContactPoint",
              "contactType": "News Desk",
              "email": settings.contactEmail || `editor@${siteDomain}`,
              "availableLanguage": ["Bengali", "English"]
            }
          };
          schemaScript.textContent = JSON.stringify(structuredData, null, 2);
        } catch (err) {
          console.error(err);
        }
      }
    }
  }, [settings]);

  useEffect(() => {
    try {
      localStorage.setItem('kolom24_adslots', JSON.stringify(adSlots));
    } catch (e) {
      console.error(e);
    }
  }, [adSlots]);

  useEffect(() => {
    try {
      localStorage.setItem('kolom24_tickers', JSON.stringify(customTickers));
    } catch (e) {
      console.error(e);
    }
  }, [customTickers]);

  useEffect(() => {
    try {
      localStorage.setItem('kolom24_photos', JSON.stringify(photoPosts));
    } catch (e) {
      console.error(e);
    }
  }, [photoPosts]);

  useEffect(() => {
    try {
      localStorage.setItem('kolom24_videos', JSON.stringify(videoPosts));
    } catch (e) {
      console.error(e);
    }
  }, [videoPosts]);

  useEffect(() => {
    try {
      localStorage.setItem('kolom24_users', JSON.stringify(users));
    } catch (e) {
      console.error(e);
    }
  }, [users]);

  useEffect(() => {
    try {
      localStorage.setItem('kolom24_family', JSON.stringify(familyMembers));
    } catch (e) {
      console.error(e);
    }
  }, [familyMembers]);

  // Handle Dark mode class on root body
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  // Anti-Copy & Anti-Inspect Security (User Request: কন্ট্রোল শিফট আই বাটন চাপলে সাইটের কোন ডাটা যেন শো না করে এবং সাইটের উপরে মাউসের রাইট বাটন যেন কাজ না করে এবং সাইটের কোন কনটেন্ট যেন কপি বা ডাউনলোড যেন না করা যায় সেটাও করে দাও।)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'F12') {
        e.preventDefault();
        return false;
      }
      if (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'i' || e.key === 'J' || e.key === 'j' || e.key === 'C' || e.key === 'c')) {
        e.preventDefault();
        return false;
      }
      if (e.ctrlKey && (e.key === 'u' || e.key === 'U' || e.key === 's' || e.key === 'S' || e.key === 'p' || e.key === 'P')) {
        e.preventDefault();
        return false;
      }
    };
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
    };
    const handleCopy = (e: ClipboardEvent) => {
      e.preventDefault();
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('contextmenu', handleContextMenu);
    window.addEventListener('copy', handleCopy);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('contextmenu', handleContextMenu);
      window.removeEventListener('copy', handleCopy);
    };
  }, []);

  // Quick CMS Hotkey for Authenticated Staff (Shift + A) - Protected by Secret Token Guard
  useEffect(() => {
    const handleAdminKey = (e: KeyboardEvent) => {
      if (e.shiftKey && (e.key === 'A' || e.key === 'a')) {
        const target = e.target as HTMLElement | null;
        const tag = target?.tagName?.toLowerCase();
        if (tag !== 'input' && tag !== 'textarea' && !target?.isContentEditable) {
          e.preventDefault();
          if (!isSecretAdminAuthorized()) {
            setIsSecretGuardOpen(true);
            return;
          }
          if (currentUser?.role && canAccessAdmin(currentUser.role)) {
            setViewMode(prev => prev === 'admin' ? 'portal' : 'admin');
          } else {
            setIsLoginModalOpen(true);
          }
        }
      }
    };
    window.addEventListener('keydown', handleAdminKey);
    return () => window.removeEventListener('keydown', handleAdminKey);
  }, [currentUser]);

  // Direct URL & Hash Routing Synchronization (Articles, /apply, #admin, #family)
  useEffect(() => {
    const handleRoute = () => {
      const hash = window.location.hash;
      const path = window.location.pathname;

      if (path === '/apply' || hash === '#apply' || path === '/recruitment' || hash === '#recruitment' || hash === '#career') {
        setIsRecruitmentModalOpen(true);
      }
      if (path === '/admin' || hash === '#admin') {
        checkUrlForSecretToken(settings);

        if (!isSecretAdminAuthorized()) {
          setViewMode('portal');
          setIsSecretGuardOpen(true);
          if (window.location.hash === '#admin') window.location.hash = '';
          return;
        }
        if (!isLoggedIn) {
          setIsLoginModalOpen(true);
          setViewMode('portal');
        } else if (!canAccessAdmin(currentUser?.role)) {
          setViewMode('portal');
          setIsLoginModalOpen(true);
        } else {
          setViewMode('admin');
        }
      }
      if (hash === '#epaper') {
        setViewMode('epaper');
      }
      if (hash === '#family' || hash === '#team' || hash === '#আমাদের-পরিবার') {
        setActiveCategory('family');
        setSelectedArticle(null);
      }

      if (hash && hash.startsWith('#news-')) {
        const idOrSlug = hash.replace('#news-', '');
        const found = articles.find(
          a => a.id === idOrSlug || 
               a.slug === idOrSlug || 
               a.slug === `news-${idOrSlug}` || 
               a.id === `art-${idOrSlug}` ||
               a.id === `lead-${idOrSlug}`
        );
        if (found) {
          setSelectedArticle(found);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
      } else if (!hash && selectedArticle) {
        setSelectedArticle(null);
      }
    };

    handleRoute();
    window.addEventListener('hashchange', handleRoute);
    window.addEventListener('popstate', handleRoute);
    return () => {
      window.removeEventListener('hashchange', handleRoute);
      window.removeEventListener('popstate', handleRoute);
    };
  }, [articles, isLoggedIn, currentUser]);

  const handleOpenArticle = (article: Article) => {
    setSelectedArticle(article);
    const slug = article.slug || `news-${article.id}`;
    window.location.hash = slug.startsWith('news-') ? slug : `news-${slug}`;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBackToPortal = () => {
    setSelectedArticle(null);
    if (window.location.hash) {
      window.history.pushState(null, '', window.location.pathname);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Filter Published Articles with Scheduling & Auto-Expiry check (Requirement 2)
  const publishedArticles = articles.filter(a => {
    if (a.status === 'pending' || a.status === 'rejected') return false;
    
    // Post Hide / Unpublish Toggle (Admin & Author Control): Immediately removed from public view
    if (a.isHidden || a.status === 'hidden') return false;

    // Future scheduled posts don't appear until scheduled time
    if (a.isScheduled || a.publishMode === 'scheduled') {
      if (a.scheduledAt && new Date(a.scheduledAt) > new Date()) {
        return false;
      }
    }

    // Auto-expired posts are automatically unpublished from live portal
    if (a.isExpired) return false;
    if (a.isAutoExpire && a.expiresAt && new Date(a.expiresAt) < new Date()) {
      return false;
    }

    return true;
  });

  // Post Hide / Unpublish Toggle Handler
  const handleToggleHideArticle = (id: string) => {
    setArticles(prev => prev.map(a => {
      if (a.id !== id) return a;
      const isCurrentlyHidden = a.isHidden || a.status === 'hidden';
      const nextHidden = !isCurrentlyHidden;
      return {
        ...a,
        isHidden: nextHidden,
        status: nextHidden ? 'hidden' : 'published',
      };
    }));
  };

  const handleAddArticle = async (newArticle: Article) => {
    // 1. Optimistic state update
    setArticles(prev => [newArticle, ...prev.filter(a => a.id !== newArticle.id)]);
    
    // 2. Persist to storage and external database API
    try {
      await apiCreatePost(newArticle);
    } catch (err) {
      console.error('[API] Failed to persist new post:', err);
    }

    // Google Search Console Indexing API Integration (Instant Indexing)
    if (newArticle.status !== 'pending' && newArticle.status !== 'rejected') {
      const canonicalUrl = `https://${settings.domain || 'newsportal.com'}/news/${newArticle.slug || newArticle.id}`;
      requestGoogleIndexing(canonicalUrl, 'URL_UPDATED').catch(() => {});
    }
  };

  const handleUpdateArticle = async (updatedArticle: Article) => {
    // 1. Optimistic state update
    setArticles(prev => prev.map(a => a.id === updatedArticle.id ? updatedArticle : a));
    if (selectedArticle && selectedArticle.id === updatedArticle.id) {
      setSelectedArticle(updatedArticle);
    }

    // 2. Persist to storage and external database API
    try {
      await apiUpdatePost(updatedArticle.id, updatedArticle);
    } catch (err) {
      console.error('[API] Failed to persist post update:', err);
    }

    // Google Search Console Indexing API ping on update
    if (updatedArticle.status !== 'pending' && updatedArticle.status !== 'rejected') {
      const canonicalUrl = `https://${settings.domain || 'newsportal.com'}/news/${updatedArticle.slug || updatedArticle.id}`;
      requestGoogleIndexing(canonicalUrl, 'URL_UPDATED').catch(() => {});
    }
  };

  const handleDeleteArticle = async (id: string) => {
    // 1. Immediately update local state using functional updater to prevent stale closures
    setArticles((prev) => {
      const next = prev.filter((a) => a.id !== id);
      try {
        localStorage.setItem('kolom24_articles', JSON.stringify(next));
        localStorage.setItem('kolom24_articles_v2', JSON.stringify(next));
      } catch (err) {
        console.error('[Storage] Failed to save deleted state:', err);
      }
      return next;
    });

    if (selectedArticle && selectedArticle.id === id) {
      setSelectedArticle(null);
    }

    // 2. Call simulated /api/posts/[id] REST backend route
    try {
      await apiDeletePost(id);
    } catch (err) {
      console.warn('[API] apiDeletePost notice:', err);
    }
  };

  const handleToggleBreaking = (id: string) => {
    setArticles(articles.map(a => a.id === id ? { ...a, isBreaking: !a.isBreaking } : a));
  };

  const handleToggleLead = (id: string) => {
    setArticles(articles.map(a => a.id === id ? { ...a, isLead: !a.isLead } : a));
  };

  const handleAddCategory = (newCat: CategoryItem) => {
    setCategories([...categories, newCat]);
  };

  const handleUpdateCategory = (updatedCat: CategoryItem) => {
    setCategories(categories.map(c => c.id === updatedCat.id ? updatedCat : c));
  };

  const handleDeleteCategory = (id: string) => {
    setCategories(categories.filter(c => c.id !== id));
  };

  const handleReorderCategories = (reordered: CategoryItem[]) => {
    setCategories(reordered);
  };

  const handleResetDemoData = () => {
    localStorage.removeItem('kolom24_articles');
    localStorage.removeItem('kolom24_categories');
    localStorage.removeItem('kolom24_settings');
    localStorage.removeItem('kolom24_adslots');
    localStorage.removeItem('kolom24_tickers');
    localStorage.removeItem('kolom24_photos');
    localStorage.removeItem('kolom24_videos');
    localStorage.removeItem('kolom24_users');
    localStorage.removeItem('kolom24_quotes');
    setArticles(initialArticles);
    setCategories(initialCategories);
    setSettings(initialSettings);
    setAdSlots(initialAdSlots);
    setCustomTickers(initialTickers);
    setPhotoPosts(initialPhotoPosts);
    setVideoPosts(initialVideoPosts);
    setUsers(initialUsers);
    setQuotes(initialQuotes);
    setSelectedArticle(null);
  };

  const handleSelectByTitle = (title: string) => {
    const found = publishedArticles.find(a => a.title.includes(title.substring(0, 15))) || publishedArticles[0];
    if (found) {
      handleOpenArticle(found);
    }
  };

  const filteredCategoryArticles = activeCategory === 'latest' 
    ? publishedArticles 
    : publishedArticles.filter(a => {
        const catObj = categories.find(c => c.id === activeCategory);
        if (!catObj) return true;
        const childCats = categories.filter(c => c.parentId === catObj.id);
        const matchesCat = a.category === catObj.nameBn || (a.categoryEn && catObj.nameEn && a.categoryEn.toLowerCase() === catObj.nameEn.toLowerCase());
        const matchesChild = childCats.some(ch => a.category === ch.nameBn || (a.categoryEn && ch.nameEn && a.categoryEn.toLowerCase() === ch.nameEn.toLowerCase()));
        return matchesCat || matchesChild;
      });

  // Automated fallback filler: trending stories for sparsely populated categories
  const fallbackTrendingArticles = fillArticlesToTarget(
    [],
    publishedArticles,
    6,
    new Set(filteredCategoryArticles.map(a => a.id))
  );

  const getFontClass = () => {
    if (settings.fontChoice === 'noto') return 'font-serif-bangla';
    if (settings.fontChoice === 'hind') return 'font-bangla';
    if (settings.fontChoice === 'kalpurush') return 'font-kalpurush';
    return 'font-solaiman';
  };

  // Header and Footer menu categories filtering
  const headerCategories = categories.filter(c => c.showInHeader !== false);
  const footerCategories = categories.filter(c => c.showInFooter !== false);

  return (
    <SiteConfigProvider settings={settings} onUpdateSettings={setSettings}>
      <div className={`min-h-screen overflow-x-hidden ${getFontClass()} select-none transition-colors duration-200 ${
        darkMode ? 'bg-[#0b0f17] text-slate-100' : 'bg-[#f8f9fa] text-slate-900'
      }`}>
      {/* If Admin Mode Active */}
      {viewMode === 'admin' ? (
        !isSecretAdminAuthorized() ? (
          <div className="min-h-screen flex items-center justify-center p-4">
            <div className={`max-w-md w-full p-8 rounded-2xl shadow-2xl border text-center space-y-4 font-solaiman ${
              darkMode ? 'bg-[#151c24] border-red-900/60 text-white' : 'bg-white border-red-200 text-slate-800'
            }`}>
              <div className="w-16 h-16 bg-red-100 dark:bg-red-950/60 text-red-600 rounded-full flex items-center justify-center mx-auto ring-8 ring-red-50 dark:ring-red-900/20">
                <ShieldCheck className="w-8 h-8" />
              </div>
              <h2 className="text-xl font-black text-gray-950 dark:text-white">সিক্রেট গেটওয়ে সুরক্ষা</h2>
              <p className="text-sm text-gray-800 dark:text-gray-200 font-medium leading-relaxed">
                প্রশাসনিক ওয়ার্কস্পেস মূল ফ্রন্ট-এন্ড থেকে সম্পূর্ণ আলাদা ও সুরক্ষিত। প্রবেশ করতে আপনার নির্ধারিত সিক্রেট অ্যাক্সেস টোকেন প্রদান করুন।
              </p>
              <div className="pt-2 flex flex-col gap-2">
                <button
                  onClick={() => setIsSecretGuardOpen(true)}
                  className="w-full py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-sm font-bold shadow-md cursor-pointer transition-colors"
                >
                  সিক্রেট টোকেন যাচাই করুন
                </button>
                <button
                  onClick={() => setViewMode('portal')}
                  className="w-full py-2 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-xl text-sm font-medium cursor-pointer transition-colors"
                >
                  মূল সংবাদ পোর্টালে ফিরে যান
                </button>
              </div>
            </div>
          </div>
        ) : !isLoggedIn || !canAccessAdmin(currentUser?.role) ? (
          <div className="min-h-screen flex items-center justify-center p-4">
            <div className={`max-w-md w-full p-8 rounded-2xl shadow-2xl border text-center space-y-4 font-solaiman ${
              darkMode ? 'bg-[#151c24] border-slate-700 text-white' : 'bg-white border-slate-200 text-slate-800'
            }`}>
              <div className="w-16 h-16 bg-red-100 dark:bg-red-950/60 text-red-600 rounded-full flex items-center justify-center mx-auto ring-8 ring-red-50 dark:ring-red-900/20">
                <ShieldCheck className="w-8 h-8" />
              </div>
              <h2 className="text-xl font-black text-gray-950 dark:text-white">প্রশাসনিক প্রবেশাধিকার সংরক্ষিত</h2>
              <p className="text-sm text-gray-800 dark:text-gray-200 font-medium leading-relaxed">
                অ্যাডমিন ওয়ার্কস্পেস এবং ফটো কার্ড স্টুডিও শুধুমাত্র অনুমোদিত সম্পাদকীয় প্রশাসক ও সংবাদকর্মীদের জন্য সংরক্ষিত। অনুগ্রহ করে লগইন করুন।
              </p>
              <div className="pt-2 flex flex-col gap-2">
                <button
                  onClick={() => setIsLoginModalOpen(true)}
                  className="w-full py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-sm font-bold shadow-md cursor-pointer transition-colors"
                >
                  অ্যাডমিন হিসেবে লগইন করুন
                </button>
                <button
                  onClick={() => setViewMode('portal')}
                  className="w-full py-2 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-xl text-sm font-medium cursor-pointer transition-colors"
                >
                  পোর্টালে ফিরে যান
                </button>
              </div>
            </div>
          </div>
        ) : (
          <ErrorBoundary sectionName="অ্যাডমিন ড্যাশবোর্ড" fallbackTitle="অ্যাডমিন ড্যাশবোর্ড লোড হতে সমস্যা হয়েছে" showHomeButton={true}>
            <AdminDashboard
            articles={articles}
            categories={categories}
            settings={settings}
            adSlots={adSlots}
            customTickers={customTickers}
            photoPosts={photoPosts}
            videoPosts={videoPosts}
            users={users}
            familyMembers={familyMembers}
            onUpdateSettings={setSettings}
            onAddArticle={handleAddArticle}
            onUpdateArticle={handleUpdateArticle}
            onDeleteArticle={handleDeleteArticle}
            onToggleBreaking={handleToggleBreaking}
            onToggleLead={handleToggleLead}
            onToggleHideArticle={handleToggleHideArticle}
            onAddCategory={handleAddCategory}
            onUpdateCategory={handleUpdateCategory}
            onDeleteCategory={handleDeleteCategory}
            onReorderCategories={handleReorderCategories}
            onUpdateAdSlots={setAdSlots}
            onUpdateTickers={setCustomTickers}
            onUpdatePhotoPosts={setPhotoPosts}
            onUpdateVideoPosts={setVideoPosts}
            onUpdateUsers={setUsers}
            onUpdateFamilyMembers={setFamilyMembers}
            onResetDemoData={handleResetDemoData}
            onBackToPortal={() => setViewMode('portal')}
            darkMode={darkMode}
            setDarkMode={setDarkMode}
            currentUserId={currentUserId}
            onSelectUser={setCurrentUserId}
            jobApplications={jobApplications}
            onUpdateJobApplications={setJobApplications}
            quotes={quotes}
            onUpdateQuotes={setQuotes}
          />
        </ErrorBoundary>
        )
      ) : viewMode === 'epaper' ? (
        /* Automated 7-Day Digital E-Paper Broadsheet View */
        <ErrorBoundary sectionName="ই-পেপার ব্রডশিট" fallbackTitle="ডিজিটাল ই-পেপার লোড করা সম্ভব হয়নি" showHomeButton={true}>
          <EPaperView
            articles={publishedArticles}
            settings={settings}
            adSlots={adSlots}
            darkMode={darkMode}
            lang={lang}
            onSelectArticle={(art) => {
              setViewMode('portal');
              handleOpenArticle(art);
            }}
            onBackToPortal={() => {
              if (window.location.hash === '#epaper') {
                window.history.pushState(null, '', window.location.pathname);
              }
              setViewMode('portal');
            }}
          />
        </ErrorBoundary>
      ) : (
        /* Live Portal View */
        <div className="flex flex-col min-h-screen w-full overflow-x-hidden">
          {/* Top Bar with Micro-Preview Cards & Logo */}
          <TopBar
            darkMode={darkMode}
            setDarkMode={setDarkMode}
            lang={lang}
            setLang={setLang}
            topPreviewArticles={publishedArticles.slice(0, 3)}
            onSelectArticle={handleOpenArticle}
            onOpenAdmin={handleOpenAdmin}
            settings={settings}
            onOpenEPaper={() => {
              window.location.hash = 'epaper';
              setViewMode('epaper');
            }}
            onOpenWebStories={() => setWebStoriesOpen(true)}
            onOpenCitizenNews={() => setIsCitizenNewsModalOpen(true)}
            currentUser={currentUser}
            users={users}
            onSelectUser={setCurrentUserId}
            onOpenUserProfile={() => setIsUserProfileModalOpen(true)}
            onOpenRecruitment={() => setIsRecruitmentModalOpen(true)}
            isLoggedIn={isLoggedIn}
            onOpenLogin={() => setIsLoginModalOpen(true)}
            onLogout={handleLogout}
          />

          {/* Main Broadsheet Header Ad Area (Logo removed as requested, full ad space) */}
          <HeaderBanner 
            darkMode={darkMode} 
            lang={lang} 
            adSlots={adSlots}
          />

          {/* Sticky Main Navigation */}
          <Navbar
            categories={headerCategories}
            activeCategory={selectedArticle ? '' : activeCategory}
            onSelectCategory={(id) => {
              if (id === 'epaper') {
                setViewMode('epaper');
                window.location.hash = 'epaper';
                return;
              }
              setSelectedArticle(null);
              if (window.location.hash) {
                window.history.pushState(null, '', window.location.pathname);
              }
              setActiveCategory(id);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onOpenSearch={() => setSearchOpen(true)}
            darkMode={darkMode}
            lang={lang}
            onOpenEPaper={() => {
              window.location.hash = 'epaper';
              setViewMode('epaper');
            }}
            onOpenWebStories={() => setWebStoriesOpen(true)}
            onOpenCitizenNews={() => setIsCitizenNewsModalOpen(true)}
            currentUser={currentUser}
            isLoggedIn={isLoggedIn}
            onOpenLogin={() => setIsLoginModalOpen(true)}
            onLogout={handleLogout}
            onOpenAdmin={handleOpenAdmin}
            onOpenUserProfile={() => setIsUserProfileModalOpen(true)}
          />

          {/* Breaking News Ticker (Scrolling last 10 news) */}
          {settings.enableBreakingTicker && (
            <BreakingTicker
              articles={publishedArticles}
              customTickers={customTickers}
              onSelectArticle={handleOpenArticle}
              darkMode={darkMode}
              lang={lang}
            />
          )}

          {/* Below Breaking News / Ticker Ad Slot (Full Width / Box) */}
          <div className="w-full max-w-7xl mx-auto px-4 my-2">
            <UniversalAdSlot position="below_ticker" adSlots={adSlots} darkMode={darkMode} />
          </div>

          {/* MAIN PORTAL BODY */}
          <main className="flex-1 pb-12">
            {selectedArticle ? (
              /* DEDICATED FULL ARTICLE PAGE */
              <ErrorBoundary sectionName="সংবাদ বিস্তারিত পাতা" fallbackTitle="সংবাদের বিস্তারিত লোড হতে সমস্যা হয়েছে" showHomeButton={true}>
                <ArticlePage
                  article={selectedArticle}
                  relatedArticles={publishedArticles.filter(a => a.id !== selectedArticle.id).slice(0, 4)}
                  adSlots={adSlots}
                  onBack={handleBackToPortal}
                  onSelectArticle={handleOpenArticle}
                  darkMode={darkMode}
                  lang={lang}
                  settings={settings}
                />
              </ErrorBoundary>
            ) : selectedDistrictFilter ? (
              /* DEDICATED LOCAL DISTRICT NEWS FEED (Cleanly loaded without breaking broadsheet header flow) */
              <ErrorBoundary sectionName="জেলা সংবাদ ফিড" fallbackTitle="জেলা সংবাদ ফিড লোড হতে সমস্যা হয়েছে" showHomeButton={true}>
                <LocalDistrictNewsFeed
                  district={selectedDistrictFilter}
                  articles={publishedArticles}
                  onSelectArticle={handleOpenArticle}
                  onClearDistrict={() => setSelectedDistrictFilter(null)}
                  darkMode={darkMode}
                  lang={lang}
                  adSlots={adSlots}
                />
              </ErrorBoundary>
            ) : activeCategory === 'latest' ? (
              /* Full Broadsheet Layout matching Frontend.jpg */
              <>
                {settings.homepageSections?.showHero !== false && (
                  <ErrorBoundary sectionName="প্রধান লিড ও আর্কাইভ সেকশন" fallbackTitle="লিড সংবাদ সেকশন লোড হতে সাময়িক সমস্যা">
                    <HeroSection
                      articles={publishedArticles}
                      adSlots={adSlots}
                      onSelectArticle={handleOpenArticle}
                      darkMode={darkMode}
                      lang={lang}
                      onSelectArchiveDate={(dateStr, matched) => {
                        setSelectedArchiveDate(dateStr);
                        setArchiveMatchedArticles(matched);
                        setArchiveModalOpen(true);
                      }}
                      selectedArchiveDate={selectedArchiveDate}
                      selectedDistrict={selectedDistrictFilter}
                      onSelectDistrict={setSelectedDistrictFilter}
                    />
                  </ErrorBoundary>
                )}

                {settings.enableHeaderAd && (
                  <BannerAd 
                    type="gree" 
                    darkMode={darkMode} 
                    adSlots={adSlots}
                  />
                )}

                {settings.homepageSections?.showSpecial !== false && (
                  <ErrorBoundary sectionName="বিশেষ সংবাদ কার্ড">
                    <SpecialCards
                      darkMode={darkMode}
                      onSelectTitle={handleSelectByTitle}
                    />
                  </ErrorBoundary>
                )}

                {settings.homepageSections?.showNational !== false && (
                  <ErrorBoundary sectionName="জাতীয় সংবাদ গ্রিড">
                    <NationalSection
                      articles={publishedArticles}
                      onSelectArticle={handleOpenArticle}
                      darkMode={darkMode}
                      lang={lang}
                    />
                  </ErrorBoundary>
                )}

                {/* Most Read / Popular News Section (Requirement 3) */}
                <ErrorBoundary sectionName="সর্বাধিক পঠিত সংবাদ সেকশন">
                  <PopularNewsSection
                    articles={publishedArticles}
                    onSelectArticle={handleOpenArticle}
                    darkMode={darkMode}
                    lang={lang}
                  />
                </ErrorBoundary>

                {settings.homepageSections?.showPolitics !== false && (
                  <ErrorBoundary sectionName="রাজনীতি ও ট্রেন্ডিং সেকশন">
                    <PoliticsAndTrending
                      articles={publishedArticles}
                      adSlots={adSlots}
                      onSelectArticle={handleOpenArticle}
                      darkMode={darkMode}
                      lang={lang}
                    />
                  </ErrorBoundary>
                )}

                {/* Homepage Section Inter-grids (মাঝখানের গ্রিড অ্যাড স্লট) */}
                <div className="w-full max-w-7xl mx-auto px-4 my-4">
                  <UniversalAdSlot position="home_inter_grid" adSlots={adSlots} darkMode={darkMode} />
                </div>

                {settings.homepageSections?.showWorld !== false && (
                  <ErrorBoundary sectionName="বিশ্ব সংবাদ সেকশন">
                    <WorldSection
                      articles={publishedArticles}
                      adSlots={adSlots}
                      onSelectArticle={handleOpenArticle}
                      darkMode={darkMode}
                      lang={lang}
                    />
                  </ErrorBoundary>
                )}

                {settings.homepageSections?.showCountrywide !== false && (
                  <ErrorBoundary sectionName="সারাদেশ বিভাগীয় সংবাদ">
                    <CountrywideSection
                      articles={publishedArticles}
                      adSlots={adSlots}
                      onSelectArticle={handleOpenArticle}
                      darkMode={darkMode}
                      lang={lang}
                      onOpenDistrictFilter={() => {
                        const el = document.getElementById('local-district-news-widget');
                        if (el) el.scrollIntoView({ behavior: 'smooth' });
                      }}
                    />
                  </ErrorBoundary>
                )}

                {settings.homepageSections?.showPhotoGallery !== false && (
                  <ErrorBoundary sectionName="ছবি গ্যালারি">
                    <PhotoGallery
                      photoPosts={photoPosts}
                      darkMode={darkMode}
                      lang={lang}
                    />
                  </ErrorBoundary>
                )}

                {/* Quotes Section (কথা / উক্তি) */}
                {settings.homepageSections?.showQuotes !== false && (
                  <ErrorBoundary sectionName="কথা / উক্তি সেকশন">
                    <QuotesSection
                      quotes={quotes}
                      darkMode={darkMode}
                      lang={lang}
                      settings={settings}
                    />
                  </ErrorBoundary>
                )}

                {settings.homepageSections?.showShowbiz !== false && (
                  <ErrorBoundary sectionName="বিনোদন ও শোবিজ">
                    <ShowbizSection
                      articles={publishedArticles}
                      onSelectArticle={handleOpenArticle}
                      darkMode={darkMode}
                      lang={lang}
                    />
                  </ErrorBoundary>
                )}

                {settings.homepageSections?.showMultiGrid !== false && (
                  <ErrorBoundary sectionName="মাল্টি-ক্যাটাগরি গ্রিড">
                    <MultiCategoryGrid
                      articles={publishedArticles}
                      onSelectArticle={handleOpenArticle}
                      darkMode={darkMode}
                      lang={lang}
                    />
                  </ErrorBoundary>
                )}

                {settings.homepageSections?.showVideoGallery !== false && (
                  <ErrorBoundary sectionName="ভিডিও সংবাদ গ্যালারি">
                    <VideoGallery
                      videoPosts={videoPosts}
                      darkMode={darkMode}
                      lang={lang}
                    />
                  </ErrorBoundary>
                )}

                {settings.homepageSections?.showFamily === true && (
                  <ErrorBoundary sectionName="আমাদের পরিবার সেকশন">
                    <FamilySection
                      familyMembers={familyMembers}
                      darkMode={darkMode}
                      lang={lang}
                    />
                  </ErrorBoundary>
                )}
              </>
            ) : (activeCategory === 'family' || activeCategory === 'আমাদের পরিবার' || activeCategory === 'our-family' || categories.find(c => c.id === activeCategory || c.slug === activeCategory)?.slug === 'family' || categories.find(c => c.id === activeCategory || c.slug === activeCategory)?.nameBn === 'আমাদের পরিবার') ? (
              <FamilySection
                familyMembers={familyMembers}
                darkMode={darkMode}
                lang={lang}
              />
            ) : (
              /* Category Filtered View */
              <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
                <div className="flex items-center justify-between border-b-2 border-red-600 pb-3">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setActiveCategory('latest')}
                      className="p-1.5 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                      title="Back to Frontpage"
                    >
                      <ArrowLeft className="w-5 h-5 text-red-600" />
                    </button>
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white font-solaiman">
                      {categories.find(c => c.id === activeCategory)?.nameBn || 'বিভাগীয় সংবাদ'}
                    </h2>
                  </div>
                  <span className="text-xs text-slate-500 font-solaiman">
                    {filteredCategoryArticles.length} টি সংবাদ
                  </span>
                </div>

                {filteredCategoryArticles.length === 0 ? (
                  /* Zero-Post Category Fallback: Friendly Notice + Promo Cards + Trending Stories */
                  <div className="space-y-8">
                    <div className="p-6 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 text-center space-y-3">
                      <p className="text-base font-bold text-slate-800 dark:text-slate-200 font-solaiman">
                        এই বিভাগে বর্তমানে কোনো নতুন সংবাদ পোস্ট করা হয়নি।
                      </p>
                      <p className="text-xs text-slate-500 font-solaiman max-w-md mx-auto">
                        আপনার কাছে এই বিভাগ সম্পর্কিত কোনো তথ্য বা সংবাদ থাকলে নাগরিক সাংবাদিকতায় সরাসরি আমাদের পাঠাতে পারেন।
                      </p>
                      <button
                        onClick={() => setIsCitizenNewsModalOpen(true)}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-full text-xs font-bold font-solaiman transition-colors cursor-pointer shadow-xs"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>সংবাদ পাঠান (নাগরিক সাংবাদিকতা)</span>
                      </button>
                    </div>

                    {/* Dual Promo/Ad Card Fallback */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <SmartFillerAdCard 
                        type="citizen" 
                        darkMode={darkMode} 
                        onOpenCitizenNews={() => setIsCitizenNewsModalOpen(true)} 
                      />
                      <SmartFillerAdCard 
                        type="epaper" 
                        darkMode={darkMode} 
                        onOpenEPaper={() => { window.location.hash = 'epaper'; setViewMode('epaper'); }} 
                      />
                    </div>

                    {/* Automated Trending Filler Stories */}
                    {fallbackTrendingArticles.length > 0 && (
                      <div className="space-y-4 pt-4 border-t border-slate-200 dark:border-slate-800">
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-5 bg-red-600 inline-block rounded-xs" />
                          <h3 className="text-lg font-bold font-solaiman text-slate-900 dark:text-white">
                            এই মুহূর্তের আলোচিত ও শীর্ষ সংবাদ
                          </h3>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                          {fallbackTrendingArticles.slice(0, 6).map((article) => (
                            <article
                              key={article.id}
                              onClick={() => handleOpenArticle(article)}
                              className="group cursor-pointer space-y-3 bg-white dark:bg-slate-900 p-3 rounded-md border border-slate-200 dark:border-slate-800 shadow-xs hover:shadow-md transition-all news-card-hover"
                            >
                              <div className="relative overflow-hidden rounded aspect-16/10 bg-slate-100 dark:bg-slate-800">
                                <img
                                  src={article.imageUrl?.trim() || 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?auto=format&fit=crop&w=800&q=80'}
                                  alt={article.title}
                                  onError={(e) => {
                                    e.currentTarget.src = 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?auto=format&fit=crop&w=800&q=80';
                                  }}
                                  referrerPolicy="no-referrer"
                                  className="w-full h-full object-cover group-hover:scale-105 transition-transform media-kenburns"
                                />
                                <span className="absolute top-2 left-2 px-2 py-0.5 text-[10px] font-bold font-solaiman rounded bg-red-600 text-white shadow-xs">
                                  {article.category}
                                </span>
                              </div>
                              <h3 className="text-sm md:text-base font-bold leading-snug group-hover:text-red-600 transition-colors line-clamp-2 font-solaiman">
                                {article.title}
                              </h3>
                              <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 font-solaiman">
                                {article.excerpt}
                              </p>
                              <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800 font-solaiman">
                                <span>{article.author}</span>
                                <div className="flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  <span>{article.timeAgo || article.date}</span>
                                </div>
                              </div>
                            </article>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  /* Dynamic Grid View (Adapts to 1, 2, 3 or more articles gracefully) */
                  <div className="space-y-8">
                    <div className={`${getAdaptiveGridClass(filteredCategoryArticles.length, 3)} gap-6`}>
                      {filteredCategoryArticles.map((article) => (
                        <article
                          key={article.id}
                          onClick={() => handleOpenArticle(article)}
                          className="group cursor-pointer space-y-3 bg-white dark:bg-slate-900 p-3 rounded-md border border-slate-200 dark:border-slate-800 shadow-xs hover:shadow-md transition-all news-card-hover"
                        >
                          <div className="relative overflow-hidden rounded aspect-16/10 bg-slate-100 dark:bg-slate-800">
                            <img
                              src={article.imageUrl?.trim() || 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?auto=format&fit=crop&w=800&q=80'}
                              alt={article.title}
                              onError={(e) => {
                                e.currentTarget.src = 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?auto=format&fit=crop&w=800&q=80';
                              }}
                              referrerPolicy="no-referrer"
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform media-kenburns"
                            />
                          </div>
                          <h3 className="text-sm md:text-base font-bold leading-snug group-hover:text-red-600 transition-colors line-clamp-2 font-solaiman">
                            {article.title}
                          </h3>
                          <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 font-solaiman">
                            {article.excerpt}
                          </p>
                          <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800 font-solaiman">
                            <span>{article.author}</span>
                            <div className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              <span>{article.timeAgo || article.date}</span>
                            </div>
                          </div>
                        </article>
                      ))}

                      {/* If exactly 2 articles, add promo fallback as 3rd card to maintain row harmony */}
                      {filteredCategoryArticles.length === 2 && (
                        <SmartFillerAdCard 
                          type="epaper" 
                          darkMode={darkMode} 
                          onOpenEPaper={() => { window.location.hash = 'epaper'; setViewMode('epaper'); }}
                          className="h-full min-h-[240px]"
                        />
                      )}
                    </div>

                    {/* Automated Supplemental Filler: If category has fewer than 4 articles, append trending suggestions */}
                    {filteredCategoryArticles.length < 4 && fallbackTrendingArticles.length > 0 && (
                      <div className="space-y-4 pt-6 border-t border-slate-200 dark:border-slate-800">
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-5 bg-red-600 inline-block rounded-xs" />
                          <h3 className="text-lg font-bold font-solaiman text-slate-900 dark:text-white">
                            সম্পাদকীয় পছন্দ ও আলোচিত সংবাদ
                          </h3>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                          {fallbackTrendingArticles.slice(0, 3).map((article) => (
                            <article
                              key={`supp-${article.id}`}
                              onClick={() => handleOpenArticle(article)}
                              className="group cursor-pointer space-y-3 bg-white dark:bg-slate-900 p-3 rounded-md border border-slate-200 dark:border-slate-800 shadow-xs hover:shadow-md transition-all news-card-hover"
                            >
                              <div className="relative overflow-hidden rounded aspect-16/10 bg-slate-100 dark:bg-slate-800">
                                <img
                                  src={article.imageUrl?.trim() || 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?auto=format&fit=crop&w=800&q=80'}
                                  alt={article.title}
                                  onError={(e) => {
                                    e.currentTarget.src = 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?auto=format&fit=crop&w=800&q=80';
                                  }}
                                  referrerPolicy="no-referrer"
                                  className="w-full h-full object-cover group-hover:scale-105 transition-transform media-kenburns"
                                />
                                <span className="absolute top-2 left-2 px-2 py-0.5 text-[10px] font-bold font-solaiman rounded bg-amber-600 text-white shadow-xs">
                                  {article.category}
                                </span>
                              </div>
                              <h3 className="text-sm md:text-base font-bold leading-snug group-hover:text-red-600 transition-colors line-clamp-2 font-solaiman">
                                {article.title}
                              </h3>
                              <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 font-solaiman">
                                {article.excerpt}
                              </p>
                              <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800 font-solaiman">
                                <span>{article.author}</span>
                                <div className="flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  <span>{article.timeAgo || article.date}</span>
                                </div>
                              </div>
                            </article>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </main>

          {/* Footer Banner Ad Slot */}
          <div className="w-full max-w-7xl mx-auto px-4 my-4">
            <UniversalAdSlot position="footer_top" adSlots={adSlots} darkMode={darkMode} />
          </div>

          {/* Footer */}
          <Footer
            darkMode={darkMode}
            lang={lang}
            settings={settings}
            categories={footerCategories}
            onSelectCategory={(slug) => {
              setSelectedArticle(null);
              setActiveCategory(slug);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onOpenRecruitment={() => setIsRecruitmentModalOpen(true)}
          />
        </div>
      )}

      {/* Interactive Search Modal */}
      <SearchModal
        isOpen={searchOpen}
        onClose={() => setSearchOpen(false)}
        articles={publishedArticles}
        onSelectArticle={(art) => {
          handleOpenArticle(art);
          setSearchOpen(false);
        }}
        darkMode={darkMode}
        lang={lang}
      />

      {/* Google Web Stories Modal (Optimized for Mobile traffic & engagement) */}
      <WebStoriesModal
        isOpen={webStoriesOpen}
        onClose={() => {
          if (window.location.hash === '#stories') {
            window.history.pushState(null, '', window.location.pathname);
          }
          setWebStoriesOpen(false);
        }}
        articles={publishedArticles}
        photoPosts={photoPosts}
        onSelectArticle={(art) => {
          setWebStoriesOpen(false);
          handleOpenArticle(art);
        }}
        darkMode={darkMode}
        lang={lang}
      />

      {/* Frontend Calendar Archive Modal (Requirement 3) */}
      <ArchiveArticlesModal
        isOpen={archiveModalOpen}
        onClose={() => setArchiveModalOpen(false)}
        dateKey={selectedArchiveDate || '2026-10-08'}
        articles={archiveMatchedArticles}
        allArticles={publishedArticles}
        onSelectArticle={(art) => {
          setArchiveModalOpen(false);
          handleOpenArticle(art);
        }}
        onSelectAnotherDate={(dateKey) => {
          setSelectedArchiveDate(dateKey);
          const matched = publishedArticles.filter(a => (a.publishedAt?.slice(0, 10) || a.date)?.includes(dateKey));
          setArchiveMatchedArticles(matched);
        }}
        darkMode={darkMode}
      />

      {/* Citizen Journalism News Submission Modal (Requirement 4) */}
      <CitizenNewsModal
        isOpen={isCitizenNewsModalOpen}
        onClose={() => setIsCitizenNewsModalOpen(false)}
        categories={categories}
        onSubmitArticle={handleAddArticle}
        darkMode={darkMode}
      />

      {/* Dynamic Recruitment & Career Application Portal Modal (Requirement 1) */}
      <RecruitmentPortalModal
        isOpen={isRecruitmentModalOpen}
        onClose={() => {
          if (window.location.hash === '#apply' || window.location.pathname === '/apply') {
            window.history.pushState(null, '', '/');
          }
          setIsRecruitmentModalOpen(false);
        }}
        onSubmitApplication={(newApp) => {
          setJobApplications(prev => [newApp, ...prev]);
        }}
        darkMode={darkMode}
      />

      {/* User Profile, Submissions Queue & Digital Press ID Card Modal (Requirement 2 & 3) */}
      <UserProfileModal
        isOpen={isUserProfileModalOpen}
        onClose={() => setIsUserProfileModalOpen(false)}
        user={currentUser || null}
        onUpdateUser={(updatedUser) => {
          setUsers(prev => prev.map(u => u.id === updatedUser.id ? updatedUser : u));
        }}
        darkMode={darkMode}
        articles={articles}
        jobApplications={jobApplications}
        onOpenCitizenNews={() => setIsCitizenNewsModalOpen(true)}
        onOpenRecruitment={() => setIsRecruitmentModalOpen(true)}
        onSelectArticle={(art) => {
          setSelectedArticle(art);
          setViewMode('portal');
        }}
      />

      {/* Login & Registration Modal */}
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        users={users}
        onLogin={handleLogin}
        onRegister={handleRegister}
        darkMode={darkMode}
        lang={lang}
        settings={settings}
        onRequireSecretGuard={() => setIsSecretGuardOpen(true)}
      />

      {/* Secret Admin Gateway Guard Modal */}
      <SecretAdminGuardModal
        isOpen={isSecretGuardOpen}
        onClose={() => setIsSecretGuardOpen(false)}
        onUnlockSuccess={() => {
          setIsSecretGuardOpen(false);
          if (isLoggedIn && canAccessAdmin(currentUser?.role)) {
            setViewMode('admin');
          } else {
            setIsLoginModalOpen(true);
          }
        }}
        settings={settings}
        darkMode={darkMode}
      />

      {/* Floating Citizen Journalism Action Button (Requirement 4) */}
      {viewMode === 'portal' && (
        <button
          onClick={() => setIsCitizenNewsModalOpen(true)}
          className="fixed bottom-6 right-6 z-40 flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white rounded-full shadow-2xl font-solaiman font-bold text-xs sm:text-sm transition-all duration-300 hover:scale-105 active:scale-95 group cursor-pointer border border-white/20"
          title={`নাগরিক সাংবাদিকতা — আপনার এলাকার খবর সরাসরি ${settings.siteName || 'নিউজ পোর্টালে'} পাঠান (অনুমোদন অপেক্ষমাণ)`}
        >
          <span className="p-1 rounded-full bg-white/20 group-hover:rotate-12 transition-transform">
            <Send className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" />
          </span>
          <span className="hidden sm:inline">নাগরিক সাংবাদিকতা</span>
          <span className="sm:hidden text-[11px]">সংবাদ পাঠান</span>
        </button>
      )}

    </div>
    </SiteConfigProvider>
  );
}
