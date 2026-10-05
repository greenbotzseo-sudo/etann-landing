/**
 * Small spot illustrations for "Why train with ETANN" (64×64, ETANN navy + red on a soft blue disc).
 * Hand-drawn as simple SVG so they stay crisp, tiny and on-brand.
 */
const N = '#000D63', R = '#ED3423', B = '#DCE4FF', W = '#fff';
const line = { stroke: N, strokeWidth: 2.2, strokeLinecap: 'round', strokeLinejoin: 'round' } as const; // with a fill
const open = { ...line, fill: 'none' } as const;                                                  // outline only

const ART = {
  // Right course, first time: clipboard with a ticked item
  check: <>
    <rect x="18" y="14" width="28" height="36" rx="4" fill={W} {...line} />
    <rect x="25" y="10" width="14" height="8" rx="2.5" fill={B} {...line} />
    <path d="M24 28h10M24 36h16M24 43h12" {...open} />
    <circle cx="44" cy="44" r="9" fill={R} />
    <path d="m40 44 3 3 5-6" fill="none" stroke={W} strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round" />
  </>,
  // Funding handled for you: form plus a stack of coins
  coin: <>
    <rect x="14" y="16" width="24" height="32" rx="3.5" fill={W} {...line} />
    <path d="M20 25h12M20 32h12M20 39h7" {...open} />
    <ellipse cx="44" cy="44" rx="9" ry="3.5" fill={R} />
    <path d="M35 44v-5c0 2 4 3.5 9 3.5s9-1.5 9-3.5v5" fill={R} />
    <ellipse cx="44" cy="39" rx="9" ry="3.5" fill="#FF8A7D" />
    <path d="M35 39v-5c0 2 4 3.5 9 3.5s9-1.5 9-3.5v5" fill="#FF8A7D" />
    <ellipse cx="44" cy="34" rx="9" ry="3.5" fill={W} {...line} />
  </>,
  // Real people on WhatsApp: two chat bubbles
  wa: <>
    <path d="M12 18a5 5 0 0 1 5-5h20a5 5 0 0 1 5 5v11a5 5 0 0 1-5 5H24l-7 6v-6a5 5 0 0 1-5-5z" fill={W} {...line} />
    <path d="M19 21h16M19 27h10" {...open} />
    <path d="M30 37a4 4 0 0 1 4-4h16a4 4 0 0 1 4 4v8a4 4 0 0 1-4 4v5l-6-5h-10a4 4 0 0 1-4-4z" fill={R} />
    <circle cx="37" cy="41" r="1.6" fill={W} /><circle cx="42" cy="41" r="1.6" fill={W} /><circle cx="47" cy="41" r="1.6" fill={W} />
  </>,
  // Regular class dates: calendar with one date marked
  cal: <>
    <rect x="13" y="16" width="38" height="34" rx="4" fill={W} {...line} />
    <path d="M13 25h38" {...open} />
    <path d="M22 12v7M42 12v7" {...open} />
    <circle cx="22" cy="33" r="1.8" fill={N} /><circle cx="32" cy="33" r="1.8" fill={N} />
    <circle cx="22" cy="42" r="1.8" fill={N} /><circle cx="32" cy="42" r="1.8" fill={N} />
    <rect x="37" y="36" width="10" height="10" rx="2.5" fill={R} />
  </>,
  // Agency & bulk bookings: a small team
  team: <>
    <circle cx="22" cy="24" r="6" fill={W} {...line} />
    <path d="M12 46c0-6 4.5-10 10-10s10 4 10 10" fill={W} {...line} />
    <circle cx="42" cy="24" r="6" fill={W} {...line} />
    <path d="M32 46c0-6 4.5-10 10-10s10 4 10 10" fill={W} {...line} />
    <circle cx="32" cy="20" r="7" fill={R} />
    <path d="M21 50c0-7 5-11.5 11-11.5S43 43 43 50z" fill={R} />
  </>,
  // Physical Singapore centre: building with a map pin
  pin: <>
    <path d="M12 50h40" {...open} />
    <rect x="16" y="22" width="22" height="28" rx="2" fill={W} {...line} />
    <path d="M22 29h3M29 29h3M22 36h3M29 36h3M25 50v-7h4v7" {...open} />
    <path d="M45 14c-5 0-8.5 3.6-8.5 8.2 0 6 8.5 14.3 8.5 14.3s8.5-8.3 8.5-14.3c0-4.6-3.5-8.2-8.5-8.2z" fill={R} />
    <circle cx="45" cy="22.4" r="3" fill={W} />
  </>,
} as const;

export type ArtName = keyof typeof ART;

export function Spot({ name }: { name: ArtName }) {
  return (
    <svg className="spot" viewBox="0 0 64 64" width={64} height={64} aria-hidden="true" focusable="false">
      <circle cx="32" cy="32" r="30" fill={B} opacity=".55" />
      {ART[name]}
    </svg>
  );
}
