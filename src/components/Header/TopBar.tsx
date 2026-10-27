import React, { useState, useEffect } from 'react';
import { 
  Sun, 
  Moon, 
  User, 
  Calendar, 
  Globe, 
  Facebook, 
  Twitter, 
  Youtube, 
  Linkedin, 
  Instagram,
  MapPin,
  Newspaper,
  Send,
  ShieldCheck,
  Settings,
  Layers,
  Briefcase,
  CreditCard,
  LogIn,
  LogOut,
  ChevronDown,
  Sparkles
} from 'lucide-react';
import { Logo } from './Logo';
import { Article, SiteSettings, UserItem } from '../../types/news';
import { canAccessAdmin } from '../../utils/rbac';
import { isSecretAdminAuthorized } from '../../utils/adminSecurity';

interface TopBarProps {
  darkMode: boolean;
  setDarkMode: (val: boolean) => void;
  lang: 'bn' | 'en';
  setLang: (l: 'bn' | 'en') => void;
  topPreviewArticles?: Article[];
  onSelectArticle?: (article: Article) => void;
  onOpenAdmin: () => void;
  settings?: SiteSettings;
  onOpenEPaper?: () => void;
  onOpenWebStories?: () => void;
  onOpenCitizenNews?: () => void;
  currentUser?: UserItem;
  users?: UserItem[];
  onSelectUser?: (userId: string) => void;
  onOpenUserProfile?: () => void;
  onOpenRecruitment?: () => void;
  isLoggedIn?: boolean;
  onOpenLogin?: () => void;
  onLogout?: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  darkMode,
  setDarkMode,
  lang,
  setLang,
  topPreviewArticles,
  onSelectArticle,
  onOpenAdmin,
  settings,
  onOpenEPaper,
  onOpenWebStories,
  onOpenCitizenNews,
  currentUser,
  users = [],
  onSelectUser,
  onOpenUserProfile,
  onOpenRecruitment,
  isLoggedIn,
  onOpenLogin,
  onLogout,
}) => {
  const [currentTime, setCurrentTime] = useState<string>('');
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const isAuth = isLoggedIn ?? Boolean(currentUser && currentUser.id !== 'guest');
  const showAdminAccess = Boolean(isAuth && currentUser && canAccessAdmin(currentUser.role) && isSecretAdminAuthorized());

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const timeStr = now.toLocaleTimeString('bn-BD', { hour: '2-digit', minute: '2-digit', hour12: true });
      setCurrentTime(timeStr);
    };
    updateTime();
    const timer = setInterval(updateTime, 60000);
    return () => clearInterval(timer);
  }, []);

  const banglaDate = "বৃহস্পতিবার, ৮ অক্টোবর ২০২৬ | ২৩ আশ্বিন ১৪৩৩";
  const englishDate = "Thursday, 8 October 2026 | 23 Ashwin 1433";

  return (
    <div className={`w-full border-b transition-colors duration-200 ${
      darkMode ? 'bg-slate-900 border-slate-800 text-slate-300' : 'bg-white border-slate-200 text-slate-700'
    }`}>
      {/* ================= ROW 1: TOP MICRO-UTILITY & DATE BAR ================= */}
      <div className="border-b border-dashed border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/90 transition-colors">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 py-1.5 flex flex-wrap items-center justify-between gap-2.5 text-xs">
          
          {/* Left: Date & Micro Info */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 text-gray-800 dark:text-gray-200 font-medium">
              <Calendar className="w-3.5 h-3.5 text-red-600 shrink-0" />
              <span className="font-solaiman">{lang === 'bn' ? banglaDate : englishDate}</span>
            </div>

            {/* Staff identity indicator */}
            {currentUser?.role && ['admin', 'superadmin', 'editor', 'reporter'].includes(currentUser.role) && (
              <div className="hidden sm:flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold text-gray-800 dark:text-gray-200 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-500/30">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="font-solaiman">
                  {currentUser.roleBn || 'কর্মী'}
                </span>
              </div>
            )}
          </div>

          {/* Right: Top Utility Items (Language, EN, Theme, Admin, User Profile Dropdown) */}
          <div className="flex items-center gap-2 sm:gap-2.5 shrink-0 ml-auto">
            {/* Dynamic Social Media Links Controller */}
            <div className="hidden xl:flex items-center gap-2 text-gray-700 dark:text-gray-300 mr-1">
              {(settings?.socialMediaUrls?.facebook || settings?.facebookUrl) && (
                <a 
                  href={settings.socialMediaUrls?.facebook || settings.facebookUrl} 
                  target="_blank" 
                  rel="noreferrer" 
                  aria-label="Facebook" 
                  className="hover:text-blue-600 transition-colors"
                  title="ফেসবুক পেজ"
                >
                  <Facebook className="w-3.5 h-3.5" />
                </a>
              )}
              {(settings?.socialMediaUrls?.twitter || settings?.twitterUrl) && (
                <a 
                  href={settings.socialMediaUrls?.twitter || settings.twitterUrl} 
                  target="_blank" 
                  rel="noreferrer" 
                  aria-label="X Twitter" 
                  className="hover:text-sky-500 transition-colors"
                  title="এক্স (টুইটার)"
                >
                  <Twitter className="w-3.5 h-3.5" />
                </a>
              )}
              {(settings?.socialMediaUrls?.youtube || settings?.youtubeUrl) && (
                <a 
                  href={settings.socialMediaUrls?.youtube || settings.youtubeUrl} 
                  target="_blank" 
                  rel="noreferrer" 
                  aria-label="YouTube" 
                  className="hover:text-red-600 transition-colors"
                  title="ইউটিউব চ্যানেল"
                >
                  <Youtube className="w-3.5 h-3.5" />
                </a>
              )}
              {(settings?.socialMediaUrls?.instagram || settings?.instagramUrl) && (
                <a 
                  href={settings.socialMediaUrls?.instagram || settings.instagramUrl} 
                  target="_blank" 
                  rel="noreferrer" 
                  aria-label="Instagram" 
                  className="hover:text-pink-600 transition-colors"
                  title="ইনস্টাগ্রাম"
                >
                  <Instagram className="w-3.5 h-3.5" />
                </a>
              )}
              {(settings?.socialMediaUrls?.linkedin || settings?.linkedinUrl) && (
                <a 
                  href={settings.socialMediaUrls?.linkedin || settings.linkedinUrl} 
                  target="_blank" 
                  rel="noreferrer" 
                  aria-label="LinkedIn" 
                  className="hover:text-blue-700 transition-colors"
                  title="লিংকডইন"
                >
                  <Linkedin className="w-3.5 h-3.5" />
                </a>
              )}
            </div>

            <div className="h-3 w-px bg-slate-300 dark:bg-slate-700 hidden xl:block" />

            {/* E-Paper Button in Header Action Bar */}
            {onOpenEPaper && (
              <button
                onClick={onOpenEPaper}
                className="flex items-center gap-1.5 px-2.5 py-0.5 rounded border border-red-400/50 bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 hover:bg-red-600 hover:text-white dark:hover:bg-red-600 dark:hover:text-white text-xs font-solaiman font-bold shadow-2xs transition-colors cursor-pointer shrink-0"
                title="ই-পেপার সংস্করণ পড়ুন"
              >
                <Newspaper className="w-3.5 h-3.5 shrink-0" />
                <span>ই-পেপার</span>
              </button>
            )}

            {/* Language Switch */}
            <button
              onClick={() => setLang(lang === 'bn' ? 'en' : 'bn')}
              className="flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 hover:text-red-600 transition-colors cursor-pointer shadow-2xs"
              title="ভাষা পরিবর্তন (Toggle Language)"
            >
              <Globe className="w-3 h-3 text-red-600" />
              <span>{lang === 'bn' ? 'EN' : 'বাংলা'}</span>
            </button>

            {/* Theme Toggle Button */}
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="p-1 rounded bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-gray-800 dark:text-gray-200 hover:text-red-600 transition-colors cursor-pointer shadow-2xs"
              title={darkMode ? 'লাইট মোড চালু করুন' : 'ডার্ক মোড চালু করুন'}
              aria-label="Toggle theme"
            >
              {darkMode ? <Sun className="w-3.5 h-3.5 text-amber-400" /> : <Moon className="w-3.5 h-3.5 text-gray-700" />}
            </button>

            {/* Direct Fast Admin Access Button - Only visible for verified admin sessions */}
            {showAdminAccess && (
              <button
                onClick={onOpenAdmin}
                className="flex items-center gap-1 px-2 sm:px-2.5 py-0.5 rounded border border-emerald-600/40 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 text-xs font-solaiman font-bold shadow-2xs transition-colors cursor-pointer"
                title="সম্পাদকীয় ও অ্যাডমিন প্যানেল"
              >
                <Settings className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>{lang === 'bn' ? 'অ্যাডমিন' : 'Admin'}</span>
              </button>
            )}

            {/* Authentication & User Profile / Login Options */}
            {!isAuth ? (
              <button
                onClick={onOpenLogin}
                className="flex items-center gap-1.5 px-2.5 sm:px-3 py-0.5 rounded text-xs font-solaiman font-bold bg-red-600 hover:bg-red-700 text-white shadow-xs transition-colors cursor-pointer whitespace-nowrap"
                title="অ্যাকাউন্টে লগইন বা সাইন আপ করুন"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>{lang === 'bn' ? 'লগইন' : 'Sign In'}</span>
              </button>
            ) : (
              <div className="relative flex items-center gap-1.5">
                <div className="relative">
                  <button
                    onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
                    className={`flex items-center gap-1.5 px-2 py-0.5 rounded border text-xs font-solaiman font-bold transition-all shadow-2xs cursor-pointer select-none ${
                      darkMode
                        ? 'bg-slate-800 border-slate-700 text-white hover:border-red-500'
                        : 'bg-white border-gray-300 text-gray-950 hover:border-red-500'
                    }`}
                    title="আমার অ্যাকাউন্ট ও প্রেস আইডি"
                  >
                    <img
                      src={currentUser?.avatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=100&q=80'}
                      alt={currentUser?.name || 'User'}
                      className="w-4 h-4 rounded-full object-cover border border-red-500 shrink-0"
                    />
                    <span className="font-bold text-gray-950 dark:text-white max-w-[80px] sm:max-w-[110px] truncate">
                      {currentUser?.name}
                    </span>
                    <ChevronDown className={`w-3 h-3 text-gray-500 transition-transform ${isUserDropdownOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {/* User Dropdown Menu */}
                  {isUserDropdownOpen && (
                    <div className={`absolute right-0 top-full mt-1.5 w-64 rounded-2xl shadow-2xl border py-2 z-50 font-solaiman animate-in fade-in zoom-in-95 duration-150 ${
                      darkMode ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-200 text-slate-900'
                    }`}>
                      {/* User Info Header */}
                      <div className="px-3.5 py-2.5 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
                        <div className="flex items-center gap-2.5">
                          <img
                            src={currentUser?.avatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=100&q=80'}
                            alt={currentUser?.name || 'User'}
                            className="w-9 h-9 rounded-full object-cover border-2 border-red-500 shrink-0"
                          />
                          <div className="min-w-0 flex-1">
                            <p className="font-bold text-xs text-slate-900 dark:text-white truncate">
                              {currentUser?.name}
                            </p>
                            <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                              {currentUser?.email}
                            </p>
                            <span className="inline-block mt-0.5 px-1.5 py-0.2 bg-red-100 dark:bg-red-950/80 text-red-700 dark:text-red-300 text-[10px] font-bold rounded">
                              {currentUser?.roleBn}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Menu Actions */}
                      <div className="p-1.5 space-y-0.5">
                        {onOpenUserProfile && (
                          <button
                            onClick={() => {
                              setIsUserDropdownOpen(false);
                              onOpenUserProfile();
                            }}
                            className="w-full text-left px-3 py-2 rounded-lg text-xs font-bold flex items-center gap-2 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-100 transition-colors cursor-pointer"
                          >
                            <CreditCard className="w-4 h-4 text-red-600 shrink-0" />
                            <span>আমার প্রোফাইল ও প্রেস আইডি কার্ড</span>
                          </button>
                        )}

                        {showAdminAccess && (
                          <button
                            onClick={() => {
                              setIsUserDropdownOpen(false);
                              onOpenAdmin();
                            }}
                            className="w-full text-left px-3 py-2 rounded-lg text-xs font-bold flex items-center gap-2 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-100 transition-colors cursor-pointer"
                          >
                            <Settings className="w-4 h-4 text-emerald-600 shrink-0" />
                            <span>সম্পাদকীয় ও অ্যাডমিন ড্যাশবোর্ড</span>
                          </button>
                        )}

                        {/* Fast Role Switcher - Only for verified admin sessions */}
                        {showAdminAccess && users.length > 1 && onSelectUser && (
                          <div className="pt-1.5 mt-1 border-t border-slate-100 dark:border-slate-800 px-3 py-1">
                            <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 mb-1">
                              ভূমিকা বা অ্যাকাউন্ট পরিবর্তন:
                            </label>
                            <select
                              value={currentUser?.id}
                              onChange={(e) => {
                                onSelectUser(e.target.value);
                                setIsUserDropdownOpen(false);
                              }}
                              className={`w-full text-xs font-solaiman font-bold px-2 py-1 rounded border outline-none cursor-pointer ${
                                darkMode
                                  ? 'bg-slate-800 border-slate-700 text-white'
                                  : 'bg-slate-50 border-slate-300 text-slate-900'
                              }`}
                            >
                              {users.map((u) => (
                                <option key={u.id} value={u.id} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">
                                  {u.name} ({u.roleBn})
                                </option>
                              ))}
                            </select>
                          </div>
                        )}

                        {/* Logout Option */}
                        {onLogout && (
                          <div className="pt-1 border-t border-slate-100 dark:border-slate-800">
                            <button
                              onClick={() => {
                                setIsUserDropdownOpen(false);
                                onLogout();
                              }}
                              className="w-full text-left px-3 py-2 rounded-lg text-xs font-bold flex items-center gap-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/50 transition-colors cursor-pointer"
                            >
                              <LogOut className="w-4 h-4 shrink-0" />
                              <span>লগআউট (Logout)</span>
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Direct Fast Logout Button on Desktop */}
                {onLogout && (
                  <button
                    onClick={onLogout}
                    className="hidden lg:flex items-center gap-1 px-2 py-0.5 rounded border border-red-200 dark:border-red-900/60 bg-red-50/60 dark:bg-red-950/30 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/50 text-[11px] font-bold font-solaiman cursor-pointer transition-all shadow-2xs"
                    title="অ্যাকাউন্ট থেকে লগআউট করুন"
                  >
                    <LogOut className="w-3 h-3" />
                    <span>লগআউট</span>
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ================= ROW 2: MAIN BROADSHEET BRAND HEADER ================= */}
      {/* Clean, Pristine, Uncrowded Brand Row with Proper Padding & Margins (Zero Button Overlap) */}
      <div className="max-w-7xl mx-auto px-4 py-3 sm:py-4 flex items-center justify-between gap-4 w-full">
        {/* Left: Brand Logo (Fully visible, zero crowding, pristine alignment) */}
        <div className="flex items-center min-w-0">
          <Logo 
            size="md" 
            customHeight={settings?.headerLogoHeight}
            customWidth={settings?.headerLogoWidth}
            darkMode={darkMode} 
            customLogoUrl={(darkMode ? settings?.darkLogoUrl : settings?.lightLogoUrl)?.trim() || undefined}
            siteName={settings?.siteName}
            tagline={settings?.tagline}
          />
        </div>

        {/* Right: Broadsheet Quick Reading Utilities (E-Paper, Web Stories, Citizen Journalism) */}
        <div className="flex items-center gap-2 sm:gap-2.5 shrink-0 ml-auto">


          {/* Web Stories / Programs Button */}
          {onOpenWebStories && (
            <button
              onClick={onOpenWebStories}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-solaiman font-bold text-gray-950 dark:text-white hover:text-red-600 hover:border-amber-600 shadow-2xs transition-colors cursor-pointer"
              title="ভিজ্যুয়াল ওয়েব স্টোরিজ"
            >
              <Sparkles className="w-4 h-4 text-amber-500 shrink-0" />
              <span>স্টোরিজ</span>
            </button>
          )}

          {/* Citizen Journalism / Send News Button */}
          {onOpenCitizenNews && (
            <button
              onClick={onOpenCitizenNews}
              className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-solaiman font-bold text-gray-950 dark:text-white hover:border-red-600 hover:text-red-600 shadow-2xs transition-colors cursor-pointer"
              title="নাগরিক সাংবাদিকতা — আপনার এলাকার খবর পাঠান"
            >
              <Send className="w-3.5 h-3.5 text-red-600 shrink-0" />
              <span>সংবাদ পাঠান</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
