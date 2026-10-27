import React from 'react';
import { specialFeaturedCards } from '../data/mockNewsData';

interface SpecialCardsProps {
  darkMode: boolean;
  onSelectTitle: (title: string) => void;
}

export const SpecialCards: React.FC<SpecialCardsProps> = ({ darkMode, onSelectTitle }) => {
  return (
    <section className="w-full max-w-7xl mx-auto px-4 my-8">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {specialFeaturedCards.map((card) => (
          <div
            key={card.id}
            onClick={() => onSelectTitle(card.title)}
            className="group relative overflow-hidden rounded-md cursor-pointer aspect-16/9 sm:aspect-4/3 bg-slate-900 shadow-sm hover:shadow-xl border border-slate-200 dark:border-slate-800 transition-all duration-300 hover:-translate-y-1"
          >
            {/* Background Graphic with Ken Burns Effect */}
            <img
              src={card.imageUrl?.trim() || 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?auto=format&fit=crop&w=800&q=80'}
              alt={card.title}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover media-kenburns opacity-80"
            />
            {/* Gradient Scrim */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/55 to-black/10 transition-opacity duration-300 group-hover:opacity-90" />

            {/* Top Category Badge */}
            <div className="absolute top-3.5 left-3.5">
              <span className={`px-2.5 py-1 text-xs font-bold font-bangla text-white rounded-sm shadow-xs ${card.badgeColor}`}>
                {card.categoryName}
              </span>
            </div>

            {/* Bottom Content */}
            <div className="absolute bottom-3.5 left-3.5 right-3.5 space-y-1.5">
              <h3 className="text-sm md:text-base font-bold font-bangla text-white leading-snug line-clamp-2 group-hover:text-amber-300 transition-colors">
                {card.title}
              </h3>
              <p className="text-xs text-slate-300 font-bangla line-clamp-1 leading-relaxed">
                {card.excerpt}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
