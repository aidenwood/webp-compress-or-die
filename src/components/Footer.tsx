import React from 'react';
import { Link } from 'react-router-dom';
import { AIDXN_TOOLS } from '../lib/aidxnLinks';

/**
 * The Aidxn footer, carrying the other tools.
 *
 * Same job as the header dropdown — somebody who just compressed a folder of
 * images is mid-build, which is the moment the component library and the
 * design service are worth showing. Both read the one list in lib/aidxnLinks.
 *
 * ATTRIBUTION, DELIBERATELY KEPT
 * This project is a fork of TinyWebP by Isuru Prabath, MIT licensed. MIT
 * requires the copyright notice to survive, and LICENSE carries it — but a
 * credit line costs nothing and removing it while shipping the code would be
 * a poor way to treat the person whose work this started from. It moves to a
 * quieter line rather than disappearing.
 */
const Footer: React.FC = () => {
  return (
    <footer className="app-footer">
      <div className="footer-inner">
        <div className="footer-columns">
          <div className="footer-col">
            <p className="footer-col-title">More from Aidxn Design</p>
            <ul className="footer-tools">
              {AIDXN_TOOLS.map((tool) => (
                <li key={tool.href}>
                  <a href={tool.href} target="_blank" rel="noreferrer">
                    {tool.name}
                    {tool.badge && <span className="tools-badge">{tool.badge}</span>}
                  </a>
                  <span className="footer-tool-desc">{tool.description}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="footer-col">
            <p className="footer-col-title">This tool</p>
            <nav className="footer-links" aria-label="Footer">
              <Link to="/how-to-use">How to use</Link>
              <Link to="/terms-and-conditions">Terms</Link>
              <Link to="/privacy-policy">Privacy</Link>
              <a href="https://tinywebp.instatus.com/" target="_blank" rel="noreferrer">Status</a>
            </nav>
          </div>
        </div>

        <div className="footer-credit">
          <span>
            © {new Date().getFullYear()}{' '}
            <a href="https://aidxn.com/" target="_blank" rel="noreferrer">Aidxn Design</a>. Free to use.
          </span>
          <span className="footer-upstream">
            Built on{' '}
            <a href="https://isuru.info" target="_blank" rel="noreferrer">TinyWebP by Isuru Prabath</a>, MIT licensed.
          </span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
