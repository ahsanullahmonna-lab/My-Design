import React, { useState, useEffect } from 'react';
import { Shield, Lock, Eye, EyeOff, AlertTriangle, CheckCircle2, ArrowRight, ArrowLeft, Clock } from 'lucide-react';
import { verifySecretToken, getLockoutRemainingSeconds, getFailedAttemptsCount } from '../../utils/adminSecurity';
import { SiteSettings } from '../../types/news';

interface SecretAdminGuardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUnlockSuccess: () => void;
  settings?: SiteSettings;
  darkMode?: boolean;
}

export const SecretAdminGuardModal: React.FC<SecretAdminGuardModalProps> = ({
  isOpen,
  onClose,
  onUnlockSuccess,
  settings,
  darkMode = false,
}) => {
  const [tokenInput, setTokenInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [lockoutSeconds, setLockoutSeconds] = useState(0);

  // Check lockout on open
  useEffect(() => {
    if (isOpen) {
      setTokenInput('');
      setErrorMsg('');
      setSuccessMsg('');
      const rem = getLockoutRemainingSeconds();
      setLockoutSeconds(rem);
    }
  }, [isOpen]);

  // Lockout countdown timer
  useEffect(() => {
    if (lockoutSeconds <= 0) return;
    const interval = setInterval(() => {
      setLockoutSeconds(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [lockoutSeconds]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (lockoutSeconds > 0) {
      setErrorMsg(`নিরাপত্তা সুরক্ষার কারণে গেটওয়ে সাময়িকভাবে লক। অনুগ্রহ করে ${lockoutSeconds} সেকেন্ড অপেক্ষা করুন।`);
      return;
    }

    const trimmed = tokenInput.trim();
    if (!trimmed) {
      setErrorMsg('অনুগ্রহ করে আপনার নির্ধারিত সিক্রেট অ্যাডমিন টোকেন দিন।');
      return;
    }

    setIsVerifying(true);

    setTimeout(() => {
      const result = verifySecretToken(trimmed, settings);
      setIsVerifying(false);

      if (result.success) {
        setSuccessMsg('সিক্রেট টোকেন সফলভাবে যাচাই হয়েছে! অ্যাডমিন গেটওয়ে আনলক করা হচ্ছে...');
        setTimeout(() => {
          onUnlockSuccess();
        }, 400);
      } else {
        if (result.remainingLockoutSeconds && result.remainingLockoutSeconds > 0) {
          setLockoutSeconds(result.remainingLockoutSeconds);
          setErrorMsg(`একাধিক ভুল চেষ্টার কারণে গেটওয়ে ${result.remainingLockoutSeconds} সেকেন্ডের জন্য সাময়িকভাবে লক করা হয়েছে।`);
        } else {
          const attemptsLeft = typeof result.attemptsLeft === 'number' ? result.attemptsLeft : 0;
          setErrorMsg(
            attemptsLeft > 0
              ? `ভুল সিক্রেট টোকেন! প্রবেশাধিকার অস্বীকৃত। (আর ${attemptsLeft} বার চেষ্টা করা যাবে)`
              : 'ভুল সিক্রেট টোকেন! নিরাপত্তা সুরক্ষার কারণে প্রবেশাধিকার অস্বীকৃত।'
          );
        }
      }
    }, 350);
  };

  const isLocked = lockoutSeconds > 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className={`w-full max-w-md p-6 sm:p-7 rounded-2xl shadow-2xl border text-left font-solaiman relative overflow-hidden ${
          darkMode ? 'bg-[#111827] border-red-900/60 text-slate-100' : 'bg-white border-red-200 text-slate-900'
        }`}
      >
        {/* Top Glowing Red Accent Ribbon */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-red-600 via-amber-500 to-red-700" />

        {/* Shield Icon Header */}
        <div className="text-center space-y-3 pt-2">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-red-500 to-rose-700 text-white flex items-center justify-center mx-auto shadow-lg ring-8 ring-red-500/15">
            <Lock className="w-8 h-8 text-white" />
          </div>
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-red-100 dark:bg-red-950/80 text-red-700 dark:text-red-300 text-[11px] font-bold border border-red-300 dark:border-red-900/80 mb-1">
              <Shield className="w-3.5 h-3.5" />
              <span>আইসোলেটেড সিকিউরিটি গেটওয়ে গার্ড</span>
            </div>
            <h2 className="text-xl font-black text-gray-950 dark:text-white">
              প্রশাসনিক সিক্রেট টোকেন যাচাই
            </h2>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed mt-1">
              এই অ্যাডমিন প্যানেলটি মূল ফ্রন্ট-এন্ড থেকে সম্পূর্ণ আলাদা ও সুরক্ষিত। সাধারণ দর্শকদের প্রবেশাধিকার নিষিদ্ধ। প্রবেশ করতে নির্ধারিত সিক্রেট টোকেন দিন।
            </p>
          </div>
        </div>

        {/* Lockout Warning Banner */}
        {isLocked && (
          <div className="mt-4 p-3 rounded-xl bg-amber-50 dark:bg-amber-950/60 border border-amber-300 dark:border-amber-800 text-amber-800 dark:text-amber-200 text-xs flex items-center gap-2.5">
            <Clock className="w-5 h-5 shrink-0 text-amber-600 animate-spin" />
            <div>
              <p className="font-bold">গেটওয়ে লকআউট সক্রিয়</p>
              <p className="text-[11px]">পুনরায় চেষ্টা করার আগে অপেক্ষা করুন: <span className="font-mono font-bold text-red-600 dark:text-red-400">{lockoutSeconds}</span> সেকেন্ড</p>
            </div>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1.5">
              সিক্রেট অ্যাক্সেস টোকেন (Secret Token Key) *
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={tokenInput}
                disabled={isLocked || isVerifying}
                onChange={(e) => {
                  setTokenInput(e.target.value);
                  setErrorMsg('');
                }}
                placeholder="গোপন সিক্রেট টোকেন প্রদান করুন..."
                autoFocus
                className={`w-full pl-3.5 pr-10 py-2.5 rounded-xl text-xs sm:text-sm border outline-none font-mono tracking-wider transition-all disabled:opacity-50 ${
                  errorMsg 
                    ? 'border-red-500 bg-red-50/50 dark:bg-red-950/30' 
                    : darkMode 
                    ? 'bg-slate-800/90 border-slate-700 text-white placeholder-slate-500 focus:border-red-500' 
                    : 'bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400 focus:border-red-600 focus:bg-white'
                }`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 cursor-pointer"
                title={showPassword ? 'টোকেন লুকান' : 'টোকেন দেখুন'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Feedback Messages */}
          {errorMsg && (
            <div className="p-3 rounded-xl bg-red-100 dark:bg-red-950/60 border border-red-300 dark:border-red-900/80 text-red-700 dark:text-red-300 text-xs flex items-center gap-2 animate-in fade-in">
              <AlertTriangle className="w-4 h-4 shrink-0 text-red-600" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-900/80 text-emerald-800 dark:text-emerald-300 text-xs flex items-center gap-2 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Action Buttons */}
          <div className="space-y-2 pt-1">
            <button
              type="submit"
              disabled={isVerifying || isLocked}
              className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-red-600 to-rose-700 hover:from-red-700 hover:to-rose-800 text-white font-bold text-xs sm:text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span>{isVerifying ? 'যাচাই করা হচ্ছে...' : 'সিক্রেট টোকেন যাচাই ও গেটওয়ে আনলক'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={onClose}
              className={`w-full py-2 px-4 rounded-xl text-xs font-bold border transition-colors flex items-center justify-center gap-1.5 cursor-pointer ${
                darkMode
                  ? 'border-slate-700 hover:bg-slate-800 text-slate-300'
                  : 'border-slate-300 hover:bg-slate-100 text-slate-700'
              }`}
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>মূল সংবাদ পোর্টালে ফিরে যান (Back to Portal)</span>
            </button>
          </div>
        </form>

        <div className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-800/80 text-center">
          <p className="text-[10px] text-slate-400">
            নিরাপত্তা নির্দেশিকা: শুধুমাত্র অনুমোদিত সম্পাদকীয় ও কারিগরি কর্মকর্তা ব্যতীত অন্যদের প্রবেশাধিকার আইনত দণ্ডনীয়।
          </p>
        </div>
      </div>
    </div>
  );
};
