import React from 'react';
import { AdSlot } from '../../types/news';
import { ExternalLink } from 'lucide-react';

interface BannerAdProps {
  type: 'gree' | 'walton' | 'custom';
  darkMode: boolean;
  adSlots?: AdSlot[];
}

export const BannerAd: React.FC<BannerAdProps> = ({ type, darkMode, adSlots = [] }) => {
  // Check if there is an ad slot matching header_top or world_right
  const headerAd = adSlots.find(a => a.position === 'header_top');
  const worldAd = adSlots.find(a => a.position === 'world_right');

  if (type === 'gree') {
    // If header ad is explicitly disabled
    if (headerAd && !headerAd.isActive) return null;

    // If custom image is set for header_top (standard leaderboard dimension: 728x90 / responsive)
    if (headerAd && headerAd.imageUrl && headerAd.imageUrl.trim() !== '') {
      return (
        <div className="w-full max-w-7xl mx-auto px-4 my-4">
          <div className="w-full max-w-5xl mx-auto rounded-lg overflow-hidden border border-slate-200 dark:border-slate-800 shadow-xs bg-slate-50 dark:bg-slate-900">
            <div className="flex items-center justify-between px-3 py-1 bg-slate-100 dark:bg-slate-800 text-[10px] text-slate-500 font-solaiman">
              <span>বিজ্ঞাপন স্পনসর</span>
              <span className="font-bold">{headerAd.sponsorName || 'স্পন্সরড'}</span>
            </div>
            <a 
              href={headerAd.targetUrl || '#'} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="block w-full max-h-24 md:max-h-28 overflow-hidden flex items-center justify-center p-1"
            >
              <img 
                src={headerAd.imageUrl.trim()} 
                alt={headerAd.title} 
                className="w-full h-full max-w-full object-contain" 
              />
            </a>
          </div>
        </div>
      );
    }

    return (
      <div className="w-full max-w-7xl mx-auto px-4 my-6">
        <div className={`relative overflow-hidden rounded-md border p-3 md:p-4 flex flex-col md:flex-row items-center justify-between gap-4 shadow-xs transition-colors ${
          darkMode 
            ? 'bg-gradient-to-r from-sky-950 via-slate-900 to-sky-950 border-sky-900 text-white' 
            : 'bg-gradient-to-r from-sky-50 via-white to-blue-50 border-sky-200 text-slate-800'
        }`}>
          <div className="flex items-center gap-4">
            <div className="px-3 py-1.5 bg-blue-700 text-white font-black text-xl tracking-wider rounded font-latin">
              {headerAd?.sponsorName?.split(' ')[0] || 'GREE'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                  ONE STOP SOLUTION
                </span>
                <span className="text-[10px] bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 px-1.5 py-0.2 rounded uppercase">
                  AD
                </span>
              </div>
              <h3 className="text-sm md:text-base font-bold font-solaiman text-slate-900 dark:text-white mt-0.5">
                {headerAd?.title || 'হসপিটাল, হোটেল ও রেসিডেন্সিয়াল সেন্ট্রাল এসি সল্যুশন'}
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <span className="text-xs text-slate-500 dark:text-slate-400 block font-solaiman">দেশব্যাপী ফ্রি হোম ডেলিভারি ও ইন্সটলেশন</span>
              <span className="text-sm font-bold text-red-600 font-latin">Hotline: 16223</span>
            </div>
            <a 
              href={headerAd?.targetUrl || '#contact'} 
              target="_blank" 
              rel="noopener noreferrer"
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded shadow-xs transition-colors whitespace-nowrap flex items-center gap-1.5"
            >
              <span>বিস্তারিত জানুন</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      </div>
    );
  }

  // Walton Banner
  if (type === 'walton') {
    if (worldAd && !worldAd.isActive) return null;

    if (worldAd && worldAd.imageUrl && worldAd.imageUrl.trim() !== '') {
      return (
        <div className={`w-full max-w-[320px] mx-auto rounded-lg border p-2 text-center my-4 overflow-hidden shadow-xs ${
          darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
        }`}>
          <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1 px-1 font-solaiman">
            <span>বিজ্ঞাপন</span>
            <span className="font-bold text-blue-600">{worldAd.sponsorName || 'স্পন্সরড'}</span>
          </div>
          <a href={worldAd.targetUrl || '#'} target="_blank" rel="noopener noreferrer" className="block rounded-md overflow-hidden bg-slate-50 dark:bg-slate-900 aspect-[300/250] max-h-[250px] flex items-center justify-center p-1">
            <img src={worldAd.imageUrl.trim()} alt={worldAd.title} className="w-full h-full max-w-full max-h-full object-contain" />
          </a>
          <h4 className="text-xs font-bold font-solaiman text-slate-800 dark:text-slate-200 mt-2 px-1 text-left line-clamp-2">
            {worldAd.title}
          </h4>
        </div>
      );
    }

    return (
      <div className={`rounded-md border p-4 text-center my-4 overflow-hidden shadow-xs ${
        darkMode ? 'bg-slate-900 border-slate-800' : 'bg-gradient-to-b from-blue-50 to-white border-blue-200'
      }`}>
        <div className="flex items-center justify-between text-[10px] text-slate-400 mb-2 font-solaiman">
          <span>বিজ্ঞাপন</span>
          <span className="font-bold text-blue-600 font-latin">WALTON</span>
        </div>
        <div className="py-2">
          <span className="inline-block px-2.5 py-1 bg-blue-600 text-white text-xs font-bold rounded mb-2 font-latin">
            WALTON SMART FRIDGE
          </span>
          <h4 className="text-sm font-bold font-solaiman text-slate-900 dark:text-white">
            ইনভার্টার প্রযুক্তিতে বিদ্যুৎ সাশ্রয়ী স্মার্ট রেফ্রিজারেটর
          </h4>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-solaiman mt-1">
            ১০ বছরের কম্প্রেসার ওয়ারেন্টি
          </p>
        </div>
        <a 
          href={worldAd?.targetUrl || 'https://waltonbd.com'}
          target="_blank"
          rel="noopener noreferrer"
          className="block w-full mt-2 py-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded transition-colors font-solaiman"
        >
          অফার দেখুন
        </a>
      </div>
    );
  }

  return null;
};
