export interface Article {
  source?: string;
  sharesCount?: number;
  reporterTitle?: string;
  id: string;
  slug?: string;
  title: string;
  titleEn?: string;
  excerpt: string;
  excerptEn?: string;
  content: string;
  contentEn?: string;
  category: string;
  categoryEn: string;
  author: string;
  authorEn?: string;
  authorRole?: string;
  authorAvatar?: string;
  authorBio?: string;
  date: string;
  dateEn?: string;
  timeAgo: string;
  imageUrl: string;
  imageCaption?: string;
  isLead?: boolean;
  isBreaking?: boolean;
  isTrending?: boolean;
  trendRank?: number;
  views: number;
  readTime: string;
  tags?: string[];
  division?: string;
  district?: string;
  videoUrl?: string;
  status?: 'published' | 'pending' | 'rejected' | 'hidden' | 'deleted';
  isHidden?: boolean;
  submittedBy?: string;
  shoulder?: string;
  subHeadline?: string;
  seriesName?: string;
  seriesPart?: string;
  seoFocusKeyword?: string;
  // Master / Delegated Posting Fields (Requirement 1)
  authorId?: string;
  delegatedBy?: string; // ID of Master / Assistant user who posted on their behalf
  delegatedByName?: string; // Name of Master / Assistant user
  isDelegatedPost?: boolean;
  delegatedAttributionNote?: string;
  deletedAt?: string;
  // Scheduling, Auto-Expire & Backdating
  publishMode?: 'immediate' | 'scheduled' | 'backdated';
  publishedAt?: string;
  scheduledAt?: string;
  expiresAt?: string;
  isAutoExpire?: boolean;
  isScheduled?: boolean;
  isExpired?: boolean;
  isBackdated?: boolean;
  // Cloud CDN Storage
  storageProvider?: 'local' | 'cloudinary' | 's3';
  cdnOptimizedUrl?: string;
  cdnPublicId?: string;
  // Multiple File Attachments (Citizen Journalism & Documents)
  attachments?: {
    id: string;
    name: string;
    url: string;
    type?: string;
    sizeKb?: number;
    localPath?: string;
  }[];
  // Submission Moderation & Admin Review Feedback (Requirement 2)
  adminFeedback?: string; // Custom feedback, edit note, or rejection reason written by Admin
  adminFeedbackNote?: string; // Backwards compatible alias
  adminFeedbackAt?: string;
  adminFeedbackAction?: 'rejected' | 'held' | 'revision_requested' | 'approved' | 'deleted';
  adminReviewedBy?: string;
}

export interface CategoryItem {
  id: string;
  nameBn: string;
  nameEn: string;
  slug: string;
  count?: number;
  order?: number;
  showOnHomepage?: boolean;
  showInHeader?: boolean;
  showInFooter?: boolean;
  customUrl?: string;
  parentId?: string | null;
}

export interface Comment {
  id: string;
  author: string;
  authorAvatar?: string;
  text: string;
  time: string;
  likes: number;
}

export interface CommentItem {
  id: string;
  articleId: string;
  articleTitle?: string;
  name: string;
  address?: string;
  phone?: string;
  text: string;
  time: string;
  date?: string;
  likes: number;
  status: 'pending' | 'approved' | 'rejected';
}

export interface UserItem {
  id: string;
  name: string;
  nameEn?: string;
  email: string;
  password?: string;
  role: 'admin' | 'author' | 'subscriber' | 'user' | 'editor' | 'reporter' | 'contributor' | 'master' | 'delegated_publisher';
  roleBn: string;
  canPostOnBehalf?: boolean; // Master / Delegated Posting permission (Requirement 1)
  avatar?: string;
  postsCount: number;
  status: 'active' | 'inactive';
  autoApprove: boolean;
  phone?: string;
  bio?: string;
  district?: string;
  designation?: string;
  designationEn?: string;
  bloodGroup?: string;
  education?: string;
  idCardNumber?: string;
  idCardIssuedAt?: string;
  idCardValidTill?: string;
  idCardStatus?: 'pending' | 'approved' | 'rejected';
  idCardAdminNote?: string;
  customTemplateId?: 'classic-press' | 'modern-executive' | 'national-press' | 'custom-uploaded';
  emergencyContact?: string;
  idCardFrontUrl?: string; // Custom uploaded front press ID card image
  idCardBackUrl?: string;  // Custom uploaded back press ID card image
}

export interface JobApplication {
  id: string;
  candidateName: string;
  email: string;
  phone: string;
  district: string;
  desiredRole: string;
  education: string;
  experienceBio: string;
  photoUrl?: string;
  cvUrl?: string;
  cvFileName?: string;
  idProofUrl?: string;
  idProofType?: 'nid' | 'birth_certificate';
  portfolioLinks?: string;
  status: 'pending' | 'reviewed' | 'approved' | 'rejected';
  appliedAt: string;
  notes?: string;
  assignedUserId?: string;
  reviewedAt?: string;
  adminDecisionReason?: string;
  // Multiple File Attachments (Certificates, Portfolios, Documents)
  additionalFiles?: {
    id: string;
    name: string;
    url: string;
    type?: string;
    sizeKb?: number;
    localPath?: string;
  }[];
}

export interface IdCardTemplateConfig {
  themeColor: string; // e.g. '#dc2626'
  secondaryColor?: string; // e.g. '#0f172a'
  selectedTemplateId?: 'classic-press' | 'modern-executive' | 'national-press' | 'custom-uploaded';
  organizationName?: string;
  organizationNameEn?: string;
  organizationSubTitle?: string;
  showSloganUnderLogo?: boolean; // Toggle slogan under logo on front & back
  showFrontSlogan?: boolean;
  showBackSlogan?: boolean;
  customLogoUrl?: string;
  cardPrefix?: string; // e.g. 'ND'
  validTill?: string; // e.g. '01 June 2027'
  issuedAt?: string;

  // Front Page Dynamic Text Lines (Requirement 4)
  pressBannerText?: string; // e.g. 'PRESS'
  idLabelText?: string;      // e.g. 'ID NO.'
  phoneLabelText?: string;   // e.g. 'Phone'
  govtRegNumber?: string;    // e.g. 'Govt Reg: PR-2026/8492'
  showGovtRegNumber?: boolean;

  // Back Page Dynamic Text Lines (Requirement 4)
  backHeaderTitle?: string;  // e.g. 'PRESS CARD'
  ownershipNotice?: string;  // e.g. 'This card is the property of Notun Drishti'
  websiteLabel?: string;     // e.g. 'Website'
  websiteUrl?: string;       // e.g. 'www.notundrishti.com'
  phoneLabel?: string;       // e.g. 'Phone'
  contactPhone?: string;     // e.g. '+8801715248243, +8801577581026'
  emailLabel?: string;       // e.g. 'Email'
  contactEmail?: string;     // e.g. 'notundrishti247@gmail.com'
  addressLabel?: string;     // e.g. 'Address'
  officeAddress?: string;    // e.g. '578, Shikkhakpalli, Gaital, Kishoreganj.'
  cooperationNotice?: string;
  cardPropertyNotice?: string;
  officialRegLine?: string;  // e.g. 'Press Council Reg: BD-PC/2026-912'
  showOfficialRegLine?: boolean;
  validityPrefixText?: string; // e.g. 'Validity until:'
  customLines?: { id: string; label: string; value: string; page: 'front' | 'back' }[];

  // Authority & Signatures
  authorityName?: string;
  authorityDesignation?: string;
  authoritySignatureUrl?: string;
  sealBadgeUrl?: string;
  editorSignatureUrl?: string;
  publisherSignatureUrl?: string;
  editorSealUrl?: string;
  publisherSealUrl?: string;
  showEditorSignature?: boolean;
  showPublisherSignature?: boolean;
  editorTitle?: string;
  publisherTitle?: string;

  // Custom Uploaded Template Backgrounds
  customFrontBgUrl?: string;
  customBackBgUrl?: string;
  bgPattern?: 'modern' | 'classic' | 'broadsheet' | 'minimal';
  customBgUrl?: string;
  emergencyPhone?: string;
  cardTermsBn?: string;
}

export interface MediaItem {
  id: string;
  title: string;
  url: string;
  type: 'image' | 'video';
  size?: string;
  date: string;
}

export interface PhotoCardItem {
  id: string;
  title: string;
  imageUrl: string;
  caption?: string;
  photographer?: string;
  date: string;
  category?: string;
  likes?: number;
}

export interface QuoteItem {
  id: string;
  quote: string;                 // উক্তি বা বক্তব্যের মূল অংশ
  speakerName: string;           // বক্তার নাম (যেমন: তারেক রহমান)
  speakerDesignation: string;    // পদবি বা পরিচয় (যেমন: প্রধানমন্ত্রী)
  speakerPhoto: string;          // বক্তার ছবি বা পোর্ট্রেট URL
  date: string;                  // প্রকাশের তারিখ (যেমন: ২০ অক্টোবর ২০২৬)
  timeAgo?: string;              // প্রকাশের সময় (যেমন: ১ ঘণ্টা আগে, ৬ ঘণ্টা আগে)
  category?: string;             // বিভাগ বা ট্যাগ (যেমন: রাজনীতি, মতামত, জাতীয়)
  theme?: 'ice_blue' | 'white_classic' | 'navy_gradient' | 'warm_cream' | 'dark_obsidian';
  isActive: boolean;             // পোর্টালে দৃশ্যমান কিনা
  createdAt?: string;            // তৈরির তারিখ
  order?: number;                // ডিসপ্লে অর্ডার
}

export interface VideoNewsItem {
  id: string;
  title: string;
  youtubeId?: string;
  youtubeUrl: string;
  thumbnailUrl?: string;
  duration?: string;
  views?: string;
  date: string;
  category?: string;
}

export interface RequestItem {
  id: string;
  title: string;
  author: string;
  category: string;
  type: 'post' | 'image' | 'video';
  date: string;
  status: 'pending' | 'approved' | 'rejected';
}

export type AdPlacementPosition = 
  | 'header_top'          // Header Top Banner (যেমন: 728x90)
  | 'below_ticker'        // Below Breaking News / Ticker (Full Width / Box)
  | 'sidebar_top'         // Sidebar Top Widget (যেমন: 300x250, 300x600)
  | 'sidebar_middle'      // Sidebar Middle Widget (যেমন: 300x250)
  | 'sidebar_bottom'      // Sidebar Bottom Widget (যেমন: 300x250, 300x600)
  | 'home_inter_grid'     // Homepage Section Inter-grids (মাঝখানের গ্রিড অ্যাড স্লট)
  | 'article_middle'      // Single News Details Page (মাঝে)
  | 'article_bottom'      // Single News Details Page (নিচে)
  | 'footer_top'          // Footer Banner
  // E-Paper Broadsheet Ad Placements
  | 'epaper_top'           // E-Paper Top Broadsheet Leaderboard Ad
  | 'epaper_strip'         // E-Paper Sub-Masthead Commercial Strip Ad
  | 'epaper_sidebar'       // E-Paper Broadsheet Column/Sidebar Display Ad
  | 'epaper_bottom'        // E-Paper Bottom Broadsheet Footer Ad
  // Backward compatibility aliases
  | 'hero_right'
  | 'politics_right'
  | 'world_right'
  | 'country_right'
  | (string & {});

export type AdContentType = 'banner' | 'code' | 'text';

export type AdSizePreset = 
  | '728x90' 
  | '300x250' 
  | '300x600' 
  | '970x90' 
  | '970x250' 
  | '320x100' 
  | '300x500' 
  | 'responsive' 
  | 'custom'
  | (string & {});

export interface AdSlot {
  id: string;
  title: string;
  position: AdPlacementPosition;
  size: AdSizePreset;
  customWidth?: number;
  customHeight?: number;
  type: AdContentType;
  imageUrl?: string;
  targetUrl: string;
  altText?: string;
  codeSnippet?: string; // Custom HTML or Google AdSense script
  textHeadline?: string;
  textDescription?: string;
  textCtaLabel?: string;
  isActive: boolean;
  sponsorName?: string;
  expiresAt?: string; // YYYY-MM-DD
  isAutoExpire?: boolean;
}

export interface TickerItem {
  id: string;
  text: string;
  linkArticleId?: string;
  linkUrl?: string;
  isActive: boolean;
  timeAgo: string;
}

export type EditorialTier = 'tier_management' | 'tier_newsroom' | 'tier_reporting';

export interface FamilyMember {
  id: string;
  name: string;
  designation: string;
  phone: string;
  email: string;
  photoUrl: string;
  order?: number;
  tier?: EditorialTier;
}

export interface SiteSettings {
  siteName: string;
  siteNameEn?: string;
  tagline: string;
  domain: string;
  lightLogoUrl: string;
  darkLogoUrl: string;
  logoUrl?: string;
  faviconUrl: string;
  headerLogoHeight?: number; // Header logo height in px (unrestricted)
  headerLogoWidth?: number;  // Header logo width in px (unrestricted, 0 for auto)
  footerLogoHeight?: number; // Footer logo height in px (unrestricted)
  footerLogoWidth?: number;  // Footer logo width in px (unrestricted, 0 for auto)
  whatsappNumber?: string;   // WhatsApp news submission hotline e.g. "+8801700000000"
  // Editorial Section Header Titles
  editorialSectionTitle?: string; // e.g. "সম্পাদকীয় ও প্রশাসন"
  contactSectionTitle?: string;   // e.g. "যোগাযোগ ও দপ্তর"
  // Dynamic Editorial Designations & Values
  editorLabel?: string;          // e.g. "ভারপ্রাপ্ত সম্পাদক"
  editorName: string;            // e.g. "শামীম রেজা নূরুল"
  execEditorLabel?: string;      // e.g. "নির্বাহী সম্পাদক"
  execEditorName?: string;       // e.g. "নাজমুল হুদা শান্ত"
  publisherLabel?: string;       // e.g. "প্রকাশক"
  publisherName: string;         // e.g. "পাবলিকেশনস লিমিটেড"
  newsHeadLabel?: string;        // e.g. "বার্তা প্রধান"
  newsHeadName?: string;         // e.g. "মাহমুদ হাসান"
  contactEmail: string;
  contactPhone: string;
  officeAddress: string;
  enableBreakingTicker: boolean;
  enableHeaderAd: boolean;
  enableSidebarAd: boolean;
  // Recruitment & Career Portal (Requirement 1 & 2)
  recruitmentEnabled?: boolean;
  recruitmentHeadline?: string;
  recruitmentDescription?: string;
  openRecruitmentPositions?: string[]; // Array of checked designation titles
  // Custom Digital ID Card Template (Requirement 2 & 4)
  idCardTemplate?: IdCardTemplateConfig;
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords?: string;
  canonicalUrl?: string;
  robotsTxt?: string;
  ogImage?: string;
  facebookUrl?: string;
  twitterUrl?: string;
  youtubeUrl?: string;
  instagramUrl?: string;
  linkedinUrl?: string;
  socialMediaUrls?: {
    facebook?: string;
    twitter?: string;
    youtube?: string;
    instagram?: string;
    linkedin?: string;
    tiktok?: string;
    whatsapp?: string;
  };
  facebookAppId?: string;
  facebookAccounts?: string;
  autoPostToFacebook?: boolean;
  adsTxtContent?: string;
  smtpHost?: string;
  smtpPort?: string;
  smtpUser?: string;
  smtpPassword?: string;
  smtpSenderName?: string;
  enable2FA?: boolean;
  enableGoogleLogin?: boolean;
  sessionTimeout?: string;
  passwordPolicy?: string;
  enableRss?: boolean;
  enableAiSummary?: boolean;
  primaryColor?: string;
  fontChoice?: 'solaiman' | 'kalpurush' | 'hind' | 'noto';
  tickerSpeed?: number;
  defaultPhotoCardTemplate?: string;
  footerAbout?: string;
  copyrightText?: string;
  homepageCategoryCount?: number;
  homepageSections?: {
    showBreakingTicker?: boolean;
    showHero?: boolean;
    showSpecial?: boolean;
    showNational?: boolean;
    showPolitics?: boolean;
    showWorld?: boolean;
    showCountrywide?: boolean;
    showPhotoGallery?: boolean;
    showShowbiz?: boolean;
    showMultiGrid?: boolean;
    showVideoGallery?: boolean;
    showFamily?: boolean;
    showQuotes?: boolean;
  };
  cloudStorage?: CloudStorageConfig;
  socialShares?: {
    facebook?: boolean;
    twitter?: boolean;
    whatsapp?: boolean;
    linkedin?: boolean;
    telegram?: boolean;
    copyLink?: boolean;
  };
  // Dedicated E-Paper Broadsheet Controller (100% Inch-by-inch control)
  epaperConfig?: {
    headerSubtitle?: string;
    motto?: string;
    sloganBoxText?: string;
    circulationClaim?: string;
    editionName?: string;
    editionDetails?: string;
    pagePriceDetails?: string;
    websiteDisplayUrl?: string;
    epaperLogoUrl?: string;
    epaperLogoHeight?: number;
    showSiteNameWithLogo?: boolean;
    paperTone?: 'crisp_white' | 'natural_newsprint' | 'warm_broadsheet';
    showTopEarCards?: boolean;
    showPrintStripBanner?: boolean;
    printStripBannerTitle?: string;
    printStripBannerSubtitle?: string;
    leftEarWeather?: string;
    leftEarGold?: string;
    leftEarDse?: string;
    showPrayerTimesEar?: boolean;
    prayerTimesText?: string;
    editorialNoteTitle?: string;
    editorialNoteQuote?: string;
    footerCredits?: string;
    gridColumns?: 3 | 4 | 5;
    columnGap?: 'compact' | 'normal' | 'relaxed';
    showAdBox?: boolean;
    adBoxTitle?: string;
    adBoxEmail?: string;
    newspaperEditionText?: string;
  };
  // Dedicated Print View Controller (100% Inch-by-inch control)
  printViewConfig?: {
    headerStyle?: 'classic_masthead' | 'modern_minimal' | 'bordered_broadsheet';
    imageLayout?: 'compact_float' | 'top_banner' | 'hidden';
    textColumns?: 1 | 2 | 3;
    fontSize?: 'small' | 'medium' | 'large';
    showQrCode?: boolean;
    showEditorialDisclaimer?: boolean;
    disclaimerText?: string;
    footerWatermark?: string;
    printEditionSubtitle?: string;
    showPublicationCredits?: boolean;
  };
  // Dynamic Site Color Theme and Font Size Adjuster
  themeConfig?: {
    primaryColor?: string;
    fontSizeScale?: 'standard' | 'large' | 'extra-large' | 'xx-large';
    baseFontSizePx?: number; // e.g. 18 (2 steps larger than standard 16)
  };
  // Smart Photo Card Studio Default Configuration (100% Admin Controlled)
  photoCardConfig?: {
    defaultTemplate?: string;
    defaultAspectRatio?: '1:1' | '16:9' | '4:5' | '9:16' | 'custom';
    customBackgroundUrl?: string;
    overlayPosition?: 'bottom' | 'center' | 'top';
    overlayDarkness?: number;
    showNewsThumbnail?: boolean;
    overlayTextColor?: 'white' | 'dark' | 'amber';
    accentColor?: string;
    headlineFontSize?: number;
    headlineLineHeight?: number;
    headlineAlignment?: 'left' | 'center' | 'right';
    backgroundTheme?: string;
    gradientStyle?: string;
    customBackgroundColor?: string;
    frameBorderColor?: 'gold' | 'white' | 'red' | 'none';
    logoSize?: 'sm' | 'md' | 'lg';
    logoPosition?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
    showWatermark?: boolean;
    showSocialHandles?: boolean;
    socialHandleText?: string;
    showCommentPrompt?: boolean;
    commentPromptText?: string;
    showDateBadge?: boolean;
    showAppBadges?: boolean;
    customFrameMode?: 'overlay' | 'background';
    enableFrameOverlay?: boolean;
  };
  // Mobile App Store & Google Play Download Badges Controller (Requirement 4)
  mobileAppBadges?: MobileAppBadgesConfig;
  // Secret Token Guard & Admin Route Isolation
  adminSecurity?: AdminSecurityConfig;
}

export interface AdminSecurityConfig {
  secretToken?: string;
  enabled?: boolean;
  hideAdminButtonFromPublic?: boolean;
  secretSlug?: string;
}

export interface MobileAppBadgesConfig {
  showInFooter?: boolean;
  showGooglePlay?: boolean;
  googlePlayUrl?: string;
  showAppStore?: boolean;
  appStoreUrl?: string;
  badgeTitleBn?: string;
  badgeSubtitleBn?: string;
}

export interface CloudStorageConfig {
  provider: 'local' | 'cloudinary' | 's3';
  autoWebp: boolean;
  quality: 'auto' | 'high' | 'eco';
  cloudinary: {
    cloudName: string;
    apiKey: string;
    apiSecret?: string;
    uploadPreset: string;
  };
  s3: {
    accessKeyId: string;
    secretAccessKey?: string;
    bucketName: string;
    region: string;
    cdnDomain?: string;
    endpoint?: string;
  };
}

export interface NewsSourceItem {
  id: string;
  name: string;
  url: string;
  rssFeedUrl?: string;
  category: string;
  logoUrl?: string;
  isActive: boolean;
  isTrendingOnly: boolean;
  totalFetched: number;
  lastFetchedAt?: string;
}

export interface AutoAggregatorSettings {
  isEnabled: boolean;
  fetchIntervalMinutes: number; // 30, 60, 120, etc.
  directPublish: boolean; // true = directly live, false = queue in drafts/pending
  filterTrendingOnly: boolean;
  autoAiRewrite: boolean;
  autoImageOptimization: boolean;
  targetAuthorName: string;
  lastRunAt?: string;
  nextRunAt?: string;
}

export interface NewsDeskQueueItem {
  id: string;
  sourceId: string;
  sourceName: string;
  originalTitle: string;
  originalUrl: string;
  rewrittenTitle: string;
  rewrittenExcerpt: string;
  rewrittenContent: string;
  imageUrl: string;
  category: string;
  status: 'draft' | 'published' | 'rejected';
  fetchedAt: string;
  publishedAt?: string;
  isTrending: boolean;
}

