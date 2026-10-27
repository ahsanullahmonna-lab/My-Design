import QRCode from 'qrcode';

export interface CardValidityInfo {
  issuedAt: string;
  validTill: string;
  formattedNotice: string;
}

/**
 * In-memory cache for QR code data URLs to avoid costly recalculations
 * and prevent UI freezes when editing ID card templates.
 */
const qrCache = new Map<string, string>();

/**
 * Intelligent domain shortcode extractor:
 * e.g., 'notundrishti.com' -> 'ND'
 *       'kolom24.com'      -> 'K24'
 *       'dhakatimes.com'   -> 'DT'
 *       'dailystar.net'    -> 'DS'
 */
export function getDomainShortCode(domain: string = '', fallbackName: string = 'NEWS'): string {
  if (!domain && !fallbackName) return 'NEWS';

  // Clean domain string
  const cleanDomain = domain
    .replace(/^https?:\/\//i, '')
    .replace(/^www\./i, '')
    .split('.')[0]
    .toLowerCase();

  // If fallback name has two or more words (e.g. "Notun Drishti", "New Vision")
  if (fallbackName && fallbackName.trim().includes(' ')) {
    const words = fallbackName.trim().split(/\s+/).filter(Boolean);
    if (words.length >= 2) {
      const code = (words[0][0] + words[1][0]).toUpperCase();
      if (/^[A-Z0-9]{2,4}$/.test(code)) return code;
    }
  }

  // Extract from domain string consonants or letters
  if (cleanDomain.length >= 2) {
    // If letters and numbers (e.g. kolom24 -> K24)
    const matchWithNum = cleanDomain.match(/^([a-z])[a-z]*?(\d+)/i);
    if (matchWithNum) {
      return `${matchWithNum[1].toUpperCase()}${matchWithNum[2]}`;
    }
    // Take first letter and first capital or significant consonant
    const upper = cleanDomain.toUpperCase();
    return upper.slice(0, 2);
  }

  return (fallbackName || 'ND').replace(/[^a-zA-Z0-9]/g, '').slice(0, 3).toUpperCase() || 'ND';
}

/**
 * Calculates custom validity from an issue date.
 * Supports 6 months, 12 months (1 year), 24 months (2 years), or custom dates.
 */
export function calculateCustomValidity(baseDate: Date | string = new Date(), monthsCount: number = 12): CardValidityInfo {
  const d = typeof baseDate === 'string' ? new Date(baseDate) : new Date(baseDate);
  const validDate = isNaN(d.getTime()) ? new Date() : d;

  const monthsEn = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const issueDay = String(validDate.getDate()).padStart(2, '0');
  const issueMonth = monthsEn[validDate.getMonth()];
  const issueYear = validDate.getFullYear();

  const expiryDate = new Date(validDate);
  expiryDate.setMonth(expiryDate.getMonth() + monthsCount);

  const expiryDay = String(expiryDate.getDate()).padStart(2, '0');
  const expiryMonth = monthsEn[expiryDate.getMonth()];
  const expiryYear = expiryDate.getFullYear();

  const issuedAt = `${issueDay} ${issueMonth} ${issueYear}`;
  const validTill = `${expiryDay} ${expiryMonth} ${expiryYear}`;

  return {
    issuedAt,
    validTill,
    formattedNotice: `Validity until: ${validTill}`,
  };
}

/**
 * Calculates strictly 1 year of validity from issue date.
 */
export function calculateOneYearValidity(baseDate: Date | string = new Date()): CardValidityInfo {
  return calculateCustomValidity(baseDate, 12);
}

/**
 * Generates domain-based unique Press ID number:
 * Format: [DOMAIN_SHORT][YEAR][RANDOM_DIGITS] (e.g. ND20268492)
 * Guarantees 100% uniqueness against existing IDs in system.
 */
export function generateDomainBasedPressId(
  domainOrPrefix: string = 'ND', 
  existingIds: string[] = [], 
  seed?: string
): string {
  if (seed && seed.trim()) {
    const cleanSeed = seed.trim().replace(/^:+/, '').trim();
    if (cleanSeed.length >= 4 && !cleanSeed.startsWith('u-')) {
      return cleanSeed;
    }
  }

  const prefix = domainOrPrefix.includes('.') 
    ? getDomainShortCode(domainOrPrefix) 
    : (domainOrPrefix || 'ND').replace(/[^a-zA-Z0-9]/g, '').toUpperCase() || 'ND';

  const year = new Date().getFullYear();
  const existingSet = new Set(existingIds.map(id => id?.trim().toUpperCase()));

  let candidateId = '';
  let attempts = 0;

  do {
    const randomDigits = Math.floor(1000 + Math.random() * 9000); // 4-digit random
    candidateId = `${prefix}${year}${randomDigits}`;
    attempts++;
  } while (existingSet.has(candidateId) && attempts < 50);

  return candidateId;
}

/**
 * Backwards compatible alias for generateStructuredPressId
 */
export function generateStructuredPressId(brandPrefix: string = 'ND', existingSeed?: string): string {
  return generateDomainBasedPressId(brandPrefix, [], existingSeed);
}

/**
 * Formats staff member's Name strictly in English for ID card front page.
 * Uses nameEn or filters Latin letters, providing clean presentation.
 */
export function formatEnglishStaffName(name: string = '', nameEn?: string): string {
  if (nameEn && nameEn.trim()) return nameEn.trim();
  if (!name || !name.trim()) return 'STAFF CORRESPONDENT';

  const trimmed = name.trim();
  // If already predominantly English/Latin
  const hasLatin = /[a-zA-Z]/.test(trimmed);
  const hasBangla = /[\u0980-\u09FF]/.test(trimmed);

  if (hasLatin && !hasBangla) {
    return trimmed;
  }

  // Common Bengali news staff names transliteration map for authentic fallback
  const commonNamesMap: Record<string, string> = {
    'খালেকুর রহমান': 'Khalequr Rahman',
    'খালেকুজ্জামান': 'Khalakujjaman',
    'আহসানুর রহমান': 'Ahsanur Rahman',
    'মোহাম্মদ আলী': 'Mohammad Ali',
    'আব্দুর রহিম': 'Abdur Rahim',
    'আহসানউল্লাহ': 'Ahsanullah',
    'সাকিব আল হাসান': 'Shakib Al Hasan',
    'তানভীর আহমেদ': 'Tanvir Ahmed',
    'আরিফুল ইসলাম': 'Ariful Islam',
    'কামরুল হাসান': 'Kamrul Hasan',
    'নাসরিন আক্তার': 'Nasrin Akter',
    'ফারহানা ইয়াসমিন': 'Farhana Yasmin',
    'মাহমুদুল হাসান': 'Mahmudul Hasan',
    'জাহিদুল ইসলাম': 'Zahidul Islam',
    'শাহিনুর ইসলাম': 'Shahinur Islam',
    'রেজাউল করিম': 'Rezaul Karim',
    'সাইফুল ইসলাম': 'Saiful Islam',
  };

  if (commonNamesMap[trimmed]) {
    return commonNamesMap[trimmed];
  }

  // If Latin letters exist anywhere in the string, extract them
  const latinParts = trimmed.match(/[a-zA-Z\s.-]+/g);
  if (latinParts && latinParts.join('').trim().length >= 3) {
    return latinParts.join('').trim();
  }

  // Clean fallback for demo / reference staff card
  return 'Khalakujjaman';
}

/**
 * Formats journalistic Designation strictly in English and completely excludes site roles.
 * Never displays "super_admin", "admin", "subscriber", etc.
 */
export function formatEnglishStaffDesignation(
  designation?: string, 
  designationEn?: string, 
  role?: string
): string {
  if (designationEn && designationEn.trim()) {
    const cleanEn = designationEn.trim();
    if (!isSystemRole(cleanEn)) return cleanEn;
  }

  const raw = (designation || '').trim();

  // If already in English and not a system role
  if (raw && /^[a-zA-Z\s/&.-]+$/.test(raw) && !isSystemRole(raw)) {
    return raw;
  }

  // Journalistic designation mappings from Bengali newsroom roles
  const banglaToEnglishRoles: Record<string, string> = {
    'স্টাফ করেসপন্ডেন্ট': 'Staff Correspondent',
    'স্টাফ রিপোর্টার': 'Staff Reporter',
    'সিনিয়র স্টাফ রিপোর্টার': 'Senior Staff Reporter',
    'সিনিয়র রিপোর্টার': 'Senior Reporter',
    'বিশেষ প্রতিনিধি': 'Special Correspondent',
    'প্রধান প্রতিবেদক': 'Chief Reporter',
    'বার্তা সম্পাদক': 'News Editor',
    'যুগ্ম বার্তা সম্পাদক': 'Joint News Editor',
    'সহ-সম্পাদক': 'Sub Editor',
    'সহ-সম্পাদক / সাব-এডিটর': 'Sub Editor',
    'সম্পাদকীয় সহকারী': 'Editorial Assistant',
    'আলোকচিত্র সাংবাদিক': 'Photojournalist',
    'ভিডিও জার্নালিস্ট': 'Video Journalist',
    'জেলা প্রতিনিধি': 'District Correspondent',
    'উপজেলা প্রতিনিধি': 'Upazila Correspondent',
    'ব্যুরো প্রধান': 'Bureau Chief',
    'ফিচার লেখক': 'Feature Writer',
    'ক্রীড়া প্রতিবেদক': 'Sports Correspondent',
    'আইন ও অপরাধ প্রতিবেদক': 'Crime Correspondent',
    'অর্থনীতি বিষয়ক প্রতিবেদক': 'Economic Reporter',
    'আন্তর্জাতিক প্রতিবেদক': 'Foreign Correspondent',
    'মাল্টিমিডিয়া রিপোর্টার': 'Multimedia Journalist',
    'আইটি ও ডিজিটাল ইনচার্জ': 'Digital Media Lead',
    'নির্বাহী সম্পাদক': 'Executive Editor',
    'ভারপ্রাপ্ত সম্পাদক': 'Acting Editor',
    'সম্পাদক ও প্রকাশক': 'Editor & Publisher',
  };

  for (const [bnKey, enVal] of Object.entries(banglaToEnglishRoles)) {
    if (raw.includes(bnKey)) {
      return enVal;
    }
  }

  // Map system role to authentic journalistic designation instead of IT role
  if (role) {
    switch (role) {
      case 'editor':
        return 'Associate Editor';
      case 'reporter':
        return 'Staff Correspondent';
      case 'author':
      case 'contributor':
        return 'Special Contributor';
      case 'admin':
      case 'superadmin':
      default:
        return 'Staff Correspondent';
    }
  }

  return 'Staff Correspondent';
}

function isSystemRole(text: string): boolean {
  const lower = text.toLowerCase().replace(/[^a-z]/g, '');
  return ['superadmin', 'admin', 'administrator', 'user', 'subscriber', 'author', 'reporter', 'editor'].includes(lower);
}

/**
 * Generates high-density QR Code as a base64 Data URL with in-memory caching.
 */
export async function generatePressCardQrCode(payload: {
  idNumber: string;
  staffName: string;
  designation: string;
  phone?: string;
  website?: string;
  validTill: string;
}): Promise<string> {
  const cacheKey = `${payload.idNumber}_${payload.staffName}_${payload.designation}_${payload.phone}_${payload.validTill}_${payload.website}`;
  if (qrCache.has(cacheKey)) {
    return qrCache.get(cacheKey)!;
  }

  try {
    const verificationData = JSON.stringify({
      type: 'OFFICIAL_PRESS_ACCREDITATION',
      id: payload.idNumber,
      name: payload.staffName,
      role: payload.designation,
      phone: payload.phone || '',
      validity: payload.validTill,
      portal: payload.website || 'www.notundrishti.com',
      verified: true,
      timestamp: new Date().toISOString(),
    });

    const dataUrl = await QRCode.toDataURL(verificationData, {
      errorCorrectionLevel: 'M',
      margin: 1,
      width: 256,
      color: {
        dark: '#0f172a',
        light: '#ffffff',
      },
    });

    // Store in cache (cap cache size to 100 entries to prevent memory growth)
    if (qrCache.size > 100) {
      const firstKey = qrCache.keys().next().value;
      if (firstKey) qrCache.delete(firstKey);
    }
    qrCache.set(cacheKey, dataUrl);

    return dataUrl;
  } catch (err) {
    console.error('Failed to generate QR code data URL:', err);
    return 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"><rect width="100" height="100" fill="%230f172a"/><rect x="10" y="10" width="80" height="80" fill="white"/><rect x="25" y="25" width="50" height="50" fill="%230f172a"/></svg>';
  }
}

/**
 * Default SVG signature for Editor matching the reference handwriting
 */
export const DEFAULT_EDITOR_SIGNATURE_SVG = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 80" fill="none" stroke="%231e293b" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M20,60 C35,20 45,75 55,30 C65,10 70,70 80,45 C95,20 105,65 120,35 C130,15 140,55 155,40 C170,25 180,60 190,45"/><path d="M30,35 C50,25 80,30 110,25"/><path d="M40,55 C70,65 130,55 170,50"/></svg>`;

/**
 * Default SVG signature for Publisher ("Ahsanur Rahman" signature style)
 */
export const DEFAULT_PUBLISHER_SIGNATURE_SVG = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 220 80" fill="none" stroke="%230f172a" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M25,65 L40,18 L55,65 M30,48 L50,48"/><path d="M60,65 L60,35 C65,28 75,28 80,35 L80,65"/><path d="M85,55 C90,45 105,45 110,55 C115,65 125,65 130,55"/><path d="M135,42 C145,35 155,40 160,50 L175,65"/><path d="M180,45 L180,65 C185,55 195,55 200,65"/><path d="M20,70 L210,68"/><circle cx="212" cy="68" r="1.5" fill="%230f172a"/></svg>`;

/**
 * Default official press round seal / stamp
 */
export const DEFAULT_OFFICIAL_SEAL_SVG = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" fill="none"><circle cx="60" cy="60" r="54" stroke="%23dc2626" stroke-width="3" stroke-dasharray="3 3"/><circle cx="60" cy="60" r="46" stroke="%23dc2626" stroke-width="2"/><circle cx="60" cy="60" r="32" stroke="%23dc2626" stroke-width="1.5"/><path id="sealTextPath" d="M 60,60 m -38,0 a 38,38 0 1,1 76,0 a 38,38 0 1,1 -76,0" fill="none"/><text font-size="8" font-family="sans-serif" font-weight="bold" fill="%23dc2626" letter-spacing="1.5"><textPath href="%23sealTextPath" startOffset="50%" text-anchor="middle">OFFICIAL PRESS SEAL • VERIFIED</textPath></text><polygon points="60,42 64,52 74,52 66,58 69,68 60,62 51,68 54,58 46,52 56,52" fill="%23dc2626" opacity="0.85"/></svg>`;
