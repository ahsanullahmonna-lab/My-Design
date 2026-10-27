import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  Download, 
  Printer, 
  RotateCw, 
  ShieldCheck, 
  QrCode, 
  CheckCircle2, 
  Globe,
  ExternalLink,
  Layers,
  Sparkles,
  Phone,
  Mail,
  MapPin,
  Award
} from 'lucide-react';
import { downloadPhotoCardImage } from '../../utils/photoCardExport';
import { UserItem, IdCardTemplateConfig } from '../../types/news';
import { useSiteConfig } from '../../context/SiteConfigContext';
import { 
  calculateOneYearValidity, 
  generateDomainBasedPressId, 
  generatePressCardQrCode,
  formatEnglishStaffName,
  formatEnglishStaffDesignation,
  DEFAULT_EDITOR_SIGNATURE_SVG,
  DEFAULT_PUBLISHER_SIGNATURE_SVG,
  DEFAULT_OFFICIAL_SEAL_SVG
} from '../../utils/pressIdCardGenerator';

// Strict English Numerals Formatter (e.g., +8801900000000)
export const formatFrontPhoneNumber = (rawPhone: string | undefined): string => {
  if (!rawPhone) return '+8801900000000';
  const bnToEnMap: Record<string, string> = {
    '০': '0', '১': '1', '২': '2', '৩': '3', '৪': '4',
    '৫': '5', '৬': '6', '৭': '7', '৮': '8', '৯': '9'
  };
  const normalized = rawPhone.replace(/[০-৯]/g, (d) => bnToEnMap[d] || d);
  const digits = normalized.replace(/\D/g, '');
  if (!digits) return normalized;

  if (digits.startsWith('880')) {
    return `+${digits}`;
  }
  if (digits.startsWith('01') && digits.length === 11) {
    return `+88${digits}`;
  }
  if (digits.startsWith('1') && digits.length === 10) {
    return `+880${digits}`;
  }
  if (normalized.trim().startsWith('+')) {
    return `+${digits}`;
  }
  if (digits.length >= 10) {
    return `+880${digits.replace(/^0+/, '')}`;
  }
  return normalized;
};

export const toEnDigits = (str: string | undefined): string => {
  if (!str) return '';
  const bnToEnMap: Record<string, string> = {
    '০': '0', '১': '1', '২': '2', '৩': '3', '৪': '4',
    '৫': '5', '৬': '6', '৭': '7', '৮': '8', '৯': '9'
  };
  return str.replace(/[০-৯]/g, (d) => bnToEnMap[d] || d);
};

interface DigitalIdCardProps {
  user: UserItem;
  template?: IdCardTemplateConfig;
  darkMode?: boolean;
  className?: string;
  onSideChange?: (side: 'front' | 'back' | 'both') => void;
  showControls?: boolean;
}

export const DigitalIdCard: React.FC<DigitalIdCardProps> = React.memo(({
  user,
  template: propTemplate,
  darkMode = false,
  className = '',
  showControls = true,
}) => {
  const { siteName, siteNameEn, domain, contactPhone, contactEmail, officeAddress, settings, lightLogoUrl } = useSiteConfig();
  const [activeView, setActiveView] = useState<'both' | 'front' | 'back'>('both');
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>('');
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadSuccessMsg, setDownloadSuccessMsg] = useState<string | null>(null);

  const frontCardRef = useRef<HTMLDivElement>(null);
  const backCardRef = useRef<HTMLDivElement>(null);
  const combinedRef = useRef<HTMLDivElement>(null);

  const template = propTemplate || settings?.idCardTemplate;
  const activeTemplateId = user.customTemplateId || template?.selectedTemplateId || 'classic-press';

  // Slogan visibility toggles (Requirement 1: লোগোর নিচে স্লোগান প্রদর্শন করুন)
  const isFrontSloganVisible = template?.showSloganUnderLogo !== false && template?.showFrontSlogan !== false;
  const isBackSloganVisible = template?.showSloganUnderLogo !== false && template?.showBackSlogan !== false;

  // Organization branding
  const orgName = template?.organizationName || siteName || 'নতুন দৃষ্টি';
  const orgNameEn = template?.organizationNameEn || siteNameEn || 'Notun Drishti';
  const logoImgUrl = template?.customLogoUrl || lightLogoUrl || settings?.lightLogoUrl;
  const website = template?.websiteUrl || (domain ? (domain.startsWith('http') ? domain : `www.${domain}`) : 'www.notundrishti.com');
  const phone = user.phone || template?.contactPhone || contactPhone || '+8801900000000';
  const portalPhones = template?.contactPhone || contactPhone || '+8801715248243, +8801577581026';
  const portalEmail = template?.contactEmail || contactEmail || 'notundrishti247@gmail.com';
  const portalAddress = template?.officeAddress || officeAddress || '578, Shikkhakpalli, Gaital, Kishoreganj.';

  // Strictly English formatted phone number (Requirement 2)
  const formattedFrontPhone = useMemo(() => {
    return formatFrontPhoneNumber(phone);
  }, [phone]);

  const formattedPortalPhones = useMemo(() => {
    return toEnDigits(portalPhones);
  }, [portalPhones]);

  // Domain-Based Unique ID Number (Requirement 3: e.g. ND20268492)
  const idNumber = useMemo(() => {
    if (user.idCardNumber && user.idCardNumber.trim().length >= 4) {
      return user.idCardNumber.trim();
    }
    return generateDomainBasedPressId(domain || template?.cardPrefix || 'ND', [], user.id);
  }, [user.idCardNumber, domain, template?.cardPrefix, user.id]);

  // Person-by-Person Custom Validity (Requirement 5)
  const validUntilText = useMemo(() => {
    if (user.idCardValidTill && user.idCardValidTill.trim()) {
      return user.idCardValidTill.trim();
    }
    if (template?.validTill && template.validTill.trim()) {
      return template.validTill.trim();
    }
    return calculateOneYearValidity(user.idCardIssuedAt || new Date()).validTill;
  }, [user.idCardValidTill, template?.validTill, user.idCardIssuedAt]);

  // Staff Name & Journalistic Designation strictly in English, excluding site roles (Requirement 2)
  const candidateName = useMemo(() => {
    return formatEnglishStaffName(user.name, user.nameEn);
  }, [user.name, user.nameEn]);

  const candidateRole = useMemo(() => {
    return formatEnglishStaffDesignation(user.designation, user.designationEn, user.role);
  }, [user.designation, user.designationEn, user.role]);

  const staffPhoto = user.avatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80';

  // Signatures & Seals
  const showEditor = template?.showEditorSignature !== false;
  const showPublisher = template?.showPublisherSignature !== false;
  const editorSig = template?.editorSignatureUrl || DEFAULT_EDITOR_SIGNATURE_SVG;
  const publisherSig = template?.publisherSignatureUrl || DEFAULT_PUBLISHER_SIGNATURE_SVG;
  const editorSeal = template?.editorSealUrl || '';
  const publisherSeal = template?.publisherSealUrl || '';

  // Generate QR Code dynamically with debouncing and memory safety (Requirement 1 & 4)
  useEffect(() => {
    let isCancelled = false;
    const timer = setTimeout(() => {
      generatePressCardQrCode({
        idNumber,
        staffName: candidateName,
        designation: candidateRole,
        phone: formattedFrontPhone,
        website,
        validTill: validUntilText,
      }).then((url) => {
        if (!isCancelled) setQrCodeDataUrl(url);
      });
    }, 150);

    return () => {
      isCancelled = true;
      clearTimeout(timer);
    };
  }, [idNumber, candidateName, candidateRole, formattedFrontPhone, website, validUntilText]);

  // High-Resolution Download handler using html-to-image
  const handleDownload = async (target: 'front' | 'back' | 'both') => {
    setIsDownloading(true);
    setDownloadSuccessMsg(null);
    try {
      let node: HTMLElement | null = null;
      let filename = `PRESS-CARD-${idNumber}-${target.toUpperCase()}.png`;

      if (target === 'front') {
        node = frontCardRef.current;
      } else if (target === 'back') {
        node = backCardRef.current;
      } else {
        node = combinedRef.current;
        filename = `PRESS-CARD-${idNumber}-SIDE-BY-SIDE.png`;
      }

      if (!node) throw new Error('Card element not found');

      await downloadPhotoCardImage(node, filename, {
        minWidth: 1200,
      });

      setDownloadSuccessMsg(`✓ ${target === 'both' ? 'হরাইজন্টাল উভয় পিঠ প্রেস কার্ড' : target === 'front' ? 'সামনের অংশ' : 'পেছনের অংশ'} ডাউনলোড সফল হয়েছে!`);
      setTimeout(() => setDownloadSuccessMsg(null), 4000);
    } catch (err) {
      console.error('Download error:', err);
      window.print();
    } finally {
      setIsDownloading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Controls Bar */}
      {showControls && (
        <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="font-bold text-slate-700 dark:text-slate-300">ভিউ মোড:</span>
            <div className="inline-flex rounded-lg border border-slate-300 dark:border-slate-600 p-0.5 bg-white dark:bg-slate-900">
              <button
                type="button"
                onClick={() => setActiveView('both')}
                className={`px-3 py-1 rounded-md font-bold transition-all cursor-pointer ${
                  activeView === 'both'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                উভয় পিঠ পাশাপাশি (Side-by-Side)
              </button>
              <button
                type="button"
                onClick={() => setActiveView('front')}
                className={`px-3 py-1 rounded-md font-bold transition-all cursor-pointer ${
                  activeView === 'front'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                সামনের অংশ (Front)
              </button>
              <button
                type="button"
                onClick={() => setActiveView('back')}
                className={`px-3 py-1 rounded-md font-bold transition-all cursor-pointer ${
                  activeView === 'back'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                পেছনের অংশ (Back)
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={isDownloading}
              onClick={() => handleDownload('front')}
              className="px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-600 hover:bg-white dark:hover:bg-slate-900 font-bold text-slate-700 dark:text-slate-200 flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
              title="শুধু সামনের অংশ ডাউনলোড করুন"
            >
              <Download className="w-3.5 h-3.5" />
              <span>ফ্রন্ট ডাউনলোড</span>
            </button>
            <button
              type="button"
              disabled={isDownloading}
              onClick={() => handleDownload('back')}
              className="px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-600 hover:bg-white dark:hover:bg-slate-900 font-bold text-slate-700 dark:text-slate-200 flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
              title="শুধু পেছনের অংশ ডাউনলোড করুন"
            >
              <Download className="w-3.5 h-3.5" />
              <span>ব্যাক ডাউনলোড</span>
            </button>
            <button
              type="button"
              disabled={isDownloading}
              onClick={() => handleDownload('both')}
              className="px-3.5 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white font-bold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer disabled:opacity-50"
              title="উভয় পিঠ পাশাপাশি হাই-রেজ্যুলুশন ইমেজে ডাউনলোড করুন"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{isDownloading ? 'প্রস্তুত হচ্ছে...' : 'উভয় পিঠ ডাউনলোড'}</span>
            </button>
            <button
              type="button"
              onClick={handlePrint}
              className="p-1.5 rounded-lg border border-slate-300 dark:border-slate-600 hover:bg-white dark:hover:bg-slate-900 text-slate-700 dark:text-slate-200 cursor-pointer"
              title="প্রিন্ট করুন"
            >
              <Printer className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {downloadSuccessMsg && (
        <div className="p-2.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 text-emerald-800 dark:text-emerald-200 text-xs font-bold flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{downloadSuccessMsg}</span>
        </div>
      )}

      {/* ================= ID CARD CONTAINER (Strictly Side-by-Side Horizontal Layout - Requirement 2) ================= */}
      <div 
        ref={combinedRef}
        className="w-full flex flex-row flex-nowrap items-center justify-center gap-6 overflow-x-auto p-4 md:p-6 bg-slate-100/70 dark:bg-slate-950/40 rounded-2xl border border-slate-200 dark:border-slate-800"
      >
        {/* ========================================================= */}
        {/* FRONT SIDE (Exact implementation of Reference Image Left) */}
        {/* ========================================================= */}
        {(activeView === 'both' || activeView === 'front') && (
          <div 
            ref={frontCardRef}
            className="w-[340px] sm:w-[380px] h-[580px] sm:h-[610px] shrink-0 bg-white rounded-none border border-slate-300 shadow-xl relative overflow-hidden flex flex-col justify-between select-none"
            style={{ 
              fontFamily: 'var(--font-solaiman, SolaimanLipi), sans-serif',
              backgroundImage: activeTemplateId === 'custom-uploaded' && template?.customFrontBgUrl ? `url(${template.customFrontBgUrl})` : undefined,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          >
            {/* Template Accents */}
            {activeTemplateId === 'classic-press' && (
              <>
                {/* Top-Left Geometric Blue Triangular Accents */}
                <div className="absolute top-0 left-0 w-32 h-28 pointer-events-none z-10">
                  <svg viewBox="0 0 120 110" className="w-full h-full" fill="none">
                    <polygon points="0,0 120,0 0,90" fill="#0284c7" />
                    <polygon points="0,0 85,0 0,65" fill="#0369a1" />
                    <polygon points="0,20 60,0 0,80" fill="#38bdf8" opacity="0.6" />
                  </svg>
                </div>
                {/* Subtle angled facet background shading */}
                <div className="absolute inset-0 pointer-events-none opacity-40">
                  <svg viewBox="0 0 380 610" className="w-full h-full" fill="none">
                    <polygon points="0,120 380,260 0,460" fill="#f1f5f9" />
                  </svg>
                </div>
                {/* Right green angular accent above red banner */}
                <div className="absolute right-0 bottom-[108px] w-14 h-36 pointer-events-none z-10">
                  <svg viewBox="0 0 60 160" className="w-full h-full" fill="none">
                    <path d="M60,0 L15,160 L60,160 Z" fill="#059669" />
                    <path d="M60,30 L30,160 L60,160 Z" fill="#047857" />
                  </svg>
                </div>
              </>
            )}

            {activeTemplateId === 'modern-executive' && (
              <>
                <div className="absolute top-0 inset-x-0 h-3 bg-gradient-to-r from-red-700 via-rose-600 to-amber-500 z-10" />
                <div className="absolute top-3 right-0 w-24 h-24 pointer-events-none z-10 opacity-20">
                  <svg viewBox="0 0 100 100" fill="none">
                    <circle cx="100" cy="0" r="100" fill="#dc2626" />
                  </svg>
                </div>
              </>
            )}

            {activeTemplateId === 'national-press' && (
              <>
                <div className="absolute top-0 inset-x-0 h-4 bg-[#059669] flex items-center justify-center z-10">
                  <span className="text-[9px] font-black tracking-widest text-white uppercase font-sans">
                    NATIONAL PRESS ACCREDITATION
                  </span>
                </div>
              </>
            )}

            {/* CARD TOP HEADER: Dynamic Site Logo & Subtitle */}
            <div className="pt-6 px-6 relative z-20 flex flex-col items-center text-center">
              <div className="flex flex-col items-center justify-center">
                {logoImgUrl ? (
                  <div className="flex flex-col items-center">
                    <img 
                      src={logoImgUrl} 
                      alt={orgName} 
                      className="h-10 sm:h-12 object-contain max-w-[240px]" 
                      crossOrigin="anonymous" 
                    />
                    {isFrontSloganVisible && (
                      <p className="text-[11px] font-semibold tracking-wider text-slate-700 mt-1 border-b border-red-600/60 pb-0.5">
                        {template?.organizationSubTitle || settings?.tagline || 'খ বর ,  ভি ন্ন  দৃ ষ্টি তে'}
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center">
                    <div className="flex items-center gap-1">
                      <div className="relative">
                        {/* Sun rays motif above logo */}
                        <div className="flex justify-center -mb-1">
                          <svg width="48" height="18" viewBox="0 0 48 18" fill="none">
                            <line x1="24" y1="16" x2="24" y2="2" stroke="#dc2626" strokeWidth="2" strokeLinecap="round"/>
                            <line x1="16" y1="16" x2="10" y2="4" stroke="#dc2626" strokeWidth="2" strokeLinecap="round"/>
                            <line x1="32" y1="16" x2="38" y2="4" stroke="#dc2626" strokeWidth="2" strokeLinecap="round"/>
                            <line x1="8" y1="16" x2="2" y2="9" stroke="#dc2626" strokeWidth="2" strokeLinecap="round"/>
                            <line x1="40" y1="16" x2="46" y2="9" stroke="#dc2626" strokeWidth="2" strokeLinecap="round"/>
                            <circle cx="24" cy="18" r="8" fill="#dc2626" />
                          </svg>
                        </div>
                        <h1 className="text-3xl sm:text-[34px] font-black tracking-tight text-slate-900 leading-none">
                          <span className="text-red-600 font-extrabold">{orgName.slice(0, 4)}</span>
                          <span className="text-slate-950">{orgName.slice(4)}</span>
                        </h1>
                      </div>
                    </div>
                    {isFrontSloganVisible && (
                      <p className="text-[11px] font-semibold tracking-wider text-slate-700 mt-0.5 border-b border-red-600/60 pb-0.5">
                        {template?.organizationSubTitle || settings?.tagline || 'খ বর ,  ভি ন্ন  দৃ ষ্টি তে'}
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* CIRCULAR PROFESSIONAL PHOTO FRAME */}
            <div className="flex flex-col items-center justify-center my-auto relative z-20">
              <div className="w-[170px] h-[170px] sm:w-[185px] sm:h-[185px] rounded-full p-[5px] bg-gradient-to-tr from-[#1d4ed8] via-[#1e40af] to-[#2563eb] shadow-md flex items-center justify-center">
                <div className="w-full h-full rounded-full overflow-hidden bg-slate-100 border-[3px] border-white">
                  <img 
                    src={staffPhoto} 
                    alt={candidateName}
                    crossOrigin="anonymous"
                    className="w-full h-full object-cover object-top"
                  />
                </div>
              </div>

              {/* Staff Name & Journalistic Designation Strictly in English (Requirement 2) */}
              <div className="mt-3.5 text-center px-4 w-full">
                <h2 className="text-2xl sm:text-[26px] font-black text-[#1e3a8a] leading-tight tracking-wide uppercase font-sans">
                  {candidateName}
                </h2>
                <p className="text-base sm:text-lg font-extrabold text-slate-800 mt-0.5 tracking-wide font-sans">
                  {candidateRole}
                </p>
                {/* Horizontal Cyan Divider Line */}
                <div className="w-56 mx-auto h-[2px] bg-[#06b6d4] mt-2 mb-3" />
              </div>

              {/* ID NO & Phone Number + Dynamic QR Code Row */}
              <div className="w-full px-6 flex items-center justify-between">
                <div className="text-left space-y-1.5 font-bold font-mono">
                  <div className="text-xs sm:text-[13px] flex items-center gap-1.5 text-slate-900">
                    <span className="font-extrabold w-16 sm:w-[72px] text-slate-700 tracking-wider shrink-0">
                      {template?.idLabelText || 'ID NO.'}
                    </span>
                    <span className="font-bold text-slate-400">:</span>
                    <span className="font-black text-[#1e3a8a] tracking-wider font-mono">{toEnDigits(idNumber)}</span>
                  </div>
                  <div className="text-xs sm:text-[13px] flex items-center gap-1.5 text-slate-900">
                    <span className="font-extrabold text-slate-700 w-16 sm:w-[72px] tracking-wider shrink-0">
                      {template?.phoneLabelText || 'Phone'}
                    </span>
                    <span className="font-bold text-slate-400">:</span>
                    <span className="font-black text-[#1e3a8a] tracking-wider font-mono">{formattedFrontPhone}</span>
                  </div>
                  {template?.showGovtRegNumber && template?.govtRegNumber && (
                    <div className="text-xs sm:text-[13px] flex items-center gap-1.5 text-slate-900">
                      <span className="font-extrabold text-slate-700 w-16 sm:w-[72px] tracking-wider shrink-0">
                        Reg No
                      </span>
                      <span className="font-bold text-slate-400">:</span>
                      <span className="font-black text-[#1e3a8a] tracking-wider font-mono">
                        {toEnDigits(template.govtRegNumber)}
                      </span>
                    </div>
                  )}
                  {/* Dynamic Front Custom Lines (Blood Group, Reg No, etc.) - Perfectly Aligned */}
                  {template?.customLines?.filter(l => l.page === 'front').map(l => (
                    <div key={l.id} className="text-xs sm:text-[13px] flex items-center gap-1.5 text-slate-900">
                      <span className="font-extrabold text-slate-700 w-16 sm:w-[72px] tracking-wider shrink-0 truncate" title={l.label}>
                        {l.label}
                      </span>
                      <span className="font-bold text-slate-400">:</span>
                      <span className="font-black text-[#1e3a8a] tracking-wider font-mono">
                        {toEnDigits(l.value)}
                      </span>
                    </div>
                  ))}
                </div>

                {/* QR Code */}
                <div className="p-1 bg-white border border-slate-300 rounded shadow-xs shrink-0">
                  {qrCodeDataUrl ? (
                    <img 
                      src={qrCodeDataUrl} 
                      alt="Verification QR" 
                      className="w-16 h-16 sm:w-[72px] sm:h-[72px] object-contain"
                    />
                  ) : (
                    <div className="w-16 h-16 bg-slate-100 flex items-center justify-center">
                      <QrCode className="w-8 h-8 text-slate-400" />
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* BOTTOM RED "PRESS" BANNER */}
            <div className="w-full bg-[#dc2626] text-white pt-2 pb-2.5 px-4 text-center relative z-20 shadow-md">
              <div className="text-3xl sm:text-4xl font-black tracking-[0.25em] leading-none mb-1 text-white uppercase font-sans">
                {template?.pressBannerText || 'PRESS'}
              </div>
              <div className="text-xs sm:text-[13px] font-semibold text-white/95 tracking-wide font-mono">
                {template?.websiteUrl || website}
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* BACK SIDE (Exact implementation of Reference Image Right) */}
        {/* ========================================================= */}
        {(activeView === 'both' || activeView === 'back') && (
          <div 
            ref={backCardRef}
            className="w-[340px] sm:w-[380px] h-[580px] sm:h-[610px] shrink-0 bg-white rounded-none border border-slate-300 shadow-xl relative overflow-hidden flex flex-col justify-between p-6 select-none"
            style={{ 
              fontFamily: 'var(--font-solaiman, SolaimanLipi), sans-serif',
              backgroundImage: activeTemplateId === 'custom-uploaded' && template?.customBackBgUrl ? `url(${template.customBackBgUrl})` : undefined,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          >
            {/* Top-Right Geometric Blue Triangular Accents */}
            {activeTemplateId === 'classic-press' && (
              <>
                <div className="absolute top-0 right-0 w-32 h-28 pointer-events-none z-10">
                  <svg viewBox="0 0 120 110" className="w-full h-full" fill="none">
                    <polygon points="120,0 0,0 120,90" fill="#0284c7" />
                    <polygon points="120,0 35,0 120,65" fill="#0369a1" />
                    <polygon points="120,20 60,0 120,80" fill="#38bdf8" opacity="0.6" />
                  </svg>
                </div>
                {/* Bottom-Right Light Cyan Accent */}
                <div className="absolute bottom-0 right-0 w-28 h-32 pointer-events-none z-10">
                  <svg viewBox="0 0 100 120" className="w-full h-full" fill="none">
                    <polygon points="100,0 100,120 0,120" fill="#38bdf8" opacity="0.8" />
                    <polygon points="100,50 100,120 40,120" fill="#0284c7" opacity="0.9" />
                  </svg>
                </div>
              </>
            )}

            {/* TOP HEADER: Dynamic Site Logo */}
            <div className="relative z-20 flex flex-col items-start pt-1">
              <div className="flex flex-col items-start">
                {logoImgUrl ? (
                  <div>
                    <img 
                      src={logoImgUrl} 
                      alt={orgName} 
                      className="h-8 sm:h-9 object-contain max-w-[190px]" 
                      crossOrigin="anonymous" 
                    />
                    {isBackSloganVisible && (
                      <p className="text-[10px] font-semibold tracking-wider text-slate-700 mt-0.5 border-b border-red-600/60 pb-0.5">
                        {template?.organizationSubTitle || settings?.tagline || 'খ বর ,  ভি ন্ন  দৃ ষ্টি তে'}
                      </p>
                    )}
                  </div>
                ) : (
                  <div>
                    <div className="relative">
                      <div className="flex justify-start -mb-1 pl-2">
                        <svg width="40" height="15" viewBox="0 0 48 18" fill="none">
                          <line x1="24" y1="16" x2="24" y2="2" stroke="#dc2626" strokeWidth="2" strokeLinecap="round"/>
                          <line x1="16" y1="16" x2="10" y2="4" stroke="#dc2626" strokeWidth="2" strokeLinecap="round"/>
                          <line x1="32" y1="16" x2="38" y2="4" stroke="#dc2626" strokeWidth="2" strokeLinecap="round"/>
                          <circle cx="24" cy="18" r="8" fill="#dc2626" />
                        </svg>
                      </div>
                      <h1 className="text-2xl sm:text-[28px] font-black tracking-tight text-slate-900 leading-none">
                        <span className="text-red-600 font-extrabold">{orgName.slice(0, 4)}</span>
                        <span className="text-slate-950">{orgName.slice(4)}</span>
                      </h1>
                    </div>
                    {isBackSloganVisible && (
                      <p className="text-[10px] font-semibold tracking-wider text-slate-700 mt-0.5 border-b border-red-600/60 pb-0.5">
                        {template?.organizationSubTitle || settings?.tagline || 'খ বর ,  ভি ন্ন  দৃ ষ্টি তে'}
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* "PRESS CARD" HEADER & OWNERSHIP NOTICE (Requirement 4: 100% Dynamic) */}
            <div className="relative z-20 text-center mt-3">
              <h2 className="text-3xl sm:text-4xl font-black text-[#dc2626] tracking-tight leading-none uppercase font-sans">
                {template?.backHeaderTitle || 'PRESS CARD'}
              </h2>
              <p className="text-xs sm:text-[13px] font-bold text-slate-900 mt-1 font-sans">
                {template?.ownershipNotice || `This card is the property of ${orgNameEn}`}
              </p>
              {/* Cyan divider */}
              <div className="w-full h-[1.5px] bg-[#0891b2] mt-2 mb-2" />
            </div>

            {/* PORTAL CONTACT DETAILS */}
            <div className="relative z-20 text-xs sm:text-[12.5px] text-slate-800 space-y-1 font-medium pl-1">
              <div className="flex items-baseline gap-1">
                <span className="font-bold w-16 text-slate-900 shrink-0">{template?.websiteLabel || 'Website'}</span>
                <span>:</span>
                <span className="text-[#0284c7] font-bold font-mono text-[13px]">{website}</span>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="font-bold w-16 text-slate-900 shrink-0">{template?.phoneLabel || 'Phone'}</span>
                <span>:</span>
                <span className="font-mono font-bold text-slate-900">{formattedPortalPhones}</span>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="font-bold w-16 text-slate-900 shrink-0">{template?.emailLabel || 'Email'}</span>
                <span>:</span>
                <span className="font-mono">{portalEmail}</span>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="font-bold w-16 text-slate-900 shrink-0">{template?.addressLabel || 'Address'}</span>
                <span>:</span>
                <span className="text-[11px] leading-tight">{portalAddress}</span>
              </div>
              {template?.showOfficialRegLine && template?.officialRegLine && (
                <div className="flex items-baseline gap-1">
                  <span className="font-bold w-16 text-slate-900 shrink-0">Reg No</span>
                  <span>:</span>
                  <span className="font-mono font-semibold text-slate-800">{toEnDigits(template.officialRegLine)}</span>
                </div>
              )}
              {/* Dynamic Back Custom Lines - Perfectly Aligned */}
              {template?.customLines?.filter(l => l.page === 'back').map(l => (
                <div key={l.id} className="flex items-baseline gap-1">
                  <span className="font-bold w-16 text-slate-900 shrink-0 truncate" title={l.label}>
                    {l.label}
                  </span>
                  <span>:</span>
                  <span className="font-semibold text-slate-800 font-mono">
                    {toEnDigits(l.value)}
                  </span>
                </div>
              ))}
            </div>

            {/* Divider */}
            <div className="w-full h-[1.5px] bg-[#0891b2] my-1 relative z-20" />

            {/* PROFESSIONAL COLLABORATION REQUEST NOTICE */}
            <div className="relative z-20 text-center px-1">
              <p className="text-[11.5px] sm:text-xs leading-relaxed text-slate-800 font-medium font-sans">
                {template?.cooperationNotice || 'All concerned are requested to provide full cooperation to the holder of this press card in the performance of his/her professional duties.'}
              </p>
            </div>

            {/* Divider */}
            <div className="w-full h-[1.5px] bg-[#0891b2] my-1 relative z-20" />

            {/* VALIDITY NOTICE (Requirement 3 & 5: Person-by-Person Custom Validity) */}
            <div className="relative z-20 text-center my-1">
              <p className="text-sm sm:text-base font-black text-[#dc2626] font-sans">
                {template?.validityPrefixText || 'Validity until:'} {validUntilText}
              </p>
            </div>

            {/* SIGNATURE & SEAL BLOCKS (Editor & Publisher) */}
            <div className="relative z-20 grid grid-cols-2 gap-6 pt-2 pb-1">
              {/* Editor Block */}
              <div className="text-center flex flex-col items-center justify-end">
                <div className="h-12 w-full flex items-center justify-center relative mb-1">
                  {showEditor && (
                    <>
                      {editorSeal && (
                        <img 
                          src={editorSeal} 
                          alt="Seal" 
                          className="absolute w-12 h-12 object-contain opacity-75"
                        />
                      )}
                      <img 
                        src={editorSig} 
                        alt="Editor Signature" 
                        className="max-h-11 max-w-[120px] object-contain relative z-10"
                      />
                    </>
                  )}
                </div>
                <div className="w-32 h-[1.5px] bg-slate-900 mb-1" />
                <span className="text-xs sm:text-[13px] font-bold text-slate-900 block font-sans">
                  {template?.editorTitle || 'Editor'}
                </span>
              </div>

              {/* Publisher Block */}
              <div className="text-center flex flex-col items-center justify-end">
                <div className="h-12 w-full flex items-center justify-center relative mb-1">
                  {showPublisher && (
                    <>
                      {publisherSeal && (
                        <img 
                          src={publisherSeal} 
                          alt="Seal" 
                          className="absolute w-12 h-12 object-contain opacity-75"
                        />
                      )}
                      <img 
                        src={publisherSig} 
                        alt="Publisher Signature" 
                        className="max-h-11 max-w-[120px] object-contain relative z-10"
                      />
                    </>
                  )}
                </div>
                <div className="w-32 h-[1.5px] bg-slate-900 mb-1" />
                <span className="text-xs sm:text-[13px] font-bold text-slate-900 block font-sans">
                  {template?.publisherTitle || 'Publisher'}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
});
