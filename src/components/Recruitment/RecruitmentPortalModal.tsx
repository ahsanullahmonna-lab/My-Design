import React, { useState, useRef } from 'react';
import { 
  X, 
  Send, 
  Briefcase, 
  FileText, 
  UploadCloud, 
  CheckCircle2, 
  ShieldCheck, 
  AlertCircle, 
  Loader2, 
  Trash2, 
  Eye, 
  Award,
  Sparkles,
  ArrowLeft,
  GraduationCap,
  CreditCard,
  Building2,
  Calendar,
  Phone,
  Mail,
  MapPin,
  Camera,
  Check
} from 'lucide-react';
import { JobApplication } from '../../types/news';
import { useSiteConfig } from '../../context/SiteConfigContext';
import { saveFileToLocalStorage, getLocalFileUrl } from '../../utils/localRecruitmentStorage';

interface RecruitmentPortalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmitApplication: (app: JobApplication) => void;
  darkMode?: boolean;
}

export const RecruitmentPortalModal: React.FC<RecruitmentPortalModalProps> = ({
  isOpen,
  onClose,
  onSubmitApplication,
  darkMode = false,
}) => {
  const { siteName, siteNameEn, settings } = useSiteConfig();
  const isRecruitmentActive = settings?.recruitmentEnabled !== false;

  // Dynamic Open Circular Positions configured by Admin (Requirement 2)
  const defaultOpenPositions = [
    'বার্তা সম্পাদক (News Editor)',
    'জ্যেষ্ঠ সহ-সম্পাদক / সহ-সম্পাদক (Sub-Editor)',
    'মাল্টিমিডিয়া ও সোশ্যাল মিডিয়া এডিটর (Multimedia Editor)',
    'নিজস্ব প্রতিবেদক / স্টাফ রিপোর্টার (Staff Reporter)',
    'জেলা প্রতিনিধি (District Correspondent)',
    'উপজেলা ও ক্যাম্পাস প্রতিনিধি (Upazila / University Correspondent)',
  ];
  const openPositions: string[] = settings?.openRecruitmentPositions && settings.openRecruitmentPositions.length > 0
    ? settings.openRecruitmentPositions
    : defaultOpenPositions;

  // Form Fields
  const [candidateName, setCandidateName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [district, setDistrict] = useState('ঢাকা');
  const [desiredRole, setDesiredRole] = useState(openPositions[0] || 'নিজস্ব প্রতিবেদক / স্টাফ রিপোর্টার (Staff Reporter)');
  const [education, setEducation] = useState('');
  const [experienceBio, setExperienceBio] = useState('');
  const [portfolioLinks, setPortfolioLinks] = useState('');
  
  // Local File Uploads (CV, NID & Photo) - No External Cloud Dependency (Requirement 2)
  const [cvLocalPath, setCvLocalPath] = useState('');
  const [cvFileName, setCvFileName] = useState('');
  const [isUploadingCv, setIsUploadingCv] = useState(false);

  const [idProofType, setIdProofType] = useState<'nid' | 'birth_certificate'>('nid');
  const [idProofLocalPath, setIdProofLocalPath] = useState('');
  const [idProofFileName, setIdProofFileName] = useState('');
  const [isUploadingIdProof, setIsUploadingIdProof] = useState(false);

  const [photoLocalPath, setPhotoLocalPath] = useState('');
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);

  // Multiple File Uploads state (Requirement 3)
  const [additionalFiles, setAdditionalFiles] = useState<{
    id: string;
    name: string;
    url: string;
    type?: string;
    sizeKb?: number;
    localPath?: string;
  }[]>([]);
  const [isUploadingAdditional, setIsUploadingAdditional] = useState(false);

  // Submission State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const cvInputRef = useRef<HTMLInputElement>(null);
  const idProofInputRef = useRef<HTMLInputElement>(null);
  const photoInputRef = useRef<HTMLInputElement>(null);
  const additionalFilesInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  // Local file storage for CV
  const handleCvChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 15 * 1024 * 1024) {
      setErrorMessage('সিভি ফাইলের আকার সর্বোচ্চ ১৫ মেগাবাইট হতে পারবে।');
      return;
    }

    setIsUploadingCv(true);
    setCvFileName(file.name);
    setErrorMessage('');

    try {
      const stored = await saveFileToLocalStorage(file, 'cv');
      setCvLocalPath(stored.localPath);
    } catch {
      setErrorMessage('সিভি ফাইল সংরক্ষণ করতে সমস্যা হয়েছে। আবার চেষ্টা করুন।');
    } finally {
      setIsUploadingCv(false);
    }
  };

  // Local file storage for NID / Birth Certificate
  const handleIdProofChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 15 * 1024 * 1024) {
      setErrorMessage('আইডি প্রুফ ফাইলের আকার সর্বোচ্চ ১৫ মেগাবাইট হতে পারবে।');
      return;
    }

    setIsUploadingIdProof(true);
    setIdProofFileName(file.name);
    setErrorMessage('');

    try {
      const stored = await saveFileToLocalStorage(file, 'nid');
      setIdProofLocalPath(stored.localPath);
    } catch {
      setErrorMessage('আইডি প্রুফ ফাইল সংরক্ষণ করতে সমস্যা হয়েছে।');
    } finally {
      setIsUploadingIdProof(false);
    }
  };

  // Local file storage for Profile Photo
  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingPhoto(true);
    try {
      const stored = await saveFileToLocalStorage(file, 'photo');
      setPhotoLocalPath(stored.localPath);
    } catch {
      setErrorMessage('ছবি সংরক্ষণ করতে সমস্যা হয়েছে।');
    } finally {
      setIsUploadingPhoto(false);
    }
  };

  // Multiple File Upload Handler (Requirement 3: Certificates, Documents, Writing Samples)
  const handleMultipleFilesChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploadingAdditional(true);
    setErrorMessage('');

    try {
      const newItems: {
        id: string;
        name: string;
        url: string;
        type?: string;
        sizeKb?: number;
        localPath?: string;
      }[] = [];

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (file.size > 25 * 1024 * 1024) continue;
        const stored = await saveFileToLocalStorage(file, 'doc');
        newItems.push({
          id: stored.id,
          name: file.name,
          url: stored.dataUrl,
          type: file.type,
          sizeKb: Math.round(file.size / 1024),
          localPath: stored.localPath,
        });
      }

      setAdditionalFiles((prev) => [...prev, ...newItems]);
    } catch {
      setErrorMessage('একাধিক ফাইল সংরক্ষণে সমস্যা হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।');
    } finally {
      setIsUploadingAdditional(false);
      if (additionalFilesInputRef.current) {
        additionalFilesInputRef.current.value = '';
      }
    }
  };

  const handleRemoveAdditionalFile = (id: string) => {
    setAdditionalFiles((prev) => prev.filter((f) => f.id !== id));
  };

  // Submit Form
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!candidateName.trim() || !phone.trim() || !education.trim()) {
      setErrorMessage('অনুগ্রহ করে নাম, মোবাইল নম্বর এবং শিক্ষাগত যোগ্যতা সঠিকভাবে পূরণ করুন।');
      return;
    }

    if (openPositions.length === 0) {
      setErrorMessage('বর্তমানে কোনো শূন্য পদের সার্কুলার উন্মুক্ত নেই।');
      return;
    }

    setIsSubmitting(true);

    const newApp: JobApplication = {
      id: `job-${Date.now()}`,
      candidateName: candidateName.trim(),
      email: email.trim() || `${phone.replace(/[^0-9]/g, '')}@applicant.portal`,
      phone: phone.trim(),
      district,
      desiredRole: desiredRole || openPositions[0] || 'নিজস্ব প্রতিবেদক',
      education: education.trim(),
      experienceBio: experienceBio.trim(),
      photoUrl: photoLocalPath || undefined,
      cvUrl: cvLocalPath || undefined,
      cvFileName: cvFileName || undefined,
      idProofUrl: idProofLocalPath || undefined,
      idProofType,
      portfolioLinks: portfolioLinks.trim() || undefined,
      additionalFiles: additionalFiles.length > 0 ? additionalFiles : undefined,
      status: 'pending',
      appliedAt: new Date().toLocaleDateString('bn-BD', { year: 'numeric', month: 'long', day: 'numeric' }),
    };

    setTimeout(() => {
      onSubmitApplication(newApp);
      setIsSubmitting(false);
      setSubmitSuccess(true);
    }, 600);
  };

  const handleReset = () => {
    setCandidateName('');
    setEmail('');
    setPhone('');
    setEducation('');
    setExperienceBio('');
    setPortfolioLinks('');
    setCvLocalPath('');
    setCvFileName('');
    setIdProofLocalPath('');
    setIdProofFileName('');
    setPhotoLocalPath('');
    setAdditionalFiles([]);
    setSubmitSuccess(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-xs font-solaiman animate-in fade-in duration-200">
      <div 
        className={`w-full max-w-3xl max-h-[92vh] flex flex-col rounded-2xl shadow-2xl overflow-hidden border transition-all ${
          darkMode ? 'bg-[#151c24] border-slate-700 text-white' : 'bg-white border-slate-200 text-slate-800'
        }`}
      >
        {/* Header */}
        <div className="px-5 py-4 border-b border-red-600/30 flex items-center justify-between bg-gradient-to-r from-red-600 via-rose-600 to-red-700 text-white shadow-md">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-white/20 shadow-xs">
              <Briefcase className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold flex items-center gap-2">
                <span>{settings?.recruitmentHeadline || 'যোগ দিন আমাদের বার্তা বিভাগে — ক্যারিয়ার আবেদন'}</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-white text-red-600 font-bold font-latin">
                  CAREERS
                </span>
              </h2>
              <p className="text-xs text-red-100 font-normal">
                {siteName} ও {siteNameEn} মিডিয়া নেটওয়ার্কের সঙ্গে পেশাদার সাংবাদিকতায় যুক্ত হোন
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-white/20 transition-colors text-white cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          {!isRecruitmentActive || openPositions.length === 0 ? (
            /* Recruitment Closed State */
            <div className="py-12 px-4 text-center max-w-md mx-auto space-y-4">
              <div className="w-16 h-16 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto">
                <AlertCircle className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                নিয়োগ কার্যক্রম বর্তমানে স্থগিত রয়েছে
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                কর্তৃপক্ষের সিদ্ধান্ত মোতাবেক এই মুহূর্তে কোনো পদে আবেদন গ্রহণ করা হচ্ছে না। নতুন কোনো নিয়োগ বিজ্ঞপ্তি বা শূন্য পদের বিজ্ঞপ্তি প্রকাশিত হলে আমাদের পোর্টালে পুনরায় নোটিশ দেওয়া হবে।
              </p>
              <button
                onClick={onClose}
                className="px-5 py-2 rounded-lg bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-bold hover:opacity-90 transition-opacity cursor-pointer shadow-xs"
              >
                মূল পাতায় ফিরে যান
              </button>
            </div>
          ) : submitSuccess ? (
            /* Success State */
            <div className="py-10 px-4 text-center max-w-lg mx-auto space-y-4 animate-in zoom-in-95 duration-200">
              <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto shadow-xs">
                <CheckCircle2 className="w-9 h-9" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  আপনার নিয়োগ আবেদনটি সফলভাবে গৃহীত হয়েছে!
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed">
                  ধন্যবাদ <strong className="text-slate-800 dark:text-slate-200">{candidateName}</strong>। আমাদের মানবসম্পদ ও সম্পাদকীয় বোর্ড আপনার বায়োডাটা এবং জমাকৃত ফাইল পুঙ্খানুপুঙ্খ যাচাই করবে। আবেদন অনুমোদিত হলে আপনি সরাসরি কর্মী হিসেবে "আমাদের পরিবার" টিম ডিরেক্টরিতে অন্তর্ভুক্ত হবেন এবং আপনার অফিশিয়াল প্রেস আইডি কার্ড প্রদান করা হবে।
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-left text-xs space-y-1.5">
                <div className="flex justify-between text-slate-500">
                  <span>আবেদনের পদ:</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">{desiredRole}</span>
                </div>
                <div className="flex justify-between text-slate-500">
                  <span>যোগাযোগের মোবাইল:</span>
                  <span className="font-mono font-bold text-slate-800 dark:text-slate-200">{phone}</span>
                </div>
                <div className="flex justify-between text-slate-500">
                  <span>ফাইল স্টোরেজ:</span>
                  <span className="font-mono text-[10px] text-emerald-600 font-bold">
                    লোকাল হোস্টিং ফোল্ডার (/uploads/recruitment/)
                  </span>
                </div>
                <div className="flex justify-between text-slate-500">
                  <span>স্ট্যাটাস:</span>
                  <span className="px-2 py-0.5 rounded bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 font-bold text-[10px]">
                    পর্যালোচনাধীন (Pending Review)
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-center gap-3 pt-2">
                <button
                  onClick={handleReset}
                  className="px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-bold transition-colors cursor-pointer"
                >
                  আরেকটি আবেদন করুন
                </button>
                <button
                  onClick={onClose}
                  className="px-5 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition-colors cursor-pointer shadow-md"
                >
                  সম্পন্ন করুন
                </button>
              </div>
            </div>
          ) : (
            /* Application Form */
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Notice Intro */}
              <div className="p-3.5 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/40 flex items-start gap-3 text-xs text-red-900 dark:text-red-300">
                <Sparkles className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <span className="font-bold block">
                    {settings?.recruitmentHeadline || 'সাংবাদিক ও কর্মী নিয়োগ বিজ্ঞপ্তি ২০২৬'}
                  </span>
                  <p className="text-[11px] leading-relaxed text-red-800 dark:text-red-300">
                    {settings?.recruitmentDescription || 'আমাদের সম্প্রসারিত বার্তা বিভাগে পেশাদার সাংবাদিক, মাল্টিমিডিয়া উপস্থাপক ও তরুণ অনুসন্ধানী প্রতিনিধিদের স্বাগত জানাচ্ছি। নিম্নের ফর্মটি পূরণ করে আপনার জীবনবৃত্তান্ত ও প্রয়োজনীয় ডকুমেন্টস জমা দিন।'}
                  </p>
                </div>
              </div>

              {errorMessage && (
                <div className="p-3 bg-red-100 dark:bg-red-950/60 text-red-700 dark:text-red-300 rounded-lg text-xs font-bold flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Grid 1: Basic Info */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    প্রার্থীর পূর্ণ নাম (Full Name) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={candidateName || ''}
                    onChange={(e) => setCandidateName(e.target.value)}
                    placeholder="আপনার পূর্ণ নাম লিখুন"
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 focus:outline-hidden focus:ring-2 focus:ring-red-500 font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    মোবাইল নম্বর (Phone) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    value={phone || ''}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="উদা: +৮৮০ ১৭৫০০০০০০১"
                    className="w-full px-3 py-2 text-xs font-mono rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 focus:outline-hidden focus:ring-2 focus:ring-red-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    ইমেইল ঠিকানা (Email)
                  </label>
                  <input
                    type="email"
                    value={email || ''}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="applicant@example.com"
                    className="w-full px-3 py-2 text-xs font-mono rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 focus:outline-hidden focus:ring-2 focus:ring-red-500"
                  />
                </div>
              </div>

              {/* Grid 2: Position (Dynamically populated from Admin Checkboxes - Requirement 2) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    আবেদনকৃত সার্কুলার পদ <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={desiredRole || (openPositions[0] || '')}
                    onChange={(e) => setDesiredRole(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 focus:outline-hidden focus:ring-2 focus:ring-red-500 font-bold text-red-600 dark:text-red-400"
                  >
                    {openPositions.map((pos) => (
                      <option key={pos} value={pos}>{pos}</option>
                    ))}
                  </select>
                  <span className="text-[10px] text-slate-400 block mt-1">
                    অ্যাডমিন কর্তৃক অনুমোদিত উন্মুক্ত পদসমূহ প্রদর্শিত হচ্ছে।
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    আবেদনকৃত জেলা / কর্মস্থল <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={district || 'ঢাকা'}
                    onChange={(e) => setDistrict(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 focus:outline-hidden focus:ring-2 focus:ring-red-500"
                  >
                    {[
                      'ঢাকা', 'চট্টগ্রাম', 'রাজশাহী', 'খুলনা', 'বরিশাল', 'সিলেট', 'রংপুর', 'ময়মনসিংহ',
                      'বগুড়া', 'কুমিল্লা', 'নোয়াখালী', 'ফরিদপুর', 'দিনাজপুর', 'টাঙ্গাইল', 'যশোর', 'কক্সবাজার', 'অন্যান্য জেলা'
                    ].map((d) => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Grid 3: Education & Experience */}
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    শিক্ষাগত যোগ্যতা (Educational Qualifications) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={education || ''}
                    onChange={(e) => setEducation(e.target.value)}
                    placeholder="উদা: স্নাতক (সম্মান), সাংবাদিকতা ও গণযোগাযোগ (ঢাকা বিশ্ববিদ্যালয়)"
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 focus:outline-hidden focus:ring-2 focus:ring-red-500 font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    সংক্ষিপ্ত অভিজ্ঞতা ও জীবনবৃত্তান্ত (Bio & Professional Experience)
                  </label>
                  <textarea
                    rows={2}
                    value={experienceBio || ''}
                    onChange={(e) => setExperienceBio(e.target.value)}
                    placeholder="আপনার পূর্ববর্তী কাজের অভিজ্ঞতা, বিশেষত্ব কিংবা সাংবাদিকতায় আগ্রহের বিবরণ লিখুন..."
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 focus:outline-hidden focus:ring-2 focus:ring-red-500"
                  />
                </div>
              </div>

              {/* Grid 4: Local File Uploads (CV, NID, Photo) - Dedicated Hosting Folder (/uploads/recruitment/) */}
              <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
                  <div className="flex items-center gap-2">
                    <UploadCloud className="w-4 h-4 text-red-600" />
                    <span className="font-bold text-xs text-slate-800 dark:text-slate-200">
                      ডকুমেন্টস ও ফাইল সংযুক্তি (লোকাল হোস্টিং স্টোরেজ: /uploads/recruitment/)
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono">
                    Zero Cloud Dependency
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {/* 1. CV Upload */}
                  <div className="space-y-1.5 p-3 rounded-lg border bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                      জীবনবৃত্তান্ত / সিভি (CV)
                    </label>
                    <div className="text-[10px] text-slate-500">PDF, DOCX বা ছবি</div>
                    {cvLocalPath ? (
                      <div className="flex items-center justify-between p-2 rounded bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 text-xs font-bold">
                        <span className="truncate max-w-[130px]">{cvFileName || 'CV Saved'}</span>
                        <button
                          type="button"
                          onClick={() => { setCvLocalPath(''); setCvFileName(''); }}
                          className="text-red-500 hover:text-red-700"
                        >
                          ✕
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => cvInputRef.current?.click()}
                        disabled={isUploadingCv}
                        className="w-full py-2 px-3 rounded border border-dashed border-slate-300 dark:border-slate-700 hover:border-red-500 text-xs font-bold text-slate-600 dark:text-slate-300 flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        {isUploadingCv ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin text-red-600" />
                        ) : (
                          <FileText className="w-3.5 h-3.5 text-red-600" />
                        )}
                        <span>সিভি আপলোড করুন</span>
                      </button>
                    )}
                    <input
                      type="file"
                      ref={cvInputRef}
                      accept=".pdf,.doc,.docx,image/*"
                      onChange={handleCvChange}
                      className="hidden"
                    />
                  </div>

                  {/* 2. NID / Birth Certificate Upload */}
                  <div className="space-y-1.5 p-3 rounded-lg border bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
                    <div className="flex items-center justify-between">
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                        আইডি প্রমাণপত্র
                      </label>
                      <div className="flex items-center gap-1 text-[10px]">
                        <button
                          type="button"
                          onClick={() => setIdProofType('nid')}
                          className={`px-1.5 py-0.2 rounded font-bold ${idProofType === 'nid' ? 'bg-red-600 text-white' : 'text-slate-400'}`}
                        >
                          NID
                        </button>
                        <button
                          type="button"
                          onClick={() => setIdProofType('birth_certificate')}
                          className={`px-1.5 py-0.2 rounded font-bold ${idProofType === 'birth_certificate' ? 'bg-red-600 text-white' : 'text-slate-400'}`}
                        >
                          জন্মসনদ
                        </button>
                      </div>
                    </div>
                    <div className="text-[10px] text-slate-500">জাতীয় পরিচয়পত্র বা জন্মসনদের ছবি</div>
                    {idProofLocalPath ? (
                      <div className="flex items-center justify-between p-2 rounded bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 text-xs font-bold">
                        <span className="truncate max-w-[130px]">{idProofFileName || 'ID Saved'}</span>
                        <button
                          type="button"
                          onClick={() => { setIdProofLocalPath(''); setIdProofFileName(''); }}
                          className="text-red-500 hover:text-red-700"
                        >
                          ✕
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => idProofInputRef.current?.click()}
                        disabled={isUploadingIdProof}
                        className="w-full py-2 px-3 rounded border border-dashed border-slate-300 dark:border-slate-700 hover:border-red-500 text-xs font-bold text-slate-600 dark:text-slate-300 flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        {isUploadingIdProof ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin text-red-600" />
                        ) : (
                          <ShieldCheck className="w-3.5 h-3.5 text-red-600" />
                        )}
                        <span>{idProofType === 'nid' ? 'NID আপলোড' : 'জন্মসনদ আপলোড'}</span>
                      </button>
                    )}
                    <input
                      type="file"
                      ref={idProofInputRef}
                      accept="image/*,.pdf"
                      onChange={handleIdProofChange}
                      className="hidden"
                    />
                  </div>

                  {/* 3. Applicant Portrait Photo */}
                  <div className="space-y-1.5 p-3 rounded-lg border bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                      পাসপোর্ট ছবি (Photo)
                    </label>
                    <div className="text-[10px] text-slate-500">প্রেস আইডি ও টিম ডিরেক্টরির জন্য</div>
                    {photoLocalPath ? (
                      <div className="flex items-center gap-2 p-1 rounded bg-emerald-50 dark:bg-emerald-950/40">
                        <img 
                          src={getLocalFileUrl(photoLocalPath)} 
                          alt="Applicant" 
                          className="w-7 h-7 rounded-full object-cover" 
                        />
                        <span className="text-[10px] font-bold text-emerald-700 flex-1 truncate">ছবি সংরক্ষিত</span>
                        <button
                          type="button"
                          onClick={() => setPhotoLocalPath('')}
                          className="text-red-500 hover:text-red-700 mr-1"
                        >
                          ✕
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => photoInputRef.current?.click()}
                        disabled={isUploadingPhoto}
                        className="w-full py-2 px-3 rounded border border-dashed border-slate-300 dark:border-slate-700 hover:border-red-500 text-xs font-bold text-slate-600 dark:text-slate-300 flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        {isUploadingPhoto ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin text-red-600" />
                        ) : (
                          <Camera className="w-3.5 h-3.5 text-red-600" />
                        )}
                        <span>ছবি আপলোড করুন</span>
                      </button>
                    )}
                    <input
                      type="file"
                      ref={photoInputRef}
                      accept="image/*"
                      onChange={handlePhotoChange}
                      className="hidden"
                    />
                  </div>
                </div>

                {/* 4. Multiple Additional Files & Certificates Upload (Requirement 3) */}
                <div className="pt-3 border-t border-slate-200 dark:border-slate-800 space-y-2">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <label className="block text-xs font-bold text-slate-800 dark:text-slate-200">
                        একাধিক ফাইল ও সনদ সংযুক্তি (Multiple File Uploads)
                      </label>
                      <p className="text-[10px] text-slate-500">
                        শিক্ষাগত সনদের কপি, অভিজ্ঞতাপত্র, প্রশংসাপত্র, লেখার নমুনা বা পোর্টফোলিও একসাথে একাধিক ফাইল আপলোড করুন
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => additionalFilesInputRef.current?.click()}
                      disabled={isUploadingAdditional}
                      className="px-3 py-1.5 rounded-lg bg-red-50 hover:bg-red-100 dark:bg-red-950/60 dark:hover:bg-red-900/60 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs active:scale-95"
                    >
                      {isUploadingAdditional ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin text-red-600" />
                          <span>সংরক্ষণ হচ্ছে...</span>
                        </>
                      ) : (
                        <>
                          <UploadCloud className="w-3.5 h-3.5 text-red-600" />
                          <span>+ একাধিক ফাইল নির্বাচন করুন</span>
                        </>
                      )}
                    </button>
                    <input
                      type="file"
                      ref={additionalFilesInputRef}
                      multiple
                      accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.webp,.txt"
                      onChange={handleMultipleFilesChange}
                      className="hidden"
                    />
                  </div>

                  {/* Uploaded Files Badges List */}
                  {additionalFiles.length > 0 && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                      {additionalFiles.map((file) => (
                        <div
                          key={file.id}
                          className="flex items-center justify-between p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs shadow-2xs"
                        >
                          <div className="flex items-center gap-2 min-w-0 flex-1">
                            <span className="p-1 rounded bg-slate-100 dark:bg-slate-800 text-red-600 shrink-0">
                              <FileText className="w-3.5 h-3.5" />
                            </span>
                            <div className="min-w-0 flex-1">
                              <p className="truncate font-bold text-slate-800 dark:text-slate-200 text-[11px]" title={file.name}>
                                {file.name}
                              </p>
                              <span className="text-[10px] text-slate-400 font-mono">
                                {file.sizeKb ? `${file.sizeKb} KB` : 'ডকুমেন্ট'} • সংরক্ষিত
                              </span>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleRemoveAdditionalFile(file.id)}
                            className="p-1 rounded text-slate-400 hover:text-red-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors ml-1.5 cursor-pointer"
                            title="মুছে ফেলুন"
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-700 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-lg bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white text-xs font-bold transition-all shadow-md cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>জমা হচ্ছে...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>আবেদনপত্র জমা দিন</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
