import React, { useState, useRef } from 'react';
import { 
  X, 
  Send, 
  Camera, 
  ShieldCheck, 
  CheckCircle, 
  AlertTriangle,
  UploadCloud,
  MessageCircle,
  Loader2,
  Trash2,
  Image as ImageIcon,
  CheckCircle2,
  Sparkles,
  ExternalLink,
  FileText
} from 'lucide-react';
import { Article, CategoryItem } from '../types/news';
import { sanitizeInput, checkRateLimit } from '../utils/securityAndSeo';
import { useSiteConfig } from '../context/SiteConfigContext';
import { uploadMediaToCloud } from '../utils/cloudStorage';
import { saveFileToLocalStorage } from '../utils/localRecruitmentStorage';

interface CitizenNewsModalProps {
  isOpen: boolean;
  onClose: () => void;
  categories: CategoryItem[];
  onSubmitArticle: (article: Article) => void;
  darkMode?: boolean;
}

export const CitizenNewsModal: React.FC<CitizenNewsModalProps> = ({
  isOpen,
  onClose,
  categories,
  onSubmitArticle,
  darkMode = false,
}) => {
  const { siteName, whatsappNumber, contactPhone } = useSiteConfig();
  const [submissionMode, setSubmissionMode] = useState<'form' | 'whatsapp'>('form');
  const [headline, setHeadline] = useState('');
  const [category, setCategory] = useState(categories[0]?.nameBn || 'জাতীয়');
  const [district, setDistrict] = useState('ঢাকা');
  const [senderName, setSenderName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [content, setContent] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [imageUploadMethod, setImageUploadMethod] = useState<'file' | 'url'>('file');
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [uploadedImageMeta, setUploadedImageMeta] = useState<{
    url: string;
    fileSizeKb?: number;
    savingsPercent?: number;
    provider?: string;
  } | null>(null);
  const [honeypot, setHoneypot] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Multiple File Uploads State (Requirement 3: Citizen Journalism multiple attachments)
  const [attachments, setAttachments] = useState<{
    id: string;
    name: string;
    url: string;
    type?: string;
    sizeKb?: number;
    localPath?: string;
  }[]>([]);
  const [isUploadingAttachments, setIsUploadingAttachments] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const multipleFilesInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  // Resolved active WhatsApp hotline
  const activeWhatsAppNumber = (whatsappNumber || contactPhone || '+8801700000000').trim();
  const cleanWaDigits = activeWhatsAppNumber.replace(/[^0-9]/g, '');

  const buildWhatsAppMessage = () => {
    return (
      `*${siteName || 'নিউজ পোর্টাল'} — নাগরিক সংবাদ বার্তা*\n\n` +
      `*শিরোনাম:* ${headline.trim() || 'জরুরি নাগরিক সংবাদ'}\n` +
      `*বিভাগ/এলাকা:* ${category} | ${district}\n` +
      `*প্রেরক:* ${senderName.trim() || 'নাগরিক প্রতিবেদক'}\n` +
      `*মোবাইল:* ${phone.trim() || 'প্রযোজ্য নয়'}\n` +
      (address.trim() ? `*ঠিকানা:* ${address.trim()}\n` : '') +
      `\n*সংবাদের বিবরণ:*\n${content.trim() || 'বিস্তারিত ভিডিও ও ছবি হোয়াটসঅ্যাপে পাঠানো হলো।'}\n\n` +
      (imageUrl.trim() ? `*সংযুক্ত ছবি লিংক:* ${imageUrl.trim()}\n` : '') +
      `_তারিখ: ${new Date().toLocaleDateString('bn-BD')}_`
    );
  };

  const handleOpenWhatsApp = () => {
    const text = encodeURIComponent(buildWhatsAppMessage());
    const waUrl = `https://wa.me/${cleanWaDigits}?text=${text}`;
    window.open(waUrl, '_blank', 'noopener,noreferrer');
  };

  const handleDirectFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check size limit: 12MB
    if (file.size > 12 * 1024 * 1024) {
      setErrorMsg('ছবির সাইজ ১২ মেগাবাইটের কম হতে হবে।');
      return;
    }

    setIsUploadingImage(true);
    setErrorMsg('');

    try {
      const uploadResult = await uploadMediaToCloud(file, headline || 'citizen-upload');
      if (uploadResult.success && uploadResult.url) {
        setImageUrl(uploadResult.url);
        setUploadedImageMeta({
          url: uploadResult.url,
          fileSizeKb: uploadResult.fileSizeKb,
          savingsPercent: uploadResult.savingsPercent,
          provider: uploadResult.provider || 'cloudinary',
        });
      } else {
        setErrorMsg(uploadResult.error || 'ছবি আপলোড ব্যর্থ হয়েছে। পুনরায় চেষ্টা করুন।');
      }
    } catch (err) {
      console.error('Direct image upload error:', err);
      setErrorMsg('ছবি আপলোড প্রক্রিয়াকরণে সমস্যা দেখা দিয়েছে।');
    } finally {
      setIsUploadingImage(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemoveImage = () => {
    setImageUrl('');
    setUploadedImageMeta(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Multiple File Upload Handler (Requirement 3: Documents, Photos, Certificates, Media)
  const handleMultipleFilesUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploadingAttachments(true);
    setErrorMsg('');

    try {
      const newItems: {
        id: string;
        name: string;
        url: string;
        type?: string;
        sizeKb?: number;
        localPath?: string;
      }[] = [];

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (file.size > 25 * 1024 * 1024) continue;
        const stored = await saveFileToLocalStorage(file, 'citizen');
        newItems.push({
          id: stored.id,
          name: file.name,
          url: stored.dataUrl,
          type: file.type,
          sizeKb: Math.round(file.size / 1024),
          localPath: stored.localPath,
        });

        // Set as lead image if none chosen yet
        if (!imageUrl && file.type.startsWith('image/')) {
          setImageUrl(stored.dataUrl);
        }
      }

      setAttachments((prev) => [...prev, ...newItems]);
    } catch {
      setErrorMsg('একাধিক ফাইল আপলোডে সমস্যা হয়েছে। আবার চেষ্টা করুন।');
    } finally {
      setIsUploadingAttachments(false);
      if (multipleFilesInputRef.current) {
        multipleFilesInputRef.current.value = '';
      }
    }
  };

  const handleRemoveAttachment = (id: string) => {
    setAttachments((prev) => prev.filter((a) => a.id !== id));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    // Honeypot bot protection
    if (honeypot.trim() !== '') {
      setErrorMsg('বট কার্যকলাপের কারণে অনুরোধ বাতিল করা হয়েছে।');
      return;
    }

    if (!headline.trim()) {
      setErrorMsg('অনুগ্রহ করে সংবাদের শিরোনাম লিখুন।');
      return;
    }

    if (!senderName.trim()) {
      setErrorMsg('অনুগ্রহ করে আপনার নাম লিখুন।');
      return;
    }

    if (!phone.trim()) {
      setErrorMsg('সত্যতা যাচাইকরণের জন্য মোবাইল নম্বর প্রদান করা আবশ্যক।');
      return;
    }

    if (!content.trim()) {
      setErrorMsg('অনুগ্রহ করে সংবাদের মূল বিবরণ বা বিস্তারিত লিখুন।');
      return;
    }

    // Rate limit: Max 3 submissions per 5 minutes
    const limitCheck = checkRateLimit('citizen_news_submit', 3, 300000);
    if (!limitCheck.allowed) {
      setErrorMsg('আপনি অতি সম্প্রতি একটি সংবাদ জমা দিয়েছেন। অনুগ্রহ করে কিছুক্ষণ পর চেষ্টা করুন।');
      return;
    }

    setIsSubmitting(true);

    try {
      const cleanHeadline = sanitizeInput(headline.trim());
      const cleanSender = sanitizeInput(senderName.trim());
      const cleanPhone = sanitizeInput(phone.trim());
      const cleanAddress = sanitizeInput(address.trim());
      const cleanContent = sanitizeInput(content.trim());
      const cleanDistrict = sanitizeInput(district.trim());

      const newArticle: Article = {
        id: `citizen-${Date.now()}`,
        title: cleanHeadline,
        excerpt: cleanContent.slice(0, 150) + (cleanContent.length > 150 ? '...' : ''),
        content: cleanContent,
        category: category,
        categoryEn: 'Citizen Journalism',
        district: cleanDistrict,
        author: cleanSender,
        reporterTitle: `নাগরিক সাংবাদিক, ${cleanDistrict}`,
        imageUrl: imageUrl.trim() || 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&w=800&q=80',
        date: '৮ অক্টোবর ২০২৬',
        timeAgo: 'এইমাত্র পাঠানো',
        views: 0,
        readTime: '২ মিনিট',
        status: 'pending', // Strictly set to pending approval queue
        submittedBy: `${cleanSender} (নাগরিক সাংবাদিক | মোবাইল: ${cleanPhone}${cleanAddress ? ` | ঠিকানা: ${cleanAddress}` : ''})`,
        publishMode: 'immediate',
        tags: ['নাগরিক সাংবাদিকতা', cleanDistrict, category],
        storageProvider: uploadedImageMeta?.provider === 'cloudinary' ? 'cloudinary' : undefined,
        attachments: attachments.length > 0 ? attachments : undefined,
      };

      onSubmitArticle(newArticle);
      setIsSuccess(true);
    } catch {
      setErrorMsg('সংবাদ জমা দেওয়ার সময় ত্রুটি হয়েছে। পুনরায় চেষ্টা করুন।');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setHeadline('');
    setSenderName('');
    setPhone('');
    setAddress('');
    setContent('');
    setImageUrl('');
    setUploadedImageMeta(null);
    setAttachments([]);
    setIsSuccess(false);
    setErrorMsg('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-xs font-solaiman animate-in fade-in duration-200">
      <div 
        className={`w-full max-w-2xl max-h-[92vh] flex flex-col rounded-2xl shadow-2xl overflow-hidden border transition-all ${
          darkMode ? 'bg-[#151c24] border-slate-700 text-white' : 'bg-white border-slate-200 text-slate-800'
        }`}
      >
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-gradient-to-r from-red-600 via-rose-600 to-red-700 text-white">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-white/20 rounded-lg">
              <Send className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold flex items-center gap-2">
                <span>নাগরিক সাংবাদিকতা — সংবাদ পাঠান</span>
                <span className="hidden sm:inline-block px-2 py-0.5 rounded-full bg-white/20 text-[10px] font-medium font-latin">
                  Direct Upload & WhatsApp
                </span>
              </h2>
              <p className="text-xs text-red-100 font-normal">
                আপনার এলাকার খবর ও ছবি সরাসরি {siteName} বার্তা বিভাগে পাঠান
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-white/20 transition-colors text-white cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Dual Mode Switcher Tabs */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900/60 p-1.5 gap-2 text-xs font-bold font-solaiman">
          <button
            type="button"
            onClick={() => setSubmissionMode('form')}
            className={`flex-1 py-2 px-3 rounded-lg flex items-center justify-center gap-2 transition-all cursor-pointer ${
              submissionMode === 'form'
                ? 'bg-white dark:bg-slate-800 text-red-600 dark:text-red-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Send className="w-3.5 h-3.5" />
            <span>অনলাইন ফরম পূরণ (ক্লাউড ইমেজ আপলোড)</span>
          </button>
          <button
            type="button"
            onClick={() => setSubmissionMode('whatsapp')}
            className={`flex-1 py-2 px-3 rounded-lg flex items-center justify-center gap-2 transition-all cursor-pointer ${
              submissionMode === 'whatsapp'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40'
            }`}
          >
            <MessageCircle className="w-3.5 h-3.5" />
            <span>হোয়াটসঅ্যাপে সরাসরি সংবাদ পাঠান (WhatsApp Hotline)</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-4">
          {isSuccess ? (
            <div className="py-8 text-center space-y-4">
              <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center mx-auto ring-8 ring-emerald-50 dark:ring-emerald-900/30">
                <CheckCircle className="w-9 h-9" />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                  ধন্যবাদ! আপনার সংবাদটি সফলভাবে জমা হয়েছে
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-300 max-w-md mx-auto leading-relaxed">
                  আপনার পাঠানো সংবাদটি {siteName}-এর সম্পাদকীয় প্যানেলে <span className="font-bold text-amber-600 dark:text-amber-400">"অনুমোদন অপেক্ষমাণ" (Pending Queue)</span> তালিকায় যুক্ত করা হয়েছে। 
                  সম্পাদক অথবা বার্তা প্রধানের যাচাইকরণ শেষে এটি মূল পোর্টালে লাইভ প্রকাশিত হবে।
                </p>
                {uploadedImageMeta && (
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-700 dark:text-emerald-300 mt-2">
                    <Sparkles className="w-3 h-3 text-emerald-500" />
                    <span>ছবি Cloudinary CDN-এ সফলভাবে সংযুক্ত হয়েছে</span>
                  </div>
                )}
              </div>
              <div className="pt-4 flex items-center justify-center gap-3">
                <button
                  onClick={handleReset}
                  className="px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl transition-all shadow-md text-sm cursor-pointer"
                >
                  সম্পন্ন করুন
                </button>
                <button
                  onClick={handleOpenWhatsApp}
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition-all shadow-md text-sm flex items-center gap-1.5 cursor-pointer"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>হোয়াটসঅ্যাপেও কপি পাঠান</span>
                </button>
              </div>
            </div>
          ) : submissionMode === 'whatsapp' ? (
            /* ================= WHATSAPP INTEGRATION VIEW ================= */
            <div className="space-y-5 py-2">
              <div className="p-4 rounded-xl bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/40 dark:to-teal-950/30 border border-emerald-200 dark:border-emerald-800 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-md">
                    <MessageCircle className="w-7 h-7" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-emerald-950 dark:text-emerald-100">
                      সরাসরি হোয়াটসঅ্যাপ হটলাইন ডেস্ক
                    </h3>
                    <p className="text-xs text-emerald-700 dark:text-emerald-300 font-medium font-latin">
                      হটলাইন নম্বর: {activeWhatsAppNumber} (২৪/৭ সক্রিয়)
                    </p>
                  </div>
                </div>
                <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-normal">
                  আপনি কি কোনো গুরুত্বপূর্ণ ঘটনার প্রত্যক্ষদর্শী? কোনো ছবি, ভিডিও ফুটেজ বা অডিও ক্লিপ সহ তাৎক্ষণিক সংবাদ পাঠাতে চান? নিচের সংক্ষিপ্ত তথ্য দিয়ে সরাসরি বার্তা বিভাগের অফিশিয়াল হোয়াটসঅ্যাপে পাঠিয়ে দিন।
                </p>
              </div>

              {/* Quick Details for WhatsApp Template */}
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-bold mb-1 text-slate-700 dark:text-slate-300">
                    সংবাদের শিরোনাম বা মূল বিষয়
                  </label>
                  <input
                    type="text"
                    placeholder="যেমন: মহাসড়কে বাস উল্টে যান চলাচল বন্ধ"
                    value={headline}
                    onChange={(e) => setHeadline(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#1a222c] text-xs font-medium focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold mb-1 text-slate-700 dark:text-slate-300">
                      আপনার নাম / পরিচয়
                    </label>
                    <input
                      type="text"
                      placeholder="নাম লিখুন"
                      value={senderName}
                      onChange={(e) => setSenderName(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#1a222c] text-xs focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold mb-1 text-slate-700 dark:text-slate-300">
                      জেলা / এলাকা
                    </label>
                    <input
                      type="text"
                      placeholder="যেমন: চকরিয়া, কক্সবাজার"
                      value={district}
                      onChange={(e) => setDistrict(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#1a222c] text-xs focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold mb-1 text-slate-700 dark:text-slate-300">
                    সংবাদের সারসংক্ষেপ বা বিবরণ
                  </label>
                  <textarea
                    rows={3}
                    placeholder="ঘটনার স্থান, সময় এবং সংক্ষিপ্ত বিবরণ লিখুন (হোয়াটসঅ্যাপে ছবি বা ভিডিও সরাসরি পাঠাতে পারবেন)..."
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#1a222c] text-xs focus:ring-2 focus:ring-emerald-500 resize-none font-normal"
                  />
                </div>
              </div>

              {/* Action Buttons for WhatsApp */}
              <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setSubmissionMode('form')}
                  className="w-full sm:w-auto px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-700 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                >
                  ← সাধারণ ফর্মে ফিরে যান
                </button>
                <button
                  type="button"
                  onClick={handleOpenWhatsApp}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white text-xs font-bold transition-all shadow-md cursor-pointer"
                >
                  <MessageCircle className="w-4 h-4 fill-white" />
                  <span>হোয়াটসঅ্যাপে সংবাদ ও ছবি পাঠান</span>
                  <ExternalLink className="w-3.5 h-3.5 ml-0.5 opacity-80" />
                </button>
              </div>
            </div>
          ) : (
            /* ================= STANDARD FORM WITH CLOUDINARY UPLOADER ================= */
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Moderation Notice */}
              <div className="p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-xl flex items-start gap-2.5 text-xs text-amber-800 dark:text-amber-300">
                <ShieldCheck className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <span>
                  <strong>মডারেশন নোটিশ:</strong> সাধারণ ভিজিটর বা নাগরিক সাংবাদিকদের প্রেরিত প্রতিটি সংবাদ নিরপেক্ষ সম্পাদকীয় নীতিমালা অনুযায়ী যাচাই করে অনুমোদন দেওয়া হয়।
                </span>
              </div>

              {errorMsg && (
                <div className="p-3 bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800 rounded-xl flex items-center gap-2 text-xs text-red-600 dark:text-red-400">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* Honeypot field (hidden for anti-bot) */}
              <input
                type="text"
                name="website_url_hp"
                value={honeypot}
                onChange={(e) => setHoneypot(e.target.value)}
                style={{ display: 'none' }}
                tabIndex={-1}
                autoComplete="off"
              />

              {/* Headline */}
              <div>
                <label className="block text-xs font-bold mb-1 text-slate-700 dark:text-slate-300">
                  সংবাদের শিরোনাম <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="যেমন: জামালপুরে নতুন ব্রিজের নির্মাণ কাজ শুরু"
                  value={headline}
                  onChange={(e) => setHeadline(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#1a222c] text-sm focus:outline-none focus:ring-2 focus:ring-red-500 font-medium"
                />
              </div>

              {/* Category & District Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold mb-1 text-slate-700 dark:text-slate-300">
                    বিভাগ (Category)
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#1a222c] text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-red-500"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.nameBn}>
                        {c.nameBn}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold mb-1 text-slate-700 dark:text-slate-300">
                    জেলা / এলাকা <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="যেমন: জামালপুর সদর / বগুড়া"
                    value={district}
                    onChange={(e) => setDistrict(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#1a222c] text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>
              </div>

              {/* Submitter Details */}
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-3">
                <div className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center justify-between">
                  <span>প্রতিবেদকের তথ্য (যাচাইকরণের জন্য)</span>
                  <span className="text-[10px] text-slate-500 font-normal">গোপনীয়তা নিশ্চিত করা হবে</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                      আপনার নাম <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="যেমন: তানভীর হাসান"
                      value={senderName}
                      onChange={(e) => setSenderName(e.target.value)}
                      className="w-full px-2.5 py-1.5 rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#1a222c] text-xs focus:ring-1 focus:ring-red-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                      মোবাইল নম্বর <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="01XXXXXXXXX"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full px-2.5 py-1.5 rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#1a222c] text-xs focus:ring-1 focus:ring-red-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                      ঠিকানা / ইমেইল (ঐচ্ছিক)
                    </label>
                    <input
                      type="text"
                      placeholder="উপজেলা বা ইমেইল"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      className="w-full px-2.5 py-1.5 rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#1a222c] text-xs focus:ring-1 focus:ring-red-500"
                    />
                  </div>
                </div>
              </div>

              {/* News Body */}
              <div>
                <label className="block text-xs font-bold mb-1 text-slate-700 dark:text-slate-300">
                  বিস্তারিত সংবাদ ও ঘটনা <span className="text-red-500">*</span>
                </label>
                <textarea
                  required
                  rows={4}
                  placeholder="ঘটনার স্থান, সময়, প্রত্যক্ষদর্শীর বক্তব্য এবং বিস্তারিত বিবরণ লিখুন..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#1a222c] text-xs focus:outline-none focus:ring-2 focus:ring-red-500 resize-y leading-relaxed font-normal"
                />
              </div>

              {/* ================= DIRECT CLOUDINARY IMAGE UPLOADER (Requirement 1) ================= */}
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                    <Camera className="w-4 h-4 text-red-600" />
                    <span>সংবাদের ছবি (Direct Image Uploader)</span>
                  </label>
                  <div className="flex items-center gap-2 text-[11px]">
                    <button
                      type="button"
                      onClick={() => setImageUploadMethod('file')}
                      className={`px-2 py-0.5 rounded font-bold cursor-pointer transition-colors ${
                        imageUploadMethod === 'file'
                          ? 'bg-red-600 text-white'
                          : 'text-slate-500 hover:text-slate-800'
                      }`}
                    >
                      ডিভাইস থেকে আপলোড
                    </button>
                    <button
                      type="button"
                      onClick={() => setImageUploadMethod('url')}
                      className={`px-2 py-0.5 rounded font-bold cursor-pointer transition-colors ${
                        imageUploadMethod === 'url'
                          ? 'bg-red-600 text-white'
                          : 'text-slate-500 hover:text-slate-800'
                      }`}
                    >
                      ইমেজ লিংক
                    </button>
                  </div>
                </div>

                {imageUploadMethod === 'file' ? (
                  <div>
                    {/* Hidden file input */}
                    <input
                      type="file"
                      ref={fileInputRef}
                      accept="image/*"
                      onChange={handleDirectFileUpload}
                      className="hidden"
                    />

                    {imageUrl ? (
                      /* Preview Box with Cloudinary CDN tag */
                      <div className="relative rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#1a222c] p-2 flex items-center gap-3">
                        <img
                          src={imageUrl}
                          alt="Uploaded news visual"
                          className="w-20 h-16 object-cover rounded-md border border-slate-200 dark:border-slate-700 shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>ছবি আপলোড সম্পন্ন</span>
                            </span>
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 font-bold">
                              Cloudinary CDN
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500 truncate mt-0.5 font-mono">{imageUrl}</p>
                          {uploadedImageMeta?.savingsPercent && (
                            <span className="text-[10px] text-slate-400">
                              কম্প্রেসড: {uploadedImageMeta.fileSizeKb} KB ({uploadedImageMeta.savingsPercent}% সেভিংস)
                            </span>
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={handleRemoveImage}
                          className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/50 rounded-lg transition-colors cursor-pointer"
                          title="ছবি মুছুন"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      /* Dropzone / Upload Trigger Button */
                      <div
                        onClick={() => !isUploadingImage && fileInputRef.current?.click()}
                        className={`p-6 border-2 border-dashed rounded-xl flex flex-col items-center justify-center text-center cursor-pointer transition-all ${
                          isUploadingImage
                            ? 'border-red-400 bg-red-50/30'
                            : 'border-slate-300 dark:border-slate-700 hover:border-red-500 dark:hover:border-red-500 hover:bg-red-50/20 dark:hover:bg-red-950/20'
                        }`}
                      >
                        {isUploadingImage ? (
                          <div className="space-y-2 flex flex-col items-center">
                            <Loader2 className="w-8 h-8 text-red-600 animate-spin" />
                            <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
                              Cloudinary CDN-এ ছবি অপ্টিমাইজ ও আপলোড হচ্ছে...
                            </p>
                          </div>
                        ) : (
                          <>
                            <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-950/60 text-red-600 flex items-center justify-center mb-2">
                              <UploadCloud className="w-5 h-5" />
                            </div>
                            <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                              ছবি নির্বাচন করতে ক্লিক করুন (সরাসরি ক্লাউড আপলোড)
                            </span>
                            <span className="text-[10px] text-slate-500 mt-1">
                              JPEG, PNG, WEBP (সর্বোচ্চ ১২ মেগাবাইট) • কোনো ম্যানুয়াল URL তৈরির প্রয়োজন নেই
                            </span>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                ) : (
                  /* Image URL Fallback */
                  <div>
                    <input
                      type="url"
                      placeholder="https://example.com/photo.jpg"
                      value={imageUrl}
                      onChange={(e) => setImageUrl(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#1a222c] text-xs focus:ring-1 focus:ring-red-500"
                    />
                    <p className="text-[10px] text-slate-400 mt-1">
                      ওয়েবে ইতিমধ্যে আপলোড থাকা কোনো ছবির লিংক পেস্ট করুন।
                    </p>
                  </div>
                )}
              </div>

              {/* ================= MULTIPLE FILE ATTACHMENTS (Requirement 3: একাধিক ফাইল আপলোড) ================= */}
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <label className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                      <UploadCloud className="w-4 h-4 text-red-600" />
                      <span>একাধিক প্রমাণ্য ফাইল ও মিডিয়া সংযুক্তি (Multiple File Uploads)</span>
                    </label>
                    <p className="text-[10px] text-slate-500">
                      সংবাদের সপক্ষে একাধিক ছবি, প্রমাণ্য নথি, অডিও বা প্রেস বিজ্ঞপ্তি একসাথে আপলোড করুন (লোকাল স্টোরেজ)
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => multipleFilesInputRef.current?.click()}
                    disabled={isUploadingAttachments}
                    className="px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-xs active:scale-95"
                  >
                    {isUploadingAttachments ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>সংরক্ষণ হচ্ছে...</span>
                      </>
                    ) : (
                      <>
                        <UploadCloud className="w-3.5 h-3.5" />
                        <span>+ একাধিক ফাইল আপলোড</span>
                      </>
                    )}
                  </button>
                  <input
                    type="file"
                    ref={multipleFilesInputRef}
                    multiple
                    accept="image/*,.pdf,.doc,.docx,.mp3,.mp4,.txt"
                    onChange={handleMultipleFilesUpload}
                    className="hidden"
                  />
                </div>

                {/* Uploaded Attachments List */}
                {attachments.length > 0 && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                    {attachments.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between p-2 rounded-lg bg-white dark:bg-[#1a222c] border border-slate-200 dark:border-slate-700 text-xs shadow-2xs"
                      >
                        <div className="flex items-center gap-2 min-w-0 flex-1">
                          {item.type?.startsWith('image/') ? (
                            <img src={item.url} alt="" className="w-7 h-7 rounded object-cover border border-slate-200 shrink-0" />
                          ) : (
                            <span className="p-1 rounded bg-slate-100 dark:bg-slate-800 text-red-600 shrink-0">
                              <FileText className="w-3.5 h-3.5" />
                            </span>
                          )}
                          <div className="min-w-0 flex-1">
                            <p className="truncate font-bold text-slate-800 dark:text-slate-200 text-[11px]" title={item.name}>
                              {item.name}
                            </p>
                            <span className="text-[10px] text-slate-400 font-mono">
                              {item.sizeKb ? `${item.sizeKb} KB` : 'ফাইল'} • সুরক্ষিত
                            </span>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveAttachment(item.id)}
                          className="p-1 rounded text-slate-400 hover:text-red-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors ml-1.5 cursor-pointer"
                          title="মুছে ফেলুন"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Submit & Secondary WhatsApp Button */}
              <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={handleOpenWhatsApp}
                  className="w-full sm:w-auto flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 hover:bg-emerald-100 text-xs font-bold transition-colors cursor-pointer"
                  title="হোয়াটসঅ্যাপে পাঠিয়ে দিন"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  <span>অথবা হোয়াটসঅ্যাপে পাঠান ({activeWhatsAppNumber})</span>
                </button>

                <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-700 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                  >
                    বাতিল
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting || isUploadingImage}
                    className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition-all shadow-md disabled:opacity-50 cursor-pointer"
                  >
                    <Send className="w-4 h-4" />
                    <span>{isSubmitting ? 'পাঠানো হচ্ছে...' : 'সংবাদ জমা দিন (অনুমোদন কিউ)'}</span>
                  </button>
                </div>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
