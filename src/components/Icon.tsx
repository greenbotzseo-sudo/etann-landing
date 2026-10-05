import type { SVGProps } from 'react';

const S = { fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round' } as const;

const PATHS = {
  shield: <g {...S}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /><path d="m9 12 2 2 4-4" /></g>,
  starUser: <g {...S}><circle cx="10" cy="8" r="4" /><path d="M3 21v-1a7 7 0 0 1 11-5.7" /><path d="m18 13 1.2 2.4 2.6.4-1.9 1.8.5 2.6-2.4-1.3-2.4 1.3.5-2.6-1.9-1.8 2.6-.4z" /></g>,
  plus: <g {...S}><circle cx="9" cy="8" r="4" /><path d="M2 21v-1a7 7 0 0 1 11-5.7" /><path d="M19 14v6M16 17h6" /></g>,
  up: <g {...S}><path d="M3 17l6-6 4 4 8-8" /><path d="M14 7h7v7" /></g>,
  q: <g {...S}><circle cx="12" cy="12" r="10" /><path d="M9.1 9a3 3 0 0 1 5.8 1c0 2-3 3-3 3M12 17h.01" /></g>,
  arrow: <g {...S} strokeWidth={2.2}><path d="M5 12h14M13 6l6 6-6 6" /></g>,
  down: <g {...S} strokeWidth={2.2}><path d="M12 5v14M6 13l6 6 6-6" /></g>,
  ext: <g {...S}><path d="M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5" /></g>,
  check: <g {...S} strokeWidth={2.4}><path d="M20 6 9 17l-5-5" /></g>,
  cap: <g {...S}><path d="M22 10 12 5 2 10l10 5 10-5z" /><path d="M6 12v5c3 2 9 2 12 0v-5" /></g>,
  star: <path fill="currentColor" d="m12 2 3.1 6.3 6.9 1-5 4.9 1.2 6.8-6.2-3.2L5.8 21 7 14.2 2 9.3l6.9-1z" />,
  pin: <g {...S}><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0z" /><circle cx="12" cy="10" r="3" /></g>,
  phone: <g {...S}><path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 1.9.7 2.8a2 2 0 0 1-.5 2.1L8 9.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.8.7a2 2 0 0 1 1.7 2z" /></g>,
  mail: <g {...S}><rect x="2" y="4" width="20" height="16" rx="2" /><path d="m22 7-10 6L2 7" /></g>,
  clock: <g {...S}><circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" /></g>,
  coin: <g {...S}><circle cx="12" cy="12" r="10" /><path d="M16 8h-6a2 2 0 0 0 0 4h4a2 2 0 0 1 0 4H8M12 6v2M12 16v2" /></g>,
  cal: <g {...S}><rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" /></g>,
  team: <g {...S}><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.9M16 3.1a4 4 0 0 1 0 7.8" /></g>,
  cam: <g {...S}><path d="M3 7h12l4 3v4l-4 3H3z" /><circle cx="9" cy="12" r="2.5" /><path d="M19 12h2" /></g>,
  alert: <g {...S}><path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z" /><path d="M12 9v4M12 17h.01" /></g>,
  book: <g {...S}><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20V3H6.5A2.5 2.5 0 0 0 4 5.5z" /><path d="M8 7h8M8 11h6" /></g>,
  chat: <g {...S}><path d="M21 12a8 8 0 0 1-11.6 7.1L4 20l1-4.6A8 8 0 1 1 21 12z" /><path d="M8.5 12h.01M12 12h.01M15.5 12h.01" strokeWidth={2.6} /></g>,
  x: <g {...S} strokeWidth={2.2}><path d="M6 6l12 12M18 6 6 18" /></g>,
  wa: <path fill="currentColor" d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2zm0 18.2a8.2 8.2 0 0 1-4.2-1.1l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8-.2-.1-.4-.1-.6.1l-.8 1c-.1.2-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.3-.4.2-.4.7-1.4.1-.2 0-.3 0-.4l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-.9 2.2 5.2 5.2 0 0 0 1.1 2.7 11.8 11.8 0 0 0 4.5 4c1.7.7 2.3.8 3.2.6a2.7 2.7 0 0 0 1.8-1.2 2.2 2.2 0 0 0 .1-1.3c0-.1-.2-.2-.4-.3z" />,
} as const;

export type IconName = keyof typeof PATHS;

export function Icon({ name, ...rest }: { name: IconName } & SVGProps<SVGSVGElement>) {
  return <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false" className="ico" {...rest}>{PATHS[name]}</svg>;
}

/** Star rating; `value` may be fractional (e.g. 4.6 shows 4 full stars + a 60% star). */
export function Stars({ size = 16, value = 5 }: { size?: number; value?: number }) {
  const v = Math.max(0, Math.min(5, Number.isFinite(value) ? value : 5));
  return (
    <span className="stars" role="img" aria-label={`${Number(v.toFixed(1))} out of 5 stars`}>
      {[0, 1, 2, 3, 4].map(i => {
        const fill = Math.max(0, Math.min(1, v - i));
        return (
          <span key={i} className="star" style={{ width: size, height: size }}>
            <Icon name="star" className="star-bg" style={{ width: size, height: size }} />
            {fill > 0 && <span className="star-fill" style={{ width: `${fill * 100}%` }}><Icon name="star" className="star-fg" style={{ width: size, height: size }} /></span>}
          </span>
        );
      })}
    </span>
  );
}
