import React from 'react';
import { FamilyMember } from '../../types/news';
import { Mail, Phone, Award, Users, ShieldCheck, Sparkles, Building2, Newspaper } from 'lucide-react';
import { useSiteConfig } from '../../context/SiteConfigContext';
import { groupFamilyMembersByTier, EDITORIAL_TIERS } from '../../utils/editorialHierarchy';

interface FamilySectionProps {
  familyMembers: FamilyMember[];
  darkMode: boolean;
  lang: 'bn' | 'en';
}

export const FamilySection: React.FC<FamilySectionProps> = ({
  familyMembers = [],
  darkMode,
  lang,
}) => {
  const { siteName, siteNameEn } = useSiteConfig();
  const tierGroups = groupFamilyMembersByTier(familyMembers);

  return (
    <div className="max-w-7xl mx-auto px-4 py-10 font-solaiman space-y-12">
      {/* Editorial Family Header */}
      <div className="text-center max-w-2xl mx-auto space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-100 dark:bg-red-950/60 text-red-600 dark:text-red-400 text-xs font-bold">
          <Award className="w-3.5 h-3.5" />
          <span>{lang === 'bn' ? 'আমাদের পরিবার (Our Editorial Family)' : 'Our Editorial Family'}</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
          {lang === 'bn' ? `${siteName} সংবাদ ও সম্পাদকীয় পরিবার` : `${siteNameEn} Editorial Team & Directory`}
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          {lang === 'bn' 
            ? 'যাঁদের নিরলস পরিশ্রমে প্রতিদিন বস্তুনিষ্ঠ, নির্ভীক ও সত্য সংবাদ পৌঁছে যায় কোটি পাঠকের কাছে।' 
            : 'The dedicated journalists, editors, and correspondents behind every published report.'}
        </p>
      </div>

      {/* 3-Tier Professional Hierarchical Directory */}
      <div className="space-y-10">
        {tierGroups.map((group) => {
          if (group.members.length === 0) return null;

          return (
            <div key={group.tier} className="space-y-4">
              {/* Hierarchical Tier Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-2.5 border-b-2 border-red-600/30 dark:border-red-600/20 gap-2">
                <div className="flex items-center gap-2.5">
                  <span className={`w-2.5 h-2.5 rounded-full ${
                    group.tier === 'tier_management' 
                      ? 'bg-red-600' 
                      : group.tier === 'tier_newsroom' 
                      ? 'bg-rose-600' 
                      : 'bg-slate-700'
                  }`} />
                  <div>
                    <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      <span>{group.config.titleBn}</span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold">
                        {group.members.length} জন
                      </span>
                    </h3>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      {group.config.descriptionBn}
                    </p>
                  </div>
                </div>

                <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
                  {group.config.titleEn}
                </div>
              </div>

              {/* Members Grid for this Tier */}
              <div className={`grid gap-4 sm:gap-6 ${
                group.tier === 'tier_management'
                  ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
                  : group.tier === 'tier_newsroom'
                  ? 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4'
                  : 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4'
              }`}>
                {group.members.map((member) => (
                  <div
                    key={member.id}
                    className={`rounded-xl border overflow-hidden transition-all news-card-hover hover:shadow-xl flex flex-col items-center text-center p-5 space-y-3 relative group ${
                      darkMode ? 'bg-[#1b222c] border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-900'
                    }`}
                  >
                    {/* Portrait Photo */}
                    <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-full overflow-hidden border-3 border-red-600/30 group-hover:border-red-600 shadow-md bg-slate-100 dark:bg-slate-800 transition-colors">
                      <img
                        src={member.photoUrl?.trim() || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80'}
                        alt={member.name}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>

                    {/* Member Details */}
                    <div className="space-y-1 w-full">
                      <h4 className="font-bold text-base text-slate-900 dark:text-white group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors truncate">
                        {member.name}
                      </h4>
                      <p className="text-xs font-semibold text-red-600 dark:text-red-400 line-clamp-1">
                        {member.designation}
                      </p>
                    </div>

                    {/* Contact Channels */}
                    <div className="w-full pt-2.5 border-t border-slate-100 dark:border-slate-800/80 space-y-1 text-xs text-slate-600 dark:text-slate-400">
                      {member.phone && (
                        <a 
                          href={`tel:${member.phone}`}
                          className="flex items-center justify-center gap-1.5 hover:text-red-600 transition-colors"
                          title="কল করুন"
                        >
                          <Phone className="w-3.5 h-3.5 text-red-600 shrink-0" />
                          <span className="font-latin">{member.phone}</span>
                        </a>
                      )}
                      {member.email && (
                        <a 
                          href={`mailto:${member.email}`}
                          className="flex items-center justify-center gap-1.5 truncate hover:text-red-600 transition-colors"
                          title="ইমেইল পাঠান"
                        >
                          <Mail className="w-3.5 h-3.5 text-red-600 shrink-0" />
                          <span className="truncate max-w-[180px]">{member.email}</span>
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
