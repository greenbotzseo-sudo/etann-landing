import { useEffect, useState, type ReactNode } from 'react';
import { track } from '../lib/analytics';
import { useGuide } from '../lib/guide';
import { requestFormLoad, waHref } from '../lib/whatsapp';
import { Icon } from './Icon';

/** WhatsApp link: prefilled with the guide's answers; the source ref is added after hydration. */
export function WaLink({ loc, className = 'btn btn-wa', children, label, msg }: { loc: string; className?: string; children?: ReactNode; label?: string; msg?: string }) {
  const { role, pick } = useGuide();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  return (
    <a className={className} href={waHref(role, pick, mounted, msg)} target="_blank" rel="noopener" data-wa={loc} aria-label={label}
      onClick={() => track('whatsapp_click', { location: loc, role: role || '(none)', course: pick || '(none)' })}>
      {children ?? <><Icon name="wa" />WhatsApp ETANN</>}
    </a>
  );
}

/** In-page call to action (scrolls to a section and starts loading the enquiry form). */
export function Cta({ to, id, className = 'btn btn-primary', children }: { to: '#form' | '#situation'; id: string; className?: string; children: ReactNode }) {
  return (
    <a className={className} href={to} data-cta={id} onClick={() => { track('cta_click', { cta: id }); requestFormLoad(); }}>
      {children}
    </a>
  );
}

/** Outbound link to the main ETANN site. */
export function OutLink({ href, id, className, children }: { href: string; id: string; className?: string; children: ReactNode }) {
  return (
    <a className={className} href={href} target="_blank" rel="noopener" data-cta={id}
      onClick={() => track('outbound_click', { link: id })}>
      {children}
    </a>
  );
}
