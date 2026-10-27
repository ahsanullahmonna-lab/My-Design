import React, { useState, useRef, useEffect, useMemo } from 'react';
import { 
  Download, 
  Copy, 
  Sparkles, 
  RefreshCw, 
  Check, 
  Share2, 
  Palette, 
  Ratio, 
  AlertCircle, 
  Upload, 
  Sliders, 
  Layers, 
  Image as ImageIcon,
  Search, 
  CheckCircle2, 
  Trash2, 
  Maximize, 
  Type,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Calendar,
  QrCode,
  Globe,
  Flame,
  Quote,
  MessageSquare,
  Smartphone,
  CheckCheck,
  Eye,
  FileImage,
  X,
  Tv,
  Newspaper,
  Zap,
  Lock,
  Unlock,
  ArrowLeftRight
} from 'lucide-react';
import { downloadPhotoCardImage, exportPhotoCardToBlob } from '../../utils/photoCardExport';
import { Article, SiteSettings } from '../../types/news';
import { useSiteConfig } from '../../context/SiteConfigContext';

export type CardTemplate = 
  | 'pro_news_gradient'      // Template 1: Pro News Gradient (RTV / DBC Style)
  | 'broadsheet_modern'      // Template 2: Broadsheet Modern (Kalbela / Amar Desh / Diner Somachar)
  | 'breaking_flash'         // Template 3: Breaking Flash (Breaking News BD)
  | 'minimalist_quote'       // Template 4: Minimalist Quote / Feature (DBC Statement)
  | 'somoy_split'            // Template 5: Somoy / Jamuna TV Split Style
  | 'editorial_broadsheet'   // Template 6: Editorial Broadsheet (Prothom Alo / Jugantor Style)
  | 'viral_spotlight'        // Template 7: Viral Spotlight (Social Special)
  | 'custom_template'        // Template 8: Custom uploaded background frame
  // Backwards compatibility aliases:
  | 'classic_prothom' 
  | 'viral_dark' 
  | 'cinematic_overlay' 
  | 'breaking_live' 
  | 'minimal_swiss' 
  | 'split_modern' 
  | 'quote_spotlight'
  | 'magazine_feature';

export type CardAspectRatio = '1:1' | '16:9' | '4:5' | '9:16' | 'custom';

interface PhotoCardGeneratorProps {
  articles: Article[];
  selectedArticle?: Article | null;
  settings: SiteSettings;
  onUpdateSettings?: (settings: SiteSettings) => void;
  darkMode: boolean;
  onClose?: () => void;
  isAdmin?: boolean;
}

export const PhotoCardGenerator: React.FC<PhotoCardGeneratorProps> = ({
  articles,
  selectedArticle: initialArticle,
  settings,
  onUpdateSettings,
  darkMode,
  onClose,
  isAdmin = true,
}) => {
  const fallbackCardImage = 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?auto=format&fit=crop&w=800&q=80';
  const siteConfig = useSiteConfig();
  const effectiveSettings = settings || siteConfig.settings;
  const brandTitle = effectiveSettings.siteName || 'নিউজ পোর্টাল';
  const brandDomain = effectiveSettings.domain || 'dailybangladesh.com';
  const brandHandleDefault = `@${brandDomain.split('.')[0] || 'news'}`;
  const siteLogoToUse = effectiveSettings.logoUrl || effectiveSettings.lightLogoUrl || effectiveSettings.darkLogoUrl || '';

  // Published articles only (Strictly filter published news)
  const publishedArticles = useMemo(() => {
    const list = articles.filter(a => a.status === 'published' || !a.status);
    return list.length > 0 ? list : articles;
  }, [articles]);

  const defaultArt = initialArticle || (publishedArticles.length > 0 ? publishedArticles[0] : null);

  // Normalize incoming template id
  const initialTemplateRaw = (effectiveSettings.photoCardConfig?.defaultTemplate as CardTemplate) || 
    (effectiveSettings.defaultPhotoCardTemplate as CardTemplate) || 
    'pro_news_gradient';

  const mapToSupportedTemplate = (tpl: string): CardTemplate => {
    if (
      tpl === 'pro_news_gradient' || 
      tpl === 'broadsheet_modern' || 
      tpl === 'breaking_flash' || 
      tpl === 'minimalist_quote' || 
      tpl === 'somoy_split' ||
      tpl === 'editorial_broadsheet' ||
      tpl === 'viral_spotlight' ||
      tpl === 'custom_template'
    ) {
      return tpl as CardTemplate;
    }
    if (tpl === 'classic_prothom' || tpl === 'minimal_swiss') return 'editorial_broadsheet';
    if (tpl === 'breaking_live') return 'breaking_flash';
    if (tpl === 'quote_spotlight') return 'minimalist_quote';
    if (tpl === 'split_modern' || tpl === 'magazine_feature') return 'somoy_split';
    if (tpl === 'viral_dark' || tpl === 'cinematic_overlay') return 'viral_spotlight';
    return 'pro_news_gradient';
  };

  // Core State
  const [selectedArticleId, setSelectedArticleId] = useState<string>(defaultArt?.id || '');
  const [template, setTemplate] = useState<CardTemplate>(mapToSupportedTemplate(initialTemplateRaw));
  const [aspectRatio, setAspectRatio] = useState<CardAspectRatio>(
    (effectiveSettings.photoCardConfig?.defaultAspectRatio as CardAspectRatio) || '1:1'
  );
  
  // Custom Dimensions (px)
  const [customWidth, setCustomWidth] = useState<number>(1080);
  const [customHeight, setCustomHeight] = useState<number>(1080);
  const [isRatioLocked, setIsRatioLocked] = useState<boolean>(false);

  const handleWidthChange = (val: number) => {
    const w = Math.max(300, Math.min(3840, val));
    setCustomWidth(w);
    if (isRatioLocked && customWidth > 0) {
      const ratio = customWidth / customHeight;
      setCustomHeight(Math.max(300, Math.round(w / ratio)));
    }
    setAspectRatio('custom');
  };

  const handleHeightChange = (val: number) => {
    const h = Math.max(300, Math.min(3840, val));
    setCustomHeight(h);
    if (isRatioLocked && customHeight > 0) {
      const ratio = customWidth / customHeight;
      setCustomWidth(Math.max(300, Math.round(h * ratio)));
    }
    setAspectRatio('custom');
  };

  const handleSwapDimensions = () => {
    const prevW = customWidth;
    const prevH = customHeight;
    setCustomWidth(prevH);
    setCustomHeight(prevW);
    setAspectRatio('custom');
  };

  const handleApplyPresetDimension = (w: number, h: number, ratioKey?: CardAspectRatio) => {
    setCustomWidth(w);
    setCustomHeight(h);
    if (ratioKey) {
      setAspectRatio(ratioKey);
    } else {
      setAspectRatio('custom');
    }
  };

  // Auto-Fetched Article Data
  const activeArticle = useMemo(() => {
    return publishedArticles.find(a => a.id === selectedArticleId) || defaultArt || publishedArticles[0];
  }, [publishedArticles, selectedArticleId, defaultArt]);

  // 1. Dynamic Headline & Content Controls
  const [headline, setHeadline] = useState<string>(activeArticle?.title || 'সংবাদের শিরোনাম লোড করা হচ্ছে...');
  const [kicker, setKicker] = useState<string>(activeArticle?.category || 'প্রধান সংবাদ');
  const [headlineFontSize, setHeadlineFontSize] = useState<number>(
    effectiveSettings.photoCardConfig?.headlineFontSize || 28
  );
  const [headlineLineHeight, setHeadlineLineHeight] = useState<number>(
    effectiveSettings.photoCardConfig?.headlineLineHeight || 1.35
  );
  const [headlineAlignment, setHeadlineAlignment] = useState<'left' | 'center' | 'right'>(
    effectiveSettings.photoCardConfig?.headlineAlignment || 'left'
  );

  // Sync headline and kicker when selected article changes
  useEffect(() => {
    if (activeArticle) {
      setHeadline(activeArticle.title || '');
      setKicker(activeArticle.category || 'প্রধান সংবাদ');
    }
  }, [activeArticle?.id]);

  // 2. Background Theme & Gradient Controls
  const [backgroundTheme, setBackgroundTheme] = useState<string>(
    effectiveSettings.photoCardConfig?.backgroundTheme || 'navy_gradient'
  );
  const [customColor, setCustomColor] = useState<string>(
    effectiveSettings.photoCardConfig?.customBackgroundColor || '#1e3a8a'
  );
  const [frameBorderColor, setFrameBorderColor] = useState<'gold' | 'white' | 'red' | 'none'>(
    effectiveSettings.photoCardConfig?.frameBorderColor || 'gold'
  );

  // 3. Watermark, Logo & Social Badges Controls
  const [showWatermark, setShowWatermark] = useState<boolean>(
    effectiveSettings.photoCardConfig?.showWatermark !== undefined ? effectiveSettings.photoCardConfig.showWatermark : true
  );
  const [logoSize, setLogoSize] = useState<'sm' | 'md' | 'lg'>(
    effectiveSettings.photoCardConfig?.logoSize || 'md'
  );
  const [logoPosition, setLogoPosition] = useState<'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'>(
    effectiveSettings.photoCardConfig?.logoPosition || 'top-left'
  );
  const [showSocialHandles, setShowSocialHandles] = useState<boolean>(
    effectiveSettings.photoCardConfig?.showSocialHandles !== undefined ? effectiveSettings.photoCardConfig.showSocialHandles : true
  );
  const [socialHandleText, setSocialHandleText] = useState<string>(
    effectiveSettings.photoCardConfig?.socialHandleText || brandHandleDefault
  );
  const [showCommentPrompt, setShowCommentPrompt] = useState<boolean>(
    effectiveSettings.photoCardConfig?.showCommentPrompt !== undefined ? effectiveSettings.photoCardConfig.showCommentPrompt : true
  );
  const [commentPromptText, setCommentPromptText] = useState<string>(
    effectiveSettings.photoCardConfig?.commentPromptText || '« বিস্তারিত কমেন্টে »'
  );
  const [showDateBadge, setShowDateBadge] = useState<boolean>(
    effectiveSettings.photoCardConfig?.showDateBadge !== undefined ? effectiveSettings.photoCardConfig.showDateBadge : true
  );

  // 4. Custom Background / Overlay Frame State (Requirement 2)
  const [customBackgroundTemplate, setCustomBackgroundTemplate] = useState<string | null>(
    effectiveSettings.photoCardConfig?.customBackgroundUrl || null
  );
  const [customTemplateName, setCustomTemplateName] = useState<string>(
    effectiveSettings.photoCardConfig?.customBackgroundUrl ? 'সংরক্ষিত কাস্টম ফ্রেম' : ''
  );
  const [customFrameMode, setCustomFrameMode] = useState<'overlay' | 'background'>(
    effectiveSettings.photoCardConfig?.customFrameMode || 'overlay'
  );
  const [enableFrameOverlay, setEnableFrameOverlay] = useState<boolean>(
    effectiveSettings.photoCardConfig?.enableFrameOverlay !== undefined ? effectiveSettings.photoCardConfig.enableFrameOverlay : true
  );
  const [overlayPosition, setOverlayPosition] = useState<'bottom' | 'center' | 'top'>(
    effectiveSettings.photoCardConfig?.overlayPosition || 'bottom'
  );
  const [overlayDarkness, setOverlayDarkness] = useState<number>(
    effectiveSettings.photoCardConfig?.overlayDarkness !== undefined ? effectiveSettings.photoCardConfig.overlayDarkness : 45
  );
  const [showNewsThumbnail, setShowNewsThumbnail] = useState<boolean>(
    effectiveSettings.photoCardConfig?.showNewsThumbnail !== undefined ? effectiveSettings.photoCardConfig.showNewsThumbnail : true
  );
  const [dragOverFrame, setDragOverFrame] = useState<boolean>(false);

  // Article Search Filter
  const [newsSearchTerm, setNewsSearchTerm] = useState<string>('');

  const authorName = activeArticle?.author || 'নিজস্ব প্রতিবেদক';
  const rawDateStr = activeArticle?.date || new Date().toLocaleDateString('bn-BD', { year: 'numeric', month: 'long', day: 'numeric' });
  const effectiveImageUrl = (activeArticle?.imageUrl && activeArticle.imageUrl.trim()) 
    ? activeArticle.imageUrl.trim() 
    : fallbackCardImage;

  // Processing & Toasts
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [copyToast, setCopyToast] = useState<boolean>(false);
  const [successToast, setSuccessToast] = useState<string>('');
  const [errorToast, setErrorToast] = useState<string>('');

  const cardPreviewRef = useRef<HTMLDivElement>(null);
  const templateFileInputRef = useRef<HTMLInputElement>(null);

  // Background Gradient Presets
  const gradientPresets = [
    { 
      id: 'navy_gradient', 
      label: 'রয়েল ব্লু (RTV Style)', 
      bg: 'linear-gradient(145deg, #061121 0%, #0c203b 50%, #1e3a8a 100%)',
      accent: '#38bdf8'
    },
    { 
      id: 'crimson_gradient', 
      label: 'ডিপ ক্রিমসন (Crimson Red)', 
      bg: 'linear-gradient(145deg, #2b0606 0%, #701010 50%, #b91c1c 100%)',
      accent: '#f87171'
    },
    { 
      id: 'maroon_gradient', 
      label: 'বার্গান্ডি মেরুন (DBC Style)', 
      bg: 'linear-gradient(145deg, #20050e 0%, #4c0519 50%, #881337 100%)',
      accent: '#fb7185'
    },
    { 
      id: 'charcoal_dark', 
      label: 'চারকোল ডার্ক (Pitch Black)', 
      bg: 'linear-gradient(145deg, #090d16 0%, #0f172a 50%, #1e293b 100%)',
      accent: '#e2e8f0'
    },
    { 
      id: 'broadsheet_white', 
      label: 'হোয়াইট ও রেড (Kalbela Style)', 
      bg: '#ffffff',
      accent: '#dc2626'
    },
    { 
      id: 'emerald_gradient', 
      label: 'পান্না সবুজ (Deep Emerald)', 
      bg: 'linear-gradient(145deg, #022019 0%, #064e3b 50%, #047857 100%)',
      accent: '#34d399'
    },
    { 
      id: 'amber_gold', 
      label: 'গোল্ডেন অ্যাম্বার (Warm Gold)', 
      bg: 'linear-gradient(145deg, #1f1203 0%, #78350f 50%, #d97706 100%)',
      accent: '#fbbf24'
    },
    { 
      id: 'custom_picker', 
      label: 'কাস্টম কালার (Custom Color)', 
      bg: customColor,
      accent: '#ffffff'
    },
  ];

  const currentTheme = gradientPresets.find(g => g.id === backgroundTheme) || gradientPresets[0];

  // Helper for border styling on photo frames
  const getFrameBorderClass = () => {
    switch (frameBorderColor) {
      case 'gold': return 'border-2 sm:border-[3px] border-amber-400 shadow-xl';
      case 'white': return 'border-2 sm:border-[3px] border-white/80 shadow-xl';
      case 'red': return 'border-2 sm:border-[3px] border-red-600 shadow-xl';
      case 'none': return 'border-0 shadow-lg';
      default: return 'border-2 sm:border-[3px] border-amber-400 shadow-xl';
    }
  };

  // Helper for logo sizing
  const getLogoClass = () => {
    switch (logoSize) {
      case 'sm': return 'h-4 sm:h-5 max-w-[70px]';
      case 'lg': return 'h-8 sm:h-9 max-w-[130px]';
      case 'md':
      default:
        return 'h-5 sm:h-6 max-w-[100px]';
    }
  };

  // Functional Custom Frame Processor (Requirement 2)
  const processUploadedFrameFile = (file: File) => {
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErrorToast('শুধুমাত্র PNG, JPEG বা WebP ইমেজ ফরম্যাট সমর্থনযোগ্য।');
      setTimeout(() => setErrorToast(''), 3000);
      return;
    }

    if (file.size > 15 * 1024 * 1024) {
      setErrorToast('ফাইলের আকার ১৫ মেগাবাইট অতিক্রম করতে পারবে না।');
      setTimeout(() => setErrorToast(''), 3000);
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      setCustomBackgroundTemplate(result);
      setCustomTemplateName(file.name);
      setEnableFrameOverlay(true);
      setTemplate('custom_template');
      setSuccessToast(`কাস্টম ফ্রেম "${file.name}" সফলভাবে যুক্ত হয়েছে এবং ক্যানভাসে রেন্ডার হচ্ছে!`);
      setTimeout(() => setSuccessToast(''), 3500);
    };
    reader.readAsDataURL(file);
  };

  // File input change wrapper
  const handleCustomTemplateUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processUploadedFrameFile(file);
    }
  };

  // 1-Click High-Res PNG Download Handler (No Blurriness, Zero Font Clipping)
  const handleDownloadCard = async () => {
    if (!cardPreviewRef.current) return;
    setIsGenerating(true);

    try {
      const safeSlug = (activeArticle?.slug || activeArticle?.title || 'photocard')
        .replace(/[^a-zA-Z0-9\u0980-\u09FF]/g, '_')
        .slice(0, 30);
      const filename = `photocard_${safeSlug}_${Date.now()}.png`;

      await downloadPhotoCardImage(cardPreviewRef.current, filename, {
        targetWidth: customWidth,
        targetHeight: customHeight,
        minWidth: customWidth,
        aspectRatio,
      });

      const resBadge = `${customWidth}×${customHeight}px`;
      setSuccessToast(`ফটো কার্ডটি এইচডি রেজ্যুলেশনে (${resBadge}) সফলভাবে ডাউনলোড হয়েছে!`);
      setTimeout(() => setSuccessToast(''), 3500);
    } catch (err: any) {
      console.error('Download error:', err);
      setErrorToast('ডাউনলোডে সমস্যা হয়েছে। পুনরায় চেষ্টা করুন।');
      setTimeout(() => setErrorToast(''), 3500);
    } finally {
      setIsGenerating(false);
    }
  };

  // 1-Click Copy Image to Clipboard Handler
  const handleCopyToClipboard = async () => {
    if (!cardPreviewRef.current) return;
    setIsGenerating(true);

    try {
      const blob = await exportPhotoCardToBlob(cardPreviewRef.current, {
        targetWidth: customWidth,
        targetHeight: customHeight,
        minWidth: customWidth,
        aspectRatio,
      });

      if (blob && navigator.clipboard && window.ClipboardItem) {
        await navigator.clipboard.write([
          new ClipboardItem({ 'image/png': blob })
        ]);
        setCopyToast(true);
        setTimeout(() => setCopyToast(false), 3000);
      } else {
        await navigator.clipboard.writeText(`${headline}\n— ${brandTitle} (${brandDomain})`);
        setCopyToast(true);
        setTimeout(() => setCopyToast(false), 3000);
      }
    } catch (err) {
      console.error('Copy error:', err);
      setErrorToast('ক্লিপবোর্ডে কপি করতে সমস্যা হয়েছে।');
      setTimeout(() => setErrorToast(''), 3000);
    } finally {
      setIsGenerating(false);
    }
  };

  // Save current studio configuration as default
  const handleSaveDefaultConfig = () => {
    if (!onUpdateSettings) return;
    onUpdateSettings({
      ...effectiveSettings,
      defaultPhotoCardTemplate: template,
      photoCardConfig: {
        defaultTemplate: template,
        defaultAspectRatio: aspectRatio,
        customBackgroundUrl: customBackgroundTemplate || undefined,
        customFrameMode,
        enableFrameOverlay,
        overlayPosition,
        overlayDarkness,
        showNewsThumbnail,
        accentColor: currentTheme.accent,
        headlineFontSize,
        headlineLineHeight,
        headlineAlignment,
        backgroundTheme,
        customBackgroundColor: customColor,
        frameBorderColor,
        logoSize,
        logoPosition,
        showWatermark,
        showSocialHandles,
        socialHandleText,
        showCommentPrompt,
        commentPromptText,
        showDateBadge
      }
    });
    setSuccessToast('ফটো কার্ড স্টুডিওর ডিফল্ট কনফিগারেশন সফলভাবে সংরক্ষিত হয়েছে!');
    setTimeout(() => setSuccessToast(''), 3000);
  };

  // Dynamic outer container wrapper sizing based on card proportion
  const getPreviewWrapperClass = () => {
    const ratio = customWidth / Math.max(1, customHeight);
    if (ratio >= 1.35) return 'w-full max-w-xl mx-auto flex items-center justify-center py-2 px-1';
    if (ratio <= 0.65) return 'w-full max-w-[320px] mx-auto flex items-center justify-center py-2 px-1';
    return 'w-full max-w-md mx-auto flex items-center justify-center py-2 px-1';
  };

  // Aspect Ratio to preview classes (Responsive, scaled container, perfectly proportioned social card)
  const getAspectRatioDimensions = () => {
    return 'w-full transition-all';
  };

  const getContainerCustomStyle = (): React.CSSProperties => {
    const ratio = customWidth / Math.max(1, customHeight);
    const maxDimW = 460;
    const maxDimH = 500;
    let previewW: number;
    let previewH: number;

    if (ratio >= 1) {
      previewW = maxDimW;
      previewH = Math.round(maxDimW / ratio);
      if (previewH > maxDimH) {
        previewH = maxDimH;
        previewW = Math.round(previewH * ratio);
      }
    } else {
      previewH = maxDimH;
      previewW = Math.round(maxDimH * ratio);
      if (previewW > maxDimW) {
        previewW = maxDimW;
        previewH = Math.round(previewW / ratio);
      }
    }

    return { 
      width: `${previewW}px`, 
      height: `${previewH}px`,
      maxWidth: '100%',
      aspectRatio: `${customWidth} / ${customHeight}`,
      WebkitFontSmoothing: 'antialiased',
      MozOsxFontSmoothing: 'grayscale',
      textRendering: 'optimizeLegibility',
    };
  };

  // Professional Photo Card Templates
  const templateList = [
    {
      id: 'pro_news_gradient',
      name: '১. প্রো নিউজ গ্রেডিয়েন্ট (RTV / DBC Style)',
      subtitle: 'গাঢ় নীল/লাল গ্রেডিয়েন্ট, গোল্ডেন ফ্রেম ও সোশ্যাল হ্যান্ডেল',
      badge: 'জনপ্রিয় সোশ্যাল ডিজাইন',
      accent: '#38bdf8',
      icon: Sparkles
    },
    {
      id: 'broadsheet_modern',
      name: '২. ব্ৰডশিট মডার্ন (Kalbela / Amar Desh)',
      subtitle: 'টপ ব্যানার ব্র্যান্ডিং, লাল হাই-কন্ট্রাস্ট হেডলাইন ও ১:১ শেয়ারিং',
      badge: 'শীর্ষ পত্রিকা স্টাইল',
      accent: '#dc2626',
      icon: Layers
    },
    {
      id: 'breaking_flash',
      name: '৩. ব্রেকিং ফ্লাশ (Breaking News BD)',
      subtitle: 'জরুরি লাল ফ্ল্যাশ ব্যানার, বোল্ড টাইপোগ্রাফি ও সোশ্যাল বার',
      badge: 'ব্রেকিং নিউজ',
      accent: '#ef4444',
      icon: Flame
    },
    {
      id: 'minimalist_quote',
      name: '৪. মিনিমালিস্ট কোট (DBC Statement)',
      subtitle: 'বক্তব্য ও বিশেষ সাক্ষাৎকারের জন্য মার্জিত ও প্রিমিয়াম লেআউট',
      badge: 'উদ্ধৃতি ও বিবৃতি',
      accent: '#f59e0b',
      icon: Quote
    },
    {
      id: 'somoy_split',
      name: '৫. সময় ও যমুনা স্প্লিট (Somoy / Jamuna TV)',
      subtitle: 'টিভি নিউজ স্ক্রিনশট, বোল্ড লাল কিঙ্কার বার ও লাইভ ব্রডকাস্ট ব্যাজ',
      badge: 'টিভি নিউজ স্টাইল',
      accent: '#ef4444',
      icon: Tv
    },
    {
      id: 'editorial_broadsheet',
      name: '৬. সম্পাদকীয় ব্রডশিট (Prothom Alo / Jugantor)',
      subtitle: 'ঐতিহ্যবাহী নিউজপ্রিন্ট বর্ডার, অফ-হোয়াইট ব্যাকগ্রাউন্ড ও প্রেস ক্রেডিট',
      badge: 'সম্পাদকীয় প্রিন্ট',
      accent: '#1e293b',
      icon: Newspaper
    },
    {
      id: 'viral_spotlight',
      name: '৭. ভাইরাল সোশ্যাল স্পটলাইট (Social Viral)',
      subtitle: 'ডিপ অবসিডিয়ান ডার্ক ব্যাকগ্রাউন্ড, নিয়ন গ্রেডিয়েন্ট ও দ্রুত সোশ্যাল এঙ্গেজমেন্ট',
      badge: 'ভাইরাল ট্রেন্ডিং',
      accent: '#38bdf8',
      icon: Zap
    },
    {
      id: 'custom_template',
      name: '৮. কাস্টম ফ্রেম আপলোড (Custom Frame)',
      subtitle: 'নিজস্ব ডিজাইনের PNG/JPEG ব্র্যান্ডিং ফ্রেম ও ওভারলে',
      badge: customBackgroundTemplate ? 'ফ্রেম সক্রিয়' : 'ফ্রেম আপলোড',
      accent: '#8b5cf6',
      icon: Upload
    },
  ];

  // Filtered published news for quick selection
  const filteredPublishedList = useMemo(() => {
    if (!newsSearchTerm.trim()) return publishedArticles.slice(0, 15);
    const term = newsSearchTerm.toLowerCase();
    return publishedArticles.filter(a => 
      a.title.toLowerCase().includes(term) || 
      (a.category && a.category.toLowerCase().includes(term))
    ).slice(0, 15);
  }, [publishedArticles, newsSearchTerm]);

  return (
    <div className={`space-y-6 ${darkMode ? 'text-white' : 'text-slate-900'}`}>
      
      {/* TOASTS */}
      {successToast && (
        <div className="fixed top-5 right-5 z-50 flex items-center gap-2 px-4 py-3 rounded-xl bg-emerald-600 text-white shadow-2xl text-xs font-bold animate-bounce font-solaiman">
          <CheckCircle2 className="w-4 h-4" />
          <span>{successToast}</span>
        </div>
      )}
      {copyToast && (
        <div className="fixed top-5 right-5 z-50 flex items-center gap-2 px-4 py-3 rounded-xl bg-blue-600 text-white shadow-2xl text-xs font-bold animate-pulse font-solaiman">
          <Copy className="w-4 h-4" />
          <span>ফটো কার্ডটি ক্লিপবোর্ডে কপি হয়েছে! সরাসরি পেস্ট করুন।</span>
        </div>
      )}
      {errorToast && (
        <div className="fixed top-5 right-5 z-50 flex items-center gap-2 px-4 py-3 rounded-xl bg-red-600 text-white shadow-2xl text-xs font-bold font-solaiman">
          <AlertCircle className="w-4 h-4" />
          <span>{errorToast}</span>
        </div>
      )}

      {/* HEADER SECTION */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-gradient-to-tr from-red-600 to-rose-700 text-white shadow-md">
              <Sparkles className="w-5 h-5" />
            </span>
            <div>
              <h2 className="text-xl font-bold font-solaiman tracking-tight">
                প্রিমিয়াম সোশ্যাল ফটো কার্ড স্টুডিও ও কন্ট্রোলার
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-solaiman">
                RTV, DBC, কালবেলা ও শীর্ষ টিভি চ্যানেলের মতো অত্যাধুনিক সোশ্যাল মিডিয়া ফটোকার্ড তৈরি করুন।
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          {isAdmin && onUpdateSettings && (
            <button
              onClick={handleSaveDefaultConfig}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-xs cursor-pointer font-solaiman"
              title="বর্তমান লেআউট ও টেমপ্লেটকে সাইটের ডিফল্ট হিসেবে সেভ করুন"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">ডিফল্ট কনফিগ সেভ</span>
            </button>
          )}

          <button
            onClick={handleCopyToClipboard}
            disabled={isGenerating}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-800 text-xs font-bold transition-all disabled:opacity-50 cursor-pointer font-solaiman"
            title="ছবি কপি করে সরাসরি ফেসবুকে পেস্ট করুন"
          >
            <Copy className="w-3.5 h-3.5 text-blue-600" />
            <span className="hidden sm:inline">কপি ইমেজ</span>
          </button>

          <button
            onClick={handleDownloadCard}
            disabled={isGenerating}
            className="flex items-center gap-2 px-5 py-2 rounded-xl bg-gradient-to-r from-red-600 to-rose-700 hover:from-red-700 hover:to-rose-800 text-white text-xs font-bold shadow-md hover:shadow-lg transition-all disabled:opacity-50 cursor-pointer font-solaiman"
          >
            {isGenerating ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>প্রস্তুত হচ্ছে...</span>
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                <span>১-ক্লিক এইচডি ডাউনলোড (PNG)</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* WORKSPACE GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-7 items-start">
        
        {/* LEFT CONFIGURATION PANEL (5 Columns) */}
        <div className="lg:col-span-5 space-y-5 bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          
          {/* ========================================================= */}
          {/* 1. PUBLISHED NEWS SELECTOR (Zero Manual Typing)           */}
          {/* ========================================================= */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center justify-between font-solaiman">
              <span className="flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-red-600" />
                <span>প্রকাশিত সংবাদ নির্বাচন (স্বয়ংক্রিয় ডাটা ফেচিং):</span>
              </span>
              <span className="text-[10px] text-red-600 font-mono font-bold">
                {publishedArticles.length} টি লাইভ সংবাদ
              </span>
            </label>

            {/* Search Box */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="সংবাদের শিরোনাম বা ক্যাটাগরি সার্চ করুন..."
                value={newsSearchTerm}
                onChange={(e) => setNewsSearchTerm(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white outline-none focus:ring-1 focus:ring-red-500 font-solaiman"
              />
            </div>

            {/* Select Dropdown */}
            <select
              value={selectedArticleId}
              onChange={(e) => setSelectedArticleId(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-red-500 outline-none truncate font-solaiman"
            >
              {filteredPublishedList.map((art) => (
                <option key={art.id} value={art.id}>
                  [{art.category}] {art.title}
                </option>
              ))}
            </select>
          </div>

          {/* ========================================================= */}
          {/* 2. 4 PREMIUM SOCIAL MEDIA TEMPLATES & CUSTOM FRAME        */}
          {/* ========================================================= */}
          <div className="space-y-2.5 pt-3 border-t border-slate-200 dark:border-slate-800">
            <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center justify-between font-solaiman">
              <span className="flex items-center gap-1.5">
                <Palette className="w-3.5 h-3.5 text-red-600" />
                <span>প্রিমিয়াম সোশ্যাল টেমপ্লেট নির্বাচন (৪টি অত্যাধুনিক লেআউট):</span>
              </span>
            </label>

            <div className="space-y-2">
              {templateList.map((t) => {
                const isSelected = template === t.id;
                const IconComponent = t.icon;
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => {
                      setTemplate(t.id as CardTemplate);
                      if (t.id === 'custom_template' && !customBackgroundTemplate) {
                        templateFileInputRef.current?.click();
                      }
                    }}
                    className={`w-full p-3 rounded-xl border text-left transition-all flex items-center justify-between gap-3 cursor-pointer ${
                      isSelected
                        ? 'border-red-600 bg-red-50/70 dark:bg-red-950/30 ring-1 ring-red-600 shadow-xs'
                        : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-transparent'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className={`p-2 rounded-lg shrink-0 ${isSelected ? 'bg-red-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'}`}>
                        <IconComponent className="w-4 h-4" />
                      </span>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-xs font-solaiman truncate text-slate-900 dark:text-white">
                            {t.name}
                          </h4>
                          <span className="text-[9px] px-1.5 py-0.2 rounded font-bold font-solaiman bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                            {t.badge}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate font-solaiman mt-0.5">
                          {t.subtitle}
                        </p>
                      </div>
                    </div>
                    {isSelected && (
                      <CheckCircle2 className="w-4 h-4 text-red-600 shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* ========================================================= */}
          {/* FUNCTIONAL CUSTOM FRAME / OVERLAY UPLOADER (Requirement 2) */}
          {/* ========================================================= */}
          <div className={`p-4 rounded-xl border transition-all ${
            template === 'custom_template' || customBackgroundTemplate
              ? 'border-purple-500/50 bg-purple-50/20 dark:bg-purple-950/20'
              : 'border-slate-200 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-800/20'
          }`}>
            <input
              type="file"
              ref={templateFileInputRef}
              onChange={handleCustomTemplateUpload}
              accept="image/png, image/jpeg, image/webp"
              className="hidden"
            />

            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5 font-solaiman">
                <Upload className="w-3.5 h-3.5 text-purple-600" />
                <span>কাস্টম ফ্রেম ও ব্র্যান্ড ওভারলে আপলোডার:</span>
              </span>
              {customBackgroundTemplate && (
                <span className="text-[10px] px-2 py-0.5 rounded font-bold bg-purple-600 text-white font-solaiman flex items-center gap-1">
                  <Check className="w-3 h-3" /> ফ্রেম সক্রিয়
                </span>
              )}
            </div>

            {/* Drag & Drop Zone */}
            <div
              onDragOver={(e) => { e.preventDefault(); setDragOverFrame(true); }}
              onDragLeave={() => setDragOverFrame(false)}
              onDrop={(e) => {
                e.preventDefault();
                setDragOverFrame(false);
                if (e.dataTransfer.files?.[0]) {
                  processUploadedFrameFile(e.dataTransfer.files[0]);
                }
              }}
              onClick={() => templateFileInputRef.current?.click()}
              className={`p-4 rounded-xl border-2 border-dashed text-center cursor-pointer transition-all ${
                dragOverFrame
                  ? 'border-purple-600 bg-purple-100/50 dark:bg-purple-950/50'
                  : customBackgroundTemplate
                  ? 'border-purple-400 bg-purple-50/30 dark:bg-purple-950/30'
                  : 'border-slate-300 dark:border-slate-700 hover:border-purple-500 bg-white dark:bg-slate-800/40'
              }`}
            >
              {customBackgroundTemplate ? (
                <div className="flex items-center justify-between gap-3 text-left">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <img 
                      src={customBackgroundTemplate} 
                      alt="Uploaded frame thumbnail" 
                      className="w-12 h-12 object-contain rounded border border-purple-300 dark:border-purple-700 bg-slate-900 shrink-0" 
                    />
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-slate-900 dark:text-white truncate font-solaiman">
                        {customTemplateName || 'কাস্টম ফ্রেম/ওভারলে'}
                      </div>
                      <div className="text-[10px] text-purple-600 dark:text-purple-400 font-solaiman">
                        লাইভ ক্যানভাসে অবিলম্বে রেন্ডার হচ্ছে
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0" onClick={(e) => e.stopPropagation()}>
                    <button
                      type="button"
                      onClick={() => templateFileInputRef.current?.click()}
                      className="px-2 py-1 rounded bg-purple-600 hover:bg-purple-700 text-white text-[10px] font-bold font-solaiman cursor-pointer"
                    >
                      পরিবর্তন
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setCustomBackgroundTemplate(null);
                        setCustomTemplateName('');
                        if (template === 'custom_template') {
                          setTemplate('pro_news_gradient');
                        }
                      }}
                      className="p-1 rounded text-red-500 hover:bg-red-50 dark:hover:bg-red-950/50 cursor-pointer"
                      title="ফ্রেম মুছে ফেলুন"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-1">
                  <FileImage className="w-6 h-6 mx-auto text-purple-600 dark:text-purple-400 mb-1" />
                  <div className="text-xs font-bold font-solaiman text-slate-800 dark:text-slate-200">
                    কাস্টম PNG/JPEG ফ্রেম বা ব্র্যান্ড ওভারলে ড্রপ করুন অথবা ক্লিক করুন
                  </div>
                  <div className="text-[10px] text-slate-500 dark:text-slate-400 font-solaiman">
                    স্বচ্ছ PNG ওভারলে ফ্রেম বা ফটোকার্ড ব্যাকগ্রাউন্ড টেমপ্লেট (সর্বোচ্চ ১৫ MB)
                  </div>
                </div>
              )}
            </div>

            {/* Custom Frame Rendering Mode Controls */}
            {customBackgroundTemplate && (
              <div className="mt-3 pt-2.5 border-t border-purple-200 dark:border-purple-900 space-y-2 text-xs font-solaiman">
                <div className="flex items-center justify-between">
                  <span className="text-slate-700 dark:text-slate-300">ফ্রেম রেন্ডার স্টাইল:</span>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => setCustomFrameMode('overlay')}
                      className={`px-2 py-0.5 rounded text-[10px] font-bold transition-colors cursor-pointer ${
                        customFrameMode === 'overlay'
                          ? 'bg-purple-600 text-white'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      স্বচ্ছ ওভারলে (Overlay)
                    </button>
                    <button
                      type="button"
                      onClick={() => setCustomFrameMode('background')}
                      className={`px-2 py-0.5 rounded text-[10px] font-bold transition-colors cursor-pointer ${
                        customFrameMode === 'background'
                          ? 'bg-purple-600 text-white'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      ব্যাকগ্রাউন্ড ফ্রেম
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <span className="text-slate-700 dark:text-slate-300">সব টেমপ্লেটে ওভারলে প্রযোজ্য:</span>
                  <input
                    type="checkbox"
                    checked={enableFrameOverlay}
                    onChange={(e) => setEnableFrameOverlay(e.target.checked)}
                    className="w-4 h-4 accent-purple-600 rounded cursor-pointer"
                  />
                </div>
              </div>
            )}
          </div>

          {/* ========================================================= */}
          {/* 3. DYNAMIC HEADLINE & CONTENT EDITOR                      */}
          {/* ========================================================= */}
          <div className="space-y-3 pt-3 border-t border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5 font-solaiman">
                <Type className="w-3.5 h-3.5 text-red-600" />
                <span>ডায়নামিক হেডলাইন ও টেক্সট এডিটর:</span>
              </label>
              <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold font-solaiman">
                লাইভ এডিটেবল
              </span>
            </div>

            {/* Editable Headline */}
            <div>
              <span className="block text-[11px] font-bold text-slate-500 mb-1 font-solaiman">
                মূল শিরোনাম (Headline):
              </span>
              <textarea
                value={headline}
                onChange={(e) => setHeadline(e.target.value)}
                rows={2}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-solaiman font-bold focus:ring-2 focus:ring-red-500 outline-none resize-none leading-snug"
                placeholder="শিরোনাম লিখুন..."
              />
            </div>

            {/* Kicker / Subheadline */}
            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <span className="block text-[11px] font-bold text-slate-500 mb-1 font-solaiman">
                  কিকার / টপ ট্যাগ:
                </span>
                <input
                  type="text"
                  value={kicker}
                  onChange={(e) => setKicker(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-solaiman outline-none"
                  placeholder="যেমন: বিশেষ প্রতিবেদন"
                />
              </div>

              <div>
                <span className="block text-[11px] font-bold text-slate-500 mb-1 font-solaiman">
                  ফন্ট সাইজ ({headlineFontSize}px):
                </span>
                <input
                  type="range"
                  min={20}
                  max={52}
                  value={headlineFontSize}
                  onChange={(e) => setHeadlineFontSize(Number(e.target.value))}
                  className="w-full accent-red-600 mt-2"
                />
              </div>
            </div>

            {/* Line Spacing & Text Alignment Controls */}
            <div className="grid grid-cols-2 gap-2.5 pt-1">
              <div>
                <span className="block text-[10px] font-bold text-slate-500 mb-1 font-solaiman">
                  লাইন স্পেসিং:
                </span>
                <div className="flex items-center gap-1">
                  {[
                    { label: 'কম', val: 1.25 },
                    { label: 'স্বাভাবিক', val: 1.35 },
                    { label: 'প্রশস্ত', val: 1.5 }
                  ].map((s) => (
                    <button
                      key={s.val}
                      type="button"
                      onClick={() => setHeadlineLineHeight(s.val)}
                      className={`flex-1 py-1 rounded text-[10px] font-bold font-solaiman transition-colors cursor-pointer ${
                        headlineLineHeight === s.val
                          ? 'bg-red-600 text-white'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                      }`}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <span className="block text-[10px] font-bold text-slate-500 mb-1 font-solaiman">
                  টেক্সট অ্যালাইনমেন্ট:
                </span>
                <div className="flex items-center gap-1">
                  {[
                    { align: 'left', icon: AlignLeft },
                    { align: 'center', icon: AlignCenter },
                    { align: 'right', icon: AlignRight }
                  ].map(({ align, icon: Icon }) => (
                    <button
                      key={align}
                      type="button"
                      onClick={() => setHeadlineAlignment(align as any)}
                      className={`flex-1 py-1 rounded flex items-center justify-center transition-colors cursor-pointer ${
                        headlineAlignment === align
                          ? 'bg-red-600 text-white'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* ========================================================= */}
          {/* 4. BACKGROUND & GRADIENT COLOR PICKER                     */}
          {/* ========================================================= */}
          <div className="space-y-2.5 pt-3 border-t border-slate-200 dark:border-slate-800">
            <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center justify-between font-solaiman">
              <span className="flex items-center gap-1.5">
                <Palette className="w-3.5 h-3.5 text-red-600" />
                <span>ব্যাকগ্রাউন্ড গ্রেডিয়েন্ট ও কালার প্যালেট:</span>
              </span>
            </label>

            {/* Gradient Swatches */}
            <div className="grid grid-cols-4 gap-2">
              {gradientPresets.slice(0, 7).map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setBackgroundTheme(p.id)}
                  style={{ background: p.bg }}
                  className={`h-9 rounded-lg transition-all relative overflow-hidden border ${
                    backgroundTheme === p.id 
                      ? 'ring-2 ring-offset-2 ring-red-500 scale-105 border-white' 
                      : 'border-slate-300 dark:border-slate-700 opacity-80 hover:opacity-100'
                  }`}
                  title={p.label}
                >
                  {backgroundTheme === p.id && (
                    <span className="absolute inset-0 flex items-center justify-center">
                      <Check className="w-3.5 h-3.5 text-white drop-shadow-md" />
                    </span>
                  )}
                </button>
              ))}

              {/* Custom Color Input */}
              <div className="relative h-9 rounded-lg border border-slate-300 dark:border-slate-700 overflow-hidden flex items-center justify-center bg-slate-100 dark:bg-slate-800">
                <input
                  type="color"
                  value={customColor}
                  onChange={(e) => {
                    setCustomColor(e.target.value);
                    setBackgroundTheme('custom_picker');
                  }}
                  className="w-full h-full opacity-0 cursor-pointer absolute inset-0"
                  title="কাস্টম কালার নির্বাচন করুন"
                />
                <span className="text-[10px] font-bold font-solaiman text-slate-700 dark:text-slate-200 pointer-events-none">
                  কাস্টম
                </span>
              </div>
            </div>

            {/* Photo Frame Border Style */}
            <div className="pt-2 flex items-center justify-between text-xs font-solaiman">
              <span className="text-slate-700 dark:text-slate-300">ইমেজ ফ্রেম বর্ডার স্টাইল:</span>
              <div className="flex items-center gap-1.5">
                {[
                  { id: 'gold', label: 'গোল্ডেন', color: '#f59e0b' },
                  { id: 'white', label: 'সাদা', color: '#ffffff' },
                  { id: 'red', label: 'লাল', color: '#dc2626' },
                  { id: 'none', label: 'বর্ডারহীন', color: 'transparent' }
                ].map((b) => (
                  <button
                    key={b.id}
                    type="button"
                    onClick={() => setFrameBorderColor(b.id as any)}
                    className={`px-2 py-0.5 rounded text-[10px] font-bold transition-all cursor-pointer border ${
                      frameBorderColor === b.id
                        ? 'bg-slate-900 text-white border-slate-900 dark:bg-white dark:text-slate-900'
                        : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    {b.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* ========================================================= */}
          {/* 5. WATERMARK, LOGO & SOCIAL CONTROLS                      */}
          {/* ========================================================= */}
          <div className="space-y-3 pt-3 border-t border-slate-200 dark:border-slate-800 text-xs font-solaiman">
            <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
              <Sliders className="w-3.5 h-3.5 text-red-600" />
              <span>ব্র্যান্ডিং, লোগো ও সোশ্যাল হ্যান্ডেল কন্ট্রোলার:</span>
            </label>

            {/* Watermark Logo Toggle & Sizing */}
            <div className="flex items-center justify-between">
              <span className="text-slate-700 dark:text-slate-300">লোগো ও ওয়াটারমার্ক প্রদর্শন:</span>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={showWatermark}
                  onChange={(e) => setShowWatermark(e.target.checked)}
                  className="w-4 h-4 accent-red-600 rounded cursor-pointer"
                />
                {showWatermark && (
                  <select
                    value={logoSize}
                    onChange={(e) => setLogoSize(e.target.value as any)}
                    className="px-2 py-0.5 text-[10px] rounded border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  >
                    <option value="sm">ছোট লোগো</option>
                    <option value="md">মাঝারি লোগো</option>
                    <option value="lg">বড় লোগো</option>
                  </select>
                )}
              </div>
            </div>

            {/* Social Handles Toggle & Input */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-slate-700 dark:text-slate-300">সোশ্যাল মিডিয়া হ্যান্ডেল:</span>
                <input
                  type="checkbox"
                  checked={showSocialHandles}
                  onChange={(e) => setShowSocialHandles(e.target.checked)}
                  className="w-4 h-4 accent-red-600 rounded cursor-pointer"
                />
              </div>
              {showSocialHandles && (
                <input
                  type="text"
                  value={socialHandleText}
                  onChange={(e) => setSocialHandleText(e.target.value)}
                  className="w-full px-2.5 py-1 text-xs rounded border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-mono"
                  placeholder="@facebook / @youtube"
                />
              )}
            </div>

            {/* Details in comments prompt */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-slate-700 dark:text-slate-300">"বিস্তারিত কমেন্টে" রিবন:</span>
                <input
                  type="checkbox"
                  checked={showCommentPrompt}
                  onChange={(e) => setShowCommentPrompt(e.target.checked)}
                  className="w-4 h-4 accent-red-600 rounded cursor-pointer"
                />
              </div>
              {showCommentPrompt && (
                <input
                  type="text"
                  value={commentPromptText}
                  onChange={(e) => setCommentPromptText(e.target.value)}
                  className="w-full px-2.5 py-1 text-xs rounded border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              )}
            </div>

            {/* Date Badge Toggle */}
            <div className="flex items-center justify-between">
              <span className="text-slate-700 dark:text-slate-300">তারিখ ব্যাজ প্রদর্শন ({rawDateStr}):</span>
              <input
                type="checkbox"
                checked={showDateBadge}
                onChange={(e) => setShowDateBadge(e.target.checked)}
                className="w-4 h-4 accent-red-600 rounded cursor-pointer"
              />
            </div>
          </div>

          {/* ========================================================= */}
          {/* 6. ASPECT RATIO & DYNAMIC CUSTOM SIZE CONTROLLER          */}
          {/* ========================================================= */}
          <div className="pt-3 border-t border-slate-200 dark:border-slate-800 space-y-3 font-solaiman">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                <Ratio className="w-3.5 h-3.5 text-red-600" />
                <span>কার্ড রেশিও ও ডাইমেনশন কন্ট্রোলার:</span>
              </label>
              <span className="text-[10px] font-mono font-bold text-red-600 dark:text-red-400">
                {customWidth} × {customHeight} px
              </span>
            </div>

            {/* Platform Presets Row */}
            <div className="grid grid-cols-5 gap-1.5">
              {[
                { id: '1:1', label: '১:১', sub: 'স্কয়ার', w: 1080, h: 1080 },
                { id: '4:5', label: '৪:৫', sub: 'পোর্ট্রেট', w: 1080, h: 1350 },
                { id: '16:9', label: '১৬:৯', sub: 'ওয়াইড', w: 1920, h: 1080 },
                { id: '9:16', label: '৯:১৬', sub: 'স্টোরি', w: 1080, h: 1920 },
                { id: 'custom', label: 'কাস্টম', sub: 'সাইজ', w: customWidth, h: customHeight }
              ].map((r) => {
                const isSelected = aspectRatio === r.id;
                return (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => {
                      if (r.id === 'custom') {
                        setAspectRatio('custom');
                      } else {
                        handleApplyPresetDimension(r.w, r.h, r.id as CardAspectRatio);
                      }
                    }}
                    className={`p-1.5 rounded-xl border text-center transition-all cursor-pointer ${
                      isSelected
                        ? 'border-red-600 bg-red-50/70 dark:bg-red-950/40 text-red-600 font-bold shadow-xs'
                        : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300'
                    }`}
                  >
                    <div className="text-xs font-mono font-bold">{r.label}</div>
                    <div className="text-[9px] opacity-80">{r.sub}</div>
                  </button>
                );
              })}
            </div>

            {/* Custom Sizing Panel (Interactive Width & Height Steppers and Sliders) */}
            <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-800/40 space-y-3">
              <div className="flex items-center justify-between border-b border-slate-200/80 dark:border-slate-700/80 pb-2">
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                  <Sliders className="w-3.5 h-3.5 text-blue-600" />
                  <span>কাস্টম প্রস্থ ও উচ্চতা (Custom Canvas Size):</span>
                </span>
                
                <div className="flex items-center gap-1">
                  {/* Aspect Ratio Lock Button */}
                  <button
                    type="button"
                    onClick={() => setIsRatioLocked(!isRatioLocked)}
                    className={`px-2 py-1 rounded text-[10px] font-bold flex items-center gap-1 transition-colors cursor-pointer ${
                      isRatioLocked
                        ? 'bg-red-600 text-white'
                        : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-300'
                    }`}
                    title={isRatioLocked ? 'অনুপাত লক করা আছে' : 'অনুপাত আনলক করুন'}
                  >
                    {isRatioLocked ? <Lock className="w-3 h-3" /> : <Unlock className="w-3 h-3" />}
                    <span>{isRatioLocked ? 'লকড' : 'আনলক'}</span>
                  </button>

                  {/* Swap Dimensions Button */}
                  <button
                    type="button"
                    onClick={handleSwapDimensions}
                    className="p-1 rounded text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 cursor-pointer"
                    title="প্রস্থ ও উচ্চতা অদলবদল করুন (Swap Dimensions)"
                  >
                    <ArrowLeftRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Width & Height Number Inputs & Range Sliders */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                {/* Width Controller */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-slate-600 dark:text-slate-400">
                      প্রস্থ (Width):
                    </span>
                    <span className="font-mono text-slate-900 dark:text-white font-bold text-[11px]">
                      {customWidth}px
                    </span>
                  </div>
                  <input
                    type="number"
                    min={300}
                    max={3840}
                    step={10}
                    value={customWidth}
                    onChange={(e) => handleWidthChange(Number(e.target.value))}
                    className="w-full px-2 py-1 text-xs font-mono rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white outline-none focus:border-red-500"
                  />
                  <input
                    type="range"
                    min={400}
                    max={2560}
                    step={20}
                    value={customWidth}
                    onChange={(e) => handleWidthChange(Number(e.target.value))}
                    className="w-full accent-red-600"
                  />
                </div>

                {/* Height Controller */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-slate-600 dark:text-slate-400">
                      উচ্চতা (Height):
                    </span>
                    <span className="font-mono text-slate-900 dark:text-white font-bold text-[11px]">
                      {customHeight}px
                    </span>
                  </div>
                  <input
                    type="number"
                    min={300}
                    max={3840}
                    step={10}
                    value={customHeight}
                    onChange={(e) => handleHeightChange(Number(e.target.value))}
                    className="w-full px-2 py-1 text-xs font-mono rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white outline-none focus:border-red-500"
                  />
                  <input
                    type="range"
                    min={400}
                    max={2560}
                    step={20}
                    value={customHeight}
                    onChange={(e) => handleHeightChange(Number(e.target.value))}
                    className="w-full accent-red-600"
                  />
                </div>
              </div>

              {/* Quick Popular Resolution Presets */}
              <div className="pt-2 border-t border-slate-200/70 dark:border-slate-700/70 space-y-1.5">
                <span className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider font-mono">
                  জনপ্রিয় সোশ্যাল মিডিয়া রেজোলিউশন (১-ক্লিক প্রিসেট):
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    { label: '১২০০×৬৩০ (FB Share)', w: 1200, h: 630 },
                    { label: '১০৮০×১০৮০ (Instagram)', w: 1080, h: 1080 },
                    { label: '১০৮০×১৩৫০ (৪:৫ Feed)', w: 1080, h: 1350 },
                    { label: '১২৮০×৭২০ (HD 720p)', w: 1280, h: 720 },
                    { label: '১৯২০×১০৮০ (Full HD)', w: 1920, h: 1080 },
                    { label: '১০৮০×১৯২০ (Stories)', w: 1080, h: 1920 },
                    { label: '৮০০×৮০০ (Web Card)', w: 800, h: 800 },
                  ].map((p) => {
                    const isActive = customWidth === p.w && customHeight === p.h;
                    return (
                      <button
                        key={p.label}
                        type="button"
                        onClick={() => handleApplyPresetDimension(p.w, p.h)}
                        className={`px-2 py-1 rounded-md text-[10px] font-mono font-bold transition-all cursor-pointer ${
                          isActive
                            ? 'bg-blue-600 text-white shadow-2xs'
                            : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:border-blue-400'
                        }`}
                      >
                        {p.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* RIGHT PREVIEW CANVAS (7 Columns) */}
        <div className="lg:col-span-7 flex flex-col items-center">
          
          <div className="w-full flex items-center justify-between mb-3 text-xs text-slate-500 dark:text-slate-400 font-solaiman">
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-700 dark:text-slate-300">লাইভ ফটো কার্ড প্রিভিউ:</span>
              <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold">
                {aspectRatio === 'custom' ? `কাস্টম: ${customWidth}×${customHeight}px` : `${aspectRatio} (${customWidth}×${customHeight}px)`}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-sky-700 dark:text-sky-300 font-bold bg-sky-50 dark:bg-sky-950/60 px-2 py-0.5 rounded border border-sky-200 dark:border-sky-800 hidden sm:inline">
                রেসপনসিভ স্কেলিং (১০০% নিখুঁত রেন্ডারিং)
              </span>
              <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                রেডি ফর সোশ্যাল শেয়ারিং
              </span>
            </div>
          </div>

          {/* Card Frame Outer Container — Controlled, Centered Max-Width Wrapper with Vertical Padding & overflow-y-auto */}
          <div className="w-full max-h-[75vh] overflow-y-auto p-3 sm:p-5 bg-slate-100 dark:bg-slate-950/80 rounded-2xl border border-slate-300 dark:border-slate-800 shadow-inner flex items-center justify-center">
            
            <div className={getPreviewWrapperClass()}>
              {/* CAPTURED DOM NODE */}
              <div
                ref={cardPreviewRef}
                id="photo-card-render-node"
                className={`relative overflow-hidden w-full object-contain rounded-xl shadow-2xl transition-all select-none mx-auto ${getAspectRatioDimensions()}`}
                style={{
                  fontFamily: "'SolaimanLipi', 'Kalpurush', 'Noto Sans Bengali', system-ui, sans-serif",
                  fontFeatureSettings: '"kern" 1, "liga" 1, "calt" 1, "locl" 1',
                  fontVariantLigatures: 'normal',
                  textRendering: 'optimizeLegibility',
                  ...getContainerCustomStyle(),
                }}
              >
              
              {/* ========================================================= */}
              {/* TEMPLATE 1: PRO NEWS GRADIENT (RTV / DBC STYLE)           */}
              {/* ========================================================= */}
              {(template === 'pro_news_gradient' || template === 'viral_dark' || template === 'cinematic_overlay') && (
                <div 
                  className="w-full h-full relative overflow-hidden flex flex-col justify-between p-5 sm:p-6"
                  style={{
                    background: currentTheme.id === 'custom_picker' 
                      ? customColor 
                      : (currentTheme.id === 'broadsheet_white' 
                          ? 'linear-gradient(145deg, #061121 0%, #0c203b 50%, #1e3a8a 100%)' 
                          : currentTheme.bg)
                  }}
                >
                  {/* Subtle Newsprint Watermark Texture Backdrop */}
                  <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />

                  {/* Top Bar: Symmetric Logo Shape / Container Box on left & Date Badge on right (Requirement 1) */}
                  <div className="relative z-10 flex items-center justify-between pb-3">
                    {showWatermark ? (
                      <div className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-white text-slate-900 shadow-lg border border-white/40">
                        {siteLogoToUse ? (
                          <img 
                            src={siteLogoToUse} 
                            alt={brandTitle} 
                            crossOrigin="anonymous"
                            className={`${getLogoClass()} object-contain max-h-5 sm:max-h-6`} 
                          />
                        ) : (
                          <div className="flex items-center gap-1.5">
                            <span className="w-2.5 h-2.5 rounded-full bg-red-600 animate-pulse" />
                            <span className="font-solaiman font-black text-xs sm:text-sm text-red-700 tracking-tight">{brandTitle}</span>
                          </div>
                        )}
                      </div>
                    ) : <div />}

                    {showDateBadge && (
                      <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-white text-slate-900 font-solaiman font-bold text-xs shadow-lg border border-white/40">
                        <Calendar className="w-3.5 h-3.5 text-red-600 shrink-0" />
                        <span>{rawDateStr}</span>
                      </div>
                    )}
                  </div>

                  {/* Central Photo Frame with Accent Border */}
                  <div className="relative z-10 flex-1 my-2 flex items-center justify-center min-h-[70px]">
                    <div className={`relative w-full h-full rounded-2xl overflow-hidden ${getFrameBorderClass()}`}>
                      <img
                        src={effectiveImageUrl}
                        alt={headline}
                        crossOrigin="anonymous"
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover"
                      />

                      {/* Source or Kicker Tag Overlay on Image */}
                      {kicker && (
                        <div className="absolute top-2.5 left-2.5 px-2.5 py-0.5 rounded-full bg-black/75 backdrop-blur-md border border-white/20 text-amber-300 font-solaiman text-[11px] font-bold shadow-md">
                          {kicker}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Headline Area */}
                  <div className="relative z-10 mt-2 mb-1 px-1">
                    <h3 
                      className={`font-black text-white font-solaiman drop-shadow-md line-clamp-3 text-${headlineAlignment}`}
                      style={{ 
                        fontSize: `${headlineFontSize}px`,
                        lineHeight: headlineLineHeight,
                        wordBreak: 'break-word',
                        overflowWrap: 'break-word',
                        paddingTop: '2px',
                        paddingBottom: '4px',
                      }}
                    >
                      {headline}
                    </h3>
                  </div>

                  {/* Comment Prompt / Read More Pill */}
                  {showCommentPrompt && (
                    <div className="relative z-10 flex items-center justify-center py-1">
                      <span className="text-amber-300 font-solaiman text-xs font-bold tracking-wide drop-shadow-xs flex items-center gap-1">
                        <MessageSquare className="w-3 h-3" />
                        <span>{commentPromptText}</span>
                      </span>
                    </div>
                  )}

                  {/* Bottom Footer: Website, Slogan & Socials */}
                  <div className="relative z-10 pt-2.5 border-t border-white/20 flex items-center justify-between text-xs text-white/90">
                    <div className="flex items-center gap-2">
                      <Globe className="w-3.5 h-3.5 text-amber-300 shrink-0" />
                      <span className="font-mono text-[11px] font-bold tracking-wider">{brandDomain}</span>
                      <span className="text-white/40">•</span>
                      <span className="text-[11px] text-white/80 font-solaiman hidden sm:inline">আজ এবং আগামীর</span>
                    </div>

                    {showSocialHandles && (
                      <div className="flex items-center gap-1.5 font-mono text-[10px] text-white/80 bg-black/40 px-2 py-0.5 rounded-full border border-white/10">
                        <Share2 className="w-3 h-3 text-red-400" />
                        <span>{socialHandleText}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* ========================================================= */}
              {/* TEMPLATE 2: BROADSHEET MODERN (KALBELA / AMAR DESH)       */}
              {/* ========================================================= */}
              {(template === 'broadsheet_modern' || template === 'classic_prothom' || template === 'minimal_swiss') && (
                <div className="w-full h-full relative overflow-hidden flex flex-col justify-between bg-white text-slate-900 border-4 border-slate-900">
                  
                  {/* Top Clean Masthead Bar with Symmetric Shape Box */}
                  <div className="p-3.5 sm:p-4 bg-[#faf9f6] border-b-2 border-slate-900 flex items-center justify-between">
                    {showWatermark ? (
                      <div className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-white shadow-md border border-slate-200">
                        {siteLogoToUse ? (
                          <img 
                            src={siteLogoToUse} 
                            alt={brandTitle} 
                            crossOrigin="anonymous"
                            className={`${getLogoClass()} object-contain max-h-5 sm:max-h-6`} 
                          />
                        ) : (
                          <div className="flex items-center gap-1.5">
                            <span className="w-2.5 h-2.5 rounded-full bg-red-600" />
                            <span className="text-sm font-black font-solaiman text-red-700 tracking-tight">{brandTitle}</span>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="text-lg font-black font-solaiman text-red-700">
                        {brandTitle}
                      </div>
                    )}

                    {showDateBadge && (
                      <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-white shadow-md border border-slate-200 text-slate-900 font-solaiman font-bold text-xs">
                        <Calendar className="w-3.5 h-3.5 text-red-600 shrink-0" />
                        <span>{rawDateStr}</span>
                      </div>
                    )}
                  </div>

                  {/* Centered Photo Frame */}
                  <div className="flex-1 p-3 sm:p-4 bg-slate-50 flex items-center justify-center min-h-[70px]">
                    <div className="relative w-full h-full rounded-xl overflow-hidden border-2 border-slate-300 shadow-md">
                      <img
                        src={effectiveImageUrl}
                        alt={headline}
                        crossOrigin="anonymous"
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover"
                      />
                      {showWatermark && (
                        <div className="absolute bottom-2 right-2 px-2.5 py-1 rounded bg-black/80 text-white text-[10px] font-bold font-solaiman backdrop-blur-xs">
                          {brandTitle}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* High Contrast Red / Dark Headline Box */}
                  <div className="p-4 sm:p-5 bg-gradient-to-r from-red-700 via-red-800 to-rose-900 text-white">
                    {kicker && (
                      <span className="inline-block text-[11px] font-bold font-solaiman px-2 py-0.5 rounded bg-black/40 text-amber-300 mb-1.5 border border-white/20">
                        {kicker}
                      </span>
                    )}
                    <h3 
                      className={`font-black font-solaiman drop-shadow-md line-clamp-3 text-${headlineAlignment}`}
                      style={{ 
                        fontSize: `${headlineFontSize}px`,
                        lineHeight: headlineLineHeight,
                        wordBreak: 'break-word',
                        overflowWrap: 'break-word',
                        paddingTop: '2px',
                        paddingBottom: '4px',
                      }}
                    >
                      {headline}
                    </h3>
                  </div>

                  {/* Bottom Broadsheet Footer Ribbon */}
                  <div className="px-4 py-2 bg-slate-900 text-white flex items-center justify-between text-xs font-solaiman">
                    <span className="font-bold flex items-center gap-1.5 text-amber-300">
                      <CheckCheck className="w-3.5 h-3.5" />
                      <span>{commentPromptText}</span>
                    </span>
                    <span className="font-mono text-[11px] text-slate-300">
                      {brandDomain}
                    </span>
                  </div>
                </div>
              )}

              {/* ========================================================= */}
              {/* TEMPLATE 3: BREAKING FLASH (BREAKING NEWS BD STYLE)       */}
              {/* ========================================================= */}
              {(template === 'breaking_flash' || template === 'breaking_live') && (
                <div className="w-full h-full relative overflow-hidden flex flex-col justify-between bg-[#120305] text-white p-4 sm:p-5 border-4 border-red-600">
                  
                  {/* Top Flash Header: Symmetric Shape Box on left & BREAKING NEWS on right */}
                  <div className="flex items-center justify-between pb-2.5">
                    {showWatermark ? (
                      <div className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-white text-slate-900 shadow-md border border-white/30">
                        {siteLogoToUse ? (
                          <img 
                            src={siteLogoToUse} 
                            alt={brandTitle} 
                            crossOrigin="anonymous"
                            className={`${getLogoClass()} object-contain max-h-5 sm:max-h-6`} 
                          />
                        ) : (
                          <div className="flex items-center gap-1.5">
                            <span className="w-2.5 h-2.5 rounded-full bg-red-600 animate-ping" />
                            <span className="font-solaiman font-black text-xs text-red-600">{brandTitle}</span>
                          </div>
                        )}
                      </div>
                    ) : (
                      showDateBadge ? (
                        <div className="px-3 py-1.5 rounded-md bg-red-600 text-white font-solaiman font-bold text-xs shadow-md flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5" />
                          <span>{rawDateStr}</span>
                        </div>
                      ) : <div />
                    )}

                    <div className="flex items-center gap-1.5">
                      {showDateBadge && showWatermark && (
                        <div className="px-2.5 py-1.5 rounded-md bg-red-600 text-white font-solaiman font-bold text-xs shadow-md hidden sm:flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          <span>{rawDateStr}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-white text-red-600 font-black font-mono text-xs shadow-md">
                        <span className="w-2 h-2 rounded-full bg-red-600 animate-ping" />
                        <span>BREAKING NEWS</span>
                        <span className="px-1 py-0.2 rounded bg-red-600 text-white text-[9px]">LIVE</span>
                      </div>
                    </div>
                  </div>

                  {/* Central Photo Frame with Sharp Red Outline */}
                  <div className="flex-1 my-2 relative rounded-lg overflow-hidden border-2 border-red-600 shadow-2xl min-h-[70px]">
                    <img
                      src={effectiveImageUrl}
                      alt={headline}
                      crossOrigin="anonymous"
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                    {showWatermark && (
                      <div className="absolute top-2 right-2 px-2.5 py-1 rounded bg-red-600 text-white font-black text-xs shadow-lg font-solaiman">
                        {brandTitle}
                      </div>
                    )}
                  </div>

                  {/* High-Impact Headline with Golden Kicker Accent */}
                  <div className="my-1.5 bg-gradient-to-r from-red-950/90 via-red-900/90 to-rose-950/90 p-3.5 rounded-lg border-l-4 border-yellow-400">
                    {kicker && (
                      <div className="text-yellow-400 font-bold font-solaiman text-xs mb-1">
                        ● {kicker}
                      </div>
                    )}
                    <h3 
                      className={`font-black text-white font-solaiman drop-shadow-lg line-clamp-3 text-${headlineAlignment}`}
                      style={{ 
                        fontSize: `${headlineFontSize}px`,
                        lineHeight: headlineLineHeight,
                        wordBreak: 'break-word',
                        overflowWrap: 'break-word',
                        paddingTop: '2px',
                        paddingBottom: '4px',
                      }}
                    >
                      {headline}
                    </h3>
                  </div>

                  {/* Social Handles Bar: Facebook, TikTok, YouTube, Instagram */}
                  <div className="pt-2 border-t border-red-900/60 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1 text-[10px] font-mono text-red-300">
                        <span className="w-4 h-4 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-[9px]">f</span>
                        <span className="w-4 h-4 rounded-full bg-red-600 text-white flex items-center justify-center font-bold text-[9px]">▶</span>
                        <span className="w-4 h-4 rounded-full bg-pink-600 text-white flex items-center justify-center font-bold text-[9px]">📷</span>
                      </div>
                      <span className="font-mono text-[11px] text-white/90 font-bold">{socialHandleText}</span>
                    </div>

                    <span className="font-mono text-[11px] text-yellow-400 font-bold">
                      {brandDomain}
                    </span>
                  </div>
                </div>
              )}

              {/* ========================================================= */}
              {/* TEMPLATE 4: MINIMALIST QUOTE / FEATURE (DBC STATEMENT)    */}
              {/* ========================================================= */}
              {(template === 'minimalist_quote' || template === 'quote_spotlight' || template === 'split_modern') && (
                <div 
                  className="w-full h-full relative overflow-hidden flex flex-col justify-between p-6"
                  style={{
                    background: currentTheme.id === 'custom_picker' 
                      ? customColor 
                      : 'linear-gradient(145deg, #180309 0%, #3b0716 50%, #700d26 100%)'
                  }}
                >
                  {/* Top Bar with Symmetric White Shape Box */}
                  <div className="flex items-center justify-between pb-3 border-b border-white/20">
                    {showWatermark ? (
                      <div className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-white text-slate-900 shadow-md border border-white/30">
                        {siteLogoToUse ? (
                          <img 
                            src={siteLogoToUse} 
                            alt={brandTitle} 
                            crossOrigin="anonymous"
                            className={`${getLogoClass()} object-contain max-h-5 sm:max-h-6`} 
                          />
                        ) : (
                          <div className="flex items-center gap-1.5">
                            <span className="w-2.5 h-2.5 rounded-full bg-red-600" />
                            <span className="font-solaiman font-black text-xs text-red-700">{brandTitle}</span>
                          </div>
                        )}
                      </div>
                    ) : <div />}

                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-solaiman px-2.5 py-1 rounded-md bg-white/10 text-amber-300 border border-amber-400/30 font-bold">
                        সংগৃহীত বক্তব্য
                      </span>
                      {showDateBadge && (
                        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-white text-slate-900 font-solaiman font-bold text-xs shadow-md">
                          <Calendar className="w-3.5 h-3.5 text-red-600 shrink-0" />
                          <span>{rawDateStr}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Speaker Inset & Quote Body */}
                  <div className="my-auto space-y-3">
                    <div className="flex items-center gap-3.5">
                      <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full overflow-hidden border-2 border-amber-400 shadow-2xl shrink-0 bg-black/40">
                        <img
                          src={effectiveImageUrl}
                          alt={authorName}
                          crossOrigin="anonymous"
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div>
                        <div className="text-sm font-bold text-amber-300 font-solaiman">
                          {authorName}
                        </div>
                        <div className="text-[11px] text-white/70 font-solaiman">
                          {kicker || 'বিশেষ প্রতিবেদন ও বিবৃতি'}
                        </div>
                      </div>
                    </div>

                    <div className="relative pl-4 border-l-2 border-amber-400">
                      <span className="text-4xl font-serif text-amber-400/80 leading-none -ml-2 block">“</span>
                      <h3 
                        className={`font-black text-white font-solaiman drop-shadow-lg line-clamp-4 text-${headlineAlignment}`}
                        style={{ 
                          fontSize: `${headlineFontSize}px`,
                          lineHeight: headlineLineHeight,
                          wordBreak: 'break-word',
                          overflowWrap: 'break-word',
                          paddingTop: '2px',
                          paddingBottom: '4px',
                        }}
                      >
                        {headline}
                      </h3>
                    </div>
                  </div>

                  {/* Footer Bar: Date & Website */}
                  <div className="pt-3 border-t border-white/20 flex items-center justify-between text-xs text-white/90 font-solaiman">
                    <div className="flex items-center gap-1.5 text-slate-300">
                      <Calendar className="w-3.5 h-3.5 text-amber-300" />
                      <span>{rawDateStr}</span>
                    </div>

                    <span className="font-mono text-[11px] font-bold text-amber-300">
                      {brandDomain}
                    </span>
                  </div>
                </div>
              )}

              {/* ========================================================= */}
              {/* TEMPLATE 5: SOMOY & JAMUNA TV SPLIT STYLE                 */}
              {/* ========================================================= */}
              {(template === 'somoy_split' || template === 'split_modern' || template === 'magazine_feature') && (
                <div 
                  className="w-full h-full relative overflow-hidden flex flex-col justify-between"
                  style={{
                    background: currentTheme.id === 'custom_picker' 
                      ? customColor 
                      : (currentTheme.id === 'broadsheet_white' ? '#0f172a' : currentTheme.bg)
                  }}
                >
                  {/* Top Bar: Symmetric Logo Container on left & Live/Date Pill on right */}
                  <div className="relative z-20 p-4 sm:p-5 pb-2 flex items-center justify-between">
                    {showWatermark ? (
                      <div className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-white text-slate-900 shadow-lg border border-white/40">
                        {siteLogoToUse ? (
                          <img 
                            src={siteLogoToUse} 
                            alt={brandTitle} 
                            crossOrigin="anonymous"
                            className={`${getLogoClass()} object-contain max-h-5 sm:max-h-6`} 
                          />
                        ) : (
                          <div className="flex items-center gap-1.5">
                            <span className="w-2.5 h-2.5 rounded-full bg-red-600 animate-pulse" />
                            <span className="font-solaiman font-black text-xs sm:text-sm text-red-700 tracking-tight">{brandTitle}</span>
                          </div>
                        )}
                      </div>
                    ) : <div />}

                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-red-600 text-white font-black text-[10px] font-mono shadow-md tracking-wider">
                        <span className="w-2 h-2 rounded-full bg-white animate-ping" />
                        <span>NEWS 24/7</span>
                      </div>
                      {showDateBadge && (
                        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-white text-slate-900 font-solaiman font-bold text-xs shadow-lg border border-white/40">
                          <Calendar className="w-3.5 h-3.5 text-red-600 shrink-0" />
                          <span>{rawDateStr}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Main TV Frame Visual (High-Res Feature Photo) */}
                  <div className="relative z-10 flex-1 px-4 sm:px-5 my-1 flex items-center justify-center min-h-[70px]">
                    <div className={`relative w-full h-full rounded-xl overflow-hidden ${getFrameBorderClass()}`}>
                      <img
                        src={effectiveImageUrl}
                        alt={headline}
                        crossOrigin="anonymous"
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover"
                      />
                      {/* Gradient Vignette on Image Bottom */}
                      <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/80 to-transparent pointer-events-none" />
                      
                      {kicker && (
                        <div className="absolute bottom-2 left-2 px-2.5 py-0.5 rounded bg-yellow-400 text-slate-950 font-solaiman text-[11px] font-black shadow-md flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-red-600" />
                          <span>{kicker}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* High Contrast TV Headline Container */}
                  <div className="relative z-20 px-4 sm:px-5 py-2.5 bg-gradient-to-t from-black/95 via-black/85 to-transparent">
                    <h3 
                      className={`font-black text-white font-solaiman drop-shadow-md line-clamp-3 text-${headlineAlignment}`}
                      style={{ 
                        fontSize: `${headlineFontSize}px`,
                        lineHeight: headlineLineHeight,
                        wordBreak: 'break-word',
                        overflowWrap: 'break-word',
                        paddingTop: '2px',
                        paddingBottom: '4px',
                      }}
                    >
                      {headline}
                    </h3>
                  </div>

                  {/* TV Broadcast Bottom News Bar */}
                  <div className="relative z-20 bg-gradient-to-r from-red-700 via-rose-800 to-red-900 px-4 py-2 text-white flex items-center justify-between text-xs font-solaiman shadow-lg border-t border-red-500/30">
                    <div className="flex items-center gap-2">
                      <span className="font-bold flex items-center gap-1 text-yellow-300">
                        <Tv className="w-3.5 h-3.5" />
                        <span>{commentPromptText}</span>
                      </span>
                      <span className="text-white/40 hidden sm:inline">|</span>
                      <span className="font-mono text-[11px] font-bold tracking-wide text-white/90 hidden sm:inline">{brandDomain}</span>
                    </div>

                    {showSocialHandles && (
                      <div className="flex items-center gap-1.5 font-mono text-[11px] font-bold text-yellow-300 bg-black/30 px-2.5 py-0.5 rounded-md border border-white/20">
                        <span>{socialHandleText}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* ========================================================= */}
              {/* TEMPLATE 6: EDITORIAL BROADSHEET (PROTHOM ALO / JUGANTOR) */}
              {/* ========================================================= */}
              {(template === 'editorial_broadsheet') && (
                <div className="w-full h-full relative overflow-hidden flex flex-col justify-between bg-[#fbfaf5] text-slate-900 border-4 border-slate-900 p-4 sm:p-5">
                  
                  {/* Top Broadsheet Masthead with Symmetric White Shape Box */}
                  <div className="pb-3 border-b-2 border-slate-900 flex items-center justify-between">
                    {showWatermark ? (
                      <div className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-white shadow-md border border-slate-300">
                        {siteLogoToUse ? (
                          <img 
                            src={siteLogoToUse} 
                            alt={brandTitle} 
                            crossOrigin="anonymous"
                            className={`${getLogoClass()} object-contain max-h-5 sm:max-h-6`} 
                          />
                        ) : (
                          <div className="flex items-center gap-1.5">
                            <span className="w-2.5 h-2.5 rounded-full bg-red-600" />
                            <span className="text-sm font-black font-solaiman text-red-700 tracking-tight">{brandTitle}</span>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="text-base font-black font-solaiman text-slate-900">
                        {brandTitle}
                      </div>
                    )}

                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-slate-600 font-solaiman font-bold hidden sm:inline">
                        জাতীয় সংস্করণ
                      </span>
                      {showDateBadge && (
                        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-white shadow-md border border-slate-300 text-slate-900 font-solaiman font-bold text-xs">
                          <Calendar className="w-3.5 h-3.5 text-red-600 shrink-0" />
                          <span>{rawDateStr}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Crisp Editorial Photo with Thin Newspaper Border */}
                  <div className="flex-1 my-2 flex items-center justify-center min-h-[70px]">
                    <div className="relative w-full h-full rounded-lg overflow-hidden border border-slate-400 shadow-sm bg-slate-200">
                      <img
                        src={effectiveImageUrl}
                        alt={headline}
                        crossOrigin="anonymous"
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute bottom-1 right-1.5 px-2 py-0.5 rounded bg-black/75 text-white text-[9px] font-solaiman">
                        ছবি: {authorName}
                      </div>
                    </div>
                  </div>

                  {/* Classic Editorial Headline with Kicker */}
                  <div className="my-1.5 bg-white p-3 rounded-lg border border-slate-300 shadow-xs">
                    {kicker && (
                      <div className="text-red-600 font-bold font-solaiman text-xs mb-1 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-red-600" />
                        <span>{kicker}</span>
                      </div>
                    )}
                    <h3 
                      className={`font-black text-slate-950 font-solaiman drop-shadow-xs line-clamp-3 text-${headlineAlignment}`}
                      style={{ 
                        fontSize: `${headlineFontSize}px`,
                        lineHeight: headlineLineHeight,
                        wordBreak: 'break-word',
                        overflowWrap: 'break-word',
                        paddingTop: '2px',
                        paddingBottom: '4px',
                      }}
                    >
                      {headline}
                    </h3>
                  </div>

                  {/* Broadsheet Press Footer */}
                  <div className="pt-2 border-t border-slate-400 flex items-center justify-between text-xs font-solaiman text-slate-700">
                    <div className="flex items-center gap-1.5 font-bold text-red-700">
                      <Newspaper className="w-3.5 h-3.5" />
                      <span>{commentPromptText}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[11px] font-bold text-slate-800">{brandDomain}</span>
                      {showSocialHandles && (
                        <span className="font-mono text-[10px] text-slate-600 hidden sm:inline">({socialHandleText})</span>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* ========================================================= */}
              {/* TEMPLATE 7: VIRAL SOCIAL SPOTLIGHT                        */}
              {/* ========================================================= */}
              {(template === 'viral_spotlight' || template === 'viral_dark' || template === 'cinematic_overlay') && (
                <div 
                  className="w-full h-full relative overflow-hidden flex flex-col justify-between p-5 sm:p-6"
                  style={{
                    background: currentTheme.id === 'custom_picker' 
                      ? customColor 
                      : 'linear-gradient(135deg, #090d16 0%, #0f172a 40%, #1e1b4b 100%)'
                  }}
                >
                  {/* Subtle Glowing Radial Background Highlight */}
                  <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
                  <div className="absolute bottom-0 left-0 w-64 h-64 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />

                  {/* Top Bar with Symmetric White Shape Box */}
                  <div className="relative z-10 flex items-center justify-between pb-3">
                    {showWatermark ? (
                      <div className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-white text-slate-900 shadow-xl border border-white/40">
                        {siteLogoToUse ? (
                          <img 
                            src={siteLogoToUse} 
                            alt={brandTitle} 
                            crossOrigin="anonymous"
                            className={`${getLogoClass()} object-contain max-h-5 sm:max-h-6`} 
                          />
                        ) : (
                          <div className="flex items-center gap-1.5">
                            <span className="w-2.5 h-2.5 rounded-full bg-cyan-600 animate-pulse" />
                            <span className="font-solaiman font-black text-xs sm:text-sm text-slate-900 tracking-tight">{brandTitle}</span>
                          </div>
                        )}
                      </div>
                    ) : <div />}

                    <div className="flex items-center gap-2">
                      <div className="px-2.5 py-1 rounded-md bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold text-[10px] font-solaiman shadow-md flex items-center gap-1">
                        <Zap className="w-3 h-3" />
                        <span>স্পেশাল পোস্ট</span>
                      </div>
                      {showDateBadge && (
                        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-white text-slate-900 font-solaiman font-bold text-xs shadow-xl border border-white/40">
                          <Calendar className="w-3.5 h-3.5 text-cyan-600 shrink-0" />
                          <span>{rawDateStr}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Centered High-Engagement Photo Frame */}
                  <div className="relative z-10 flex-1 my-2 flex items-center justify-center min-h-[70px]">
                    <div className={`relative w-full h-full rounded-2xl overflow-hidden ${getFrameBorderClass()}`}>
                      <img
                        src={effectiveImageUrl}
                        alt={headline}
                        crossOrigin="anonymous"
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover"
                      />
                      {kicker && (
                        <div className="absolute top-2.5 left-2.5 px-2.5 py-0.5 rounded-full bg-cyan-500/90 backdrop-blur-md text-white font-solaiman text-[11px] font-bold shadow-md">
                          {kicker}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Spotlight Headline Box with Accent Left Border */}
                  <div className="relative z-10 my-1 p-3.5 rounded-xl bg-slate-900/90 backdrop-blur-md border border-white/10 border-l-4 border-l-cyan-400 shadow-2xl">
                    <h3 
                      className={`font-black text-white font-solaiman drop-shadow-md line-clamp-3 text-${headlineAlignment}`}
                      style={{ 
                        fontSize: `${headlineFontSize}px`,
                        lineHeight: headlineLineHeight,
                        wordBreak: 'break-word',
                        overflowWrap: 'break-word',
                        paddingTop: '2px',
                        paddingBottom: '4px',
                      }}
                    >
                      {headline}
                    </h3>
                  </div>

                  {/* High Visibility Comment Ribbon */}
                  {showCommentPrompt && (
                    <div className="relative z-10 flex items-center justify-center py-1">
                      <span className="text-yellow-300 font-solaiman text-xs font-bold tracking-wide drop-shadow-xs flex items-center gap-1">
                        <MessageSquare className="w-3 h-3" />
                        <span>{commentPromptText}</span>
                      </span>
                    </div>
                  )}

                  {/* Multi-Social Platform Handles Bar */}
                  <div className="relative z-10 pt-2.5 border-t border-white/20 flex items-center justify-between text-xs text-white/90">
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1 text-[9px] font-mono">
                        <span className="w-4 h-4 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold">f</span>
                        <span className="w-4 h-4 rounded-full bg-red-600 text-white flex items-center justify-center font-bold">▶</span>
                        <span className="w-4 h-4 rounded-full bg-pink-600 text-white flex items-center justify-center font-bold">📷</span>
                      </div>
                      <span className="font-mono text-[11px] font-bold text-cyan-300">{brandDomain}</span>
                    </div>

                    {showSocialHandles && (
                      <div className="flex items-center gap-1 font-mono text-[10px] text-white/80 bg-white/10 px-2 py-0.5 rounded-full border border-white/10">
                        <Share2 className="w-3 h-3 text-cyan-400" />
                        <span>{socialHandleText}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* ========================================================= */}
              {/* TEMPLATE 8: CUSTOM UPLOADED BACKGROUND FRAME / OVERLAY   */}
              {/* ========================================================= */}
              {template === 'custom_template' && (
                <div 
                  className="w-full h-full relative overflow-hidden flex flex-col justify-between"
                  style={{
                    backgroundImage: (customFrameMode === 'background' && customBackgroundTemplate) ? `url(${customBackgroundTemplate})` : undefined,
                    backgroundColor: customBackgroundTemplate ? undefined : '#0f172a',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                  }}
                >
                  {/* Darkness Overlay Scrim */}
                  <div 
                    className="absolute inset-0 transition-opacity pointer-events-none" 
                    style={{ backgroundColor: `rgba(0, 0, 0, ${overlayDarkness / 100})` }} 
                  />

                  {/* Top Header / Branding Bar with Symmetric White Shape Box */}
                  <div className="relative z-10 p-4 sm:p-5 flex items-center justify-between">
                    {showWatermark && (
                      <div className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-white text-slate-900 shadow-md border border-white/30">
                        {siteLogoToUse ? (
                          <img 
                            src={siteLogoToUse} 
                            alt={brandTitle} 
                            crossOrigin="anonymous"
                            className={`${getLogoClass()} object-contain max-h-5 sm:max-h-6`} 
                          />
                        ) : (
                          <div className="flex items-center gap-1.5">
                            <span className="w-2.5 h-2.5 rounded-full bg-red-600" />
                            <span className="font-solaiman font-black text-xs text-red-700">{brandTitle}</span>
                          </div>
                        )}
                      </div>
                    )}

                    <div className="flex items-center gap-2">
                      {kicker && (
                        <span 
                          className="text-xs font-bold px-3 py-1 rounded-md text-white shadow-md font-solaiman"
                          style={{ backgroundColor: currentTheme.accent }}
                        >
                          {kicker}
                        </span>
                      )}
                      {showDateBadge && (
                        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-white text-slate-900 font-solaiman font-bold text-xs shadow-md">
                          <Calendar className="w-3.5 h-3.5 text-red-600 shrink-0" />
                          <span>{rawDateStr}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Body Headline Section with chosen position */}
                  <div className={`relative z-10 px-6 sm:px-8 py-4 flex flex-col ${
                    overlayPosition === 'top' 
                      ? 'justify-start' 
                      : overlayPosition === 'center' 
                      ? 'justify-center flex-1 my-auto' 
                      : 'justify-end'
                  }`}>
                    {showNewsThumbnail && effectiveImageUrl && (
                      <div className="mb-3 w-28 h-20 sm:w-36 sm:h-24 rounded-lg overflow-hidden border-2 border-white/80 shadow-2xl bg-black/40">
                        <img 
                          src={effectiveImageUrl} 
                          alt={headline} 
                          crossOrigin="anonymous"
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover" 
                        />
                      </div>
                    )}

                    <h3 
                      className={`font-black drop-shadow-lg text-white font-solaiman mb-2 text-${headlineAlignment}`}
                      style={{ 
                        fontSize: `${headlineFontSize}px`,
                        lineHeight: headlineLineHeight,
                        wordBreak: 'break-word',
                        overflowWrap: 'break-word',
                        paddingTop: '2px',
                        paddingBottom: '4px',
                      }}
                    >
                      {headline}
                    </h3>
                  </div>

                  {/* Bottom Footer */}
                  <div className="relative z-10 p-4 sm:p-5 pt-2 flex items-center justify-between text-xs text-white/90 border-t border-white/20 bg-black/40 backdrop-blur-xs">
                    <div className="flex items-center gap-2">
                      <span className="font-bold">{authorName}</span>
                      <span>•</span>
                      <span className="text-white/70">{rawDateStr}</span>
                    </div>
                    <span className="font-mono text-[11px] font-bold text-white/80">
                      {brandDomain}
                    </span>
                  </div>
                </div>
              )}

              {/* ========================================================= */}
              {/* INSTANT RENDERED CUSTOM FRAME OVERLAY (Requirement 2)     */}
              {/* ========================================================= */}
              {customBackgroundTemplate && (enableFrameOverlay || (template === 'custom_template' && customFrameMode === 'overlay')) && (
                <img
                  src={customBackgroundTemplate}
                  alt="Custom Brand Frame Overlay"
                  className="absolute inset-0 w-full h-full object-contain pointer-events-none z-30 select-none"
                />
              )}

              </div>
            </div>
          </div>

          {/* Social Media Export Quality Notice */}
          <div className="mt-4 text-xs text-slate-500 dark:text-slate-400 flex flex-wrap items-center justify-between gap-3 w-full max-w-xl font-solaiman">
            <div className="flex items-center gap-1.5">
              <Check className="w-3.5 h-3.5 text-emerald-500" />
              <span>হাই-রেজ্যুলেশন ২.৫x ক্রিস্প শার্পনেস সাপোর্ট</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Share2 className="w-3.5 h-3.5 text-blue-500" />
              <span>ফেসবুক ও ইনস্টাগ্রাম এলগরিদম অপ্টিমাইজড</span>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
