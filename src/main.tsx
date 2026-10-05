import { StrictMode } from 'react';
import { createRoot, hydrateRoot } from 'react-dom/client';
import App from './App';
import { initAnalytics, trackScrollDepth } from './lib/analytics';
import './styles.css';

initAnalytics();
trackScrollDepth();

const root = document.getElementById('root')!;
const app = <StrictMode><App /></StrictMode>;
// Production HTML is pre-rendered (see prerender.mjs) → hydrate it. In dev the root is empty → render.
if (root.firstElementChild) hydrateRoot(root, app);
else createRoot(root).render(app);
