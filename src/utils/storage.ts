import { Article, CategoryItem, SiteSettings, AdSlot, TickerItem, VideoNewsItem } from '../types/news';
import { initialArticles, initialCategories, initialSettings } from '../data/mockNewsData';
import { getEditorialImage } from './newsImageGenerator';

const STORAGE_KEYS = {
  ARTICLES: 'kolom24_articles_v2',
  CATEGORIES: 'kolom24_categories_v2',
  SETTINGS: 'kolom24_settings_v2',
  ADS: 'kolom24_ads_v2',
  TICKER: 'kolom24_ticker_v2',
  VIDEOS: 'kolom24_videos_v2',
};

export const defaultAds: AdSlot[] = [
  {
    id: 'ad-header',
    title: 'শীর্ষ ব্যানার বিজ্ঞাপন',
    position: 'header_top',
    size: '728x90',
    type: 'banner',
    imageUrl: 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?auto=format&fit=crop&w=800&q=80',
    targetUrl: '#',
    isActive: true,
    sponsorName: 'স্পন্সর পার্টনার',
  },
  {
    id: 'ad-hero-right',
    title: 'হিরো সেকশন সাইডবার অ্যাড',
    position: 'hero_right',
    size: '300x250',
    type: 'banner',
    imageUrl: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=600&q=80',
    targetUrl: 'https://gree.com.bd',
    isActive: true,
    sponsorName: 'GREE AC',
  },
  {
    id: 'ad-politics-right',
    title: 'রাজনীতি সেকশন সাইডবার অ্যাড',
    position: 'politics_right',
    size: '300x250',
    type: 'banner',
    imageUrl: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=600&q=80',
    targetUrl: 'https://waltonbd.com',
    isActive: true,
    sponsorName: 'WALTON Smart',
  },
  {
    id: 'ad-world-right',
    title: 'বিশ্ব সেকশন সাইডবার অ্যাড (Walton)',
    position: 'world_right',
    size: '300x250',
    type: 'banner',
    imageUrl: 'https://images.unsplash.com/photo-1571175443880-49e1d25b2bc5?auto=format&fit=crop&w=600&q=80',
    targetUrl: 'https://waltonbd.com',
    isActive: true,
    sponsorName: 'WALTON Smart Fridge',
  },
];

export const defaultTickerItems: TickerItem[] = [
  {
    id: 'tick-1',
    text: 'লিফট শুধু আমাদের জন্যই নয়: আদালতে সাবেক আইসিটি প্রতিমন্ত্রী জুনাইদ আহমেদ পলক',
    isActive: true,
    timeAgo: '২৫ মিনিট আগে',
  },
  {
    id: 'tick-2',
    text: 'চট্টগ্রামে শেখ হাসিনাসহ ১৯৭ জনের বিরুদ্ধে করা হত্যা মামলা প্রত্যাহার',
    isActive: true,
    timeAgo: '১ ঘণ্টা আগে',
  },
  {
    id: 'tick-3',
    text: "বাস্তবে মন্ত্রীর মর্যাদা পেলেন সিনেমার 'মিনিস্টার ফাটাকেষ্ট'",
    isActive: true,
    timeAgo: '২ ঘণ্টা আগে',
  },
  {
    id: 'tick-4',
    text: 'নয়াদিল্লিতে বাংলাদেশ-ভারত যৌথ ওয়ার্কিং গ্রুপের ১৯তম বৈঠক শুরু',
    isActive: true,
    timeAgo: '৩ ঘণ্টা আগে',
  },
  {
    id: 'tick-5',
    text: 'সোনার দাম আরও কমলো, ভরিপ্রতি ২ হাজার টাকা হ্রাস পেল বাজুস সিদ্ধান্তে',
    isActive: true,
    timeAgo: '৪ ঘণ্টা আগে',
  },
];

export const defaultVideos: VideoNewsItem[] = [
  {
    id: 'vid-1',
    title: 'আদালত চত্বরে জুনাইদ আহমেদ পলকের বক্তব্য ও শুনানির বিশেষ ভিডিও',
    youtubeId: 'kJQP7kiw5Fk',
    youtubeUrl: 'https://www.youtube.com/watch?v=kJQP7kiw5Fk',
    thumbnailUrl: getEditorialImage('courtroom'),
    duration: '০৩:৪৫',
    views: '১ লাখ ২৫ হাজার',
    date: '৮ অক্টোবর ২০২৬',
  },
  {
    id: 'vid-2',
    title: 'নয়াদিল্লিতে বাংলাদেশ-ভারত বৈঠক শেষে দুই দেশের যৌথ সংবাদ সম্মেলন',
    youtubeId: 'fJ9rUzIMcZQ',
    youtubeUrl: 'https://www.youtube.com/watch?v=fJ9rUzIMcZQ',
    thumbnailUrl: getEditorialImage('summit'),
    duration: '০৫:১২',
    views: '৮৫ হাজার',
    date: '৮ অক্টোবর ২০২৬',
  },
  {
    id: 'vid-3',
    title: "বাস্তবে মন্ত্রীর মর্যাদা পেলেন সিনেমার 'মিনিস্টার ফাটাকেষ্ট': বিশেষ সাক্ষাৎকার",
    youtubeId: '9bZkp7q19f0',
    youtubeUrl: 'https://www.youtube.com/watch?v=9bZkp7q19f0',
    thumbnailUrl: getEditorialImage('cinema'),
    duration: '০৮:২০',
    views: '২ লাখ ২০ হাজার',
    date: '৮ অক্টোবর ২০২৬',
  },
  {
    id: 'vid-4',
    title: 'তিস্তা নদীর ন্যায্য হিস্যা আদায়ে উত্তরের মানুষের পদযাত্রা',
    youtubeId: 'RgKAFK5djSk',
    youtubeUrl: 'https://www.youtube.com/watch?v=RgKAFK5djSk',
    thumbnailUrl: getEditorialImage('water'),
    duration: '০৪:১৫',
    views: '৯৪ হাজার',
    date: '৮ অক্টোবর ২০২৬',
  },
];

// Helper to get from storage safely
export function getStorageData<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch (e) {
    return fallback;
  }
}

// Helper to set storage safely
export function setStorageData<T>(key: string, data: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    console.error('Failed to save to localStorage:', e);
  }
}

export const StorageService = {
  getArticles: (): Article[] => getStorageData(STORAGE_KEYS.ARTICLES, initialArticles),
  saveArticles: (articles: Article[]) => setStorageData(STORAGE_KEYS.ARTICLES, articles),

  getCategories: (): CategoryItem[] => getStorageData(STORAGE_KEYS.CATEGORIES, initialCategories),
  saveCategories: (categories: CategoryItem[]) => setStorageData(STORAGE_KEYS.CATEGORIES, categories),

  getSettings: (): SiteSettings => getStorageData(STORAGE_KEYS.SETTINGS, initialSettings),
  saveSettings: (settings: SiteSettings) => setStorageData(STORAGE_KEYS.SETTINGS, settings),

  getAds: (): AdSlot[] => getStorageData(STORAGE_KEYS.ADS, defaultAds),
  saveAds: (ads: AdSlot[]) => setStorageData(STORAGE_KEYS.ADS, ads),

  getTickers: (): TickerItem[] => getStorageData(STORAGE_KEYS.TICKER, defaultTickerItems),
  saveTickers: (tickers: TickerItem[]) => setStorageData(STORAGE_KEYS.TICKER, tickers),

  getVideos: (): VideoNewsItem[] => getStorageData(STORAGE_KEYS.VIDEOS, defaultVideos),
  saveVideos: (videos: VideoNewsItem[]) => setStorageData(STORAGE_KEYS.VIDEOS, videos),

  resetAll: () => {
    try {
      localStorage.removeItem(STORAGE_KEYS.ARTICLES);
      localStorage.removeItem(STORAGE_KEYS.CATEGORIES);
      localStorage.removeItem(STORAGE_KEYS.SETTINGS);
      localStorage.removeItem(STORAGE_KEYS.ADS);
      localStorage.removeItem(STORAGE_KEYS.TICKER);
      localStorage.removeItem(STORAGE_KEYS.VIDEOS);
      window.location.reload();
    } catch (e) {
      // ignore
    }
  },

  exportBackup: () => {
    return {
      articles: StorageService.getArticles(),
      categories: StorageService.getCategories(),
      settings: StorageService.getSettings(),
      ads: StorageService.getAds(),
      tickers: StorageService.getTickers(),
      videos: StorageService.getVideos(),
      exportedAt: new Date().toISOString(),
    };
  },

  importBackup: (backup: any) => {
    if (backup.articles) StorageService.saveArticles(backup.articles);
    if (backup.categories) StorageService.saveCategories(backup.categories);
    if (backup.settings) StorageService.saveSettings(backup.settings);
    if (backup.ads) StorageService.saveAds(backup.ads);
    if (backup.tickers) StorageService.saveTickers(backup.tickers);
    if (backup.videos) StorageService.saveVideos(backup.videos);
  }
};
