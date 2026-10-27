import React, { useState, useRef } from 'react';
import { 
  Briefcase, 
  Search, 
  Filter, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  FileText, 
  Eye, 
  Download, 
  UserCheck, 
  Trash2, 
  Edit3, 
  AlertCircle, 
  ShieldCheck, 
  CreditCard, 
  ExternalLink,
  ChevronRight,
  Phone,
  Mail,
  MapPin,
  GraduationCap,
  Sparkles,
  ToggleLeft,
  ToggleRight,
  Plus,
  Check,
  Upload,
  Camera,
  Image as ImageIcon,
  Paperclip
} from 'lucide-react';
import { JobApplication, SiteSettings, UserItem, FamilyMember } from '../../types/news';
import { determineEditorialTier, EDITORIAL_TIERS } from '../../utils/editorialHierarchy';
import { saveFileToLocalStorage, getLocalFileUrl, downloadLocalFile } from '../../utils/localRecruitmentStorage';
import { 
  calculateCustomValidity,
  calculateOneYearValidity, 
  generateDomainBasedPressId, 
  generateStructuredPressId,
  formatEnglishStaffName,
  formatEnglishStaffDesignation
} from '../../utils/pressIdCardGenerator';

interface RecruitmentManagementPanelProps {
  applications: JobApplication[];
  onUpdateApplications: (apps: JobApplication[]) => void;
  settings: SiteSettings;
  onUpdateSettings: (newSettings: SiteSettings) => void;
  users: UserItem[];
  onUpdateUsers: (newUsers: UserItem[]) => void;
  familyMembers?: FamilyMember[];
  onUpdateFamilyMembers?: (members: FamilyMember[]) => void;
  darkMode?: boolean;
}

// Standard designations categorized by the 3 professional hierarchical tiers
export const STANDARD_CIRCULAR_POSITIONS = [
  // Tier 1: শীর্ষ ব্যবস্থাপনা ও নীতিনির্ধারক পর্ষদ
  { id: 'pos_exec_editor', title: 'নির্বাহী সম্পাদক (Executive Editor)', tier: 'tier_management' },
  { id: 'pos_acting_editor', title: 'ভারপ্রাপ্ত সম্পাদক (Acting Editor)', tier: 'tier_management' },

  // Tier 2: নিউজ রুম ও ডেস্ক এডিটর পর্ষদ
  { id: 'pos_news_editor', title: 'বার্তা সম্পাদক (News Editor)', tier: 'tier_newsroom' },
  { id: 'pos_asst_news_editor', title: 'সহকারী বার্তা সম্পাদক (Assistant News Editor)', tier: 'tier_newsroom' },
  { id: 'pos_sub_editor', title: 'জ্যেষ্ঠ সহ-সম্পাদক / সহ-সম্পাদক (Sub-Editor)', tier: 'tier_newsroom' },
  { id: 'pos_multimedia', title: 'মাল্টিমিডিয়া ও সোশ্যাল মিডিয়া এডিটর (Multimedia Editor)', tier: 'tier_newsroom' },
  { id: 'pos_dept_editor', title: 'ফিচার ও বিভাগীয় সম্পাদক (Feature / Desk Editor)', tier: 'tier_newsroom' },

  // Tier 3: রিপোর্টিং ও ফিল্ড লেভেল পর্ষদ
  { id: 'pos_special_corr', title: 'বিশেষ প্রতিনিধি (Special Correspondent)', tier: 'tier_reporting' },
  { id: 'pos_staff_reporter', title: 'নিজস্ব প্রতিবেদক / স্টাফ রিপোর্টার (Staff Reporter)', tier: 'tier_reporting' },
  { id: 'pos_district_corr', title: 'জেলা প্রতিনিধি (District Correspondent)', tier: 'tier_reporting' },
  { id: 'pos_upazila_corr', title: 'উপজেলা ও ক্যাম্পাস প্রতিনিধি (Upazila / University Correspondent)', tier: 'tier_reporting' },
  { id: 'pos_citizen_contributor', title: 'নাগরিক সাংবাদিক ও কন্ট্রিবিউটর (Citizen Journalist / Contributor)', tier: 'tier_reporting' },
];

export const RecruitmentManagementPanel: React.FC<RecruitmentManagementPanelProps> = ({
  applications = [],
  onUpdateApplications,
  settings,
  onUpdateSettings,
  users = [],
  onUpdateUsers,
  familyMembers = [],
  onUpdateFamilyMembers = () => {},
  darkMode = false,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'reviewed' | 'approved' | 'rejected'>('all');
  const [selectedApp, setSelectedApp] = useState<JobApplication | null>(null);
  const [previewFileUrl, setPreviewFileUrl] = useState<string | null>(null);
  const [previewFileName, setPreviewFileName] = useState('');
  
  // Notice & Headline State
  const [isEditingNotice, setIsEditingNotice] = useState(false);
  const [noticeHeadline, setNoticeHeadline] = useState(settings?.recruitmentHeadline || 'যোগ দিন আমাদের বার্তা বিভাগে — ক্যারিয়ার ও নিয়োগ আবেদন');
  const [noticeDesc, setNoticeDesc] = useState(settings?.recruitmentDescription || 'বস্তুনিষ্ঠ, নির্ভীক ও অনুসন্ধানী সাংবাদিকতায় দেশজুড়ে তরুণ ও অভিজ্ঞ মিডিয়া পেশাদারদের খুঁজছি।');
  
  // Dynamic Circular Positions State (Requirement 2)
  const defaultOpen = [
    'বার্তা সম্পাদক (News Editor)',
    'জ্যেষ্ঠ সহ-সম্পাদক / সহ-সম্পাদক (Sub-Editor)',
    'মাল্টিমিডিয়া ও সোশ্যাল মিডিয়া এডিটর (Multimedia Editor)',
    'নিজস্ব প্রতিবেদক / স্টাফ রিপোর্টার (Staff Reporter)',
    'জেলা প্রতিনিধি (District Correspondent)',
    'উপজেলা ও ক্যাম্পাস প্রতিনিধি (Upazila / University Correspondent)',
  ];
  const activePositions: string[] = settings?.openRecruitmentPositions || defaultOpen;
  const [newCustomPosition, setNewCustomPosition] = useState('');

  // Manual ID Card Upload State for Approved Candidate (Requirement 4)
  const [idCardModalApp, setIdCardModalApp] = useState<JobApplication | null>(null);
  const [idCardFrontUrl, setIdCardFrontUrl] = useState('');
  const [idCardBackUrl, setIdCardBackUrl] = useState('');
  const [idCardNumber, setIdCardNumber] = useState('');
  const [idCardValidTill, setIdCardValidTill] = useState('৩১ ডিসেম্বর ২০২৭');
  const [isUploadingFront, setIsUploadingFront] = useState(false);
  const [isUploadingBack, setIsUploadingBack] = useState(false);
  const frontInputRef = useRef<HTMLInputElement>(null);
  const backInputRef = useRef<HTMLInputElement>(null);

  const isRecruitmentEnabled = settings?.recruitmentEnabled !== false;

  // Toggle Master Switch
  const handleToggleRecruitment = () => {
    const nextState = !isRecruitmentEnabled;
    const updated = {
      ...settings,
      recruitmentEnabled: nextState,
    };
    onUpdateSettings(updated);
  };

  // Toggle Position Checkbox
  const handleTogglePosition = (title: string) => {
    let nextList: string[];
    if (activePositions.includes(title)) {
      nextList = activePositions.filter(p => p !== title);
    } else {
      nextList = [...activePositions, title];
    }
    const updated = {
      ...settings,
      openRecruitmentPositions: nextList,
    };
    onUpdateSettings(updated);
  };

  // Add custom position
  const handleAddCustomPosition = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCustomPosition.trim()) return;
    const title = newCustomPosition.trim();
    if (!activePositions.includes(title)) {
      const updated = {
        ...settings,
        openRecruitmentPositions: [...activePositions, title],
      };
      onUpdateSettings(updated);
    }
    setNewCustomPosition('');
  };

  const handleSaveNotice = () => {
    const updated = {
      ...settings,
      recruitmentHeadline: noticeHeadline.trim(),
      recruitmentDescription: noticeDesc.trim(),
    };
    onUpdateSettings(updated);
    setIsEditingNotice(false);
  };

  // Filtered Applications
  const filteredApps = applications.filter((app) => {
    const matchesSearch = 
      app.candidateName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.phone.includes(searchTerm) ||
      app.district.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.desiredRole.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (app.email && app.email.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesStatus = statusFilter === 'all' || app.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // Approve and Auto-create Staff Account & Auto-Integrate into "আমাদের পরিবার" (Requirement 3)
  const handleApproveAndCreateAccount = (app: JobApplication) => {
    // Generate role metadata
    const isReporter = app.desiredRole.includes('রিপোর্টার') || app.desiredRole.includes('প্রতিনিধি');
    const isEditor = app.desiredRole.includes('সম্পাদক') || app.desiredRole.includes('এডিটর');
    const assignedRole: UserItem['role'] = isEditor ? 'editor' : isReporter ? 'reporter' : 'author';
    const roleBn = isEditor ? 'সহ-সম্পাদক / সাব-এডিটর' : isReporter ? 'জেলা / স্টাফ প্রতিনিধি' : 'লেখক / প্রতিবেদক';

    const cardPrefix = settings.idCardTemplate?.cardPrefix || 'ND';
    const generatedCardId = generateDomainBasedPressId(settings.domain || cardPrefix, users.map(u => u.idCardNumber || ''));
    const validity = calculateOneYearValidity(new Date());

    const newUserId = `u-${Date.now()}`;
    const avatarUrl = app.photoUrl || app.idProofUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80';

    const newUser: UserItem = {
      id: newUserId,
      name: app.candidateName,
      nameEn: formatEnglishStaffName(app.candidateName),
      email: app.email || `staff.${newUserId}@${settings.domain || 'newsportal.com'}`,
      role: assignedRole,
      roleBn,
      phone: app.phone,
      district: app.district,
      designation: app.desiredRole,
      designationEn: formatEnglishStaffDesignation(app.desiredRole, undefined, assignedRole),
      education: app.education,
      bio: app.experienceBio,
      idCardNumber: generatedCardId,
      idCardIssuedAt: validity.issuedAt,
      idCardValidTill: validity.validTill,
      avatar: avatarUrl,
      postsCount: 0,
      status: 'active',
      autoApprove: false,
    };

    // 1. Update User Accounts
    onUpdateUsers([...users, newUser]);

    // 2. Automatically Integrate into "আমাদের পরিবার" (Our Team) Matching Exact Hierarchy (Requirement 3)
    const tierInfo = determineEditorialTier(app.desiredRole);
    const newFamilyMember: FamilyMember = {
      id: `fam-${Date.now()}`,
      name: app.candidateName,
      designation: app.desiredRole,
      phone: app.phone,
      email: app.email || `staff.${newUserId}@${settings.domain || 'newsportal.com'}`,
      photoUrl: avatarUrl,
      order: tierInfo.orderRank + (familyMembers.length + 1),
      tier: tierInfo.tier,
    };
    onUpdateFamilyMembers([...familyMembers, newFamilyMember]);

    // 3. Update application status
    const updatedApps = applications.map((a) =>
      a.id === app.id
        ? {
            ...a,
            status: 'approved' as const,
            assignedUserId: newUserId,
            notes: `কর্মী অ্যাকাউন্ট ও "আমাদের পরিবার" (${tierInfo.tierNameBn}) এ সফলভাবে অন্তর্ভুক্ত করা হয়েছে। প্রেস আইডি কার্ড নম্বর: ${generatedCardId} (মেয়াদ: ${validity.validTill})।`,
          }
        : a
    );
    onUpdateApplications(updatedApps);

    if (selectedApp?.id === app.id) {
      setSelectedApp({
        ...selectedApp,
        status: 'approved',
        assignedUserId: newUserId,
      });
    }

    alert(`অনুমোদন সফল হয়েছে! ${app.candidateName}-এর আবেদন অনুমোদিত হয়েছে।\n১. কর্মী অ্যাকাউন্ট সক্রিয় হয়েছে (প্রেস কার্ড নম্বর: ${generatedCardId})।\n২. মেয়াদ: ${validity.validTill} (১ বছর)।\n৩. "আমাদের পরিবার" (${tierInfo.tierNameBn}) ডিরেক্টরিতে স্বয়ংক্রিয়ভাবে যুক্ত হয়েছে।`);
  };

  // Open Manual ID Card Upload Modal for Staff/User (Requirement 4)
  const handleOpenIdCardModal = (app: JobApplication) => {
    setIdCardModalApp(app);
    const existingUser = users.find(u => u.id === app.assignedUserId || u.name === app.candidateName);
    const cardPrefix = settings.idCardTemplate?.cardPrefix || 'ND';
    const validity = calculateOneYearValidity(new Date());

    setIdCardFrontUrl(existingUser?.idCardFrontUrl || '');
    setIdCardBackUrl(existingUser?.idCardBackUrl || '');
    setIdCardNumber(existingUser?.idCardNumber || generateStructuredPressId(cardPrefix));
    setIdCardValidTill(existingUser?.idCardValidTill || validity.validTill);
  };

  const handleUploadFrontImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploadingFront(true);
    try {
      const stored = await saveFileToLocalStorage(file, 'idcard_front');
      setIdCardFrontUrl(stored.localPath);
    } catch {
      alert('ফাইল আপলোডে ত্রুটি হয়েছে!');
    } finally {
      setIsUploadingFront(false);
    }
  };

  const handleUploadBackImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploadingBack(true);
    try {
      const stored = await saveFileToLocalStorage(file, 'idcard_back');
      setIdCardBackUrl(stored.localPath);
    } catch {
      alert('ফাইল আপলোডে ত্রুটি হয়েছে!');
    } finally {
      setIsUploadingBack(false);
    }
  };

  const handleSaveIdCardImages = () => {
    if (!idCardModalApp) return;
    const targetUserId = idCardModalApp.assignedUserId;
    
    // Update matching user
    const updatedUsers = users.map(u => {
      if (u.id === targetUserId || u.name === idCardModalApp.candidateName) {
        return {
          ...u,
          idCardFrontUrl,
          idCardBackUrl,
          idCardNumber: idCardNumber.trim(),
          idCardValidTill: idCardValidTill.trim(),
        };
      }
      return u;
    });
    onUpdateUsers(updatedUsers);

    setIdCardModalApp(null);
    alert('প্রেস আইডি কার্ড সফলভাবে আপলোড ও সংরক্ষণ করা হয়েছে! কর্মী তাঁর ইউজার প্যানেল থেকে এটি সরাসরি ডাউনলোড করতে পারবেন।');
  };

  const handleUpdateStatus = (appId: string, status: JobApplication['status']) => {
    const updated = applications.map((a) => (a.id === appId ? { ...a, status } : a));
    onUpdateApplications(updated);
    if (selectedApp?.id === appId) {
      setSelectedApp({ ...selectedApp, status });
    }
  };

  const handleDeleteApplication = (appId: string) => {
    if (confirm('আপনি কি এই আবেদনটি মুছে ফেলতে চান?')) {
      const updated = applications.filter((a) => a.id !== appId);
      onUpdateApplications(updated);
      if (selectedApp?.id === appId) {
        setSelectedApp(null);
      }
    }
  };

  return (
    <div className="space-y-6 font-solaiman">
      {/* 1. Master Toggle & Circular Status Bar */}
      <div className={`p-5 rounded-2xl border transition-all ${
        darkMode ? 'bg-[#1a222c] border-slate-800' : 'bg-white border-slate-200 shadow-xs'
      }`}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-xl ${
              isRecruitmentEnabled 
                ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400' 
                : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
            }`}>
              <Briefcase className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                  নিয়োগ ও ক্যারিয়ার পোর্টাল মাস্টার কন্ট্রোল (Recruitment Portal ON/OFF)
                </h3>
                <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                  isRecruitmentEnabled
                    ? 'bg-emerald-600 text-white'
                    : 'bg-slate-500 text-white'
                }`}>
                  {isRecruitmentEnabled ? 'পোর্টাল চালু (ON)' : 'পোর্টাল বন্ধ (OFF)'}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                মাস্টার টগল চালু থাকলে ফ্রন্টএন্ড ও হেডারে ক্যারিয়ার আবেদন লিঙ্ক দৃশ্যমান থাকবে এবং প্রার্থী আবেদন জমা দিতে পারবেন।
              </p>
            </div>
          </div>

          {/* Master Toggle Button & Public URL Preview */}
          <div className="flex items-center gap-3">
            <a
              href="#apply"
              onClick={(e) => {
                e.preventDefault();
                window.location.hash = 'apply';
              }}
              className="px-3 py-1.5 rounded-lg border border-red-300 dark:border-red-900 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
              title="পাবলিক নিয়োগ ফরম প্রিভিউ দেখুন"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>পাবলিক ফরম দেখুন (/apply)</span>
            </a>

            <button
              onClick={handleToggleRecruitment}
              className={`relative inline-flex h-7 w-13 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden ${
                isRecruitmentEnabled ? 'bg-emerald-600' : 'bg-slate-300 dark:bg-slate-700'
              }`}
              title="Recruitment Portal ON/OFF"
            >
              <span
                className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                  isRecruitmentEnabled ? 'translate-x-6' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>

        {/* Notice Customizer */}
        <div className="pt-4 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
          {!isEditingNotice ? (
            <div className="space-y-1 flex-1">
              <span className="font-bold text-slate-800 dark:text-slate-200 block">
                {settings?.recruitmentHeadline || 'যোগ দিন আমাদের বার্তা বিভাগে — ক্যারিয়ার ও নিয়োগ আবেদন'}
              </span>
              <p className="text-slate-500 dark:text-slate-400 text-[11px]">
                {settings?.recruitmentDescription || 'বস্তুনিষ্ঠ, নির্ভীক ও অনুসন্ধানী সাংবাদিকতায় দেশজুড়ে তরুণ ও অভিজ্ঞ মিডিয়া পেশাদারদের খুঁজছি।'}
              </p>
            </div>
          ) : (
            <div className="space-y-2 flex-1">
              <input
                type="text"
                value={noticeHeadline || ''}
                onChange={(e) => setNoticeHeadline(e.target.value)}
                placeholder="বিজ্ঞপ্তির শিরোনাম"
                className="w-full px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-bold"
              />
              <textarea
                rows={2}
                value={noticeDesc || ''}
                onChange={(e) => setNoticeDesc(e.target.value)}
                placeholder="বিজ্ঞপ্তির বর্ণনা ও প্রার্থীর প্রয়োজনীয় শর্তাবলী"
                className="w-full px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs"
              />
            </div>
          )}

          <div className="flex items-center gap-2">
            {!isEditingNotice ? (
              <button
                onClick={() => setIsEditingNotice(true)}
                className="px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>বিজ্ঞপ্তি সম্পাদনা</span>
              </button>
            ) : (
              <>
                <button
                  onClick={() => setIsEditingNotice(false)}
                  className="px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 text-slate-500 font-bold cursor-pointer"
                >
                  বাতিল
                </button>
                <button
                  onClick={handleSaveNotice}
                  className="px-3.5 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white font-bold cursor-pointer shadow-xs"
                >
                  সংরক্ষণ করুন
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* 2. Dynamic Designation Circulars Controller (Requirement 2: Checkboxes for open positions) */}
      <div className={`p-5 rounded-2xl border transition-all space-y-4 ${
        darkMode ? 'bg-[#1a222c] border-slate-800' : 'bg-white border-slate-200 shadow-xs'
      }`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h4 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>শূন্য পদের সার্কুলার সক্রিয়করণ (Dynamic Circular Designations)</span>
            </h4>
            <p className="text-xs text-slate-500 mt-0.5">
              যে যে পদের বক্সে টিক চিহ্ন (Check) দেওয়া থাকবে, শুধুমাত্র সেই পদগুলোই ফ্রন্টএন্ড আবেদন ফর্মে প্রার্থীদের ড্রপডাউনে প্রদর্শিত হবে।
            </p>
          </div>
          <span className="font-mono text-xs font-bold px-2.5 py-1 rounded-full bg-red-100 dark:bg-red-950/60 text-red-600 shrink-0">
            {activePositions.length}টি পদ উন্মুক্ত
          </span>
        </div>

        {/* Position Checkboxes Grouped by Hierarchical Tiers */}
        <div className="space-y-4">
          {Object.values(EDITORIAL_TIERS).map((tierConfig) => {
            const tierPositions = STANDARD_CIRCULAR_POSITIONS.filter(p => p.tier === tierConfig.key);
            if (tierPositions.length === 0) return null;

            return (
              <div key={tierConfig.key} className="space-y-2">
                <div className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-red-600" />
                  <span>{tierConfig.titleBn}</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                  {tierPositions.map((pos) => {
                    const isChecked = activePositions.includes(pos.title);
                    return (
                      <label
                        key={pos.id}
                        className={`flex items-center gap-2.5 p-2.5 rounded-xl border text-xs cursor-pointer transition-all ${
                          isChecked
                            ? 'bg-red-50 dark:bg-red-950/40 border-red-300 dark:border-red-900 text-red-900 dark:text-red-200 font-bold'
                            : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => handleTogglePosition(pos.title)}
                          className="w-4 h-4 accent-red-600 rounded cursor-pointer shrink-0"
                        />
                        <span className="leading-tight">{pos.title}</span>
                      </label>
                    );
                  })}
                </div>
              </div>
            );
          })}

          {/* Any Custom Positions Added */}
          {activePositions.filter(p => !STANDARD_CIRCULAR_POSITIONS.some(sp => sp.title === p)).length > 0 && (
            <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                কাস্টম যুক্ত করা সার্কুলার পদ:
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                {activePositions
                  .filter(p => !STANDARD_CIRCULAR_POSITIONS.some(sp => sp.title === p))
                  .map((customTitle) => (
                    <label
                      key={customTitle}
                      className="flex items-center justify-between p-2.5 rounded-xl border bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-900 text-emerald-900 dark:text-emerald-200 font-bold text-xs"
                    >
                      <span className="truncate">{customTitle}</span>
                      <button
                        type="button"
                        onClick={() => handleTogglePosition(customTitle)}
                        className="text-red-500 hover:text-red-700 ml-2"
                        title="মুছে ফেলুন"
                      >
                        ✕
                      </button>
                    </label>
                  ))}
              </div>
            </div>
          )}

          {/* Add New Custom Designation Input */}
          <form onSubmit={handleAddCustomPosition} className="flex items-center gap-2 pt-2">
            <input
              type="text"
              value={newCustomPosition || ''}
              onChange={(e) => setNewCustomPosition(e.target.value)}
              placeholder="নতুন কোনো পদ বা সার্কুলার যুক্ত করুন (যেমন: ব্যুরো প্রধান, গ্রাফিক্স ডিজাইনার)"
              className="flex-1 px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs"
            />
            <button
              type="submit"
              className="px-3.5 py-1.5 rounded-lg bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-bold flex items-center gap-1 cursor-pointer hover:opacity-90"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>পদ যোগ করুন</span>
            </button>
          </form>
        </div>
      </div>

      {/* 3. Applicant Applications Table & Review Queue */}
      <div className={`rounded-2xl border overflow-hidden ${
        darkMode ? 'bg-[#1a222c] border-slate-800' : 'bg-white border-slate-200 shadow-xs'
      }`}>
        <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h4 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white flex items-center gap-2">
              <FileText className="w-4 h-4 text-red-600" />
              <span>নিয়োগ আবেদন ও প্রার্থী তালিকা ({filteredApps.length} জন)</span>
            </h4>
            <p className="text-xs text-slate-500">
              প্রার্থীদের জীবনবৃত্তান্ত, জাতীয় পরিচয়পত্র/জন্মসনদ এবং ফাইল যাচাই করে অনুমোদন করুন
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Search */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchTerm || ''}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="নাম, ফোন বা পদ খুঁজুন..."
                className="pl-8 pr-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-transparent text-xs w-44 sm:w-52"
              />
            </div>

            {/* Filter */}
            <select
              value={statusFilter || 'all'}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-transparent text-xs font-bold"
            >
              <option value="all">সকল আবেদন</option>
              <option value="pending">অপেক্ষমাণ (Pending)</option>
              <option value="approved">অনুমোদিত (Approved)</option>
              <option value="rejected">বাতিল (Rejected)</option>
            </select>
          </div>
        </div>

        {/* Applications List */}
        {filteredApps.length === 0 ? (
          <div className="py-16 text-center text-slate-400 space-y-2">
            <Briefcase className="w-10 h-10 mx-auto opacity-40" />
            <p className="text-sm font-bold">কোনো নিয়োগ আবেদন পাওয়া যায়নি</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-900/60 text-slate-500 border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="px-4 py-3 font-bold">প্রার্থীর নাম ও জেলা</th>
                  <th className="px-4 py-3 font-bold">আবেদনের পদবী</th>
                  <th className="px-4 py-3 font-bold">শিক্ষাগত যোগ্যতা</th>
                  <th className="px-4 py-3 font-bold">ডকুমেন্টস (CV / NID)</th>
                  <th className="px-4 py-3 font-bold">স্ট্যাটাস</th>
                  <th className="px-4 py-3 font-bold text-right">কার্যক্রম</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredApps.map((app) => (
                  <tr 
                    key={app.id} 
                    className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                  >
                    <td className="px-4 py-3">
                      <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                        <span>{app.candidateName}</span>
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                          {app.district}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-500 font-mono mt-0.5">
                        {app.phone} {app.email && `• ${app.email}`}
                      </div>
                    </td>

                    <td className="px-4 py-3">
                      <span className="font-bold text-red-600 dark:text-red-400">
                        {app.desiredRole}
                      </span>
                    </td>

                    <td className="px-4 py-3 text-slate-600 dark:text-slate-300 max-w-xs truncate">
                      {app.education}
                    </td>

                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {app.cvUrl && (
                          <button
                            onClick={() => {
                              setPreviewFileUrl(app.cvUrl!);
                              setPreviewFileName(`${app.candidateName}-CV`);
                            }}
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 font-bold text-[10px] hover:underline cursor-pointer"
                            title="সিভি দেখুন"
                          >
                            <FileText className="w-3 h-3" />
                            <span>CV</span>
                          </button>
                        )}
                        {app.idProofUrl && (
                          <button
                            onClick={() => {
                              setPreviewFileUrl(app.idProofUrl!);
                              setPreviewFileName(`${app.candidateName}-ID-Proof`);
                            }}
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 font-bold text-[10px] hover:underline cursor-pointer"
                            title="জাতীয় পরিচয়পত্র/জন্মসনদ দেখুন"
                          >
                            <ShieldCheck className="w-3 h-3" />
                            <span>NID/সনদ</span>
                          </button>
                        )}
                        {app.additionalFiles && app.additionalFiles.length > 0 && (
                          <button
                            onClick={() => {
                              const first = app.additionalFiles![0];
                              setPreviewFileUrl(first.localPath || first.url);
                              setPreviewFileName(first.name);
                            }}
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 font-bold text-[10px] hover:underline cursor-pointer"
                            title={`${app.additionalFiles.length}টি অতিরিক্ত ফাইল ও সনদ সংযুক্ত`}
                          >
                            <Paperclip className="w-3 h-3" />
                            <span>+{app.additionalFiles.length} ফাইল</span>
                          </button>
                        )}
                      </div>
                    </td>

                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                        app.status === 'approved'
                          ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300'
                          : app.status === 'rejected'
                          ? 'bg-red-100 dark:bg-red-950/60 text-red-700 dark:text-red-300'
                          : 'bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 animate-pulse'
                      }`}>
                        {app.status === 'approved' ? '✓ অনুমোদিত' : app.status === 'rejected' ? '✕ বাতিল' : '⏳ অপেক্ষমাণ'}
                      </span>
                    </td>

                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {app.status !== 'approved' && (
                          <button
                            onClick={() => handleApproveAndCreateAccount(app)}
                            className="px-2.5 py-1 rounded bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] flex items-center gap-1 transition-colors cursor-pointer shadow-xs"
                            title="অনুমোদন করুন ও কর্মী অ্যাকাউন্ট তৈরি করুন"
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>অনুমোদন ও টিম সংযুক্তি</span>
                          </button>
                        )}

                        {/* Dedicated Manual ID Card Tool Button (Requirement 4) */}
                        {app.status === 'approved' && (
                          <button
                            onClick={() => handleOpenIdCardModal(app)}
                            className="px-2.5 py-1 rounded bg-red-600 hover:bg-red-700 text-white font-bold text-[11px] flex items-center gap-1 transition-colors cursor-pointer shadow-xs"
                            title="প্রেস আইডি কার্ড আপলোড করুন (সামনে ও পেছনে)"
                          >
                            <CreditCard className="w-3.5 h-3.5" />
                            <span>আইডি কার্ড আপলোড</span>
                          </button>
                        )}

                        <button
                          onClick={() => setSelectedApp(app)}
                          className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 cursor-pointer"
                          title="সম্পূর্ণ বিবরণ"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => handleDeleteApplication(app.id)}
                          className="p-1 rounded hover:bg-red-50 text-red-500 cursor-pointer"
                          title="মুছে ফেলুন"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 4. Manual Press ID Card Upload Modal (Requirement 4) */}
      {idCardModalApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs font-solaiman animate-in fade-in">
          <div className={`max-w-2xl w-full p-6 rounded-2xl border shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto ${
            darkMode ? 'bg-[#151c24] border-slate-700 text-white' : 'bg-white border-slate-200 text-slate-800'
          }`}>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-red-100 dark:bg-red-950/60 text-red-600">
                  <CreditCard className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base">ম্যানুয়াল প্রেস আইডি কার্ড আপলোড ও ব্যবস্থাপনা</h3>
                  <p className="text-xs text-slate-500">
                    কর্মী: <strong>{idCardModalApp.candidateName}</strong> ({idCardModalApp.desiredRole})
                  </p>
                </div>
              </div>
              <button onClick={() => setIdCardModalApp(null)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-slate-900/60 p-3 rounded-xl border border-slate-200 dark:border-slate-800">
              অ্যাডমিন হিসেবে আপনার নিজস্ব ফটোশপ/কাস্টম ডিজাইনের প্রেস আইডি কার্ডের সামনের এবং পেছনের অংশ আপলোড করুন। ফাইলগুলো সরাসরি লোকাল হোস্টিং স্টোরেজে সংরক্ষিত হবে। কর্মী তাঁর প্রোফাইল প্যানেল থেকে কার্ডটি তাৎক্ষণিক ডাউনলোড করতে পারবেন।
            </p>

            {/* Card Metadata inputs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="font-bold block">প্রেস আইডি কার্ড নম্বর</label>
                  <button
                    type="button"
                    onClick={() => {
                      const prefix = settings.idCardTemplate?.cardPrefix || 'ND';
                      setIdCardNumber(generateDomainBasedPressId(settings.domain || prefix, users.map(u => u.idCardNumber || '')));
                    }}
                    className="text-[11px] text-blue-600 dark:text-blue-400 font-bold hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <Sparkles className="w-3 h-3" />
                    <span>ডোমেইন অটো-জেনারেট</span>
                  </button>
                </div>
                <input
                  type="text"
                  value={idCardNumber || ''}
                  onChange={(e) => setIdCardNumber(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-transparent font-mono font-bold"
                  placeholder="ND20268492"
                />
              </div>
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="font-bold block">কার্ডের মেয়াদ (Custom Validity)</label>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => {
                        const val = calculateCustomValidity(new Date(), 6);
                        setIdCardValidTill(val.validTill);
                      }}
                      className="text-[10px] px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 font-bold"
                    >
                      ৬ মাস
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const val = calculateOneYearValidity(new Date());
                        setIdCardValidTill(val.validTill);
                      }}
                      className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-bold"
                    >
                      ১ বছর
                    </button>
                  </div>
                </div>
                <input
                  type="text"
                  value={idCardValidTill || ''}
                  onChange={(e) => setIdCardValidTill(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-transparent font-medium"
                  placeholder="01 June 2027"
                />
              </div>
            </div>

            {/* Front & Back Image Upload Boxes */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Front Side */}
              <div className="space-y-2 p-3.5 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 text-center">
                <span className="font-bold text-xs block text-slate-700 dark:text-slate-300">
                  আইডি কার্ডের সামনের অংশ (Front Side)
                </span>
                {idCardFrontUrl ? (
                  <div className="relative group rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700">
                    <img 
                      src={getLocalFileUrl(idCardFrontUrl)} 
                      alt="Front Card" 
                      className="w-full h-44 object-contain bg-slate-100 dark:bg-slate-900"
                    />
                    <button
                      type="button"
                      onClick={() => frontInputRef.current?.click()}
                      className="absolute inset-0 bg-black/40 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity font-bold text-xs"
                    >
                      ছবি পরিবর্তন করুন
                    </button>
                  </div>
                ) : (
                  <div 
                    onClick={() => frontInputRef.current?.click()}
                    className="h-44 flex flex-col items-center justify-center gap-2 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-900/40 rounded-lg text-slate-400"
                  >
                    <Upload className="w-8 h-8 opacity-60" />
                    <span className="text-xs font-bold text-red-600">ফ্রন্ট ইমেজ আপলোড করুন</span>
                    <span className="text-[10px]">JPG, PNG বা WEBP (লোকাল স্টোরেজ)</span>
                  </div>
                )}
                <input
                  type="file"
                  ref={frontInputRef}
                  accept="image/*"
                  onChange={handleUploadFrontImage}
                  className="hidden"
                />
              </div>

              {/* Back Side */}
              <div className="space-y-2 p-3.5 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 text-center">
                <span className="font-bold text-xs block text-slate-700 dark:text-slate-300">
                  আইডি কার্ডের পেছনের অংশ (Back Side)
                </span>
                {idCardBackUrl ? (
                  <div className="relative group rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700">
                    <img 
                      src={getLocalFileUrl(idCardBackUrl)} 
                      alt="Back Card" 
                      className="w-full h-44 object-contain bg-slate-100 dark:bg-slate-900"
                    />
                    <button
                      type="button"
                      onClick={() => backInputRef.current?.click()}
                      className="absolute inset-0 bg-black/40 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity font-bold text-xs"
                    >
                      ছবি পরিবর্তন করুন
                    </button>
                  </div>
                ) : (
                  <div 
                    onClick={() => backInputRef.current?.click()}
                    className="h-44 flex flex-col items-center justify-center gap-2 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-900/40 rounded-lg text-slate-400"
                  >
                    <Upload className="w-8 h-8 opacity-60" />
                    <span className="text-xs font-bold text-red-600">ব্যাক ইমেজ আপলোড করুন</span>
                    <span className="text-[10px]">JPG, PNG বা WEBP (লোকাল স্টোরেজ)</span>
                  </div>
                )}
                <input
                  type="file"
                  ref={backInputRef}
                  accept="image/*"
                  onChange={handleUploadBackImage}
                  className="hidden"
                />
              </div>
            </div>

            {/* Actions */}
            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2 text-xs">
              <button
                type="button"
                onClick={() => setIdCardModalApp(null)}
                className="px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-700 font-bold"
              >
                বাতিল
              </button>
              <button
                type="button"
                onClick={handleSaveIdCardImages}
                className="px-5 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white font-bold flex items-center gap-1.5 shadow-md"
              >
                <Check className="w-4 h-4" />
                <span>আইডি কার্ড সংরক্ষণ করুন</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 5. Document Preview Modal (CV / NID) */}
      {previewFileUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs font-solaiman">
          <div className="max-w-2xl w-full bg-white dark:bg-slate-900 rounded-2xl p-4 shadow-2xl space-y-3">
            <div className="flex items-center justify-between pb-2 border-b">
              <span className="font-bold text-sm">{previewFileName || 'ডকুমেন্ট প্রিভিউ'}</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => downloadLocalFile(previewFileUrl, `${previewFileName}.png`)}
                  className="px-3 py-1 rounded bg-slate-100 dark:bg-slate-800 text-xs font-bold flex items-center gap-1 hover:bg-slate-200"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>ডাউনলোড</span>
                </button>
                <button
                  onClick={() => setPreviewFileUrl(null)}
                  className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500"
                >
                  ✕
                </button>
              </div>
            </div>
            <div className="max-h-[70vh] overflow-auto flex items-center justify-center bg-slate-50 dark:bg-slate-950 p-2 rounded-lg">
              <img 
                src={getLocalFileUrl(previewFileUrl)} 
                alt="Uploaded Document" 
                className="max-w-full h-auto rounded object-contain"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
