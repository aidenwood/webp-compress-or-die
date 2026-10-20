/**
 * GENERATED FILE — DO NOT EDIT.
 *
 * Vendored from the @aidxn/chrome package. Edit the original at
 * aidxn-chrome/src/ and run `npm run sync` there; this copy is overwritten.
 * A hand-edit here is caught by `npm run chrome:check` and fails the build.
 */
/**
 * The Supabase client behind the header's account corner.
 *
 * Same shared Supabase project aidxn.com uses, and — critically — the SAME
 * `storageKey` and the SAME cookie adapter as every other *.aidxn.com surface.
 * That pairing is the entire reason a sign-in on aidxn.com is already a
 * sign-in in whichever small app imports this. Change either and that app
 * silently stops seeing the session while still building and still rendering
 * a "Sign in" button — which looks like a working logged-out state rather
 * than a break. See cookieAuthStorage.ts for the full warning.
 *
 * ENV VARS: see env.ts. This reads `VITE_SUPABASE_URL`/`VITE_SUPABASE_ANON_KEY`
 * (Vite apps) or `PUBLIC_SUPABASE_URL`/`PUBLIC_SUPABASE_ANON_KEY` (Astro apps)
 * automatically — no per-app patching required. Pass `overrides` to
 * `getSupabase()` on the FIRST call of the app's lifetime if you need to
 * supply the values some other way; later calls reuse the memoized client and
 * ignore overrides, same as every other singleton client in this codebase.
 *
 * THIS PACKAGE ONLY WORKS ON A *.aidxn.com SUBDOMAIN. The cookie is
 * `Domain=.aidxn.com` — on a bare Netlify domain or any other host, no session
 * can reach it, "Sign in" becomes a dead-end link, and the account corner
 * never shows a signed-in state. See the package README before deploying.
 */
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { cookieAuthStorage, migrateLocalStorageSessionToCookie, AIDXN_AUTH_STORAGE_KEY } from './cookieAuthStorage';
import { resolveSupabaseEnv, type AidxnChromeEnv } from './env';

let _supabase: SupabaseClient | null = null;

/**
 * A client that answers "signed out" to everything and never throws.
 *
 * Without env vars the header still has to render. Throwing here would take
 * the whole page down over a login button on a tool that works perfectly well
 * signed out.
 */
function makeStubClient(): SupabaseClient {
  const noSession = async () => ({ data: { session: null }, error: null });
  return {
    auth: {
      getSession: noSession,
      getUser: async () => ({ data: { user: null }, error: null }),
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe() {} } } }),
      signOut: async () => ({ error: null }),
    },
  } as unknown as SupabaseClient;
}

export function getSupabase(overrides?: AidxnChromeEnv): SupabaseClient {
  if (_supabase) return _supabase;

  const { url, anonKey } = resolveSupabaseEnv(overrides);

  if (!url || !anonKey) {
    console.warn(
      '[@aidxn/chrome] No Supabase URL/anon key found (checked VITE_SUPABASE_URL / PUBLIC_SUPABASE_URL and ' +
        'VITE_SUPABASE_ANON_KEY / PUBLIC_SUPABASE_ANON_KEY, and no overrides were passed) — the account corner ' +
        'renders signed-out only.',
    );
    _supabase = makeStubClient();
    return _supabase;
  }

  // One-time move of any existing localStorage session into the cookie, so
  // somebody already signed in here does not get logged out by the switch.
  migrateLocalStorageSessionToCookie(AIDXN_AUTH_STORAGE_KEY);

  _supabase = createClient(url, anonKey, {
    auth: {
      // navigator.locks disabled — two components calling getSession() in
      // parallel can otherwise deadlock with no error and no timeout. Same fix
      // as every other *.aidxn.com client carries. Generic on R (not the
      // ported originals' `unknown`) to satisfy Supabase JS's `LockFunc` type
      // under `tsc --noEmit` — the other copies of this file were never run
      // through a type-check build step, so this mismatch was latent there.
      lock: async <R,>(_name: string, _timeout: number, fn: () => Promise<R>): Promise<R> => fn(),
      storage: cookieAuthStorage,
      storageKey: AIDXN_AUTH_STORAGE_KEY,
    },
  });
  return _supabase;
}
