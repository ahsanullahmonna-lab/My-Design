import React from 'react';
import { Newspaper, Send, TrendingUp, Sparkles, ArrowRight, ShieldCheck } from 'lucide-react';
import { useSiteConfig } from '../../context/SiteConfigContext';

interface SmartFillerAdCardProps {
  type?: 'epaper' | 'citizen' | 'trending' | 'sponsor';
  darkMode?: boolean;
  className?: string;
  onOpenEPaper?: () => void;
  onOpenCitizenNews?: () => void;
}

export const SmartFillerAdCard: React.FC<SmartFillerAdCardProps> = ({
  type = 'epaper',
  darkMode = false,
  className = '',
  onOpenEPaper,
  onOpenCitizenNews,
}) => {
  const { siteName, domain, contactEmail } = useSiteConfig();

  if (type === 'citizen') {
    return (
      <div
        onClick={onOpenCitizenNews}
        className={`p-4 rounded-lg border cursor-pointer flex flex-col justify-between transition-all duration-300 hover:shadow-md group ${
          darkMode
            ? 'bg-gradient-to-br from-slate-900 to-rose-950/40 border-rose-900/60 text-slate-100 hover:border-rose-700'
            : 'bg-gradient-to-br from-rose-50/80 to-red-50/60 border-red-200 text-slate-900 hover:border-red-400'
        } ${className}`}
      >
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-red-600 text-white font-solaiman uppercase tracking-wider">
              নাগরিক সাংবাদিকতা
            </span>
            <Send className="w-4 h-4 text-red-600 group-hover:translate-x-1 transition-transform" />
          </div>
          <h4 className="text-sm md:text-base font-bold font-solaiman leading-snug group-hover:text-red-600 transition-colors">
            আপনার এলাকার যে কোনো ঘটনা বা খবর পাঠান {siteName}-এ
          </h4>
          <p className="text-xs font-solaiman text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed">
            ছবি বা ভিডিও সহ তথ্য দিন। সম্পাদকীয় পর্যালোচনার পর আপনার নামে প্রকাশিত হবে।
          </p>
        </div>
        <div className="pt-3 mt-2 border-t border-red-200/60 dark:border-rose-900/40 flex items-center justify-between text-xs font-bold text-red-600 font-solaiman">
          <span>সংবাদ পাঠান</span>
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
        </div>
      </div>
    );
  }

  if (type === 'sponsor') {
    return (
      <div
        className={`p-4 rounded-lg border flex flex-col justify-between transition-all duration-300 hover:shadow-md group ${
          darkMode
            ? 'bg-gradient-to-br from-slate-900 to-indigo-950/40 border-indigo-900/60 text-slate-100 hover:border-indigo-700'
            : 'bg-gradient-to-br from-indigo-50/70 via-slate-50 to-blue-50/50 border-indigo-200 text-slate-900 hover:border-indigo-400'
        } ${className}`}
      >
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-600 text-white font-solaiman uppercase tracking-wider">
              বিজ্ঞাপন ও প্রচার
            </span>
            <Sparkles className="w-4 h-4 text-indigo-600 group-hover:rotate-12 transition-transform" />
          </div>
          <h4 className="text-sm md:text-base font-bold font-solaiman leading-snug group-hover:text-indigo-600 transition-colors">
            {siteName}-এ আপনার ব্র্যান্ড ও ব্যবসার বিজ্ঞাপন দিন
          </h4>
          <p className="text-xs font-solaiman text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed">
            ডিজিটাল প্ল্যাটফর্ম ও ই-পেপারে দেশ-বিদেশের লাখো সচেতন পাঠকের কাছে পৌঁছান বিশ্বস্ততার সাথে।
          </p>
        </div>
        <div className="pt-3 mt-2 border-t border-indigo-200/60 dark:border-indigo-900/40 flex items-center justify-between text-xs font-bold text-indigo-600 font-solaiman">
          <span>যোগাযোগ: {contactEmail || `ads@${domain}`}</span>
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
        </div>
      </div>
    );
  }

  if (type === 'trending') {
    return (
      <div
        className={`p-4 rounded-lg border flex flex-col justify-between transition-all duration-300 hover:shadow-md group cursor-pointer ${
          darkMode
            ? 'bg-gradient-to-br from-slate-900 to-amber-950/40 border-amber-900/60 text-slate-100 hover:border-amber-700'
            : 'bg-gradient-to-br from-amber-50/70 via-slate-50 to-orange-50/50 border-amber-200 text-slate-900 hover:border-amber-400'
        } ${className}`}
      >
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-600 text-white font-solaiman uppercase tracking-wider">
              শীর্ষ আলোচিত
            </span>
            <TrendingUp className="w-4 h-4 text-amber-600 group-hover:scale-110 transition-transform" />
          </div>
          <h4 className="text-sm md:text-base font-bold font-solaiman leading-snug group-hover:text-amber-600 transition-colors">
            {siteName} সম্পাদকীয় পছন্দ ও বিশেষ প্রতিবেদন
          </h4>
          <p className="text-xs font-solaiman text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed">
            রাজনীতি, অর্থনীতি, আন্তর্জাতিক ও সমাজ বিষয়ক বস্তুনিষ্ঠ বিশ্লেষণ পড়ুন আমাদের আর্কাইভে।
          </p>
        </div>
        <div className="pt-3 mt-2 border-t border-amber-200/60 dark:border-amber-900/40 flex items-center justify-between text-xs font-bold text-amber-600 font-solaiman">
          <span>বিশেষ সংবাদ পড়ুন</span>
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
        </div>
      </div>
    );
  }

  // Default: Broadsheet E-Paper digital edition card
  return (
    <div
      onClick={onOpenEPaper || (() => { window.location.hash = 'epaper'; })}
      className={`p-4 rounded-lg border cursor-pointer flex flex-col justify-between transition-all duration-300 hover:shadow-md group ${
        darkMode
          ? 'bg-gradient-to-br from-slate-900 to-slate-800 border-slate-700/80 text-slate-100 hover:border-red-600'
          : 'bg-gradient-to-br from-amber-50/60 via-slate-50 to-white border-slate-200 text-slate-900 hover:border-red-400'
      } ${className}`}
    >
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-gradient-to-r from-red-600 to-rose-600 text-white font-solaiman uppercase tracking-wider">
            ডিজিটাল ই-পেপার
          </span>
          <Newspaper className="w-4 h-4 text-amber-500 group-hover:rotate-6 transition-transform" />
        </div>
        <h4 className="text-sm md:text-base font-bold font-solaiman leading-snug group-hover:text-red-600 transition-colors">
          দৈনিক {siteName} ছাপা কাগজের হুবহু ডিজিটাল সংস্করণ পড়ুন
        </h4>
        <p className="text-xs font-solaiman text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed">
          গত ৭ দিনের মুদ্রিত ব্রডশিট পত্রিকা যে কোনো ডিভাইসে নিখুঁত রেজুলিউশনে বিনামূল্যে পড়ার সুযোগ।
        </p>
      </div>
      <div className="pt-3 mt-2 border-t border-slate-200/80 dark:border-slate-800 flex items-center justify-between text-xs font-bold text-red-600 font-solaiman">
        <span>ই-পেপার ব্রডশিট খুলুন</span>
        <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
      </div>
    </div>
  );
};
