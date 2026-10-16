import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { Ghost, ArrowLeftCircle } from 'lucide-react';

const NotFound: React.FC = () => {
  const [theme, setTheme] = useState<'light' | 'dark'>(
    localStorage.getItem('theme') as 'light' | 'dark' || 
    (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
  );

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  return (
    <div className="app-shell">
      <Header theme={theme} toggleTheme={toggleTheme} />
      
      <main className="app-page not-found-content">
        <Ghost aria-hidden="true" />
        <h1>404</h1>
        <p>That page isn’t here.</p>
        <Link to="/" className="button-primary">
          <ArrowLeftCircle aria-hidden="true" /> Back to TinyWebP
        </Link>
      </main>
      
      <Footer />
    </div>
  );
};

export default NotFound;
