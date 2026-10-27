import React, { useState } from 'react';
import { 
  ShieldAlert, 
  Search, 
  Filter, 
  RefreshCw, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  Clock, 
  Globe, 
  Lock, 
  UserCheck, 
  FileCode,
  Share2
} from 'lucide-react';
import { AuditLogEntry, getAuditLogs } from '../../utils/securityAndSeo';

interface AuditTrailPanelProps {
  darkMode: boolean;
}

export const AuditTrailPanel: React.FC<AuditTrailPanelProps> = ({ darkMode }) => {
  const [logs, setLogs] = useState<AuditLogEntry[]>(() => getAuditLogs());
  const [searchTerm, setSearchTerm] = useState('');
  const [actionFilter, setActionFilter] = useState('all');

  const handleRefresh = () => {
    setLogs(getAuditLogs());
  };

  const filteredLogs = logs.filter((log) => {
    const matchesSearch = 
      !searchTerm.trim() || 
      log.details.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.ipAddress.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = actionFilter === 'all' || log.action === actionFilter;
    return matchesSearch && matchesFilter;
  });

  const getStatusBadge = (status: AuditLogEntry['status']) => {
    switch (status) {
      case 'success':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
            <span>সফল</span>
          </span>
        );
      case 'warning':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300">
            <AlertTriangle className="w-3 h-3 text-amber-600" />
            <span>সতর্কতা</span>
          </span>
        );
      case 'danger':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold bg-red-100 text-red-800 dark:bg-red-950/60 dark:text-red-300">
            <XCircle className="w-3 h-3 text-red-600" />
            <span>প্রতিহত / ব্লক</span>
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className={`p-5 rounded-xl border flex flex-wrap items-center justify-between gap-4 transition-colors ${
        darkMode ? 'bg-[#1b222c] border-slate-800' : 'bg-white border-slate-200'
      }`}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-indigo-600 text-white flex items-center justify-center shadow-xs">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-bold font-solaiman text-slate-900 dark:text-white flex items-center gap-2">
              <span>ভূমিকা-ভিত্তিক অডিট লগ ও নিরাপত্তা ট্রেইল (Audit Trail)</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 uppercase font-bold">
                ENTERPRISE
              </span>
            </h3>
            <p className="text-xs text-slate-500 font-solaiman">
              কে কোন নিউজ প্রকাশ, সম্পাদনা বা ডিলিট করেছেন, রোল পরিবর্তন ও সিস্টেম নিরাপত্তার লাইভ রেকর্ড।
            </p>
          </div>
        </div>

        <button
          onClick={handleRefresh}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold font-solaiman bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors border border-slate-200 dark:border-slate-700"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>লগ রিফ্রেশ</span>
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className={`p-4 rounded-xl border flex flex-wrap items-center justify-between gap-3 ${
        darkMode ? 'bg-[#1b222c] border-slate-800' : 'bg-white border-slate-200'
      }`}>
        <div className="flex items-center gap-2 flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="ইউজার, আইপি ঠিকানা বা কার্যকলাপ দিয়ে খুঁজুন..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-transparent border-0 text-xs font-solaiman focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          <select
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
            className="bg-transparent border border-slate-200 dark:border-slate-700 rounded px-2.5 py-1 text-xs font-solaiman"
          >
            <option value="all" className="bg-white dark:bg-slate-900">সব কার্যকলাপ (All Actions)</option>
            <option value="publish_post" className="bg-white dark:bg-slate-900">সংবাদ প্রকাশ (Publish)</option>
            <option value="edit_post" className="bg-white dark:bg-slate-900">সংবাদ সম্পাদনা (Edit)</option>
            <option value="delete_post" className="bg-white dark:bg-slate-900">সংবাদ মুছে ফেলা (Delete)</option>
            <option value="update_settings" className="bg-white dark:bg-slate-900">সেটিংস পরিবর্তন (Settings)</option>
            <option value="google_indexed" className="bg-white dark:bg-slate-900">Google Indexing</option>
            <option value="fb_posted" className="bg-white dark:bg-slate-900">ফেসবুক অটো-পোস্ট (Facebook)</option>
            <option value="bot_blocked" className="bg-white dark:bg-slate-900">বট ব্লক (Honeypot)</option>
          </select>
        </div>
      </div>

      {/* Audit Log Table */}
      <div className={`rounded-xl border overflow-hidden shadow-xs ${
        darkMode ? 'bg-[#1b222c] border-slate-800' : 'bg-white border-slate-200'
      }`}>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs font-solaiman">
            <thead>
              <tr className={`border-b text-slate-500 font-bold uppercase text-[10px] ${
                darkMode ? 'bg-slate-900/60 border-slate-800' : 'bg-slate-50 border-slate-200'
              }`}>
                <th className="py-3 px-4">কার্যকলাপ (Action)</th>
                <th className="py-3 px-4">ব্যবহারকারী ও রোল</th>
                <th className="py-3 px-4">আইপি অ্যাড্রেস (IP & Location)</th>
                <th className="py-3 px-4">তারিখ ও সময়</th>
                <th className="py-3 px-4">স্ট্যাটাস</th>
                <th className="py-3 px-4">বিস্তারিত বিবরণ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
              {filteredLogs.map((entry) => (
                <tr key={entry.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors">
                  <td className="py-3 px-4 font-bold text-slate-900 dark:text-white whitespace-nowrap">
                    {entry.actionBn}
                  </td>
                  <td className="py-3 px-4 whitespace-nowrap">
                    <div className="font-semibold text-slate-800 dark:text-slate-200">{entry.userName}</div>
                    <div className="text-[10px] text-slate-400 uppercase font-mono">{entry.userRole}</div>
                  </td>
                  <td className="py-3 px-4 font-mono text-[11px] text-slate-600 dark:text-slate-400 whitespace-nowrap">
                    {entry.ipAddress}
                  </td>
                  <td className="py-3 px-4 text-slate-500 whitespace-nowrap">
                    {entry.timestamp}
                  </td>
                  <td className="py-3 px-4 whitespace-nowrap">
                    {getStatusBadge(entry.status)}
                  </td>
                  <td className="py-3 px-4 text-slate-700 dark:text-slate-300 max-w-[320px] truncate">
                    {entry.details}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
