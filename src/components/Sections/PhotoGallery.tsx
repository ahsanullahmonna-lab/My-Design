import React, { useState } from 'react';
import { Camera, Heart, Eye, ChevronRight, X, User, PlusCircle } from 'lucide-react';
import { PhotoCardItem } from '../../types/news';
import { getAdaptiveGridClass } from '../../utils/layoutFillers';

interface PhotoGalleryProps {
  photoPosts: PhotoCardItem[];
  darkMode: boolean;
  lang: 'bn' | 'en';
}

export const PhotoGallery: React.FC<PhotoGalleryProps> = ({
  photoPosts,
  darkMode,
  lang,
}) => {
  const [selectedPhoto, setSelectedPhoto] = useState<PhotoCardItem | null>(null);
  const [likes, setLikes] = useState<Record<string, number>>({});

  const handleLike = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setLikes((prev) => ({
      ...prev,
      [id]: (prev[id] || 0) + 1,
    }));
  };

  if (!photoPosts || photoPosts.length === 0) return null;

  const gridClass = getAdaptiveGridClass(photoPosts.length, 4);

  return (
    <section className="w-full max-w-7xl mx-auto px-4 my-10">
      {/* Header */}
      <div className="flex items-center justify-between border-b-2 border-red-600 pb-2 mb-5">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-6 bg-red-600 inline-block rounded-xs" />
          <h2 className="text-xl md:text-2xl font-bold font-solaiman text-slate-900 dark:text-white flex items-center gap-2">
            <Camera className="w-5 h-5 text-red-600" />
            <span>{lang === 'bn' ? 'ফটো গ্যালারী' : 'Photo Gallery'}</span>
          </h2>
          <ChevronRight className="w-5 h-5 text-red-600" />
        </div>
        <span className="text-xs text-slate-500 font-solaiman hover:text-red-600 cursor-pointer">
          {lang === 'bn' ? 'সব ছবি দেখুন' : 'All Photos'} ({photoPosts.length}) →
        </span>
      </div>

      {/* Dynamic Adaptive Grid */}
      <div className={`${gridClass} gap-5`}>
        {photoPosts.map((photo) => {
          const currentLikes = (photo.likes || 0) + (likes[photo.id] || 0);
          return (
            <div
              key={photo.id}
              onClick={() => setSelectedPhoto(photo)}
              className="group cursor-pointer rounded-md overflow-hidden border news-card-hover border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs hover:shadow-md transition-all space-y-2.5"
            >
              <div className="relative aspect-4/3 overflow-hidden bg-slate-100 dark:bg-slate-800">
                <img
                  src={photo.imageUrl?.trim() || 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80'}
                  alt={photo.title}
                  className="w-full h-full object-cover media-kenburns"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-80 group-hover:opacity-90 transition-opacity" />
                
                {photo.category && (
                  <span className="absolute top-2 left-2 px-2 py-0.5 rounded text-[10px] font-bold bg-red-600 text-white font-solaiman">
                    {photo.category}
                  </span>
                )}

                <button
                  onClick={(e) => handleLike(photo.id, e)}
                  className="absolute top-2 right-2 flex items-center gap-1 px-2 py-0.5 rounded-full bg-black/60 text-white text-[10px] font-mono hover:bg-red-600 transition-colors"
                >
                  <Heart className="w-3 h-3 fill-current text-rose-500" />
                  <span>{currentLikes}</span>
                </button>

                <div className="absolute bottom-2 inset-x-2 text-white">
                  <div className="flex items-center gap-1 text-[10px] text-slate-300">
                    <User className="w-3 h-3 text-red-400" />
                    <span>{photo.photographer || 'ফটোগ্রাফার'}</span>
                  </div>
                </div>
              </div>

              <div className="p-3 pt-0 space-y-1">
                <h4 className="text-xs md:text-sm font-black font-solaiman leading-snug text-gray-950 dark:text-white group-hover:text-red-600 transition-colors line-clamp-2">
                  {photo.title}
                </h4>
                {photo.caption && (
                  <p className="text-[11px] text-gray-800 dark:text-gray-200 font-medium font-solaiman line-clamp-2 leading-relaxed">
                    {photo.caption}
                  </p>
                )}
                <div className="text-[10px] text-gray-700 dark:text-gray-300 font-medium font-solaiman pt-1 border-t border-gray-100 dark:border-slate-800">
                  {photo.date}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Lightbox Modal when a photo is clicked */}
      {selectedPhoto && (
        <div 
          onClick={() => setSelectedPhoto(null)}
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-xs flex items-center justify-center p-4"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="max-w-4xl w-full bg-slate-900 text-white rounded-md overflow-hidden border news-card-hover border-slate-800 shadow-2xl relative"
          >
            <button
              onClick={() => setSelectedPhoto(null)}
              className="absolute top-3 right-3 z-10 w-8 h-8 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-red-600 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="relative aspect-16/10 max-h-[70vh] bg-black">
              <img
                src={selectedPhoto.imageUrl?.trim() || 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80'}
                alt={selectedPhoto.title}
                className="w-full h-full object-contain"
              />
            </div>

            <div className="p-4 space-y-2 bg-[#121820]">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span className="text-red-500 font-bold">{selectedPhoto.category || 'ফটোগ্যালারি'}</span>
                <span>ফটোগ্রাফার: {selectedPhoto.photographer} • {selectedPhoto.date}</span>
              </div>
              <h3 className="text-base md:text-lg font-bold text-white font-solaiman">
                {selectedPhoto.title}
              </h3>
              {selectedPhoto.caption && (
                <p className="text-xs text-slate-300 font-solaiman leading-relaxed">
                  {selectedPhoto.caption}
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
