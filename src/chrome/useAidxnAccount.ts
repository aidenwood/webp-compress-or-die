/**
 * GENERATED FILE — DO NOT EDIT.
 *
 * Vendored from the @aidxn/chrome package. Edit the original at
 * aidxn-chrome/src/ and run `npm run sync` there; this copy is overwritten.
 * A hand-edit here is caught by `npm run chrome:check` and fails the build.
 */
/**
 * Signed-in state for the header's account corner.
 *
 * Deliberately tiny and deliberately forgiving: this is meant to run on free
 * tools that work perfectly well signed out, so every failure path resolves
 * to "signed out" rather than surfacing an error. The one thing it must never
 * do is show a signed-in state it cannot back up.
 */
import { useEffect, useState } from 'react';
import { getSupabase } from './supabaseChrome';
import type { AidxnChromeEnv } from './env';

export interface AidxnAccount {
  email: string | null;
  loading: boolean;
  signedIn: boolean;
  signOut: () => Promise<void>;
}

/**
 * @param overrides Only consulted on the very first call across the app's
 * lifetime (same memoization as `getSupabase`) — pass the same value every
 * time you call this hook if you pass one at all.
 */
export function useAidxnAccount(overrides?: AidxnChromeEnv): AidxnAccount {
  const [email, setEmail] = useState<string | null>(null);
  // Starts true so the corner renders nothing rather than flashing "Sign in"
  // at somebody who IS signed in — the cookie read is fast but not free.
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = getSupabase(overrides);
    let alive = true;

    supabase.auth
      .getSession()
      .then(({ data }) => {
        if (!alive) return;
        setEmail(data.session?.user?.email ?? null);
        setLoading(false);
      })
      .catch(() => {
        if (!alive) return;
        setEmail(null);
        setLoading(false);
      });

    // Keeps the corner honest if the session is refreshed or dropped in
    // another tab — including a sign-out on a different *.aidxn.com subdomain,
    // since they share the cookie.
    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!alive) return;
      setEmail(session?.user?.email ?? null);
      setLoading(false);
    });

    return () => {
      alive = false;
      data?.subscription?.unsubscribe();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    email,
    loading,
    signedIn: Boolean(email),
    async signOut() {
      try {
        await getSupabase().auth.signOut();
      } finally {
        // Clearing the shared cookie signs you out of every *.aidxn.com
        // surface, which is the behaviour people expect from one account.
        setEmail(null);
      }
    },
  };
}
