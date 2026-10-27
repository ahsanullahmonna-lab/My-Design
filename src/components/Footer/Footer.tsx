import React, { useState, useEffect } from 'react';
import { 
  Facebook, 
  Instagram, 
  Linkedin, 
  Twitter, 
  Youtube, 
  Mail, 
  MapPin, 
  Phone, 
  ShieldCheck,
  ArrowUp,
  Briefcase
} from 'lucide-react';
import { Logo } from '../Header/Logo';
import { WeatherPrayerWidget } from '../Widgets/WeatherPrayerWidget';
import { CategoryItem, SiteSettings } from '../../types/news';

interface FooterProps {
  darkMode: boolean;
  lang: 'bn' | 'en';
  onSelectCategory: (cat: string) => void;
  settings?: SiteSettings;
  categories?: CategoryItem[];
  onOpenRecruitment?: () => void;
}

export const Footer: React.FC<FooterProps> = ({ 
  darkMode, 
  lang, 
  onSelectCategory,
  settings,
  categories = [],
  onOpenRecruitment
}) => {
  const [appDownloadNotice, setAppDownloadNotice] = useState<string | null>(null);
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 250);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  const dynamicLinks = categories.filter(c => c.showInFooter !== false);
  const footerLinks = dynamicLinks.length > 0 
    ? dynamicLinks.map(c => ({ title: lang === 'bn' ? c.nameBn : (c.nameEn || c.nameBn), slug: c.id }))
    : [
        { title: 'সংবাদপত্রের কথা', slug: 'latest' },
        { title: 'বিশেষ পাতা', slug: 'special' },
        { title: 'নারী ভুবন', slug: 'lifestyle' },
        { title: 'ছুটির খেলা', slug: 'sports' },
        { title: 'কলাম', slug: 'opinion' },
        { title: 'মিডিয়া', slug: 'media' },
      ];

  return (
    <footer className={`w-full border-t transition-colors ${
      darkMode ? 'bg-slate-950 border-slate-800 text-slate-300' : 'bg-slate-50 border-slate-200 text-slate-700'
    }`}>
      {/* Upper Links Row matching Frontend.jpg */}
      <div className="max-w-7xl mx-auto px-4 py-6 border-b border-slate-200 dark:border-slate-800">
        <div className="flex flex-wrap items-center justify-center gap-6 text-sm font-solaiman font-semibold">
          {footerLinks.map((item, idx) => (
            <button
              key={idx}
              onClick={() => onSelectCategory(item.slug)}
              className="hover:text-red-600 transition-colors"
            >
              {item.title}
            </button>
          ))}
        </div>

        {/* Social Follow & App Download Row */}
        <div className="mt-6 flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Social Icons */}
          <div className="flex items-center gap-3">
            <span className="text-xs font-solaiman text-gray-800 dark:text-gray-200 font-bold mr-1">
              {lang === 'bn' ? 'অনুসরণ করুন:' : 'Follow Us:'}
            </span>
            <a
              href={settings?.socialMediaUrls?.facebook || settings?.facebookUrl || "https://facebook.com"}
              target="_blank"
              rel="noreferrer"
              aria-label="Facebook"
              className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center hover:opacity-90 transition-opacity"
            >
              <Facebook className="w-4 h-4 fill-current" />
            </a>
            <a
              href={settings?.socialMediaUrls?.twitter || settings?.twitterUrl || "https://x.com"}
              target="_blank"
              rel="noreferrer"
              aria-label="Twitter / X"
              className="w-8 h-8 rounded-full bg-sky-500 text-white flex items-center justify-center hover:opacity-90 transition-opacity"
            >
              <Twitter className="w-4 h-4 fill-current" />
            </a>
            <a
              href={settings?.socialMediaUrls?.youtube || settings?.youtubeUrl || "https://youtube.com"}
              target="_blank"
              rel="noreferrer"
              aria-label="YouTube"
              className="w-8 h-8 rounded-full bg-red-600 text-white flex items-center justify-center hover:opacity-90 transition-opacity"
            >
              <Youtube className="w-4 h-4 fill-current" />
            </a>
            <a
              href={settings?.socialMediaUrls?.instagram || settings?.instagramUrl || "https://instagram.com"}
              target="_blank"
              rel="noreferrer"
              aria-label="Instagram"
              className="w-8 h-8 rounded-full bg-pink-600 text-white flex items-center justify-center hover:opacity-90 transition-opacity"
            >
              <Instagram className="w-4 h-4" />
            </a>
            <a
              href={settings?.socialMediaUrls?.linkedin || settings?.linkedinUrl || "https://linkedin.com"}
              target="_blank"
              rel="noreferrer"
              aria-label="LinkedIn"
              className="w-8 h-8 rounded-full bg-blue-700 text-white flex items-center justify-center hover:opacity-90 transition-opacity"
            >
              <Linkedin className="w-4 h-4 fill-current" />
            </a>
          </div>

          {/* App download badges (Requirement 4: Admin Controlled Mobile App Badges) */}
          {settings?.mobileAppBadges?.showInFooter !== false && 
           (settings?.mobileAppBadges?.showGooglePlay !== false || settings?.mobileAppBadges?.showAppStore !== false) && (
            <div className="flex flex-col sm:flex-row items-center gap-3 relative">
              {appDownloadNotice && (
                <div className="absolute -top-10 left-0 sm:left-auto right-0 sm:right-auto px-3 py-1.5 rounded-lg bg-red-600 text-white text-[11px] font-bold shadow-lg whitespace-nowrap animate-in fade-in z-20 flex items-center gap-1.5">
                  <span>📱</span>
                  <span>{appDownloadNotice}</span>
                </div>
              )}

              {settings?.mobileAppBadges?.badgeTitleBn && (
                <span className="text-xs font-solaiman text-gray-800 dark:text-gray-200 font-bold hidden lg:inline mr-1">
                  {settings.mobileAppBadges.badgeTitleBn}:
                </span>
              )}

              {/* Google Play Store Badge */}
              {settings?.mobileAppBadges?.showGooglePlay !== false && (
                settings?.mobileAppBadges?.googlePlayUrl ? (
                  <a
                    href={settings.mobileAppBadges.googlePlayUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-2 px-3 py-1.5 bg-black text-white rounded hover:bg-slate-900 active:scale-95 cursor-pointer transition-all shadow-xs"
                    title="গুগল প্লে স্টোর থেকে ডাউনলোড করুন"
                  >
                    <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current">
                      <path d="M3.609 1.814L13.793 12 3.61 22.186a2.023 2.023 0 0 1-.61-.318c-.37-.308-.6-.777-.6-1.303V3.435c0-.526.23-.995.6-1.303.18-.15.39-.26.61-.318zm11.236 11.236l2.355 2.355-12.01 6.942 9.655-9.297zm0-2.099L5.19 1.654l12.01 6.942-2.355 2.355zM16.5 12l2.87-1.657c.78-.45.78-1.185 0-1.636l-.01-.007L16.5 12zm0 0l2.86 1.65c.78.45.78 1.186 0 1.636l-.01.007L16.5 12z"/>
                    </svg>
                    <div className="text-left font-latin leading-tight">
                      <div className="text-[9px] uppercase text-slate-300">GET IT ON</div>
                      <div className="text-xs font-bold font-sans">Google Play</div>
                    </div>
                  </a>
                ) : (
                  <button
                    onClick={() => {
                      setAppDownloadNotice('গুগল প্লে স্টোর অ্যাপ শীঘ্রই লাইভ হচ্ছে!');
                      setTimeout(() => setAppDownloadNotice(null), 3000);
                    }}
                    className="flex items-center gap-2 px-3 py-1.5 bg-black text-white rounded hover:bg-slate-900 active:scale-95 cursor-pointer transition-all shadow-xs"
                    title="গুগল প্লে স্টোর থেকে ডাউনলোড করুন"
                  >
                    <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current">
                      <path d="M3.609 1.814L13.793 12 3.61 22.186a2.023 2.023 0 0 1-.61-.318c-.37-.308-.6-.777-.6-1.303V3.435c0-.526.23-.995.6-1.303.18-.15.39-.26.61-.318zm11.236 11.236l2.355 2.355-12.01 6.942 9.655-9.297zm0-2.099L5.19 1.654l12.01 6.942-2.355 2.355zM16.5 12l2.87-1.657c.78-.45.78-1.185 0-1.636l-.01-.007L16.5 12zm0 0l2.86 1.65c.78.45.78 1.186 0 1.636l-.01.007L16.5 12z"/>
                    </svg>
                    <div className="text-left font-latin leading-tight">
                      <div className="text-[9px] uppercase text-slate-300">GET IT ON</div>
                      <div className="text-xs font-bold font-sans">Google Play</div>
                    </div>
                  </button>
                )
              )}

              {/* Apple App Store Badge */}
              {settings?.mobileAppBadges?.showAppStore !== false && (
                settings?.mobileAppBadges?.appStoreUrl ? (
                  <a
                    href={settings.mobileAppBadges.appStoreUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-2 px-3 py-1.5 bg-black text-white rounded hover:bg-slate-900 active:scale-95 cursor-pointer transition-all shadow-xs"
                    title="অ্যাপল অ্যাপ স্টোর থেকে ডাউনলোড করুন"
                  >
                    <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current">
                      <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.42c.62-.75 1.04-1.8 1.01-2.85-.9.04-1.99.6-2.63 1.34-.56.64-.99 1.68-.86 2.7.99.08 1.86-.44 2.48-1.19z"/>
                    </svg>
                    <div className="text-left font-latin leading-tight">
                      <div className="text-[9px] uppercase text-slate-300">Download on the</div>
                      <div className="text-xs font-bold font-sans">App Store</div>
                    </div>
                  </a>
                ) : (
                  <button
                    onClick={() => {
                      setAppDownloadNotice('অ্যাপল অ্যাপ স্টোর ভার্সন রিভিউতে রয়েছে!');
                      setTimeout(() => setAppDownloadNotice(null), 3000);
                    }}
                    className="flex items-center gap-2 px-3 py-1.5 bg-black text-white rounded hover:bg-slate-900 active:scale-95 cursor-pointer transition-all shadow-xs"
                    title="অ্যাপল অ্যাপ স্টোর থেকে ডাউনলোড করুন"
                  >
                    <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current">
                      <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.42c.62-.75 1.04-1.8 1.01-2.85-.9.04-1.99.6-2.63 1.34-.56.64-.99 1.68-.86 2.7.99.08 1.86-.44 2.48-1.19z"/>
                    </svg>
                    <div className="text-left font-latin leading-tight">
                      <div className="text-[9px] uppercase text-slate-300">Download on the</div>
                      <div className="text-xs font-bold font-sans">App Store</div>
                    </div>
                  </button>
                )
              )}
            </div>
          )}
        </div>
      </div>

      {/* Smart Widget Area: Weather & Prayer Times (Requirement 3: Clean & neatly tucked into Footer) */}
      <div className="max-w-7xl mx-auto px-4 pt-6">
        <WeatherPrayerWidget darkMode={darkMode} variant="compact" />
      </div>

      {/* Main Publication Info & Editorial Team */}
      <div className="max-w-7xl mx-auto px-4 py-8 grid grid-cols-1 md:grid-cols-12 gap-8 text-xs font-solaiman">
        {/* Left: Brand & About Paragraph */}
        <div className="md:col-span-6 space-y-3">
          <Logo 
            size="sm" 
            customHeight={settings?.footerLogoHeight}
            customWidth={settings?.footerLogoWidth}
            darkMode={darkMode} 
            customLogoUrl={darkMode ? settings?.darkLogoUrl : settings?.lightLogoUrl}
            siteName={settings?.siteName}
            tagline={settings?.tagline}
          />
          <p className="text-gray-800 dark:text-gray-200 leading-relaxed text-xs pt-2 font-solaiman font-medium">
            {settings?.footerAbout || `সময়ের সাথে তাল মিলিয়ে সবশেষ খবরের নির্ভুল গন্তব্য ${settings?.siteName || 'নিউজ পোর্টাল'}। বাংলাদেশ ও বিশ্বমঞ্চের ব্রেকিং নিউজ, রাজনীতি, অর্থনীতি, খেলাধুলা কিংবা বিনোদনের সব খবর—সবার আগে আপনার হাতের মুঠোয়। খবরের নতুন দিগন্ত উন্মোচন করতে এখনই ভিজিট করুন।`}
          </p>
          <div className="flex flex-wrap items-center gap-3 text-gray-700 dark:text-gray-300 pt-1">
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>ডিজিটাল নিরাপত্তা ও বাংলাদেশ প্রেস কাউন্সিল নির্দেশিকা মেনে পরিচালিত।</span>
            </div>
          </div>
        </div>

        {/* Center: Editorial Info */}
        <div className="md:col-span-3 space-y-2">
          <h4 className="font-bold text-gray-950 dark:text-white text-sm mb-2 border-b border-red-600/40 pb-1">
            {settings?.editorialSectionTitle || 'সম্পাদকীয় ও প্রশাসন'}
          </h4>
          <p>
            <span className="text-gray-700 dark:text-gray-300 font-bold">{settings?.editorLabel || 'ভারপ্রাপ্ত সম্পাদক'}:</span>{' '}
            <span className="font-bold text-gray-950 dark:text-white">{settings?.editorName || 'শামীম রেজা নূরুল'}</span>
          </p>
          <p>
            <span className="text-gray-700 dark:text-gray-300 font-bold">{settings?.execEditorLabel || 'নির্বাহী সম্পাদক'}:</span>{' '}
            <span className="text-gray-900 dark:text-gray-100">{settings?.execEditorName || 'নাজমুল হুদা শান্ত'}</span>
          </p>
          <p>
            <span className="text-gray-700 dark:text-gray-300 font-bold">{settings?.publisherLabel || 'প্রকাশক'}:</span>{' '}
            <span className="text-gray-900 dark:text-gray-100">{settings?.publisherName || `${settings?.siteName || 'নিউজ পোর্টাল'} পাবলিকেশনস লিমিটেড`}</span>
          </p>
          <p>
            <span className="text-gray-700 dark:text-gray-300 font-bold">{settings?.newsHeadLabel || 'বার্তা প্রধান'}:</span>{' '}
            <span className="text-gray-900 dark:text-gray-100">{settings?.newsHeadName || 'মাহমুদ হাসান'}</span>
          </p>
        </div>

        {/* Right: Contact & Office */}
        <div className="md:col-span-3 space-y-2">
          <h4 className="font-bold text-slate-900 dark:text-white text-sm mb-2 border-b border-red-600/40 pb-1">
            {settings?.contactSectionTitle || 'যোগাযোগ ও দপ্তর'}
          </h4>
          <p className="flex items-center gap-2">
            <Mail className="w-3.5 h-3.5 text-red-600 shrink-0" />
            <span>ই-মেইল: {settings?.contactEmail || 'editor@newsportal.com'}</span>
          </p>
          <p className="flex items-center gap-2">
            <Phone className="w-3.5 h-3.5 text-red-600 shrink-0" />
            <span>ফোন: {settings?.contactPhone || '+৮৮০ ১৭০০০০০০০০'}</span>
          </p>
          <p className="flex items-start gap-2">
            <MapPin className="w-3.5 h-3.5 text-red-600 shrink-0 mt-0.5" />
            <span>ঠিকানা: {settings?.officeAddress || 'প্লট #১২, প্রগতি সরণি, বারিধারা, ঢাকা-১২১২, বাংলাদেশ'}</span>
          </p>
        </div>
      </div>

      {/* Copyright Bottom Bar with Quick Scroll-to-Top Button */}
      <div className={`py-4 px-4 text-center text-[11px] font-solaiman border-t relative ${
        darkMode ? 'bg-slate-900 border-slate-800 text-gray-300' : 'bg-gray-100 border-gray-200 text-gray-800 font-medium'
      }`}>
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <p>{settings?.copyrightText || `© ২০২৬ ${settings?.siteName || 'নিউজ পোর্টাল'} (${settings?.domain || 'newsportal.com'}). সর্বস্বত্ব সংরক্ষিত।`}</p>
          
          <button
            onClick={scrollToTop}
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded bg-gray-200 dark:bg-slate-800 hover:bg-red-600 hover:text-white text-gray-900 dark:text-gray-100 font-bold transition-all cursor-pointer text-xs group"
            title="উপরে উঠুন"
          >
            <ArrowUp className="w-3.5 h-3.5 group-hover:-translate-y-0.5 transition-transform" />
            <span>উপরে উঠুন</span>
          </button>
        </div>
        <p className="mt-1 text-[10px] text-gray-700 dark:text-gray-300 font-medium">
          ওয়েবসাইটে প্রকাশিত লেখা, ছবি, অডিও ও ভিডিও অনুমতি ছাড়া ব্যবহার সম্পূর্ণ বেআইনি।
        </p>
      </div>

      {/* Floating Scroll-to-Top (উপরে উঠুন) Button - Cleanly positioned above Citizen Journalism button with ample spacing to eliminate layout conflict */}
      {showScrollTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-[84px] sm:bottom-[88px] right-6 z-40 flex items-center justify-center w-10 h-10 sm:w-11 sm:h-11 bg-slate-900/90 dark:bg-white/90 hover:bg-red-600 dark:hover:bg-red-600 text-white dark:text-slate-900 hover:text-white dark:hover:text-white rounded-full shadow-2xl transition-all duration-300 hover:scale-110 active:scale-95 cursor-pointer group border border-slate-700 dark:border-slate-300 backdrop-blur-md"
          title="উপরে উঠুন (Scroll to top)"
          aria-label="উপরে উঠুন"
        >
          <ArrowUp className="w-4.5 h-4.5 sm:w-5 sm:h-5 transition-transform group-hover:-translate-y-1" />
        </button>
      )}
    </footer>
  );
};
