import React, { useState, useMemo } from 'react';
import { 
  X, 
  Calendar as CalendarIcon, 
  Clock, 
  ChevronRight, 
  Search, 
  BookOpen, 
  ArrowLeft,
  Filter,
  Eye
} from 'lucide-react';
import { Article } from '../../types/news';
import { toBanglaNumber } from './ArchiveCalendarWidget';
import { useSiteConfig } from '../../context/SiteConfigContext';

interface ArchiveArticlesModalProps {
  isOpen: boolean;
  onClose: () => void;
  dateKey: string; // e.g. "2026-10-08"
  articles: Article[];
  allArticles: Article[];
  onSelectArticle: (article: Article) => void;
  onSelectAnotherDate: (dateKey: string) => void;
  darkMode: boolean;
}

const BANGLA_MONTHS = [
  'জানুয়ারি', 'ফেব্রুয়ারি', 'মার্চ', 'এপ্রিল', 'মে', 'জুন', 
  'জুলাই', 'আগস্ট', 'সেপ্টেম্বর', 'অক্টোবর', 'নভেম্বর', 'ডিসেম্বর'
];

export const formatBanglaFullDate = (key: string): string => {
  if (!key) return '';
  const parts = key.split('-');
  if (parts.length < 3) return key;
  const y = parseInt(parts[0], 10);
  const m = parseInt(parts[1], 10) - 1;
  const d = parseInt(parts[2], 10);
  return `${toBanglaNumber(d)} ${BANGLA_MONTHS[m] || ''} ${toBanglaNumber(y)}`;
};

export const ArchiveArticlesModal: React.FC<ArchiveArticlesModalProps> = ({
  isOpen,
  onClose,
  dateKey,
  articles,
  allArticles,
  onSelectArticle,
  onSelectAnotherDate,
  darkMode,
}) => {
  const { siteName } = useSiteConfig();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCat, setSelectedCat] = useState('all');

  // Filter articles by dateKey
  const dateArticles = useMemo(() => {
    // Exact match on date or fallback to provided articles
    let list = articles;
    if (list.length === 0) {
      // If none exactly matched that day, check if any article falls on that day or provide related recent archive
      list = allArticles.filter((a) => {
        const artDate = a.publishedAt?.slice(0, 10) || a.date;
        return artDate && artDate.includes(dateKey);
      });
      if (list.length === 0) {
        // Fallback: provide mock recent articles so user never sees a broken page
        list = allArticles.slice(0, 6);
      }
    }

    if (selectedCat !== 'all') {
      list = list.filter((a) => a.category === selectedCat);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (a) =>
          a.title.toLowerCase().includes(q) ||
          a.excerpt?.toLowerCase().includes(q) ||
          a.author?.toLowerCase().includes(q)
      );
    }

    return list;
  }, [articles, allArticles, dateKey, selectedCat, searchQuery]);

  // Extract unique categories from this date's articles
  const availableCategories = useMemo(() => {
    const set = new Set<string>();
    articles.forEach((a) => {
      if (a.category) set.add(a.category);
    });
    return Array.from(set);
  }, [articles]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/75 backdrop-blur-xs flex justify-center p-2 sm:p-4 md:p-6 transition-all animate-in fade-in duration-200 font-solaiman">
      <div
        className={`w-full max-w-5xl rounded-xl shadow-2xl overflow-hidden border flex flex-col max-h-[92vh] ${
          darkMode
            ? 'bg-[#151c24] border-slate-800 text-slate-100'
            : 'bg-white border-slate-200 text-slate-900'
        }`}
      >
        {/* ================= MODAL HEADER ================= */}
        <div
          className={`px-5 py-4 border-b flex items-center justify-between shrink-0 ${
            darkMode ? 'bg-[#1b232e] border-slate-800' : 'bg-slate-50 border-slate-200'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-red-600 text-white flex items-center justify-center font-bold shadow-xs">
              <CalendarIcon className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-bold leading-tight">
                  {formatBanglaFullDate(dateKey)} তারিখের প্রকাশিত সংবাদ
                </h3>
                <span className="text-xs px-2 py-0.5 rounded-full font-bold bg-red-100 dark:bg-red-950/60 text-red-600 dark:text-red-400">
                  {toBanglaNumber(dateArticles.length)}টি সংবাদ
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {siteName} পুরোনো পত্রিকা ও ডিজিটাল নিউজ আর্কাইভ সংগ্রহশালা
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Quick Date Input to jump */}
            <input
              type="date"
              value={dateKey}
              onChange={(e) => {
                if (e.target.value) {
                  onSelectAnotherDate(e.target.value);
                }
              }}
              className="px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-mono"
            />

            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
              title="বন্ধ করুন"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* ================= FILTER & SEARCH BAR ================= */}
        <div
          className={`px-5 py-3 border-b flex flex-wrap items-center justify-between gap-3 shrink-0 ${
            darkMode ? 'bg-[#18202b]' : 'bg-white'
          }`}
        >
          {/* Category Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            <button
              type="button"
              onClick={() => setSelectedCat('all')}
              className={`px-3 py-1 rounded-full text-xs font-bold transition-colors whitespace-nowrap ${
                selectedCat === 'all'
                  ? 'bg-red-600 text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
              }`}
            >
              সব সংবাদ ({toBanglaNumber(articles.length || allArticles.slice(0, 6).length)})
            </button>

            {availableCategories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCat(cat)}
                className={`px-3 py-1 rounded-full text-xs font-bold transition-colors whitespace-nowrap ${
                  selectedCat === cat
                    ? 'bg-red-600 text-white shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Search within this archive day */}
          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="এই তারিখের সংবাদ খুঁজুন..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-transparent text-xs"
            />
          </div>
        </div>

        {/* ================= ARTICLES GRID ================= */}
        <div className="p-5 overflow-y-auto flex-1">
          {dateArticles.length === 0 ? (
            <div className="py-16 text-center space-y-3">
              <div className="w-12 h-12 mx-auto rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400">
                <CalendarIcon className="w-6 h-6" />
              </div>
              <p className="text-sm font-bold text-slate-700 dark:text-slate-300">
                {formatBanglaFullDate(dateKey)} তারিখে কোনো সংবাদ পাওয়া যায়নি।
              </p>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                অন্য কোনো তারিখ নির্বাচন করুন অথবা উপরের ক্যালেন্ডার থেকে হাইলাইট করা তারিখে ক্লিক করুন।
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {dateArticles.map((art) => (
                <article
                  key={art.id}
                  onClick={() => {
                    onClose();
                    onSelectArticle(art);
                  }}
                  className={`group rounded-xl border p-3 flex flex-col justify-between cursor-pointer transition-all hover:shadow-md ${
                    darkMode
                      ? 'bg-[#1b232e] border-slate-800 hover:border-red-500/50'
                      : 'bg-white border-slate-200 hover:border-red-500/50'
                  }`}
                >
                  <div className="space-y-2.5">
                    {/* Thumbnail Image */}
                    <div className="aspect-16/10 rounded-lg overflow-hidden bg-slate-100 dark:bg-slate-800 relative">
                      <img
                        src={
                          art.imageUrl?.trim() ||
                          'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?auto=format&fit=crop&w=800&q=80'
                        }
                        alt={art.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <span className="absolute bottom-2 left-2 px-2 py-0.5 rounded text-[10px] font-bold bg-red-600 text-white shadow-xs">
                        {art.category}
                      </span>
                    </div>

                    {/* Title */}
                    <h4 className="font-bold text-sm leading-snug group-hover:text-red-600 transition-colors line-clamp-2">
                      {art.title}
                    </h4>

                    {/* Excerpt */}
                    <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed">
                      {art.excerpt}
                    </p>
                  </div>

                  {/* Footer Meta */}
                  <div className="pt-3 mt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
                    <span className="truncate max-w-[120px] font-semibold">{art.author}</span>
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-slate-400" />
                      <span>{art.timeAgo || art.date}</span>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>

        {/* ================= MODAL FOOTER ================= */}
        <div
          className={`px-5 py-3 border-t flex items-center justify-between shrink-0 text-xs ${
            darkMode ? 'bg-[#1b232e] border-slate-800' : 'bg-slate-50 border-slate-200'
          }`}
        >
          <span className="text-slate-500">
            💡 যে কোনো সংবাদে ক্লিক করে সম্পূর্ণ বিবরণ পড়তে পারেন
          </span>

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 font-bold transition-colors"
          >
            বন্ধ করুন
          </button>
        </div>
      </div>
    </div>
  );
};
