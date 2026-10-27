import { useEffect, useRef } from 'react';
import { track } from '../lib/analytics';

/**
 * Third-party Google-reviews widget (Trustindex or Elfsight), connected to ETANN's Google Business Profile.
 * Used only when Google's Places API sends no review text. The script is added in the browser when the
 * reviews section comes near, so it never slows the first paint.
 */
export function ReviewsWidget({ src }: { src: string }) {
  const box = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = box.current; if (!el) return;
    const load = () => {
      if (el.dataset.loaded) return;
      el.dataset.loaded = '1';
      const s = document.createElement('script');
      s.async = true;
      if (src.startsWith('elfsight:')) {
        const app = document.createElement('div');
        app.className = `elfsight-app-${src.slice(9)}`;
        app.setAttribute('data-elfsight-app-lazy', '');
        el.append(app);
        s.src = 'https://static.elfsight.com/platform/platform.js';
      } else {
        s.src = src; // Trustindex renders the widget where its script sits
      }
      s.onload = () => track('reviews_widget_loaded', {});
      el.append(s);
    };
    if (!('IntersectionObserver' in window)) { load(); return; }
    const io = new IntersectionObserver(en => { if (en[0].isIntersecting) { load(); io.disconnect(); } }, { rootMargin: '600px 0px' });
    io.observe(el);
    return () => io.disconnect();
  }, [src]);

  return <div className="rw" ref={box} />;
}
