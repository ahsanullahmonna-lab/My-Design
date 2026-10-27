import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Search, 
  Menu, 
  X, 
  Home,
  Flame, 
  ChevronRight, 
  ChevronLeft, 
  Newspaper, 
  Sparkles, 
  Send, 
  MapPin,
  User,
  LogIn,
  LogOut,
  Settings,
  CreditCard
} from 'lucide-react';
import { CategoryItem, UserItem } from '../../types/news';
import { Logo } from './Logo';
import { canAccessAdmin } from '../../utils/rbac';
import { isSecretAdminAuthorized } from '../../utils/adminSecurity';
import { useSiteConfig } from '../../context/SiteConfigContext';

interface NavbarProps {
  categories: CategoryItem[];
  activeCategory: string;
  onSelectCategory: (id: string) => void;
  onOpenSearch: () => void;
  darkMode: boolean;
  lang: 'bn' | 'en';
  onOpenEPaper?: () => void;
  isEPaperActive?: boolean;
  onOpenWebStories?: () => void;
  onOpenCitizenNews?: () => void;
  onOpenDistrictFilter?: () => void;
  selectedDistrict?: string | null;
  currentUser?: UserItem;
  isLoggedIn?: boolean;
  onOpenLogin?: () => void;
  onLogout?: () => void;
  onOpenAdmin?: () => void;
  onOpenUserProfile?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  categories,
  activeCategory,
  onSelectCategory,
  onOpenSearch,
  darkMode,
  lang,
  onOpenEPaper,
  isEPaperActive = false,
  onOpenWebStories,
  onOpenCitizenNews,
  onOpenDistrictFilter,
  selectedDistrict,
  currentUser,
  isLoggedIn,
  onOpenLogin,
  onLogout,
  onOpenAdmin,
  onOpenUserProfile,
}) => {
  const siteConfig = useSiteConfig();
  const currentSiteName = siteConfig?.settings?.siteName || 'নিউজ পোর্টাল';
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [drawerSearch, setDrawerSearch] = useState('');
  const isAuth = isLoggedIn ?? Boolean(currentUser && currentUser.id !== 'guest');
  const showAdminAccess = Boolean(isAuth && currentUser && canAccessAdmin(currentUser.role) && isSecretAdminAuthorized());
  const [isScrolled, setIsScrolled] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const lastScrollY = useRef(0);

  // Swipeable & Scrollable Horizontal Category Bar with Drag-to-Scroll & Touch Navigation
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [isMouseDown, setIsMouseDown] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollStart, setScrollStart] = useState(0);
  const [draggedDistance, setDraggedDistance] = useState(0);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const updateScrollIndicators = useCallback(() => {
    const el = scrollContainerRef.current;
    if (!el) return;
    const threshold = 6;
    setCanScrollLeft(el.scrollLeft > threshold);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - threshold);
  }, []);

  useEffect(() => {
    updateScrollIndicators();
    const el = scrollContainerRef.current;
    if (!el) return;

    el.addEventListener('scroll', updateScrollIndicators, { passive: true });
    window.addEventListener('resize', updateScrollIndicators);
    return () => {
      el.removeEventListener('scroll', updateScrollIndicators);
      window.removeEventListener('resize', updateScrollIndicators);
    };
  }, [updateScrollIndicators, categories]);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0 || !scrollContainerRef.current) return;
    setIsMouseDown(true);
    setStartX(e.pageX - scrollContainerRef.current.offsetLeft);
    setScrollStart(scrollContainerRef.current.scrollLeft);
    setDraggedDistance(0);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isMouseDown || !scrollContainerRef.current) return;
    const currentX = e.pageX - scrollContainerRef.current.offsetLeft;
    const delta = currentX - startX;
    setDraggedDistance(Math.abs(delta));
    scrollContainerRef.current.scrollLeft = scrollStart - delta;
    updateScrollIndicators();
  };

  const handleMouseUpOrLeave = () => {
    setIsMouseDown(false);
    setTimeout(() => {
      setDraggedDistance(0);
    }, 60);
  };

  const handleScrollStep = (direction: 'left' | 'right') => {
    if (!scrollContainerRef.current) return;
    const step = direction === 'left' ? -220 : 220;
    scrollContainerRef.current.scrollBy({ left: step, behavior: 'smooth' });
    setTimeout(updateScrollIndicators, 250);
  };

  // Group top-level categories and sub-menus
  const parentIdMap = new Set(categories.map(c => c.id));
  const mainNavItems = categories.filter(c => !c.parentId || !parentIdMap.has(c.parentId));
  const getSubItems = (parentId: string) => categories.filter(c => c.parentId === parentId);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      if (currentScrollY > 60) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
        setIsVisible(true);
      }

      if (currentScrollY > 150) {
        if (currentScrollY > lastScrollY.current && currentScrollY - lastScrollY.current > 10) {
          setIsVisible(false);
        } else if (lastScrollY.current - currentScrollY > 5) {
          setIsVisible(true);
        }
      } else {
        setIsVisible(true);
      }

      lastScrollY.current = currentScrollY;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });

    // Keyboard shortcut for Search (Cmd+K / Ctrl+K)
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        onOpenSearch();
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onOpenSearch]);

  const handleHomeClick = () => {
    onSelectCategory('latest');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <nav
      className={`sticky top-0 z-40 w-full transition-all duration-300 ease-in-out border-b ${
        isVisible ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0 pointer-events-none md:pointer-events-auto md:translate-y-0 md:opacity-100'
      } ${
        isScrolled
          ? darkMode
            ? 'bg-slate-900/98 border-slate-800 text-white backdrop-blur-md shadow-md'
            : 'bg-white/98 border-gray-200 text-gray-900 backdrop-blur-md shadow-sm'
          : darkMode
            ? 'bg-slate-900 border-slate-800 text-white'
            : 'bg-white border-gray-200 text-gray-900'
      }`}
    >


      {/* 2. Horizontal Category Bar (Both Mobile and Desktop) */}
      <div className="max-w-7xl mx-auto px-2 sm:px-4 flex items-center justify-between gap-1 sm:gap-2 flex-nowrap w-full relative">
        {/* Home Icon Button (Leftmost anchor matching Screenshot 2) */}
        <button
          onClick={handleHomeClick}
          className={`flex items-center justify-center p-2 rounded-sm shrink-0 transition-colors cursor-pointer ${
            activeCategory === 'latest' || !activeCategory
              ? 'text-red-600 dark:text-red-400 font-black'
              : 'text-gray-950 dark:text-white hover:text-red-600'
          }`}
          title="হোম পেজে ফিরে যান"
          aria-label="Home"
        >
          <Home className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
        </button>

        {/* Left Scroll Indicator Arrow (Desktop/Tablet) */}
        {canScrollLeft && (
          <button
            onClick={() => handleScrollStep('left')}
            className={`hidden sm:flex items-center justify-center w-6 h-6 rounded-full shrink-0 shadow-xs transition-all cursor-pointer z-20 ${
              darkMode
                ? 'bg-slate-800 text-slate-200 hover:bg-slate-700 border border-slate-700'
                : 'bg-white text-gray-800 hover:bg-gray-100 border border-gray-300'
            }`}
            title="বামে স্ক্রোল করুন"
            aria-label="Scroll left"
          >
            <ChevronLeft className="w-3.5 h-3.5 text-red-600" />
          </button>
        )}

        {/* Primary Category Bar: Horizontal Scroll with Zero-Pill Broadsheet Discipline */}
        <div
          ref={scrollContainerRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUpOrLeave}
          onMouseLeave={handleMouseUpOrLeave}
          className={`flex items-center space-x-1 sm:space-x-2 overflow-x-auto no-scrollbar scroll-smooth py-1 flex-1 min-w-0 select-none ${
            isMouseDown ? 'cursor-grabbing' : 'cursor-grab sm:cursor-auto'
          }`}
          style={{ WebkitOverflowScrolling: 'touch', scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {/* Latest Category Button */}
          <button
            onClick={() => {
              if (draggedDistance > 6) return;
              onSelectCategory('latest');
            }}
            className={`px-2.5 sm:px-3 py-1.5 text-xs sm:text-sm font-solaiman font-bold shrink-0 whitespace-nowrap transition-colors cursor-pointer border-b-2 ${
              activeCategory === 'latest'
                ? 'text-red-600 dark:text-red-400 font-black border-red-600'
                : 'border-transparent text-gray-950 dark:text-white hover:text-red-600'
            }`}
          >
            <span>{lang === 'bn' ? 'সর্বশেষ' : 'Latest'}</span>
          </button>

          {/* All Main Nav Categories */}
          {mainNavItems.filter(c => c.id !== 'latest').map((cat) => {
            const isActive = activeCategory === cat.id;

            return (
              <button
                key={cat.id}
                onClick={() => {
                  if (draggedDistance > 6) return;
                  onSelectCategory(cat.id);
                }}
                className={`px-2.5 sm:px-3 py-1.5 text-xs sm:text-sm font-solaiman font-bold shrink-0 whitespace-nowrap transition-colors cursor-pointer border-b-2 ${
                  isActive
                    ? 'text-red-600 dark:text-red-400 font-black border-red-600'
                    : 'border-transparent text-gray-950 dark:text-white hover:text-red-600'
                }`}
              >
                <span>{lang === 'bn' ? cat.nameBn : cat.nameEn}</span>
              </button>
            );
          })}
        </div>

        {/* Right Scroll Indicator Arrow (Desktop/Tablet) */}
        {canScrollRight && (
          <button
            onClick={() => handleScrollStep('right')}
            className={`hidden sm:flex items-center justify-center w-6 h-6 rounded-full shrink-0 shadow-xs transition-all cursor-pointer z-20 ${
              darkMode
                ? 'bg-slate-800 text-slate-200 hover:bg-slate-700 border border-slate-700'
                : 'bg-white text-gray-800 hover:bg-gray-100 border border-gray-300'
            }`}
            title="ডানে স্ক্রোল করুন"
            aria-label="Scroll right"
          >
            <ChevronRight className="w-3.5 h-3.5 text-red-600" />
          </button>
        )}

        {/* Search, Admin & Menu Drawer Trigger */}
        <div className="flex items-center gap-1 sm:gap-1.5 shrink-0 pl-1 border-l border-gray-200 dark:border-slate-800">
          {/* Direct Admin Access Button - Only visible for verified admin sessions */}
          {showAdminAccess && onOpenAdmin && (
            <button
              onClick={onOpenAdmin}
              className="flex items-center gap-1 px-1.5 sm:px-2 py-1 text-xs font-solaiman font-bold text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 rounded transition-colors cursor-pointer"
              title="অ্যাডমিন প্যানেল"
              aria-label="Admin Dashboard"
            >
              <Settings className="w-4 h-4 text-emerald-600 shrink-0" />
              <span className="hidden sm:inline font-bold">অ্যাডমিন</span>
            </button>
          )}

          <button
            onClick={onOpenSearch}
            className="flex items-center gap-1.5 px-2 sm:px-2.5 py-1 text-xs font-solaiman font-bold text-gray-900 dark:text-white hover:text-red-600 rounded transition-colors cursor-pointer"
            title="সংবাদ খুঁজুন (Ctrl+K)"
          >
            <Search className="w-4 h-4 text-red-600" />
            <span className="hidden lg:inline">{lang === 'bn' ? 'খুঁজুন' : 'Search'}</span>
          </button>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className={`p-1.5 rounded transition-colors cursor-pointer ${
              mobileMenuOpen
                ? 'bg-red-50 dark:bg-red-950/60 text-red-600'
                : 'text-gray-950 dark:text-white hover:bg-gray-100 dark:hover:bg-slate-800'
            }`}
            title="সকল বিভাগ ও সূচি"
            aria-label="All Categories"
          >
            {mobileMenuOpen ? <X className="w-4.5 h-4.5 text-red-600" /> : <Menu className="w-4.5 h-4.5" />}
          </button>
        </div>
      </div>

      {/* 3. Broadsheet Category Directory & Search Drawer (Matching Kalbela Screenshot 1) */}
      {mobileMenuOpen && (
        <div className={`border-t transition-all shadow-2xl ${
          darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-gray-300'
        }`}>
          {/* Top Search Input Box matching Screenshot 1 */}
          <div className="max-w-4xl mx-auto p-3 sm:p-4 border-b border-gray-200 dark:border-slate-800">
            <div className="flex items-center gap-0 max-w-xl mx-auto">
              <input
                type="text"
                value={drawerSearch}
                onChange={(e) => setDrawerSearch(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    onOpenSearch();
                    setMobileMenuOpen(false);
                  }
                }}
                placeholder={lang === 'bn' ? 'যা খুঁজতে চান...' : 'Search news...'}
                className="flex-1 bg-white dark:bg-slate-800 border border-r-0 border-gray-300 dark:border-slate-700 px-3.5 py-2 text-sm font-solaiman text-gray-950 dark:text-white placeholder:text-gray-500 rounded-l focus:outline-none focus:border-red-600"
              />
              <button
                onClick={() => {
                  onOpenSearch();
                  setMobileMenuOpen(false);
                }}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-r flex items-center justify-center cursor-pointer transition-colors shadow-xs"
                title="অনুসন্ধান"
              >
                <Search className="w-4 h-4 text-white" />
              </button>
            </div>
          </div>

          <div className="max-w-4xl mx-auto px-4 py-3 sm:py-6 space-y-4">
            {/* 2-Column Broadsheet Category Directory Grid matching Screenshot 1 */}
            <div className="grid grid-cols-2 gap-x-6 sm:gap-x-12">
              {mainNavItems.map((cat) => {
                const subItems = getSubItems(cat.id);
                const isActive = activeCategory === cat.id;

                return (
                  <div key={cat.id} className="border-b border-gray-200 dark:border-slate-800">
                    <button
                      onClick={() => {
                        onSelectCategory(cat.id);
                        setMobileMenuOpen(false);
                      }}
                      className={`w-full py-2.5 px-1 flex items-center justify-between text-left font-solaiman text-sm sm:text-base font-bold transition-colors cursor-pointer ${
                        isActive
                          ? 'text-red-600 font-black'
                          : 'text-gray-950 dark:text-white hover:text-red-600'
                      }`}
                    >
                      <span>{lang === 'bn' ? cat.nameBn : cat.nameEn}</span>
                      {subItems.length > 0 && (
                        <span className="text-[10px] font-bold text-gray-500 dark:text-gray-400">
                          {subItems.length}টি উপ-বিভাগ
                        </span>
                      )}
                    </button>
                    {subItems.length > 0 && (
                      <div className="pb-2 pl-3 grid grid-cols-2 gap-1">
                        {subItems.map((sub) => (
                          <button
                            key={sub.id}
                            onClick={() => {
                              onSelectCategory(sub.id);
                              setMobileMenuOpen(false);
                            }}
                            className="text-left text-xs font-solaiman text-gray-700 dark:text-gray-300 hover:text-red-600 py-1 flex items-center gap-1 cursor-pointer"
                          >
                            <span className="text-red-600">↳</span>
                            <span>{lang === 'bn' ? sub.nameBn : sub.nameEn}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Quick Actions & Utilities Bar */}
            <div className="pt-4 border-t border-gray-200 dark:border-slate-800 space-y-3">
              {/* Authentication & User Profile Card */}
              {isAuth ? (
                <div className={`p-3.5 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs ${
                  darkMode ? 'bg-slate-800/95 border-slate-700' : 'bg-gray-50 border-gray-300'
                }`}>
                  <div className="flex items-center gap-3 min-w-0">
                    <img
                      src={currentUser?.avatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=100&q=80'}
                      alt={currentUser?.name}
                      className="w-10 h-10 rounded-full object-cover border-2 border-red-500 shrink-0"
                    />
                    <div className="min-w-0">
                      <p className="font-black text-sm text-gray-950 dark:text-white truncate font-solaiman">
                        {currentUser?.name}
                      </p>
                      <span className="inline-block text-[11px] text-red-600 dark:text-red-400 font-bold font-solaiman">
                        {currentUser?.roleBn}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
                    {showAdminAccess && onOpenAdmin && (
                      <button
                        onClick={() => {
                          onOpenAdmin();
                          setMobileMenuOpen(false);
                        }}
                        className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-solaiman font-bold text-xs shadow-xs transition-colors cursor-pointer"
                        title="অ্যাডমিন প্যানেলে যান"
                      >
                        <Settings className="w-3.5 h-3.5" />
                        <span>অ্যাডমিন প্যানেল</span>
                      </button>
                    )}
                    {onLogout && (
                      <button
                        onClick={() => {
                          onLogout();
                          setMobileMenuOpen(false);
                        }}
                        className="flex items-center justify-center gap-1 px-3 py-1.5 rounded-lg border border-red-300 dark:border-red-900/60 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 font-solaiman font-bold text-xs transition-colors cursor-pointer"
                        title="লগআউট করুন"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>লগআউট</span>
                      </button>
                    )}
                  </div>
                </div>
              ) : (
                <div className={`p-3.5 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs ${
                  darkMode ? 'bg-slate-800/95 border-slate-700' : 'bg-gray-50 border-gray-300'
                }`}>
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-full bg-red-100 dark:bg-red-950/60 flex items-center justify-center text-red-600 shrink-0">
                      <User className="w-4.5 h-4.5" />
                    </div>
                    <div>
                      <p className="text-xs sm:text-sm font-bold text-gray-950 dark:text-white font-solaiman">
                        {currentSiteName} পাঠক ও ইউজার অ্যাকাউন্ট
                      </p>
                      <p className="text-[10px] sm:text-[11px] text-gray-500 dark:text-gray-400 font-solaiman">
                        মন্তব্য, বুকমার্ক ও নাগরিক সংবাদ পরিবেশনের জন্য লগইন করুন
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {onOpenLogin && (
                      <button
                        onClick={() => {
                          onOpenLogin();
                          setMobileMenuOpen(false);
                        }}
                        className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white font-solaiman font-bold text-xs shadow-xs cursor-pointer transition-colors"
                        title="লগইন বা রেজিস্টার করুন"
                      >
                        <LogIn className="w-3.5 h-3.5" />
                        <span>লগইন</span>
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* Utility Tiles (E-Paper, Stories, Citizen News, District, Press ID, Admin) */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {onOpenEPaper && (
                  <button
                    onClick={() => {
                      onOpenEPaper();
                      setMobileMenuOpen(false);
                    }}
                    className="flex items-center justify-center gap-2 p-2 rounded border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-950 dark:text-white font-solaiman font-bold text-xs hover:border-red-600 cursor-pointer shadow-2xs"
                  >
                    <Newspaper className="w-4 h-4 text-red-600 shrink-0" />
                    <span>ই-পেপার</span>
                  </button>
                )}

                {onOpenWebStories && (
                  <button
                    onClick={() => {
                      onOpenWebStories();
                      setMobileMenuOpen(false);
                    }}
                    className="flex items-center justify-center gap-2 p-2 rounded border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-950 dark:text-white font-solaiman font-bold text-xs hover:border-amber-600 cursor-pointer shadow-2xs"
                  >
                    <Sparkles className="w-4 h-4 text-amber-500 shrink-0" />
                    <span>স্টোরিজ</span>
                  </button>
                )}

                {onOpenDistrictFilter && (
                  <button
                    onClick={() => {
                      onOpenDistrictFilter();
                      setMobileMenuOpen(false);
                    }}
                    className="flex items-center justify-center gap-2 p-2 rounded border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-950 dark:text-white font-solaiman font-bold text-xs hover:border-red-600 cursor-pointer shadow-2xs"
                  >
                    <MapPin className="w-4 h-4 text-red-600 shrink-0" />
                    <span>জেলা নিউজ</span>
                  </button>
                )}

                {onOpenCitizenNews && (
                  <button
                    onClick={() => {
                      onOpenCitizenNews();
                      setMobileMenuOpen(false);
                    }}
                    className="flex items-center justify-center gap-2 p-2 rounded border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-950 dark:text-white font-solaiman font-bold text-xs hover:border-red-600 cursor-pointer shadow-2xs"
                  >
                    <Send className="w-4 h-4 text-red-600 shrink-0" />
                    <span>সংবাদ পাঠান</span>
                  </button>
                )}

                {onOpenUserProfile && isAuth && (
                  <button
                    onClick={() => {
                      onOpenUserProfile();
                      setMobileMenuOpen(false);
                    }}
                    className="flex items-center justify-center gap-2 p-2 rounded border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-950 dark:text-white font-solaiman font-bold text-xs hover:border-red-600 cursor-pointer shadow-2xs"
                  >
                    <CreditCard className="w-4 h-4 text-red-600 shrink-0" />
                    <span>প্রেস আইডি</span>
                  </button>
                )}

                {/* Direct Admin Panel Tile (Only visible for verified admin sessions) */}
                {showAdminAccess && onOpenAdmin && (
                  <button
                    onClick={() => {
                      onOpenAdmin();
                      setMobileMenuOpen(false);
                    }}
                    className="flex items-center justify-center gap-2 p-2 rounded border border-emerald-500/50 bg-emerald-50/70 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 font-solaiman font-bold text-xs hover:border-emerald-600 cursor-pointer shadow-2xs"
                    title="সম্পাদকীয় ও অ্যাডমিন ড্যাশবোর্ড"
                  >
                    <Settings className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>অ্যাডমিন প্যানেল</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};
