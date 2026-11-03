import { useState, useEffect } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import seoContent from '../data/seo-content.json';

/**
 * /how-to-use
 *
 * The numbered steps render from src/data/seo-content.json, which is the SAME
 * file scripts/seo-build.mjs uses to emit the HowTo JSON-LD for this page.
 * Google requires structured data to describe content the user can actually
 * see — when this page listed upstream's steps while the schema described a
 * different four, that was a guidelines violation, not a cosmetic mismatch.
 * Edit the JSON; never hand-write steps here.
 */
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
      <Header theme={theme} toggleTheme={toggleTheme} />

      <main className="app-page app-legal-content">
        <h1 className="text-3xl font-bold mb-6 text-gray-900 dark:text-white">
          How to compress images to WebP
        </h1>

        <p className="mb-4">
          This converter runs entirely inside your browser. Your images are never
          uploaded, so the whole thing works on a flaky connection and leaves
          nothing on a server afterwards. Four steps:
        </p>

        {seoContent.howToSteps.map((step, i) => (
          <section key={step.name} id={`step-${i + 1}`}>
            <h2 className="text-xl font-semibold mt-6 mb-2">
              {i + 1}. {step.name}
            </h2>
            <p>{step.text}</p>
          </section>
        ))}

        <h2 className="text-xl font-semibold mt-6 mb-2">Why WebP?</h2>
        <p>
          WebP usually lands 25–35% smaller than a JPEG of comparable quality,
          and far smaller than PNG for photographs — while still supporting
          transparency, which JPEG does not. Every current browser displays it,
          including Safari since version 14. For most sites it is simply the
          better default, and smaller images mean faster pages.
        </p>

        <h2 className="text-xl font-semibold mt-6 mb-2">Video walkthrough</h2>
        <p>
          A walkthrough from{' '}
          <a
            href="https://isuru.info"
            target="_blank"
            rel="noreferrer"
            className="app-inline-link"
          >
            TinyWebP
          </a>
          , the upstream project this tool is forked from. The interface differs
          from the one here, but the workflow is the same.
        </p>

        <div className="my-8 aspect-video">
          <iframe
            className="w-full h-full"
            src="https://www.youtube-nocookie.com/embed/JBz-vB2-Ykg"
            title="Converting images to WebP — walkthrough"
            loading="lazy"
            frameBorder="0"
            allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          ></iframe>
        </div>

        <h2 className="text-xl font-semibold mt-6 mb-2">Need a hand?</h2>
        <p>
          Questions, or something not working the way you expect? Email{' '}
          <a href="mailto:hi@aidxn.com" className="app-inline-link">hi@aidxn.com</a>.
        </p>
      </main>

      <Footer />
    </div>
  );
}

export default How;
