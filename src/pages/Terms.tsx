import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';

function Terms() {
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
      {/* Header with Theme Toggle */}
      <Header theme={theme} toggleTheme={toggleTheme} />

      {/* Terms and Conditions Content */}
      <main className="app-page app-legal-content">
        <h1 className="text-3xl font-bold mb-6 text-gray-900 dark:text-white">Terms and Conditions</h1>
        <p className="text-sm mb-4">Effective Date: 12th February 2025</p>

        <p className="mb-4">
          Welcome to <strong>TinyWebP</strong> (webp.aidxn.com). By accessing and using this website, you agree to the following terms and conditions. If you do not agree, please discontinue use immediately.
        </p>

        <h2 className="text-xl font-semibold mt-6 mb-2">1. Use of the Service</h2>
        <ul className="list-disc pl-6">
          <li>TinyWebP is a free web-based tool for compressing images.</li>
          <li>No account or registration is required to use the service.</li>
          <li>You are responsible for ensuring that you have the right to use and process any images uploaded.</li>
          <li>The service is provided "as is" with no guarantees of uptime or availability.</li>
        </ul>

        <h2 className="text-xl font-semibold mt-6 mb-2">2. Image Processing & Privacy</h2>
        <ul className="list-disc pl-6">
          <li>All image processing happens on your device (client-side).</li>
          <li>TinyWebP does not upload, store, or collect any images you process.</li>
          <li>We do not claim ownership of any images you use with our tool.</li>
        </ul>

        <h2 className="text-xl font-semibold mt-6 mb-2">3. Limitations and Liability</h2>
        <ul className="list-disc pl-6">
          <li>We are not responsible for any loss, damage, or issues resulting from the use of this service.</li>
          <li>TinyWebP is provided as a free tool with no warranties. Use at your own risk.</li>
        </ul>

        <h2 className="text-xl font-semibold mt-6 mb-2">4. Changes to Terms</h2>
        <p>We may update these terms from time to time. Continued use of TinyWebP means you accept any modifications.</p>

        <p className="mt-6">For questions, contact us at <a href="mailto:hello@tinywebp.app" className="app-inline-link">hello@tinywebp.app</a>.</p>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}

export default Terms;
