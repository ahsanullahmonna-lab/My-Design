import React, { useRef, useState } from 'react';
import { X, Download, Copy, Share2, Check, Sparkles, Calendar, Globe, AlertCircle } from 'lucide-react';
import { QuoteItem, SiteSettings } from '../../types/news';
import { downloadPhotoCardImage, exportPhotoCardToBlob } from '../../utils/photoCardExport';

interface QuoteCardDownloadModalProps {
  quote: QuoteItem | null;
  isOpen: boolean;
  onClose: () => void;
  settings?: SiteSettings;
  darkMode?: boolean;
}

export const QuoteCardDownloadModal: React.FC<QuoteCardDownloadModalProps> = ({
  quote,
  isOpen,
  onClose,
  settings,
  darkMode = false,
}) => {
  const cardNodeRef = useRef<HTMLDivElement>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen || !quote) return null;

  const siteName = settings?.siteName || 'নতুন দৃষ্টি';
  const siteDomain = settings?.domain || 'notundrishti.com';
  const siteLogo = settings?.logoUrl || settings?.lightLogoUrl || '';

  const handleDownload = async () => {
    if (!cardNodeRef.current) return;
    setIsDownloading(true);
    setErrorMsg('');

    try {
      const safeName = quote.speakerName.replace(/[^\w\s\u0980-\u09FF]/gi, '').trim().replace(/\s+/g, '_');
      const filename = `quote_${safeName || 'quote'}_${Date.now()}.png`;

      await downloadPhotoCardImage(cardNodeRef.current, filename, {
        targetWidth: 1200,
        targetHeight: 1200,
        minWidth: 1200,
        aspectRatio: '1:1',
      });

      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 3500);
    } catch (err) {
      console.error('Quote card export error:', err);
      setErrorMsg('ডাউনলোড করতে সমস্যা হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।');
    } finally {
      setIsDownloading(false);
    }
  };

  const handleCopyImage = async () => {
    if (!cardNodeRef.current) return;
    try {
      const blob = await exportPhotoCardToBlob(cardNodeRef.current, {
        targetWidth: 1200,
        targetHeight: 1200,
        minWidth: 1200,
      });

      if (blob && navigator.clipboard && window.ClipboardItem) {
        await navigator.clipboard.write([
          new ClipboardItem({ 'image/png': blob })
        ]);
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2500);
      } else {
        await navigator.clipboard.writeText(`"${quote.quote}"\n— ${quote.speakerName} (${quote.speakerDesignation})\n${siteDomain}`);
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2500);
      }
    } catch (err) {
      console.error('Clipboard copy error:', err);
    }
  };

  const handleShareFacebook = () => {
    const text = encodeURIComponent(`"${quote.quote}" — ${quote.speakerName}`);
    const url = encodeURIComponent(window.location.origin);
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}&quote=${text}`, '_blank', 'width=600,height=450');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className={`w-full max-w-2xl max-h-[92vh] flex flex-col rounded-2xl border shadow-2xl overflow-hidden font-solaiman ${
          darkMode ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-200 text-slate-900'
        }`}
      >
        {/* Header Bar */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-200 dark:border-slate-800 shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-red-600 text-white flex items-center justify-center shadow-xs">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm sm:text-base leading-tight">
                এইচডি উক্তি কার্ড (Quote Photo Card)
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                সোশ্যাল মিডিয়ায় শেয়ার করার জন্য ১২০০x১২০০ পিক্সেল আল্ট্রা-এইচডি ফরম্যাট
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Preview Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-100 dark:bg-slate-950/90 flex flex-col items-center justify-center">
          
          {/* THE CAPTURED HIGH-RES PHOTO CARD NODE (Matches image_56508868.png) */}
          <div className="w-full max-w-[460px] mx-auto shadow-2xl rounded-2xl overflow-hidden border border-slate-300 dark:border-slate-800">
            <div
              ref={cardNodeRef}
              id="quote-card-canvas"
              className="relative w-full aspect-square text-slate-900 flex flex-col justify-between p-6 sm:p-7 select-none overflow-hidden"
              style={{
                background: 'linear-gradient(135deg, #eaf2f9 0%, #f4f8fc 45%, #e6eff8 100%)',
                fontFamily: "'SolaimanLipi', 'Hind Siliguri', sans-serif",
              }}
            >
              {/* Subtle Geometric / Watermark Background Accent */}
              <div 
                className="absolute inset-0 opacity-15 pointer-events-none"
                style={{
                  backgroundImage: 'radial-gradient(#0284c7 1px, transparent 1px), radial-gradient(#0284c7 1px, transparent 1px)',
                  backgroundSize: '24px 24px',
                  backgroundPosition: '0 0, 12px 12px'
                }}
              />

              {/* Watermark Logo Texture */}
              <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-5 pointer-events-none">
                <span className="text-8xl font-black text-slate-900 select-none">❝</span>
              </div>

              {/* Top Row: Quotation Icon on Left, Date on Right */}
              <div className="relative z-10 flex items-start justify-between">
                <div className="text-sky-600 dark:text-sky-500 leading-none">
                  <span className="text-5xl sm:text-6xl font-serif font-black select-none tracking-tighter">❝</span>
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/80 backdrop-blur-xs border border-sky-100 text-slate-700 text-xs font-bold shadow-2xs">
                  <Calendar className="w-3.5 h-3.5 text-sky-600" />
                  <span>{quote.date}</span>
                </div>
              </div>

              {/* Middle Row: The Quote Text */}
              <div className="relative z-10 my-auto py-2">
                <p className="text-sm sm:text-base md:text-lg font-black text-slate-900 leading-relaxed tracking-normal font-solaiman text-left drop-shadow-2xs">
                  {quote.quote}
                </p>
              </div>

              {/* Bottom Row: Speaker Info & Brand on Left, Speaker Portrait on Right */}
              <div className="relative z-10 flex items-end justify-between pt-4 mt-2">
                
                {/* Speaker Identity & Portal Branding (Bottom Left) */}
                <div className="space-y-3 max-w-[60%]">
                  <div>
                    <h4 className="text-base sm:text-lg font-black text-slate-950 font-solaiman leading-tight">
                      {quote.speakerName}
                    </h4>
                    {/* Cyan Underline Accent matching reference image */}
                    <div className="h-0.5 w-16 bg-sky-500 my-1 rounded-full" />
                    <p className="text-xs sm:text-sm font-bold text-slate-700 font-solaiman leading-tight">
                      {quote.speakerDesignation}
                    </p>
                  </div>

                  {/* Brand Masthead / Domain Pill matching reference image */}
                  <div className="flex items-center gap-2 pt-1">
                    {siteLogo ? (
                      <img src={siteLogo} alt={siteName} className="h-5 sm:h-6 object-contain" crossOrigin="anonymous" />
                    ) : (
                      <span className="text-sm sm:text-base font-black text-slate-900 tracking-tight font-solaiman">
                        {siteName}
                      </span>
                    )}

                    <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-gradient-to-r from-orange-500 to-amber-600 text-white text-[10px] font-mono font-bold shadow-xs">
                      <Globe className="w-3 h-3 text-white" />
                      <span>{siteDomain}</span>
                    </div>
                  </div>
                </div>

                {/* Speaker Portrait Photo (Bottom Right - Sitting Cleanly) */}
                <div className="relative shrink-0 max-w-[38%]">
                  <div className="relative w-28 h-28 sm:w-36 sm:h-36 rounded-2xl overflow-hidden border-2 border-white shadow-xl bg-white/70">
                    <img
                      src={quote.speakerPhoto}
                      alt={quote.speakerName}
                      crossOrigin={quote.speakerPhoto?.startsWith('data:') ? undefined : 'anonymous'}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover object-top"
                    />
                  </div>
                </div>

              </div>

            </div>
          </div>

          {/* Feedback Badges */}
          {downloadSuccess && (
            <div className="mt-4 px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold flex items-center gap-2 shadow-md animate-in fade-in">
              <Check className="w-4 h-4" />
              <span>কার্ডটি উচ্চ রেজ্যুলেশনে (এইচডি পিএনজি) সফলভাবে ডাউনলোড হয়েছে!</span>
            </div>
          )}

          {errorMsg && (
            <div className="mt-4 px-4 py-2 rounded-xl bg-red-600 text-white text-xs font-bold flex items-center gap-2 shadow-md animate-in fade-in">
              <AlertCircle className="w-4 h-4" />
              <span>{errorMsg}</span>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-5 py-3.5 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2">
            <button
              onClick={handleShareFacebook}
              className="px-3 py-1.5 rounded-xl border border-blue-200 dark:border-blue-900 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/40 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>ফেসবুক শেয়ার</span>
            </button>

            <button
              onClick={handleCopyImage}
              className="px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{isCopied ? 'কপি হয়েছে!' : 'কপি করুন'}</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-bold hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
            >
              বন্ধ করুন
            </button>

            <button
              onClick={handleDownload}
              disabled={isDownloading}
              className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold flex items-center gap-2 shadow-md transition-all cursor-pointer disabled:opacity-50"
            >
              <Download className="w-4 h-4" />
              <span>{isDownloading ? 'তৈরি হচ্ছে...' : 'কার্ড ডাউনলোড করুন (HD PNG)'}</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
