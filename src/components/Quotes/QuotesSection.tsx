import React, { useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, Download, MessageSquare, Share2, Facebook, PhoneCall } from 'lucide-react';
import { QuoteItem, SiteSettings } from '../../types/news';
import { QuoteCardDownloadModal } from './QuoteCardDownloadModal';

interface QuotesSectionProps {
  quotes: QuoteItem[];
  darkMode?: boolean;
  lang?: 'bn' | 'en';
  settings?: SiteSettings;
}

export const QuotesSection: React.FC<QuotesSectionProps> = ({
  quotes,
  darkMode = false,
  lang = 'bn',
  settings,
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [selectedQuoteForModal, setSelectedQuoteForModal] = useState<QuoteItem | null>(null);

  const activeQuotes = quotes.filter(q => q.isActive !== false);

  if (activeQuotes.length === 0) return null;

  const handleScroll = (direction: 'left' | 'right') => {
    if (!scrollRef.current) return;
    const scrollAmount = 340;
    scrollRef.current.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth',
    });
  };

  const handleShareFacebook = (quote: QuoteItem) => {
    const text = encodeURIComponent(`"${quote.quote}" — ${quote.speakerName}`);
    const url = encodeURIComponent(window.location.origin);
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}&quote=${text}`, '_blank', 'width=600,height=450');
  };

  const handleShareWhatsApp = (quote: QuoteItem) => {
    const text = encodeURIComponent(`"${quote.quote}" — ${quote.speakerName} (${quote.speakerDesignation})\n${window.location.origin}`);
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
  };

  return (
    <section className="my-8 sm:my-10 font-solaiman">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        
        {/* Section Header matching Broadsheet screenshot 2 */}
        <div className="flex items-center justify-between pb-3 mb-4 border-b-2 border-red-600">
          <div className="flex items-center gap-2.5">
            <h2 className="text-xl sm:text-2xl md:text-3xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
              <span className="w-2.5 h-6 bg-red-600 rounded-xs inline-block" />
              <span>{lang === 'bn' ? 'কথা' : 'Quotes & Statements'}</span>
            </h2>
            <span className="text-xs text-slate-600 dark:text-slate-300 font-bold hidden sm:inline">
              | জাতীয় ও আন্তর্জাতিক ব্যক্তিত্বদের আলোচিত বক্তব্য
            </span>
          </div>

          {/* Navigation Slider Buttons */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => handleScroll('left')}
              className="w-8 h-8 rounded-full border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-red-50 dark:hover:bg-slate-700 flex items-center justify-center transition-all shadow-xs cursor-pointer hover:border-red-500"
              title="পূর্ববর্তী উক্তি"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => handleScroll('right')}
              className="w-8 h-8 rounded-full border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-red-50 dark:hover:bg-slate-700 flex items-center justify-center transition-all shadow-xs cursor-pointer hover:border-red-500"
              title="পরবর্তী উক্তি"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Horizontal Scroll / Carousel Container (matching Image 2) */}
        <div
          ref={scrollRef}
          className="flex gap-4 sm:gap-5 overflow-x-auto pb-4 pt-1 scroll-smooth snap-x snap-mandatory scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-slate-700 select-none"
          style={{ scrollbarWidth: 'thin' }}
        >
          {activeQuotes.map((item) => (
            <div
              key={item.id}
              className={`snap-start shrink-0 w-[295px] sm:w-[325px] md:w-[345px] p-5 sm:p-6 rounded-2xl border flex flex-col justify-between transition-all duration-200 hover:shadow-xl hover:-translate-y-1 ${
                darkMode
                  ? 'bg-slate-900/90 border-slate-800 text-slate-100 hover:border-slate-700'
                  : 'bg-white border-slate-200 text-slate-900 shadow-xs hover:border-red-200'
              }`}
            >
              {/* Card Top Action Bar: Social Share Icons on left & Red "কার্ড ডাউনলোড করুন" pill on right */}
              <div>
                <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100 dark:border-slate-800">
                  {/* Share Icons */}
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleShareFacebook(item)}
                      className="w-7 h-7 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-blue-950/40 text-slate-600 dark:text-slate-300 hover:text-blue-600 flex items-center justify-center text-xs font-bold transition-colors cursor-pointer border border-slate-200 dark:border-slate-700"
                      title="ফেসবুকে শেয়ার করুন"
                    >
                      <span className="font-bold text-xs">f</span>
                    </button>
                    <button
                      onClick={() => handleShareWhatsApp(item)}
                      className="w-7 h-7 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 text-slate-600 dark:text-slate-300 hover:text-emerald-600 flex items-center justify-center text-xs transition-colors cursor-pointer border border-slate-200 dark:border-slate-700"
                      title="হোয়াটসঅ্যাপে শেয়ার করুন"
                    >
                      <PhoneCall className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Red Outline Pill Button: কার্ড ডাউনলোড করুন */}
                  <button
                    onClick={() => setSelectedQuoteForModal(item)}
                    className="flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-red-500/80 bg-red-50/60 dark:bg-red-950/30 text-red-600 dark:text-red-400 hover:bg-red-600 hover:text-white text-[11px] font-bold font-solaiman transition-all duration-200 cursor-pointer shadow-2xs group"
                    title="এইচডি ফটো কার্ড ডাউনলোড করুন"
                  >
                    <span>কার্ড ডাউনলোড করুন</span>
                    <Download className="w-3 h-3 group-hover:translate-y-0.5 transition-transform" />
                  </button>
                </div>

                {/* Quotation Mark & Time Badge Row */}
                <div className="flex items-center justify-between mb-3">
                  <span className="text-3xl sm:text-4xl font-serif font-black text-slate-900 dark:text-white leading-none select-none">
                    ❝
                  </span>

                  {item.timeAgo && (
                    <span className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-[11px] font-bold">
                      {item.timeAgo}
                    </span>
                  )}
                </div>

                {/* Quote Text */}
                <p className="text-sm sm:text-base font-medium text-slate-800 dark:text-slate-200 leading-relaxed font-solaiman min-h-[96px] text-left">
                  {item.quote}
                </p>
              </div>

              {/* Bottom Speaker Profile Row */}
              <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800 flex items-center gap-3">
                <div className="w-11 h-11 rounded-full overflow-hidden shrink-0 border-2 border-slate-200 dark:border-slate-700 bg-slate-100 shadow-xs">
                  <img
                    src={item.speakerPhoto}
                    alt={item.speakerName}
                    crossOrigin={item.speakerPhoto?.startsWith('data:') ? undefined : 'anonymous'}
                    className="w-full h-full object-cover object-top"
                  />
                </div>

                <div className="min-w-0 flex-1">
                  <h4 className="font-black text-sm sm:text-base text-slate-950 dark:text-white truncate font-solaiman leading-tight">
                    {item.speakerName}
                  </h4>
                  <p className="text-xs text-slate-600 dark:text-slate-400 font-bold truncate font-solaiman leading-tight mt-0.5">
                    {item.speakerDesignation}
                  </p>
                </div>
              </div>

            </div>
          ))}
        </div>

      </div>

      {/* High-Resolution Quote Photo Card Modal */}
      <QuoteCardDownloadModal
        quote={selectedQuoteForModal}
        isOpen={Boolean(selectedQuoteForModal)}
        onClose={() => setSelectedQuoteForModal(null)}
        settings={settings}
        darkMode={darkMode}
      />
    </section>
  );
};
