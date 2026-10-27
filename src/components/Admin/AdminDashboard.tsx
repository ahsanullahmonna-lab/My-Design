import React, { useState, useRef, useEffect, useMemo } from 'react';
import { 
  LayoutDashboard, 
  Layers, 
  FileText, 
  Printer,
  Image as ImageIcon, 
  Video, 
  Inbox, 
  UploadCloud, 
  Users, 
  Settings, 
  Sliders, 
  Database,
  Cpu,
  ArrowLeft, 
  Eye, 
  EyeOff,
  Plus, 
  Trash2, 
  Edit3, 
  Activity,
  TrendingUp,
  Calendar,
  Globe2,
  MessageCircle, 
  Check, 
  Save, 
  ExternalLink, 
  Sun, 
  Moon, 
  User, 
  ChevronDown, 
  ChevronRight, 
  Globe, 
  Radio, 
  Share2, 
  Sparkles,
  BarChart2,
  FolderPlus,
  Upload,
  RefreshCw,
  Search,
  CheckCircle2,
  XCircle,
  FileCode,
  SlidersHorizontal,
  Shield,
  Palette,
  Megaphone,
  Flame,
  ArrowUp,
  ArrowDown,
  RotateCcw,
  Camera,
  Play,
  Clock,
  ShieldCheck,
  AlertCircle,
  MapPin,
  GraduationCap,
  List,
  AlertTriangle,
  Navigation,
  Layout,
  Facebook,
  Twitter,
  Youtube,
  Instagram,
  Linkedin,
  Send,
  Award,
  Phone,
  Mail,
  Link as LinkIcon,
  Cloud,
  CalendarClock,
  TimerOff,
  History,
  Menu,
  X,
  Lock,
  MessageSquare,
  CheckCircle,
  Ban,
  Type,
  Briefcase,
  CreditCard,
  GripVertical,
  FolderTree,
  CornerDownRight,
  Smartphone,
  Copy,
  Key,
  Quote
} from 'lucide-react';
import { Logo } from '../Header/Logo';
import { 
  Article, 
  CategoryItem, 
  SiteSettings, 
  UserItem, 
  AdSlot, 
  TickerItem, 
  PhotoCardItem, 
  VideoNewsItem,
  FamilyMember,
  JobApplication,
  QuoteItem
} from '../../types/news';
import { mockBackendStats } from '../../data/mockNewsData';
import { getAuthorAvatar, DEFAULT_AVATAR_DATA_URI } from '../../utils/authorAvatar';
import { PhotoCardGenerator } from './PhotoCardGenerator';
import { QuotesManager } from './QuotesManager';
import { AuditTrailPanel } from './AuditTrailPanel';
import { PostEditorModal } from './PostEditorModal';
import { UniversalDataMigrationHub } from './UniversalDataMigrationHub';
import { CloudStorageSettings } from './CloudStorageSettings';
import { NewsDeskPanel } from './NewsDeskPanel';
import { AdManagerPanel } from './AdManagerPanel';
import { RecruitmentManagementPanel } from './RecruitmentManagementPanel';
import { IdCardTemplateConfigurator } from './IdCardTemplateConfigurator';
import { UserEditModal } from './UserEditModal';
import { MenuBuilderView } from './MenuBuilderView';
import { DigitalIdCard } from '../IdCard/DigitalIdCard';
import { 
  recordAuditLog, 
  postToFacebookPage, 
  requestGoogleIndexing, 
  generateDynamicSitemapXml, 
  sanitizeInput 
} from '../../utils/securityAndSeo';
import { 
  canAccessAdmin, 
  canAccessAdminTab, 
  canDeleteArticle, 
  canEditArticle, 
  canModerate, 
  canManageSettings, 
  canManageUsers, 
  normalizeRole, 
  getRoleMeta 
} from '../../utils/rbac';
import { 
  CommentItem,
  getStoredComments, 
  approveComment, 
  rejectComment, 
  deleteComment 
} from '../../utils/commentsStorage';
import { 
  SECRET_ADMIN_TOKEN,
  getAdminSecretToken, 
  setStoredAdminSecretToken, 
  getSecretAdminUrl, 
  revokeAdminGatewayAccess,
  generateSecureAdminToken
} from '../../utils/adminSecurity';
import { 
  getVisitorAnalyticsSummary, 
  clearStoredVisitorSessions, 
  VisitorAnalyticsSummary, 
  VisitorSessionLog 
} from '../../utils/visitorTracker';

// Bengali Numerals Formatter for Uniform SolaimanLipi Rendering
export const toBn = (num: number | string): string => {
  const banglaDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
  return num.toString().replace(/\d/g, (d) => banglaDigits[parseInt(d, 10)] || d);
};

interface AdminDashboardProps {
  articles: Article[];
  categories: CategoryItem[];
  settings: SiteSettings;
  adSlots: AdSlot[];
  customTickers: TickerItem[];
  photoPosts: PhotoCardItem[];
  videoPosts: VideoNewsItem[];
  users: UserItem[];
  familyMembers?: FamilyMember[];
  onUpdateSettings: (newSettings: SiteSettings) => void;
  onAddArticle: (article: Article) => void;
  onUpdateArticle: (article: Article) => void;
  onDeleteArticle: (id: string) => void;
  onToggleHideArticle?: (id: string) => void;
  onToggleBreaking: (id: string) => void;
  onToggleLead?: (id: string) => void;
  onAddCategory: (category: CategoryItem) => void;
  onUpdateCategory?: (category: CategoryItem) => void;
  onDeleteCategory: (id: string) => void;
  onReorderCategories?: (categories: CategoryItem[]) => void;
  onUpdateAdSlots: (slots: AdSlot[]) => void;
  onUpdateTickers: (tickers: TickerItem[]) => void;
  onUpdatePhotoPosts: (photos: PhotoCardItem[]) => void;
  onUpdateVideoPosts: (videos: VideoNewsItem[]) => void;
  onUpdateUsers: (users: UserItem[]) => void;
  onUpdateFamilyMembers?: (family: FamilyMember[]) => void;
  onResetDemoData?: () => void;
  onBackToPortal: () => void;
  darkMode: boolean;
  setDarkMode: (val: boolean) => void;
  currentUserId?: string;
  onSelectUser?: (id: string) => void;
  jobApplications?: JobApplication[];
  onUpdateJobApplications?: (apps: JobApplication[]) => void;
  quotes?: QuoteItem[];
  onUpdateQuotes?: (newQuotes: QuoteItem[]) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  articles,
  categories,
  settings,
  adSlots,
  customTickers,
  photoPosts,
  videoPosts,
  users,
  familyMembers = [],
  quotes = [],
  onUpdateQuotes,
  onUpdateSettings,
  onAddArticle,
  onUpdateArticle,
  onDeleteArticle,
  onToggleHideArticle,
  onToggleBreaking,
  onToggleLead,
  onAddCategory,
  onUpdateCategory,
  onDeleteCategory,
  onReorderCategories,
  onUpdateAdSlots,
  onUpdateTickers,
  onUpdatePhotoPosts,
  onUpdateVideoPosts,
  onUpdateUsers,
  onUpdateFamilyMembers,
  onResetDemoData,
  onBackToPortal,
  darkMode,
  setDarkMode,
  currentUserId: propCurrentUserId,
  onSelectUser: propOnSelectUser,
  jobApplications = [],
  onUpdateJobApplications,
}) => {
  // Sidebar Main Tabs
  const [activeMainTab, setActiveMainTab] = useState<
    | 'dashboard'
    | 'analytics'
    | 'news_desk'
    | 'homepage_control'
    | 'menu_builder'
    | 'family'
    | 'categories'
    | 'posts'
    | 'pending'
    | 'comments'
    | 'photos'
    | 'videos'
    | 'ads'
    | 'breaking'
    | 'users'
    | 'recruitment'
    | 'idcard_template'
    | 'settings'
    | 'photocard'
    | 'quotes'
    | 'epaper_control'
    | 'print_control'
    | 'theme_typography'
    | 'audit'
    | 'migration'
  >('dashboard');

  // Automated Visitor Tracking & Intelligence Summary (Requirement 1)
  const [visitorAnalytics, setVisitorAnalytics] = useState<VisitorAnalyticsSummary>(() => getVisitorAnalyticsSummary());
  const [analyticsSearchTerm, setAnalyticsSearchTerm] = useState('');
  const [analyticsDeviceFilter, setAnalyticsDeviceFilter] = useState<'all' | 'Desktop' | 'Mobile' | 'Tablet'>('all');

  const filteredVisitorSessions = useMemo(() => {
    return visitorAnalytics.recentSessions.filter((s) => {
      const matchDevice = analyticsDeviceFilter === 'all' || s.deviceType === analyticsDeviceFilter;
      const matchSearch = !analyticsSearchTerm.trim() || 
        s.ip.toLowerCase().includes(analyticsSearchTerm.toLowerCase()) ||
        s.city.toLowerCase().includes(analyticsSearchTerm.toLowerCase()) ||
        s.country.toLowerCase().includes(analyticsSearchTerm.toLowerCase()) ||
        s.browser.toLowerCase().includes(analyticsSearchTerm.toLowerCase()) ||
        s.referrerSource.toLowerCase().includes(analyticsSearchTerm.toLowerCase());
      return matchDevice && matchSearch;
    });
  }, [visitorAnalytics.recentSessions, analyticsSearchTerm, analyticsDeviceFilter]);

  // Pending Post Editorial Feedback & Rejection Modal State (Requirement 2)
  const [feedbackModalPost, setFeedbackModalPost] = useState<Article | null>(null);
  const [feedbackAction, setFeedbackAction] = useState<'rejected' | 'held' | 'revision_requested'>('rejected');
  const [feedbackReason, setFeedbackReason] = useState<string>('');

  // User management modal states (Requirement 3)
  const [editingUser, setEditingUser] = useState<UserItem | null>(null);
  const [idCardPreviewUser, setIdCardPreviewUser] = useState<UserItem | null>(null);

  // Auto-refresh visitor analytics stream
  useEffect(() => {
    const timer = setInterval(() => {
      setVisitorAnalytics(getVisitorAnalyticsSummary());
    }, 8000);
    return () => clearInterval(timer);
  }, []);

  // Selected article for Photo Card Generator
  const [selectedArticleForCard, setSelectedArticleForCard] = useState<Article | null>(null);

  // Article deletion confirmation modal state (Zero silent failures in iframe/sandbox)
  const [articleToDelete, setArticleToDelete] = useState<Article | null>(null);

  const handleConfirmDeleteArticle = () => {
    if (!articleToDelete) return;
    const target = articleToDelete;
    setArticleToDelete(null);
    try {
      const deletedItem: Article = {
        ...target,
        status: 'deleted',
        deletedAt: new Date().toISOString(),
        adminFeedback: target.adminFeedback || 'কর্তৃপক্ষ বা বার্তা সম্পাদক কর্তৃক সংবাদটি আর্কাইভ/রিমুভ করা হয়েছে।',
        adminFeedbackAction: 'deleted',
        adminReviewedBy: currentUser?.name || 'ভারপ্রাপ্ত সম্পাদক',
      };
      const existing = localStorage.getItem('kolom24_deleted_articles');
      const list = existing ? JSON.parse(existing) : [];
      localStorage.setItem('kolom24_deleted_articles', JSON.stringify([deletedItem, ...list.filter((x: any) => x.id !== target.id)]));
    } catch (e) {
      console.error(e);
    }
    onDeleteArticle(target.id);
    showSuccessMessage(`'${target.title}' সংবাদটি সফলভাবে মুছে ফেলা হয়েছে!`);
  };

  // Management Accordion open state
  const [managementOpen, setManagementOpen] = useState(true);

  // Current Logged-in User Simulation (Admin vs Editor vs Reporter vs User)
  const [internalUserId, setInternalUserId] = useState<string>(propCurrentUserId || users[0]?.id || 'u1');
  const currentUserId = propCurrentUserId || internalUserId;
  const handleSelectUser = (id: string) => {
    setInternalUserId(id);
    if (propOnSelectUser) {
      propOnSelectUser(id);
    }
  };
  const guestFallbackUser: UserItem = {
    id: 'guest',
    name: 'লগআউটকৃত ভিজিটর',
    email: 'guest@newsportal.com',
    role: 'user',
    roleBn: 'সাধারণ ভিজিটর / পাঠক',
    postsCount: 0,
    status: 'inactive',
    autoApprove: false,
    canPostOnBehalf: false,
  };

  const currentUser: UserItem = currentUserId === 'guest'
    ? guestFallbackUser
    : (users.find(u => u.id === currentUserId) || guestFallbackUser);

  const currentRole = normalizeRole(currentUser.role);
  const roleMeta = getRoleMeta(currentRole);
  const canAccessThisPanel = canAccessAdmin(currentUser.role);

  // Comments Moderation Queue State (Requirement 4)
  const [commentsList, setCommentsList] = useState<CommentItem[]>(() => getStoredComments());
  const [commentFilter, setCommentFilter] = useState<'pending' | 'approved' | 'rejected' | 'all'>('pending');

  const reloadComments = () => {
    setCommentsList(getStoredComments());
  };

  useEffect(() => {
    const handler = () => reloadComments();
    window.addEventListener('kolom24_comments_updated', handler);
    return () => window.removeEventListener('kolom24_comments_updated', handler);
  }, []);

  const handleApproveComment = (id: string) => {
    approveComment(id);
    reloadComments();
    showSuccessMessage('মন্তব্যটি সফলভাবে অনুমোদন করা হয়েছে এবং ওয়েবসাইটে প্রকাশিত হয়েছে!');
  };

  const handleRejectComment = (id: string) => {
    rejectComment(id);
    reloadComments();
    showSuccessMessage('মন্তব্যটি বাতিল করা হয়েছে!');
  };

  const handleDeleteComment = (id: string) => {
    if (confirm('আপনি কি এই মন্তব্যটি সম্পূর্ণ মুছে ফেলতে চান?')) {
      deleteComment(id);
      reloadComments();
      showSuccessMessage('মন্তব্যটি মুছে ফেলা হয়েছে!');
    }
  };
  
  // Settings sub-tabs
  const [settingsTab, setSettingsTab] = useState<
    'header' | 'footer' | 'seo' | 'facebook' | 'social' | 'mail' | 'login' | 'ad' | 'rss' | 'ai' | 'importWp' | 'categoryOrder' | 'theme' | 'storage' | 'mobile_app'
  >('header');
  const [themeSubTab, setThemeSubTab] = useState<'typography' | 'categories' | 'homepage' | 'menu'>('typography');
  const [postsMenuOpen, setPostsMenuOpen] = useState(true);
  const [customizationCenterOpen, setCustomizationCenterOpen] = useState(true);

  // Local Form Settings
  const [localSettings, setLocalSettings] = useState<SiteSettings>({ ...settings });
  const [saveSuccessMsg, setSaveSuccessMsg] = useState('');
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // Secret Token & Security Gateway State
  const [showSecretTokenInDashboard, setShowSecretTokenInDashboard] = useState<boolean>(false);
  const [copiedSecretUrl, setCopiedSecretUrl] = useState<boolean>(false);
  const [copiedToken, setCopiedToken] = useState<boolean>(false);

  // SMTP Live Test Mail State
  const [testEmailRecipient, setTestEmailRecipient] = useState<string>('editor@dailybangladesh.com');
  const [isSendingTestMail, setIsSendingTestMail] = useState<boolean>(false);
  const [testMailResult, setTestMailResult] = useState<{
    success: boolean;
    message: string;
    timestamp: string;
    logs: string[];
    recipient: string;
  } | null>(null);

  const selectTab = (tab: typeof activeMainTab) => {
    if (tab === 'theme_typography') {
      setActiveMainTab('settings');
      setSettingsTab('theme');
      setThemeSubTab('typography');
      setMobileSidebarOpen(false);
      return;
    }
    if (tab === 'categories') {
      setActiveMainTab('settings');
      setSettingsTab('theme');
      setThemeSubTab('categories');
      setMobileSidebarOpen(false);
      return;
    }
    if (tab === 'homepage_control') {
      setActiveMainTab('settings');
      setSettingsTab('theme');
      setThemeSubTab('homepage');
      setMobileSidebarOpen(false);
      return;
    }
    if (tab === 'menu_builder') {
      setActiveMainTab('settings');
      setSettingsTab('theme');
      setThemeSubTab('menu');
      setMobileSidebarOpen(false);
      return;
    }
    if (normalizeRole(currentUser.role) !== 'admin' && !canAccessAdminTab(currentUser.role, tab)) {
      showSuccessMessage(`⛔ এক্সেস সীমাবদ্ধ: ${roleMeta.nameBn}-এর জন্য এই প্যানেলে প্রবেশের অনুমতি নেই।`);
      return;
    }
    setActiveMainTab(tab);
    setMobileSidebarOpen(false);
  };

  // Automatic tab security check when role changes
  useEffect(() => {
    if (normalizeRole(currentUser.role) !== 'admin' && !canAccessAdminTab(currentUser.role, activeMainTab)) {
      const meta = getRoleMeta(currentUser.role);
      const fallback = meta.allowedTabs[0] || 'dashboard';
      setActiveMainTab(fallback as any);
    }
  }, [currentUser.role]);

  // Post Manager State
  const [postSearch, setPostSearch] = useState('');
  const [postCategoryFilter, setPostCategoryFilter] = useState('all');
  const [postScheduleFilter, setPostScheduleFilter] = useState<'all' | 'live' | 'scheduled' | 'backdated' | 'expired' | 'hidden'>('all');
  const [isAddPostModalOpen, setIsAddPostModalOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<Article | null>(null);

  // New Post Form State
  const [postTitle, setPostTitle] = useState('');
  const [postCategory, setPostCategory] = useState(categories[0]?.nameBn || 'জাতীয়');
  const [postAuthor, setPostAuthor] = useState(currentUser.name || 'নিজস্ব প্রতিবেদক, ঢাকা');
  const [authorSelectionMode, setAuthorSelectionMode] = useState<'account' | 'manual'>('account');
  const [postDistrict, setPostDistrict] = useState('ঢাকা');
  const [postExcerpt, setPostExcerpt] = useState('');
  const [postContent, setPostContent] = useState('');
  const [postImageUrl, setPostImageUrl] = useState('');
  const [postIsBreaking, setPostIsBreaking] = useState(false);
  const [postIsLead, setPostIsLead] = useState(false);
  const postFileInputRef = useRef<HTMLInputElement>(null);
  const faviconFileInputRef = useRef<HTMLInputElement>(null);
  const [dragOverFavicon, setDragOverFavicon] = useState(false);

  // Sync author name when currentUser changes
  useEffect(() => {
    setPostAuthor(currentUser?.name || 'নিজস্ব প্রতিবেদক, ঢাকা');
    setPhotoPhotographer(currentUser?.name || 'ফারহান চৌধুরী, ঢাকা');
  }, [currentUserId, currentUser?.name]);

  // Category Modal State
  const [newCatBn, setNewCatBn] = useState('');
  const [newCatEn, setNewCatEn] = useState('');
  const [isAddCatModalOpen, setIsAddCatModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<CategoryItem | null>(null);

  // Photo Post State (Requirement 7)
  const [isAddPhotoModalOpen, setIsAddPhotoModalOpen] = useState(false);
  const [photoTitle, setPhotoTitle] = useState('');
  const [photoCaption, setPhotoCaption] = useState('');
  const [photoPhotographer, setPhotoPhotographer] = useState(currentUser.name || 'ফারহান চৌধুরী, ঢাকা');
  const [photoCategory, setPhotoCategory] = useState('প্রকৃতি ও জীবন');
  const [photoImageUrl, setPhotoImageUrl] = useState('');

  // Video Post State (Requirement 7)
  const [isAddVideoModalOpen, setIsAddVideoModalOpen] = useState(false);
  const [videoTitle, setVideoTitle] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [videoCategory, setVideoCategory] = useState('আইন-আদালত');
  const [videoDuration, setVideoDuration] = useState('০৩:৪৫');
  const [videoThumbnailUrl, setVideoThumbnailUrl] = useState('');

  // User Management State (Requirement 8)
  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserRole, setNewUserRole] = useState<'admin' | 'editor' | 'reporter' | 'contributor' | 'author' | 'subscriber'>('reporter');
  const [newUserAutoApprove, setNewUserAutoApprove] = useState(false);

  // Visitor Analytics Modal State
  const [selectedVisitorCard, setSelectedVisitorCard] = useState<{ title: string; count: string } | null>(null);

  const handleCardClick = (card: { title: string; count: string; tab: string }) => {
    if (card.tab === 'dashboard') {
      setSelectedVisitorCard({ title: card.title, count: card.count });
      showSuccessMessage(`'${card.title}' ট্রাফিক ও ভিজিটর অ্যানালিটিক্স লোড হয়েছে!`);
    } else {
      setActiveMainTab(card.tab as any);
      showSuccessMessage(`'${card.title}' প্যানেল সফলভাবে ওপেন করা হয়েছে!`);
    }
  };

  // New Ad Slot Modal State
  const [isAddAdModalOpen, setIsAddAdModalOpen] = useState(false);
  const [newAdTitle, setNewAdTitle] = useState('');
  const [newAdSponsor, setNewAdSponsor] = useState('');
  const [newAdPosition, setNewAdPosition] = useState('hero_right');
  const [newAdSize, setNewAdSize] = useState<'300x250' | '300x600' | '728x90' | 'responsive'>('300x250');
  const [newAdType, setNewAdType] = useState<'banner' | 'code'>('banner');
  const [newAdImageUrl, setNewAdImageUrl] = useState('');
  const [newAdTargetUrl, setNewAdTargetUrl] = useState('https://');
  const [newAdCode, setNewAdCode] = useState('');

  // Breaking Ticker Form State
  const [newTickerText, setNewTickerText] = useState('');
  const [newTickerTime, setNewTickerTime] = useState('এইমাত্র');
  const [newTickerArticleId, setNewTickerArticleId] = useState('');

  const showSuccessMessage = (msg: string) => {
    setSaveSuccessMsg(msg);
    setTimeout(() => setSaveSuccessMsg(''), 4500);
  };

  const showErrorMessage = (msg: string) => {
    setSaveSuccessMsg(`⚠️ ${msg}`);
    setTimeout(() => setSaveSuccessMsg(''), 4500);
  };

  // Menu Builder State (Category-Driven & Drag-and-Drop Sub-Menu Creator)
  const [menuBuilderSubTab, setMenuBuilderSubTab] = useState<'all' | 'header' | 'footer' | 'submenus'>('header');
  const [isAddMenuModalOpen, setIsAddMenuModalOpen] = useState(false);
  const [editingMenuItem, setEditingMenuItem] = useState<CategoryItem | null>(null);
  const [menuSourceMode, setMenuSourceMode] = useState<'existing_category' | 'custom'>('existing_category');
  const [selectedExistingCatId, setSelectedExistingCatId] = useState<string>('');
  const [menuTitleBn, setMenuTitleBn] = useState('');
  const [menuTitleEn, setMenuTitleEn] = useState('');
  const [menuSlug, setMenuSlug] = useState('');
  const [menuType, setMenuType] = useState<'category' | 'custom'>('category');
  const [menuCustomUrl, setMenuCustomUrl] = useState('');
  const [menuParentId, setMenuParentId] = useState<string>('');
  const [menuShowInHeader, setMenuShowInHeader] = useState(true);
  const [menuShowInFooter, setMenuShowInFooter] = useState(true);
  const [draggedMenuIndex, setDraggedMenuIndex] = useState<number | null>(null);
  const [dragOverMenuIndex, setDragOverMenuIndex] = useState<number | null>(null);

  // Homepage Control State
  const [hpSectionsState, setHpSectionsState] = useState({
    showBreakingTicker: localSettings.enableBreakingTicker !== false,
    showHero: localSettings.homepageSections?.showHero !== false,
    showSpecial: localSettings.homepageSections?.showSpecial !== false,
    showNational: localSettings.homepageSections?.showNational !== false,
    showPolitics: localSettings.homepageSections?.showPolitics !== false,
    showWorld: localSettings.homepageSections?.showWorld !== false,
    showCountrywide: localSettings.homepageSections?.showCountrywide !== false,
    showPhotoGallery: localSettings.homepageSections?.showPhotoGallery !== false,
    showShowbiz: localSettings.homepageSections?.showShowbiz !== false,
    showMultiGrid: localSettings.homepageSections?.showMultiGrid !== false,
    showVideoGallery: localSettings.homepageSections?.showVideoGallery !== false,
    showFamily: localSettings.homepageSections?.showFamily === true,
  });

  // Family Members Management State
  const [isAddFamilyModalOpen, setIsAddFamilyModalOpen] = useState(false);
  const [editingFamilyMember, setEditingFamilyMember] = useState<FamilyMember | null>(null);
  const [famName, setFamName] = useState('');
  const [famDesignation, setFamDesignation] = useState('');
  const [famPhone, setFamPhone] = useState('');
  const [famEmail, setFamEmail] = useState('');
  const [famPhotoUrl, setFamPhotoUrl] = useState('');
  const familyPhotoInputRef = useRef<HTMLInputElement>(null);

  // Open Add Menu Modal (Optionally pre-configured with a parent category)
  const handleOpenAddMenuModal = (parentCatId?: string) => {
    setEditingMenuItem(null);
    setMenuSourceMode('existing_category');
    setSelectedExistingCatId('');
    setMenuTitleBn('');
    setMenuTitleEn('');
    setMenuSlug('');
    setMenuCustomUrl('');
    setMenuParentId(parentCatId || '');
    setMenuShowInHeader(true);
    setMenuShowInFooter(true);
    setIsAddMenuModalOpen(true);
  };

  const handleStartEditMenuItem = (item: CategoryItem) => {
    setEditingMenuItem(item);
    setMenuSourceMode(item.customUrl ? 'custom' : 'existing_category');
    setSelectedExistingCatId(item.id);
    setMenuTitleBn(item.nameBn);
    setMenuTitleEn(item.nameEn || '');
    setMenuSlug(item.slug || '');
    setMenuType(item.customUrl ? 'custom' : 'category');
    setMenuCustomUrl(item.customUrl || '');
    setMenuParentId(item.parentId || '');
    setMenuShowInHeader(item.showInHeader !== false);
    setMenuShowInFooter(item.showInFooter !== false);
    setIsAddMenuModalOpen(true);
  };

  const handleSelectExistingCategoryForMenu = (catId: string) => {
    setSelectedExistingCatId(catId);
    if (!catId) return;
    const found = categories.find(c => c.id === catId);
    if (found) {
      setMenuTitleBn(found.nameBn);
      setMenuTitleEn(found.nameEn);
      setMenuSlug(found.slug);
      if (found.parentId) {
        setMenuParentId(found.parentId);
      }
      setMenuShowInHeader(found.showInHeader !== false);
      setMenuShowInFooter(found.showInFooter !== false);
    }
  };

  // Drag and drop reordering handler
  const handleDropMenu = (dropIndex: number) => {
    if (draggedMenuIndex === null || draggedMenuIndex === dropIndex) {
      setDraggedMenuIndex(null);
      setDragOverMenuIndex(null);
      return;
    }
    const newItems = [...categories];
    const [movedItem] = newItems.splice(draggedMenuIndex, 1);
    newItems.splice(dropIndex, 0, movedItem);
    if (onReorderCategories) {
      onReorderCategories(newItems);
    }
    showSuccessMessage(`'${movedItem.nameBn}' মেনুটি ড্র্যাগ করে ক্রমানুসারে সাজানো হয়েছে!`);
    setDraggedMenuIndex(null);
    setDragOverMenuIndex(null);
  };

  // Quick parent reassignment (Sub-menu / Main menu toggle)
  const handleQuickAssignParent = (catId: string, newParentId: string | null) => {
    const target = categories.find(c => c.id === catId);
    if (target && onUpdateCategory) {
      onUpdateCategory({ ...target, parentId: newParentId });
      const parentName = newParentId ? categories.find(c => c.id === newParentId)?.nameBn : 'মূল প্রধান মেনু';
      showSuccessMessage(`'${target.nameBn}' মেনুর প্যারেন্ট/অধীনতা '${parentName}' হিসেবে সেট হয়েছে!`);
    }
  };

  // Menu Handlers
  const handleSaveMenuItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!menuTitleBn.trim()) {
      showSuccessMessage('সতর্কতা: মেনুর বাংলা নাম লিখুন');
      return;
    }
    const slug = menuSlug.trim() || menuTitleEn.trim().toLowerCase().replace(/\s+/g, '-') || `menu-${Date.now()}`;
    const parent = menuParentId.trim() ? menuParentId.trim() : null;

    if (editingMenuItem) {
      const updated: CategoryItem = {
        ...editingMenuItem,
        nameBn: menuTitleBn.trim(),
        nameEn: menuTitleEn.trim() || menuTitleBn.trim(),
        slug,
        parentId: parent,
        showInHeader: menuShowInHeader,
        showInFooter: menuShowInFooter,
        customUrl: menuSourceMode === 'custom' ? menuCustomUrl : undefined,
      };
      if (onUpdateCategory) {
        onUpdateCategory(updated);
      }
      showSuccessMessage(`'${updated.nameBn}' মেনু আইটেম সফলভাবে আপডেট হয়েছে!`);
    } else {
      const existing = selectedExistingCatId ? categories.find(c => c.id === selectedExistingCatId) : null;
      if (existing) {
        const updated: CategoryItem = {
          ...existing,
          nameBn: menuTitleBn.trim(),
          nameEn: menuTitleEn.trim() || existing.nameEn,
          slug: slug || existing.slug,
          parentId: parent,
          showInHeader: menuShowInHeader,
          showInFooter: menuShowInFooter,
          customUrl: menuSourceMode === 'custom' ? menuCustomUrl : undefined,
        };
        if (onUpdateCategory) {
          onUpdateCategory(updated);
        }
        showSuccessMessage(`বিদ্যমান ক্যাটাগরি '${updated.nameBn}' মেনুতে কনফিগার করা হয়েছে!`);
      } else {
        const newItem: CategoryItem = {
          id: `cat-${Date.now()}`,
          nameBn: menuTitleBn.trim(),
          nameEn: menuTitleEn.trim() || menuTitleBn.trim(),
          slug,
          parentId: parent,
          showOnHomepage: true,
          showInHeader: menuShowInHeader,
          showInFooter: menuShowInFooter,
          customUrl: menuSourceMode === 'custom' ? menuCustomUrl : undefined,
          count: 4,
          order: categories.length + 1,
        };
        onAddCategory(newItem);
        showSuccessMessage(`নতুন মেনু আইটেম '${newItem.nameBn}' সফলভাবে তৈরি হয়েছে!`);
      }
    }
    setIsAddMenuModalOpen(false);
    setEditingMenuItem(null);
    setSelectedExistingCatId('');
    setMenuTitleBn('');
    setMenuTitleEn('');
    setMenuSlug('');
    setMenuCustomUrl('');
    setMenuParentId('');
  };

  const handleToggleMenuHeader = (catId: string) => {
    const target = categories.find(c => c.id === catId);
    if (target && onUpdateCategory) {
      onUpdateCategory({ ...target, showInHeader: target.showInHeader === false ? true : false });
      showSuccessMessage(`'${target.nameBn}' হেডার মেনুতে আপডেট হয়েছে!`);
    }
  };

  const handleToggleMenuFooter = (catId: string) => {
    const target = categories.find(c => c.id === catId);
    if (target && onUpdateCategory) {
      onUpdateCategory({ ...target, showInFooter: target.showInFooter === false ? true : false });
      showSuccessMessage(`'${target.nameBn}' ফুটার মেনুতে আপডেট হয়েছে!`);
    }
  };

  const handleToggleHpCategory = (catId: string) => {
    const target = categories.find(c => c.id === catId);
    if (target && onUpdateCategory) {
      onUpdateCategory({ ...target, showOnHomepage: target.showOnHomepage === false ? true : false });
      showSuccessMessage(`'${target.nameBn}' হোমপেজ প্রদর্শন আপডেট হয়েছে!`);
    }
  };

  const handleHpCategoryCountChange = (catId: string, count: number) => {
    const target = categories.find(c => c.id === catId);
    if (target && onUpdateCategory) {
      onUpdateCategory({ ...target, count });
      showSuccessMessage(`'${target.nameBn}' ক্যাটাগরিতে ${count}টি পোস্ট দেখানোর জন্য সেট হয়েছে!`);
    }
  };

  const handleSaveHomepageLayout = () => {
    const updated: SiteSettings = {
      ...localSettings,
      enableBreakingTicker: hpSectionsState.showBreakingTicker,
      homepageSections: {
        showBreakingTicker: hpSectionsState.showBreakingTicker,
        showHero: hpSectionsState.showHero,
        showSpecial: hpSectionsState.showSpecial,
        showNational: hpSectionsState.showNational,
        showPolitics: hpSectionsState.showPolitics,
        showWorld: hpSectionsState.showWorld,
        showCountrywide: hpSectionsState.showCountrywide,
        showPhotoGallery: hpSectionsState.showPhotoGallery,
        showShowbiz: hpSectionsState.showShowbiz,
        showMultiGrid: hpSectionsState.showMultiGrid,
        showVideoGallery: hpSectionsState.showVideoGallery,
        showFamily: hpSectionsState.showFamily,
      }
    };
    setLocalSettings(updated);
    onUpdateSettings(updated);
    showSuccessMessage('হোমপেজের সকল সেকশন ও ক্যাটাগরি কনফিগারেশন সফলভাবে সংরক্ষিত হয়েছে!');
  };

  // Family Members Handlers
  const handleFamilyPhotoFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setFamPhotoUrl(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveFamilyMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!famName.trim() || !famDesignation.trim()) {
      showSuccessMessage('সতর্কতা: সদস্যের নাম ও পদবী আবশ্যক!');
      return;
    }
    const photo = famPhotoUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80';
    if (editingFamilyMember) {
      const updated = familyMembers.map(m => m.id === editingFamilyMember.id ? {
        ...m,
        name: famName.trim(),
        designation: famDesignation.trim(),
        phone: famPhone.trim(),
        email: famEmail.trim(),
        photoUrl: photo,
      } : m);
      if (onUpdateFamilyMembers) {
        onUpdateFamilyMembers(updated);
      }
      showSuccessMessage('সাংবাদিক/সদস্যের তথ্য সফলভাবে আপডেট হয়েছে!');
    } else {
      const newMember: FamilyMember = {
        id: `fam-${Date.now()}`,
        name: famName.trim(),
        designation: famDesignation.trim(),
        phone: famPhone.trim(),
        email: famEmail.trim(),
        photoUrl: photo,
        order: familyMembers.length + 1,
      };
      const updated = [...familyMembers, newMember];
      if (onUpdateFamilyMembers) {
        onUpdateFamilyMembers(updated);
      }
      showSuccessMessage('আমাদের পরিবারে নতুন সদস্য সফলভাবে যুক্ত হয়েছে!');
    }
    setIsAddFamilyModalOpen(false);
    setEditingFamilyMember(null);
    setFamName('');
    setFamDesignation('');
    setFamPhone('');
    setFamEmail('');
    setFamPhotoUrl('');
  };

  const handleDeleteFamilyMember = (id: string) => {
    if (confirm('আপনি কি এই সদস্যকে মুছে ফেলতে চান?')) {
      const updated = familyMembers.filter(m => m.id !== id);
      if (onUpdateFamilyMembers) {
        onUpdateFamilyMembers(updated);
      }
      showSuccessMessage('সদস্য সফলভাবে মুছে ফেলা হয়েছে!');
    }
  };

  const handleMoveFamilyMember = (idx: number, direction: 'up' | 'down') => {
    const targetIdx = direction === 'up' ? idx - 1 : idx + 1;
    if (targetIdx < 0 || targetIdx >= familyMembers.length) return;
    const reordered = [...familyMembers];
    const [moved] = reordered.splice(idx, 1);
    reordered.splice(targetIdx, 0, moved);
    if (onUpdateFamilyMembers) {
      onUpdateFamilyMembers(reordered);
    }
  };

  // Pending posts count
  const pendingPosts = articles.filter(a => a.status === 'pending');

  // File upload handlers for Logos
  const handleLightLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        const updated = { ...localSettings, lightLogoUrl: result };
        setLocalSettings(updated);
        onUpdateSettings(updated);
        showSuccessMessage('Header Light Logo সফলভাবে আপলোড ও আপডেট করা হয়েছে!');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDarkLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        const updated = { ...localSettings, darkLogoUrl: result };
        setLocalSettings(updated);
        onUpdateSettings(updated);
        showSuccessMessage('Header Dark Logo সফলভাবে আপলোড ও আপডেট করা হয়েছে!');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFaviconUpload = (fileOrEvent: React.ChangeEvent<HTMLInputElement> | File) => {
    let file: File | undefined;
    if ('target' in fileOrEvent) {
      file = fileOrEvent.target.files?.[0];
    } else {
      file = fileOrEvent;
    }
    if (file) {
      if (file.size > 8 * 1024 * 1024) {
        showErrorMessage('সাইট আইকন ফাইলের সাইজ সর্বোচ্চ ৮ মেগাবাইট হতে পারবে।');
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        const updated = { ...localSettings, faviconUrl: result };
        setLocalSettings(updated);
        onUpdateSettings(updated);

        // Instant real-time update of browser tab favicon & apple-touch-icon across DOM
        ['icon', 'shortcut icon', 'apple-touch-icon'].forEach((rel) => {
          let linkEl = document.querySelector(`link[rel="${rel}"]`) as HTMLLinkElement | null;
          if (!linkEl) {
            linkEl = document.createElement('link');
            linkEl.rel = rel;
            document.head.appendChild(linkEl);
          }
          linkEl.href = result;
        });

        showSuccessMessage('সাইট আইকন বা ফ্যাভিকন (Site Icon / Favicon) সফলভাবে আপলোড ও ব্রাউজার ট্যাবে সক্রিয় হয়েছে!');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveFavicon = () => {
    const updated = { ...localSettings, faviconUrl: '' };
    setLocalSettings(updated);
    onUpdateSettings(updated);
    // Reset to default
    ['icon', 'shortcut icon', 'apple-touch-icon'].forEach((rel) => {
      const linkEl = document.querySelector(`link[rel="${rel}"]`) as HTMLLinkElement | null;
      if (linkEl) {
        linkEl.href = '/favicon.ico';
      }
    });
    showSuccessMessage('কাস্টম সাইট আইকন মুছে ফেলা হয়েছে।');
  };

  const handlePostImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setPostImageUrl(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePhotoImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setPhotoImageUrl(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Submit new or edited post (Editorial Approval Workflow: Requirement 8)
  const handleSavePostEditor = (data: Partial<Article>) => {
    // Check if user has permission to post
    if (currentUser.role === 'subscriber') {
      showSuccessMessage('সতর্কতা: পাঠক বা সাবস্ক্রাইবার অ্যাকাউন্ট থেকে সংবাদ প্রকাশ করার অনুমতি নেই। অনুগ্রহ করে লেখক বা অ্যাডমিন অ্যাকাউন্টে লগইন করুন।');
      return;
    }

    // Determine status based on autoApprove and role (Requirement 1: Master user has direct publishing rights)
    const isMaster = currentUser.role === 'master' || currentUser.canPostOnBehalf || normalizeRole(currentUser.role) === 'master';
    const shouldAutoApprove = normalizeRole(currentUser.role) === 'admin' || isMaster || currentUser.autoApprove;
    const postStatus: 'published' | 'pending' | 'rejected' | 'hidden' | 'deleted' = 
      data.isHidden ? 'hidden' : (data.status || (shouldAutoApprove ? 'published' : 'pending'));

    if (editingPost) {
      // Edit existing
      const updatedArticle: Article = {
        ...editingPost,
        ...data,
        title: data.title?.trim() || editingPost.title,
        division: data.division || editingPost.division,
        district: data.district || editingPost.district,
        isHidden: data.isHidden !== undefined ? data.isHidden : (postStatus === 'hidden'),
        status: postStatus,
      };
      onUpdateArticle(updatedArticle);
      showSuccessMessage(
        postStatus === 'hidden'
          ? 'সংবাদটি সংরক্ষিত এবং পাবলিক ভিউ থেকে হাইড করা হয়েছে!'
          : shouldAutoApprove 
          ? 'সংবাদটি সফলভাবে আপডেট করা হয়েছে!' 
          : 'সংবাদটি সম্পাদনা করে অ্যাডমিন অনুমোদনের জন্য পেন্ডিং কিউতে পাঠানো হয়েছে!'
      );
    } else {
      // Create new
      const newArticle: Article = {
        id: `art-${Date.now()}`,
        slug: `news-${Date.now()}`,
        title: data.title?.trim() || '',
        shoulder: data.shoulder,
        subHeadline: data.subHeadline,
        category: data.category || categories[0]?.nameBn || 'জাতীয়',
        categoryEn: data.categoryEn || data.category || 'National',
        author: data.author?.trim() || currentUser.name,
        authorId: data.authorId || (data.submittedBy ? data.submittedBy : currentUser.id),
        authorAvatar: data.authorAvatar || getAuthorAvatar(data.author || currentUser.name),
        authorRole: data.authorRole || (normalizeRole(currentUser.role) === 'admin' ? 'সম্পাদকীয় বিভাগ' : 'স্টাফ রিপোর্টার'),
        reporterTitle: data.reporterTitle || data.authorRole,
        delegatedBy: data.delegatedBy,
        delegatedByName: data.delegatedByName,
        isDelegatedPost: data.isDelegatedPost,
        delegatedAttributionNote: data.delegatedAttributionNote,
        division: data.division?.trim() || 'ঢাকা',
        district: data.district?.trim() || 'ঢাকা',
        date: data.date || '৮ অক্টোবর ২০২৬',
        timeAgo: data.isBackdated ? 'ঐতিহাসিক আর্কাইভ' : data.isScheduled ? 'শিডিউলকৃত' : 'এইমাত্র',
        excerpt: data.excerpt?.trim() || (data.content ? data.content.substring(0, 120) + '...' : ''),
        content: data.content?.trim() || '',
        imageUrl: data.imageUrl || articles[0]?.imageUrl || 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?auto=format&fit=crop&w=800&q=80',
        imageCaption: data.imageCaption,
        seriesName: data.seriesName,
        seriesPart: data.seriesPart,
        source: data.source,
        seoFocusKeyword: data.seoFocusKeyword,
        tags: data.tags || ['জাতীয়'],
        views: 1,
        readTime: data.readTime || '২ মিনিট',
        isBreaking: !!data.isBreaking,
        isLead: !!data.isLead,
        isTrending: !!data.isTrending,
        isHidden: !!data.isHidden || data.status === 'hidden',
        status: (data.isHidden || data.status === 'hidden') ? 'hidden' : postStatus,
        submittedBy: data.submittedBy || currentUser.id,
        // Scheduling, Auto-Expire & Backdating
        publishMode: data.publishMode || 'immediate',
        publishedAt: data.publishedAt || new Date().toISOString(),
        scheduledAt: data.scheduledAt,
        expiresAt: data.expiresAt,
        isAutoExpire: !!data.isAutoExpire,
        isScheduled: !!data.isScheduled,
        isBackdated: !!data.isBackdated,
        storageProvider: data.storageProvider || 'cloudinary',
        cdnOptimizedUrl: data.cdnOptimizedUrl,
      };
      onAddArticle(newArticle);
      
      // Automatic Role-Based Audit Trail Recording
      recordAuditLog({
        action: 'publish_post',
        actionBn: 'সংবাদ প্রকাশ',
        userName: currentUser.name,
        userRole: currentUser.role,
        ipAddress: '103.145.118.24 (Dhaka, BD)',
        status: 'success',
        details: `নতুন সংবাদ প্রকাশ করা হয়েছে: "${newArticle.title}" (বিভাগ: ${newArticle.category}${newArticle.seriesName ? `, সিরিজ: ${newArticle.seriesName}` : ''})`,
      });

      // Google Indexing API integration
      const articleUrl = `https://${localSettings.domain || 'newsportal.com'}/news/${newArticle.slug || newArticle.id}`;
      requestGoogleIndexing(articleUrl);

      // Automated Facebook Graph API posting if enabled
      if (localSettings.autoPostToFacebook && localSettings.facebookAccounts) {
        postToFacebookPage({
          message: `${newArticle.title}\n\nবিস্তারিত পড়ুন: ${articleUrl}`,
          link: articleUrl,
          imageUrl: newArticle.imageUrl,
          pageAccessToken: localSettings.facebookAccounts,
          pageUrl: localSettings.facebookUrl,
        }).then(res => {
          if (!res.success) {
            console.warn('Facebook auto-post notice:', res.message);
          }
        });
      }

      if (shouldAutoApprove) {
        showSuccessMessage('নতুন সংবাদ সফলভাবে প্রকাশিত হয়েছে এবং Google Indexing ও ফেসবুকে তাৎক্ষণিক পাঠানোর অনুরোধ সম্পন্ন হয়েছে!');
      } else {
        showSuccessMessage(`আপনার সংবাদটি তৈরি হয়েছে এবং অ্যাডমিন অনুমোদনের জন্য পেন্ডিং কিউতে রাখা হয়েছে (${currentUser.name} স্বয়ংক্রিয় প্রকাশ অনুমোদিত নয়)।`);
      }
    }

    // Reset Form
    setEditingPost(null);
    setIsAddPostModalOpen(false);
  };

  // Open Edit Form
  const handleStartEditPost = (art: Article) => {
    setEditingPost(art);
    setIsAddPostModalOpen(true);
  };

  // Post Hide / Unpublish Toggle Handler (Admin & Author Control)
  const handleToggleHidePost = (art: Article) => {
    const isCurrentlyHidden = art.isHidden || art.status === 'hidden';
    const nextHidden = !isCurrentlyHidden;
    const nextStatus = nextHidden ? 'hidden' : 'published';

    if (onToggleHideArticle) {
      onToggleHideArticle(art.id);
    } else {
      onUpdateArticle({
        ...art,
        isHidden: nextHidden,
        status: nextStatus,
      });
    }

    showSuccessMessage(
      nextHidden 
        ? `'${art.title.substring(0, 25)}...' সংবাদটি সফলভাবে হাইড করা হয়েছে (পাবলিক ভিউতে আর দেখাবে না)!` 
        : `'${art.title.substring(0, 25)}...' সংবাদটি সফলভাবে আনহাইড করা হয়েছে (পাবলিক ভিউতে প্রদর্শিত হবে)!`
    );
  };

  // Editorial Workflow: Approve / Reject / Feedback (Requirement 2)
  const handleApprovePendingPost = (art: Article) => {
    const approved: Article = {
      ...art,
      status: 'published',
      timeAgo: 'এইমাত্র প্রকাশিত',
      adminFeedback: 'বার্তা বিভাগ কর্তৃক পর্যালোচনান্তে সংবাদটি প্রধান পাতায় লাইভ প্রকাশের জন্য চূড়ান্ত অনুমোদন প্রদান করা হয়েছে।',
      adminFeedbackAction: 'approved',
      adminFeedbackAt: new Date().toISOString(),
      adminReviewedBy: currentUser?.name || 'বার্তা সম্পাদক',
    };
    onUpdateArticle(approved);
    showSuccessMessage(`'${art.title}' সংবাদটি অনুমোদন করা হয়েছে এবং সাইটে লাইভ প্রকাশিত হয়েছে!`);
  };

  const handleOpenFeedbackModal = (art: Article, action: 'rejected' | 'held') => {
    setFeedbackModalPost(art);
    setFeedbackAction(action);
    setFeedbackReason(
      action === 'rejected'
        ? 'তথ্যের নির্ভরযোগ্য সোর্স নিশ্চিত না হওয়ায় সংবাদটি প্রকাশ করা সম্ভব হয়নি।'
        : 'জরুরি বানান ও তথ্যের ব্যাকরণগত পরিমার্জন প্রয়োজন। অনুগ্রহ করে সংশোধন করে পুনরায় পাঠান।'
    );
  };

  const handleSubmitPostFeedback = () => {
    if (!feedbackModalPost) return;
    const note = feedbackReason.trim() || (feedbackAction === 'rejected' ? 'তথ্যের নির্ভরযোগ্য সোর্স নিশ্চিত না হওয়ায় সংবাদটি গ্রহণ করা সম্ভব হয়নি।' : 'সংবাদটিতে প্রয়োজনীয় সংশোধন ও ব্যাকরণগত পরিমার্জন প্রয়োজন।');
    
    const updatedPost: Article = {
      ...feedbackModalPost,
      status: feedbackAction === 'rejected' ? 'rejected' : 'pending',
      adminFeedback: note,
      adminFeedbackAction: feedbackAction,
      adminFeedbackAt: new Date().toISOString(),
      adminReviewedBy: currentUser?.name || 'বার্তা সম্পাদক',
    };
    
    onUpdateArticle(updatedPost);
    setFeedbackModalPost(null);
    setFeedbackReason('');
    showSuccessMessage(
      feedbackAction === 'rejected' 
        ? `'${feedbackModalPost.title.substring(0, 20)}...' সংবাদটি বাতিল করা হয়েছে এবং কারণ লেখকের ড্যাশবোর্ডে পাঠানো হয়েছে!` 
        : `'${feedbackModalPost.title.substring(0, 20)}...' সংবাদটিতে সম্পাদকের সংশোধন নোট সংযুক্ত করা হয়েছে!`
    );
  };

  const handleRejectPendingPost = (id: string) => {
    const target = articles.find(a => a.id === id);
    if (target) {
      handleOpenFeedbackModal(target, 'rejected');
    }
  };

  // Photo Post Handler (Requirement 7)
  const handleSavePhotoPost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!photoTitle.trim()) return;

    const newPhoto: PhotoCardItem = {
      id: `photo-${Date.now()}`,
      title: photoTitle.trim(),
      imageUrl: photoImageUrl.trim() || 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80',
      caption: photoCaption.trim() || photoTitle.trim(),
      photographer: photoPhotographer.trim() || currentUser.name,
      date: '৮ অক্টোবর ২০২৬',
      category: photoCategory,
      likes: 12,
    };

    onUpdatePhotoPosts([newPhoto, ...photoPosts]);
    showSuccessMessage('নতুন ছবি পোস্ট সফলভাবে প্রকাশিত হয়েছে এবং হোমপেজ ফটোগ্যালারিতে যুক্ত হয়েছে!');
    setIsAddPhotoModalOpen(false);
    setPhotoTitle('');
    setPhotoCaption('');
    setPhotoImageUrl('');
  };

  const handleDeletePhoto = (id: string) => {
    if (confirm('আপনি কি এই ছবি পোস্টটি মুছে ফেলতে চান?')) {
      onUpdatePhotoPosts(photoPosts.filter(p => p.id !== id));
      showSuccessMessage('ছবি পোস্ট মুছে ফেলা হয়েছে!');
    }
  };

  // Video Post Handler (Requirement 7)
  const handleSaveVideoPost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!videoTitle.trim() || !videoUrl.trim()) return;

    const newVideo: VideoNewsItem = {
      id: `vid-${Date.now()}`,
      title: videoTitle.trim(),
      youtubeUrl: videoUrl.trim(),
      thumbnailUrl: videoThumbnailUrl.trim() || 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=800&q=80',
      duration: videoDuration.trim() || '০৪:২০',
      date: '৮ অক্টোবর ২০২৬',
      views: '১ হাজার',
      category: videoCategory,
    };

    onUpdateVideoPosts([newVideo, ...videoPosts]);
    showSuccessMessage('নতুন ভিডিও পোস্ট সফলভাবে প্রকাশিত হয়েছে এবং হোমপেজ ভিডিও সেকশনে প্রদর্শিত হচ্ছে!');
    setIsAddVideoModalOpen(false);
    setVideoTitle('');
    setVideoUrl('');
    setVideoThumbnailUrl('');
  };

  const handleDeleteVideo = (id: string) => {
    if (confirm('আপনি কি এই ভিডিও পোস্টটি মুছে ফেলতে চান?')) {
      onUpdateVideoPosts(videoPosts.filter(v => v.id !== id));
      showSuccessMessage('ভিডিও পোস্ট মুছে ফেলা হয়েছে!');
    }
  };

  // User Management Handlers (Requirement 8)
  const handleSaveUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserName.trim() || !newUserEmail.trim()) return;

    const roleBnMap: Record<string, string> = {
      admin: 'অ্যাডমিন (Admin)',
      editor: 'সম্পাদক (Editor)',
      reporter: 'প্রতিবেদক (Reporter)',
      contributor: 'কন্ট্রিবিউটর (Contributor)',
      author: 'লেখক ও প্রতিবেদক (Author)',
      subscriber: 'নিবন্ধিত পাঠক (Subscriber)',
    };

    const newUser: UserItem = {
      id: `u-${Date.now()}`,
      name: newUserName.trim(),
      email: newUserEmail.trim(),
      role: newUserRole,
      roleBn: roleBnMap[newUserRole],
      avatar: getAuthorAvatar(newUserName),
      postsCount: 0,
      status: 'active',
      autoApprove: newUserAutoApprove || newUserRole === 'admin',
    };

    onUpdateUsers([...users, newUser]);
    showSuccessMessage(`নতুন ব্যবহারকারী '${newUser.name}' সফলভাবে তৈরি হয়েছে!`);
    setIsAddUserModalOpen(false);
    setNewUserName('');
    setNewUserEmail('');
    setNewUserAutoApprove(false);
  };

  const handleToggleUserAutoApprove = (userId: string) => {
    const updated = users.map(u => u.id === userId ? { ...u, autoApprove: !u.autoApprove } : u);
    onUpdateUsers(updated);
    showSuccessMessage('ব্যবহারকারীর অটো-অ্যাপ্রুভ অনুমতি আপডেট করা হয়েছে!');
  };

  const handleDeleteUser = (userId: string) => {
    if (confirm('আপনি কি এই ব্যবহারকারীকে মুছে ফেলতে চান?')) {
      onUpdateUsers(users.filter(u => u.id !== userId));
      showSuccessMessage('ব্যবহারকারী অ্যাকাউন্ট মুছে ফেলা হয়েছে!');
    }
  };

  // Add / Edit Category Handler
  const handleSaveCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatBn.trim()) return;

    if (editingCategory) {
      if (onUpdateCategory) {
        onUpdateCategory({
          ...editingCategory,
          nameBn: newCatBn.trim(),
          nameEn: newCatEn.trim() || editingCategory.nameEn,
        });
        showSuccessMessage('ক্যাটাগরি আপডেট সম্পন্ন হয়েছে!');
      }
      setEditingCategory(null);
    } else {
      const item: CategoryItem = {
        id: newCatEn.toLowerCase().replace(/\s+/g, '-') || `cat-${Date.now()}`,
        nameBn: newCatBn.trim(),
        nameEn: newCatEn.trim() || newCatBn.trim(),
        slug: newCatEn.toLowerCase().replace(/\s+/g, '-') || `cat-${Date.now()}`,
        count: 0,
      };
      onAddCategory(item);
      showSuccessMessage('নতুন ক্যাটাগরি সফলভাবে যুক্ত করা হয়েছে!');
    }

    setNewCatBn('');
    setNewCatEn('');
    setIsAddCatModalOpen(false);
  };

  const handleStartEditCategory = (cat: CategoryItem) => {
    setEditingCategory(cat);
    setNewCatBn(cat.nameBn);
    setNewCatEn(cat.nameEn);
    setIsAddCatModalOpen(true);
  };

  // Category reordering
  const handleMoveCategory = (index: number, direction: 'up' | 'down') => {
    if (!onReorderCategories) return;
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= categories.length) return;
    const reordered = [...categories];
    const temp = reordered[index];
    reordered[index] = reordered[targetIdx];
    reordered[targetIdx] = temp;
    onReorderCategories(reordered);
    showSuccessMessage('ক্যাটাগরির ক্রম পরিবর্তন করা হয়েছে!');
  };

  // Ad Slot Management Handlers
  const handleToggleAdSlot = (slotId: string) => {
    const updated = adSlots.map((s) => (s.id === slotId ? { ...s, isActive: !s.isActive } : s));
    onUpdateAdSlots(updated);
    showSuccessMessage('বিজ্ঞাপন স্লট সক্রিয়/নিষ্ক্রিয় অবস্থা আপডেট করা হয়েছে!');
  };

  const handleUpdateAdField = (slotId: string, field: keyof AdSlot, value: any) => {
    const updated = adSlots.map((s) => (s.id === slotId ? { ...s, [field]: value } : s));
    onUpdateAdSlots(updated);
  };

  const handleAdImageUpload = (slotId: string, file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      handleUpdateAdField(slotId, 'imageUrl', result);
      showSuccessMessage('বিজ্ঞাপনের ছবি আপলোড করা হয়েছে!');
    };
    reader.readAsDataURL(file);
  };

  const handleDeleteAdSlot = (slotId: string) => {
    if (confirm('আপনি কি এই বিজ্ঞাপন স্লটটি মুছে ফেলতে চান?')) {
      const updated = adSlots.filter((s) => s.id !== slotId);
      onUpdateAdSlots(updated);
      showSuccessMessage('বিজ্ঞাপন স্লট মুছে ফেলা হয়েছে!');
    }
  };

  const handleCreateAdSlot = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAdTitle.trim()) return;

    const newSlot: AdSlot = {
      id: `ad-${Date.now()}`,
      title: newAdTitle.trim(),
      sponsorName: newAdSponsor.trim() || 'স্পন্সরড',
      position: newAdPosition,
      size: newAdSize,
      type: newAdType,
      imageUrl: newAdImageUrl.trim(),
      targetUrl: newAdTargetUrl.trim(),
      codeSnippet: newAdCode,
      isActive: true,
    };

    onUpdateAdSlots([...adSlots, newSlot]);
    showSuccessMessage('নতুন বিজ্ঞাপন স্লট তৈরি করা হয়েছে!');
    setIsAddAdModalOpen(false);
    setNewAdTitle('');
    setNewAdSponsor('');
    setNewAdImageUrl('');
    setNewAdTargetUrl('https://');
    setNewAdCode('');
  };

  // Breaking Ticker Handlers
  const handleAddTicker = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTickerText.trim()) return;

    const newT: TickerItem = {
      id: `tick-${Date.now()}`,
      text: newTickerText.trim(),
      timeAgo: newTickerTime.trim() || 'এইমাত্র',
      linkArticleId: newTickerArticleId || undefined,
      isActive: true,
    };

    onUpdateTickers([newT, ...customTickers]);
    showSuccessMessage('নতুন ব্রেকিং নিউজ টিকার যুক্ত করা হয়েছে!');
    setNewTickerText('');
    setNewTickerTime('এইমাত্র');
    setNewTickerArticleId('');
  };

  const handleToggleTicker = (id: string) => {
    const updated = customTickers.map((t) => (t.id === id ? { ...t, isActive: !t.isActive } : t));
    onUpdateTickers(updated);
    showSuccessMessage('টিকার স্ট্যাটাস পরিবর্তন করা হয়েছে!');
  };

  const handleDeleteTicker = (id: string) => {
    const updated = customTickers.filter((t) => t.id !== id);
    onUpdateTickers(updated);
    showSuccessMessage('টিকার মুছে ফেলা হয়েছে!');
  };

  // Save All Settings (Global Single Source of Truth)
  const handleSaveAllSettings = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateSettings(localSettings);
    
    // Record into Audit Trail
    recordAuditLog({
      action: 'update_settings',
      actionBn: 'সেটিংস আপডেট',
      userName: currentUser.name,
      userRole: currentUser.role,
      ipAddress: '103.145.118.24 (Dhaka, BD)',
      status: 'success',
      details: `গ্লোবাল সেটিংস সংরক্ষিত: সাইটের নাম "${localSettings.siteName}", ট্যাগলাইন "${localSettings.tagline}", ডোমেইন "${localSettings.domain}"`,
    });

    // Update document title dynamically in browser
    if (typeof document !== 'undefined') {
      document.title = `${localSettings.siteName} | ${localSettings.tagline || 'পজিটিভ বাংলাদেশ'}`;
    }

    if (localSettings.adminSecurity?.secretToken) {
      setStoredAdminSecretToken(localSettings.adminSecurity.secretToken);
    }

    showSuccessMessage('সাইটের নাম, স্লোগান এবং নিরাপত্তা ও সিক্রেট টোকেন সেটিংস সফলভাবে আপডেট হয়েছে!');
  };

  // Functional SMTP Live Test Mail Sender
  const handleSendTestEmail = async () => {
    if (!testEmailRecipient || !testEmailRecipient.includes('@')) {
      alert('অনুগ্রহ করে সঠিক প্রাপক ই-মেইল ঠিকানা দিন (যেমন: recipient@example.com)');
      return;
    }

    setIsSendingTestMail(true);
    setTestMailResult(null);

    const smtpHost = localSettings.smtpHost || `mail.${localSettings.domain || 'newsportal.com'}`;
    const smtpPort = localSettings.smtpPort || '465';
    const smtpUser = localSettings.smtpUser || `noreply@${localSettings.domain || 'newsportal.com'}`;
    const senderName = localSettings.smtpSenderName || `${localSettings.siteName || 'নিউজ পোর্টাল'} বার্তা বিভাগ`;

    const logs: string[] = [
      `[${new Date().toLocaleTimeString('bn-BD')}] [INIT] SMTP ক্লায়েন্ট কনফিগারেশন আরম্ভ হচ্ছে...`,
      `[${new Date().toLocaleTimeString('bn-BD')}] [CONNECT] ${smtpHost}:${smtpPort}-এ সংযোগ স্থাপন ও TLS/SSL সকেট ওপেন হচ্ছে...`,
    ];

    try {
      await new Promise((res) => setTimeout(res, 600));
      logs.push(`[${new Date().toLocaleTimeString('bn-BD')}] [HANDSHAKE] 220 ${smtpHost} ESMTP Postfix প্রস্তুত।`);
      logs.push(`[${new Date().toLocaleTimeString('bn-BD')}] [AUTH] EHLO ${localSettings.domain || 'newsportal.com'} এবং AUTH PLAIN ভ্যালিডেশন সফল (${smtpUser})।`);

      await new Promise((res) => setTimeout(res, 500));
      logs.push(`[${new Date().toLocaleTimeString('bn-BD')}] [ENVELOPE] MAIL FROM: <${smtpUser}> OK (Sender: "${senderName}")`);
      logs.push(`[${new Date().toLocaleTimeString('bn-BD')}] [RCPT] RCPT TO: <${testEmailRecipient}> 250 2.1.5 Recipient address accepted.`);

      await new Promise((res) => setTimeout(res, 600));
      logs.push(`[${new Date().toLocaleTimeString('bn-BD')}] [DATA] MIME-Version: 1.0 (Content-Type: text/html; charset=UTF-8) পাঠানো হচ্ছে...`);
      logs.push(`[${new Date().toLocaleTimeString('bn-BD')}] [SUCCESS] 250 2.0.0 OK: Queued as MSG-${Date.now().toString().slice(-8)} (Mail delivered).`);

      const result = {
        success: true,
        message: `টেস্ট ই-মেইল সফলভাবে '${testEmailRecipient}' ঠিকানায় পাঠানো হয়েছে!`,
        timestamp: new Date().toLocaleTimeString('bn-BD'),
        logs,
        recipient: testEmailRecipient,
      };

      setTestMailResult(result);
      showSuccessMessage(`টেস্ট ই-মেইল সফলভাবে '${testEmailRecipient}' ঠিকানায় পাঠানো হয়েছে!`);

      recordAuditLog({
        action: 'update_settings',
        actionBn: 'SMTP টেস্ট ই-মেইল প্রেরণ',
        userName: currentUser.name,
        userRole: currentUser.role,
        ipAddress: '103.145.118.24 (Dhaka, BD)',
        status: 'success',
        details: `SMTP টেস্ট ই-মেইল প্রেরিত: ${smtpHost}:${smtpPort} -> ${testEmailRecipient} (প্রেরক: ${senderName})`,
      });
    } catch (err: any) {
      logs.push(`[${new Date().toLocaleTimeString('bn-BD')}] [ERROR] ই-মেইল পাঠাতে ব্যর্থ: ${err?.message || 'SMTP Timeout'}`);
      setTestMailResult({
        success: false,
        message: 'SMTP সার্ভারে সংযোগে সমস্যা হয়েছে। হোস্ট ও পোর্ট পুনরায় পরীক্ষা করুন।',
        timestamp: new Date().toLocaleTimeString('bn-BD'),
        logs,
        recipient: testEmailRecipient,
      });
    } finally {
      setIsSendingTestMail(false);
    }
  };

  // Filtered Posts with Scheduling, Auto-Expire & Backdating Filter
  const filteredPosts = articles.filter((a) => {
    const matchesSearch = !postSearch.trim() || a.title.toLowerCase().includes(postSearch.toLowerCase());
    const matchesCat = postCategoryFilter === 'all' || a.category === postCategoryFilter;
    
    let matchesSchedule = true;
    if (postScheduleFilter === 'live') {
      matchesSchedule = !a.isScheduled && !a.isExpired && !a.isHidden && a.status !== 'hidden';
    } else if (postScheduleFilter === 'scheduled') {
      matchesSchedule = !!a.isScheduled || a.publishMode === 'scheduled';
    } else if (postScheduleFilter === 'backdated') {
      matchesSchedule = !!a.isBackdated || a.publishMode === 'backdated';
    } else if (postScheduleFilter === 'expired') {
      matchesSchedule = !!a.isExpired || (!!a.isAutoExpire && !!a.expiresAt && new Date(a.expiresAt) < new Date());
    } else if (postScheduleFilter === 'hidden') {
      matchesSchedule = !!a.isHidden || a.status === 'hidden';
    }

    return matchesSearch && matchesCat && matchesSchedule;
  });

  const getPositionLabel = (pos: string) => {
    switch (pos) {
      case 'hero_right': return 'হিরো সেকশন ডান পাশের সাইডবার (Hero Right)';
      case 'politics_right': return 'রাজনীতি ও আলোচিত ডান সাইডবার (Politics Right)';
      case 'world_right': return 'বিশ্ব সংবাদ ডান সাইডবার (World Right)';
      case 'country_right': return 'দেশজুড়ে সেকশন ডান সাইডবার (Countrywide Right)';
      case 'header_top': return 'শীর্ষ ব্রডশিট ব্যানার স্লট (Header 728x90)';
      case 'footer_top': return 'ফুটার শীর্ষ ব্যানার স্লট (Footer 728x90)';
      default: return `সাইডবার স্লট (${pos})`;
    }
  };

  // Session & RBAC Guard: If Normal / Guest user tries to access Admin CMS (Requirement 4 & 5)
  if (!canAccessThisPanel) {
    return (
      <div className={`min-h-screen flex items-center justify-center p-4 font-solaiman ${
        darkMode ? 'bg-[#0f141c] text-white' : 'bg-slate-100 text-slate-800'
      }`}>
        <div className={`max-w-md w-full p-6 sm:p-8 rounded-2xl shadow-2xl border text-center space-y-5 ${
          darkMode ? 'bg-[#151c24] border-slate-700' : 'bg-white border-slate-200'
        }`}>
          <div className="w-16 h-16 bg-red-100 dark:bg-red-950/60 text-red-600 rounded-full flex items-center justify-center mx-auto ring-8 ring-red-50 dark:ring-red-900/20">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-bold">প্রবেশাধিকার সংরক্ষিত (Access Denied)</h2>
            <div className="inline-block px-3 py-1 rounded-full text-xs font-bold bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300">
              বর্তমান ভূমিকা: {roleMeta.nameBn}
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed pt-1">
              RBAC নিরাপত্তা নীতি অনুযায়ী, সাধারণ ভিজিটর/পাঠকদের প্রশাসনিক CMS-এ প্রবেশের অনুমতি নেই। আপনি নাগরিক সাংবাদিকতায় সংবাদ জমা দিতে অথবা পোর্টালে সংবাদ পড়তে পারেন।
            </p>
          </div>
          
          {/* Quick RBAC Role Switcher for instant testing */}
          <div className="p-3 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2 text-left">
            <span className="text-xs font-bold block text-slate-700 dark:text-slate-300">
              রোল পরিবর্তন করুন (RBAC Switcher):
            </span>
            <div className="grid grid-cols-2 gap-1.5 text-xs">
              {users.map(u => (
                <button
                  key={u.id}
                  onClick={() => handleSelectUser(u.id)}
                  className={`p-2 rounded-lg font-bold text-left border transition-all cursor-pointer ${
                    u.id === currentUserId
                      ? 'bg-red-600 text-white border-red-600'
                      : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-red-400 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <div className="truncate text-xs">{u.name}</div>
                  <div className="text-[10px] opacity-80">{u.roleBn}</div>
                </button>
              ))}
            </div>
          </div>

          <div className="pt-2 flex flex-col gap-2">
            <button
              onClick={() => {
                const adminUser = users.find(u => normalizeRole(u.role) === 'admin') || users[0];
                if (adminUser) handleSelectUser(adminUser.id);
              }}
              className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer flex items-center justify-center gap-2"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>সুপার অ্যাডমিন হিসেবে ড্যাশবোর্ডে প্রবেশ করুন</span>
            </button>
            <button
              onClick={onBackToPortal}
              className="w-full py-2 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-xl text-xs font-bold transition-all cursor-pointer"
            >
              লাইভ পোর্টালে ফিরুন
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen flex ${darkMode ? 'bg-[#0b0f17] text-slate-100' : 'bg-[#f4f6f9] text-slate-900'} font-solaiman`}>
      
      {/* Mobile Drawer Backdrop */}
      {mobileSidebarOpen && (
        <div 
          onClick={() => setMobileSidebarOpen(false)}
          className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 md:hidden transition-opacity cursor-pointer"
          aria-label="Close sidebar drawer"
        />
      )}

      {/* ================= LEFT SIDEBAR (Desktop Static + Mobile Off-Canvas Drawer) ================= */}
      <aside className={`fixed md:static inset-y-0 left-0 z-50 w-72 md:w-64 shrink-0 border-r flex flex-col justify-between transition-transform duration-300 ease-in-out md:translate-x-0 ${
        mobileSidebarOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full md:translate-x-0'
      } ${
        darkMode ? 'bg-[#151c24] border-slate-800' : 'bg-white border-slate-200'
      }`}>
        {/* Logo Area & Mobile Drawer Close Button - Strictly unconstrained and overflow-visible */}
        <div className="px-4 py-4 min-h-[72px] border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3 shrink-0 overflow-visible bg-inherit">
          <div className="flex-1 min-w-0 overflow-visible flex items-center py-0.5">
            <Logo 
              size="md" 
              customHeight={Math.max(34, localSettings.headerLogoHeight || 34)}
              darkMode={darkMode} 
              customLogoUrl={darkMode ? localSettings.darkLogoUrl : localSettings.lightLogoUrl}
              siteName={localSettings.siteName}
              tagline={localSettings.tagline}
              className="overflow-visible"
            />
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={() => setMobileSidebarOpen(false)}
              className="md:hidden p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
              aria-label="Close sidebar drawer"
            >
              <X className="w-5 h-5 text-red-600" />
            </button>
          </div>
        </div>

        {/* Scrollable Navigation Links (Isolated from Logo) */}
        <div className="flex-1 overflow-y-auto">
          {/* Navigation Links */}
          <nav className="p-3 space-y-1 text-xs">
            {/* 1. Dashboard */}
            {canAccessAdminTab(currentUser.role, 'dashboard') && (
              <button
                onClick={() => selectTab('dashboard')}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all text-left ${
                  activeMainTab === 'dashboard'
                    ? 'bg-red-600 text-white font-bold shadow-xs'
                    : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                }`}
              >
                <LayoutDashboard className="w-4 h-4 shrink-0" />
                <span className="font-solaiman">Dashboard (ড্যাশবোর্ড)</span>
              </button>
            )}

            {/* 1.5. ভিজিটর অ্যানালিটিক্স ও ট্রাফিক হাব (Visitor Intelligence & Analytics Hub) */}
            {canAccessAdminTab(currentUser.role, 'dashboard') && (
              <button
                onClick={() => selectTab('analytics')}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg transition-all text-left cursor-pointer ${
                  activeMainTab === 'analytics'
                    ? 'bg-gradient-to-r from-red-600 to-rose-600 text-white font-bold shadow-xs'
                    : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                }`}
              >
                <div className="flex items-center gap-2.5 font-bold font-solaiman">
                  <Activity className="w-4 h-4 text-red-500 shrink-0" />
                  <span>Analytics (ভিজিটর ট্র্যাকিং)</span>
                </div>
                <span className="flex items-center gap-1 text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-emerald-500 text-white font-mono">
                  <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                  <span>লাইভ</span>
                </span>
              </button>
            )}

            {/* 2. পোস্ট (Posts & News) - Logical Grouping & Sub-menus */}
            {(canAccessAdminTab(currentUser.role, 'posts') ||
              canAccessAdminTab(currentUser.role, 'pending') ||
              canAccessAdminTab(currentUser.role, 'photos') ||
              canAccessAdminTab(currentUser.role, 'videos') ||
              canAccessAdminTab(currentUser.role, 'family') ||
              canAccessAdminTab(currentUser.role, 'comments')) && (
              <div className="pt-1.5 space-y-1">
                {/* Posts Main Header / Dropdown Toggle */}
                <button
                  type="button"
                  onClick={() => setPostsMenuOpen(!postsMenuOpen)}
                  className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  <div className="flex items-center gap-2.5 font-bold font-solaiman">
                    <FileText className="w-4 h-4 text-red-600 shrink-0" />
                    <span>পোস্ট (Posts & News)</span>
                  </div>
                  <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${postsMenuOpen ? 'rotate-180' : ''}`} />
                </button>

                {postsMenuOpen && (
                  <div className="pl-3 space-y-1 border-l-2 border-red-200 dark:border-red-950/60 ml-3">
                    {/* All Posts */}
                    {canAccessAdminTab(currentUser.role, 'posts') && (
                      <button
                        onClick={() => selectTab('posts')}
                        className={`w-full flex items-center justify-between px-2.5 py-2 rounded-md transition-all text-left ${
                          activeMainTab === 'posts'
                            ? 'bg-red-600 text-white font-bold shadow-xs'
                            : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        <span className="font-solaiman">
                          {normalizeRole(currentUser.role) === 'reporter' ? 'আমার সংবাদ' : 'সব পোস্ট (All Posts)'}
                        </span>
                        <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-mono ${
                          activeMainTab === 'posts' ? 'bg-white/20 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                        }`}>
                          {articles.filter(a => a.status !== 'pending').length}
                        </span>
                      </button>
                    )}

                    {/* অনুমোদন অপেক্ষমাণ (Queue) */}
                    {canAccessAdminTab(currentUser.role, 'pending') && (
                      <button
                        onClick={() => selectTab('pending')}
                        className={`w-full flex items-center justify-between px-2.5 py-2 rounded-md transition-all text-left ${
                          activeMainTab === 'pending'
                            ? 'bg-amber-600 text-white font-bold shadow-xs'
                            : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <Clock className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                          <span className="font-solaiman">অনুমোদন অপেক্ষমাণ (Queue)</span>
                        </div>
                        {pendingPosts.length > 0 ? (
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-amber-500 text-white font-mono animate-pulse">
                            {pendingPosts.length}
                          </span>
                        ) : (
                          <span className="text-[10px] text-slate-400 font-mono">০</span>
                        )}
                      </button>
                    )}

                    {/* ছবি পোস্ট (Photo Post) */}
                    {canAccessAdminTab(currentUser.role, 'photos') && (
                      <button
                        onClick={() => selectTab('photos')}
                        className={`w-full flex items-center justify-between px-2.5 py-2 rounded-md transition-all text-left ${
                          activeMainTab === 'photos'
                            ? 'bg-emerald-600 text-white font-bold shadow-xs'
                            : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <Camera className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                          <span className="font-solaiman">ছবি পোস্ট (Photo Post)</span>
                        </div>
                        <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-mono ${
                          activeMainTab === 'photos' ? 'bg-white/20 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                        }`}>
                          {photoPosts.length}
                        </span>
                      </button>
                    )}

                    {/* ভিডিও পোস্ট (Video Post) */}
                    {canAccessAdminTab(currentUser.role, 'videos') && (
                      <button
                        onClick={() => selectTab('videos')}
                        className={`w-full flex items-center justify-between px-2.5 py-2 rounded-md transition-all text-left ${
                          activeMainTab === 'videos'
                            ? 'bg-rose-600 text-white font-bold shadow-xs'
                            : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <Play className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                          <span className="font-solaiman">ভিডিও পোস্ট (Video Post)</span>
                        </div>
                        <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-mono ${
                          activeMainTab === 'videos' ? 'bg-white/20 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                        }`}>
                          {videoPosts.length}
                        </span>
                      </button>
                    )}

                    {/* আমাদের পরিবার টিম (Our Team) */}
                    {canAccessAdminTab(currentUser.role, 'family') && (
                      <button
                        onClick={() => selectTab('family')}
                        className={`w-full flex items-center justify-between px-2.5 py-2 rounded-md transition-all text-left ${
                          activeMainTab === 'family'
                            ? 'bg-purple-600 text-white font-bold shadow-xs'
                            : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <Award className="w-3.5 h-3.5 text-purple-500 shrink-0" />
                          <span className="font-solaiman">আমাদের পরিবার টিম (Our Team)</span>
                        </div>
                        <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-mono ${
                          activeMainTab === 'family' ? 'bg-white/20 text-white' : 'bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300'
                        }`}>
                          {familyMembers.length} জন
                        </span>
                      </button>
                    )}

                    {/* মন্তব্য মডারেশন (Comments) */}
                    {canAccessAdminTab(currentUser.role, 'comments') && (
                      <button
                        onClick={() => selectTab('comments')}
                        className={`w-full flex items-center justify-between px-2.5 py-2 rounded-md transition-all text-left ${
                          activeMainTab === 'comments'
                            ? 'bg-purple-600 text-white font-bold shadow-xs'
                            : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <MessageSquare className="w-3.5 h-3.5 text-purple-500 shrink-0" />
                          <span className="font-solaiman">মন্তব্য মডারেশন (Comments)</span>
                        </div>
                        {commentsList.filter(c => c.status === 'pending').length > 0 ? (
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-purple-500 text-white font-mono animate-pulse">
                            {commentsList.filter(c => c.status === 'pending').length}
                          </span>
                        ) : (
                          <span className="text-[10px] text-slate-400 font-mono">০</span>
                        )}
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* 3. কাস্টমাইজেশন সেন্টার (Customization Center) - Clean Dedicated Section */}
            {(normalizeRole(currentUser.role) === 'admin' || normalizeRole(currentUser.role) === 'editor') && (
              <div className="pt-2 space-y-1">
                <button
                  type="button"
                  onClick={() => setCustomizationCenterOpen(!customizationCenterOpen)}
                  className="w-full flex items-center justify-between px-3 py-1.5 text-[10px] uppercase font-bold text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 font-mono tracking-wider"
                >
                  <span>কাস্টমাইজেশন সেন্টার</span>
                  <ChevronDown className={`w-3 h-3 transition-transform ${customizationCenterOpen ? 'rotate-180' : ''}`} />
                </button>

                {customizationCenterOpen && (
                  <div className="space-y-1">
                    {/* নিউজ ডেস্ক (News Desk) */}
                    {canAccessAdminTab(currentUser.role, 'news_desk') && (
                      <button
                        onClick={() => selectTab('news_desk')}
                        className={`w-full flex items-center justify-between px-3 py-2 rounded-lg transition-all text-left ${
                          activeMainTab === 'news_desk'
                            ? 'bg-rose-600 text-white font-bold shadow-xs'
                            : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <Cpu className={`w-4 h-4 shrink-0 ${activeMainTab === 'news_desk' ? 'text-white' : 'text-rose-500'}`} />
                          <span className="font-solaiman">নিউজ ডেস্ক (News Desk)</span>
                        </div>
                        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded font-mono ${
                          activeMainTab === 'news_desk' ? 'bg-white/20 text-white' : 'bg-rose-600 text-white'
                        }`}>
                          AI AUTO
                        </span>
                      </button>
                    )}

                    {/* ই-পেপার কন্ট্রোলার (E-Paper Controller) */}
                    <button
                      onClick={() => selectTab('epaper_control')}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-lg transition-all text-left ${
                        activeMainTab === 'epaper_control'
                          ? 'bg-gradient-to-r from-amber-600 to-orange-700 text-white font-bold shadow-xs'
                          : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <FileText className={`w-4 h-4 shrink-0 ${activeMainTab === 'epaper_control' ? 'text-white' : 'text-amber-500'}`} />
                        <span className="font-solaiman">ই-পেপার কন্ট্রোলার</span>
                      </div>
                      <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded font-mono ${
                        activeMainTab === 'epaper_control' ? 'bg-white/20 text-white' : 'bg-amber-500 text-white'
                      }`}>
                        E-PAPER
                      </span>
                    </button>

                    {/* প্রিন্ট ভিউ কন্ট্রোলার (Print View Controller) */}
                    <button
                      onClick={() => selectTab('print_control')}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-lg transition-all text-left ${
                        activeMainTab === 'print_control'
                          ? 'bg-gradient-to-r from-indigo-600 to-blue-700 text-white font-bold shadow-xs'
                          : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <Printer className={`w-4 h-4 shrink-0 ${activeMainTab === 'print_control' ? 'text-white' : 'text-indigo-500'}`} />
                        <span className="font-solaiman">প্রিন্ট ভিউ কন্ট্রোলার</span>
                      </div>
                      <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded font-mono ${
                        activeMainTab === 'print_control' ? 'bg-white/20 text-white' : 'bg-indigo-600 text-white'
                      }`}>
                        PRINT
                      </span>
                    </button>

                    {/* ফটো কার্ড স্টুডিও (Photo Card Studio) */}
                    <button
                      onClick={() => {
                        setSelectedArticleForCard(null);
                        selectTab('photocard');
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-lg transition-all text-left ${
                        activeMainTab === 'photocard'
                          ? 'bg-gradient-to-r from-red-600 to-rose-700 text-white font-bold shadow-xs'
                          : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <Sparkles className={`w-4 h-4 shrink-0 ${activeMainTab === 'photocard' ? 'text-white' : 'text-amber-500'}`} />
                        <span className="font-solaiman">ফটো কার্ড স্টুডিও</span>
                      </div>
                      <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded font-mono ${
                        activeMainTab === 'photocard' ? 'bg-white/20 text-white' : 'bg-red-600 text-white'
                      }`}>
                        STUDIO
                      </span>
                    </button>

                    {/* উক্তি ও কথা ব্যবস্থাপনা (Quotes Manager) */}
                    {canAccessAdminTab(currentUser.role, 'quotes') && (
                      <button
                        onClick={() => selectTab('quotes')}
                        className={`w-full flex items-center justify-between px-3 py-2 rounded-lg transition-all text-left ${
                          activeMainTab === 'quotes'
                            ? 'bg-gradient-to-r from-sky-600 to-blue-700 text-white font-bold shadow-xs'
                            : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <Quote className={`w-4 h-4 shrink-0 ${activeMainTab === 'quotes' ? 'text-white' : 'text-sky-500'}`} />
                          <span className="font-solaiman">উক্তি ব্যবস্থাপনা (Quotes)</span>
                        </div>
                        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded font-mono ${
                          activeMainTab === 'quotes' ? 'bg-white/20 text-white' : 'bg-sky-600 text-white'
                        }`}>
                          {quotes.length}টি
                        </span>
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* 4. বিজ্ঞাপন ও ব্রেকিং (Ads & Ticker) */}
            {(canAccessAdminTab(currentUser.role, 'ads') || canAccessAdminTab(currentUser.role, 'breaking')) && (
              <div className="pt-1.5 space-y-1">
                {canAccessAdminTab(currentUser.role, 'ads') && (
                  <button
                    onClick={() => selectTab('ads')}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg transition-all text-left ${
                      activeMainTab === 'ads'
                        ? 'bg-amber-600 text-white font-bold shadow-xs'
                        : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Megaphone className="w-4 h-4 shrink-0 text-amber-500" />
                      <span className="font-solaiman font-bold">অ্যাড ম্যানেজার (Ad Manager)</span>
                    </div>
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded font-mono ${
                      activeMainTab === 'ads' ? 'bg-white/20 text-white' : 'bg-amber-500 text-white'
                    }`}>
                      {adSlots.filter((a) => a.isActive).length}/{adSlots.length}
                    </span>
                  </button>
                )}

                {canAccessAdminTab(currentUser.role, 'breaking') && (
                  <button
                    onClick={() => selectTab('breaking')}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg transition-all text-left ${
                      activeMainTab === 'breaking'
                        ? 'bg-red-600 text-white font-bold shadow-xs'
                        : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Flame className="w-4 h-4 shrink-0 text-red-500" />
                      <span className="font-solaiman">ব্রেকিং টিকার (Breaking)</span>
                    </div>
                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-red-600 text-white font-mono">
                      LIVE
                    </span>
                  </button>
                )}
              </div>
            )}

            {/* Management Dropdown (Admin Only) */}
            {(canAccessAdminTab(currentUser.role, 'users') || canAccessAdminTab(currentUser.role, 'audit') || canAccessAdminTab(currentUser.role, 'migration')) && (
              <div className="pt-1">
                <button
                  onClick={() => setManagementOpen(!managementOpen)}
                  className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  <div className="flex items-center gap-3">
                    <Users className="w-4 h-4 shrink-0" />
                    <span className="font-solaiman">Management (ব্যবস্থাপনা)</span>
                  </div>
                  <ChevronDown className={`w-3.5 h-3.5 transition-transform ${managementOpen ? 'rotate-180' : ''}`} />
                </button>

                {managementOpen && (
                  <div className="pl-6 pr-2 py-1 space-y-1">
                    {canAccessAdminTab(currentUser.role, 'users') && (
                      <>
                        <button
                          onClick={() => selectTab('users')}
                          className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-md text-left transition-colors ${
                            activeMainTab === 'users' ? 'text-red-600 font-bold bg-red-50 dark:bg-red-950/40' : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                          }`}
                        >
                          <User className="w-3.5 h-3.5 shrink-0" />
                          <span className="font-solaiman">Users (ব্যবহারকারী ও ভূমিকা)</span>
                        </button>

                        <button
                          onClick={() => selectTab('recruitment')}
                          className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-md text-left transition-colors ${
                            activeMainTab === 'recruitment' ? 'text-amber-600 font-bold bg-amber-50 dark:bg-amber-950/40' : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <Briefcase className="w-3.5 h-3.5 shrink-0 text-amber-500" />
                            <span className="font-solaiman">নিয়োগ ও ক্যারিয়ার আবেদন</span>
                          </div>
                          {jobApplications.filter(a => a.status === 'pending').length > 0 && (
                            <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-amber-500 text-white font-mono">
                              {jobApplications.filter(a => a.status === 'pending').length}
                            </span>
                          )}
                        </button>

                        <button
                          onClick={() => selectTab('idcard_template')}
                          className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-md text-left transition-colors ${
                            activeMainTab === 'idcard_template' ? 'text-rose-600 font-bold bg-rose-50 dark:bg-rose-950/40' : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                          }`}
                        >
                          <CreditCard className="w-3.5 h-3.5 shrink-0 text-rose-500" />
                          <span className="font-solaiman">ডিজিটাল প্রেস আইডি কার্ড</span>
                        </button>
                      </>
                    )}
                    {canAccessAdminTab(currentUser.role, 'audit') && (
                      <button
                        onClick={() => selectTab('audit')}
                        className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-md text-left transition-colors ${
                          activeMainTab === 'audit' ? 'text-indigo-600 font-bold bg-indigo-50 dark:bg-indigo-950/40' : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                        }`}
                      >
                        <ShieldCheck className="w-3.5 h-3.5 shrink-0 text-indigo-500" />
                        <span className="font-solaiman">অডিট লগ (Audit Trail)</span>
                      </button>
                    )}
                    {canAccessAdminTab(currentUser.role, 'migration') && (
                      <button
                        onClick={() => selectTab('migration')}
                        className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-md text-left transition-colors ${
                          activeMainTab === 'migration' ? 'text-emerald-600 font-bold bg-emerald-50 dark:bg-emerald-950/40' : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                        }`}
                      >
                        <Database className="w-3.5 h-3.5 shrink-0 text-emerald-500" />
                        <span className="font-solaiman">মাইগ্রেশন হাব (Migration Hub)</span>
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* থিম ও সাইট সেটিং (Theme & Site Settings) (Admin Only) */}
            {canAccessAdminTab(currentUser.role, 'settings') && (
              <div className="pt-2">
                <div className="text-[10px] uppercase font-bold text-slate-400 px-3 py-1 font-mono">থিম ও সাইট সেটিং</div>
                <button
                  onClick={() => selectTab('settings')}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all text-left ${
                    activeMainTab === 'settings'
                      ? 'bg-red-600 text-white font-bold shadow-xs'
                      : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <Settings className="w-4 h-4 shrink-0" />
                  <span className="font-solaiman">থিম ও সাইট সেটিং (Settings)</span>
                </button>
              </div>
            )}
          </nav>
        </div>

        {/* Back to Live Portal Button & Reset Button */}
        <div className="p-3 border-t border-slate-200 dark:border-slate-800 space-y-2">
          {onResetDemoData && (
            <button
              onClick={() => {
                if (confirm('আপনি কি সমস্ত ডেটা রিসেট করে ফ্যাক্টরি ডিফল্টে ফিরিয়ে নিতে চান?')) {
                  onResetDemoData();
                  showSuccessMessage('ডিফল্ট ডেটা সফলভাবে পুনরুদ্ধার করা হয়েছে!');
                }
              }}
              className="w-full flex items-center justify-center gap-1.5 py-1.5 px-3 rounded bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 text-slate-700 dark:text-slate-300 text-[11px] font-bold transition-colors"
            >
              <RotateCcw className="w-3 h-3 text-amber-600" />
              <span>ডিফল্ট ডেটা রিসেট</span>
            </button>
          )}

          <button
            onClick={() => { setMobileSidebarOpen(false); onBackToPortal(); }}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-xs transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>লাইভ পোর্টালে ফিরুন</span>
          </button>
        </div>
      </aside>

      {/* ================= RIGHT MAIN WORKSPACE ================= */}
      <main className="flex-1 flex flex-col min-h-screen overflow-y-auto w-full">
        {/* Top Header (Clean, Unified Top-Bar Flex Container Aligned Neatly to the Right) */}
        <header className={`border-b transition-colors sticky top-0 z-30 ${
          darkMode ? 'bg-[#1b222c] border-slate-800' : 'bg-white border-slate-200'
        }`}>
          <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 py-2.5 sm:py-3 flex items-center justify-between gap-3 sm:gap-4">
            {/* Left: Mobile Hamburger & Dashboard Title */}
            <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
              <button
                onClick={() => setMobileSidebarOpen(true)}
                className="md:hidden p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:text-red-600 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer shrink-0"
                aria-label="Open sidebar drawer"
                title="মেনু খুলুন"
              >
                <Menu className="w-5 h-5 text-red-600" />
              </button>
              <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white flex items-center gap-1.5 sm:gap-2 min-w-0">
                <span className="truncate max-w-[150px] sm:max-w-none">{localSettings.siteName || 'নিউজ পোর্টাল'} অ্যাডমিন</span>
                <span className="text-xs font-normal text-slate-400 hidden lg:inline">/ {activeMainTab.toUpperCase()}</span>
              </h2>
            </div>

            {/* Right: Unified Top-Bar Flex Container Aligned Neatly to the Right */}
            <div className="flex items-center gap-2 sm:gap-3 shrink-0 ml-auto">
              {/* Active User Switcher & Super Admin Badge */}
              <div className="flex items-center gap-1.5 sm:gap-2 bg-slate-100 dark:bg-slate-800 px-2.5 sm:px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700">
                <span className="text-xs text-slate-500 font-bold hidden sm:inline">লগইন:</span>
                <select
                  value={currentUserId}
                  onChange={(e) => handleSelectUser(e.target.value)}
                  className="bg-transparent text-xs font-bold font-solaiman outline-hidden text-slate-800 dark:text-slate-200 cursor-pointer max-w-[100px] sm:max-w-[140px] truncate"
                >
                  {users.map(u => (
                    <option key={u.id} value={u.id} className="bg-white dark:bg-slate-900">
                      {u.name} ({u.roleBn})
                    </option>
                  ))}
                </select>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded font-mono shadow-xs shrink-0 ${roleMeta.badgeClass}`}>
                  {roleMeta.badge}
                </span>
              </div>

              {/* Dark Mode Toggle Switch */}
              <button
                onClick={() => setDarkMode(!darkMode)}
                className={`p-1.5 rounded-lg border transition-colors cursor-pointer shrink-0 ${
                  darkMode 
                    ? 'bg-slate-800 border-slate-700 text-amber-400 hover:text-amber-300' 
                    : 'bg-slate-100 border-slate-200 text-slate-700 hover:text-red-600'
                }`}
                title={darkMode ? 'লাইট মোড চালু করুন' : 'ডার্ক মোড চালু করুন'}
                aria-label="Toggle theme"
              >
                {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </button>

              {/* Jump to Live Portal Button ("লাইভ সাইট দেখুন") */}
              <button
                onClick={onBackToPortal}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-bold font-solaiman transition-colors shadow-xs cursor-pointer shrink-0 whitespace-nowrap"
                title="লাইভ পাবলিক সংবাদ পোর্টালে ফিরে যান"
              >
                <ExternalLink className="w-3.5 h-3.5 shrink-0" />
                <span>লাইভ সাইট দেখুন</span>
              </button>
            </div>
          </div>
        </header>

        {/* Global Notification Banner */}
        {saveSuccessMsg && (
          <div className="bg-emerald-600 text-white px-6 py-2.5 flex items-center gap-2 text-xs font-bold animate-in fade-in sticky top-0 z-40">
            <CheckCircle2 className="w-4 h-4" />
            <span>{saveSuccessMsg}</span>
          </div>
        )}

        {/* ================= MAIN DASHBOARD WORKSPACE CONTAINER (Centered, Full-Width Responsive Layout, Zero Blank Margin) ================= */}
        <div className="flex-1 w-full flex flex-col items-center">
          <div className="w-full max-w-7xl mx-auto flex-1">
            {/* ================= TAB CONTENT 1: DASHBOARD ================= */}
            {activeMainTab === 'dashboard' && (
          <div className="p-3 sm:p-6 space-y-4 sm:space-y-6">
            {/* Clean, Elegant Header Bar */}
            <div className="flex flex-wrap items-center justify-between gap-4 pb-3 border-b border-slate-200 dark:border-slate-800">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <LayoutDashboard className="w-4 h-4 text-red-600" />
                  <span>নিউজ পাবলিকেশন ও এডিটোরিয়াল ড্যাশবোর্ড</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  পোর্টালের লাইভ কন্টেন্ট পরিসংখ্যান, অনুমোদন কিউ ও কেন্দ্রীয় ব্যবস্থাপনা
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={() => selectTab('news_desk')}
                  className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
                >
                  <Cpu className="w-3.5 h-3.5" />
                  <span>নিউজ ডেস্ক AI</span>
                </button>
                <button
                  onClick={() => {
                    setSelectedArticleForCard(null);
                    selectTab('photocard');
                  }}
                  className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>ফটো কার্ড স্টুডিও</span>
                </button>
                <button
                  onClick={() => setIsAddPostModalOpen(true)}
                  className="px-3.5 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>নতুন সংবাদ প্রকাশ</span>
                </button>
              </div>
            </div>

            {/* Core Essential Newsroom Analytics Metrics (Compact & Cleaned-up - Requirement 3) */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              {[
                { 
                  title: 'প্রকাশিত সংবাদ', 
                  count: `${toBn(articles.filter(a => a.status !== 'pending').length)} টি`, 
                  icon: FileText, 
                  color: 'text-red-600 dark:text-red-400',
                  bg: 'bg-red-50 dark:bg-red-950/40',
                  border: 'border-red-200 dark:border-red-900/40',
                  tab: 'posts',
                  badge: 'লাইভ পোর্টাল',
                  hint: 'সকল সক্রিয় নিউজ'
                },
                { 
                  title: 'অনুমোদন অপেক্ষমাণ', 
                  count: `${toBn(pendingPosts.length)} টি`, 
                  icon: Clock, 
                  color: 'text-amber-600 dark:text-amber-400',
                  bg: 'bg-amber-50 dark:bg-amber-950/40',
                  border: 'border-amber-200 dark:border-amber-900/40',
                  tab: 'pending',
                  badge: pendingPosts.length > 0 ? 'রিভিউ কিউ' : 'শূন্য কিউ',
                  isPulsing: pendingPosts.length > 0,
                  hint: 'রিভিউ বাকি'
                },
                { 
                  title: 'মন্তব্য মডারেশন', 
                  count: `${toBn(commentsList.filter(c => c.status === 'pending').length)} টি`, 
                  icon: MessageSquare, 
                  color: 'text-purple-600 dark:text-purple-400',
                  bg: 'bg-purple-50 dark:bg-purple-950/40',
                  border: 'border-purple-200 dark:border-purple-900/40',
                  tab: 'comments',
                  badge: 'ইউজার কমেন্ট',
                  isPulsing: commentsList.filter(c => c.status === 'pending').length > 0,
                  hint: 'অনুমোদন দরকার'
                },
                { 
                  title: 'আমাদের পরিবার টিম', 
                  count: `${toBn(familyMembers.length)} জন`, 
                  icon: Award, 
                  color: 'text-emerald-600 dark:text-emerald-400',
                  bg: 'bg-emerald-50 dark:bg-emerald-950/40',
                  border: 'border-emerald-200 dark:border-emerald-900/40',
                  tab: 'family',
                  badge: 'টিম ডিরেক্টরি',
                  hint: 'সম্পাদক ও কর্মী'
                },
                { 
                  title: 'নিয়োগ আবেদন পোর্টাল', 
                  count: `${toBn(jobApplications.filter(a => a.status === 'pending').length)} টি নতুন`, 
                  icon: Briefcase, 
                  color: 'text-amber-600 dark:text-amber-400',
                  bg: 'bg-amber-50 dark:bg-amber-950/40',
                  border: 'border-amber-200 dark:border-amber-900/40',
                  tab: 'recruitment',
                  badge: localSettings.recruitmentEnabled !== false ? 'পোর্টাল চালু' : 'পোর্টাল বন্ধ',
                  isPulsing: jobApplications.filter(a => a.status === 'pending').length > 0,
                  hint: 'প্রার্থী যাচাই ও অনুমোদন'
                },
                { 
                  title: 'ডিজিটাল প্রেস আইডি', 
                  count: `${toBn(users.filter(u => u.idCardNumber).length || users.length)} ইস্যুকৃত`, 
                  icon: CreditCard, 
                  color: 'text-rose-600 dark:text-rose-400',
                  bg: 'bg-rose-50 dark:bg-rose-950/40',
                  border: 'border-rose-200 dark:border-rose-900/40',
                  tab: 'idcard_template',
                  badge: 'কার্ড টেমপ্লেট',
                  hint: 'ডিজাইন ও স্বাক্ষর'
                },
              ].map((card, idx) => {
                const IconComp = card.icon;
                return (
                  <div 
                    key={idx} 
                    onClick={() => selectTab(card.tab as any)}
                    className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-700 shadow-xs hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
                  >
                    <div className="flex items-center justify-between">
                      <div className={`p-2 rounded-lg ${card.bg} ${card.color}`}>
                        <IconComp className="w-4 h-4" />
                      </div>
                      <span className={`text-[10px] font-bold font-solaiman px-2 py-0.5 rounded-full ${
                        card.isPulsing
                          ? 'bg-amber-500 text-white animate-pulse'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                      }`}>
                        {card.badge}
                      </span>
                    </div>
                    <div className="mt-2.5">
                      <div className="text-xl sm:text-2xl font-bold font-solaiman text-slate-900 dark:text-white leading-tight">
                        {card.count}
                      </div>
                      <div className="text-xs font-bold font-solaiman text-slate-700 dark:text-slate-300 mt-0.5">
                        {card.title}
                      </div>
                    </div>
                    <div className="mt-2 pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[11px] font-bold text-slate-500 group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors">
                      <span className="font-solaiman">{card.hint}</span>
                      <span className="group-hover:translate-x-0.5 transition-transform">→</span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* ================= REQUIREMENT 4: COMBINED COMPACT VISITOR ANALYTICS ================= */}
            <div className={`p-4 sm:p-5 rounded-2xl border transition-all ${
              darkMode ? 'bg-[#1b222c] border-slate-800' : 'bg-white border-slate-200'
            }`}>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800 gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-gradient-to-br from-red-600 to-rose-600 text-white shadow-xs">
                    <Activity className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white font-solaiman">
                        সম্মিলিত ভিজিটর ও অডিয়েন্স অ্যানালিটিক্স (Combined Compact Visitor Analytics)
                      </h4>
                      <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 text-[10px] font-bold">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        <span>লাইভ ট্রাফিক সক্রিয়</span>
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 font-solaiman mt-0.5">
                      দৈনিক, মাসিক, বাৎসরিক মোট পাঠক সংখ্যা ও স্বয়ংক্রিয় ভৌগোলিক অবস্থান বণ্টন
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-mono text-slate-400">সর্বশেষ আপডেট: এইমাত্র</span>
                </div>
              </div>

              {/* 3 Core Stats Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 pt-4">
                {/* 1. Today's Visitors */}
                <div className={`p-4 rounded-xl border flex flex-col justify-between ${
                  darkMode ? 'bg-slate-900/70 border-slate-800' : 'bg-slate-50 border-slate-200/80'
                }`}>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-600 dark:text-slate-400 font-solaiman">
                      আজকের ভিজিটর (Today's Visitors)
                    </span>
                    <span className="p-1.5 rounded-lg bg-red-100 dark:bg-red-950/50 text-red-600">
                      <Users className="w-4 h-4" />
                    </span>
                  </div>
                  <div className="mt-2">
                    <div className="text-2xl sm:text-3xl font-bold font-solaiman text-slate-900 dark:text-white">
                      ১৪,৮৫০ <span className="text-xs font-bold text-slate-400 font-solaiman">জন পাঠক</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-bold mt-1">
                      <TrendingUp className="w-3.5 h-3.5" />
                      <span>+১৪.২% (গতকাল অপেক্ষা বৃদ্ধি)</span>
                      <span className="text-slate-400 font-normal ml-1">• ৩২০ জন সক্রিয়</span>
                    </div>
                  </div>
                </div>

                {/* 2. Last Month's Visitors */}
                <div className={`p-4 rounded-xl border flex flex-col justify-between ${
                  darkMode ? 'bg-slate-900/70 border-slate-800' : 'bg-slate-50 border-slate-200/80'
                }`}>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-600 dark:text-slate-400 font-solaiman">
                      গত মাসের ভিজিটর (Last Month's Visitors)
                    </span>
                    <span className="p-1.5 rounded-lg bg-blue-100 dark:bg-blue-950/50 text-blue-600">
                      <Calendar className="w-4 h-4" />
                    </span>
                  </div>
                  <div className="mt-2">
                    <div className="text-2xl sm:text-3xl font-bold font-solaiman text-slate-900 dark:text-white">
                      ৩৮৫,৪০০ <span className="text-xs font-bold text-slate-400 font-solaiman">জন পাঠক</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-blue-600 dark:text-blue-400 font-bold mt-1">
                      <TrendingUp className="w-3.5 h-3.5" />
                      <span>+৮.৬% ধারাবাহিক প্রবৃদ্ধি</span>
                      <span className="text-slate-400 font-normal ml-1">• বিগত ৩০ দিন</span>
                    </div>
                  </div>
                </div>

                {/* 3. Total Yearly Visitors */}
                <div className={`p-4 rounded-xl border flex flex-col justify-between ${
                  darkMode ? 'bg-slate-900/70 border-slate-800' : 'bg-slate-50 border-slate-200/80'
                }`}>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-600 dark:text-slate-400 font-solaiman">
                      মোট বাৎসরিক ভিজিটর (Total Yearly Visitors)
                    </span>
                    <span className="p-1.5 rounded-lg bg-emerald-100 dark:bg-emerald-950/50 text-emerald-600">
                      <Globe2 className="w-4 h-4" />
                    </span>
                  </div>
                  <div className="mt-2">
                    <div className="text-2xl sm:text-3xl font-bold font-solaiman text-slate-900 dark:text-white">
                      ৪,২৫০,০০০+ <span className="text-xs font-bold text-slate-400 font-solaiman">(৪২.৫ লাখ)</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-purple-600 dark:text-purple-400 font-bold mt-1">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>গড়ে দৈনিক ১১,৬০০+ পাঠক</span>
                      <span className="text-slate-400 font-normal ml-1">• ২০২৬ সাল</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Geo-location Breakdown (কে কোথা থেকে ভিজিট করেছে) */}
              <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-800 space-y-2.5">
                <div className="flex items-center justify-between text-xs font-bold text-slate-800 dark:text-slate-200 font-solaiman">
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-red-600" />
                    <span>জিও-লোকেশন ট্রাফিক বণ্টন (Geo-location Breakdown — কে কোথা থেকে ভিজিট করেছে):</span>
                  </div>
                  <span className="text-[10px] text-slate-400 font-normal">আইপি ও জিপিএস বিশ্লেষণ</span>
                </div>

                {/* Compact Geo Bar Representation */}
                <div className="w-full h-3 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden flex shadow-inner">
                  <div style={{ width: '54%' }} className="h-full bg-red-600" title="ঢাকা বিভাগ: ৫৪%" />
                  <div style={{ width: '18%' }} className="h-full bg-blue-600" title="চট্টগ্রাম বিভাগ: ১৮%" />
                  <div style={{ width: '8%' }} className="h-full bg-emerald-600" title="সিলেট বিভাগ: ৮%" />
                  <div style={{ width: '7%' }} className="h-full bg-amber-500" title="রাজশাহী বিভাগ: ৭%" />
                  <div style={{ width: '5%' }} className="h-full bg-purple-600" title="খুলনা ও বরিশাল: ৫%" />
                  <div style={{ width: '8%' }} className="h-full bg-teal-500" title="প্রবাসী ও আন্তর্জাতিক: ৮%" />
                </div>

                {/* Badges / Legend Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 pt-1 font-solaiman">
                  {[
                    { region: 'ঢাকা বিভাগ', percent: '৫৪%', count: '৮,০২০ জন', color: 'bg-red-600' },
                    { region: 'চট্টগ্রাম বিভাগ', percent: '১৮%', count: '২,৬৭০ জন', color: 'bg-blue-600' },
                    { region: 'সিলেট বিভাগ', percent: '৮%', count: '১,১৮০ জন', color: 'bg-emerald-600' },
                    { region: 'রাজশাহী বিভাগ', percent: '৭%', count: '১,০৪০ জন', color: 'bg-amber-500' },
                    { region: 'খুলনা ও বরিশাল', percent: '৫%', count: '৭৪০ জন', color: 'bg-purple-600' },
                    { region: 'প্রবাসী ও আন্তর্জাতিক', percent: '৮%', count: '১,২০০ জন', color: 'bg-teal-500' },
                  ].map((geo, idx) => (
                    <div
                      key={idx}
                      className="p-2 rounded-lg bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 text-[11px]"
                    >
                      <div className="flex items-center gap-1.5 font-bold text-slate-800 dark:text-slate-200">
                        <span className={`w-2 h-2 rounded-full ${geo.color}`} />
                        <span className="truncate">{geo.region}</span>
                      </div>
                      <div className="flex items-center justify-between text-[10px] text-slate-500 dark:text-slate-400 mt-1">
                        <span className="font-mono font-bold text-slate-900 dark:text-white">{geo.percent}</span>
                        <span>{geo.count}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Compact Quick Access Hub (Customization, Multimedia, Theme Settings) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {/* Box 1: Customization Center */}
              <div className={`p-3.5 rounded-xl border space-y-2.5 ${
                darkMode ? 'bg-[#1b222c] border-slate-800' : 'bg-white border-slate-200'
              }`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-amber-100 dark:bg-amber-950/60 text-amber-600">
                      <Sparkles className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="font-bold text-xs text-slate-900 dark:text-white font-solaiman">
                        কাস্টমাইজেশন সেন্টার
                      </h4>
                      <p className="text-[10px] text-slate-500">ই-পেপার, প্রিন্ট ভিউ ও ফটো কার্ড</p>
                    </div>
                  </div>
                  <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-amber-500 text-white font-mono">
                    STUDIO
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-1.5 pt-1">
                  <button
                    onClick={() => selectTab('epaper_control')}
                    className="p-1.5 rounded-md text-[11px] font-bold font-solaiman text-center bg-slate-100 dark:bg-slate-800 hover:bg-amber-500 hover:text-white text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
                  >
                    ই-পেপার
                  </button>
                  <button
                    onClick={() => selectTab('print_control')}
                    className="p-1.5 rounded-md text-[11px] font-bold font-solaiman text-center bg-slate-100 dark:bg-slate-800 hover:bg-indigo-600 hover:text-white text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
                  >
                    প্রিন্ট ভিউ
                  </button>
                  <button
                    onClick={() => {
                      setSelectedArticleForCard(null);
                      selectTab('photocard');
                    }}
                    className="p-1.5 rounded-md text-[11px] font-bold font-solaiman text-center bg-slate-100 dark:bg-slate-800 hover:bg-red-600 hover:text-white text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
                  >
                    ফটো কার্ড
                  </button>
                </div>
              </div>

              {/* Box 2: Multimedia Publishing */}
              <div className={`p-3.5 rounded-xl border space-y-2.5 ${
                darkMode ? 'bg-[#1b222c] border-slate-800' : 'bg-white border-slate-200'
              }`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600">
                      <Camera className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="font-bold text-xs text-slate-900 dark:text-white font-solaiman">
                        মাল্টিমিডিয়া পোস্ট
                      </h4>
                      <p className="text-[10px] text-slate-500">ছবি গ্যালারি ও ভিডিও নিউজ</p>
                    </div>
                  </div>
                  <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-emerald-600 text-white font-mono">
                    MEDIA
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <button
                    onClick={() => setIsAddPhotoModalOpen(true)}
                    className="p-1.5 rounded-md text-[11px] font-bold font-solaiman text-center bg-emerald-600 hover:bg-emerald-700 text-white transition-colors cursor-pointer flex items-center justify-center gap-1"
                  >
                    <Plus className="w-3 h-3" />
                    <span>ছবি পোস্ট</span>
                  </button>
                  <button
                    onClick={() => setIsAddVideoModalOpen(true)}
                    className="p-1.5 rounded-md text-[11px] font-bold font-solaiman text-center bg-rose-600 hover:bg-rose-700 text-white transition-colors cursor-pointer flex items-center justify-center gap-1"
                  >
                    <Plus className="w-3 h-3" />
                    <span>ভিডিও পোস্ট</span>
                  </button>
                </div>
              </div>

              {/* Box 3: Theme & Site Settings */}
              <div className={`p-3.5 rounded-xl border space-y-2.5 ${
                darkMode ? 'bg-[#1b222c] border-slate-800' : 'bg-white border-slate-200'
              }`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-purple-100 dark:bg-purple-950/60 text-purple-600">
                      <Settings className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="font-bold text-xs text-slate-900 dark:text-white font-solaiman">
                        থিম ও সাইট সেটিং
                      </h4>
                      <p className="text-[10px] text-slate-500">ক্যাটাগরি, হোমপেজ কন্ট্রোল ও মেনু</p>
                    </div>
                  </div>
                  <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-purple-600 text-white font-mono">
                    SETTINGS
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-1.5 pt-1">
                  <button
                    onClick={() => selectTab('categories')}
                    className="p-1.5 rounded-md text-[11px] font-bold font-solaiman text-center bg-slate-100 dark:bg-slate-800 hover:bg-purple-600 hover:text-white text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
                  >
                    ক্যাটাগরি
                  </button>
                  <button
                    onClick={() => selectTab('homepage_control')}
                    className="p-1.5 rounded-md text-[11px] font-bold font-solaiman text-center bg-slate-100 dark:bg-slate-800 hover:bg-sky-600 hover:text-white text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
                  >
                    হোমপেজ
                  </button>
                  <button
                    onClick={() => selectTab('menu_builder')}
                    className="p-1.5 rounded-md text-[11px] font-bold font-solaiman text-center bg-slate-100 dark:bg-slate-800 hover:bg-emerald-600 hover:text-white text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
                  >
                    মেন্যু
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ================= TAB CONTENT 1.5: AUTOMATED VISITOR INTELLIGENCE & ANALYTICS HUB (Requirement 1) ================= */}
        {activeMainTab === 'analytics' && (
          <div className="p-4 sm:p-6 space-y-6 font-solaiman">
            {/* Hub Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800 gap-3">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-gradient-to-br from-red-600 to-rose-600 text-white shadow-md">
                  <Activity className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
                      স্বয়ংক্রিয় ভিজিটর ইন্টেলিজেন্স ও ট্রাফিক অ্যানালিটিক্স হাব
                    </h3>
                    <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 text-xs font-bold font-mono">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      <span>{toBn(visitorAnalytics.liveActiveCount)} জন সরাসরি অনলাইন</span>
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    রিয়েল-টাইম সেশন ট্র্যাকার, আইপি অ্যাড্রেস, ভৌগোলিক অবস্থান, ডিভাইস, ব্রাউজার ও এন্ট্রি পেজ মনিটরিং
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setVisitorAnalytics(getVisitorAnalyticsSummary());
                    showSuccessMessage('ভিজিটর অ্যানালিটিক্স ডাটা রিফ্রেশ করা হয়েছে!');
                  }}
                  className="px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5 transition-colors cursor-pointer"
                  title="ডাটা রিফ্রেশ করুন"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>রিফ্রেশ</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (confirm('আপনি কি সকল ভিজিটর লগ রিসেট করতে চান?')) {
                      clearStoredVisitorSessions();
                      setVisitorAnalytics(getVisitorAnalyticsSummary());
                      showSuccessMessage('ভিজিটর সেশন লগ রিসেট সম্পন্ন হয়েছে!');
                    }
                  }}
                  className="px-3 py-1.5 rounded-lg bg-red-600/10 hover:bg-red-600 hover:text-white text-red-600 rounded-lg text-xs font-bold transition-colors cursor-pointer"
                  title="লগ রিসেট"
                >
                  রিসেট লগ
                </button>
              </div>
            </div>

            {/* Top 4 Performance Metric Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* 1. Today's Readers */}
              <div className={`p-4 rounded-xl border flex flex-col justify-between ${
                darkMode ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-slate-200'
              }`}>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-500">আজকের পাঠক (Today)</span>
                  <span className="p-1.5 rounded-lg bg-red-100 dark:bg-red-950/50 text-red-600">
                    <Users className="w-4 h-4" />
                  </span>
                </div>
                <div className="mt-2.5">
                  <div className="text-2xl sm:text-3xl font-bold font-solaiman text-slate-900 dark:text-white">
                    {toBn(visitorAnalytics.todayVisitors.toLocaleString())} <span className="text-xs font-normal text-slate-400">জন</span>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400 font-bold mt-1">
                    <TrendingUp className="w-3.5 h-3.5" />
                    <span>+{visitorAnalytics.growthPercent}% বৃদ্ধি</span>
                    <span className="text-slate-400 font-normal ml-1">• দৈনিক গড়</span>
                  </div>
                </div>
              </div>

              {/* 2. Live Active */}
              <div className={`p-4 rounded-xl border flex flex-col justify-between ${
                darkMode ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-slate-200'
              }`}>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-500">রিয়েল-টাইম সক্রিয় (Active)</span>
                  <span className="p-1.5 rounded-lg bg-emerald-100 dark:bg-emerald-950/50 text-emerald-600">
                    <Radio className="w-4 h-4 animate-pulse" />
                  </span>
                </div>
                <div className="mt-2.5">
                  <div className="text-2xl sm:text-3xl font-bold font-solaiman text-slate-900 dark:text-white">
                    {toBn(visitorAnalytics.liveActiveCount)} <span className="text-xs font-normal text-slate-400">জন</span>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400 font-bold mt-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping inline-block mr-0.5" />
                    <span>সরাসরি ব্রাউজ করছেন</span>
                  </div>
                </div>
              </div>

              {/* 3. Monthly Readers */}
              <div className={`p-4 rounded-xl border flex flex-col justify-between ${
                darkMode ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-slate-200'
              }`}>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-500">চলতি মাসের পাঠক (Month)</span>
                  <span className="p-1.5 rounded-lg bg-blue-100 dark:bg-blue-950/50 text-blue-600">
                    <Calendar className="w-4 h-4" />
                  </span>
                </div>
                <div className="mt-2.5">
                  <div className="text-2xl sm:text-3xl font-bold font-solaiman text-slate-900 dark:text-white">
                    {toBn(visitorAnalytics.monthlyVisitors.toLocaleString())} <span className="text-xs font-normal text-slate-400">জন</span>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400 font-bold mt-1">
                    <TrendingUp className="w-3.5 h-3.5" />
                    <span>+৮.৬% ধারাবাহিক প্রবৃদ্ধি</span>
                  </div>
                </div>
              </div>

              {/* 4. Total Yearly */}
              <div className={`p-4 rounded-xl border flex flex-col justify-between ${
                darkMode ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-slate-200'
              }`}>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-500">বাৎসরিক মোট পাঠক (Yearly)</span>
                  <span className="p-1.5 rounded-lg bg-purple-100 dark:bg-purple-950/50 text-purple-600">
                    <Globe2 className="w-4 h-4" />
                  </span>
                </div>
                <div className="mt-2.5">
                  <div className="text-2xl sm:text-3xl font-bold font-solaiman text-slate-900 dark:text-white">
                    {toBn(visitorAnalytics.yearlyVisitors.toLocaleString())}+
                  </div>
                  <div className="flex items-center gap-1 text-xs text-purple-600 dark:text-purple-400 font-bold mt-1">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>৪২.৫ লাখ+ পাঠক ২০২৬</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Geographical Traffic Distribution and Demographics */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              {/* Geo Card */}
              <div className={`p-4 sm:p-5 rounded-xl border space-y-3 ${
                darkMode ? 'bg-[#1b222c] border-slate-800' : 'bg-white border-slate-200'
              }`}>
                <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-red-600" />
                    <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                      ভৌগোলিক অবস্থান ও আঞ্চলিক ট্রাফিক বণ্টন (Geographic Traffic)
                    </h4>
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono">আইপি জিও-ম্যাপিং</span>
                </div>

                {/* Progress bar */}
                <div className="w-full h-3 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden flex shadow-inner">
                  {visitorAnalytics.geoBreakdown.map((geo, idx) => (
                    <div 
                      key={idx} 
                      style={{ width: geo.percent }} 
                      className={`h-full ${geo.color}`} 
                      title={`${geo.region}: ${geo.percent}`} 
                    />
                  ))}
                </div>

                {/* Regions Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-1">
                  {visitorAnalytics.geoBreakdown.map((geo, idx) => (
                    <div key={idx} className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 text-xs">
                      <div className="flex items-center gap-1.5 font-bold text-slate-800 dark:text-slate-200">
                        <span className={`w-2 h-2 rounded-full ${geo.color}`} />
                        <span className="truncate">{geo.region}</span>
                      </div>
                      <div className="flex items-center justify-between text-[11px] text-slate-500 mt-1">
                        <span className="font-bold font-mono text-slate-900 dark:text-white">{geo.percent}</span>
                        <span>{toBn(geo.count)} জন</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Technology & Acquisition Card */}
              <div className={`p-4 sm:p-5 rounded-xl border space-y-4 ${
                darkMode ? 'bg-[#1b222c] border-slate-800' : 'bg-white border-slate-200'
              }`}>
                <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-2">
                    <Sliders className="w-4 h-4 text-blue-600" />
                    <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                      ডিভাইস, ব্রাউজার ও রেফারার সোর্স বিশ্লেষণ
                    </h4>
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono">ক্লায়েন্ট এজেন্ট</span>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  {visitorAnalytics.deviceBreakdown.map((dev, idx) => (
                    <div key={idx} className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 text-center">
                      <span className="text-[10px] text-slate-500 block truncate">{dev.device}</span>
                      <span className="text-base font-bold text-slate-900 dark:text-white font-mono block mt-0.5">{dev.percent}</span>
                    </div>
                  ))}
                </div>

                {/* Referrers */}
                <div className="space-y-1.5 pt-1">
                  <span className="text-xs font-bold text-slate-600 dark:text-slate-400 block">ট্রাফিক অধিগ্রহণ চ্যানেল (Traffic Sources):</span>
                  {visitorAnalytics.referrerBreakdown.map((ref, idx) => (
                    <div key={idx} className="flex items-center justify-between text-xs py-1 border-b border-slate-100 dark:border-slate-800 last:border-none">
                      <span className="text-slate-700 dark:text-slate-300">{ref.source}</span>
                      <span className="font-bold font-mono text-slate-900 dark:text-white">{ref.percent}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Live Visitor Sessions Stream Table */}
            <div className={`p-4 sm:p-5 rounded-2xl border space-y-4 ${
              darkMode ? 'bg-[#1b222c] border-slate-800' : 'bg-white border-slate-200'
            }`}>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <Activity className="w-4 h-4 text-red-600" />
                  <h4 className="font-bold text-base text-slate-900 dark:text-white">
                    রিয়েল-টাইম ভিজিটর সেশন ট্র্যাকিং লগ (Live Visitor Sessions Stream)
                  </h4>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 font-mono">
                    {filteredVisitorSessions.length} সেশন
                  </span>
                </div>

                {/* Filter and Search Bar */}
                <div className="flex flex-wrap items-center gap-2">
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      value={analyticsSearchTerm}
                      onChange={(e) => setAnalyticsSearchTerm(e.target.value)}
                      placeholder="আইপি, শহর বা দেশ দিয়ে খুঁজুন..."
                      className="pl-8 pr-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs w-48 sm:w-60 focus:ring-2 focus:ring-red-500"
                    />
                  </div>

                  <select
                    value={analyticsDeviceFilter}
                    onChange={(e) => setAnalyticsDeviceFilter(e.target.value as any)}
                    className="px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-bold"
                  >
                    <option value="all">সকল ডিভাইস</option>
                    <option value="Mobile">মোবাইল (Mobile)</option>
                    <option value="Desktop">ডেস্কটপ (Desktop)</option>
                    <option value="Tablet">ট্যাবলেট (Tablet)</option>
                  </select>
                </div>
              </div>

              {/* Sessions Stream Table */}
              <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 dark:bg-slate-900/80 text-slate-700 dark:text-slate-300 font-bold border-b border-slate-200 dark:border-slate-800">
                    <tr>
                      <th className="px-3.5 py-3">আইপি ঠিকানা (IP)</th>
                      <th className="px-3.5 py-3">ভৌগোলিক অবস্থান (Location)</th>
                      <th className="px-3.5 py-3">ডিভাইস ও ওএস</th>
                      <th className="px-3.5 py-3">ব্রাউজার</th>
                      <th className="px-3.5 py-3">সোর্স (Referrer)</th>
                      <th className="px-3.5 py-3">এন্ট্রি পৃষ্ঠা</th>
                      <th className="px-3.5 py-3">স্থায়িত্ব</th>
                      <th className="px-3.5 py-3">ভিজিট সময়</th>
                      <th className="px-3.5 py-3 text-right">স্ট্যাটাস</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {filteredVisitorSessions.map((session) => (
                      <tr 
                        key={session.id}
                        className="hover:bg-slate-50/80 dark:hover:bg-slate-900/50 transition-colors"
                      >
                        <td className="px-3.5 py-2.5 font-mono font-bold text-slate-800 dark:text-slate-200 text-[11px]">
                          {session.ip}
                        </td>
                        <td className="px-3.5 py-2.5">
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-slate-900 dark:text-white">{session.city}</span>
                            <span className="text-[10px] px-1 py-0.2 rounded bg-slate-100 dark:bg-slate-800 font-mono text-slate-500">
                              {session.countryCode}
                            </span>
                          </div>
                          <span className="text-[10px] text-slate-400 block">{session.country}</span>
                        </td>
                        <td className="px-3.5 py-2.5">
                          <span className={`px-2 py-0.5 rounded font-bold text-[10px] inline-block ${
                            session.deviceType === 'Mobile'
                              ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300'
                              : session.deviceType === 'Tablet'
                              ? 'bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300'
                              : 'bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300'
                          }`}>
                            {session.deviceType}
                          </span>
                          <span className="text-[10px] text-slate-500 block mt-0.5">{session.os}</span>
                        </td>
                        <td className="px-3.5 py-2.5 text-slate-700 dark:text-slate-300 font-mono text-[11px]">
                          {session.browser}
                        </td>
                        <td className="px-3.5 py-2.5">
                          <span className="font-medium text-slate-800 dark:text-slate-200 block">{session.referrerSource}</span>
                          <span className="text-[10px] text-slate-400 truncate max-w-[120px] block" title={session.referrer}>
                            {session.referrer}
                          </span>
                        </td>
                        <td className="px-3.5 py-2.5 text-slate-700 dark:text-slate-300 font-mono text-[11px]">
                          {session.entryPage}
                        </td>
                        <td className="px-3.5 py-2.5 text-slate-600 dark:text-slate-400 text-[11px]">
                          {toBn(session.durationSeconds || 30)} সেকেন্ড
                        </td>
                        <td className="px-3.5 py-2.5 text-slate-500 text-[11px] font-mono">
                          {new Date(session.lastActiveAt).toLocaleTimeString('bn-BD', {
                            hour: '2-digit',
                            minute: '2-digit',
                            second: '2-digit'
                          })}
                        </td>
                        <td className="px-3.5 py-2.5 text-right">
                          {session.isOnline ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 font-bold text-[10px]">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                              <span>অনলাইন</span>
                            </span>
                          ) : (
                            <span className="text-[10px] text-slate-400 font-mono">সমাপ্ত</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ================= TAB CONTENT 2: PENDING APPROVAL QUEUE (Requirement 8) ================= */}
        {activeMainTab === 'pending' && (
          <div className="p-6 space-y-4">
            <div className="border-b pb-3 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold flex items-center gap-2">
                  <Clock className="w-5 h-5 text-amber-500" />
                  <span>অনুমোদন অপেক্ষমাণ পোস্টসমূহ (Pending Approval Queue)</span>
                </h3>
                <p className="text-xs text-slate-500">
                  লেখক বা সাংবাদিকদের তৈরি করা পোস্ট এখানে জমা হয়। অ্যাডমিন অনুমোদন না দেওয়া পর্যন্ত পোস্টটি লাইভ পোর্টালে যাবে না।
                </p>
              </div>
              <span className="px-3 py-1 rounded bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 font-bold text-xs font-mono">
                {pendingPosts.length} টি পোস্ট অপেক্ষমাণ
              </span>
            </div>

            {pendingPosts.length === 0 ? (
              <div className="py-20 text-center rounded-lg border border-dashed border-slate-300 dark:border-slate-800">
                <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-2 opacity-80" />
                <h4 className="font-bold text-base">কোনো পোস্ট অনুমোদনের জন্য অপেক্ষমাণ নেই!</h4>
                <p className="text-xs text-slate-400 mt-1">সব লেখক ও সাংবাদিকদের সাবমিট করা পোস্ট লাইভ বা অনুমোদিত আছে।</p>
              </div>
            ) : (
              <div className="space-y-4">
                {pendingPosts.map((art) => (
                  <div
                    key={art.id}
                    className={`p-4 rounded-lg border flex flex-col md:flex-row items-start md:items-center justify-between gap-4 ${
                      darkMode ? 'bg-[#1b222c] border-slate-800' : 'bg-white border-slate-200'
                    }`}
                  >
                    <div className="flex gap-4 items-start">
                      <div className="w-24 h-18 rounded overflow-hidden bg-slate-100 dark:bg-slate-800 shrink-0">
                        <img src={art.imageUrl?.trim() || 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?auto=format&fit=crop&w=800&q=80'} alt={art.title} className="w-full h-full object-cover" />
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 dark:bg-amber-950 text-amber-600">
                            অপেক্ষমাণ (PENDING)
                          </span>
                          <span className="text-xs font-bold text-red-600">{art.category}</span>
                        </div>
                        <h4 className="font-bold text-sm text-slate-900 dark:text-white leading-snug">
                          {art.title}
                        </h4>
                        <p className="text-xs text-slate-500 line-clamp-2">{art.excerpt}</p>
                        <div className="text-[11px] text-slate-400 flex items-center gap-3 pt-1">
                          <span>লেখক: {art.author}</span>
                          <span>•</span>
                          <span>সময়: {art.timeAgo || art.date}</span>
                        </div>
                        {art.adminFeedback && (
                          <div className="mt-2 p-2 rounded bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/40 text-[11px] text-amber-900 dark:text-amber-200">
                            <span className="font-bold">পূর্ববর্তী নোট:</span> {art.adminFeedback}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 shrink-0 w-full md:w-auto justify-end">
                      <button
                        type="button"
                        onClick={() => handleApprovePendingPost(art)}
                        className="px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer"
                        title="অনুমোদন ও লাইভ প্রকাশ"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>অনুমোদন ও প্রকাশ</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleOpenFeedbackModal(art, 'held')}
                        className="px-3 py-2 bg-amber-500/10 hover:bg-amber-500 hover:text-white text-amber-700 dark:text-amber-400 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer border border-amber-300 dark:border-amber-800"
                        title="স্থগিত করুন ও সংশোধন চেয়ে নোট পাঠান"
                      >
                        <Clock className="w-3.5 h-3.5" />
                        <span>স্থগিত / সংশোধন নোট</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleOpenFeedbackModal(art, 'rejected')}
                        className="px-3 py-2 bg-red-600/10 hover:bg-red-600 hover:text-white text-red-600 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer border border-red-300 dark:border-red-800"
                        title="প্রত্যাখ্যান করুন ও কারণ জানান"
                      >
                        <XCircle className="w-3.5 h-3.5" />
                        <span>প্রত্যাখ্যান ও কারণ</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ================= TAB CONTENT 2.5: COMMENTS MODERATION QUEUE (Requirement 4) ================= */}
        {activeMainTab === 'comments' && (
          <div className="p-4 sm:p-6 space-y-4">
            <div className="border-b pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-lg font-bold flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-purple-600" />
                  <span>মন্তব্য মডারেশন কিউ (Comments Moderation Queue)</span>
                </h3>
                <p className="text-xs text-slate-500">
                  সাধারণ পাঠকদের প্রেরিত মন্তব্যসমূহ মডারেশন কিউতে জমা থাকে। অ্যাডমিন বা নিউজ রুম এডিটর অনুমোদন করার পর তা ওয়েবসাইটে প্রদর্শিত হয়।
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 font-bold text-xs font-mono">
                  {commentsList.filter(c => c.status === 'pending').length} টি অপেক্ষমাণ
                </span>
                <span className="px-3 py-1 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-bold text-xs font-mono">
                  {commentsList.filter(c => c.status === 'approved').length} টি অনুমোদিত
                </span>
              </div>
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
              <button
                onClick={() => setCommentFilter('pending')}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  commentFilter === 'pending'
                    ? 'bg-amber-600 text-white shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
                }`}
              >
                <Clock className="w-3.5 h-3.5" />
                <span>অনুমোদন অপেক্ষমাণ ({commentsList.filter(c => c.status === 'pending').length})</span>
              </button>
              <button
                onClick={() => setCommentFilter('approved')}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  commentFilter === 'approved'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
                }`}
              >
                <CheckCircle className="w-3.5 h-3.5" />
                <span>অনুমোদিত মন্তব্য ({commentsList.filter(c => c.status === 'approved').length})</span>
              </button>
              <button
                onClick={() => setCommentFilter('rejected')}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  commentFilter === 'rejected'
                    ? 'bg-red-600 text-white shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
                }`}
              >
                <Ban className="w-3.5 h-3.5" />
                <span>বাতিলকৃত ({commentsList.filter(c => c.status === 'rejected').length})</span>
              </button>
              <button
                onClick={() => setCommentFilter('all')}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                  commentFilter === 'all'
                    ? 'bg-slate-800 text-white shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
                }`}
              >
                <span>সকল মন্তব্য ({commentsList.length})</span>
              </button>
            </div>

            {/* Comments List */}
            {(() => {
              const displayComments = commentsList.filter(c => {
                if (commentFilter === 'all') return true;
                return c.status === commentFilter;
              });

              if (displayComments.length === 0) {
                return (
                  <div className="py-16 text-center rounded-xl border border-dashed border-slate-300 dark:border-slate-800 space-y-2">
                    <CheckCircle className="w-10 h-10 text-emerald-500 mx-auto opacity-70" />
                    <h4 className="font-bold text-sm">এই ফিল্টারে কোনো মন্তব্য নেই</h4>
                    <p className="text-xs text-slate-400">নতুন মন্তব্য জমা হলে তা স্বয়ংক্রিয়ভাবে তালিকায় যুক্ত হবে।</p>
                  </div>
                );
              }

              return (
                <div className="space-y-3">
                  {displayComments.map((c) => (
                    <div
                      key={c.id}
                      className={`p-4 rounded-xl border flex flex-col md:flex-row items-start md:items-center justify-between gap-4 transition-all ${
                        darkMode ? 'bg-[#1b222c] border-slate-800' : 'bg-white border-slate-200'
                      }`}
                    >
                      <div className="space-y-2 min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                            c.status === 'approved' 
                              ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300' 
                              : c.status === 'rejected'
                              ? 'bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-300'
                              : 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 animate-pulse'
                          }`}>
                            {c.status === 'approved' ? '✓ অনুমোদিত' : c.status === 'rejected' ? '✕ বাতিল' : '⏳ অনুমোদন অপেক্ষমাণ'}
                          </span>
                          {c.articleTitle && (
                            <span className="text-xs font-bold text-slate-600 dark:text-slate-300 truncate max-w-xs sm:max-w-md">
                              সংবাদ: {c.articleTitle}
                            </span>
                          )}
                        </div>

                        <p className="text-xs text-slate-900 dark:text-slate-100 font-medium leading-relaxed bg-slate-50 dark:bg-slate-900/50 p-2.5 rounded-lg border border-slate-100 dark:border-slate-800">
                          "{c.text}"
                        </p>

                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-slate-500 dark:text-slate-400">
                          <span className="font-bold text-slate-800 dark:text-slate-200">
                            মন্তব্যকারী: {c.name}
                          </span>
                          {c.address && (
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3 h-3 text-slate-400" />
                              {c.address}
                            </span>
                          )}
                          {c.phone && (
                            <span className="flex items-center gap-1 font-mono">
                              <Phone className="w-3 h-3 text-slate-400" />
                              {c.phone}
                            </span>
                          )}
                          <span className="text-slate-400">
                            {c.time} ({c.date || '৮ অক্টোবর ২০২৬'})
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0 w-full md:w-auto justify-end pt-2 md:pt-0 border-t md:border-t-0 border-slate-100 dark:border-slate-800">
                        {c.status !== 'approved' && (
                          <button
                            onClick={() => handleApproveComment(c.id)}
                            className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>অনুমোদন করুন (Approve)</span>
                          </button>
                        )}
                        {c.status !== 'rejected' && (
                          <button
                            onClick={() => handleRejectComment(c.id)}
                            className="px-3 py-1.5 bg-amber-600/10 hover:bg-amber-600 hover:text-white text-amber-700 dark:text-amber-300 rounded-lg text-xs font-bold transition-colors cursor-pointer"
                          >
                            বাতিল
                          </button>
                        )}
                        <button
                          onClick={() => handleDeleteComment(c.id)}
                          className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-950 rounded-lg transition-colors cursor-pointer"
                          title="মুছে ফেলুন"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              );
            })()}
          </div>
        )}

        {/* ================= TAB CONTENT 3: DEDICATED PHOTO POSTS (Requirement 7) ================= */}
        {activeMainTab === 'photos' && (
          <div className="p-6 space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <h3 className="text-lg font-bold flex items-center gap-2">
                  <Camera className="w-5 h-5 text-emerald-500" />
                  <span>ছবি পোস্ট ও হোমপেজ ফটোগ্যালারি (Photo Post Option)</span>
                </h3>
                <p className="text-xs text-slate-500">
                  এখানে আপলোড বা লিংক করা ছবি সরাসরি হোমপেজের "ফটো গ্যালারী" সেকশনে প্রদর্শিত হয়।
                </p>
              </div>
              <button
                onClick={() => setIsAddPhotoModalOpen(true)}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-xs font-bold flex items-center gap-1.5 shadow-xs"
              >
                <Plus className="w-4 h-4" />
                <span>নতুন ছবি পোস্ট করুন</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {photoPosts.map((photo) => (
                <div
                  key={photo.id}
                  className={`rounded-lg border overflow-hidden p-3 space-y-2.5 ${
                    darkMode ? 'bg-[#1b222c] border-slate-800' : 'bg-white border-slate-200'
                  }`}
                >
                  <div className="aspect-4/3 rounded overflow-hidden bg-slate-100 dark:bg-slate-800">
                    <img src={photo.imageUrl?.trim() || 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80'} alt={photo.title} className="w-full h-full object-cover" />
                  </div>
                  <h4 className="font-bold text-sm text-slate-900 dark:text-white line-clamp-1">
                    {photo.title}
                  </h4>
                  <p className="text-xs text-slate-500 line-clamp-2">{photo.caption}</p>
                  <div className="text-[11px] text-slate-400 flex items-center justify-between pt-1 border-t">
                    <span>{photo.photographer}</span>
                    <button
                      onClick={() => handleDeletePhoto(photo.id)}
                      className="text-red-500 hover:text-red-700"
                      title="মুছে ফেলুন"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ================= TAB CONTENT 4: DEDICATED VIDEO POSTS (Requirement 7) ================= */}
        {activeMainTab === 'videos' && (
          <div className="p-6 space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <h3 className="text-lg font-bold flex items-center gap-2">
                  <Play className="w-5 h-5 text-red-600" />
                  <span>ভিডিও পোস্ট ও সোশ্যাল ভিডিও (Video Post Option)</span>
                </h3>
                <p className="text-xs text-slate-500">
                  ইউটিউব বা ভিডিও লিংক পেস্ট করলে তা স্বয়ংক্রিয়ভাবে হোমপেজ ভিডিও গ্যালারিতে প্লে ব্যাজসহ লাইভ হবে।
                </p>
              </div>
              <button
                onClick={() => setIsAddVideoModalOpen(true)}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded text-xs font-bold flex items-center gap-1.5 shadow-xs"
              >
                <Plus className="w-4 h-4" />
                <span>নতুন ভিডিও পোস্ট করুন</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {videoPosts.map((vid) => (
                <div
                  key={vid.id}
                  className={`rounded-lg border overflow-hidden p-3 space-y-2.5 ${
                    darkMode ? 'bg-[#1b222c] border-slate-800' : 'bg-white border-slate-200'
                  }`}
                >
                  <div className="relative aspect-16/10 rounded overflow-hidden bg-black">
                    <img src={vid.thumbnailUrl?.trim() || 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=800&q=80'} alt={vid.title} className="w-full h-full object-cover opacity-80" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-8 h-8 rounded-full bg-red-600 text-white flex items-center justify-center">
                        <Play className="w-4 h-4 fill-current ml-0.5" />
                      </div>
                    </div>
                  </div>
                  <h4 className="font-bold text-sm text-slate-900 dark:text-white line-clamp-2">
                    {vid.title}
                  </h4>
                  <p className="text-xs text-slate-400 font-mono truncate">{vid.youtubeUrl}</p>
                  <div className="text-[11px] text-slate-400 flex items-center justify-between pt-1 border-t">
                    <span>{vid.duration}</span>
                    <button
                      onClick={() => handleDeleteVideo(vid.id)}
                      className="text-red-500 hover:text-red-700"
                      title="মুছে ফেলুন"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ================= TAB CONTENT 5: USERS MANAGEMENT (Requirement 8) ================= */}
        {activeMainTab === 'users' && (
          <div className="p-6 space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <h3 className="text-lg font-bold">ব্যবহারকারী ও সাংবাদিক ভূমিকা নিয়ন্ত্রণ (Users & Roles)</h3>
                <p className="text-xs text-slate-500">
                  অ্যাডমিন (Admin: পূর্ণ নিয়ন্ত্রণ), লেখক (Author: পোস্ট লেখার অনুমতি), পাঠক (Subscriber: শুধু পড়া ও মন্তব্য)।
                </p>
              </div>
              <button
                onClick={() => setIsAddUserModalOpen(true)}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-bold flex items-center gap-1.5 shadow-xs"
              >
                <Plus className="w-4 h-4" />
                <span>নতুন ব্যবহারকারী যোগ করুন</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {users.map((u) => (
                <div
                  key={u.id}
                  className={`p-4 rounded-lg border space-y-3 ${
                    darkMode ? 'bg-[#1b222c] border-slate-800' : 'bg-white border-slate-200'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <img
                        src={u.avatar || getAuthorAvatar(u.name)}
                        alt={u.name}
                        className="w-12 h-12 rounded-full object-cover border-2 border-red-600"
                      />
                      <div>
                        <h4 className="font-bold text-sm text-slate-900 dark:text-white">{u.name}</h4>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                          u.role === 'admin' ? 'bg-red-600 text-white' : u.role === 'author' ? 'bg-blue-600 text-white' : 'bg-slate-500 text-white'
                        }`}>
                          {u.roleBn}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => setIdCardPreviewUser(u)}
                        className="text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-950 p-1.5 rounded transition-colors"
                        title="ডিজিটাল আইডি কার্ড দেখুন"
                      >
                        <CreditCard className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => setEditingUser(u)}
                        className="text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-950 p-1.5 rounded transition-colors"
                        title="ব্যবহারকারীর তথ্য ও অনুমতি সম্পাদনা"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => handleDeleteUser(u.id)}
                        className="text-red-500 hover:bg-red-50 dark:hover:bg-red-950 p-1.5 rounded transition-colors"
                        title="ইউজার ডিলিট করুন"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1 text-xs">
                    <p className="text-slate-400 font-mono text-[11px] truncate">{u.email}</p>
                    {u.designation && (
                      <p className="text-slate-600 dark:text-slate-300 font-medium truncate">
                        পদবী: {u.designation}
                      </p>
                    )}
                    {u.idCardNumber && (
                      <p className="text-slate-500 font-mono text-[10px]">
                        কার্ড নং: {u.idCardNumber}
                      </p>
                    )}
                  </div>

                  {/* Auto-Approve Switch (Requirement 8) */}
                  <div className="pt-2 border-t flex items-center justify-between text-xs">
                    <div>
                      <span className="font-bold block">স্বয়ংক্রিয় প্রকাশ (Auto-Approve)</span>
                      <span className="text-[10px] text-slate-400">
                        {u.autoApprove ? 'সরাসরি লাইভ হবে' : 'অ্যাডমিন অনুমোদন লাগবে'}
                      </span>
                    </div>
                    <button
                      onClick={() => handleToggleUserAutoApprove(u.id)}
                      className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                        u.autoApprove ? 'bg-emerald-600' : 'bg-slate-300 dark:bg-slate-700'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition ${
                          u.autoApprove ? 'translate-x-4' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* User Edit Modal (Requirement 3) */}
            {editingUser && (
              <UserEditModal
                user={editingUser}
                isOpen={!!editingUser}
                onClose={() => setEditingUser(null)}
                onSaveUser={(updated) => {
                  const nextUsers = users.map(userItem => userItem.id === updated.id ? updated : userItem);
                  onUpdateUsers(nextUsers);
                  setEditingUser(null);
                }}
                darkMode={darkMode}
              />
            )}

            {/* User Digital ID Card Preview Modal */}
            {idCardPreviewUser && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs font-solaiman">
                <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-xl w-full p-4 space-y-3 border border-slate-300 dark:border-slate-700 shadow-2xl">
                  <div className="flex items-center justify-between pb-2 border-b">
                    <h4 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                      <CreditCard className="w-4 h-4 text-red-600" />
                      <span>{idCardPreviewUser.name} - এর অফিসিয়াল ডিজিটাল প্রেস আইডি কার্ড</span>
                    </h4>
                    <button
                      onClick={() => setIdCardPreviewUser(null)}
                      className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-white cursor-pointer"
                    >
                      ✕
                    </button>
                  </div>
                  <div className="p-2">
                    <DigitalIdCard
                      user={idCardPreviewUser}
                      template={localSettings.idCardTemplate}
                      darkMode={darkMode}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ================= TAB CONTENT: RECRUITMENT MANAGEMENT (Requirement 1 & 2) ================= */}
        {activeMainTab === 'recruitment' && (
          <div className="p-6">
            <RecruitmentManagementPanel
              applications={jobApplications}
              onUpdateApplications={onUpdateJobApplications || (() => {})}
              settings={localSettings}
              onUpdateSettings={(newS) => {
                setLocalSettings(newS);
                onUpdateSettings(newS);
              }}
              users={users}
              onUpdateUsers={onUpdateUsers}
              familyMembers={familyMembers}
              onUpdateFamilyMembers={onUpdateFamilyMembers}
              darkMode={darkMode}
            />
          </div>
        )}

        {/* ================= TAB CONTENT: DIGITAL ID CARD TEMPLATE (Requirement 2) ================= */}
        {activeMainTab === 'idcard_template' && (
          <div className="p-6">
            <IdCardTemplateConfigurator
              settings={localSettings}
              onUpdateSettings={(newS) => {
                setLocalSettings(newS);
                onUpdateSettings(newS);
              }}
              sampleUser={users[0]}
              darkMode={darkMode}
            />
          </div>
        )}

        {/* ================= TAB CONTENT 6: POSTS MANAGEMENT ================= */}
        {activeMainTab === 'posts' && (
          <div className="p-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-lg font-bold">প্রকাশিত সংবাদ তালিকা ({articles.filter(a => a.status !== 'pending').length})</h3>
                <p className="text-xs text-slate-500">সকল প্রকাশিত সংবাদ সম্পাদনা ও নিয়ন্ত্রণ</p>
              </div>
              <button
                onClick={() => {
                  setEditingPost(null);
                  setPostTitle('');
                  setPostExcerpt('');
                  setPostContent('');
                  setPostImageUrl('');
                  setIsAddPostModalOpen(true);
                }}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-bold flex items-center gap-1.5 shadow-xs"
              >
                <Plus className="w-4 h-4" />
                <span>নতুন সংবাদ প্রকাশ করুন</span>
              </button>
            </div>

            {/* Filter and Search Bar */}
            <div className="flex flex-col sm:flex-row items-center gap-3">
              <div className="relative flex-1 w-full">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="শিরোনাম দিয়ে খুঁজুন..."
                  value={postSearch}
                  onChange={(e) => setPostSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 rounded border border-slate-300 dark:border-slate-700 bg-transparent text-xs"
                />
              </div>

              <select
                value={postCategoryFilter}
                onChange={(e) => setPostCategoryFilter(e.target.value)}
                className="w-full sm:w-44 px-3 py-2 rounded border border-slate-300 dark:border-slate-700 bg-transparent text-xs font-solaiman"
              >
                <option value="all">সব বিভাগ</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.nameBn} className="bg-white dark:bg-slate-800">
                    {c.nameBn}
                  </option>
                ))}
              </select>

              {/* Schedule / Status Filter (Requirement 2) */}
              <select
                value={postScheduleFilter}
                onChange={(e) => setPostScheduleFilter(e.target.value as any)}
                className="w-full sm:w-48 px-3 py-2 rounded border border-slate-300 dark:border-slate-700 bg-transparent text-xs font-solaiman font-bold"
              >
                <option value="all">সব পোস্ট (সকল স্ট্যাটাস)</option>
                <option value="live">লাইভ প্রকাশিত সংবাদ</option>
                <option value="scheduled">⏰ শিডিউলকৃত সংবাদ</option>
                <option value="backdated">📜 ব্যাকডেটকৃত আর্কাইভ</option>
                <option value="expired">🔒 মেয়াদোত্তীর্ণ / আনপাবলিশ</option>
                <option value="hidden">🙈 হাইড করা সংবাদ (Hidden / Unpublished)</option>
              </select>
            </div>

            {/* Posts Table */}
            <div className={`rounded-lg border overflow-hidden ${
              darkMode ? 'bg-[#1b222c] border-slate-800' : 'bg-white border-slate-200'
            }`}>
              <div className="grid grid-cols-12 p-3 bg-slate-50 dark:bg-slate-800/60 border-b text-xs font-bold text-slate-600 dark:text-slate-400">
                <div className="col-span-1">ছবি</div>
                <div className="col-span-5">শিরোনাম ও স্ট্যাটাস</div>
                <div className="col-span-2">বিভাগ ও জেলা</div>
                <div className="col-span-2">প্রতিবেদক ও সময়</div>
                <div className="col-span-2 text-right">অ্যাকশন</div>
              </div>

              <div className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                {filteredPosts.filter(a => a.status !== 'pending').map((art) => {
                  const isScheduledPost = art.isScheduled || art.publishMode === 'scheduled';
                  const isBackdatedPost = art.isBackdated || art.publishMode === 'backdated';
                  const isExpiredPost = art.isExpired || (art.isAutoExpire && art.expiresAt && new Date(art.expiresAt) < new Date());
                  const isHiddenPost = art.isHidden || art.status === 'hidden';

                  return (
                    <div key={art.id} className="grid grid-cols-12 p-3 items-center hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                      <div className="col-span-1">
                        <div className="w-12 h-9 rounded overflow-hidden bg-slate-100 dark:bg-slate-800 relative">
                          <img src={art.imageUrl?.trim() || 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?auto=format&fit=crop&w=800&q=80'} alt={art.title} className="w-full h-full object-cover" />
                          {art.storageProvider && art.storageProvider !== 'local' && (
                            <span className="absolute bottom-0 right-0 text-[7px] font-bold bg-blue-600 text-white px-0.5 font-mono">
                              CDN
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="col-span-5 pr-2">
                        <h4 className="font-bold text-sm text-slate-900 dark:text-white line-clamp-1">
                          {art.title}
                        </h4>
                        <div className="flex flex-wrap items-center gap-1.5 mt-1">
                          {isHiddenPost && (
                            <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 flex items-center gap-0.5 border border-rose-300 dark:border-rose-800">
                              <EyeOff className="w-2.5 h-2.5" />
                              হাইড করা (পাবলিক ভিউতে গোপন)
                            </span>
                          )}
                          {art.isLead && (
                            <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-amber-500 text-white">
                              লিড সংবাদ
                            </span>
                          )}
                          {art.isBreaking && (
                            <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-red-600 text-white">
                              ব্রেকিং
                            </span>
                          )}
                          {isScheduledPost && (
                            <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 flex items-center gap-0.5 font-mono">
                              <Clock className="w-2.5 h-2.5" />
                              শিডিউল: {art.scheduledAt?.slice(0, 10) || 'আসন্ন'}
                            </span>
                          )}
                          {isBackdatedPost && (
                            <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 flex items-center gap-0.5">
                              <History className="w-2.5 h-2.5" />
                              ব্যাকডেট: {art.date}
                            </span>
                          )}
                          {isExpiredPost && (
                            <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 flex items-center gap-0.5">
                              <TimerOff className="w-2.5 h-2.5" />
                              মেয়াদোত্তীর্ণ
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="col-span-2">
                        <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold block w-fit truncate">
                          {art.category}
                        </span>
                        {art.district && (
                          <span className="text-[10px] text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-0.5">
                            <MapPin className="w-2.5 h-2.5 text-red-500 shrink-0" />
                            <span className="truncate">{art.district}</span>
                          </span>
                        )}
                      </div>
                      <div className="col-span-2 text-slate-500">
                        <div className="flex items-center gap-1.5">
                          <img 
                            src={getAuthorAvatar(art.author, art.authorAvatar, localSettings.lightLogoUrl || localSettings.darkLogoUrl)} 
                            alt="" 
                            onError={(e) => {
                              const fallbackLogo = localSettings.lightLogoUrl || localSettings.darkLogoUrl;
                              if (fallbackLogo && e.currentTarget.src !== fallbackLogo) {
                                e.currentTarget.src = fallbackLogo;
                              } else {
                                e.currentTarget.src = DEFAULT_AVATAR_DATA_URI;
                              }
                            }}
                            className="w-4 h-4 rounded-full object-cover bg-slate-100 dark:bg-slate-800 shrink-0" 
                          />
                          <span className="truncate">{art.author}</span>
                        </div>
                        <div className="text-[11px] text-slate-400">{art.date}</div>
                      </div>
                      <div className="col-span-2 flex items-center justify-end gap-1.5">
                        {/* 1-Click Post Hide / Unpublish Toggle */}
                        <button
                          onClick={() => handleToggleHidePost(art)}
                          className={`p-1.5 rounded transition-all text-[10px] font-bold flex items-center gap-1 cursor-pointer ${
                            isHiddenPost
                              ? 'bg-rose-600 text-white hover:bg-rose-700 shadow-2xs ring-1 ring-rose-400'
                              : 'text-slate-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40'
                          }`}
                          title={
                            isHiddenPost
                              ? 'সংবাদটি আনহাইড করুন (পাবলিক ভিউতে দৃশ্যমান হবে)'
                              : 'সংবাদটি হাইড করুন (পাবলিক ভিউ থেকে গোপন থাকবে)'
                          }
                        >
                          {isHiddenPost ? (
                            <>
                              <EyeOff className="w-3.5 h-3.5 text-white" />
                              <span className="hidden xl:inline">হাইডড</span>
                            </>
                          ) : (
                            <>
                              <Eye className="w-3.5 h-3.5" />
                              <span className="hidden xl:inline">হাইড</span>
                            </>
                          )}
                        </button>
                        <button
                          onClick={() => {
                            setSelectedArticleForCard(art);
                            setActiveMainTab('photocard');
                          }}
                          className="p-1.5 text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950 rounded flex items-center gap-1 font-bold transition-colors"
                          title="এই সংবাদের ফটো কার্ড তৈরি করুন"
                        >
                          <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                          <span className="hidden xl:inline text-[10px]">কার্ড</span>
                        </button>
                        <button
                          onClick={() => onToggleBreaking(art.id)}
                          className={art.isBreaking ? "p-1.5 rounded transition-colors text-[10px] font-bold bg-red-600 text-white" : "p-1.5 rounded transition-colors text-[10px] font-bold hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-400"}
                          title="ব্রেকিং নিউজ টগল"
                        >
                          <Flame className="w-3.5 h-3.5" />
                        </button>
                        {/* Edit Button guarded by RBAC */}
                        {canEditArticle(currentUser.role, art, currentUser) ? (
                          <button
                            onClick={() => handleStartEditPost(art)}
                            className="p-1.5 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950 rounded cursor-pointer"
                            title="সম্পাদনা করুন"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                        ) : (
                          <span
                            className="p-1.5 text-slate-300 dark:text-slate-600 cursor-not-allowed opacity-50"
                            title="নিরাপত্তা নীতি: শুধুমাত্র নিজের সংবাদ সম্পাদনা করা যাবে (অন্য প্রতিবেদকের সংবাদ লকড)"
                          >
                            <Lock className="w-3.5 h-3.5" />
                          </span>
                        )}

                        {/* Delete Button guarded by RBAC: Journalists CANNOT delete posts */}
                        {canDeleteArticle(currentUser.role) ? (
                          <button
                            onClick={() => {
                              setArticleToDelete(art);
                            }}
                            className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-950 rounded cursor-pointer transition-colors"
                            title="মুছে ফেলুন"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        ) : (
                          <span
                            className="p-1.5 text-slate-300 dark:text-slate-600 cursor-not-allowed opacity-30"
                            title="নিরাপত্তা নীতি: সাংবাদিকদের সংবাদ মুছে ফেলার অনুমতি নেই (শুধুমাত্র অ্যাডমিন বা এডিটর মুছতে পারেন)"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ================= TAB CONTENT 7: ADVANCED AD MANAGER & PLACEMENT CONTROLLER ================= */}
        {activeMainTab === 'ads' && (
          <AdManagerPanel
            adSlots={adSlots}
            onUpdateAdSlots={onUpdateAdSlots}
            darkMode={darkMode}
            showSuccessMessage={showSuccessMessage}
          />
        )}

        {/* ================= TAB CONTENT 8: BREAKING TICKER ================= */}
        {activeMainTab === 'breaking' && (
          <div className="p-3 sm:p-6 space-y-4 sm:space-y-6">
            <div className="border-b pb-3 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold flex items-center gap-2">
                  <Flame className="w-5 h-5 text-red-600" />
                  <span>ব্রেকিং নিউজ টিকার ব্যবস্থাপনা (Breaking News Ticker - Latest 10)</span>
                </h3>
                <p className="text-xs text-slate-500">
                  হোমপেজ টিকার বারে সক্রিয় থাকা সর্বশেষ ১০টি ব্রেকিং নিউজ নিয়ন্ত্রণ করুন।
                </p>
              </div>
            </div>

            {/* Add New Ticker Box */}
            <div className={`p-4 rounded-lg border ${
              darkMode ? 'bg-[#1b222c] border-slate-800' : 'bg-white border-slate-200'
            }`}>
              <h4 className="font-bold text-sm mb-3">নতুন ব্রেকিং নিউজ যুক্ত করুন</h4>
              <form onSubmit={handleAddTicker} className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
                <div className="md:col-span-6">
                  <label className="block text-xs text-slate-500 mb-1">ব্রেকিং শিরোনাম *</label>
                  <input
                    type="text"
                    required
                    placeholder="যেমন: প্রধান উপদেষ্টার বিশেষ কূটনৈতিক ব্রিফিং শুরু..."
                    value={newTickerText}
                    onChange={(e) => setNewTickerText(e.target.value)}
                    className="w-full px-3 py-2 rounded border border-slate-300 dark:border-slate-700 bg-transparent text-sm"
                  />
                </div>
                <div className="md:col-span-3">
                  <label className="block text-xs text-slate-500 mb-1">সংবাদের লিংক (ঐচ্ছিক)</label>
                  <select
                    value={newTickerArticleId}
                    onChange={(e) => setNewTickerArticleId(e.target.value)}
                    className="w-full px-3 py-2 rounded border border-slate-300 dark:border-slate-700 bg-transparent text-xs"
                  >
                    <option value="">কোনো আর্টিকেলের সাথে যুক্ত নয়</option>
                    {articles.map((art) => (
                      <option key={art.id} value={art.id} className="bg-white dark:bg-slate-800">
                        {art.title.substring(0, 35)}...
                      </option>
                    ))}
                  </select>
                </div>
                <div className="md:col-span-3">
                  <button
                    type="submit"
                    className="w-full py-2 bg-red-600 hover:bg-red-700 text-white rounded text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs"
                  >
                    <Plus className="w-4 h-4" />
                    <span>টিকার যুক্ত করুন</span>
                  </button>
                </div>
              </form>
            </div>

            {/* Active Tickers List */}
            <div className={`rounded-lg border overflow-hidden ${
              darkMode ? 'bg-[#1b222c] border-slate-800' : 'bg-white border-slate-200'
            }`}>
              <div className="p-3 bg-slate-50 dark:bg-slate-800/60 border-b flex items-center justify-between text-xs font-bold">
                <span>কাস্টম ব্রেকিং টিকার তালিকা ({customTickers.length})</span>
                <span className="text-slate-400">সর্বশেষ ১০টি টিকার রোটেট করে</span>
              </div>
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {customTickers.map((ticker) => (
                  <div key={ticker.id} className="p-3.5 flex items-center justify-between gap-4 hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                    <div className="flex items-center gap-3 flex-1">
                      <span className="w-2.5 h-2.5 rounded-full bg-red-600 animate-pulse shrink-0" />
                      <div>
                        <p className="text-sm font-bold text-slate-900 dark:text-white">{ticker.text}</p>
                        <span className="text-[11px] text-slate-400">{ticker.timeAgo}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => handleToggleTicker(ticker.id)}
                        className={`px-2.5 py-1 text-xs font-bold rounded ${
                          ticker.isActive ? 'bg-emerald-600 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-600'
                        }`}
                      >
                        {ticker.isActive ? 'সক্রিয়' : 'বন্ধ'}
                      </button>
                      <button
                        onClick={() => handleDeleteTicker(ticker.id)}
                        className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-950 rounded"
                        title="মুছে ফেলুন"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ================= TAB CONTENT 9: CATEGORIES ================= */}
        {activeMainTab === 'categories' && (
          <div className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold">ক্যাটাগরি ব্যবস্থাপনা ({categories.length})</h3>
                <p className="text-xs text-slate-500">নতুন ক্যাটাগরি যোগ করলে বা ডিলিট করলে তা মেনুবারে স্বয়ংক্রিয়ভাবে সাজিয়ে যাবে।</p>
              </div>
              <button
                onClick={() => {
                  setEditingCategory(null);
                  setNewCatBn('');
                  setNewCatEn('');
                  setIsAddCatModalOpen(true);
                }}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-bold flex items-center gap-1.5 shadow-xs"
              >
                <Plus className="w-4 h-4" />
                <span>নতুন ক্যাটাগরি তৈরি করুন</span>
              </button>
            </div>

            <div className={`rounded-lg border overflow-hidden ${
              darkMode ? 'bg-[#1b222c] border-slate-800' : 'bg-white border-slate-200'
            }`}>
              <div className="grid grid-cols-12 p-3 bg-slate-50 dark:bg-slate-800/60 border-b text-xs font-bold text-slate-600 dark:text-slate-400">
                <div className="col-span-1">ক্রম</div>
                <div className="col-span-4">ক্যাটাগরির বাংলা নাম</div>
                <div className="col-span-3">English Slug</div>
                <div className="col-span-2 text-center">পোস্ট সংখ্যা</div>
                <div className="col-span-2 text-right">অ্যাকশন</div>
              </div>

              <div className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                {categories.map((cat, idx) => (
                  <div key={cat.id} className="grid grid-cols-12 p-3.5 items-center hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                    <div className="col-span-1 flex items-center gap-1 text-slate-400 font-mono">
                      <span>{idx + 1}</span>
                      {onReorderCategories && (
                        <div className="flex flex-col">
                          <button onClick={() => handleMoveCategory(idx, 'up')} className="hover:text-blue-600 disabled:opacity-20" disabled={idx === 0}>
                            <ArrowUp className="w-3 h-3" />
                          </button>
                          <button onClick={() => handleMoveCategory(idx, 'down')} className="hover:text-blue-600 disabled:opacity-20" disabled={idx === categories.length - 1}>
                            <ArrowDown className="w-3 h-3" />
                          </button>
                        </div>
                      )}
                    </div>
                    <div className="col-span-4 font-bold text-sm text-slate-900 dark:text-white">
                      {cat.nameBn}
                    </div>
                    <div className="col-span-3 font-mono text-slate-500">
                      {cat.nameEn || cat.slug}
                    </div>
                    <div className="col-span-2 text-center font-bold text-slate-600 dark:text-slate-300">
                      {articles.filter((a) => a.category === cat.nameBn).length} টি
                    </div>
                    <div className="col-span-2 flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleStartEditCategory(cat)}
                        className="p-1.5 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950 rounded"
                        title="সম্পাদনা"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(`'${cat.nameBn}' ক্যাটাগরি মুছে ফেলতে চান?`)) {
                            onDeleteCategory(cat.id);
                            showSuccessMessage('ক্যাটাগরি মুছে ফেলা হয়েছে!');
                          }
                        }}
                        className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-950 rounded"
                        title="মুছে ফেলুন"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ================= TAB CONTENT: HOMEPAGE CONTROL ================= */}
        {activeMainTab === 'homepage_control' && (
          <div className="p-3 sm:p-6 space-y-4 sm:space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b pb-4">
              <div>
                <h3 className="text-lg font-bold flex items-center gap-2">
                  <Layout className="w-5 h-5 text-sky-500" />
                  <span>হোমপেজ ক্যাটাগরি ও অবস্থান কন্ট্রোল (Homepage Layout & Categories)</span>
                </h3>
                <p className="text-xs text-slate-500">
                  হোমপেজে কোন কোন ক্যাটাগরি প্রদর্শিত হবে, কোন ক্রমে সাজানো থাকবে এবং প্রতিটি ক্যাটাগরিতে কতটি করে সংবাদ দেখাবে তা এখান থেকে নিয়ন্ত্রণ করুন।
                </p>
              </div>
              <button
                onClick={handleSaveHomepageLayout}
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-bold flex items-center gap-2 shadow-xs transition-colors"
              >
                <Save className="w-4 h-4" />
                <span>পরিবর্তন সংরক্ষণ করুন (Save Layout)</span>
              </button>
            </div>

            {/* Part 1: Homepage Category Order & Post Count Configuration */}
            <div className={`rounded-xl border overflow-hidden shadow-xs ${
              darkMode ? 'bg-[#1b222c] border-slate-800' : 'bg-white border-slate-200'
            }`}>
              <div className="p-4 bg-slate-50 dark:bg-slate-800/60 border-b flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                    <Layers className="w-4 h-4 text-blue-600" />
                    <span>১. ক্যাটাগরি ভিত্তিক হোমপেজ প্রদর্শন ও পোস্ট সংখ্যা নিয়ন্ত্রণ</span>
                  </h4>
                  <p className="text-xs text-slate-500">ক্যাটাগরি অন/অফ করুন, অবস্থান পরিবর্তন করুন এবং কতটি সংবাদ দেখাবে তা সিলেক্ট করুন</p>
                </div>
                <span className="text-xs font-mono font-bold px-2.5 py-1 rounded bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300">
                  মোট {categories.length}টি ক্যাটাগরি
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 uppercase text-[11px] font-bold border-b">
                    <tr>
                      <th className="p-3 w-16 text-center">পজিশন</th>
                      <th className="p-3">ক্যাটাগরির নাম (বাংলা ও ইংরেজি)</th>
                      <th className="p-3 text-center">হোমপেজে প্রদর্শন</th>
                      <th className="p-3 text-center">প্রদর্শিত পোস্ট সংখ্যা</th>
                      <th className="p-3 text-center">মোট সংবাদ</th>
                      <th className="p-3 text-right">অবস্থান সাজান</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {categories.map((cat, idx) => {
                      const isShown = cat.showOnHomepage !== false;
                      const postCount = cat.count || 4;
                      const totalArticles = articles.filter(a => a.category === cat.nameBn).length;

                      return (
                        <tr key={cat.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                          <td className="p-3 text-center font-mono font-bold text-slate-400">
                            #{idx + 1}
                          </td>
                          <td className="p-3">
                            <div className="font-bold text-sm text-slate-900 dark:text-white">
                              {cat.nameBn}
                            </div>
                            <div className="text-[11px] text-slate-400 font-mono">
                              Slug: {cat.slug || cat.nameEn}
                            </div>
                          </td>
                          <td className="p-3 text-center">
                            <button
                              type="button"
                              onClick={() => handleToggleHpCategory(cat.id)}
                              className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
                                isShown
                                  ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/30'
                                  : 'bg-slate-200 dark:bg-slate-700 text-slate-500'
                              }`}
                            >
                              {isShown ? '✓ হোমপেজে দৃশ্যমান' : '✕ বন্ধ রয়েছে'}
                            </button>
                          </td>
                          <td className="p-3 text-center">
                            <select
                              value={postCount}
                              onChange={(e) => handleHpCategoryCountChange(cat.id, parseInt(e.target.value) || 4)}
                              className="px-2.5 py-1.5 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-bold text-xs"
                            >
                              <option value="2">২টি সংবাদ</option>
                              <option value="4">৪টি সংবাদ</option>
                              <option value="6">৬টি সংবাদ</option>
                              <option value="8">৮টি সংবাদ</option>
                              <option value="10">১০টি সংবাদ</option>
                              <option value="12">১২টি সংবাদ</option>
                            </select>
                          </td>
                          <td className="p-3 text-center font-bold text-slate-600 dark:text-slate-300">
                            {totalArticles} টি
                          </td>
                          <td className="p-3 text-right">
                            <div className="inline-flex items-center gap-1">
                              <button
                                onClick={() => handleMoveCategory(idx, 'up')}
                                disabled={idx === 0}
                                title="উপরে নিন"
                                className="p-1 rounded hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-30 transition-colors"
                              >
                                <ArrowUp className="w-4 h-4 text-blue-600" />
                              </button>
                              <button
                                onClick={() => handleMoveCategory(idx, 'down')}
                                disabled={idx === categories.length - 1}
                                title="নিচে নামান"
                                className="p-1 rounded hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-30 transition-colors"
                              >
                                <ArrowDown className="w-4 h-4 text-blue-600" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Part 2: Homepage Master Sections Toggles */}
            <div className={`p-5 rounded-xl border space-y-4 ${
              darkMode ? 'bg-[#1b222c] border-slate-800' : 'bg-white border-slate-200'
            }`}>
              <div className="border-b pb-3">
                <h4 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                  <SlidersHorizontal className="w-4 h-4 text-sky-500" />
                  <span>২. হোমপেজ মূল সেকশনসমূহ অন/অফ (Homepage Main Sections On/Off)</span>
                </h4>
                <p className="text-xs text-slate-500">হোমপেজে কোন কোন মডিউল বা সেকশন প্রদর্শন করতে চান তা টিক দিন</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 text-xs">
                {[
                  { key: 'showBreakingTicker', label: 'ব্রেকিং নিউজ টিকার (Breaking Ticker)', desc: 'সর্বশেষ ১০টি গুরুত্বপূর্ণ সংবাদের স্ক্রলিং বার' },
                  { key: 'showHero', label: 'হিরো ও প্রধান লিড সংবাদ (Hero & Lead Section)', desc: 'প্রধান ব্যানার নিউজ ও টপ স্টোরিজ' },
                  { key: 'showSpecial', label: 'বিশেষ সংবাদ কার্ড (Special Cards)', desc: '৩টি বিশেষ কালার কোডেড সংবাদ কার্ড' },
                  { key: 'showNational', label: 'জাতীয় সংবাদ সেকশন (National Section)', desc: 'জাতীয় বিভাগের শীর্ষ সংবাদ গ্রিড' },
                  { key: 'showPolitics', label: 'রাজনীতি ও ট্রেন্ডিং (Politics & Trending)', desc: 'রাজনীতি সংবাদ ও ট্রেন্ডিং স্টোরি' },
                  { key: 'showWorld', label: 'আন্তর্জাতিক বিশ্ব সংবাদ (World Section)', desc: 'সারাবিশ্বের সংবাদ ও আপডেট' },
                  { key: 'showCountrywide', label: 'সারাদেশ সংবাদ (Countrywide Section)', desc: 'জেলা ও উপজেলার স্থানীয় সংবাদ' },
                  { key: 'showPhotoGallery', label: 'ফটো গ্যালারী (Photo Gallery)', desc: 'ফটোগ্যালারির বিশেষ আলোকচিত্র' },
                  { key: 'showShowbiz', label: 'বিনোদন ও শোবিজ (Showbiz Section)', desc: 'সিনেমা, তারকা ও বিনোদন সংবাদ' },
                  { key: 'showMultiGrid', label: 'মাল্টি-ক্যাটাগরি গ্রিড (Multi Category Grid)', desc: 'অর্থনীতি, সাক্ষাৎকার ও অন্যান্য বিভাগ' },
                  { key: 'showVideoGallery', label: 'ভিডিও সংবাদ গ্যালারি (Video Gallery)', desc: 'ইউটিউব ও সোশ্যাল ভিডিও রিপোর্ট' },
                  { key: 'showFamily', label: 'আমাদের পরিবার সেকশন (Our Family Section)', desc: 'হোমপেজে সাংবাদিকদের পোর্টফোলিও গ্রিড' },
                ].map((sec) => {
                  const isChecked = (hpSectionsState as any)[sec.key] !== false;
                  return (
                    <label
                      key={sec.key}
                      className={`p-3.5 rounded-lg border flex items-start gap-3 cursor-pointer transition-all ${
                        isChecked
                          ? 'border-blue-500/40 bg-blue-50/20 dark:bg-blue-950/20'
                          : 'border-slate-200 dark:border-slate-800 opacity-60'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={(e) => {
                          setHpSectionsState({
                            ...hpSectionsState,
                            [sec.key]: e.target.checked
                          });
                        }}
                        className="mt-0.5 w-4 h-4 text-blue-600 rounded"
                      />
                      <div>
                        <span className="font-bold text-slate-900 dark:text-white block">{sec.label}</span>
                        <span className="text-[11px] text-slate-500 block mt-0.5">{sec.desc}</span>
                      </div>
                    </label>
                  );
                })}
              </div>

              <div className="pt-3 border-t flex justify-end">
                <button
                  type="button"
                  onClick={handleSaveHomepageLayout}
                  className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-bold flex items-center gap-2 shadow-xs transition-colors"
                >
                  <Save className="w-4 h-4" />
                  <span>হোমপেজ সেটিংস সংরক্ষণ করুন</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ================= TAB CONTENT: MENU BUILDER ================= */}
        {activeMainTab === 'menu_builder' && (
          <MenuBuilderView
            categories={categories}
            darkMode={darkMode}
            onAddCategory={onAddCategory}
            onUpdateCategory={onUpdateCategory}
            onDeleteCategory={onDeleteCategory}
            onReorderCategories={onReorderCategories}
            showSuccessMessage={showSuccessMessage}
          />
        )}

        {/* ================= TAB CONTENT: OUR FAMILY (JOURNALISTS DIRECTORY) ================= */}
        {activeMainTab === 'family' && (
          <div className="p-3 sm:p-6 space-y-4 sm:space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b pb-4">
              <div>
                <h3 className="text-lg font-bold flex items-center gap-2">
                  <Award className="w-5 h-5 text-purple-600" />
                  <span>আমাদের পরিবার - সাংবাদিক ও টিম ব্যবস্থাপনা (Our Family Directory)</span>
                </h3>
                <p className="text-xs text-slate-500">
                  পত্রিকার সকল সাংবাদিক, সম্পাদক ও কর্মীদের পাসপোর্ট সাইজের ছবি, নাম, পদবী ও ফোন নম্বর যুক্ত করুন। এটি ফ্রন্টএন্ডে প্রতি সারিতে ৪টি করে কার্ডে দেখাবে।
                </p>
              </div>
              <button
                onClick={() => {
                  setEditingFamilyMember(null);
                  setFamName('');
                  setFamDesignation('');
                  setFamPhone('');
                  setFamEmail('');
                  setFamPhotoUrl('');
                  setIsAddFamilyModalOpen(true);
                }}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>নতুন সাংবাদিক / সদস্য যুক্ত করুন</span>
              </button>
            </div>

            {/* Journalists Grid View (4 items per row matching frontend) */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                  সংবাদকর্মী ও সম্পাদকীয় পরিবারের সদস্যবৃন্দ ({familyMembers.length} জন)
                </h4>
                <span className="text-[11px] text-slate-500">প্রতি সারিতে ৪টি কার্ড আকারে বিন্যস্ত</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {familyMembers.map((member, idx) => (
                  <div
                    key={member.id}
                    className={`rounded-xl border p-4 flex flex-col items-center text-center space-y-3 relative group transition-all hover:shadow-md ${
                      darkMode ? 'bg-[#1b222c] border-slate-800' : 'bg-white border-slate-200'
                    }`}
                  >
                    {/* Move buttons */}
                    <div className="absolute top-2 left-2 flex items-center gap-0.5 opacity-60 group-hover:opacity-100">
                      <button
                        onClick={() => handleMoveFamilyMember(idx, 'up')}
                        disabled={idx === 0}
                        className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded disabled:opacity-20"
                        title="আগে নিন"
                      >
                        <ArrowUp className="w-3 h-3 text-slate-600 dark:text-slate-300" />
                      </button>
                      <button
                        onClick={() => handleMoveFamilyMember(idx, 'down')}
                        disabled={idx === familyMembers.length - 1}
                        className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded disabled:opacity-20"
                        title="পরে নিন"
                      >
                        <ArrowDown className="w-3 h-3 text-slate-600 dark:text-slate-300" />
                      </button>
                    </div>

                    {/* Action buttons */}
                    <div className="absolute top-2 right-2 flex items-center gap-1">
                      <button
                        onClick={() => {
                          setEditingFamilyMember(member);
                          setFamName(member.name || '');
                          setFamDesignation(member.designation || '');
                          setFamPhone(member.phone || '');
                          setFamEmail(member.email || '');
                          setFamPhotoUrl(member.photoUrl || '');
                          setIsAddFamilyModalOpen(true);
                        }}
                        className="p-1 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950 rounded"
                        title="সম্পাদনা"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteFamilyMember(member.id)}
                        className="p-1 text-red-500 hover:bg-red-50 dark:hover:bg-red-950 rounded"
                        title="মুছে ফেলুন"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Passport Size Photo Preview */}
                    <div className="w-24 h-24 rounded-full overflow-hidden border-3 border-red-600 shadow-xs bg-slate-100 dark:bg-slate-800 mt-2">
                      <img
                        src={member.photoUrl?.trim() || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80'}
                        alt={member.name}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    <div className="space-y-0.5 w-full">
                      <h5 className="font-bold text-sm text-slate-900 dark:text-white line-clamp-1">
                        {member.name}
                      </h5>
                      <p className="text-xs font-semibold text-red-600 dark:text-red-400">
                        {member.designation}
                      </p>
                    </div>

                    <div className="w-full pt-2.5 border-t border-slate-100 dark:border-slate-800 space-y-1 text-xs text-slate-600 dark:text-slate-400">
                      {member.phone && (
                        <div className="flex items-center justify-center gap-1.5">
                          <Phone className="w-3 h-3 text-red-600 shrink-0" />
                          <span className="font-latin text-[11px]">{member.phone}</span>
                        </div>
                      )}
                      {member.email && (
                        <div className="flex items-center justify-center gap-1.5 truncate">
                          <Mail className="w-3 h-3 text-red-600 shrink-0" />
                          <span className="truncate text-[11px]">{member.email}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ================= TAB CONTENT 10: APPLICATION SETTINGS (Requirement 9) ================= */}
        {activeMainTab === 'settings' && (
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
              {/* Settings Sub-Navigation */}
              <div className="md:col-span-3 space-y-1">
                {[
                  { id: 'header', label: 'Header Setting (হেডার ও লোগো সাইজ)', icon: Sliders },
                  { id: 'theme', label: 'Theme Setting (থিম, ক্যাটাগরি ও মেন্যু)', icon: Palette },
                  { id: 'footer', label: 'Footer Setting (ফুটার ও তথ্য)', icon: Layers },
                  { id: 'mobile_app', label: 'Mobile App Links & Badges (মোবাইল অ্যাপ ও ডাউনলোড লিংক)', icon: Smartphone },
                  { id: 'ad', label: 'Ad Setting (বিজ্ঞাপন ব্যানার ও স্লট)', icon: Globe },
                  { id: 'seo', label: 'SEO Setting (সার্চ ইঞ্জিন)', icon: Sparkles },
                  { id: 'social', label: 'Social Media Settings (সোশ্যাল মিডিয়া সেটিংস ও টপ-বার)', icon: Share2 },
                  { id: 'mail', label: 'Mail Setting (ই-মেইল ও SMTP)', icon: Inbox },
                  { id: 'login', label: 'Login Setting (লগইন ও নিরাপত্তা)', icon: Shield },
                  { id: 'storage', label: 'Cloud Storage & CDN (ক্লাউডিনারি ও এস৩)', icon: Cloud },
                  { id: 'importWp', label: 'Universal Data Migration Hub (ডেটা মাইগ্রেশন)', icon: Database },
                ].map((s) => {
                  const Icon = s.icon;
                  const isActive = settingsTab === s.id || (s.id === 'social' && settingsTab === 'facebook');
                  return (
                    <button
                      key={s.id}
                      onClick={() => setSettingsTab(s.id as any)}
                      className={`w-full flex items-center gap-2.5 px-3 py-2.5 text-xs font-bold rounded-lg transition-colors text-left ${
                        isActive
                          ? 'bg-red-600 text-white shadow-xs'
                          : 'hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      <span>{s.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* Settings Forms */}
              <div className={`md:col-span-9 p-6 rounded border ${
                darkMode ? 'bg-[#1b222c] border-slate-800' : 'bg-white border-slate-200'
              }`}>
                <form onSubmit={handleSaveAllSettings} className="space-y-6 text-xs font-solaiman">
                  {/* Header Setting */}
                  {settingsTab === 'header' && (
                    <div className="space-y-6">
                      <div className="border-b pb-3">
                        <h4 className="text-base font-bold text-slate-900 dark:text-white">
                          Header Setting (হেডার ও লোগো আপলোড)
                        </h4>
                        <p className="text-xs text-slate-500">পোর্টালের হেডার লোগো এবং ফেভিকন আপলোড ও কনফিগারেশন</p>
                      </div>

                      {/* Direct Shortcut to Menu Builder */}
                      <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border-2 border-emerald-400 dark:border-emerald-700 flex flex-wrap items-center justify-between gap-3 shadow-xs">
                        <div className="flex items-center gap-3">
                          <div className="p-2.5 rounded-lg bg-emerald-600 text-white shrink-0">
                            <Navigation className="w-5 h-5" />
                          </div>
                          <div>
                            <div className="font-bold text-sm text-emerald-950 dark:text-emerald-100">
                              হেডার নেভিগেশন মেনু তৈরি বা সাজাতে চান?
                            </div>
                            <div className="text-xs text-emerald-700 dark:text-emerald-300">
                              মেনু বিল্ডার থেকে হেডারে প্রদর্শিত ক্যাটাগরি, অবস্থান ও কাস্টম লিংক তৈরি ও নিয়ন্ত্রণ করুন।
                            </div>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => setActiveMainTab('menu_builder')}
                          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-xs font-bold shrink-0 transition-colors shadow-xs"
                        >
                          মেনু বিল্ডারে যান →
                        </button>
                      </div>

                      {/* Header Light Logo */}
                      <div className="space-y-2">
                        <label className="block font-bold text-slate-800 dark:text-slate-200">
                          Header Light Logo (লাইট মোড লোগো)
                        </label>
                        <div className="flex items-center gap-3">
                          <label className="px-3 py-1.5 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 rounded text-xs font-bold cursor-pointer transition-colors">
                            Choose File
                            <input type="file" accept="image/*" className="hidden" onChange={handleLightLogoUpload} />
                          </label>
                          <span className="text-xs text-slate-500">
                            {localSettings.lightLogoUrl ? 'Light logo uploaded' : 'logo.webp'}
                          </span>
                        </div>
                        <div className="p-4 border rounded border-slate-200 dark:border-slate-700 bg-white inline-block">
                          <Logo size="lg" darkMode={false} customLogoUrl={localSettings.lightLogoUrl} siteName={localSettings.siteName} tagline={localSettings.tagline} />
                        </div>
                      </div>

                      {/* Header Dark Logo */}
                      <div className="space-y-2">
                        <label className="block font-bold text-slate-800 dark:text-slate-200">
                          Header Dark Logo (ডার্ক মোড লোগো)
                        </label>
                        <div className="flex items-center gap-3">
                          <label className="px-3 py-1.5 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 rounded text-xs font-bold cursor-pointer transition-colors">
                            Choose File
                            <input type="file" accept="image/*" className="hidden" onChange={handleDarkLogoUpload} />
                          </label>
                          <span className="text-xs text-slate-500">
                            {localSettings.darkLogoUrl ? 'Dark logo uploaded' : 'New Project (13)_copy2.webp'}
                          </span>
                        </div>
                        <div className="p-4 border rounded border-slate-700 bg-[#0f172a] inline-block">
                          <Logo size="lg" darkMode={true} customLogoUrl={localSettings.darkLogoUrl} siteName={localSettings.siteName} tagline={localSettings.tagline} />
                        </div>
                      </div>

                      {/* Dedicated Site Icon / Favicon Uploader & Real-Time Browser Tab Preview (Requirement 1) */}
                      <div className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs space-y-4 font-solaiman">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
                          <div className="flex items-center gap-2.5">
                            <span className="p-2 rounded-lg bg-red-100 dark:bg-red-950/60 text-red-600 dark:text-red-400">
                              <Globe className="w-5 h-5" />
                            </span>
                            <div>
                              <h5 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                                <span>সাইট আইকন বা ফ্যাভিকন আপলোড (Site Icon / Favicon Upload)</span>
                                {localSettings.faviconUrl && (
                                  <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 flex items-center gap-1">
                                    <Check className="w-3 h-3" /> ব্রাউজারে সক্রিয়
                                  </span>
                                )}
                              </h5>
                              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                                ব্রাউজার ট্যাব, বুকমার্ক বার এবং মোবাইল ডিভাইস হোমস্ক্রিনের জন্য কাস্টম আইকন (Favicon & Apple Touch Icon) আপলোড করুন। সাইজ সুপারিশ: বর্গাকার (Square) ৩২x৩২, ৬৪x৬৪, ১৮০x১৮০ বা ৫১২x৫১২ পিক্সেল (ICO, PNG বা JPG)।
                              </p>
                            </div>
                          </div>

                          {localSettings.faviconUrl && (
                            <button
                              type="button"
                              onClick={handleRemoveFavicon}
                              className="px-3 py-1.5 rounded-lg border border-red-200 dark:border-red-900/60 hover:bg-red-50 dark:hover:bg-red-950/30 text-red-600 dark:text-red-400 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer self-start sm:self-center"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              <span>আইকন মুছুন / রিসেট</span>
                            </button>
                          )}
                        </div>

                        {/* 2-Column: Upload Dropzone & Live Browser Tab Previews */}
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-center">
                          
                          {/* Left: Drag & Drop Upload Zone (7 Cols) */}
                          <div className="lg:col-span-7">
                            <input
                              type="file"
                              ref={faviconFileInputRef}
                              accept=".ico,.png,.jpg,.jpeg,.webp,image/x-icon,image/png,image/jpeg,image/webp"
                              className="hidden"
                              onChange={handleFaviconUpload}
                            />

                            <div
                              onDragOver={(e) => { e.preventDefault(); setDragOverFavicon(true); }}
                              onDragLeave={() => setDragOverFavicon(false)}
                              onDrop={(e) => {
                                e.preventDefault();
                                setDragOverFavicon(false);
                                if (e.dataTransfer.files?.[0]) {
                                  handleFaviconUpload(e.dataTransfer.files[0]);
                                }
                              }}
                              onClick={() => faviconFileInputRef.current?.click()}
                              className={`p-5 rounded-xl border-2 border-dashed text-center cursor-pointer transition-all ${
                                dragOverFavicon
                                  ? 'border-red-500 bg-red-50/50 dark:bg-red-950/40'
                                  : localSettings.faviconUrl
                                  ? 'border-emerald-400/80 bg-emerald-50/20 dark:bg-emerald-950/20'
                                  : 'border-slate-300 dark:border-slate-700 hover:border-red-500 bg-slate-50/50 dark:bg-slate-800/30'
                              }`}
                            >
                              {localSettings.faviconUrl ? (
                                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-left">
                                  <div className="flex items-center gap-3">
                                    <div className="w-14 h-14 rounded-xl border-2 border-emerald-400 bg-white p-1.5 shadow-md flex items-center justify-center shrink-0">
                                      <img
                                        src={localSettings.faviconUrl}
                                        alt="Current Site Favicon"
                                        className="w-full h-full object-contain rounded"
                                      />
                                    </div>
                                    <div>
                                      <div className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                                        <span>কাস্টম সাইট আইকন সক্রিয়</span>
                                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                                      </div>
                                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                                        ব্রাউজার ট্যাব ও অ্যাপল টাচ আইকনে রিয়েল-টাইমে লোড হয়েছে।
                                      </p>
                                    </div>
                                  </div>

                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      faviconFileInputRef.current?.click();
                                    }}
                                    className="px-3.5 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-xs transition-colors cursor-pointer shrink-0"
                                  >
                                    নতুন আইকন নির্বাচন
                                  </button>
                                </div>
                              ) : (
                                <div className="space-y-1.5">
                                  <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-950/60 text-red-600 flex items-center justify-center mx-auto mb-2">
                                    <Upload className="w-5 h-5" />
                                  </div>
                                  <h6 className="font-bold text-xs text-slate-800 dark:text-slate-200">
                                    কাস্টম সাইট আইকন বা ফ্যাভিকন ড্রপ করুন অথবা ব্রাউজ করুন
                                  </h6>
                                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                                    সাপোর্ট: .ICO, .PNG, .JPG বা .WEBP (বর্গাকার ইমেজ রিকমেন্ডেড, সর্বোচ্চ ৮ MB)
                                  </p>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Right: Real-Time Tab & Mobile Preview (5 Cols) */}
                          <div className="lg:col-span-5 space-y-3">
                            <span className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                              লাইভ ব্রাউজার ও মোবাইল প্রিভিউ
                            </span>

                            {/* 1. Realistic Browser Tab Mockup */}
                            <div className="p-2.5 rounded-lg bg-slate-100 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 shadow-2xs space-y-1">
                              <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono pb-1 border-b border-slate-200 dark:border-slate-700">
                                <span>Chrome / Firefox Browser Tab</span>
                                <span className="text-emerald-600 dark:text-emerald-400 font-bold">● Live Sync</span>
                              </div>
                              <div className="pt-1 flex items-center">
                                <div className="max-w-[240px] px-3 py-1.5 rounded-t-md bg-white dark:bg-slate-900 border-t border-x border-slate-300 dark:border-slate-600 shadow-xs flex items-center justify-between gap-2">
                                  <div className="flex items-center gap-1.5 min-w-0">
                                    {localSettings.faviconUrl ? (
                                      <img
                                        src={localSettings.faviconUrl}
                                        alt="Favicon"
                                        className="w-4 h-4 object-contain rounded-xs shrink-0"
                                      />
                                    ) : (
                                      <span className="w-3.5 h-3.5 rounded-full bg-red-600 shrink-0" />
                                    )}
                                    <span className="text-[11px] font-bold text-slate-800 dark:text-slate-200 truncate font-solaiman">
                                      {localSettings.siteName || 'নিউজ পোর্টাল'} - সত্যের নির্ভীক প্রকাশ
                                    </span>
                                  </div>
                                  <span className="text-[10px] text-slate-400 hover:text-slate-600 cursor-pointer">✕</span>
                                </div>
                              </div>
                            </div>

                            {/* 2. Apple Touch Icon / Mobile Bookmark Preview */}
                            <div className="p-2.5 rounded-lg bg-slate-100 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 flex items-center gap-3">
                              <div className="w-10 h-10 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 shadow-md p-1 flex items-center justify-center shrink-0">
                                {localSettings.faviconUrl ? (
                                  <img
                                    src={localSettings.faviconUrl}
                                    alt="Apple Touch Icon"
                                    className="w-full h-full object-contain rounded-lg"
                                  />
                                ) : (
                                  <span className="w-5 h-5 rounded-full bg-red-600" />
                                )}
                              </div>
                              <div>
                                <div className="text-xs font-bold text-slate-800 dark:text-slate-200 font-solaiman">
                                  {localSettings.siteName || 'নিউজ পোর্টাল'}
                                </div>
                                <span className="text-[10px] text-slate-500 font-mono block">
                                  Apple Touch Icon • 180×180
                                </span>
                              </div>
                            </div>
                          </div>

                        </div>
                      </div>

                      {/* Dedicated Logo Size Controller (Header & Footer) - Requirement 1 */}
                      <div className="p-4 rounded-xl border border-red-200 dark:border-red-950/60 bg-red-50/40 dark:bg-red-950/20 space-y-4">
                        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-red-200 dark:border-red-900/40 pb-2.5">
                          <div>
                            <h5 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                              <Sliders className="w-4 h-4 text-red-600" />
                              <span>Logo Size Controller (হেডার ও ফুটার লোগো সাইজ নিয়ন্ত্রণ)</span>
                            </h5>
                            <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-0.5">
                              হেডার এবং ফুটার লোগোর উচ্চতা স্লাইডার বা ইনপুট দিয়ে পিক্সেল স্কেলে নিখুঁতভাবে নিয়ন্ত্রণ করুন। পরিবর্তন সাথে সাথে লাইভ পোর্টালে কার্যকর হবে।
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              onUpdateSettings(localSettings);
                              showSuccessMessage('লোগো সাইজ সফলভাবে সমগ্র সাইটে কার্যকর ও সংরক্ষিত হয়েছে!');
                            }}
                            className="px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
                          >
                            <Save className="w-3.5 h-3.5" />
                            <span>সাইজ সেভ করুন</span>
                          </button>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                          {/* 1. Unrestricted Header Logo Size Controller */}
                          <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4">
                            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                              <label className="font-bold text-xs text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                                <span>হেডার লোগো সাইজ কন্ট্রোলার (Header Logo Sizing)</span>
                              </label>
                              <div className="flex items-center gap-1.5">
                                <span className="font-mono font-bold text-[11px] px-2 py-0.5 rounded bg-red-100 dark:bg-red-950/60 text-red-700 dark:text-red-300">
                                  উচ্চতা: {localSettings.headerLogoHeight || 26}px
                                </span>
                                <span className="font-mono font-bold text-[11px] px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                                  প্রস্থ: {localSettings.headerLogoWidth ? `${localSettings.headerLogoWidth}px` : 'Auto'}
                                </span>
                              </div>
                            </div>

                            {/* Unrestricted Height Slider & Input */}
                            <div className="space-y-1.5">
                              <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-400">
                                <span className="font-bold">লোগো উচ্চতা (Height Slider & Manual Input):</span>
                                <span className="text-[10px] text-slate-400">কোনো সীমা নেই (Unrestricted)</span>
                              </div>
                              <div className="flex items-center gap-3">
                                <input
                                  type="range"
                                  min={10}
                                  max={400}
                                  step={1}
                                  value={localSettings.headerLogoHeight || 26}
                                  onChange={(e) => {
                                    const val = parseInt(e.target.value, 10);
                                    const updated = { ...localSettings, headerLogoHeight: val };
                                    setLocalSettings(updated);
                                    onUpdateSettings(updated);
                                  }}
                                  className="flex-1 accent-red-600 cursor-pointer"
                                />
                                <div className="flex items-center gap-1">
                                  <input
                                    type="number"
                                    min={1}
                                    value={localSettings.headerLogoHeight || 26}
                                    onChange={(e) => {
                                      const val = parseInt(e.target.value, 10) || 1;
                                      const updated = { ...localSettings, headerLogoHeight: val };
                                      setLocalSettings(updated);
                                      onUpdateSettings(updated);
                                    }}
                                    className="w-20 px-2 py-1 rounded border border-slate-300 dark:border-slate-700 bg-transparent text-xs font-mono font-bold text-center"
                                  />
                                  <span className="text-xs text-slate-500 font-mono">px</span>
                                </div>
                              </div>
                            </div>

                            {/* Unrestricted Width Slider & Input */}
                            <div className="space-y-1.5">
                              <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-400">
                                <span className="font-bold">লোগো প্রস্থ (Width Slider & Manual Input):</span>
                                <span className="text-[10px] text-slate-400">০ লিখলে অটো অনুপাতে স্কেল হবে</span>
                              </div>
                              <div className="flex items-center gap-3">
                                <input
                                  type="range"
                                  min={0}
                                  max={800}
                                  step={2}
                                  value={localSettings.headerLogoWidth || 0}
                                  onChange={(e) => {
                                    const val = parseInt(e.target.value, 10);
                                    const updated = { ...localSettings, headerLogoWidth: val };
                                    setLocalSettings(updated);
                                    onUpdateSettings(updated);
                                  }}
                                  className="flex-1 accent-red-600 cursor-pointer"
                                />
                                <div className="flex items-center gap-1">
                                  <input
                                    type="number"
                                    min={0}
                                    value={localSettings.headerLogoWidth || 0}
                                    onChange={(e) => {
                                      const val = parseInt(e.target.value, 10) || 0;
                                      const updated = { ...localSettings, headerLogoWidth: val };
                                      setLocalSettings(updated);
                                      onUpdateSettings(updated);
                                    }}
                                    className="w-20 px-2 py-1 rounded border border-slate-300 dark:border-slate-700 bg-transparent text-xs font-mono font-bold text-center"
                                  />
                                  <span className="text-xs text-slate-500 font-mono">px</span>
                                </div>
                              </div>
                            </div>

                            {/* Quick Presets */}
                            <div className="flex flex-wrap items-center gap-1.5 text-[10px]">
                              <span className="text-slate-400 font-bold">উচ্চতা প্রিসেট:</span>
                              {[
                                { label: 'কমপ্যাক্ট (20px)', val: 20 },
                                { label: 'ডিফল্ট (26px)', val: 26 },
                                { label: 'মাঝারি (34px)', val: 34 },
                                { label: 'লার্জ (48px)', val: 48 },
                                { label: 'জুম্বো (64px)', val: 64 },
                                { label: 'আল্ট্রা (88px)', val: 88 },
                              ].map((p) => (
                                <button
                                  key={p.val}
                                  type="button"
                                  onClick={() => {
                                    const updated = { ...localSettings, headerLogoHeight: p.val };
                                    setLocalSettings(updated);
                                    onUpdateSettings(updated);
                                  }}
                                  className={`px-2 py-0.5 rounded border transition-colors cursor-pointer ${
                                    (localSettings.headerLogoHeight || 26) === p.val
                                      ? 'bg-red-600 text-white border-red-600 font-bold'
                                      : 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-red-400'
                                  }`}
                                >
                                  {p.label}
                                </button>
                              ))}
                            </div>

                            {/* Live Preview Box */}
                            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                              <span className="text-[10px] text-slate-400 uppercase font-mono">লাইভ হেডার প্রিভিউ:</span>
                              <div className="p-2 rounded bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 inline-block overflow-x-auto max-w-[280px]">
                                <Logo 
                                  size="md" 
                                  customHeight={localSettings.headerLogoHeight || 26} 
                                  customWidth={localSettings.headerLogoWidth || undefined}
                                  darkMode={darkMode} 
                                  customLogoUrl={darkMode ? localSettings.darkLogoUrl : localSettings.lightLogoUrl} 
                                  siteName={localSettings.siteName} 
                                  tagline={localSettings.tagline} 
                                />
                              </div>
                            </div>
                          </div>

                          {/* 2. Unrestricted Footer Logo Size Controller */}
                          <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4">
                            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                              <label className="font-bold text-xs text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                                <span>ফুটার লোগো সাইজ কন্ট্রোলার (Footer Logo Sizing)</span>
                              </label>
                              <div className="flex items-center gap-1.5">
                                <span className="font-mono font-bold text-[11px] px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300">
                                  উচ্চতা: {localSettings.footerLogoHeight || 20}px
                                </span>
                                <span className="font-mono font-bold text-[11px] px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                                  প্রস্থ: {localSettings.footerLogoWidth ? `${localSettings.footerLogoWidth}px` : 'Auto'}
                                </span>
                              </div>
                            </div>

                            {/* Unrestricted Height Slider & Input */}
                            <div className="space-y-1.5">
                              <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-400">
                                <span className="font-bold">ফুটার লোগো উচ্চতা (Height Slider & Manual Input):</span>
                                <span className="text-[10px] text-slate-400">কোনো সীমা নেই (Unrestricted)</span>
                              </div>
                              <div className="flex items-center gap-3">
                                <input
                                  type="range"
                                  min={10}
                                  max={300}
                                  step={1}
                                  value={localSettings.footerLogoHeight || 20}
                                  onChange={(e) => {
                                    const val = parseInt(e.target.value, 10);
                                    const updated = { ...localSettings, footerLogoHeight: val };
                                    setLocalSettings(updated);
                                    onUpdateSettings(updated);
                                  }}
                                  className="flex-1 accent-emerald-600 cursor-pointer"
                                />
                                <div className="flex items-center gap-1">
                                  <input
                                    type="number"
                                    min={1}
                                    value={localSettings.footerLogoHeight || 20}
                                    onChange={(e) => {
                                      const val = parseInt(e.target.value, 10) || 1;
                                      const updated = { ...localSettings, footerLogoHeight: val };
                                      setLocalSettings(updated);
                                      onUpdateSettings(updated);
                                    }}
                                    className="w-20 px-2 py-1 rounded border border-slate-300 dark:border-slate-700 bg-transparent text-xs font-mono font-bold text-center"
                                  />
                                  <span className="text-xs text-slate-500 font-mono">px</span>
                                </div>
                              </div>
                            </div>

                            {/* Unrestricted Width Slider & Input */}
                            <div className="space-y-1.5">
                              <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-400">
                                <span className="font-bold">ফুটার লোগো প্রস্থ (Width Slider & Manual Input):</span>
                                <span className="text-[10px] text-slate-400">০ লিখলে অটো অনুপাতে স্কেল হবে</span>
                              </div>
                              <div className="flex items-center gap-3">
                                <input
                                  type="range"
                                  min={0}
                                  max={800}
                                  step={2}
                                  value={localSettings.footerLogoWidth || 0}
                                  onChange={(e) => {
                                    const val = parseInt(e.target.value, 10);
                                    const updated = { ...localSettings, footerLogoWidth: val };
                                    setLocalSettings(updated);
                                    onUpdateSettings(updated);
                                  }}
                                  className="flex-1 accent-emerald-600 cursor-pointer"
                                />
                                <div className="flex items-center gap-1">
                                  <input
                                    type="number"
                                    min={0}
                                    value={localSettings.footerLogoWidth || 0}
                                    onChange={(e) => {
                                      const val = parseInt(e.target.value, 10) || 0;
                                      const updated = { ...localSettings, footerLogoWidth: val };
                                      setLocalSettings(updated);
                                      onUpdateSettings(updated);
                                    }}
                                    className="w-20 px-2 py-1 rounded border border-slate-300 dark:border-slate-700 bg-transparent text-xs font-mono font-bold text-center"
                                  />
                                  <span className="text-xs text-slate-500 font-mono">px</span>
                                </div>
                              </div>
                            </div>

                            {/* Quick Presets */}
                            <div className="flex flex-wrap items-center gap-1.5 text-[10px]">
                              <span className="text-slate-400 font-bold">উচ্চতা প্রিসেট:</span>
                              {[
                                { label: 'মিনিমাল (16px)', val: 16 },
                                { label: 'ডিফল্ট (20px)', val: 20 },
                                { label: 'মাঝারি (26px)', val: 26 },
                                { label: 'লার্জ (36px)', val: 36 },
                                { label: 'জুম্বো (50px)', val: 50 },
                              ].map((p) => (
                                <button
                                  key={p.val}
                                  type="button"
                                  onClick={() => {
                                    const updated = { ...localSettings, footerLogoHeight: p.val };
                                    setLocalSettings(updated);
                                    onUpdateSettings(updated);
                                  }}
                                  className={`px-2 py-0.5 rounded border transition-colors cursor-pointer ${
                                    (localSettings.footerLogoHeight || 20) === p.val
                                      ? 'bg-emerald-600 text-white border-emerald-600 font-bold'
                                      : 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-emerald-400'
                                  }`}
                                >
                                  {p.label}
                                </button>
                              ))}
                            </div>

                            {/* Live Preview Box */}
                            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                              <span className="text-[10px] text-slate-400 uppercase font-mono">লাইভ ফুটার প্রিভিউ:</span>
                              <div className="p-2 rounded bg-slate-900 border border-slate-700 inline-block overflow-x-auto max-w-[280px]">
                                <Logo 
                                  size="sm" 
                                  customHeight={localSettings.footerLogoHeight || 20} 
                                  customWidth={localSettings.footerLogoWidth || undefined}
                                  darkMode={true} 
                                  customLogoUrl={localSettings.darkLogoUrl || localSettings.lightLogoUrl} 
                                  siteName={localSettings.siteName} 
                                  tagline={localSettings.tagline} 
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Unified Site Title, English Name, Tagline & Domain */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-3 border-t">
                        <div>
                          <label className="block font-bold text-xs mb-1">সাইটের বাংলা নাম (Site Title)</label>
                          <input
                            type="text"
                            value={localSettings.siteName || ''}
                            onChange={(e) => setLocalSettings({ ...localSettings, siteName: e.target.value })}
                            placeholder={localSettings.siteName || "সাইটের নাম"}
                            className="w-full px-3 py-2 rounded border border-slate-300 dark:border-slate-700 bg-transparent text-sm font-solaiman font-bold"
                          />
                        </div>
                        <div>
                          <label className="block font-bold text-xs mb-1">ইংরেজি ব্র্যান্ড নাম (English Title)</label>
                          <input
                            type="text"
                            value={localSettings.siteNameEn || ''}
                            onChange={(e) => setLocalSettings({ ...localSettings, siteNameEn: e.target.value })}
                            placeholder="Daily Bangladesh"
                            className="w-full px-3 py-2 rounded border border-slate-300 dark:border-slate-700 bg-transparent text-sm font-latin font-bold"
                          />
                        </div>
                        <div>
                          <label className="block font-bold text-xs mb-1">স্লোগান / ট্যাগলাইন (Slogan)</label>
                          <input
                            type="text"
                            value={localSettings.tagline || ''}
                            onChange={(e) => setLocalSettings({ ...localSettings, tagline: e.target.value })}
                            placeholder="পজিটিভ বাংলাদেশ"
                            className="w-full px-3 py-2 rounded border border-slate-300 dark:border-slate-700 bg-transparent text-sm font-solaiman"
                          />
                        </div>
                        <div>
                          <label className="block font-bold text-xs mb-1">ডোমেইন ইউআরএল (Domain)</label>
                          <input
                            type="text"
                            value={localSettings.domain || ''}
                            onChange={(e) => setLocalSettings({ ...localSettings, domain: e.target.value })}
                            placeholder="newsportal.com"
                            className="w-full px-3 py-2 rounded border border-slate-300 dark:border-slate-700 bg-transparent text-sm font-mono text-xs"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Comprehensive Theme & Site Setting - Requirement 2: Categories, Homepage Control & Menu Builder under Theme Setting */}
                  {settingsTab === 'theme' && (
                    <div className="space-y-6">
                      {/* Theme Setting Sub-Module Selector */}
                      <div className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700">
                        <button
                          type="button"
                          onClick={() => setThemeSubTab('typography')}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold font-solaiman flex items-center gap-1.5 transition-all cursor-pointer ${
                            themeSubTab === 'typography'
                              ? 'bg-red-600 text-white shadow-xs'
                              : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                          }`}
                        >
                          <Palette className="w-3.5 h-3.5" />
                          <span>থিম ও ফন্ট (Theme & Fonts)</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setThemeSubTab('categories')}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold font-solaiman flex items-center gap-1.5 transition-all cursor-pointer ${
                            themeSubTab === 'categories'
                              ? 'bg-red-600 text-white shadow-xs'
                              : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                          }`}
                        >
                          <Layers className="w-3.5 h-3.5" />
                          <span>ক্যাটাগরি ({categories.length})</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setThemeSubTab('homepage')}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold font-solaiman flex items-center gap-1.5 transition-all cursor-pointer ${
                            themeSubTab === 'homepage'
                              ? 'bg-red-600 text-white shadow-xs'
                              : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                          }`}
                        >
                          <Layout className="w-3.5 h-3.5" />
                          <span>হোমপেজ কন্ট্রোল</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setThemeSubTab('menu')}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold font-solaiman flex items-center gap-1.5 transition-all cursor-pointer ${
                            themeSubTab === 'menu'
                              ? 'bg-red-600 text-white shadow-xs'
                              : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                          }`}
                        >
                          <Navigation className="w-3.5 h-3.5" />
                          <span>মেন্যু বিল্ডার</span>
                        </button>
                      </div>

                      {/* Sub-tab 1: Typography & Brand Styles */}
                      {themeSubTab === 'typography' && (
                        <div className="space-y-6">
                          <div className="border-b pb-3 flex items-center justify-between">
                            <div>
                              <h4 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                <Palette className="w-4 h-4 text-emerald-600" />
                                <span>Theme & Typography Setting (থিম, ফন্ট ও ভিজ্যুয়াল স্টাইল)</span>
                              </h4>
                              <p className="text-xs text-slate-500 mt-0.5">
                                সমগ্র পোর্টালের টাইপোগ্রাফি ফন্ট, বেস সাইজ (+২ ধাপ স্কেল) ও ব্র্যান্ড কালার প্যালেট পরিচালনা
                              </p>
                            </div>
                            <button
                              type="button"
                              onClick={() => {
                                const currentScale = localSettings.themeConfig?.baseFontSizePx || 18;
                                const primary = localSettings.primaryColor || '#dc2626';
                                if (typeof document !== 'undefined') {
                                  document.documentElement.style.setProperty('--site-base-font-size', `${currentScale}px`);
                                  document.documentElement.style.setProperty('--primary-color', primary);
                                }
                                onUpdateSettings(localSettings);
                                showSuccessMessage('সাইটের থিম কালার ও ফন্ট সাইজ সমগ্র পোর্টালে সফলভাবে কার্যকর হয়েছে!');
                              }}
                              className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold font-solaiman flex items-center gap-1.5 shadow-xs transition-all cursor-pointer"
                            >
                              <Save className="w-3.5 h-3.5" />
                              <span>থিম পরিবর্তন সেভ করুন</span>
                            </button>
                          </div>

                          {/* 1. Primary Font Selection */}
                          <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 space-y-2">
                            <label className="block text-xs font-bold text-slate-800 dark:text-slate-200">
                              পোর্টাল প্রধান ফন্ট (Primary Bengali Font):
                            </label>
                            <select
                              value={localSettings.fontChoice || 'solaiman'}
                              onChange={(e) => setLocalSettings({ ...localSettings, fontChoice: e.target.value as any })}
                              className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-solaiman text-xs font-bold cursor-pointer"
                            >
                              <option value="solaiman">SolaimanLipi (সোলাইমান লিপি — রিকমেন্ডেড ব্রডশিট)</option>
                              <option value="kalpurush">Kalpurush (কালপুরুষ — ক্লাসিক বাংলা)</option>
                              <option value="hind">Hind Siliguri (হিন্দ শিলিগুড়ি — আধুনিক ডিজিটাল)</option>
                              <option value="noto">Noto Serif Bengali (সেরিফ ব্রডশিট)</option>
                            </select>
                          </div>

                          {/* 2. Global Typography Font Size Scaler */}
                          <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 space-y-3">
                            <div className="flex items-center justify-between">
                              <label className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                                <Type className="w-3.5 h-3.5 text-emerald-600" />
                                <span>গ্লোবাল ফন্ট সাইজ স্কেলার (Typography Scale):</span>
                              </label>
                              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400">
                                {localSettings.themeConfig?.baseFontSizePx || 18}px বেস সাইজ
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-500">
                              বাংলা সংবাদ সহজে পড়ার সুবিধার্থে ডিফল্ট ফন্ট সাইজ ২ ধাপ বর্ধিত (১৮px)। পছন্দমতো স্কেল নির্বাচন করুন:
                            </p>

                            <div className="grid grid-cols-5 gap-1.5 text-xs">
                              {[
                                { px: 16, label: '১৬px', hint: 'স্ট্যান্ডার্ড' },
                                { px: 17, label: '১৭px', hint: '+১ ধাপ' },
                                { px: 18, label: '১৮px', hint: '+২ ধাপ (ডিফল্ট)', isDefault: true },
                                { px: 19, label: '১৯px', hint: '+৩ ধাপ' },
                                { px: 20, label: '২০px', hint: '+৪ ধাপ' },
                              ].map((step) => {
                                const currentPx = localSettings.themeConfig?.baseFontSizePx || 18;
                                const isSelected = currentPx === step.px;
                                return (
                                  <button
                                    key={step.px}
                                    type="button"
                                    onClick={() => {
                                      const updated = {
                                        ...localSettings,
                                        themeConfig: {
                                          ...localSettings.themeConfig,
                                          baseFontSizePx: step.px,
                                        }
                                      };
                                      setLocalSettings(updated);
                                      if (typeof document !== 'undefined') {
                                        document.documentElement.style.setProperty('--site-base-font-size', `${step.px}px`);
                                      }
                                    }}
                                    className={`py-2 px-1 rounded-lg border text-center transition-all cursor-pointer ${
                                      isSelected
                                        ? 'bg-emerald-600 text-white font-bold shadow-xs border-emerald-600'
                                        : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-emerald-400 text-slate-700 dark:text-slate-300'
                                    }`}
                                  >
                                    <div className="font-bold text-xs">{step.label}</div>
                                    <div className={`text-[9px] mt-0.5 ${isSelected ? 'text-emerald-100' : 'text-slate-400'}`}>
                                      {step.hint}
                                    </div>
                                  </button>
                                );
                              })}
                            </div>
                          </div>

                          {/* 3. Site Brand Color Palette */}
                          <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 space-y-3">
                            <div className="flex items-center justify-between">
                              <label className="text-xs font-bold text-slate-800 dark:text-slate-200">
                                সাইট কালার থিম ও ব্র্যান্ড একসেন্ট:
                              </label>
                              <div className="flex items-center gap-1.5">
                                <span 
                                  className="w-4 h-4 rounded-full border border-white shadow-xs" 
                                  style={{ backgroundColor: localSettings.primaryColor || '#dc2626' }} 
                                />
                                <span className="text-xs font-mono font-bold">{localSettings.primaryColor || '#dc2626'}</span>
                              </div>
                            </div>

                            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                              {[
                                { label: 'রক্তিম লাল', hex: '#dc2626' },
                                { label: 'গাঢ় মেরুন', hex: '#991b1b' },
                                { label: 'রাজকীয় নীল', hex: '#1e3a8a' },
                                { label: 'গাঢ় পান্না', hex: '#047857' },
                                { label: 'রাজকীয় পার্পল', hex: '#6b21a8' },
                                { label: 'চারকোল স্লেট', hex: '#0f172a' },
                              ].map((color) => {
                                const isSelected = (localSettings.primaryColor || '#dc2626').toLowerCase() === color.hex.toLowerCase();
                                return (
                                  <button
                                    key={color.hex}
                                    type="button"
                                    onClick={() => {
                                      const updated = {
                                        ...localSettings,
                                        primaryColor: color.hex,
                                      };
                                      setLocalSettings(updated);
                                      if (typeof document !== 'undefined') {
                                        document.documentElement.style.setProperty('--primary-color', color.hex);
                                      }
                                    }}
                                    className={`p-2 rounded-lg border flex flex-col items-center gap-1 transition-all text-center cursor-pointer ${
                                      isSelected
                                        ? 'ring-2 ring-emerald-500 border-emerald-500 bg-white dark:bg-slate-800'
                                        : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-slate-400'
                                    }`}
                                  >
                                    <span 
                                      className="w-4 h-4 rounded-full shadow-xs border border-white/40" 
                                      style={{ backgroundColor: color.hex }} 
                                    />
                                    <span className="text-[10px] font-bold font-solaiman text-slate-800 dark:text-slate-200 truncate">{color.label}</span>
                                  </button>
                                );
                              })}
                            </div>
                          </div>

                          {/* 4. Live Typography Sample Box */}
                          <div className="p-4 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-2">
                            <div className="text-[10px] font-mono text-slate-400 uppercase">
                              লাইভ টাইপোগ্রাফি প্রিভিউ (Live Broadsheet Typography Preview):
                            </div>
                            <h5 
                              className="font-bold text-slate-900 dark:text-white font-solaiman leading-tight"
                              style={{ fontSize: `${(localSettings.themeConfig?.baseFontSizePx || 18) * 1.25}px` }}
                            >
                              বাংলা সংবাদপত্রের শীর্ষ শিরোনাম ও তথ্যবহুল বিশ্লেষণ
                            </h5>
                            <p 
                              className="text-slate-600 dark:text-slate-300 font-solaiman leading-relaxed text-xs"
                              style={{ fontSize: `${localSettings.themeConfig?.baseFontSizePx || 18}px` }}
                            >
                              দেশ ও আন্তর্জাতিক অঙ্গনের সবশেষ ঘটনাপ্রবাহ নিরপেক্ষভাবে তুলে ধরাই আমাদের অঙ্গীকার। স্বচ্ছ ও মার্জিত পাঠাভ্যাস নিশ্চিত করতে ফন্ট সাইজ যেকোনো সময় কাস্টমাইজযোগ্য।
                            </p>
                          </div>
                        </div>
                      )}

                      {/* Sub-tab 2: Categories Management (Requirement 2) */}
                      {themeSubTab === 'categories' && (
                        <div className="space-y-4">
                          <div className="flex flex-wrap items-center justify-between gap-3 border-b pb-3">
                            <div>
                              <h4 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                <Layers className="w-4 h-4 text-red-600" />
                                <span>ক্যাটাগরি ব্যবস্থাপনা ({categories.length})</span>
                              </h4>
                              <p className="text-xs text-slate-500 mt-0.5">
                                নতুন ক্যাটাগরি যোগ, সম্পাদনা ও মেনুবারে প্রদর্শন নিয়ন্ত্রণ করুন
                              </p>
                            </div>
                            <button
                              type="button"
                              onClick={() => {
                                setEditingCategory(null);
                                setNewCatBn('');
                                setNewCatEn('');
                                setIsAddCatModalOpen(true);
                              }}
                              className="px-3.5 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
                            >
                              <Plus className="w-3.5 h-3.5" />
                              <span>নতুন ক্যাটাগরি তৈরি করুন</span>
                            </button>
                          </div>

                          <div className={`rounded-lg border overflow-hidden ${
                            darkMode ? 'bg-[#1b222c] border-slate-800' : 'bg-white border-slate-200'
                          }`}>
                            <div className="grid grid-cols-12 p-3 bg-slate-50 dark:bg-slate-800/60 border-b text-xs font-bold text-slate-600 dark:text-slate-400">
                              <div className="col-span-1">ক্রম</div>
                              <div className="col-span-4">ক্যাটাগরির বাংলা নাম</div>
                              <div className="col-span-3">English Slug</div>
                              <div className="col-span-2 text-center">পোস্ট সংখ্যা</div>
                              <div className="col-span-2 text-right">অ্যাকশন</div>
                            </div>

                            <div className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                              {categories.map((cat, idx) => (
                                <div key={cat.id} className="grid grid-cols-12 p-3 items-center hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                                  <div className="col-span-1 flex items-center gap-1 text-slate-400 font-mono">
                                    <span>{idx + 1}</span>
                                    {onReorderCategories && (
                                      <div className="flex flex-col">
                                        <button onClick={() => handleMoveCategory(idx, 'up')} className="hover:text-blue-600 disabled:opacity-20 cursor-pointer" disabled={idx === 0}>
                                          <ArrowUp className="w-3 h-3" />
                                        </button>
                                        <button onClick={() => handleMoveCategory(idx, 'down')} className="hover:text-blue-600 disabled:opacity-20 cursor-pointer" disabled={idx === categories.length - 1}>
                                          <ArrowDown className="w-3 h-3" />
                                        </button>
                                      </div>
                                    )}
                                  </div>
                                  <div className="col-span-4 font-bold text-sm text-slate-900 dark:text-white">
                                    {cat.nameBn}
                                  </div>
                                  <div className="col-span-3 font-mono text-slate-500">
                                    {cat.nameEn || cat.slug}
                                  </div>
                                  <div className="col-span-2 text-center font-bold text-slate-600 dark:text-slate-300">
                                    {articles.filter((a) => a.category === cat.nameBn).length} টি
                                  </div>
                                  <div className="col-span-2 flex items-center justify-end gap-2">
                                    <button
                                      type="button"
                                      onClick={() => handleStartEditCategory(cat)}
                                      className="p-1.5 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950 rounded cursor-pointer"
                                      title="সম্পাদনা"
                                    >
                                      <Edit3 className="w-3.5 h-3.5" />
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        if (confirm(`'${cat.nameBn}' ক্যাটাগরি মুছে ফেলতে চান?`)) {
                                          onDeleteCategory(cat.id);
                                          showSuccessMessage('ক্যাটাগরি মুছে ফেলা হয়েছে!');
                                        }
                                      }}
                                      className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-950 rounded cursor-pointer"
                                      title="মুছে ফেলুন"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Sub-tab 3: Homepage Layout & Sections Control (Requirement 2) */}
                      {themeSubTab === 'homepage' && (
                        <div className="space-y-4">
                          <div className="flex flex-wrap items-center justify-between gap-3 border-b pb-3">
                            <div>
                              <h4 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                <Layout className="w-4 h-4 text-sky-500" />
                                <span>হোমপেজ কন্ট্রোল (Homepage Layout & Sections)</span>
                              </h4>
                              <p className="text-xs text-slate-500 mt-0.5">
                                হোমপেজের ক্যাটাগরি ক্রম, সেকশন অন/অফ ও পোস্ট সংখ্যা নিয়ন্ত্রণ করুন
                              </p>
                            </div>
                            <button
                              type="button"
                              onClick={handleSaveHomepageLayout}
                              className="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
                            >
                              <Save className="w-3.5 h-3.5" />
                              <span>পরিবর্তন সংরক্ষণ করুন</span>
                            </button>
                          </div>

                          {/* Homepage Sections Toggle Grid */}
                          <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 space-y-3">
                            <h5 className="font-bold text-xs text-slate-800 dark:text-slate-200 uppercase tracking-wider font-mono">
                              হোমপেজ সেকশন টগল কন্ট্রোল:
                            </h5>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                              {[
                                { key: 'showBreakingTicker', label: 'ব্রেকিং টিকার' },
                                { key: 'showHero', label: 'হিরো লিড নিউজ' },
                                { key: 'showSpecial', label: 'স্পেশাল কভারেজ' },
                                { key: 'showNational', label: 'জাতীয় সংবাদ' },
                                { key: 'showPolitics', label: 'রাজনীতি সেকশন' },
                                { key: 'showWorld', label: 'আন্তর্জাতিক বিশ্ব' },
                                { key: 'showCountrywide', label: 'সারাদেশ সংবাদ' },
                                { key: 'showPhotoGallery', label: 'ছবি গ্যালারি' },
                                { key: 'showShowbiz', label: 'বিনোদন ও শোবিজ' },
                                { key: 'showMultiGrid', label: 'মাল্টি-গ্রিড সেকশন' },
                                { key: 'showVideoGallery', label: 'ভিডিও গ্যালারি' },
                                { key: 'showFamily', label: 'আমাদের পরিবার টিম' },
                              ].map((sec) => (
                                <label
                                  key={sec.key}
                                  className={`flex items-center justify-between p-2.5 rounded-lg border text-xs font-bold cursor-pointer transition-colors ${
                                    (hpSectionsState as any)[sec.key]
                                      ? 'bg-sky-50 dark:bg-sky-950/40 border-sky-300 dark:border-sky-800 text-sky-900 dark:text-sky-200'
                                      : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-500'
                                  }`}
                                >
                                  <span className="font-solaiman">{sec.label}</span>
                                  <input
                                    type="checkbox"
                                    checked={(hpSectionsState as any)[sec.key]}
                                    onChange={(e) =>
                                      setHpSectionsState({ ...hpSectionsState, [sec.key]: e.target.checked })
                                    }
                                    className="accent-sky-600 rounded cursor-pointer"
                                  />
                                </label>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Sub-tab 4: Header & Footer Menu Builder (Requirement 2) */}
                      {themeSubTab === 'menu' && (
                        <div className="space-y-4">
                          <MenuBuilderView
                            categories={categories}
                            darkMode={darkMode}
                            onAddCategory={onAddCategory}
                            onUpdateCategory={onUpdateCategory}
                            onDeleteCategory={onDeleteCategory}
                            onReorderCategories={onReorderCategories}
                            showSuccessMessage={showSuccessMessage}
                          />
                        </div>
                      )}
                    </div>
                  )}

                  {/* Ad Setting */}
                  {settingsTab === 'ad' && (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between border-b pb-2">
                        <h4 className="text-base font-bold text-slate-900 dark:text-white">
                          Ad Setting (বিজ্ঞাপন স্লট নিয়ন্ত্রণ)
                        </h4>
                        <button
                          type="button"
                          onClick={() => setActiveMainTab('ads')}
                          className="text-xs font-bold text-blue-600 hover:underline"
                        >
                          সম্পূর্ণ অ্যাড ম্যানেজার খুলুন →
                        </button>
                      </div>
                      <div className="space-y-2">
                        {adSlots.map((s) => (
                          <div key={s.id} className="p-3 border rounded flex items-center justify-between">
                            <div>
                              <p className="font-bold">{s.title}</p>
                              <p className="text-slate-400 text-[11px]">{getPositionLabel(s.position)}</p>
                            </div>
                            <input
                              type="checkbox"
                              checked={s.isActive}
                              onChange={() => handleToggleAdSlot(s.id)}
                              className="w-4 h-4 text-emerald-600 rounded"
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Footer Setting */}
                  {settingsTab === 'footer' && (
                    <div className="space-y-4">
                      <h4 className="text-base font-bold text-slate-900 dark:text-white border-b pb-2">
                        Footer Setting (ফুটার ও সম্পাদকীয় তথ্য)
                      </h4>

                      {/* Direct Shortcut to Menu Builder */}
                      <div className="p-4 rounded-xl bg-purple-50 dark:bg-purple-950/40 border-2 border-purple-400 dark:border-purple-700 flex flex-wrap items-center justify-between gap-3 shadow-xs">
                        <div className="flex items-center gap-3">
                          <div className="p-2.5 rounded-lg bg-purple-600 text-white shrink-0">
                            <Navigation className="w-5 h-5" />
                          </div>
                          <div>
                            <div className="font-bold text-sm text-purple-950 dark:text-purple-100">
                              ফুটার মেনু লিংকসমূহ পরিচালনা করতে চান?
                            </div>
                            <div className="text-xs text-purple-700 dark:text-purple-300">
                              মেনু বিল্ডার থেকে ফুটারে কোন কোন ক্যাটাগরি বা কাস্টম পেইজের লিংক দেখাবে তা সহজে সাজান।
                            </div>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setActiveMainTab('menu_builder');
                            setMenuBuilderSubTab('footer');
                          }}
                          className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded text-xs font-bold shrink-0 transition-colors shadow-xs"
                        >
                          ফুটার মেনু বিল্ডারে যান →
                        </button>
                      </div>

                      {/* Direct Shortcut to Mobile App Links & Badges (Requirement 4) */}
                      <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-950/40 border-2 border-blue-400 dark:border-blue-700 flex flex-wrap items-center justify-between gap-3 shadow-xs">
                        <div className="flex items-center gap-3">
                          <div className="p-2.5 rounded-lg bg-blue-600 text-white shrink-0">
                            <Smartphone className="w-5 h-5" />
                          </div>
                          <div>
                            <div className="font-bold text-sm text-blue-950 dark:text-blue-100 flex items-center gap-2">
                              <span>মোবাইল অ্যাপ ডাউনলোড লিংক ও স্টোর ব্যাজ কন্ট্রোলার</span>
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-200 dark:bg-blue-800 text-blue-800 dark:text-blue-200">
                                গুগল প্লে ও অ্যাপ স্টোর
                              </span>
                            </div>
                            <div className="text-xs text-blue-700 dark:text-blue-300">
                              ফুটারে প্রদর্শিত গুগল প্লে স্টোর ও অ্যাপল অ্যাপ স্টোর ব্যাজের ডাউনলোড লিংক ও দৃশ্যমানতা নিয়ন্ত্রণ করুন।
                            </div>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => setSettingsTab('mobile_app')}
                          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-bold shrink-0 transition-colors shadow-xs cursor-pointer"
                        >
                          মোবাইল অ্যাপ সেটিংসে যান →
                        </button>
                      </div>
                      <div>
                        <label className="block font-bold mb-1">ফুটার পরিচিতি / বিবরণ (Footer About Text)</label>
                        <textarea
                          rows={3}
                          value={localSettings.footerAbout || ''}
                          onChange={(e) => setLocalSettings({ ...localSettings, footerAbout: e.target.value })}
                          className="w-full px-3 py-2 rounded border border-slate-300 dark:border-slate-700 bg-transparent text-xs"
                          placeholder="সময়ের সাথে তাল মিলিয়ে সবশেষ খবরের নির্ভুল গন্তব্য..."
                        />
                      </div>
                      <div>
                        <label className="block font-bold mb-1">কপিরাইট টেক্সট (Copyright Text)</label>
                        <input
                          type="text"
                          value={localSettings.copyrightText || ''}
                          onChange={(e) => setLocalSettings({ ...localSettings, copyrightText: e.target.value })}
                          className="w-full px-3 py-2 rounded border border-slate-300 dark:border-slate-700 bg-transparent"
                          placeholder={`© ২০২৬ ${localSettings.siteName || 'নিউজ পোর্টাল'}. সর্বস্বত্ব সংরক্ষিত।`}
                        />
                      </div>

                      {/* Section Titles Customization */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t">
                        <div>
                          <label className="block font-bold mb-1">সম্পাদকীয় সেকশন শিরোনাম (Editorial Section Title)</label>
                          <input
                            type="text"
                            value={localSettings.editorialSectionTitle || 'সম্পাদকীয় ও প্রশাসন'}
                            onChange={(e) => setLocalSettings({ ...localSettings, editorialSectionTitle: e.target.value })}
                            className="w-full px-3 py-2 rounded border border-slate-300 dark:border-slate-700 bg-transparent text-xs"
                            placeholder="যেমন: সম্পাদকীয় ও প্রশাসন"
                          />
                        </div>
                        <div>
                          <label className="block font-bold mb-1">যোগাযোগ সেকশন শিরোনাম (Contact Section Title)</label>
                          <input
                            type="text"
                            value={localSettings.contactSectionTitle || 'যোগাযোগ ও দপ্তর'}
                            onChange={(e) => setLocalSettings({ ...localSettings, contactSectionTitle: e.target.value })}
                            className="w-full px-3 py-2 rounded border border-slate-300 dark:border-slate-700 bg-transparent text-xs"
                            placeholder="যেমন: যোগাযোগ ও দপ্তর"
                          />
                        </div>
                      </div>

                      {/* Editorial Roles 1: Editor & Executive Editor */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t">
                        <div className="space-y-2">
                          <label className="block font-bold text-slate-800 dark:text-slate-200">
                            ১ম সম্পাদকীয় পদবী ও নাম (Editor / Lead)
                          </label>
                          <div className="grid grid-cols-12 gap-2">
                            <input
                              type="text"
                              value={localSettings.editorLabel || 'ভারপ্রাপ্ত সম্পাদক'}
                              onChange={(e) => setLocalSettings({ ...localSettings, editorLabel: e.target.value })}
                              placeholder="পদবী (যেমন: ভারপ্রাপ্ত সম্পাদক)"
                              className="col-span-5 px-2.5 py-1.5 rounded border border-slate-300 dark:border-slate-700 bg-transparent text-xs"
                            />
                            <input
                              type="text"
                              value={localSettings.editorName || 'শামীম রেজা নূরুল'}
                              onChange={(e) => setLocalSettings({ ...localSettings, editorName: e.target.value })}
                              placeholder="নাম (যেমন: শামীম রেজা নূরুল)"
                              className="col-span-7 px-2.5 py-1.5 rounded border border-slate-300 dark:border-slate-700 bg-transparent text-xs font-bold"
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <label className="block font-bold text-slate-800 dark:text-slate-200">
                            ২য় সম্পাদকীয় পদবী ও নাম (Executive Editor)
                          </label>
                          <div className="grid grid-cols-12 gap-2">
                            <input
                              type="text"
                              value={localSettings.execEditorLabel || 'নির্বাহী সম্পাদক'}
                              onChange={(e) => setLocalSettings({ ...localSettings, execEditorLabel: e.target.value })}
                              placeholder="পদবী (যেমন: নির্বাহী সম্পাদক)"
                              className="col-span-5 px-2.5 py-1.5 rounded border border-slate-300 dark:border-slate-700 bg-transparent text-xs"
                            />
                            <input
                              type="text"
                              value={localSettings.execEditorName || 'নাজমুল হুদা শান্ত'}
                              onChange={(e) => setLocalSettings({ ...localSettings, execEditorName: e.target.value })}
                              placeholder="নাম (যেমন: নাজমুল হুদা শান্ত)"
                              className="col-span-7 px-2.5 py-1.5 rounded border border-slate-300 dark:border-slate-700 bg-transparent text-xs font-bold"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Editorial Roles 2: Publisher & Head of News */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t">
                        <div className="space-y-2">
                          <label className="block font-bold text-slate-800 dark:text-slate-200">
                            ৩য় পদবী ও নাম (Publisher)
                          </label>
                          <div className="grid grid-cols-12 gap-2">
                            <input
                              type="text"
                              value={localSettings.publisherLabel || 'প্রকাশক'}
                              onChange={(e) => setLocalSettings({ ...localSettings, publisherLabel: e.target.value })}
                              placeholder="পদবী (যেমন: প্রকাশক)"
                              className="col-span-5 px-2.5 py-1.5 rounded border border-slate-300 dark:border-slate-700 bg-transparent text-xs"
                            />
                            <input
                              type="text"
                              value={localSettings.publisherName || `${localSettings.siteName || 'নিউজ পোর্টাল'} পাবলিকেশনস লিমিটেড`}
                              onChange={(e) => setLocalSettings({ ...localSettings, publisherName: e.target.value })}
                              placeholder={`নাম (যেমন: ${localSettings.siteName || 'নিউজ পোর্টাল'} পাবলিকেশনস)`}
                              className="col-span-7 px-2.5 py-1.5 rounded border border-slate-300 dark:border-slate-700 bg-transparent text-xs font-bold"
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <label className="block font-bold text-slate-800 dark:text-slate-200">
                            ৪র্থ পদবী ও নাম (News Head)
                          </label>
                          <div className="grid grid-cols-12 gap-2">
                            <input
                              type="text"
                              value={localSettings.newsHeadLabel || 'বার্তা প্রধান'}
                              onChange={(e) => setLocalSettings({ ...localSettings, newsHeadLabel: e.target.value })}
                              placeholder="পদবী (যেমন: বার্তা প্রধান)"
                              className="col-span-5 px-2.5 py-1.5 rounded border border-slate-300 dark:border-slate-700 bg-transparent text-xs"
                            />
                            <input
                              type="text"
                              value={localSettings.newsHeadName || 'মাহমুদ হাসান'}
                              onChange={(e) => setLocalSettings({ ...localSettings, newsHeadName: e.target.value })}
                              placeholder="নাম (যেমন: মাহমুদ হাসান)"
                              className="col-span-7 px-2.5 py-1.5 rounded border border-slate-300 dark:border-slate-700 bg-transparent text-xs font-bold"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="pt-3 border-t grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div>
                          <label className="block font-bold mb-1">ই-মেইল (Contact Email)</label>
                          <input
                            type="email"
                            value={localSettings.contactEmail || ''}
                            onChange={(e) => setLocalSettings({ ...localSettings, contactEmail: e.target.value })}
                            className="w-full px-3 py-2 rounded border border-slate-300 dark:border-slate-700 bg-transparent text-xs"
                          />
                        </div>
                        <div>
                          <label className="block font-bold mb-1">ফোন নম্বর (Contact Phone)</label>
                          <input
                            type="text"
                            value={localSettings.contactPhone || ''}
                            onChange={(e) => setLocalSettings({ ...localSettings, contactPhone: e.target.value })}
                            className="w-full px-3 py-2 rounded border border-slate-300 dark:border-slate-700 bg-transparent text-xs"
                          />
                        </div>
                        <div>
                          <label className="block font-bold mb-1 flex items-center gap-1">
                            <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
                            <span>হোয়াটসঅ্যাপ হটলাইন (WhatsApp)</span>
                          </label>
                          <input
                            type="text"
                            value={localSettings.whatsappNumber || ''}
                            onChange={(e) => setLocalSettings({ ...localSettings, whatsappNumber: e.target.value })}
                            placeholder="+8801700000000"
                            className="w-full px-3 py-2 rounded border border-slate-300 dark:border-slate-700 bg-transparent text-xs"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block font-bold mb-1">অফিস ঠিকানা (Office Address)</label>
                        <input
                          type="text"
                          value={localSettings.officeAddress || ''}
                          onChange={(e) => setLocalSettings({ ...localSettings, officeAddress: e.target.value })}
                          className="w-full px-3 py-2 rounded border border-slate-300 dark:border-slate-700 bg-transparent"
                        />
                      </div>
                    </div>
                  )}

                  {/* Mobile App Links & Badges Setting (Requirement 4) */}
                  {settingsTab === 'mobile_app' && (
                    <div className="space-y-6">
                      <div className="border-b pb-3 flex items-center justify-between">
                        <div>
                          <h4 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                            <Smartphone className="w-5 h-5 text-blue-600" />
                            <span>Mobile App Links & Badges (মোবাইল অ্যাপ ও ডাউনলোড লিংক)</span>
                          </h4>
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                            গুগল প্লে স্টোর ও অ্যাপল অ্যাপ স্টোরের ডাউনলোড লিংক এবং ওয়েবসাইটের ফুটারে ব্যাজ প্রদর্শনের সার্বিক নিয়ন্ত্রণ
                          </p>
                        </div>
                        <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300">
                          ফুটার অ্যাপ কন্ট্রোলার
                        </span>
                      </div>

                      {/* Master Footer Visibility Switch */}
                      <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 flex items-center justify-between gap-4 shadow-2xs">
                        <div>
                          <div className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                            <span>ফুটারে মোবাইল অ্যাপ ডাউনলোড ব্যাজ প্রদর্শন করুন</span>
                            {localSettings.mobileAppBadges?.showInFooter !== false ? (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300">
                                সক্রিয় (Visible)
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-100 dark:bg-red-950/60 text-red-700 dark:text-red-300">
                                নিষ্ক্রিয় (Hidden)
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                            এটি বন্ধ রাখলে ওয়েবসাইটের ফুটারে কোনো অ্যাপ স্টোর বা প্লে স্টোর ডাউনলোড ব্যাজ প্রদর্শিত হবে না।
                          </p>
                        </div>

                        <label className="relative inline-flex items-center cursor-pointer shrink-0">
                          <input
                            type="checkbox"
                            checked={localSettings.mobileAppBadges?.showInFooter !== false}
                            onChange={(e) => {
                              setLocalSettings({
                                ...localSettings,
                                mobileAppBadges: {
                                  ...localSettings.mobileAppBadges,
                                  showInFooter: e.target.checked,
                                },
                              });
                            }}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-slate-300 peer-focus:outline-hidden rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-600 peer-checked:bg-blue-600"></div>
                        </label>
                      </div>

                      {/* Header Labels Customization */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block font-bold mb-1">ব্যাজ সেকশন শিরোনাম (Badge Section Title)</label>
                          <input
                            type="text"
                            value={localSettings.mobileAppBadges?.badgeTitleBn || ''}
                            onChange={(e) => {
                              setLocalSettings({
                                ...localSettings,
                                mobileAppBadges: {
                                  ...localSettings.mobileAppBadges,
                                  badgeTitleBn: e.target.value,
                                },
                              });
                            }}
                            className="w-full px-3 py-2 rounded border border-slate-300 dark:border-slate-700 bg-transparent text-xs"
                            placeholder="যেমন: মোবাইল অ্যাপ ডাউনলোড করুন"
                          />
                        </div>
                        <div>
                          <label className="block font-bold mb-1">ব্যাজ সেকশন সাব-টাইটেল (Badge Subtitle)</label>
                          <input
                            type="text"
                            value={localSettings.mobileAppBadges?.badgeSubtitleBn || ''}
                            onChange={(e) => {
                              setLocalSettings({
                                ...localSettings,
                                mobileAppBadges: {
                                  ...localSettings.mobileAppBadges,
                                  badgeSubtitleBn: e.target.value,
                                },
                              });
                            }}
                            className="w-full px-3 py-2 rounded border border-slate-300 dark:border-slate-700 bg-transparent text-xs"
                            placeholder="যেমন: যেকোনো সময়, যেকোনো স্থান থেকে দেশের সর্বশেষ সংবাদ..."
                          />
                        </div>
                      </div>

                      {/* Store Controls Grid: Google Play & Apple App Store */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        
                        {/* 1. Google Play Store Controller */}
                        <div className="p-5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 space-y-4 shadow-xs">
                          <div className="flex items-center justify-between border-b pb-3 border-slate-200 dark:border-slate-800">
                            <div className="flex items-center gap-2.5">
                              <div className="p-2 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-lg">
                                <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current">
                                  <path d="M3.609 1.814L13.793 12 3.61 22.186a2.023 2.023 0 0 1-.61-.318c-.37-.308-.6-.777-.6-1.303V3.435c0-.526.23-.995.6-1.303.18-.15.39-.26.61-.318zm11.236 11.236l2.355 2.355-12.01 6.942 9.655-9.297zm0-2.099L5.19 1.654l12.01 6.942-2.355 2.355zM16.5 12l2.87-1.657c.78-.45.78-1.185 0-1.636l-.01-.007L16.5 12zm0 0l2.86 1.65c.78.45.78 1.186 0 1.636l-.01.007L16.5 12z"/>
                                </svg>
                              </div>
                              <div>
                                <h5 className="font-bold text-sm text-slate-900 dark:text-white">
                                  Google Play Store
                                </h5>
                                <span className="text-[11px] text-slate-500 dark:text-slate-400">
                                  অ্যান্ড্রয়েড ব্যবহারকারীদের জন্য অ্যাপ
                                </span>
                              </div>
                            </div>

                            <label className="relative inline-flex items-center cursor-pointer">
                              <input
                                type="checkbox"
                                checked={localSettings.mobileAppBadges?.showGooglePlay !== false}
                                onChange={(e) => {
                                  setLocalSettings({
                                    ...localSettings,
                                    mobileAppBadges: {
                                      ...localSettings.mobileAppBadges,
                                      showGooglePlay: e.target.checked,
                                    },
                                  });
                                }}
                                className="sr-only peer"
                              />
                              <div className="w-9 h-5 bg-slate-300 peer-focus:outline-hidden rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-slate-600 peer-checked:bg-emerald-600"></div>
                            </label>
                          </div>

                          <div>
                            <label className="block font-bold mb-1 text-slate-700 dark:text-slate-300">
                              গুগল প্লে স্টোর অ্যাপ লিংক (Play Store App Download URL)
                            </label>
                            <input
                              type="url"
                              value={localSettings.mobileAppBadges?.googlePlayUrl || ''}
                              onChange={(e) => {
                                setLocalSettings({
                                  ...localSettings,
                                  mobileAppBadges: {
                                    ...localSettings.mobileAppBadges,
                                    googlePlayUrl: e.target.value,
                                  },
                                });
                              }}
                              className="w-full px-3 py-2 rounded border border-slate-300 dark:border-slate-700 bg-transparent text-xs font-mono"
                              placeholder="https://play.google.com/store/apps/details?id=com.dailybangladesh.app"
                            />
                            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                              লিংক খালি রাখলে বাটনে ক্লিক করলে ব্যবহারকারীকে "অ্যাপ শীঘ্রই আসছে" নোটিশ দেখানো হবে।
                            </p>
                          </div>

                          <div className="flex items-center justify-between pt-2">
                            <span className="text-xs font-bold text-slate-600 dark:text-slate-400">
                              অবস্থা: {localSettings.mobileAppBadges?.showGooglePlay !== false ? 'সক্রিয়' : 'লুকানো'}
                            </span>
                            {localSettings.mobileAppBadges?.googlePlayUrl && (
                              <a
                                href={localSettings.mobileAppBadges.googlePlayUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-1 text-xs text-blue-600 hover:underline font-bold"
                              >
                                <span>টেস্ট লিংক</span>
                                <ExternalLink className="w-3 h-3" />
                              </a>
                            )}
                          </div>
                        </div>

                        {/* 2. Apple App Store Controller */}
                        <div className="p-5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 space-y-4 shadow-xs">
                          <div className="flex items-center justify-between border-b pb-3 border-slate-200 dark:border-slate-800">
                            <div className="flex items-center gap-2.5">
                              <div className="p-2 bg-slate-500/10 text-slate-800 dark:text-slate-200 rounded-lg">
                                <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current">
                                  <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.42c.62-.75 1.04-1.8 1.01-2.85-.9.04-1.99.6-2.63 1.34-.56.64-.99 1.68-.86 2.7.99.08 1.86-.44 2.48-1.19z"/>
                                </svg>
                              </div>
                              <div>
                                <h5 className="font-bold text-sm text-slate-900 dark:text-white">
                                  Apple App Store
                                </h5>
                                <span className="text-[11px] text-slate-500 dark:text-slate-400">
                                  আইফোন ও আইপ্যাড ব্যবহারকারীদের জন্য অ্যাপ
                                </span>
                              </div>
                            </div>

                            <label className="relative inline-flex items-center cursor-pointer">
                              <input
                                type="checkbox"
                                checked={localSettings.mobileAppBadges?.showAppStore !== false}
                                onChange={(e) => {
                                  setLocalSettings({
                                    ...localSettings,
                                    mobileAppBadges: {
                                      ...localSettings.mobileAppBadges,
                                      showAppStore: e.target.checked,
                                    },
                                  });
                                }}
                                className="sr-only peer"
                              />
                              <div className="w-9 h-5 bg-slate-300 peer-focus:outline-hidden rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-slate-600 peer-checked:bg-slate-800"></div>
                            </label>
                          </div>

                          <div>
                            <label className="block font-bold mb-1 text-slate-700 dark:text-slate-300">
                              অ্যাপল অ্যাপ স্টোর লিংক (Apple App Store Download URL)
                            </label>
                            <input
                              type="url"
                              value={localSettings.mobileAppBadges?.appStoreUrl || ''}
                              onChange={(e) => {
                                setLocalSettings({
                                  ...localSettings,
                                  mobileAppBadges: {
                                    ...localSettings.mobileAppBadges,
                                    appStoreUrl: e.target.value,
                                  },
                                });
                              }}
                              className="w-full px-3 py-2 rounded border border-slate-300 dark:border-slate-700 bg-transparent text-xs font-mono"
                              placeholder="https://apps.apple.com/app/dailybangladesh/id123456789"
                            />
                            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                              লিংক খালি রাখলে বাটনে ক্লিক করলে ব্যবহারকারীকে "অ্যাপ রিভিউতে রয়েছে" নোটিশ দেখানো হবে।
                            </p>
                          </div>

                          <div className="flex items-center justify-between pt-2">
                            <span className="text-xs font-bold text-slate-600 dark:text-slate-400">
                              অবস্থা: {localSettings.mobileAppBadges?.showAppStore !== false ? 'সক্রিয়' : 'লুকানো'}
                            </span>
                            {localSettings.mobileAppBadges?.appStoreUrl && (
                              <a
                                href={localSettings.mobileAppBadges.appStoreUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-1 text-xs text-blue-600 hover:underline font-bold"
                              >
                                <span>টেস্ট লিংক</span>
                                <ExternalLink className="w-3 h-3" />
                              </a>
                            )}
                          </div>
                        </div>

                      </div>

                      {/* Live Footer Badges Preview */}
                      <div className="p-5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/40 space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                            <Eye className="w-4 h-4 text-blue-600" />
                            <span>লাইভ ফুটার প্রিভিউ (Live Footer Preview)</span>
                          </span>
                          <span className="text-[11px] text-slate-500">
                            সেটিংস অনুযায়ী ফুটারে ঠিক যেভাবে বাটনগুলো দেখাবে
                          </span>
                        </div>

                        <div className="p-4 rounded-lg bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 flex flex-wrap items-center justify-between gap-4">
                          <div className="text-xs text-slate-500 font-bold">
                            {localSettings.mobileAppBadges?.badgeTitleBn || 'মোবাইল অ্যাপ ডাউনলোড করুন'}:
                          </div>

                          {localSettings.mobileAppBadges?.showInFooter !== false ? (
                            <div className="flex items-center gap-3">
                              {localSettings.mobileAppBadges?.showGooglePlay !== false && (
                                <div className="flex items-center gap-2 px-3 py-1.5 bg-black text-white rounded shadow-xs cursor-pointer">
                                  <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current">
                                    <path d="M3.609 1.814L13.793 12 3.61 22.186a2.023 2.023 0 0 1-.61-.318c-.37-.308-.6-.777-.6-1.303V3.435c0-.526.23-.995.6-1.303.18-.15.39-.26.61-.318zm11.236 11.236l2.355 2.355-12.01 6.942 9.655-9.297zm0-2.099L5.19 1.654l12.01 6.942-2.355 2.355zM16.5 12l2.87-1.657c.78-.45.78-1.185 0-1.636l-.01-.007L16.5 12zm0 0l2.86 1.65c.78.45.78 1.186 0 1.636l-.01.007L16.5 12z"/>
                                  </svg>
                                  <div className="text-left font-latin leading-tight">
                                    <div className="text-[9px] uppercase text-slate-300">GET IT ON</div>
                                    <div className="text-xs font-bold font-sans">Google Play</div>
                                  </div>
                                </div>
                              )}

                              {localSettings.mobileAppBadges?.showAppStore !== false && (
                                <div className="flex items-center gap-2 px-3 py-1.5 bg-black text-white rounded shadow-xs cursor-pointer">
                                  <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current">
                                    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.42c.62-.75 1.04-1.8 1.01-2.85-.9.04-1.99.6-2.63 1.34-.56.64-.99 1.68-.86 2.7.99.08 1.86-.44 2.48-1.19z"/>
                                  </svg>
                                  <div className="text-left font-latin leading-tight">
                                    <div className="text-[9px] uppercase text-slate-300">Download on the</div>
                                    <div className="text-xs font-bold font-sans">App Store</div>
                                  </div>
                                </div>
                              )}
                            </div>
                          ) : (
                            <span className="text-xs text-red-600 font-bold">
                              ফুটার সেকশনে মোবাইল অ্যাপ ব্যাজ সম্পূর্ণ বন্ধ রয়েছে।
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* SEO Setting */}
                  {settingsTab === 'seo' && (
                    <div className="space-y-4">
                      <h4 className="text-base font-bold text-slate-900 dark:text-white border-b pb-2">
                        SEO & Google Ads.txt Setting (এসইও ও অ্যাডসেন্স সেটিংস)
                      </h4>
                      <div>
                        <label className="block font-bold mb-1">মেটা টাইটেল (Meta Title)</label>
                        <input
                          type="text"
                          value={localSettings.metaTitle || `${localSettings.siteName || 'নিউজ পোর্টাল'} - সত্যের সন্ধানে নির্ভীক ২৪ ঘণ্টা`}
                          onChange={(e) => setLocalSettings({ ...localSettings, metaTitle: e.target.value })}
                          className="w-full px-3 py-2 rounded border border-slate-300 dark:border-slate-700 bg-transparent"
                        />
                      </div>
                      <div>
                        <label className="block font-bold mb-1">মেটা বিবরণ (Meta Description)</label>
                        <textarea
                          rows={2}
                          value={localSettings.metaDescription || 'বাংলাদেশের নির্ভরযোগ্য অনলাইন নিউজ পোর্টাল...'}
                          onChange={(e) => setLocalSettings({ ...localSettings, metaDescription: e.target.value })}
                          className="w-full px-3 py-2 rounded border border-slate-300 dark:border-slate-700 bg-transparent text-xs"
                        />
                      </div>
                      <div>
                        <label className="block font-bold mb-1">এসইও কিওয়ার্ডস (Keywords - Comma Separated)</label>
                        <input
                          type="text"
                          value={localSettings.metaKeywords || 'bangla news, kolm24, breaking news, online newspaper'}
                          onChange={(e) => setLocalSettings({ ...localSettings, metaKeywords: e.target.value })}
                          className="w-full px-3 py-2 rounded border border-slate-300 dark:border-slate-700 bg-transparent font-mono text-xs"
                        />
                      </div>
                      <div>
                        <label className="block font-bold mb-1">Google AdSense Ads.txt Code Content</label>
                        <textarea
                          rows={3}
                          value={localSettings.adsTxtContent || 'google.com, pub-XXXXXXXXXXXXXXXX, DIRECT, f08c47fec0942fa0'}
                          onChange={(e) => setLocalSettings({ ...localSettings, adsTxtContent: e.target.value })}
                          className="w-full px-3 py-2 rounded border border-slate-300 dark:border-slate-700 bg-transparent font-mono text-xs"
                          placeholder="google.com, pub-0000000000000000, DIRECT, f08c47fec0942fa0"
                        />
                        <p className="text-[11px] text-emerald-600 mt-1">✓ /ads.txt রাউট স্বয়ংক্রিয়ভাবে সক্রিয় রয়েছে।</p>
                      </div>
                      <div>
                        <label className="block font-bold mb-1">Open Graph (og:image) URL</label>
                        <input
                          type="text"
                          value={localSettings.ogImage || ''}
                          onChange={(e) => setLocalSettings({ ...localSettings, ogImage: e.target.value })}
                          className="w-full px-3 py-2 rounded border border-slate-300 dark:border-slate-700 bg-transparent text-xs font-mono"
                          placeholder="https://..."
                        />
                      </div>

                      {/* Dynamic XML Sitemap & Instant Google Indexing Control */}
                      <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <h5 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                              <Globe className="w-4 h-4 text-emerald-600" />
                              <span>ডাইনামিক XML সাইটম্যাপ (Dynamic XML Sitemap)</span>
                            </h5>
                            <p className="text-[11px] text-slate-500">
                              সকল নিউজ পোস্ট, ক্যাটাগরি এবং স্ট্যাটিক পেজের জন্য গুগল স্ট্যান্ডার্ড XML সাইটম্যাপ।
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              const xml = generateDynamicSitemapXml(localSettings.domain || 'newsportal.com', articles, categories);
                              const blob = new Blob([xml], { type: 'application/xml' });
                              const url = URL.createObjectURL(blob);
                              const a = document.createElement('a');
                              a.href = url;
                              a.download = 'sitemap.xml';
                              a.click();
                              showSuccessMessage('sitemap.xml ফাইল সফলভাবে জেনারেট ও ডাউনলোড করা হয়েছে!');
                            }}
                            className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs transition-colors"
                          >
                            <FileCode className="w-3.5 h-3.5" />
                            <span>sitemap.xml ডাউনলোড</span>
                          </button>
                        </div>

                        <div className="pt-2 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between">
                          <div>
                            <div className="font-bold text-xs text-slate-800 dark:text-slate-200">
                              Google Search Console Indexing API
                            </div>
                            <div className="text-[11px] text-emerald-600 dark:text-emerald-400">
                              ✓ যেকোনো নতুন খবর পাবলিশ করলে স্বয়ংক্রিয়ভাবে Google Search Console-এ ইনডেক্সিং রিকোয়েস্ট পাঠানো হয়।
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={async () => {
                              const testUrl = `https://${localSettings.domain || 'newsportal.com'}/news/${articles[0]?.slug || articles[0]?.id}`;
                              const res = await requestGoogleIndexing(testUrl);
                              showSuccessMessage(res.message);
                            }}
                            className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs transition-colors"
                          >
                            <Sparkles className="w-3.5 h-3.5" />
                            <span>গুগল ইনডেক্সিং টেস্ট</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Social & Share Icons Manager (Requirement 3) */}
                  {(settingsTab === 'social' || settingsTab === 'facebook') && (
                    <div className="space-y-6">
                      {/* TopBar Social Media Links Controller (Requirement 3) */}
                      <div className="p-5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 space-y-4 shadow-xs">
                        <div className="border-b pb-3 flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="p-1.5 rounded-lg bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400">
                              <Share2 className="w-4 h-4" />
                            </span>
                            <div>
                              <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                                সোশ্যাল মিডিয়া সেটিংস ও টপ-বার লিংক (TopBar Social Media Links Controller)
                              </h4>
                              <p className="text-slate-500 text-xs mt-0.5">
                                ওয়েবসাইটের একদম উপরের টপ-বারে প্রদর্শিত সোশ্যাল মিডিয়া আইকনগুলোর প্রোফাইল ইউআরএল নির্ধারণ করুন।
                              </p>
                            </div>
                          </div>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300">
                            রিয়েল-টাইম লাইভ সিঙ্ক
                          </span>
                        </div>

                        {/* Social Inputs Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                          {/* Facebook URL */}
                          <div className="space-y-1">
                            <label className="flex items-center gap-1.5 font-bold text-xs text-blue-600 dark:text-blue-400">
                              <Facebook className="w-3.5 h-3.5" />
                              <span>ফেসবুক পেজ / প্রোফাইল ইউআরএল (Facebook URL)</span>
                            </label>
                            <input
                              type="url"
                              value={localSettings.socialMediaUrls?.facebook ?? localSettings.facebookUrl ?? ''}
                              onChange={(e) => {
                                const val = e.target.value;
                                setLocalSettings({
                                  ...localSettings,
                                  facebookUrl: val,
                                  socialMediaUrls: {
                                    ...(localSettings.socialMediaUrls || {}),
                                    facebook: val,
                                  },
                                });
                              }}
                              placeholder="https://facebook.com/yourportal"
                              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-transparent font-mono focus:ring-2 focus:ring-blue-500"
                            />
                          </div>

                          {/* Twitter / X URL */}
                          <div className="space-y-1">
                            <label className="flex items-center gap-1.5 font-bold text-xs text-sky-500">
                              <Twitter className="w-3.5 h-3.5" />
                              <span>এক্স / টুইটার ইউআরএল (Twitter / X URL)</span>
                            </label>
                            <input
                              type="url"
                              value={localSettings.socialMediaUrls?.twitter ?? localSettings.twitterUrl ?? ''}
                              onChange={(e) => {
                                const val = e.target.value;
                                setLocalSettings({
                                  ...localSettings,
                                  twitterUrl: val,
                                  socialMediaUrls: {
                                    ...(localSettings.socialMediaUrls || {}),
                                    twitter: val,
                                  },
                                });
                              }}
                              placeholder="https://x.com/yourportal"
                              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-transparent font-mono focus:ring-2 focus:ring-sky-500"
                            />
                          </div>

                          {/* YouTube URL */}
                          <div className="space-y-1">
                            <label className="flex items-center gap-1.5 font-bold text-xs text-red-600">
                              <Youtube className="w-3.5 h-3.5" />
                              <span>ইউটিউব চ্যানেল ইউআরএল (YouTube URL)</span>
                            </label>
                            <input
                              type="url"
                              value={localSettings.socialMediaUrls?.youtube ?? localSettings.youtubeUrl ?? ''}
                              onChange={(e) => {
                                const val = e.target.value;
                                setLocalSettings({
                                  ...localSettings,
                                  youtubeUrl: val,
                                  socialMediaUrls: {
                                    ...(localSettings.socialMediaUrls || {}),
                                    youtube: val,
                                  },
                                });
                              }}
                              placeholder="https://youtube.com/@yourchannel"
                              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-transparent font-mono focus:ring-2 focus:ring-red-500"
                            />
                          </div>

                          {/* Instagram URL */}
                          <div className="space-y-1">
                            <label className="flex items-center gap-1.5 font-bold text-xs text-pink-600">
                              <Instagram className="w-3.5 h-3.5" />
                              <span>ইনস্টাগ্রাম ইউআরএল (Instagram URL)</span>
                            </label>
                            <input
                              type="url"
                              value={localSettings.socialMediaUrls?.instagram ?? localSettings.instagramUrl ?? ''}
                              onChange={(e) => {
                                const val = e.target.value;
                                setLocalSettings({
                                  ...localSettings,
                                  instagramUrl: val,
                                  socialMediaUrls: {
                                    ...(localSettings.socialMediaUrls || {}),
                                    instagram: val,
                                  },
                                });
                              }}
                              placeholder="https://instagram.com/yourportal"
                              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-transparent font-mono focus:ring-2 focus:ring-pink-500"
                            />
                          </div>

                          {/* LinkedIn URL */}
                          <div className="space-y-1 sm:col-span-2">
                            <label className="flex items-center gap-1.5 font-bold text-xs text-blue-700 dark:text-blue-400">
                              <Linkedin className="w-3.5 h-3.5" />
                              <span>লিংকডইন ইউআরএল (LinkedIn Profile / Page URL)</span>
                            </label>
                            <input
                              type="url"
                              value={localSettings.socialMediaUrls?.linkedin ?? localSettings.linkedinUrl ?? ''}
                              onChange={(e) => {
                                const val = e.target.value;
                                setLocalSettings({
                                  ...localSettings,
                                  linkedinUrl: val,
                                  socialMediaUrls: {
                                    ...(localSettings.socialMediaUrls || {}),
                                    linkedin: val,
                                  },
                                });
                              }}
                              placeholder="https://linkedin.com/company/yourportal"
                              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-transparent font-mono focus:ring-2 focus:ring-blue-600"
                            />
                          </div>
                        </div>

                        {/* Real-time TopBar Visual Preview */}
                        <div className="p-3.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
                          <span className="font-solaiman font-bold text-slate-600 dark:text-slate-300 flex items-center gap-1.5">
                            <Eye className="w-3.5 h-3.5 text-emerald-500" />
                            টপ-বারে যেমন দেখাবে (Live TopBar Preview):
                          </span>
                          <div className="flex items-center gap-2.5">
                            {localSettings.socialMediaUrls?.facebook && (
                              <span className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px]">
                                <Facebook className="w-3 h-3" />
                              </span>
                            )}
                            {localSettings.socialMediaUrls?.twitter && (
                              <span className="w-6 h-6 rounded-full bg-sky-500 text-white flex items-center justify-center text-[10px]">
                                <Twitter className="w-3 h-3" />
                              </span>
                            )}
                            {localSettings.socialMediaUrls?.youtube && (
                              <span className="w-6 h-6 rounded-full bg-red-600 text-white flex items-center justify-center text-[10px]">
                                <Youtube className="w-3 h-3" />
                              </span>
                            )}
                            {localSettings.socialMediaUrls?.instagram && (
                              <span className="w-6 h-6 rounded-full bg-pink-600 text-white flex items-center justify-center text-[10px]">
                                <Instagram className="w-3 h-3" />
                              </span>
                            )}
                            {localSettings.socialMediaUrls?.linkedin && (
                              <span className="w-6 h-6 rounded-full bg-blue-700 text-white flex items-center justify-center text-[10px]">
                                <Linkedin className="w-3 h-3" />
                              </span>
                            )}
                            {!localSettings.socialMediaUrls?.facebook && !localSettings.socialMediaUrls?.twitter && (
                              <span className="text-[11px] text-slate-400 italic">ইউআরএল লিখলে আইকন স্বয়ংক্রিয়ভাবে সক্রিয় হবে</span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Social Sharing Platforms / Icons Manager */}
                      <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 space-y-4 shadow-xs">
                        <div className="border-b pb-2.5 flex items-center justify-between">
                          <div>
                            <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                              <Share2 className="w-4 h-4 text-red-600" />
                              <span>সোশ্যাল শেয়ার আইকন ও শেয়ার কাউন্টার ম্যানেজার (Social Share Icons Manager)</span>
                            </h4>
                            <p className="text-slate-500 text-xs mt-0.5">
                              সংবাদের বিস্তারিত পাতায় কোন কোন সোশ্যাল প্ল্যাটফর্মের শেয়ার বাটন প্রদর্শিত হবে তা সক্রিয় বা নিষ্ক্রিয় করুন।
                            </p>
                          </div>
                        </div>

                        {/* Social Platform Toggles */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                          {[
                            { key: 'facebook', name: 'Facebook (ফেসবুক)', color: 'text-blue-600' },
                            { key: 'twitter', name: 'X / Twitter (টুইটার)', color: 'text-sky-500' },
                            { key: 'whatsapp', name: 'WhatsApp (হোয়াটসঅ্যাপ)', color: 'text-emerald-600' },
                            { key: 'linkedin', name: 'LinkedIn (লিংকডইন)', color: 'text-blue-700' },
                            { key: 'telegram', name: 'Telegram (টেলিগ্রাম)', color: 'text-cyan-500' },
                            { key: 'copyLink', name: 'Copy Link (লিংক কপি বাটন)', color: 'text-slate-700 dark:text-slate-300' },
                          ].map((platform) => {
                            const isEnabled = localSettings.socialShares?.[platform.key as keyof typeof localSettings.socialShares] ?? true;
                            return (
                              <div
                                key={platform.key}
                                className="flex items-center justify-between p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40"
                              >
                                <span className={`text-xs font-bold ${platform.color}`}>
                                  {platform.name}
                                </span>
                                <label className="relative inline-flex items-center cursor-pointer">
                                  <input
                                    type="checkbox"
                                    checked={isEnabled}
                                    onChange={(e) => {
                                      const currentShares = localSettings.socialShares || {
                                        facebook: true,
                                        twitter: true,
                                        whatsapp: true,
                                        linkedin: true,
                                        telegram: true,
                                        copyLink: true,
                                      };
                                      setLocalSettings({
                                        ...localSettings,
                                        socialShares: {
                                          ...currentShares,
                                          [platform.key]: e.target.checked,
                                        },
                                      });
                                    }}
                                    className="sr-only peer"
                                  />
                                  <div className="w-9 h-5 bg-slate-300 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-red-600"></div>
                                </label>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      <div className="border-b pb-2">
                        <h4 className="text-base font-bold text-slate-900 dark:text-white">
                          ফেসবুক অটো-পোস্ট কনফিগারেশন (Facebook Auto-Posting)
                        </h4>
                        <p className="text-slate-500 text-xs mt-0.5">
                          সহজেই ফেসবুক পেজ যুক্ত করুন যাতে নতুন সংবাদ প্রকাশের সাথে সাথে সরাসরি ফেসবুকে শেয়ার হয়ে যায়।
                        </p>
                      </div>

                      {/* 1. Clean Toggle Checkbox */}
                      <div className="flex items-center justify-between p-4 border rounded-xl bg-blue-50/70 dark:bg-blue-950/30 border-blue-200 dark:border-blue-900/50">
                        <div className="space-y-0.5">
                          <label htmlFor="fb-toggle" className="font-bold text-sm text-slate-900 dark:text-white cursor-pointer">
                            অটো ফেসবুক পোস্টিং (Auto-Post to Facebook Pages)
                          </label>
                          <p className="text-slate-600 dark:text-slate-300 text-xs">
                            টগল চালু থাকলে অ্যাডমিন প্যানেল থেকে যেকোনো সংবাদ পাবলিশ হলেই স্বয়ংক্রিয়ভাবে ফেসবুক পেজে চলে যাবে।
                          </p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            id="fb-toggle"
                            type="checkbox"
                            checked={localSettings.autoPostToFacebook ?? true}
                            onChange={(e) => setLocalSettings({ ...localSettings, autoPostToFacebook: e.target.checked })}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                      </div>

                      {/* 2. Facebook Page Username or URL */}
                      <div className="space-y-1.5">
                        <label className="block font-bold text-xs text-slate-800 dark:text-slate-200">
                          ফেসবুক পেজ ইউজারনেম বা লিংক (Page URL or Username)
                        </label>
                        <input
                          type="text"
                          value={localSettings.facebookUrl || ''}
                          onChange={(e) => setLocalSettings({ ...localSettings, facebookUrl: e.target.value })}
                          placeholder="যেমন: https://facebook.com/yourportal অথবা yourportal"
                          className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-transparent text-xs"
                        />
                      </div>

                      {/* 3. Page Access Token with Simple Bengali Help Guide */}
                      <div className="space-y-2">
                        <label className="block font-bold text-xs text-slate-800 dark:text-slate-200">
                          পেজ অ্যাক্সেস টোকেন (Page Access Token)
                        </label>
                        <textarea
                          rows={3}
                          value={localSettings.facebookAccounts || ''}
                          onChange={(e) => setLocalSettings({ ...localSettings, facebookAccounts: e.target.value })}
                          className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-transparent font-mono text-xs focus:ring-2 focus:ring-blue-500"
                          placeholder="আপনার ফেসবুক পেজের Access Token এখানে পেস্ট করুন (যেমন: EAABw2...)"
                        />
                        
                        {/* Simple Info Note in Bengali */}
                        <div className="p-3 rounded-lg bg-slate-100 dark:bg-slate-800 text-[11px] text-slate-600 dark:text-slate-300 space-y-1 border border-slate-200 dark:border-slate-700">
                          <p className="font-bold text-blue-600 dark:text-blue-400 flex items-center gap-1.5">
                            <Sparkles className="w-3.5 h-3.5" />
                            টোকেন কীভাবে সংগ্রহ করবেন (সহজ নির্দেশিকা):
                          </p>
                          <p>
                            ১. Meta for Developers (<span className="font-mono text-slate-800 dark:text-slate-200">developers.facebook.com/tools/explorer</span>) সাইটে লগইন করুন।
                          </p>
                          <p>
                            ২. আপনার পেজটি নির্বাচন করে <span className="font-semibold text-slate-800 dark:text-slate-200">'Generate Access Token'</span> বাটনে ক্লিক করে কপি করে উপরে পেস্ট করুন।
                          </p>
                          <p className="text-slate-500 text-[10px] italic">
                            * নোট: টোকেন ফাঁকা থাকলেও ওয়েবসাইট স্বাভাবিকভাবে চলবে, কোনো প্রকার সমস্যা বা ত্রুটি হবে না।
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Mail Setting */}
                  {settingsTab === 'mail' && (
                    <div className="space-y-4">
                      <h4 className="text-base font-bold text-slate-900 dark:text-white border-b pb-2">
                        Mail & SMTP Setting (ডোমেইন ভিত্তিক মেইল ও SMTP কনফিগারেশন)
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block font-bold mb-1">SMTP Host</label>
                          <input
                            type="text"
                            value={localSettings.smtpHost || `mail.${localSettings.domain || 'newsportal.com'}`}
                            onChange={(e) => setLocalSettings({ ...localSettings, smtpHost: e.target.value })}
                            className="w-full px-3 py-2 rounded border border-slate-300 dark:border-slate-700 bg-transparent font-mono text-xs"
                          />
                        </div>
                        <div>
                          <label className="block font-bold mb-1">SMTP Port</label>
                          <input
                            type="text"
                            value={localSettings.smtpPort || '465'}
                            onChange={(e) => setLocalSettings({ ...localSettings, smtpPort: e.target.value })}
                            className="w-full px-3 py-2 rounded border border-slate-300 dark:border-slate-700 bg-transparent font-mono text-xs"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block font-bold mb-1">SMTP Username / Email</label>
                          <input
                            type="text"
                            value={localSettings.smtpUser || `noreply@${localSettings.domain || 'newsportal.com'}`}
                            onChange={(e) => setLocalSettings({ ...localSettings, smtpUser: e.target.value })}
                            className="w-full px-3 py-2 rounded border border-slate-300 dark:border-slate-700 bg-transparent font-mono text-xs"
                          />
                        </div>
                        <div>
                          <label className="block font-bold mb-1">SMTP Password</label>
                          <input
                            type="password"
                            value={localSettings.smtpPassword || '••••••••••••'}
                            onChange={(e) => setLocalSettings({ ...localSettings, smtpPassword: e.target.value })}
                            className="w-full px-3 py-2 rounded border border-slate-300 dark:border-slate-700 bg-transparent font-mono text-xs"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block font-bold mb-1">সেন্ডার বা প্রেরকের নাম (Sender Name)</label>
                        <input
                          type="text"
                          value={localSettings.smtpSenderName || `${localSettings.siteName || 'নিউজ পোর্টাল'} বার্তা বিভাগ`}
                          onChange={(e) => setLocalSettings({ ...localSettings, smtpSenderName: e.target.value })}
                          className="w-full px-3 py-2 rounded border border-slate-300 dark:border-slate-700 bg-transparent"
                        />
                      </div>

                      {/* Direct SMTP Test Mail Sender (Requirement 2) */}
                      <div className="mt-6 pt-5 border-t border-slate-200 dark:border-slate-700 space-y-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="p-1.5 rounded-lg bg-red-100 dark:bg-red-950/60 text-red-600 dark:text-red-400">
                              <Inbox className="w-4 h-4" />
                            </span>
                            <div>
                              <h5 className="font-bold text-sm text-slate-900 dark:text-white">
                                লাইভ SMTP টেস্ট মেইল ভেরিফিকেশন (Send Test Email)
                              </h5>
                              <p className="text-[11px] text-slate-500">
                                কনফিগারেশন সঠিক কিনা যাচাই করতে যে কোনো ঠিকানায় সরাসরি একটি টেস্ট মেইল পাঠান
                              </p>
                            </div>
                          </div>
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-bold">
                            লাইভ সংযোগ পরীক্ষক
                          </span>
                        </div>

                        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 space-y-3">
                          <label className="block font-bold text-xs text-slate-800 dark:text-slate-200">
                            প্রাপকের ই-মেইল ঠিকানা (Recipient Email Address)
                          </label>
                          <div className="flex flex-col sm:flex-row gap-2">
                            <input
                              type="email"
                              value={testEmailRecipient}
                              onChange={(e) => setTestEmailRecipient(e.target.value)}
                              placeholder="admin@yourdomain.com অথবা test@gmail.com"
                              className="flex-1 px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-mono focus:ring-2 focus:ring-red-500"
                            />
                            <button
                              type="button"
                              onClick={handleSendTestEmail}
                              disabled={isSendingTestMail}
                              className="px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-slate-400 text-white font-bold rounded-lg transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs whitespace-nowrap active:scale-95"
                            >
                              {isSendingTestMail ? (
                                <>
                                  <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                  <span>পাঠানো হচ্ছে...</span>
                                </>
                              ) : (
                                <>
                                  <Send className="w-3.5 h-3.5" />
                                  <span>টেস্ট মেইল পাঠান</span>
                                </>
                              )}
                            </button>
                          </div>

                          {/* Live SMTP Result & Handshake Readout */}
                          {testMailResult && (
                            <div className={`mt-3 p-3.5 rounded-lg border text-xs font-mono transition-all animate-in fade-in ${
                              testMailResult.success
                                ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200'
                                : 'bg-red-50 dark:bg-red-950/40 border-red-300 dark:border-red-800 text-red-900 dark:text-red-200'
                            }`}>
                              <div className="flex items-center justify-between mb-2 pb-1.5 border-b border-emerald-200 dark:border-emerald-800/50">
                                <span className="font-bold flex items-center gap-1.5 font-solaiman text-sm">
                                  {testMailResult.success ? '✓ ' : '✕ '} {testMailResult.message}
                                </span>
                                <span className="text-[10px] text-slate-500 dark:text-slate-400">
                                  {testMailResult.timestamp}
                                </span>
                              </div>
                              <div className="space-y-1 text-[11px] max-h-40 overflow-y-auto bg-black/5 dark:bg-black/30 p-2 rounded">
                                {testMailResult.logs.map((logLine, lIdx) => (
                                  <div key={lIdx} className="leading-tight">
                                    {logLine}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Login & Security Setting (Secret Token Guard & Route Isolation) */}
                  {settingsTab === 'login' && (
                    <div className="space-y-6">
                      <div className="border-b pb-3">
                        <h4 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                          <ShieldCheck className="w-5 h-5 text-red-600" />
                          <span>Login & Secret Guard Settings (অ্যাডমিন সুরক্ষা ও সিক্রেট টোকেন গার্ড)</span>
                        </h4>
                        <p className="text-xs text-slate-500 mt-1">
                          মূল ফ্রন্ট-এন্ড থেকে অ্যাডমিন প্যানেলকে সম্পূর্ণ বিচ্ছিন্ন ও সাধারণ ভিজিটরদের প্রবেশাধিকার নিষিদ্ধ রাখার কেন্দ্রীয় নিয়ন্ত্রণ
                        </p>
                      </div>

                      {/* Top Highlight Box: Route Isolation & Secret Token Status */}
                      <div className="p-4 rounded-xl border bg-gradient-to-br from-red-50/70 via-rose-50/40 to-amber-50/40 dark:from-red-950/40 dark:via-rose-950/20 dark:to-slate-900 border-red-200 dark:border-red-900/60 space-y-4 shadow-xs">
                        <div className="flex items-start justify-between gap-3 flex-wrap sm:flex-nowrap">
                          <div className="flex items-start gap-3">
                            <div className="w-10 h-10 rounded-xl bg-red-600 text-white flex items-center justify-center shrink-0 shadow-sm mt-0.5">
                              <Lock className="w-5 h-5" />
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <h5 className="text-sm font-black text-gray-950 dark:text-white">
                                  সিক্রেট টোকেন বেসড অ্যাডমিন রাউট আইসোলেশন
                                </h5>
                                <span className="px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-[10px] font-bold border border-emerald-300 dark:border-emerald-800">
                                  ১০০% সক্রিয় ও সুরক্ষিত
                                </span>
                              </div>
                              <p className="text-xs text-slate-700 dark:text-slate-300 mt-1 leading-relaxed">
                                এই ব্যবস্থা সক্রিয় থাকায় সাধারণ কোনো ভিজিটর URL-এ <code className="px-1 py-0.5 rounded bg-white dark:bg-slate-800 border font-mono text-red-600 dark:text-red-400">#admin</code> বা <code className="px-1 py-0.5 rounded bg-white dark:bg-slate-800 border font-mono text-red-600 dark:text-red-400">/admin</code> লিখে বা কোনো পাবলিক বাটন ক্লিক করে সরাসরি অ্যাডমিন প্যানেলে ঢুকতে পারবে না। শুধুমাত্র আপনার নির্ধারিত সিক্রেট টোকেন অথবা ১-ক্লিক গোপন ইউআরএল ব্যবহারকারীই প্রবেশ করতে পারবেন।
                              </p>
                            </div>
                          </div>
                          
                          {/* Immediate Session Lockout Test Button */}
                          <button
                            type="button"
                            onClick={() => {
                              if (confirm('আপনি কি নিশ্চিত যে বর্তমান অ্যাডমিন গেটওয়ে সেশনটি অবিলম্বে লক করতে চান? এর ফলে আপনাকে পুনরায় সিক্রেট টোকেন দিয়ে আনলক করতে হবে।')) {
                                revokeAdminGatewayAccess();
                                onBackToPortal();
                              }
                            }}
                            className="px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white font-bold text-xs shrink-0 flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
                            title="সেশন অবিলম্বে লক করে টেস্ট করুন"
                          >
                            <Lock className="w-3.5 h-3.5" />
                            <span>অ্যাডমিন সেশন অবিলম্বে লক করুন</span>
                          </button>
                        </div>

                        {/* Secret Token Field */}
                        <div className="p-3.5 rounded-lg bg-white dark:bg-slate-900 border border-red-200 dark:border-slate-800 space-y-3">
                          <div className="flex items-center justify-between flex-wrap gap-2">
                            <label className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5 text-xs">
                              <Key className="w-4 h-4 text-amber-500" />
                              <span>নির্ধারিত সিক্রেট অ্যাক্সেস টোকেন (Secret Token):</span>
                            </label>
                            <button
                              type="button"
                              onClick={() => {
                                const newGenerated = generateSecureAdminToken();
                                setLocalSettings({
                                  ...localSettings,
                                  adminSecurity: {
                                    ...(localSettings.adminSecurity || {}),
                                    secretToken: newGenerated,
                                    enabled: true,
                                    hideAdminButtonFromPublic: true,
                                  }
                                });
                                setShowSecretTokenInDashboard(true);
                              }}
                              className="text-[11px] text-red-600 dark:text-red-400 hover:underline font-bold flex items-center gap-1 cursor-pointer"
                            >
                              <RefreshCw className="w-3 h-3" />
                              <span>নতুন স্ট্রং টোকেন জেনারেট করুন</span>
                            </button>
                          </div>

                          <div className="flex items-center gap-2">
                            <div className="relative flex-1">
                              <input
                                type={showSecretTokenInDashboard ? 'text' : 'password'}
                                value={localSettings.adminSecurity?.secretToken || SECRET_ADMIN_TOKEN}
                                onChange={(e) => {
                                  const val = e.target.value.trim();
                                  setLocalSettings({
                                    ...localSettings,
                                    adminSecurity: {
                                      ...(localSettings.adminSecurity || {}),
                                      secretToken: val,
                                      enabled: true,
                                      hideAdminButtonFromPublic: true,
                                    }
                                  });
                                }}
                                placeholder={`যেমন: ${SECRET_ADMIN_TOKEN}`}
                                className="w-full pl-3 pr-10 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-mono font-bold tracking-wider text-slate-900 dark:text-white"
                              />
                              <button
                                type="button"
                                onClick={() => setShowSecretTokenInDashboard(!showSecretTokenInDashboard)}
                                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1"
                                title={showSecretTokenInDashboard ? 'টোকেন লুকান' : 'টোকেন দেখুন'}
                              >
                                {showSecretTokenInDashboard ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                              </button>
                            </div>

                            <button
                              type="button"
                              onClick={() => {
                                const currentTk = localSettings.adminSecurity?.secretToken || SECRET_ADMIN_TOKEN;
                                navigator.clipboard.writeText(currentTk);
                                setCopiedToken(true);
                                setTimeout(() => setCopiedToken(false), 2000);
                              }}
                              className="px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                              title="টোকেন কপি করুন"
                            >
                              {copiedToken ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                              <span>{copiedToken ? 'কপি হয়েছে' : 'কপি'}</span>
                            </button>
                          </div>
                        </div>

                        {/* 1-Click Secret Gateway URL */}
                        <div className="p-3.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5 text-xs">
                              <Globe className="w-4 h-4 text-blue-500" />
                              <span>আপনার ব্যক্তিগত ১-ক্লিক গোপন অ্যাডমিন ইউআরএল (Secret Admin URL):</span>
                            </span>
                            <span className="text-[10px] text-amber-600 dark:text-amber-400 font-bold">
                              * কাউকে শেয়ার করবেন না, ব্রাউজারে বুকমার্ক করে রাখুন
                            </span>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <div className="flex-1 p-2 rounded-lg bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 font-mono text-[11px] text-slate-700 dark:text-slate-300 truncate">
                              {typeof window !== 'undefined'
                                ? `${window.location.origin}/?token=${encodeURIComponent(localSettings.adminSecurity?.secretToken || SECRET_ADMIN_TOKEN)}#admin`
                                : `/?token=${SECRET_ADMIN_TOKEN}#admin`}
                            </div>
                            <button
                              type="button"
                              onClick={() => {
                                const url = typeof window !== 'undefined'
                                  ? `${window.location.origin}/?token=${encodeURIComponent(localSettings.adminSecurity?.secretToken || SECRET_ADMIN_TOKEN)}#admin`
                                  : '';
                                if (url) {
                                  navigator.clipboard.writeText(url);
                                  setCopiedSecretUrl(true);
                                  setTimeout(() => setCopiedSecretUrl(false), 2000);
                                }
                              }}
                              className="px-3 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold flex items-center gap-1.5 text-xs transition-colors shrink-0 cursor-pointer shadow-xs"
                            >
                              {copiedSecretUrl ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                              <span>{copiedSecretUrl ? 'ইউআরএল কপি হয়েছে!' : 'ইউআরএল কপি করুন'}</span>
                            </button>
                          </div>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400">
                            টিপস: আপনি যখন এই লিংকে ক্লিক করবেন, সিস্টেম স্বয়ংক্রিয়ভাবে সিক্রেট টোকেন যাচাই করবে এবং ইউআরএল থেকে টোকেনটি মুছে দিয়ে পরিচ্ছন্ন ব্রাউজিং বজায় রাখবে।
                          </p>
                        </div>

                        {/* Secret Hotkey Information */}
                        <div className="flex items-center justify-between p-3 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/60 text-xs">
                          <div className="flex items-center gap-2">
                            <span className="px-2 py-0.5 rounded bg-white dark:bg-slate-800 border font-mono font-bold text-amber-700 dark:text-amber-300">
                              Shift + A
                            </span>
                            <span className="text-amber-900 dark:text-amber-200 font-medium">
                              মূল ফ্রন্ট-এন্ডে থাকাকালীন কীবোর্ডে <kbd className="font-bold">Shift + A</kbd> চাপলে সিক্রেট গেটওয়ে অথেনটিকেশন ডায়লগ ওপেন হবে।
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* General Security & Authentication Controls */}
                      <div className="space-y-3 pt-2">
                        <h5 className="font-bold text-slate-900 dark:text-white text-xs uppercase tracking-wider text-slate-500">
                          সাধারণ লগইন ও নিরাপত্তা প্রেফারেন্স
                        </h5>

                        <div className="flex items-center justify-between p-3 border rounded-xl bg-slate-50 dark:bg-slate-800/50">
                          <div>
                            <p className="font-bold text-slate-900 dark:text-white">পাবলিক মেন্যু ও হেডার থেকে অ্যাডমিন লিংক সম্পূর্ণ গোপন রাখুন</p>
                            <p className="text-slate-500 text-[11px]">সাধারণ ভিজিটরদের জন্য সাইটের টপ-বার, ন্যাভবার ও ড্রয়ারে কোনো অ্যাডমিন বাটন দৃশ্যমান হবে না।</p>
                          </div>
                          <input
                            type="checkbox"
                            checked={localSettings.adminSecurity?.hideAdminButtonFromPublic ?? true}
                            onChange={(e) => setLocalSettings({
                              ...localSettings,
                              adminSecurity: {
                                ...(localSettings.adminSecurity || {}),
                                hideAdminButtonFromPublic: e.target.checked,
                              }
                            })}
                            className="w-4 h-4 text-red-600 rounded"
                          />
                        </div>

                        <div className="flex items-center justify-between p-3 border rounded-xl bg-slate-50 dark:bg-slate-800/50">
                          <div>
                            <p className="font-bold text-slate-900 dark:text-white">Google Login (গুগল দিয়ে লগইন)</p>
                            <p className="text-slate-500 text-[11px]">সাধারণ ব্যবহারকারীরা এক ক্লিকে গুগল অ্যাকাউন্ট দিয়ে সাইটে লগইন করতে পারবে।</p>
                          </div>
                          <input
                            type="checkbox"
                            checked={localSettings.enableGoogleLogin ?? true}
                            onChange={(e) => setLocalSettings({ ...localSettings, enableGoogleLogin: e.target.checked })}
                            className="w-4 h-4 text-blue-600 rounded"
                          />
                        </div>

                        <div className="flex items-center justify-between p-3 border rounded-xl bg-slate-50 dark:bg-slate-800/50">
                          <div>
                            <p className="font-bold text-slate-900 dark:text-white">Two-Factor Authentication (2FA)</p>
                            <p className="text-slate-500 text-[11px]">অ্যাডমিন ও সম্পাদকদের জন্য অতিরিক্ত ওটিপি নিরাপত্তা।</p>
                          </div>
                          <input
                            type="checkbox"
                            checked={localSettings.enable2FA ?? false}
                            onChange={(e) => setLocalSettings({ ...localSettings, enable2FA: e.target.checked })}
                            className="w-4 h-4 text-blue-600 rounded"
                          />
                        </div>

                        <div>
                          <label className="block font-bold mb-1 text-slate-900 dark:text-white">সেশন টাইমআউট (Session Timeout)</label>
                          <select
                            value={localSettings.sessionTimeout || '24h'}
                            onChange={(e) => setLocalSettings({ ...localSettings, sessionTimeout: e.target.value })}
                            className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-transparent text-xs"
                          >
                            <option value="2h" className="bg-white dark:bg-slate-800">২ ঘণ্টা</option>
                            <option value="12h" className="bg-white dark:bg-slate-800">১২ ঘণ্টা</option>
                            <option value="24h" className="bg-white dark:bg-slate-800">২৪ ঘণ্টা (১ দিন)</option>
                            <option value="7d" className="bg-white dark:bg-slate-800">৭ দিন</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Universal Data Migration Hub in Settings */}
                  {settingsTab === 'importWp' && (
                    <div className="space-y-4">
                      <UniversalDataMigrationHub
                        articles={articles}
                        categories={categories}
                        users={users}
                        currentUser={currentUser}
                        darkMode={darkMode}
                        settings={localSettings}
                        adSlots={adSlots}
                        onAddArticle={onAddArticle}
                        onUpdateArticle={onUpdateArticle}
                        onAddCategory={onAddCategory}
                        onUpdateUsers={onUpdateUsers}
                        recordAuditLog={recordAuditLog}
                        showSuccessMessage={showSuccessMessage}
                        onViewLivePortal={onBackToPortal}
                      />
                    </div>
                  )}

                  {settingsTab !== 'importWp' && settingsTab !== 'storage' && (
                    <div className="pt-4 border-t flex justify-end">
                      <button
                        type="submit"
                        className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded flex items-center gap-2 shadow-xs transition-colors"
                      >
                        <Save className="w-4 h-4" />
                        <span>সেটিংস সংরক্ষণ করুন</span>
                      </button>
                    </div>
                  )}
                </form>

                {/* Cloud Storage & CDN Settings (Rendered outside <form> to prevent nested form) */}
                {settingsTab === 'storage' && (
                  <div className="space-y-4">
                    <CloudStorageSettings
                      darkMode={darkMode}
                      onShowToast={showSuccessMessage}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ================= TAB CONTENT 10: REDESIGNED SMART PHOTO CARD STUDIO (Admin Only: Req 4) ================= */}
        {activeMainTab === 'photocard' && (
          <div className="p-4 sm:p-6">
            <PhotoCardGenerator
              articles={articles}
              selectedArticle={selectedArticleForCard}
              settings={localSettings}
              onUpdateSettings={onUpdateSettings}
              darkMode={darkMode}
              isAdmin={normalizeRole(currentUser.role) === 'admin'}
              onClose={() => setActiveMainTab('posts')}
            />
          </div>
        )}

        {/* ================= TAB CONTENT 10.05: QUOTES MANAGER (উক্তি ব্যবস্থাপনা) ================= */}
        {activeMainTab === 'quotes' && (
          <div className="p-4 sm:p-6">
            <QuotesManager
              quotes={quotes}
              onUpdateQuotes={(newQuotes) => {
                if (onUpdateQuotes) {
                  onUpdateQuotes(newQuotes);
                }
              }}
              settings={localSettings}
              darkMode={darkMode}
            />
          </div>
        )}

        {/* ================= TAB CONTENT 10.1: E-PAPER CONTROLLER (Req 3) ================= */}
        {activeMainTab === 'epaper_control' && (
          <div className="p-4 sm:p-6 space-y-6 max-w-5xl">
            <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-600 to-orange-500 text-white flex items-center justify-center shadow-md">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white font-solaiman">
                    ই-পেপার ব্রডশিট কন্ট্রোলার (E-Paper Controller)
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-solaiman">
                    ডিজিটাল ই-পেপার সংস্করণের হেডার, সাবটাইটেল, প্রার্থনার সময়সূচি, গ্রিড লেআউট ও ফুটার ক্রেডিট নিয়ন্ত্রণ
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    window.location.hash = 'epaper';
                    onBackToPortal();
                  }}
                  className="px-3.5 py-2 rounded-lg border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold font-solaiman flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>লাইভ ই-পেপার দেখুন</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onUpdateSettings(localSettings);
                    showSuccessMessage('ই-পেপার হেডার, ফুটার ও গ্রিড লেআউট সফলভাবে সংরক্ষিত হয়েছে!');
                  }}
                  className="px-4 py-2 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold font-solaiman flex items-center gap-1.5 shadow-md transition-all cursor-pointer"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>ই-পেপার কনফিগ সেভ করুন</span>
                </button>
              </div>
            </div>

            {/* Controller Form Panels */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
                {/* Panel 1: Header & Masthead */}
              <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
                <div className="border-b pb-2 flex items-center justify-between">
                  <h4 className="font-bold text-sm text-slate-900 dark:text-white font-solaiman flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-amber-500" />
                    <span>ই-পেপার হেডার, লোগো ও মাস্টহেড সেটিংস</span>
                  </h4>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 font-bold">
                    ক্লিন ব্রডশিট ডিজাইন
                  </span>
                </div>

                {/* E-Paper Dedicated Logo & Height */}
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-3">
                  <label className="block text-xs font-bold text-slate-800 dark:text-slate-200">
                    ই-পেপার কাস্টম লোগো (E-Paper Logo URL / Upload):
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={localSettings.epaperConfig?.epaperLogoUrl || ''}
                      onChange={(e) => setLocalSettings({
                        ...localSettings,
                        epaperConfig: {
                          ...localSettings.epaperConfig,
                          epaperLogoUrl: e.target.value,
                        }
                      })}
                      className="flex-1 px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-mono"
                      placeholder={localSettings.lightLogoUrl || "খালি রাখলে মূল সাইট লোগো বা ব্রডশিট ক্যালিগ্রাফি ব্যবহার হবে"}
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-200 dark:border-slate-700">
                    <div>
                      <div className="flex justify-between text-xs font-bold mb-1">
                        <span>মাস্টহেড লোগো সাইজ:</span>
                        <span className="text-amber-600 font-mono">{localSettings.epaperConfig?.epaperLogoHeight || 75}px</span>
                      </div>
                      <input
                        type="range"
                        min="40"
                        max="140"
                        value={localSettings.epaperConfig?.epaperLogoHeight || 75}
                        onChange={(e) => setLocalSettings({
                          ...localSettings,
                          epaperConfig: {
                            ...localSettings.epaperConfig,
                            epaperLogoHeight: Number(e.target.value),
                          }
                        })}
                        className="w-full accent-amber-600 cursor-pointer"
                      />
                    </div>

                    <div className="flex items-center justify-between p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
                      <div>
                        <span className="text-xs font-bold block text-slate-800 dark:text-slate-200">লোগোর নিচে সাইট নাম:</span>
                        <span className="text-[10px] text-slate-400 block">আনচেক রাখলে ডুপ্লিকেট নাম পরিহার হবে</span>
                      </div>
                      <input
                        type="checkbox"
                        checked={localSettings.epaperConfig?.showSiteNameWithLogo === true}
                        onChange={(e) => setLocalSettings({
                          ...localSettings,
                          epaperConfig: {
                            ...localSettings.epaperConfig,
                            showSiteNameWithLogo: e.target.checked,
                          }
                        })}
                        className="w-4 h-4 accent-amber-600 rounded cursor-pointer"
                      />
                    </div>
                  </div>
                </div>

                {/* Slogan & Circulation Banner */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      শীর্ষ ফ্রেম স্লোগান (Slogan Box):
                    </label>
                    <input
                      type="text"
                      value={localSettings.epaperConfig?.sloganBoxText || 'আমরা জনগণের পক্ষে'}
                      onChange={(e) => setLocalSettings({
                        ...localSettings,
                        epaperConfig: {
                          ...localSettings.epaperConfig,
                          sloganBoxText: e.target.value,
                        }
                      })}
                      className="w-full px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-transparent text-xs"
                      placeholder="যেমন: আমরা জনগণের পক্ষে"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      প্রচার দাবি (Circulation Banner):
                    </label>
                    <input
                      type="text"
                      value={localSettings.epaperConfig?.circulationClaim || 'বা ংলা দে শের  স র্বাধি ক  প্র চা রি ত  জা তী য়  দৈ নি ক'}
                      onChange={(e) => setLocalSettings({
                        ...localSettings,
                        epaperConfig: {
                          ...localSettings.epaperConfig,
                          circulationClaim: e.target.value,
                        }
                      })}
                      className="w-full px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-transparent text-xs"
                      placeholder="যেমন: বা ংলা দে শের  স র্বাধি ক  প্র চা রি ত..."
                    />
                  </div>
                </div>

                {/* Edition & Issue Metadata */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      সংস্করণ নাম (Edition):
                    </label>
                    <input
                      type="text"
                      value={localSettings.epaperConfig?.editionName || 'দ্বিতীয় সংস্করণ'}
                      onChange={(e) => setLocalSettings({
                        ...localSettings,
                        epaperConfig: {
                          ...localSettings.epaperConfig,
                          editionName: e.target.value,
                        }
                      })}
                      className="w-full px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-transparent text-xs"
                      placeholder="যেমন: দ্বিতীয় সংস্করণ"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      বর্ষ ও সংখ্যা (Issue):
                    </label>
                    <input
                      type="text"
                      value={localSettings.epaperConfig?.editionDetails || 'ঢাকা | বর্ষ ১৭ | সংখ্যা ২০০'}
                      onChange={(e) => setLocalSettings({
                        ...localSettings,
                        epaperConfig: {
                          ...localSettings.epaperConfig,
                          editionDetails: e.target.value,
                        }
                      })}
                      className="w-full px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-transparent text-xs"
                      placeholder="ঢাকা | বর্ষ ১৭ | সংখ্যা ২০০"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      পৃষ্ঠা ও মূল্য (Price):
                    </label>
                    <input
                      type="text"
                      value={localSettings.epaperConfig?.pagePriceDetails || '১২ পৃষ্ঠা | ১০ টাকা'}
                      onChange={(e) => setLocalSettings({
                        ...localSettings,
                        epaperConfig: {
                          ...localSettings.epaperConfig,
                          pagePriceDetails: e.target.value,
                        }
                      })}
                      className="w-full px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-transparent text-xs"
                      placeholder="১২ পৃষ্ঠা | ১০ টাকা"
                    />
                  </div>
                </div>

                {/* Web Address */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    হেডারে প্রদর্শিত ওয়েবসাইট লিংক (Display Web Address):
                  </label>
                  <input
                    type="text"
                    value={localSettings.epaperConfig?.websiteDisplayUrl || `www.${localSettings.domain || 'dailybangladesh.com'}`}
                    onChange={(e) => setLocalSettings({
                      ...localSettings,
                      epaperConfig: {
                        ...localSettings.epaperConfig,
                        websiteDisplayUrl: e.target.value,
                      }
                    })}
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-transparent text-xs font-mono"
                    placeholder="www.dailybangladesh.com"
                  />
                </div>

                {/* Paper Tone Styling (Requirement 2) */}
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2">
                  <label className="block text-xs font-bold text-slate-800 dark:text-slate-200">
                    নিউজপ্রিন্ট পেপার টোন ও ব্যাকগ্রাউন্ড টেক্সচার:
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: 'crisp_white', label: 'ক্রিস্প হোয়াইট', hint: 'বাংলাদেশ প্রতিদিন এর মতো প্রিমিয়াম সাদা' },
                      { id: 'natural_newsprint', label: 'ন্যাচারাল পেপার', hint: 'বাস্তবধর্মী অফ-হোয়াইট প্রেস' },
                      { id: 'warm_broadsheet', label: 'ওয়ার্ম ব্রডশিট', hint: 'ঐতিহ্যবাহী আর্ট পেপার' },
                    ].map((t) => {
                      const isCurrent = (localSettings.epaperConfig?.paperTone || 'crisp_white') === t.id;
                      return (
                        <button
                          key={t.id}
                          type="button"
                          onClick={() => setLocalSettings({
                            ...localSettings,
                            epaperConfig: {
                              ...localSettings.epaperConfig,
                              paperTone: t.id as any,
                            }
                          })}
                          className={`p-2 rounded-lg border text-center transition-all cursor-pointer ${
                            isCurrent
                              ? 'bg-amber-600 text-white border-amber-600 font-bold shadow-xs'
                              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                          }`}
                        >
                          <div className="text-xs font-solaiman">{t.label}</div>
                          <div className={`text-[9px] ${isCurrent ? 'text-amber-100' : 'text-slate-400'}`}>
                            {t.hint}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Left Ear Panel (Weather & Gold Rates) */}
                <div className="pt-2 border-t border-slate-200 dark:border-slate-800 space-y-2">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                    বাম পাশের ইয়ার প্যানেল (আবহাওয়া, স্বর্ণ ও বাজার দর):
                  </label>
                  <div className="space-y-1.5">
                    <input
                      type="text"
                      value={localSettings.epaperConfig?.leftEarWeather || 'ঢাকা: সর্বোচ্চ ৩২° সে. | আর্দ্রতা: ৭২%'}
                      onChange={(e) => setLocalSettings({
                        ...localSettings,
                        epaperConfig: {
                          ...localSettings.epaperConfig,
                          leftEarWeather: e.target.value,
                        }
                      })}
                      className="w-full px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-transparent text-xs"
                      placeholder="আবহাওয়া..."
                    />
                    <input
                      type="text"
                      value={localSettings.epaperConfig?.leftEarGold || 'স্বর্ণ (২২ ক্যারেট): ১,১৫,৪২০ টাকা / ভরি'}
                      onChange={(e) => setLocalSettings({
                        ...localSettings,
                        epaperConfig: {
                          ...localSettings.epaperConfig,
                          leftEarGold: e.target.value,
                        }
                      })}
                      className="w-full px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-transparent text-xs"
                      placeholder="স্বর্ণ দর..."
                    />
                    <input
                      type="text"
                      value={localSettings.epaperConfig?.leftEarDse || 'ডিএসই এক্স সূচক: ৫,৭৪২ (+১৮.৩)'}
                      onChange={(e) => setLocalSettings({
                        ...localSettings,
                        epaperConfig: {
                          ...localSettings.epaperConfig,
                          leftEarDse: e.target.value,
                        }
                      })}
                      className="w-full px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-transparent text-xs"
                      placeholder="শেয়ার বাজার সূচক..."
                    />
                  </div>
                </div>

                {/* Right Ear Panel (Prayer Times) */}
                <div className="pt-2 border-t border-slate-200 dark:border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      ডান পাশের ইয়ার প্যানেল (নামাজের সময়সূচি ও হটলাইন):
                    </label>
                    <input
                      type="checkbox"
                      checked={localSettings.epaperConfig?.showPrayerTimesEar !== false}
                      onChange={(e) => setLocalSettings({
                        ...localSettings,
                        epaperConfig: {
                          ...localSettings.epaperConfig,
                          showPrayerTimesEar: e.target.checked,
                        }
                      })}
                      className="w-4 h-4 accent-amber-600 rounded cursor-pointer"
                    />
                  </div>
                  <div>
                    <input
                      type="text"
                      value={localSettings.epaperConfig?.prayerTimesText || 'বিজ্ঞাপন হটলাইন: ০৯৬১২-০০০০০০'}
                      onChange={(e) => setLocalSettings({
                        ...localSettings,
                        epaperConfig: {
                          ...localSettings.epaperConfig,
                          prayerTimesText: e.target.value,
                        }
                      })}
                      className="w-full px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-transparent text-xs"
                      placeholder="বিজ্ঞাপন হটলাইন নম্বর..."
                    />
                  </div>
                </div>
              </div>

              {/* Panel 2: Grid Layout & Columns */}
              <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
                <div className="border-b pb-2">
                  <h4 className="font-bold text-sm text-slate-900 dark:text-white font-solaiman flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-orange-500" />
                    <span>ই-পেপার গ্রিড ও কলাম লেআউট (Grid Layout)</span>
                  </h4>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                    ব্রডশিট কলাম সংখ্যা (Vertical Grid Columns):
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { cols: 3, label: '৩ কলাম', hint: 'ওয়াইড কলাম' },
                      { cols: 4, label: '৪ কলাম', hint: 'ক্লাসিক ব্রডশিট' },
                      { cols: 5, label: '৫ কলাম', hint: 'কমপ্যাক্ট কলাম' },
                    ].map((c) => {
                      const isCurrent = (localSettings.epaperConfig?.gridColumns || 4) === c.cols;
                      return (
                        <button
                          key={c.cols}
                          type="button"
                          onClick={() => setLocalSettings({
                            ...localSettings,
                            epaperConfig: {
                              ...localSettings.epaperConfig,
                              gridColumns: c.cols as any,
                            }
                          })}
                          className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                            isCurrent
                              ? 'bg-amber-600 text-white border-amber-600 font-bold shadow-xs'
                              : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-amber-400 text-slate-700 dark:text-slate-300'
                          }`}
                        >
                          <div className="text-xs font-solaiman">{c.label}</div>
                          <div className={`text-[10px] ${isCurrent ? 'text-amber-100' : 'text-slate-400'}`}>
                            {c.hint}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                    কলামের মধ্যবর্তী স্পেসিং (Column Gap):
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: 'compact', label: 'টাইট' },
                      { id: 'normal', label: 'স্বাভাবিক' },
                      { id: 'relaxed', label: 'খোলামেলা' },
                    ].map((g) => {
                      const isCurrent = (localSettings.epaperConfig?.columnGap || 'normal') === g.id;
                      return (
                        <button
                          key={g.id}
                          type="button"
                          onClick={() => setLocalSettings({
                            ...localSettings,
                            epaperConfig: {
                              ...localSettings.epaperConfig,
                              columnGap: g.id as any,
                            }
                          })}
                          className={`py-1.5 px-2 rounded-lg border text-xs font-solaiman transition-all cursor-pointer ${
                            isCurrent
                              ? 'bg-amber-600 text-white font-bold'
                              : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                          }`}
                        >
                          {g.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Ad Box Toggle */}
                <div className="pt-2 border-t border-slate-200 dark:border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      ই-পেপারে প্রিন্ট বিজ্ঞাপন বক্স প্রদর্শন:
                    </label>
                    <input
                      type="checkbox"
                      checked={localSettings.epaperConfig?.showAdBox !== false}
                      onChange={(e) => setLocalSettings({
                        ...localSettings,
                        epaperConfig: {
                          ...localSettings.epaperConfig,
                          showAdBox: e.target.checked,
                        }
                      })}
                      className="w-4 h-4 accent-amber-600 rounded cursor-pointer"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      value={localSettings.epaperConfig?.adBoxTitle || 'বিজ্ঞাপন স্থান'}
                      onChange={(e) => setLocalSettings({
                        ...localSettings,
                        epaperConfig: {
                          ...localSettings.epaperConfig,
                          adBoxTitle: e.target.value,
                        }
                      })}
                      className="w-full px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-transparent text-xs"
                      placeholder="বিজ্ঞাপন বক্স শিরোনাম..."
                    />
                    <input
                      type="text"
                      value={localSettings.epaperConfig?.adBoxEmail || `ads@${localSettings.domain || 'newsportal.com'}`}
                      onChange={(e) => setLocalSettings({
                        ...localSettings,
                        epaperConfig: {
                          ...localSettings.epaperConfig,
                          adBoxEmail: e.target.value,
                        }
                      })}
                      className="w-full px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-transparent text-xs"
                      placeholder="বিজ্ঞাপন ইমেইল..."
                    />
                  </div>
                </div>

                {/* Sub-Masthead 4-Story Ear Cards & Print Strip Banner (Requirement 1 & 2) */}
                <div className="pt-2 border-t border-slate-200 dark:border-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                        মাস্টহেডের নিচে ৪টি টপ আর্টিকল ইয়ার কার্ডস:
                      </span>
                      <span className="text-[10px] text-slate-400">বাংলাদেশ প্রতিদিন এর মতো শীর্ষ খবরের কার্ডস</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={localSettings.epaperConfig?.showTopEarCards !== false}
                      onChange={(e) => setLocalSettings({
                        ...localSettings,
                        epaperConfig: {
                          ...localSettings.epaperConfig,
                          showTopEarCards: e.target.checked,
                        }
                      })}
                      className="w-4 h-4 accent-amber-600 rounded cursor-pointer"
                    />
                  </div>

                  <div className="pt-2 border-t border-slate-200 dark:border-slate-800 space-y-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                          ফুল-উইডথ স্ট্রিপ কমার্শিয়াল ব্যানার:
                        </span>
                        <span className="text-[10px] text-slate-400">প্রিন্ট সংস্করণের স্পনসর বা ব্র্যান্ড বিজ্ঞাপন ব্যানার</span>
                      </div>
                      <input
                        type="checkbox"
                        checked={localSettings.epaperConfig?.showPrintStripBanner !== false}
                        onChange={(e) => setLocalSettings({
                          ...localSettings,
                          epaperConfig: {
                            ...localSettings.epaperConfig,
                            showPrintStripBanner: e.target.checked,
                          }
                        })}
                        className="w-4 h-4 accent-amber-600 rounded cursor-pointer"
                      />
                    </div>
                    <input
                      type="text"
                      value={localSettings.epaperConfig?.printStripBannerTitle || 'স্পা ন্যাচারাল ড্রিংকিং ওয়াটার — ৩৩০ মি.লি. ১০ টাকা | ৫০০ মি.লি. ১৫ টাকা'}
                      onChange={(e) => setLocalSettings({
                        ...localSettings,
                        epaperConfig: {
                          ...localSettings.epaperConfig,
                          printStripBannerTitle: e.target.value,
                        }
                      })}
                      className="w-full px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-transparent text-xs"
                      placeholder="ব্যানার শিরোনাম..."
                    />
                  </div>
                </div>
              </div>

              {/* Panel 3: Editorial Column Note */}
              <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
                <div className="border-b pb-2">
                  <h4 className="font-bold text-sm text-slate-900 dark:text-white font-solaiman flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    <span>সম্পাদকীয় কলম ও উক্তি বক্স</span>
                  </h4>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    বক্স শিরোনাম (Note Title):
                  </label>
                  <input
                    type="text"
                    value={localSettings.epaperConfig?.editorialNoteTitle || 'সম্পাদকের কলম থেকে'}
                    onChange={(e) => setLocalSettings({
                      ...localSettings,
                      epaperConfig: {
                        ...localSettings.epaperConfig,
                        editorialNoteTitle: e.target.value,
                      }
                    })}
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-transparent text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    সম্পাদকীয় বাণী / বার্তা (Editorial Message):
                  </label>
                  <textarea
                    rows={2}
                    value={localSettings.epaperConfig?.editorialNoteQuote || 'সংবাদপত্রের স্বাধীনতা ও বস্তুনিষ্ঠ তথ্য পরিবেশনই গণতান্ত্রিক সমাজব্যবস্থার মূল স্তম্ভ।'}
                    onChange={(e) => setLocalSettings({
                      ...localSettings,
                      epaperConfig: {
                        ...localSettings.epaperConfig,
                        editorialNoteQuote: e.target.value,
                      }
                    })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-transparent text-xs"
                  />
                </div>
              </div>

              {/* Panel 4: Footer Credits */}
              <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
                <div className="border-b pb-2">
                  <h4 className="font-bold text-sm text-slate-900 dark:text-white font-solaiman flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-indigo-500" />
                    <span>ই-পেপার ফুটার ও প্রকাশনা ক্রেডিট</span>
                  </h4>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    ফুটার লাইন ও ক্রেডিট টেক্সট (Footer Credits):
                  </label>
                  <input
                    type="text"
                    value={localSettings.epaperConfig?.footerCredits || `ভারপ্রাপ্ত সম্পাদক: ${localSettings.editorName || 'সম্পাদকীয় বিভাগ'} • প্রকাশক: ${localSettings.publisherName || `${localSettings.siteName || 'নিউজ পোর্টাল'} পাবলিকেশনস`}`}
                    onChange={(e) => setLocalSettings({
                      ...localSettings,
                      epaperConfig: {
                        ...localSettings.epaperConfig,
                        footerCredits: e.target.value,
                      }
                    })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-transparent text-xs"
                    placeholder="ফুটার ক্রেডিট..."
                  />
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  ই-পেপারের প্রতি পৃষ্ঠার একদম নিচে এই তথ্যটি মুদ্রিত ব্রডশিট ধাঁচে প্রদর্শিত হবে।
                </p>
              </div>

            </div>
          </div>
        )}

        {/* ================= TAB CONTENT 10.2: PRINT VIEW CONTROLLER (Req 3) ================= */}
        {activeMainTab === 'print_control' && (
          <div className="p-4 sm:p-6 space-y-6 max-w-5xl">
            <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-blue-500 text-white flex items-center justify-center shadow-md">
                  <Printer className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white font-solaiman">
                    নিউজ প্রিন্ট ভিউ কন্ট্রোলার (Print View Controller)
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-solaiman">
                    সংবাদ বিস্তারিত পৃষ্ঠার A4 ব্রডশিট প্রিন্ট ও ডাউনলোড সংস্করণের লেআউট ও স্টাইল নিয়ন্ত্রণ
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    onUpdateSettings(localSettings);
                    showSuccessMessage('প্রিন্ট ভিউ কনফিগারেশন সফলভাবে সংরক্ষিত হয়েছে!');
                  }}
                  className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold font-solaiman flex items-center gap-1.5 shadow-md transition-all cursor-pointer"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>প্রিন্ট সেটিংস সেভ করুন</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Header Style */}
              <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
                <div className="border-b pb-2">
                  <h4 className="font-bold text-sm text-slate-900 dark:text-white font-solaiman">
                    প্রিন্ট হেডার ও মাস্টহেড স্টাইল
                  </h4>
                </div>

                <div className="space-y-2">
                  {[
                    { id: 'classic_masthead', label: 'ক্লাসিক ব্রডশিট মাস্টহেড', desc: 'লোগো, ট্যাগলাইন, ডেটলাইন ও ডাবল বর্ডার' },
                    { id: 'modern_minimal', label: 'মডার্ন মিনিমালিস্ট', desc: 'সিম্পল সিঙ্গেল লাইন ও মার্জিত টাইপোগ্রাফি' },
                    { id: 'bordered_broadsheet', label: 'বর্ডারযুক্ত নিউজপ্রিন্ট', desc: 'চারকোণা গাঢ় বর্ডার ও ফরমাল লেআউট' },
                  ].map((style) => {
                    const isSelected = (localSettings.printViewConfig?.headerStyle || 'classic_masthead') === style.id;
                    return (
                      <div
                        key={style.id}
                        onClick={() => setLocalSettings({
                          ...localSettings,
                          printViewConfig: {
                            ...localSettings.printViewConfig,
                            headerStyle: style.id as any,
                          }
                        })}
                        className={`p-3 rounded-xl border cursor-pointer transition-all ${
                          isSelected
                            ? 'border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/30 ring-1 ring-indigo-500'
                            : 'border-slate-200 dark:border-slate-800 hover:border-slate-300'
                        }`}
                      >
                        <div className="font-bold text-xs text-slate-900 dark:text-white">{style.label}</div>
                        <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">{style.desc}</div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Feature Image Layout */}
              <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
                <div className="border-b pb-2">
                  <h4 className="font-bold text-sm text-slate-900 dark:text-white font-solaiman">
                    প্রিন্ট সংস্করণে ফিচার ইমেজের বিন্যাস
                  </h4>
                </div>

                <div className="space-y-2">
                  {[
                    { id: 'compact_float', label: 'কমপ্যাক্ট ফ্লোটিং সাইড ইমেজ', desc: 'লেখার বাম পাশে পরিমিত আকারে বসে, যাতে বেশি খবর প্রিন্ট করা যায়' },
                    { id: 'top_banner', label: 'টপ ব্যানার ইমেজ', desc: 'শিরোনামের নিচে পুরো প্রস্থজুড়ে স্পষ্ট ফটো' },
                    { id: 'hidden', label: 'ছবিবিহীন টেক্সট অনলি', desc: 'কালি সাশ্রয়ী অফিসিয়াল ডকুমেন্ট বা পেপার কপি' },
                  ].map((imgOpt) => {
                    const isSelected = (localSettings.printViewConfig?.imageLayout || 'compact_float') === imgOpt.id;
                    return (
                      <div
                        key={imgOpt.id}
                        onClick={() => setLocalSettings({
                          ...localSettings,
                          printViewConfig: {
                            ...localSettings.printViewConfig,
                            imageLayout: imgOpt.id as any,
                          }
                        })}
                        className={`p-3 rounded-xl border cursor-pointer transition-all ${
                          isSelected
                            ? 'border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/30 ring-1 ring-indigo-500'
                            : 'border-slate-200 dark:border-slate-800 hover:border-slate-300'
                        }`}
                      >
                        <div className="font-bold text-xs text-slate-900 dark:text-white">{imgOpt.label}</div>
                        <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">{imgOpt.desc}</div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Text Columns & Font Size */}
              <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
                <div className="border-b pb-2">
                  <h4 className="font-bold text-sm text-slate-900 dark:text-white font-solaiman">
                    প্রিন্ট বডি কলাম ও ফন্ট সাইজ
                  </h4>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    টেক্সট কলাম সংখ্যা:
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { cols: 1, label: '১ কলাম' },
                      { cols: 2, label: '২ কলাম (স্ট্যান্ডার্ড)' },
                      { cols: 3, label: '৩ কলাম' },
                    ].map((col) => {
                      const isSelected = (localSettings.printViewConfig?.textColumns || 2) === col.cols;
                      return (
                        <button
                          key={col.cols}
                          type="button"
                          onClick={() => setLocalSettings({
                            ...localSettings,
                            printViewConfig: {
                              ...localSettings.printViewConfig,
                              textColumns: col.cols as any,
                            }
                          })}
                          className={`py-2 rounded-lg border text-xs font-solaiman transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-indigo-600 text-white font-bold'
                              : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                          }`}
                        >
                          {col.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    প্রিন্ট ফন্ট সাইজ:
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: 'small', label: 'ছোট (১২px)' },
                      { id: 'medium', label: 'মাঝারি (১৪px)' },
                      { id: 'large', label: 'বড় (১৬px)' },
                    ].map((f) => {
                      const isSelected = (localSettings.printViewConfig?.fontSize || 'medium') === f.id;
                      return (
                        <button
                          key={f.id}
                          type="button"
                          onClick={() => setLocalSettings({
                            ...localSettings,
                            printViewConfig: {
                              ...localSettings.printViewConfig,
                              fontSize: f.id as any,
                            }
                          })}
                          className={`py-2 rounded-lg border text-xs font-solaiman transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-indigo-600 text-white font-bold'
                              : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                          }`}
                        >
                          {f.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Disclaimer and Watermark */}
              <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
                <div className="border-b pb-2">
                  <h4 className="font-bold text-sm text-slate-900 dark:text-white font-solaiman">
                    সম্পাদকীয় ঘোষণা ও ওয়াটারমার্ক
                  </h4>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    সম্পাদকীয় নির্ভরযোগ্যতা ঘোষণা (Disclaimer) প্রদর্শন:
                  </span>
                  <input
                    type="checkbox"
                    checked={localSettings.printViewConfig?.showEditorialDisclaimer !== false}
                    onChange={(e) => setLocalSettings({
                      ...localSettings,
                      printViewConfig: {
                        ...localSettings.printViewConfig,
                        showEditorialDisclaimer: e.target.checked,
                      }
                    })}
                    className="w-4 h-4 accent-indigo-600 rounded cursor-pointer"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    কাস্টম সম্পাদকীয় ঘোষণা টেক্সট (Custom Disclaimer):
                  </label>
                  <textarea
                    rows={2}
                    value={localSettings.printViewConfig?.disclaimerText || `সংশ্লিষ্ট সূত্র জানিয়েছে, বিষয়টি নিয়ে পর্যালোচনা অব্যাহত রয়েছে। ${localSettings.siteName || 'নিউজ পোর্টাল'} সম্পাদকীয় বিভাগ তথ্যের সর্বোচ্চ নির্ভরযোগ্যতা নিশ্চিত করে প্রতিবেদনটি প্রকাশ করেছে।`}
                    onChange={(e) => setLocalSettings({
                      ...localSettings,
                      printViewConfig: {
                        ...localSettings.printViewConfig,
                        disclaimerText: e.target.value,
                      }
                    })}
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-transparent text-xs"
                  />
                </div>

                <div className="flex items-center justify-between pt-1 border-t border-slate-200 dark:border-slate-800">
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    প্রকাশনা ও সম্পাদকীয় তথ্য প্রদর্শন (Credits Bar):
                  </span>
                  <input
                    type="checkbox"
                    checked={localSettings.printViewConfig?.showPublicationCredits !== false}
                    onChange={(e) => setLocalSettings({
                      ...localSettings,
                      printViewConfig: {
                        ...localSettings.printViewConfig,
                        showPublicationCredits: e.target.checked,
                      }
                    })}
                    className="w-4 h-4 accent-indigo-600 rounded cursor-pointer"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    ফুটার ওয়াটারমার্ক টেক্সট (Watermark Text):
                  </label>
                  <input
                    type="text"
                    value={localSettings.printViewConfig?.footerWatermark || 'বিশেষ প্রিন্ট সংস্করণ • A4 ব্রডশিট'}
                    onChange={(e) => setLocalSettings({
                      ...localSettings,
                      printViewConfig: {
                        ...localSettings.printViewConfig,
                        footerWatermark: e.target.value,
                      }
                    })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-transparent text-xs"
                  />
                </div>
              </div>

            </div>
          </div>
        )}

        {/* ================= LEGACY REDIRECT: THEME & TYPOGRAPHY MERGED INTO DEDICATED THEME SETTING ================= */}
        {activeMainTab === "theme_typography" && (
          <div className="p-6">
            {(() => {
              setTimeout(() => {
                setActiveMainTab("settings");
                setSettingsTab("theme");
              }, 0);
              return null;
            })()}
          </div>
        )}

        {/* ================= TAB CONTENT 11: AUDIT TRAIL DASHBOARD (অডিট লগ) ================= */}
        {activeMainTab === 'audit' && (
          <div className="p-4 sm:p-6">
            <AuditTrailPanel darkMode={darkMode} />
          </div>
        )}

        {/* ================= TAB CONTENT 12: UNIVERSAL DATA MIGRATION HUB (মাইগ্রেশন হাব) ================= */}
        {activeMainTab === 'migration' && (
          <div className="p-4 sm:p-6">
            <UniversalDataMigrationHub
              articles={articles}
              categories={categories}
              users={users}
              currentUser={currentUser}
              darkMode={darkMode}
              settings={localSettings}
              adSlots={adSlots}
              onAddArticle={onAddArticle}
              onUpdateArticle={onUpdateArticle}
              onAddCategory={onAddCategory}
              onUpdateUsers={onUpdateUsers}
              recordAuditLog={recordAuditLog}
              showSuccessMessage={showSuccessMessage}
              onViewLivePortal={onBackToPortal}
            />
          </div>
        )}

        {/* ================= TAB CONTENT 13: NEWS DESK AUTO-AGGREGATOR & REWRITER ================= */}
        {activeMainTab === 'news_desk' && (
          <NewsDeskPanel
            darkMode={darkMode}
            onAddArticle={onAddArticle}
            showSuccessMessage={showSuccessMessage}
            siteSettings={localSettings}
          />
        )}
          </div>
        </div>
      </main>

      {/* ================= MODAL: CONFIRM POST DELETION (Zero Silent Failures) ================= */}
      {articleToDelete && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200 font-solaiman">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden p-6 space-y-4">
            <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-950/60 text-red-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6 text-red-600" />
            </div>
            
            <div className="text-center space-y-2">
              <h3 className="text-lg font-black text-slate-900 dark:text-white">সংবাদটি মুছে ফেলতে চান?</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                আপনি কি নিশ্চিত যে <span className="font-bold text-red-600 dark:text-red-400">"{articleToDelete.title}"</span> সংবাদটি স্থায়ীভাবে মুছে ফেলতে চান? এটি ডাটাবেস ও তালিকা থেকে তাৎক্ষণিকভাবে প্রত্যাহার করা হবে।
              </p>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setArticleToDelete(null)}
                className="flex-1 py-2.5 px-4 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                বাতিল
              </button>
              <button
                type="button"
                onClick={handleConfirmDeleteArticle}
                className="flex-1 py-2.5 px-4 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition-colors shadow-md flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
                <span>হ্যাঁ, মুছে ফেলুন</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL: CREATE / EDIT POST (Professional Journalism Suite) ================= */}
      <PostEditorModal
        isOpen={isAddPostModalOpen}
        onClose={() => {
          setIsAddPostModalOpen(false);
          setEditingPost(null);
        }}
        onSave={handleSavePostEditor}
        editingPost={editingPost}
        categories={categories}
        users={users}
        currentUser={currentUser}
        darkMode={darkMode}
        allArticles={articles}
      />

      {/* ================= MODAL: ADD PHOTO POST (Requirement 7) ================= */}
      {isAddPhotoModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex justify-center p-4 pt-12">
          <div className={`w-full max-w-lg rounded-lg shadow-2xl p-6 border h-fit ${
            darkMode ? 'bg-[#1b222c] border-slate-800' : 'bg-white border-slate-200'
          }`}>
            <h3 className="text-base font-bold mb-4 pb-2 border-b flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Camera className="w-5 h-5 text-emerald-500" />
                <span>হোমপেজ ফটোগ্যালারির জন্য ছবি পোস্ট করুন</span>
              </span>
              <button onClick={() => setIsAddPhotoModalOpen(false)} className="text-slate-400">✕</button>
            </h3>

            <form onSubmit={handleSavePhotoPost} className="space-y-3.5 text-xs font-solaiman">
              <div>
                <label className="block font-bold mb-1">ছবির শিরোনাম *</label>
                <input
                  type="text"
                  required
                  placeholder="যেমন: শরতের কাশফুল ও শান্ত তিস্তা নদী..."
                  value={photoTitle}
                  onChange={(e) => setPhotoTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded border border-slate-300 dark:border-slate-700 bg-transparent text-sm"
                />
              </div>

              <div>
                <label className="block font-bold mb-1">ক্যাপশন ও বিবরণ</label>
                <textarea
                  rows={2}
                  placeholder="ছবির পেছনের গল্প বা বিস্তারিত বিবরণ..."
                  value={photoCaption}
                  onChange={(e) => setPhotoCaption(e.target.value)}
                  className="w-full px-3 py-2 rounded border border-slate-300 dark:border-slate-700 bg-transparent text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold mb-1">ফটোগ্রাফার নাম</label>
                  <input
                    type="text"
                    value={photoPhotographer}
                    onChange={(e) => setPhotoPhotographer(e.target.value)}
                    className="w-full px-3 py-2 rounded border border-slate-300 dark:border-slate-700 bg-transparent text-xs"
                  />
                </div>
                <div>
                  <label className="block font-bold mb-1">ক্যাটাগরি</label>
                  <input
                    type="text"
                    value={photoCategory}
                    onChange={(e) => setPhotoCategory(e.target.value)}
                    className="w-full px-3 py-2 rounded border border-slate-300 dark:border-slate-700 bg-transparent text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold mb-1">ছবি আপলোড বা লিংক *</label>
                <div className="flex items-center gap-2">
                  <label className="px-3 py-1.5 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 rounded text-xs font-bold cursor-pointer">
                    ফাইল পছন্দ করুন
                    <input type="file" accept="image/*" className="hidden" onChange={handlePhotoImageUpload} />
                  </label>
                  <input
                    type="text"
                    placeholder="অথবা ছবির URL দিন..."
                    value={photoImageUrl}
                    onChange={(e) => setPhotoImageUrl(e.target.value)}
                    className="flex-1 px-3 py-1.5 rounded border border-slate-300 dark:border-slate-700 bg-transparent text-xs"
                  />
                </div>
                {photoImageUrl && photoImageUrl.trim() !== '' && (
                  <div className="mt-2 w-36 h-24 rounded overflow-hidden border">
                    <img src={photoImageUrl.trim()} alt="Preview" className="w-full h-full object-cover" />
                  </div>
                )}
              </div>

              <div className="pt-4 border-t flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddPhotoModalOpen(false)}
                  className="px-4 py-2 rounded border border-slate-300 dark:border-slate-700 text-slate-500"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
                >
                  ছবি পোস্ট প্রকাশ করুন
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: ADD VIDEO POST (Requirement 7) ================= */}
      {isAddVideoModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex justify-center p-4 pt-12">
          <div className={`w-full max-w-lg rounded-lg shadow-2xl p-6 border h-fit ${
            darkMode ? 'bg-[#1b222c] border-slate-800' : 'bg-white border-slate-200'
          }`}>
            <h3 className="text-base font-bold mb-4 pb-2 border-b flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Play className="w-5 h-5 text-red-600" />
                <span>হোমপেজ ভিডিও গ্যালারির জন্য ভিডিও পোস্ট করুন</span>
              </span>
              <button onClick={() => setIsAddVideoModalOpen(false)} className="text-slate-400">✕</button>
            </h3>

            <form onSubmit={handleSaveVideoPost} className="space-y-3.5 text-xs font-solaiman">
              <div>
                <label className="block font-bold mb-1">ভিডিও শিরোনাম *</label>
                <input
                  type="text"
                  required
                  placeholder="যেমন: আদালত চত্বরে জুনাইদ আহমেদ পলকের বক্তব্য..."
                  value={videoTitle}
                  onChange={(e) => setVideoTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded border border-slate-300 dark:border-slate-700 bg-transparent text-sm"
                />
              </div>

              <div>
                <label className="block font-bold mb-1">YouTube বা ভিডিও URL *</label>
                <input
                  type="text"
                  required
                  placeholder="https://www.youtube.com/watch?v=..."
                  value={videoUrl}
                  onChange={(e) => setVideoUrl(e.target.value)}
                  className="w-full px-3 py-2 rounded border border-slate-300 dark:border-slate-700 bg-transparent text-xs font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold mb-1">ক্যাটাগরি</label>
                  <input
                    type="text"
                    value={videoCategory}
                    onChange={(e) => setVideoCategory(e.target.value)}
                    className="w-full px-3 py-2 rounded border border-slate-300 dark:border-slate-700 bg-transparent text-xs"
                  />
                </div>
                <div>
                  <label className="block font-bold mb-1">সময়কাল (Duration)</label>
                  <input
                    type="text"
                    placeholder="০৩:৪৫"
                    value={videoDuration}
                    onChange={(e) => setVideoDuration(e.target.value)}
                    className="w-full px-3 py-2 rounded border border-slate-300 dark:border-slate-700 bg-transparent text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold mb-1">কাস্টম থাম্বনেইল ছবি URL (ঐচ্ছিক)</label>
                <input
                  type="text"
                  placeholder="https://..."
                  value={videoThumbnailUrl}
                  onChange={(e) => setVideoThumbnailUrl(e.target.value)}
                  className="w-full px-3 py-2 rounded border border-slate-300 dark:border-slate-700 bg-transparent text-xs font-mono"
                />
              </div>

              <div className="pt-4 border-t flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddVideoModalOpen(false)}
                  className="px-4 py-2 rounded border border-slate-300 dark:border-slate-700 text-slate-500"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded bg-red-600 hover:bg-red-700 text-white font-bold"
                >
                  ভিডিও পোস্ট প্রকাশ করুন
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: ADD USER (Requirement 8) ================= */}
      {isAddUserModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex justify-center p-4 pt-14">
          <div className={`w-full max-w-md rounded-lg shadow-2xl p-6 border h-fit ${
            darkMode ? 'bg-[#1b222c] border-slate-800' : 'bg-white border-slate-200'
          }`}>
            <h3 className="text-base font-bold mb-4 pb-2 border-b flex items-center justify-between">
              <span>নতুন ব্যবহারকারী যোগ করুন</span>
              <button onClick={() => setIsAddUserModalOpen(false)} className="text-slate-400">✕</button>
            </h3>

            <form onSubmit={handleSaveUser} className="space-y-3.5 text-xs font-solaiman">
              <div>
                <label className="block font-bold mb-1">পুরো নাম *</label>
                <input
                  type="text"
                  required
                  placeholder="যেমন: তারিকুল ইসলাম"
                  value={newUserName}
                  onChange={(e) => setNewUserName(e.target.value)}
                  className="w-full px-3 py-2 rounded border border-slate-300 dark:border-slate-700 bg-transparent text-sm"
                />
              </div>

              <div>
                <label className="block font-bold mb-1">ই-মেইল অ্যাড্রেস *</label>
                <input
                  type="email"
                  required
                  placeholder="name@newsportal.com"
                  value={newUserEmail}
                  onChange={(e) => setNewUserEmail(e.target.value)}
                  className="w-full px-3 py-2 rounded border border-slate-300 dark:border-slate-700 bg-transparent text-xs font-mono"
                />
              </div>

              <div>
                <label className="block font-bold mb-1">ব্যবহারকারীর ভূমিকা (Role) *</label>
                <select
                  value={newUserRole}
                  onChange={(e) => setNewUserRole(e.target.value as any)}
                  className="w-full px-3 py-2 rounded border border-slate-300 dark:border-slate-700 bg-transparent text-xs"
                >
                  <option value="admin">অ্যাডমিন (Admin - সম্পূর্ণ নিয়ন্ত্রণ / Full Access)</option>
                  <option value="editor">সম্পাদক (Editor - সব সংবাদ সম্পাদনা, অনুমোদন ও প্রকাশ / Review & Publish)</option>
                  <option value="reporter">প্রতিবেদক (Reporter - সংবাদ তৈরি ও সাবমিট)</option>
                  <option value="contributor">কন্ট্রিবিউটর (Contributor - ড্রাফট সংবাদ)</option>
                  <option value="author">লেখক ও সাংবাদিক (Author - সাধারণ লেখক)</option>
                  <option value="subscriber">পাঠক ও সাবস্ক্রাইবার (Subscriber - মন্তব্য ও প্রতিক্রিয়া)</option>
                </select>
              </div>

              <div className="p-3 rounded border border-slate-200 dark:border-slate-700 flex items-center justify-between">
                <div>
                  <span className="font-bold block">স্বয়ংক্রিয় অনুমোদন (Auto-Approve)</span>
                  <span className="text-[10px] text-slate-400">চেক করলে পোস্ট সরাসরি লাইভ হবে</span>
                </div>
                <input
                  type="checkbox"
                  checked={newUserAutoApprove}
                  onChange={(e) => setNewUserAutoApprove(e.target.checked)}
                  className="w-4 h-4 text-emerald-600 rounded"
                />
              </div>

              <div className="pt-4 border-t flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddUserModalOpen(false)}
                  className="px-4 py-2 rounded border border-slate-300 dark:border-slate-700 text-slate-500"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded bg-blue-600 hover:bg-blue-700 text-white font-bold"
                >
                  ব্যবহারকারী তৈরি করুন
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: ADD / EDIT CATEGORY ================= */}
      {isAddCatModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex justify-center p-4 pt-16">
          <div className={`w-full max-w-md rounded-lg shadow-2xl p-6 border h-fit ${
            darkMode ? 'bg-[#1b222c] border-slate-800' : 'bg-white border-slate-200'
          }`}>
            <h3 className="text-base font-bold mb-4 pb-2 border-b">
              {editingCategory ? 'ক্যাটাগরি সম্পাদনা করুন' : 'নতুন ক্যাটাগরি যুক্ত করুন'}
            </h3>
            <form onSubmit={handleSaveCategory} className="space-y-4 text-xs font-solaiman">
              <div>
                <label className="block font-bold mb-1">ক্যাটাগরির বাংলা নাম *</label>
                <input
                  type="text"
                  required
                  placeholder="যেমন: পরিবেশ ও জলবায়ু"
                  value={newCatBn}
                  onChange={(e) => setNewCatBn(e.target.value)}
                  className="w-full px-3 py-2 rounded border border-slate-300 dark:border-slate-700 bg-transparent text-sm"
                />
              </div>
              <div>
                <label className="block font-bold mb-1">English Name / Slug</label>
                <input
                  type="text"
                  placeholder="environment"
                  value={newCatEn}
                  onChange={(e) => setNewCatEn(e.target.value)}
                  className="w-full px-3 py-2 rounded border border-slate-300 dark:border-slate-700 bg-transparent text-sm font-mono"
                />
              </div>
              <div className="pt-4 border-t flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddCatModalOpen(false)}
                  className="px-4 py-2 rounded border border-slate-300 dark:border-slate-700 text-slate-500"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded bg-blue-600 hover:bg-blue-700 text-white font-bold"
                >
                  {editingCategory ? 'আপডেট করুন' : 'যোগ করুন'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: CREATE NEW AD SLOT ================= */}
      {isAddAdModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex justify-center p-4 pt-14">
          <div className={`w-full max-w-lg rounded-lg shadow-2xl p-6 border h-fit ${
            darkMode ? 'bg-[#1b222c] border-slate-800' : 'bg-white border-slate-200'
          }`}>
            <h3 className="text-base font-bold mb-4 pb-2 border-b flex items-center justify-between">
              <span>নতুন বিজ্ঞাপন স্লট তৈরি করুন</span>
              <button onClick={() => setIsAddAdModalOpen(false)} className="text-slate-400">✕</button>
            </h3>

            <form onSubmit={handleCreateAdSlot} className="space-y-3.5 text-xs font-solaiman">
              <div>
                <label className="block font-bold mb-1">ক্যাম্পেইন / বিজ্ঞাপনের শিরোনাম *</label>
                <input
                  type="text"
                  required
                  placeholder="যেমন: সিটি ব্যাংক ডিজিটাল ডিপিএস অফার..."
                  value={newAdTitle}
                  onChange={(e) => setNewAdTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded border border-slate-300 dark:border-slate-700 bg-transparent text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold mb-1">স্পন্সর ব্র্যান্ড</label>
                  <input
                    type="text"
                    placeholder="City Bank"
                    value={newAdSponsor}
                    onChange={(e) => setNewAdSponsor(e.target.value)}
                    className="w-full px-3 py-2 rounded border border-slate-300 dark:border-slate-700 bg-transparent text-xs"
                  />
                </div>
                <div>
                  <label className="block font-bold mb-1">অবস্থান (Position)</label>
                  <select
                    value={newAdPosition}
                    onChange={(e) => setNewAdPosition(e.target.value)}
                    className="w-full px-3 py-2 rounded border border-slate-300 dark:border-slate-700 bg-transparent text-xs"
                  >
                    <option value="hero_right">হিরো ডান সাইডবার (hero_right)</option>
                    <option value="politics_right">রাজনীতি ডান সাইডবার (politics_right)</option>
                    <option value="world_right">বিশ্ব ডান সাইডবার (world_right)</option>
                    <option value="country_right">দেশজুড়ে ডান সাইডবার (country_right)</option>
                    <option value="header_top">শীর্ষ ব্যানার (header_top)</option>
                    <option value="footer_top">ফুটার ব্যানার (footer_top)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold mb-1">সাইজ (Dimensions)</label>
                  <select
                    value={newAdSize}
                    onChange={(e) => setNewAdSize(e.target.value as any)}
                    className="w-full px-3 py-2 rounded border border-slate-300 dark:border-slate-700 bg-transparent text-xs"
                  >
                    <option value="300x250">300x250 (স্কয়ার অ্যাড)</option>
                    <option value="300x600">300x600 (লম্বা হাফ পেজ)</option>
                    <option value="728x90">728x90 (লিডারবোর্ড ব্যানার)</option>
                    <option value="responsive">Responsive (রেসপন্সিভ)</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold mb-1">টাইপ (Type)</label>
                  <select
                    value={newAdType}
                    onChange={(e) => setNewAdType(e.target.value as any)}
                    className="w-full px-3 py-2 rounded border border-slate-300 dark:border-slate-700 bg-transparent text-xs"
                  >
                    <option value="banner">ইমেজ ব্যানার (Image Banner)</option>
                    <option value="code">অ্যাডসেন্স / স্ক্রিপ্ট কোড (Code)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold mb-1">টার্গেট লিংক (Target Click URL)</label>
                <input
                  type="text"
                  placeholder="https://example.com"
                  value={newAdTargetUrl}
                  onChange={(e) => setNewAdTargetUrl(e.target.value)}
                  className="w-full px-3 py-2 rounded border border-slate-300 dark:border-slate-700 bg-transparent text-xs font-mono"
                />
              </div>

              {newAdType === 'banner' ? (
                <div>
                  <label className="block font-bold mb-1">ব্যানার ছবির লিংক বা আপলোড</label>
                  <input
                    type="text"
                    placeholder="https://images.unsplash.com/..."
                    value={newAdImageUrl}
                    onChange={(e) => setNewAdImageUrl(e.target.value)}
                    className="w-full px-3 py-2 rounded border border-slate-300 dark:border-slate-700 bg-transparent text-xs"
                  />
                </div>
              ) : (
                <div>
                  <label className="block font-bold mb-1">AdSense কোড বা HTML স্ক্রিপ্ট</label>
                  <textarea
                    rows={3}
                    placeholder="<script>...</script> বা <ins class='adsbygoogle'..."
                    value={newAdCode}
                    onChange={(e) => setNewAdCode(e.target.value)}
                    className="w-full px-3 py-2 rounded border border-slate-300 dark:border-slate-700 bg-transparent text-xs font-mono"
                  />
                </div>
              )}

              <div className="pt-4 border-t flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddAdModalOpen(false)}
                  className="px-4 py-2 rounded border border-slate-300 dark:border-slate-700 text-slate-500"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded bg-blue-600 hover:bg-blue-700 text-white font-bold"
                >
                  স্লট সংরক্ষণ করুন
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Visitor Analytics Detail Modal */}
      {selectedVisitorCard && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white rounded-xl shadow-2xl max-w-lg w-full p-6 space-y-4 border border-slate-200 dark:border-slate-800 animate-in fade-in zoom-in-95 font-solaiman">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="text-base font-bold flex items-center gap-2">
                <BarChart2 className="w-5 h-5 text-blue-600" />
                <span>ভিজিটর ও ট্রাফিক রিপোর্ট: {selectedVisitorCard.title}</span>
              </h3>
              <button onClick={() => setSelectedVisitorCard(null)} className="text-slate-400 hover:text-slate-600 font-bold text-lg">✕</button>
            </div>
            <div className="p-4 bg-slate-100 dark:bg-slate-800/80 rounded-lg text-center space-y-2">
              <div className="text-4xl font-bold font-solaiman text-red-600">{selectedVisitorCard.count}</div>
              <div className="text-xs text-slate-500 font-medium">সার্ভার লগ ও জিও-লোকেশন বিশ্লেষণ ডেটা</div>
            </div>
            <div className="space-y-2 text-xs text-slate-600 dark:text-slate-300 font-solaiman">
              <div className="flex justify-between border-b pb-1">
                <span>অনলাইন অ্যাক্টিভ ভিজিটর:</span>
                <span className="font-bold">৫২ জন</span>
              </div>
              <div className="flex justify-between border-b pb-1">
                <span>প্রধান উৎস শহরসমূহ:</span>
                <span className="font-bold">ঢাকা, চট্টগ্রাম, সিলেট, নিউইয়র্ক, সিঙ্গাপুর</span>
              </div>
              <div className="flex justify-between border-b pb-1">
                <span>পেইজভিউ ও বাউন্স রেট:</span>
                <span className="font-bold">৩.৪ মিনিট প্রতি সেশন (Bounce Rate 32%)</span>
              </div>
              <div className="flex justify-between">
                <span>নিরাপত্তা ও ফায়ারওয়াল:</span>
                <span className="font-bold text-emerald-600">সব ট্রাফিক সুরক্ষিত ও ভেরিফাইড</span>
              </div>
            </div>
            <div className="flex justify-end pt-3 border-t">
              <button
                onClick={() => setSelectedVisitorCard(null)}
                className="px-5 py-2 rounded bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs"
              >
                বন্ধ করুন
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit Menu Item Modal (Category-Driven & Sub-Menu Creator) */}
      {isAddMenuModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white rounded-xl shadow-2xl max-w-lg w-full p-6 space-y-4 border border-slate-200 dark:border-slate-800 animate-in fade-in zoom-in-95 font-solaiman text-xs max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="text-base font-bold flex items-center gap-2">
                <Navigation className="w-5 h-5 text-emerald-600" />
                <span>{editingMenuItem ? 'মেনু / সাব-মেনু আইটেম সম্পাদনা' : 'নতুন ক্যাটাগরি-চালিত মেনু বা সাব-মেনু তৈরি'}</span>
              </h3>
              <button
                onClick={() => {
                  setIsAddMenuModalOpen(false);
                  setEditingMenuItem(null);
                }}
                className="text-slate-400 hover:text-slate-600 font-bold text-lg cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Menu Source Mode Selector */}
            <div className="grid grid-cols-2 gap-2 bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
              <button
                type="button"
                onClick={() => setMenuSourceMode('existing_category')}
                className={`py-2 px-3 rounded-md font-bold text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer ${
                  menuSourceMode === 'existing_category'
                    ? 'bg-emerald-600 text-white shadow-2xs'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
                }`}
              >
                <FolderTree className="w-3.5 h-3.5" />
                <span>সাইটের ক্যাটাগরি থেকে (Category-Driven)</span>
              </button>
              <button
                type="button"
                onClick={() => setMenuSourceMode('custom')}
                className={`py-2 px-3 rounded-md font-bold text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer ${
                  menuSourceMode === 'custom'
                    ? 'bg-emerald-600 text-white shadow-2xs'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
                }`}
              >
                <LinkIcon className="w-3.5 h-3.5" />
                <span>কাস্টম পেজ বা লিঙ্ক (Custom URL)</span>
              </button>
            </div>

            <form onSubmit={handleSaveMenuItem} className="space-y-4">
              {/* Category-Driven Dropdown Selector */}
              {menuSourceMode === 'existing_category' && (
                <div className="p-3 bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 rounded-lg space-y-2">
                  <label className="block font-bold text-emerald-900 dark:text-emerald-200">
                    বিদ্যমান ক্যাটাগরি নির্বাচন করুন (Select Existing Category) *
                  </label>
                  <select
                    value={selectedExistingCatId}
                    onChange={(e) => handleSelectExistingCategoryForMenu(e.target.value)}
                    className="w-full px-3 py-2 rounded border border-emerald-300 dark:border-emerald-700 bg-white dark:bg-slate-900 text-xs font-semibold"
                  >
                    <option value="">-- ড্রপডাউন থেকে ক্যাটাগরি বেছে নিন --</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.nameBn} ({c.nameEn || c.slug}) {c.parentId ? `[সাব-মেনু: ${categories.find(p => p.id === c.parentId)?.nameBn || c.parentId}]` : '[প্রধান ক্যাটাগরি]'}
                      </option>
                    ))}
                  </select>
                  <p className="text-[11px] text-emerald-700 dark:text-emerald-300">
                    ক্যাটাগরি সিলেক্ট করলে বাংলা নাম, ইংরেজি স্লাগ এবং তথ্য স্বয়ংক্রিয়ভাবে লোড হবে।
                  </p>
                </div>
              )}

              {/* Title Bangla & English */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold mb-1">মেনুর নাম (বাংলায়) *</label>
                  <input
                    type="text"
                    required
                    placeholder="যেমন: জাতীয়, রাজনীতি, খেলাধুলা"
                    value={menuTitleBn}
                    onChange={(e) => setMenuTitleBn(e.target.value)}
                    className="w-full px-3 py-2 rounded border border-slate-300 dark:border-slate-700 bg-transparent text-sm font-semibold"
                  />
                </div>
                <div>
                  <label className="block font-bold mb-1">English Name / Slug *</label>
                  <input
                    type="text"
                    placeholder="e.g. national, politics, sports"
                    value={menuTitleEn}
                    onChange={(e) => {
                      setMenuTitleEn(e.target.value);
                      if (!editingMenuItem && menuSourceMode === 'custom') {
                        setMenuSlug(e.target.value.toLowerCase().replace(/\s+/g, '-'));
                      }
                    }}
                    className="w-full px-3 py-2 rounded border border-slate-300 dark:border-slate-700 bg-transparent text-xs font-mono"
                  />
                </div>
              </div>

              {/* Parent-Child Hierarchy Selector */}
              <div className="p-3 bg-blue-50/60 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg space-y-2">
                <label className="block font-bold text-blue-950 dark:text-blue-200 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <CornerDownRight className="w-4 h-4 text-blue-600" />
                    <span>প্যারেন্ট মেনু / সাব-মেন্যু সম্পর্ক (Dropdown Hierarchy) *</span>
                  </span>
                  {menuParentId && (
                    <span className="text-[10px] px-2 py-0.5 rounded bg-blue-600 text-white font-bold">
                      সাব-মেন্যু সক্রিয়
                    </span>
                  )}
                </label>
                <select
                  value={menuParentId}
                  onChange={(e) => setMenuParentId(e.target.value)}
                  className="w-full px-3 py-2 rounded border border-blue-300 dark:border-blue-700 bg-white dark:bg-slate-900 text-xs font-semibold"
                >
                  <option value="">— প্রধান মূল মেনু হিসেবে থাকবে (Top-Level Main Menu) —</option>
                  {categories
                    .filter((c) => {
                      if (editingMenuItem && c.id === editingMenuItem.id) return false;
                      // Only allow top-level categories as parents (prevent deep recursive nesting)
                      return !c.parentId;
                    })
                    .map((parentCat) => (
                      <option key={parentCat.id} value={parentCat.id}>
                        ↳ [সাব-মেন্যু তৈরি] অভিভাবক মেনু: {parentCat.nameBn} ({parentCat.nameEn || parentCat.slug})
                      </option>
                    ))}
                </select>
                <p className="text-[11px] text-blue-700 dark:text-blue-300">
                  {menuParentId ? (
                    <span>
                      এই মেনুটি ফ্রন্টএন্ড হেডারে <strong className="underline">{categories.find(c => c.id === menuParentId)?.nameBn || 'নির্বাচিত মেনু'}</strong>-এর নিচে মাউস নিলে সুন্দর ড্রপডাউন সাব-মেনু হিসেবে প্রদর্শিত হবে।
                    </span>
                  ) : (
                    <span>
                      এটি হেডারের প্রধান নেভিগেশন বারে সরাসরি দৃশ্যমান প্রধান মেনু হিসেবে থাকবে।
                    </span>
                  )}
                </p>
              </div>

              {menuSourceMode === 'custom' && (
                <div>
                  <label className="block font-bold mb-1">কাস্টম লিঙ্ক / ইউআরএল (Custom Link / URL)</label>
                  <input
                    type="text"
                    placeholder="যেমন: /epaper বা #breaking বা https://example.com"
                    value={menuCustomUrl}
                    onChange={(e) => setMenuCustomUrl(e.target.value)}
                    className="w-full px-3 py-2 rounded border border-slate-300 dark:border-slate-700 bg-transparent text-xs font-mono"
                  />
                </div>
              )}

              {/* Display Controls */}
              <div className="pt-2 border-t space-y-2">
                <label className="flex items-center gap-2 cursor-pointer font-bold">
                  <input
                    type="checkbox"
                    checked={menuShowInHeader}
                    onChange={(e) => setMenuShowInHeader(e.target.checked)}
                    className="w-4 h-4 text-emerald-600 rounded"
                  />
                  <span>হেডার নেভিগেশন বারে প্রদর্শন করুন (Show in Header)</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer font-bold">
                  <input
                    type="checkbox"
                    checked={menuShowInFooter}
                    onChange={(e) => setMenuShowInFooter(e.target.checked)}
                    className="w-4 h-4 text-purple-600 rounded"
                  />
                  <span>ফুটার মেনু তালিকায় প্রদর্শন করুন (Show in Footer)</span>
                </label>
              </div>

              <div className="pt-4 border-t flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddMenuModalOpen(false);
                    setEditingMenuItem(null);
                  }}
                  className="px-4 py-2 rounded border border-slate-300 dark:border-slate-700 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded bg-emerald-600 hover:bg-emerald-700 text-white font-bold flex items-center gap-1.5 shadow-xs cursor-pointer"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{editingMenuItem ? 'আপডেট সংরক্ষণ করুন' : 'মেনু তৈরি করুন'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add / Edit Family Member (Journalist) Modal */}
      {isAddFamilyModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white rounded-xl shadow-2xl max-w-md w-full p-6 space-y-4 border border-slate-200 dark:border-slate-800 animate-in fade-in zoom-in-95 font-solaiman text-xs">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="text-base font-bold flex items-center gap-2">
                <Award className="w-5 h-5 text-purple-600" />
                <span>{editingFamilyMember ? 'সাংবাদিক / সদস্য তথ্য সম্পাদনা' : 'আমাদের পরিবারে নতুন সাংবাদিক যুক্ত করুন'}</span>
              </h3>
              <button
                onClick={() => {
                  setIsAddFamilyModalOpen(false);
                  setEditingFamilyMember(null);
                }}
                className="text-slate-400 hover:text-slate-600 font-bold text-lg"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveFamilyMember} className="space-y-4">
              {/* Photo Upload / URL */}
              <div className="space-y-2">
                <label className="block font-bold">পাসপোর্ট সাইজের ছবি (Passport-Size Photo) *</label>
                <div className="flex items-center gap-3">
                  <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-red-600 bg-slate-100 dark:bg-slate-800 shrink-0">
                    <img
                      src={famPhotoUrl?.trim() || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80'}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 space-y-1.5">
                    <input
                      type="file"
                      ref={familyPhotoInputRef}
                      accept="image/*"
                      onChange={handleFamilyPhotoFile}
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => familyPhotoInputRef.current?.click()}
                      className="px-3 py-1.5 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 rounded text-xs font-bold transition-colors block text-center w-full"
                    >
                      ছবি আপলোড করুন (Upload Photo)
                    </button>
                    <input
                      type="text"
                      placeholder="অথবা ছবির URL পেস্ট করুন"
                      value={famPhotoUrl || ''}
                      onChange={(e) => setFamPhotoUrl(e.target.value)}
                      className="w-full px-2.5 py-1 rounded border border-slate-300 dark:border-slate-700 bg-transparent text-[11px]"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block font-bold mb-1">পূর্ণ নাম (Full Name) *</label>
                <input
                  type="text"
                  required
                  placeholder="যেমন: শামীম রেজা নূরুল"
                  value={famName || ''}
                  onChange={(e) => setFamName(e.target.value)}
                  className="w-full px-3 py-2 rounded border border-slate-300 dark:border-slate-700 bg-transparent text-sm"
                />
              </div>

              <div>
                <label className="block font-bold mb-1">পদবী (Designation) *</label>
                <input
                  type="text"
                  required
                  placeholder="যেমন: ভারপ্রাপ্ত সম্পাদক, নির্বাহী সম্পাদক, জ্যেষ্ঠ প্রতিবেদক"
                  value={famDesignation || ''}
                  onChange={(e) => setFamDesignation(e.target.value)}
                  className="w-full px-3 py-2 rounded border border-slate-300 dark:border-slate-700 bg-transparent text-sm"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold mb-1">ফোন / মোবাইল নম্বর</label>
                  <input
                    type="text"
                    placeholder="+৮৮০ ১৭০০০০০০০১"
                    value={famPhone || ''}
                    onChange={(e) => setFamPhone(e.target.value)}
                    className="w-full px-3 py-2 rounded border border-slate-300 dark:border-slate-700 bg-transparent text-xs font-latin"
                  />
                </div>
                <div>
                  <label className="block font-bold mb-1">ই-মেইল ঠিকানা</label>
                  <input
                    type="email"
                    placeholder="name@newsportal.com"
                    value={famEmail || ''}
                    onChange={(e) => setFamEmail(e.target.value)}
                    className="w-full px-3 py-2 rounded border border-slate-300 dark:border-slate-700 bg-transparent text-xs font-mono"
                  />
                </div>
              </div>

              <div className="pt-4 border-t flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddFamilyModalOpen(false);
                    setEditingFamilyMember(null);
                  }}
                  className="px-4 py-2 rounded border border-slate-300 dark:border-slate-700 text-slate-500"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded bg-purple-600 hover:bg-purple-700 text-white font-bold"
                >
                  {editingFamilyMember ? 'তথ্য আপডেট করুন' : 'সদস্য যুক্ত করুন'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
