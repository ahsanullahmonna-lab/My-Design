import React, { useState, useEffect, useRef } from 'react';
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
  Loader2, 
  CreditCard,
  GraduationCap,
  Sparkles,
  Upload,
  Download,
  Clock
} from 'lucide-react';
import { UserItem } from '../../types/news';
import { useSiteConfig } from '../../context/SiteConfigContext';
import { saveFileToLocalStorage, getLocalFileUrl, downloadLocalFile } from '../../utils/localRecruitmentStorage';
import { calculateCustomValidity, calculateOneYearValidity, generateDomainBasedPressId, generateStructuredPressId } from '../../utils/pressIdCardGenerator';

interface UserEditModalProps {
  user: UserItem | null;
  isOpen: boolean;
  onClose: () => void;
  onSaveUser: (updatedUser: UserItem) => void;
  darkMode?: boolean;
}

export const UserEditModal: React.FC<UserEditModalProps> = ({
  user,
  isOpen,
  onClose,
  onSaveUser,
  darkMode = false,
}) => {
  const { settings } = useSiteConfig();
  const cardPrefix = settings?.idCardTemplate?.cardPrefix || 'ND';
  const [name, setName] = useState('');
  const [nameEn, setNameEn] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<UserItem['role']>('reporter');
  const [roleBn, setRoleBn] = useState('');
  const [designation, setDesignation] = useState('');
  const [designationEn, setDesignationEn] = useState('');
  const [customTemplateId, setCustomTemplateId] = useState<UserItem['customTemplateId']>(undefined);
  const [phone, setPhone] = useState('');
  const [district, setDistrict] = useState('');
  const [bloodGroup, setBloodGroup] = useState('O+');
  const [education, setEducation] = useState('');
  const [bio, setBio] = useState('');
  const [idCardNumber, setIdCardNumber] = useState('');
  const [idCardValidTill, setIdCardValidTill] = useState('01 June 2027');
  const [emergencyContact, setEmergencyContact] = useState('');
  const [avatar, setAvatar] = useState('');
  const [idCardFrontUrl, setIdCardFrontUrl] = useState('');
  const [idCardBackUrl, setIdCardBackUrl] = useState('');
  const [isUploadingFront, setIsUploadingFront] = useState(false);
  const [isUploadingBack, setIsUploadingBack] = useState(false);
  const frontInputRef = useRef<HTMLInputElement>(null);
  const backInputRef = useRef<HTMLInputElement>(null);
  const [autoApprove, setAutoApprove] = useState(false);
  const [canPostOnBehalf, setCanPostOnBehalf] = useState(false);
  const [idCardStatus, setIdCardStatus] = useState<'pending' | 'approved' | 'rejected'>('approved');
  const [idCardAdminNote, setIdCardAdminNote] = useState('');
  const [status, setStatus] = useState<'active' | 'inactive'>('active');

  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setNameEn(user.nameEn || '');
      setEmail(user.email || '');
      setRole(user.role || 'reporter');
      setRoleBn(user.roleBn || 'কর্মী');
      setDesignation(user.designation || '');
      setDesignationEn(user.designationEn || '');
      setCustomTemplateId(user.customTemplateId);
      setPhone(user.phone || '');
      setDistrict(user.district || '');
      setBloodGroup(user.bloodGroup || 'O+');
      setEducation(user.education || '');
      setBio(user.bio || '');
      setIdCardNumber(user.idCardNumber || '');
      setIdCardValidTill(user.idCardValidTill || '01 June 2027');
      setEmergencyContact(user.emergencyContact || '');
      setAvatar(user.avatar || '');
      setIdCardFrontUrl(user.idCardFrontUrl || '');
      setIdCardBackUrl(user.idCardBackUrl || '');
      setAutoApprove(!!user.autoApprove);
      setCanPostOnBehalf(!!user.canPostOnBehalf || user.role === 'master');
      setIdCardStatus(user.idCardStatus || 'approved');
      setIdCardAdminNote(user.idCardAdminNote || '');
      setStatus(user.status || 'active');
    }
  }, [user]);

  if (!isOpen || !user) return null;

  const handleRoleChange = (newRole: UserItem['role']) => {
    setRole(newRole);
    switch (newRole) {
      case 'admin':
        setRoleBn('সুপার অ্যাডমিন / এডমিন');
        setCanPostOnBehalf(true);
        break;
      case 'master':
        setRoleBn('মাস্টার / প্রতিনিধি সমন্বয়কারী (Master Desk)');
        setCanPostOnBehalf(true);
        break;
      case 'editor':
        setRoleBn('সহ-সম্পাদক / সাব-এডিটর');
        break;
      case 'reporter':
        setRoleBn('স্টাফ রিপোর্টার / প্রতিনিধি');
        break;
      case 'author':
        setRoleBn('লেখক / কলামিস্ট');
        break;
      case 'contributor':
        setRoleBn('নাগরিক সাংবাদিক / কন্ট্রিবিউটর');
        break;
      case 'subscriber':
      case 'user':
        setRoleBn('সাধারণ পাঠক / নিবন্ধিত গ্রাহক');
        break;
      default:
        setRoleBn('কর্মী');
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingAvatar(true);
    try {
      const res = await saveFileToLocalStorage(file, 'photo');
      if (res.localPath) {
        setAvatar(res.localPath);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  const handleUploadFrontCard = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploadingFront(true);
    try {
      const res = await saveFileToLocalStorage(file, 'idcard_front');
      setIdCardFrontUrl(res.localPath);
    } catch (err) {
      console.error(err);
    } finally {
      setIsUploadingFront(false);
    }
  };

  const handleUploadBackCard = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploadingBack(true);
    try {
      const res = await saveFileToLocalStorage(file, 'idcard_back');
      setIdCardBackUrl(res.localPath);
    } catch (err) {
      console.error(err);
    } finally {
      setIsUploadingBack(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: UserItem = {
      ...user,
      name: name.trim(),
      nameEn: nameEn.trim() || undefined,
      email: email.trim(),
      role,
      roleBn: roleBn.trim(),
      designation: designation.trim(),
      designationEn: designationEn.trim() || undefined,
      customTemplateId: customTemplateId || undefined,
      phone: phone.trim(),
      district: district.trim(),
      bloodGroup: bloodGroup.trim(),
      education: education.trim(),
      bio: bio.trim(),
      idCardNumber: idCardNumber.trim(),
      idCardValidTill: idCardValidTill.trim(),
      emergencyContact: emergencyContact.trim(),
      avatar: avatar.trim(),
      idCardFrontUrl: idCardFrontUrl.trim(),
      idCardBackUrl: idCardBackUrl.trim(),
      autoApprove,
      canPostOnBehalf: canPostOnBehalf || role === 'master' || role === 'admin',
      idCardStatus,
      idCardAdminNote: idCardAdminNote.trim() || undefined,
      status,
    };

    onSaveUser(updated);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-xs font-solaiman animate-in fade-in duration-200">
      <div 
        className={`w-full max-w-2xl max-h-[92vh] flex flex-col rounded-2xl shadow-2xl overflow-hidden border transition-all ${
          darkMode ? 'bg-[#151c24] border-slate-700 text-white' : 'bg-white border-slate-200 text-slate-800'
        }`}
      >
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-red-600 text-white">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold">
                ব্যবহারকারী প্রোফাইল ও অনুমতি সম্পাদনা (Edit User Account)
              </h3>
              <p className="text-xs text-slate-400">
                ইউজার আইডি: <span className="font-mono text-white">{user.id}</span>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-white/20 transition-colors text-white cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-4 text-xs">
          {/* Avatar & Basic */}
          <div className="flex flex-col sm:flex-row items-center gap-4 p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
            <div className="relative group">
              <img
                src={avatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80'}
                alt={name}
                className="w-16 h-16 rounded-full object-cover border-2 border-red-600 shadow-md"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-white cursor-pointer"
              >
                <Camera className="w-4 h-4" />
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleAvatarUpload}
                className="hidden"
              />
            </div>

            <div className="flex-1 space-y-1 text-center sm:text-left">
              <div className="flex items-center justify-center sm:justify-start gap-2">
                <button
                  type="button"
                  disabled={isUploadingAvatar}
                  onClick={() => fileInputRef.current?.click()}
                  className="px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white font-bold flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {isUploadingAvatar ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <UploadCloud className="w-3.5 h-3.5" />
                  )}
                  <span>ছবি আপলোড</span>
                </button>
                <input
                  type="text"
                  value={avatar || ''}
                  onChange={(e) => setAvatar(e.target.value)}
                  placeholder="বা ছবির URL দিন"
                  className="flex-1 px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-mono text-[11px]"
                />
              </div>
            </div>
          </div>

          {/* Grid 1 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold mb-1">প্রার্থীর নাম <span className="text-red-500">*</span></label>
              <input
                type="text"
                required
                value={name || ''}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-bold"
              />
            </div>

            <div>
              <label className="block font-bold mb-1">ই-মেইল <span className="text-red-500">*</span></label>
              <input
                type="email"
                required
                value={email || ''}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-mono"
              />
            </div>

            <div>
              <label className="block font-bold mb-1">সিস্টেম ভূমিকা (System Role) <span className="text-red-500">*</span></label>
              <select
                value={role || 'reporter'}
                onChange={(e) => handleRoleChange(e.target.value as any)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-bold text-red-600"
              >
                <option value="admin">সুপার অ্যাডমিন (Admin)</option>
                <option value="master">মাস্টার / প্রতিনিধি সমন্বয়কারী (Master Desk)</option>
                <option value="editor">সহ-সম্পাদক (Editor)</option>
                <option value="reporter">স্টাফ রিপোর্টার (Reporter)</option>
                <option value="author">লেখক / কলামিস্ট (Author)</option>
                <option value="contributor">কন্ট্রিবিউটর (Contributor)</option>
                <option value="subscriber">সাধারণ পাঠক (Subscriber)</option>
              </select>
            </div>

            <div>
              <label className="block font-bold mb-1">বাংলা ভূমিকা লেবেল (Role in Bengali)</label>
              <input
                type="text"
                value={roleBn || ''}
                onChange={(e) => setRoleBn(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
              />
            </div>

            <div>
              <label className="block font-bold mb-1">মোবাইল নম্বর</label>
              <input
                type="tel"
                value={phone || ''}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-mono"
              />
            </div>

            <div>
              <label className="block font-bold mb-1">জেলা / স্টেশন</label>
              <input
                type="text"
                value={district || ''}
                onChange={(e) => setDistrict(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
              />
            </div>

            <div>
              <label className="block font-bold mb-1">অফিশিয়াল পদবী (বাংলা)</label>
              <input
                type="text"
                value={designation || ''}
                onChange={(e) => setDesignation(e.target.value)}
                placeholder="যেমন: জ্যেষ্ঠ প্রতিবেদক"
                className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
              />
            </div>

            <div>
              <label className="block font-bold mb-1">রক্তের গ্রুপ (Blood Group)</label>
              <select
                value={bloodGroup || 'O+'}
                onChange={(e) => setBloodGroup(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-bold"
              >
                {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map((bg) => (
                  <option key={bg} value={bg}>{bg}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Dedicated Press ID Card Customization Box (Requirement 2, 3 & 5) */}
          <div className="p-4 rounded-xl border border-red-200 dark:border-red-900/60 bg-red-50/20 dark:bg-red-950/20 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-red-100 dark:border-red-900/40">
              <span className="font-bold text-xs flex items-center gap-1.5 text-red-900 dark:text-red-300">
                <CreditCard className="w-4 h-4 text-red-600" />
                <span>প্রেস আইডি কার্ড সুনির্দিষ্ট কনফিগারেশন (English Typography & Person-by-Person Validity)</span>
              </span>
              <span className="text-[10px] font-mono text-red-600 font-bold">PRO-CARD</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              {/* English Name */}
              <div>
                <label className="block font-bold text-slate-800 dark:text-slate-200 mb-1">
                  কার্ডে প্রদর্শিত ইংরেজি নাম (English Name) <span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  value={nameEn || ''}
                  onChange={(e) => setNameEn(e.target.value)}
                  placeholder="e.g. Khalakujjaman"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-sans font-bold"
                />
                <span className="text-[10px] text-slate-400 mt-0.5 block">প্রেস কার্ডের সামনের পাতায় ইংরেজিতে প্রিন্ট হবে</span>
              </div>

              {/* English Journalistic Designation (Excluding Site Roles) */}
              <div>
                <label className="block font-bold text-slate-800 dark:text-slate-200 mb-1">
                  সাংবাদিক পদবি (English Designation - নো সাইট রোল) <span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  value={designationEn || ''}
                  onChange={(e) => setDesignationEn(e.target.value)}
                  placeholder="e.g. Staff Correspondent, Senior Reporter"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-sans font-bold"
                />
                <span className="text-[10px] text-slate-400 mt-0.5 block">যেমন: Staff Correspondent, Senior Reporter, Bureau Chief</span>
              </div>

              {/* Domain-based Auto-generated ID */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block font-bold text-slate-800 dark:text-slate-200">
                    ডোমেইনভিত্তিক আইডি নম্বর (Domain-Based ID)
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      const newId = generateDomainBasedPressId(settings?.domain || cardPrefix, [], user?.id);
                      setIdCardNumber(newId);
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
                  placeholder="ND20268492"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-mono font-bold"
                />
              </div>

              {/* Template Selection for this person */}
              <div>
                <label className="block font-bold text-slate-800 dark:text-slate-200 mb-1">
                  ডিজাইন টেমপ্লেট (Design Template)
                </label>
                <select
                  value={customTemplateId || ''}
                  onChange={(e) => setCustomTemplateId(e.target.value ? (e.target.value as any) : undefined)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-bold cursor-pointer"
                >
                  <option value="">ডিফল্ট পোর্টাল টেমপ্লেট (Default)</option>
                  <option value="classic-press">ক্লাসিক ব্রডশিট (Classic Press)</option>
                  <option value="modern-executive">মডার্ন এক্সিকিউটিভ (Modern Executive)</option>
                  <option value="national-press">জাতীয় প্রেস ক্লাব (National Press)</option>
                  <option value="custom-uploaded">কাস্টম আপলোডকৃত (Custom Uploaded)</option>
                </select>
              </div>

              {/* Person-by-Person Custom Validity (Requirement 5) */}
              <div className="sm:col-span-2">
                <div className="flex flex-wrap items-center justify-between gap-1 mb-1.5">
                  <label className="block font-bold text-slate-800 dark:text-slate-200">
                    ব্যক্তিভিত্তিক আইডি কার্ডের মেয়াদ (Custom Validity)
                  </label>
                  {/* Preset Buttons */}
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => {
                        const val = calculateCustomValidity(new Date(), 6);
                        setIdCardValidTill(val.validTill);
                      }}
                      className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
                    >
                      ৬ মাস
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const val = calculateCustomValidity(new Date(), 12);
                        setIdCardValidTill(val.validTill);
                      }}
                      className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 transition-colors cursor-pointer"
                    >
                      ১ বছর
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const val = calculateCustomValidity(new Date(), 24);
                        setIdCardValidTill(val.validTill);
                      }}
                      className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300 border border-blue-300 dark:border-blue-800 transition-colors cursor-pointer"
                    >
                      ২ বছর
                    </button>
                  </div>
                </div>
                <input
                  type="text"
                  value={idCardValidTill || ''}
                  onChange={(e) => setIdCardValidTill(e.target.value)}
                  placeholder="01 June 2027 বা যেকোনো কাস্টম তারিখ"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-medium font-sans"
                />
              </div>
            </div>
          </div>

          {/* Manual Press ID Card Image Uploaders (Requirement 4) */}
          <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/40 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
              <span className="font-bold text-xs flex items-center gap-1.5 text-slate-800 dark:text-slate-200">
                <CreditCard className="w-3.5 h-3.5 text-red-600" />
                <span>ম্যানুয়াল প্রেস আইডি কার্ড আপলোড (সামনে ও পেছনে)</span>
              </span>
              <span className="text-[10px] text-slate-400 font-mono">/uploads/recruitment/</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              {/* Front Card */}
              <div className="p-2.5 rounded-lg border border-dashed border-slate-300 dark:border-slate-700 text-center space-y-2 bg-white dark:bg-slate-900">
                <span className="font-bold block text-[11px]">সামনের অংশ (Front Card)</span>
                {idCardFrontUrl ? (
                  <div className="relative group rounded overflow-hidden border">
                    <img src={getLocalFileUrl(idCardFrontUrl)} alt="Front" className="w-full h-28 object-contain bg-slate-100 dark:bg-slate-950" />
                    <button
                      type="button"
                      onClick={() => frontInputRef.current?.click()}
                      className="absolute inset-0 bg-black/40 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 text-[10px] font-bold"
                    >
                      পরিবর্তন
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => frontInputRef.current?.click()}
                    disabled={isUploadingFront}
                    className="w-full py-4 border rounded hover:border-red-500 flex flex-col items-center justify-center gap-1 text-slate-500 cursor-pointer"
                  >
                    <Upload className="w-4 h-4 text-red-600" />
                    <span className="text-[11px] font-bold">ফ্রন্ট কার্ড আপলোড</span>
                  </button>
                )}
                <input
                  type="file"
                  ref={frontInputRef}
                  accept="image/*"
                  onChange={handleUploadFrontCard}
                  className="hidden"
                />
              </div>

              {/* Back Card */}
              <div className="p-2.5 rounded-lg border border-dashed border-slate-300 dark:border-slate-700 text-center space-y-2 bg-white dark:bg-slate-900">
                <span className="font-bold block text-[11px]">পেছনের অংশ (Back Card)</span>
                {idCardBackUrl ? (
                  <div className="relative group rounded overflow-hidden border">
                    <img src={getLocalFileUrl(idCardBackUrl)} alt="Back" className="w-full h-28 object-contain bg-slate-100 dark:bg-slate-950" />
                    <button
                      type="button"
                      onClick={() => backInputRef.current?.click()}
                      className="absolute inset-0 bg-black/40 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 text-[10px] font-bold"
                    >
                      পরিবর্তন
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => backInputRef.current?.click()}
                    disabled={isUploadingBack}
                    className="w-full py-4 border rounded hover:border-red-500 flex flex-col items-center justify-center gap-1 text-slate-500 cursor-pointer"
                  >
                    <Upload className="w-4 h-4 text-red-600" />
                    <span className="text-[11px] font-bold">ব্যাক কার্ড আপলোড</span>
                  </button>
                )}
                <input
                  type="file"
                  ref={backInputRef}
                  accept="image/*"
                  onChange={handleUploadBackCard}
                  className="hidden"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block font-bold mb-1">শিক্ষাগত যোগ্যতা</label>
            <input
              type="text"
              value={education || ''}
              onChange={(e) => setEducation(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
            />
          </div>

          <div>
            <label className="block font-bold mb-1">সংক্ষিপ্ত বায়ো ও জীবনবৃত্তান্ত</label>
            <textarea
              rows={2}
              value={bio || ''}
              onChange={(e) => setBio(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
            />
          </div>

          {/* Switches: Delegated Posting, Auto-Approve & Status (Requirement 1 & 2) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-200 dark:border-slate-800">
            {/* Master / Delegated Posting Toggle */}
            <div className="flex items-center justify-between p-3 rounded-xl border border-indigo-200 dark:border-indigo-900/60 bg-indigo-50/30 dark:bg-indigo-950/20 sm:col-span-2">
              <div>
                <span className="font-bold text-xs text-indigo-950 dark:text-indigo-200 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-indigo-600" />
                  <span>অন্যের নামে পোস্ট ও অ্যাসাইন করার বিশেষ ক্ষমতা (Master Delegated Poster)</span>
                </span>
                <span className="text-[10px] text-slate-500 block mt-0.5">
                  সক্রিয় করলে এই ব্যবহারকারী নিউজ ডেস্কে যেকোনো সাংবাদিক বা ইউজারের নামে সরাসরি সংবাদ পাবলিশ করতে পারবেন।
                </span>
              </div>
              <input
                type="checkbox"
                checked={canPostOnBehalf || role === 'master' || role === 'admin'}
                onChange={(e) => setCanPostOnBehalf(e.target.checked)}
                disabled={role === 'master' || role === 'admin'}
                className="w-4 h-4 accent-indigo-600 cursor-pointer shrink-0 ml-2"
              />
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl border border-slate-200 dark:border-slate-800">
              <div>
                <span className="font-bold block">স্বয়ংক্রিয় প্রকাশ (Auto-Approve)</span>
                <span className="text-[10px] text-slate-400">সংবাদ সরাসরি প্রকাশ পাবে</span>
              </div>
              <input
                type="checkbox"
                checked={autoApprove}
                onChange={(e) => setAutoApprove(e.target.checked)}
                className="w-4 h-4 accent-red-600 cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl border border-slate-200 dark:border-slate-800">
              <div>
                <span className="font-bold block">অ্যাকাউন্ট স্ট্যাটাস (Account Status)</span>
                <span className="text-[10px] text-slate-400">{status === 'active' ? 'সক্রিয় কর্মী' : 'নিষ্ক্রিয়'}</span>
              </div>
              <select
                value={status || 'active'}
                onChange={(e) => setStatus(e.target.value as any)}
                className="px-2 py-1 rounded border border-slate-300 dark:border-slate-700 bg-transparent font-bold"
              >
                <option value="active">Active (সক্রিয়)</option>
                <option value="inactive">Inactive (নিষ্ক্রিয়)</option>
              </select>
            </div>
          </div>

          {/* ID Card Request Status & Admin Feedback Notes (Requirement 2) */}
          <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/40 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="font-bold text-xs text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                <CreditCard className="w-4 h-4 text-red-600" />
                <span>প্রেস আইডি কার্ড অনুমোদন স্ট্যাটাস (Press ID Status & Decision Note)</span>
              </span>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                idCardStatus === 'approved' 
                  ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300' 
                  : idCardStatus === 'rejected'
                  ? 'bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-300'
                  : 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-400'
              }`}>
                {idCardStatus === 'approved' ? 'অনুমোদিত' : idCardStatus === 'rejected' ? 'বাতিল' : 'অপেক্ষমাণ'}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <select
                value={idCardStatus}
                onChange={(e) => setIdCardStatus(e.target.value as any)}
                className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-bold text-xs"
              >
                <option value="approved">অনুমোদিত (Approved - সক্রিয়)</option>
                <option value="pending">অপেক্ষমাণ (Pending Verification)</option>
                <option value="rejected">বাতিল / স্থগিত (Rejected)</option>
              </select>

              <div className="sm:col-span-2">
                <input
                  type="text"
                  value={idCardAdminNote}
                  onChange={(e) => setIdCardAdminNote(e.target.value)}
                  placeholder="আইডি কার্ড বিষয়ে ইউজারের ড্যাশবোর্ডের জন্য নোট বা কারণ..."
                  className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs"
                />
              </div>
            </div>
          </div>

          {/* Footer buttons */}
          <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-700 text-xs font-bold cursor-pointer"
            >
              বাতিল
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white font-bold flex items-center gap-1.5 shadow-md cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>পরিবর্তন সংরক্ষণ করুন</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
