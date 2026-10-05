import { useEffect, useRef, useState, type ReactNode } from 'react';
import { useReviews, type LiveReview } from '../lib/reviews';
import { Stars } from './Icon';

/**
 * Hero bento: two columns drifting in opposite directions (right side of the hero), holding only
 * real ETANN learner photos and real learner feedback: Google reviews + rating, loaded live from Google
 * (lib/reviews.tsx). No review text is ever hard-coded; until reviews load, the bento shows photos only.
 * Each column's tiles are rendered once on the server; the copy needed for the seamless loop is cloned
 * in the browser and hidden from screen readers. Motion starts only once the copy exists (.ready),
 * pauses on hover/focus and when off screen, and is off under prefers-reduced-motion (static bento).
 *
 * Photos: public/img/learners/ (360px + 640px WebP). Each photo tile keeps the image's own shape
 * (portrait, landscape or group), so no photo is ever cropped. To add one: export lN-360.webp and
 * lN-640.webp, add it to LEARNERS with its 640px width × height, and place a <Photo n={N} />.
 */

const ONE = 'ETANN learner holding their course certificate';
const GROUP = 'ETANN learners holding their course certificates';
/** 640px export size of each photo (the real aspect ratio, used to reserve space without cropping). */
const LEARNERS: Record<number, { w: number; h: number; alt: string }> = {
  1: { w: 640, h: 853, alt: ONE }, 2: { w: 640, h: 853, alt: ONE }, 3: { w: 640, h: 853, alt: ONE },
  4: { w: 640, h: 853, alt: ONE }, 5: { w: 640, h: 853, alt: ONE }, 6: { w: 640, h: 853, alt: ONE },
  7: { w: 640, h: 422, alt: ONE }, 8: { w: 640, h: 830, alt: GROUP }, 9: { w: 640, h: 892, alt: GROUP },
  10: { w: 640, h: 853, alt: ONE }, 11: { w: 640, h: 853, alt: ONE }, 12: { w: 640, h: 853, alt: ONE },
};

function Photo({ n, eager = false }: { n: number; eager?: boolean }) {
  const p = LEARNERS[n];
  return (
    <figure className="bt bt-photo" style={{ aspectRatio: `${p.w} / ${p.h}` }}>
      <img src={`img/learners/l${n}-640.webp`} srcSet={`img/learners/l${n}-360.webp 360w, img/learners/l${n}-640.webp 640w`}
        sizes="(min-width: 900px) 270px, 48vw" width={p.w} height={p.h} alt={p.alt}
        loading={eager ? 'eager' : 'lazy'} decoding="async" />
    </figure>
  );
}

/** A Google review exactly as published: stars, text, author (linked to their Google profile), time. */
function Review({ r }: { r: LiveReview }) {
  const initials = r.author.split(/\s+/).map(w => w[0]).slice(0, 2).join('').toUpperCase();
  return (
    <figure className="bt bt-quote">
      <span className="bt-q" aria-hidden="true">“</span>
      <span className="bt-src"><Stars size={13} value={r.rating} /><span className="g-src">Google Maps</span></span>
      <blockquote><p>{r.text}</p></blockquote>
      <figcaption className="bt-who">
        {r.photo ? <img className="bt-av" src={r.photo} alt="" width={28} height={28} loading="lazy" referrerPolicy="no-referrer" /> : <span className="bt-av">{initials}</span>}
        <span><b>{r.authorUrl ? <a href={r.authorUrl} target="_blank" rel="noopener nofollow">{r.author}</a> : r.author}</b>{r.when}</span>
      </figcaption>
    </figure>
  );
}

function ColA({ rv }: { rv: ReturnType<typeof useReviews> }) {
  const r = rv.reviews;
  return <>
    <Photo n={1} eager />
    <Photo n={4} />
    {r[0] && <Review r={r[0]} />}
    <Photo n={8} />
    <Photo n={10} />
    {r[2] && <Review r={r[2]} />}
    <Photo n={6} />
    {r[4] && <Review r={r[4]} />}
  </>;
}

function ColB({ rv }: { rv: ReturnType<typeof useReviews> }) {
  const r = rv.reviews;
  return <>
    <Photo n={3} eager />
    {r[1] && <Review r={r[1]} />}
    <Photo n={7} />
    <Photo n={5} />
    {r[3] && <Review r={r[3]} />}
    <Photo n={9} />
    <Photo n={2} />
    <Photo n={12} />
    <Photo n={11} />
  </>;
}

/** One drifting column: server-rendered set + browser-made copy for the loop. */
function Col({ dir, deps, children }: { dir: 'up' | 'down'; deps: unknown[]; children: ReactNode }) {
  const first = useRef<HTMLDivElement>(null), copy = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!first.current || !copy.current) return;
    copy.current.replaceChildren(...Array.from(first.current.children).map(n => n.cloneNode(true)));
    copy.current.setAttribute('inert', ''); // the copy's links stay out of the tab order
  }, deps);
  // Same drift speed (~26px/s) for both columns, however long they are
  useEffect(() => {
    const el = first.current; if (!el || !('ResizeObserver' in window)) return;
    const ro = new ResizeObserver(() => el.parentElement!.style.setProperty('--dur', `${Math.round(el.offsetHeight / 26)}s`));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  const set = <div className="hb-set" ref={first}>{children}</div>;
  const dup = <div className="hb-set" aria-hidden="true" ref={copy} />;
  // "down" starts at -50%, so its copy goes first: the real tiles are what's visible at the start.
  return <div className={`hb-col ${dir}`}><div className="hb-track">{dir === 'up' ? <>{set}{dup}</> : <>{dup}{set}</>}</div></div>;
}

export function HeroBento() {
  const rv = useReviews();
  const [ready, setReady] = useState(false);
  useEffect(() => setReady(true), []);
  return (
    <div className="hb-wrap">
      <div className={`hbento${ready ? ' ready' : ''}`} data-anim tabIndex={0} aria-label="ETANN learners and their Google reviews. Hover or focus to pause">
        <Col dir="up" deps={[rv.status]}><ColA rv={rv} /></Col>
        <Col dir="down" deps={[rv.status]}><ColB rv={rv} /></Col>
      </div>
    </div>
  );
}
