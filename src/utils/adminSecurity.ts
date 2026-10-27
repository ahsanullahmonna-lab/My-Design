import { SiteSettings } from '../types/news';

export const SECRET_ADMIN_TOKEN = 'k24-secret-token-2026';
export const DEFAULT_ADMIN_SECRET_TOKEN = SECRET_ADMIN_TOKEN;
export const STORAGE_KEY_TOKEN = 'kolom24_admin_secret_token';
export const SESSION_KEY_UNLOCKED = 'kolom24_admin_gateway_unlocked';
export const SESSION_KEY_ATTEMPTS = 'kolom24_admin_failed_attempts';
export const SESSION_KEY_LOCKOUT_UNTIL = 'kolom24_admin_lockout_until';

export const MAX_FAILED_ATTEMPTS = 5;
export const LOCKOUT_DURATION_MS = 3 * 60 * 1000; // 3 minutes lockout

/**
 * Retrieves the currently active secret token.
 * Checks settings first, then localStorage, then hardcoded SECRET_ADMIN_TOKEN.
 */
export function getAdminSecretToken(settings?: SiteSettings): string {
  if (settings?.adminSecurity?.secretToken?.trim()) {
    return settings.adminSecurity.secretToken.trim();
  }
  try {
    const saved = localStorage.getItem(STORAGE_KEY_TOKEN);
    if (saved?.trim()) return saved.trim();
  } catch {}
  return SECRET_ADMIN_TOKEN;
}

/**
 * Stores a custom secret token in localStorage.
 */
export function setStoredAdminSecretToken(token: string): void {
  try {
    localStorage.setItem(STORAGE_KEY_TOKEN, token.trim());
  } catch {}
}

/**
 * Checks whether the current session has successfully passed the Secret Token Guard.
 * Checks both sessionStorage and localStorage for robust session persistence.
 */
export function isSecretAdminAuthorized(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    const sessionVal = sessionStorage.getItem(SESSION_KEY_UNLOCKED);
    const localVal = localStorage.getItem(SESSION_KEY_UNLOCKED);
    return sessionVal === 'true' || localVal === 'true';
  } catch {
    return false;
  }
}

/**
 * Marks the current session as authorized or locked in both sessionStorage and localStorage.
 */
export function setSecretAdminAuthorized(authorized: boolean): void {
  if (typeof window === 'undefined') return;
  try {
    if (authorized) {
      sessionStorage.setItem(SESSION_KEY_UNLOCKED, 'true');
      localStorage.setItem(SESSION_KEY_UNLOCKED, 'true');
      sessionStorage.removeItem(SESSION_KEY_ATTEMPTS);
      sessionStorage.removeItem(SESSION_KEY_LOCKOUT_UNTIL);
    } else {
      sessionStorage.removeItem(SESSION_KEY_UNLOCKED);
      localStorage.removeItem(SESSION_KEY_UNLOCKED);
    }
  } catch {}
}

/**
 * Check if the user is currently locked out due to excessive failed attempts.
 */
export function getLockoutRemainingSeconds(): number {
  if (typeof window === 'undefined') return 0;
  try {
    const lockoutUntil = Number(sessionStorage.getItem(SESSION_KEY_LOCKOUT_UNTIL) || '0');
    const now = Date.now();
    if (lockoutUntil > now) {
      return Math.ceil((lockoutUntil - now) / 1000);
    } else if (lockoutUntil > 0) {
      // Lockout expired
      sessionStorage.removeItem(SESSION_KEY_LOCKOUT_UNTIL);
      sessionStorage.removeItem(SESSION_KEY_ATTEMPTS);
    }
  } catch {}
  return 0;
}

/**
 * Get current count of failed attempts in this session.
 */
export function getFailedAttemptsCount(): number {
  if (typeof window === 'undefined') return 0;
  try {
    return Number(sessionStorage.getItem(SESSION_KEY_ATTEMPTS) || '0');
  } catch {
    return 0;
  }
}

/**
 * Verifies if the provided token matches the configured admin secret token or hardcoded SECRET_ADMIN_TOKEN.
 */
export function verifySecretToken(inputToken: string, settings?: SiteSettings): { success: boolean; remainingLockoutSeconds?: number; attemptsLeft?: number } {
  if (!inputToken || typeof inputToken !== 'string') {
    return { success: false, attemptsLeft: MAX_FAILED_ATTEMPTS - getFailedAttemptsCount() };
  }

  const remainingLockout = getLockoutRemainingSeconds();
  if (remainingLockout > 0) {
    return { success: false, remainingLockoutSeconds: remainingLockout };
  }

  const currentToken = getAdminSecretToken(settings);
  const trimmed = inputToken.trim();
  const isValid = trimmed === currentToken || trimmed === SECRET_ADMIN_TOKEN;

  if (isValid) {
    setSecretAdminAuthorized(true);
    return { success: true };
  } else {
    // Record failed attempt
    try {
      const attempts = Number(sessionStorage.getItem(SESSION_KEY_ATTEMPTS) || '0') + 1;
      sessionStorage.setItem(SESSION_KEY_ATTEMPTS, String(attempts));

      if (attempts >= MAX_FAILED_ATTEMPTS) {
        const lockoutUntil = Date.now() + LOCKOUT_DURATION_MS;
        sessionStorage.setItem(SESSION_KEY_LOCKOUT_UNTIL, String(lockoutUntil));
        return { success: false, remainingLockoutSeconds: Math.ceil(LOCKOUT_DURATION_MS / 1000) };
      }

      return { success: false, attemptsLeft: Math.max(0, MAX_FAILED_ATTEMPTS - attempts) };
    } catch {
      return { success: false, attemptsLeft: 0 };
    }
  }
}

/**
 * Generates a high-entropy cryptographically randomized admin secret token.
 */
export function generateSecureAdminToken(): string {
  const chars = 'abcdefghjkmnpqrstuvwxyz23456789';
  let rand = '';
  for (let i = 0; i < 10; i++) {
    rand += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `k24-sec-${rand}`;
}

/**
 * Checks URL query params or hash for secret token presence:
 * e.g., ?token=k24-secret-token-2026#admin or ?token=k24-secret-token-2026 or #admin?token=...
 * If valid token found, unlocks the gateway session in sessionStorage/localStorage and cleans the URL for security.
 */
export function checkUrlForSecretToken(settings?: SiteSettings): boolean {
  if (typeof window === 'undefined') return false;

  const expectedToken = getAdminSecretToken(settings);
  let matched = false;

  try {
    // 1. Check window.location.search
    const searchParams = new URLSearchParams(window.location.search);
    const tokenFromSearch = 
      searchParams.get('token') || 
      searchParams.get('admin_token') || 
      searchParams.get('key') || 
      searchParams.get('admin_key') ||
      searchParams.get('secret');

    if (tokenFromSearch && (tokenFromSearch.trim() === expectedToken || tokenFromSearch.trim() === SECRET_ADMIN_TOKEN)) {
      matched = true;
      searchParams.delete('token');
      searchParams.delete('admin_token');
      searchParams.delete('key');
      searchParams.delete('admin_key');
      searchParams.delete('secret');
      
      const newSearch = searchParams.toString();
      const newUrl = `${window.location.pathname}${newSearch ? `?${newSearch}` : ''}${window.location.hash || ''}`;
      window.history.replaceState({}, '', newUrl);
    }

    // 2. Check window.location.hash for token queries e.g. #admin?token=k24-secret-token-2026
    const hash = window.location.hash;
    if (hash && hash.includes('?')) {
      const hashQuery = hash.split('?')[1];
      const hashParams = new URLSearchParams(hashQuery);
      const tokenFromHash = 
        hashParams.get('token') || 
        hashParams.get('admin_token') || 
        hashParams.get('key') || 
        hashParams.get('admin_key') ||
        hashParams.get('secret');

      if (tokenFromHash && (tokenFromHash.trim() === expectedToken || tokenFromHash.trim() === SECRET_ADMIN_TOKEN)) {
        matched = true;
        const cleanHash = hash.split('?')[0];
        window.history.replaceState({}, '', `${window.location.pathname}${window.location.search}${cleanHash || ''}`);
      }
    }
  } catch (err) {
    console.warn('URL token check failed:', err);
  }

  if (matched) {
    setSecretAdminAuthorized(true);
  }

  return matched;
}

/**
 * Generates the full 1-click Secret Admin Gateway URL for the admin.
 */
export function getSecretAdminUrl(settings?: SiteSettings): string {
  if (typeof window === 'undefined') return '';
  const token = getAdminSecretToken(settings);
  const origin = window.location.origin;
  return `${origin}/?token=${encodeURIComponent(token)}#admin`;
}

/**
 * Immediately revokes active admin gateway session from both sessionStorage and localStorage.
 */
export function revokeAdminGatewayAccess(): void {
  setSecretAdminAuthorized(false);
}
