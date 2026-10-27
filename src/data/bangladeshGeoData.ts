/**
 * ============================================================================
 * Bangladesh Geo-Data: 8 Divisions & 64 Districts
 * Used for News Desk location picker, Countrywide news section, and
 * "নিজ জেলার নিউজ দেখুন" (View Local News by District) frontend filter.
 * ============================================================================
 */

export interface DistrictInfo {
  nameBn: string;
  nameEn: string;
}

export interface DivisionInfo {
  id: string;
  nameBn: string;
  nameEn: string;
  districts: DistrictInfo[];
}

export const BANGLADESH_DIVISIONS: DivisionInfo[] = [
  {
    id: 'dhaka',
    nameBn: 'ঢাকা',
    nameEn: 'Dhaka',
    districts: [
      { nameBn: 'ঢাকা', nameEn: 'Dhaka' },
      { nameBn: 'গাজীপুর', nameEn: 'Gazipur' },
      { nameBn: 'নারায়ণগঞ্জ', nameEn: 'Narayanganj' },
      { nameBn: 'নরসিংদী', nameEn: 'Narsingdi' },
      { nameBn: 'মুন্সীগঞ্জ', nameEn: 'Munshiganj' },
      { nameBn: 'মানিকগঞ্জ', nameEn: 'Manikganj' },
      { nameBn: 'টাঙ্গাইল', nameEn: 'Tangail' },
      { nameBn: 'কিশোরগঞ্জ', nameEn: 'Kishoreganj' },
      { nameBn: 'ফরিদপুর', nameEn: 'Faridpur' },
      { nameBn: 'মাদারীপুর', nameEn: 'Madaripur' },
      { nameBn: 'গোপালগঞ্জ', nameEn: 'Gopalganj' },
      { nameBn: 'রাজবাড়ী', nameEn: 'Rajbari' },
      { nameBn: 'শরীয়তপুর', nameEn: 'Shariatpur' },
    ],
  },
  {
    id: 'chattogram',
    nameBn: 'চট্টগ্রাম',
    nameEn: 'Chattogram',
    districts: [
      { nameBn: 'চট্টগ্রাম', nameEn: 'Chattogram' },
      { nameBn: 'কক্সবাজার', nameEn: 'Cox\'s Bazar' },
      { nameBn: 'কুমিল্লা', nameEn: 'Cumilla' },
      { nameBn: 'ব্রাহ্মণবাড়িয়া', nameEn: 'Brahmanbaria' },
      { nameBn: 'চাঁদপুর', nameEn: 'Chandpur' },
      { nameBn: 'নোয়াখালী', nameEn: 'Noakhali' },
      { nameBn: 'ফেনী', nameEn: 'Feni' },
      { nameBn: 'লক্ষ্মীপুর', nameEn: 'Lakshmipur' },
      { nameBn: 'রাঙ্গামাটি', nameEn: 'Rangamati' },
      { nameBn: 'বান্দরবান', nameEn: 'Bandarban' },
      { nameBn: 'খাগড়াছড়ি', nameEn: 'Khagrachhari' },
    ],
  },
  {
    id: 'rajshahi',
    nameBn: 'রাজশাহী',
    nameEn: 'Rajshahi',
    districts: [
      { nameBn: 'রাজশাহী', nameEn: 'Rajshahi' },
      { nameBn: 'বগুড়া', nameEn: 'Bogura' },
      { nameBn: 'পাবনা', nameEn: 'Pabna' },
      { nameBn: 'সিরাজগঞ্জ', nameEn: 'Sirajganj' },
      { nameBn: 'নওগাঁ', nameEn: 'Naogaon' },
      { nameBn: 'নাটোর', nameEn: 'Natore' },
      { nameBn: 'চাঁপাইনবাবগঞ্জ', nameEn: 'Chapai Nawabganj' },
      { nameBn: 'জয়পুরহাট', nameEn: 'Joypurhat' },
    ],
  },
  {
    id: 'khulna',
    nameBn: 'খুলনা',
    nameEn: 'Khulna',
    districts: [
      { nameBn: 'খুলনা', nameEn: 'Khulna' },
      { nameBn: 'যশোর', nameEn: 'Jashore' },
      { nameBn: 'সাতক্ষীরা', nameEn: 'Satkhira' },
      { nameBn: 'বাগেরহাট', nameEn: 'Bagerhat' },
      { nameBn: 'ঝিনাইদহ', nameEn: 'Jhenaidah' },
      { nameBn: 'কুষ্টিয়া', nameEn: 'Kushtia' },
      { nameBn: 'চুয়াডাঙ্গা', nameEn: 'Chuadanga' },
      { nameBn: 'মেহেরপুর', nameEn: 'Meherpur' },
      { nameBn: 'মাগুরা', nameEn: 'Magura' },
      { nameBn: 'নড়াইল', nameEn: 'Narail' },
    ],
  },
  {
    id: 'barishal',
    nameBn: 'বরিশাল',
    nameEn: 'Barishal',
    districts: [
      { nameBn: 'বরিশাল', nameEn: 'Barishal' },
      { nameBn: 'পটুয়াখালী', nameEn: 'Patuakhali' },
      { nameBn: 'ভোলা', nameEn: 'Bhola' },
      { nameBn: 'পিরোজপুর', nameEn: 'Pirojpur' },
      { nameBn: 'বরগুনা', nameEn: 'Barguna' },
      { nameBn: 'ঝালকাঠি', nameEn: 'Jhalokati' },
    ],
  },
  {
    id: 'sylhet',
    nameBn: 'সিলেট',
    nameEn: 'Sylhet',
    districts: [
      { nameBn: 'সিলেট', nameEn: 'Sylhet' },
      { nameBn: 'মৌলভীবাজার', nameEn: 'Moulvibazar' },
      { nameBn: 'হবিগঞ্জ', nameEn: 'Habiganj' },
      { nameBn: 'সুনামগঞ্জ', nameEn: 'Sunamganj' },
    ],
  },
  {
    id: 'rangpur',
    nameBn: 'রংপুর',
    nameEn: 'Rangpur',
    districts: [
      { nameBn: 'রংপুর', nameEn: 'Rangpur' },
      { nameBn: 'দিনাজপুর', nameEn: 'Dinajpur' },
      { nameBn: 'কুড়িগ্রাম', nameEn: 'Kurigram' },
      { nameBn: 'গাইবান্ধা', nameEn: 'Gaibandha' },
      { nameBn: 'নীলফামারী', nameEn: 'Nilphamari' },
      { nameBn: 'পঞ্চগড়', nameEn: 'Panchagarh' },
      { nameBn: 'ঠাকুরগাঁও', nameEn: 'Thakurgaon' },
      { nameBn: 'লালমনিরহাট', nameEn: 'Lalmonirhat' },
    ],
  },
  {
    id: 'mymensingh',
    nameBn: 'ময়মনসিংহ',
    nameEn: 'Mymensingh',
    districts: [
      { nameBn: 'ময়মনসিংহ', nameEn: 'Mymensingh' },
      { nameBn: 'জামালপুর', nameEn: 'Jamalpur' },
      { nameBn: 'নেত্রকোণা', nameEn: 'Netrokona' },
      { nameBn: 'শেরপুর', nameEn: 'Sherpur' },
    ],
  },
];

export const normalizeBnString = (str?: string): string => {
  if (!str) return '';
  return str
    .trim()
    .replace(/\u09a1\u09bc/g, '\u09dc') // ড + ় -> ড়
    .replace(/\u09a2\u09bc/g, '\u09dd') // ঢ + ় -> ঢ়
    .replace(/\u09af\u09bc/g, '\u09df') // য + ় -> য়
    .toLowerCase();
};

export const isDistrictMatch = (
  articleDistrict?: string,
  targetDistrict?: string,
  articleTags?: string[],
  articleTitle?: string
): boolean => {
  if (!targetDistrict) return true;
  const targetNorm = normalizeBnString(targetDistrict);
  if (!targetNorm) return true;

  if (articleDistrict && normalizeBnString(articleDistrict) === targetNorm) {
    return true;
  }

  if (articleTags && articleTags.some(t => normalizeBnString(t) === targetNorm)) {
    return true;
  }

  if (articleTitle && normalizeBnString(articleTitle).includes(targetNorm)) {
    return true;
  }

  return false;
};

export const getDivisionDistricts = (divisionNameBn: string): DistrictInfo[] => {
  const match = BANGLADESH_DIVISIONS.find(
    (d) => d.nameBn === divisionNameBn || d.nameEn.toLowerCase() === divisionNameBn.toLowerCase() || d.id === divisionNameBn.toLowerCase()
  );
  return match ? match.districts : BANGLADESH_DIVISIONS[0].districts;
};

export const findDivisionByDistrict = (districtNameBn: string): string => {
  if (!districtNameBn) return 'ঢাকা';
  for (const div of BANGLADESH_DIVISIONS) {
    if (div.districts.some((d) => d.nameBn === districtNameBn || d.nameEn.toLowerCase() === districtNameBn.toLowerCase())) {
      return div.nameBn;
    }
  }
  return 'ঢাকা';
};


