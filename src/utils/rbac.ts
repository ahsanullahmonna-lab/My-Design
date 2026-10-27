import { Article, UserItem } from '../types/news';

export type StandardRole = 'admin' | 'editor' | 'master' | 'reporter' | 'user';

export interface RoleDefinition {
  key: StandardRole;
  nameBn: string;
  titleBn: string;
  descriptionBn: string;
  badge: string;
  badgeClass: string;
  allowedTabs: string[];
}

export const ROLE_DEFINITIONS: Record<StandardRole, RoleDefinition> = {
  admin: {
    key: 'admin',
    nameBn: 'সুপার অ্যাডমিন / এডমিন',
    titleBn: 'ভারপ্রাপ্ত সম্পাদক ও প্রধান প্রশাসক (Super Admin)',
    descriptionBn: 'সম্পূর্ণ সাইট সেটিংস, ব্যবহারকারী, বিজ্ঞাপন, অডিট লগ এবং সকল সংবাদের পূর্ণ প্রবেশাধিকার।',
    badge: 'SUPER ADMIN',
    badgeClass: 'bg-red-600 text-white',
    allowedTabs: [
      'dashboard',
      'news_desk',
      'homepage_control',
      'menu_builder',
      'family',
      'categories',
      'posts',
      'pending',
      'comments',
      'photos',
      'videos',
      'ads',
      'breaking',
      'users',
      'recruitment',
      'idcard_template',
      'idcard',
      'settings',
      'photocard',
      'quotes',
      'epaper_control',
      'print_control',
      'theme_typography',
      'audit',
      'migration',
    ],
  },
  master: {
    key: 'master',
    nameBn: 'মাস্টার / প্রতিনিধি সমন্বয়কারী',
    titleBn: 'মাস্টার এডিটর ও ডেলিগেটেড পোস্টার (Master Desk / Delegated Publisher)',
    descriptionBn: 'অনুমোদিত সাংবাদিক, জেলা প্রতিনিধি বা সাধারণ ব্যবহারকারীর পক্ষ থেকে সংবাদ তৈরি, অ্যাসাইন ও প্রকাশ করার ক্ষমতাপ্রাপ্ত।',
    badge: 'MASTER DESK',
    badgeClass: 'bg-indigo-600 text-white',
    allowedTabs: [
      'dashboard',
      'news_desk',
      'posts',
      'pending',
      'comments',
      'family',
      'photocard',
      'quotes',
    ],
  },
  editor: {
    key: 'editor',
    nameBn: 'নিউজ রুম এডিটর',
    titleBn: 'বার্তা প্রধান / নিউজ রুম এডিটর (News Desk Editor)',
    descriptionBn: 'নিউজ ডেস্ক, সংবাদ তৈরি, প্রকাশ, সম্পাদন ও ডিলিট এবং মডারেশনের ক্ষমতা (সাইট সেটিংস ও ব্যবহারকারী সংরক্ষিত)।',
    badge: 'NEWS EDITOR',
    badgeClass: 'bg-rose-600 text-white',
    allowedTabs: [
      'dashboard',
      'news_desk',
      'posts',
      'pending',
      'comments',
      'photos',
      'videos',
      'categories',
      'breaking',
      'family',
      'photocard',
      'quotes',
      'epaper_control',
      'print_control',
    ],
  },
  reporter: {
    key: 'reporter',
    nameBn: 'সাংবাদিক / স্টাফ রিপোর্টার',
    titleBn: 'স্টাফ রিপোর্টার / জেলা প্রতিনিধি (Journalist)',
    descriptionBn: 'শুধুমাত্র নিজের প্রোফাইলে সংবাদ তৈরি ও প্রকাশ করতে পারেন। অন্যের নাম নির্বাচন বা সংবাদ মুছে ফেলা সম্পূর্ণ নিষিদ্ধ।',
    badge: 'JOURNALIST',
    badgeClass: 'bg-blue-600 text-white',
    allowedTabs: [
      'posts',
    ],
  },
  user: {
    key: 'user',
    nameBn: 'সাধারণ ভিজিটর / পাঠক',
    titleBn: 'নাগরিক পাঠক / সাধারণ ভিজিটর (Normal / Guest User)',
    descriptionBn: 'নাগরিক সাংবাদিকতায় সংবাদ পাঠানো ও সংবাদের নিচে মন্তব্য করা (সম্পাদকীয় অনুমোদনের পর প্রকাশিত হবে)।',
    badge: 'GUEST VISITOR',
    badgeClass: 'bg-amber-600 text-white',
    allowedTabs: [],
  },
};

export function normalizeRole(role?: string): StandardRole {
  if (!role) return 'admin';
  const r = role.toLowerCase().trim();
  if (r.includes('admin') || r === 'superadmin' || r === 'super_admin' || r.includes('এডমিন') || r.includes('অ্যাডমিন')) return 'admin';
  if (r.includes('master') || r.includes('assistant') || r.includes('delegat') || r.includes('সহায়ক') || r.includes('সহায়ক') || r.includes('মাস্টার')) return 'master';
  if (r === 'editor' || r === 'newsdesk_editor' || r.includes('সম্পাদক')) return 'editor';
  if (r === 'reporter' || r === 'author' || r === 'journalist' || r === 'contributor' || r.includes('সাংবাদিক') || r.includes('রিপোর্টার')) return 'reporter';
  return 'user';
}

export function getRoleMeta(role?: string): RoleDefinition {
  const normalized = normalizeRole(role);
  return ROLE_DEFINITIONS[normalized];
}

/**
 * RBAC Permission: Can user access the Admin Panel at all?
 */
export function canAccessAdmin(role?: string): boolean {
  const norm = normalizeRole(role);
  return norm === 'admin' || norm === 'editor' || norm === 'master' || norm === 'reporter';
}

/**
 * RBAC Permission: Can user access a specific Admin workspace tab?
 * Super Admins/Admins have 100% unhindered, seamless access to the entire admin workspace without permission blocks.
 */
export function canAccessAdminTab(role: string | undefined, tab: string): boolean {
  const norm = normalizeRole(role);
  if (norm === 'admin') return true;
  const def = ROLE_DEFINITIONS[norm];
  if (!def) return false;
  return def.allowedTabs.includes(tab);
}

/**
 * RBAC Permission: Can user delete an article?
 * - Admin: YES (all)
 * - Editor: YES (all)
 * - Master: YES (delegated/news desk)
 * - Reporter: STRICT NO (They do NOT have permission to delete posts)
 * - User: NO
 */
export function canDeleteArticle(role?: string, user?: UserItem | null): boolean {
  if (user?.canPostOnBehalf) return true;
  const norm = normalizeRole(role);
  return norm === 'admin' || norm === 'editor' || norm === 'master';
}

/**
 * RBAC Permission: Can user edit this article?
 * - Admin: YES (any article)
 * - Editor: YES (any article)
 * - Master: YES (any article, especially delegated ones)
 * - Reporter: ONLY their own published/draft posts
 * - User: NO
 */
export function canEditArticle(role?: string, article?: Article | null, currentUser?: UserItem | null): boolean {
  const norm = normalizeRole(role);
  if (norm === 'admin' || norm === 'editor' || norm === 'master') return true;
  if (currentUser?.canPostOnBehalf) return true;
  if (norm === 'reporter') {
    if (!article) return true; // Can create new article
    if (!currentUser) return false;
    // Check if reporter is the author of this post
    const isOwnAuthor = (article.author && article.author.trim() === currentUser.name.trim());
    const isSubmittedByMe = (article.submittedBy && (
      article.submittedBy === currentUser.id || 
      article.submittedBy === currentUser.name ||
      article.submittedBy.includes(currentUser.name)
    ));
    return Boolean(isOwnAuthor || isSubmittedByMe);
  }
  return false;
}

/**
 * RBAC Permission: Can user select/change author name?
 * - Admin: YES (team or manual)
 * - Master: YES (delegated attribution selector)
 * - Editor: YES (team or manual desk report)
 * - Reporter: STRICT NO (They cannot select or change author names to someone else's)
 * - User: NO
 */
export function canSelectAuthor(role?: string, user?: UserItem | null): boolean {
  if (user?.canPostOnBehalf) return true;
  const norm = normalizeRole(role);
  return norm === 'admin' || norm === 'editor' || norm === 'master';
}

/**
 * RBAC Permission: Is this user permitted to post/publish on behalf of other registered reporters/users?
 */
export function canPostOnBehalf(role?: string, user?: UserItem | null): boolean {
  if (user?.canPostOnBehalf) return true;
  const norm = normalizeRole(role);
  return norm === 'master' || norm === 'admin';
}

/**
 * RBAC Permission: Can user moderate news queue & comments?
 */
export function canModerate(role?: string): boolean {
  const norm = normalizeRole(role);
  return norm === 'admin' || norm === 'editor';
}

/**
 * RBAC Permission: Can user manage global system settings?
 */
export function canManageSettings(role?: string): boolean {
  const norm = normalizeRole(role);
  return norm === 'admin';
}

/**
 * RBAC Permission: Can user manage users & assign roles?
 */
export function canManageUsers(role?: string): boolean {
  const norm = normalizeRole(role);
  return norm === 'admin';
}
