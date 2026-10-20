/**
 * GENERATED FILE — DO NOT EDIT.
 *
 * Vendored from the @aidxn/chrome package. Edit the original at
 * aidxn-chrome/src/ and run `npm run sync` there; this copy is overwritten.
 * A hand-edit here is caught by `npm run chrome:check` and fails the build.
 */
export { default as AidxnHeader } from './AidxnHeader';
export { useAidxnAccount } from './useAidxnAccount';
export type { AidxnAccount } from './useAidxnAccount';
export { getSupabase } from './supabaseChrome';
export { resolveSupabaseEnv } from './env';
export type { AidxnChromeEnv } from './env';
export { cookieAuthStorage, migrateLocalStorageSessionToCookie, AIDXN_AUTH_STORAGE_KEY } from './cookieAuthStorage';
export { AIDXN_TOOLS, ACCOUNT_LINKS, SIGN_IN_URL, AIDXN_APEX_HOST } from './aidxnLinks';
export type { AidxnTool, AccountLink } from './aidxnLinks';

// Styles are NOT re-exported from here — import them explicitly and once,
// globally, via `import '@aidxn/chrome/chrome.css'`. See the README.
