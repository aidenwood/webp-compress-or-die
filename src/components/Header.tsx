import React from 'react';
import { Link } from 'react-router-dom';
import AidxnHeader from '../chrome/AidxnHeader';

interface HeaderProps {
  theme: 'light' | 'dark';
  toggleTheme: () => void;
}

/**
 * This app's header is the SHARED Aidxn header plus one app-specific link.
 *
 * Kept as a thin wrapper rather than swapping `<AidxnHeader>` into all five
 * pages that render a header: the call sites stay untouched, and when
 * src/chrome/ is promoted into the shared brand-chrome package this is the
 * only file in the app that needs to know.
 */
const Header: React.FC<HeaderProps> = ({ theme, toggleTheme }) => (
  <AidxnHeader appName="Image Compression" theme={theme} toggleTheme={toggleTheme}>
    <Link to="/how-to-use" className="header-nav-link">How it works</Link>
  </AidxnHeader>
);

export default Header;
