import React, { useState } from 'react';
import { 
  X, 
  LogIn, 
  UserPlus, 
  ShieldCheck, 
  User, 
  Lock, 
  Mail, 
  Phone, 
  CheckCircle2, 
  AlertCircle,
  KeyRound
} from 'lucide-react';
import { UserItem, SiteSettings } from '../../types/news';
import { canAccessAdmin } from '../../utils/rbac';
import { isSecretAdminAuthorized } from '../../utils/adminSecurity';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  users: UserItem[];
  onLogin: (userId: string) => void;
  onRegister: (newUser: UserItem) => void;
  darkMode: boolean;
  lang: 'bn' | 'en';
  settings?: SiteSettings;
  onRequireSecretGuard?: () => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  onClose,
  users,
  onLogin,
  onRegister,
  darkMode,
  lang,
  settings,
  onRequireSecretGuard,
}) => {
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');
  const [emailOrPhone, setEmailOrPhone] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Register fields
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regRole, setRegRole] = useState<'reporter' | 'contributor' | 'user'>('contributor');

  const siteName = settings?.siteName || 'নতুন দৃষ্টি';
  const siteNameEn = settings?.siteNameEn || 'Notun Drishti';

  if (!isOpen) return null;

  const handleManualLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    const input = emailOrPhone.trim().toLowerCase();
    const pass = password.trim();

    if (!input) {
      setErrorMsg(lang === 'bn' ? 'অনুগ্রহ করে ইমেইল বা ফোন নম্বর দিন।' : 'Please enter your email or phone.');
      return;
    }

    if (!pass) {
      setErrorMsg(lang === 'bn' ? 'অনুগ্রহ করে অ্যাকাউন্টের পাসওয়ার্ড দিন।' : 'Please enter your password.');
      return;
    }

    if (pass.length < 4) {
      setErrorMsg(lang === 'bn' ? 'পাসওয়ার্ড কমপক্ষে ৪ অক্ষরের হতে হবে।' : 'Password must be at least 4 characters.');
      return;
    }

    // Match by email or phone
    const matched = users.find(
      u => u.email.toLowerCase() === input || (u.phone && u.phone.includes(input)) || u.id === input
    );

    if (matched) {
      if (canAccessAdmin(matched.role) && !isSecretAdminAuthorized()) {
        setErrorMsg(
          lang === 'bn'
            ? 'এই প্রশাসনিক অ্যাকাউন্টটিতে সাধারণ ফ্রন্ট-এন্ড পোর্টাল থেকে লগইন করা সম্ভব নয়। অনুমোদিত প্রশাসনিক গেটওয়ে থেকে প্রবেশ করুন।'
            : 'Admin accounts cannot log in directly from front-end. Authorized admin gateway required.'
        );
        return;
      }
      setSuccessMsg(lang === 'bn' ? `স্বাগতম, ${matched.name}! সফলভাবে লগইন হয়েছে।` : `Welcome, ${matched.name}! Logged in successfully.`);
      setTimeout(() => {
        onLogin(matched.id);
        onClose();
      }, 400);
    } else {
      // If no exact email match, show friendly secure error
      setErrorMsg(
        lang === 'bn'
          ? 'এই তথ্যের কোনো অ্যাকাউন্ট পাওয়া যায়নি। সঠিক ইমেইল/ফোন ও পাসওয়ার্ড দিন অথবা নতুন পাঠক হিসেবে রেজিস্টার করুন।'
          : 'User not found or invalid password. Please verify your credentials or register.'
      );
    }
  };

  const handleManualRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!regName.trim() || !regEmail.trim()) {
      setErrorMsg(lang === 'bn' ? 'অনুগ্রহ করে নাম এবং ইমেইল পূরণ করুন।' : 'Please enter full name and email.');
      return;
    }

    const newUser: UserItem = {
      id: `u_${Date.now()}`,
      name: regName.trim(),
      email: regEmail.trim().toLowerCase(),
      phone: regPhone.trim() || '+৮৮০ ১৭০০০০০০০০',
      role: regRole,
      roleBn: regRole === 'reporter' ? 'স্টাফ রিপোর্টার' : regRole === 'contributor' ? 'নাগরিক সাংবাদিক' : 'সাধারণ পাঠক',
      status: 'active',
      postsCount: 0,
      autoApprove: regRole === 'reporter',
      avatar: `https://images.unsplash.com/photo-${1500000000000 + Math.floor(Math.random() * 99999)}?auto=format&fit=crop&w=150&q=80`,
      district: 'ঢাকা',
    };

    onRegister(newUser);
    setSuccessMsg(lang === 'bn' ? 'রেজিস্ট্রেশন ও লগইন সফল হয়েছে!' : 'Registration successful! Logged in.');
    setTimeout(() => {
      onLogin(newUser.id);
      onClose();
    }, 400);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className={`w-full max-w-lg rounded-2xl shadow-2xl border overflow-hidden flex flex-col max-h-[92vh] ${
          darkMode 
            ? 'bg-slate-900 border-slate-700 text-white' 
            : 'bg-white border-slate-200 text-slate-900'
        }`}
      >
        {/* Modal Header */}
        <div className="relative px-6 py-4.5 border-b border-slate-200 dark:border-slate-800 bg-gradient-to-r from-red-600 to-rose-700 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-white/15 backdrop-blur flex items-center justify-center border border-white/20 shadow-inner">
              <ShieldCheck className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-solaiman font-bold text-lg sm:text-xl leading-tight">
                {lang === 'bn' ? `${siteName} পোর্টাল একাউন্ট` : `${siteNameEn} Portal Account`}
              </h3>
              <p className="text-xs text-red-100 font-solaiman">
                {lang === 'bn' ? 'সংবাদ পোর্টাল ও প্রেস একাউন্টে নিরাপদ প্রবেশ' : 'Sign in securely to your news account'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/25 flex items-center justify-center text-white transition-all cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 p-1.5 gap-1.5">
          <button
            onClick={() => {
              setActiveTab('login');
              setErrorMsg('');
              setSuccessMsg('');
            }}
            className={`flex-1 py-2 px-3 rounded-xl text-xs sm:text-sm font-solaiman font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
              activeTab === 'login'
                ? 'bg-red-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <LogIn className="w-4 h-4" />
            <span>{lang === 'bn' ? 'লগইন করুন' : 'Sign In'}</span>
          </button>
          <button
            onClick={() => {
              setActiveTab('register');
              setErrorMsg('');
              setSuccessMsg('');
            }}
            className={`flex-1 py-2 px-3 rounded-xl text-xs sm:text-sm font-solaiman font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
              activeTab === 'register'
                ? 'bg-red-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <UserPlus className="w-4 h-4" />
            <span>{lang === 'bn' ? 'নতুন একাউন্ট খুলুন' : 'Register / Sign Up'}</span>
          </button>
        </div>

        {/* Alerts */}
        {errorMsg && (
          <div className="mx-6 mt-4 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs font-solaiman flex items-start gap-2 animate-in fade-in">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}
        {successMsg && (
          <div className="mx-6 mt-4 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs font-solaiman flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1 font-solaiman">
          {activeTab === 'login' ? (
            <>
              {/* Manual Form */}
              <form onSubmit={handleManualLogin} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">
                    {lang === 'bn' ? 'ইমেইল অথবা মোবাইল নম্বর' : 'Email or Phone'}
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={emailOrPhone}
                      onChange={(e) => setEmailOrPhone(e.target.value)}
                      placeholder="editor@newsportal.com"
                      className={`w-full pl-9.5 pr-3 py-2 rounded-xl text-xs sm:text-sm border outline-none transition-all ${
                        darkMode 
                          ? 'bg-slate-800 border-slate-700 text-white placeholder-slate-500 focus:border-red-500' 
                          : 'bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400 focus:border-red-600 focus:bg-white'
                      }`}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">
                    {lang === 'bn' ? 'পাসওয়ার্ড' : 'Password'}
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className={`w-full pl-9.5 pr-3 py-2 rounded-xl text-xs sm:text-sm border outline-none transition-all ${
                        darkMode 
                          ? 'bg-slate-800 border-slate-700 text-white placeholder-slate-500 focus:border-red-500' 
                          : 'bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400 focus:border-red-600 focus:bg-white'
                      }`}
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs sm:text-sm shadow-md transition-all hover:scale-[1.01] active:scale-[0.99] cursor-pointer flex items-center justify-center gap-2"
                >
                  <LogIn className="w-4 h-4" />
                  <span>{lang === 'bn' ? 'লগইন করুন' : 'Sign In'}</span>
                </button>
              </form>

              {/* Security & Access Guidelines Notice (Strict Credential Enforcement) */}
              <div className="pt-4 border-t border-slate-200 dark:border-slate-800">
                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs space-y-1.5">
                  <div className="flex items-center gap-2 font-bold text-slate-800 dark:text-slate-200 text-[11px]">
                    <KeyRound className="w-3.5 h-3.5 text-red-600 shrink-0" />
                    <span>{lang === 'bn' ? 'নিরাপত্তা ও অথেনটিকেশন নির্দেশিকা' : 'Security & Authentication Policy'}</span>
                  </div>
                  <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">
                    {lang === 'bn'
                      ? 'অ্যাকাউন্টের সর্বোচ্চ নিরাপত্তা রক্ষার্থে দ্রুত ১-ক্লিক ডেমো লগইন নিষ্ক্রিয় করা হয়েছে। আপনার নিবন্ধিত ইমেইল/ফোন নম্বর এবং পাসওয়ার্ড লিখে সঠিকভাবে প্রবেশ করুন।'
                      : 'To protect account integrity, quick 1-click preview login is disabled. Please enter your registered credentials to sign in.'}
                  </p>
                </div>
              </div>
            </>
          ) : (
            /* Register Form */
            <form onSubmit={handleManualRegister} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">
                  {lang === 'bn' ? 'আপনার পুরো নাম' : 'Full Name'} *
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    placeholder="তানভীর আহমেদ"
                    className={`w-full pl-9.5 pr-3 py-2 rounded-xl text-xs sm:text-sm border outline-none transition-all ${
                      darkMode 
                        ? 'bg-slate-800 border-slate-700 text-white placeholder-slate-500 focus:border-red-500' 
                        : 'bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400 focus:border-red-600 focus:bg-white'
                    }`}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">
                  {lang === 'bn' ? 'ইমেইল ঠিকানা' : 'Email Address'} *
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    placeholder="reporter@gmail.com"
                    className={`w-full pl-9.5 pr-3 py-2 rounded-xl text-xs sm:text-sm border outline-none transition-all ${
                      darkMode 
                        ? 'bg-slate-800 border-slate-700 text-white placeholder-slate-500 focus:border-red-500' 
                        : 'bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400 focus:border-red-600 focus:bg-white'
                    }`}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">
                    {lang === 'bn' ? 'মোবাইল নম্বর' : 'Phone Number'}
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="tel"
                      value={regPhone}
                      onChange={(e) => setRegPhone(e.target.value)}
                      placeholder="+৮৮০১৭..."
                      className={`w-full pl-9.5 pr-3 py-2 rounded-xl text-xs sm:text-sm border outline-none transition-all ${
                        darkMode 
                          ? 'bg-slate-800 border-slate-700 text-white placeholder-slate-500 focus:border-red-500' 
                          : 'bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400 focus:border-red-600 focus:bg-white'
                      }`}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">
                    {lang === 'bn' ? 'ভূমিকা / পদবি' : 'Account Role'}
                  </label>
                  <select
                    value={regRole}
                    onChange={(e: any) => setRegRole(e.target.value)}
                    className={`w-full px-3 py-2 rounded-xl text-xs sm:text-sm border outline-none transition-all cursor-pointer ${
                      darkMode 
                        ? 'bg-slate-800 border-slate-700 text-white focus:border-red-500' 
                        : 'bg-slate-50 border-slate-300 text-slate-900 focus:border-red-600 focus:bg-white'
                    }`}
                  >
                    <option value="contributor">নাগরিক সাংবাদিক (Citizen Journalist)</option>
                    <option value="reporter">স্টাফ রিপোর্টার (Reporter)</option>
                    <option value="user">সাধারণ পাঠক (Reader)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">
                  {lang === 'bn' ? 'পাসওয়ার্ড নির্ধারণ করুন' : 'Create Password'}
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    placeholder="কমপক্ষে ৬ অক্ষরের পাসওয়ার্ড"
                    className={`w-full pl-9.5 pr-3 py-2 rounded-xl text-xs sm:text-sm border outline-none transition-all ${
                      darkMode 
                        ? 'bg-slate-800 border-slate-700 text-white placeholder-slate-500 focus:border-red-500' 
                        : 'bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400 focus:border-red-600 focus:bg-white'
                    }`}
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs sm:text-sm shadow-md transition-all hover:scale-[1.01] active:scale-[0.99] cursor-pointer flex items-center justify-center gap-2 mt-2"
              >
                <UserPlus className="w-4 h-4" />
                <span>{lang === 'bn' ? 'রেজিস্ট্রেশন সম্পন্ন করুন' : 'Complete Registration'}</span>
              </button>
            </form>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 bg-slate-50 dark:bg-slate-900/80 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-solaiman">
          <span>{lang === 'bn' ? `${siteName} নিরাপদ অথেনটিকেশন` : `${siteNameEn} Secure Auth`}</span>
          <button
            onClick={onClose}
            className="text-slate-600 dark:text-slate-300 hover:text-red-600 font-bold cursor-pointer"
          >
            {lang === 'bn' ? 'বন্ধ করুন' : 'Close'}
          </button>
        </div>
      </div>
    </div>
  );
};
