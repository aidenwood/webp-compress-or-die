/**
 * Signed-in state for the header's account corner.
 *
 * Deliberately tiny and deliberately forgiving: this runs on a free tool that
 * works perfectly well signed out, so every failure path resolves to "signed
 * out" rather than surfacing an error. The one thing it must never do is show
 * a signed-in state it cannot back up.
 */
import { useEffect, useState } from 'react';
import { getSupabase } from './supabaseChrome';

export interface AidxnAccount {
  email: string | null;
  loading: boolean;
  signedIn: boolean;
  signOut: () => Promise<void>;
}

export function useAidxnAccount(): AidxnAccount {
  const [email, setEmail] = useState<string | null>(null);
  // Starts true so the corner renders nothing rather than flashing "Sign in"
  // at somebody who IS signed in — the cookie read is fast but not free.
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = getSupabase();
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
