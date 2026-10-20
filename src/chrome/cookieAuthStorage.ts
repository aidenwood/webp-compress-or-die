/**
 * Cross-subdomain Supabase auth storage adapter.
 *
 * Supabase JS persists sessions to localStorage by default, which is
 * origin-scoped — a session on aidxn.com is invisible on ui.aidxn.com,
 * midi.aidxn.com, etc, even though they're all under the same registrable
 * domain and (as of 2026-10-16) the same Supabase project
 * (ugiuphqzwyevycsuwaen). This adapter persists the session to a
 * `Domain=.aidxn.com` cookie instead, so one sign-in on any *.aidxn.com
 * surface is visible on all of them.
 *
 * CANONICAL: this file is duplicated byte-for-byte in velocity-x-stock
 * (src/lib/cookieAuthStorage.ts) because the two repos don't share a
 * package. Keep them in sync — same chunking, same cookie shape, same
 * fallback logic. If you change one, change the other. velocity-docs gets a
 * synced copy via `npm run sync:brand-chrome` same as supabaseChrome.ts —
 * don't hand-edit it there.
 *
 * Session JSON frequently exceeds the ~4KB per-cookie limit (access token +
 * refresh token + user object). A silently truncated cookie produces
 * intermittent "randomly logged out" bugs that are very hard to trace, so
 * this chunks on write and reassembles on read, and cleans up orphaned
 * chunks when a new value needs fewer chunks than the old one did.
 *
 * `.aidxn.com` is not a valid cookie Domain on localhost (browsers reject
 * cross-label domains on bare hostnames) — detected and skipped there, which
 * degrades to an ordinary host-only cookie so local/preview sign-in still
 * works, it just doesn't cross subdomains.
 */
import { AIDXN_APEX_HOST } from './aidxnLinks';

// Keep payload chunks comfortably under the ~4096-byte per-cookie ceiling
// once the cookie name + attributes (Domain=.aidxn.com; Path=/; Max-Age=...;
// SameSite=Lax; Secure) are counted.
const CHUNK_SIZE = 3300;
const DAYS_TO_LIVE = 365;

// From the chrome's own config, not hardcoded here — one definition of which
// apex a session is shared across.
const APEX_HOST = AIDXN_APEX_HOST; // "aidxn.com"
const COOKIE_DOMAIN = `.${APEX_HOST}`; // ".aidxn.com"

function isBrowser(): boolean {
  return typeof window !== 'undefined' && typeof document !== 'undefined';
}

function getCookieDomain(): string | undefined {
  if (!isBrowser()) return undefined;
  const host = window.location.hostname;
  if (host === APEX_HOST || host.endsWith(`.${APEX_HOST}`)) return COOKIE_DOMAIN;
  // localhost, 127.0.0.1, netlify deploy-preview subdomains, etc — no shared
  // registrable domain to scope a cookie to. Fall back to a host-only cookie.
  return undefined;
}

function isSecureContext(): boolean {
  if (!isBrowser()) return false;
  // Only the actual HTTPS scheme, never a hostname special-case. Verified
  // empirically 2026-10-16: Chrome silently drops a `Secure` cookie set from
  // JS on http://localhost — it looks written (reads back fine within the
  // same tick) but is gone on the very next read, with no error anywhere.
  // That's exactly the "randomly logged out" failure mode this file exists
  // to avoid, so local dev never sets Secure.
  return window.location.protocol === 'https:';
}

function cookieAttrs(maxAgeSeconds: number): string {
  const domain = getCookieDomain();
  const secure = isSecureContext();
  let attrs = `Path=/; Max-Age=${maxAgeSeconds}; SameSite=Lax`;
  if (domain) attrs += `; Domain=${domain}`;
  if (secure) attrs += '; Secure';
  return attrs;
}

function readAllCookies(): Record<string, string> {
  if (!isBrowser() || !document.cookie) return {};
  const out: Record<string, string> = {};
  for (const pair of document.cookie.split('; ')) {
    const idx = pair.indexOf('=');
    if (idx === -1) continue;
    const name = pair.slice(0, idx);
    const value = pair.slice(idx + 1);
    out[name] = value; // already percent-encoded by us on write
  }
  return out;
}

function writeCookie(name: string, encodedValue: string): void {
  if (!isBrowser()) return;
  document.cookie = `${name}=${encodedValue}; ${cookieAttrs(DAYS_TO_LIVE * 24 * 60 * 60)}`;
}

function deleteCookie(name: string): void {
  if (!isBrowser()) return;
  document.cookie = `${name}=; ${cookieAttrs(0)}`;
}

function metaKey(key: string): string {
  return `${key}.n`;
}

function chunkKey(key: string, index: number): string {
  return `${key}.${index}`;
}

/** Supabase JS `SupportedStorage` interface, backed by chunked cookies. */
export const cookieAuthStorage = {
  getItem(key: string): string | null {
    if (!isBrowser()) return null;
    const cookies = readAllCookies();

    const countRaw = cookies[metaKey(key)];
    if (countRaw === undefined) return null;
    const count = parseInt(countRaw, 10);
    if (!Number.isFinite(count) || count <= 0) return null;

    let encoded = '';
    for (let i = 0; i < count; i++) {
      const part = cookies[chunkKey(key, i)];
      if (part === undefined) return null; // missing chunk — treat as corrupt, force re-auth
      encoded += part;
    }

    try {
      return decodeURIComponent(encoded);
    } catch {
      return null; // corrupt payload — never throw out of storage interface
    }
  },

  setItem(key: string, value: string): void {
    if (!isBrowser()) return;

    const cookies = readAllCookies();
    const prevCountRaw = cookies[metaKey(key)];
    const prevCount = prevCountRaw !== undefined ? parseInt(prevCountRaw, 10) : 0;

    const encoded = encodeURIComponent(value);
    const chunks: string[] = [];
    for (let i = 0; i < encoded.length; i += CHUNK_SIZE) {
      chunks.push(encoded.slice(i, i + CHUNK_SIZE));
    }
    // encodeURIComponent of an empty string is still '', which would produce
    // zero chunks — guard so setItem('', '') round-trips as one empty chunk.
    if (chunks.length === 0) chunks.push('');

    chunks.forEach((chunk, i) => writeCookie(chunkKey(key, i), chunk));
    writeCookie(metaKey(key), String(chunks.length));

    // Clean up orphaned chunks from a previous, larger value.
    if (Number.isFinite(prevCount)) {
      for (let i = chunks.length; i < prevCount; i++) {
        deleteCookie(chunkKey(key, i));
      }
    }
  },

  removeItem(key: string): void {
    if (!isBrowser()) return;
    const cookies = readAllCookies();
    const countRaw = cookies[metaKey(key)];
    const count = countRaw !== undefined ? parseInt(countRaw, 10) : 0;
    for (let i = 0; i < (Number.isFinite(count) ? count : 0); i++) {
      deleteCookie(chunkKey(key, i));
    }
    deleteCookie(metaKey(key));
  },
};

/**
 * One-time migration: this ships the day sessions move from localStorage to
 * cookies, which logs every currently-signed-in user out exactly once. Read
 * an existing localStorage session under `storageKey` (if any), re-persist
 * it to the cookie adapter, then clear the localStorage copy so it can't
 * drift out of sync with the cookie going forward. Safe to call on every
 * load — it's a no-op once the localStorage key is gone.
 */
export function migrateLocalStorageSessionToCookie(storageKey: string): void {
  if (!isBrowser()) return;
  try {
    const existing = window.localStorage.getItem(storageKey);
    if (existing === null) return;
    // Don't clobber a cookie session that's already there (e.g. the user
    // signed in on another *.aidxn.com surface since this tab last loaded).
    if (cookieAuthStorage.getItem(storageKey) === null) {
      cookieAuthStorage.setItem(storageKey, existing);
    }
    window.localStorage.removeItem(storageKey);
  } catch {
    // Storage can throw in locked-down browser contexts (private mode,
    // disabled storage). Never let a migration attempt break auth init.
  }
}

/**
 * Shared storage key across every *.aidxn.com surface. This is deliberately
 * the same value Supabase JS would derive by default for this project ref
 * (`sb-<ref>-auth-token`) — pinned explicitly so a future project-ref change
 * can't silently desync the two repos.
 */
export const AIDXN_AUTH_STORAGE_KEY = 'sb-ugiuphqzwyevycsuwaen-auth-token';
