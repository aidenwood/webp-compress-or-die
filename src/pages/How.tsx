import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';

function How() {
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

      {/* How to Use Content */}
      <main className="app-page app-legal-content">
        <h1 className="text-3xl font-bold mb-6 text-gray-900 dark:text-white">How to Use Tiny WebP</h1>
        <p className="text-sm">Author: Isuru Prabath</p>
        <p className="text-sm mb-4">Updated on: 12th February 2025</p>

        <p className="mb-4">
          Welcome to Tiny WebP! This tool allows you to easily compress images directly from your browser.
          Here's how to use it:
        </p>

        <h2 className="text-xl font-semibold mt-6 mb-2">1. Upload Your Image</h2>
        <p>
          Drop your images into the section labeled <strong>"Drop your images here"</strong>, or simply click the <strong>"click to browse"</strong> link and select the image you'd like to compress. No registration or account is needed.
        </p>

        <h2 className="text-xl font-semibold mt-6 mb-2">2. Wait for Compression</h2>
        <p>
          Tiny WebP will automatically compress the image directly in your browser. This process does not upload your image to our servers.
        </p>

        <h2 className="text-xl font-semibold mt-6 mb-2">3. Download the Compressed Image</h2>
        <p>
          Once the compression is complete, you can easily download the compressed image directly to your device.
        </p>

        <h2 className="text-xl font-semibold mt-6 mb-2">4. Watch the Tutorial Video</h2>
        <p>
          If you prefer visual instructions, check out the tutorial video below:
        </p>

        {/* Embedding YouTube video */}
        <div className="my-8 aspect-video">
          <iframe
            className="w-full h-full"
            src="https://www.youtube.com/embed/JBz-vB2-Ykg" // Replace with your YouTube video ID
            title="Tiny WebP - Convert Images to WebP"
            frameBorder="0"
            allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          ></iframe>
        </div>

        <h2 className="text-xl font-semibold mt-6 mb-2">5. Additional Information</h2>
        <p>
          If you have any questions or need further assistance, feel free to reach out to us via email at <a href="mailto:hi@aidxn.com" className="app-inline-link">hi@aidxn.com</a>.
        </p>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}

export default How;
