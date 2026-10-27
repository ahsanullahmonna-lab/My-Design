import React, { useState, useRef, useEffect, useMemo } from 'react';
import { 
  CreditCard, 
  Award, 
  Palette, 
  Save, 
  UploadCloud, 
  CheckCircle2, 
  ShieldCheck, 
  Phone, 
  FileText,
  Loader2,
  RefreshCw,
  Eye,
  Sliders,
  Check,
  Globe,
  MapPin,
  Mail,
  Plus,
  Trash2,
  Layout,
  Sparkles,
  Clock,
  Layers
} from 'lucide-react';
import { IdCardTemplateConfig, SiteSettings, UserItem } from '../../types/news';
import { DigitalIdCard } from '../IdCard/DigitalIdCard';
import { saveFileToLocalStorage, getLocalFileUrl } from '../../utils/localRecruitmentStorage';
import { 
  DEFAULT_EDITOR_SIGNATURE_SVG, 
  DEFAULT_PUBLISHER_SIGNATURE_SVG,
  getDomainShortCode 
} from '../../utils/pressIdCardGenerator';

interface IdCardTemplateConfiguratorProps {
  settings: SiteSettings;
  onUpdateSettings: (newSettings: SiteSettings) => void;
  sampleUser?: UserItem;
  darkMode?: boolean;
}

export const IdCardTemplateConfigurator: React.FC<IdCardTemplateConfiguratorProps> = React.memo(({
  settings,
  onUpdateSettings,
  sampleUser,
  darkMode = false,
}) => {
  const currentTemplate: IdCardTemplateConfig = settings.idCardTemplate ? {
    ...settings.idCardTemplate,
    showSloganUnderLogo: settings.idCardTemplate.showSloganUnderLogo !== false,
    showFrontSlogan: settings.idCardTemplate.showFrontSlogan !== false,
    showBackSlogan: settings.idCardTemplate.showBackSlogan !== false,
  } : {
    themeColor: '#dc2626',
    secondaryColor: '#0f172a',
    selectedTemplateId: 'classic-press',
    organizationName: settings.siteName || 'নতুন দৃষ্টি',
    organizationNameEn: settings.siteNameEn || 'Notun Drishti',
    organizationSubTitle: 'খবর, ভিন্ন দৃষ্টিতে',
    showSloganUnderLogo: true,
    showFrontSlogan: true,
    showBackSlogan: true,
    cardPrefix: getDomainShortCode(settings.domain, settings.siteNameEn || 'ND'),
    validTill: '01 June 2027',
    pressBannerText: 'PRESS',
    idLabelText: 'ID NO.',
    phoneLabelText: 'Phone',
    backHeaderTitle: 'PRESS CARD',
    ownershipNotice: `This card is the property of ${settings.siteNameEn || 'Notun Drishti'}`,
    websiteLabel: 'Website',
    websiteUrl: settings.domain ? (settings.domain.startsWith('http') ? settings.domain : `www.${settings.domain}`) : 'www.notundrishti.com',
    phoneLabel: 'Phone',
    contactPhone: settings.contactPhone || '+8801715248243, +8801577581026',
    emailLabel: 'Email',
    contactEmail: settings.contactEmail || 'notundrishti247@gmail.com',
    addressLabel: 'Address',
    officeAddress: settings.officeAddress || '578, Shikkhakpalli, Gaital, Kishoreganj.',
    cooperationNotice: 'All concerned are requested to provide full cooperation to the holder of this press card in the performance of his/her professional duties.',
    validityPrefixText: 'Validity until:',
    showEditorSignature: true,
    showPublisherSignature: true,
    editorTitle: 'Editor',
    publisherTitle: 'Publisher',
    govtRegNumber: 'Govt Reg: PR-2026/8492',
    showGovtRegNumber: false,
    officialRegLine: 'Press Council Reg: BD-PC/2026-912',
    showOfficialRegLine: false,
  };

  // Active section tab for clean organization
  const [activeConfigTab, setActiveConfigTab] = useState<'general' | 'templates' | 'lines_front' | 'lines_back' | 'signatures' | 'custom_lines'>('general');

  // Form states
  const [selectedTemplateId, setSelectedTemplateId] = useState<IdCardTemplateConfig['selectedTemplateId']>(currentTemplate.selectedTemplateId || 'classic-press');
  const [organizationName, setOrganizationName] = useState(currentTemplate.organizationName || settings.siteName || 'নতুন দৃষ্টি');
  const [organizationNameEn, setOrganizationNameEn] = useState(currentTemplate.organizationNameEn || settings.siteNameEn || 'Notun Drishti');
  const [organizationSubTitle, setOrganizationSubTitle] = useState(currentTemplate.organizationSubTitle || 'খবর, ভিন্ন দৃষ্টিতে');
  const [showSloganUnderLogo, setShowSloganUnderLogo] = useState(currentTemplate.showSloganUnderLogo !== false);
  const [showFrontSlogan, setShowFrontSlogan] = useState(currentTemplate.showFrontSlogan !== false);
  const [showBackSlogan, setShowBackSlogan] = useState(currentTemplate.showBackSlogan !== false);
  const [cardPrefix, setCardPrefix] = useState(currentTemplate.cardPrefix || getDomainShortCode(settings.domain, 'ND'));
  const [validTill, setValidTill] = useState(currentTemplate.validTill || '01 June 2027');

  // Front lines
  const [pressBannerText, setPressBannerText] = useState(currentTemplate.pressBannerText || 'PRESS');
  const [idLabelText, setIdLabelText] = useState(currentTemplate.idLabelText || 'ID NO.');
  const [phoneLabelText, setPhoneLabelText] = useState(currentTemplate.phoneLabelText || 'Phone');
  const [govtRegNumber, setGovtRegNumber] = useState(currentTemplate.govtRegNumber || 'Govt Reg: PR-2026/8492');
  const [showGovtRegNumber, setShowGovtRegNumber] = useState(!!currentTemplate.showGovtRegNumber);

  // Back lines
  const [backHeaderTitle, setBackHeaderTitle] = useState(currentTemplate.backHeaderTitle || 'PRESS CARD');
  const [ownershipNotice, setOwnershipNotice] = useState(currentTemplate.ownershipNotice || `This card is the property of ${settings.siteNameEn || 'Notun Drishti'}`);
  const [websiteLabel, setWebsiteLabel] = useState(currentTemplate.websiteLabel || 'Website');
  const [websiteUrl, setWebsiteUrl] = useState(currentTemplate.websiteUrl || (settings.domain ? (settings.domain.startsWith('http') ? settings.domain : `www.${settings.domain}`) : 'www.notundrishti.com'));
  const [phoneLabel, setPhoneLabel] = useState(currentTemplate.phoneLabel || 'Phone');
  const [contactPhone, setContactPhone] = useState(currentTemplate.contactPhone || settings.contactPhone || '+8801715248243, +8801577581026');
  const [emailLabel, setEmailLabel] = useState(currentTemplate.emailLabel || 'Email');
  const [contactEmail, setContactEmail] = useState(currentTemplate.contactEmail || settings.contactEmail || 'notundrishti247@gmail.com');
  const [addressLabel, setAddressLabel] = useState(currentTemplate.addressLabel || 'Address');
  const [officeAddress, setOfficeAddress] = useState(currentTemplate.officeAddress || settings.officeAddress || '578, Shikkhakpalli, Gaital, Kishoreganj.');
  const [cooperationNotice, setCooperationNotice] = useState(currentTemplate.cooperationNotice || 'All concerned are requested to provide full cooperation to the holder of this press card in the performance of his/her professional duties.');
  const [validityPrefixText, setValidityPrefixText] = useState(currentTemplate.validityPrefixText || 'Validity until:');
  const [officialRegLine, setOfficialRegLine] = useState(currentTemplate.officialRegLine || 'Press Council Reg: BD-PC/2026-912');
  const [showOfficialRegLine, setShowOfficialRegLine] = useState(!!currentTemplate.showOfficialRegLine);

  // Signatures & Seals
  const [showEditorSignature, setShowEditorSignature] = useState(currentTemplate.showEditorSignature !== false);
  const [showPublisherSignature, setShowPublisherSignature] = useState(currentTemplate.showPublisherSignature !== false);
  const [editorTitle, setEditorTitle] = useState(currentTemplate.editorTitle || 'Editor');
  const [publisherTitle, setPublisherTitle] = useState(currentTemplate.publisherTitle || 'Publisher');
  const [editorSignatureUrl, setEditorSignatureUrl] = useState(currentTemplate.editorSignatureUrl || '');
  const [publisherSignatureUrl, setPublisherSignatureUrl] = useState(currentTemplate.publisherSignatureUrl || '');
  const [editorSealUrl, setEditorSealUrl] = useState(currentTemplate.editorSealUrl || '');
  const [publisherSealUrl, setPublisherSealUrl] = useState(currentTemplate.publisherSealUrl || '');

  // Custom Backgrounds
  const [customFrontBgUrl, setCustomFrontBgUrl] = useState(currentTemplate.customFrontBgUrl || '');
  const [customBackBgUrl, setCustomBackBgUrl] = useState(currentTemplate.customBackBgUrl || '');

  // Custom dynamic lines
  const [customLines, setCustomLines] = useState<{ id: string; label: string; value: string; page: 'front' | 'back' }[]>(
    currentTemplate.customLines || []
  );
  const [newCustomLabel, setNewCustomLabel] = useState('');
  const [newCustomValue, setNewCustomValue] = useState('');
  const [newCustomPage, setNewCustomPage] = useState<'front' | 'back'>('back');

  // Loading states
  const [isUploadingEditorSig, setIsUploadingEditorSig] = useState(false);
  const [isUploadingPublisherSig, setIsUploadingPublisherSig] = useState(false);
  const [isUploadingEditorSeal, setIsUploadingEditorSeal] = useState(false);
  const [isUploadingPublisherSeal, setIsUploadingPublisherSeal] = useState(false);
  const [isUploadingFrontBg, setIsUploadingFrontBg] = useState(false);
  const [isUploadingBackBg, setIsUploadingBackBg] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  const editorSigRef = useRef<HTMLInputElement>(null);
  const publisherSigRef = useRef<HTMLInputElement>(null);
  const editorSealRef = useRef<HTMLInputElement>(null);
  const publisherSealRef = useRef<HTMLInputElement>(null);
  const frontBgRef = useRef<HTMLInputElement>(null);
  const backBgRef = useRef<HTMLInputElement>(null);

  // Debounced liveTemplate for fluid preview without render bottlenecks (Requirement 1)
  const [debouncedTemplate, setDebouncedTemplate] = useState<IdCardTemplateConfig>(currentTemplate);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedTemplate({
        themeColor: '#dc2626',
        secondaryColor: '#0f172a',
        selectedTemplateId,
        organizationName,
        organizationNameEn,
        organizationSubTitle,
        showSloganUnderLogo,
        showFrontSlogan,
        showBackSlogan,
        cardPrefix,
        validTill,
        pressBannerText,
        idLabelText,
        phoneLabelText,
        govtRegNumber,
        showGovtRegNumber,
        backHeaderTitle,
        ownershipNotice,
        websiteLabel,
        websiteUrl,
        phoneLabel,
        contactPhone,
        emailLabel,
        contactEmail,
        addressLabel,
        officeAddress,
        cooperationNotice,
        validityPrefixText,
        officialRegLine,
        showOfficialRegLine,
        showEditorSignature,
        showPublisherSignature,
        editorTitle,
        publisherTitle,
        editorSignatureUrl,
        publisherSignatureUrl,
        editorSealUrl,
        publisherSealUrl,
        customFrontBgUrl,
        customBackBgUrl,
        customLines,
      });
    }, 200);

    return () => clearTimeout(handler);
  }, [
    selectedTemplateId, organizationName, organizationNameEn, organizationSubTitle,
    showSloganUnderLogo, showFrontSlogan, showBackSlogan,
    cardPrefix, validTill, pressBannerText, idLabelText, phoneLabelText,
    govtRegNumber, showGovtRegNumber, backHeaderTitle, ownershipNotice,
    websiteLabel, websiteUrl, phoneLabel, contactPhone, emailLabel, contactEmail,
    addressLabel, officeAddress, cooperationNotice, validityPrefixText,
    officialRegLine, showOfficialRegLine, showEditorSignature, showPublisherSignature,
    editorTitle, publisherTitle, editorSignatureUrl, publisherSignatureUrl,
    editorSealUrl, publisherSealUrl, customFrontBgUrl, customBackBgUrl, customLines
  ]);

  // Memoized demo user to prevent unnecessary child re-renders
  const demoUser: UserItem = useMemo(() => {
    return sampleUser || {
      id: '19831118',
      name: 'Khalakujjaman',
      nameEn: 'Khalakujjaman',
      email: 'khalakujjaman@example.com',
      role: 'reporter',
      roleBn: 'স্টাফ করেসপন্ডেন্ট',
      designation: 'Staff Correspondent',
      designationEn: 'Staff Correspondent',
      district: 'ঢাকা (কেন্দ্রীয় বার্তা বিভাগ)',
      bloodGroup: 'B+',
      phone: '+880162060893',
      idCardNumber: `${cardPrefix || 'ND'}20268492`,
      idCardIssuedAt: '01 June 2026',
      idCardValidTill: validTill || '01 June 2027',
      postsCount: 142,
      status: 'active',
      autoApprove: true,
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
    };
  }, [sampleUser, cardPrefix, validTill]);

  // Upload Handlers with compression
  const handleEditorSigUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploadingEditorSig(true);
    try {
      const res = await saveFileToLocalStorage(file, 'idcard_front');
      if (res.dataUrl) setEditorSignatureUrl(res.dataUrl);
    } catch (err) {
      console.error(err);
    } finally {
      setIsUploadingEditorSig(false);
    }
  };

  const handlePublisherSigUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploadingPublisherSig(true);
    try {
      const res = await saveFileToLocalStorage(file, 'idcard_back');
      if (res.dataUrl) setPublisherSignatureUrl(res.dataUrl);
    } catch (err) {
      console.error(err);
    } finally {
      setIsUploadingPublisherSig(false);
    }
  };

  const handleEditorSealUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploadingEditorSeal(true);
    try {
      const res = await saveFileToLocalStorage(file, 'idcard_front');
      if (res.dataUrl) setEditorSealUrl(res.dataUrl);
    } catch (err) {
      console.error(err);
    } finally {
      setIsUploadingEditorSeal(false);
    }
  };

  const handlePublisherSealUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploadingPublisherSeal(true);
    try {
      const res = await saveFileToLocalStorage(file, 'idcard_back');
      if (res.dataUrl) setPublisherSealUrl(res.dataUrl);
    } catch (err) {
      console.error(err);
    } finally {
      setIsUploadingPublisherSeal(false);
    }
  };

  const handleFrontBgUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploadingFrontBg(true);
    try {
      const res = await saveFileToLocalStorage(file, 'idcard_front');
      if (res.dataUrl) setCustomFrontBgUrl(res.dataUrl);
    } catch (err) {
      console.error(err);
    } finally {
      setIsUploadingFrontBg(false);
    }
  };

  const handleBackBgUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploadingBackBg(true);
    try {
      const res = await saveFileToLocalStorage(file, 'idcard_back');
      if (res.dataUrl) setCustomBackBgUrl(res.dataUrl);
    } catch (err) {
      console.error(err);
    } finally {
      setIsUploadingBackBg(false);
    }
  };

  const handleAddCustomLine = () => {
    if (!newCustomLabel.trim() || !newCustomValue.trim()) return;
    const newLine = {
      id: `line-${Date.now()}`,
      label: newCustomLabel.trim(),
      value: newCustomValue.trim(),
      page: newCustomPage,
    };
    setCustomLines([...customLines, newLine]);
    setNewCustomLabel('');
    setNewCustomValue('');
  };

  const handleRemoveCustomLine = (id: string) => {
    setCustomLines(customLines.filter(l => l.id !== id));
  };

  const handleSaveTemplate = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: SiteSettings = {
      ...settings,
      idCardTemplate: debouncedTemplate,
    };
    onUpdateSettings(updated);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  return (
    <div className="space-y-6 font-solaiman">
      {/* Header Bar */}
      <div className={`p-5 rounded-2xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
        darkMode ? 'bg-[#1b222c] border-slate-800' : 'bg-white border-slate-200'
      }`}>
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-red-600 text-white shadow-xs">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <span>প্রেস আইডি কার্ড পূর্ণাঙ্গ কন্ট্রোল প্যানেল (ID Card CMS)</span>
              <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-red-100 dark:bg-red-950/60 text-red-600 dark:text-red-300 font-mono font-bold">
                PRO-CARD v3.0
              </span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              হরাইজন্টাল প্রিভিউ, লাইন-বাই-লাইন টেক্সট এডিটর, একাধিক ডিজাইন টেমপ্লেট ও ব্যক্তিভিত্তিক মেয়াদ নিয়ন্ত্রণ।
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {isSaved && (
            <div className="px-3.5 py-1.5 rounded-lg bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 text-xs font-bold flex items-center gap-1.5 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4" />
              <span>টেমপ্লেট সফলভাবে সংরক্ষিত!</span>
            </div>
          )}
          <button
            onClick={handleSaveTemplate}
            className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs cursor-pointer transition-colors"
          >
            <Save className="w-4 h-4" />
            <span>সংরক্ষণ করুন</span>
          </button>
        </div>
      </div>

      {/* Main Container: Full-Width Horizontal Live Preview at Top */}
      <div className={`p-5 rounded-2xl border space-y-3 ${
        darkMode ? 'bg-[#1b222c] border-slate-800' : 'bg-white border-slate-200'
      }`}>
        <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <Eye className="w-4 h-4 text-blue-600" />
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-200 font-mono">
              লাইভ হরাইজন্টাল প্রিভিউ (Side-by-Side Dual-Card Preview)
            </h4>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-500 font-bold">বর্তমান টেমপ্লেট:</span>
            <span className="px-2.5 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 font-bold border border-blue-200 dark:border-blue-900 font-mono text-[11px]">
              {selectedTemplateId === 'classic-press' ? 'Classic Broadsheet' : selectedTemplateId === 'modern-executive' ? 'Modern Executive' : selectedTemplateId === 'national-press' ? 'National Press' : 'Custom Uploaded'}
            </span>
          </div>
        </div>

        {/* Live ID Card Component (Rendered strictly side-by-side horizontally) */}
        <div className="w-full overflow-x-auto py-2">
          <DigitalIdCard
            user={demoUser}
            template={debouncedTemplate}
            darkMode={darkMode}
            showControls={true}
          />
        </div>
      </div>

      {/* CMS Navigation Tabs for Line-by-Line & Template Controls */}
      <div className="flex flex-wrap gap-2 border-b border-slate-200 dark:border-slate-800 pb-2 text-xs font-bold">
        {[
          { id: 'general', label: 'পরিচিতি ও ডোমেইন প্রিফিক্স', icon: CreditCard },
          { id: 'templates', label: 'ডিজাইন টেমপ্লেট নির্বাচন', icon: Layout },
          { id: 'lines_front', label: 'সামনের পাতার লাইন এডিটর', icon: FileText },
          { id: 'lines_back', label: 'পেছনের পাতার লাইন ও নোটিশ', icon: FileText },
          { id: 'signatures', label: 'স্বাক্ষর ও অফিশিয়াল সীল', icon: Award },
          { id: 'custom_lines', label: 'কাস্টম অতিরিক্ত লাইন যোগ', icon: Plus },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeConfigTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveConfigTab(tab.id as any)}
              className={`px-3.5 py-2 rounded-xl flex items-center gap-1.5 transition-all cursor-pointer ${
                isActive
                  ? 'bg-red-600 text-white shadow-xs'
                  : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:bg-slate-50'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB CONTENT 1: General & Domain Prefix */}
      {activeConfigTab === 'general' && (
        <div className={`p-5 rounded-2xl border space-y-4 ${
          darkMode ? 'bg-[#1b222c] border-slate-800' : 'bg-white border-slate-200'
        }`}>
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 font-mono flex items-center gap-1.5">
            <CreditCard className="w-4 h-4 text-red-600" />
            <span>কার্ড পরিচিতি ও ডোমেইনভিত্তিক নম্বর বিন্যাস (Requirement 3)</span>
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                ডোমেইনভিত্তিক প্রিফিক্স (Prefix)
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={cardPrefix || ''}
                  onChange={(e) => setCardPrefix(e.target.value.toUpperCase())}
                  placeholder="ND"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-transparent font-mono font-bold"
                />
                <button
                  type="button"
                  onClick={() => setCardPrefix(getDomainShortCode(settings.domain, settings.siteNameEn))}
                  className="px-2.5 py-2 bg-slate-100 dark:bg-slate-800 rounded-lg hover:bg-slate-200 text-slate-700 dark:text-slate-200 font-bold shrink-0 text-[11px]"
                  title="ডোমেইন থেকে অটো শর্টকোড জেনারেট"
                >
                  অটো ডোমেইন
                </button>
              </div>
              <span className="text-[10px] text-slate-400 mt-1 block font-mono">
                উদা: {cardPrefix || 'ND'}20268492
              </span>
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                প্রতিষ্ঠানের নাম (বাংলা)
              </label>
              <input
                type="text"
                value={organizationName || ''}
                onChange={(e) => setOrganizationName(e.target.value)}
                placeholder="নতুন দৃষ্টি"
                className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-transparent font-bold"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                প্রতিষ্ঠানের নাম (English - পেছনের প্রোপার্টি নোটিশের জন্য)
              </label>
              <input
                type="text"
                value={organizationNameEn || ''}
                onChange={(e) => setOrganizationNameEn(e.target.value)}
                placeholder="Notun Drishti"
                className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-transparent font-sans font-bold"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                ট্যাগলাইন / উপ-শিরোনাম (Sub-title)
              </label>
              <input
                type="text"
                value={organizationSubTitle || ''}
                onChange={(e) => setOrganizationSubTitle(e.target.value)}
                placeholder="খবর, ভিন্ন দৃষ্টিতে"
                className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-transparent"
              />
            </div>

            {/* Slogan Visibility Toggle (Requirement 1: লোগোর নিচে স্লোগান প্রদর্শন করুন) */}
            <div className="sm:col-span-2 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/60 space-y-2.5">
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer font-bold text-xs sm:text-sm text-slate-900 dark:text-white">
                  <input
                    type="checkbox"
                    checked={showSloganUnderLogo}
                    onChange={(e) => {
                      const val = e.target.checked;
                      setShowSloganUnderLogo(val);
                      setShowFrontSlogan(val);
                      setShowBackSlogan(val);
                    }}
                    className="rounded border-slate-300 text-red-600 focus:ring-red-500 w-4 h-4 cursor-pointer"
                  />
                  <span>লোগোর নিচে স্লোগান প্রদর্শন করুন (Show Slogan Under Logo)</span>
                </label>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  showSloganUnderLogo 
                    ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400' 
                    : 'bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-400'
                }`}>
                  {showSloganUnderLogo ? 'স্লোগান দৃশ্যমান' : 'স্লোগান বন্ধ'}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                আপলোড করা লোগোতে ইতিমধ্যে স্লোগান অন্তর্ভুক্ত থাকলে এই অপশনটি আনচেক করুন। আনচেক করলে ফ্রন্ট ও ব্যাক উভয় পেইজে লোগোর নিচের স্লোগান টেক্সট সম্পূর্ণ বিলুপ্ত হবে।
              </p>

              {showSloganUnderLogo && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-200 dark:border-slate-700/60">
                  <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={showFrontSlogan}
                      onChange={(e) => setShowFrontSlogan(e.target.checked)}
                      className="rounded border-slate-300 text-red-600 focus:ring-red-500 w-3.5 h-3.5"
                    />
                    <span>সামনের পেজে (Front Side) স্লোগান দেখান</span>
                  </label>
                  <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={showBackSlogan}
                      onChange={(e) => setShowBackSlogan(e.target.checked)}
                      className="rounded border-slate-300 text-red-600 focus:ring-red-500 w-3.5 h-3.5"
                    />
                    <span>পেছনের পেজে (Back Side) স্লোগান দেখান</span>
                  </label>
                </div>
              )}
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                ডিফল্ট মেয়াদের সময়কাল (Default Validity Notice)
              </label>
              <input
                type="text"
                value={validTill || ''}
                onChange={(e) => setValidTill(e.target.value)}
                placeholder="01 June 2027"
                className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-transparent font-mono"
              />
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT 2: Multiple Design Templates (Requirement 5) */}
      {activeConfigTab === 'templates' && (
        <div className={`p-5 rounded-2xl border space-y-4 ${
          darkMode ? 'bg-[#1b222c] border-slate-800' : 'bg-white border-slate-200'
        }`}>
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 font-mono flex items-center gap-1.5">
            <Layout className="w-4 h-4 text-red-600" />
            <span>প্রেস আইডি কার্ড ডিজাইন টেমপ্লেট নির্বাচন (Multiple Design Templates)</span>
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Template 1: Classic Broadsheet Press - Gold Standard */}
            <div 
              onClick={() => setSelectedTemplateId('classic-press')}
              className={`p-4 rounded-xl border-2 transition-all cursor-pointer relative space-y-2.5 ${
                selectedTemplateId === 'classic-press' || !selectedTemplateId
                  ? 'border-red-600 bg-red-50/30 dark:bg-red-950/40 shadow-md ring-2 ring-red-500/20'
                  : 'border-slate-200 dark:border-slate-800 hover:border-slate-400 bg-white dark:bg-slate-900'
              }`}
            >
              {(selectedTemplateId === 'classic-press' || !selectedTemplateId) && (
                <div className="absolute top-3 right-3 p-1 bg-red-600 text-white rounded-full shadow-xs">
                  <Check className="w-3.5 h-3.5" />
                </div>
              )}
              <div className="h-24 bg-gradient-to-r from-sky-600 via-blue-700 to-indigo-800 rounded-lg flex flex-col items-center justify-center text-white p-3 text-center shadow-inner">
                <span className="font-bold text-xs uppercase tracking-wider font-mono">গোল্ড স্ট্যান্ডার্ড রেফারেন্স ডিজাইন</span>
                <span className="text-[10px] text-sky-200 mt-0.5">Classic Broadsheet Press • সাইড-বাই-সাইড</span>
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h5 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white">১. গোল্ড স্ট্যান্ডার্ড ব্রডশিট প্রেস কার্ড (ডিফল্ট)</h5>
                  <span className="text-[10px] bg-red-100 dark:bg-red-950/60 text-red-600 dark:text-red-400 font-bold px-2 py-0.5 rounded-full">রেফারেন্স</span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed mt-1">
                  নীল জ্যামিতিক কর্নার ফেসেট, বৃত্তাকার হাই-রেজ্যুলেশন স্টাফ ফটো, সায়ান ডিভাইডার লাইন, সুবিন্যস্ত ইংলিশ নম্বর, কিউআর কোড ভেরিফিকেশন ও নিচের পূর্ণাঙ্গ লাল প্রেস ব্যানার।
                </p>
              </div>
            </div>

            {/* Template 2: Custom Uploaded */}
            <div 
              onClick={() => setSelectedTemplateId('custom-uploaded')}
              className={`p-4 rounded-xl border-2 transition-all cursor-pointer relative space-y-2.5 ${
                selectedTemplateId === 'custom-uploaded'
                  ? 'border-red-600 bg-red-50/30 dark:bg-red-950/40 shadow-md ring-2 ring-red-500/20'
                  : 'border-slate-200 dark:border-slate-800 hover:border-slate-400 bg-white dark:bg-slate-900'
              }`}
            >
              {selectedTemplateId === 'custom-uploaded' && (
                <div className="absolute top-3 right-3 p-1 bg-red-600 text-white rounded-full shadow-xs">
                  <Check className="w-3.5 h-3.5" />
                </div>
              )}
              <div className="h-24 bg-gradient-to-r from-amber-600 via-orange-600 to-rose-700 rounded-lg flex flex-col items-center justify-center text-white p-3 text-center shadow-inner">
                <span className="font-bold text-xs uppercase tracking-wider font-mono">কাস্টম গ্রাফিক্স আর্টওয়ার্ক</span>
                <span className="text-[10px] text-amber-200 mt-0.5">Custom Uploaded Artwork</span>
              </div>
              <div>
                <h5 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white">২. কাস্টম আপলোডকৃত ব্যাকগ্রাউন্ড</h5>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed mt-1">
                  অ্যাডমিন সরাসরি ফটোশপ বা ইলাস্ট্রেটরে প্রস্তুতকৃত নিজস্ব প্রতিষ্ঠানের ফ্রন্ট ও ব্যাক কার্ড ব্যাকগ্রাউন্ড আপলোড করতে পারবেন।
                </p>
              </div>
            </div>
          </div>

          {/* Custom Uploaded Backgrounds (if selected) */}
          {selectedTemplateId === 'custom-uploaded' && (
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="space-y-2">
                <span className="font-bold block text-slate-700 dark:text-slate-300">
                  কাস্টম ফ্রন্ট ব্যাকগ্রাউন্ড আর্টওয়ার্ক:
                </span>
                <input
                  type="file"
                  ref={frontBgRef}
                  accept="image/*"
                  onChange={handleFrontBgUpload}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => frontBgRef.current?.click()}
                  className="w-full py-3 px-4 rounded-lg border border-dashed border-slate-300 dark:border-slate-700 hover:border-red-500 flex items-center justify-center gap-2 cursor-pointer bg-white dark:bg-slate-950"
                >
                  <UploadCloud className="w-4 h-4 text-red-600" />
                  <span>{isUploadingFrontBg ? 'আপলোড হচ্ছে...' : customFrontBgUrl ? 'ফ্রন্ট ব্যাকগ্রাউন্ড পরিবর্তন' : 'ফ্রন্ট ইমেজ আপলোড'}</span>
                </button>
              </div>

              <div className="space-y-2">
                <span className="font-bold block text-slate-700 dark:text-slate-300">
                  কাস্টম ব্যাক ব্যাকগ্রাউন্ড আর্টওয়ার্ক:
                </span>
                <input
                  type="file"
                  ref={backBgRef}
                  accept="image/*"
                  onChange={handleBackBgUpload}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => backBgRef.current?.click()}
                  className="w-full py-3 px-4 rounded-lg border border-dashed border-slate-300 dark:border-slate-700 hover:border-red-500 flex items-center justify-center gap-2 cursor-pointer bg-white dark:bg-slate-950"
                >
                  <UploadCloud className="w-4 h-4 text-red-600" />
                  <span>{isUploadingBackBg ? 'আপলোড হচ্ছে...' : customBackBgUrl ? 'ব্যাক ব্যাকগ্রাউন্ড পরিবর্তন' : 'ব্যাক ইমেজ আপলোড'}</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB CONTENT 3: Front Page Lines (Requirement 4) */}
      {activeConfigTab === 'lines_front' && (
        <div className={`p-5 rounded-2xl border space-y-4 ${
          darkMode ? 'bg-[#1b222c] border-slate-800' : 'bg-white border-slate-200'
        }`}>
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 font-mono flex items-center gap-1.5">
            <FileText className="w-4 h-4 text-red-600" />
            <span>সামনের পাতার লাইন-বাই-লাইন টেক্সট এডিটর (Front Page Line Editor)</span>
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                নিচের লাল ব্যানারের শিরোনাম (Red Banner Title)
              </label>
              <input
                type="text"
                value={pressBannerText || ''}
                onChange={(e) => setPressBannerText(e.target.value.toUpperCase())}
                placeholder="PRESS"
                className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-transparent font-mono font-bold"
              />
              <span className="text-[10px] text-slate-400 mt-1 block">উদা: PRESS, MEDIA, JOURNALIST</span>
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                আইডি নম্বর লেবেল (ID Field Label)
              </label>
              <input
                type="text"
                value={idLabelText || ''}
                onChange={(e) => setIdLabelText(e.target.value)}
                placeholder="ID NO."
                className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-transparent font-mono"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                ফোন নম্বর লেবেল (Phone Field Label)
              </label>
              <input
                type="text"
                value={phoneLabelText || ''}
                onChange={(e) => setPhoneLabelText(e.target.value)}
                placeholder="Phone"
                className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-transparent font-mono"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block font-bold text-slate-700 dark:text-slate-300">
                  সরকারি নিবন্ধন নম্বর লাইন (Govt Reg No)
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={showGovtRegNumber}
                    onChange={(e) => setShowGovtRegNumber(e.target.checked)}
                    className="rounded text-red-600"
                  />
                  <span className="text-[10px] font-bold text-slate-500">প্রদর্শন করুন</span>
                </label>
              </div>
              <input
                type="text"
                value={govtRegNumber || ''}
                onChange={(e) => setGovtRegNumber(e.target.value)}
                placeholder="Govt Reg: PR-2026/8492"
                className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-transparent font-mono"
              />
            </div>

            {/* Front Slogan Visibility Toggle */}
            <div className="sm:col-span-2 p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/60 flex items-center justify-between">
              <div>
                <span className="font-bold text-slate-800 dark:text-slate-200 block text-xs">
                  ফ্রন্ট পেজে লোগোর নিচে স্লোগান প্রদর্শন
                </span>
                <span className="text-[11px] text-slate-500">
                  সামনের অংশে প্রতিষ্ঠানের লোগোর নিচে ট্যাগলাইন/স্লোগান টেক্সট দেখান বা লুকান
                </span>
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showFrontSlogan}
                  onChange={(e) => setShowFrontSlogan(e.target.checked)}
                  className="rounded border-slate-300 text-red-600 focus:ring-red-500 w-4 h-4 cursor-pointer"
                />
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  {showFrontSlogan ? 'চালু' : 'লুকানো'}
                </span>
              </label>
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT 4: Back Page Lines & Notices (Requirement 4) */}
      {activeConfigTab === 'lines_back' && (
        <div className={`p-5 rounded-2xl border space-y-4 ${
          darkMode ? 'bg-[#1b222c] border-slate-800' : 'bg-white border-slate-200'
        }`}>
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 font-mono flex items-center gap-1.5">
            <FileText className="w-4 h-4 text-red-600" />
            <span>পেছনের পাতার লাইন-বাই-লাইন টেক্সট ও নোটিশ (Back Page Line Editor)</span>
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                পেছনের প্রধান হেডার (Back Card Header)
              </label>
              <input
                type="text"
                value={backHeaderTitle || ''}
                onChange={(e) => setBackHeaderTitle(e.target.value.toUpperCase())}
                placeholder="PRESS CARD"
                className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-transparent font-sans font-black"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                মালিকানা বিজ্ঞপ্তি (Ownership Notice)
              </label>
              <input
                type="text"
                value={ownershipNotice || ''}
                onChange={(e) => setOwnershipNotice(e.target.value)}
                placeholder="This card is the property of Notun Drishti"
                className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-transparent font-sans"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                পেশাগত সহযোগিতা অনুরোধ বিজ্ঞপ্তি (Professional Cooperation Notice)
              </label>
              <textarea
                value={cooperationNotice || ''}
                onChange={(e) => setCooperationNotice(e.target.value)}
                rows={2}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-transparent font-sans text-xs"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                মেয়াদের প্রিফিক্স লেবেল (Validity Prefix)
              </label>
              <input
                type="text"
                value={validityPrefixText || ''}
                onChange={(e) => setValidityPrefixText(e.target.value)}
                placeholder="Validity until:"
                className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-transparent font-sans font-bold"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block font-bold text-slate-700 dark:text-slate-300">
                  অফিশিয়াল অ্যাক্রিডিটেশন / প্রেস কাউন্সিল লাইন
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={showOfficialRegLine}
                    onChange={(e) => setShowOfficialRegLine(e.target.checked)}
                    className="rounded text-red-600"
                  />
                  <span className="text-[10px] font-bold text-slate-500">প্রদর্শন করুন</span>
                </label>
              </div>
              <input
                type="text"
                value={officialRegLine || ''}
                onChange={(e) => setOfficialRegLine(e.target.value)}
                placeholder="Press Council Reg: BD-PC/2026-912"
                className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-transparent font-sans text-xs"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                ওয়েবসাইট ঠিকানা (Website URL)
              </label>
              <input
                type="text"
                value={websiteUrl || ''}
                onChange={(e) => setWebsiteUrl(e.target.value)}
                placeholder="www.notundrishti.com"
                className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-transparent font-mono"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                হটলাইন ফোন নম্বর (Phone Numbers)
              </label>
              <input
                type="text"
                value={contactPhone || ''}
                onChange={(e) => setContactPhone(e.target.value)}
                placeholder="+8801715248243, +8801577581026"
                className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-transparent font-mono text-xs"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                ইমেইল ঠিকানা (Email)
              </label>
              <input
                type="text"
                value={contactEmail || ''}
                onChange={(e) => setContactEmail(e.target.value)}
                placeholder="notundrishti247@gmail.com"
                className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-transparent font-mono text-xs"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                অফিসের ঠিকানা (Address)
              </label>
              <input
                type="text"
                value={officeAddress || ''}
                onChange={(e) => setOfficeAddress(e.target.value)}
                placeholder="578, Shikkhakpalli, Gaital, Kishoreganj."
                className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-transparent text-xs"
              />
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT 5: Signatures & Seals */}
      {activeConfigTab === 'signatures' && (
        <div className={`p-5 rounded-2xl border space-y-4 ${
          darkMode ? 'bg-[#1b222c] border-slate-800' : 'bg-white border-slate-200'
        }`}>
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 font-mono flex items-center gap-1.5">
            <Award className="w-4 h-4 text-red-600" />
            <span>স্বাক্ষর ও অফিশিয়াল সীল আপলোড (Signatures & Official Seals)</span>
          </h4>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
            {/* Editor Block */}
            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 space-y-3 bg-slate-50/50 dark:bg-slate-900/50">
              <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
                <span className="font-bold text-slate-900 dark:text-white">সম্পাদক কর্তৃপক্ষ (Editor Authority)</span>
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={showEditorSignature}
                    onChange={(e) => setShowEditorSignature(e.target.checked)}
                    className="rounded text-red-600"
                  />
                  <span className="font-bold text-[11px] text-slate-600 dark:text-slate-300">কার্ডে প্রদর্শন</span>
                </label>
              </div>

              <div>
                <label className="block font-bold mb-1">সম্পাদকের পদবি (Title):</label>
                <input
                  type="text"
                  value={editorTitle}
                  onChange={(e) => setEditorTitle(e.target.value)}
                  placeholder="Editor"
                  className="w-full px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-sans"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="text-[11px] font-semibold text-slate-500 block mb-1">স্বাক্ষর (Signature):</span>
                  <input
                    type="file"
                    ref={editorSigRef}
                    accept="image/*"
                    onChange={handleEditorSigUpload}
                    className="hidden"
                  />
                  <div className="h-16 rounded border border-dashed border-slate-300 dark:border-slate-700 flex items-center justify-center p-1 bg-white dark:bg-slate-900 relative group">
                    <img
                      src={editorSignatureUrl || DEFAULT_EDITOR_SIGNATURE_SVG}
                      alt="Editor Sig"
                      className="max-h-12 max-w-full object-contain"
                    />
                    <button
                      type="button"
                      onClick={() => editorSigRef.current?.click()}
                      className="absolute inset-0 bg-black/60 text-white flex items-center justify-center text-[10px] font-bold opacity-0 group-hover:opacity-100 rounded transition-opacity cursor-pointer"
                    >
                      {isUploadingEditorSig ? 'আপলোড হচ্ছে...' : 'আপলোড'}
                    </button>
                  </div>
                </div>

                <div>
                  <span className="text-[11px] font-semibold text-slate-500 block mb-1">অফিশিয়াল সীল (Seal):</span>
                  <input
                    type="file"
                    ref={editorSealRef}
                    accept="image/*"
                    onChange={handleEditorSealUpload}
                    className="hidden"
                  />
                  <div className="h-16 rounded border border-dashed border-slate-300 dark:border-slate-700 flex items-center justify-center p-1 bg-white dark:bg-slate-900 relative group">
                    {editorSealUrl ? (
                      <img
                        src={editorSealUrl}
                        alt="Editor Seal"
                        className="max-h-12 max-w-full object-contain"
                      />
                    ) : (
                      <span className="text-[10px] text-slate-400">ঐচ্ছিক সীল</span>
                    )}
                    <button
                      type="button"
                      onClick={() => editorSealRef.current?.click()}
                      className="absolute inset-0 bg-black/60 text-white flex items-center justify-center text-[10px] font-bold opacity-0 group-hover:opacity-100 rounded transition-opacity cursor-pointer"
                    >
                      {isUploadingEditorSeal ? 'আপলোড হচ্ছে...' : 'আপলোড'}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Publisher Block */}
            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 space-y-3 bg-slate-50/50 dark:bg-slate-900/50">
              <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
                <span className="font-bold text-slate-900 dark:text-white">প্রকাশক কর্তৃপক্ষ (Publisher Authority)</span>
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={showPublisherSignature}
                    onChange={(e) => setShowPublisherSignature(e.target.checked)}
                    className="rounded text-red-600"
                  />
                  <span className="font-bold text-[11px] text-slate-600 dark:text-slate-300">কার্ডে প্রদর্শন</span>
                </label>
              </div>

              <div>
                <label className="block font-bold mb-1">প্রকাশকের পদবি (Title):</label>
                <input
                  type="text"
                  value={publisherTitle}
                  onChange={(e) => setPublisherTitle(e.target.value)}
                  placeholder="Publisher"
                  className="w-full px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-sans"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="text-[11px] font-semibold text-slate-500 block mb-1">স্বাক্ষর (Signature):</span>
                  <input
                    type="file"
                    ref={publisherSigRef}
                    accept="image/*"
                    onChange={handlePublisherSigUpload}
                    className="hidden"
                  />
                  <div className="h-16 rounded border border-dashed border-slate-300 dark:border-slate-700 flex items-center justify-center p-1 bg-white dark:bg-slate-900 relative group">
                    <img
                      src={publisherSignatureUrl || DEFAULT_PUBLISHER_SIGNATURE_SVG}
                      alt="Publisher Sig"
                      className="max-h-12 max-w-full object-contain"
                    />
                    <button
                      type="button"
                      onClick={() => publisherSigRef.current?.click()}
                      className="absolute inset-0 bg-black/60 text-white flex items-center justify-center text-[10px] font-bold opacity-0 group-hover:opacity-100 rounded transition-opacity cursor-pointer"
                    >
                      {isUploadingPublisherSig ? 'আপলোড হচ্ছে...' : 'আপলোড'}
                    </button>
                  </div>
                </div>

                <div>
                  <span className="text-[11px] font-semibold text-slate-500 block mb-1">অফিশিয়াল সীল (Seal):</span>
                  <input
                    type="file"
                    ref={publisherSealRef}
                    accept="image/*"
                    onChange={handlePublisherSealUpload}
                    className="hidden"
                  />
                  <div className="h-16 rounded border border-dashed border-slate-300 dark:border-slate-700 flex items-center justify-center p-1 bg-white dark:bg-slate-900 relative group">
                    {publisherSealUrl ? (
                      <img
                        src={publisherSealUrl}
                        alt="Publisher Seal"
                        className="max-h-12 max-w-full object-contain"
                      />
                    ) : (
                      <span className="text-[10px] text-slate-400">ঐচ্ছিক সীল</span>
                    )}
                    <button
                      type="button"
                      onClick={() => publisherSealRef.current?.click()}
                      className="absolute inset-0 bg-black/60 text-white flex items-center justify-center text-[10px] font-bold opacity-0 group-hover:opacity-100 rounded transition-opacity cursor-pointer"
                    >
                      {isUploadingPublisherSeal ? 'আপলোড হচ্ছে...' : 'আপলোড'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT 6: Custom Additional Notice Lines (Requirement 4) */}
      {activeConfigTab === 'custom_lines' && (
        <div className={`p-5 rounded-2xl border space-y-4 ${
          darkMode ? 'bg-[#1b222c] border-slate-800' : 'bg-white border-slate-200'
        }`}>
          <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 font-mono flex items-center gap-1.5">
                <Plus className="w-4 h-4 text-red-600" />
                <span>কাস্টম অতিরিক্ত লাইন যুক্ত করুন (Dynamic Custom Notice & Registration Lines)</span>
              </h4>
              <p className="text-[11px] text-slate-400 mt-0.5">
                ভবিষ্যতে কার্ডে সরকারি অনুমোদন, ট্রাস্ট নম্বর বা বিশেষ শর্তাবলি যোগ করতে এই ফিচার ব্যবহার করুন।
              </p>
            </div>
          </div>

          {/* Existing Custom Lines List */}
          <div className="space-y-2">
            {customLines.length === 0 ? (
              <div className="p-4 rounded-xl border border-dashed text-center text-slate-400 text-xs">
                এখনও কোনো কাস্টম লাইন যোগ করা হয়নি। নিচে নতুন লাইন যোগ করতে পারেন।
              </div>
            ) : (
              customLines.map((line) => (
                <div 
                  key={line.id} 
                  className="flex items-center justify-between gap-3 p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-xs"
                >
                  <div className="flex items-center gap-3">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase font-mono ${
                      line.page === 'front' ? 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300' : 'bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300'
                    }`}>
                      {line.page === 'front' ? 'Front Side' : 'Back Side'}
                    </span>
                    <span className="font-bold text-slate-900 dark:text-white">{line.label}:</span>
                    <span className="text-slate-600 dark:text-slate-300">{line.value}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveCustomLine(line.id)}
                    className="p-1.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-lg cursor-pointer"
                    title="লাইন মুছে ফেলুন"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))
            )}
          </div>

          {/* Add New Line Form */}
          <div className="p-4 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 space-y-3">
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
              নতুন লাইন সংযোজন:
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 text-xs">
              <div className="sm:col-span-3">
                <select
                  value={newCustomPage}
                  onChange={(e) => setNewCustomPage(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-transparent font-bold cursor-pointer"
                >
                  <option value="back">Back Side (পেছনের অংশ)</option>
                  <option value="front">Front Side (সামনের অংশ)</option>
                </select>
              </div>

              <div className="sm:col-span-4">
                <input
                  type="text"
                  value={newCustomLabel}
                  onChange={(e) => setNewCustomLabel(e.target.value)}
                  placeholder="লেবেল (উদা: Blood Group, Reg No)"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-transparent"
                />
              </div>

              <div className="sm:col-span-4">
                <input
                  type="text"
                  value={newCustomValue}
                  onChange={(e) => setNewCustomValue(e.target.value)}
                  placeholder="মান (উদা: B+, PR-2026/8492)"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-transparent"
                />
              </div>

              <div className="sm:col-span-1 flex items-center">
                <button
                  type="button"
                  onClick={handleAddCustomLine}
                  className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg flex items-center justify-center cursor-pointer shadow-xs"
                  title="যুক্ত করুন"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Save Floating Bar */}
      <div className="flex justify-end pt-2">
        <button
          onClick={handleSaveTemplate}
          className="px-6 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs flex items-center gap-2 shadow-md cursor-pointer transition-all hover:scale-102 active:scale-98"
        >
          <Save className="w-4 h-4" />
          <span>সকল পরিবর্তন সংরক্ষণ করুন (Save All Settings)</span>
        </button>
      </div>
    </div>
  );
});
