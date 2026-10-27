/**
 * ============================================================================
 * Enterprise News Portal - Centralized Global Site Config & Branding Context Engine
 * ============================================================================
 * 
 * Provides a single source of truth (`siteConfig`) across the entire portal:
 * - Header, TopBar, Logo, Navbar
 * - Digital E-Paper Masthead, Ear Panels, and Print Edition Watermarks
 * - Photo Card Generator dynamic branding badges, footers, and watermarks
 * - Footer and Editorial credits
 * - Dynamic browser title, favicon, and SEO OpenGraph tags
 * 
 * Prevents any hardcoded portal names or logos from ever drifting across pages.
 */

import React, { createContext, useContext, useMemo } from 'react';
import { SiteSettings } from '../types/news';
import { initialSettings } from '../data/mockNewsData';

export interface SiteConfigState {
  // Primary brand identities
  siteName: string;
  siteNameEn: string;
  tagline: string;
  domain: string;
  lightLogoUrl: string;
  darkLogoUrl: string;
  faviconUrl: string;
  headerLogoHeight?: number;
  headerLogoWidth?: number;
  footerLogoHeight?: number;
  footerLogoWidth?: number;
  whatsappNumber: string;

  // Active logo helper depending on dark mode
  activeLogoUrl: (darkMode?: boolean) => string | undefined;

  // Editorial designations & credits
  editorialSectionTitle: string;
  contactSectionTitle: string;
  editorLabel: string;
  editorName: string;
  execEditorLabel: string;
  execEditorName: string;
  publisherLabel: string;
  publisherName: string;
  newsHeadLabel: string;
  newsHeadName: string;

  // Contact details
  contactEmail: string;
  contactPhone: string;
  officeAddress: string;

  // Copyright and about
  footerAbout: string;
  copyrightText: string;

  // Raw full settings object for complete access
  settings: SiteSettings;
  updateSettings?: (newSettings: SiteSettings | ((prev: SiteSettings) => SiteSettings)) => void;
}

const defaultSiteConfig: SiteConfigState = {
  siteName: initialSettings.siteName || 'দৈনিক বাংলাদেশ',
  siteNameEn: initialSettings.siteNameEn || 'Daily Bangladesh',
  tagline: initialSettings.tagline || 'পজিটিভ বাংলাদেশ',
  domain: initialSettings.domain || 'dailybangladesh.com',
  lightLogoUrl: initialSettings.lightLogoUrl || '',
  darkLogoUrl: initialSettings.darkLogoUrl || '',
  faviconUrl: initialSettings.faviconUrl || '',
  headerLogoHeight: initialSettings.headerLogoHeight || 28,
  headerLogoWidth: initialSettings.headerLogoWidth || 0,
  footerLogoHeight: initialSettings.footerLogoHeight || 22,
  footerLogoWidth: initialSettings.footerLogoWidth || 0,
  whatsappNumber: initialSettings.whatsappNumber || '+৮৮০১৭০০০০০০০০',
  activeLogoUrl: (darkMode = false) => {
    const url = darkMode ? initialSettings.darkLogoUrl : initialSettings.lightLogoUrl;
    return url && url.trim() !== '' ? url.trim() : undefined;
  },
  editorialSectionTitle: initialSettings.editorialSectionTitle || 'সম্পাদকীয় ও প্রশাসন',
  contactSectionTitle: initialSettings.contactSectionTitle || 'যোগাযোগ ও দপ্তর',
  editorLabel: initialSettings.editorLabel || 'ভারপ্রাপ্ত সম্পাদক',
  editorName: initialSettings.editorName || 'শামীম রেজা নূরুল',
  execEditorLabel: initialSettings.execEditorLabel || 'নির্বাহী সম্পাদক',
  execEditorName: initialSettings.execEditorName || 'নাজমুল হুদা শান্ত',
  publisherLabel: initialSettings.publisherLabel || 'প্রকাশক',
  publisherName: initialSettings.publisherName || 'পাবলিকেশনস লিমিটেড',
  newsHeadLabel: initialSettings.newsHeadLabel || 'বার্তা প্রধান',
  newsHeadName: initialSettings.newsHeadName || 'মাহমুদ হাসান',
  contactEmail: initialSettings.contactEmail || 'editor@dailybangladesh.com',
  contactPhone: initialSettings.contactPhone || '+৮৮০ ১৭০০০০০০০০',
  officeAddress: initialSettings.officeAddress || 'প্লট #১২, প্রগতি সরণি, বারিধারা, ঢাকা-১২১২, বাংলাদেশ',
  footerAbout: initialSettings.footerAbout || 'একটি স্বাধীন ও নিরপেক্ষ অনলাইন সংবাদ মাধ্যম।',
  copyrightText: initialSettings.copyrightText || '© ২০২৬ সর্বস্বত্ব সংরক্ষিত',
  settings: initialSettings,
};

const SiteConfigContext = createContext<SiteConfigState>(defaultSiteConfig);

interface SiteConfigProviderProps {
  settings: SiteSettings;
  onUpdateSettings?: (newSettings: SiteSettings | ((prev: SiteSettings) => SiteSettings)) => void;
  children: React.ReactNode;
}

export const SiteConfigProvider: React.FC<SiteConfigProviderProps> = ({
  settings,
  onUpdateSettings,
  children,
}) => {
  const value = useMemo<SiteConfigState>(() => {
    const s = settings || initialSettings;
    const siteName = s.siteName?.trim() || initialSettings.siteName || 'সংবাদ পোর্টাল';
    const siteNameEn = s.siteNameEn?.trim() || initialSettings.siteNameEn || 'News Portal';
    const domain = s.domain?.trim() || initialSettings.domain || 'newsportal.com';
    const tagline = s.tagline?.trim() || initialSettings.tagline || 'পজিটিভ বাংলাদেশ';

    return {
      siteName,
      siteNameEn,
      tagline,
      domain,
      lightLogoUrl: s.lightLogoUrl?.trim() || '',
      darkLogoUrl: s.darkLogoUrl?.trim() || '',
      faviconUrl: s.faviconUrl?.trim() || '',
      headerLogoHeight: s.headerLogoHeight ?? 28,
      headerLogoWidth: s.headerLogoWidth ?? 0,
      footerLogoHeight: s.footerLogoHeight ?? 22,
      footerLogoWidth: s.footerLogoWidth ?? 0,
      whatsappNumber: s.whatsappNumber?.trim() || s.contactPhone?.trim() || '+৮৮০১৭০০০০০০০০',
      activeLogoUrl: (darkMode = false) => {
        const customUrl = darkMode ? s.darkLogoUrl : s.lightLogoUrl;
        return customUrl && customUrl.trim() !== '' ? customUrl.trim() : undefined;
      },
      editorialSectionTitle: s.editorialSectionTitle?.trim() || 'সম্পাদকীয় ও প্রশাসন',
      contactSectionTitle: s.contactSectionTitle?.trim() || 'যোগাযোগ ও দপ্তর',
      editorLabel: s.editorLabel?.trim() || 'ভারপ্রাপ্ত সম্পাদক',
      editorName: s.editorName?.trim() || 'শামীম রেজা নূরুল',
      execEditorLabel: s.execEditorLabel?.trim() || 'নির্বাহী সম্পাদক',
      execEditorName: s.execEditorName?.trim() || 'নাজমুল হুদা শান্ত',
      publisherLabel: s.publisherLabel?.trim() || 'প্রকাশক',
      publisherName: s.publisherName?.trim() || `${siteName} পাবলিকেশনস লিমিটেড`,
      newsHeadLabel: s.newsHeadLabel?.trim() || 'বার্তা প্রধান',
      newsHeadName: s.newsHeadName?.trim() || 'মাহমুদ হাসান',
      contactEmail: s.contactEmail?.trim() || `editor@${domain}`,
      contactPhone: s.contactPhone?.trim() || '+৮৮০ ১৭০০০০০০০০',
      officeAddress: s.officeAddress?.trim() || 'প্লট #১২, প্রগতি সরণি, বারিধারা, ঢাকা-১২১২, বাংলাদেশ',
      footerAbout: s.footerAbout?.trim() || `সময়ের সাথে তাল মিলিয়ে সবশেষ খবরের নির্ভুল গন্তব্য ${siteName}। বাংলাদেশ ও বিশ্বমঞ্চের ব্রেকিং নিউজ, রাজনীতি, অর্থনীতি, খেলাধুলা ও বিনোদনের সব খবর।`,
      copyrightText: s.copyrightText?.trim() || `© ২০২৬ ${siteName} (${domain}). সর্বস্বত্ব সংরক্ষিত।`,
      settings: s,
      updateSettings: onUpdateSettings,
    };
  }, [settings, onUpdateSettings]);

  return (
    <SiteConfigContext.Provider value={value}>
      {children}
    </SiteConfigContext.Provider>
  );
};

/**
 * Global Hook to consume site identity and branding
 */
export const useSiteConfig = (): SiteConfigState => {
  const context = useContext(SiteConfigContext);
  if (!context) {
    return defaultSiteConfig;
  }
  return context;
};
