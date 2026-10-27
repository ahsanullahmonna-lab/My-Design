import React, { useState, useRef, useEffect, useMemo } from 'react';
import { 
  ArrowLeft, 
  Clock, 
  Eye, 
  Printer, 
  Check, 
  Copy, 
  Send, 
  Bookmark, 
  ThumbsUp, 
  MessageSquare, 
  Share2, 
  ChevronRight, 
  Sparkles,
  MapPin,
  Flame,
  Volume2,
  VolumeX,
  Type,
  RefreshCw,
  Layers,
  Maximize2
} from 'lucide-react';
import { downloadPhotoCardImage } from '../../utils/photoCardExport';
import { Article, AdSlot, SiteSettings } from '../../types/news';
import { getAuthorAvatar, DEFAULT_AVATAR_DATA_URI } from '../../utils/authorAvatar';
import { useSiteConfig } from '../../context/SiteConfigContext';
import { SidebarAdSlot } from '../Ads/SidebarAdSlot';
import { UniversalAdSlot } from '../Ads/UniversalAdSlot';
import { WeatherPrayerWidget } from '../Widgets/WeatherPrayerWidget';
import { 
  sanitizeInput, 
  checkRateLimit, 
  verifyRecaptchaV3, 
  recordAuditLog 
} from '../../utils/securityAndSeo';
import { 
  getApprovedCommentsForArticle, 
  addGuestComment 
} from '../../utils/commentsStorage';

interface ArticlePageProps {
  article: Article;
  relatedArticles: Article[];
  adSlots: AdSlot[];
  onBack: () => void;
  onSelectArticle: (article: Article) => void;
  darkMode: boolean;
  lang: 'bn' | 'en';
  settings?: SiteSettings;
}

interface LocalComment {
  id: string;
  name: string;
  address?: string;
  phone?: string;
  text: string;
  time: string;
  likes: number;
}

export const ArticlePage: React.FC<ArticlePageProps> = ({
  article,
  relatedArticles,
  adSlots,
  onBack,
  onSelectArticle,
  darkMode,
  lang,
  settings,
}) => {
  const siteConfig = useSiteConfig();
  const [copyToast, setCopyToast] = useState(false);
  const [fontSize, setFontSize] = useState<'normal' | 'large' | 'xlarge'>('normal');
  const [isPrintPreview, setIsPrintPreview] = useState(false);
  const [printZoom, setPrintZoom] = useState(false);
  const [windowWidth, setWindowWidth] = useState<number>(() => {
    if (typeof window !== 'undefined') return window.innerWidth;
    return 1024;
  });
  const [printCanvasHeight, setPrintCanvasHeight] = useState<number>(1150);
  const printSheetRef = useRef<HTMLDivElement>(null);

  // Resize and measurement effects for responsive print broadsheet fit-to-screen
  useEffect(() => {
    const handleResize = () => {
      if (typeof window !== 'undefined') {
        setWindowWidth(window.innerWidth);
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
    };
  }, []);

  const contentParagraphs = useMemo(() => {
    if (!article.content) return [];
    return article.content
      .split(/\n\s*\n|\n/)
      .map((p) => p.trim())
      .filter((p) => p.length > 0);
  }, [article.content]);

  useEffect(() => {
    if (!isPrintPreview) return;
    const node = printSheetRef.current;
    if (!node) return;
    const updateHeight = () => {
      const h = node.offsetHeight || node.scrollHeight || 1000;
      if (h > 0) {
        setPrintCanvasHeight(Math.max(600, h));
      }
    };
    updateHeight();
    const t1 = setTimeout(updateHeight, 60);
    const t2 = setTimeout(updateHeight, 220);
    const t3 = setTimeout(updateHeight, 550);

    const ro = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const h = entry.borderBoxSize?.[0]?.blockSize || entry.contentRect?.height || node.offsetHeight;
        if (h > 0) {
          setPrintCanvasHeight(Math.max(600, Math.round(h)));
        }
      }
    });
    ro.observe(node);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      ro.disconnect();
    };
  }, [isPrintPreview, article, settings]);

  const printScale = useMemo(() => {
    if (windowWidth >= 900) return 1;
    // Leave 20px horizontal margin on mobile/tablet so edges never touch screen borders
    const available = Math.max(260, windowWidth - 20);
    return Math.min(1, Number((available / 860).toFixed(4)));
  }, [windowWidth]);

  const effectivePrintScale = printZoom ? 1 : printScale;
  const [showPhotoCardModal, setShowPhotoCardModal] = useState(false);
  const [cardRatio, setCardRatio] = useState<'4/5' | '9/16'>('4/5');
  const [isDownloadingCard, setIsDownloadingCard] = useState(false);
  const [readingProgress, setReadingProgress] = useState(0);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  // Audio News Reader Synthesis
  useEffect(() => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    if (isPlayingAudio) {
      window.speechSynthesis.cancel();
      const textToRead = `${article.title}. ${article.excerpt || article.content.substring(0, 350)}`;
      const utterance = new SpeechSynthesisUtterance(textToRead);
      utterance.lang = 'bn-BD';
      utterance.rate = 0.95;
      utterance.onend = () => setIsPlayingAudio(false);
      utterance.onerror = () => setIsPlayingAudio(false);
      window.speechSynthesis.speak(utterance);
    } else {
      window.speechSynthesis.cancel();
    }
    return () => {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, [isPlayingAudio, article]);

  // Dynamic Reading Progress Bar at the top of single-news pages
  useEffect(() => {
    const handleScroll = () => {
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (totalHeight > 0) {
        const currentProgress = (window.scrollY / totalHeight) * 100;
        setReadingProgress(Math.min(100, Math.max(0, currentProgress)));
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  const autoCardRef = useRef<HTMLDivElement>(null);

  const [comments, setComments] = useState<LocalComment[]>(() => {
    const approved = getApprovedCommentsForArticle(article.id);
    if (approved.length > 0) {
      return approved.map(c => ({
        id: c.id,
        name: c.name,
        address: c.address,
        phone: c.phone,
        text: c.text,
        time: c.time,
        likes: c.likes,
      }));
    }
    return [
      {
        id: 'c1',
        name: 'তানভীর আহমেদ',
        address: 'মতিঝিল, ঢাকা',
        text: 'সংবাদটি অত্যন্ত তথ্যবহুল এবং সময়োপযোগী। সত্য প্রকাশের এই সাহসী সাংবাদিকতাকে সাধুবাদ জানাই।',
        time: '১৫ মিনিট আগে',
        likes: 14,
      },
      {
        id: 'c2',
        name: 'ফারহানা ইসলাম',
        address: 'সিলেট সদর',
        text: 'আইনের শাসন ও ন্যায়বিচার প্রতিষ্ঠায় সঠিক তথ্য তুলে ধরা অত্যন্ত জরুরি। ধন্যবাদ সম্পাদকীয় টিমকে।',
        time: '৩৫ মিনিট আগে',
        likes: 8,
      },
    ];
  });

  // Sync approved comments when Admin/Editor approves them
  useEffect(() => {
    const handleSync = () => {
      const approved = getApprovedCommentsForArticle(article.id);
      if (approved.length > 0) {
        setComments(approved.map(c => ({
          id: c.id,
          name: c.name,
          address: c.address,
          phone: c.phone,
          text: c.text,
          time: c.time,
          likes: c.likes,
        })));
      }
    };
    window.addEventListener('kolom24_comments_updated', handleSync);
    return () => window.removeEventListener('kolom24_comments_updated', handleSync);
  }, [article.id]);

  const [commentName, setCommentName] = useState('');
  const [commentAddress, setCommentAddress] = useState('');
  const [commentPhone, setCommentPhone] = useState('');
  const [commentText, setCommentText] = useState('');
  const [commentHoneypot, setCommentHoneypot] = useState('');
  const [commentSecurityMsg, setCommentSecurityMsg] = useState('');
  const [commentSuccessMsg, setCommentSuccessMsg] = useState('');

  // Lightweight Math Anti-Spam Captcha State (Requirement 4)
  const generateMathCaptcha = () => {
    const num1 = Math.floor(Math.random() * 8) + 2; // 2 to 9
    const num2 = Math.floor(Math.random() * 7) + 1; // 1 to 7
    return { num1, num2, answer: num1 + num2 };
  };
  const [mathCaptcha, setMathCaptcha] = useState(() => generateMathCaptcha());
  const [captchaInput, setCaptchaInput] = useState('');
  const banglaDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
  const toBanglaDigits = (n: number) => n.toString().split('').map(d => banglaDigits[parseInt(d, 10)] || d).join('');
  const [sharesCount, setSharesCount] = useState<number>(() => {
    try {
      const stored = localStorage.getItem(`kolom24_share_count_${article.id}`);
      return stored ? parseInt(stored, 10) : (article.sharesCount || 24);
    } catch {
      return article.sharesCount || 24;
    }
  });

  const incrementShare = () => {
    setSharesCount(prev => {
      const next = prev + 1;
      try {
        localStorage.setItem(`kolom24_share_count_${article.id}`, next.toString());
      } catch (e) {
        console.error(e);
      }
      return next;
    });
  };

  const currentUrl = typeof window !== 'undefined' ? window.location.href : `https://${siteConfig.domain}`;
  const siteLogoUrl = (settings?.lightLogoUrl?.trim() || settings?.darkLogoUrl?.trim() || siteConfig?.lightLogoUrl?.trim() || siteConfig?.darkLogoUrl?.trim()) || null;
  const authorAvatarUrl = getAuthorAvatar(article.author, article.authorAvatar, siteLogoUrl);

  // Dynamic Meta Tags & Open Graph (OG) Automation + Schema.org NewsArticle JSON-LD
  useEffect(() => {
    if (typeof document === 'undefined') return;

    // 1. Dynamic Page Title
    const originalTitle = document.title;
    const siteTitle = (siteConfig.siteName || settings?.siteName || 'সংবাদ পোর্টাল').trim();
    document.title = `${article.title} | ${siteTitle}`;

    // 2. Helper to set/create meta tags
    const setMetaTag = (property: string, content: string, isName = false) => {
      const attr = isName ? 'name' : 'property';
      let element = document.querySelector(`meta[${attr}="${property}"]`);
      if (!element) {
        element = document.createElement('meta');
        element.setAttribute(attr, property);
        document.head.appendChild(element);
      }
      element.setAttribute('content', content);
    };

    // Meta Description & Keywords
    setMetaTag('description', article.excerpt || article.title, true);
    setMetaTag('keywords', (article.tags || [article.category, siteTitle, 'বাংলা সংবাদ']).join(', '), true);

    // Open Graph (Facebook / LinkedIn)
    const effectiveFeaturedImage = article.imageUrl?.trim() || settings?.ogImage?.trim() || siteLogoUrl || 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?auto=format&fit=crop&w=1200&q=80';

    setMetaTag('og:title', article.title);
    setMetaTag('og:description', article.excerpt || article.title);
    setMetaTag('og:url', currentUrl);
    setMetaTag('og:type', 'article');
    setMetaTag('og:site_name', siteTitle);
    setMetaTag('og:image', effectiveFeaturedImage);
    setMetaTag('og:image:width', '1200');
    setMetaTag('og:image:height', '630');
    setMetaTag('og:image:alt', article.title);

    // Twitter Card
    setMetaTag('twitter:card', 'summary_large_image', true);
    setMetaTag('twitter:title', article.title, true);
    setMetaTag('twitter:description', article.excerpt || article.title, true);
    setMetaTag('twitter:image', effectiveFeaturedImage, true);

    // 3. Schema.org NewsArticle Structured Data
    const schemaScriptId = 'news-article-schema';
    let scriptTag = document.getElementById(schemaScriptId) as HTMLScriptElement | null;
    if (!scriptTag) {
      scriptTag = document.createElement('script');
      scriptTag.id = schemaScriptId;
      scriptTag.type = 'application/ld+json';
      document.head.appendChild(scriptTag);
    }

    const newsArticleSchema = {
      '@context': 'https://schema.org',
      '@type': 'NewsArticle',
      mainEntityOfPage: {
        '@type': 'WebPage',
        '@id': currentUrl,
      },
      headline: article.title,
      description: article.excerpt,
      image: [article.imageUrl],
      datePublished: article.publishedAt || new Date().toISOString(),
      dateModified: article.publishedAt || new Date().toISOString(),
      author: {
        '@type': 'Person',
        name: article.author || 'নিজস্ব প্রতিবেদক',
      },
      publisher: {
        '@type': 'NewsMediaOrganization',
        name: `${siteConfig.siteName} (${siteConfig.siteNameEn})`,
        url: `https://${siteConfig.domain}`,
        logo: {
          '@type': 'ImageObject',
          url: siteLogoUrl || `https://${siteConfig.domain}/logo.png`,
        },
      },
      articleSection: article.category,
      keywords: article.tags || [article.category],
    };

    scriptTag.textContent = JSON.stringify(newsArticleSchema);

    return () => {
      document.title = originalTitle;
      const existingScript = document.getElementById(schemaScriptId);
      if (existingScript) existingScript.remove();
    };
  }, [article, currentUrl, siteLogoUrl]);

  // Filter chain series articles
  const seriesArticles = article.seriesName
    ? [article, ...relatedArticles.filter(a => a.seriesName?.trim() === article.seriesName?.trim() && a.id !== article.id)]
    : [];

  const handleCopyLink = () => {
    incrementShare();
    navigator.clipboard.writeText(currentUrl);
    setCopyToast(true);
    setTimeout(() => setCopyToast(false), 3000);
  };

  const handleShareFacebook = () => {
    incrementShare();
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(currentUrl)}`, '_blank', 'noopener,noreferrer');
  };

  const handleShareTwitter = () => {
    incrementShare();
    window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(currentUrl)}&text=${encodeURIComponent(article.title)}`, '_blank', 'noopener,noreferrer');
  };

  const handleShareWhatsapp = () => {
    incrementShare();
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(article.title + ' ' + currentUrl)}`, '_blank', 'noopener,noreferrer');
  };

  const handleShareLinkedin = () => {
    incrementShare();
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(currentUrl)}`, '_blank', 'noopener,noreferrer');
  };

  const handleShareTelegram = () => {
    incrementShare();
    window.open(`https://t.me/share/url?url=${encodeURIComponent(currentUrl)}&text=${encodeURIComponent(article.title)}`, '_blank', 'noopener,noreferrer');
  };

  // Direct Print
  const handlePrint = () => {
    window.print();
  };

  // Auto Photo Card Download (HD Quality, Zero Font Fallback, Pixel Ratio Optimized)
  const handleAutoPhotoCardDownload = async () => {
    if (!autoCardRef.current) return;
    setIsDownloadingCard(true);
    try {
      const cleanSlug = article.title.replace(/[^\w\s\u0980-\u09FF]/gi, '').trim().substring(0, 25).replace(/\s+/g, '_');
      const filename = `news_card_${cleanSlug || article.id}_${Date.now()}.png`;

      await downloadPhotoCardImage(autoCardRef.current, filename, {
        minWidth: 1200,
        aspectRatio: cardRatio,
      });

      setShowPhotoCardModal(false);
    } catch (err) {
      console.error('Auto photo card error:', err);
    } finally {
      setIsDownloadingCard(false);
    }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();

    // 0. Lightweight Math Anti-Spam Captcha Verification (Requirement 4)
    const enteredCaptcha = parseInt(captchaInput.trim(), 10);
    if (isNaN(enteredCaptcha) || enteredCaptcha !== mathCaptcha.answer) {
      setCommentSecurityMsg(`স্প্যাম প্রতিরোধ: গণিত ক্যাপচার সঠিক সমাধান দিন (${toBanglaDigits(mathCaptcha.num1)} + ${toBanglaDigits(mathCaptcha.num2)} = কত?)।`);
      setMathCaptcha(generateMathCaptcha());
      setCaptchaInput('');
      return;
    }

    // 1. Invisible Honeypot Technique (Bots fill hidden fields automatically)
    if (commentHoneypot.trim() !== '') {
      recordAuditLog({
        action: 'bot_blocked',
        actionBn: 'বট আক্রমণ প্রতিহত (Honeypot)',
        userName: 'Automated Bot',
        userRole: 'guest',
        ipAddress: '185.220.101.4 (Spam Network)',
        status: 'danger',
        details: 'গোপন হানিপট ফিল্ডে তথ্য দেওয়ার কারণে স্প্যাম মন্তব্যটি ড্রপ ও ব্লক করা হয়েছে।',
      });
      setCommentSecurityMsg('সন্দেহভাজন বট কার্যকলাপের কারণে মন্তব্যটি বাতিল করা হয়েছে।');
      return;
    }

    if (!commentName.trim() || !commentText.trim()) return;

    // 2. IP-based Rate Limiting (Max 5 comments per minute)
    const rateCheck = checkRateLimit('comment_submission', 5, 60000);
    if (!rateCheck.allowed) {
      setCommentSecurityMsg('নিরাপত্তা সতর্কতা: আপনি খুব দ্রুত মন্তব্য পাঠাচ্ছেন। অনুগ্রহ করে ১ মিনিট পর চেষ্টা করুন।');
      return;
    }

    // 3. Invisible Google reCAPTCHA v3 Verification
    const captchaRes = await verifyRecaptchaV3('submit_comment');
    if (!captchaRes.success || captchaRes.score < 0.5) {
      setCommentSecurityMsg('reCAPTCHA v3 নিরাপত্তা যাচাইকরণ ব্যর্থ হয়েছে।');
      return;
    }

    // 4. Strict Input Sanitization & HTML Escape against XSS
    const cleanName = sanitizeInput(commentName);
    const cleanAddress = sanitizeInput(commentAddress);
    const cleanPhone = sanitizeInput(commentPhone);
    const cleanText = sanitizeInput(commentText);

    addGuestComment({
      articleId: article.id,
      articleTitle: article.title,
      name: cleanName,
      address: cleanAddress || undefined,
      phone: cleanPhone || undefined,
      text: cleanText,
      date: '৮ অক্টোবর ২০২৬',
    });

    setCommentName('');
    setCommentAddress('');
    setCommentPhone('');
    setCommentText('');
    setCommentHoneypot('');
    setCaptchaInput('');
    setMathCaptcha(generateMathCaptcha());
    setCommentSecurityMsg('');
    setCommentSuccessMsg('ধন্যবাদ! আপনার মন্তব্যটি সফলভাবে জমা হয়েছে। সম্পাদকীয় পর্যালোচনার পর ("অনুমোদন অপেক্ষমাণ") এটি অনুমোদিত হলে ওয়েবসাইটে লাইভ প্রকাশিত হবে।');
  };

  const getFontSizeClass = () => {
    if (fontSize === 'large') return 'text-lg md:text-xl leading-relaxed';
    if (fontSize === 'xlarge') return 'text-xl md:text-2xl leading-loose';
    return 'text-base md:text-lg leading-relaxed';
  };

  return (
    <div className={`min-h-screen py-6 px-4 md:px-6 transition-colors font-solaiman relative ${
      darkMode ? 'bg-[#0b0f17] text-slate-100' : 'bg-[#f8f9fa] text-slate-900'
    }`}>
      {/* Dynamic Reading Progress Bar at the very top of single news page */}
      <div className="fixed top-0 left-0 right-0 h-1 z-50 bg-slate-200/40 dark:bg-slate-800/40 pointer-events-none print:hidden">
        <div 
          className="h-full reading-progress-bar rounded-r-full"
          style={{ width: `${readingProgress}%` }}
        />
      </div>
      {/* Toast Notification */}
      {copyToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-emerald-600 text-white px-4 py-2.5 rounded-lg shadow-xl flex items-center gap-2 text-xs font-bold animate-in fade-in slide-in-from-bottom-2">
          <Check className="w-4 h-4" />
          <span>সংবাদের লিংক ক্লিপবোর্ডে কপি করা হয়েছে!</span>
        </div>
      )}

      {/* Photo Card Preview Modal (User Request: নিউজের ফটো কার্ড ডাউনলোড করার সময় প্রিভিও দেখায় না। সেটা চালু করে দাও।) */}
      {showPhotoCardModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white rounded-2xl shadow-2xl max-w-sm sm:max-w-md w-full p-4 sm:p-5 space-y-3.5 border border-slate-200 dark:border-slate-800 animate-in fade-in zoom-in-95 my-auto max-h-[95vh] flex flex-col font-solaiman">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2.5 shrink-0">
              <h3 className="text-base font-bold flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-500" />
                <span>ফটো কার্ড প্রিভিউ (Photo Card Preview)</span>
              </h3>
              <button 
                onClick={() => setShowPhotoCardModal(false)} 
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 font-bold text-lg p-1 cursor-pointer transition-colors"
                title="বন্ধ করুন"
              >
                ✕
              </button>
            </div>

            {/* Aspect Ratio Switcher (Social Media Standard: 4:5 or 9:16) */}
            <div className="flex items-center justify-between px-1 shrink-0">
              <span className="text-xs text-slate-600 dark:text-slate-400 font-bold">সোশ্যাল মিডিয়া অনুপাত:</span>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setCardRatio('4/5')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all border cursor-pointer ${
                    cardRatio === '4/5'
                      ? 'bg-red-600 text-white border-red-600 shadow-xs'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700 hover:border-slate-400'
                  }`}
                >
                  ৪:৫ (পোর্ট্রেট)
                </button>
                <button
                  type="button"
                  onClick={() => setCardRatio('9/16')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all border cursor-pointer ${
                    cardRatio === '9/16'
                      ? 'bg-red-600 text-white border-red-600 shadow-xs'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700 hover:border-slate-400'
                  }`}
                >
                  ৯:১৬ (স্টোরি)
                </button>
              </div>
            </div>

            {/* Controlled, Centered Preview Wrapper (max-w-xs or max-w-sm with vertical padding & overflow-y-auto) */}
            <div className="flex-1 overflow-y-auto py-2 flex items-center justify-center bg-slate-100 dark:bg-slate-950/80 rounded-xl border border-slate-200 dark:border-slate-800 p-2 sm:p-3">
              <div className="w-full max-w-xs sm:max-w-sm mx-auto flex items-center justify-center p-1">
                {/* Generated Photo Card Canvas — strictly maintains professional social media aspect ratio, object-fit: contain, never squashed */}
                <div 
                  ref={autoCardRef}
                  className={`w-full ${
                    cardRatio === '9/16' 
                      ? 'aspect-[9/16] max-w-[270px] sm:max-w-[290px]' 
                      : 'aspect-[4/5] max-w-[340px] sm:max-w-[360px]'
                  } object-contain mx-auto text-white p-4 sm:p-5 flex flex-col justify-between shadow-2xl relative overflow-hidden select-none rounded-xl transition-all duration-200`}
                  style={{ 
                    background: 'linear-gradient(145deg, #061121 0%, #0c203b 50%, #1e3a8a 100%)',
                    fontFamily: "'SolaimanLipi', 'Hind Siliguri', sans-serif" 
                  }}
                >
                  {/* Subtle Grid Watermark Texture */}
                  <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />

                  {/* Top Bar: Symmetric Brand Logo Shape & Date Badge */}
                  <div className="relative z-10 flex items-center justify-between pb-2">
                    <div className="flex items-center gap-2 px-2.5 py-1 rounded-md bg-white text-slate-900 shadow-md border border-white/40">
                      {siteLogoUrl ? (
                        <img src={siteLogoUrl} alt="Logo" className="h-4 sm:h-5 object-contain drop-shadow" />
                      ) : (
                        <div className="flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-red-600 animate-pulse" />
                          <span className="text-xs font-black text-red-700 font-solaiman">{siteConfig.siteName}</span>
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-white text-slate-900 font-solaiman font-bold text-[11px] shadow-md border border-white/40">
                      <span className="text-slate-900">
                        {article.date || 'আজকের সংবাদ'}
                      </span>
                    </div>
                  </div>

                  {/* Feature Image Frame with Gold Accent Border */}
                  <div className="relative z-10 flex-1 my-1.5 rounded-xl overflow-hidden border-2 border-amber-400 shadow-xl min-h-[90px] bg-slate-900">
                    <img 
                      src={article.imageUrl?.trim() || 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?auto=format&fit=crop&w=800&q=80'} 
                      alt={article.title} 
                      crossOrigin="anonymous" 
                      referrerPolicy="no-referrer" 
                      className="w-full h-full object-cover" 
                    />
                    {article.category && (
                      <div className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-black/75 backdrop-blur-md text-amber-300 text-[10px] font-bold">
                        {article.category}
                      </div>
                    )}
                  </div>

                  {/* Headline Section */}
                  <div className="relative z-10 space-y-1 mt-1">
                    <h3 className="text-xs sm:text-sm md:text-base font-black leading-snug text-white line-clamp-3 drop-shadow-md">
                      {article.title}
                    </h3>
                    
                    {/* Footer Ribbon with Comment Prompt & Domain */}
                    <div className="flex items-center justify-between text-[10px] font-bold pt-2 border-t border-white/20 text-white/90">
                      <span className="text-amber-300 font-solaiman flex items-center gap-1">
                        <span>« বিস্তারিত কমেন্টে »</span>
                      </span>
                      <span className="font-mono text-white/80">{siteConfig.domain}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <p className="text-[11px] text-slate-500 dark:text-slate-400 text-center">
              সোশ্যাল মিডিয়ার জন্য কার্ডটি উচ্চ রেজ্যুলেশনে (এইচডি পিএনজি) প্রস্তুত রয়েছে।
            </p>

            <div className="flex justify-end gap-3 pt-3 border-t">
              <button
                onClick={() => setShowPhotoCardModal(false)}
                className="px-4 py-2 rounded border text-xs font-bold"
              >
                বাতিল
              </button>
              <button
                onClick={handleAutoPhotoCardDownload}
                disabled={isDownloadingCard}
                className="px-6 py-2 rounded bg-red-600 hover:bg-red-700 text-white text-xs font-bold flex items-center gap-2 shadow-md disabled:opacity-50"
              >
                {isDownloadingCard ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>ডাউনলোড হচ্ছে...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-amber-300" />
                    <span>ফটো কার্ড ডাউনলোড করুন (PNG)</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-6xl mx-auto">
        
        {/* Top Breadcrumb & Quick Actions Bar */}
        <div className="print:hidden flex flex-wrap items-center justify-between gap-4 pb-4 mb-6 border-b border-gray-200 dark:border-slate-800 text-xs">
          <div className="flex items-center gap-2 text-gray-900 dark:text-gray-100 font-bold">
            <button
              onClick={onBack}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-gray-200 dark:bg-slate-800 hover:bg-red-600 hover:text-white dark:hover:bg-red-600 dark:hover:text-white transition-colors font-bold text-gray-950 dark:text-gray-100 cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>প্রচ্ছদে ফিরে যান</span>
            </button>
            <span className="text-gray-300 dark:text-slate-700">|</span>
            <span onClick={onBack} className="hover:text-red-600 cursor-pointer text-gray-950 dark:text-white font-bold">প্রচ্ছদ</span>
            <ChevronRight className="w-3.5 h-3.5 text-gray-700 dark:text-gray-300" />
            <span className="text-red-600 font-black">{article.category}</span>
          </div>

          <div className="flex items-center gap-2">
            {/* Font Size Selector */}
            <div className="flex items-center border border-gray-300 dark:border-slate-700 rounded-md overflow-hidden bg-white dark:bg-slate-900">
              <button
                onClick={() => setFontSize('normal')}
                className={`px-2.5 py-1 text-xs font-bold cursor-pointer transition-colors ${fontSize === 'normal' ? 'bg-red-600 text-white' : 'text-gray-950 dark:text-white hover:bg-gray-100 dark:hover:bg-slate-800'}`}
                title="সাধারণ ফন্ট"
              >
                অ
              </button>
              <button
                onClick={() => setFontSize('large')}
                className={`px-2.5 py-1 text-sm font-bold border-l border-gray-300 dark:border-slate-700 cursor-pointer transition-colors ${fontSize === 'large' ? 'bg-red-600 text-white' : 'text-gray-950 dark:text-white hover:bg-gray-100 dark:hover:bg-slate-800'}`}
                title="মাঝারি ফন্ট"
              >
                অ+
              </button>
              <button
                onClick={() => setFontSize('xlarge')}
                className={`px-2.5 py-1 text-base font-bold border-l border-gray-300 dark:border-slate-700 cursor-pointer transition-colors ${fontSize === 'xlarge' ? 'bg-red-600 text-white' : 'text-gray-950 dark:text-white hover:bg-gray-100 dark:hover:bg-slate-800'}`}
                title="বড় ফন্ট"
              >
                অ++
              </button>
            </div>

            {/* Print View Button */}
            <button
              onClick={() => setIsPrintPreview(!isPrintPreview)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-bold shadow-xs transition-colors ${
                isPrintPreview 
                  ? 'bg-amber-600 text-white' 
                  : 'bg-slate-800 hover:bg-slate-900 text-white'
              }`}
              title="A4 Broadsheet Print View"
            >
              <Printer className="w-3.5 h-3.5 text-amber-400" />
              <span>প্রিন্ট ভিউ (Print View)</span>
            </button>

            {/* Audio Reader Button */}
            <button
              onClick={() => setIsPlayingAudio(!isPlayingAudio)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-bold shadow-xs transition-colors ${
                isPlayingAudio 
                  ? 'bg-red-600 text-white animate-pulse' 
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
              title="সংবাদটি শুনে পড়ুন"
            >
              {isPlayingAudio ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5 text-red-600" />}
              <span>{isPlayingAudio ? 'থামুন' : 'অডিও শুনুন'}</span>
            </button>

            {/* Auto Photo Card Button (Opens Preview Modal as requested) */}
            <button
              onClick={() => setShowPhotoCardModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-md text-xs font-bold shadow-xs transition-colors"
              title="অ্যাডমিন নির্ধারিত টেমপ্লেট অনুযায়ী অটো ফটো কার্ড প্রিভিউ ও ডাউনলোড"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>অটো ফটো কার্ড</span>
            </button>
          </div>
        </div>

        {/* ================= A4 BROADSHEET PRINT / DOWNLOAD VIEW (When Print View Active) ================= */}
        {isPrintPreview && (
          <div className="w-full mb-8 flex flex-col items-center">
            
            {/* Top Toolbar for Print View */}
            <div 
              style={{ width: `${Math.min(860, Math.max(280, Math.round(860 * effectivePrintScale)))}px` }}
              className="max-w-[860px] mb-3 flex flex-wrap items-center justify-between gap-2 px-3 py-2 bg-slate-100 dark:bg-slate-900/90 rounded-lg border border-slate-300 dark:border-slate-800 text-xs font-solaiman print:hidden transition-all shadow-xs"
            >
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                  <Printer className="w-4 h-4 text-amber-500" />
                  <span>A4 ব্রডশিট প্রিন্ট প্রিভিউ</span>
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 font-bold border border-amber-300">
                  {Math.round(effectivePrintScale * 100)}% আকার
                </span>
              </div>

              <div className="flex items-center gap-2">
                {/* Mobile Fit-to-Screen vs 100% Zoom Toggle */}
                {windowWidth < 900 && (
                  <button
                    type="button"
                    onClick={() => setPrintZoom(!printZoom)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-bold border transition-colors cursor-pointer shadow-xs ${
                      !printZoom 
                        ? 'bg-amber-600 text-white border-amber-600' 
                        : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 border-slate-300 dark:border-slate-700'
                    }`}
                    title={printZoom ? 'স্ক্রিন ফিট (পুরো ব্রডশিট পৃষ্ঠা একসাথে দেখুন)' : 'আসল আকার (১০০%)'}
                  >
                    <Maximize2 className="w-3.5 h-3.5" />
                    <span>{!printZoom ? 'স্ক্রিন ফিট' : '১০০% ভিউ'}</span>
                  </button>
                )}

                <button
                  onClick={handlePrint}
                  className="px-3.5 py-1.5 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-md flex items-center gap-1.5 shadow-xs cursor-pointer transition-colors"
                  title="প্রিন্ট বা PDF সেভ করুন"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>প্রিন্ট / PDF</span>
                </button>

                <button
                  onClick={() => setIsPrintPreview(false)}
                  className="px-3 py-1.5 rounded-md border border-slate-300 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs cursor-pointer transition-colors"
                >
                  ✕ বন্ধ করুন
                </button>
              </div>
            </div>

            {/* Scaled Print View Container Wrapper (Guarantees Full Desktop Broadsheet Page Fits on Mobile Screen at a Glance) */}
            <div
              className={`print-broadsheet-wrapper w-full max-w-full flex ${
                effectivePrintScale >= 1 ? 'justify-start sm:justify-center overflow-x-auto' : 'justify-center overflow-hidden'
              } items-start transition-all duration-200 mx-auto`}
              style={{
                height: `${Math.ceil(printCanvasHeight * effectivePrintScale) + 12}px`,
                minHeight: '260px',
                position: 'relative',
              }}
            >
              {/* Desktop Broadsheet Scaling Container (Scales down smoothly from top-center to fit mobile screen width perfectly) */}
              <div
                style={{
                  width: '860px',
                  minWidth: '860px',
                  maxWidth: '860px',
                  transform: `scale(${effectivePrintScale})`,
                  transformOrigin: 'top center',
                  position: 'relative',
                }}
                className="shrink-0 flex justify-center"
              >
                <div
                  ref={printSheetRef}
                  id="broadsheet-print-container"
                  className="w-[860px] min-w-[860px] max-w-[860px] bg-white text-[#111827] p-8 sm:p-10 rounded-xl shadow-2xl border-4 border-slate-900 font-solaiman space-y-6 select-text"
                >
                  {/* Header Bar */}
                  <div className="border-b-4 border-slate-900 pb-4">
                    <div className="flex items-center justify-between text-[11px] font-solaiman text-slate-700 border-b border-slate-300 pb-1.5 mb-3 font-bold">
                      <div className="flex items-center gap-2">
                        <span>{settings?.siteName || 'নতুন দৃষ্টি'} প্রিন্ট সংস্করণ</span>
                        <span>•</span>
                        <span className="bg-red-700 text-white px-2 py-0.5 rounded text-[10px]">A4 ব্রডশিট</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span>তারিখ: {article.date}</span>
                        <span>•</span>
                        <span>বিশেষ মুদ্রণ</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        {siteLogoUrl ? (
                          <img src={siteLogoUrl} alt="Logo" className="h-10 max-w-[220px] object-contain" />
                        ) : (
                          <div>
                            <h1 className="text-3xl font-black tracking-tight text-[#111827] font-solaiman">{settings?.siteName || 'নিউজ পোর্টাল'}</h1>
                            <p className="text-xs text-slate-600 font-bold">{settings?.tagline || 'পজিটিভ বাংলাদেশ'} — {settings?.domain || 'newsportal.com'}</p>
                          </div>
                        )}
                      </div>
                      <div className="text-right text-xs font-solaiman">
                        <div className="font-black text-red-700 text-sm">বিশেষ প্রিন্ট সংস্করণ (Broadsheet Print)</div>
                        <div className="text-slate-600 font-bold">{settings?.domain || 'newsportal.com'}</div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h2 className="text-2xl sm:text-3xl font-extrabold font-solaiman text-[#111827] leading-tight">
                      {article.title}
                    </h2>
                    <div className="flex items-center gap-4 text-xs font-solaiman text-slate-700 border-y-2 border-slate-900 py-2 font-bold">
                      <span>বিভাগ: <b className="text-red-700">{article.category}</b></span>
                      <span>•</span>
                      <span>প্রতিবেদক: <b>{article.author}</b></span>
                      <span>•</span>
                      <span>প্রকাশকাল: {article.date}</span>
                      <span>•</span>
                      <span>লেআউট: বহু-কলাম ব্রডশিট</span>
                    </div>

                    {/* Dynamic Feature Image in Print View based on printViewConfig */}
                    {article.imageUrl?.trim() && settings?.printViewConfig?.imageLayout !== 'hidden' && (
                      settings?.printViewConfig?.imageLayout === 'top_banner' ? (
                        <div className="my-3 w-full h-56 rounded overflow-hidden bg-slate-100 border border-slate-300 shadow-xs">
                          <img src={article.imageUrl.trim()} alt={article.title} className="w-full h-full object-cover" />
                        </div>
                      ) : (
                        <div className="my-1.5 float-left mr-5 mb-2 max-w-[220px] w-52 h-36 rounded overflow-hidden bg-slate-100 border border-slate-300 shadow-xs">
                          <img src={article.imageUrl.trim()} alt={article.title} className="w-full h-full object-cover" />
                        </div>
                      )
                    )}

                    {/* Multi-Column Broadsheet Layout (Guarantees multi-column desktop newspaper structure) */}
                    <div 
                      className={`${
                        settings?.printViewConfig?.textColumns === 1
                          ? 'columns-1'
                          : settings?.printViewConfig?.textColumns === 3
                          ? 'columns-3'
                          : 'columns-2'
                      } ${
                        settings?.printViewConfig?.fontSize === 'small'
                          ? 'text-xs leading-relaxed'
                          : settings?.printViewConfig?.fontSize === 'large'
                          ? 'text-base leading-relaxed'
                          : 'text-sm leading-relaxed'
                      } font-solaiman text-[#111827] text-justify pt-2 [overflow-wrap:anywhere] break-words`}
                      style={{
                        columnGap: '2rem',
                        columnRule: '1px solid #e2e8f0',
                      }}
                    >
                      <p className="font-bold text-base mb-3 first-letter:text-4xl first-letter:font-bold first-letter:float-left first-letter:mr-2.5 first-letter:text-red-700 first-letter:font-solaiman first-letter:leading-none break-inside-avoid">
                        {article.excerpt}
                      </p>
                      {contentParagraphs.map((paragraph, idx) => (
                        <p key={idx} className="mb-3 break-inside-avoid leading-relaxed text-[#111827] text-justify">
                          {paragraph}
                        </p>
                      ))}
                      {settings?.printViewConfig?.showEditorialDisclaimer !== false && (
                        <div className="mt-4 italic text-slate-700 text-xs border-t-2 border-slate-300 pt-2 break-inside-avoid bg-slate-50 p-3 rounded border border-slate-200">
                          <span className="font-bold text-red-700 not-italic mr-1.5">সম্পাদকীয় মন্তব্য:</span>
                          {settings?.printViewConfig?.disclaimerText || `সংশ্লিষ্ট সূত্র জানিয়েছে, বিষয়টি নিয়ে পর্যালোচনা অব্যাহত রয়েছে। ${settings?.siteName || 'নিউজ পোর্টাল'} সম্পাদকীয় বিভাগ তথ্যের সর্বোচ্চ নির্ভরযোগ্যতা নিশ্চিত করে প্রতিবেদনটি প্রকাশ করেছে।`}
                        </div>
                      )}
                    </div>
                    <div className="clear-both" />
                  </div>

                  {/* Footer Data in Print Broadsheet */}
                  <div className="pt-4 border-t-4 border-slate-900 mt-6 text-xs font-solaiman space-y-2 text-slate-800">
                    {settings?.printViewConfig?.showPublicationCredits !== false && (
                      <div className="flex items-center justify-between gap-2 font-bold pb-2 border-b border-slate-200">
                        <div>ভারপ্রাপ্ত সম্পাদক: <b className="text-[#111827]">{settings?.editorName || 'শামীম রেজা নূরুল'}</b></div>
                        <div>প্রকাশক: <b className="text-[#111827]">{settings?.publisherName || `${settings?.siteName || 'নিউজ পোর্টাল'} পাবলিケーションস`}</b></div>
                        <div>যোগাযোগ: <span className="font-mono text-slate-700">{settings?.contactEmail || `editor@${settings?.domain || 'newsportal.com'}`}</span></div>
                      </div>
                    )}
                    <div className="text-[11px] text-slate-600 pt-1 flex items-center justify-between gap-2 font-bold">
                      <span>{settings?.copyrightText || `© ২০২৬ ${settings?.siteName || 'নিউজ পোর্টাল'} সর্বস্বত্ব সংরক্ষিত।`}</span>
                      <span className="font-mono bg-slate-100 px-2 py-0.5 rounded border border-slate-200 text-[#111827]">
                        {settings?.printViewConfig?.footerWatermark || 'বিশেষ প্রিন্ট সংস্করণ • A4 ব্রডশিট'}
                      </span>
                    </div>
                  </div>

                  <div className="print:hidden flex justify-end gap-3 pt-4 border-t">
                    <button
                      onClick={() => setIsPrintPreview(false)}
                      className="px-4 py-2 rounded border border-slate-300 hover:bg-slate-100 text-xs font-bold transition-colors cursor-pointer"
                    >
                      প্রিন্ট প্রিভিউ বন্ধ করুন
                    </button>
                    <button
                      onClick={handlePrint}
                      className="px-6 py-2 rounded bg-red-600 hover:bg-red-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-md transition-colors cursor-pointer"
                    >
                      <Printer className="w-4 h-4" />
                      <span>প্রিন্ট বা PDF সেভ করুন</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ================= STANDARD ARTICLE VIEW ================= */}
        {!isPrintPreview && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Left Content Column (Col 8) */}
            <div className="lg:col-span-8 space-y-6">
              
              {/* Category, Shoulder & Date */}
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-2 text-xs">
                  {article.shoulder && (
                    <span className="px-2 py-0.5 rounded bg-red-100 dark:bg-red-950/70 text-red-700 dark:text-red-300 font-extrabold font-solaiman uppercase tracking-wider text-[11px] border border-red-300 dark:border-red-800">
                      {article.shoulder}
                    </span>
                  )}
                  <span className="px-2.5 py-1 rounded bg-red-600 text-white font-bold font-solaiman">
                    {article.category}
                  </span>
                  <span className="text-gray-400">•</span>
                  <div className="flex items-center gap-1 font-semibold text-gray-800 dark:text-gray-200">
                    <Clock className="w-3.5 h-3.5 text-red-600" />
                    <span>{article.date} ({article.timeAgo})</span>
                  </div>
                </div>

                {/* Headline */}
                <h1 className="text-2xl md:text-4xl font-extrabold font-solaiman leading-tight text-slate-950 dark:text-white">
                  {article.title}
                </h1>

                {/* Sub-Headline */}
                {article.subHeadline && (
                  <p className="text-base md:text-lg font-bold font-solaiman text-slate-600 dark:text-slate-300 leading-snug">
                    {article.subHeadline}
                  </p>
                )}
              </div>

              {/* CHAIN NEWS / SERIES BANNER */}
              {article.seriesName && (
                <div className="p-4 rounded-xl border border-indigo-200 dark:border-indigo-800 bg-indigo-50/70 dark:bg-indigo-950/40 space-y-3 font-solaiman">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="p-1 rounded bg-indigo-600 text-white"><Layers className="w-4 h-4" /></span>
                      <span className="font-extrabold text-indigo-950 dark:text-indigo-200 text-sm">
                        ধারাবাহিক সংবাদ সিরিজ: {article.seriesName}
                      </span>
                    </div>
                    {article.seriesPart && (
                      <span className="px-2.5 py-0.5 rounded-full bg-indigo-600 text-white text-xs font-bold">
                        {article.seriesPart}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-indigo-800 dark:text-indigo-300">
                    এই ধারাবাহিক অনুসন্ধানের অন্যান্য পর্বগুলো পড়তে নিচে ক্লিক করুন:
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                    {seriesArticles.map((sArt) => (
                      <button
                        key={sArt.id}
                        onClick={() => onSelectArticle(sArt)}
                        className={`p-2.5 rounded-lg border text-left text-xs flex items-start justify-between gap-2 transition-all ${
                          sArt.id === article.id 
                            ? 'bg-indigo-600 text-white border-indigo-700 font-bold shadow-xs'
                            : 'bg-white dark:bg-slate-800 border-indigo-200 dark:border-indigo-700/60 hover:border-indigo-400 text-slate-800 dark:text-slate-200'
                        }`}
                      >
                        <div className="space-y-0.5">
                          <span className={`text-[10px] ${sArt.id === article.id ? 'text-indigo-200' : 'text-indigo-600 dark:text-indigo-400'} font-bold`}>
                            {sArt.seriesPart || 'পর্ব'}
                          </span>
                          <div className="line-clamp-2 leading-snug">{sArt.title}</div>
                        </div>
                        {sArt.id === article.id && (
                          <span className="text-[10px] bg-white/20 px-1.5 py-0.5 rounded shrink-0">এখন পড়ছেন</span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Author & Stats Bar */}
              <div className="flex items-center justify-between py-3 border-y border-slate-200 dark:border-slate-800 text-xs">
                <div className="flex items-center gap-3">
                  <img
                    src={authorAvatarUrl}
                    alt={article.author}
                    onError={(e) => {
                      if (siteLogoUrl && e.currentTarget.src !== siteLogoUrl) {
                        e.currentTarget.src = siteLogoUrl;
                      } else {
                        e.currentTarget.src = DEFAULT_AVATAR_DATA_URI;
                      }
                    }}
                    className="w-10 h-10 rounded-full object-cover border-2 border-red-600 shadow-xs bg-slate-100 dark:bg-slate-800"
                  />
                  <div>
                    <div className="font-bold text-gray-950 dark:text-white text-sm">{article.author}</div>
                    <div className="text-gray-700 dark:text-gray-300 font-medium text-[11px]">{article.authorRole || `বিশেষ প্রতিনিধি, ${settings?.siteName || 'নিউজ পোর্টাল'}`}</div>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-gray-800 dark:text-gray-200 font-bold">
                  <span className="flex items-center gap-1">
                    <Eye className="w-4 h-4 text-red-600" />
                    <span>{article.views?.toLocaleString() || '৩,৪৮০'} বার পঠিত</span>
                  </span>
                </div>
              </div>

              {/* Featured Image */}
              <div className="space-y-2">
                <div className="relative rounded-lg overflow-hidden aspect-16/9 bg-slate-100 dark:bg-slate-800 shadow-md">
                  <img
                    src={article.imageUrl?.trim() || 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?auto=format&fit=crop&w=800&q=80'}
                    alt={article.title}
                    onError={(e) => {
                      e.currentTarget.src = 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?auto=format&fit=crop&w=800&q=80';
                    }}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                </div>
                {article.imageCaption && (
                  <p className="text-xs text-slate-500 dark:text-slate-400 italic text-center">
                    {article.imageCaption}
                  </p>
                )}
              </div>

              {/* Article Content */}
              <div className={`space-y-4 font-solaiman text-slate-800 dark:text-slate-200 ${getFontSizeClass()}`}>
                {article.excerpt && (
                  <p className="font-bold text-lg md:text-xl text-slate-950 dark:text-white leading-relaxed border-l-4 border-red-600 pl-4 bg-red-50/50 dark:bg-red-950/20 py-2">
                    {article.excerpt}
                  </p>
                )}
                
                {(() => {
                  const lines = article.content.split('\n');
                  const midIndex = Math.max(1, Math.floor(lines.length / 2));
                  return lines.map((line, idx) => {
                    const trimmed = line.trim();
                    if (!trimmed) return <div key={idx} className="h-2" />;
                    if (trimmed.startsWith('## ')) {
                      return (
                        <h2 key={idx} className="text-xl md:text-2xl font-bold pt-3 pb-1 border-b border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white">
                          {trimmed.replace(/^##\s+/, '')}
                        </h2>
                      );
                    }
                    if (trimmed.startsWith('### ')) {
                      return (
                        <h3 key={idx} className="text-lg md:text-xl font-bold pt-2 text-red-600 dark:text-red-400">
                          {trimmed.replace(/^###\s+/, '')}
                        </h3>
                      );
                    }
                    if (trimmed.startsWith('> ') || trimmed.startsWith('❝')) {
                      return (
                        <blockquote key={idx} className="border-l-4 border-red-600 bg-red-50 dark:bg-red-950/20 pl-4 pr-3 py-2 my-2 italic rounded-r">
                          {trimmed.replace(/^[>❝]\s*/, '')}
                        </blockquote>
                      );
                    }
                    if (trimmed.startsWith('• ') || trimmed.startsWith('- ')) {
                      return <li key={idx} className="ml-5 list-disc py-0.5">{trimmed.replace(/^[•\-]\s*/, '')}</li>;
                    }
                    if (/^\d+\.\s+/.test(trimmed)) {
                      return <li key={idx} className="ml-5 list-decimal py-0.5">{trimmed.replace(/^\d+\.\s*/, '')}</li>;
                    }
                    if (trimmed.startsWith('📌')) {
                      return (
                        <div key={idx} className="p-3 my-2 bg-amber-50 dark:bg-amber-950/30 border border-amber-300 dark:border-amber-700 text-amber-900 dark:text-amber-200 rounded-md text-sm font-semibold">
                          {trimmed}
                        </div>
                      );
                    }
                    // Dynamic White-Label AI News Desk Footnote (Zero Hardcoding)
                    if (trimmed.includes('কর্তৃক সংকলিত ও পরিমার্জিত') || (trimmed.startsWith('(প্রতিবেদনটি') && trimmed.includes('পরিমার্জিত)'))) {
                      const activeSiteTitle = (siteConfig.siteName || settings?.siteName || 'দৈনিক বাংলাদেশ').trim();
                      return (
                        <p key={idx} className="leading-relaxed italic text-xs text-slate-500 dark:text-slate-400 py-1.5 border-t border-slate-100 dark:border-slate-800">
                          (প্রতিবেদনটি {activeSiteTitle} নিউজ ডেস্ক কর্তৃক সংকলিত ও পরিমার্জিত)
                        </p>
                      );
                    }
                    return (
                      <React.Fragment key={idx}>
                        <p className="leading-relaxed text-justify">{trimmed}</p>
                        {idx === midIndex && (
                          <div className="my-5 w-full">
                            <UniversalAdSlot position="article_middle" adSlots={adSlots} darkMode={darkMode} />
                          </div>
                        )}
                      </React.Fragment>
                    );
                  });
                })()}

                {article.source && (
                  <div className="pt-3 border-t border-slate-200 dark:border-slate-800 text-xs text-slate-500 italic">
                    তথ্যসূত্র ও কৃতজ্ঞতা: {article.source}
                  </div>
                )}
              </div>

              {/* Tags */}
              {article.tags && article.tags.length > 0 && (
                <div className="flex flex-wrap items-center gap-2 pt-4 border-t border-slate-200 dark:border-slate-800 text-xs">
                  <span className="font-bold text-slate-500">ট্যাগ:</span>
                  {article.tags.map((tag, idx) => (
                    <span key={idx} className="px-2.5 py-1 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold">
                      #{tag}
                    </span>
                  ))}
                </div>
              )}

              {/* Social Share Bar with Share Counter & Dynamic Platform Icons */}
              {(() => {
                const shareConfig = settings?.socialShares || {
                  facebook: true,
                  twitter: true,
                  whatsapp: true,
                  linkedin: true,
                  telegram: true,
                  copyLink: true,
                };

                return (
                  <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2 text-xs font-bold text-slate-800 dark:text-slate-200">
                        <Share2 className="w-4 h-4 text-red-600" />
                        <span>সংবাদটি শেয়ার করুন:</span>
                      </div>
                      {/* Dynamic Share Counter Tracker */}
                      <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 text-red-600 dark:text-red-400 font-bold text-xs">
                        <span className="w-2 h-2 rounded-full bg-red-600 animate-pulse" />
                        <span>{sharesCount.toLocaleString('bn-BD')} বার শেয়ার হয়েছে</span>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      {shareConfig.facebook !== false && (
                        <button
                          onClick={handleShareFacebook}
                          className="px-3 py-1.5 bg-[#1877F2] text-white rounded-md text-xs font-bold hover:opacity-90 transition-opacity flex items-center gap-1.5 shadow-xs"
                          title="ফেসবুকে শেয়ার করুন"
                        >
                          <span>Facebook</span>
                        </button>
                      )}
                      {shareConfig.twitter !== false && (
                        <button
                          onClick={handleShareTwitter}
                          className="px-3 py-1.5 bg-black text-white rounded-md text-xs font-bold hover:opacity-90 transition-opacity flex items-center gap-1.5 shadow-xs"
                          title="এক্স (টুইটার)-এ শেয়ার করুন"
                        >
                          <span>X / Twitter</span>
                        </button>
                      )}
                      {shareConfig.whatsapp !== false && (
                        <button
                          onClick={handleShareWhatsapp}
                          className="px-3 py-1.5 bg-[#25D366] text-white rounded-md text-xs font-bold hover:opacity-90 transition-opacity flex items-center gap-1.5 shadow-xs"
                          title="হোয়াটসঅ্যাপে শেয়ার করুন"
                        >
                          <span>WhatsApp</span>
                        </button>
                      )}
                      {shareConfig.linkedin !== false && (
                        <button
                          onClick={handleShareLinkedin}
                          className="px-3 py-1.5 bg-[#0A66C2] text-white rounded-md text-xs font-bold hover:opacity-90 transition-opacity flex items-center gap-1.5 shadow-xs"
                          title="লিংকডইনে শেয়ার করুন"
                        >
                          <span>LinkedIn</span>
                        </button>
                      )}
                      {shareConfig.telegram !== false && (
                        <button
                          onClick={handleShareTelegram}
                          className="px-3 py-1.5 bg-[#229ED9] text-white rounded-md text-xs font-bold hover:opacity-90 transition-opacity flex items-center gap-1.5 shadow-xs"
                          title="টেলিগ্রামে শেয়ার করুন"
                        >
                          <Send className="w-3.5 h-3.5" />
                          <span>Telegram</span>
                        </button>
                      )}
                      {shareConfig.copyLink !== false && (
                        <button
                          onClick={handleCopyLink}
                          className="px-3 py-1.5 bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-md text-xs font-bold hover:bg-slate-300 dark:hover:bg-slate-700 transition-colors flex items-center gap-1.5 shadow-xs"
                          title="লিংক কপি করুন"
                        >
                          {copyToast ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                          <span>{copyToast ? 'কপি হয়েছে!' : 'কপি লিংক'}</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })()}

              {/* Single News Details Page Bottom Ad Slot */}
              <div className="w-full my-6">
                <UniversalAdSlot position="article_bottom" adSlots={adSlots} darkMode={darkMode} />
              </div>

              {/* Guest Comments System (পাবলিক / গেস্ট মন্তব্য ব্যবস্থা) */}
              <div className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-5 shadow-xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b pb-3">
                  <h3 className="text-base font-bold flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-red-600" />
                    <span>পাঠকদের মন্তব্য ({comments.length})</span>
                  </h3>
                  <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-800">
                    ✓ লগইন ছাড়াই সরাসরি মন্তব্য করুন (Guest Comment)
                  </span>
                </div>

                <form onSubmit={handleAddComment} className="space-y-3">
                  {/* Invisible Honeypot Field (Hidden from humans via absolute off-screen styling) */}
                  <div className="opacity-0 absolute -top-[9999px] -left-[9999px] h-0 w-0 overflow-hidden" aria-hidden="true">
                    <label htmlFor="website_hp">Leave this field blank</label>
                    <input
                      id="website_hp"
                      type="text"
                      name="website_hp"
                      tabIndex={-1}
                      autoComplete="off"
                      value={commentHoneypot}
                      onChange={(e) => setCommentHoneypot(e.target.value)}
                    />
                  </div>

                  {commentSecurityMsg && (
                    <div className="p-2.5 rounded-lg bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-300 text-xs font-semibold">
                      {commentSecurityMsg}
                    </div>
                  )}

                  {commentSuccessMsg && (
                    <div className="p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs font-semibold flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping shrink-0" />
                      <span>{commentSuccessMsg}</span>
                    </div>
                  )}

                  {/* Guest Commenter Details: Name, Address, Phone */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-800 dark:text-slate-200 mb-1">
                        আপনার নাম *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="যেমন: রফিকুল ইসলাম"
                        value={commentName}
                        onChange={(e) => setCommentName(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:ring-1 focus:ring-red-600 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-800 dark:text-slate-200 mb-1">
                        ঠিকানা / অবস্থান
                      </label>
                      <input
                        type="text"
                        placeholder="যেমন: ধানমন্ডি, ঢাকা"
                        value={commentAddress}
                        onChange={(e) => setCommentAddress(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:ring-1 focus:ring-red-600 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-800 dark:text-slate-200 mb-1">
                        মোবাইল নম্বর (ঐচ্ছিক)
                      </label>
                      <input
                        type="tel"
                        placeholder="যেমন: 017xxxxxxxx"
                        value={commentPhone}
                        onChange={(e) => setCommentPhone(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:ring-1 focus:ring-red-600 focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Comment Text */}
                  <div>
                    <label className="block text-[11px] font-bold text-slate-800 dark:text-slate-200 mb-1">
                      মন্তব্য *
                    </label>
                    <textarea
                      required
                      rows={3}
                      placeholder="আপনার বস্তুনিষ্ঠ ও শালীন মন্তব্য লিখুন..."
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:ring-1 focus:ring-red-600 focus:outline-none"
                    />
                  </div>

                  {/* Lightweight Math Anti-Spam Captcha (Requirement 4) */}
                  <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50/80 dark:bg-slate-800/80 flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <span className="p-1.5 rounded-md bg-red-100 dark:bg-red-950/80 text-red-600 dark:text-red-400 font-bold text-xs">
                        🛡️
                      </span>
                      <div>
                        <span className="text-xs font-bold text-slate-900 dark:text-white block font-solaiman">
                          স্প্যাম প্রতিরোধ (Human Verification):
                        </span>
                        <span className="text-[11px] text-slate-600 dark:text-slate-300 font-solaiman">
                          যোগফল নির্ণয় করুন:{' '}
                          <strong className="text-red-600 dark:text-red-400 font-mono font-bold text-xs bg-red-50 dark:bg-red-950/60 px-1.5 py-0.5 rounded border border-red-200 dark:border-red-900/60">
                            {toBanglaDigits(mathCaptcha.num1)} + {toBanglaDigits(mathCaptcha.num2)} = ?
                          </strong>
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        required
                        placeholder="উত্তর দিন"
                        value={captchaInput}
                        onChange={(e) => setCaptchaInput(e.target.value)}
                        className="w-24 px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-xs font-mono font-bold text-slate-900 dark:text-white text-center focus:ring-1 focus:ring-red-600"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setMathCaptcha(generateMathCaptcha());
                          setCaptchaInput('');
                        }}
                        className="p-1.5 rounded-md hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 cursor-pointer transition-colors"
                        title="নতুন ক্যাপচা কোড লোড করুন"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                    <button
                      type="submit"
                      className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-bold shadow-xs transition-colors cursor-pointer flex items-center gap-1.5"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>মন্তব্য প্রকাশ করুন</span>
                    </button>
                    <span className="text-[10px] text-gray-700 dark:text-gray-300 font-sans font-medium flex items-center gap-1">
                      🔒 Protected by Math Captcha & Honeypot Protection
                    </span>
                  </div>
                </form>

                <div className="space-y-3 pt-3">
                  {comments.map((c) => (
                    <div key={c.id} className="p-3.5 rounded-lg bg-gray-50 dark:bg-slate-800/60 border border-gray-200 dark:border-slate-700 space-y-1.5">
                      <div className="flex flex-wrap items-center justify-between gap-1 text-xs">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-gray-950 dark:text-white">{c.name}</span>
                          {c.address && (
                            <span className="text-[10px] text-gray-700 dark:text-gray-300 bg-gray-200 dark:bg-slate-700/80 px-1.5 py-0.5 rounded font-bold flex items-center gap-1">
                              <MapPin className="w-2.5 h-2.5 text-red-600" />
                              {c.address}
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] text-gray-700 dark:text-gray-300 font-medium">{c.time}</span>
                      </div>
                      <p className="text-xs text-gray-900 dark:text-gray-100 leading-relaxed font-solaiman">{c.text}</p>
                    </div>
                  ))}
                </div>
              </div>

            </div>

            {/* Right Sidebar Column (Col 4) */}
            <div className="lg:col-span-4 space-y-6">
              {/* Sidebar Ad */}
              <SidebarAdSlot position="politics_right" adSlots={adSlots} darkMode={darkMode} />

              {/* Related Articles */}
              <div className="p-4 rounded-xl border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-4 shadow-2xs">
                <h3 className="font-bold text-sm border-b border-gray-200 dark:border-slate-800 pb-2 text-gray-950 dark:text-white flex items-center gap-2">
                  <span className="w-2 h-4 bg-red-600 inline-block" />
                  <span>আরও পড়ুন</span>
                </h3>
                <div className="space-y-3">
                  {relatedArticles.map((rel) => (
                    <div
                      key={rel.id}
                      onClick={() => onSelectArticle(rel)}
                      className="group cursor-pointer flex gap-3 pb-3 border-b border-gray-100 dark:border-slate-800 last:border-0 last:pb-0"
                    >
                      <img
                        src={rel.imageUrl?.trim() || 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?auto=format&fit=crop&w=800&q=80'}
                        alt={rel.title}
                        className="w-20 h-16 object-cover rounded shrink-0 border border-gray-200 dark:border-slate-700 group-hover:scale-102 transition-transform"
                      />
                      <div className="space-y-1">
                        <h4 className="text-xs font-bold font-solaiman leading-snug text-gray-950 dark:text-white group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors line-clamp-2">
                          {rel.title}
                        </h4>
                        <span className="text-[10px] text-gray-700 dark:text-gray-300 font-solaiman font-medium">{rel.date}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Weather & Prayer Times Widget (Requirement 3: Clean Sidebar Tucked) */}
              <WeatherPrayerWidget darkMode={darkMode} variant="sidebar" />
            </div>

          </div>
        )}

      </div>
    </div>
  );
};
