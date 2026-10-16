import React from 'react';
import { Moon, Sun } from 'lucide-react';
import { Link } from 'react-router-dom';
import tinyWebPLogo from "../assets/tinywebp_logo.webp";

interface HeaderProps {
  theme: 'light' | 'dark';
  toggleTheme: () => void;
}

const Header: React.FC<HeaderProps> = ({ theme, toggleTheme }) => {
  return (
    <header className="app-header">
      <div className="header-inner">
        <Link to="/" className="brand-lockup">
          <span className="brand-mark">
            <img src={tinyWebPLogo} alt="" />
          </span>
          <span>
            <span className="brand-name">TinyWebP</span>
            <span className="brand-byline">AIDXN DESIGN TOOL</span>
          </span>
        </Link>
        <div className="header-actions">
          <Link to="/how-to-use" className="header-nav-link">How it works</Link>
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
