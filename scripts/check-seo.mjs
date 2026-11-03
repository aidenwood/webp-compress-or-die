#!/usr/bin/env node
/**
 * check-seo.mjs — fail the build if the structured data stops describing the
 * page a human sees.
 *
 * Google requires FAQPage and HowTo markup to reflect content that is actually
 * visible. That is not a style note: schema describing copy nobody can see is
 * a guidelines violation and can earn a manual action.
 *
 * This guard exists because the mistake was made HERE, not in theory. HowTo
 * schema was added describing four steps while /how-to-use still rendered the
 * upstream project's different four. Both now render from
 * src/data/seo-content.json — and this asserts that they still do, rather than
 * trusting that nobody will hand-write a step into the JSX later.
 *
 * Runs as part of `npm run build`. Exits non-zero on any mismatch.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { routes, SITE } from './routes.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const DIST = path.join(ROOT, 'dist');
const shared = JSON.parse(
  fs.readFileSync(path.join(ROOT, 'src/data/seo-content.json'), 'utf8'));

const problems = [];
const ok = (m) => console.log(`  \x1b[32m✓\x1b[0m ${m}`);
const bad = (m) => { problems.push(m); console.log(`  \x1b[31m✗\x1b[0m ${m}`); };

const read = (p) => {
  const f = p === '/' ? path.join(DIST, 'index.html')
                      : path.join(DIST, p, 'index.html');
  return fs.existsSync(f) ? fs.readFileSync(f, 'utf8') : null;
};

const ld = (html) =>
  [...html.matchAll(/<script type="application\/ld\+json">(.*?)<\/script>/gs)]
    .map((m) => JSON.parse(m[1]));

// Bundled JS is the only place to look for copy a client-rendered page shows.
const bundle = fs.readdirSync(path.join(DIST, 'assets'))
  .filter((f) => f.endsWith('.js'))
  .map((f) => fs.readFileSync(path.join(DIST, 'assets', f), 'utf8'))
  .join('\n');

console.log('SEO integrity:');

// 1. Every route must exist and own its canonical.
for (const r of routes) {
  const html = read(r.path);
  if (!html) { bad(`${r.path} — no HTML emitted`); continue; }
  const want = r.path === '/' ? `${SITE}/` : `${SITE}${r.path}`;
  const got = (html.match(/rel="canonical" href="([^"]*)"/) || [])[1];
  if (got === want) ok(`${r.path} canonicals to itself`);
  else bad(`${r.path} canonicals to ${got} (expected ${want})`);

  for (const [tag, re] of [
    ['title', /<title>/g],
    ['canonical', /rel="canonical"/g],
    ['og:title', /property="og:title"/g],
  ]) {
    const n = (html.match(re) || []).length;
    if (n !== 1) bad(`${r.path} has ${n} <${tag}> tags (expected exactly 1)`);
  }
}

// 2. FAQ schema must match the shared JSON, and that copy must ship to users.
const home = read('/');
if (home) {
  const faq = ld(home).find((b) => b['@type'] === 'FAQPage');
  if (!faq) bad('no FAQPage schema on /');
  else {
    const inSchema = faq.mainEntity.map((e) => e.name);
    const inJson = shared.faq.map((f) => f.q);
    if (JSON.stringify(inSchema) === JSON.stringify(inJson)) {
      ok(`FAQ schema matches the shared JSON (${inJson.length} questions)`);
    } else {
      bad('FAQ schema does not match src/data/seo-content.json');
    }
    const missing = shared.faq.filter((f) => !bundle.includes(f.q));
    if (missing.length === 0) ok('every FAQ question ships in the bundle');
    else bad(`${missing.length} FAQ question(s) in schema but NOT rendered: `
             + `"${missing[0].q}"`);
  }
}

// 3. HowTo schema must match the steps the page renders. This is the exact
//    check that would have caught the violation introduced on 2026-11-03.
const how = read('/how-to-use');
if (how) {
  const ht = ld(how).find((b) => b['@type'] === 'HowTo');
  if (!ht) bad('no HowTo schema on /how-to-use');
  else {
    const inSchema = ht.step.map((s) => s.name);
    const inJson = shared.howToSteps.map((s) => s.name);
    if (JSON.stringify(inSchema) === JSON.stringify(inJson)) {
      ok(`HowTo schema matches the shared JSON (${inJson.length} steps)`);
    } else {
      bad('HowTo schema does not match src/data/seo-content.json');
    }
    const missing = shared.howToSteps.filter((s) => !bundle.includes(s.name));
    if (missing.length === 0) ok('every HowTo step ships in the bundle');
    else bad(`${missing.length} HowTo step(s) in schema but NOT rendered: `
             + `"${missing[0].name}"`);
  }
}

// 4. The sitemap must list exactly the routes, no more and no fewer.
const sm = fs.readFileSync(path.join(DIST, 'sitemap.xml'), 'utf8');
const locs = [...sm.matchAll(/<loc>([^<]*)<\/loc>/g)].map((m) => m[1]).sort();
const want = routes.map((r) => r.path === '/' ? `${SITE}/` : `${SITE}${r.path}`).sort();
if (JSON.stringify(locs) === JSON.stringify(want)) {
  ok(`sitemap lists exactly the ${want.length} real routes`);
} else {
  bad(`sitemap mismatch — has ${locs.length}, expected ${want.length}`);
}

// 5. No stale upstream domain anywhere in the output.
if (sm.includes('tinywebp.app')) bad('sitemap still references tinywebp.app');
else ok('sitemap advertises this domain only');

if (problems.length) {
  console.log(`\n${problems.length} problem(s). Build failed.`);
  process.exit(1);
}
console.log('\nAll SEO checks passed.');
