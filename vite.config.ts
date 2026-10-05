import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { readFileSync, writeFileSync } from 'node:fs';

const DEADLINE = new Date('2026-12-31T23:59:59+08:00').getTime();
const TS_FILE = 'node_modules/.etann-build-ts';

export default defineConfig(({ command, isSsrBuild }) => {
  // The client build and the SSR (pre-render) build are separate runs. They must share one build time,
  // otherwise the countdown minutes can differ between the static HTML and the client → hydration mismatch.
  let buildTs = Date.now();
  if (command === 'build') {
    if (isSsrBuild) { try { buildTs = Number(readFileSync(TS_FILE, 'utf8')) || buildTs; } catch { /* fall back to now */ } }
    else writeFileSync(TS_FILE, String(buildTs));
  }
  return {
    // Relative asset paths: the built site works from a domain root or any sub-folder.
    base: './',
    plugins: [react()],
    define: {
      // Build time — the countdown's first render uses it so the static HTML and the first client render match.
      __BUILD_TS__: JSON.stringify(buildTs),
      // Days left at build time — rendered into the static HTML, refreshed in the browser.
      __BUILD_DAYS__: JSON.stringify(Math.max(0, Math.ceil((DEADLINE - buildTs) / 864e5))),
    },
    build: { target: 'es2019', cssCodeSplit: false },
  };
});
