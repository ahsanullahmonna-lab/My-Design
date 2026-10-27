import React, { useState } from 'react';
import { Play, Eye, Youtube, ChevronRight, X } from 'lucide-react';
import { VideoNewsItem } from '../../types/news';
import { getAdaptiveGridClass } from '../../utils/layoutFillers';

interface VideoGalleryProps {
  videoPosts: VideoNewsItem[];
  darkMode: boolean;
  lang: 'bn' | 'en';
}

export const VideoGallery: React.FC<VideoGalleryProps> = ({
  videoPosts,
  darkMode,
  lang,
}) => {
  const [activeVideo, setActiveVideo] = useState<VideoNewsItem | null>(null);

  if (!videoPosts || videoPosts.length === 0) return null;

  const gridClass = getAdaptiveGridClass(videoPosts.length, 4);

  // Extract YouTube embed URL safely
  const getEmbedUrl = (url: string) => {
    try {
      if (url.includes('embed/')) return url;
      const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
      const match = url.match(regExp);
      const videoId = match && match[2].length === 11 ? match[2] : 'dQw4w9WgXcQ';
      return `https://www.youtube.com/embed/${videoId}?autoplay=1`;
    } catch {
      return 'https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1';
    }
  };

  return (
    <section className="w-full max-w-7xl mx-auto px-4 my-10">
      {/* Header */}
      <div className="flex items-center justify-between border-b-2 border-red-600 pb-2 mb-5">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-6 bg-red-600 inline-block rounded-xs" />
          <h2 className="text-xl md:text-2xl font-bold font-solaiman text-slate-900 dark:text-white flex items-center gap-2">
            <Youtube className="w-5 h-5 text-red-600" />
            <span>{lang === 'bn' ? 'ভিডিও গ্যালারি (Video Gallery)' : 'Video & Social Media'}</span>
          </h2>
          <ChevronRight className="w-5 h-5 text-red-600" />
        </div>
        <span className="text-xs text-slate-500 font-solaiman hover:text-red-600 cursor-pointer">
          {lang === 'bn' ? 'ইউটিউব চ্যানেল' : 'YouTube Channel'} ({videoPosts.length}) →
        </span>
      </div>

      {/* Video Cards Grid */}
      <div className={`${gridClass} gap-5`}>
        {videoPosts.map((vid) => (
          <div
            key={vid.id}
            onClick={() => setActiveVideo(vid)}
            className="group cursor-pointer space-y-2.5 rounded-md overflow-hidden border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs news-card-hover transition-all duration-300 p-3"
          >
            <div className="relative aspect-16/10 rounded-md overflow-hidden bg-black shadow-xs">
              <img
                src={vid.thumbnailUrl || 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=800&q=80'}
                alt={vid.title}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover opacity-85 group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-11 h-11 rounded-full bg-red-600/90 text-white flex items-center justify-center shadow-lg group-hover:scale-115 transition-transform">
                  <Play className="w-5 h-5 fill-current ml-0.5" />
                </div>
              </div>
              {vid.duration && (
                <span className="absolute bottom-2 right-2 px-1.5 py-0.5 text-[10px] font-mono bg-black/80 text-white rounded">
                  {vid.duration}
                </span>
              )}
            </div>

            <div className="space-y-1">
              <h4 className="text-xs md:text-sm font-black font-solaiman leading-snug text-gray-950 dark:text-white group-hover:text-red-600 transition-colors line-clamp-2">
                {vid.title}
              </h4>
              <div className="flex items-center justify-between text-[11px] text-gray-700 dark:text-gray-300 font-medium font-solaiman pt-1">
                <span>{vid.date}</span>
                {vid.views && (
                  <span className="flex items-center gap-1">
                    <Eye className="w-3 h-3" />
                    <span>{vid.views}</span>
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Inline Video Player Modal */}
      {activeVideo && (
        <div 
          onClick={() => setActiveVideo(null)}
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-xs flex items-center justify-center p-4"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="max-w-4xl w-full bg-slate-950 text-white rounded-lg overflow-hidden border border-slate-800 shadow-2xl relative"
          >
            <div className="flex items-center justify-between p-3 border-b border-slate-800">
              <h4 className="font-bold text-sm truncate pr-4 text-white font-solaiman">
                {activeVideo.title}
              </h4>
              <button
                onClick={() => setActiveVideo(null)}
                className="w-7 h-7 rounded-full bg-slate-800 text-slate-300 hover:text-white hover:bg-red-600 flex items-center justify-center transition-colors shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="relative aspect-16/9 bg-black">
              <iframe
                src={getEmbedUrl(activeVideo.youtubeUrl)}
                title={activeVideo.title}
                className="w-full h-full border-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
