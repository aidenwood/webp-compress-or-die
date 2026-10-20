/**
 * GENERATED FILE — DO NOT EDIT.
 *
 * Vendored from the @aidxn/chrome package. Edit the original at
 * aidxn-chrome/src/ and run `npm run sync` there; this copy is overwritten.
 * A hand-edit here is caught by `npm run chrome:check` and fails the build.
 */
/**
 * The shared Aidxn header.
 *
 * WHAT THIS IS FOR
 * Every small Aidxn app was going to grow its own header, and they would have
 * drifted within a month — different nav, different account behaviour,
 * different idea of the brand. This package exists so that doesn't happen:
 * nothing in here imports anything app-specific, and the only per-app input is
 * the `appName` prop, `children` for app-specific nav, and (optionally)
 * `supabaseEnv` if an app can't supply `VITE_*`/`PUBLIC_*` env vars directly.
 *
 * THE DESIGN IS AIDXN.COM'S
 * Full width at the top of the page, collapsing into a floating rounded pill
 * on scroll — the behaviour ported from velocity-x-stock's
 * `Header-Minimal.astro` (read-only reference; that repo is live and not ours
 * to edit, so this is a port, not an import). Same 28px trigger, same
 * cubic-bezier, same reversion to full-width on mobile where a floating pill
 * just steals width.
 *
 * ACCOUNT
 * Real SSO, not a link. The session comes from the `Domain=.aidxn.com` cookie
 * every *.aidxn.com surface shares, so signing in on aidxn.com means this
 * header already knows who you are. See supabaseChrome.ts for why the
 * storageKey must not be touched.
 *
 * STYLES
 * This component only emits classNames — it ships no inline colours or fonts
 * (house rule: no component-level font-family, no colour overrides). The
 * accompanying `chrome.css` (import it once, see the README) styles every
 * class this component renders, and itself defers all colour/surface values
 * to CSS custom properties the HOST APP must define: `--app-bg`, `--app-text`,
 * `--app-muted`, `--app-subtle`, `--app-line`, `--app-surface`, `--app-accent`,
 * `--app-accent-strong`. That's what lets the identical header reskin itself
 * per app without this package ever choosing a palette.
 */
import React from 'react';
import { ChevronDown, LogOut, Moon, Sun } from 'lucide-react';
import { ACCOUNT_LINKS, AIDXN_TOOLS, SIGN_IN_URL } from './aidxnLinks';
import { useAidxnAccount } from './useAidxnAccount';
import type { AidxnChromeEnv } from './env';

/** The Aidxn wireframe globe — the studio's mark. A dozen circles, no asset. */
const AidxnGlobe: React.FC = () => (
  <span className="brand-lockup-globe" aria-hidden="true">
    <svg viewBox="-500 -500 1000 1000">
      <circle r="450" />
      <circle className="bg-equator" r="450" />
      {[165, 150, 135, 120, 105, 90, 75, 60, 45, 30, 15, 0].map((start) => (
        <circle
          key={start}
          className="bg-meridian"
          r="450"
          style={{ '--start': `${start}deg`, '--end': `${start + 15}deg` } as React.CSSProperties}
        />
      ))}
    </svg>
  </span>
);

/** One dropdown behaviour for both menus, so they cannot diverge. */
function useDismissable(open: boolean, close: () => void) {
  const ref = React.useRef<HTMLDivElement>(null);
  React.useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) close();
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
    };
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open, close]);
  return ref;
}

interface Props {
  /** Shown beside the mark, e.g. "Image Compression". */
  appName: string;
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  /** App-specific nav, rendered before the shared menus. */
  children?: React.ReactNode;
  /**
   * Only needed if the host app can't expose `VITE_SUPABASE_URL`/
   * `PUBLIC_SUPABASE_URL` (+ anon key) as build-time env vars. See env.ts.
   */
  supabaseEnv?: AidxnChromeEnv;
}

const AidxnHeader: React.FC<Props> = ({ appName, theme, toggleTheme, children, supabaseEnv }) => {
  const [scrolled, setScrolled] = React.useState(false);
  const [toolsOpen, setToolsOpen] = React.useState(false);
  const [acctOpen, setAcctOpen] = React.useState(false);
  const account = useAidxnAccount(supabaseEnv);

  const toolsRef = useDismissable(toolsOpen, () => setToolsOpen(false));
  const acctRef = useDismissable(acctOpen, () => setAcctOpen(false));

  React.useEffect(() => {
    // 28px, matching aidxn.com — low enough that the pill forms as soon as
    // the page moves, high enough that a trackpad twitch does not flicker it.
    const onScroll = () => setScrolled(window.scrollY > 28);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header className={`ax-header${scrolled ? ' is-scrolled' : ''}`}>
      <div className="ax-header-inner">
        <a href="/" className="brand-lockup" aria-label="Aidxn Design — home">
          <AidxnGlobe />
          <span className="brand-stack">
            <span className="brand-app">{appName}</span>
            <span className="brand-byline">AIDXN DESIGN</span>
          </span>
        </a>

        <div className="header-actions">
          {children}

          <div className="tools-menu" ref={toolsRef}>
            <button
              type="button"
              className="header-nav-link tools-trigger"
              aria-expanded={toolsOpen}
              aria-haspopup="true"
              onClick={() => { setToolsOpen((v) => !v); setAcctOpen(false); }}
            >
              Apps <ChevronDown aria-hidden="true" />
            </button>
            {toolsOpen && (
              <div className="tools-panel" role="menu">
                {AIDXN_TOOLS.map((tool) => (
                  <a key={tool.href} href={tool.href} className="tools-item" role="menuitem">
                    <span className="tools-item-name">
                      {tool.name}
                      {tool.badge && <span className="tools-badge">{tool.badge}</span>}
                    </span>
                    <span className="tools-item-desc">{tool.description}</span>
                  </a>
                ))}
              </div>
            )}
          </div>

          {/* Nothing renders while the session is still being read — a flash of
              "Sign in" at somebody who is signed in reads as being logged out. */}
          {!account.loading && (
            account.signedIn ? (
              <div className="tools-menu" ref={acctRef}>
                <button
                  type="button"
                  className="header-login account-trigger"
                  aria-expanded={acctOpen}
                  aria-haspopup="true"
                  onClick={() => { setAcctOpen((v) => !v); setToolsOpen(false); }}
                >
                  <span className="account-avatar" aria-hidden="true">
                    {(account.email ?? '?').charAt(0).toUpperCase()}
                  </span>
                  <ChevronDown aria-hidden="true" />
                </button>
                {acctOpen && (
                  <div className="tools-panel account-panel" role="menu">
                    <p className="account-email" title={account.email ?? ''}>{account.email}</p>
                    {ACCOUNT_LINKS.map((link) => (
                      <a key={link.href} href={link.href} className="tools-item" role="menuitem">
                        <span className="tools-item-name">{link.name}</span>
                      </a>
                    ))}
                    <button type="button" className="tools-item account-signout" onClick={account.signOut}>
                      <span className="tools-item-name">
                        <LogOut aria-hidden="true" /> Sign out
                      </span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <a href={SIGN_IN_URL} className="header-login">Sign in</a>
            )
          )}

          <button
            onClick={toggleTheme}
            className="theme-toggle"
            aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
            title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
          >
            {theme === 'light' ? <Moon aria-hidden="true" /> : <Sun aria-hidden="true" />}
          </button>
        </div>
      </div>
    </header>
  );
};

export default AidxnHeader;
