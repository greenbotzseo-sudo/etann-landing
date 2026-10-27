/**
 * Build step: injects the server-rendered page into dist/index.html, so visitors (and AdsBot)
 * get complete HTML immediately; React then hydrates it.
 */
import { readFileSync, writeFileSync, rmSync, readdirSync } from 'node:fs';
import { pathToFileURL } from 'node:url';
import { resolve } from 'node:path';

const { render, schema, llmsTxt, SITE } = await import(pathToFileURL(resolve('dist-ssr/entry-server.js')).href);
const file = resolve('dist/index.html');
const html = readFileSync(file, 'utf8');
if (!html.includes('<!--app-html-->')) throw new Error('Placeholder <!--app-html--> not found in dist/index.html');

if (!html.includes('<!--schema-->')) throw new Error('Placeholder <!--schema--> not found in dist/index.html');
const ld = JSON.stringify(schema()).replace(/</g, '\\u003c');
const out = html
  .replace('<!--app-html-->', render())
  .replace('<!--schema-->', `<script type="application/ld+json">${ld}</script>`);
writeFileSync(file, out);

// SEO / GEO files, generated from the same data as the page
writeFileSync(resolve('dist/llms.txt'), llmsTxt());
writeFileSync(resolve('dist/sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
  <url><loc>${SITE}</loc><lastmod>${new Date().toISOString().slice(0, 10)}</lastmod><image:image><image:loc>${SITE}img/og.jpg</image:loc></image:image></url>
</urlset>
`);
rmSync(resolve('dist-ssr'), { recursive: true, force: true });

// Guard: the SPlus form URL must not be baked into the HTML (it is set in the browser only).
if (/enckey=/i.test(out)) throw new Error('SPlus form URL found in static HTML — it must only be set client-side.');
console.log(`Pre-rendered dist/index.html (${(out.length / 1024).toFixed(1)} KB)`);

// Guard: the SPlus form URL must be in the browser bundle (it comes from VITE_SPLUS_FORM_URL at build time).
// On Vercel a build without it fails, so a page with a dead enquiry form is never published.
const js = readdirSync(resolve('dist/assets')).filter(f => f.endsWith('.js')).map(f => readFileSync(resolve('dist/assets', f), 'utf8')).join('');
if (!js.includes('LeadCourseForm')) {
  const msg = 'VITE_SPLUS_FORM_URL is not set: the enquiry form would not load. Add it in Vercel > Settings > Environment Variables (Production), then redeploy.';
  if (process.env.VERCEL) throw new Error(msg);
  console.warn('WARNING: ' + msg);
}
if (!/AIza[0-9A-Za-z_-]{20,}/.test(js)) console.warn('Note: VITE_GOOGLE_MAPS_API_KEY is not set, so live Google reviews will not show.');
