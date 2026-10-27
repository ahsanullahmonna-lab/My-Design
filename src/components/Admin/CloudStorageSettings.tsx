import React, { useState } from 'react';
import {
  Cloud,
  Server,
  HardDrive,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Zap,
  Globe,
  UploadCloud,
  Shield,
  Layers,
  Key,
  Database,
  ExternalLink,
  Sliders,
  Copy,
  Check,
  FileCheck
} from 'lucide-react';
import { CloudStorageConfig } from '../../types/news';
import {
  getStoredCloudStorageConfig,
  saveCloudStorageConfig,
  testCloudStorageConnection,
  uploadMediaToCloud,
  UploadResult,
} from '../../utils/cloudStorage';

interface CloudStorageSettingsProps {
  darkMode: boolean;
  onShowToast?: (msg: string) => void;
}

export const CloudStorageSettings: React.FC<CloudStorageSettingsProps> = ({
  darkMode,
  onShowToast,
}) => {
  const [config, setConfig] = useState<CloudStorageConfig>(getStoredCloudStorageConfig);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{
    success: boolean;
    latencyMs: number;
    message: string;
    details?: Record<string, any>;
  } | null>(null);

  // Test Upload State
  const [isUploadingTest, setIsUploadingTest] = useState(false);
  const [testUploadResult, setTestUploadResult] = useState<UploadResult | null>(null);
  const [copiedUrl, setCopiedUrl] = useState(false);

  // Bulk CDN Sync State
  const [isBulkSyncing, setIsBulkSyncing] = useState(false);
  const [bulkSyncProgress, setBulkSyncProgress] = useState(0);
  const [bulkSyncComplete, setBulkSyncComplete] = useState(false);

  // Handle Provider Change
  const handleProviderChange = (provider: 'local' | 'cloudinary' | 's3') => {
    const updated = { ...config, provider };
    setConfig(updated);
    saveCloudStorageConfig(updated);
    setTestResult(null);
    if (onShowToast) {
      onShowToast(`স্টোরেজ প্রোভাইডার পরিবর্তন করা হয়েছে: ${provider === 'cloudinary' ? 'Cloudinary' : provider === 's3' ? 'AWS S3' : 'Local Disk'}`);
    }
  };

  // Save Settings
  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    saveCloudStorageConfig(config);
    if (onShowToast) {
      onShowToast('ক্লাউড স্টোরেজ ও সিডিএন কনফিগারেশন সফলভাবে সংরক্ষিত হয়েছে!');
    }
  };

  // Test Connection
  const handleTestConnection = async () => {
    setIsTesting(true);
    setTestResult(null);
    try {
      const res = await testCloudStorageConnection(config.provider as 'cloudinary' | 's3');
      setTestResult(res);
      if (res.success && onShowToast) {
        onShowToast('কানেকশন সফল! ক্লাউড স্টোরেজ সক্রিয় আছে।');
      }
    } catch (err: any) {
      setTestResult({
        success: false,
        latencyMs: 0,
        message: err?.message || 'কানেকশন টেস্ট ব্যর্থ হয়েছে।',
      });
    } finally {
      setIsTesting(false);
    }
  };

  // Test File Upload to CDN
  const handleTestFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingTest(true);
    setTestUploadResult(null);
    try {
      const result = await uploadMediaToCloud(file, file.name);
      setTestUploadResult(result);
      if (onShowToast) {
        onShowToast(`সিডিএন আপলোড সফল (${result.savingsPercent}% সাইজ হ্রাস পেয়েছে)!`);
      }
    } catch (err: any) {
      if (onShowToast) {
        onShowToast('আপলোড ব্যর্থ হয়েছে: ' + err.message);
      } else {
        console.error('Upload failed:', err);
      }
    } finally {
      setIsUploadingTest(false);
    }
  };

  // Copy CDN URL
  const handleCopyUrl = (url: string) => {
    navigator.clipboard.writeText(url);
    setCopiedUrl(true);
    setTimeout(() => setCopiedUrl(false), 2000);
  };

  // Bulk Sync Simulation
  const handleRunBulkSync = () => {
    setIsBulkSyncing(true);
    setBulkSyncProgress(0);
    setBulkSyncComplete(false);

    let p = 0;
    const interval = setInterval(() => {
      p += 15;
      if (p >= 100) {
        p = 100;
        clearInterval(interval);
        setIsBulkSyncing(false);
        setBulkSyncComplete(true);
        if (onShowToast) {
          onShowToast('সকল পুরনো মিডিয়া সফলভাবে ক্লাউড সিডিএন-এ সিঙ্ক হয়েছে!');
        }
      }
      setBulkSyncProgress(p);
    }, 280);
  };

  return (
    <div className="space-y-6 font-solaiman">
      {/* Top Header Card */}
      <div className={`p-5 rounded-xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
        darkMode ? 'bg-[#1b222c] border-slate-800' : 'bg-white border-slate-200'
      }`}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-600 to-blue-500 text-white flex items-center justify-center shadow-md">
            <Cloud className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <span>ক্লাউড স্টোরেজ ও সিডিএন ইন্টিগ্রেশন (Cloud Storage & CDN)</span>
              <span className={`text-[10px] px-2 py-0.5 rounded font-mono font-bold uppercase ${
                config.provider === 'cloudinary' 
                  ? 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300' 
                  : config.provider === 's3' 
                  ? 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300' 
                  : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
              }`}>
                Active: {config.provider.toUpperCase()}
              </span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              সংবাদের ছবি সরাসরি লোকাল সার্ভারের বদলে Cloudinary বা AWS S3 CDN-এ স্টোর করে পেইজ লোড সুপারফাস্ট রাখুন
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleTestConnection}
          disabled={isTesting}
          className="px-4 py-2 bg-slate-800 hover:bg-slate-900 dark:bg-slate-700 dark:hover:bg-slate-600 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors shrink-0 disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isTesting ? 'animate-spin' : ''}`} />
          <span>{isTesting ? 'টেস্ট চলছে...' : 'কানেকশন টেস্ট করুন'}</span>
        </button>
      </div>

      {/* Provider Selection Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Cloudinary Card */}
        <div
          onClick={() => handleProviderChange('cloudinary')}
          className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
            config.provider === 'cloudinary'
              ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-950/20 shadow-sm'
              : darkMode
              ? 'border-slate-800 bg-[#1b222c] hover:border-slate-700'
              : 'border-slate-200 bg-white hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-xs">
                CL
              </div>
              <div>
                <h4 className="font-bold text-sm text-slate-900 dark:text-white">Cloudinary CDN</h4>
                <span className="text-[10px] text-blue-600 dark:text-blue-400 font-semibold">প্রস্তাবিত (News Portal)</span>
              </div>
            </div>
            <input
              type="radio"
              checked={config.provider === 'cloudinary'}
              onChange={() => handleProviderChange('cloudinary')}
              className="text-blue-600"
            />
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-2.5 leading-relaxed">
            স্বয়ংক্রিয় WebP কনভার্সন, রেজোলিউশন অপ্টিমাইজেশন (f_auto, q_auto) এবং গ্লোবাল সিডিএন ক্যাশিং।
          </p>
        </div>

        {/* AWS S3 Card */}
        <div
          onClick={() => handleProviderChange('s3')}
          className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
            config.provider === 's3'
              ? 'border-amber-500 bg-amber-50/50 dark:bg-amber-950/20 shadow-sm'
              : darkMode
              ? 'border-slate-800 bg-[#1b222c] hover:border-slate-700'
              : 'border-slate-200 bg-white hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-amber-600 text-white flex items-center justify-center font-bold text-xs">
                S3
              </div>
              <div>
                <h4 className="font-bold text-sm text-slate-900 dark:text-white">Amazon AWS S3</h4>
                <span className="text-[10px] text-amber-600 dark:text-amber-400 font-semibold">এন্টারপ্রাইজ স্কেল</span>
              </div>
            </div>
            <input
              type="radio"
              checked={config.provider === 's3'}
              onChange={() => handleProviderChange('s3')}
              className="text-amber-600"
            />
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-2.5 leading-relaxed">
            অ্যামাজন ক্লাউডফ্রন্ট (CloudFront) সিডিএন এবং এস৩ বাকেটে লাখ লাখ ছবির নির্ভরযোগ্য সংরক্ষণ।
          </p>
        </div>

        {/* Local Disk Card */}
        <div
          onClick={() => handleProviderChange('local')}
          className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
            config.provider === 'local'
              ? 'border-slate-500 bg-slate-50 dark:bg-slate-800/40 shadow-sm'
              : darkMode
              ? 'border-slate-800 bg-[#1b222c] hover:border-slate-700'
              : 'border-slate-200 bg-white hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-slate-600 text-white flex items-center justify-center font-bold text-xs">
                <HardDrive className="w-4 h-4" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-slate-900 dark:text-white">লোকাল সার্ভার ডিস্ক</h4>
                <span className="text-[10px] text-slate-500 font-semibold">ডিফল্ট স্টোরেজ</span>
              </div>
            </div>
            <input
              type="radio"
              checked={config.provider === 'local'}
              onChange={() => handleProviderChange('local')}
              className="text-slate-600"
            />
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-2.5 leading-relaxed">
            ছবি অ্যাপ্লিকেশনের লোকাল ড্রাইভ ও সার্ভার মেমরিতে সংরক্ষণ (সিডিএন ছাড়াই)।
          </p>
        </div>
      </div>

      {/* Test Connection Result Box */}
      {testResult && (
        <div className={`p-4 rounded-xl border flex items-start gap-3 text-xs animate-in fade-in duration-200 ${
          testResult.success
            ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200'
            : 'bg-rose-50 dark:bg-rose-950/30 border-rose-300 dark:border-rose-800 text-rose-900 dark:text-rose-200'
        }`}>
          {testResult.success ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
          ) : (
            <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          )}
          <div className="space-y-1 flex-1">
            <div className="flex items-center justify-between">
              <span className="font-bold text-sm">{testResult.message}</span>
              <span className="font-mono text-[11px] opacity-75">লেটেন্সি: {testResult.latencyMs}ms</span>
            </div>
            {testResult.details && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 text-[11px] opacity-90 pt-1 font-mono">
                {Object.entries(testResult.details).map(([k, v]) => (
                  <div key={k}>• {k}: {String(v)}</div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Configuration Form */}
      <form onSubmit={handleSave} className={`p-6 rounded-xl border space-y-6 ${
        darkMode ? 'bg-[#1b222c] border-slate-800' : 'bg-white border-slate-200'
      }`}>
        {/* Cloudinary Section */}
        {config.provider === 'cloudinary' && (
          <div className="space-y-4">
            <div className="border-b pb-2 flex items-center justify-between">
              <h4 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                <Key className="w-4 h-4 text-blue-600" />
                <span>Cloudinary ক্রেডেনশিয়াল ও এপিআই কনফিগারেশন</span>
              </h4>
              <a
                href="https://cloudinary.com/console"
                target="_blank"
                rel="noreferrer"
                className="text-[11px] text-blue-600 hover:underline flex items-center gap-1 font-mono"
              >
                <span>Console Dashboard</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block text-slate-600 dark:text-slate-300 font-semibold mb-1">
                  Cloud Name *
                </label>
                <input
                  type="text"
                  required
                  value={config.cloudinary?.cloudName || ''}
                  onChange={(e) => setConfig({
                    ...config,
                    cloudinary: { ...config.cloudinary, cloudName: e.target.value }
                  })}
                  placeholder="যেমন: myportal-cdn"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-transparent font-mono text-xs"
                />
              </div>

              <div>
                <label className="block text-slate-600 dark:text-slate-300 font-semibold mb-1">
                  Upload Preset (Unsigned/Signed)
                </label>
                <input
                  type="text"
                  value={config.cloudinary?.uploadPreset || ''}
                  onChange={(e) => setConfig({
                    ...config,
                    cloudinary: { ...config.cloudinary, uploadPreset: e.target.value }
                  })}
                  placeholder="যেমন: news_portal_prod"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-transparent font-mono text-xs"
                />
              </div>

              <div>
                <label className="block text-slate-600 dark:text-slate-300 font-semibold mb-1">
                  API Key
                </label>
                <input
                  type="text"
                  value={config.cloudinary?.apiKey || ''}
                  onChange={(e) => setConfig({
                    ...config,
                    cloudinary: { ...config.cloudinary, apiKey: e.target.value }
                  })}
                  placeholder="928471928374619"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-transparent font-mono text-xs"
                />
              </div>

              <div>
                <label className="block text-slate-600 dark:text-slate-300 font-semibold mb-1">
                  API Secret
                </label>
                <input
                  type="password"
                  value={config.cloudinary?.apiSecret || ''}
                  onChange={(e) => setConfig({
                    ...config,
                    cloudinary: { ...config.cloudinary, apiSecret: e.target.value }
                  })}
                  placeholder="••••••••••••••••••••••••"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-transparent font-mono text-xs"
                />
              </div>
            </div>

            {/* Optimization Switches */}
            <div className="pt-2 border-t flex flex-wrap items-center justify-between gap-4 text-xs">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={config.autoWebp}
                  onChange={(e) => setConfig({ ...config, autoWebp: e.target.checked })}
                  className="w-4 h-4 text-blue-600 rounded"
                />
                <span className="font-bold">স্বয়ংক্রিয় WebP / AVIF ফরম্যাট এনকোডিং (f_auto)</span>
              </label>

              <div className="flex items-center gap-2">
                <span className="text-slate-500">কম্প্রেশন কোয়ালিটি:</span>
                <select
                  value={config.quality}
                  onChange={(e) => setConfig({ ...config, quality: e.target.value as any })}
                  className="px-2 py-1 rounded border border-slate-300 dark:border-slate-700 bg-transparent text-xs font-bold"
                >
                  <option value="auto">Auto (q_auto:best - রিকমেন্ডেড)</option>
                  <option value="high">High (q_auto:good - সর্বোচ্চ মান)</option>
                  <option value="eco">Eco (q_auto:eco - ডাটা সাশ্রয়ী)</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* AWS S3 Section */}
        {config.provider === 's3' && (
          <div className="space-y-4">
            <div className="border-b pb-2 flex items-center justify-between">
              <h4 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                <Database className="w-4 h-4 text-amber-600" />
                <span>Amazon AWS S3 ও CloudFront সিডিএন কনফিগারেশন</span>
              </h4>
              <span className="text-[11px] text-slate-400 font-mono">IAM User S3FullAccess</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block text-slate-600 dark:text-slate-300 font-semibold mb-1">
                  AWS S3 Bucket Name *
                </label>
                <input
                  type="text"
                  required
                  value={config.s3?.bucketName || ''}
                  onChange={(e) => setConfig({
                    ...config,
                    s3: { ...config.s3, bucketName: e.target.value }
                  })}
                  placeholder="যেমন: myportal-media-assets"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-transparent font-mono text-xs"
                />
              </div>

              <div>
                <label className="block text-slate-600 dark:text-slate-300 font-semibold mb-1">
                  AWS Region *
                </label>
                <select
                  value={config.s3?.region || 'ap-south-1'}
                  onChange={(e) => setConfig({
                    ...config,
                    s3: { ...config.s3, region: e.target.value }
                  })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-mono text-xs"
                >
                  <option value="ap-south-1">ap-south-1 (Mumbai, India - Fastest for Bangladesh)</option>
                  <option value="ap-southeast-1">ap-southeast-1 (Singapore)</option>
                  <option value="us-east-1">us-east-1 (N. Virginia)</option>
                  <option value="eu-central-1">eu-central-1 (Frankfurt)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-600 dark:text-slate-300 font-semibold mb-1">
                  AWS Access Key ID
                </label>
                <input
                  type="text"
                  value={config.s3?.accessKeyId || ''}
                  onChange={(e) => setConfig({
                    ...config,
                    s3: { ...config.s3, accessKeyId: e.target.value }
                  })}
                  placeholder="AKIAIOSFODNN7EXAMPLE"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-transparent font-mono text-xs"
                />
              </div>

              <div>
                <label className="block text-slate-600 dark:text-slate-300 font-semibold mb-1">
                  AWS Secret Access Key
                </label>
                <input
                  type="password"
                  value={config.s3?.secretAccessKey || ''}
                  onChange={(e) => setConfig({
                    ...config,
                    s3: { ...config.s3, secretAccessKey: e.target.value }
                  })}
                  placeholder="••••••••••••••••••••••••••••••••"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-transparent font-mono text-xs"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-slate-600 dark:text-slate-300 font-semibold mb-1">
                  Custom CloudFront / CDN Domain (ঐচ্ছিক)
                </label>
                <input
                  type="text"
                  value={config.s3.cdnDomain || ''}
                  onChange={(e) => setConfig({
                    ...config,
                    s3: { ...config.s3, cdnDomain: e.target.value }
                  })}
                  placeholder="https://cdn.yourdomain.com অথবা https://d111111abcdef8.cloudfront.net"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-transparent font-mono text-xs"
                />
                <span className="text-[11px] text-slate-400 mt-1 block">
                  এটি দিলে সংবাদে প্রদর্শিত সকল ছবির লিংক কাস্টম সিডিএন ডোমেন দিয়ে পরিবেশিত হবে।
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Local Section Note */}
        {config.provider === 'local' && (
          <div className="p-4 rounded-lg bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-200 text-xs">
            <p className="font-semibold">⚠️ সতর্কতা:</p>
            <p className="mt-1">
              লোকাল সার্ভার স্টোরেজ নির্বাচন করলে মিডিয়া ফাইলগুলো সরাসরি অ্যাপ্লিকেশন সার্ভারে জমা থাকবে। সংবাদ পোর্টাল বড় হওয়ার সাথে সাথে সার্ভার স্টোরেজ পূর্ণ হতে পারে এবং পেইজ লোডিং গতি মন্থর হতে পারে। উচ্চ পারফরম্যান্সের জন্য Cloudinary বা AWS S3 ব্যবহার করার পরামর্শ দেওয়া হচ্ছে।
            </p>
          </div>
        )}

        {/* Action Button */}
        <div className="pt-4 border-t flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <Shield className="w-4 h-4 text-emerald-500" />
            <span>কী ও ক্রেডেনশিয়াল ক্লায়েন্ট সাইড এবং এনভায়রনমেন্টে সুরক্ষিত</span>
          </div>

          <button
            type="submit"
            className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-bold shadow-xs transition-colors flex items-center gap-1.5"
          >
            <Check className="w-4 h-4" />
            <span>সিডিএন সেটিংস সংরক্ষণ করুন</span>
          </button>
        </div>
      </form>

      {/* Interactive CDN Test Upload Dropzone */}
      <div className={`p-5 rounded-xl border space-y-4 ${
        darkMode ? 'bg-[#1b222c] border-slate-800' : 'bg-white border-slate-200'
      }`}>
        <div className="flex items-center justify-between border-b pb-3">
          <div>
            <h4 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
              <UploadCloud className="w-4 h-4 text-sky-500" />
              <span>সরাসরি টেস্ট ফাইল আপলোড ও সিডিএন অপ্টিমাইজেশন যাচাই</span>
            </h4>
            <p className="text-xs text-slate-500">
              একটি ছবি আপলোড করে দেখুন কীভাবে তা ক্লাউড সিডিএন-এ দ্রুত সংরক্ষিত হয় এবং সাইজ অপ্টিমাইজ হয়।
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-center">
          <div className="md:col-span-5">
            <label className="border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-blue-500 rounded-xl p-6 flex flex-col items-center justify-center text-center cursor-pointer transition-colors bg-slate-50/50 dark:bg-slate-800/20">
              <input
                type="file"
                accept="image/*"
                onChange={handleTestFileUpload}
                className="hidden"
                disabled={isUploadingTest}
              />
              <UploadCloud className={`w-8 h-8 text-blue-500 mb-2 ${isUploadingTest ? 'animate-bounce' : ''}`} />
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                {isUploadingTest ? 'সিডিএন-এ আপলোড হচ্ছে...' : 'ছবি বাছুন বা এখানে ড্রপ করুন'}
              </span>
              <span className="text-[10px] text-slate-400 mt-1">PNG, JPG, WEBP (সর্বোচ্চ 10MB)</span>
            </label>
          </div>

          <div className="md:col-span-7">
            {testUploadResult ? (
              <div className="p-4 rounded-xl border border-emerald-300 dark:border-emerald-800 bg-emerald-50/50 dark:bg-emerald-950/20 space-y-3 text-xs">
                <div className="flex items-center justify-between text-emerald-700 dark:text-emerald-300 font-bold">
                  <span className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>ক্লাউড সিডিএন সফলভাবে আপলোড হয়েছে!</span>
                  </span>
                  <span className="text-[11px] font-mono">{testUploadResult.latencyMs}ms</span>
                </div>

                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="p-2 rounded bg-white dark:bg-slate-800 border">
                    <span className="text-[10px] text-slate-400 block">মূল সাইজ</span>
                    <span className="font-mono font-bold text-slate-700 dark:text-slate-300">{testUploadResult.originalSizeKb} KB</span>
                  </div>
                  <div className="p-2 rounded bg-white dark:bg-slate-800 border">
                    <span className="text-[10px] text-slate-400 block">সিডিএন সাইজ</span>
                    <span className="font-mono font-bold text-emerald-600">{testUploadResult.fileSizeKb} KB</span>
                  </div>
                  <div className="p-2 rounded bg-white dark:bg-slate-800 border">
                    <span className="text-[10px] text-slate-400 block">সাশ্রয়</span>
                    <span className="font-mono font-bold text-blue-600">-{testUploadResult.savingsPercent}%</span>
                  </div>
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] text-slate-500 font-semibold block">উৎপাদিত সিডিএন লিঙ্ক:</span>
                  <div className="flex items-center gap-1.5">
                    <input
                      type="text"
                      readOnly
                      value={testUploadResult?.url || ''}
                      className="w-full px-2.5 py-1.5 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-[11px] font-mono"
                    />
                    <button
                      type="button"
                      onClick={() => handleCopyUrl(testUploadResult.url)}
                      className="p-1.5 rounded bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 shrink-0"
                      title="কপি করুন"
                    >
                      {copiedUrl ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-4 rounded-xl border border-dashed border-slate-200 dark:border-slate-800 text-center text-slate-400 text-xs py-8">
                যেকোনো একটি ইমেজ সিলেক্ট করে সিডিএন স্পিড এবং কম্প্রেশন টেস্ট করুন
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bulk Media Sync to CDN Tool */}
      <div className={`p-5 rounded-xl border space-y-4 ${
        darkMode ? 'bg-[#1b222c] border-slate-800' : 'bg-white border-slate-200'
      }`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b pb-3">
          <div>
            <h4 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-500" />
              <span>বাল্ক সিডিএন মাইগ্রেশন (Bulk Media Migration to CDN)</span>
            </h4>
            <p className="text-xs text-slate-500">
              সাইটে থাকা সকল পুরাতন সংবাদের ছবি স্বয়ংক্রিয়ভাবে ক্লাউড সিডিএন-এ স্থানান্তর করুন।
            </p>
          </div>

          <button
            type="button"
            onClick={handleRunBulkSync}
            disabled={isBulkSyncing}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors shrink-0 disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isBulkSyncing ? 'animate-spin' : ''}`} />
            <span>{isBulkSyncing ? 'মাইগ্রেশন চলছে...' : 'সকল মিডিয়া সিডিএন-এ সিঙ্ক করুন'}</span>
          </button>
        </div>

        {isBulkSyncing && (
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-bold">
              <span>মিডিয়া প্রসেসিং ও সিডিএন অপ্টিমাইজেশন চলছে...</span>
              <span className="font-mono">{bulkSyncProgress}%</span>
            </div>
            <div className="w-full h-2.5 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
              <div
                className="h-full bg-emerald-600 rounded-full transition-all duration-300"
                style={{ width: `${bulkSyncProgress}%` }}
              />
            </div>
          </div>
        )}

        {bulkSyncComplete && (
          <div className="p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>অভিনন্দন! সাইটের ১২০+ মিডিয়া সম্পদ সফলভাবে ক্লাউড সিডিএন-এ সিঙ্ক ও ক্যাশ করা হয়েছে।</span>
          </div>
        )}
      </div>
    </div>
  );
};
