import React, { useState } from 'react';
import { 
  Megaphone, 
  Plus, 
  Trash2, 
  Edit3, 
  Eye, 
  EyeOff, 
  Upload, 
  ExternalLink, 
  Code, 
  Type, 
  Image as ImageIcon, 
  Check, 
  X, 
  Sliders, 
  Clock, 
  Sparkles, 
  AlertCircle,
  Maximize2,
  Calendar,
  RotateCcw,
  Search,
  Layout,
  Layers,
  CheckCircle2
} from 'lucide-react';
import { AdSlot, AdPlacementPosition, AdContentType, AdSizePreset } from '../../types/news';
import { UniversalAdSlot } from '../Ads/UniversalAdSlot';
import { initialAdSlots } from '../../data/mockNewsData';

interface AdManagerPanelProps {
  adSlots: AdSlot[];
  onUpdateAdSlots: (slots: AdSlot[]) => void;
  darkMode: boolean;
  showSuccessMessage: (msg: string) => void;
}

export const PLACEMENT_OPTIONS: { 
  id: AdPlacementPosition; 
  labelBn: string; 
  desc: string; 
  defaultSize: AdSizePreset;
  recommendedDims: string;
  gridZone: string;
}[] = [
  {
    id: 'header_top',
    labelBn: 'হেডার টপ ব্যানার (Header Top Banner)',
    desc: 'ওয়েবসাইটের একদম শীর্ষে হেডারের লোগোর পাশে বা মূল মেনুর উপরে দৃশ্যমান',
    defaultSize: '728x90',
    recommendedDims: '728 × 90 px বা Responsive',
    gridZone: 'Header'
  },
  {
    id: 'below_ticker',
    labelBn: 'ব্রেকিং নিউজের নিচে (Below Breaking Ticker)',
    desc: 'স্ক্রোলিং ব্রেকিং নিউজ টিকিটের ঠিক নিচে পুরো বা বক্স উইডথে প্রদর্শিত',
    defaultSize: 'responsive',
    recommendedDims: 'Full Width (970×90 বা Fluid)',
    gridZone: 'Top Body'
  },
  {
    id: 'sidebar_top',
    labelBn: 'সাইডবার টপ উইজেট (Sidebar Top Widget)',
    desc: 'জাতীয় বা লিড সংবাদের ঠিক ডানপাশের প্রথম সাইডবার পজিশন (Hero Right)',
    defaultSize: '300x250',
    recommendedDims: '300 × 250 px',
    gridZone: 'Sidebar 1'
  },
  {
    id: 'sidebar_middle',
    labelBn: 'সাইডবার মিডল উইজেট (Sidebar Middle Widget)',
    desc: 'রাজনীতি ও ট্রেন্ডিং সেকশনের মাঝখানের সাইডবার স্লট (Politics Right)',
    defaultSize: '300x250',
    recommendedDims: '300 × 250 px',
    gridZone: 'Sidebar 2'
  },
  {
    id: 'sidebar_bottom',
    labelBn: 'সাইডবার বটম উইজেট (Sidebar Bottom Widget)',
    desc: 'বিশ্ব ও দেশজুড়ে সেকশনের দীর্ঘ সাইডবার বিজ্ঞাপন (300x600 বা 300x250)',
    defaultSize: '300x600',
    recommendedDims: '300 × 600 px বা 300 × 250 px',
    gridZone: 'Sidebar 3'
  },
  {
    id: 'home_inter_grid',
    labelBn: 'হোমপেজ সেকশন ইন্টার-গ্রিড (Homepage Inter-grid)',
    desc: 'হোমপেজের দুটি সংবাদ সেকশনের মাঝখানের ফুল-উইডথ বা গ্রিড ব্যানার',
    defaultSize: '970x90',
    recommendedDims: '970 × 90 px বা 970 × 250 px',
    gridZone: 'Mid Body'
  },
  {
    id: 'article_middle',
    labelBn: 'সংবাদের বিস্তারিত পাতার মাঝে (Article In-Content)',
    desc: 'সংবাদের মূল সংবাদের ৪-৫টি অনুচ্ছেদের মাঝখানে স্বয়ংক্রিয় বিজ্ঞাপন',
    defaultSize: 'responsive',
    recommendedDims: 'Responsive বা 300 × 250 px',
    gridZone: 'Article Detail'
  },
  {
    id: 'article_bottom',
    labelBn: 'সংবাদের বিস্তারিত পাতার নিচে (Article Bottom)',
    desc: 'সংবাদের নিচে মন্তব্য ও সম্পর্কিত সংবাদের ঠিক উপরের ব্যানার',
    defaultSize: '728x90',
    recommendedDims: '728 × 90 px বা Responsive',
    gridZone: 'Article Detail'
  },
  {
    id: 'footer_top',
    labelBn: 'ফুটার ব্যানার (Footer Banner)',
    desc: 'ওয়েবসাইটের মূল ফুটারে প্রবেশের ঠিক আগের প্রিমিয়াম বিজ্ঞাপন',
    defaultSize: '970x90',
    recommendedDims: '970 × 90 px বা 728 × 90 px',
    gridZone: 'Footer'
  },
  {
    id: 'epaper_top',
    labelBn: 'ই-পেপার হেডার লিডারবোর্ড (E-Paper Top Leaderboard)',
    desc: 'ডিজিটাল ই-পেপার ব্রডশিট সংস্করণের শীর্ষ মাস্টহেডের উপরে/নিচে প্রিমিয়াম ব্যানার',
    defaultSize: '970x90',
    recommendedDims: '970 × 90 px বা 728 × 90 px',
    gridZone: 'E-Paper'
  },
  {
    id: 'epaper_strip',
    labelBn: 'ই-পেপার সাব-মাস্টহেড স্ট্রিপ (E-Paper Strip Banner)',
    desc: 'ই-পেপারের কানের সংবাদ কার্ডের নিচে ফুল-উইডথ কমার্শিয়াল স্ট্রিপ বিজ্ঞাপন',
    defaultSize: 'responsive',
    recommendedDims: 'Full Width Responsive / Fluid',
    gridZone: 'E-Paper'
  },
  {
    id: 'epaper_sidebar',
    labelBn: 'ই-পেপার কলাম ডিসপ্লে বক্স (E-Paper Column Display Box)',
    desc: 'ই-পেপারের পাতাগুলোর ৪র্থ কলামে বা পাশে মুদ্রিত পত্রিকার মতো বক্স বিজ্ঞাপন',
    defaultSize: '300x250',
    recommendedDims: '300 × 250 px বা 300 × 500 px',
    gridZone: 'E-Paper'
  },
  {
    id: 'epaper_bottom',
    labelBn: 'ই-পেপার বটম ফুটার ব্যানার (E-Paper Bottom Banner)',
    desc: 'ই-পেপার পৃষ্ঠার একদম নিচে সম্পাদকীয় ক্রেডিটের পূর্বের পূর্ণাঙ্গ ব্যানার',
    defaultSize: '970x90',
    recommendedDims: '970 × 90 px বা 728 × 90 px',
    gridZone: 'E-Paper'
  },
];

export const SIZE_PRESETS: { id: AdSizePreset; label: string; dimensions: string; width: number; height: number }[] = [
  { id: '728x90', label: 'Leaderboard (728x90 px)', dimensions: '728 × 90', width: 728, height: 90 },
  { id: '300x250', label: 'Medium Rectangle (300x250 px)', dimensions: '300 × 250', width: 300, height: 250 },
  { id: '300x600', label: 'Half Page Skyscraper (300x600 px)', dimensions: '300 × 600', width: 300, height: 600 },
  { id: '970x90', label: 'Large Leaderboard (970x90 px)', dimensions: '970 × 90', width: 970, height: 90 },
  { id: '970x250', label: 'Billboard (970x250 px)', dimensions: '970 × 250', width: 970, height: 250 },
  { id: '320x100', label: 'Large Mobile Banner (320x100 px)', dimensions: '320 × 100', width: 320, height: 100 },
  { id: '300x500', label: 'Vertical Banner (300x500 px)', dimensions: '300 × 500', width: 300, height: 500 },
  { id: 'responsive', label: 'Fluid / Responsive (অটো অ্যাডাপ্টিভ)', dimensions: '100% Width', width: 0, height: 0 },
  { id: 'custom', label: 'Custom Dimension (কাস্টম দৈর্ঘ্য ও প্রস্থ)', dimensions: 'Custom px', width: 300, height: 250 },
];

export const AdManagerPanel: React.FC<AdManagerPanelProps> = ({
  adSlots,
  onUpdateAdSlots,
  darkMode,
  showSuccessMessage,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterPlacement, setFilterPlacement] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>('all');
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSlot, setEditingSlot] = useState<AdSlot | null>(null);
  const [previewSlot, setPreviewSlot] = useState<AdSlot | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Form states
  const [formTitle, setFormTitle] = useState('');
  const [formSponsorName, setFormSponsorName] = useState('');
  const [formPosition, setFormPosition] = useState<AdPlacementPosition>('header_top');
  const [formType, setFormType] = useState<AdContentType>('banner');
  const [formSize, setFormSize] = useState<AdSizePreset>('728x90');
  const [formCustomWidth, setFormCustomWidth] = useState<number>(728);
  const [formCustomHeight, setFormCustomHeight] = useState<number>(90);
  const [formImageUrl, setFormImageUrl] = useState('');
  const [formTargetUrl, setFormTargetUrl] = useState('');
  const [formAltText, setFormAltText] = useState('');
  const [formCodeSnippet, setFormCodeSnippet] = useState('');
  const [formTextHeadline, setFormTextHeadline] = useState('');
  const [formTextDescription, setFormTextDescription] = useState('');
  const [formTextCtaLabel, setFormTextCtaLabel] = useState('বিস্তারিত দেখুন');
  const [formIsActive, setFormIsActive] = useState(true);
  const [formIsAutoExpire, setFormIsAutoExpire] = useState(false);
  const [formExpiresAt, setFormExpiresAt] = useState('');

  // Handle open create modal
  const handleOpenCreateModal = (defaultPos?: AdPlacementPosition) => {
    setEditingSlot(null);
    setFormTitle('');
    setFormSponsorName('');
    const pos = defaultPos || 'header_top';
    setFormPosition(pos);
    const defPreset = PLACEMENT_OPTIONS.find(p => p.id === pos)?.defaultSize || '728x90';
    setFormSize(defPreset);
    const presetObj = SIZE_PRESETS.find(s => s.id === defPreset);
    setFormCustomWidth(presetObj?.width || 728);
    setFormCustomHeight(presetObj?.height || 90);
    setFormType('banner');
    setFormImageUrl('https://images.unsplash.com/photo-1557804506-669a67965ba0?auto=format&fit=crop&w=800&q=80');
    setFormTargetUrl('https://example.com');
    setFormAltText('');
    setFormCodeSnippet('');
    setFormTextHeadline('');
    setFormTextDescription('');
    setFormTextCtaLabel('বিস্তারিত দেখুন');
    setFormIsActive(true);
    setFormIsAutoExpire(false);
    setFormExpiresAt('');
    setIsModalOpen(true);
  };

  // Handle open edit modal
  const handleOpenEditModal = (slot: AdSlot) => {
    setEditingSlot(slot);
    setFormTitle(slot.title);
    setFormSponsorName(slot.sponsorName || '');
    setFormPosition(slot.position);
    setFormType(slot.type || 'banner');
    setFormSize(slot.size || '300x250');
    setFormCustomWidth(slot.customWidth || 300);
    setFormCustomHeight(slot.customHeight || 250);
    setFormImageUrl(slot.imageUrl || '');
    setFormTargetUrl(slot.targetUrl || '');
    setFormAltText(slot.altText || '');
    setFormCodeSnippet(slot.codeSnippet || '');
    setFormTextHeadline(slot.textHeadline || '');
    setFormTextDescription(slot.textDescription || '');
    setFormTextCtaLabel(slot.textCtaLabel || 'বিস্তারিত দেখুন');
    setFormIsActive(slot.isActive);
    setFormIsAutoExpire(!!slot.isAutoExpire);
    setFormExpiresAt(slot.expiresAt || '');
    setIsModalOpen(true);
  };

  // Handle image file upload
  const handleImageFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert('ছবির আকার সর্বোচ্চ ৫ মেগাবাইট হতে পারে!');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      if (result) {
        setFormImageUrl(result);
      }
    };
    reader.readAsDataURL(file);
  };

  // Handle Preset Change
  const handleSizePresetChange = (presetId: AdSizePreset) => {
    setFormSize(presetId);
    const found = SIZE_PRESETS.find(s => s.id === presetId);
    if (found && found.width > 0) {
      setFormCustomWidth(found.width);
      setFormCustomHeight(found.height);
    }
  };

  // Save Ad Slot
  const handleSaveSlot = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formTitle.trim()) {
      alert('অনুগ্রহ করে বিজ্ঞাপনের একটি শিরোনাম দিন');
      return;
    }

    const newOrUpdatedSlot: AdSlot = {
      id: editingSlot ? editingSlot.id : `ad-${Date.now()}`,
      title: formTitle.trim(),
      sponsorName: formSponsorName.trim(),
      position: formPosition,
      type: formType,
      size: formSize,
      customWidth: formCustomWidth,
      customHeight: formCustomHeight,
      imageUrl: formImageUrl.trim(),
      targetUrl: formTargetUrl.trim(),
      altText: formAltText.trim() || formTitle.trim(),
      codeSnippet: formCodeSnippet,
      textHeadline: formTextHeadline.trim(),
      textDescription: formTextDescription.trim(),
      textCtaLabel: formTextCtaLabel.trim(),
      isActive: formIsActive,
      isAutoExpire: formIsAutoExpire,
      expiresAt: formIsAutoExpire ? formExpiresAt : undefined,
    };

    let updatedSlots: AdSlot[];
    if (editingSlot) {
      updatedSlots = adSlots.map((s) => (s.id === editingSlot.id ? newOrUpdatedSlot : s));
      showSuccessMessage(`বিজ্ঞাপন '${newOrUpdatedSlot.title}' সফলভাবে আপডেট করা হয়েছে!`);
    } else {
      updatedSlots = [...adSlots, newOrUpdatedSlot];
      showSuccessMessage(`নতুন বিজ্ঞাপন স্লট সফলভাবে তৈরি করা হয়েছে!`);
    }

    onUpdateAdSlots(updatedSlots);
    setIsModalOpen(false);
  };

  // 1-Click Toggle Active Status
  const handleToggleActive = (id: string) => {
    const target = adSlots.find(s => s.id === id);
    if (!target) return;
    const nextState = !target.isActive;
    const updated = adSlots.map(s => s.id === id ? { ...s, isActive: nextState } : s);
    onUpdateAdSlots(updated);
    showSuccessMessage(
      nextState 
        ? `'${target.title}' বিজ্ঞাপনটি সক্রিয় করা হয়েছে!` 
        : `'${target.title}' বিজ্ঞাপনটি সাময়িক বন্ধ করা হয়েছে!`
    );
  };

  // Delete Ad Slot
  const handleConfirmDelete = () => {
    if (!deleteConfirmId) return;
    const deletedSlot = adSlots.find(s => s.id === deleteConfirmId);
    const updated = adSlots.filter(s => s.id !== deleteConfirmId);
    onUpdateAdSlots(updated);
    setDeleteConfirmId(null);
    showSuccessMessage(`বিজ্ঞাপন স্লট '${deletedSlot?.title || ''}' মুছে ফেলা হয়েছে!`);
  };

  // Reset to Default Mock Slots
  const handleResetDefaults = () => {
    if (window.confirm('আপনি কি সকল বিজ্ঞাপন স্লট প্রাথমিক ডিফল্ট অবস্থায় ফিরিয়ে নিতে চান?')) {
      onUpdateAdSlots(initialAdSlots);
      showSuccessMessage('সকল বিজ্ঞাপন স্লট সফলভাবে রিসেট করা হয়েছে!');
    }
  };

  // Filter slots
  const filteredSlots = adSlots.filter((slot) => {
    // Placement filter
    if (filterPlacement !== 'all') {
      const matchPos = slot.position === filterPlacement ||
        (filterPlacement === 'sidebar_top' && slot.position === 'hero_right') ||
        (filterPlacement === 'sidebar_middle' && slot.position === 'politics_right') ||
        (filterPlacement === 'sidebar_bottom' && (slot.position === 'world_right' || slot.position === 'country_right'));
      if (!matchPos) return false;
    }

    // Type filter
    if (filterType !== 'all' && (slot.type || 'banner') !== filterType) {
      return false;
    }

    // Status filter
    if (filterStatus === 'active' && !slot.isActive) return false;
    if (filterStatus === 'inactive' && slot.isActive) return false;

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = slot.title.toLowerCase().includes(q);
      const matchSponsor = (slot.sponsorName || '').toLowerCase().includes(q);
      const matchPos = slot.position.toLowerCase().includes(q);
      if (!matchTitle && !matchSponsor && !matchPos) return false;
    }

    return true;
  });

  const activeCount = adSlots.filter(s => s.isActive).length;
  const inactiveCount = adSlots.length - activeCount;

  return (
    <div className="p-3 sm:p-6 space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800 gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-amber-500/10 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold">
              <Megaphone className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xl font-bold font-solaiman text-slate-900 dark:text-white flex items-center gap-2">
                <span>অ্যাড ম্যানেজার ও প্লেসমেন্ট কন্ট্রোলার</span>
                <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                  {adSlots.length} স্লট
                </span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-solaiman">
                হেডার, ব্রেকিংয়ের নিচে, সাইডবার, ইন্টার-গ্রিড, সংবাদের ভেতরের ও ফুটার ব্যানার সম্পূর্ণ গতিশীলভাবে নিয়ন্ত্রণ করুন।
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={handleResetDefaults}
            className="px-3 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded text-xs font-bold font-solaiman flex items-center gap-1.5 transition-colors"
            title="প্রাথমিক ডেমো বিজ্ঞাপনে ফিরিয়ে নিন"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>ডিফল্ট রিস্টোর</span>
          </button>

          <button
            onClick={() => handleOpenCreateModal()}
            className="px-4 py-2 bg-amber-600 hover:bg-amber-700 active:bg-amber-800 text-white rounded text-xs font-bold font-solaiman flex items-center gap-1.5 shadow-sm transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>নতুন বিজ্ঞাপন যোগ করুন</span>
          </button>
        </div>
      </div>

      {/* Visual Placement Layout Quick Selector Map */}
      <div className={`p-4 rounded-xl border ${
        darkMode ? 'bg-slate-900/60 border-slate-800' : 'bg-slate-50/80 border-slate-200'
      }`}>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Layout className="w-4 h-4 text-amber-500" />
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 font-solaiman">
              ওয়েবসাইট লেআউট পজিশন ভিত্তিক কুইক ফিল্টার ও স্লট স্ট্যাটাস
            </h4>
          </div>
          <span className="text-[11px] font-solaiman text-slate-500">
            সক্রিয়: <strong className="text-emerald-600 font-mono">{activeCount}</strong> | বন্ধ: <strong className="text-slate-400 font-mono">{inactiveCount}</strong>
          </span>
        </div>

        {/* Wireframe interactive buttons */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 font-solaiman text-xs">
          <button
            onClick={() => setFilterPlacement('all')}
            className={`p-2.5 rounded-lg border text-left transition-all ${
              filterPlacement === 'all'
                ? 'bg-amber-500 text-white border-amber-600 shadow-xs font-bold'
                : 'bg-white dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 hover:border-amber-400'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="truncate">সকল স্লট</span>
              <span className="text-[10px] font-mono font-bold px-1.5 py-0.2 rounded bg-black/10 dark:bg-white/10">
                {adSlots.length}
              </span>
            </div>
            <p className="text-[10px] opacity-80 mt-1">সব পজিশন একসাথে দেখুন</p>
          </button>

          {PLACEMENT_OPTIONS.map((pos) => {
            const count = adSlots.filter(s => {
              if (s.position === pos.id) return true;
              if (pos.id === 'sidebar_top' && s.position === 'hero_right') return true;
              if (pos.id === 'sidebar_middle' && s.position === 'politics_right') return true;
              if (pos.id === 'sidebar_bottom' && (s.position === 'world_right' || s.position === 'country_right')) return true;
              return false;
            }).length;

            const isSelected = filterPlacement === pos.id;

            return (
              <button
                key={pos.id}
                onClick={() => setFilterPlacement(isSelected ? 'all' : pos.id)}
                className={`p-2.5 rounded-lg border text-left transition-all relative ${
                  isSelected
                    ? 'bg-amber-600 text-white border-amber-700 shadow-xs font-bold'
                    : 'bg-white dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 hover:border-amber-400'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="truncate font-semibold">{pos.gridZone}</span>
                  <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded ${
                    count > 0 
                      ? isSelected ? 'bg-white/20 text-white' : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 font-bold'
                      : 'bg-slate-100 dark:bg-slate-700 text-slate-400'
                  }`}>
                    {count}
                  </span>
                </div>
                <p className="text-[10px] opacity-80 truncate mt-0.5">{pos.labelBn.split('(')[0]}</p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 text-xs font-solaiman">
        <div className="flex flex-wrap items-center gap-2">
          {/* Status Filter */}
          <div className="flex items-center rounded-lg border border-slate-200 dark:border-slate-700 p-0.5 bg-white dark:bg-slate-800">
            <button
              onClick={() => setFilterStatus('all')}
              className={`px-3 py-1.5 rounded text-xs font-bold transition-colors ${
                filterStatus === 'all'
                  ? 'bg-slate-900 text-white dark:bg-slate-200 dark:text-slate-900'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
              }`}
            >
              সব স্ট্যাটাস ({adSlots.length})
            </button>
            <button
              onClick={() => setFilterStatus('active')}
              className={`px-3 py-1.5 rounded text-xs font-bold transition-colors ${
                filterStatus === 'active'
                  ? 'bg-emerald-600 text-white'
                  : 'text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/40'
              }`}
            >
              সক্রিয় ({activeCount})
            </button>
            <button
              onClick={() => setFilterStatus('inactive')}
              className={`px-3 py-1.5 rounded text-xs font-bold transition-colors ${
                filterStatus === 'inactive'
                  ? 'bg-slate-600 text-white'
                  : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700'
              }`}
            >
              নিষ্ক্রিয় ({inactiveCount})
            </button>
          </div>

          {/* Ad Type Filter */}
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300"
          >
            <option value="all">সব বিজ্ঞাপন টাইপ</option>
            <option value="banner">ইমেজ ব্যানার (Banner)</option>
            <option value="code">এইচটিএমএল / অ্যাডসেন্স কোড (HTML/AdSense)</option>
            <option value="text">টেক্সট ঘোষণা অ্যাড (Text Announcement)</option>
          </select>
        </div>

        {/* Search */}
        <div className="relative min-w-[220px]">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="বিজ্ঞাপন বা স্পন্সর খুঁজুন..."
            className="w-full pl-8 pr-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs"
          />
          {searchQuery && (
            <button 
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Ads Grid */}
      {filteredSlots.length === 0 ? (
        <div className="p-12 text-center rounded-xl border border-dashed border-slate-300 dark:border-slate-700 font-solaiman space-y-3">
          <Megaphone className="w-12 h-12 mx-auto text-slate-300 dark:text-slate-600" />
          <h4 className="text-base font-bold text-slate-700 dark:text-slate-300">কোনো বিজ্ঞাপন স্লট পাওয়া যায়নি</h4>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            আপনার নির্বাচিত ফিল্টার বা সার্চের সাথে মিল রয়েছে এমন কোনো বিজ্ঞাপন স্লট নেই।
          </p>
          <button
            onClick={() => handleOpenCreateModal()}
            className="px-4 py-2 bg-amber-600 text-white rounded text-xs font-bold inline-flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>নতুন বিজ্ঞাপন যুক্ত করুন</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredSlots.map((slot) => {
            const placementObj = PLACEMENT_OPTIONS.find(p => p.id === slot.position) || {
              labelBn: slot.position,
              desc: '',
              gridZone: 'Position'
            };

            return (
              <div
                key={slot.id}
                className={`rounded-xl border transition-all duration-200 flex flex-col justify-between overflow-hidden shadow-xs hover:shadow-md ${
                  slot.isActive
                    ? darkMode
                      ? 'bg-slate-900 border-slate-700/80'
                      : 'bg-white border-slate-200'
                    : darkMode
                    ? 'bg-slate-950/60 border-slate-800/80 opacity-75'
                    : 'bg-slate-50 border-slate-200 opacity-75'
                }`}
              >
                {/* Card Header */}
                <div className="p-4 border-b border-slate-100 dark:border-slate-800">
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className="text-[10px] font-bold font-mono px-2 py-0.5 rounded bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300">
                          {slot.position}
                        </span>
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                          {slot.size === 'custom' ? `${slot.customWidth}×${slot.customHeight}` : slot.size}
                        </span>
                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded flex items-center gap-1 ${
                          (slot.type || 'banner') === 'banner'
                            ? 'bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300'
                            : slot.type === 'code'
                            ? 'bg-purple-50 text-purple-700 dark:bg-purple-950 dark:text-purple-300'
                            : 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                        }`}>
                          {(slot.type || 'banner') === 'banner' && <ImageIcon className="w-2.5 h-2.5" />}
                          {slot.type === 'code' && <Code className="w-2.5 h-2.5" />}
                          {slot.type === 'text' && <Type className="w-2.5 h-2.5" />}
                          <span>
                            {(slot.type || 'banner') === 'banner' ? 'ব্যানার' : slot.type === 'code' ? 'এইচটিএমএল' : 'টেক্সট'}
                          </span>
                        </span>
                      </div>

                      <h4 className="font-bold text-sm text-slate-900 dark:text-white font-solaiman line-clamp-1 mt-1">
                        {slot.title}
                      </h4>
                      {slot.sponsorName && (
                        <p className="text-[11px] text-amber-600 dark:text-amber-400 font-solaiman">
                          স্পন্সর: {slot.sponsorName}
                        </p>
                      )}
                    </div>

                    {/* Active Toggle Switch */}
                    <button
                      onClick={() => handleToggleActive(slot.id)}
                      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden ${
                        slot.isActive ? 'bg-emerald-600' : 'bg-slate-300 dark:bg-slate-700'
                      }`}
                      title={slot.isActive ? 'বিজ্ঞাপন সক্রিয় — বন্ধ করতে ক্লিক করুন' : 'বিজ্ঞাপন বন্ধ — চালু করতে ক্লিক করুন'}
                    >
                      <span
                        className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-xs transition duration-200 ease-in-out ${
                          slot.isActive ? 'translate-x-5' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>
                </div>

                {/* Card Visual Thumbnail */}
                <div className="p-4 bg-slate-50/50 dark:bg-slate-950/40 border-b border-slate-100 dark:border-slate-800">
                  <div className="relative aspect-16/9 rounded-lg overflow-hidden border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-center">
                    {slot.type === 'banner' && slot.imageUrl ? (
                      <img 
                        src={slot.imageUrl} 
                        alt={slot.altText || slot.title} 
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLElement).style.display = 'none';
                        }}
                      />
                    ) : slot.type === 'code' ? (
                      <div className="p-3 text-center text-[10px] font-mono text-slate-400">
                        <Code className="w-6 h-6 mx-auto mb-1 text-purple-500 opacity-60" />
                        <span>[AdSense / Custom Script Code]</span>
                      </div>
                    ) : slot.type === 'text' ? (
                      <div className="p-3 text-center font-solaiman">
                        <Type className="w-6 h-6 mx-auto mb-1 text-emerald-500 opacity-60" />
                        <span className="text-xs font-bold line-clamp-1">{slot.textHeadline || slot.title}</span>
                      </div>
                    ) : (
                      <div className="text-center p-3 text-slate-400 text-xs font-solaiman">
                        <ImageIcon className="w-6 h-6 mx-auto mb-1 opacity-40" />
                        <span>ইমেজ নেই</span>
                      </div>
                    )}

                    {/* Badge */}
                    <span className={`absolute top-2 right-2 text-[10px] font-bold px-2 py-0.5 rounded shadow-xs font-solaiman ${
                      slot.isActive ? 'bg-emerald-600 text-white' : 'bg-slate-600 text-slate-200'
                    }`}>
                      {slot.isActive ? 'লাইভ সক্রিয়' : 'নিষ্ক্রিয় বন্ধ'}
                    </span>
                  </div>

                  {/* Placement Description */}
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 font-solaiman mt-2 line-clamp-1">
                    স্থান: <strong>{placementObj.labelBn.split('(')[0]}</strong>
                  </p>
                </div>

                {/* Card Action Buttons */}
                <div className="p-3 bg-white dark:bg-slate-900 flex items-center justify-between text-xs font-solaiman">
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => setPreviewSlot(slot)}
                      className="px-2.5 py-1.5 rounded bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold flex items-center gap-1"
                      title="লাইভ প্রিভিউ দেখুন"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>প্রিভিউ</span>
                    </button>

                    <button
                      onClick={() => handleOpenEditModal(slot)}
                      className="px-2.5 py-1.5 rounded bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/60 dark:hover:bg-amber-900/60 text-amber-700 dark:text-amber-300 font-bold flex items-center gap-1"
                      title="বিজ্ঞাপন সম্পাদনা করুন"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>এডিট</span>
                    </button>
                  </div>

                  <button
                    onClick={() => setDeleteConfirmId(slot.id)}
                    className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/50 rounded transition-colors"
                    title="মুছে ফেলুন"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* CREATE / EDIT MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-xs overflow-y-auto">
          <div className={`w-full max-w-2xl rounded-2xl shadow-2xl border overflow-hidden my-8 ${
            darkMode ? 'bg-[#1b222c] border-slate-700 text-white' : 'bg-white border-slate-200 text-slate-900'
          }`}>
            {/* Modal Header */}
            <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-amber-500/10 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                  <Megaphone className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-base font-solaiman">
                    {editingSlot ? 'বিজ্ঞাপন স্লট সম্পাদনা করুন' : 'নতুন বিজ্ঞাপন স্লট তৈরি করুন'}
                  </h3>
                  <p className="text-xs text-slate-500 font-solaiman">
                    নির্দিষ্ট প্লেসমেন্ট, ডাইমেনশন ও কনটেন্ট কনফিগারেশন সেট করুন।
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body Form */}
            <form onSubmit={handleSaveSlot} className="p-5 space-y-4 max-h-[75vh] overflow-y-auto font-solaiman">
              {/* Placement Position Selector */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
                  <Layout className="w-3.5 h-3.5 text-amber-500" />
                  <span>ওয়েবসাইটে বিজ্ঞাপনের প্লেসমেন্ট / অবস্থান নির্ধারণ করুন *</span>
                </label>
                <select
                  required
                  value={formPosition}
                  onChange={(e) => {
                    const nextPos = e.target.value as AdPlacementPosition;
                    setFormPosition(nextPos);
                    const opt = PLACEMENT_OPTIONS.find(p => p.id === nextPos);
                    if (opt && (!editingSlot || formSize === '728x90' || formSize === '300x250')) {
                      handleSizePresetChange(opt.defaultSize);
                    }
                  }}
                  className="w-full px-3 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-transparent text-sm font-solaiman focus:ring-2 focus:ring-amber-500"
                >
                  {PLACEMENT_OPTIONS.map((pos) => (
                    <option key={pos.id} value={pos.id} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">
                      {pos.labelBn} — [প্রস্তাবিত: {pos.recommendedDims}]
                    </option>
                  ))}
                </select>
                <p className="text-[11px] text-slate-500 mt-1">
                  {PLACEMENT_OPTIONS.find(p => p.id === formPosition)?.desc}
                </p>
              </div>

              {/* Title & Sponsor */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    বিজ্ঞাপনের শিরোনাম / ক্যাম্পেইন নাম *
                  </label>
                  <input
                    type="text"
                    required
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    placeholder="যেমন: ওয়ালটন স্মার্ট ফ্রিজ অফার"
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-transparent text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    স্পন্সর ব্র্যান্ডের নাম (Sponsor Brand)
                  </label>
                  <input
                    type="text"
                    value={formSponsorName}
                    onChange={(e) => setFormSponsorName(e.target.value)}
                    placeholder="যেমন: WALTON, bKash, GREE"
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-transparent text-sm"
                  />
                </div>
              </div>

              {/* Ad Content Type Selector (Image Banner vs Code/AdSense vs Text) */}
              <div className="pt-2 border-t border-slate-200 dark:border-slate-800">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-amber-500" />
                  <span>বিজ্ঞাপনের ধরন (Ad Content Type) নির্ধারণ করুন *</span>
                </label>
                <div className="grid grid-cols-3 gap-2.5">
                  <button
                    type="button"
                    onClick={() => setFormType('banner')}
                    className={`p-3 rounded-lg border text-center transition-all flex flex-col items-center justify-center gap-1.5 ${
                      formType === 'banner'
                        ? 'bg-amber-500/10 border-amber-500 text-amber-600 dark:text-amber-400 font-bold shadow-xs'
                        : 'border-slate-200 dark:border-slate-700 hover:border-slate-400'
                    }`}
                  >
                    <ImageIcon className="w-5 h-5" />
                    <span className="text-xs">ইমেজ ব্যানার অ্যাড</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setFormType('code')}
                    className={`p-3 rounded-lg border text-center transition-all flex flex-col items-center justify-center gap-1.5 ${
                      formType === 'code'
                        ? 'bg-purple-500/10 border-purple-500 text-purple-600 dark:text-purple-400 font-bold shadow-xs'
                        : 'border-slate-200 dark:border-slate-700 hover:border-slate-400'
                    }`}
                  >
                    <Code className="w-5 h-5" />
                    <span className="text-xs">HTML / AdSense কোড</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setFormType('text')}
                    className={`p-3 rounded-lg border text-center transition-all flex flex-col items-center justify-center gap-1.5 ${
                      formType === 'text'
                        ? 'bg-emerald-500/10 border-emerald-500 text-emerald-600 dark:text-emerald-400 font-bold shadow-xs'
                        : 'border-slate-200 dark:border-slate-700 hover:border-slate-400'
                    }`}
                  >
                    <Type className="w-5 h-5" />
                    <span className="text-xs">টেক্সট ঘোষণা অ্যাড</span>
                  </button>
                </div>
              </div>

              {/* Explicit Size & Dimension Controllers */}
              <div className="pt-2 border-t border-slate-200 dark:border-slate-800">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
                  <Sliders className="w-3.5 h-3.5 text-amber-500" />
                  <span>সাইজ ও ডাইমেনশন কন্ট্রোলার (Dimension Preset) *</span>
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <select
                      value={formSize}
                      onChange={(e) => handleSizePresetChange(e.target.value as AdSizePreset)}
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-transparent text-xs"
                    >
                      {SIZE_PRESETS.map((sz) => (
                        <option key={sz.id} value={sz.id} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">
                          {sz.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Custom Width & Height Inputs */}
                  <div className="flex items-center gap-2">
                    <div className="flex-1">
                      <input
                        type="number"
                        placeholder="Width (px)"
                        value={formCustomWidth}
                        onChange={(e) => setFormCustomWidth(Number(e.target.value))}
                        className="w-full px-2.5 py-1.5 rounded border border-slate-300 dark:border-slate-700 bg-transparent text-xs font-mono"
                        min={100}
                        max={1920}
                      />
                    </div>
                    <span className="text-xs text-slate-400">×</span>
                    <div className="flex-1">
                      <input
                        type="number"
                        placeholder="Height (px)"
                        value={formCustomHeight}
                        onChange={(e) => setFormCustomHeight(Number(e.target.value))}
                        className="w-full px-2.5 py-1.5 rounded border border-slate-300 dark:border-slate-700 bg-transparent text-xs font-mono"
                        min={50}
                        max={1200}
                      />
                    </div>
                    <span className="text-xs text-slate-400">px</span>
                  </div>
                </div>
              </div>

              {/* Conditional Form Inputs for Type 1: Image Banner */}
              {formType === 'banner' && (
                <div className="p-3.5 rounded-lg border border-blue-200 dark:border-blue-900/60 bg-blue-50/20 dark:bg-blue-950/20 space-y-3">
                  <h4 className="text-xs font-bold text-blue-700 dark:text-blue-300 flex items-center gap-1.5">
                    <ImageIcon className="w-3.5 h-3.5" />
                    <span>ইমেজ ব্যানার ও গ্রাফিক সেটিংস</span>
                  </h4>

                  {/* Image Upload or URL */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                      ব্যানার ইমেজ (সরাসরি আপলোড করুন বা লিংক দিন) *
                    </label>
                    <div className="flex items-center gap-2">
                      <label className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-bold cursor-pointer flex items-center gap-1.5 shrink-0 transition-colors">
                        <Upload className="w-3.5 h-3.5" />
                        <span>ছবি আপলোড</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={handleImageFileUpload}
                        />
                      </label>
                      <input
                        type="text"
                        value={formImageUrl}
                        onChange={(e) => setFormImageUrl(e.target.value)}
                        placeholder="বা ছবির URL দিন (https://...)"
                        className="flex-1 px-3 py-2 rounded border border-slate-300 dark:border-slate-700 bg-transparent text-xs font-mono"
                      />
                    </div>

                    {/* Image Preview Thumbnail */}
                    {formImageUrl && (
                      <div className="mt-2 relative w-32 h-16 rounded overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800">
                        <img src={formImageUrl} alt="Preview" className="w-full h-full object-cover" />
                      </div>
                    )}
                  </div>

                  {/* Target Click URL & Alt Text */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                        টার্গেট লিংক (Target Click URL)
                      </label>
                      <input
                        type="url"
                        value={formTargetUrl}
                        onChange={(e) => setFormTargetUrl(e.target.value)}
                        placeholder="https://example.com"
                        className="w-full px-3 py-2 rounded border border-slate-300 dark:border-slate-700 bg-transparent text-xs font-mono"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                        ছবির অল্টারনেটিভ টেক্সট (Alt Text)
                      </label>
                      <input
                        type="text"
                        value={formAltText}
                        onChange={(e) => setFormAltText(e.target.value)}
                        placeholder="বিজ্ঞাপনের বিবরণ"
                        className="w-full px-3 py-2 rounded border border-slate-300 dark:border-slate-700 bg-transparent text-xs"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Conditional Form Inputs for Type 2: HTML / AdSense Code */}
              {formType === 'code' && (
                <div className="p-3.5 rounded-lg border border-purple-200 dark:border-purple-900/60 bg-purple-50/20 dark:bg-purple-950/20 space-y-3">
                  <h4 className="text-xs font-bold text-purple-700 dark:text-purple-300 flex items-center gap-1.5">
                    <Code className="w-3.5 h-3.5" />
                    <span>কাস্টম HTML কোড বা Google AdSense স্ক্রিপ্ট</span>
                  </h4>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                      HTML কোড বা AdSense স্ক্রিপ্ট পেস্ট করুন *
                    </label>
                    <textarea
                      rows={5}
                      value={formCodeSnippet}
                      onChange={(e) => setFormCodeSnippet(e.target.value)}
                      placeholder={'<!-- Google AdSense বা Custom HTML Snippet -->\n<ins className="adsbygoogle" ...></ins>'}
                      className="w-full px-3 py-2 rounded border border-slate-300 dark:border-slate-700 bg-transparent text-xs font-mono"
                    />
                  </div>
                </div>
              )}

              {/* Conditional Form Inputs for Type 3: Text Announcement */}
              {formType === 'text' && (
                <div className="p-3.5 rounded-lg border border-emerald-200 dark:border-emerald-900/60 bg-emerald-50/20 dark:bg-emerald-950/20 space-y-3">
                  <h4 className="text-xs font-bold text-emerald-700 dark:text-emerald-300 flex items-center gap-1.5">
                    <Type className="w-3.5 h-3.5" />
                    <span>টেক্সট বিজ্ঞাপন / সরাসরি বার্তা ঘোষণা</span>
                  </h4>

                  <div>
                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                      বিজ্ঞাপনের মূল হেডলাইন *
                    </label>
                    <input
                      type="text"
                      value={formTextHeadline}
                      onChange={(e) => setFormTextHeadline(e.target.value)}
                      placeholder="যেমন: বিশেষ ছাড়ে প্রিমিয়াম ফ্ল্যাট বিক্রয় চলছে"
                      className="w-full px-3 py-2 rounded border border-slate-300 dark:border-slate-700 bg-transparent text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                      সংক্ষিপ্ত বিবরণ বা অফার বার্তা
                    </label>
                    <textarea
                      rows={3}
                      value={formTextDescription}
                      onChange={(e) => setFormTextDescription(e.target.value)}
                      placeholder="যেমন: ঢাকা বসুন্ধরা আবাসিক এলাকায় ১০০% প্রস্তুত রেডি ফ্ল্যাট।"
                      className="w-full px-3 py-2 rounded border border-slate-300 dark:border-slate-700 bg-transparent text-xs"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                        বাটন লেবেল (CTA Button)
                      </label>
                      <input
                        type="text"
                        value={formTextCtaLabel}
                        onChange={(e) => setFormTextCtaLabel(e.target.value)}
                        placeholder="বিস্তারিত দেখুন"
                        className="w-full px-3 py-2 rounded border border-slate-300 dark:border-slate-700 bg-transparent text-xs"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                        টার্গেট লিংক (Click URL)
                      </label>
                      <input
                        type="url"
                        value={formTargetUrl}
                        onChange={(e) => setFormTargetUrl(e.target.value)}
                        placeholder="https://example.com"
                        className="w-full px-3 py-2 rounded border border-slate-300 dark:border-slate-700 bg-transparent text-xs font-mono"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Active Status & Auto-Expiry Controls */}
              <div className="p-3.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">
                      বিজ্ঞাপনের স্ট্যাটাস (Active / Inactive)
                    </h4>
                    <p className="text-[11px] text-slate-500">
                      সরাসরি ওয়েবসাইটে প্রদর্শিত হবে কি না তা চালু বা বন্ধ রাখুন।
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => setFormIsActive(!formIsActive)}
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                      formIsActive ? 'bg-emerald-600' : 'bg-slate-300 dark:bg-slate-700'
                    }`}
                  >
                    <span
                      className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-xs transition duration-200 ease-in-out ${
                        formIsActive ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>

                {/* Expiry Toggle */}
                <div className="pt-2 border-t border-slate-200 dark:border-slate-800">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                        মেয়াদোত্তীর্ণের তারিখ নির্ধারণ (Auto-Expire)
                      </span>
                    </div>

                    <input
                      type="checkbox"
                      checked={formIsAutoExpire}
                      onChange={(e) => setFormIsAutoExpire(e.target.checked)}
                      className="w-4 h-4 rounded text-amber-600 focus:ring-amber-500"
                    />
                  </div>

                  {formIsAutoExpire && (
                    <div className="mt-2.5">
                      <input
                        type="date"
                        value={formExpiresAt}
                        onChange={(e) => setFormExpiresAt(e.target.value)}
                        className="px-3 py-1.5 rounded border border-slate-300 dark:border-slate-700 bg-transparent text-xs"
                      />
                      <span className="text-[10px] text-slate-400 ml-2">
                        এই তারিখের পর বিজ্ঞাপনটি স্বয়ংক্রিয়ভাবে বন্ধ হয়ে যাবে।
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Modal Footer Actions */}
              <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-bold font-solaiman text-slate-700 dark:text-slate-300 transition-colors"
                >
                  বাতিল
                </button>

                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-amber-600 hover:bg-amber-700 active:bg-amber-800 text-white text-xs font-bold font-solaiman flex items-center gap-1.5 shadow-sm transition-all"
                >
                  <Check className="w-4 h-4" />
                  <span>{editingSlot ? 'পরিবর্তন সংরক্ষণ করুন' : 'স্লট তৈরি করুন'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* LIVE PREVIEW MODAL */}
      {previewSlot && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-xs">
          <div className={`w-full max-w-4xl rounded-2xl shadow-2xl border overflow-hidden p-6 space-y-4 ${
            darkMode ? 'bg-[#1b222c] border-slate-700 text-white' : 'bg-white border-slate-200 text-slate-900'
          }`}>
            <div className="flex items-center justify-between border-b pb-3 border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Eye className="w-5 h-5 text-amber-500" />
                <div>
                  <h4 className="font-bold text-base font-solaiman">
                    লাইভ প্রিভিউ: {previewSlot.title}
                  </h4>
                  <p className="text-xs text-slate-400 font-mono">
                    পজিশন: {previewSlot.position} | সাইজ: {previewSlot.size}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setPreviewSlot(null)}
                className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Simulated Frame */}
            <div className="p-6 bg-slate-100 dark:bg-slate-950/70 rounded-xl flex items-center justify-center overflow-x-auto min-h-[220px]">
              <UniversalAdSlot
                slot={previewSlot}
                darkMode={darkMode}
                showPlacementLabelInPreview={true}
              />
            </div>

            <div className="flex items-center justify-between text-xs text-slate-500 font-solaiman pt-2">
              <span>প্রকৃত ওয়েবসাইটে এই বিজ্ঞাপনটি এর নির্ধারিত কন্টেইনারের সাথে মসৃণভাবে ফিট করবে।</span>
              <button
                onClick={() => setPreviewSlot(null)}
                className="px-4 py-1.5 bg-slate-900 dark:bg-slate-700 text-white rounded text-xs font-bold"
              >
                বন্ধ করুন
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
          <div className={`w-full max-w-md rounded-2xl shadow-2xl border p-5 space-y-4 font-solaiman ${
            darkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'
          }`}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-950/60 text-red-600 flex items-center justify-center shrink-0">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-base">বিজ্ঞাপন স্লটটি মুছে ফেলতে চান?</h4>
                <p className="text-xs text-slate-500">
                  মুছে ফেলার পর এটি ওয়েবসাইট থেকে তৎক্ষণাৎ অদৃশ্য হয়ে যাবে।
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200 dark:border-slate-800">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="px-3.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 text-xs font-bold"
              >
                বাতিল
              </button>
              <button
                onClick={handleConfirmDelete}
                className="px-4 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-bold"
              >
                হ্যাঁ, মুছে ফেলুন
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
