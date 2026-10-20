import React from 'react';
import { ChevronDown, Moon, Sun } from 'lucide-react';
import { Link } from 'react-router-dom';
import { AIDXN_TOOLS, ACCOUNT_URL } from '../lib/aidxnLinks';

interface HeaderProps {
  theme: 'light' | 'dark';
  toggleTheme: () => void;
}

/** The Aidxn wireframe globe — the studio's actual mark.
 *
 *  Ported from velocity-components' VelocityHeader, not imported: separate
 *  repo, separate deploy. It is a dozen <circle>s and costs nothing, which
 *  matters on a page that sells image compression — the first attempt dropped
 *  in `ax-logo-white.svg` and that is a 1713x450 WORDMARK weighing 108KB,
 *  squashed into a 42px square. Wrong shape and wrong size, for a mark that
 *  renders free. */
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

/**
 * The brand lockup is the Aidxn mark alone.
 *
 * It was a cartoon mascot inherited from the upstream project this was forked
 * from, beside the wordmark "TinyWebP" — neither of which is this product. The
 * name now lives in the one <h1> in the middle of the page, so repeating it in
 * the corner was the same word twice above the fold.
 */
const Header: React.FC<HeaderProps> = ({ theme, toggleTheme }) => {
  const [toolsOpen, setToolsOpen] = React.useState(false);
  const toolsRef = React.useRef<HTMLDivElement>(null);

  // Close on outside click and on Escape. A dropdown that only closes by
  // clicking the trigger again is the one people complain about.
  React.useEffect(() => {
    if (!toolsOpen) return;
    const onDown = (e: MouseEvent) => {
      if (!toolsRef.current?.contains(e.target as Node)) setToolsOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setToolsOpen(false);
    };
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [toolsOpen]);

  return (
    <header className="app-header">
      <div className="header-inner">
        <Link to="/" className="brand-lockup" aria-label="Aidxn Design — home">
          <AidxnGlobe />
          <span className="brand-byline">AIDXN DESIGN TOOL</span>
        </Link>

        <div className="header-actions">
          <Link to="/how-to-use" className="header-nav-link">How it works</Link>

          <div className="tools-menu" ref={toolsRef}>
            <button
              type="button"
              className="header-nav-link tools-trigger"
              aria-expanded={toolsOpen}
              aria-haspopup="true"
              onClick={() => setToolsOpen((v) => !v)}
            >
              Tools <ChevronDown aria-hidden="true" />
            </button>

            {toolsOpen && (
              <div className="tools-panel" role="menu">
                {AIDXN_TOOLS.map((tool) => (
                  <a
                    key={tool.href}
                    href={tool.href}
                    className="tools-item"
                    role="menuitem"
                    target="_blank"
                    rel="noreferrer"
                  >
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

          <a href={ACCOUNT_URL} className="header-login" target="_blank" rel="noreferrer">
            Sign in
          </a>

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

export default Header;
