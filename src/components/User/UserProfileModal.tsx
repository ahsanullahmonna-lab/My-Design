import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  X, 
  Save, 
  User, 
  ShieldCheck, 
  Mail, 
  Phone, 
  MapPin, 
  Camera, 
  UploadCloud, 
  CheckCircle2, 
  Loader2, 
  CreditCard,
  Download,
  AlertCircle,
  Clock,
  Sparkles,
  Award,
  FileText,
  Briefcase,
  AlertTriangle,
  ExternalLink,
  ChevronRight,
  Eye,
  Check,
  XCircle,
  MessageSquare,
  HelpCircle,
  Send,
  Key,
  EyeOff,
  Trash2,
  UserCheck
} from 'lucide-react';
import { UserItem, Article, JobApplication } from '../../types/news';
import { useSiteConfig } from '../../context/SiteConfigContext';
import { saveFileToLocalStorage, getLocalFileUrl, downloadLocalFile } from '../../utils/localRecruitmentStorage';
import { DigitalIdCard } from '../IdCard/DigitalIdCard';

interface UserProfileModalProps {
  user: UserItem | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdateUser: (updatedUser: UserItem) => void;
  darkMode?: boolean;
  articles?: Article[];
  jobApplications?: JobApplication[];
  onOpenCitizenNews?: () => void;
  onOpenRecruitment?: () => void;
  onSelectArticle?: (article: Article) => void;
  initialTab?: 'profile' | 'submissions' | 'applications' | 'idcard';
}

export const UserProfileModal: React.FC<UserProfileModalProps> = ({
  user,
  isOpen,
  onClose,
  onUpdateUser,
  darkMode = false,
  articles = [],
  jobApplications = [],
  onOpenCitizenNews,
  onOpenRecruitment,
  onSelectArticle,
  initialTab = 'profile',
}) => {
  const { siteName } = useSiteConfig();
  const [activeTab, setActiveTab] = useState<'profile' | 'submissions' | 'applications' | 'idcard'>('profile');
  const [submissionFilter, setSubmissionFilter] = useState<'all' | 'pending' | 'published' | 'rejected' | 'deleted'>('all');

  // Form Fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [district, setDistrict] = useState('');
  const [bloodGroup, setBloodGroup] = useState('B+');
  const [designation, setDesignation] = useState('');
  const [bio, setBio] = useState('');
  const [education, setEducation] = useState('');
  const [emergencyContact, setEmergencyContact] = useState('');
  const [avatar, setAvatar] = useState('');

  // Password fields state (Requirement 2)
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [passwordError, setPasswordError] = useState('');

  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab, isOpen]);

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setEmail(user.email || '');
      setPhone(user.phone || '');
      setDistrict(user.district || '');
      setBloodGroup(user.bloodGroup || 'B+');
      setDesignation(user.designation || '');
      setBio(user.bio || '');
      setEducation(user.education || '');
      setEmergencyContact(user.emergencyContact || '');
      setAvatar(user.avatar || '');
    }
  }, [user]);

  // Read deleted submissions log (Requirement 2: status including Deleted)
  const deletedArticles = useMemo<Article[]>(() => {
    try {
      const saved = localStorage.getItem('kolom24_deleted_articles');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  }, [isOpen]);

  // User's Submissions (Matched by ID, authorId, author name, or submittedBy)
  const userArticles = useMemo(() => {
    if (!user) return [];
    const map = new Map<string, Article>();
    deletedArticles.forEach(a => map.set(a.id, a));
    articles.forEach(a => map.set(a.id, a)); // active takes precedence

    return Array.from(map.values()).filter((art) => {
      const matchSubmitter = art.submittedBy && (
        art.submittedBy === user.id || 
        art.submittedBy === user.email || 
        art.submittedBy.trim().toLowerCase() === user.name.trim().toLowerCase()
      );
      const matchAuthorId = art.authorId && art.authorId === user.id;
      const matchAuthor = art.author && (art.author.trim().toLowerCase() === user.name.trim().toLowerCase());
      const matchAuthorEn = user.nameEn && art.authorEn && (art.authorEn.trim().toLowerCase() === user.nameEn.trim().toLowerCase());
      return matchSubmitter || matchAuthorId || matchAuthor || matchAuthorEn;
    });
  }, [articles, deletedArticles, user]);

  const filteredUserArticles = useMemo(() => {
    if (submissionFilter === 'all') return userArticles;
    if (submissionFilter === 'pending') return userArticles.filter((a) => a.status === 'pending');
    if (submissionFilter === 'published') return userArticles.filter((a) => a.status === 'published' || (!a.status && a.status !== 'rejected' && a.status !== 'deleted'));
    if (submissionFilter === 'rejected') return userArticles.filter((a) => a.status === 'rejected' || a.adminFeedbackAction === 'rejected' || a.adminFeedbackAction === 'held');
    if (submissionFilter === 'deleted') return userArticles.filter((a) => a.status === 'deleted' || a.adminFeedbackAction === 'deleted');
    return userArticles;
  }, [userArticles, submissionFilter]);

  // User's Applications (Matched by assignedUserId, email, phone, or name)
  const userApplications = useMemo(() => {
    if (!user) return [];
    return jobApplications.filter((app) => {
      const matchId = app.assignedUserId && app.assignedUserId === user.id;
      const matchEmail = app.email && user.email && (app.email.trim().toLowerCase() === user.email.trim().toLowerCase());
      const matchPhone = app.phone && user.phone && (app.phone.replace(/\D/g, '') === user.phone.replace(/\D/g, ''));
      const matchName = app.candidateName && (app.candidateName.trim().toLowerCase() === user.name.trim().toLowerCase());
      return matchId || matchEmail || matchPhone || matchName;
    });
  }, [jobApplications, user]);

  if (!isOpen || !user) return null;

  // Local file storage for avatar
  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingAvatar(true);
    try {
      const stored = await saveFileToLocalStorage(file, 'photo');
      setAvatar(stored.localPath);
    } catch {
      alert('ছবি আপলোড করতে সমস্যা হয়েছে!');
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');
    if (newPassword && newPassword !== confirmPassword) {
      setPasswordError('পাসওয়ার্ড দুটি মিলছে না! অনুগ্রহ করে সঠিক পাসওয়ার্ড পুনরায় লিখুন।');
      return;
    }

    const updated: UserItem = {
      ...user,
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim(),
      district: district.trim(),
      bloodGroup,
      designation: designation.trim(),
      bio: bio.trim(),
      education: education.trim(),
      emergencyContact: emergencyContact.trim(),
      avatar,
      password: newPassword ? newPassword : user.password,
    };
    onUpdateUser(updated);
    setIsSaved(true);
    if (newPassword) {
      setNewPassword('');
      setConfirmPassword('');
    }
    setTimeout(() => setIsSaved(false), 3500);
  };

  const hasUploadedIdCard = Boolean(user.idCardFrontUrl || user.idCardBackUrl);

  const pendingCount = userArticles.filter(a => a.status === 'pending').length;
  const publishedCount = userArticles.filter(a => a.status === 'published' || (!a.status && a.status !== 'rejected' && a.status !== 'deleted')).length;
  const rejectedCount = userArticles.filter(a => a.status === 'rejected' || a.adminFeedbackAction === 'rejected' || a.adminFeedbackAction === 'held').length;
  const deletedCount = userArticles.filter(a => a.status === 'deleted' || a.adminFeedbackAction === 'deleted').length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-xs font-solaiman animate-in fade-in">
      <div 
        className={`w-full max-w-5xl xl:max-w-6xl max-h-[92vh] flex flex-col rounded-2xl border shadow-2xl overflow-hidden transition-all ${
          darkMode ? 'bg-[#151c24] border-slate-700 text-slate-100' : 'bg-white border-slate-200 text-slate-800'
        }`}
      >
        {/* Modal Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-red-600 via-rose-600 to-red-700 text-white flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-3">
            <div className="relative">
              <img
                src={getLocalFileUrl(avatar) || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80'}
                alt={name}
                className="w-11 h-11 rounded-full object-cover border-2 border-white/80 shadow-xs"
              />
              <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-400 rounded-full ring-2 ring-white" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold flex items-center gap-2">
                <span>{name || 'ব্যবহারকারী প্রোফাইল'}</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/20 font-bold font-mono">
                  {user.roleBn || 'কর্মী'}
                </span>
              </h2>
              <p className="text-xs text-white/80 font-normal">
                {siteName} ইউজার পোর্টাল ও রিয়েল-টাইম স্ট্যাটাস ড্যাশবোর্ড
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

        {/* Navigation Tabs Bar */}
        <div className="flex flex-wrap border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 p-1.5 gap-1.5 text-xs font-bold">
          {/* Tab 1: Profile */}
          <button
            type="button"
            onClick={() => setActiveTab('profile')}
            className={`py-2 px-3 rounded-lg flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === 'profile'
                ? 'bg-white dark:bg-slate-800 shadow-xs text-slate-900 dark:text-white'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <User className="w-3.5 h-3.5 text-red-600" />
            <span>প্রোফাইল ও তথ্য</span>
          </button>

          {/* Tab 2: News Submissions Status & Admin Feedback (Requirement 2) */}
          <button
            type="button"
            onClick={() => setActiveTab('submissions')}
            className={`py-2 px-3 rounded-lg flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === 'submissions'
                ? 'bg-white dark:bg-slate-800 shadow-xs text-slate-900 dark:text-white'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <FileText className="w-3.5 h-3.5 text-blue-600" />
            <span>আমার নিউজ সাবমিশন</span>
            {userArticles.length > 0 && (
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                pendingCount > 0 ? 'bg-amber-500 text-white animate-pulse' : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
              }`}>
                {userArticles.length}
              </span>
            )}
          </button>

          {/* Tab 3: Recruitment & Verification Lifecycle (Requirement 3) */}
          <button
            type="button"
            onClick={() => setActiveTab('applications')}
            className={`py-2 px-3 rounded-lg flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === 'applications'
                ? 'bg-white dark:bg-slate-800 shadow-xs text-slate-900 dark:text-white'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <Briefcase className="w-3.5 h-3.5 text-amber-600" />
            <span>আবেদন ও ভেরিফিকেশন ট্র্যাকার</span>
            {userApplications.length > 0 && (
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-mono">
                {userApplications.length}
              </span>
            )}
          </button>

          {/* Tab 4: ID Card */}
          <button
            type="button"
            onClick={() => setActiveTab('idcard')}
            className={`py-2 px-3 rounded-lg flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === 'idcard'
                ? 'bg-red-600 text-white shadow-xs'
                : 'text-red-700 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40'
            }`}
          >
            <CreditCard className="w-3.5 h-3.5" />
            <span>প্রেস আইডি কার্ড (ID Card)</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-4">
          {/* ========================================================= */}
          {/* TAB 1: EDIT PROFILE */}
          {/* ========================================================= */}
          {activeTab === 'profile' && (
            <form onSubmit={handleSave} className="space-y-5">
              {isSaved && (
                <div className="p-3 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 rounded-xl flex items-center gap-2 text-xs text-emerald-700 dark:text-emerald-300 animate-in fade-in">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>আপনার প্রোফাইল তথ্য সফলভাবে সংরক্ষণ ও আপডেট করা হয়েছে!</span>
                </div>
              )}

              {/* Profile Photo Uploader */}
              <div className="flex flex-col sm:flex-row items-center gap-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
                <div className="relative group">
                  <img
                    src={getLocalFileUrl(avatar) || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=250&q=80'}
                    alt={name}
                    className="w-20 h-20 rounded-full object-cover border-2 border-red-600 shadow-md"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-white cursor-pointer"
                    title="ছবি পরিবর্তন করুন"
                  >
                    <Camera className="w-5 h-5" />
                  </button>
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept="image/*"
                    onChange={handleAvatarUpload}
                    className="hidden"
                  />
                </div>

                <div className="space-y-1 text-center sm:text-left flex-1">
                  <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                    প্রোফাইল ছবি ও অফিশিয়াল পোর্ট্রেট
                  </h4>
                  <p className="text-xs text-slate-500">
                    এই ছবিটি আপনার ডিজিটাল প্রেস আইডি কার্ড এবং সংবাদ লেখক বক্সে প্রদর্শিত হবে।
                  </p>
                  <div className="pt-1 flex flex-wrap items-center justify-center sm:justify-start gap-2">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isUploadingAvatar}
                      className="px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                    >
                      {isUploadingAvatar ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          <span>আপলোড হচ্ছে...</span>
                        </>
                      ) : (
                        <>
                          <Camera className="w-3.5 h-3.5" />
                          <span>ছবি আপলোড করুন</span>
                        </>
                      )}
                    </button>
                    <span className="text-[10px] text-slate-400 font-mono">JPG, PNG, WEBP (লোকাল স্টোরেজ)</span>
                  </div>
                </div>
              </div>

              {/* Form Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold mb-1 text-slate-700 dark:text-slate-300">
                    পূর্ণ নাম (Full Name) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={name || ''}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#1a222c] text-xs font-bold focus:ring-2 focus:ring-red-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold mb-1 text-slate-700 dark:text-slate-300">
                    ই-মেইল ঠিকানা (Email) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={email || ''}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#1a222c] text-xs font-medium focus:ring-2 focus:ring-red-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold mb-1 text-slate-700 dark:text-slate-300">
                    মোবাইল নম্বর (Phone) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    value={phone || ''}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+880 1XXXXXXXXX"
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#1a222c] text-xs font-medium focus:ring-2 focus:ring-red-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold mb-1 text-slate-700 dark:text-slate-300">
                    পদবী / উপাধি (Designation)
                  </label>
                  <input
                    type="text"
                    value={designation || ''}
                    onChange={(e) => setDesignation(e.target.value)}
                    placeholder="যেমন: জ্যেষ্ঠ প্রতিবেদক / জেলা প্রতিনিধি"
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#1a222c] text-xs font-medium focus:ring-2 focus:ring-red-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold mb-1 text-slate-700 dark:text-slate-300">
                    জেলা / কর্মস্থল (District / Station)
                  </label>
                  <input
                    type="text"
                    value={district || ''}
                    onChange={(e) => setDistrict(e.target.value)}
                    placeholder="যেমন: ঢাকা, চট্টগ্রাম, কিশোরগঞ্জ"
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#1a222c] text-xs font-medium focus:ring-2 focus:ring-red-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold mb-1 text-slate-700 dark:text-slate-300">
                    রক্তের গ্রুপ (Blood Group)
                  </label>
                  <select
                    value={bloodGroup || 'B+'}
                    onChange={(e) => setBloodGroup(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#1a222c] text-xs font-bold focus:ring-2 focus:ring-red-500"
                  >
                    {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map((bg) => (
                      <option key={bg} value={bg}>
                        {bg}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold mb-1 text-slate-700 dark:text-slate-300">
                  শিক্ষাগত যোগ্যতা (Educational Qualifications)
                </label>
                <input
                  type="text"
                  value={education || ''}
                  onChange={(e) => setEducation(e.target.value)}
                  placeholder="উদা: স্নাতক (সম্মান), সাংবাদিকতা ও গণযোগাযোগ"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#1a222c] text-xs font-medium focus:ring-2 focus:ring-red-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold mb-1 text-slate-700 dark:text-slate-300">
                  সংক্ষিপ্ত জীবনবৃত্তান্ত ও বায়ো (Bio)
                </label>
                <textarea
                  rows={3}
                  value={bio || ''}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="সাংবাদিকতা ও মিডিয়া অভিজ্ঞতা সংক্ষেপে লিখুন..."
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#1a222c] text-xs focus:ring-2 focus:ring-red-500 resize-none font-normal"
                />
              </div>

              <div>
                <label className="block text-xs font-bold mb-1 text-slate-700 dark:text-slate-300">
                  জরুরি যোগাযোগ নম্বর (Emergency Contact)
                </label>
                <input
                  type="text"
                  value={emergencyContact || ''}
                  onChange={(e) => setEmergencyContact(e.target.value)}
                  placeholder="জরুরি প্রয়োজনের নম্বর"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#1a222c] text-xs font-medium focus:ring-2 focus:ring-red-500"
                />
              </div>

              {/* Password Management (Requirement 2: Full user edit and management of password) */}
              <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
                  <div className="flex items-center gap-2">
                    <Key className="w-4 h-4 text-red-600" />
                    <span className="font-bold text-xs sm:text-sm text-slate-800 dark:text-slate-200">
                      লগইন পাসওয়ার্ড ও সিকিউরিটি পরিবর্তন (Password & Security)
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 text-xs flex items-center gap-1 cursor-pointer font-semibold"
                  >
                    {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    <span>{showPassword ? 'লুকান' : 'পাসওয়ার্ড দেখুন'}</span>
                  </button>
                </div>

                {passwordError && (
                  <div className="p-2.5 rounded-lg bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-xs text-red-700 dark:text-red-300 font-bold flex items-center gap-1.5">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>{passwordError}</span>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold mb-1 text-slate-700 dark:text-slate-300">
                      নতুন পাসওয়ার্ড (New Password)
                    </label>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={newPassword}
                      onChange={(e) => {
                        setNewPassword(e.target.value);
                        setPasswordError('');
                      }}
                      placeholder="অপরিবর্তিত রাখতে ফাঁকা রাখুন..."
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#1a222c] text-xs font-mono focus:ring-2 focus:ring-red-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold mb-1 text-slate-700 dark:text-slate-300">
                      পাসওয়ার্ড নিশ্চিত করুন (Confirm Password)
                    </label>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => {
                        setConfirmPassword(e.target.value);
                        setPasswordError('');
                      }}
                      placeholder="পুনরায় নতুন পাসওয়ার্ডটি লিখুন..."
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#1a222c] text-xs font-mono focus:ring-2 focus:ring-red-500"
                    />
                  </div>
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="pt-3 flex items-center justify-end gap-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-700 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                >
                  বন্ধ করুন
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition-all shadow-md cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>প্রোফাইল তথ্য সংরক্ষণ করুন</span>
                </button>
              </div>
            </form>
          )}

          {/* ========================================================= */}
          {/* TAB 2: MY NEWS SUBMISSIONS & REAL-TIME QUEUE (Requirement 2) */}
          {/* ========================================================= */}
          {activeTab === 'submissions' && (
            <div className="space-y-4">
              {/* Header Bar with Action Button */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800 gap-3">
                <div>
                  <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
                    <FileText className="w-5 h-5 text-blue-600" />
                    <span>আমার দাখিলকৃত সংবাদ ও রিয়েল-টাইম স্ট্যাটাস</span>
                  </h3>
                  <p className="text-xs text-slate-500">
                    বার্তা বিভাগে প্রেরিত সংবাদের লাইভ অনুমোদন, হোল্ড কিংবা সম্পাদকের মতামত ট্র্যাক করুন
                  </p>
                </div>

                {onOpenCitizenNews && (
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onOpenCitizenNews();
                    }}
                    className="px-3.5 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>নতুন সংবাদ পাঠান</span>
                  </button>
                )}
              </div>

              {/* Status Filter Tabs (Requirement 2: Real-time Live Status Tracking) */}
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <span className="font-bold text-slate-500 text-[11px]">ফিল্টার:</span>
                {[
                  { id: 'all', label: `সকল (${userArticles.length})` },
                  { id: 'pending', label: `অপেক্ষমাণ (${pendingCount})` },
                  { id: 'published', label: `প্রকাশিত (${publishedCount})` },
                  { id: 'rejected', label: `প্রত্যাখ্যাত ও নোট (${rejectedCount})` },
                  { id: 'deleted', label: `মুছে ফেলা (${deletedCount})` }
                ].map(tab => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setSubmissionFilter(tab.id as any)}
                    className={`px-3 py-1 rounded-full font-bold transition-all cursor-pointer ${
                      submissionFilter === tab.id
                        ? 'bg-red-600 text-white shadow-xs'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* List of Articles */}
              {filteredUserArticles.length === 0 ? (
                <div className="py-14 text-center rounded-2xl border border-dashed border-slate-300 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30">
                  <FileText className="w-10 h-10 text-slate-400 mx-auto mb-2 opacity-60" />
                  <h4 className="font-bold text-sm text-slate-700 dark:text-slate-300">
                    {submissionFilter === 'all' 
                      ? 'এখনো কোনো সংবাদ সাবমিট করা হয়নি' 
                      : 'এই ফিল্টারে কোনো সংবাদ পাওয়া যায়নি'}
                  </h4>
                  <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                    সিটিজেন জার্নালিজম কিংবা বিশেষ প্রতিবেদন আকারে আপনার এলাকার সংবাদ সরাসরি বার্তা বিভাগে পাঠাতে পারেন।
                  </p>
                  {onOpenCitizenNews && (
                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        onOpenCitizenNews();
                      }}
                      className="mt-3 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-bold inline-flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>সংবাদ প্রেরণ শুরু করুন</span>
                    </button>
                  )}
                </div>
              ) : (
                <div className="space-y-3.5">
                  {filteredUserArticles.map((art) => {
                    const isPending = art.status === 'pending';
                    const isRejected = art.status === 'rejected' || art.adminFeedbackAction === 'rejected';
                    const isHeld = art.adminFeedbackAction === 'held' || art.adminFeedbackAction === 'revision_requested';
                    const isDeleted = art.status === 'deleted' || art.adminFeedbackAction === 'deleted';
                    const isPublished = (art.status === 'published' || !art.status) && !isPending && !isRejected && !isDeleted && !isHeld;

                    return (
                      <div
                        key={art.id}
                        className={`p-4 rounded-xl border transition-all ${
                          isDeleted
                            ? 'bg-slate-100/60 dark:bg-slate-900/40 border-slate-300 dark:border-slate-800 opacity-90'
                            : isRejected
                            ? 'bg-red-50/60 dark:bg-red-950/20 border-red-200 dark:border-red-900/50'
                            : isHeld
                            ? 'bg-amber-50/60 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900/50'
                            : isPending
                            ? 'bg-blue-50/40 dark:bg-blue-950/20 border-blue-200 dark:border-blue-900/40'
                            : 'bg-white dark:bg-slate-900/70 border-slate-200 dark:border-slate-800'
                        }`}
                      >
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                          <div className="flex gap-3.5 items-start flex-1 min-w-0">
                            <div className="w-20 h-16 rounded-lg overflow-hidden bg-slate-100 dark:bg-slate-800 shrink-0 border border-slate-200 dark:border-slate-700">
                              <img
                                src={art.imageUrl || 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?auto=format&fit=crop&w=400&q=80'}
                                alt={art.title}
                                className="w-full h-full object-cover"
                              />
                            </div>

                            <div className="space-y-1 min-w-0 flex-1">
                              <div className="flex flex-wrap items-center gap-2">
                                {/* Real-time Status Badges (Pending, Published, Deleted, or Rejected) */}
                                {isPending && (
                                  <span className="px-2 py-0.5 rounded-md font-bold text-[10px] bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-400 border border-amber-300 dark:border-amber-800 flex items-center gap-1 animate-pulse">
                                    <Clock className="w-3 h-3" />
                                    <span>অনুমোদন অপেক্ষমাণ (Pending Queue)</span>
                                  </span>
                                )}

                                {isPublished && (
                                  <span className="px-2 py-0.5 rounded-md font-bold text-[10px] bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 flex items-center gap-1">
                                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                    <span>লাইভ প্রকাশিত (Published)</span>
                                  </span>
                                )}

                                {isRejected && (
                                  <span className="px-2 py-0.5 rounded-md font-bold text-[10px] bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-300 border border-red-300 dark:border-red-800 flex items-center gap-1">
                                    <XCircle className="w-3 h-3 text-red-600" />
                                    <span>প্রত্যাখ্যাত (Rejected)</span>
                                  </span>
                                )}

                                {isDeleted && (
                                  <span className="px-2 py-0.5 rounded-md font-bold text-[10px] bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700 flex items-center gap-1">
                                    <Trash2 className="w-3 h-3 text-slate-500" />
                                    <span>মুছে ফেলা / রিমুভড (Deleted)</span>
                                  </span>
                                )}

                                {isHeld && (
                                  <span className="px-2 py-0.5 rounded-md font-bold text-[10px] bg-orange-100 dark:bg-orange-950 text-orange-700 dark:text-orange-300 border border-orange-300 dark:border-orange-800 flex items-center gap-1">
                                    <AlertTriangle className="w-3 h-3 text-orange-600" />
                                    <span>সংশোধন / স্থগিত (Revision Required)</span>
                                  </span>
                                )}

                                {art.isDelegatedPost && (
                                  <span className="px-2 py-0.5 rounded-md font-bold text-[10px] bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 flex items-center gap-1">
                                    <UserCheck className="w-3 h-3 text-indigo-600" />
                                    <span>মাস্টার ডেস্ক অ্যাসাইনকৃত ({art.delegatedByName || 'সমন্বয়ক'})</span>
                                  </span>
                                )}

                                <span className="text-xs font-bold text-red-600">
                                  {art.category}
                                </span>
                              </div>

                              <h4 className="font-bold text-sm text-slate-900 dark:text-white leading-snug line-clamp-2">
                                {art.title}
                              </h4>

                              <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-500">
                                <span>সাবমিট তারিখ: {art.date || 'আজ'}</span>
                                {art.division && <span>• {art.division}</span>}
                                {art.views !== undefined && isPublished && <span>• {art.views} পঠিত</span>}
                              </div>
                            </div>
                          </div>

                          {/* Quick Read Button if Published */}
                          {isPublished && onSelectArticle && (
                            <button
                              type="button"
                              onClick={() => {
                                onClose();
                                onSelectArticle(art);
                              }}
                              className="px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1 shrink-0 cursor-pointer"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              <span>নিউজ দেখুন</span>
                            </button>
                          )}
                        </div>

                        {/* Admin Feedback Box (Requirement 2: Custom Reason & Notes) */}
                        {art.adminFeedback && (
                          <div className={`mt-3 p-3 rounded-lg border text-xs space-y-1.5 ${
                            isRejected
                              ? 'bg-red-100/70 dark:bg-red-950/40 border-red-300 dark:border-red-800 text-red-900 dark:text-red-200'
                              : isHeld
                              ? 'bg-amber-100/70 dark:bg-amber-950/40 border-amber-300 dark:border-amber-800 text-amber-900 dark:text-amber-200'
                              : 'bg-slate-100 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200'
                          }`}>
                            <div className="flex items-center justify-between font-bold text-[11px]">
                              <div className="flex items-center gap-1.5">
                                <MessageSquare className="w-3.5 h-3.5 text-red-600" />
                                <span>বার্তা সম্পাদকের সম্পাদকীয় মতামত ও কারণ (Editorial Feedback Note):</span>
                              </div>
                              {art.adminFeedbackAt && (
                                <span className="font-normal font-mono text-[10px] text-slate-500">
                                  {new Date(art.adminFeedbackAt).toLocaleDateString('bn-BD', {
                                    year: 'numeric',
                                    month: 'short',
                                    day: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                  })}
                                </span>
                              )}
                            </div>

                            <p className="leading-relaxed font-medium pl-5 border-l-2 border-red-500/80">
                              "{art.adminFeedback}"
                            </p>

                            {art.adminReviewedBy && (
                              <div className="text-[10px] text-slate-500 text-right italic pt-0.5">
                                — পর্যালোচনায়: {art.adminReviewedBy}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* ========================================================= */}
          {/* TAB 3: RECRUITMENT & VERIFICATION LIFECYCLE (Requirement 3) */}
          {/* ========================================================= */}
          {activeTab === 'applications' && (
            <div className="space-y-5">
              {/* Header Bar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800 gap-3">
                <div>
                  <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
                    <Briefcase className="w-5 h-5 text-amber-600" />
                    <span>ক্যারিয়ার আবেদন ও প্রেস আইডি ভেরিফিকেশন ট্র্যাকার</span>
                  </h3>
                  <p className="text-xs text-slate-500">
                    বার্তা বিভাগে নিয়োগ, জেলা প্রতিনিধি আবেদন ও অফিসিয়াল আইডি ভেরিফিকেশনের পূর্ণাঙ্গ লাইফসাইকেল
                  </p>
                </div>

                {onOpenRecruitment && (
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onOpenRecruitment();
                    }}
                    className="px-3.5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer"
                  >
                    <Briefcase className="w-3.5 h-3.5" />
                    <span>নতুন পদে আবেদন করুন</span>
                  </button>
                )}
              </div>

              {/* Applications List */}
              {userApplications.length === 0 ? (
                <div className="py-14 text-center rounded-2xl border border-dashed border-slate-300 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30">
                  <Briefcase className="w-10 h-10 text-slate-400 mx-auto mb-2 opacity-60" />
                  <h4 className="font-bold text-sm text-slate-700 dark:text-slate-300">
                    এখনো কোনো ক্যারিয়ার বা আইডি ভেরিফিকেশন আবেদন জমা দেননি
                  </h4>
                  <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                    আমাদের সাংবাদিকতা পরিবারে যোগ দিতে এবং অফিসিয়াল প্রেস আইডি কার্ড পেতে আজই আবেদনপত্র জমা দিন।
                  </p>
                  {onOpenRecruitment && (
                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        onOpenRecruitment();
                      }}
                      className="mt-3 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-bold inline-flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Briefcase className="w-3.5 h-3.5" />
                      <span>ক্যারিয়ার পোর্টালে যান</span>
                    </button>
                  )}
                </div>
              ) : (
                <div className="space-y-5">
                  {userApplications.map((app) => {
                    const isApproved = app.status === 'approved';
                    const isRejected = app.status === 'rejected';
                    const isPending = app.status === 'pending';
                    const isReviewed = app.status === 'reviewed';

                    // 4-Stage Lifecycle Stepper state
                    // Stage 1: Submitted
                    // Stage 2: Reviewed
                    // Stage 3: Verification
                    // Stage 4: Decision (Approved / Rejected)
                    const currentStage = isApproved ? 4 : isRejected ? 4 : isReviewed ? 3 : 2;

                    return (
                      <div
                        key={app.id}
                        className={`p-5 rounded-2xl border shadow-xs transition-all ${
                          isApproved
                            ? 'bg-emerald-50/40 dark:bg-emerald-950/20 border-emerald-300 dark:border-emerald-800'
                            : isRejected
                            ? 'bg-red-50/40 dark:bg-red-950/20 border-red-300 dark:border-red-800'
                            : 'bg-white dark:bg-slate-900/70 border-slate-200 dark:border-slate-800'
                        }`}
                      >
                        {/* Top Info Header */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 gap-2">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-white">
                                {app.desiredRole}
                              </span>
                              <span className={`px-2.5 py-0.5 rounded-full font-bold text-[10px] ${
                                isApproved
                                  ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700'
                                  : isRejected
                                  ? 'bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-300 border border-red-300 dark:border-red-700'
                                  : 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 border border-amber-300 dark:border-amber-700 animate-pulse'
                              }`}>
                                {isApproved ? '✓ চূড়ান্ত অনুমোদিত (Approved)' : isRejected ? '✕ আবেদন বাতিল (Rejected)' : '⏳ যাচাই ও প্রক্রিয়াধীন (In Review)'}
                              </span>
                            </div>
                            <p className="text-xs text-slate-500 mt-0.5">
                              আবেদনকারী: {app.candidateName} • জেলা: {app.district} • দাখিলের তারিখ: {app.appliedAt}
                            </p>
                          </div>

                          <div className="text-right">
                            <span className="font-mono text-xs font-bold text-slate-400 block">
                              ID: {app.id.toUpperCase().slice(0, 10)}
                            </span>
                          </div>
                        </div>

                        {/* Interactive 4-Stage Lifecycle Stepper */}
                        <div className="py-4">
                          <div className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-2.5 flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5 text-amber-500" />
                            <span>আবেদনের লাইফসাইকেল ট্র্যাকিং স্ট্যাটাস:</span>
                          </div>

                          <div className="grid grid-cols-4 gap-2">
                            {/* Step 1 */}
                            <div className="space-y-1">
                              <div className="h-2 rounded-full bg-emerald-500" />
                              <div className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400">১. আবেদন দাখিল</div>
                              <div className="text-[9px] text-slate-400">সম্পন্ন</div>
                            </div>

                            {/* Step 2 */}
                            <div className="space-y-1">
                              <div className={`h-2 rounded-full ${currentStage >= 2 ? 'bg-emerald-500' : 'bg-slate-200 dark:bg-slate-700'}`} />
                              <div className={`text-[10px] font-bold ${currentStage >= 2 ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'}`}>
                                ২. প্রাথমিক যাচাই
                              </div>
                              <div className="text-[9px] text-slate-400">ডকুমেন্ট স্ক্রিনিং</div>
                            </div>

                            {/* Step 3 */}
                            <div className="space-y-1">
                              <div className={`h-2 rounded-full ${currentStage >= 3 ? 'bg-emerald-500' : 'bg-slate-200 dark:bg-slate-700'}`} />
                              <div className={`text-[10px] font-bold ${currentStage >= 3 ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'}`}>
                                ৩. সাক্ষাৎকার ও সিকিউরিটি
                              </div>
                              <div className="text-[9px] text-slate-400">ব্যাকগ্রাউন্ড ভেরিফিকেশন</div>
                            </div>

                            {/* Step 4 */}
                            <div className="space-y-1">
                              <div className={`h-2 rounded-full ${
                                isApproved 
                                  ? 'bg-emerald-500' 
                                  : isRejected 
                                  ? 'bg-red-500' 
                                  : 'bg-slate-200 dark:bg-slate-700'
                              }`} />
                              <div className={`text-[10px] font-bold ${
                                isApproved 
                                  ? 'text-emerald-600 dark:text-emerald-400' 
                                  : isRejected 
                                  ? 'text-red-600 dark:text-red-400' 
                                  : 'text-slate-400'
                              }`}>
                                ৪. চূড়ান্ত সিদ্ধান্ত
                              </div>
                              <div className="text-[9px] text-slate-400">
                                {isApproved ? 'টিম সংযুক্তি সম্পন্ন' : isRejected ? 'অননুমোদিত' : 'অপেক্ষমাণ'}
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Admin Decision Remarks Box */}
                        {(app.notes || app.adminDecisionReason) && (
                          <div className={`mt-3 p-3.5 rounded-xl border text-xs space-y-1.5 ${
                            isApproved
                              ? 'bg-emerald-100/70 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200'
                              : isRejected
                              ? 'bg-red-100/70 dark:bg-red-950/40 border-red-300 dark:border-red-800 text-red-900 dark:text-red-200'
                              : 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200'
                          }`}>
                            <div className="flex items-center justify-between font-bold text-[11px]">
                              <div className="flex items-center gap-1.5">
                                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                                <span>কর্তৃপক্ষের অফিসিয়াল সিদ্ধান্ত ও মন্তব্য (Official Remarks):</span>
                              </div>
                            </div>
                            <p className="leading-relaxed font-medium pl-4 border-l-2 border-emerald-500">
                              {app.notes || app.adminDecisionReason}
                            </p>
                          </div>
                        )}

                        {/* Approved Perks Bar */}
                        {isApproved && (
                          <div className="mt-3 pt-3 border-t border-emerald-200 dark:border-emerald-800/60 flex flex-wrap items-center justify-between gap-2 text-xs">
                            <div className="flex items-center gap-1.5 text-emerald-800 dark:text-emerald-300 font-bold">
                              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                              <span>অফিসিয়াল ডিজিটাল প্রেস আইডি কার্ড ও রিপোর্টার এক্সেস সক্রিয় করা হয়েছে!</span>
                            </div>
                            <button
                              type="button"
                              onClick={() => setActiveTab('idcard')}
                              className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded-lg font-bold text-xs flex items-center gap-1 transition-colors cursor-pointer"
                            >
                              <CreditCard className="w-3.5 h-3.5" />
                              <span>আইডি কার্ড ডাউনলোড করুন</span>
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* ========================================================= */}
          {/* TAB 4: OFFICIAL PRESS ID CARD (Requirement 4) */}
          {/* ========================================================= */}
          {activeTab === 'idcard' && (
            <div className="space-y-6">
              {/* Official Status Notice */}
              <div className="p-4 rounded-xl border bg-gradient-to-r from-red-50 to-rose-50 dark:from-red-950/30 dark:to-rose-950/30 border-red-200 dark:border-red-900/40 space-y-2">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2 text-red-900 dark:text-red-300 font-bold text-xs sm:text-sm">
                    <ShieldCheck className="w-4 h-4 text-red-600" />
                    <span>অফিশিয়াল প্রেস আইডি কার্ড পোর্টাল (Official Press Credential)</span>
                  </div>
                  <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-white dark:bg-slate-900 text-red-600 border border-red-200 dark:border-red-900">
                    {user.idCardNumber || 'PRESS-BD-ACTIVE'}
                  </span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  আপনার জন্য অনুমোদিত অফিশিয়াল ডিজিটাল প্রেস আইডি কার্ড নিম্নে প্রদর্শিত হচ্ছে। ফিল্ড রিপোর্টিং কিংবা প্রেস ইভেন্টে ব্যবহারের জন্য সামনের ও পেছনের অংশ সরাসরি হাই-রেজ্যুলুশন ফরম্যাটে ডাউনলোড কিংবা প্রিন্ট করতে পারবেন। কার্ডের কিউআর কোড স্ক্যান করে অনলাইন ভেরিফিকেশন সম্ভব।
                </p>
              </div>

              {/* Official Digital ID Card Component */}
              <div className="pt-2">
                <DigitalIdCard
                  user={user}
                  darkMode={darkMode}
                  showControls={true}
                />
              </div>

              {/* Optional Custom Uploaded ID Card Section */}
              {hasUploadedIdCard && (
                <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/40 space-y-4">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-700">
                    <h4 className="font-bold text-sm text-slate-800 dark:text-slate-200 flex items-center gap-2">
                      <CreditCard className="w-4 h-4 text-red-600" />
                      <span>কর্তৃপক্ষ কর্তৃক আপলোডকৃত বিশেষ প্রেস আইডি কার্ড ফাইল</span>
                    </h4>
                    <span className="text-[10px] bg-red-100 text-red-700 font-bold px-2 py-0.5 rounded">
                      ভেরিফাইড
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {user.idCardFrontUrl && (
                      <div className="space-y-2 p-3 bg-white dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 text-center">
                        <span className="font-bold text-[11px] block">কাস্টম ফ্রন্ট ইমেজ</span>
                        <img
                          src={getLocalFileUrl(user.idCardFrontUrl)}
                          alt="Custom Front"
                          className="w-full h-40 object-contain bg-slate-50 dark:bg-slate-900 rounded"
                        />
                        <button
                          type="button"
                          onClick={() => downloadLocalFile(user.idCardFrontUrl!, `Press-ID-Front-${user.name}.png`)}
                          className="w-full py-2 px-3 rounded-lg bg-red-600 hover:bg-red-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>কাস্টম ফ্রন্ট ডাউনলোড</span>
                        </button>
                      </div>
                    )}

                    {user.idCardBackUrl && (
                      <div className="space-y-2 p-3 bg-white dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 text-center">
                        <span className="font-bold text-[11px] block">কাস্টম ব্যাক ইমেজ</span>
                        <img
                          src={getLocalFileUrl(user.idCardBackUrl)}
                          alt="Custom Back"
                          className="w-full h-40 object-contain bg-slate-50 dark:bg-slate-900 rounded"
                        />
                        <button
                          type="button"
                          onClick={() => downloadLocalFile(user.idCardBackUrl!, `Press-ID-Back-${user.name}.png`)}
                          className="w-full py-2 px-3 rounded-lg bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>কাস্টম ব্যাক ডাউনলোড</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
