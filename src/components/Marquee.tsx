import { useEffect, useRef, useState, type ReactNode } from 'react';

/**
 * Continuous horizontal row that moves on its own (used for class photos and Google reviews).
 * The items are server-rendered once; the copy needed for a seamless loop is cloned in the browser,
 * marked inert + aria-hidden. Speed is constant (px/s) whatever the content width.
 * Pauses on hover/focus and when off screen; under prefers-reduced-motion it is a normal swipeable row.
 */
export function Marquee({ children, label, speed = 40, className = '', deps = [] }:
  { children: ReactNode; label: string; speed?: number; className?: string; deps?: unknown[] }) {
  const first = useRef<HTMLDivElement>(null), copy = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const a = first.current, b = copy.current; if (!a || !b) return;
    b.replaceChildren(...Array.from(a.children).map(n => n.cloneNode(true)));
    b.setAttribute('inert', '');
    setReady(true);
  }, deps);

  useEffect(() => {
    const a = first.current; if (!a || !('ResizeObserver' in window)) return;
    const ro = new ResizeObserver(() => a.parentElement!.style.setProperty('--dur', `${Math.max(20, Math.round(a.offsetWidth / speed))}s`));
    ro.observe(a);
    return () => ro.disconnect();
  }, [speed]);

  return (
    <div className={`mq${ready ? ' ready' : ''} ${className}`} data-anim tabIndex={0} role="region" aria-label={`${label}. Hover or focus to pause`}>
      <div className="mq-track">
        <div className="mq-set" ref={first}>{children}</div>
        <div className="mq-set" aria-hidden="true" ref={copy} />
      </div>
    </div>
  );
}
