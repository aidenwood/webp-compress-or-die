/**
 * The Supabase client behind the header's account corner.
 *
 * Ported from velocity-components' `src/components/brand/supabaseChrome.ts`.
 * Same shared Supabase project aidxn.com uses, and — critically — the SAME
 * `storageKey` and the SAME cookie adapter. That pairing is the entire reason a
 * sign-in on aidxn.com is already a sign-in here. Change either and this site
 * silently stops seeing the session while still building and still rendering a
 * "Sign in" button, which looks like a working logged-out state rather than a
 * break.
 *
 * ONLY DIFFERENCE FROM THE ASTRO ORIGINAL: the env var names. Astro exposes
 * `PUBLIC_*`; Vite exposes `VITE_*`. The values are identical — set on the
 * webp-aidxn Netlify project.
 *
 * THIS SITE MUST STAY ON *.aidxn.com. The cookie is `Domain=.aidxn.com`, so on
 * webp-aidxn.netlify.app (where this lived until today) no session can reach
 * it. It is served from webp.aidxn.com now, which is what makes this real.
 */
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { cookieAuthStorage, migrateLocalStorageSessionToCookie, AIDXN_AUTH_STORAGE_KEY } from './cookieAuthStorage';

let _supabase: SupabaseClient | null = null;

/**
 * A client that answers "signed out" to everything and never throws.
 *
 * Without env vars the header still has to render. Throwing here would take
 * the whole page down over a login button on an image tool that works
 * perfectly well signed out.
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

export function getSupabase(): SupabaseClient {
  if (_supabase) return _supabase;

  const url = import.meta.env.VITE_SUPABASE_URL;
  const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    console.warn(
      '[chrome] VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY not set — the account corner renders signed-out only.',
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
      // as velocity-x-stock and velocity-components carry.
      lock: async (_name: string, _timeout: number, fn: () => Promise<unknown>) => fn(),
      storage: cookieAuthStorage,
      storageKey: AIDXN_AUTH_STORAGE_KEY,
    },
  });
  return _supabase;
}
