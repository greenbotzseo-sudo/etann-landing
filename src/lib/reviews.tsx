import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { CONFIG } from '../config';
import { track } from './analytics';

/**
 * Live Google reviews via the Google Maps JavaScript API — Places library (Place Details, "New").
 * Loaded lazily — on the visitor's first scroll/tap/keypress, or when the reviews section approaches —
 * never at first paint. Nothing review-related is hard-coded: until live data arrives (or if the key
 * isn't set / Google fails) no rating or review text is shown, only links to ETANN's Google listing.
 *
 * Display rules (Google Maps Platform policies): show each review's author name with a link to
 * their Google profile, don't alter review text, and attribute the data to Google Maps.
 */

export interface LiveReview {
  author: string;
  authorUrl?: string;
  photo?: string;
  rating: number;
  text: string;
  when: string;
}
interface ReviewsState {
  status: 'static' | 'loading' | 'live' | 'error';
  rating: string | null;   // e.g. "4.9": only ever the live Google value; null until loaded
  count?: number;          // total Google reviews (live only)
  reviews: LiveReview[];
  placeUrl?: string;       // the business on Google Maps
  request: () => void;     // start loading (idempotent)
}

const Ctx = createContext<ReviewsState | null>(null);
const enabled = () => Boolean(CONFIG.google.mapsKey && CONFIG.google.placeId);

/* Minimal typings for the bits of the Maps JS API used here. */
interface GPlace {
  rating?: number; userRatingCount?: number; googleMapsURI?: string;
  reviews?: { rating?: number; text?: string; relativePublishTimeDescription?: string;
    authorAttribution?: { displayName?: string; uri?: string; photoURI?: string } }[];
  fetchFields(o: { fields: string[] }): Promise<unknown>;
}
type GMaps = { maps: { importLibrary(name: 'places'): Promise<{ Place: new (o: { id: string; requestedLanguage?: string }) => GPlace }> } };

let mapsPromise: Promise<GMaps> | undefined;
function loadMaps(): Promise<GMaps> {
  const w = window as unknown as { google?: GMaps; __etannMapsReady?: () => void };
  if (w.google?.maps?.importLibrary) return Promise.resolve(w.google);
  mapsPromise ??= new Promise((resolve, reject) => {
    w.__etannMapsReady = () => resolve(w.google!);
    const s = document.createElement('script');
    s.async = true;
    s.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(CONFIG.google.mapsKey)}&v=weekly&loading=async&callback=__etannMapsReady`;
    s.onerror = () => reject(new Error('Google Maps script failed to load'));
    document.head.appendChild(s);
    setTimeout(() => reject(new Error('Google Maps timed out')), 12000);
  });
  return mapsPromise;
}

export function ReviewsProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<Omit<ReviewsState, 'request'>>({ status: 'static', rating: null, reviews: [] });
  const started = useRef(false);

  const request = useCallback(() => {
    if (started.current || !enabled()) return;
    started.current = true;
    setState(s => ({ ...s, status: 'loading' }));
    loadMaps()
      .then(g => g.maps.importLibrary('places'))
      .then(async ({ Place }) => {
        const place = new Place({ id: CONFIG.google.placeId, requestedLanguage: 'en' });
        await place.fetchFields({ fields: ['rating', 'userRatingCount', 'reviews', 'googleMapsURI'] });
        // Google returns its most relevant reviews (up to 5). Shown as-is — no filtering by star
        // rating, so the section stays an honest picture of what's on Google.
        const reviews: LiveReview[] = (place.reviews || [])
          .filter(r => r.text)
          .map(r => ({
            author: r.authorAttribution?.displayName || 'Google user',
            authorUrl: r.authorAttribution?.uri,
            photo: r.authorAttribution?.photoURI,
            rating: r.rating ?? 5,
            text: r.text || '',
            when: r.relativePublishTimeDescription || '',
          }));
        setState({
          status: 'live',
          rating: place.rating ? place.rating.toFixed(1) : null,
          count: place.userRatingCount,
          reviews,
          placeUrl: place.googleMapsURI,
        });
        track('google_reviews_loaded', { rating: place.rating, count: place.userRatingCount, shown: reviews.length });
      })
      .catch(err => {
        setState(s => ({ ...s, status: 'error' }));
        track('google_reviews_error', { message: String(err?.message || err).slice(0, 100) });
      });
  }, []);

  // Start on the first sign of engagement, so the hero's feedback tiles fill in early
  // (but never during the initial page load).
  useEffect(() => {
    if (!enabled()) return;
    const evs = ['scroll', 'pointerdown', 'keydown', 'touchstart'] as const;
    const go = () => { evs.forEach(e => window.removeEventListener(e, go)); request(); };
    evs.forEach(e => window.addEventListener(e, go, { once: true, passive: true }));
    return () => evs.forEach(e => window.removeEventListener(e, go));
  }, [request]);

  const value = useMemo(() => ({ ...state, request }), [state, request]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useReviews() {
  const r = useContext(Ctx);
  if (!r) throw new Error('useReviews must be used inside <ReviewsProvider>');
  return r;
}

/** The live Google rating, or null (then show no rating at all). */
export const useRating = () => useReviews().rating;
