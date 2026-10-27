/**
 * ============================================================================
 * Enterprise News Portal - News Desk Auto-Aggregator & AI Rewriter CMS Panel
 * ============================================================================
 * 
 * Features:
 * 1. Target News Sources & RSS Links Manager with "আলোচিত সংবাদ" (Trending) filter
 * 2. Automated AI Rewriting, Image Extraction & Categorization Preview
 * 3. Frequency / Interval Controller (30m, 1h, 2h, 4h)
 * 4. Editorial Review Queue / Direct Publish Toggle
 * 5. 1-Click Run & Instant Draft Approval / Publishing
 * ============================================================================
 */

import React, { useState } from 'react';
import {
  Cpu,
  Rss,
  Globe,
  Play,
  RotateCcw,
  CheckCircle2,
  Clock,
  Sparkles,
  Sliders,
  Filter,
  Plus,
  Trash2,
  ExternalLink,
  Eye,
  EyeOff,
  Check,
  Send,
  AlertCircle,
  FileText,
  Radio,
  RefreshCw,
  TrendingUp,
  Image as ImageIcon,
  MapPin
} from 'lucide-react';
import { BANGLADESH_DIVISIONS, getDivisionDistricts } from '../../data/bangladeshGeoData';
import { NewsSourceItem, AutoAggregatorSettings, NewsDeskQueueItem, Article } from '../../types/news';
import {
  getStoredSources,
  saveStoredSources,
  getStoredAggregatorSettings,
  saveStoredAggregatorSettings,
  getStoredQueue,
  saveStoredQueue,
  runAutoAggregatorCycle,
  sanitizeAndDynamicizeReportFootnote,
  getActiveSiteName
} from '../../utils/newsDeskAggregator';
import { SiteSettings } from '../../types/news';

interface NewsDeskPanelProps {
  darkMode: boolean;
  onAddArticle: (article: Article) => void;
  showSuccessMessage: (msg: string) => void;
  siteSettings?: SiteSettings;
}

export const NewsDeskPanel: React.FC<NewsDeskPanelProps> = ({
  darkMode,
  onAddArticle,
  showSuccessMessage,
  siteSettings,
}) => {
  const [sources, setSources] = useState<NewsSourceItem[]>(getStoredSources);
  const [settings, setSettings] = useState<AutoAggregatorSettings>(getStoredAggregatorSettings);
  const [queue, setQueue] = useState<NewsDeskQueueItem[]>(getStoredQueue);
  const [activeSubTab, setActiveSubTab] = useState<'sources' | 'queue' | 'settings'>('queue');

  // New source modal
  const [isAddSourceModalOpen, setIsAddSourceModalOpen] = useState(false);
  const [newSourceName, setNewSourceName] = useState('');
  const [newSourceUrl, setNewSourceUrl] = useState('');
  const [newSourceRss, setNewSourceRss] = useState('');
  const [newSourceCategory, setNewSourceCategory] = useState('জাতীয়');
  const [newSourceTrendingOnly, setNewSourceTrendingOnly] = useState(false);

  // Running State
  const [isRunningCycle, setIsRunningCycle] = useState(false);
  const [previewItem, setPreviewItem] = useState<NewsDeskQueueItem | null>(null);
  const [previewDivision, setPreviewDivision] = useState('ঢাকা');
  const [previewDistrict, setPreviewDistrict] = useState('ঢাকা');
  const [previewIsHidden, setPreviewIsHidden] = useState(false);

  // Toggle Source active status
  const handleToggleSource = (id: string) => {
    const updated = sources.map(s => s.id === id ? { ...s, isActive: !s.isActive } : s);
    setSources(updated);
    saveStoredSources(updated);
    showSuccessMessage('সোর্স স্ট্যাটাস আপডেট হয়েছে!');
  };

  // Toggle Trending Filter on a source
  const handleToggleSourceTrending = (id: string) => {
    const updated = sources.map(s => s.id === id ? { ...s, isTrendingOnly: !s.isTrendingOnly } : s);
    setSources(updated);
    saveStoredSources(updated);
    showSuccessMessage('আলোচিত সংবাদ ফিল্টার আপডেট হয়েছে!');
  };

  // Delete source
  const handleDeleteSource = (id: string) => {
    if (confirm('এই সংবাদ সোর্সটি মুছে ফেলতে চান?')) {
      const updated = sources.filter(s => s.id !== id);
      setSources(updated);
      saveStoredSources(updated);
      showSuccessMessage('সোর্স মুছে ফেলা হয়েছে!');
    }
  };

  // Add new source
  const handleAddSource = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSourceName.trim() || !newSourceUrl.trim()) return;

    const newSource: NewsSourceItem = {
      id: `src-${Date.now()}`,
      name: newSourceName.trim(),
      url: newSourceUrl.trim(),
      rssFeedUrl: newSourceRss.trim() || undefined,
      category: newSourceCategory,
      isActive: true,
      isTrendingOnly: newSourceTrendingOnly,
      totalFetched: 0,
      lastFetchedAt: 'এখনই যোগ করা হলো',
    };

    const updated = [...sources, newSource];
    setSources(updated);
    saveStoredSources(updated);
    setIsAddSourceModalOpen(false);
    setNewSourceName('');
    setNewSourceUrl('');
    setNewSourceRss('');
    showSuccessMessage('নতুন সংবাদ সোর্স সফলভাবে যুক্ত হয়েছে!');
  };

  // Update Settings
  const handleSaveSettings = (newSt: AutoAggregatorSettings) => {
    setSettings(newSt);
    saveStoredAggregatorSettings(newSt);
    showSuccessMessage('নিউজ ডেস্ক সেটিংস সংরক্ষিত হয়েছে!');
  };

  // Run Manual Fetch Cycle
  const handleTriggerCycle = async () => {
    setIsRunningCycle(true);
    try {
      const res = await runAutoAggregatorCycle(sources, settings, onAddArticle, siteSettings?.siteName);
      setQueue(getStoredQueue());
      setSettings(getStoredAggregatorSettings());
      showSuccessMessage(res.logMessage);
    } catch {
      showSuccessMessage('অটো-ফেচ সাইকেলে ত্রুটি হয়েছে। অনুগ্রহ করে ইন্টারনেট সংযোগ পরীক্ষা করুন।');
    } finally {
      setIsRunningCycle(false);
    }
  };

  // Approve & Publish from Queue with Division, District and Hide Support
  const handleApproveQueueItem = (
    item: NewsDeskQueueItem,
    customDivision?: string,
    customDistrict?: string,
    isHiddenOverride?: boolean
  ) => {
    const finalDivision = customDivision || (previewItem?.id === item.id ? previewDivision : 'ঢাকা');
    const finalDistrict = customDistrict || (previewItem?.id === item.id ? previewDistrict : 'ঢাকা');
    const finalIsHidden = isHiddenOverride !== undefined 
      ? isHiddenOverride 
      : (previewItem?.id === item.id ? previewIsHidden : false);

    const effectiveBrand = (siteSettings?.siteName || getActiveSiteName()).trim();
    const effectiveAuthor = settings.targetAuthorName && settings.targetAuthorName.trim()
      ? settings.targetAuthorName
      : `${effectiveBrand} নিউজ ডেস্ক`;

    const newArt: Article = {
      id: `art-${Date.now()}`,
      title: item.rewrittenTitle,
      excerpt: item.rewrittenExcerpt,
      content: sanitizeAndDynamicizeReportFootnote(item.rewrittenContent, effectiveBrand),
      category: item.category,
      categoryEn: item.category,
      author: effectiveAuthor,
      date: '১০ অক্টোবর ২০২৬',
      timeAgo: 'এইমাত্র',
      imageUrl: item.imageUrl,
      views: 140,
      readTime: '২ মিনিট',
      isTrending: item.isTrending,
      division: finalDivision,
      district: finalDistrict,
      isHidden: finalIsHidden,
      status: finalIsHidden ? 'hidden' : 'published',
      source: item.sourceName,
      tags: [item.category, finalDistrict, `${effectiveBrand} নিউজ ডেস্ক`, 'বিশেষ প্রতিবেদন'],
    };

    onAddArticle(newArt);

    const updatedQueue = queue.map(q => q.id === item.id ? { ...q, status: 'published' as const, publishedAt: 'এইমাত্র' } : q);
    setQueue(updatedQueue);
    saveStoredQueue(updatedQueue);
    showSuccessMessage(
      finalIsHidden
        ? `'${item.rewrittenTitle.slice(0, 30)}...' সংবাদটি সফলভাবে হাইড হিসেবে কিউ থেকে অনুমোদিত ও সংরক্ষিত হয়েছে (পাবলিক ভিউতে গোপন)!`
        : `'${item.rewrittenTitle.slice(0, 30)}...' লাইভ পোর্টালে সরাসরি প্রকাশিত হয়েছে!`
    );
    if (previewItem?.id === item.id) setPreviewItem(null);
  };

  // Reject / Remove from Queue
  const handleRejectQueueItem = (id: string) => {
    const updated = queue.filter(q => q.id !== id);
    setQueue(updated);
    saveStoredQueue(updated);
    showSuccessMessage('আইটেমটি ড্রাফট কিউ থেকে অপসারিত হয়েছে।');
    if (previewItem?.id === id) setPreviewItem(null);
  };

  return (
    <div className="p-4 md:p-6 space-y-6 font-solaiman">
      {/* ================= TOP HERO BANNER ================= */}
      <div className={`p-5 rounded-xl border flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 shadow-sm ${
        darkMode ? 'bg-[#151c24] border-slate-800' : 'bg-white border-slate-200'
      }`}>
        <div className="flex items-start gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-rose-600 to-red-500 text-white flex items-center justify-center shrink-0 shadow-md">
            <Cpu className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                নিউজ ডেস্ক (News Desk / Auto-Aggregator & AI Rewriter)
              </h2>
              <span className="text-[10px] uppercase font-bold font-mono px-2 py-0.5 rounded bg-red-100 dark:bg-red-950 text-red-600 dark:text-red-400">
                PRO MODULE
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-2xl leading-relaxed">
              শীর্ষস্থানীয় বাংলাদেশী সংবাদপত্র (প্রথম আলো, বিডিনিউজ২৪, ডেইলি স্টার ইত্যাদি) থেকে আরএসএস ও সোর্স লিংকের মাধ্যমে স্বয়ংক্রিয়ভাবে খবর সংগ্রহ করে, এআই দিয়ে ১০০% অনন্য করে রি-রাইট এবং নির্ধারিত সময়ে সরাসরি প্রকাশ বা ড্রাফটে সংরক্ষণ করে।
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          <button
            type="button"
            onClick={handleTriggerCycle}
            disabled={isRunningCycle}
            className={`flex-1 sm:flex-none px-4 py-2.5 rounded-lg text-xs font-bold text-white flex items-center justify-center gap-2 transition-all shadow-sm ${
              isRunningCycle
                ? 'bg-slate-400 cursor-not-allowed'
                : 'bg-red-600 hover:bg-red-700 active:scale-95'
            }`}
          >
            <RefreshCw className={`w-4 h-4 ${isRunningCycle ? 'animate-spin' : ''}`} />
            <span>{isRunningCycle ? 'সংবাদ ফেচ ও রি-রাইট হচ্ছে...' : 'এখনই ফেচ ও রি-রাইট চালান (Run Now)'}</span>
          </button>
        </div>
      </div>

      {/* ================= STATS SUMMARY CARDS ================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className={`p-4 rounded-xl border flex items-center justify-between ${
          darkMode ? 'bg-[#1b222c] border-slate-800' : 'bg-white border-slate-200'
        }`}>
          <div>
            <div className="text-xs text-slate-500 font-semibold">সক্রিয় সংবাদ সোর্স</div>
            <div className="text-2xl font-black mt-1 text-slate-900 dark:text-white">
              {sources.filter(s => s.isActive).length} <span className="text-xs font-normal text-slate-400">/ {sources.length} টি</span>
            </div>
          </div>
          <div className="w-10 h-10 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 flex items-center justify-center">
            <Globe className="w-5 h-5" />
          </div>
        </div>

        <div className={`p-4 rounded-xl border flex items-center justify-between ${
          darkMode ? 'bg-[#1b222c] border-slate-800' : 'bg-white border-slate-200'
        }`}>
          <div>
            <div className="text-xs text-slate-500 font-semibold">অনুমোদন অপেক্ষমাণ (Queue)</div>
            <div className="text-2xl font-black mt-1 text-amber-600">
              {queue.filter(q => q.status === 'draft').length} টি
            </div>
          </div>
          <div className="w-10 h-10 rounded-lg bg-amber-50 dark:bg-amber-950/60 text-amber-600 flex items-center justify-center">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        <div className={`p-4 rounded-xl border flex items-center justify-between ${
          darkMode ? 'bg-[#1b222c] border-slate-800' : 'bg-white border-slate-200'
        }`}>
          <div>
            <div className="text-xs text-slate-500 font-semibold">প্রকাশনার মোড</div>
            <div className="text-sm font-bold mt-1.5 flex items-center gap-1.5">
              <span className={`w-2 h-2 rounded-full ${settings.directPublish ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
              <span className={settings.directPublish ? 'text-emerald-600 dark:text-emerald-400 font-bold' : 'text-slate-800 dark:text-slate-200'}>
                {settings.directPublish ? 'সরাসরি লাইভ পাবলিশ' : 'অনুমোদন সাপেক্ষ (Drafts)'}
              </span>
            </div>
          </div>
          <div className="w-10 h-10 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 flex items-center justify-center">
            <Radio className="w-5 h-5" />
          </div>
        </div>

        <div className={`p-4 rounded-xl border flex items-center justify-between ${
          darkMode ? 'bg-[#1b222c] border-slate-800' : 'bg-white border-slate-200'
        }`}>
          <div>
            <div className="text-xs text-slate-500 font-semibold">স্বয়ংক্রিয় বিরতি (Interval)</div>
            <div className="text-lg font-black mt-1 text-purple-600">
              প্রতি {settings.fetchIntervalMinutes === 30 ? '৩০ মিনিট' : settings.fetchIntervalMinutes === 60 ? '১ ঘণ্টা' : `${settings.fetchIntervalMinutes / 60} ঘণ্টা`} পরপর
            </div>
          </div>
          <div className="w-10 h-10 rounded-lg bg-purple-50 dark:bg-purple-950/60 text-purple-600 flex items-center justify-center">
            <RotateCcw className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* ================= SUB TABS NAVIGATION ================= */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800">
        {[
          { id: 'queue', label: `রি-রাইট কিউ ও ড্রাফট তালিকা (${queue.filter(q => q.status === 'draft').length})`, icon: Clock },
          { id: 'sources', label: `সংবাদ সোর্স ও RSS লিংক (${sources.length})`, icon: Globe },
          { id: 'settings', label: 'সময় ও অটোমেশন সেটিংস', icon: Sliders },
        ].map((tab) => {
          const IconC = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id as any)}
              className={`px-4 py-3 text-xs font-bold border-b-2 flex items-center gap-2 transition-all ${
                activeSubTab === tab.id
                  ? 'border-red-600 text-red-600 dark:text-red-400'
                  : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <IconC className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* ================= TAB CONTENT 1: QUEUE & REVIEW DRAFTS ================= */}
      {activeSubTab === 'queue' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <span>রি-রাইট করা সংবাদ যাচাই ও অনুমোদন কিউ (Editorial Review Queue)</span>
              </h3>
              <p className="text-xs text-slate-500">
                এআই দ্বারা প্রস্তুতকৃত সংবাদসমূহ যাচাই করে সরাসরি ওয়েবসাইটে প্রকাশ করতে 'অনুমোদন ও প্রকাশ' বাটনে চাপুন।
              </p>
            </div>
          </div>

          {queue.length === 0 ? (
            <div className={`p-12 text-center rounded-xl border ${
              darkMode ? 'bg-[#1b222c] border-slate-800' : 'bg-white border-slate-200'
            }`}>
              <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
              <h4 className="font-bold text-base text-slate-800 dark:text-slate-200">
                বর্তমানে কিউতে কোনো অপেক্ষমাণ সংবাদ নেই
              </h4>
              <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
                উপরে 'এখনই ফেচ ও রি-রাইট চালান' বাটনে ক্লিক করে শীর্ষ পোর্টালগুলো থেকে তাজা খবর সংকলন করুন।
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {queue.map((item) => {
                const isDraft = item.status === 'draft';
                return (
                  <div
                    key={item.id}
                    className={`rounded-xl border overflow-hidden flex flex-col justify-between transition-all shadow-xs ${
                      isDraft
                        ? darkMode ? 'bg-[#1b222c] border-slate-700' : 'bg-white border-slate-300'
                        : darkMode ? 'bg-[#151c24] border-slate-800 opacity-60' : 'bg-slate-50 border-slate-200 opacity-60'
                    }`}
                  >
                    <div>
                      {/* Image Thumbnail with Overlay */}
                      <div className="relative aspect-16/9 bg-slate-100 dark:bg-slate-800 overflow-hidden">
                        <img
                          src={item.imageUrl}
                          alt={item.rewrittenTitle}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute top-2 left-2 flex items-center gap-1.5">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-black/75 text-white backdrop-blur-xs">
                            {item.sourceName}
                          </span>
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-600 text-white">
                            {item.category}
                          </span>
                          {item.isTrending && (
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-500 text-white flex items-center gap-0.5">
                              <TrendingUp className="w-2.5 h-2.5" /> আলোচিত
                            </span>
                          )}
                        </div>

                        <span className={`absolute top-2 right-2 text-[10px] font-bold px-2 py-0.5 rounded ${
                          isDraft ? 'bg-amber-500 text-white' : 'bg-emerald-600 text-white'
                        }`}>
                          {isDraft ? 'অপেক্ষমাণ ড্রাফট' : 'প্রকাশিত'}
                        </span>
                      </div>

                      {/* Content Card Body */}
                      <div className="p-4 space-y-2.5">
                        <h4 className="font-bold text-sm text-slate-900 dark:text-white line-clamp-2 leading-snug">
                          {item.rewrittenTitle}
                        </h4>

                        <div className="p-2 rounded bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 text-[11px] text-slate-500 space-y-1">
                          <div className="font-semibold text-slate-700 dark:text-slate-300 truncate">
                            মূল শিরোনাম: {item.originalTitle}
                          </div>
                          <div className="flex items-center justify-between text-[10px]">
                            <span>সংগৃহীত: {item.fetchedAt}</span>
                            <span className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                              <Sparkles className="w-3 h-3" /> এআই রি-রাইট সম্পন্ন
                            </span>
                          </div>
                        </div>

                        <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-3 leading-relaxed">
                          {item.rewrittenExcerpt}
                        </p>
                      </div>
                    </div>

                    {/* Bottom Action Buttons */}
                    <div className="p-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 flex items-center justify-between gap-2">
                      <button
                        type="button"
                        onClick={() => setPreviewItem(item)}
                        className="px-2.5 py-1.5 text-xs text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 rounded font-semibold flex items-center gap-1 transition-colors"
                        title="সম্পূর্ণ প্রিভিউ দেখুন"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>প্রিভিউ</span>
                      </button>

                      <div className="flex items-center gap-1.5">
                        {isDraft ? (
                          <>
                            <button
                              type="button"
                              onClick={() => handleRejectQueueItem(item.id)}
                              className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/60 rounded transition-colors"
                              title="বাতিল ও ডিলিট"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleApproveQueueItem(item)}
                              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-xs font-bold flex items-center gap-1 shadow-xs transition-colors"
                            >
                              <Check className="w-3.5 h-3.5" />
                              <span>অনুমোদন ও প্রকাশ</span>
                            </button>
                          </>
                        ) : (
                          <span className="text-xs text-emerald-600 font-bold flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" /> প্রকাশিত হয়েছে
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ================= TAB CONTENT 2: SOURCES MANAGEMENT ================= */}
      {activeSubTab === 'sources' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <span>পছন্দের সংবাদ সোর্স ও RSS ফিড ম্যানেজার (Target Sources Manager)</span>
              </h3>
              <p className="text-xs text-slate-500">
                যেসব বাংলাদেশী পোর্টাল থেকে সংবাদ সংগ্রহ করতে চান তাদের ওয়েবসাইট লিংক বা RSS ফিড চালু বা বন্ধ করুন।
              </p>
            </div>

            <button
              type="button"
              onClick={() => setIsAddSourceModalOpen(true)}
              className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>নতুন সংবাদ সোর্স যোগ করুন</span>
            </button>
          </div>

          <div className={`rounded-xl border overflow-hidden shadow-xs ${
            darkMode ? 'bg-[#1b222c] border-slate-800' : 'bg-white border-slate-200'
          }`}>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 uppercase text-[11px] font-bold border-b">
                  <tr>
                    <th className="p-3">সংবাদমাধ্যম / সোর্স নাম</th>
                    <th className="p-3">ইউআরএল / ফিড লিংক</th>
                    <th className="p-3">ডিফল্ট ক্যাটাগরি</th>
                    <th className="p-3 text-center">আলোচিত সংবাদ ফিল্টার</th>
                    <th className="p-3 text-center">মোট ফেচ</th>
                    <th className="p-3 text-center">সক্রিয় স্ট্যাটাস</th>
                    <th className="p-3 text-right">অ্যাকশন</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {sources.map((src) => (
                    <tr key={src.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                      <td className="p-3 font-bold text-slate-900 dark:text-white">
                        <div className="flex items-center gap-2.5">
                          <img
                            src={src.logoUrl || 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?auto=format&fit=crop&w=120&q=80'}
                            alt=""
                            className="w-6 h-6 rounded-md object-cover border border-slate-200 dark:border-slate-700"
                          />
                          <div>
                            <div>{src.name}</div>
                            <div className="text-[10px] text-slate-400 font-normal">{src.lastFetchedAt || 'এখনো ফেচ হয়নি'}</div>
                          </div>
                        </div>
                      </td>
                      <td className="p-3 text-slate-500 font-mono text-[11px]">
                        <div>{src.url}</div>
                        {src.rssFeedUrl && (
                          <div className="text-blue-500 text-[10px] flex items-center gap-1">
                            <Rss className="w-3 h-3" /> {src.rssFeedUrl}
                          </div>
                        )}
                      </td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold">
                          {src.category}
                        </span>
                      </td>
                      <td className="p-3 text-center">
                        <button
                          type="button"
                          onClick={() => handleToggleSourceTrending(src.id)}
                          className={`px-2.5 py-1 rounded text-[11px] font-bold transition-all ${
                            src.isTrendingOnly
                              ? 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 border border-amber-300'
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                          }`}
                        >
                          {src.isTrendingOnly ? '✓ শুধু আলোচিত' : 'সকল সংবাদ'}
                        </button>
                      </td>
                      <td className="p-3 text-center font-bold text-slate-700 dark:text-slate-300">
                        {src.totalFetched} টি
                      </td>
                      <td className="p-3 text-center">
                        <button
                          type="button"
                          onClick={() => handleToggleSource(src.id)}
                          className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                            src.isActive ? 'bg-emerald-600' : 'bg-slate-300 dark:bg-slate-700'
                          }`}
                        >
                          <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition ${
                              src.isActive ? 'translate-x-4' : 'translate-x-0'
                            }`}
                          />
                        </button>
                      </td>
                      <td className="p-3 text-right">
                        <button
                          type="button"
                          onClick={() => handleDeleteSource(src.id)}
                          className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/60 rounded transition-colors"
                          title="মুছে ফেলুন"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ================= TAB CONTENT 3: SETTINGS & INTERVAL CONTROLLER ================= */}
      {activeSubTab === 'settings' && (
        <div className={`p-6 rounded-xl border space-y-6 ${
          darkMode ? 'bg-[#1b222c] border-slate-800' : 'bg-white border-slate-200'
        }`}>
          <div className="border-b pb-3">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Sliders className="w-4 h-4 text-red-600" />
              <span>সময়সূচি ও প্রকাশনা নিয়ন্ত্রণ (Automation & Interval Settings)</span>
            </h3>
            <p className="text-xs text-slate-500">
              নিউজ ডেস্কের ফেচ ফ্রিকোয়েন্সি, ড্রাফট কিউ নাকি সরাসরি লাইভ পাবলিশ মোড কনফিগার করুন।
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
            {/* Setting 1: Frequency Controller */}
            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 space-y-3">
              <label className="block font-bold text-slate-900 dark:text-white">
                স্বয়ংক্রিয় ফেচ ও রি-রাইটের সময় নির্ধারণ (Fetching Frequency / Interval):
              </label>
              <select
                value={settings?.fetchIntervalMinutes ?? 60}
                onChange={(e) => handleSaveSettings({ ...settings, fetchIntervalMinutes: parseInt(e.target.value) || 60 })}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-bold text-xs"
              >
                <option value={30}>প্রতি ৩০ মিনিট পর পর (Every 30 Minutes)</option>
                <option value={60}>প্রতি ১ ঘণ্টা পর পর (Every 1 Hour - Recommended)</option>
                <option value={120}>প্রতি ২ ঘণ্টা পর পর (Every 2 Hours)</option>
                <option value={240}>প্রতি ৪ ঘণ্টা পর পর (Every 4 Hours)</option>
                <option value={360}>প্রতি ৬ ঘণ্টা পর পর (Every 6 Hours)</option>
              </select>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                ব্যাকগ্রাউন্ড ক্রন জব নির্ধারিত সময়ের ব্যবধানে সোর্স সাইটগুলো স্ক্যান করে নতুন সংবাদ তৈরি করবে।
              </p>
            </div>

            {/* Setting 2: Editorial Review Queue vs Direct Publish Toggle */}
            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 space-y-3">
              <label className="block font-bold text-slate-900 dark:text-white">
                প্রকাশনা মোড নির্বাচন (Publishing Workflow):
              </label>
              <div className="space-y-2">
                <label className="flex items-center gap-2.5 p-2 rounded-lg hover:bg-white dark:hover:bg-slate-800 cursor-pointer">
                  <input
                    type="radio"
                    name="publish_mode"
                    checked={!settings.directPublish}
                    onChange={() => handleSaveSettings({ ...settings, directPublish: false })}
                    className="text-red-600 focus:ring-red-500"
                  />
                  <div>
                    <span className="font-bold text-slate-900 dark:text-white">অনুমোদন অপেক্ষমাণ (Queue in Drafts - নিরাপদ)</span>
                    <p className="text-[10px] text-slate-500">রি-রাইট করা সংবাদ ড্রাফটে জমা থাকবে, আপনি রিভিউ করে পাবলিশ করবেন।</p>
                  </div>
                </label>

                <label className="flex items-center gap-2.5 p-2 rounded-lg hover:bg-white dark:hover:bg-slate-800 cursor-pointer">
                  <input
                    type="radio"
                    name="publish_mode"
                    checked={settings.directPublish}
                    onChange={() => handleSaveSettings({ ...settings, directPublish: true })}
                    className="text-red-600 focus:ring-red-500"
                  />
                  <div>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400">অটো-পাবলিশ সরাসরি (Direct Live Publish)</span>
                    <p className="text-[10px] text-slate-500">রি-রাইট হওয়া মাত্রই কোনো অপেক্ষমাণ ছাড়া মূল পোর্টালে প্রকাশ হবে।</p>
                  </div>
                </label>
              </div>
            </div>

            {/* Setting 3: Filter Trending Only */}
            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 space-y-3">
              <label className="block font-bold text-slate-900 dark:text-white">
                আলোচিত সংবাদ ফিল্টারিং (Trending News Filter):
              </label>
              <label className="flex items-center gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.filterTrendingOnly}
                  onChange={(e) => handleSaveSettings({ ...settings, filterTrendingOnly: e.target.checked })}
                  className="rounded text-red-600 focus:ring-red-500"
                />
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  শুধুমাত্র "আলোচিত সংবাদ" (Trending / Featured News) সংগ্রহ করবে
                </span>
              </label>
              <p className="text-[11px] text-slate-500">
                সাধারণ ছোটখাটো খবর এড়িয়ে গিয়ে শুধুমাত্র সর্বোচ্চ পঠিত ও ভাইরাল সংবাদগুলো এগ্রিগেট করবে।
              </p>
            </div>

            {/* Setting 4: Default Author Assignment */}
            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 space-y-2">
              <label className="block font-bold text-slate-900 dark:text-white">
                প্রতিবেদকের নাম (Target Author Name):
              </label>
              <input
                type="text"
                value={settings?.targetAuthorName || ''}
                onChange={(e) => handleSaveSettings({ ...settings, targetAuthorName: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-bold text-xs"
                placeholder="নিউজ ডেস্ক (News Desk)"
              />
              <p className="text-[11px] text-slate-500">
                স্বয়ংক্রিয়ভাবে প্রস্তুতকৃত সংবাদের নিচে প্রতিবেদকের নাম হিসেবে এটি প্রদর্শিত হবে।
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL: ADD NEWS SOURCE ================= */}
      {isAddSourceModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4">
          <div className={`w-full max-w-md rounded-xl p-6 space-y-4 shadow-2xl border ${
            darkMode ? 'bg-[#151c24] border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'
          }`}>
            <div className="flex items-center justify-between border-b pb-3">
              <h4 className="font-bold text-base flex items-center gap-2">
                <Globe className="w-5 h-5 text-blue-600" />
                <span>নতুন সংবাদ সোর্স / আরএসএস যোগ করুন</span>
              </h4>
              <button
                type="button"
                onClick={() => setIsAddSourceModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddSource} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold mb-1">সংবাদমাধ্যমের নাম *</label>
                <input
                  type="text"
                  required
                  value={newSourceName}
                  onChange={(e) => setNewSourceName(e.target.value)}
                  placeholder="যেমন: প্রথম আলো বা বিবিসি বাংলা"
                  className="w-full px-3 py-2 rounded border border-slate-300 dark:border-slate-700 bg-transparent text-xs"
                />
              </div>

              <div>
                <label className="block font-bold mb-1">ওয়েবসাইট ইউআরএল (Main URL) *</label>
                <input
                  type="url"
                  required
                  value={newSourceUrl}
                  onChange={(e) => setNewSourceUrl(e.target.value)}
                  placeholder="https://www.prothomalo.com"
                  className="w-full px-3 py-2 rounded border border-slate-300 dark:border-slate-700 bg-transparent text-xs font-mono"
                />
              </div>

              <div>
                <label className="block font-bold mb-1">RSS ফিড ইউআরএল (ঐচ্ছিক কিন্তু দ্রুততর)</label>
                <input
                  type="url"
                  value={newSourceRss}
                  onChange={(e) => setNewSourceRss(e.target.value)}
                  placeholder="https://www.prothomalo.com/feed"
                  className="w-full px-3 py-2 rounded border border-slate-300 dark:border-slate-700 bg-transparent text-xs font-mono"
                />
              </div>

              <div>
                <label className="block font-bold mb-1">ডিফল্ট ক্যাটাগরি</label>
                <select
                  value={newSourceCategory}
                  onChange={(e) => setNewSourceCategory(e.target.value)}
                  className="w-full px-3 py-2 rounded border border-slate-300 dark:border-slate-700 bg-transparent text-xs font-bold"
                >
                  <option value="জাতীয়">জাতীয়</option>
                  <option value="রাজনীতি">রাজনীতি</option>
                  <option value="অর্থনীতি">অর্থনীতি</option>
                  <option value="আন্তর্জাতিক">আন্তর্জাতিক</option>
                  <option value="খেলা">খেলা</option>
                  <option value="বিনোদন">বিনোদন</option>
                  <option value="সারাদেশ">সারাদেশ</option>
                </select>
              </div>

              <div className="pt-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={newSourceTrendingOnly}
                    onChange={(e) => setNewSourceTrendingOnly(e.target.checked)}
                    className="rounded text-red-600 focus:ring-red-500"
                  />
                  <span className="font-bold text-slate-800 dark:text-slate-200">
                    শুধুমাত্র আলোচিত সংবাদ (Trending News) ফিল্টার করবে
                  </span>
                </label>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setIsAddSourceModalOpen(false)}
                  className="px-4 py-2 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 rounded text-xs font-bold"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-bold shadow-xs"
                >
                  সোর্স সংরক্ষণ করুন
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: PREVIEW ITEM ================= */}
      {previewItem && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4">
          <div className={`w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-xl p-6 space-y-4 shadow-2xl border ${
            darkMode ? 'bg-[#151c24] border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'
          }`}>
            <div className="flex items-center justify-between border-b pb-3">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-600 text-white">
                  {previewItem.category}
                </span>
                <span className="text-xs text-slate-400">সোর্স: {previewItem.sourceName}</span>
              </div>
              <button
                type="button"
                onClick={() => setPreviewItem(null)}
                className="text-slate-400 hover:text-slate-600 font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg md:text-xl font-bold leading-snug">
                {previewItem.rewrittenTitle}
              </h3>

              <div className="aspect-16/9 rounded-lg overflow-hidden border border-slate-200 dark:border-slate-800">
                <img
                  src={previewItem.imageUrl}
                  alt=""
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-lg text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-semibold italic border-l-4 border-red-600">
                {previewItem.rewrittenExcerpt}
              </div>

              <div className="text-xs text-slate-700 dark:text-slate-300 leading-loose whitespace-pre-line">
                {sanitizeAndDynamicizeReportFootnote(
                  previewItem.rewrittenContent, 
                  siteSettings?.siteName || getActiveSiteName()
                )}
              </div>

              {/* Hierarchical Location Selector & Hide / Unpublish Control */}
              <div className="p-3.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-red-600" />
                    <span>সংবাদের ভৌগোলিক অবস্থান (Location Selection)</span>
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono">
                    {previewDivision} বিভাগ ➔ {previewDistrict} জেলা
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold mb-1 text-slate-700 dark:text-slate-300">
                      বিভাগ নির্বাচন করুন:
                    </label>
                    <select
                      value={previewDivision}
                      onChange={(e) => {
                        const newDiv = e.target.value;
                        setPreviewDivision(newDiv);
                        const dists = getDivisionDistricts(newDiv);
                        if (dists.length > 0) setPreviewDistrict(dists[0].nameBn);
                      }}
                      className="w-full px-2.5 py-1.5 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#121820] text-xs font-bold cursor-pointer"
                    >
                      {BANGLADESH_DIVISIONS.map((d) => (
                        <option key={d.id} value={d.nameBn}>
                          {d.nameBn} বিভাগ ({d.nameEn})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold mb-1 text-slate-700 dark:text-slate-300 flex items-center justify-between">
                      <span>জেলা নির্বাচন করুন:</span>
                      <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-normal">
                        {getDivisionDistricts(previewDivision).length}টি জেলা
                      </span>
                    </label>
                    <select
                      value={previewDistrict}
                      onChange={(e) => setPreviewDistrict(e.target.value)}
                      className="w-full px-2.5 py-1.5 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#121820] text-xs font-bold cursor-pointer"
                    >
                      {getDivisionDistricts(previewDivision).map((dist) => (
                        <option key={dist.nameBn} value={dist.nameBn}>
                          {dist.nameBn} ({dist.nameEn})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Hide / Unpublish Toggle */}
                <div className="pt-2 border-t border-slate-200 dark:border-slate-800">
                  <label className="flex items-center gap-2 cursor-pointer font-bold text-rose-600 dark:text-rose-400 text-xs bg-rose-50 dark:bg-rose-950/40 px-2.5 py-1.5 rounded border border-rose-200 dark:border-rose-800 w-fit">
                    <input
                      type="checkbox"
                      checked={previewIsHidden}
                      onChange={(e) => setPreviewIsHidden(e.target.checked)}
                      className="w-4 h-4 text-rose-600 rounded"
                    />
                    <span className="flex items-center gap-1.5">
                      <EyeOff className="w-3.5 h-3.5" />
                      <span>হাইড / আনপাবলিশ রাখুন (পাবলিক ভিউ থেকে গোপন থাকবে)</span>
                    </span>
                  </label>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2 pt-4 border-t">
              <button
                type="button"
                onClick={() => setPreviewItem(null)}
                className="px-4 py-2 bg-slate-200 dark:bg-slate-700 rounded text-xs font-bold cursor-pointer"
              >
                বন্ধ করুন
              </button>

              {previewItem.status === 'draft' && (
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleApproveQueueItem(previewItem, previewDivision, previewDistrict, true)}
                    className="px-3 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer"
                    title="পাবলিক ভিউতে না দেখিয়ে ড্রাফট/হাইড হিসেবে সেভ করুন"
                  >
                    <EyeOff className="w-3.5 h-3.5 text-rose-300" />
                    <span>হাইড হিসেবে সংরক্ষণ</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleApproveQueueItem(previewItem, previewDivision, previewDistrict, previewIsHidden)}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-xs font-bold flex items-center gap-1.5 shadow-sm cursor-pointer"
                  >
                    <Check className="w-4 h-4" />
                    <span>{previewIsHidden ? 'হাইড হিসেবে অনুমোদন করুন' : 'এখনই লাইভ পোর্টালে পাবলিশ করুন'}</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
