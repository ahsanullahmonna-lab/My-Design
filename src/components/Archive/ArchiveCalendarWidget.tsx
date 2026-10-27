import React, { useState, useMemo } from 'react';
import { 
  Calendar as CalendarIcon, 
  ChevronLeft, 
  ChevronRight, 
  Sparkles, 
  Clock, 
  BookOpen, 
  Check, 
  RotateCcw,
  Search
} from 'lucide-react';
import { Article } from '../../types/news';

interface ArchiveCalendarWidgetProps {
  articles: Article[];
  onSelectDate: (dateStr: string, matchedArticles: Article[]) => void;
  darkMode: boolean;
  selectedDate?: string | null;
}

const BANGLA_DIGITS = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
const BANGLA_MONTHS = [
  'জানুয়ারি', 'ফেব্রুয়ারি', 'মার্চ', 'এপ্রিল', 'মে', 'জুন', 
  'জুলাই', 'আগস্ট', 'সেপ্টেম্বর', 'অক্টোবর', 'নভেম্বর', 'ডিসেম্বর'
];
const BANGLA_WEEKDAYS = ['শনি', 'রবি', 'সোম', 'মঙ্গল', 'বুধ', 'বৃহঃ', 'শুক্র'];

export const toBanglaNumber = (num: number | string): string => {
  return num
    .toString()
    .split('')
    .map((char) => BANGLA_DIGITS[parseInt(char, 10)] ?? char)
    .join('');
};

/**
 * Format a Date to YYYY-MM-DD
 */
export const formatDateKey = (d: Date): string => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
};

export const ArchiveCalendarWidget: React.FC<ArchiveCalendarWidgetProps> = ({
  articles,
  onSelectDate,
  darkMode,
  selectedDate,
}) => {
  // Current visible month/year in the calendar view
  // Default to October 2026 (matching system date context)
  const [viewDate, setViewDate] = useState<Date>(() => new Date(2026, 9, 8));

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();

  // Map articles by their date string (YYYY-MM-DD)
  const articlesByDate = useMemo(() => {
    const map = new Map<string, Article[]>();

    articles.forEach((art) => {
      // Check publishedAt or convert date string
      let dateKey = '';
      if (art.publishedAt) {
        dateKey = art.publishedAt.slice(0, 10);
      } else if (art.date) {
        // Parse date e.g. "৮ অক্টোবর ২০২৬" or ISO
        if (/^\d{4}-\d{2}-\d{2}/.test(art.date)) {
          dateKey = art.date.slice(0, 10);
        } else {
          // Default mock date corresponds to 2026-10-08
          dateKey = '2026-10-08';
        }
      }

      if (dateKey) {
        const list = map.get(dateKey) || [];
        list.push(art);
        map.set(dateKey, list);
      }
    });

    return map;
  }, [articles]);

  // Navigate Months
  const handlePrevMonth = () => {
    setViewDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setViewDate(new Date(year, month + 1, 1));
  };

  const handleToday = () => {
    const today = new Date(2026, 9, 8);
    setViewDate(today);
    handleDateClick(formatDateKey(today));
  };

  const handleYesterday = () => {
    const yest = new Date(2026, 9, 7);
    setViewDate(yest);
    handleDateClick(formatDateKey(yest));
  };

  // Generate Calendar Days for this Month
  // Note: Saturday is 6 in JS Date (0 is Sunday, 6 is Saturday)
  // Bengali week starts on Saturday (শনি = index 0)
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayJs = new Date(year, month, 1).getDay(); // 0 = Sun, 6 = Sat
  // Convert JS Sunday=0 to Saturday=0: Sat(6)->0, Sun(0)->1, Mon(1)->2, ... Fri(5)->6
  const startDayOffset = (firstDayJs + 1) % 7;

  const calendarDays = useMemo(() => {
    const days: (number | null)[] = [];
    for (let i = 0; i < startDayOffset; i++) {
      days.push(null);
    }
    for (let d = 1; d <= daysInMonth; d++) {
      days.push(d);
    }
    return days;
  }, [daysInMonth, startDayOffset]);

  const handleDateClick = (key: string) => {
    const matched = articlesByDate.get(key) || [];
    // If no articles exactly on that date, still pass empty or nearest articles
    onSelectDate(key, matched);
  };

  return (
    <div
      className={`rounded-xl border p-4 shadow-sm transition-all font-solaiman ${
        darkMode
          ? 'bg-[#151c24] border-slate-800 text-slate-100'
          : 'bg-white border-slate-200 text-slate-900'
      }`}
    >
      {/* Header with Title & Live Badge */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-red-600 text-white flex items-center justify-center shadow-xs">
            <CalendarIcon className="w-3.5 h-3.5" />
          </div>
          <div>
            <h4 className="font-bold text-sm leading-tight flex items-center gap-1.5">
              <span>পুরোনো সংবাদ আর্কাইভ</span>
            </h4>
            <span className="text-[10px] text-slate-500 dark:text-slate-400">ক্যালেন্ডার ফিল্টার</span>
          </div>
        </div>

        <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-red-100 dark:bg-red-950/60 text-red-600 dark:text-red-400">
          আর্কাইভ
        </span>
      </div>

      {/* Month Navigation Bar */}
      <div className="flex items-center justify-between py-2.5">
        <button
          type="button"
          onClick={handlePrevMonth}
          className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors"
          title="পূর্ববর্তী মাস"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        <div className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-1.5">
          <span>{BANGLA_MONTHS[month]}</span>
          <span>{toBanglaNumber(year)}</span>
        </div>

        <button
          type="button"
          onClick={handleNextMonth}
          className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors"
          title="পরবর্তী মাস"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Weekday Labels (Saturday to Friday) */}
      <div className="grid grid-cols-7 gap-1 text-center text-[11px] font-bold text-slate-500 dark:text-slate-400 pb-1">
        {BANGLA_WEEKDAYS.map((w, idx) => (
          <div
            key={idx}
            className={`py-1 ${idx === 6 ? 'text-red-500 dark:text-red-400' : ''}`}
          >
            {w}
          </div>
        ))}
      </div>

      {/* Days Grid */}
      <div className="grid grid-cols-7 gap-1 text-center text-xs">
        {calendarDays.map((d, idx) => {
          if (d === null) {
            return <div key={`empty-${idx}`} className="h-8" />;
          }

          const currentKey = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
          const isSelected = selectedDate === currentKey;
          const matchedCount = articlesByDate.get(currentKey)?.length || 0;
          const hasArticles = matchedCount > 0;
          const isToday = year === 2026 && month === 9 && d === 8; // Today reference

          return (
            <button
              key={`day-${d}`}
              type="button"
              onClick={() => handleDateClick(currentKey)}
              className={`h-8 rounded-lg flex flex-col items-center justify-center relative transition-all text-xs font-semibold group ${
                isSelected
                  ? 'bg-red-600 text-white font-bold shadow-xs scale-105 z-10'
                  : isToday
                  ? 'border-2 border-red-600 text-red-600 dark:text-red-400 font-bold bg-red-50/50 dark:bg-red-950/20'
                  : hasArticles
                  ? 'hover:bg-red-50 dark:hover:bg-red-950/40 text-slate-900 dark:text-slate-100 font-bold'
                  : 'hover:bg-slate-100 dark:hover:bg-slate-800/60 text-slate-600 dark:text-slate-400'
              }`}
              title={`${toBanglaNumber(d)} ${BANGLA_MONTHS[month]} ${toBanglaNumber(year)}${hasArticles ? ` (${toBanglaNumber(matchedCount)}টি সংবাদ)` : ''}`}
            >
              <span>{toBanglaNumber(d)}</span>

              {/* Indicator Dot for Days with News */}
              {hasArticles && !isSelected && (
                <span className="w-1 h-1 rounded-full bg-red-600 dark:bg-red-400 absolute bottom-1" />
              )}
            </button>
          );
        })}
      </div>

      {/* Quick Jump Shortcuts */}
      <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between gap-1 text-[11px]">
        <button
          type="button"
          onClick={handleToday}
          className="px-2 py-1 rounded bg-slate-100 dark:bg-slate-800 hover:bg-red-50 dark:hover:bg-red-950 hover:text-red-600 text-slate-700 dark:text-slate-300 font-bold transition-colors"
        >
          আজকের পত্রিকা
        </button>
        <button
          type="button"
          onClick={handleYesterday}
          className="px-2 py-1 rounded bg-slate-100 dark:bg-slate-800 hover:bg-red-50 dark:hover:bg-red-950 hover:text-red-600 text-slate-700 dark:text-slate-300 font-bold transition-colors"
        >
          গতকালকের সংবাদ
        </button>
        <button
          type="button"
          onClick={() => {
            // Select all for current month
            onSelectDate(`${year}-${String(month + 1).padStart(2, '0')}`, articles);
          }}
          className="px-2 py-1 rounded bg-slate-100 dark:bg-slate-800 hover:bg-red-50 dark:hover:bg-red-950 hover:text-red-600 text-slate-700 dark:text-slate-300 font-bold transition-colors"
        >
          এই মাস
        </button>
      </div>
    </div>
  );
};
