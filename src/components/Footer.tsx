import React from 'react';
import { Heart } from 'lucide-react';
import { Link } from 'react-router-dom';
import lkFlag from "../assets/lk.webp";

const Footer: React.FC = () => {
  return (
    <footer className="app-footer">
      <div className="footer-inner">
        <nav className="footer-links" aria-label="Footer">
          <Link to="/how-to-use">How to use</Link>
          <Link to="/terms-and-conditions">Terms</Link>
          <Link to="/privacy-policy">Privacy</Link>
          <a href="https://rapidapi.com/IsPra94/api/tinywebp" target="_blank" rel="noreferrer">API</a>
          <a href="https://tinywebp.instatus.com/" target="_blank" rel="noreferrer">Status</a>
          <a href="https://aidxn.com/" target="_blank" rel="noreferrer">Aidxn Design</a>
        </nav>
        <div className="footer-credit">
          <span>© {new Date().getFullYear()} TinyWebP · <a href="https://isuru.info" target="_blank" rel="noreferrer">Isuru Prabath</a></span>
          <span className="footer-made">
            Made with <Heart aria-hidden="true" fill="currentColor" /> in <img src={lkFlag} alt="Sri Lanka" />
          </span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
