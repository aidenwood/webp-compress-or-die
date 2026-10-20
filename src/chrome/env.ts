/**
 * GENERATED FILE — DO NOT EDIT.
 *
 * Vendored from the @aidxn/chrome package. Edit the original at
 * aidxn-chrome/src/ and run `npm run sync` there; this copy is overwritten.
 * A hand-edit here is caught by `npm run chrome:check` and fails the build.
 */
/**
 * The env-var split, solved once.
 *
 * Vite exposes build-time env as `import.meta.env.VITE_*`. Astro exposes it as
 * `import.meta.env.PUBLIC_*`. Both are Vite under the hood, so `import.meta.env`
 * exists in either host — only the prefix differs, and it differs because each
 * tool chose a different convention to prevent server secrets leaking into
 * client bundles, not because the values themselves are different.
 *
 * Rather than making every consuming app patch this package (or patch its own
 * env file to satisfy the package), this reads BOTH prefixes at call time and
 * takes whichever is set. An explicit `overrides` argument always wins, for the
 * rare app that computes the value some other way (server-injected config,
 * a non-standard env var name, etc).
 *
 * This also means the package works unmodified if a future consumer embeds
 * `AidxnHeader` as a React island inside an Astro page (Astro supports React
 * islands natively) — same component, same auto-detection, no fork.
 */

export interface AidxnChromeEnv {
  supabaseUrl?: string;
  supabaseAnonKey?: string;
}

function readEnvVar(names: string[]): string | undefined {
  // `import.meta.env` is injected by Vite's define/replace step at build time.
  // Guarded with optional chaining + a cast because TypeScript's lib types for
  // `ImportMeta` don't know about `.env` unless the consumer's own
  // vite-env.d.ts declares it — this package must not require that.
  const env = (import.meta as unknown as { env?: Record<string, string | undefined> }).env ?? {};
  for (const name of names) {
    const value = env[name];
    if (typeof value === 'string' && value.length > 0) return value;
  }
  return undefined;
}

export function resolveSupabaseEnv(overrides?: AidxnChromeEnv): { url?: string; anonKey?: string } {
  return {
    url: overrides?.supabaseUrl ?? readEnvVar(['VITE_SUPABASE_URL', 'PUBLIC_SUPABASE_URL']),
    anonKey: overrides?.supabaseAnonKey ?? readEnvVar(['VITE_SUPABASE_ANON_KEY', 'PUBLIC_SUPABASE_ANON_KEY']),
  };
}
