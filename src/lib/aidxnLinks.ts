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
 * Account sign-in.
 *
 * NOTE FOR WHOEVER MOVES THIS SITE: Aidxn's cross-subdomain SSO is a cookie
 * scoped to `Domain=.aidxn.com`. This site is served from
 * `webp-aidxn.netlify.app`, which is NOT under that domain, so a session
 * started on aidxn.com does not reach it and this link can only hand off to
 * the account area rather than reflect a signed-in state here.
 *
 * Putting the tool on `webp.aidxn.com` is what would make real SSO possible.
 * Until then this is deliberately a link out, not a login form that would
 * imply a session it cannot hold.
 */
export const ACCOUNT_URL = 'https://aidxn.com/dashboard/';
