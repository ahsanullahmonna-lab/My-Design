import React, { useState, useEffect } from 'react';
import { 
  X, 
  ChevronLeft, 
  ChevronRight, 
  Share2, 
  Play, 
  Pause, 
  Sparkles, 
  Flame, 
  ExternalLink,
  BookOpen
} from 'lucide-react';
import { Article, PhotoCardItem } from '../../types/news';
import { useSiteConfig } from '../../context/SiteConfigContext';

interface WebStorySlide {
  id: string;
  title: string;
  caption: string;
  imageUrl: string;
  category: string;
  author: string;
  articleId?: string;
}

interface WebStoriesModalProps {
  isOpen: boolean;
  onClose: () => void;
  articles: Article[];
  photoPosts?: PhotoCardItem[];
  onSelectArticle: (article: Article) => void;
  darkMode: boolean;
  lang: 'bn' | 'en';
}

export const WebStoriesModal: React.FC<WebStoriesModalProps> = ({
  isOpen,
  onClose,
  articles,
  photoPosts = [],
  onSelectArticle,
  darkMode,
  lang,
}) => {
  const siteConfig = useSiteConfig();
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [progress, setProgress] = useState(0);

  // Compile Google Web Stories slides dynamically from articles and photos
  const slides: WebStorySlide[] = React.useMemo(() => {
    const storyList: WebStorySlide[] = [];

    // From Articles
    articles.slice(0, 8).forEach((art) => {
      storyList.push({
        id: `story-art-${art.id}`,
        title: art.title,
        caption: art.excerpt,
        imageUrl: art.imageUrl,
        category: art.category,
        author: art.author,
        articleId: art.id,
      });
    });

    // From Photo Posts
    photoPosts.slice(0, 4).forEach((p) => {
      storyList.push({
        id: `story-photo-${p.id}`,
        title: p.title,
        caption: p.caption || p.title,
        imageUrl: p.imageUrl,
        category: p.category || 'ফটোগ্যালারি',
        author: p.photographer || `${siteConfig.siteName} ফটোস্টোরি`,
      });
    });

    return storyList;
  }, [articles, photoPosts]);

  const activeSlide = slides[currentSlideIndex] || slides[0];

  // Auto-play progress bar
  useEffect(() => {
    if (!isOpen || !isPlaying) return;

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          setCurrentSlideIndex((curr) => (curr + 1) % slides.length);
          return 0;
        }
        return prev + 2; // ~5 seconds per slide
      });
    }, 100);

    return () => clearInterval(interval);
  }, [isOpen, isPlaying, slides.length, currentSlideIndex]);

  // Reset progress when changing slides manually
  const goToNextSlide = () => {
    setProgress(0);
    setCurrentSlideIndex((prev) => (prev + 1) % slides.length);
  };

  const goToPrevSlide = () => {
    setProgress(0);
    setCurrentSlideIndex((prev) => (prev - 1 + slides.length) % slides.length);
  };

  if (!isOpen || !activeSlide) return null;

  const currentArticle = articles.find((a) => a.id === activeSlide.articleId);

  return (
    <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 select-none">
      {/* Container simulating Google Web Stories 9:16 mobile canvas */}
      <div className="relative w-full max-w-[420px] h-[85vh] max-h-[820px] rounded-2xl overflow-hidden shadow-2xl bg-black border border-slate-800 flex flex-col justify-between">
        
        {/* Background Full Cover Media */}
        <img
          src={activeSlide?.imageUrl?.trim() || 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?auto=format&fit=crop&w=800&q=80'}
          alt={activeSlide?.title || 'ওয়েব স্টোরি'}
          referrerPolicy="no-referrer"
          className="absolute inset-0 w-full h-full object-cover transition-opacity duration-300"
        />

        {/* Gradient Scrim for readable broadsheet typography */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-transparent to-black/90 pointer-events-none" />

        {/* Top Story Progress Bars */}
        <div className="relative z-20 px-3 pt-3 flex items-center gap-1.5">
          {slides.map((_, idx) => (
            <div
              key={idx}
              className="flex-1 h-1 rounded-full bg-white/30 overflow-hidden cursor-pointer"
              onClick={() => {
                setCurrentSlideIndex(idx);
                setProgress(0);
              }}
            >
              <div
                className="h-full bg-white transition-all duration-100 ease-linear rounded-full"
                style={{
                  width: idx === currentSlideIndex ? `${progress}%` : idx < currentSlideIndex ? '100%' : '0%',
                }}
              />
            </div>
          ))}
        </div>

        {/* Top Header & Controls */}
        <div className="relative z-20 px-4 py-2 flex items-center justify-between text-white">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded bg-red-600 text-white font-solaiman text-[11px] font-bold shadow-xs">
              {activeSlide.category}
            </span>
            <span className="text-[11px] font-solaiman text-slate-300">
              {activeSlide.author}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="p-1.5 rounded-full bg-black/40 hover:bg-black/70 text-white backdrop-blur transition-colors"
              title={isPlaying ? 'বিরতি দিন' : 'চালু করুন'}
            >
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-full bg-black/40 hover:bg-red-600 text-white backdrop-blur transition-colors"
              title="বন্ধ করুন"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Center Tap Navigation Zones */}
        <div className="relative z-10 flex-1 grid grid-cols-2">
          <div onClick={goToPrevSlide} className="h-full cursor-pointer" title="পূর্ববর্তী স্টোরি" />
          <div onClick={goToNextSlide} className="h-full cursor-pointer" title="পরবর্তী স্টোরি" />
        </div>

        {/* Bottom Story Content & Read Full Story CTA */}
        <div className="relative z-20 p-5 space-y-3">
          <div className="space-y-1.5">
            <h2 className="text-lg sm:text-xl font-bold font-solaiman text-white leading-snug drop-shadow-md">
              {activeSlide.title}
            </h2>
            <p className="text-xs font-solaiman text-slate-200 line-clamp-3 leading-relaxed drop-shadow-sm">
              {activeSlide.caption}
            </p>
          </div>

          {/* Swipe Up / Read More Button */}
          {currentArticle && (
            <button
              onClick={() => {
                onClose();
                onSelectArticle(currentArticle);
              }}
              className="w-full py-2.5 px-4 rounded-xl bg-red-600 hover:bg-red-700 text-white font-solaiman font-bold text-xs flex items-center justify-center gap-2 shadow-lg transition-transform hover:scale-102"
            >
              <BookOpen className="w-4 h-4" />
              <span>সম্পূর্ণ সংবাদটি পড়ুন →</span>
            </button>
          )}

          <div className="flex items-center justify-between text-[10px] text-slate-400 font-solaiman pt-1">
            <span>গুগল ওয়েব স্টোরিজ ফরম্যাট • {siteConfig.siteName}</span>
            <span>{currentSlideIndex + 1} / {slides.length}</span>
          </div>
        </div>

        {/* Left / Right arrow navigation indicators */}
        <button
          onClick={goToPrevSlide}
          className="absolute left-2 top-1/2 -translate-y-1/2 z-20 p-2 rounded-full bg-black/30 hover:bg-black/60 text-white transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <button
          onClick={goToNextSlide}
          className="absolute right-2 top-1/2 -translate-y-1/2 z-20 p-2 rounded-full bg-black/30 hover:bg-black/60 text-white transition-colors"
        >
          <ChevronRight className="w-5 h-5" />
        </button>

      </div>
    </div>
  );
};
