#!/usr/bin/env node
/**
 * seo-build.mjs — post-build: give every route its own HTML shell, and
 * regenerate sitemap.xml from the same manifest.
 *
 * WHY THIS EXISTS. This is a client-rendered SPA: Netlify's /* fallback served
 * one index.html for every URL, so /how-to-use, /privacy-policy and
 * /terms-and-conditions all shipped the homepage's <title> and — fatally — its
 * `<link rel="canonical" href="https://webp.aidxn.com/">`. Three of the four
 * URLs in the sitemap were telling Google "do not index me, index the homepage
 * instead". The content page with the best ranking potential was the most
 * thoroughly self-deindexed.
 *
 * react-helmet would fix the tags, but only after JavaScript runs. Writing a
 * real static file per route puts the correct metadata in the initial HTML,
 * which is what every crawler reads first and some read exclusively. React
 * still hydrates and takes over; nothing about the app changes.
 *
 * Netlify serves dist/how-to-use/index.html before it ever reaches the SPA
 * fallback, so no redirect config is needed.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  SITE, BRAND, OG_IMAGE, routes, faq, howToSteps,
} from './routes.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const DIST = path.join(ROOT, 'dist');

const esc = (s) => String(s)
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;');

// ── JSON-LD ────────────────────────────────────────────────────────────────

const appSchema = () => ({
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: 'WebP Converter by Aidxn Design',
  url: SITE,
  applicationCategory: 'MultimediaApplication',
  operatingSystem: 'Any browser',
  browserRequirements: 'Requires JavaScript. Works in Chrome, Edge, Firefox, Safari.',
  description:
    'Free in-browser WebP converter. Compresses JPG, PNG and GIF to WebP '
    + 'locally — images are never uploaded.',
  // Free really is free: no tier, no trial, no card. Say so in a way Google
  // can read, because "free" in a title is cheap and an offer is not.
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
  featureList: [
    'Batch conversion',
    'Quality control',
    'Transparency preserved (alpha channel)',
    'Runs entirely client-side — no upload',
    'Download individually or as a zip',
  ],
  publisher: { '@type': 'Organization', name: BRAND, url: 'https://aidxn.com' },
  isAccessibleForFree: true,
});

const faqSchema = () => ({
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: faq.map(({ q, a }) => ({
    '@type': 'Question',
    name: q,
    acceptedAnswer: { '@type': 'Answer', text: a },
  })),
});

const howToSchema = () => ({
  '@context': 'https://schema.org',
  '@type': 'HowTo',
  name: 'How to compress images to WebP',
  description:
    'Convert JPG, PNG or GIF to WebP in your browser, without uploading them.',
  totalTime: 'PT1M',
  supply: [{ '@type': 'HowToSupply', name: 'An image file (JPG, PNG or GIF)' }],
  tool: [{ '@type': 'HowToTool', name: 'A modern web browser' }],
  step: howToSteps.map((s, i) => ({
    '@type': 'HowToStep',
    position: i + 1,
    name: s.name,
    text: s.text,
    url: `${SITE}/how-to-use#step-${i + 1}`,
  })),
});

const SCHEMA = { app: appSchema, faq: faqSchema, howto: howToSchema };

// ── per-route HTML ─────────────────────────────────────────────────────────

const shell = fs.readFileSync(path.join(DIST, 'index.html'), 'utf8');

function render(route) {
  const url = route.path === '/' ? `${SITE}/` : `${SITE}${route.path}`;
  let html = shell;

  // Replace, never append: a second <title> or canonical is worse than a wrong
  // one, because which wins is undefined.
  html = html.replace(/<title>[\s\S]*?<\/title>/i, `<title>${esc(route.title)}</title>`);
  html = html.replace(
    /<meta name="description"[^>]*>/i,
    `<meta name="description" content="${esc(route.description)}" />`);
  html = html.replace(
    /<link rel="canonical"[^>]*>/i,
    `<link rel="canonical" href="${url}" />`);
  html = html.replace(
    /<meta property="og:title"[^>]*>/i,
    `<meta property="og:title" content="${esc(route.title)}" />`);
  html = html.replace(
    /<meta property="og:description"[^>]*>/i,
    `<meta property="og:description" content="${esc(route.description)}" />`);
  html = html.replace(
    /<meta property="og:url"[^>]*>/i,
    `<meta property="og:url" content="${url}" />`);
  html = html.replace(
    /<meta name="twitter:title"[^>]*>/i,
    `<meta name="twitter:title" content="${esc(route.title)}" />`);
  html = html.replace(
    /<meta name="twitter:description"[^>]*>/i,
    `<meta name="twitter:description" content="${esc(route.description)}" />`);

  const blocks = (route.schema || [])
    .map((k) => `<script type="application/ld+json">${JSON.stringify(SCHEMA[k]())}</script>`)
    .join('\n    ');
  if (blocks) html = html.replace('</head>', `    ${blocks}\n  </head>`);

  return html;
}

let written = 0;
for (const route of routes) {
  const html = render(route);
  const dir = route.path === '/' ? DIST : path.join(DIST, route.path);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, 'index.html'), html);
  written += 1;
  console.log(`  ${route.path.padEnd(22)} ${route.title.slice(0, 56)}`);
}

// ── sitemap, from the same list ────────────────────────────────────────────

const today = new Date().toISOString().slice(0, 10);
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<!--
  GENERATED by scripts/seo-build.mjs from scripts/routes.mjs. Do not hand-edit:
  this file once advertised a different domain entirely and published zero URLs
  for this one, because it was maintained separately from the routes it claimed
  to describe.
-->
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${routes.map((r) => `  <url>
    <loc>${r.path === '/' ? `${SITE}/` : `${SITE}${r.path}`}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${r.changefreq}</changefreq>
    <priority>${r.priority}</priority>
  </url>`).join('\n')}
</urlset>
`;
fs.writeFileSync(path.join(DIST, 'sitemap.xml'), sitemap);

console.log(`\n  ${written} routes given their own metadata`);
console.log(`  sitemap.xml regenerated with ${routes.length} URLs (lastmod ${today})`);
