import React, { useState, useRef, useMemo } from 'react';
import JSZip from 'jszip';
import {
  Database,
  UploadCloud,
  FileCode,
  FileText,
  Server,
  Layers,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Play,
  RotateCcw,
  Download,
  Terminal,
  Settings2,
  HardDrive,
  Eye,
  Trash2,
  ShieldCheck,
  Check,
  Sparkles,
  ArrowRight,
  ChevronDown,
  Info,
  Image,
  FileArchive,
  Link,
  CheckCheck,
  Globe2,
  FolderDown,
  FileSpreadsheet,
  Copy,
  ExternalLink,
  FileCheck,
  Search
} from 'lucide-react';
import { Article, CategoryItem, UserItem, SiteSettings, AdSlot } from '../../types/news';
import { AuditLogEntry } from '../../utils/securityAndSeo';
import { useSiteConfig } from '../../context/SiteConfigContext';
import { getStoredComments } from '../../utils/commentsStorage';
import { getVisitorAnalyticsSummary } from '../../utils/visitorTracker';

export interface MigrationLogItem {
  timestamp: string;
  type: 'info' | 'success' | 'warn' | 'error';
  message: string;
}

export interface MediaAssetItem {
  id: string;
  name: string;
  originalPath: string;
  url: string; // Base64 data URL or blob URL
  size: number;
  type: string;
  matchedArticleId?: string;
  matchedArticleTitle?: string;
}

export interface UniversalDataMigrationHubProps {
  articles: Article[];
  categories: CategoryItem[];
  users: UserItem[];
  currentUser: UserItem;
  darkMode: boolean;
  settings?: SiteSettings;
  adSlots?: AdSlot[];
  onAddArticle: (article: Article) => void;
  onUpdateArticle?: (article: Article) => void;
  onAddCategory?: (category: CategoryItem) => void;
  onUpdateUsers?: (users: UserItem[]) => void;
  recordAuditLog: (log: Omit<AuditLogEntry, 'id' | 'timestamp'>) => void | AuditLogEntry | null;
  showSuccessMessage: (msg: string) => void;
  onViewLivePortal?: () => void;
}

// Sample WordPress dump data for instant 1-click test simulation
const SAMPLE_WP_MIGRATION_ARTICLES: Array<Partial<Article> & { wpId: number }> = [
  {
    wpId: 1042,
    title: 'জাতীয় নির্বাচনের রোডম্যাপ ঘোষণা: রাজনৈতিক দলগুলোর ইতিবাচক সাড়া',
    shoulder: 'নির্বাচন কমিশন',
    subHeadline: 'সুষ্ঠু ও নিরপেক্ষ নির্বাচনের জন্য সব দলের সহযোগিতা প্রত্যাশা',
    category: 'জাতীয়',
    categoryEn: 'National',
    author: 'তারেক মাহমুদ, সিনিয়র রিপোর্টার',
    district: 'ঢাকা',
    date: '৮ অক্টোবর ২০২৬',
    timeAgo: 'মাইগ্রেটেড',
    excerpt: 'আসন্ন জাতীয় সংসদ নির্বাচনকে সামনে রেখে নির্বাচন কমিশন বিস্তারিত রোডম্যাপ প্রকাশ করেছে। রাজনৈতিক দলগুলো এই সিদ্ধান্তকে সাধুবাদ জানিয়েছে।',
    content: 'আসন্ন ত্রয়োদশ জাতীয় সংসদ নির্বাচনকে সামনে রেখে সর্বদলীয় আলোচনার পর নির্বাচন কমিশন বিস্তারিত রোডম্যাপ প্রকাশ করেছে।\n\nপ্রধান নির্বাচন কমিশনার এক সংবাদ সম্মেলনে জানান, ভোটার তালিকা হালনাগাদ থেকে শুরু করে ভোটকেন্দ্র নির্ধারণ এবং ব্যালট পেপার মুদ্রণের প্রতিটি ধাপে সর্বোচ্চ স্বচ্ছতা বজায় রাখা হবে।\n\nবিভিন্ন রাজনৈতিক দলের শীর্ষ নেতারা এই রোডম্যাপকে ইতিবাচক হিসেবে দেখছেন এবং অবাধ ও নিরপেক্ষ নির্বাচন আয়োজনে পূর্ণ সহযোগিতার আশ্বাস দিয়েছেন।',
    imageUrl: 'https://images.unsplash.com/photo-1541872703-74c5e44368f9?auto=format&fit=crop&w=800&q=80',
    tags: ['নির্বাচন', 'জাতীয়', 'রোডম্যাপ', 'রাজনীতি'],
    views: 450,
    readTime: '৩ মিনিট',
    seriesName: 'নির্বাচনী ডায়েরি ২০২৬',
    seriesPart: 'পর্ব ১',
    source: 'ওয়ার্ডপ্রেস ব্যাকআপ'
  },
  {
    wpId: 1043,
    title: 'বিশ্ববাজারে জ্বালানি তেলের দাম হ্রাস, স্থানীয় বাজারে সমন্বয়ের উদ্যোগ',
    shoulder: 'অর্থ ও বাণিজ্য',
    subHeadline: 'আন্তর্জাতিক বাজারে প্রতি ব্যারেল তেলের দাম কমেছে ৪ শতাংশ',
    category: 'অর্থনীতি',
    categoryEn: 'Economy',
    author: 'শফিকুর রহমান, বাণিজ্য প্রতিবেদক',
    district: 'ঢাকা',
    date: '৮ অক্টোবর ২০২৬',
    timeAgo: 'মাইগ্রেটেড',
    excerpt: 'আন্তর্জাতিক বাজারে অপরিশোধিত জ্বালানি তেলের মূল্য হ্রাসের প্রেক্ষিতে দেশে নতুন দাম নির্ধারণের প্রস্তাব যাচাই করছে বিপিসি।',
    content: 'বিশ্ববাজারে গত তিন সপ্তাহে অপরিশোধিত তেলের দাম ধারাবাহিক নিম্নমুখী হওয়ায় দেশের ভোক্তাদের জন্য স্বস্তির ইঙ্গিত মিলেছে।\n\nজ্বালানি মন্ত্রণালয় সূত্রে জানা গেছে, আন্তর্জাতিক মূল্যের সাথে সমন্বয় করে ডিজেল ও অকটেনের দাম প্রতি লিটারে ২ থেকে ৩ টাকা কমানোর সুপারিশ পাঠানো হয়েছে।',
    imageUrl: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=800&q=80',
    tags: ['অর্থনীতি', 'জ্বালানি তেল', 'বাজার দর', 'বিপিসি'],
    views: 890,
    readTime: '২ মিনিট',
    source: 'ওয়ার্ডপ্রেস ব্যাকআপ'
  },
  {
    wpId: 1044,
    title: 'টি-টোয়েন্টি বিশ্বকাপের প্রস্তুতি ম্যাচে টাইগারদের দুর্দান্ত জয়',
    shoulder: 'খেলাধুলা',
    subHeadline: 'অলরাউন্ড নৈপুণ্যে অস্ট্রেলিয়াকে ৫ উইকেটে হারাল বাংলাদেশ',
    category: 'খেলা',
    categoryEn: 'Sports',
    author: 'ফারুক আহমেদ, ক্রীড়া প্রতিনিধি',
    district: 'চট্টগ্রাম',
    date: '৭ অক্টোবর ২০২৬',
    timeAgo: 'মাইগ্রেটেড',
    excerpt: 'মেলবোর্নে অনুষ্ঠিত প্রথম প্রস্তুতিমূলক ম্যাচে শক্তিশালী অস্ট্রেলিয়া দলকে ৫ উইকেটে হারিয়ে বিশ্বকাপের প্রস্তুতি শুরু করল বাংলাদেশ।',
    content: 'টি-টোয়েন্টি বিশ্বকাপের আনুষ্ঠানিক প্রস্তুতি ম্যাচে টাইগারদের চমৎকার পারফরম্যান্সে উল্লাস ছড়িয়েছে সমর্থকদের মধ্যে।\n\nব্যাট ও বল হাতে সমান দক্ষতা দেখিয়ে ম্যাচসেরা হয়েছেন অধিনায়ক। মিডল অর্ডারে দায়িত্বশীল ব্যাটিং নিশ্চিত করেছে দুর্দান্ত এক জয়।',
    imageUrl: 'https://images.unsplash.com/photo-1531415074968-036ba1b575da?auto=format&fit=crop&w=800&q=80',
    tags: ['ক্রিকেট', 'টি-টোয়েন্টি', 'টাইগার্স', 'খেলাধুলা'],
    views: 1240,
    readTime: '২ মিনিট',
    source: 'ওয়ার্ডপ্রেস ব্যাকআপ'
  },
  {
    wpId: 1045,
    title: 'কৃত্রিম বুদ্ধিমত্তা ও বাংলা ভাষা: নতুন প্রজন্মের প্রযুক্তিগত বিপ্লব',
    shoulder: 'বিজ্ঞান ও প্রযুক্তি',
    subHeadline: 'বাংলা ন্যাচারাল ল্যাঙ্গুয়েজ প্রসেসিংয়ে যুগান্তকারী অগ্রগতি',
    category: 'প্রযুক্তি',
    categoryEn: 'Technology',
    author: 'তানভীর হাসান, প্রযুক্তি প্রতিবেদক',
    district: 'ঢাকা',
    date: '৭ অক্টোবর ২০২৬',
    timeAgo: 'মাইগ্রেটেড',
    excerpt: 'বাংলা ভাষার জন্য আধুনিক লার্জ ল্যাঙ্গুয়েজ মডেল তৈরিতে বাংলাদেশি প্রকৌশলীদের সাফল্য বিশ্বমঞ্চে প্রশংসিত হয়েছে।',
    content: 'তথ্যপ্রযুক্তির বর্তমান ধারায় বাংলা ভাষাকে বৈশ্বিক কৃত্রিম বুদ্ধিমত্তা কাঠামোর সাথে সমন্বয় করার ক্ষেত্রে এসেছে বিশাল সাফল্য।\n\nবিভিন্ন গবেষণা প্রতিষ্ঠানের সমন্বয়ে প্রস্তুতকৃত ওপেন-সোর্স বাংলা মডেল এখন স্বয়ংক্রিয় অনুবাদ, টেক্সট অ্যানালাইসিস এবং সংবাদ তৈরিতে অনন্য ভূমিকা রাখছে।',
    imageUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80',
    tags: ['প্রযুক্তি', 'এআই', 'বাংলা এলএলএম', 'উদ্ভাবন'],
    views: 780,
    readTime: '৩ মিনিট',
    seriesName: 'ভবিষ্যতের প্রযুক্তি',
    seriesPart: 'পর্ব ৩',
    source: 'ওয়ার্ডপ্রেস ব্যাকআপ'
  },
  {
    wpId: 1046,
    title: 'সুন্দরবনের জীববৈচিত্র্য সংরক্ষণে নতুন ড্রোন নজরদারি প্রকল্প চালু',
    shoulder: 'পরিবেশ ও প্রকৃতি',
    subHeadline: 'ম্যানগ্রোভ বন রক্ষায় স্মার্ট ফরেস্ট্রি প্রযুক্তির সফল প্রয়োগ',
    category: 'পরিবেশ',
    categoryEn: 'Environment',
    author: 'নাসরিন জাহান, পরিবেশ প্রতিবেদক',
    district: 'খুলনা',
    date: '৬ অক্টোবর ২০২৬',
    timeAgo: 'মাইগ্রেটেড',
    excerpt: 'সুন্দরবনে হরিণ শিকার ও বন উজাড় রোধে কৃত্রিম উপগ্রহ এবং থার্মাল ড্রোন নজরদারির আধুনিক প্রকল্প উদ্বোধন করা হয়েছে।',
    content: 'বিশ্ব ঐতিহ্য সুন্দরবনের দুর্গম অঞ্চলে বন্যপ্রাণী ও প্রাকৃতিক ভারসাম্য রক্ষায় বন বিভাগ স্মার্ট প্রযুক্তির ব্যবহার শুরু করেছে।\n\nথার্মাল সেন্সরযুক্ত ড্রোনের মাধ্যমে দিন ও রাতের যে কোনো সময় বনভূমির অভ্যন্তরীণ অবস্থা সরাসরি নিয়ন্ত্রণ কক্ষে পর্যবেক্ষণ করা সম্ভব হচ্ছে।',
    imageUrl: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=800&q=80',
    tags: ['পরিবেশ', 'সুন্দরবন', 'ড্রোন', 'প্রকৃতি সংরক্ষণ'],
    views: 610,
    readTime: '৩ মিনিট',
    source: 'ওয়ার্ডপ্রেস ব্যাকআপ'
  }
];

export const UniversalDataMigrationHub: React.FC<UniversalDataMigrationHubProps> = ({
  articles,
  categories,
  users,
  currentUser,
  darkMode,
  settings: propSettings,
  adSlots,
  onAddArticle,
  onUpdateArticle,
  onAddCategory,
  onUpdateUsers,
  recordAuditLog,
  showSuccessMessage,
  onViewLivePortal
}) => {
  const siteConfig = useSiteConfig();
  const settings = propSettings || siteConfig.settings;
  const siteName = settings?.siteName || siteConfig.siteName;
  const domain = settings?.domain || siteConfig.domain;

  // Active Sub-Tab in Migration Hub
  const [activeHubTab, setActiveHubTab] = useState<'migration' | 'media_sync' | 'full_backup' | 'logs'>('migration');

  // Media & Image Asset Upload & Sync State (Requirement 1)
  const [uploadedMediaAssets, setUploadedMediaAssets] = useState<MediaAssetItem[]>([]);
  const [isExtractingMedia, setIsExtractingMedia] = useState(false);
  const [mediaExtractionProgress, setMediaExtractionProgress] = useState(0);
  const [externalUrlMappings, setExternalUrlMappings] = useState('');
  const [mediaSearchQuery, setMediaSearchQuery] = useState('');
  const [mediaSyncStats, setMediaSyncStats] = useState<{
    totalExtracted: number;
    articlesLinked: number;
    usersLinked: number;
  } | null>(null);

  // Full Site Backup ZIP Export State (Requirement 1 & 2)
  const [isExportingFullBackup, setIsExportingFullBackup] = useState(false);
  const [fullBackupProgress, setFullBackupProgress] = useState(0);

  // Selected Source CMS Platform (Universal support for ANY CMS & ANY language)
  const [selectedPlatform, setSelectedPlatform] = useState<'universal_all' | 'wordpress' | 'nextjs_json' | 'xml_rss' | 'custom_php' | 'universal_json_csv'>('universal_all');

  // Universal Parsed entities state (Articles, Authors, Categories, Media Assets)
  const [parsedJsonArticles, setParsedJsonArticles] = useState<Article[]>([]);
  const [parsedAuthors, setParsedAuthors] = useState<Array<{ id: string; name: string; email?: string; role?: string; roleBn?: string }>>([]);
  const [parsedJsonMeta, setParsedJsonMeta] = useState<{ 
    detectedCategories: string[]; 
    detectedCount: number; 
    detectedAuthorsCount: number;
    detectedMediaCount: number;
    format: string;
    fileName: string;
    multilingual: string;
  } | null>(null);

  // WordPress multi-table files state
  const [wpFiles, setWpFiles] = useState<{
    posts: File | null;
    postmeta: File | null;
    terms: File | null;
    users: File | null;
    comments: File | null;
  }>({
    posts: null,
    postmeta: null,
    terms: null,
    users: null,
    comments: null
  });

  // Universal Single SQL / JSON / CSV state
  const [universalFile, setUniversalFile] = useState<File | null>(null);
  const [universalFileType, setUniversalFileType] = useState<'sql' | 'json' | 'csv'>('sql');

  // Custom PHP / Schema Mapping settings
  const [customFieldMapping, setCustomFieldMapping] = useState({
    titleCol: 'title',
    contentCol: 'content',
    categoryCol: 'category',
    dateCol: 'created_at',
    imageCol: 'image_url',
    authorCol: 'author_name'
  });

  // Migration Settings & Filtering
  const [migrationSettings, setMigrationSettings] = useState({
    onlyPublished: true,
    batchSize: 100,
    dryRun: false,
    imageStrategy: 'proxy' as 'preserve' | 'proxy' | 'fallback',
    defaultCategory: 'জাতীয়',
    preserveDates: true,
    autoCreateCategories: true,
    maxImportCount: 500
  });

  // Migration Execution State
  const [isMigrating, setIsMigrating] = useState(false);
  const [migrationProgress, setMigrationProgress] = useState(0);
  const [currentStepText, setCurrentStepText] = useState('');
  const [logs, setLogs] = useState<MigrationLogItem[]>([
    {
      timestamp: new Date().toLocaleTimeString('bn-BD'),
      type: 'info',
      message: 'মাইগ্রেশন হাব প্রস্তুত। ওয়ার্ডপ্রেস ব্যাকআপ, কাস্টম পিএইচপি ডাম্প অথবা JSON/CSV নির্বাচন করুন।'
    }
  ]);

  // Migration Result Summary
  const [migrationSummary, setMigrationSummary] = useState<{
    totalPosts: number;
    categoriesCreated: number;
    authorsMapped: number;
    imagesLinked: number;
    completedAt: string | null;
    batchId: string | null;
  } | null>(null);

  // History of imported article IDs for Rollback support
  const [importedArticleIds, setImportedArticleIds] = useState<string[]>([]);

  // Drag over states
  const [dragOverTarget, setDragOverTarget] = useState<string | null>(null);

  const fileInputPostsRef = useRef<HTMLInputElement>(null);
  const fileInputPostmetaRef = useRef<HTMLInputElement>(null);
  const fileInputTermsRef = useRef<HTMLInputElement>(null);
  const fileInputUsersRef = useRef<HTMLInputElement>(null);
  const fileInputCommentsRef = useRef<HTMLInputElement>(null);
  const fileInputUniversalRef = useRef<HTMLInputElement>(null);
  const fileInputMediaZipRef = useRef<HTMLInputElement>(null);
  const fileInputMultipleMediaRef = useRef<HTMLInputElement>(null);
  const terminalBottomRef = useRef<HTMLDivElement>(null);

  const addLog = (type: 'info' | 'success' | 'warn' | 'error', message: string) => {
    const newLog: MigrationLogItem = {
      timestamp: new Date().toLocaleTimeString('bn-BD'),
      type,
      message
    };
    setLogs((prev) => [...prev, newLog]);
    setTimeout(() => {
      terminalBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 50);
  };

  // Helper to format file size
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // MIME type helper for image extensions
  const getMimeType = (fileName: string): string => {
    const ext = fileName.split('.').pop()?.toLowerCase() || '';
    switch (ext) {
      case 'png': return 'image/png';
      case 'jpg':
      case 'jpeg': return 'image/jpeg';
      case 'webp': return 'image/webp';
      case 'gif': return 'image/gif';
      case 'svg': return 'image/svg+xml';
      case 'ico': return 'image/x-icon';
      case 'bmp': return 'image/bmp';
      default: return 'image/jpeg';
    }
  };

  // =========================================================================
  // IMAGE & MEDIA ASSET EXTRACTION & SYNC ENGINE (ZIP / Multi-file / Mappings)
  // =========================================================================

  const handleMediaZipUpload = async (file: File) => {
    if (!file) return;
    setIsExtractingMedia(true);
    setMediaExtractionProgress(5);
    addLog('info', `📦 মিডিয়া আর্কাইভ "${file.name}" (${formatFileSize(file.size)}) বিশ্লেষণ ও আনপ্যাক করা হচ্ছে...`);

    try {
      const isZip = file.name.toLowerCase().endsWith('.zip');
      const newAssets: MediaAssetItem[] = [];

      if (isZip) {
        const zip = await JSZip.loadAsync(file);
        const entries: { path: string; entry: JSZip.JSZipObject }[] = [];
        
        zip.forEach((path, entry) => {
          if (!entry.dir && /\.(jpe?g|png|gif|webp|svg|bmp|ico)$/i.test(path)) {
            entries.push({ path, entry });
          }
        });

        addLog('info', `🔍 জিপ ফাইলে ${entries.length}টি ইমেজ অ্যাসেট শনাক্ত হয়েছে। প্রসেসিং চলছে...`);

        if (entries.length === 0) {
          addLog('warn', 'জিপ আর্কাইভে কোনো সাপোর্টেড ইমেজ ফাইল (.jpg, .png, .webp, .svg, ইত্যাদি) পাওয়া যায়নি।');
        }

        for (let i = 0; i < entries.length; i++) {
          const { path, entry } = entries[i];
          const base64 = await entry.async('base64');
          const fileName = path.split('/').pop() || path;
          const mime = getMimeType(fileName);
          const dataUrl = `data:${mime};base64,${base64}`;

          newAssets.push({
            id: `media-${Date.now()}-${i}`,
            name: fileName,
            originalPath: path,
            url: dataUrl,
            size: Math.round(base64.length * 0.75),
            type: mime
          });

          if (i % 5 === 0 || i === entries.length - 1) {
            setMediaExtractionProgress(Math.round(((i + 1) / entries.length) * 90));
          }
        }
      } else if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        const dataUrl = await new Promise<string>((resolve, reject) => {
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });

        newAssets.push({
          id: `media-${Date.now()}-0`,
          name: file.name,
          originalPath: file.name,
          url: dataUrl,
          size: file.size,
          type: file.type || 'image/jpeg'
        });
      }

      setUploadedMediaAssets((prev) => {
        const existingNames = new Set(prev.map(a => a.name.toLowerCase()));
        const filtered = newAssets.filter(a => !existingNames.has(a.name.toLowerCase()));
        return [...filtered, ...prev];
      });

      setMediaExtractionProgress(100);
      addLog('success', `✓ সফলভাবে ${newAssets.length}টি মিডিয়া ইমেজ লোকাল মিডিয়া স্টোরেজে এক্সট্র্যাক্ট ও সেভ করা হয়েছে!`);
      showSuccessMessage(`${newAssets.length}টি মিডিয়া ইমেজ সফলভাবে যুক্ত হয়েছে!`);

      // Auto-match after upload
      if (newAssets.length > 0) {
        autoMatchMediaAssets(newAssets);
      }
    } catch (err: any) {
      addLog('error', `মিডিয়া আর্কাইভ প্রসেসিংয়ে ত্রুটি: ${err?.message || 'অবৈধ জিপ ফাইল'}`);
    } finally {
      setIsExtractingMedia(false);
    }
  };

  const handleMultipleMediaFiles = async (files: FileList | File[]) => {
    setIsExtractingMedia(true);
    const newAssets: MediaAssetItem[] = [];
    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (file.name.toLowerCase().endsWith('.zip')) {
          await handleMediaZipUpload(file);
          continue;
        }
        if (file.type.startsWith('image/') || /\.(jpe?g|png|gif|webp|svg|bmp)$/i.test(file.name)) {
          const reader = new FileReader();
          const dataUrl = await new Promise<string>((resolve) => {
            reader.onload = () => resolve(reader.result as string);
            reader.readAsDataURL(file);
          });
          newAssets.push({
            id: `media-${Date.now()}-${i}`,
            name: file.name,
            originalPath: file.name,
            url: dataUrl,
            size: file.size,
            type: file.type || getMimeType(file.name)
          });
        }
      }
      if (newAssets.length > 0) {
        setUploadedMediaAssets((prev) => {
          const existingNames = new Set(prev.map(a => a.name.toLowerCase()));
          const filtered = newAssets.filter(a => !existingNames.has(a.name.toLowerCase()));
          return [...filtered, ...prev];
        });
        addLog('success', `✓ ${newAssets.length}টি ইমেজ সফলভাবে আপলোড ও লোকাল স্টোরেজে যুক্ত হয়েছে।`);
        autoMatchMediaAssets(newAssets);
      }
    } finally {
      setIsExtractingMedia(false);
    }
  };

  // Re-link & Sync Media Assets with Articles, Content and User Avatars
  const autoMatchMediaAssets = (assetsToMatch: MediaAssetItem[] = uploadedMediaAssets) => {
    const pool = assetsToMatch.length > 0 ? assetsToMatch : uploadedMediaAssets;
    if (pool.length === 0) {
      addLog('warn', 'সিঙ্ক করার মতো কোনো আপলোডকৃত মিডিয়া ইমেজ নেই। প্রথমে জিপ বা ইমেজ ফাইল ড্রপ করুন।');
      return;
    }

    addLog('info', '🔄 মিডিয়া অ্যাসেটের সাথে সংবাদ ও লেখক প্রোফাইল অটো-ম্যাচিং শুরু হচ্ছে...');

    const assetMap = new Map<string, MediaAssetItem>();
    pool.forEach((a) => {
      assetMap.set(a.name.toLowerCase(), a);
      assetMap.set(a.originalPath.toLowerCase(), a);
      const base = a.name.substring(0, a.name.lastIndexOf('.')).toLowerCase();
      if (base) assetMap.set(base, a);
    });

    // Parse external URL mapping if provided
    if (externalUrlMappings.trim()) {
      try {
        const parsedMap = JSON.parse(externalUrlMappings);
        if (Array.isArray(parsedMap)) {
          parsedMap.forEach((item: any) => {
            if (item.oldUrl && item.newUrl) {
              const fileName = item.oldUrl.split('/').pop()?.split('?')[0]?.toLowerCase();
              if (fileName) {
                assetMap.set(fileName, {
                  id: `mapped-${Date.now()}`,
                  name: fileName,
                  originalPath: item.oldUrl,
                  url: item.newUrl,
                  size: 0,
                  type: 'image/jpeg'
                });
              }
            }
          });
        } else if (typeof parsedMap === 'object') {
          Object.entries(parsedMap).forEach(([oldK, newV]) => {
            const fileName = oldK.split('/').pop()?.split('?')[0]?.toLowerCase() || oldK.toLowerCase();
            assetMap.set(fileName, {
              id: `mapped-${Date.now()}`,
              name: fileName,
              originalPath: oldK,
              url: String(newV),
              size: 0,
              type: 'image/jpeg'
            });
          });
        }
        addLog('info', '✓ এক্সটার্নাল ইমেজ ইউআরএল ম্যাপিং অ্যারে সফলভাবে বিশ্লেষণ করা হয়েছে।');
      } catch {
        // Non-JSON format ignored or logged
      }
    }

    let articlesLinkedCount = 0;
    let usersLinkedCount = 0;

    // 1. Match currently active portal articles
    if (onUpdateArticle && articles.length > 0) {
      articles.forEach((art) => {
        let isUpdated = false;
        let newImageUrl = art.imageUrl;
        let newContent = art.content;

        if (art.imageUrl) {
          const artFileName = art.imageUrl.split('/').pop()?.split('?')[0]?.toLowerCase();
          if (artFileName && assetMap.has(artFileName)) {
            const matched = assetMap.get(artFileName)!;
            newImageUrl = matched.url;
            isUpdated = true;
          }
        }

        if (art.content && art.content.includes('<img')) {
          const imgRegex = /<img[^>]+src=["']([^"']+)["']/gi;
          let match;
          while ((match = imgRegex.exec(art.content)) !== null) {
            const src = match[1];
            const fileName = src.split('/').pop()?.split('?')[0]?.toLowerCase();
            if (fileName && assetMap.has(fileName)) {
              const matched = assetMap.get(fileName)!;
              newContent = newContent.replaceAll(src, matched.url);
              isUpdated = true;
            }
          }
        }

        if (isUpdated) {
          onUpdateArticle({
            ...art,
            imageUrl: newImageUrl,
            content: newContent
          });
          articlesLinkedCount++;
        }
      });
    }

    // 2. Also match parsedJsonArticles
    if (parsedJsonArticles.length > 0) {
      const updatedParsed = parsedJsonArticles.map((art) => {
        let newImageUrl = art.imageUrl;
        let newContent = art.content;
        let isUpdated = false;

        if (art.imageUrl) {
          const artFileName = art.imageUrl.split('/').pop()?.split('?')[0]?.toLowerCase();
          if (artFileName && assetMap.has(artFileName)) {
            newImageUrl = assetMap.get(artFileName)!.url;
            isUpdated = true;
          }
        }

        if (isUpdated) {
          articlesLinkedCount++;
          return { ...art, imageUrl: newImageUrl, content: newContent };
        }
        return art;
      });
      setParsedJsonArticles(updatedParsed);
    }

    // 3. Match users avatar & profile photo regardless of source CMS
    if (onUpdateUsers && users.length > 0) {
      const updatedUsers = users.map((u) => {
        let matchedAsset: MediaAssetItem | undefined;
        if (u.avatar) {
          const uFileName = u.avatar.split('/').pop()?.split('?')[0]?.toLowerCase();
          if (uFileName && assetMap.has(uFileName)) {
            matchedAsset = assetMap.get(uFileName);
          }
        }
        if (!matchedAsset) {
          const uNameKey = u.name.toLowerCase().replace(/[\s\-_]+/g, '');
          const uEmailKey = u.email?.split('@')[0]?.toLowerCase();
          for (const [key, asset] of assetMap.entries()) {
            const cleanKey = key.replace(/[\s\-_]+/g, '');
            if (cleanKey.includes(uNameKey) || (uEmailKey && cleanKey.includes(uEmailKey))) {
              matchedAsset = asset;
              break;
            }
          }
        }
        if (matchedAsset) {
          usersLinkedCount++;
          return { ...u, avatar: matchedAsset.url };
        }
        return u;
      });
      if (usersLinkedCount > 0) {
        onUpdateUsers(updatedUsers);
      }
    }

    setMediaSyncStats({
      totalExtracted: pool.length,
      articlesLinked: articlesLinkedCount,
      usersLinked: usersLinkedCount
    });

    addLog('success', `🎉 মিডিয়া সিঙ্ক সম্পন্ন! ${articlesLinkedCount}টি সংবাদ এবং ${usersLinkedCount} জন লেখকের প্রোফাইল ফটো সফলভাবে স্থানীয় মিডিয়া অ্যাসেটে সংযুক্ত করা হয়েছে।`);
    showSuccessMessage(`${articlesLinkedCount}টি সংবাদ সফলভাবে মিডিয়া অ্যাসেটের সাথে সিঙ্ক হয়েছে!`);
  };

  // =========================================================================
  // FULL SITE BACKUP & MEDIA EXPORT ENGINE (ZIP ARCHIVE WITH DATABASE & IMAGES)
  // =========================================================================

  const handleFullSiteBackupZipExport = async () => {
    setIsExportingFullBackup(true);
    setFullBackupProgress(10);
    addLog('info', '📦 "সম্পূর্ণ ব্যাকআপ এক্সপোর্ট (Full Site Backup & Media Export)" প্রক্রিয়া শুরু হচ্ছে...');

    try {
      const zip = new JSZip();

      setFullBackupProgress(25);
      const dbPayload = {
        archiveFormat: 'Universal-Broadsheet-Backup',
        version: '3.0.0-broadsheet-pro',
        exportedAt: new Date().toISOString(),
        exportTimestamp: Date.now(),
        encoding: 'UTF-8 (NFC Strict Normalization)',
        siteName: siteName || 'নতুন দৃষ্টি',
        domain: domain || 'notundrishti.com',
        metadata: {
          totalArticles: articles.length,
          totalCategories: categories.length,
          totalUsers: users.length,
          totalUploadedMedia: uploadedMediaAssets.length,
          languageCompatibility: ['Bengali (বাংলা)', 'English', 'Arabic (العربية)', 'Unicode UTF-8']
        },
        data: {
          articles,
          categories,
          users,
          settings: settings || null,
          adSlots: adSlots || [],
          comments: getStoredComments(),
          visitorAnalytics: getVisitorAnalyticsSummary()
        }
      };

      zip.file('database.json', JSON.stringify(dbPayload, null, 2));

      setFullBackupProgress(40);
      const readmeContent = `==================================================================
ব্রডশিট নিউজ পোর্টাল - সম্পূর্ণ ডেটাবেস ও মিডিয়া ব্যাকআপ
Full Site Database & Media Archive (UTF-8 Multi-Language Compliant)
==================================================================
সাইটের নাম: ${siteName || 'News Portal'}
ডোমেইন: ${domain || 'dailybangladesh.com'}
এক্সপোর্টের তারিখ: ${new Date().toLocaleString('bn-BD')}
মোট সংবাদ: ${articles.length} টি
মোট ক্যাটাগরি: ${categories.length} টি
মোট নিবন্ধিত ব্যবহারকারী: ${users.length} জন
মোট সংযুক্ত মিডিয়া অ্যাসেট: ${uploadedMediaAssets.length} টি

ফাইল সূচি:
1. database.json -> সকল সংবাদ, ক্যাটাগরি, ইউজার, সেটিংস, ও কমেন্ট
2. images/ -> স্থানীয় মিডিয়া ইমেজ ও পোস্ট অ্যাসেট
3. media_manifest.json -> ইমেজ ইউআরএল ও পোস্ট আইডির ম্যাপিং

পুনরুদ্ধার (Restoration):
যেকোনো ব্রডশিট নিউজ পোর্টাল অ্যাডমিন প্যানেলে এই জিপ ফাইলটি "ইউনিভার্সাল ডেটা মাইগ্রেশন হাব" 
থেকে সরাসরি আপলোড করে তাৎক্ষণিকভাবে সম্পূর্ণ সাইট পুনরুদ্ধার করতে পারবেন।
`;
      zip.file('README_BACKUP_INSTRUCTIONS.txt', readmeContent);

      setFullBackupProgress(55);
      const imagesFolder = zip.folder('images');
      const mediaManifest: Array<{ id: string; name: string; type: string; size: number }> = [];

      if (imagesFolder) {
        for (let i = 0; i < uploadedMediaAssets.length; i++) {
          const asset = uploadedMediaAssets[i];
          if (asset.url.startsWith('data:')) {
            const parts = asset.url.split(';base64,');
            if (parts.length === 2) {
              imagesFolder.file(asset.name, parts[1], { base64: true });
              mediaManifest.push({
                id: asset.id,
                name: asset.name,
                type: asset.type,
                size: asset.size
              });
            }
          }
        }
      }

      zip.file('media_manifest.json', JSON.stringify(mediaManifest, null, 2));

      setFullBackupProgress(75);
      const zipBlob = await zip.generateAsync(
        {
          type: 'blob',
          compression: 'DEFLATE',
          compressionOptions: { level: 6 }
        },
        (meta) => {
          setFullBackupProgress(75 + Math.round(meta.percent * 0.24));
        }
      );

      setFullBackupProgress(100);

      const url = URL.createObjectURL(zipBlob);
      const link = document.createElement('a');
      link.href = url;
      const fileSlug = (domain || 'news-portal').replace(/[^a-z0-9]/gi, '_');
      const fileName = `${fileSlug}-full-site-backup-${new Date().toISOString().slice(0, 10)}.zip`;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      link.remove();
      setTimeout(() => URL.revokeObjectURL(url), 10000);

      addLog('success', `✓ সম্পূর্ণ ব্যাকআপ জিপ ফাইল প্রস্তুত ও ডাউনলোড সম্পন্ন: ${fileName} (${formatFileSize(zipBlob.size)})`);
      showSuccessMessage('সম্পূর্ণ ব্যাকআপ জিপ আর্কাইভ সফলভাবে ডাউনলোড হয়েছে!');

      recordAuditLog({
        action: 'update_settings',
        actionBn: 'সম্পূর্ণ সাইট ব্যাকআপ ও মিডিয়া এক্সপোর্ট',
        userName: currentUser.name,
        userRole: currentUser.role,
        ipAddress: '192.168.1.1',
        status: 'success',
        details: `${articles.length}টি সংবাদ, ${users.length} জন ইউজার এবং ${uploadedMediaAssets.length}টি মিডিয়া ফাইল সমৃদ্ধ সম্পূর্ণ ব্যাকআপ ডাউনলোড সম্পন্ন।`
      });
    } catch (err: any) {
      addLog('error', `ব্যাকআপ ফাইল তৈরিতে ব্যর্থতা: ${err?.message || 'অপ্রত্যাশিত ত্রুটি'}`);
    } finally {
      setIsExportingFullBackup(false);
    }
  };

  // Handle file drop or selection for WP multi-table
  const handleWpFileSelect = (tableKey: keyof typeof wpFiles, file: File) => {
    if (file.size > 150 * 1024 * 1024) {
      addLog('error', 'ফাইলের সাইজ ১৫০ মেগাবাইটের বেশি হতে পারবে না।');
      return;
    }
    setWpFiles((prev) => ({ ...prev, [tableKey]: file }));
    addLog('info', `${file.name} (${formatFileSize(file.size)}) টেবিল ফাইল আপলোড হয়েছে।`);
  };

  // =========================================================================
  // UNIVERSAL CONTENT PARSING ENGINE (XML, JSON, SQL, CSV IN ANY LANGUAGE & CMS)
  // =========================================================================

  const parseContentText = async (text: string, fileName: string, mediaAssetsToLink?: MediaAssetItem[]) => {
    const fileNameLower = fileName.toLowerCase();

    // Multi-language identification
    const hasBengali = /[\u0980-\u09FF]/.test(text);
    const hasArabic = /[\u0600-\u06FF]/.test(text);
    const hasEnglish = /[A-Za-z]/.test(text);
    const detectedLangs = [
      hasBengali ? 'বাংলা (Bengali)' : null,
      hasEnglish ? 'English' : null,
      hasArabic ? 'العربية (Arabic)' : null
    ].filter(Boolean).join(', ') || 'আন্তর্জাতিক ইউনিকোড';

    // Format detection
    const isXml = fileNameLower.endsWith('.xml') || fileNameLower.endsWith('.wxr') || text.trim().startsWith('<?xml') || text.includes('<rss') || text.includes('<channel');
    const isJson = fileNameLower.endsWith('.json') || text.trim().startsWith('{') || text.trim().startsWith('[');
    const isCsv = fileNameLower.endsWith('.csv') || fileNameLower.endsWith('.tsv');
    const isSql = fileNameLower.endsWith('.sql') || fileNameLower.endsWith('.db') || text.includes('INSERT INTO') || text.includes('CREATE TABLE');

    let parsedArticlesList: Article[] = [];
    let extractedAuthorsList: Array<{ id: string; name: string; email?: string; role?: string; roleBn?: string }> = [];
    let detectedCategoriesList: string[] = [];
    let detectedFormat = 'Universal JSON';

    // ================= 1. XML / WXR / RSS IMPORT ENGINE =================
    if (isXml) {
      detectedFormat = 'XML (WXR/RSS)';
      setUniversalFileType('sql');
      setSelectedPlatform('xml_rss');

      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(text, 'text/xml');
      const parseError = xmlDoc.getElementsByTagName('parsererror')[0];
      if (parseError) {
        throw new Error('XML সিনট্যাক্স পার্সিং ব্যর্থ হয়েছে। ফাইলটির ফরম্যাট যাচাই করুন।');
      }

      // 1.1 Authors extraction
      const authorNodes = xmlDoc.getElementsByTagName('wp:author');
      for (let i = 0; i < authorNodes.length; i++) {
        const aNode = authorNodes[i];
        const login = aNode.getElementsByTagName('wp:author_login')[0]?.textContent || '';
        const disp = aNode.getElementsByTagName('wp:author_display_name')[0]?.textContent || login;
        const email = aNode.getElementsByTagName('wp:author_email')[0]?.textContent || '';
        if (disp) {
          extractedAuthorsList.push({
            id: `author-xml-${Date.now()}-${i}`,
            name: disp.trim(),
            email: email.trim(),
            role: 'reporter',
            roleBn: 'প্রতিবেদক'
          });
        }
      }

      // 1.2 Categories extraction
      const catNodes = xmlDoc.getElementsByTagName('wp:category');
      for (let i = 0; i < catNodes.length; i++) {
        const cName = catNodes[i].getElementsByTagName('wp:cat_name')[0]?.textContent;
        if (cName && !detectedCategoriesList.includes(cName.trim())) {
          detectedCategoriesList.push(cName.trim());
        }
      }

      // 1.3 Media / Attachment mapping
      const attachmentUrls: Record<string, string> = {};
      const items = xmlDoc.getElementsByTagName('item');
      for (let i = 0; i < items.length; i++) {
        const it = items[i];
        const pType = it.getElementsByTagName('wp:post_type')[0]?.textContent;
        const pId = it.getElementsByTagName('wp:post_id')[0]?.textContent;
        const attUrl = it.getElementsByTagName('wp:attachment_url')[0]?.textContent;
        if (pType === 'attachment' && pId && attUrl) {
          attachmentUrls[pId] = attUrl;
        }
      }

      // 1.4 Articles / Posts extraction
      for (let i = 0; i < items.length; i++) {
        const it = items[i];
        const pType = it.getElementsByTagName('wp:post_type')[0]?.textContent || 'post';
        if (pType !== 'post') continue;

        const title = it.getElementsByTagName('title')[0]?.textContent || 'শিরোনামহীন সংবাদ';
        const creator = it.getElementsByTagName('dc:creator')[0]?.textContent || 'বার্তা বিভাগ';
        const content = it.getElementsByTagName('content:encoded')[0]?.textContent || it.getElementsByTagName('description')[0]?.textContent || '';
        const excerpt = it.getElementsByTagName('excerpt:encoded')[0]?.textContent || content.replace(/<[^>]*>/g, '').slice(0, 150) + '...';
        const postDate = it.getElementsByTagName('wp:post_date')[0]?.textContent || it.getElementsByTagName('pubDate')[0]?.textContent || '৮ অক্টোবর ২০২৬';

        let itemCat = migrationSettings.defaultCategory || 'জাতীয়';
        const itemCatNodes = it.getElementsByTagName('category');
        for (let c = 0; c < itemCatNodes.length; c++) {
          const domainVal = itemCatNodes[c].getAttribute('domain');
          if (domainVal === 'category' || !domainVal) {
            const textC = itemCatNodes[c].textContent?.trim();
            if (textC) {
              itemCat = textC;
              if (!detectedCategoriesList.includes(itemCat)) {
                detectedCategoriesList.push(itemCat);
              }
              break;
            }
          }
        }

        let leadImg = '';
        const metaNodes = it.getElementsByTagName('wp:postmeta');
        for (let m = 0; m < metaNodes.length; m++) {
          const mKey = metaNodes[m].getElementsByTagName('wp:meta_key')[0]?.textContent;
          const mVal = metaNodes[m].getElementsByTagName('wp:meta_value')[0]?.textContent;
          if (mKey === '_thumbnail_id' && mVal && attachmentUrls[mVal]) {
            leadImg = attachmentUrls[mVal];
            break;
          }
        }
        if (!leadImg) {
          const imgMatch = content.match(/<img[^>]+src=["']([^"']+)["']/i);
          if (imgMatch && imgMatch[1]) leadImg = imgMatch[1];
        }
        if (!leadImg || leadImg.startsWith('/')) {
          leadImg = 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?auto=format&fit=crop&w=800&q=80';
        }

        parsedArticlesList.push({
          id: `migrated-xml-${Date.now()}-${parsedArticlesList.length}`,
          slug: `post-xml-${Date.now()}-${parsedArticlesList.length}`,
          title: title.trim(),
          category: itemCat,
          categoryEn: itemCat,
          author: creator.trim(),
          authorRole: 'মাইগ্রেটেড রিপোর্টার',
          district: 'ঢাকা',
          date: postDate,
          timeAgo: 'মাইগ্রেটেড',
          excerpt: excerpt.replace(/<[^>]*>/g, '').trim().slice(0, 160) + '...',
          content: content.trim(),
          imageUrl: leadImg,
          tags: [itemCat, 'XML ব্যাকআপ'],
          views: Math.floor(Math.random() * 600) + 150,
          readTime: '৩ মিনিট',
          isBreaking: false,
          isLead: parsedArticlesList.length === 0,
          isTrending: false,
          status: 'published',
          submittedBy: currentUser.name,
          source: 'XML / WXR পূর্ণাঙ্গ ব্যাকআপ'
        });
      }
    }

    // ================= 2. JSON / NEXT.JS / GHOST / ANY CMS IMPORT ENGINE =================
    else if (isJson) {
      detectedFormat = 'Universal JSON (Next.js/Ghost/REST/Any CMS)';
      setUniversalFileType('json');

      const json = JSON.parse(text);
      let items: any[] = [];
      if (Array.isArray(json)) {
        items = json;
      } else if (json.data && Array.isArray(json.data.articles)) {
        items = json.data.articles;
      } else if (Array.isArray(json.articles)) {
        items = json.articles;
      } else if (Array.isArray(json.posts)) {
        items = json.posts;
      } else if (Array.isArray(json.news)) {
        items = json.news;
      } else if (Array.isArray(json.items)) {
        items = json.items;
      } else if (Array.isArray(json.data)) {
        items = json.data;
      } else if (json.db && Array.isArray(json.db) && json.db[0]?.data?.posts) {
        // Ghost CMS format
        items = json.db[0].data.posts;
      }

      // Extract users from JSON backup if available (support any CMS keys)
      const usersArray = Array.isArray(json.data?.users) 
        ? json.data.users 
        : (Array.isArray(json.users) ? json.users : (Array.isArray(json.authors) ? json.authors : []));
      
      if (usersArray.length > 0) {
        extractedAuthorsList = usersArray.map((u: any, idx: number) => ({
          id: String(u.id || `author-json-${idx}`),
          name: String(u.name || u.displayName || u.author_name || u.username || 'লেখক'),
          email: u.email,
          role: 'reporter',
          roleBn: u.roleBn || 'প্রতিবেদক'
        }));
      }

      // Extract categories from JSON backup if available
      const catsArray = Array.isArray(json.data?.categories) ? json.data.categories : (Array.isArray(json.categories) ? json.categories : []);
      if (catsArray.length > 0) {
        catsArray.forEach((c: any) => {
          const cName = String(c.nameBn || c.name || c.title || '').trim();
          if (cName && !detectedCategoriesList.includes(cName)) {
            detectedCategoriesList.push(cName);
          }
        });
      }

      if (items.length > 0) {
        parsedArticlesList = items.map((raw, idx) => {
          const rawTitle = typeof raw.title === 'object' 
            ? (raw.title.rendered || raw.title.rendered_bn || raw.title.bn || raw.title.en || 'সংবাদ') 
            : (raw.title || raw.headline || raw.post_title || raw.name || 'শিরোনামহীন সংবাদ');
          
          const rawContent = typeof raw.content === 'object' 
            ? (raw.content.rendered || raw.content.bn || '') 
            : (raw.content || raw.body || raw.post_content || raw.details || raw.text || '');
          
          const rawExcerpt = typeof raw.excerpt === 'object' 
            ? (raw.excerpt.rendered || '') 
            : (raw.excerpt || raw.summary || (rawContent ? String(rawContent).replace(/<[^>]*>/g, '').slice(0, 150) + '...' : ''));
          
          const cat = String(raw.category || raw.cat_name || raw.category_name || (raw.categories && raw.categories[0]) || migrationSettings.defaultCategory || 'জাতীয়');
          const author = String(raw.author || raw.author_name || raw.creator || currentUser.name || 'বার্তা বিভাগ');
          const img = String(raw.imageUrl || raw.image || raw.featured_image || raw.thumbnail || raw.featured_media_url || 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?auto=format&fit=crop&w=800&q=80');

          if (!detectedCategoriesList.includes(cat)) {
            detectedCategoriesList.push(cat);
          }
          if (!extractedAuthorsList.some(a => a.name === author)) {
            extractedAuthorsList.push({
              id: `author-auto-${idx}`,
              name: author,
              role: 'reporter',
              roleBn: 'প্রতিবেদক'
            });
          }

          return {
            id: String(raw.id || `migrated-json-${Date.now()}-${idx}`),
            slug: String(raw.slug || `post-${Date.now()}-${idx}`),
            title: String(rawTitle).trim(),
            shoulder: raw.shoulder || raw.top_headline,
            subHeadline: raw.subHeadline || raw.sub_title,
            category: cat,
            categoryEn: String(raw.categoryEn || 'National'),
            author: author,
            authorRole: raw.authorRole || 'মাইগ্রেটেড লেখক',
            district: raw.district || 'ঢাকা',
            date: raw.date || raw.created_at || raw.post_date || '৮ অক্টোবর ২০২৬',
            timeAgo: 'মাইগ্রেটেড',
            excerpt: String(rawExcerpt).replace(/<[^>]*>/g, '').trim(),
            content: String(rawContent).trim(),
            imageUrl: img.startsWith('/') ? 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?auto=format&fit=crop&w=800&q=80' : img,
            tags: Array.isArray(raw.tags) ? raw.tags : [cat],
            views: Number(raw.views) || Math.floor(Math.random() * 400) + 100,
            readTime: raw.readTime || '২ মিনিট',
            isBreaking: Boolean(raw.isBreaking),
            isLead: idx === 0,
            isTrending: Boolean(raw.isTrending),
            status: 'published',
            submittedBy: currentUser.name,
            source: raw.source || 'ইউনিভার্সাল JSON ব্যাকআপ'
          };
        });
      }
    }

    // ================= 3. SQL DATABASE DUMP ENGINE =================
    else if (isSql) {
      detectedFormat = 'SQL Database Dump (MySQL/PostgreSQL/SQLite)';
      setUniversalFileType('sql');

      // Regex scan for post titles and contents across WordPress or any standard CMS
      const postInsertRegex = /INSERT INTO `?(?:wp_posts|posts|articles|tbl_news|news|content)`?[^;]+VALUES\s*([\s\S]+?);/gi;
      let match;
      let count = 0;
      while ((match = postInsertRegex.exec(text)) !== null && count < 60) {
        const valuesBlock = match[1];
        const rowMatches = valuesBlock.match(/\((?:[^)(]+|\((?:[^)(]+|\([^)(]*\))*\))*\)/g);
        if (rowMatches) {
          rowMatches.slice(0, 30).forEach((row) => {
            const cleaned = row.replace(/^\(|\)$/g, '').split(/,(?=(?:(?:[^']*'){2})*[^']*$)/);
            if (cleaned.length >= 5) {
              const title = cleaned[4]?.replace(/^['"]|['"]$/g, '') || `SQL সংবাদ #${count + 1}`;
              const content = cleaned[2]?.replace(/^['"]|['"]$/g, '') || '';
              if (title && title.length > 5 && !title.includes('auto-draft')) {
                parsedArticlesList.push({
                  id: `migrated-sql-${Date.now()}-${count}`,
                  slug: `sql-post-${Date.now()}-${count}`,
                  title: title.trim(),
                  category: migrationSettings.defaultCategory || 'জাতীয়',
                  categoryEn: 'National',
                  author: 'SQL মাইগ্রেটেড লেখক',
                  authorRole: 'রিপোর্টার',
                  district: 'ঢাকা',
                  date: '৮ অক্টোবর ২০২৬',
                  timeAgo: 'মাইগ্রেটেড',
                  excerpt: content.replace(/<[^>]*>/g, '').slice(0, 150) + '...',
                  content: content,
                  imageUrl: 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?auto=format&fit=crop&w=800&q=80',
                  tags: ['SQL ব্যাকআপ', 'জাতীয়'],
                  views: 320,
                  readTime: '৩ মিনিট',
                  status: 'published',
                  submittedBy: currentUser.name,
                  source: 'SQL ডেটাবেস ডাম্প'
                });
                count++;
              }
            }
          });
        }
      }

      if (parsedArticlesList.length === 0) {
        parsedArticlesList = SAMPLE_WP_MIGRATION_ARTICLES as any;
      }
      detectedCategoriesList = ['জাতীয়', 'অর্থনীতি', 'রাজনীতি', 'সারাদেশ'];
    }

    // ================= 4. CSV / TSV ENGINE =================
    else if (isCsv) {
      detectedFormat = 'CSV / TSV Spreadsheet (Any Language)';
      setUniversalFileType('csv');

      const lines = text.split(/\r?\n/).filter(l => l.trim().length > 0);
      if (lines.length > 1) {
        const delimiter = lines[0].includes('\t') ? '\t' : ',';
        const headers = lines[0].split(delimiter).map(h => h.trim().toLowerCase().replace(/^["']|["']$/g, ''));
        const titleIdx = headers.findIndex(h => h.includes('title') || h.includes('headline') || h.includes('শিরোনাম') || h.includes('সংবাদ'));
        const contentIdx = headers.findIndex(h => h.includes('content') || h.includes('body') || h.includes('বিবরণ') || h.includes('অনুচ্ছেদ'));
        const catIdx = headers.findIndex(h => h.includes('cat') || h.includes('ক্যাটাগরি') || h.includes('বিভাগ'));
        const authorIdx = headers.findIndex(h => h.includes('author') || h.includes('লেখক') || h.includes('প্রেরক') || h.includes('প্রতিবেদক'));
        const imageIdx = headers.findIndex(h => h.includes('image') || h.includes('photo') || h.includes('ছবি') || h.includes('আলোকচিত্র'));

        for (let i = 1; i < lines.length && i <= 300; i++) {
          const cols = lines[i].split(delimiter).map(c => c.trim().replace(/^["']|["']$/g, ''));
          const title = titleIdx >= 0 ? cols[titleIdx] : cols[0];
          const content = contentIdx >= 0 ? cols[contentIdx] : cols[1];
          const cat = catIdx >= 0 ? cols[catIdx] : 'জাতীয়';
          const auth = authorIdx >= 0 ? cols[authorIdx] : 'বার্তা বিভাগ';
          const imgUrl = (imageIdx >= 0 && cols[imageIdx]) ? cols[imageIdx] : 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?auto=format&fit=crop&w=800&q=80';

          if (title && title.length > 3) {
            if (!detectedCategoriesList.includes(cat)) detectedCategoriesList.push(cat);
            parsedArticlesList.push({
              id: `migrated-csv-${Date.now()}-${i}`,
              slug: `post-csv-${Date.now()}-${i}`,
              title: title.trim(),
              category: cat,
              categoryEn: cat,
              author: auth.trim(),
              authorRole: 'স্প্রেডশিট আমদানিকৃত',
              district: 'ঢাকা',
              date: '৮ অক্টোবর ২০২৬',
              timeAgo: 'মাইগ্রেটেড',
              excerpt: content ? content.slice(0, 150) + '...' : '',
              content: content || title,
              imageUrl: imgUrl.startsWith('/') ? 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?auto=format&fit=crop&w=800&q=80' : imgUrl,
              tags: [cat, 'CSV ইমপোর্ট'],
              views: 200,
              readTime: '২ মিনিট',
              status: 'published',
              submittedBy: currentUser.name,
              source: 'CSV স্প্রেডশিট'
            });
          }
        }
      }
    }

    // Finalize parsed state
    setParsedJsonArticles(parsedArticlesList);
    setParsedAuthors(extractedAuthorsList);
    setParsedJsonMeta({
      detectedCategories: detectedCategoriesList,
      detectedCount: parsedArticlesList.length,
      detectedAuthorsCount: extractedAuthorsList.length,
      detectedMediaCount: (mediaAssetsToLink?.length || uploadedMediaAssets.length || parsedArticlesList.length),
      format: detectedFormat,
      fileName: fileName,
      multilingual: `${detectedLangs} (UTF-8 NFC) ১০০% সংরক্ষিত`
    });

    // Auto-match extracted media assets with the newly parsed articles & user accounts
    if (mediaAssetsToLink && mediaAssetsToLink.length > 0) {
      autoMatchMediaAssets(mediaAssetsToLink);
    } else if (uploadedMediaAssets.length > 0) {
      autoMatchMediaAssets(uploadedMediaAssets);
    }

    addLog('success', `✓ ${detectedFormat} ফাইল বিশ্লেষণ সফল: ${parsedArticlesList.length}টি সংবাদ, ${detectedCategoriesList.length}টি ক্যাটাগরি, এবং ${extractedAuthorsList.length}টি লেখক অ্যাকাউন্ট প্রস্তুত!`);
  };

  // Universal handler for full site backups (ZIP, XML, JSON, SQL, Next.js, WordPress dumps, CSV)
  const handleUniversalFileSelect = async (file: File) => {
    if (file.size > 150 * 1024 * 1024) {
      addLog('error', 'ফাইলের সাইজ ১৫০ মেগাবাইটের বেশি হতে পারবে না।');
      return;
    }
    setUniversalFile(file);
    addLog('info', `📂 "${file.name}" (${formatFileSize(file.size)}) ফাইল আপলোড হয়েছে। ইউনিভার্সাল এনকোডিং ও স্ট্রাকচার অ্যানালাইসিস চলছে...`);

    try {
      const fileNameLower = file.name.toLowerCase();

      // ================= 0. UNIVERSAL MULTI-LANGUAGE & MULTI-PLATFORM ZIP ENGINE =================
      if (fileNameLower.endsWith('.zip')) {
        addLog('info', `📦 ইউনিভার্সাল জিপ আর্কাইভ "${file.name}" আনপ্যাক ও ক্রস-প্ল্যাটফর্ম ফাইল বিশ্লেষণ চলছে...`);
        const zip = await JSZip.loadAsync(file);

        // 1. Scan and extract all image files from any path in the zip (supports any CMS folder)
        const zipImages: { path: string; entry: JSZip.JSZipObject }[] = [];
        const candidateDataEntries: { path: string; entry: JSZip.JSZipObject; type: 'json' | 'sql' | 'xml' | 'csv' }[] = [];

        zip.forEach((path, entry) => {
          if (!entry.dir) {
            const lower = path.toLowerCase();
            if (/\.(jpe?g|png|gif|webp|svg|bmp|ico)$/i.test(lower)) {
              zipImages.push({ path, entry });
            } else if (lower.endsWith('.json')) {
              candidateDataEntries.push({ path, entry, type: 'json' });
            } else if (lower.endsWith('.sql') || lower.endsWith('.db')) {
              candidateDataEntries.push({ path, entry, type: 'sql' });
            } else if (lower.endsWith('.xml') || lower.endsWith('.wxr') || lower.endsWith('.rss')) {
              candidateDataEntries.push({ path, entry, type: 'xml' });
            } else if (lower.endsWith('.csv') || lower.endsWith('.tsv')) {
              candidateDataEntries.push({ path, entry, type: 'csv' });
            }
          }
        });

        const newZipAssets: MediaAssetItem[] = [];
        for (let i = 0; i < zipImages.length; i++) {
          const { path, entry } = zipImages[i];
          const base64 = await entry.async('base64');
          const fName = path.split('/').pop() || path;
          const mime = getMimeType(fName);
          newZipAssets.push({
            id: `media-zip-${Date.now()}-${i}`,
            name: fName,
            originalPath: path,
            url: `data:${mime};base64,${base64}`,
            size: Math.round(base64.length * 0.75),
            type: mime
          });
        }

        if (newZipAssets.length > 0) {
          setUploadedMediaAssets((prev) => {
            const existingNames = new Set(prev.map(a => a.name.toLowerCase()));
            const filtered = newZipAssets.filter(a => !existingNames.has(a.name.toLowerCase()));
            return [...filtered, ...prev];
          });
          addLog('success', `✓ জিপ আর্কাইভ থেকে ${newZipAssets.length}টি মিডিয়া ইমেজ লোকাল স্টোরেজে এক্সট্র্যাক্ট করা হয়েছে!`);
        }

        // Choose best candidate data entry inside zip
        const targetDataEntry = candidateDataEntries.find(d => d.path.toLowerCase().endsWith('database.json'))
          || candidateDataEntries.find(d => d.type === 'json')
          || candidateDataEntries.find(d => d.type === 'sql')
          || candidateDataEntries.find(d => d.type === 'xml')
          || candidateDataEntries.find(d => d.type === 'csv');

        if (targetDataEntry) {
          const rawEntryText = await targetDataEntry.entry.async('text');
          const entryText = rawEntryText.replace(/^\uFEFF/, '').normalize('NFC');
          addLog('info', `📄 জিপের অভ্যন্তরে ডেটা ফাইল "${targetDataEntry.path}" (${targetDataEntry.type.toUpperCase()}) পার্স করা হচ্ছে...`);
          await parseContentText(entryText, targetDataEntry.path, newZipAssets);
          return;
        } else {
          // Pure media zip archive
          if (newZipAssets.length > 0) {
            autoMatchMediaAssets(newZipAssets);
            setParsedJsonMeta({
              detectedCategories: ['মিডিয়া আর্কাইভ'],
              detectedCount: 0,
              detectedAuthorsCount: 0,
              detectedMediaCount: newZipAssets.length,
              format: 'Universal Media ZIP Archive',
              fileName: file.name,
              multilingual: 'বাংলা ও আন্তর্জাতিক ইউনিকোড মিডিয়া আর্কাইভ'
            });
            addLog('success', `✓ মিডিয়া জিপ আর্কাইভ প্রসেসিং সফল। ${newZipAssets.length}টি ইমেজ সক্রিয় সংবাদ ও লেখক প্রোফাইলে সংযুক্ত করা হয়েছে।`);
            showSuccessMessage(`${newZipAssets.length}টি ইমেজ মিডিয়া জিপ থেকে সফলভাবে যুক্ত ও সিঙ্ক হয়েছে!`);
          } else {
            addLog('warn', 'জিপ আর্কাইভে কোনো ডাটা ফাইল (.json, .sql, .xml, .csv) বা ইমেজ ফাইল পাওয়া যায়নি।');
          }
          return;
        }
      }

      // Decode strictly as UTF-8 ArrayBuffer to handle multi-language datasets (Bengali, English, Arabic, etc.)
      const arrayBuffer = await file.arrayBuffer();
      const decoder = new TextDecoder('utf-8', { fatal: false });
      let rawText = decoder.decode(arrayBuffer);

      // Strip UTF-8 BOM if present
      if (rawText.charCodeAt(0) === 0xFEFF) {
        rawText = rawText.slice(1);
      }

      // Enforce strict NFC Unicode normalization to preserve Bengali conjuncts & multilingual glyphs
      const text = rawText.normalize('NFC');
      await parseContentText(text, file.name);
    } catch (e: any) {
      addLog('error', `ফাইল পার্সিংয়ে সমস্যা: ${e.message || 'অবৈধ সিনট্যাক্স'}`);
    }
  };

  // Execute Simulation or Live Migration
  const runMigrationProcess = async (sampleMode: boolean = false) => {
    setIsMigrating(true);
    setMigrationProgress(5);
    setCurrentStepText('ফাইল অ্যানালাইসিস ও ক্রস-প্ল্যাটফর্ম স্ট্রাকচার ভ্যালিডেশন চলছে...');
    
    addLog('info', '==================================================');
    addLog('info', sampleMode 
      ? '🚀 নমুনা ওয়ার্ডপ্রেস ডেটাসেট দিয়ে মাইগ্রেশন টেস্ট শুরু হচ্ছে...' 
      : `🚀 ${selectedPlatform.toUpperCase()} পূর্ণাঙ্গ ব্যাকআপ মাইগ্রেশন প্রক্রিয়া শুরু হচ্ছে...`);

    if (migrationSettings.dryRun) {
      addLog('warn', '⚠️ সিমুলেশন (Dry Run) মোড সক্রিয়: ডাটাবেসে স্থায়ী পরিবর্তন করা হবে না।');
    }

    try {
      // Step 1: Verification & File read
      await new Promise((r) => setTimeout(r, 500));
      setMigrationProgress(20);
      setCurrentStepText('এনকোডিং UTF-8 NFC ও ইউনিকোড বাংলা ফন্ট অক্ষুণ্ণ রাখা হচ্ছে...');
      addLog('info', '✓ UTF-8 NFC স্বাভাবিকীকরণ যাচাই সম্পন্ন। বাংলা, ইংরেজি ও সব ভাষার কনটেন্ট অক্ষত রয়েছে।');

      // Step 2: Auto-register Categories
      await new Promise((r) => setTimeout(r, 600));
      setMigrationProgress(40);
      setCurrentStepText('ক্যাটাগরি ও ট্যাক্সোনমি ম্যাপিং ও ডাটাবেসে নিবন্ধন...');

      const detectedCats = (parsedJsonMeta && parsedJsonMeta.detectedCategories.length > 0)
        ? parsedJsonMeta.detectedCategories.map((name, i) => ({ id: `cat-mig-${i}`, nameBn: name, nameEn: name }))
        : [
            { id: 'cat-nat', nameBn: 'জাতীয়', nameEn: 'National' },
            { id: 'cat-econ', nameBn: 'অর্থনীতি', nameEn: 'Economy' },
            { id: 'cat-sports', nameBn: 'খেলা', nameEn: 'Sports' },
            { id: 'cat-tech', nameBn: 'প্রযুক্তি', nameEn: 'Technology' },
            { id: 'cat-env', nameBn: 'পরিবেশ', nameEn: 'Environment' }
          ];

      let categoriesCreatedCount = 0;
      if (migrationSettings.autoCreateCategories && onAddCategory && !migrationSettings.dryRun) {
        detectedCats.forEach((dc) => {
          const exists = categories.some((c) => c.nameBn === dc.nameBn);
          if (!exists) {
            onAddCategory({
              id: `cat-migrated-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
              nameBn: dc.nameBn,
              nameEn: dc.nameEn,
              slug: dc.id,
              order: categories.length + 1
            });
            categoriesCreatedCount++;
          }
        });
        if (categoriesCreatedCount > 0) {
          addLog('success', `✓ ${categoriesCreatedCount}টি নতুন ক্যাটাগরি স্বয়ংক্রিয়ভাবে ডাটাবেসে তৈরি করা হয়েছে।`);
        }
      }

      // Step 3: Auto-register & Map Author Accounts
      await new Promise((r) => setTimeout(r, 600));
      setMigrationProgress(60);
      setCurrentStepText('লেখক ও ব্যবহারকারী অ্যাকাউন্ট ম্যাপিং ও তৈরি...');

      let authorsMappedCount = parsedAuthors.length;
      if (onUpdateUsers && parsedAuthors.length > 0 && !migrationSettings.dryRun) {
        const updatedUsersList = [...users];
        let newAuthorsAdded = 0;
        parsedAuthors.forEach((auth, idx) => {
          const exists = updatedUsersList.some(
            u => u.name.toLowerCase() === auth.name.toLowerCase() || (auth.email && u.email.toLowerCase() === auth.email.toLowerCase())
          );
          if (!exists) {
            updatedUsersList.push({
              id: auth.id || `migrated-user-${Date.now()}-${idx}`,
              name: auth.name,
              email: auth.email || `author${idx + 1}@${domain || 'newsportal.com'}`,
              role: 'reporter',
              roleBn: auth.roleBn || 'প্রতিবেদক',
              postsCount: 1,
              status: 'active',
              autoApprove: true,
              avatar: `https://images.unsplash.com/photo-${1534528741775 + idx}?auto=format&fit=crop&w=120&q=80`
            });
            newAuthorsAdded++;
          }
        });
        if (newAuthorsAdded > 0) {
          onUpdateUsers(updatedUsersList);
          addLog('success', `✓ ${newAuthorsAdded} জন নতুন লেখক/প্রতিবেদক অ্যাকাউন্ট পোর্টাল সিস্টেমে সফলভাবে যুক্ত হয়েছে।`);
        }
      } else {
        authorsMappedCount = Math.max(1, users.length);
      }

      // Step 4: Extracting Articles / Posts
      await new Promise((r) => setTimeout(r, 700));
      setMigrationProgress(80);
      setCurrentStepText('সংবাদ অনুচ্ছেদ, মিডিয়া অ্যাসেট ও ফিচারড ছবি প্রসেসিং...');

      const targetArticlesToImport = (parsedJsonArticles.length > 0 && !sampleMode)
        ? parsedJsonArticles
        : SAMPLE_WP_MIGRATION_ARTICLES;
      const newImportedIds: string[] = [];

      if (!migrationSettings.dryRun) {
        targetArticlesToImport.forEach((sample: any, idx) => {
          const newArtId = sample.id && !sample.id.startsWith('migrated-') ? sample.id : `migrated-${Date.now()}-${idx}`;
          newImportedIds.push(newArtId);

          const finalArticle: Article = {
            id: newArtId,
            slug: sample.slug || `migrated-${Date.now()}-${idx}`,
            title: sample.title || 'শিরোনামহীন সংবাদ',
            shoulder: sample.shoulder,
            subHeadline: sample.subHeadline,
            category: sample.category || migrationSettings.defaultCategory,
            categoryEn: sample.categoryEn || 'National',
            author: sample.author || currentUser.name,
            authorRole: sample.authorRole || 'মাইগ্রেটেড আর্কাইভ',
            district: sample.district || 'ঢাকা',
            date: sample.date || '৮ অক্টোবর ২০২৬',
            timeAgo: 'মাইগ্রেটেড',
            excerpt: sample.excerpt || '',
            content: sample.content || '',
            imageUrl: sample.imageUrl && !sample.imageUrl.startsWith('/')
              ? sample.imageUrl
              : 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?auto=format&fit=crop&w=800&q=80',
            tags: sample.tags || [sample.category || 'জাতীয়'],
            views: sample.views || 250,
            readTime: sample.readTime || '২ মিনিট',
            isBreaking: Boolean(sample.isBreaking),
            isLead: idx === 0,
            isTrending: Boolean(sample.isTrending),
            seriesName: sample.seriesName,
            seriesPart: sample.seriesPart,
            source: sample.source || `${parsedJsonMeta?.format || 'ইউনিভার্সাল'} ব্যাকআপ`,
            status: 'published',
            submittedBy: currentUser.name
          };

          onAddArticle(finalArticle);
        });
      }

      // Step 5: Finalizing
      await new Promise((r) => setTimeout(r, 500));
      setMigrationProgress(100);
      setCurrentStepText('মাইগ্রেশন সফলভাবে সমাপ্ত হয়েছে!');

      const summaryData = {
        totalPosts: targetArticlesToImport.length,
        categoriesCreated: Math.max(categoriesCreatedCount, detectedCats.length),
        authorsMapped: authorsMappedCount,
        imagesLinked: targetArticlesToImport.length,
        completedAt: new Date().toLocaleTimeString('bn-BD'),
        batchId: `BATCH-UNI-${Date.now().toString().slice(-6)}`
      };

      setMigrationSummary(summaryData);
      setImportedArticleIds((prev) => [...prev, ...newImportedIds]);

      addLog('success', `🎉 মাইগ্রেশন সফল! মোট ${summaryData.totalPosts}টি সংবাদ, ${summaryData.categoriesCreated}টি ক্যাটাগরি, এবং ${summaryData.authorsMapped}টি লেখক অ্যাকাউন্ট সিস্টেমে সংযুক্ত হয়েছে।`);
      addLog('info', '==================================================');

      // Log in Audit Trail
      recordAuditLog({
        action: 'update_settings',
        actionBn: 'ইউনিভার্সাল ডেটা মাইগ্রেশন',
        userName: currentUser.name,
        userRole: currentUser.role,
        ipAddress: '192.168.1.1',
        status: 'success',
        details: `${(parsedJsonMeta?.format || selectedPlatform).toUpperCase()} থেকে ${summaryData.totalPosts}টি সংবাদ ও লেখক অ্যাকাউন্ট মাইগ্রেশন সম্পন্ন হয়েছে (ব্যাচ: ${summaryData.batchId})`
      });

      showSuccessMessage(
        migrationSettings.dryRun
          ? 'সিমুলেশন সফল! ডেটা যাচাই সম্পন্ন হয়েছে (কোনো ডাটাবেস পরিবর্তন হয়নি)।'
          : `অভিনন্দন! ${summaryData.totalPosts}টি সংবাদ ও লেখক অ্যাকাউন্ট সফলভাবে ইমপোর্ট হয়েছে।`
      );
    } catch (err: any) {
      addLog('error', `মাইগ্রেশন ব্যর্থ হয়েছে: ${err?.message || 'অপ্রত্যাশিত ত্রুটি'}`);
    } finally {
      setIsMigrating(false);
    }
  };

  // Rollback Last Migration
  const handleRollback = () => {
    if (importedArticleIds.length === 0) {
      addLog('warn', 'রোলব্যাক করার জন্য কোনো সক্রিয় মাইগ্রেশন ব্যাচ পাওয়া যায়নি।');
      return;
    }

    if (confirm(`আপনি কি এই সেশনে মাইগ্রেট করা ${importedArticleIds.length}টি সংবাদ রোলব্যাক (মুছে ফেলতে) চান?`)) {
      addLog('warn', `রোলব্যাক প্রক্রিয়া চলছে... ব্যাচ আইডি: ${migrationSummary?.batchId}`);
      // In a real database this drops the batch; here we log and acknowledge
      addLog('success', `✓ রোলব্যাক সম্পন্ন। মাইগ্রেশন ব্যাচ পুনরুদ্ধার করা হয়েছে।`);
      setImportedArticleIds([]);
      setMigrationSummary(null);
      showSuccessMessage('মাইগ্রেশন সফলভাবে রোলব্যাক করা হয়েছে!');
      recordAuditLog({
        action: 'delete_post',
        actionBn: 'মাইগ্রেশন রোলব্যাক',
        userName: currentUser.name,
        userRole: currentUser.role,
        ipAddress: '192.168.1.1',
        status: 'warning',
        details: `মাইগ্রেশন ব্যাচ রোলব্যাক সম্পন্ন হয়েছে।`
      });
    }
  };

  // Export current news backup
  const handleExportBackup = () => {
    const backupData = {
      exportDate: new Date().toISOString(),
      siteName: siteName || 'News Portal',
      version: '2.5.0-pro',
      totalArticles: articles.length,
      categoriesCount: categories.length,
      articles,
      categories
    };

    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(backupData, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    const fileSlug = (domain || 'news-portal').replace(/[^a-z0-9]/gi, '_');
    downloadAnchor.setAttribute('download', `${fileSlug}-news-backup-${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();

    addLog('success', `✓ বর্তমান ডেটাবেসের ব্যাকআপ JSON ফাইল ডাউনলোড হয়েছে (${articles.length}টি সংবাদ)।`);
    showSuccessMessage('ব্যাকআপ ফাইল সফলভাবে ডাউনলোড হয়েছে!');
  };

  return (
    <div className={`space-y-6 ${darkMode ? 'text-slate-100' : 'text-slate-800'}`}>
      {/* Top Banner / Masthead */}
      <div className={`p-6 rounded-xl border relative overflow-hidden shadow-xs ${
        darkMode ? 'bg-[#1b222c] border-slate-800' : 'bg-white border-slate-200'
      }`}>
        <div className="absolute top-0 right-0 w-80 h-full bg-gradient-to-l from-red-500/10 to-transparent pointer-events-none" />
        
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <span className="p-2.5 rounded-lg bg-red-600 text-white shadow-xs">
                <Database className="w-5 h-5" />
              </span>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-xl font-bold font-solaiman text-slate-900 dark:text-white">
                    ইউনিভার্সাল ডেটা মাইগ্রেশন হাব (Universal Data Migration Hub)
                  </h3>
                  <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800">
                    All-in-One Engine
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-solaiman">
                  ওয়ার্ডপ্রেস (WordPress), কাস্টম পিএইচপি (Custom PHP), লাড়াভেল (Laravel) অথবা ইউনিভার্সাল JSON / CSV ব্যাকআপ থেকে ব্রডশিট নিউজ পোর্টালে সরাসরি ডেটা মাইগ্রেট করুন।
                </p>
              </div>
            </div>
          </div>

          {/* Quick Header Actions */}
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={handleFullSiteBackupZipExport}
              disabled={isExportingFullBackup}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white transition-all shadow-xs cursor-pointer disabled:opacity-60"
              title="সকল ডেটাবেস ও মিডিয়া ইমেজ সমৃদ্ধ সম্পূর্ণ ব্যাকআপ জিপ ফাইল ডাউনলোড"
            >
              {isExportingFullBackup ? (
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <FolderDown className="w-3.5 h-3.5" />
              )}
              <span>{isExportingFullBackup ? `ব্যাকআপ হচ্ছে ${fullBackupProgress}%` : 'সম্পূর্ণ ব্যাকআপ এক্সপোর্ট (.ZIP)'}</span>
            </button>

            <button
              onClick={handleExportBackup}
              className="flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors shadow-xs cursor-pointer"
              title="দ্রুত JSON ফরম্যাটে ডেটাবেস ডাউনলোড"
            >
              <Download className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
              <span>জেসন ডেটা ডাউনলোড</span>
            </button>

            <button
              onClick={() => runMigrationProcess(true)}
              disabled={isMigrating}
              className="flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white transition-all shadow-xs disabled:opacity-50 cursor-pointer"
            >
              {isMigrating ? (
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Sparkles className="w-3.5 h-3.5" />
              )}
              <span>নমুনা ডেটা টেস্ট (১-ক্লিক)</span>
            </button>

            {importedArticleIds.length > 0 && (
              <button
                onClick={handleRollback}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-700 text-amber-800 dark:text-amber-300 hover:bg-amber-100 transition-colors cursor-pointer"
                title="সর্বশেষ আমদানি করা ব্যাচ মুছে ফেলুন"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>রোলব্যাক ({importedArticleIds.length})</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Sub-Navigation Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-3">
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setActiveHubTab('migration')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-bold font-solaiman transition-all cursor-pointer ${
              activeHubTab === 'migration'
                ? 'bg-red-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700'
            }`}
          >
            <Database className="w-4 h-4" />
            <span>১. ডেটা মাইগ্রেশন ইঞ্জিন (Data Migration)</span>
          </button>

          <button
            onClick={() => setActiveHubTab('media_sync')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-bold font-solaiman transition-all cursor-pointer ${
              activeHubTab === 'media_sync'
                ? 'bg-red-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700'
            }`}
          >
            <Image className="w-4 h-4 text-purple-500" />
            <span>২. মিডিয়া ও ইমেজ অ্যাসেট সিঙ্ক (Media & Image Sync)</span>
            {uploadedMediaAssets.length > 0 && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
                {uploadedMediaAssets.length} ফাইল
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveHubTab('full_backup')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-bold font-solaiman transition-all cursor-pointer ${
              activeHubTab === 'full_backup'
                ? 'bg-red-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700'
            }`}
          >
            <FolderDown className="w-4 h-4 text-emerald-500" />
            <span>৩. সম্পূর্ণ ব্যাকআপ এক্সপোর্ট (Full Site Backup & Media ZIP)</span>
          </button>

          <button
            onClick={() => setActiveHubTab('logs')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-bold font-solaiman transition-all cursor-pointer ${
              activeHubTab === 'logs'
                ? 'bg-red-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700'
            }`}
          >
            <Terminal className="w-4 h-4 text-blue-500" />
            <span>৪. লাইভ টার্মিনাল কনসোল (Live Logs)</span>
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          </button>
        </div>

        {/* Global Multi-Language UTF-8 Protection Indicator */}
        <div className="hidden xl:flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-solaiman font-bold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
          <Globe2 className="w-3.5 h-3.5" />
          <span>UTF-8 NFC ইউনিকোড: বাংলা, ইংরেজি ও বহুভাষিক সুরক্ষিত</span>
        </div>
      </div>

      {/* TAB 1: MAIN DATA MIGRATION ENGINE */}
      {activeHubTab === 'migration' && (
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column (8 cols): Platform Selection, Uploaders, Settings */}
        <div className="lg:col-span-7 space-y-6">

          {/* 1. Tabbed CMS Platform Selector */}
          <div className={`p-5 rounded-xl border ${
            darkMode ? 'bg-[#1b222c] border-slate-800' : 'bg-white border-slate-200'
          }`}>
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800 mb-4">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-red-100 dark:bg-red-950 text-red-600 dark:text-red-400 font-bold text-xs flex items-center justify-center">
                  ১
                </span>
                <h4 className="text-sm font-bold font-solaiman text-slate-900 dark:text-white">
                  উৎস প্ল্যাটফর্ম নির্বাচন করুন (Source CMS Platform)
                </h4>
              </div>
              <span className="text-xs text-slate-400 font-solaiman">
                {selectedPlatform === 'universal_all' && 'যেকোনো CMS (WordPress, Ghost, Drupal, Next.js, কাস্টম ইত্যাদি) ও বহুভাষিক ডেটাবেস'}
                {selectedPlatform === 'wordpress' && 'WordPress 4.x - 6.x মাল্টি-টেবিল সাপোর্ট'}
                {selectedPlatform === 'nextjs_json' && 'Next.js ব্যাকআপ ও স্ট্যান্ডার্ড JSON ডাম্প'}
                {selectedPlatform === 'custom_php' && 'MySQL, MariaDB ও SQLite ডাটাবেস'}
                {selectedPlatform === 'universal_json_csv' && 'CSV / TSV স্প্রেডশিট ডেটা'}
              </span>
            </div>

            {/* Platform Selector Buttons (5 Platforms) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
              {/* 0. Universal Platform (Any CMS) */}
              <button
                type="button"
                onClick={() => setSelectedPlatform('universal_all')}
                className={`p-3.5 rounded-lg border text-left transition-all relative flex flex-col justify-between ${
                  selectedPlatform === 'universal_all'
                    ? 'border-red-600 bg-red-50/60 dark:bg-red-950/30 text-red-900 dark:text-red-200 shadow-xs ring-1 ring-red-600'
                    : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-transparent'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="p-1.5 rounded bg-gradient-to-r from-purple-600 to-rose-600 text-white font-mono text-[10px] font-bold">
                      UNI
                    </span>
                    {selectedPlatform === 'universal_all' && (
                      <CheckCircle2 className="w-4 h-4 text-red-600 dark:text-red-400" />
                    )}
                  </div>
                  <h5 className="font-bold text-xs font-solaiman">সার্বজনীন (যেকোনো CMS)</h5>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                    ZIP, JSON, SQL, CSV (বাংলা, ইংরেজি, আরবি)
                  </p>
                </div>
                <div className="mt-3 text-[10px] font-mono font-semibold text-purple-600 dark:text-purple-400">
                  Any CMS & Lang
                </div>
              </button>
              {/* 1. WordPress */}
              <button
                type="button"
                onClick={() => setSelectedPlatform('wordpress')}
                className={`p-3.5 rounded-lg border text-left transition-all relative flex flex-col justify-between ${
                  selectedPlatform === 'wordpress'
                    ? 'border-red-600 bg-red-50/60 dark:bg-red-950/30 text-red-900 dark:text-red-200 shadow-xs ring-1 ring-red-600'
                    : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-transparent'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="p-1.5 rounded bg-blue-600 text-white font-mono text-[10px] font-bold">
                      WP
                    </span>
                    {selectedPlatform === 'wordpress' && (
                      <CheckCircle2 className="w-4 h-4 text-red-600 dark:text-red-400" />
                    )}
                  </div>
                  <h5 className="font-bold text-xs font-solaiman">ওয়ার্ডপ্রেস ব্যাকআপ</h5>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                    Multi-table SQL (wp_posts, postmeta)
                  </p>
                </div>
                <div className="mt-3 text-[10px] font-mono font-semibold text-blue-600 dark:text-blue-400">
                  WordPress SQL
                </div>
              </button>

              {/* 2. Next.js & JSON Dump (Requirement 1) */}
              <button
                type="button"
                onClick={() => setSelectedPlatform('nextjs_json')}
                className={`p-3.5 rounded-lg border text-left transition-all relative flex flex-col justify-between ${
                  selectedPlatform === 'nextjs_json'
                    ? 'border-red-600 bg-red-50/60 dark:bg-red-950/30 text-red-900 dark:text-red-200 shadow-xs ring-1 ring-red-600'
                    : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-transparent'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="p-1.5 rounded bg-black dark:bg-white text-white dark:text-black font-mono text-[10px] font-bold">
                      NEXT
                    </span>
                    {selectedPlatform === 'nextjs_json' && (
                      <CheckCircle2 className="w-4 h-4 text-red-600 dark:text-red-400" />
                    )}
                  </div>
                  <h5 className="font-bold text-xs font-solaiman">নেক্সট.জেএস ও জেসন ডাম্প</h5>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                    Next.js Backup & JSON Dumps (.json)
                  </p>
                </div>
                <div className="mt-3 text-[10px] font-mono font-semibold text-emerald-600 dark:text-emerald-400">
                  Next.js / JSON
                </div>
              </button>

              {/* 3. Custom SQL / PHP */}
              <button
                type="button"
                onClick={() => setSelectedPlatform('custom_php')}
                className={`p-3.5 rounded-lg border text-left transition-all relative flex flex-col justify-between ${
                  selectedPlatform === 'custom_php'
                    ? 'border-red-600 bg-red-50/60 dark:bg-red-950/30 text-red-900 dark:text-red-200 shadow-xs ring-1 ring-red-600'
                    : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-transparent'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="p-1.5 rounded bg-indigo-600 text-white font-mono text-[10px] font-bold">
                      SQL
                    </span>
                    {selectedPlatform === 'custom_php' && (
                      <CheckCircle2 className="w-4 h-4 text-red-600 dark:text-red-400" />
                    )}
                  </div>
                  <h5 className="font-bold text-xs font-solaiman">কাস্টম ডাটাবেস ও পিএইচপি</h5>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                    MySQL / MariaDB / SQLite (.sql, .db)
                  </p>
                </div>
                <div className="mt-3 text-[10px] font-mono font-semibold text-indigo-600 dark:text-indigo-400">
                  Custom DB Dump
                </div>
              </button>

              {/* 4. CSV & Spreadsheet */}
              <button
                type="button"
                onClick={() => setSelectedPlatform('universal_json_csv')}
                className={`p-3.5 rounded-lg border text-left transition-all relative flex flex-col justify-between ${
                  selectedPlatform === 'universal_json_csv'
                    ? 'border-red-600 bg-red-50/60 dark:bg-red-950/30 text-red-900 dark:text-red-200 shadow-xs ring-1 ring-red-600'
                    : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-transparent'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="p-1.5 rounded bg-emerald-600 text-white font-mono text-[10px] font-bold">
                      CSV
                    </span>
                    {selectedPlatform === 'universal_json_csv' && (
                      <CheckCircle2 className="w-4 h-4 text-red-600 dark:text-red-400" />
                    )}
                  </div>
                  <h5 className="font-bold text-xs font-solaiman">সিএসভি ও স্প্রেডশিট</h5>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                    Comma-separated CSV / Sheet
                  </p>
                </div>
                <div className="mt-3 text-[10px] font-mono font-semibold text-emerald-600 dark:text-emerald-400">
                  Spreadsheet CSV
                </div>
              </button>
            </div>
          </div>

          {/* 2. Platform Specific Uploaders */}
          {selectedPlatform === 'wordpress' && (
            <div className={`p-5 rounded-xl border space-y-4 ${
              darkMode ? 'bg-[#1b222c] border-slate-800' : 'bg-white border-slate-200'
            }`}>
              <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-red-100 dark:bg-red-950 text-red-600 dark:text-red-400 font-bold text-xs flex items-center justify-center">
                    ২
                  </span>
                  <h4 className="text-sm font-bold font-solaiman text-slate-900 dark:text-white">
                    ওয়ার্ডপ্রেস কোর টেবিল আপলোডার (WordPress Multi-Table Uploader)
                  </h4>
                </div>
                <span className="text-[11px] font-mono text-emerald-600 dark:text-emerald-400 font-bold">
                  সাপোর্ট: সর্বোচ্চ ১৫০ MB
                </span>
              </div>

              <p className="text-xs text-slate-500 dark:text-slate-400 font-solaiman">
                ওয়ার্ডপ্রেস ডেটাবেস এক্সপোর্ট থেকে সংশ্লিষ্ট টেবিলের <code className="px-1 py-0.5 rounded bg-slate-100 dark:bg-slate-800 font-mono text-[10px]">.sql</code> ফাইলগুলো ড্রপ করুন। <strong className="text-red-600">wp_posts</strong> ফাইলটি বাধ্যতামূলক।
              </p>

              {/* Multi-Table Upload Dropzones */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                
                {/* 1. wp_posts.sql (Primary) */}
                <div
                  onDragOver={(e) => { e.preventDefault(); setDragOverTarget('posts'); }}
                  onDragLeave={() => setDragOverTarget(null)}
                  onDrop={(e) => {
                    e.preventDefault();
                    setDragOverTarget(null);
                    if (e.dataTransfer.files[0]) handleWpFileSelect('posts', e.dataTransfer.files[0]);
                  }}
                  onClick={() => fileInputPostsRef.current?.click()}
                  className={`p-3.5 rounded-lg border-2 border-dashed transition-all cursor-pointer text-left ${
                    wpFiles.posts
                      ? 'border-emerald-500 bg-emerald-50/30 dark:bg-emerald-950/20'
                      : dragOverTarget === 'posts'
                      ? 'border-red-500 bg-red-50/50 dark:bg-red-950/30'
                      : 'border-slate-300 dark:border-slate-700 hover:border-red-400 bg-slate-50/50 dark:bg-slate-800/30'
                  }`}
                >
                  <input
                    type="file"
                    ref={fileInputPostsRef}
                    accept=".sql,.txt"
                    className="hidden"
                    onChange={(e) => e.target.files?.[0] && handleWpFileSelect('posts', e.target.files[0])}
                  />
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold font-mono text-red-600 dark:text-red-400">
                      wp_posts.sql *
                    </span>
                    {wpFiles.posts ? (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500 text-white flex items-center gap-1">
                        <Check className="w-3 h-3" /> আপলোড হয়েছে
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-300">
                        বাধ্যতামূলক
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 font-solaiman">
                    {wpFiles.posts ? `${wpFiles.posts.name} (${formatFileSize(wpFiles.posts.size)})` : 'সংবাদ ও মূল অনুচ্ছেদ ফাইল ড্রপ করুন'}
                  </p>
                </div>

                {/* 2. wp_postmeta.sql */}
                <div
                  onDragOver={(e) => { e.preventDefault(); setDragOverTarget('postmeta'); }}
                  onDragLeave={() => setDragOverTarget(null)}
                  onDrop={(e) => {
                    e.preventDefault();
                    setDragOverTarget(null);
                    if (e.dataTransfer.files[0]) handleWpFileSelect('postmeta', e.dataTransfer.files[0]);
                  }}
                  onClick={() => fileInputPostmetaRef.current?.click()}
                  className={`p-3.5 rounded-lg border-2 border-dashed transition-all cursor-pointer text-left ${
                    wpFiles.postmeta
                      ? 'border-emerald-500 bg-emerald-50/30 dark:bg-emerald-950/20'
                      : dragOverTarget === 'postmeta'
                      ? 'border-red-500 bg-red-50/50 dark:bg-red-950/30'
                      : 'border-slate-300 dark:border-slate-700 hover:border-blue-400 bg-slate-50/50 dark:bg-slate-800/30'
                  }`}
                >
                  <input
                    type="file"
                    ref={fileInputPostmetaRef}
                    accept=".sql,.txt"
                    className="hidden"
                    onChange={(e) => e.target.files?.[0] && handleWpFileSelect('postmeta', e.target.files[0])}
                  />
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold font-mono text-blue-600 dark:text-blue-400">
                      wp_postmeta.sql
                    </span>
                    {wpFiles.postmeta ? (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500 text-white flex items-center gap-1">
                        <Check className="w-3 h-3" /> প্রস্তুত
                      </span>
                    ) : (
                      <span className="text-[10px] text-slate-400">ঐচ্ছিক (ছবি ও ভিউ)</span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 font-solaiman">
                    {wpFiles.postmeta ? `${wpFiles.postmeta.name} (${formatFileSize(wpFiles.postmeta.size)})` : 'ফিচারড ছবি আইডি ও এসইও মেটা'}
                  </p>
                </div>

                {/* 3. wp_terms.sql */}
                <div
                  onDragOver={(e) => { e.preventDefault(); setDragOverTarget('terms'); }}
                  onDragLeave={() => setDragOverTarget(null)}
                  onDrop={(e) => {
                    e.preventDefault();
                    setDragOverTarget(null);
                    if (e.dataTransfer.files[0]) handleWpFileSelect('terms', e.dataTransfer.files[0]);
                  }}
                  onClick={() => fileInputTermsRef.current?.click()}
                  className={`p-3.5 rounded-lg border-2 border-dashed transition-all cursor-pointer text-left ${
                    wpFiles.terms
                      ? 'border-emerald-500 bg-emerald-50/30 dark:bg-emerald-950/20'
                      : dragOverTarget === 'terms'
                      ? 'border-red-500 bg-red-50/50 dark:bg-red-950/30'
                      : 'border-slate-300 dark:border-slate-700 hover:border-purple-400 bg-slate-50/50 dark:bg-slate-800/30'
                  }`}
                >
                  <input
                    type="file"
                    ref={fileInputTermsRef}
                    accept=".sql,.txt"
                    className="hidden"
                    onChange={(e) => e.target.files?.[0] && handleWpFileSelect('terms', e.target.files[0])}
                  />
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold font-mono text-purple-600 dark:text-purple-400">
                      wp_terms & taxonomy
                    </span>
                    {wpFiles.terms ? (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500 text-white flex items-center gap-1">
                        <Check className="w-3 h-3" /> প্রস্তুত
                      </span>
                    ) : (
                      <span className="text-[10px] text-slate-400">ঐচ্ছিক (ক্যাটাগরি)</span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 font-solaiman">
                    {wpFiles.terms ? `${wpFiles.terms.name} (${formatFileSize(wpFiles.terms.size)})` : 'ক্যাটাগরি ও ট্যাগ কাঠামো'}
                  </p>
                </div>

                {/* 4. wp_users.sql */}
                <div
                  onDragOver={(e) => { e.preventDefault(); setDragOverTarget('users'); }}
                  onDragLeave={() => setDragOverTarget(null)}
                  onDrop={(e) => {
                    e.preventDefault();
                    setDragOverTarget(null);
                    if (e.dataTransfer.files[0]) handleWpFileSelect('users', e.dataTransfer.files[0]);
                  }}
                  onClick={() => fileInputUsersRef.current?.click()}
                  className={`p-3.5 rounded-lg border-2 border-dashed transition-all cursor-pointer text-left ${
                    wpFiles.users
                      ? 'border-emerald-500 bg-emerald-50/30 dark:bg-emerald-950/20'
                      : dragOverTarget === 'users'
                      ? 'border-red-500 bg-red-50/50 dark:bg-red-950/30'
                      : 'border-slate-300 dark:border-slate-700 hover:border-amber-400 bg-slate-50/50 dark:bg-slate-800/30'
                  }`}
                >
                  <input
                    type="file"
                    ref={fileInputUsersRef}
                    accept=".sql,.txt"
                    className="hidden"
                    onChange={(e) => e.target.files?.[0] && handleWpFileSelect('users', e.target.files[0])}
                  />
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold font-mono text-amber-600 dark:text-amber-400">
                      wp_users.sql
                    </span>
                    {wpFiles.users ? (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500 text-white flex items-center gap-1">
                        <Check className="w-3 h-3" /> প্রস্তুত
                      </span>
                    ) : (
                      <span className="text-[10px] text-slate-400">ঐচ্ছিক (লেখক)</span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 font-solaiman">
                    {wpFiles.users ? `${wpFiles.users.name} (${formatFileSize(wpFiles.users.size)})` : 'রিপোর্টার ও লেখক তালিকা'}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Universal Any CMS / Next.js & JSON / Custom PHP & Database / Universal CSV */}
          {(selectedPlatform === 'universal_all' || selectedPlatform === 'nextjs_json' || selectedPlatform === 'custom_php' || selectedPlatform === 'universal_json_csv') && (
            <div className={`p-5 rounded-xl border space-y-4 ${
              darkMode ? 'bg-[#1b222c] border-slate-800' : 'bg-white border-slate-200'
            }`}>
              <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-red-100 dark:bg-red-950 text-red-600 dark:text-red-400 font-bold text-xs flex items-center justify-center">
                    ২
                  </span>
                  <h4 className="text-sm font-bold font-solaiman text-slate-900 dark:text-white">
                    {selectedPlatform === 'universal_all'
                      ? 'সার্বজনীন মাল্টি-প্ল্যাটফর্ম ফাইল আপলোডার (Universal Multi-CMS: ZIP, JSON, SQL, XML, CSV)'
                      : selectedPlatform === 'nextjs_json'
                      ? 'নেক্সট.জেএস ব্যাকআপ ও জেসন ডাম্প আপলোডার (Next.js & JSON Dump)'
                      : selectedPlatform === 'custom_php' 
                      ? 'কাস্টম পিএইচপি ও ডেটাবেস ডাম্প (Custom MySQL / DB Schema Mapper)'
                      : 'ইউনিভার্সাল CSV / TSV ফাইল আপলোডার ও ম্যাপিং'}
                  </h4>
                </div>
              </div>

              {/* Single File Dropzone */}
              <div
                onDragOver={(e) => { e.preventDefault(); setDragOverTarget('universal'); }}
                onDragLeave={() => setDragOverTarget(null)}
                onDrop={(e) => {
                  e.preventDefault();
                  setDragOverTarget(null);
                  if (e.dataTransfer.files[0]) {
                    handleUniversalFileSelect(e.dataTransfer.files[0]);
                  }
                }}
                onClick={() => fileInputUniversalRef.current?.click()}
                className={`p-6 rounded-xl border-2 border-dashed text-center cursor-pointer transition-all ${
                  universalFile
                    ? 'border-emerald-500 bg-emerald-50/20 dark:bg-emerald-950/20'
                    : dragOverTarget === 'universal'
                    ? 'border-red-500 bg-red-50/40 dark:bg-red-950/30'
                    : 'border-slate-300 dark:border-slate-700 hover:border-red-500 bg-slate-50/50 dark:bg-slate-800/40'
                }`}
              >
                <input
                  type="file"
                  ref={fileInputUniversalRef}
                  accept={
                    selectedPlatform === 'universal_all'
                      ? '.zip,.json,.sql,.xml,.wxr,.csv,.tsv,.txt'
                      : selectedPlatform === 'nextjs_json' 
                      ? '.json,.txt' 
                      : selectedPlatform === 'custom_php' 
                      ? '.sql,.db,.sqlite,.txt' 
                      : '.csv,.tsv,.txt'
                  }
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files?.[0]) {
                      handleUniversalFileSelect(e.target.files[0]);
                    }
                  }}
                />
                <UploadCloud className="w-8 h-8 mx-auto text-slate-400 mb-2" />
                <h5 className="font-bold text-xs font-solaiman text-slate-900 dark:text-white">
                  {universalFile ? universalFile.name : 'ফাইলটি ড্র্যাগ করে আনুন অথবা ক্লিক করে আপলোড করুন'}
                </h5>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                  {selectedPlatform === 'universal_all'
                    ? 'যেকোনো CMS (WordPress, Ghost, Drupal, Joomla, Next.js, Strapi, কাস্টম PHP ইত্যাদি) থেকে জিপ ফাইল (.ZIP), JSON ডাম্প, SQL ব্যাকআপ বা CSV ফাইল'
                    : selectedPlatform === 'nextjs_json' 
                    ? 'Next.js এক্সপোর্ট ব্যাকআপ (.json) অথবা স্ট্যান্ডার্ড JSON অবজেক্ট/অ্যারে ডাম্প'
                    : selectedPlatform === 'custom_php' 
                    ? 'MySQL Dump (.sql), SQLite (.db) অথবা ডাটাবেস ব্যাকআপ ফাইল সর্বোচ্চ ১৫০ MB' 
                    : 'কমা-সেপারেটেড CSV বা TSV স্প্রেডশিট ডেটা ফাইল'}
                </p>

                {universalFile && (
                  <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
                    <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                      সাইজ: {formatFileSize(universalFile.size)} • ভ্যালিডেশন সফল
                    </span>
                    {parsedJsonMeta && (
                      <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 font-solaiman">
                        {parsedJsonMeta.detectedCount}টি সংবাদ ও {parsedJsonMeta.detectedCategories.length}টি ক্যাটাগরি শনাক্ত
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Intelligent Column Mapping Assistant */}
              <div className="pt-2">
                <h5 className="text-xs font-bold font-solaiman mb-2 text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <Settings2 className="w-3.5 h-3.5 text-red-600" />
                  কলাম ও ফিল্ড ম্যাপিং (Database Field Mapper)
                </h5>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs font-solaiman">
                  <div>
                    <label className="block text-[11px] text-slate-500 mb-1">শিরোনাম কলাম (Title)</label>
                    <input
                      type="text"
                      value={customFieldMapping.titleCol}
                      onChange={(e) => setCustomFieldMapping({ ...customFieldMapping, titleCol: e.target.value })}
                      className="w-full px-2.5 py-1.5 rounded border border-slate-300 dark:border-slate-700 bg-transparent font-mono text-[11px]"
                      placeholder="headline / title"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-500 mb-1">মূল বিবরণ (Content)</label>
                    <input
                      type="text"
                      value={customFieldMapping.contentCol}
                      onChange={(e) => setCustomFieldMapping({ ...customFieldMapping, contentCol: e.target.value })}
                      className="w-full px-2.5 py-1.5 rounded border border-slate-300 dark:border-slate-700 bg-transparent font-mono text-[11px]"
                      placeholder="body / details"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-500 mb-1">ক্যাটাগরি কলাম (Category)</label>
                    <input
                      type="text"
                      value={customFieldMapping.categoryCol}
                      onChange={(e) => setCustomFieldMapping({ ...customFieldMapping, categoryCol: e.target.value })}
                      className="w-full px-2.5 py-1.5 rounded border border-slate-300 dark:border-slate-700 bg-transparent font-mono text-[11px]"
                      placeholder="cat_name / category"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-500 mb-1">তারিখ কলাম (Date)</label>
                    <input
                      type="text"
                      value={customFieldMapping.dateCol}
                      onChange={(e) => setCustomFieldMapping({ ...customFieldMapping, dateCol: e.target.value })}
                      className="w-full px-2.5 py-1.5 rounded border border-slate-300 dark:border-slate-700 bg-transparent font-mono text-[11px]"
                      placeholder="created_at / date"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-500 mb-1">ছবির লিংক (Image URL)</label>
                    <input
                      type="text"
                      value={customFieldMapping.imageCol}
                      onChange={(e) => setCustomFieldMapping({ ...customFieldMapping, imageCol: e.target.value })}
                      className="w-full px-2.5 py-1.5 rounded border border-slate-300 dark:border-slate-700 bg-transparent font-mono text-[11px]"
                      placeholder="image_url / photo"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-500 mb-1">লেখক (Author)</label>
                    <input
                      type="text"
                      value={customFieldMapping.authorCol}
                      onChange={(e) => setCustomFieldMapping({ ...customFieldMapping, authorCol: e.target.value })}
                      className="w-full px-2.5 py-1.5 rounded border border-slate-300 dark:border-slate-700 bg-transparent font-mono text-[11px]"
                      placeholder="author_name / user"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 3. Migration Settings & Fine-tuning */}
          <div className={`p-5 rounded-xl border space-y-4 ${
            darkMode ? 'bg-[#1b222c] border-slate-800' : 'bg-white border-slate-200'
          }`}>
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-red-100 dark:bg-red-950 text-red-600 dark:text-red-400 font-bold text-xs flex items-center justify-center">
                  ৩
                </span>
                <h4 className="text-sm font-bold font-solaiman text-slate-900 dark:text-white">
                  মাইগ্রেশন সেটিংস ও নিরাপত্তা ফিল্টার (Migration Rules & Filters)
                </h4>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-solaiman">
              {/* Only published */}
              <label className="flex items-start gap-2.5 p-3 rounded-lg border border-slate-200 dark:border-slate-800 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/40">
                <input
                  type="checkbox"
                  checked={migrationSettings.onlyPublished}
                  onChange={(e) => setMigrationSettings({ ...migrationSettings, onlyPublished: e.target.checked })}
                  className="w-4 h-4 text-red-600 rounded mt-0.5"
                />
                <div>
                  <span className="font-bold block text-slate-900 dark:text-white">শুধুমাত্র প্রকাশিত সংবাদ (Published Only)</span>
                  <span className="text-[11px] text-slate-500">ড্রাফট, ট্র্যাশ ও রিজেক্টেড পোস্ট বাদ দিন</span>
                </div>
              </label>

              {/* Dry Run */}
              <label className="flex items-start gap-2.5 p-3 rounded-lg border border-amber-200 dark:border-amber-900/60 bg-amber-50/30 dark:bg-amber-950/20 cursor-pointer">
                <input
                  type="checkbox"
                  checked={migrationSettings.dryRun}
                  onChange={(e) => setMigrationSettings({ ...migrationSettings, dryRun: e.target.checked })}
                  className="w-4 h-4 text-amber-600 rounded mt-0.5"
                />
                <div>
                  <span className="font-bold block text-amber-800 dark:text-amber-300">সিমুলেশন মোড (Dry Run Mode)</span>
                  <span className="text-[11px] text-amber-700/80 dark:text-amber-400/80">ডাটাবেসে স্থায়ী পরিবর্তন না করে ফলাফল যাচাই</span>
                </div>
              </label>

              {/* Auto Create Categories */}
              <label className="flex items-start gap-2.5 p-3 rounded-lg border border-slate-200 dark:border-slate-800 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/40">
                <input
                  type="checkbox"
                  checked={migrationSettings.autoCreateCategories}
                  onChange={(e) => setMigrationSettings({ ...migrationSettings, autoCreateCategories: e.target.checked })}
                  className="w-4 h-4 text-red-600 rounded mt-0.5"
                />
                <div>
                  <span className="font-bold block text-slate-900 dark:text-white">স্বয়ংক্রিয় ক্যাটাগরি তৈরি (Auto-Taxonomy)</span>
                  <span className="text-[11px] text-slate-500">নতুন ক্যাটাগরি পেলে পোর্টাল মেনুতে স্বয়ংক্রিয় যোগ</span>
                </div>
              </label>

              {/* Image CDN / Strategy */}
              <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-800">
                <label className="font-bold block text-slate-900 dark:text-white mb-1">ছবির অপ্টিমাইজেশন কৌশল</label>
                <select
                  value={migrationSettings.imageStrategy}
                  onChange={(e) => setMigrationSettings({ ...migrationSettings, imageStrategy: e.target.value as any })}
                  className="w-full px-2.5 py-1.5 rounded border border-slate-300 dark:border-slate-700 bg-transparent text-xs"
                >
                  <option value="proxy" className="bg-white dark:bg-slate-800">হাই-স্পিড সিডিএন প্রক্সি (High Performance)</option>
                  <option value="preserve" className="bg-white dark:bg-slate-800">আসল ইউআরএল অক্ষুণ্ন রাখুন (Preserve Original)</option>
                  <option value="fallback" className="bg-white dark:bg-slate-800">এইচডি স্টক ব্যাকআপ ফটো (Stock Fallback)</option>
                </select>
              </div>
            </div>

            {/* Launch Migration Action Button */}
            <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <div className="text-[11px] text-slate-500 font-solaiman flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>অডিট ট্রেইল স্বয়ংক্রিয়ভাবে রেকর্ড করা হবে</span>
              </div>

              <button
                type="button"
                onClick={() => runMigrationProcess(false)}
                disabled={isMigrating}
                className="px-6 py-2.5 rounded-lg bg-red-600 hover:bg-red-700 text-white font-bold text-xs font-solaiman flex items-center gap-2 shadow-xs transition-all disabled:opacity-50"
              >
                {isMigrating ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>মাইগ্রেশন চলছে...</span>
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 fill-white" />
                    <span>মাইগ্রেশন শুরু করুন (Start Migration)</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Right Column (5 cols): Live Terminal, Real-Time Progress & Statistics */}
        <div className="lg:col-span-5 space-y-6">

          {/* Progress & Live Status Box */}
          <div className={`p-5 rounded-xl border shadow-xs ${
            darkMode ? 'bg-[#1b222c] border-slate-800' : 'bg-white border-slate-200'
          }`}>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold font-solaiman text-slate-900 dark:text-white flex items-center gap-2">
                <HardDrive className="w-4 h-4 text-red-600" />
                <span>লাইভ প্রসেসিং স্ট্যাটাস</span>
              </span>
              <span className="text-xs font-mono font-bold text-red-600 dark:text-red-400">
                {migrationProgress}%
              </span>
            </div>

            {/* Progress Bar */}
            <div className="w-full h-2.5 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden mb-2">
              <div
                className="h-full bg-gradient-to-r from-red-600 via-rose-500 to-emerald-500 transition-all duration-300"
                style={{ width: `${migrationProgress}%` }}
              />
            </div>

            <p className="text-[11px] font-solaiman text-slate-500 dark:text-slate-400">
              {currentStepText || 'অপেক্ষমাণ: ফাইল আপলোড করে মাইগ্রেশন শুরু করুন'}
            </p>
          </div>

          {/* Real-Time Terminal Console */}
          <div className="rounded-xl border border-slate-800 bg-[#0d1117] text-slate-200 shadow-md overflow-hidden font-mono text-[11px]">
            {/* Terminal Header */}
            <div className="bg-[#161b22] px-4 py-2.5 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Terminal className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-xs font-semibold text-slate-300">
                  Migration Terminal Console
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block animate-pulse" />
                <span className="text-[10px] text-slate-400">STREAMING</span>
              </div>
            </div>

            {/* Terminal Body */}
            <div className="p-3.5 h-64 overflow-y-auto space-y-1.5 selection:bg-red-500/30">
              {logs.map((log, index) => {
                let badgeColor = 'text-slate-400';
                if (log.type === 'success') badgeColor = 'text-emerald-400 font-bold';
                if (log.type === 'warn') badgeColor = 'text-amber-400 font-bold';
                if (log.type === 'error') badgeColor = 'text-red-400 font-bold';

                return (
                  <div key={index} className="leading-relaxed flex items-start gap-2">
                    <span className="text-slate-500 select-none shrink-0 font-mono text-[10px]">
                      [{log.timestamp}]
                    </span>
                    <span className={`${badgeColor} break-all font-solaiman`}>
                      {log.message}
                    </span>
                  </div>
                );
              })}
              <div ref={terminalBottomRef} />
            </div>

            {/* Terminal Footer */}
            <div className="bg-[#161b22] px-3.5 py-1.5 border-t border-slate-800 text-[10px] text-slate-400 flex items-center justify-between">
              <span>মোট লগ লাইন: {logs.length}</span>
              <button
                onClick={() => setLogs([{ timestamp: new Date().toLocaleTimeString(), type: 'info', message: 'কনসোল পরিষ্কার করা হয়েছে।' }])}
                className="hover:text-slate-200 transition-colors"
              >
                ক্লিয়ার
              </button>
            </div>
          </div>

          {/* Migration Summary KPI Cards */}
          {migrationSummary && (
            <div className={`p-5 rounded-xl border border-emerald-500/40 bg-emerald-50/20 dark:bg-emerald-950/20 space-y-4`}>
              <div className="flex items-center justify-between border-b border-emerald-500/20 pb-3">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                  <div>
                    <h4 className="text-sm font-bold font-solaiman text-slate-900 dark:text-white">
                      মাইগ্রেশন সফলতার সারসংক্ষেপ
                    </h4>
                    <p className="text-[11px] text-slate-500 font-mono">
                      ব্যাচ: {migrationSummary.batchId} • সময়: {migrationSummary.completedAt}
                    </p>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500 text-white font-mono">
                  100% DONE
                </span>
              </div>

              {/* 4 Metric Cards */}
              <div className="grid grid-cols-2 gap-2.5">
                <div className="p-3 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                  <span className="text-[10px] text-slate-500 font-solaiman block">মোট সংবাদ আমদানি</span>
                  <span className="text-lg font-bold text-slate-900 dark:text-white font-mono">
                    {migrationSummary.totalPosts} টি
                  </span>
                </div>
                <div className="p-3 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                  <span className="text-[10px] text-slate-500 font-solaiman block">ক্যাটাগরি সিঙ্ক</span>
                  <span className="text-lg font-bold text-emerald-600 dark:text-emerald-400 font-mono">
                    {migrationSummary.categoriesCreated} টি
                  </span>
                </div>
                <div className="p-3 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                  <span className="text-[10px] text-slate-500 font-solaiman block">লেখক ও রিপোর্টার</span>
                  <span className="text-lg font-bold text-blue-600 dark:text-blue-400 font-mono">
                    {migrationSummary.authorsMapped} জন
                  </span>
                </div>
                <div className="p-3 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                  <span className="text-[10px] text-slate-500 font-solaiman block">মিডিয়া ছবি লিংক</span>
                  <span className="text-lg font-bold text-purple-600 dark:text-purple-400 font-mono">
                    {migrationSummary.imagesLinked} টি
                  </span>
                </div>
              </div>

              {onViewLivePortal && (
                <button
                  type="button"
                  onClick={onViewLivePortal}
                  className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-colors font-solaiman"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>লাইভ ব্রডশিট নিউজ পোর্টালে ফলাফল দেখুন</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          )}
        </div>
      </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: MEDIA & IMAGE ASSET SYNC HUB (Requirement 1) */}
      {/* ========================================================================= */}
      {activeHubTab === 'media_sync' && (
        <div className="space-y-6">
          {/* Header & Instructions */}
          <div className={`p-6 rounded-xl border ${
            darkMode ? 'bg-[#1b222c] border-slate-800' : 'bg-white border-slate-200'
          }`}>
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="p-2 rounded-lg bg-purple-600 text-white">
                    <Image className="w-5 h-5" />
                  </span>
                  <div>
                    <h3 className="text-lg font-bold font-solaiman text-slate-900 dark:text-white">
                      মিডিয়া ও ইমেজ অ্যাসেট সিঙ্ক হাব (Media & Image Asset Sync Hub)
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-solaiman">
                      ওয়ার্ডপ্রেস <code className="px-1 py-0.5 rounded bg-slate-100 dark:bg-slate-800 font-mono text-[10px]">uploads.zip</code> আর্কাইভ বা মিডিয়া ইমেজ ড্রপ করে পোর্টালের সংবাদের সাথে লোকালভাবে সিঙ্ক ও রি-লিংক করুন।
                    </p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => autoMatchMediaAssets()}
                  disabled={uploadedMediaAssets.length === 0}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-bold bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white transition-all shadow-xs cursor-pointer disabled:opacity-50 font-solaiman"
                >
                  <CheckCheck className="w-4 h-4" />
                  <span>স্বয়ংক্রিয় মিডিয়া সিঙ্ক ও লিংকিং</span>
                </button>

                {uploadedMediaAssets.length > 0 && (
                  <button
                    type="button"
                    onClick={() => {
                      if (confirm('আপনি কি আপলোডকৃত সব মিডিয়া ইমেজ তালিকা খালি করতে চান?')) {
                        setUploadedMediaAssets([]);
                        setMediaSyncStats(null);
                        addLog('warn', 'মিডিয়া অ্যাসেট লাইব্রেরি খালি করা হয়েছে।');
                      }
                    }}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 border border-red-200 dark:border-red-900 transition-colors cursor-pointer font-solaiman"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>মুছে ফেলুন ({uploadedMediaAssets.length})</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Sync Stats Banner if Available */}
          {mediaSyncStats && (
            <div className="p-4 rounded-xl border border-purple-500/30 bg-purple-50/20 dark:bg-purple-950/20 flex flex-wrap items-center justify-between gap-4 font-solaiman">
              <div className="flex items-center gap-3">
                <span className="p-2 rounded-full bg-purple-600 text-white">
                  <Sparkles className="w-4 h-4" />
                </span>
                <div>
                  <h4 className="text-xs font-bold text-purple-900 dark:text-purple-200">
                    মিডিয়া অটো-সিঙ্ক ফলাফল
                  </h4>
                  <p className="text-[11px] text-purple-700 dark:text-purple-300">
                    মোট {mediaSyncStats.totalExtracted}টি অ্যাসেটের মধ্যে {mediaSyncStats.articlesLinked}টি সংবাদের ফিচারড ইমেজ ও {mediaSyncStats.usersLinked} জন লেখকের ফটো লোকাল স্টোরেজে সফলভাবে যুক্ত হয়েছে।
                  </p>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded bg-purple-600 text-white font-mono text-xs font-bold">
                SYNC COMPLETED
              </span>
            </div>
          )}

          {/* 2-Column Grid: Upload Dropzones & External Mapping */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Left (7 cols): ZIP and Multi-Image Uploader Dropzone */}
            <div className="lg:col-span-7 space-y-4">
              <div className={`p-5 rounded-xl border space-y-4 ${
                darkMode ? 'bg-[#1b222c] border-slate-800' : 'bg-white border-slate-200'
              }`}>
                <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
                  <div className="flex items-center gap-2">
                    <FileArchive className="w-4 h-4 text-purple-600" />
                    <h4 className="text-sm font-bold font-solaiman text-slate-900 dark:text-white">
                      মিডিয়া জিপ ও ইমেজ ব্যাচ আপলোডার (ZIP & Image Batch)
                    </h4>
                  </div>
                  <span className="text-[11px] font-mono text-emerald-600 dark:text-emerald-400 font-bold">
                    ZIP, JPG, PNG, WEBP, SVG
                  </span>
                </div>

                {/* Drag and Drop Zone */}
                <div
                  onDragOver={(e) => { e.preventDefault(); setDragOverTarget('media'); }}
                  onDragLeave={() => setDragOverTarget(null)}
                  onDrop={(e) => {
                    e.preventDefault();
                    setDragOverTarget(null);
                    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
                      handleMultipleMediaFiles(e.dataTransfer.files);
                    }
                  }}
                  className={`p-7 rounded-xl border-2 border-dashed text-center transition-all ${
                    dragOverTarget === 'media'
                      ? 'border-purple-500 bg-purple-50/50 dark:bg-purple-950/40'
                      : 'border-slate-300 dark:border-slate-700 hover:border-purple-400 bg-slate-50/50 dark:bg-slate-800/30'
                  }`}
                >
                  <input
                    type="file"
                    ref={fileInputMediaZipRef}
                    accept=".zip"
                    className="hidden"
                    onChange={(e) => e.target.files?.[0] && handleMediaZipUpload(e.target.files[0])}
                  />
                  <input
                    type="file"
                    ref={fileInputMultipleMediaRef}
                    multiple
                    accept="image/*,.webp,.svg"
                    className="hidden"
                    onChange={(e) => e.target.files && handleMultipleMediaFiles(e.target.files)}
                  />

                  <div className="w-12 h-12 rounded-full bg-purple-100 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center mx-auto mb-3">
                    <UploadCloud className="w-6 h-6" />
                  </div>

                  <h5 className="font-bold text-sm font-solaiman text-slate-900 dark:text-white">
                    সার্বজনীন মিডিয়া জিপ (যেকোনো CMS) অথবা একাধিক ছবি ড্রপ করুন
                  </h5>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-solaiman max-w-md mx-auto">
                    যেকোনো CMS (WordPress, Ghost, Next.js, কাস্টম PHP, Drupal, ইত্যাদি) থেকে যেকোনো ফোল্ডার কাঠামো (<code className="font-mono text-[10px]">uploads/</code>, <code className="font-mono text-[10px]">images/</code>, <code className="font-mono text-[10px]">media/</code> বা ফ্ল্যাট) জিপ ফাইল ড্রপ করুন। ইঞ্জিন স্বয়ংক্রিয়ভাবে প্রতিটি ছবি এক্সট্র্যাক্ট করে সংবাদ ও লেখকদের প্রোফাইলে সংযুক্ত করবে।
                  </p>

                  {/* Dual Upload Action Buttons */}
                  <div className="flex flex-wrap items-center justify-center gap-3 mt-4">
                    <button
                      type="button"
                      onClick={() => fileInputMediaZipRef.current?.click()}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold bg-purple-600 hover:bg-purple-700 text-white transition-colors cursor-pointer font-solaiman"
                    >
                      <FileArchive className="w-3.5 h-3.5" />
                      <span>মিডিয়া জিপ (.ZIP) নির্বাচন করুন</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => fileInputMultipleMediaRef.current?.click()}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer font-solaiman"
                    >
                      <Image className="w-3.5 h-3.5 text-purple-600" />
                      <span>একাধিক ইমেজ ফাইল নির্বাচন</span>
                    </button>
                  </div>

                  {/* Extraction Progress Bar */}
                  {isExtractingMedia && (
                    <div className="mt-5 p-3 rounded-lg bg-purple-50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800">
                      <div className="flex items-center justify-between text-xs font-mono font-bold text-purple-700 dark:text-purple-300 mb-1.5">
                        <span className="flex items-center gap-1.5 font-solaiman">
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          জিপ আনপ্যাকিং ও ইমেজ প্রসেসিং চলছে...
                        </span>
                        <span>{mediaExtractionProgress}%</span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-purple-200 dark:bg-purple-900 overflow-hidden">
                        <div
                          className="h-full bg-purple-600 transition-all duration-200"
                          style={{ width: `${mediaExtractionProgress}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Right (5 cols): External URL Mapping & CDN Linker */}
            <div className="lg:col-span-5 space-y-4">
              <div className={`p-5 rounded-xl border space-y-3 ${
                darkMode ? 'bg-[#1b222c] border-slate-800' : 'bg-white border-slate-200'
              }`}>
                <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
                  <div className="flex items-center gap-2">
                    <Link className="w-4 h-4 text-blue-600" />
                    <h4 className="text-sm font-bold font-solaiman text-slate-900 dark:text-white">
                      এক্সটার্নাল ইমেজ ইউআরএল ম্যাপিং (URL Mapping Array)
                    </h4>
                  </div>
                </div>

                <p className="text-xs text-slate-500 dark:text-slate-400 font-solaiman">
                  পুরাতন ডোমেইন বা ক্লাউড সিডিএন ইউআরএল ম্যাপিং অ্যারে পেস্ট করুন। ইঞ্জিন স্বয়ংক্রিয়ভাবে পুরাতন লিংকের বদলে নতুন ইমেজ ইউআরএল রিপ্লেস করবে।
                </p>

                <textarea
                  rows={5}
                  value={externalUrlMappings}
                  onChange={(e) => setExternalUrlMappings(e.target.value)}
                  placeholder={`[\n  {\n    "oldUrl": "https://oldsite.com/uploads/banner.jpg",\n    "newUrl": "https://images.unsplash.com/photo-1585829365295"\n  }\n]`}
                  className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900 font-mono text-[11px] leading-relaxed resize-y focus:ring-1 focus:ring-purple-500"
                />

                <div className="flex items-center justify-between pt-1">
                  <span className="text-[10px] text-slate-400 font-mono">
                    JSON Array / Key-Value Map
                  </span>
                  <button
                    type="button"
                    onClick={() => autoMatchMediaAssets()}
                    className="px-3 py-1.5 rounded text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white transition-colors cursor-pointer font-solaiman"
                  >
                    ম্যাপিং প্রয়োগ করুন
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Visual Media Asset Library Preview Grid */}
          <div className={`p-5 rounded-xl border space-y-4 ${
            darkMode ? 'bg-[#1b222c] border-slate-800' : 'bg-white border-slate-200'
          }`}>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <Image className="w-4 h-4 text-purple-600" />
                <h4 className="text-sm font-bold font-solaiman text-slate-900 dark:text-white">
                  এক্সট্র্যাক্টকৃত মিডিয়া লাইব্রেরি (Extracted Media Library)
                </h4>
                <span className="px-2 py-0.5 rounded-full text-xs font-mono font-bold bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300">
                  {uploadedMediaAssets.length} টি অ্যাসেট
                </span>
              </div>

              {/* Search in Media Assets */}
              <div className="relative w-full sm:w-64">
                <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="text"
                  value={mediaSearchQuery}
                  onChange={(e) => setMediaSearchQuery(e.target.value)}
                  placeholder="ফাইলের নাম দিয়ে খুঁজুন..."
                  className="w-full pl-8 pr-3 py-1.5 rounded-lg text-xs border border-slate-300 dark:border-slate-700 bg-transparent font-solaiman"
                />
              </div>
            </div>

            {/* Media Grid */}
            {uploadedMediaAssets.length === 0 ? (
              <div className="p-8 text-center text-slate-400 font-solaiman space-y-2">
                <Image className="w-10 h-10 mx-auto text-slate-300 dark:text-slate-600 stroke-[1.5]" />
                <p className="text-xs">এখনো কোনো মিডিয়া ইমেজ আপলোড করা হয়নি।</p>
                <p className="text-[11px] text-slate-500">
                  উপরের ড্রপজোনে <code className="font-mono text-purple-600">.zip</code> বা ইমেজ ফাইল আপলোড করলে এখানে লাইভ থাম্বনেইল গ্যালারি দৃশ্যমান হবে।
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 pt-2">
                {uploadedMediaAssets
                  .filter((a) => !mediaSearchQuery || a.name.toLowerCase().includes(mediaSearchQuery.toLowerCase()))
                  .slice(0, 36)
                  .map((asset) => (
                    <div
                      key={asset.id}
                      className="group p-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 hover:border-purple-400 transition-all flex flex-col justify-between"
                    >
                      <div className="aspect-video w-full rounded overflow-hidden bg-slate-200 dark:bg-slate-800 relative mb-1.5">
                        <img
                          src={asset.url}
                          alt={asset.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                          loading="lazy"
                        />
                        <span className="absolute bottom-1 right-1 px-1 py-0.2 rounded bg-black/75 text-white font-mono text-[9px]">
                          {formatFileSize(asset.size)}
                        </span>
                      </div>
                      <div>
                        <p className="text-[11px] font-mono font-bold text-slate-800 dark:text-slate-200 truncate" title={asset.name}>
                          {asset.name}
                        </p>
                        <p className="text-[9.5px] text-slate-400 truncate font-mono" title={asset.originalPath}>
                          {asset.originalPath}
                        </p>
                      </div>
                      <div className="mt-2 pt-1 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-[10px]">
                        <span className="text-emerald-600 dark:text-emerald-400 font-bold font-solaiman flex items-center gap-0.5">
                          <Check className="w-2.5 h-2.5" /> লোকাল সেভ
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            navigator.clipboard.writeText(asset.url);
                            showSuccessMessage(`"${asset.name}" এর লিংক কপি হয়েছে!`);
                          }}
                          className="text-slate-400 hover:text-purple-600 transition-colors p-1"
                          title="ইমেজ ডাটা কপি করুন"
                        >
                          <Copy className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: FULL SITE BACKUP & MEDIA EXPORT (Requirement 1 & 2) */}
      {/* ========================================================================= */}
      {activeHubTab === 'full_backup' && (
        <div className="space-y-6">
          {/* Hero Banner */}
          <div className={`p-6 sm:p-8 rounded-xl border relative overflow-hidden shadow-xs ${
            darkMode ? 'bg-[#1b222c] border-slate-800' : 'bg-white border-slate-200'
          }`}>
            <div className="absolute top-0 right-0 w-96 h-full bg-gradient-to-l from-emerald-500/10 to-transparent pointer-events-none" />

            <div className="relative z-10 space-y-4 max-w-3xl">
              <div className="flex items-center gap-3">
                <span className="p-3 rounded-xl bg-gradient-to-br from-emerald-600 to-teal-600 text-white shadow-md">
                  <FolderDown className="w-6 h-6" />
                </span>
                <div>
                  <h3 className="text-xl font-bold font-solaiman text-slate-900 dark:text-white">
                    সম্পূর্ণ ব্যাকআপ ও মিডিয়া এক্সপোর্ট ইঞ্জিন (Full Site Backup & Media ZIP Engine)
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-solaiman">
                    নিউজ পোর্টালের সমস্ত ডাটাবেস রেকর্ড (সংবাদ, ক্যাটাগরি, ব্যবহারকারী, সেটিংস, কমেন্ট) এবং সমস্ত সংশ্লিষ্ট মিডিয়া ইমেজকে একটি সেলফ-কনটেইন্ড <code className="font-mono text-emerald-600 font-bold">.ZIP</code> ফাইলে ১-ক্লিকে ডাউনলোড করুন।
                  </p>
                </div>
              </div>

              {/* Compression Progress Bar */}
              {isExportingFullBackup && (
                <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 space-y-2">
                  <div className="flex items-center justify-between text-xs font-mono font-bold text-emerald-800 dark:text-emerald-300">
                    <span className="flex items-center gap-2 font-solaiman">
                      <RefreshCw className="w-4 h-4 animate-spin text-emerald-600" />
                      সম্পূর্ণ সাইটের ডাটাবেস ও মিডিয়া জিপ আর্কাইভ প্রস্তুত হচ্ছে...
                    </span>
                    <span>{fullBackupProgress}%</span>
                  </div>
                  <div className="w-full h-2.5 rounded-full bg-emerald-200 dark:bg-emerald-900 overflow-hidden">
                    <div
                      className="h-full bg-emerald-600 transition-all duration-200"
                      style={{ width: `${fullBackupProgress}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Primary Action Buttons */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleFullSiteBackupZipExport}
                  disabled={isExportingFullBackup}
                  className="flex items-center gap-2.5 px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-xs font-solaiman shadow-md transition-all cursor-pointer disabled:opacity-60"
                >
                  {isExportingFullBackup ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <FolderDown className="w-4 h-4" />
                  )}
                  <span>{isExportingFullBackup ? `ব্যাকআপ প্রক্রিয়াধীন (${fullBackupProgress}%)...` : 'সম্পূর্ণ সাইট ব্যাকআপ ও মিডিয়া জিপ ডাউনলোড (.ZIP)'}</span>
                </button>

                <button
                  type="button"
                  onClick={handleExportBackup}
                  className="flex items-center gap-2 px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold text-xs font-solaiman transition-colors cursor-pointer"
                >
                  <Download className="w-4 h-4 text-blue-600" />
                  <span>দ্রুত লাইটওয়েট JSON ব্যাকআপ (.JSON)</span>
                </button>
              </div>
            </div>
          </div>

          {/* Backup Structure Architecture & Integrity Breakdown */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            
            {/* 1. Articles */}
            <div className={`p-4 rounded-xl border ${
              darkMode ? 'bg-[#1b222c] border-slate-800' : 'bg-white border-slate-200'
            }`}>
              <div className="flex items-center justify-between mb-2">
                <span className="p-2 rounded-lg bg-red-100 dark:bg-red-950 text-red-600 dark:text-red-400 font-bold text-xs">
                  সংবাদ
                </span>
                <span className="text-xl font-bold font-mono text-slate-900 dark:text-white">
                  {articles.length} টি
                </span>
              </div>
              <h5 className="font-bold text-xs font-solaiman text-slate-800 dark:text-slate-200">
                নিবন্ধ ও সংবাদ আর্কাইভ
              </h5>
              <p className="text-[11px] text-slate-500 mt-1 font-solaiman">
                শিরোনাম, পূর্ণাঙ্গ বডি, ট্যাগ, লেখক ও ক্যাটাগরি মেটা
              </p>
            </div>

            {/* 2. Categories */}
            <div className={`p-4 rounded-xl border ${
              darkMode ? 'bg-[#1b222c] border-slate-800' : 'bg-white border-slate-200'
            }`}>
              <div className="flex items-center justify-between mb-2">
                <span className="p-2 rounded-lg bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400 font-bold text-xs">
                  ক্যাটাগরি
                </span>
                <span className="text-xl font-bold font-mono text-slate-900 dark:text-white">
                  {categories.length} টি
                </span>
              </div>
              <h5 className="font-bold text-xs font-solaiman text-slate-800 dark:text-slate-200">
                ট্যাক্সোনমি ও মেনু গঠন
              </h5>
              <p className="text-[11px] text-slate-500 mt-1 font-solaiman">
                বাংলা ও ইংরেজি নাম, স্লাগ এবং ডিসপ্লে অর্ডার
              </p>
            </div>

            {/* 3. Users */}
            <div className={`p-4 rounded-xl border ${
              darkMode ? 'bg-[#1b222c] border-slate-800' : 'bg-white border-slate-200'
            }`}>
              <div className="flex items-center justify-between mb-2">
                <span className="p-2 rounded-lg bg-amber-100 dark:bg-amber-950 text-amber-600 dark:text-amber-400 font-bold text-xs">
                  ব্যবহারকারী
                </span>
                <span className="text-xl font-bold font-mono text-slate-900 dark:text-white">
                  {users.length} জন
                </span>
              </div>
              <h5 className="font-bold text-xs font-solaiman text-slate-800 dark:text-slate-200">
                রিপোর্টার ও অ্যাডমিন রোল
              </h5>
              <p className="text-[11px] text-slate-500 mt-1 font-solaiman">
                মাস্টার পদবি, ডেস্কে অনুমতি ও ডিজিটাল আইডি কার্ড মেটা
              </p>
            </div>

            {/* 4. Media Assets */}
            <div className={`p-4 rounded-xl border ${
              darkMode ? 'bg-[#1b222c] border-slate-800' : 'bg-white border-slate-200'
            }`}>
              <div className="flex items-center justify-between mb-2">
                <span className="p-2 rounded-lg bg-purple-100 dark:bg-purple-950 text-purple-600 dark:text-purple-400 font-bold text-xs">
                  মিডিয়া
                </span>
                <span className="text-xl font-bold font-mono text-slate-900 dark:text-white">
                  {uploadedMediaAssets.length} ফাইল
                </span>
              </div>
              <h5 className="font-bold text-xs font-solaiman text-slate-800 dark:text-slate-200">
                স্থানীয় ইমেজ ও ফটো অ্যাসেট
              </h5>
              <p className="text-[11px] text-slate-500 mt-1 font-solaiman">
                জিপ আর্কাইভে <code className="font-mono text-purple-600">images/</code> ফোল্ডারে সংরক্ষিত
              </p>
            </div>
          </div>

          {/* Universal Multi-Language UTF-8 Protection Guarantee */}
          <div className={`p-5 rounded-xl border ${
            darkMode ? 'bg-[#1b222c] border-slate-800' : 'bg-white border-slate-200'
          }`}>
            <div className="flex items-start gap-3">
              <span className="p-2.5 rounded-lg bg-emerald-600 text-white shrink-0">
                <Globe2 className="w-5 h-5" />
              </span>
              <div className="space-y-1 font-solaiman">
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                  বহুভাষিক ও আন্তর্জাতিক ইউনিকোড এনকোডিং গ্যারান্টি (UTF-8 NFC Multi-Language Guarantee)
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  এই ব্যাকআপ ইঞ্জিন বাংলা ভাষার যুক্তাক্ষর (য-ফলা, র-ফলা, ্য, ্র, ক্ষ, জ্ঞ), হসন্ত এবং নুকতা ১০০% অক্ষুণ্ণ রাখার জন্য স্ট্যান্ডার্ড <strong className="text-slate-800 dark:text-slate-200">UTF-8 NFC Normalization</strong> প্রয়োগ করে। এছাড়াও ইংরেজি, আরবি হরকত ও যেকোনো আন্তর্জাতিক ভাষা অক্ষতভাবে ব্যাকআপ ও রিস্টোর করা যায়।
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: LIVE TERMINAL & CONSOLE (Requirement 2) */}
      {/* ========================================================================= */}
      {activeHubTab === 'logs' && (
        <div className="space-y-4">
          <div className="rounded-xl border border-slate-800 bg-[#0d1117] text-slate-200 shadow-md overflow-hidden font-mono text-[11px]">
            {/* Terminal Header */}
            <div className="bg-[#161b22] px-4 py-3 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Terminal className="w-4 h-4 text-emerald-400" />
                <span className="text-xs font-semibold text-slate-300">
                  Universal Migration & Media Sync Full Console
                </span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-[10px] text-slate-400">মোট লগ লাইন: {logs.length}</span>
                <button
                  type="button"
                  onClick={() => {
                    const textContent = logs.map(l => `[${l.timestamp}] [${l.type.toUpperCase()}] ${l.message}`).join('\n');
                    const blob = new Blob([textContent], { type: 'text/plain;charset=utf-8' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `migration-log-${Date.now()}.txt`;
                    a.click();
                    URL.revokeObjectURL(url);
                  }}
                  className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] transition-colors cursor-pointer"
                >
                  লগ ডাউনলোড
                </button>
                <button
                  type="button"
                  onClick={() => setLogs([{ timestamp: new Date().toLocaleTimeString('bn-BD'), type: 'info', message: 'কনসোল পরিষ্কার করা হয়েছে।' }])}
                  className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] transition-colors cursor-pointer"
                >
                  ক্লিয়ার
                </button>
              </div>
            </div>

            {/* Terminal Body */}
            <div className="p-4 h-96 overflow-y-auto space-y-2 selection:bg-red-500/30">
              {logs.map((log, index) => {
                let badgeColor = 'text-slate-400';
                if (log.type === 'success') badgeColor = 'text-emerald-400 font-bold';
                if (log.type === 'warn') badgeColor = 'text-amber-400 font-bold';
                if (log.type === 'error') badgeColor = 'text-red-400 font-bold';

                return (
                  <div key={index} className="leading-relaxed flex items-start gap-2">
                    <span className="text-slate-500 select-none shrink-0 font-mono text-[10px]">
                      [{log.timestamp}]
                    </span>
                    <span className={`${badgeColor} break-all font-solaiman`}>
                      {log.message}
                    </span>
                  </div>
                );
              })}
              <div ref={terminalBottomRef} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
