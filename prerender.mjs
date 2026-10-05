/**
 * Build step: injects the server-rendered page into dist/index.html, so visitors (and AdsBot)
 * get complete HTML immediately; React then hydrates it.
 */
import { readFileSync, writeFileSync, rmSync } from 'node:fs';
import { pathToFileURL } from 'node:url';
import { resolve } from 'node:path';

const { render } = await import(pathToFileURL(resolve('dist-ssr/entry-server.js')).href);
const file = resolve('dist/index.html');
const html = readFileSync(file, 'utf8');
if (!html.includes('<!--app-html-->')) throw new Error('Placeholder <!--app-html--> not found in dist/index.html');

const out = html.replace('<!--app-html-->', render());
writeFileSync(file, out);
rmSync(resolve('dist-ssr'), { recursive: true, force: true });

// Guard: the SPlus form URL must not be baked into the HTML (it is set in the browser only).
if (/enckey=/i.test(out)) throw new Error('SPlus form URL found in static HTML — it must only be set client-side.');
console.log(`Pre-rendered dist/index.html (${(out.length / 1024).toFixed(1)} KB)`);
