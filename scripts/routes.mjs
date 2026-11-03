/**
 * routes.mjs — the single source of truth for every indexable URL.
 *
 * Per-route meta, JSON-LD and sitemap.xml are ALL generated from this file.
 * They used to be three separate hand-maintained things, which is how the
 * sitemap ended up advertising https://tinywebp.app/ (the upstream project)
 * and publishing zero URLs for this domain. One list, no drift.
 *
 * Titles lead with what people actually search for. "Tiny WebP Image
 * Compression Tool by AIDXN DESIGN" spends the most valuable pixels in the
 * SERP on a brand nobody is searching for yet.
 */

import { createRequire } from 'node:module';

// Shared with the React pages. Google requires FAQ/HowTo structured data to
// describe copy the user can actually SEE, so the schema and the rendered
// section must come from one file or they will drift into a violation.
const shared = createRequire(import.meta.url)('../src/data/seo-content.json');

export const SITE = 'https://webp.aidxn.com';
export const BRAND = 'Aidxn Design';
export const OG_IMAGE = `${SITE}/social_tinywebp.webp`;

export const routes = [
  {
    path: '/',
    title: 'WebP Converter — Compress JPG & PNG to WebP Free, In Your Browser',
    description:
      'Free WebP converter. Compress JPG, PNG and GIF to WebP with pixel and '
      + 'quality controls, straight in your browser. Nothing is uploaded, no '
      + 'account, no limits, no watermark.',
    changefreq: 'monthly',
    priority: '1.0',
    schema: ['app', 'faq'],
  },
  {
    path: '/how-to-use',
    title: 'How to Compress Images to WebP — Step-by-Step Guide',
    description:
      'How to convert and compress images to WebP in four steps: drop a file, '
      + 'pick a quality level, compare the result, download. Runs locally in '
      + 'your browser, so nothing leaves your device.',
    changefreq: 'yearly',
    priority: '0.8',
    schema: ['howto'],
  },
  {
    path: '/privacy-policy',
    title: 'Privacy Policy — No Uploads, No Tracking of Your Images',
    description:
      'Your images never leave your device. Compression runs entirely in your '
      + 'browser, so there is no upload, no server-side copy and nothing to '
      + 'delete afterwards.',
    changefreq: 'yearly',
    priority: '0.3',
    schema: [],
  },
  {
    path: '/terms-and-conditions',
    title: 'Terms & Conditions',
    description:
      'Terms of use for the free in-browser WebP compression tool at '
      + 'webp.aidxn.com.',
    changefreq: 'yearly',
    priority: '0.3',
    schema: [],
  },
];



export const faq = shared.faq;
export const howToSteps = shared.howToSteps;
