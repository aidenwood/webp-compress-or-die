/**
 * GENERATED FILE — DO NOT EDIT.
 *
 * Vendored from the @aidxn/chrome package. Edit the original at
 * aidxn-chrome/src/ and run `npm run sync` there; this copy is overwritten.
 * A hand-edit here is caught by `npm run chrome:check` and fails the build.
 */
/**
 * Where every small Aidxn app sends people next.
 *
 * ONE LIST, shared by every consumer's header dropdown (and footer, if the app
 * chooses to reuse it there) — this was always going to drift as hand-kept
 * per-app copies, and the footer is the one nobody re-reads.
 *
 * This is a funnel, not a sitemap. Somebody on a free tool is already building
 * something, so the order runs commercial-first: the paid component library
 * and the design service, then the other free tools that keep them in the
 * ecosystem. "Everything we make" alphabetised would bury the two entries that
 * pay for the rest.
 */

/**
 * The apex the SSO cookie is scoped to.
 *
 * Changing this changes which hosts share a session. It must stay the APEX —
 * `aidxn.com`, not a subdomain — or the cookie scopes to one host alone and
 * the whole point of this package is lost.
 */
export const AIDXN_APEX_HOST = 'aidxn.com';

export interface AidxnTool {
  name: string;
  href: string;
  description: string;
  /** Short tag shown beside the name — keep it to a word. */
  badge?: string;
}

export const AIDXN_TOOLS: AidxnTool[] = [
  {
    name: 'Velocity X Components',
    href: 'https://ui.aidxn.com/components/',
    description: '400+ React and Astro components you copy and own.',
    badge: 'Pro',
  },
  {
    name: 'Website Design',
    href: 'https://aidxn.com/',
    description: 'Design and build, done for you.',
  },
  {
    name: 'TradePilot',
    href: 'https://trade.aidxn.com/',
    description: 'Trade journalling and position research.',
  },
  {
    name: 'PS5 MIDI Bridge',
    href: 'https://midi.aidxn.com/',
    description: 'Turn a controller into a MIDI device.',
  },
  {
    name: 'Blog',
    href: 'https://blog.aidxn.com/',
    description: 'Build notes and short technical pieces.',
  },
];

/**
 * The account menu, shown once a session is found.
 *
 * Only real on a *.aidxn.com subdomain — the SSO cookie is scoped
 * `Domain=.aidxn.com`, so on any other host (a Netlify default domain, a
 * deploy preview, localhost) no session can reach it and "Sign in" is just a
 * link out. See the README's SSO constraint section before deploying an app
 * that uses this package off a *.aidxn.com host.
 */
export interface AccountLink {
  name: string;
  href: string;
}

export const ACCOUNT_LINKS: AccountLink[] = [
  { name: 'Dashboard', href: 'https://aidxn.com/dashboard/' },
  { name: 'Licenses', href: 'https://aidxn.com/dashboard/licenses/' },
  { name: 'Account', href: 'https://aidxn.com/dashboard/account/' },
];

export const SIGN_IN_URL = 'https://aidxn.com/login/';
