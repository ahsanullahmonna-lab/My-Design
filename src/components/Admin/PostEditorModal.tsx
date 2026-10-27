import React, { useState, useRef, useEffect, useMemo } from 'react';
import { 
  X, 
  Bold, 
  Italic, 
  Underline, 
  Strikethrough, 
  Heading2, 
  Heading3, 
  List, 
  ListOrdered, 
  Quote, 
  Link as LinkIcon, 
  Image as ImageIcon, 
  Sparkles, 
  Eye, 
  Edit3, 
  Columns, 
  Clock, 
  FileText, 
  Layers, 
  Tag, 
  Globe, 
  Flame, 
  AlertCircle, 
  CheckCircle2, 
  Plus, 
  Trash2, 
  Maximize2, 
  Minimize2,
  ExternalLink,
  BookOpen,
  Calendar,
  CalendarClock,
  Timer,
  TimerOff,
  History,
  UploadCloud,
  Check,
  Lock,
  EyeOff,
  MapPin,
  UserCheck,
  Search,
  UserPlus,
  ChevronDown
} from 'lucide-react';
import { Article, CategoryItem, UserItem } from '../../types/news';
import { useSiteConfig } from '../../context/SiteConfigContext';
import { uploadMediaToCloud } from '../../utils/cloudStorage';
import { canSelectAuthor, canPostOnBehalf, normalizeRole } from '../../utils/rbac';
import { BANGLADESH_DIVISIONS, getDivisionDistricts, findDivisionByDistrict } from '../../data/bangladeshGeoData';

interface PostEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (articleData: Partial<Article>) => void;
  editingPost: Article | null;
  categories: CategoryItem[];
  users: UserItem[];
  currentUser: UserItem;
  darkMode: boolean;
  allArticles?: Article[];
}

export const PostEditorModal: React.FC<PostEditorModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editingPost,
  categories,
  users,
  currentUser,
  darkMode,
  allArticles = [],
}) => {
  const siteConfig = useSiteConfig();

  // Form States
  const [shoulder, setShoulder] = useState(editingPost?.shoulder || '');
  const [title, setTitle] = useState(editingPost?.title || '');
  const [subHeadline, setSubHeadline] = useState(editingPost?.subHeadline || '');
  const [category, setCategory] = useState(editingPost?.category || categories[0]?.nameBn || 'জাতীয়');
  
  // Hierarchical Division & Dependent District States
  const initialDistrict = editingPost?.district || 'ঢাকা';
  const initialDivision = editingPost?.division || findDivisionByDistrict(initialDistrict);
  const [division, setDivision] = useState(initialDivision);
  const [district, setDistrict] = useState(initialDistrict);

  // Hide / Unpublish Toggle State
  const [isHidden, setIsHidden] = useState(editingPost?.isHidden || editingPost?.status === 'hidden' || false);
  
  // Master / Delegated Posting Role & Author Selection Check (Requirement 1)
  const isMasterRole = canPostOnBehalf(currentUser?.role, currentUser) || currentUser?.role === 'master' || normalizeRole(currentUser?.role) === 'master';
  const isAuthorChangeAllowed = isMasterRole || canSelectAuthor(currentUser?.role, currentUser);

  // Initial delegated user resolution
  const initialAssignedUser = editingPost?.authorId 
    ? users.find(u => u.id === editingPost.authorId)
    : (editingPost?.author ? users.find(u => u.name.trim().toLowerCase() === editingPost.author.trim().toLowerCase()) : null);

  const [isDelegatedAttribution, setIsDelegatedAttribution] = useState<boolean>(
    Boolean(editingPost?.isDelegatedPost || (isMasterRole && initialAssignedUser && initialAssignedUser.id !== currentUser.id))
  );
  const [selectedAssignedUser, setSelectedAssignedUser] = useState<UserItem | null>(initialAssignedUser || null);
  const [authorSearchTerm, setAuthorSearchTerm] = useState('');
  const [isAuthorDropdownOpen, setIsAuthorDropdownOpen] = useState(false);

  // Author state
  const [authorSelectionMode, setAuthorSelectionMode] = useState<'account' | 'manual'>(
    editingPost ? (users.some(u => u.name === editingPost.author) ? 'account' : 'manual') : 'account'
  );
  const [author, setAuthor] = useState(isAuthorChangeAllowed ? (editingPost?.author || currentUser.name) : currentUser.name);
  const [reporterTitle, setReporterTitle] = useState(editingPost?.reporterTitle || editingPost?.authorRole || 'বিশেষ প্রতিনিধি');
  const [source, setSource] = useState(editingPost?.source || 'নিজস্ব প্রতিবেদক');

  // Searchable filter for delegatable registered users
  const filteredAssignableUsers = useMemo(() => {
    const q = authorSearchTerm.toLowerCase().trim();
    return users.filter(u => {
      if (!q) return true;
      return (
        u.name.toLowerCase().includes(q) ||
        (u.nameEn && u.nameEn.toLowerCase().includes(q)) ||
        (u.email && u.email.toLowerCase().includes(q)) ||
        (u.roleBn && u.roleBn.toLowerCase().includes(q)) ||
        (u.designation && u.designation.toLowerCase().includes(q)) ||
        (u.district && u.district.toLowerCase().includes(q))
      );
    });
  }, [users, authorSearchTerm]);

  // Series / Chain News state
  const [isSeries, setIsSeries] = useState(!!editingPost?.seriesName);
  const [seriesName, setSeriesName] = useState(editingPost?.seriesName || '');
  const [seriesPart, setSeriesPart] = useState(editingPost?.seriesPart || 'পর্ব ০১');
  const [isCreatingNewSeries, setIsCreatingNewSeries] = useState(false);
  const [newSeriesInput, setNewSeriesInput] = useState('');

  // Image & Excerpt
  const [imageUrl, setImageUrl] = useState(editingPost?.imageUrl || '');
  const [imageCaption, setImageCaption] = useState(editingPost?.imageCaption || '');
  const [excerpt, setExcerpt] = useState(editingPost?.excerpt || '');
  const [content, setContent] = useState(editingPost?.content || '');

  // Editorial Flags
  const [isBreaking, setIsBreaking] = useState(editingPost?.isBreaking || false);
  const [isLead, setIsLead] = useState(editingPost?.isLead || false);
  const [isTrending, setIsTrending] = useState(editingPost?.isTrending || false);
  const [postStatus, setPostStatus] = useState<'published' | 'pending' | 'rejected' | 'hidden' | 'deleted'>(
    editingPost?.status || (currentUser.role === 'admin' || currentUser.autoApprove ? 'published' : 'pending')
  );

  // Handler for Division change that dynamically updates the dependent Districts
  const handleDivisionChange = (newDiv: string) => {
    setDivision(newDiv);
    const districts = getDivisionDistricts(newDiv);
    if (districts.length > 0) {
      setDistrict(districts[0].nameBn);
    }
  };

  // Tags state
  const [tags, setTags] = useState<string[]>(editingPost?.tags || ['জাতীয়', 'সংবাদ']);
  const [tagInput, setTagInput] = useState('');

  // SEO state
  const [seoFocusKeyword, setSeoFocusKeyword] = useState(editingPost?.seoFocusKeyword || '');

  // News Scheduling, Auto-Expiring & Backdating Support (Requirement 2)
  const [publishMode, setPublishMode] = useState<'immediate' | 'scheduled' | 'backdated'>(() => {
    if (editingPost?.publishMode) return editingPost.publishMode;
    if (editingPost?.scheduledAt) return 'scheduled';
    if (editingPost?.isBackdated) return 'backdated';
    return 'immediate';
  });

  // Scheduled publish datetime
  const defaultFutureDate = useMemo(() => {
    const d = new Date(2026, 9, 9, 14, 30);
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  }, []);
  const [scheduledAt, setScheduledAt] = useState(editingPost?.scheduledAt || defaultFutureDate);

  // Auto-Expire datetime
  const [isAutoExpire, setIsAutoExpire] = useState(!!editingPost?.isAutoExpire || !!editingPost?.expiresAt);
  const defaultExpireDate = useMemo(() => {
    const d = new Date(2026, 9, 15, 23, 59);
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  }, []);
  const [expiresAt, setExpiresAt] = useState(editingPost?.expiresAt || defaultExpireDate);

  // Backdating custom past date
  const [customBackdate, setCustomBackdate] = useState(
    editingPost?.publishedAt?.slice(0, 10) || '2024-03-26'
  );
  const [customBackdateBn, setCustomBackdateBn] = useState(
    editingPost?.date || '২৬ মার্চ ২০২৪'
  );

  // Cloud CDN storage
  const [cdnStorageProvider, setCdnStorageProvider] = useState<'local' | 'cloudinary' | 's3'>(
    editingPost?.storageProvider || 'cloudinary'
  );
  const [isUploadingCloud, setIsUploadingCloud] = useState(false);
  const [cloudUploadNotice, setCloudUploadNotice] = useState<string | null>(null);

  // Editor View Mode: 'edit' | 'preview' | 'split'
  const [editorViewMode, setEditorViewMode] = useState<'edit' | 'preview' | 'split'>('edit');
  const [isFullScreen, setIsFullScreen] = useState(false);

  // Link Dialog Modal State
  const [showLinkDialog, setShowLinkDialog] = useState(false);
  const [linkUrl, setLinkUrl] = useState('https://');
  const [linkText, setLinkText] = useState('');

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Extract all existing unique series names across articles
  const existingSeriesList = useMemo(() => {
    const set = new Set<string>();
    allArticles.forEach(a => {
      if (a.seriesName && a.seriesName.trim()) {
        set.add(a.seriesName.trim());
      }
    });
    // Add popular defaults if empty
    if (set.size === 0) {
      set.add('বিশেষ অনুসন্ধান: বিচার বিভাগ সংস্কার ও জুলাই মামলা');
      set.add('ব্যাংক খাত সংকট ও পাচারকৃত অর্থ উদ্ধার');
      set.add('জলবায়ু পরিবর্তন: উপকূলের বিপন্ন জনপদ');
      set.add('ঢাকা মেট্রোরেল সম্প্রসারণ ও নগর পরিবহন');
    }
    return Array.from(set);
  }, [allArticles]);

  // Sync and reset form state when modal opens or editingPost changes
  useEffect(() => {
    if (isOpen) {
      setShoulder(editingPost?.shoulder || '');
      setTitle(editingPost?.title || '');
      setSubHeadline(editingPost?.subHeadline || '');
      const dist = editingPost?.district || 'ঢাকা';
      const div = editingPost?.division || findDivisionByDistrict(dist);
      setDivision(div);
      setDistrict(dist);
      setIsHidden(editingPost?.isHidden || editingPost?.status === 'hidden' || false);
      setAuthor(editingPost?.author || currentUser?.name || 'নিজস্ব প্রতিবেদক');
      setReporterTitle(editingPost?.reporterTitle || editingPost?.authorRole || 'বিশেষ প্রতিনিধি');
      setSource(editingPost?.source || 'নিজস্ব প্রতিবেদক');
      setIsSeries(!!editingPost?.seriesName);
      setSeriesName(editingPost?.seriesName || '');
      setSeriesPart(editingPost?.seriesPart || 'পর্ব ০১');
      setImageUrl(editingPost?.imageUrl || '');
      setImageCaption(editingPost?.imageCaption || '');
      setExcerpt(editingPost?.excerpt || '');
      setContent(editingPost?.content || '');
      setIsBreaking(!!editingPost?.isBreaking);
      setIsLead(!!editingPost?.isLead);
      setIsTrending(!!editingPost?.isTrending);
      setPostStatus(editingPost?.status || (currentUser?.role === 'admin' || currentUser?.autoApprove ? 'published' : 'pending'));
      setTags(editingPost?.tags || ['জাতীয়', 'সংবাদ']);
      setTagInput('');
      setSeoFocusKeyword(editingPost?.seoFocusKeyword || '');
      setPublishMode(editingPost?.publishMode || (editingPost?.scheduledAt ? 'scheduled' : editingPost?.isBackdated ? 'backdated' : 'immediate'));
      setScheduledAt(editingPost?.scheduledAt || defaultFutureDate || '');
      setIsAutoExpire(!!editingPost?.isAutoExpire || !!editingPost?.expiresAt);
      setExpiresAt(editingPost?.expiresAt || defaultExpireDate || '');
      setCustomBackdate(editingPost?.publishedAt ? editingPost.publishedAt.slice(0, 10) : '2024-03-26');
      setCustomBackdateBn(editingPost?.date || '২৬ মার্চ ২০২৪');
      setCdnStorageProvider(editingPost?.storageProvider || 'cloudinary');
    }
  }, [isOpen, editingPost, currentUser, categories, defaultFutureDate, defaultExpireDate]);

  // Tag Handlers
  const handleAddTag = (tagToAdd: string) => {
    const clean = tagToAdd.trim().replace(/^#/, '');
    if (clean && !tags.includes(clean)) {
      setTags([...tags, clean]);
    }
    setTagInput('');
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(t => t !== tagToRemove));
  };

  const handleTagKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      handleAddTag(tagInput);
    }
  };

  // Image Upload Handler with direct Cloud CDN Integration (Requirement 1)
  const handleImageFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingCloud(true);
    setCloudUploadNotice('ক্লাউড সিডিএন-এ আপলোড ও অপ্টিমাইজেশন চলছে...');
    try {
      const res = await uploadMediaToCloud(file, title || file.name);
      if (res.success && res.url) {
        setImageUrl(res.url);
        setCdnStorageProvider(res.provider);
        setCloudUploadNotice(`✓ ${res.provider.toUpperCase()} সিডিএন-এ সফলভাবে আপলোড সম্পন্ন (সাশ্রয়: ${res.savingsPercent}%)`);
      } else {
        const reader = new FileReader();
        reader.onload = (event) => {
          if (event.target?.result) setImageUrl(event.target.result as string);
        };
        reader.readAsDataURL(file);
      }
    } catch {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) setImageUrl(event.target.result as string);
      };
      reader.readAsDataURL(file);
    } finally {
      setIsUploadingCloud(false);
      setTimeout(() => setCloudUploadNotice(null), 4000);
    }
  };

  // Text formatting insertion helper
  const insertFormatting = (prefix: string, suffix: string = '', defaultPlaceholder: string = '') => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const currentText = textarea.value;
    const selectedText = currentText.substring(start, end) || defaultPlaceholder;

    const replacement = `${prefix}${selectedText}${suffix}`;
    const newContent = currentText.substring(0, start) + replacement + currentText.substring(end);

    setContent(newContent);

    // Reposition cursor inside
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(
        start + prefix.length,
        start + prefix.length + selectedText.length
      );
    }, 10);
  };

  // Insert Heading
  const insertHeading = (level: 2 | 3) => {
    const prefix = level === 2 ? '\n## ' : '\n### ';
    insertFormatting(prefix, '\n', level === 2 ? 'উপ-শিরোনাম লিখুন' : 'অন্তর্বর্তী শিরোনাম');
  };

  // Insert Lists
  const insertList = (ordered: boolean) => {
    const prefix = ordered ? '\n1. ' : '\n• ';
    insertFormatting(prefix, '\n', 'প্রথম বিষয়\n• দ্বিতীয় বিষয়');
  };

  // Insert Blockquote
  const insertQuote = () => {
    insertFormatting('\n> "', '" — বক্তার নাম ও পদবী\n', 'উদ্ধৃত বক্তব্য বা গুরুত্বপূর্ণ মন্তব্য');
  };

  // Insert Callout Box
  const insertCallout = () => {
    insertFormatting('\n📌 [বিশেষ তথ্য: ', ']\n', 'গুরুত্বপূর্ণ পরিসংখ্যান বা পটভূমি নোট');
  };

  // Handle Insert Link Confirmation
  const handleConfirmLink = () => {
    if (!linkUrl.trim()) return;
    const text = linkText.trim() || linkUrl.trim();
    insertFormatting(`[${text}](${linkUrl.trim()})`);
    setShowLinkDialog(false);
    setLinkUrl('https://');
    setLinkText('');
  };

  // Calculate live word count, character count, read time
  const stats = useMemo(() => {
    const words = content.trim() ? content.trim().split(/\s+/).length : 0;
    const chars = content.length;
    const minutes = Math.max(1, Math.ceil(words / 180));
    return {
      words,
      chars,
      readTimeBn: `${minutes.toLocaleString('bn-BD')} মিনিট`,
    };
  }, [content]);

  // Simple HTML / Markdown parser for Live Preview
  const renderFormattedPreview = (rawText: string) => {
    if (!rawText.trim()) {
      return (
        <div className="text-slate-400 italic py-8 text-center">
          এখানে আপনার সংবাদের লাইভ প্রিভিউ প্রদর্শিত হবে...
        </div>
      );
    }

    const lines = rawText.split('\n');
    return lines.map((line, idx) => {
      const trimmed = line.trim();
      if (!trimmed) {
        return <div key={idx} className="h-4" />;
      }

      // Heading 2
      if (trimmed.startsWith('## ')) {
        return (
          <h2 key={idx} className="text-xl md:text-2xl font-bold font-solaiman text-slate-900 dark:text-white pt-3 pb-1 border-b border-slate-200 dark:border-slate-800">
            {trimmed.replace(/^##\s+/, '')}
          </h2>
        );
      }

      // Heading 3
      if (trimmed.startsWith('### ')) {
        return (
          <h3 key={idx} className="text-lg md:text-xl font-bold font-solaiman text-red-600 dark:text-red-400 pt-2">
            {trimmed.replace(/^###\s+/, '')}
          </h3>
        );
      }

      // Blockquote
      if (trimmed.startsWith('> ') || trimmed.startsWith('❝')) {
        return (
          <blockquote key={idx} className="border-l-4 border-red-600 bg-red-50 dark:bg-red-950/20 pl-4 pr-3 py-2 my-2 italic text-slate-800 dark:text-slate-200 rounded-r">
            {trimmed.replace(/^[>❝]\s*/, '')}
          </blockquote>
        );
      }

      // Bullet List
      if (trimmed.startsWith('• ') || trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
        return (
          <li key={idx} className="ml-5 list-disc text-slate-800 dark:text-slate-200 py-0.5">
            {trimmed.replace(/^[•\-\*]\s*/, '')}
          </li>
        );
      }

      // Numbered List
      if (/^\d+\.\s+/.test(trimmed)) {
        return (
          <li key={idx} className="ml-5 list-decimal text-slate-800 dark:text-slate-200 py-0.5">
            {trimmed.replace(/^\d+\.\s*/, '')}
          </li>
        );
      }

      // Callout box
      if (trimmed.startsWith('📌')) {
        return (
          <div key={idx} className="p-3 my-2 bg-amber-50 dark:bg-amber-950/30 border border-amber-300 dark:border-amber-700 text-amber-900 dark:text-amber-200 rounded-md text-xs font-semibold flex items-start gap-2">
            <span>📌</span>
            <span>{trimmed.replace(/^📌\s*\[?বিশেষ তথ্য:?\s*/, '').replace(/\]$/, '')}</span>
          </div>
        );
      }

      // Normal Paragraph with Bold, Italic, Link matching
      return (
        <p key={idx} className="text-slate-800 dark:text-slate-200 leading-relaxed text-justify">
          {trimmed}
        </p>
      );
    });
  };

  // Form Submit Handler
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      return;
    }

    const finalSeries = isSeries 
      ? (isCreatingNewSeries ? newSeriesInput.trim() : seriesName.trim()) 
      : undefined;

    // Calculate final date and publishedAt based on publishMode
    let finalDate = editingPost?.date || '৮ অক্টোবর ২০২৬';
    let finalPublishedAt = editingPost?.publishedAt || new Date().toISOString();
    let finalStatus: 'published' | 'pending' | 'rejected' | 'hidden' | 'deleted' = postStatus;

    if (publishMode === 'backdated') {
      const bDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
      const bMonths = [
        'জানুয়ারি', 'ফেব্রুয়ারি', 'মার্চ', 'এপ্রিল', 'মে', 'জুন',
        'জুলাই', 'আগস্ট', 'সেপ্টেম্বর', 'অক্টোবর', 'নভেম্বর', 'ডিসেম্বর'
      ];
      const [by, bm, bd] = customBackdate.split('-').map(Number);
      if (by && bm && bd) {
        const dayBn = String(bd).split('').map(c => bDigits[+c] ?? c).join('');
        const yearBn = String(by).split('').map(c => bDigits[+c] ?? c).join('');
        const monthBn = bMonths[bm - 1] || '';
        finalDate = `${dayBn} ${monthBn} ${yearBn}`;
      } else {
        finalDate = customBackdateBn || '২৬ মার্চ ২০২৪';
      }
      finalPublishedAt = new Date(`${customBackdate}T12:00:00Z`).toISOString();
    } else if (publishMode === 'scheduled') {
      finalPublishedAt = new Date(scheduledAt).toISOString();
      // Future scheduled
    }

    // Determine Author & Attribution (Requirement 1: Master / Delegated Posting)
    let finalAuthor = author.trim() || currentUser.name;
    let finalAuthorId: string | undefined = currentUser.id;
    let finalAuthorAvatar: string | undefined = currentUser.avatar;
    let finalAuthorRole = reporterTitle || currentUser.roleBn || 'স্টাফ রিপোর্টার';
    let finalSubmittedBy: string = currentUser.id;
    let isDelegated = false;
    let delegatedBy: string | undefined = undefined;
    let delegatedByName: string | undefined = undefined;
    let delegatedNote: string | undefined = undefined;

    if (isMasterRole && isDelegatedAttribution && selectedAssignedUser) {
      finalAuthor = selectedAssignedUser.name;
      finalAuthorId = selectedAssignedUser.id;
      finalAuthorAvatar = selectedAssignedUser.avatar;
      finalAuthorRole = selectedAssignedUser.designation || selectedAssignedUser.roleBn || 'প্রতিবেদক';
      finalSubmittedBy = selectedAssignedUser.id; // Directly attributed & credited to this registered user
      isDelegated = true;
      delegatedBy = currentUser.id;
      delegatedByName = currentUser.name;
      delegatedNote = `মাস্টার ডেস্ক (${currentUser.name}) কর্তৃক ${selectedAssignedUser.name}-এর নামে অ্যাসাইন ও ক্রেডিটকৃত`;
    } else if (isAuthorChangeAllowed) {
      finalAuthor = author.trim() || currentUser.name;
      finalSubmittedBy = editingPost?.submittedBy || currentUser.id;
      finalAuthorRole = authorSelectionMode === 'manual' ? (reporterTitle.trim() || 'প্রতিবেদক') : (reporterTitle.trim() || currentUser.roleBn || 'প্রতিবেদক');
    } else {
      finalAuthor = currentUser.name;
      finalAuthorId = currentUser.id;
      finalAuthorAvatar = currentUser.avatar;
      finalSubmittedBy = currentUser.id;
      finalAuthorRole = currentUser.roleBn || 'স্টাফ রিপোর্টার';
    }

    const payload: Partial<Article> = {
      title: title.trim(),
      shoulder: shoulder.trim() || undefined,
      subHeadline: subHeadline.trim() || undefined,
      category,
      categoryEn: category,
      author: finalAuthor,
      authorId: finalAuthorId,
      authorAvatar: finalAuthorAvatar,
      authorRole: finalAuthorRole,
      reporterTitle: finalAuthorRole,
      submittedBy: finalSubmittedBy,
      delegatedBy,
      delegatedByName,
      isDelegatedPost: isDelegated,
      delegatedAttributionNote: delegatedNote,
      source: source.trim() || undefined,
      seriesName: finalSeries || undefined,
      seriesPart: isSeries ? (seriesPart.trim() || 'পর্ব ০১') : undefined,
      imageUrl: imageUrl.trim() || (editingPost?.imageUrl || 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?auto=format&fit=crop&w=800&q=80'),
      imageCaption: imageCaption.trim() || undefined,
      excerpt: excerpt.trim() || content.trim().substring(0, 140) + '...',
      content: content.trim(),
      division: division.trim() || undefined,
      district: district.trim() || undefined,
      isBreaking,
      isLead,
      isTrending,
      isHidden,
      tags: tags.length > 0 ? tags : ['জাতীয়'],
      status: isHidden ? 'hidden' : (postStatus === 'hidden' ? 'hidden' : finalStatus),
      readTime: stats.readTimeBn,
      seoFocusKeyword: seoFocusKeyword.trim() || undefined,
      // Scheduling, Auto-Expiring & Backdating Support (Requirement 2)
      publishMode,
      scheduledAt: publishMode === 'scheduled' ? scheduledAt : undefined,
      isScheduled: publishMode === 'scheduled',
      isAutoExpire,
      expiresAt: isAutoExpire ? expiresAt : undefined,
      isBackdated: publishMode === 'backdated',
      publishedAt: finalPublishedAt,
      date: finalDate,
      storageProvider: cdnStorageProvider,
      cdnOptimizedUrl: imageUrl.startsWith('http') ? imageUrl : undefined,
    };

    onSave(payload);
  };

  if (!isOpen) return null;

  return (
    <div className={`fixed inset-0 z-50 overflow-y-auto bg-black/75 backdrop-blur-xs flex justify-center p-2 sm:p-4 md:p-6 transition-all animate-in fade-in duration-200`}>
      <div 
        className={`w-full ${isFullScreen ? 'max-w-7xl h-[95vh]' : 'max-w-5xl max-h-[92vh]'} rounded-xl shadow-2xl overflow-hidden border flex flex-col transition-colors ${
          darkMode ? 'bg-[#151c24] border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-900'
        }`}
      >
        {/* ================= HEADER BAR ================= */}
        <div className={`px-5 py-3.5 border-b flex items-center justify-between shrink-0 ${
          darkMode ? 'bg-[#1b232e] border-slate-800' : 'bg-slate-50 border-slate-200'
        }`}>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-red-600 text-white flex items-center justify-center font-bold shadow-xs">
              <Edit3 className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm md:text-base font-extrabold font-solaiman flex items-center gap-2">
                <span>{editingPost ? 'সংবাদ সম্পাদনা ডেস্ক (Newsroom Editor)' : 'নতুন সংবাদ পোস্ট করুন (Professional News Desk)'}</span>
                {editingPost && (
                  <span className="text-[10px] px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 font-mono">
                    ID: {editingPost.id}
                  </span>
                )}
              </h2>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                পেশাদার সাংবাদিকতা ও ব্রডশিট স্ট্যান্ডার্ড অনুযায়ী সংবাদ তৈরি ও ধারাবাহিক সিরিজ ব্যবস্থাপনা
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsFullScreen(!isFullScreen)}
              className="p-1.5 rounded text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700"
              title={isFullScreen ? 'ছোট করুন' : 'ফুল স্ক্রিন'}
            >
              {isFullScreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded text-slate-400 hover:text-red-600 hover:bg-slate-200 dark:hover:bg-slate-700"
              title="বন্ধ করুন"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Warning if account lacks autoApprove */}
        {currentUser.role !== 'admin' && !currentUser.autoApprove && (
          <div className="px-5 py-2 bg-amber-500/10 border-b border-amber-500/30 text-amber-700 dark:text-amber-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>অ্যাকাউন্ট বিজ্ঞপ্তি: পোস্টটি জমা দিলে তা রিভিউ কিউতে যাবে এবং ভারপ্রাপ্ত সম্পাদকের অনুমোদনের পর মূল পোর্টালে দৃশ্যমান হবে।</span>
          </div>
        )}

        {/* ================= FORM BODY ================= */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 md:p-6 space-y-5 font-solaiman text-xs">
          
          {/* SECTION 1: HEADLINE SUITE (Shoulder, Main, Sub-Headline) */}
          <div className={`p-4 rounded-lg border space-y-3 ${
            darkMode ? 'bg-[#1b232e]/70 border-slate-800' : 'bg-slate-50/80 border-slate-200'
          }`}>
            <div className="flex items-center justify-between">
              <span className="font-extrabold text-slate-800 dark:text-slate-200 flex items-center gap-1.5 text-xs">
                <FileText className="w-3.5 h-3.5 text-red-600" />
                <span>শিরোনাম স্যুট (Headline & Kicker Structure)</span>
              </span>
              <span className="text-[10px] text-slate-400">শীর্ষ ব্রডশিট প্রিন্ট ও ডিজিটাল বিন্যাস</span>
            </div>

            <div className="space-y-3">
              {/* Main Headline (Shoulder field removed per Requirement 1) */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block font-bold text-slate-700 dark:text-slate-300 text-xs">
                    মূল সংবাদের শিরোনাম (Main Headline) *
                  </label>
                  <span className={`text-[10px] ${title.length > 80 ? 'text-amber-500 font-bold' : 'text-slate-400'}`}>
                    {title.length} অক্ষর
                  </span>
                </div>
                <input
                  type="text"
                  required
                  placeholder="যেমন: ঢাকার যানজট নিরসনে নতুন ট্রাফিক স্কিম ঘোষণা..."
                  value={title || ''}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#121820] text-slate-900 dark:text-slate-100 placeholder:text-slate-400 text-sm font-extrabold focus:outline-none focus:ring-1 focus:ring-red-600"
                />
              </div>

              {/* Sub-Headline */}
              <div>
                <label className="block font-bold mb-1 text-slate-700 dark:text-slate-300">
                  উপ-শিরোনাম / সাব-হেড (Sub-Headline / Secondary Angle)
                </label>
                <input
                  type="text"
                  placeholder="যেমন: সংশ্লিষ্ট দপ্তরগুলোর সমন্বয়হীনতার কারণে নাগরিক দুর্ভোগ অব্যাহত..."
                  value={subHeadline || ''}
                  onChange={(e) => setSubHeadline(e.target.value)}
                  className="w-full px-3 py-2 rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#121820] text-slate-900 dark:text-slate-100 placeholder:text-slate-400 text-xs focus:outline-none focus:ring-1 focus:ring-red-600"
                />
              </div>
            </div>
          </div>

          {/* SECTION 2: CHAIN NEWS / NEWS SERIES (চেইন নিউজ বা ধারাবাহিক সংবাদ সিরিজ) */}
          <div className={`p-4 rounded-lg border transition-all ${
            isSeries 
              ? (darkMode ? 'bg-indigo-950/20 border-indigo-700/60' : 'bg-indigo-50/70 border-indigo-200')
              : (darkMode ? 'bg-[#1b232e]/50 border-slate-800' : 'bg-slate-50/50 border-slate-200')
          }`}>
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer font-extrabold text-indigo-700 dark:text-indigo-400 text-xs">
                <input
                  type="checkbox"
                  checked={isSeries}
                  onChange={(e) => setIsSeries(e.target.checked)}
                  className="w-4 h-4 text-indigo-600 rounded"
                />
                <span className="flex items-center gap-1.5">
                  <Layers className="w-4 h-4" />
                  <span>চেইন নিউজ সিরিজ (Chain News / Topic Series) সক্রিয় করুন</span>
                </span>
              </label>

              {isSeries && (
                <span className="text-[10px] px-2 py-0.5 rounded bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 font-bold">
                  ধারাবাহিক পর্ব লিঙ্ক সক্রিয়
                </span>
              )}
            </div>

            {isSeries && (
              <div className="mt-3 pt-3 border-t border-indigo-200/50 dark:border-indigo-800/50 space-y-3">
                <p className="text-[11px] text-slate-600 dark:text-slate-300">
                  ধারাবাহিক অনুসন্ধানী বা থিম্যাটিক সংবাদের ক্ষেত্রে একটি সিরিজের আওতায় সব পর্ব একত্রিত করুন। পাঠক প্রতিটি পর্বের নিচে পুরো সিরিজের পর্ব তালিকা দেখতে পাবেন।
                </p>

                <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
                  {/* Series Selector or Input */}
                  <div className="md:col-span-8">
                    <div className="flex items-center justify-between mb-1">
                      <label className="font-bold text-slate-700 dark:text-slate-300">
                        সিরিজের নাম (Series Topic Name) *
                      </label>
                      <button
                        type="button"
                        onClick={() => setIsCreatingNewSeries(!isCreatingNewSeries)}
                        className="text-[10px] text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 font-bold"
                      >
                        {isCreatingNewSeries ? 'বিদ্যমান সিরিজ থেকে বেছে নিন' : '+ নতুন সিরিজ তৈরি করুন'}
                      </button>
                    </div>

                    {isCreatingNewSeries ? (
                      <input
                        type="text"
                        required={isSeries}
                        placeholder="যেমন: বিশেষ অনুসন্ধান: ব্যাংক কেলেঙ্কারি ও পাচার..."
                        value={newSeriesInput}
                        onChange={(e) => setNewSeriesInput(e.target.value)}
                        className="w-full px-3 py-2 rounded-md border border-indigo-400 dark:border-indigo-600 bg-white dark:bg-[#121820] text-xs font-bold"
                      />
                    ) : (
                      <select
                        value={seriesName}
                        onChange={(e) => setSeriesName(e.target.value)}
                        className="w-full px-3 py-2 rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#121820] text-xs font-semibold"
                      >
                        <option value="">-- বিদ্যমান সিরিজ নির্বাচন করুন --</option>
                        {existingSeriesList.map((s, idx) => (
                          <option key={idx} value={s}>{s}</option>
                        ))}
                      </select>
                    )}
                  </div>

                  {/* Series Part */}
                  <div className="md:col-span-4">
                    <label className="block font-bold mb-1 text-slate-700 dark:text-slate-300">
                      পর্ব / কিস্তি (Episode / Part)
                    </label>
                    <div className="flex items-center gap-2">
                      <select
                        value={seriesPart}
                        onChange={(e) => setSeriesPart(e.target.value)}
                        className="w-full px-3 py-2 rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#121820] text-xs font-semibold"
                      >
                        <option value="পর্ব ০১">পর্ব ০১</option>
                        <option value="পর্ব ০২">পর্ব ০২</option>
                        <option value="পর্ব ০৩">পর্ব ০৩</option>
                        <option value="পর্ব ০৪">পর্ব ০৪</option>
                        <option value="পর্ব ০৫">পর্ব ০৫</option>
                        <option value="সমাপনী কিস্তি">সমাপনী কিস্তি</option>
                        <option value="বিশেষ পর্ব">বিশেষ পর্ব</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* SECTION 3: METADATA GRID (Category, Author, Source, District) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
            {/* Category */}
            <div>
              <label className="block font-bold mb-1 text-slate-700 dark:text-slate-300">বিভাগ (Category)</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#121820] text-xs font-semibold"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.nameBn}>{c.nameBn}</option>
                ))}
              </select>
            </div>

            {/* Reporter Selection & Master Delegated Posting (Requirement 1) */}
            <div className="space-y-1.5 md:col-span-2">
              {isMasterRole ? (
                /* Master / Delegated Role Attribution Card (Requirement 1) */
                <div className={`p-3 rounded-xl border space-y-2.5 transition-all ${
                  isDelegatedAttribution
                    ? (darkMode ? 'bg-indigo-950/30 border-indigo-700/60' : 'bg-indigo-50/70 border-indigo-300')
                    : (darkMode ? 'bg-slate-900/50 border-slate-700' : 'bg-slate-50 border-slate-200')
                }`}>
                  <div className="flex items-center justify-between flex-wrap gap-1.5">
                    <label className="font-bold text-slate-800 dark:text-slate-200 text-xs flex items-center gap-1.5">
                      <UserCheck className="w-4 h-4 text-indigo-600" />
                      <span>কাদের নামে প্রকাশিত হবে (Author Attribution)</span>
                    </label>
                    <div className="flex items-center gap-1 bg-white dark:bg-slate-800 p-0.5 rounded-lg border border-slate-200 dark:border-slate-700 text-[10px]">
                      <button
                        type="button"
                        onClick={() => {
                          setIsDelegatedAttribution(false);
                          setSelectedAssignedUser(null);
                          setAuthor(currentUser.name);
                          setReporterTitle(currentUser.roleBn || 'মাস্টার ডেস্ক');
                        }}
                        className={`px-2 py-1 rounded-md transition-all font-bold ${
                          !isDelegatedAttribution
                            ? 'bg-slate-800 text-white dark:bg-slate-700 shadow-xs'
                            : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                        }`}
                      >
                        আমার নামে
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setIsDelegatedAttribution(true);
                          if (!selectedAssignedUser) {
                            const firstOther = users.find(u => u.id !== currentUser.id);
                            if (firstOther) {
                              setSelectedAssignedUser(firstOther);
                              setAuthor(firstOther.name);
                              setReporterTitle(firstOther.designation || firstOther.roleBn || 'প্রতিবেদক');
                            }
                          }
                        }}
                        className={`px-2 py-1 rounded-md transition-all font-bold flex items-center gap-1 ${
                          isDelegatedAttribution
                            ? 'bg-indigo-600 text-white shadow-xs'
                            : 'text-slate-600 dark:text-slate-400 hover:text-indigo-600'
                        }`}
                      >
                        <UserPlus className="w-3 h-3" />
                        <span>অন্যের নামে অ্যাসাইন / পোস্ট</span>
                      </button>
                    </div>
                  </div>

                  {!isDelegatedAttribution ? (
                    /* Published under current Master's profile */
                    <div className="flex items-center gap-2.5 p-2 bg-white dark:bg-[#121820] rounded-lg border border-slate-200 dark:border-slate-800">
                      <img
                        src={currentUser.avatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80'}
                        alt={currentUser.name}
                        className="w-8 h-8 rounded-full object-cover border border-slate-300 dark:border-slate-700"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-xs text-slate-900 dark:text-white truncate">{currentUser.name}</span>
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-bold font-mono">
                            {currentUser.roleBn || 'মাস্টার ডেস্ক'}
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-500 truncate">আপনার নিজস্ব অফিশিয়াল অ্যাকাউন্টে সরাসরি প্রকাশিত হবে</p>
                      </div>
                    </div>
                  ) : (
                    /* Searchable Attribution Selector (Requirement 1) */
                    <div className="space-y-2">
                      {/* Active Selected Attribution Card */}
                      {selectedAssignedUser && (
                        <div className="p-2.5 rounded-lg bg-white dark:bg-[#121820] border-2 border-indigo-500 dark:border-indigo-600 flex items-center justify-between gap-2 shadow-xs">
                          <div className="flex items-center gap-2.5 min-w-0">
                            <img
                              src={selectedAssignedUser.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80'}
                              alt={selectedAssignedUser.name}
                              className="w-9 h-9 rounded-full object-cover border border-indigo-300 dark:border-indigo-700 shrink-0"
                            />
                            <div className="min-w-0">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <span className="font-extrabold text-xs text-slate-900 dark:text-white">
                                  {selectedAssignedUser.name}
                                </span>
                                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-bold">
                                  {selectedAssignedUser.roleBn}
                                </span>
                                {selectedAssignedUser.district && (
                                  <span className="text-[10px] text-slate-500 font-mono">({selectedAssignedUser.district})</span>
                                )}
                              </div>
                              <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                                <Check className="w-3 h-3" />
                                <span>অফিসিয়ালি এই ইউজারের প্রোফাইলে ক্রেডিট ও যুক্ত হবে</span>
                              </p>
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={() => setIsAuthorDropdownOpen(!isAuthorDropdownOpen)}
                            className="px-2.5 py-1 text-[11px] rounded bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 text-indigo-700 dark:text-indigo-300 font-bold border border-indigo-200 dark:border-indigo-800 transition-colors flex items-center gap-1 cursor-pointer shrink-0"
                          >
                            <span>অন্য রিপোর্টার বেছে নিন</span>
                            <ChevronDown className="w-3 h-3" />
                          </button>
                        </div>
                      )}

                      {/* Search Bar & Dropdown */}
                      {(!selectedAssignedUser || isAuthorDropdownOpen) && (
                        <div className="relative space-y-1.5 animate-in fade-in">
                          <div className="relative">
                            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                            <input
                              type="text"
                              value={authorSearchTerm}
                              onChange={(e) => setAuthorSearchTerm(e.target.value)}
                              placeholder="রিপোর্টার, সাংবাদিক বা ইউজারের নাম, পদবী, জেলা বা ইমেইল দিয়ে সার্চ করুন..."
                              className="w-full pl-8 pr-3 py-1.5 rounded-lg border border-indigo-300 dark:border-indigo-700 bg-white dark:bg-[#121820] text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500"
                              autoFocus
                            />
                            {authorSearchTerm && (
                              <button
                                type="button"
                                onClick={() => setAuthorSearchTerm('')}
                                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs"
                              >
                                ✕
                              </button>
                            )}
                          </div>

                          {/* Filtered list of registered users */}
                          <div className="max-h-48 overflow-y-auto rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#151c24] divide-y divide-slate-100 dark:divide-slate-800 shadow-lg">
                            {filteredAssignableUsers.length === 0 ? (
                              <div className="p-3 text-center text-xs text-slate-400">
                                কোনো নিবন্ধিত ব্যবহারকারী পাওয়া যায়নি
                              </div>
                            ) : (
                              filteredAssignableUsers.map((u) => {
                                const isSelected = selectedAssignedUser?.id === u.id;
                                return (
                                  <button
                                    key={u.id}
                                    type="button"
                                    onClick={() => {
                                      setSelectedAssignedUser(u);
                                      setAuthor(u.name);
                                      setReporterTitle(u.designation || u.roleBn || 'প্রতিবেদক');
                                      setIsAuthorDropdownOpen(false);
                                    }}
                                    className={`w-full p-2 text-left flex items-center justify-between gap-2 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 transition-colors cursor-pointer ${
                                      isSelected ? 'bg-indigo-50/80 dark:bg-indigo-950/60' : ''
                                    }`}
                                  >
                                    <div className="flex items-center gap-2 min-w-0">
                                      <img
                                        src={u.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=100&q=80'}
                                        alt={u.name}
                                        className="w-7 h-7 rounded-full object-cover shrink-0"
                                      />
                                      <div className="min-w-0">
                                        <div className="font-bold text-xs text-slate-900 dark:text-white truncate">
                                          {u.name}
                                        </div>
                                        <div className="text-[10px] text-slate-500 flex items-center gap-1.5 flex-wrap">
                                          <span className="font-semibold text-indigo-600 dark:text-indigo-400">{u.roleBn}</span>
                                          {u.district && <span>• {u.district}</span>}
                                          <span className="font-mono text-[9px]">{u.email}</span>
                                        </div>
                                      </div>
                                    </div>

                                    <div className="text-right shrink-0">
                                      {!u.autoApprove && (
                                        <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-400 font-bold block mb-0.5">
                                          সরাসরি পোস্ট অনুমতি নেই
                                        </span>
                                      )}
                                      {isSelected ? (
                                        <span className="text-xs text-emerald-600 font-bold flex items-center gap-0.5">
                                          <Check className="w-3.5 h-3.5" /> নির্বাচিত
                                        </span>
                                      ) : (
                                        <span className="text-[10px] text-indigo-600 hover:underline font-bold">
                                          নির্বাচন করুন
                                        </span>
                                      )}
                                    </div>
                                  </button>
                                );
                              })
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ) : !isAuthorChangeAllowed ? (
                /* Strict Journalist Lock Card (Requirement 3) */
                <div className="p-3 rounded-lg border border-blue-200 dark:border-blue-900/60 bg-blue-50/70 dark:bg-blue-950/30 space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="block font-bold text-slate-800 dark:text-slate-200 text-xs flex items-center gap-1.5">
                      <Lock className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                      <span>প্রতিবেদক (সাংবাদিক প্রোফাইল লকড)</span>
                    </label>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-600 text-white font-mono shadow-xs">
                      সাংবাদিক
                    </span>
                  </div>
                  <div className="flex items-center gap-2.5 p-2 bg-white dark:bg-[#121820] rounded-md border border-blue-100 dark:border-blue-900/40">
                    <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-950 flex items-center justify-center text-blue-700 dark:text-blue-300 font-bold text-xs shrink-0">
                      {currentUser.name.slice(0, 1)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                        {currentUser.name}
                      </p>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                        {currentUser.roleBn || 'স্টাফ রিপোর্টার (সাংবাদিক)'}
                      </p>
                    </div>
                  </div>
                  <p className="text-[10px] text-blue-700 dark:text-blue-300 leading-tight flex items-center gap-1">
                    <span>ℹ️ RBAC নিরাপত্তা নীতি: সাংবাদিকগণ শুধুমাত্র নিজের প্রোফাইলের অধীনে সংবাদ তৈরি করতে পারেন। অন্যের নাম নির্বাচন বা ম্যানুয়াল পরিবর্তন বন্ধ।</span>
                  </p>
                </div>
              ) : (
                /* News Room Editor: Team vs. Manual Toggle */
                <>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block font-bold text-slate-700 dark:text-slate-300 text-xs">প্রতিবেদক (Reporter)</label>
                    <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-0.5 rounded border border-slate-200 dark:border-slate-700 text-[10px]">
                      <button
                        type="button"
                        onClick={() => setAuthorSelectionMode('account')}
                        className={`px-2 py-0.5 rounded transition-all ${
                          authorSelectionMode === 'account' 
                            ? 'bg-red-600 text-white font-bold shadow-xs' 
                            : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                        }`}
                      >
                        টিম (Team)
                      </button>
                      <button
                        type="button"
                        onClick={() => setAuthorSelectionMode('manual')}
                        className={`px-2 py-0.5 rounded transition-all ${
                          authorSelectionMode === 'manual' 
                            ? 'bg-red-600 text-white font-bold shadow-xs' 
                            : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                        }`}
                      >
                        ম্যানুয়াল (Manual)
                      </button>
                    </div>
                  </div>

                  {authorSelectionMode === 'account' ? (
                    <div>
                      <select
                        value={author}
                        onChange={(e) => setAuthor(e.target.value)}
                        className="w-full px-3 py-2 rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#121820] text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-red-600"
                      >
                        {users.map((u) => (
                          <option key={u.id} value={u.name}>
                            {u.name} ({u.roleBn})
                          </option>
                        ))}
                      </select>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[10px] text-slate-500 dark:text-slate-400 font-semibold mb-0.5">
                          প্রতিবেদকের নাম
                        </label>
                        <input
                          type="text"
                          placeholder="যেমন: তানভীর আহমেদ"
                          value={author}
                          onChange={(e) => setAuthor(e.target.value)}
                          className="w-full px-2.5 py-1.5 rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#121820] text-xs focus:outline-none focus:ring-1 focus:ring-red-600 font-medium"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] text-slate-500 dark:text-slate-400 font-semibold mb-0.5">
                          প্রতিবেদকের পদবী
                        </label>
                        <input
                          type="text"
                          placeholder="যেমন: বিশেষ প্রতিনিধি / নিজস্ব সংবাদদাতা"
                          value={reporterTitle}
                          onChange={(e) => setReporterTitle(e.target.value)}
                          className="w-full px-2.5 py-1.5 rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#121820] text-xs focus:outline-none focus:ring-1 focus:ring-red-600 font-medium"
                        />
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Source */}
            <div>
              <label className="block font-bold mb-1 text-slate-700 dark:text-slate-300">সংবাদের উৎস (Source)</label>
              <input
                type="text"
                placeholder="যেমন: নিজস্ব প্রতিবেদক / রয়টার্স / বিবিসি"
                value={source}
                onChange={(e) => setSource(e.target.value)}
                className="w-full px-3 py-2 rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#121820] text-xs"
              />
            </div>

            {/* Hierarchical Location: Division & Dependent District Selection */}
            <div className="col-span-1 sm:col-span-2 p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-100/50 dark:bg-slate-900/40 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-red-600" />
                  <span>সংবাদের ভৌগোলিক অবস্থান (Division & District Selection) *</span>
                </span>
                <span className="text-[10px] text-slate-500 font-mono">
                  {division} বিভাগ ➔ {district} জেলা
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* 1. Division Dropdown */}
                <div>
                  <label className="block text-[11px] font-bold mb-1 text-slate-700 dark:text-slate-300">
                    বিভাগ নির্বাচন করুন (Select Division) *
                  </label>
                  <select
                    value={division}
                    onChange={(e) => handleDivisionChange(e.target.value)}
                    className="w-full px-3 py-2 rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#121820] text-xs font-bold cursor-pointer"
                  >
                    {BANGLADESH_DIVISIONS.map((d) => (
                      <option key={d.id} value={d.nameBn}>
                        {d.nameBn} বিভাগ ({d.nameEn})
                      </option>
                    ))}
                  </select>
                </div>

                {/* 2. Dependent District Dropdown */}
                <div>
                  <label className="block text-[11px] font-bold mb-1 text-slate-700 dark:text-slate-300 flex items-center justify-between">
                    <span>জেলা নির্বাচন করুন (District) *</span>
                    <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-normal">
                      {getDivisionDistricts(division).length}টি জেলা অন্তর্ভুক্ত
                    </span>
                  </label>
                  <select
                    value={district}
                    onChange={(e) => setDistrict(e.target.value)}
                    className="w-full px-3 py-2 rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#121820] text-xs font-bold cursor-pointer"
                  >
                    {getDivisionDistricts(division).map((dist) => (
                      <option key={dist.nameBn} value={dist.nameBn}>
                        {dist.nameBn} ({dist.nameEn})
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 4: FEATURED IMAGE & CAPTION */}
          <div className={`p-4 rounded-lg border space-y-3 ${
            darkMode ? 'bg-[#1b232e]/50 border-slate-800' : 'bg-slate-50/50 border-slate-200'
          }`}>
            <div className="flex items-center justify-between">
              <label className="block font-bold text-slate-700 dark:text-slate-300">
                মূল ফিচার ফটো ও ক্লাউড সিডিএন (Featured Image & Cloud CDN)
              </label>

              <div className="flex items-center gap-2">
                <span className="text-[10px] text-slate-400 font-mono">CDN Storage:</span>
                <span className={`text-[10px] px-2 py-0.5 rounded font-mono font-bold uppercase ${
                  cdnStorageProvider === 'cloudinary'
                    ? 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300'
                    : cdnStorageProvider === 's3'
                    ? 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                    : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                }`}>
                  {cdnStorageProvider}
                </span>
              </div>
            </div>

            {/* Cloud Upload Notice */}
            {cloudUploadNotice && (
              <div className="p-2 rounded bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 text-xs flex items-center gap-1.5 animate-in fade-in duration-200">
                <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span className="font-semibold">{cloudUploadNotice}</span>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
              <div className="md:col-span-8 flex items-center gap-2">
                <label className="px-3 py-2 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 rounded-md text-xs font-bold cursor-pointer shrink-0 transition-colors flex items-center gap-1.5">
                  <UploadCloud className={`w-3.5 h-3.5 text-blue-600 ${isUploadingCloud ? 'animate-bounce' : ''}`} />
                  <span>{isUploadingCloud ? 'আপলোড হচ্ছে...' : 'সিডিএন আপলোড'}</span>
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    accept="image/*" 
                    disabled={isUploadingCloud}
                    className="hidden" 
                    onChange={handleImageFileChange} 
                  />
                </label>
                <input
                  type="text"
                  placeholder="অথবা সরাসরি ক্লাউড সিডিএন / ওয়েব URL পেস্ট করুন..."
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  className="w-full px-3 py-2 rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#121820] text-xs font-mono"
                />
              </div>

              <div className="md:col-span-4">
                <input
                  type="text"
                  placeholder="ছবির ক্যাপশন / সূত্র (ফাইল ছবি)..."
                  value={imageCaption}
                  onChange={(e) => setImageCaption(e.target.value)}
                  className="w-full px-3 py-2 rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#121820] text-xs"
                />
              </div>
            </div>

            {imageUrl && imageUrl.trim() !== '' && (
              <div className="flex items-center gap-4 pt-1">
                <div className="w-24 h-16 rounded overflow-hidden border border-slate-300 dark:border-slate-700 shrink-0 shadow-xs relative bg-slate-100 dark:bg-slate-800">
                  <img 
                    src={imageUrl.trim()} 
                    alt="Preview" 
                    onError={(e) => {
                      e.currentTarget.src = 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?auto=format&fit=crop&w=800&q=80';
                    }}
                    className="w-full h-full object-cover" 
                  />
                  {imageUrl.includes('cloudinary') && (
                    <span className="absolute bottom-0 right-0 text-[8px] bg-blue-600 text-white px-1 font-bold">
                      WebP
                    </span>
                  )}
                  {imageUrl.includes('s3') && (
                    <span className="absolute bottom-0 right-0 text-[8px] bg-amber-600 text-white px-1 font-bold">
                      S3
                    </span>
                  )}
                </div>
                <div className="text-[11px] text-slate-500 flex-1">
                  <p className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <span>ফটো প্রিভিউ লোড হয়েছে</span>
                    {imageUrl.startsWith('https://') && (
                      <span className="text-[9px] px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 font-bold">
                        CDN Active
                      </span>
                    )}
                  </p>
                  <p className="truncate max-w-md">{imageCaption || 'কোনো ক্যাপশন দেওয়া হয়নি'}</p>
                </div>
              </div>
            )}
          </div>

          {/* SECTION 5: EXCERPT (সংক্ষিপ্ত ভূমিকা) */}
          <div>
            <label className="block font-bold mb-1 text-slate-700 dark:text-slate-300">
              সংক্ষিপ্ত ভূমিকা বা ইন্ট্রো (Lead Paragraph / Excerpt)
            </label>
            <textarea
              rows={2}
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              placeholder="প্রথম প্যারাগ্রাফ বা গুরুত্বপূর্ণ সারসংক্ষেপ যা হোমপেজ কার্ডে প্রদর্শিত হবে..."
              className="w-full px-3 py-2 rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#121820] text-xs leading-relaxed focus:outline-none focus:ring-1 focus:ring-red-600"
            />
          </div>

          {/* SECTION 6: RICH TEXT EDITOR TOOLBAR & CONTENT AREA */}
          <div className="border border-slate-300 dark:border-slate-700 rounded-lg overflow-hidden bg-white dark:bg-[#121820]">
            
            {/* EDITOR TOOLBAR */}
            <div className={`p-2 border-b flex flex-wrap items-center justify-between gap-2 ${
              darkMode ? 'bg-[#1b232e] border-slate-800' : 'bg-slate-100 border-slate-200'
            }`}>
              {/* Formatting Action Buttons */}
              <div className="flex flex-wrap items-center gap-1">
                <button
                  type="button"
                  onClick={() => insertFormatting('**', '**', 'বোল্ড টেক্সট')}
                  className="p-1.5 rounded hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300"
                  title="বোল্ড (Bold)"
                >
                  <Bold className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => insertFormatting('*', '*', 'ইটালিক টেক্সট')}
                  className="p-1.5 rounded hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300"
                  title="ইটালিক (Italic)"
                >
                  <Italic className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => insertFormatting('<u>', '</u>', 'আন্ডারলাইন টেক্সট')}
                  className="p-1.5 rounded hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300"
                  title="আন্ডারলাইন (Underline)"
                >
                  <Underline className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => insertFormatting('~~', '~~', 'কাটা টেক্সট')}
                  className="p-1.5 rounded hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300"
                  title="স্ট্রাইকথ্রু (Strikethrough)"
                >
                  <Strikethrough className="w-3.5 h-3.5" />
                </button>

                <span className="text-slate-300 dark:text-slate-700 px-0.5">|</span>

                <button
                  type="button"
                  onClick={() => insertHeading(2)}
                  className="px-2 py-1 rounded hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-extrabold flex items-center gap-0.5"
                  title="হেডিং ২ (Heading 2)"
                >
                  <Heading2 className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => insertHeading(3)}
                  className="px-2 py-1 rounded hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold flex items-center gap-0.5"
                  title="হেডিং ৩ (Heading 3)"
                >
                  <Heading3 className="w-3.5 h-3.5" />
                </button>

                <span className="text-slate-300 dark:text-slate-700 px-0.5">|</span>

                <button
                  type="button"
                  onClick={() => insertList(false)}
                  className="p-1.5 rounded hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300"
                  title="বুলেট লিস্ট (Bullet List)"
                >
                  <List className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => insertList(true)}
                  className="p-1.5 rounded hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300"
                  title="নম্বরযুক্ত লিস্ট (Numbered List)"
                >
                  <ListOrdered className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={insertQuote}
                  className="p-1.5 rounded hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300"
                  title="উদ্ধৃতি / ব্লককোট (Blockquote)"
                >
                  <Quote className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setShowLinkDialog(true)}
                  className="p-1.5 rounded hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300"
                  title="লিংক প্রবেশ করান (Insert Link)"
                >
                  <LinkIcon className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={insertCallout}
                  className="p-1.5 rounded hover:bg-slate-200 dark:hover:bg-slate-700 text-amber-600 font-bold text-[11px]"
                  title="বিশেষ তথ্য বক্স (Callout Box)"
                >
                  📌 বক্স
                </button>
              </div>

              {/* View Mode Switcher (Editor / Preview / Split) */}
              <div className="flex items-center gap-1 bg-white dark:bg-slate-800 p-0.5 rounded-md border border-slate-200 dark:border-slate-700">
                <button
                  type="button"
                  onClick={() => setEditorViewMode('edit')}
                  className={`px-2 py-1 rounded text-[11px] font-bold flex items-center gap-1 ${
                    editorViewMode === 'edit'
                      ? 'bg-red-600 text-white'
                      : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
                  }`}
                >
                  <Edit3 className="w-3 h-3" />
                  <span>এডিটর</span>
                </button>
                <button
                  type="button"
                  onClick={() => setEditorViewMode('preview')}
                  className={`px-2 py-1 rounded text-[11px] font-bold flex items-center gap-1 ${
                    editorViewMode === 'preview'
                      ? 'bg-red-600 text-white'
                      : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
                  }`}
                >
                  <Eye className="w-3 h-3" />
                  <span>প্রিভিউ</span>
                </button>
                <button
                  type="button"
                  onClick={() => setEditorViewMode('split')}
                  className={`hidden md:flex px-2 py-1 rounded text-[11px] font-bold items-center gap-1 ${
                    editorViewMode === 'split'
                      ? 'bg-red-600 text-white'
                      : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
                  }`}
                >
                  <Columns className="w-3 h-3" />
                  <span>স্প্লিট</span>
                </button>
              </div>
            </div>

            {/* Link Dialog Overlay */}
            {showLinkDialog && (
              <div className="p-3 bg-blue-50 dark:bg-blue-950/40 border-b border-blue-200 dark:border-blue-800 flex flex-wrap items-center gap-2">
                <span className="font-bold text-blue-700 dark:text-blue-300 text-xs">হাইপারলিংক যোগ করুন:</span>
                <input
                  type="text"
                  placeholder="লিংকের শিরোনাম..."
                  value={linkText}
                  onChange={(e) => setLinkText(e.target.value)}
                  className="px-2 py-1 rounded border border-blue-300 dark:border-blue-700 bg-white dark:bg-slate-900 text-xs flex-1"
                />
                <input
                  type="text"
                  placeholder="URL (https://...)"
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                  className="px-2 py-1 rounded border border-blue-300 dark:border-blue-700 bg-white dark:bg-slate-900 text-xs flex-1"
                />
                <button
                  type="button"
                  onClick={handleConfirmLink}
                  className="px-3 py-1 bg-blue-600 text-white rounded text-xs font-bold hover:bg-blue-700"
                >
                  যুক্ত করুন
                </button>
                <button
                  type="button"
                  onClick={() => setShowLinkDialog(false)}
                  className="px-2 py-1 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 text-xs cursor-pointer"
                >
                  বাতিল
                </button>
              </div>
            )}

            {/* TEXTAREA & PREVIEW PANELS */}
            <div className={`min-h-[260px] ${editorViewMode === 'split' ? 'grid grid-cols-2 divide-x divide-slate-200 dark:divide-slate-800' : ''}`}>
              
              {/* EDIT PANEL */}
              {(editorViewMode === 'edit' || editorViewMode === 'split') && (
                <div className="p-3 flex flex-col">
                  <textarea
                    ref={textareaRef}
                    rows={12}
                    required
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="বিস্তারিত সংবাদ লিখুন... (উপরের টুলবার থেকে বোল্ড, ইটালিক, হেডিং, উদ্ধৃতি বা বুলেট লিস্ট ব্যবহার করুন)"
                    className="w-full flex-1 p-2 bg-transparent text-slate-900 dark:text-slate-100 placeholder:text-slate-400 text-xs leading-relaxed focus:outline-none resize-y font-solaiman"
                  />
                </div>
              )}

              {/* PREVIEW PANEL */}
              {(editorViewMode === 'preview' || editorViewMode === 'split') && (
                <div className="p-4 bg-slate-50/50 dark:bg-slate-950/30 overflow-y-auto max-h-[350px] space-y-3 font-solaiman text-xs">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider pb-1 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
                    <span>লাইভ রিডার ফরম্যাটিং প্রিভিউ</span>
                    <span>{stats.readTimeBn} পড়ার সময়</span>
                  </div>
                  {renderFormattedPreview(content)}
                </div>
              )}
            </div>

            {/* METRICS & STATS BAR */}
            <div className={`px-4 py-2 border-t flex flex-wrap items-center justify-between gap-3 text-[11px] ${
              darkMode ? 'bg-[#1b232e] border-slate-800 text-slate-400' : 'bg-slate-100 border-slate-200 text-slate-600'
            }`}>
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1 font-semibold">
                  <FileText className="w-3.5 h-3.5 text-slate-400" />
                  <span>শব্দ: <b className="text-slate-900 dark:text-white">{stats.words}</b></span>
                </span>
                <span>•</span>
                <span className="flex items-center gap-1 font-semibold">
                  <span>অক্ষর: <b className="text-slate-900 dark:text-white">{stats.chars}</b></span>
                </span>
                <span>•</span>
                <span className="flex items-center gap-1 font-semibold text-emerald-600 dark:text-emerald-400">
                  <Clock className="w-3.5 h-3.5" />
                  <span>আনুমানিক পাঠ সময়: <b>{stats.readTimeBn}</b></span>
                </span>
              </div>

              <div className="text-[10px] text-slate-400">
                💡 এডিটর শর্টকাট: বোল্ড করতে `**কথা**`, উদ্ধৃতি করতে `&gt; বক্তব্য` লিখুন
              </div>
            </div>
          </div>

          {/* SECTION 7: TAGS & SEO FOCUS */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* TAGS INPUT */}
            <div className={`p-3.5 rounded-lg border space-y-2 ${
              darkMode ? 'bg-[#1b232e]/50 border-slate-800' : 'bg-slate-50/50 border-slate-200'
            }`}>
              <label className="block font-bold text-slate-700 dark:text-slate-300">
                ট্যাগ ও কিওয়ার্ড (Tags)
              </label>
              
              <div className="flex flex-wrap items-center gap-1.5 p-2 rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#121820]">
                {tags.map((tag, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-red-100 dark:bg-red-950/50 text-red-700 dark:text-red-300 text-[11px] font-bold"
                  >
                    #{tag}
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      className="hover:text-red-900 dark:hover:text-red-100"
                    >
                      ×
                    </button>
                  </span>
                ))}
                <input
                  type="text"
                  placeholder="ট্যাগ লিখে Enter চাপুন..."
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={handleTagKeyDown}
                  className="flex-1 min-w-[120px] bg-transparent text-xs focus:outline-none"
                />
              </div>

              <div className="flex flex-wrap items-center gap-1 pt-1 text-[10px] text-slate-500">
                <span className="font-bold">জনপ্রিয় ট্যাগ:</span>
                {['রাজনীতি', 'অর্থনীতি', 'আদালত', 'খেলা', 'আন্তর্জাতিক', 'শিক্ষা'].map((sug) => (
                  <button
                    key={sug}
                    type="button"
                    onClick={() => handleAddTag(sug)}
                    className="px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 text-slate-700 dark:text-slate-300"
                  >
                    +{sug}
                  </button>
                ))}
              </div>
            </div>

            {/* SEO FOCUS KEYWORD & SERP PREVIEW */}
            <div className={`p-3.5 rounded-lg border space-y-2 ${
              darkMode ? 'bg-[#1b232e]/50 border-slate-800' : 'bg-slate-50/50 border-slate-200'
            }`}>
              <label className="block font-bold text-slate-700 dark:text-slate-300">
                গুগল সার্চ ও এসইও মেটা প্রিভিউ (SEO SERP Snippet)
              </label>

              <input
                type="text"
                placeholder="ফোকাস এসইও কিওয়ার্ড (যেমন: ব্যাংক সংস্কার)..."
                value={seoFocusKeyword}
                onChange={(e) => setSeoFocusKeyword(e.target.value)}
                className="w-full px-3 py-1.5 rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#121820] text-xs"
              />

              {/* Dynamic Google SERP / Link Preview Box */}
              <div className="p-2.5 rounded bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1 font-sans text-[11px]">
                <div className="text-blue-600 dark:text-blue-400 font-bold truncate">
                  {title || 'সংবাদের শিরোনাম এখানে প্রদর্শিত হবে'} — {siteConfig.siteName || 'নিউজ পোর্টাল'}
                </div>
                <div className="text-emerald-700 dark:text-emerald-500 text-[10px] truncate">
                  https://{siteConfig.domain || 'newsportal.com'}/news/{(title || 'headline').substring(0, 30)}
                </div>
                <div className="text-slate-600 dark:text-slate-400 text-[10px] line-clamp-2">
                  {excerpt || content.substring(0, 110) || 'বিস্তারিত সংবাদ বিবরণ ও তথ্যবহুল বিশ্লেষণ...'}
                </div>
              </div>
            </div>
          </div>

          {/* SECTION: NEWS SCHEDULING, AUTO-EXPIRING & BACKDATING (Requirement 2) */}
          <div className={`p-4 rounded-xl border space-y-4 ${
            darkMode ? 'bg-[#1b232e]/70 border-slate-800' : 'bg-slate-50 border-slate-200'
          }`}>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center">
                  <CalendarClock className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                    <span>সময়সূচি ও প্রকাশনা নিয়ন্ত্রণ (Scheduling, Auto-Expire & Backdate)</span>
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    ভবিষ্যতের সময়সূচি নির্ধারণ, নোটিশের অটো-মেয়াদোত্তীর্ণ ও অতীতের ব্যাকডেট প্রকাশনা
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1 bg-white dark:bg-slate-800 p-1 rounded-lg border border-slate-200 dark:border-slate-700 text-xs">
                <button
                  type="button"
                  onClick={() => setPublishMode('immediate')}
                  className={`px-2.5 py-1 rounded-md font-bold transition-colors ${
                    publishMode === 'immediate'
                      ? 'bg-red-600 text-white shadow-xs'
                      : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
                  }`}
                >
                  তাত্ক্ষণিক প্রকাশ
                </button>
                <button
                  type="button"
                  onClick={() => setPublishMode('scheduled')}
                  className={`px-2.5 py-1 rounded-md font-bold transition-colors ${
                    publishMode === 'scheduled'
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
                  }`}
                >
                  শিডিউল প্রকাশনা
                </button>
                <button
                  type="button"
                  onClick={() => setPublishMode('backdated')}
                  className={`px-2.5 py-1 rounded-md font-bold transition-colors ${
                    publishMode === 'backdated'
                      ? 'bg-purple-600 text-white shadow-xs'
                      : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
                  }`}
                >
                  ব্যাকডেট (Past Date)
                </button>
              </div>
            </div>

            {/* Sub-Panel: Scheduled Publishing */}
            {publishMode === 'scheduled' && (
              <div className="p-3.5 rounded-lg border border-blue-300 dark:border-blue-800 bg-blue-50/60 dark:bg-blue-950/20 space-y-2 text-xs">
                <div className="flex items-center gap-2 text-blue-700 dark:text-blue-300 font-bold">
                  <Clock className="w-4 h-4" />
                  <span>প্রকাশনার সময়সূচি (Publish Schedule / Future Date & Time)</span>
                </div>
                <p className="text-[11px] text-slate-600 dark:text-slate-400">
                  নির্ধারিত তারিখ ও সময় পৌঁছালে সংবাদটি স্বয়ংক্রিয়ভাবে ফ্রন্টএন্ড লাইভ ফিডে প্রকাশিত হবে।
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div>
                    <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                      ভবিষ্যৎ তারিখ ও সময় নির্বাচন করুন:
                    </label>
                    <input
                      type="datetime-local"
                      value={scheduledAt || ''}
                      onChange={(e) => setScheduledAt(e.target.value)}
                      className="w-full px-3 py-1.5 rounded-md border border-blue-300 dark:border-blue-700 bg-white dark:bg-slate-900 font-mono text-xs font-bold"
                    />
                  </div>
                  <div className="p-2.5 rounded bg-white dark:bg-slate-900 border border-blue-200 dark:border-blue-800 text-[11px] flex flex-col justify-center">
                    <span className="text-slate-500">শিডিউল ব্যাজ:</span>
                    <span className="font-bold text-blue-600 dark:text-blue-400">
                      ⏰ {new Date(scheduledAt || Date.now()).toLocaleString('bn-BD')} সময়ে স্বয়ংক্রিয় লাইভ হবে
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Sub-Panel: Backdating */}
            {publishMode === 'backdated' && (
              <div className="p-3.5 rounded-lg border border-purple-300 dark:border-purple-800 bg-purple-50/60 dark:bg-purple-950/20 space-y-2 text-xs">
                <div className="flex items-center gap-2 text-purple-700 dark:text-purple-300 font-bold">
                  <History className="w-4 h-4" />
                  <span>ব্যাকডেট (Backdate / Historical Past Date)</span>
                </div>
                <p className="text-[11px] text-slate-600 dark:text-slate-400">
                  ঐতিহাসিক প্রতিবেদন বা পুরোনো আর্কাইভ সংবাদের জন্য অতীতের নির্দিষ্ট প্রকাশনার তারিখ নির্ধারণ করুন।
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div>
                    <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                      অতীতের তারিখ বাছুন (Calendar Date):
                    </label>
                    <input
                      type="date"
                      value={customBackdate || ''}
                      onChange={(e) => {
                        setCustomBackdate(e.target.value);
                      }}
                      className="w-full px-3 py-1.5 rounded-md border border-purple-300 dark:border-purple-700 bg-white dark:bg-slate-900 font-mono text-xs font-bold"
                    />
                  </div>
                  <div className="p-2.5 rounded bg-white dark:bg-slate-900 border border-purple-200 dark:border-purple-800 text-[11px] flex flex-col justify-center">
                    <span className="text-slate-500">সাইটে প্রদর্শিত তারিখ:</span>
                    <span className="font-bold text-purple-600 dark:text-purple-400">
                      📅 {customBackdate || 'অতীত তারিখ'} (আর্কাইভ ক্যালেন্ডার ইনডেক্স হবে)
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Auto-Expiring / Unpublish Option */}
            <div className="p-3.5 rounded-lg border border-amber-300/70 dark:border-amber-800/70 bg-amber-50/40 dark:bg-amber-950/10 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer font-bold text-amber-800 dark:text-amber-300">
                  <input
                    type="checkbox"
                    checked={isAutoExpire}
                    onChange={(e) => setIsAutoExpire(e.target.checked)}
                    className="w-4 h-4 text-amber-600 rounded"
                  />
                  <span className="flex items-center gap-1.5">
                    <TimerOff className="w-4 h-4" />
                    <span>অটো-এক্সপায়ারি সক্রিয় করুন (Auto-Expire / Unpublish Time)</span>
                  </span>
                </label>

                {isAutoExpire && (
                  <span className="text-[10px] px-2 py-0.5 rounded bg-amber-200 dark:bg-amber-900/60 text-amber-800 dark:text-amber-200 font-bold">
                    স্বয়ংক্রিয় আনপাবলিশ সক্রিয়
                  </span>
                )}
              </div>

              <p className="text-[11px] text-slate-600 dark:text-slate-400">
                জরুরি বিজ্ঞপ্তি, নির্বাচন ফলাফল আপডেট বা স্বল্পমেয়াদি নোটিশের জন্য এটি সক্রিয় করুন। নির্দিষ্ট সময় পার হলে সংবাদটি স্বয়ংক্রিয়ভাবে পাঠকদের দৃশ্যপট থেকে আনপাবলিশ হয়ে যাবে।
              </p>

              {isAutoExpire && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div>
                    <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                      মেয়াদ শেষ হওয়ার তারিখ ও সময়:
                    </label>
                    <input
                      type="datetime-local"
                      value={expiresAt || ''}
                      onChange={(e) => setExpiresAt(e.target.value)}
                      className="w-full px-3 py-1.5 rounded-md border border-amber-300 dark:border-amber-700 bg-white dark:bg-slate-900 font-mono text-xs font-bold"
                    />
                  </div>
                  <div className="p-2.5 rounded bg-white dark:bg-slate-900 border border-amber-200 dark:border-amber-800 text-[11px] flex flex-col justify-center">
                    <span className="text-slate-500">মেয়াদোত্তীর্ণের পর:</span>
                    <span className="font-bold text-amber-600 dark:text-amber-400">
                      🔒 {new Date(expiresAt || Date.now()).toLocaleString('bn-BD')} পরে পোর্টাল থেকে আনপাবলিশ হবে
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* SECTION 8: EDITORIAL BADGES & PUBLISHING CONTROLS */}
          <div className="pt-2 border-t flex flex-wrap items-center justify-between gap-4">
            
            <div className="flex flex-wrap items-center gap-5">
              <label className="flex items-center gap-1.5 cursor-pointer font-bold text-red-600 text-xs">
                <input
                  type="checkbox"
                  checked={isBreaking}
                  onChange={(e) => setIsBreaking(e.target.checked)}
                  className="w-4 h-4 text-red-600 rounded"
                />
                <span className="flex items-center gap-1">
                  <Flame className="w-3.5 h-3.5" />
                  <span>ব্রেকিং নিউজ</span>
                </span>
              </label>

              <label className="flex items-center gap-1.5 cursor-pointer font-bold text-amber-600 text-xs">
                <input
                  type="checkbox"
                  checked={isLead}
                  onChange={(e) => setIsLead(e.target.checked)}
                  className="w-4 h-4 text-amber-600 rounded"
                />
                <span>প্রধান লিড সংবাদ (Hero Lead)</span>
              </label>

              <label className="flex items-center gap-1.5 cursor-pointer font-bold text-purple-600 text-xs">
                <input
                  type="checkbox"
                  checked={isTrending}
                  onChange={(e) => setIsTrending(e.target.checked)}
                  className="w-4 h-4 text-purple-600 rounded"
                />
                <span>শীর্ষ ট্রেন্ডিং</span>
              </label>

              {/* Hide / Unpublish Toggle */}
              <label className="flex items-center gap-1.5 cursor-pointer font-bold text-rose-600 dark:text-rose-400 text-xs bg-rose-50 dark:bg-rose-950/40 px-2.5 py-1 rounded border border-rose-200 dark:border-rose-800">
                <input
                  type="checkbox"
                  checked={isHidden || postStatus === 'hidden'}
                  onChange={(e) => {
                    setIsHidden(e.target.checked);
                    if (e.target.checked) {
                      setPostStatus('hidden');
                    } else {
                      setPostStatus('published');
                    }
                  }}
                  className="w-4 h-4 text-rose-600 rounded"
                />
                <span className="flex items-center gap-1">
                  <EyeOff className="w-3.5 h-3.5" />
                  <span>হাইড / আনপাবলিশ করুন (Hide from Public View)</span>
                </span>
              </label>
            </div>

            {/* Publishing Status Selector */}
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-500">স্ট্যাটাস:</span>
              <select
                value={postStatus}
                onChange={(e) => {
                  const val = e.target.value as any;
                  setPostStatus(val);
                  setIsHidden(val === 'hidden');
                }}
                className="px-2.5 py-1.5 rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#121820] text-xs font-bold"
              >
                <option value="published">সরাসরি প্রকাশ (Publish)</option>
                <option value="pending">পেন্ডিং কিউ (Pending)</option>
                <option value="rejected">খসড়া (Draft)</option>
                <option value="hidden">🔒 হাইড / আনপাবলিশ (Hidden)</option>
              </select>
            </div>
          </div>

          {/* FOOTER ACTIONS */}
          <div className="pt-4 border-t flex items-center justify-between">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-md border border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-bold"
            >
              বাতিল করুন
            </button>

            <div className="flex items-center gap-2">
              <button
                type="submit"
                className="px-6 py-2 rounded-md bg-red-600 hover:bg-red-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-md transition-colors"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{editingPost ? 'আপডেট সংরক্ষণ করুন' : 'সংবাদ প্রকাশ করুন'}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
