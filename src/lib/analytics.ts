import { CONFIG } from '../config';

/**
 * Analytics: dataLayer events (GTM / GA4 / Ads read these), first/last-touch attribution
 * in localStorage, and optional direct Google Ads + Meta Pixel tags.
 * Nothing here ever includes the SPlus form URL.
 */

const KEYS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content', 'gclid', 'gbraid', 'wbraid', 'fbclid'] as const;
type Touch = Partial<Record<(typeof KEYS)[number] | 'landing_page' | 'lp_variant' | 'device' | 'ts', string>>;

let attr: Touch = {};
let variant = 'default';
let device = 'desktop';

const store = {
  get(k: string): Touch | null { try { return JSON.parse(localStorage.getItem(k) || 'null'); } catch { return null; } },
  set(k: string, v: Touch) { try { localStorage.setItem(k, JSON.stringify(v)); } catch { /* storage blocked */ } },
};

export function getVariant() { return variant; }
export function getAttribution() { return attr; }

export function initAnalytics() {
  window.dataLayer = window.dataLayer || [];
  variant = document.documentElement.getAttribute('data-v') || 'default';
  device = window.matchMedia('(max-width: 899px)').matches ? 'mobile' : 'desktop';

  const qs = new URLSearchParams(location.search);
  const touch: Touch = {};
  KEYS.forEach(k => { const v = qs.get(k); if (v) touch[k] = v.slice(0, 200); });
  if (Object.keys(touch).length) {
    Object.assign(touch, { landing_page: location.origin + location.pathname, lp_variant: variant, device, ts: new Date().toISOString() });
    store.set('etann_last_touch', touch);
    if (!store.get('etann_first_touch')) store.set('etann_first_touch', touch);
    attr = touch;
  } else {
    attr = store.get('etann_last_touch') || {};
  }

  loadTags();
  track('lp_page_view', { landing_page: location.pathname });

  // Every tel: link on the page (contact list, chat widget, form fallback) reports phone_click.
  document.addEventListener('click', e => {
    const a = (e.target as Element | null)?.closest?.('a[href^="tel:"]');
    if (a) track('phone_click', { location: a.getAttribute('data-cta') || 'contact' });
  });
}

export function track(event: string, params: Record<string, unknown> = {}) {
  if (typeof window === 'undefined') return;
  const p = {
    event, lp_variant: variant, device,
    utm_source: attr.utm_source || '(direct)', utm_medium: attr.utm_medium || '(none)', utm_campaign: attr.utm_campaign || '(none)',
    ...params,
  };
  (window.dataLayer = window.dataLayer || []).push(p);
  adsHook(event, p);
}

function adsHook(event: string, p: Record<string, unknown>) {
  const t = CONFIG.tracking;
  if (t.gads && window.gtag) {
    if (event === 'generate_lead' && t.gadsLeadLabel) window.gtag('event', 'conversion', { send_to: `${t.gads}/${t.gadsLeadLabel}` });
    if (event === 'whatsapp_click' && t.gadsWhatsAppLabel) window.gtag('event', 'conversion', { send_to: `${t.gads}/${t.gadsWhatsAppLabel}` });
  }
  if (t.metaPixel && window.fbq) {
    if (event === 'whatsapp_click' || event === 'phone_click') window.fbq('track', 'Contact', { content_name: p.course || '' });
    if (event === 'generate_lead') window.fbq('track', 'Lead', { content_name: p.course || '' });
  }
}

/**
 * Optional direct Google Ads / Meta tags (only if not set up in GTM, otherwise conversions double count).
 * GTM itself is in index.html. These load on first interaction or 3s after load.
 */
function loadTags() {
  const t = CONFIG.tracking;
  if (!t.gads && !t.metaPixel) return;
  const dl = window.dataLayer;
  if (t.gads) {
    window.gtag = function () { dl.push(arguments); };
    window.gtag('js', new Date()); window.gtag('config', t.gads);
  }
  if (t.metaPixel) {
    const f = function (...args: unknown[]) { f.callMethod ? f.callMethod(...args) : f.queue!.push(args); } as NonNullable<Window['fbq']>;
    f.push = f; f.loaded = true; f.version = '2.0'; f.queue = [];
    window.fbq = f; window._fbq = f;
    f('init', t.metaPixel); f('track', 'PageView');
  }
  let done = false;
  const add = (src: string) => { const s = document.createElement('script'); s.async = true; s.src = src; document.head.appendChild(s); };
  const go = () => {
    if (done) return; done = true;
    if (t.gads) add(`https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(t.gads)}`);
    if (t.metaPixel) add('https://connect.facebook.net/en_US/fbevents.js');
  };
  ['scroll', 'pointerdown', 'keydown', 'touchstart'].forEach(e => window.addEventListener(e, go, { once: true, passive: true }));
  window.addEventListener('load', () => setTimeout(go, 3000));
}

/** Scroll depth at 25/50/75/90%. */
export function trackScrollDepth() {
  const hit: Record<number, boolean> = {};
  const on = () => {
    const h = document.documentElement, pct = (h.scrollTop + innerHeight) / h.scrollHeight * 100;
    [25, 50, 75, 90].forEach(m => { if (pct >= m && !hit[m]) { hit[m] = true; track('scroll_depth', { percent: m }); } });
  };
  window.addEventListener('scroll', on, { passive: true });
}
