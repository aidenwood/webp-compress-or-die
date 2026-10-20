import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';

function PrivacyPolicy() {
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

      {/* Privacy Policy Content */}
      <main className="app-page app-legal-content">
        <h1 className="text-3xl font-bold mb-6 text-gray-900 dark:text-white">Privacy & Data Policy</h1>
        <p className="text-sm mb-4">Effective Date: 12th February 2025</p>

        <p className="mb-4">
          At <strong>Tiny WebP</strong>, we respect your privacy. Here’s how we handle your data:
        </p>

        <h2 className="text-xl font-semibold mt-6 mb-2">1. Image Privacy</h2>
        <ul className="list-disc pl-6">
          <li><span role="img" aria-label="checkmark">✅</span> No uploads, no storage – Your images never leave your device.</li>
          <li><span role="img" aria-label="checkmark">✅</span> All compression happens in your browser – we do not collect or process your images on our servers.</li>
        </ul>

        <h2 className="text-xl font-semibold mt-6 mb-2">2. Analytics & Tracking</h2>
        <ul className="list-disc pl-6">
          <li>We use Google Analytics to collect anonymous usage data, including:</li>
          <ul className="list-disc pl-6">
            <li>Pages visited</li>
            <li>Browser type and device information</li>
            <li>General geographic location (based on IP)</li>
          </ul>
          <li><span role="img" aria-label="information">👉</span> We do NOT collect personal information like names, emails, or stored files.</li>
        </ul>

        <h2 className="text-xl font-semibold mt-6 mb-2">3. Hosting & Security</h2>
        <p>
          Tiny WebP is hosted on Cloudflare, which provides security, caching, and performance optimization. Cloudflare may collect standard website logs, including IP addresses, to prevent abuse and ensure service stability.
        </p>

        <h2 className="text-xl font-semibold mt-6 mb-2">4. Third-Party Services</h2>
        <p>
          We use Google Analytics and Cloudflare as third-party services. Their respective privacy policies apply:
        </p>
        <ul className="list-disc pl-6">
          <li><a href="https://policies.google.com/privacy" className="app-inline-link">Google Analytics Privacy Policy</a></li>
          <li><a href="https://www.cloudflare.com/privacypolicy/" className="app-inline-link">Cloudflare Privacy Policy</a></li>
        </ul>

        <h2 className="text-xl font-semibold mt-6 mb-2">5. Changes to This Policy</h2>
        <p>
          We may update this policy as needed. Continued use of Tiny WebP means you agree to the latest version.
        </p>

        <p className="mt-6">For any concerns, contact us at <a href="mailto:hello@tinywebp.app" className="app-inline-link">hello@tinywebp.app</a>.</p>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}

export default PrivacyPolicy;
