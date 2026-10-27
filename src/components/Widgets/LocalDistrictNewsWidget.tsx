import React, { useState } from 'react';
import { MapPin, Filter, X, ChevronRight, Search, Check, Sparkles, Newspaper } from 'lucide-react';
import { 
  BANGLADESH_DIVISIONS, 
  getDivisionDistricts, 
  findDivisionByDistrict, 
  isDistrictMatch 
} from '../../data/bangladeshGeoData';
import { Article } from '../../types/news';

interface LocalDistrictNewsWidgetProps {
  articles: Article[];
  selectedDistrict: string | null;
  onSelectDistrict: (district: string | null) => void;
  darkMode: boolean;
  lang: 'bn' | 'en';
  variant?: 'inline-banner' | 'compact-card' | 'standalone-filter' | 'sidebar';
  onSelectArticle?: (article: Article) => void;
  className?: string;
}

export const LocalDistrictNewsWidget: React.FC<LocalDistrictNewsWidgetProps> = ({
  articles,
  selectedDistrict,
  onSelectDistrict,
  darkMode,
  lang,
  variant = 'inline-banner',
  onSelectArticle,
  className = '',
}) => {
  const initialDiv = selectedDistrict ? findDivisionByDistrict(selectedDistrict) : 'ঢাকা';
  const [selectedDivision, setSelectedDivision] = useState<string>(initialDiv);
  const [tempDistrict, setTempDistrict] = useState<string>(selectedDistrict || 'ঢাকা');
  const [searchTerm, setSearchTerm] = useState('');
  const [isExpanded, setIsExpanded] = useState(!selectedDistrict);

  // Get districts for currently selected division
  const currentDistricts = getDivisionDistricts(selectedDivision);

  // Calculate article counts per district
  const getDistrictArticleCount = (distName: string) => {
    return articles.filter(a => isDistrictMatch(a.district, distName, a.tags, a.title)).length;
  };

  const handleDivisionChange = (divName: string) => {
    setSelectedDivision(divName);
    const newDistricts = getDivisionDistricts(divName);
    if (newDistricts.length > 0) {
      setTempDistrict(newDistricts[0].nameBn);
    }
  };

  const handleApplyFilter = (distName?: string) => {
    const dist = distName || tempDistrict;
    onSelectDistrict(dist);
    setIsExpanded(false);
  };

  const handleResetFilter = () => {
    onSelectDistrict(null);
    setTempDistrict('ঢাকা');
    setIsExpanded(true);
  };

  // Filtered districts if search is active
  const filteredDistricts = searchTerm.trim()
    ? currentDistricts.filter(
        d => d.nameBn.includes(searchTerm.trim()) || d.nameEn.toLowerCase().includes(searchTerm.toLowerCase().trim())
      )
    : currentDistricts;

  // Active district count
  const activeCount = selectedDistrict ? getDistrictArticleCount(selectedDistrict) : 0;

  // ================= ELEGANT COMPACT SIDEBAR WIDGET (Requirement 2) =================
  if (variant === 'sidebar') {
    return (
      <div 
        className={`w-full font-solaiman rounded-lg border shadow-xs overflow-hidden transition-all duration-200 ${
          darkMode 
            ? 'bg-slate-900/80 border-slate-800 text-slate-100' 
            : 'bg-slate-50/90 border-slate-200 text-slate-800'
        } ${className}`}
      >
        {/* Widget Top Title */}
        <div className="p-3 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-red-600 text-white flex items-center justify-center shrink-0 shadow-xs">
              <MapPin className="w-3.5 h-3.5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-900 dark:text-white leading-tight">
                {lang === 'bn' ? 'নিজ জেলার নিউজ দেখুন' : 'Local District News'}
              </h4>
              <p className="text-[10px] text-slate-500 dark:text-slate-400">
                {selectedDistrict ? `${selectedDistrict} জেলা নির্বাচিত` : 'বিভাগ ও জেলা নির্বাচন করুন'}
              </p>
            </div>
          </div>
          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-red-100 dark:bg-red-950 text-red-600 dark:text-red-400 font-bold">
            ৬৪ জেলা
          </span>
        </div>

        {/* Widget Body */}
        <div className="p-3 space-y-2.5">
          {/* Active District Status Pill */}
          {selectedDistrict && (
            <div className="flex items-center justify-between p-2 rounded-md bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-[11px]">
              <span className="font-bold text-emerald-800 dark:text-emerald-300 flex items-center gap-1 truncate">
                <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>{selectedDistrict} জেলা ({activeCount}টি সংবাদ)</span>
              </span>
              <button
                type="button"
                onClick={handleResetFilter}
                className="text-[10px] font-bold text-red-600 hover:text-red-700 hover:underline shrink-0 ml-1.5 cursor-pointer"
              >
                রিসেট ✕
              </button>
            </div>
          )}

          {/* 1. Division Selector Dropdown */}
          <div className="space-y-1">
            <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300">
              ১. বিভাগ নির্বাচন:
            </label>
            <select
              value={selectedDivision}
              onChange={(e) => handleDivisionChange(e.target.value)}
              className="w-full px-2.5 py-1.5 text-xs rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-red-500 font-solaiman cursor-pointer"
            >
              {BANGLADESH_DIVISIONS.map((div) => (
                <option key={div.nameBn} value={div.nameBn}>
                  {div.nameBn} বিভাগ ({div.districts.length} জেলা)
                </option>
              ))}
            </select>
          </div>

          {/* 2. District Selector Dropdown */}
          <div className="space-y-1">
            <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300">
              ২. জেলা নির্বাচন:
            </label>
            <select
              value={tempDistrict}
              onChange={(e) => {
                setTempDistrict(e.target.value);
                onSelectDistrict(e.target.value);
              }}
              className="w-full px-2.5 py-1.5 text-xs rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-red-500 font-solaiman cursor-pointer"
            >
              {currentDistricts.map((dist) => {
                const count = getDistrictArticleCount(dist.nameBn);
                return (
                  <option key={dist.nameBn} value={dist.nameBn}>
                    {dist.nameBn} {count > 0 ? `(${count}টি খবর)` : ''}
                  </option>
                );
              })}
            </select>
          </div>

          {/* 3. Quick Action Buttons */}
          <div className="pt-1 flex items-center gap-2">
            <button
              type="button"
              onClick={() => handleApplyFilter(tempDistrict)}
              className="flex-1 py-1.5 px-3 rounded-md bg-red-600 hover:bg-red-700 text-white text-xs font-bold font-solaiman flex items-center justify-center gap-1.5 shadow-2xs transition-all cursor-pointer active:scale-95"
            >
              <MapPin className="w-3 h-3" />
              <span>{tempDistrict} জেলার খবর দেখুন</span>
              <ChevronRight className="w-3 h-3" />
            </button>
            {selectedDistrict && (
              <button
                type="button"
                onClick={handleResetFilter}
                className="py-1.5 px-2.5 rounded-md bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 text-xs font-bold text-slate-700 dark:text-slate-200 transition-colors cursor-pointer"
                title="সকল খবর দেখুন"
              >
                ✕
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div 
      className={`w-full font-solaiman transition-all duration-200 ${className} ${
        darkMode ? 'text-slate-100' : 'text-slate-800'
      }`}
    >
      {/* ================= VARIANT: INLINE BANNER (BROADSHEET NEWSPAPER STYLE) ================= */}
      <div 
        className={`rounded-xl border shadow-sm overflow-hidden transition-all duration-300 ${
          darkMode 
            ? 'bg-[#151c24] border-slate-800' 
            : 'bg-gradient-to-r from-red-50/70 via-white to-amber-50/40 border-slate-200'
        }`}
      >
        {/* Banner Bar Header */}
        <div className="p-3.5 sm:p-4.5 flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-200/80 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-red-600/20">
              <MapPin className="w-5 h-5 animate-pulse" />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <span>{lang === 'bn' ? 'নিজ জেলার নিউজ দেখুন' : 'View Local News by District'}</span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-red-100 dark:bg-red-950 text-red-600 dark:text-red-400 font-bold uppercase">
                    ৬৪ জেলা
                  </span>
                </h3>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {selectedDistrict ? (
                  <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-bold">
                    <Check className="w-3.5 h-3.5" />
                    <span>বর্তমানে <strong>{selectedDistrict}</strong> জেলার সংবাদ প্রদর্শিত হচ্ছে ({activeCount}টি সংবাদ)</span>
                  </span>
                ) : (
                  <span>বিভাগ ও জেলা নির্বাচন করে সরাসরি আপনার এলাকার সর্বশেষ খবর জানুন</span>
                )}
              </p>
            </div>
          </div>

          {/* Action and Status Area */}
          <div className="flex items-center gap-2 self-start md:self-auto">
            {selectedDistrict ? (
              <div className="flex items-center gap-2">
                <span className="text-xs px-3 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 font-bold flex items-center gap-1.5 shadow-2xs">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping inline-block" />
                  <span>{selectedDistrict} জেলা ফিল্টার সক্রিয়</span>
                </span>

                <button
                  onClick={handleResetFilter}
                  className="px-3 py-1.5 bg-slate-200 dark:bg-slate-700 hover:bg-red-600 hover:text-white rounded-lg text-xs font-bold transition-colors cursor-pointer flex items-center gap-1"
                  title="ফিল্টার রিসেট করুন"
                >
                  <X className="w-3.5 h-3.5" />
                  <span>রিসেট</span>
                </button>

                <button
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer flex items-center gap-1"
                >
                  <Filter className="w-3.5 h-3.5" />
                  <span>জেলা পরিবর্তন</span>
                </button>
              </div>
            ) : (
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow-xs ${
                  isExpanded 
                    ? 'bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-white'
                    : 'bg-red-600 hover:bg-red-700 text-white'
                }`}
              >
                <Filter className="w-3.5 h-3.5" />
                <span>{isExpanded ? 'প্যানেল গুটিয়ে নিন' : 'জেলা বাছাই করুন'}</span>
              </button>
            )}
          </div>
        </div>

        {/* Expandable Selector Controls */}
        {isExpanded && (
          <div className="p-4 sm:p-5 space-y-4 bg-white/70 dark:bg-[#121820]/90 border-t border-slate-100 dark:border-slate-800/80">
            {/* Division Selector Pills */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2 flex items-center justify-between">
                <span>১. বিভাগ নির্বাচন করুন (Select Division):</span>
                <span className="text-[11px] text-slate-400 font-mono">৮টি বিভাগ</span>
              </label>

              <div className="flex flex-wrap items-center gap-1.5">
                {BANGLADESH_DIVISIONS.map((div) => {
                  const isDivActive = selectedDivision === div.nameBn;
                  return (
                    <button
                      key={div.id}
                      type="button"
                      onClick={() => handleDivisionChange(div.nameBn)}
                      className={`px-3 py-1.5 text-xs rounded-lg font-bold transition-all cursor-pointer ${
                        isDivActive
                          ? 'bg-red-600 text-white shadow-xs scale-102 ring-2 ring-red-400/40'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                      }`}
                    >
                      <span>{div.nameBn}</span>
                      <span className="ml-1 text-[10px] opacity-75 font-mono">
                        ({div.districts.length})
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Dependent District Selector */}
            <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <label className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-red-600" />
                  <span>২. {selectedDivision} বিভাগের জেলাসমূহ (Select District):</span>
                </label>

                {/* Search within districts */}
                <div className="relative w-full sm:w-56">
                  <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="জেলা খুঁজুন..."
                    className="w-full pl-8 pr-2.5 py-1 text-xs rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#151c24] placeholder:text-slate-400"
                  />
                  {searchTerm && (
                    <button
                      onClick={() => setSearchTerm('')}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs"
                    >
                      ✕
                    </button>
                  )}
                </div>
              </div>

              {/* District Grid / Pills */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2 pt-1">
                {filteredDistricts.map((dist) => {
                  const isSelected = (selectedDistrict || tempDistrict) === dist.nameBn;
                  const count = getDistrictArticleCount(dist.nameBn);

                  return (
                    <button
                      key={dist.nameBn}
                      type="button"
                      onClick={() => {
                        setTempDistrict(dist.nameBn);
                        handleApplyFilter(dist.nameBn);
                      }}
                      className={`p-2 rounded-lg border text-left text-xs transition-all flex flex-col justify-between cursor-pointer group ${
                        isSelected
                          ? 'bg-red-600 border-red-600 text-white shadow-xs font-bold'
                          : 'bg-white dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 hover:border-red-400 dark:hover:border-red-600 text-slate-800 dark:text-slate-200'
                      }`}
                    >
                      <div className="flex items-center justify-between w-full">
                        <span className="font-bold truncate">{dist.nameBn}</span>
                        {isSelected && <Check className="w-3.5 h-3.5 text-white shrink-0 ml-1" />}
                      </div>

                      <div className="flex items-center justify-between mt-1 text-[10px]">
                        <span className={`${isSelected ? 'text-red-100' : 'text-slate-400 font-mono'}`}>
                          {dist.nameEn}
                        </span>
                        {count > 0 && (
                          <span className={`px-1.5 py-0.2 rounded font-bold ${
                            isSelected 
                              ? 'bg-white/20 text-white' 
                              : 'bg-red-50 dark:bg-red-950/60 text-red-600 dark:text-red-400'
                          }`}>
                            {count}টি
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>

              {filteredDistricts.length === 0 && (
                <div className="p-4 text-center text-xs text-slate-500">
                  '{searchTerm}' নামে {selectedDivision} বিভাগে কোনো জেলা পাওয়া যায়নি।
                </div>
              )}
            </div>

            {/* Quick Filter Confirm Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <div className="text-xs text-slate-500 dark:text-slate-400">
                নির্বাচিত অবস্থান: <strong className="text-slate-900 dark:text-white font-bold">{selectedDivision} বিভাগ ➔ {tempDistrict} জেলা</strong>
              </div>

              <div className="flex items-center gap-2">
                {selectedDistrict && (
                  <button
                    type="button"
                    onClick={handleResetFilter}
                    className="px-4 py-2 rounded-lg bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 text-xs font-bold transition-colors cursor-pointer"
                  >
                    সকল সংবাদ দেখুন (রিসেট)
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => handleApplyFilter(tempDistrict)}
                  className="px-5 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-red-600/20 transition-all cursor-pointer"
                >
                  <MapPin className="w-3.5 h-3.5" />
                  <span>{tempDistrict} জেলার খবর দেখুন</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
