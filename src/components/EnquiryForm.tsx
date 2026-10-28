import { useEffect, useRef, useState } from 'react';
import { CONFIG } from '../config';
import { track } from '../lib/analytics';
import { useGuide } from '../lib/guide';
import { LOAD_FORM_EVENT } from '../lib/whatsapp';
import { WaLink } from './Links';
import { Icon } from './Icon';

/** The SPlus form is laid out for ≥352px; narrower screens render it at 352px and scale it down. */
const BASE_WIDTH = 352;
/** If the SPlus form hasn't loaded by then (server down / very slow), offer WhatsApp and phone instead. */
const FORM_TIMEOUT_MS = 15000;

/**
 * SPlus enquiry form, embedded by iframe (never recreated). The src is set only in the browser
 * when the form nears the viewport, so it never competes with first paint and the integration
 * URL is not repeated in the static HTML.
 */
export function EnquiryForm() {
  const wrap = useRef<HTMLDivElement>(null);
  const frame = useRef<HTMLIFrameElement>(null);
  const [src, setSrc] = useState<string>();
  const [autoHeight, setAutoHeight] = useState<number>();
  const [down, setDown] = useState(false);
  const [open, setOpen] = useState(false); // full height once the visitor starts using the form
  const loaded = useRef(false);
  const guide = useGuide();
  const guideRef = useRef(guide);
  guideRef.current = guide;

  // Deferred loading: near the viewport, or as soon as a CTA heads here.
  useEffect(() => {
    const el = wrap.current!;
    // No form URL configured (build without VITE_SPLUS_FORM_URL): show the WhatsApp/phone fallback at once.
    const load = () => { if (!CONFIG.formSrc) { setDown(true); return; } setSrc(s => s ?? CONFIG.formSrc); };
    window.addEventListener(LOAD_FORM_EVENT, load);
    let io: IntersectionObserver | undefined;
    if ('IntersectionObserver' in window) {
      io = new IntersectionObserver(en => { if (en[0].isIntersecting) { load(); io!.disconnect(); } }, { rootMargin: '1500px 0px' });
      io.observe(el);
    } else load();
    return () => { window.removeEventListener(LOAD_FORM_EVENT, load); io?.disconnect(); };
  }, []);

  // Fallback when the form doesn't arrive in time (the iframe's contents can't be inspected cross-origin,
  // so a slow load that finishes later doesn't remove the fallback — the visitor can press "Try the form again").
  useEffect(() => {
    if (!src) return;
    loaded.current = false;
    const t = window.setTimeout(() => {
      if (loaded.current) return;
      setDown(true);
      track('form_unavailable', { after_ms: FORM_TIMEOUT_MS });
    }, FORM_TIMEOUT_MS);
    return () => window.clearTimeout(t);
  }, [src]);
  const retry = () => {
    setDown(false);
    track('cta_click', { cta: 'form_retry' });
    setSrc(undefined);
    requestAnimationFrame(() => setSrc(CONFIG.formSrc));
  };

  // Scale-to-fit below 352px (the SPlus form overflows sideways otherwise).
  useEffect(() => {
    const el = wrap.current!, f = frame.current!;
    const fit = () => {
      if (autoHeight) return;
      f.style.transform = ''; f.style.width = ''; el.style.height = '';
      const w = el.clientWidth;
      if (w < BASE_WIDTH) {
        const cs = getComputedStyle(el), s = w / BASE_WIDTH;
        const fh = parseFloat(cs.getPropertyValue('--fh')), crop = parseFloat(cs.getPropertyValue('--fcrop'));
        const bot = parseFloat(cs.getPropertyValue('--fbot')) || 0;
        f.style.width = `${BASE_WIDTH}px`; f.style.transform = `scale(${s})`;
        el.style.height = `${Math.ceil((fh - crop - bot) * s)}px`;
      }
    };
    fit();
    window.addEventListener('resize', fit);
    return () => window.removeEventListener('resize', fit);
  }, [autoHeight, open]);

  // iframe_viewed, form_interaction (focus moving into the iframe), and SPlus postMessage events.
  useEffect(() => {
    const el = wrap.current!, f = frame.current!;
    let viewed = false, interacted = false;
    const io = 'IntersectionObserver' in window
      ? new IntersectionObserver(en => { if (en[0].isIntersecting && !viewed) { viewed = true; track('iframe_viewed'); } }, { threshold: 0.3 })
      : undefined;
    io?.observe(el);
    const onBlur = () => setTimeout(() => {
      if (document.activeElement === f) setOpen(true);
      if (!interacted && document.activeElement === f) {
        interacted = true;
        track('form_interaction', { role: guideRef.current.role || '(none)', course: guideRef.current.pick || '(none)' });
      }
    }, 0);
    let leadSent = false;
    // generate_lead: situation from SPlus if it sends one, else from the "Which describes you?" tile the visitor picked.
    const SITUATION = { so: 'obse', sso: 'prsf', new: 'new', sup: 'supervisor' } as const;
    const lead = (course: string, sent?: unknown) => {
      if (leadSent) return;
      leadSent = true; setOpen(true);
      const r = guideRef.current.role;
      const situation = typeof sent === 'string' && /^(obse|prsf|new|supervisor|unsure)$/.test(sent) ? sent : r ? SITUATION[r] : 'unsure';
      track('form_submission', { course, situation });
      track('generate_lead', { course, situation, form: 'splus' });
    };
    // Not sent by the SPlus form today — ready for when SPlus adds it (see README).
    const onMessage = (e: MessageEvent) => {
      if (e.source !== f.contentWindow) return;
      const m = e.data;
      // SPlus redirecting its iframe to /thank-you.html (same origin as this page) after a submit
      if (e.origin === location.origin && m?.source === 'etann-thank-you' && m.type === 'form_success') {
        lead('(thank-you page)', m.situation);
        return;
      }
      if (!CONFIG.splusOrigin.test(e.origin)) return;
      if (!m || m.source !== 'splus-lead-form' || typeof m.type !== 'string') return;
      if (m.type === 'resize' && m.height > 200 && m.height < 3000) { setAutoHeight(Math.ceil(m.height)); return; }
      if (['form_started', 'form_submitted', 'form_success', 'form_error'].includes(m.type)) {
        setOpen(true);
        const course = String(m.course || '').slice(0, 80);
        track(m.type, { course });
        if (m.type === 'form_success') lead(course, m.situation);
      }
    };
    window.addEventListener('blur', onBlur);
    window.addEventListener('message', onMessage);
    return () => { io?.disconnect(); window.removeEventListener('blur', onBlur); window.removeEventListener('message', onMessage); };
  }, []);

  return (
    <section className="fsec" id="form" aria-labelledby="f-h">
      <div className="fsec-fx" aria-hidden="true"><i /><i /></div>
      <div className="wrap f-grid">
        <div className="f-copy reveal">
          <h2 id="f-h">Check your course and funding</h2>
          <p className="lead">Tell us a little about your situation and our team will help confirm the right course, funding and next available class.</p>
          <ol className="next">
            <li><span className="n">1</span><span><b>We confirm your course</b>Based on your licence and rank.</span></li>
            <li><span className="n">2</span><span><b>We check your funding</b>SSG, SkillsFuture Credit and other schemes.</span></li>
            <li><span className="n">3</span><span><b>We send the next class dates</b>On WhatsApp, usually within 1 business day.</span></li>
          </ol>
          <div className="f-alt"><WaLink loc="form_side"><Icon name="wa" />Prefer to chat? WhatsApp us</WaLink></div>
        </div>
        <div>
          <div className={`ff${autoHeight ? ' auto' : ''}${open ? ' open' : ''}`} id="ff" ref={wrap}>
            <iframe ref={frame} id="splus-form" title="ETANN course enquiry form" src={src}
              referrerPolicy="strict-origin-when-cross-origin" style={autoHeight ? { height: autoHeight } : undefined}
              onLoad={() => { if (src) loaded.current = true; }} />
            <span className="ff-ph">Loading form…</span>
            {down && (
              <div className="ff-down" role="alert">
                <span className="ff-down-ic"><Icon name="alert" /></span>
                <h3>The form isn't loading right now</h3>
                <p>Our enquiry form is temporarily unavailable. You can still reach our team directly. We usually reply within 1 business day.</p>
                <WaLink loc="form_unavailable" className="btn btn-wa btn-block" msg="Hi ETANN, the enquiry form on your page wasn't loading. I'd like to check my course and funding."><Icon name="wa" />WhatsApp ETANN</WaLink>
                <a className="btn btn-glass-dark btn-block" href={`tel:${CONFIG.phone}`} data-cta="form_unavailable_call" onClick={() => track('cta_click', { cta: 'form_unavailable_call' })}><Icon name="phone" />Call {CONFIG.phoneDisplay}</a>
                <button type="button" className="link-btn ff-retry" onClick={retry}>Try the form again</button>
              </div>
            )}
            <noscript><p className="ff-nojs">The enquiry form needs JavaScript. You can also <a href={`https://wa.me/${CONFIG.wa}`}>WhatsApp us at {CONFIG.waDisplay}</a>.</p></noscript>
          </div>
          <p className="f-privacy">Your details go only to ETANN Academy. See our <a href={CONFIG.privacyUrl} target="_blank" rel="noopener">Privacy Policy</a>.</p>
        </div>
      </div>
    </section>
  );
}
