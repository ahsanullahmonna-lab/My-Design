import React, { useState, useRef } from 'react';
import { 
  Quote, 
  Plus, 
  Edit3, 
  Trash2, 
  Eye, 
  EyeOff, 
  Download, 
  Search, 
  CheckCircle2, 
  AlertCircle, 
  X, 
  Save, 
  Sparkles, 
  Calendar, 
  Image as ImageIcon,
  User,
  Layers,
  Palette,
  Upload,
  Camera,
  Check
} from 'lucide-react';
import { QuoteItem, SiteSettings } from '../../types/news';
import { QuoteCardDownloadModal } from '../Quotes/QuoteCardDownloadModal';

/**
 * Resizes an uploaded avatar image to maximum 600px dimension and converts to JPEG/PNG base64.
 * Prevents localStorage quota limits while keeping crystal clear retina resolution.
 */
const resizeImageToBase64 = (file: File, maxDim = 600): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        let width = img.width;
        let height = img.height;
        if (width > height) {
          if (width > maxDim) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          }
        } else {
          if (height > maxDim) {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(event.target?.result as string);
          return;
        }
        ctx.drawImage(img, 0, 0, width, height);
        const format = file.type === 'image/png' ? 'image/png' : 'image/jpeg';
        const dataUrl = canvas.toDataURL(format, 0.88);
        resolve(dataUrl);
      };
      img.onerror = () => resolve(event.target?.result as string);
      img.src = event.target?.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

interface QuotesManagerProps {
  quotes: QuoteItem[];
  onUpdateQuotes: (newQuotes: QuoteItem[]) => void;
  settings?: SiteSettings;
  darkMode?: boolean;
}

export const QuotesManager: React.FC<QuotesManagerProps> = ({
  quotes,
  onUpdateQuotes,
  settings,
  darkMode = false,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingQuote, setEditingQuote] = useState<QuoteItem | null>(null);
  const [toastMessage, setToastMessage] = useState<string>('');
  const [selectedQuoteForCard, setSelectedQuoteForCard] = useState<QuoteItem | null>(null);

  // Form State
  const [quoteText, setQuoteText] = useState('');
  const [speakerName, setSpeakerName] = useState('');
  const [speakerDesignation, setSpeakerDesignation] = useState('');
  const [speakerPhoto, setSpeakerPhoto] = useState('');
  const [quoteDate, setQuoteDate] = useState('২০ অক্টোবর ২০২৬');
  const [quoteTimeAgo, setQuoteTimeAgo] = useState('১ ঘণ্টা আগে');
  const [quoteCategory, setQuoteCategory] = useState('জাতীয়');
  const [quoteTheme, setQuoteTheme] = useState<'ice_blue' | 'white_classic' | 'navy_gradient' | 'warm_cream' | 'dark_obsidian'>('ice_blue');
  const [isActive, setIsActive] = useState(true);
  const speakerFileInputRef = useRef<HTMLInputElement>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [dragOverSpeakerPhoto, setDragOverSpeakerPhoto] = useState(false);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
  };

  const handleSpeakerFileProcess = async (file: File) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      showToast('শুধুমাত্র ইমেজ ফাইল (JPG, PNG, WebP) নির্বাচন করুন।');
      return;
    }
    setIsUploadingImage(true);
    try {
      const base64Data = await resizeImageToBase64(file, 600);
      setSpeakerPhoto(base64Data);
      showToast('বক্তার ছবি সফলভাবে আপলোড হয়েছে!');
    } catch (err) {
      console.error('Image upload failed:', err);
      showToast('ছবি আপলোড করতে সমস্যা হয়েছে।');
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleSpeakerFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleSpeakerFileProcess(file);
      e.target.value = '';
    }
  };

  const handleOpenAddModal = () => {
    setEditingQuote(null);
    setQuoteText('');
    setSpeakerName('');
    setSpeakerDesignation('');
    setSpeakerPhoto('https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80');
    setQuoteDate('২০ অক্টোবর ২০২৬');
    setQuoteTimeAgo('সবেমাত্র');
    setQuoteCategory('জাতীয়');
    setQuoteTheme('ice_blue');
    setIsActive(true);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (item: QuoteItem) => {
    setEditingQuote(item);
    setQuoteText(item.quote);
    setSpeakerName(item.speakerName);
    setSpeakerDesignation(item.speakerDesignation);
    setSpeakerPhoto(item.speakerPhoto);
    setQuoteDate(item.date);
    setQuoteTimeAgo(item.timeAgo || '১ ঘণ্টা আগে');
    setQuoteCategory(item.category || 'জাতীয়');
    setQuoteTheme(item.theme || 'ice_blue');
    setIsActive(item.isActive !== false);
    setIsModalOpen(true);
  };

  const handleSaveQuote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quoteText.trim() || !speakerName.trim()) {
      showToast('উক্তি এবং বক্তার নাম আবশ্যক!');
      return;
    }

    if (editingQuote) {
      // Update existing
      const updated = quotes.map(q => {
        if (q.id === editingQuote.id) {
          return {
            ...q,
            quote: quoteText.trim(),
            speakerName: speakerName.trim(),
            speakerDesignation: speakerDesignation.trim() || 'বিশিষ্ট ব্যক্তিত্ব',
            speakerPhoto: speakerPhoto.trim() || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
            date: quoteDate.trim(),
            timeAgo: quoteTimeAgo.trim(),
            category: quoteCategory.trim(),
            theme: quoteTheme,
            isActive,
          };
        }
        return q;
      });
      onUpdateQuotes(updated);
      showToast('উক্তি সফলভাবে আপডেট করা হয়েছে!');
    } else {
      // Create new
      const newQuote: QuoteItem = {
        id: `quote-${Date.now()}`,
        quote: quoteText.trim(),
        speakerName: speakerName.trim(),
        speakerDesignation: speakerDesignation.trim() || 'বিশিষ্ট ব্যক্তিত্ব',
        speakerPhoto: speakerPhoto.trim() || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
        date: quoteDate.trim(),
        timeAgo: quoteTimeAgo.trim(),
        category: quoteCategory.trim(),
        theme: quoteTheme,
        isActive,
        createdAt: new Date().toISOString(),
        order: quotes.length + 1,
      };
      onUpdateQuotes([newQuote, ...quotes]);
      showToast('নতুন উক্তি সফলভাবে যুক্ত হয়েছে!');
    }

    setIsModalOpen(false);
  };

  const handleToggleStatus = (id: string) => {
    const updated = quotes.map(q => {
      if (q.id === id) {
        return { ...q, isActive: !q.isActive };
      }
      return q;
    });
    onUpdateQuotes(updated);
    showToast('উক্তির স্ট্যাটাস পরিবর্তন করা হয়েছে!');
  };

  const handleDeleteQuote = (id: string) => {
    if (confirm('আপনি কি নিশ্চিত যে এই উক্তিটি ডিলিট করতে চান?')) {
      const updated = quotes.filter(q => q.id !== id);
      onUpdateQuotes(updated);
      showToast('উক্তিটি মুছে ফেলা হয়েছে!');
    }
  };

  const filteredQuotes = quotes.filter(q => {
    if (!searchTerm.trim()) return true;
    const term = searchTerm.toLowerCase();
    return (
      q.quote.toLowerCase().includes(term) ||
      q.speakerName.toLowerCase().includes(term) ||
      q.speakerDesignation.toLowerCase().includes(term) ||
      (q.category && q.category.toLowerCase().includes(term))
    );
  });

  return (
    <div className="space-y-6 font-solaiman text-left">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 flex items-center gap-2 px-4 py-3 rounded-xl bg-emerald-600 text-white shadow-2xl text-xs font-bold animate-in fade-in">
          <CheckCircle2 className="w-4 h-4" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl border bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-red-600 to-rose-700 text-white flex items-center justify-center shadow-md">
              <Quote className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-black text-slate-950 dark:text-white">
                উক্তি ও কথা ব্যবস্থাপনা (Quotes Manager)
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                হোমপেজের "কথা" সেকশনের উক্তি তৈরি, সম্পাদন ও এইচডি ফটো কার্ড পরিচালনা
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Search Box */}
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="উক্তি বা বক্তা খুঁজুন..."
              className="pl-9 pr-3 py-2 rounded-xl text-xs border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white outline-none focus:border-red-500 w-44 sm:w-56"
            />
          </div>

          {/* Add New Button */}
          <button
            onClick={handleOpenAddModal}
            className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs flex items-center gap-2 shadow-md transition-all cursor-pointer hover:scale-105 active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>নতুন উক্তি যোগ করুন</span>
          </button>
        </div>
      </div>

      {/* Quotes Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredQuotes.map((item) => (
          <div
            key={item.id}
            className={`p-5 rounded-2xl border flex flex-col justify-between shadow-xs transition-all relative overflow-hidden ${
              item.isActive !== false
                ? darkMode
                  ? 'bg-slate-900/95 border-slate-800'
                  : 'bg-white border-slate-200'
                : 'opacity-60 bg-slate-100 dark:bg-slate-900/40 border-dashed border-slate-300 dark:border-slate-800'
            }`}
          >
            {/* Status Ribbon if inactive */}
            {item.isActive === false && (
              <div className="absolute top-2 right-2 px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-[10px] font-bold">
                নিষ্ক্রিয় (লুকানো)
              </div>
            )}

            <div>
              {/* Speaker Row */}
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-red-500 shrink-0 bg-slate-100">
                  <img
                    src={item.speakerPhoto}
                    alt={item.speakerName}
                    crossOrigin={item.speakerPhoto?.startsWith('data:') ? undefined : 'anonymous'}
                    className="w-full h-full object-cover object-top"
                  />
                </div>
                <div className="min-w-0">
                  <h4 className="font-black text-sm text-slate-950 dark:text-white truncate">
                    {item.speakerName}
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                    {item.speakerDesignation}
                  </p>
                  <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-0.5">
                    <span>{item.date}</span>
                    {item.timeAgo && <span>• {item.timeAgo}</span>}
                  </div>
                </div>
              </div>

              {/* Quote Excerpt */}
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 text-xs sm:text-sm text-slate-800 dark:text-slate-200 leading-relaxed font-solaiman italic line-clamp-4 mb-4">
                "{item.quote}"
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setSelectedQuoteForCard(item)}
                  className="px-2.5 py-1 rounded-lg bg-sky-50 dark:bg-sky-950/40 text-sky-600 dark:text-sky-400 hover:bg-sky-100 font-bold flex items-center gap-1 text-[11px] transition-colors cursor-pointer border border-sky-200 dark:border-sky-900/50"
                  title="এইচডি ফটো কার্ড প্রিভিউ ও ডাউনলোড"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>কার্ড ডাউনলোড</span>
                </button>
              </div>

              <div className="flex items-center gap-1.5">
                {/* Toggle Status */}
                <button
                  onClick={() => handleToggleStatus(item.id)}
                  className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                    item.isActive !== false
                      ? 'text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/40'
                      : 'text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800'
                  }`}
                  title={item.isActive !== false ? 'উক্তিটি হাইড করুন' : 'উক্তিটি আন-হাইড করুন'}
                >
                  {item.isActive !== false ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                </button>

                {/* Edit */}
                <button
                  onClick={() => handleOpenEditModal(item)}
                  className="p-1.5 rounded-lg text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/40 transition-colors cursor-pointer"
                  title="সম্পাদনা করুন"
                >
                  <Edit3 className="w-4 h-4" />
                </button>

                {/* Delete */}
                <button
                  onClick={() => handleDeleteQuote(item.id)}
                  className="p-1.5 rounded-lg text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors cursor-pointer"
                  title="মুছে ফেলুন"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

          </div>
        ))}

        {filteredQuotes.length === 0 && (
          <div className="col-span-full p-12 text-center rounded-2xl border border-dashed border-slate-300 dark:border-slate-800">
            <Quote className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto mb-3" />
            <h4 className="text-base font-bold text-slate-700 dark:text-slate-300">কোনো উক্তি পাওয়া যায়নি</h4>
            <p className="text-xs text-slate-400 mt-1">নতুন উক্তি যোগ করতে উপরে "নতুন উক্তি যোগ করুন" বাটনে ক্লিক করুন।</p>
          </div>
        )}
      </div>

      {/* Add / Edit Quote Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in">
          <div className={`w-full max-w-xl max-h-[92vh] flex flex-col rounded-2xl border shadow-2xl overflow-hidden font-solaiman ${
            darkMode ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-200 text-slate-900'
          }`}>
            
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Quote className="w-5 h-5 text-red-600" />
                <h3 className="font-black text-base">
                  {editingQuote ? 'উক্তি সম্পাদনা করুন' : 'নতুন উক্তি যুক্ত করুন'}
                </h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSaveQuote} className="flex-1 overflow-y-auto p-6 space-y-4 text-xs">
              
              {/* Quote Text */}
              <div>
                <label className="block font-bold mb-1">
                  উক্তি বা বক্তব্যের মূল অংশ *
                </label>
                <textarea
                  rows={4}
                  value={quoteText}
                  onChange={(e) => setQuoteText(e.target.value)}
                  placeholder="বক্তার দেওয়া পুরো বক্তব্য বা প্রধান অংশটি লিখুন..."
                  required
                  className="w-full p-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs sm:text-sm text-slate-900 dark:text-white outline-none focus:border-red-500 font-solaiman leading-relaxed"
                />
              </div>

              {/* Speaker Name & Designation */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold mb-1">
                    বক্তার নাম *
                  </label>
                  <input
                    type="text"
                    value={speakerName}
                    onChange={(e) => setSpeakerName(e.target.value)}
                    placeholder="যেমন: তারেক রহমান / ওবায়দুল কাদের"
                    required
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white outline-none focus:border-red-500 font-solaiman"
                  />
                </div>

                <div>
                  <label className="block font-bold mb-1">
                    পদবি বা পরিচয়
                  </label>
                  <input
                    type="text"
                    value={speakerDesignation}
                    onChange={(e) => setSpeakerDesignation(e.target.value)}
                    placeholder="যেমন: প্রধানমন্ত্রী / মহাসচিব / অর্থনীতিবিদ"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white outline-none focus:border-red-500 font-solaiman"
                  />
                </div>
              </div>

              {/* Speaker Photo Direct Upload or URL with Live Preview */}
              <div className="space-y-2 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40">
                <input
                  ref={speakerFileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleSpeakerFileChange}
                  className="hidden"
                />

                <div className="flex items-center justify-between">
                  <label className="block font-bold text-slate-800 dark:text-slate-200">
                    বক্তার ছবি (Speaker Photo Avatar) *
                  </label>
                  {speakerPhoto && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-sky-100 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300">
                      {speakerPhoto.startsWith('data:') ? '✓ ডিভাইস থেকে আপলোডকৃত' : '✓ ওয়েব ইমেজ লিংক'}
                    </span>
                  )}
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-3.5">
                  {/* Photo Avatar Preview */}
                  <div className="relative group shrink-0">
                    <div className="w-16 h-16 rounded-2xl overflow-hidden border-2 border-red-500 shadow-md bg-white dark:bg-slate-900 flex items-center justify-center">
                      {speakerPhoto ? (
                        <img
                          src={speakerPhoto}
                          alt="Speaker Avatar Preview"
                          crossOrigin={speakerPhoto.startsWith('data:') ? undefined : 'anonymous'}
                          className="w-full h-full object-cover object-top"
                        />
                      ) : (
                        <Camera className="w-6 h-6 text-slate-400" />
                      )}
                    </div>
                    {speakerPhoto && (
                      <button
                        type="button"
                        onClick={() => setSpeakerPhoto('')}
                        className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-600 text-white flex items-center justify-center text-[10px] shadow cursor-pointer hover:bg-red-700"
                        title="ছবি সরান"
                      >
                        ✕
                      </button>
                    )}
                  </div>

                  {/* Dual Upload / URL Controls */}
                  <div className="flex-1 w-full space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        onClick={() => speakerFileInputRef.current?.click()}
                        disabled={isUploadingImage}
                        className="flex-1 sm:flex-initial px-3.5 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs transition-colors cursor-pointer"
                      >
                        {isUploadingImage ? (
                          <>
                            <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            <span>আপলোড হচ্ছে...</span>
                          </>
                        ) : (
                          <>
                            <Upload className="w-3.5 h-3.5" />
                            <span>ডিভাইস থেকে ছবি আপলোড</span>
                          </>
                        )}
                      </button>

                      <div
                        onDragOver={(e) => { e.preventDefault(); setDragOverSpeakerPhoto(true); }}
                        onDragLeave={() => setDragOverSpeakerPhoto(false)}
                        onDrop={(e) => {
                          e.preventDefault();
                          setDragOverSpeakerPhoto(false);
                          if (e.dataTransfer.files?.[0]) {
                            handleSpeakerFileProcess(e.dataTransfer.files[0]);
                          }
                        }}
                        className={`hidden sm:flex items-center px-3 py-2 rounded-xl border border-dashed text-[11px] text-slate-500 transition-colors ${
                          dragOverSpeakerPhoto ? 'border-red-500 bg-red-50 dark:bg-red-950/40 text-red-600' : 'border-slate-300 dark:border-slate-700'
                        }`}
                      >
                        <span>অথবা ছবি এখানে ড্রপ করুন</span>
                      </div>
                    </div>

                    <div className="relative">
                      <input
                        type="text"
                        value={speakerPhoto}
                        onChange={(e) => setSpeakerPhoto(e.target.value)}
                        placeholder="অথবা সরাসরি ছবির URL পেস্ট করুন (https://...)"
                        className="w-full px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-white outline-none focus:border-red-500 font-mono"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Date & Time Ago */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold mb-1">
                    তারিখ
                  </label>
                  <input
                    type="text"
                    value={quoteDate}
                    onChange={(e) => setQuoteDate(e.target.value)}
                    placeholder="যেমন: ২০ অক্টোবর ২০২৬"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white outline-none focus:border-red-500 font-solaiman"
                  />
                </div>

                <div>
                  <label className="block font-bold mb-1">
                    টাইম অ্যাগো ব্যাজ
                  </label>
                  <input
                    type="text"
                    value={quoteTimeAgo}
                    onChange={(e) => setQuoteTimeAgo(e.target.value)}
                    placeholder="যেমন: ১ ঘণ্টা আগে / ৩ ঘণ্টা আগে"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white outline-none focus:border-red-500 font-solaiman"
                  />
                </div>
              </div>

              {/* Category & Status */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center">
                <div>
                  <label className="block font-bold mb-1">
                    বিভাগ বা ট্যাগ
                  </label>
                  <input
                    type="text"
                    value={quoteCategory}
                    onChange={(e) => setQuoteCategory(e.target.value)}
                    placeholder="যেমন: জাতীয় / রাজনীতি / মতামত"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white outline-none focus:border-red-500 font-solaiman"
                  />
                </div>

                <div className="pt-4 flex items-center justify-between p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40">
                  <div>
                    <span className="font-bold">হোমপেজে প্রদর্শন করুন</span>
                    <p className="text-[10px] text-slate-400">সক্রিয় থাকলে ভিজিটররা দেখতে পাবে</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={isActive}
                    onChange={(e) => setIsActive(e.target.checked)}
                    className="w-4 h-4 text-red-600 rounded"
                  />
                </div>
              </div>

              {/* Modal Actions */}
              <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-bold hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold flex items-center gap-2 shadow-md transition-all"
                >
                  <Save className="w-4 h-4" />
                  <span>{editingQuote ? 'আপডেট সংরক্ষণ করুন' : 'উক্তি প্রকাশ করুন'}</span>
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* Quote Card Download Modal Integration */}
      <QuoteCardDownloadModal
        quote={selectedQuoteForCard}
        isOpen={Boolean(selectedQuoteForCard)}
        onClose={() => setSelectedQuoteForCard(null)}
        settings={settings}
        darkMode={darkMode}
      />

    </div>
  );
};
