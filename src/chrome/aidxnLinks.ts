/**
 * Where this free tool sends people next.
 *
 * ONE LIST, used by both the header dropdown and the footer. They were always
 * going to drift as two hand-kept copies, and the footer is the one nobody
 * re-reads.
 *
 * This is a funnel, not a sitemap. Somebody compressing images here is already
 * building something, so the order runs commercial-first: the paid component
 * library and the design service, then the other free tools that keep them in
 * the ecosystem. "Everything we make" alphabetised would bury the two entries
 * that pay for the rest.
 */

/**
 * The apex the SSO cookie is scoped to.
 *
 * In velocity-components this came from that repo's `lib/urls.ts`. Here it
 * lives with the rest of the chrome config so `src/chrome/` has no imports
 * outside itself and can be lifted into the shared package untouched.
 *
 * Changing this changes which hosts share a session. It must stay the APEX —
 * `aidxn.com`, not `webp.aidxn.com` — or the cookie scopes to this subdomain
 * alone and the whole point is lost.
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
 * This became real when the tool moved to webp.aidxn.com. The SSO cookie is
 * scoped `Domain=.aidxn.com`, so on the old webp-aidxn.netlify.app address no
 * session could reach it and "Sign in" could only ever be a link out. On the
 * subdomain, a sign-in anywhere on *.aidxn.com is already a sign-in here.
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
