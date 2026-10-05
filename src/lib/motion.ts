/**
 * Lightweight motion layer (no animation library):
 *  - .reveal       → fades/slides in when scrolled into view
 *  - [data-count]  → number counts up when first seen
 * Everything is skipped for users who prefer reduced motion.
 *
 * Only put .reveal on elements whose className never changes after render, otherwise
 * React would overwrite the added "in" class on re-render.
 */
export function initMotion() {
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const cleanups: (() => void)[] = [];

  // Pause animations in sections that are off screen
  const animEls = Array.from(document.querySelectorAll<HTMLElement>('[data-anim]'));
  if ('IntersectionObserver' in window) {
    animEls.forEach(el => el.classList.add('off'));
    const io = new IntersectionObserver(en => en.forEach(e => e.target.classList.toggle('off', !e.isIntersecting)), { rootMargin: '100px 0px' });
    animEls.forEach(el => io.observe(el));
    cleanups.push(() => io.disconnect());
  }

  // Scroll reveal
  const revealEls = Array.from(document.querySelectorAll<HTMLElement>('.reveal'));
  if (reduced || !('IntersectionObserver' in window)) revealEls.forEach(el => el.classList.add('in'));
  else {
    const io = new IntersectionObserver(en => en.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
    }), { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    revealEls.forEach(el => io.observe(el));
    cleanups.push(() => io.disconnect());
  }

  // Count-up numbers (static HTML already shows the final value)
  const countEls = Array.from(document.querySelectorAll<HTMLElement>('[data-count]'));
  if (!reduced && 'IntersectionObserver' in window) {
    const io = new IntersectionObserver(en => en.forEach(e => {
      if (!e.isIntersecting) return;
      io.unobserve(e.target);
      const el = e.target as HTMLElement, node = el.firstChild;
      if (!node || node.nodeType !== Node.TEXT_NODE || el.childNodes.length !== 1) return;
      const final = node.nodeValue || '';
      const m = final.match(/^([\d,.]+)(.*)$/); if (!m) return;
      const target = parseFloat(m[1].replace(/,/g, '')), dec = (m[1].split('.')[1] || '').length, t0 = performance.now();
      // Animate the existing text node (not textContent) so React keeps ownership of it.
      // If React updates the value mid-animation (e.g. the live Google rating arrives), stop and keep React's value.
      let last: string | null = null;
      const step = (t: number) => {
        if (el.firstChild !== node || (last !== null && node.nodeValue !== last)) return;
        const p = Math.min(1, (t - t0) / 1200), v = target * (1 - Math.pow(1 - p, 3));
        last = p < 1 ? (dec ? v.toFixed(dec) : Math.round(v).toLocaleString('en-SG')) + m[2] : final;
        node.nodeValue = last;
        if (p < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    }), { threshold: 0.6 });
    countEls.forEach(el => io.observe(el));
    cleanups.push(() => io.disconnect());
  }

  return () => cleanups.forEach(c => c());
}
