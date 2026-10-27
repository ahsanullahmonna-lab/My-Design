import { EditorialTier, FamilyMember } from '../types/news';

export interface TierConfig {
  key: EditorialTier;
  titleBn: string;
  titleEn: string;
  descriptionBn: string;
  order: number;
  badgeColor: string;
}

export const EDITORIAL_TIERS: Record<EditorialTier, TierConfig> = {
  tier_management: {
    key: 'tier_management',
    titleBn: '১. শীর্ষ ব্যবস্থাপনা ও নীতিনির্ধারক পর্ষদ',
    titleEn: 'Top Management & Editorial Board',
    descriptionBn: 'প্রধান সম্পাদক, প্রকাশক, ভারপ্রাপ্ত সম্পাদক ও নীতিনির্ধারক পরিচালনা পর্ষদ',
    order: 1,
    badgeColor: 'bg-red-600 text-white',
  },
  tier_newsroom: {
    key: 'tier_newsroom',
    titleBn: '২. নিউজ রুম ও ডেস্ক এডিটর পর্ষদ',
    titleEn: 'News Room & Desk Editors',
    descriptionBn: 'বার্তা সম্পাদক, সহকারী বার্তা সম্পাদক, জ্যেষ্ঠ সহ-সম্পাদক ও বিভাগীয় সম্পাদকবৃন্দ',
    order: 2,
    badgeColor: 'bg-rose-700 text-white',
  },
  tier_reporting: {
    key: 'tier_reporting',
    titleBn: '৩. রিপোর্টিং ও ফিল্ড লেভেল পর্ষদ',
    titleEn: 'Reporting & Field Correspondents',
    descriptionBn: 'বিশেষ প্রতিনিধি, নিজস্ব প্রতিবেদক, জেলা-উপজেলা প্রতিনিধি ও নাগরিক সাংবাদিকবৃন্দ',
    order: 3,
    badgeColor: 'bg-slate-800 text-white',
  },
};

/**
 * Automatically classifies any journalistic or staff designation into the proper professional hierarchy tier
 */
export function determineEditorialTier(designation: string = ''): {
  tier: EditorialTier;
  tierNameBn: string;
  orderRank: number;
} {
  const d = designation.toLowerCase().trim();

  // 1. শীর্ষ ব্যবস্থাপনা ও নীতিনির্ধারক পর্ষদ (Top Management & Board)
  if (
    d.includes('প্রধান সম্পাদক') ||
    d.includes('editor-in-chief') ||
    d.includes('ব্যবস্থাপনা পরিচালক') ||
    d.includes('managing director') ||
    d.includes('প্রকাশক') ||
    d.includes('publisher') ||
    d.includes('ভারপ্রাপ্ত সম্পাদক') ||
    d.includes('acting editor') ||
    d.includes('নির্বাহী সম্পাদক') ||
    d.includes('executive editor') ||
    d.includes('উপদেষ্টা সম্পাদক') ||
    d.includes('পরিচালক')
  ) {
    return {
      tier: 'tier_management',
      tierNameBn: EDITORIAL_TIERS.tier_management.titleBn,
      orderRank: 10,
    };
  }

  // 2. নিউজ রুম ও ডেস্ক এডিটর পর্ষদ (News Room & Desk Editors)
  if (
    d.includes('বার্তা সম্পাদক') ||
    d.includes('news editor') ||
    d.includes('বার্তা প্রধান') ||
    d.includes('news head') ||
    d.includes('সহকারী বার্তা সম্পাদক') ||
    d.includes('assistant news editor') ||
    d.includes('সহ-সম্পাদক') ||
    d.includes('সাব-এডিটর') ||
    d.includes('sub-editor') ||
    d.includes('মাল্টিমিডিয়া') ||
    d.includes('সোশ্যাল মিডিয়া') ||
    d.includes('বিভাগীয় সম্পাদক') ||
    d.includes('ফিচার সম্পাদক') ||
    d.includes('ডেস্ক') ||
    d.includes('গ্রাফিক্স')
  ) {
    return {
      tier: 'tier_newsroom',
      tierNameBn: EDITORIAL_TIERS.tier_newsroom.titleBn,
      orderRank: 50,
    };
  }

  // 3. রিপোর্টিং ও ফিল্ড লেভেল পর্ষদ (Reporting & Field Level)
  return {
    tier: 'tier_reporting',
    tierNameBn: EDITORIAL_TIERS.tier_reporting.titleBn,
    orderRank: 100,
  };
}

/**
 * Organizes a flat list of family members into the 3 hierarchical tiers
 */
export function groupFamilyMembersByTier(members: FamilyMember[]): {
  tier: EditorialTier;
  config: TierConfig;
  members: FamilyMember[];
}[] {
  const groups: Record<EditorialTier, FamilyMember[]> = {
    tier_management: [],
    tier_newsroom: [],
    tier_reporting: [],
  };

  members.forEach((m) => {
    const tier = m.tier || determineEditorialTier(m.designation).tier;
    if (groups[tier]) {
      groups[tier].push(m);
    } else {
      groups.tier_reporting.push(m);
    }
  });

  // Sort each tier by order
  (Object.keys(groups) as EditorialTier[]).forEach((t) => {
    groups[t].sort((a, b) => (a.order || 999) - (b.order || 999));
  });

  return [
    { tier: 'tier_management', config: EDITORIAL_TIERS.tier_management, members: groups.tier_management },
    { tier: 'tier_newsroom', config: EDITORIAL_TIERS.tier_newsroom, members: groups.tier_newsroom },
    { tier: 'tier_reporting', config: EDITORIAL_TIERS.tier_reporting, members: groups.tier_reporting },
  ];
}
