import React from 'react';
import { ChevronRight, Clock } from 'lucide-react';
import { Article } from '../../types/news';
import { getAdaptiveGridClass } from '../../utils/layoutFillers';

interface MultiCategoryGridProps {
  articles: Article[];
  onSelectArticle: (article: Article) => void;
  darkMode: boolean;
  lang: 'bn' | 'en';
}

export const MultiCategoryGrid: React.FC<MultiCategoryGridProps> = ({
  articles,
  onSelectArticle,
  darkMode,
  lang,
}) => {
  const sections = [
    {
      name: 'রাজধানী',
      nameEn: 'Capital',
      article: articles.find(a => a.category === 'জাতীয়' || a.district === 'ঢাকা') || articles[0],
    },
    {
      name: 'সাক্ষাৎকার',
      nameEn: 'Interview',
      article: articles.find(a => a.id === 'art-pol-stack-4') || articles[1],
    },
    {
      name: 'দেশজুড়ে',
      nameEn: 'Districts',
      article: articles.find(a => a.category === 'দেশজুড়ে') || articles[2],
    },
    {
      name: 'বিশেষ প্রতিবেদন',
      nameEn: 'Special Report',
      article: articles.find(a => a.id === 'art-lead-1') || articles[3],
    },
    {
      name: 'অর্থ ও বাণিজ্য',
      nameEn: 'Economy',
      article: articles.find(a => a.category === 'অর্থ ও বাণিজ্য') || articles[4],
    },
    {
      name: 'আইন-আদালত',
      nameEn: 'Law & Court',
      article: articles.find(a => a.category === 'আইন-আদালত') || articles[0],
    },
    {
      name: 'পজিটিভ বাংলাদেশ',
      nameEn: 'Positive BD',
      article: articles.find(a => a.category === 'পজিটিভ বাংলাদেশ') || articles[5],
    },
    {
      name: 'স্বাস্থ্য',
      nameEn: 'Health',
      article: articles.find(a => a.category === 'স্বাস্থ্য') || articles[6],
    },
  ];

  const validSections = sections.filter(s => s.article);
  const gridClass = getAdaptiveGridClass(validSections.length, 4);

  return (
    <section className="w-full max-w-7xl mx-auto px-4 my-10">
      <div className={`${gridClass} gap-6`}>
        {sections.map((sec, idx) => {
          const art = sec.article;
          if (!art) return null;

          return (
            <div key={idx} className="space-y-3 pb-4 border-b border-slate-200 dark:border-slate-800">
              {/* Category Header */}
              <div className="flex items-center justify-between border-b border-red-600 pb-1">
                <div className="flex items-center gap-1.5 font-bold font-solaiman text-base text-gray-950 dark:text-white">
                  <span>{lang === 'bn' ? sec.name : sec.nameEn}</span>
                  <ChevronRight className="w-4 h-4 text-red-600" />
                </div>
              </div>

              {/* Card */}
              <div 
                onClick={() => onSelectArticle(art)}
                className="group cursor-pointer space-y-2 p-2 rounded-lg bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 hover:shadow-xs transition-shadow"
              >
                <div className="relative overflow-hidden rounded aspect-16/10 bg-slate-100 dark:bg-slate-800">
                  <img
                    src={art.imageUrl?.trim() || 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?auto=format&fit=crop&w=800&q=80'}
                    alt={art.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300"
                  />
                </div>
                <h4 className="text-xs md:text-sm font-bold font-solaiman leading-snug text-gray-950 dark:text-white group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors line-clamp-2">
                  {lang === 'bn' ? art.title : (art.titleEn || art.title)}
                </h4>
                <div className="flex items-center gap-2 text-[11px] text-gray-700 dark:text-gray-300 font-solaiman font-medium">
                  <Clock className="w-3 h-3 text-red-600" />
                  <span>{art.date}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
