import React, { useState } from 'react';
import { Search, X, Clock, ArrowRight } from 'lucide-react';
import { Article } from '../types/news';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  articles: Article[];
  onSelectArticle: (article: Article) => void;
  darkMode: boolean;
  lang: 'bn' | 'en';
}

export const SearchModal: React.FC<SearchModalProps> = ({
  isOpen,
  onClose,
  articles,
  onSelectArticle,
  darkMode,
  lang,
}) => {
  if (!isOpen) return null;

  const [query, setQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const filtered = articles.filter(art => {
    const matchesCategory = selectedCategory === 'all' || art.category === selectedCategory;
    const matchesQuery = !query.trim() || 
      art.title.toLowerCase().includes(query.toLowerCase()) ||
      art.excerpt.toLowerCase().includes(query.toLowerCase()) ||
      (art.titleEn && art.titleEn.toLowerCase().includes(query.toLowerCase()));
    return matchesCategory && matchesQuery;
  });

  const categories = ['all', 'জাতীয়', 'রাজনীতি', 'বিশ্ব', 'আইন-আদালত', 'শোবিজ', 'অর্থ ও বাণিজ্য'];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex justify-center p-4 pt-12 sm:pt-20">
      <div 
        className={`w-full max-w-2xl rounded-lg shadow-2xl overflow-hidden border h-fit transition-colors ${
          darkMode ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-900'
        }`}
      >
        {/* Search Input Bar */}
        <div className={`p-4 border-b flex items-center gap-3 ${
          darkMode ? 'border-slate-800' : 'border-slate-200'
        }`}>
          <Search className="w-5 h-5 text-red-600 shrink-0" />
          <input
            type="text"
            autoFocus
            placeholder={lang === 'bn' ? 'সংবাদ খুঁজুন (যেমন: আদালত, রাজনীতি, বিশ্ববাজার)...' : 'Search news headlines...'}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full text-base font-bangla bg-transparent focus:outline-none placeholder:text-slate-400"
          />
          {query && (
            <button onClick={() => setQuery('')} className="text-slate-400 hover:text-slate-600">
              <X className="w-4 h-4" />
            </button>
          )}
          <button 
            onClick={onClose}
            className="p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-700 dark:hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Category Filter Pills */}
        <div className={`px-4 py-2 flex items-center gap-1.5 overflow-x-auto no-scrollbar border-b text-xs font-bangla ${
          darkMode ? 'border-slate-800 bg-slate-950/40' : 'border-slate-100 bg-slate-50'
        }`}>
          {categories.map((c) => (
            <button
              key={c}
              onClick={() => setSelectedCategory(c)}
              className={`px-2.5 py-1 rounded-full whitespace-nowrap transition-colors ${
                selectedCategory === c 
                  ? 'bg-red-600 text-white font-bold' 
                  : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-300'
              }`}
            >
              {c === 'all' ? (lang === 'bn' ? 'সব বিভাগ' : 'All') : c}
            </button>
          ))}
        </div>

        {/* Results List */}
        <div className="max-h-[60vh] overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800 p-2">
          {filtered.length === 0 ? (
            <div className="py-12 text-center text-slate-400 font-bangla">
              কোনো সংবাদ পাওয়া যায়নি। অন্য শব্দ দিয়ে অনুসন্ধান করুন।
            </div>
          ) : (
            filtered.map((item) => (
              <div
                key={item.id}
                onClick={() => {
                  onSelectArticle(item);
                  onClose();
                }}
                className="group cursor-pointer flex items-center justify-between gap-4 p-3 rounded hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors"
              >
                <div className="space-y-1 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bangla font-semibold text-red-600 px-1.5 py-0.2 rounded bg-red-50 dark:bg-red-950/40">
                      {item.category}
                    </span>
                    <span className="text-[10px] text-slate-400 font-bangla">
                      {item.date}
                    </span>
                  </div>
                  <h4 className="text-sm font-bangla font-bold text-slate-900 dark:text-slate-100 group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors line-clamp-1">
                    {lang === 'bn' ? item.title : (item.titleEn || item.title)}
                  </h4>
                  <p className="text-xs text-slate-500 font-bangla line-clamp-1">
                    {item.excerpt}
                  </p>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-red-600 transition-colors shrink-0" />
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
