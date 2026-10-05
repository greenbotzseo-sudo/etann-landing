import { useEffect, useRef, useState } from 'react';
import { CONFIG } from '../config';
import { track } from '../lib/analytics';
import { Icon } from './Icon';
import { WaLink } from './Links';

/**
 * Chat-style contact widget (bottom right): the page's WhatsApp and phone contact.
 * Quick replies open WhatsApp with a matching pre-filled message; nothing is sent from the page itself.
 * A short greeting appears once per visit after 8s (not on first paint), and is easy to dismiss.
 */
const REPLIES = [
  { id: 'obse', label: 'OBSE for existing Security Officers', msg: 'Hi ETANN, I am an existing Security Officer and need to complete OBSE before 31 Dec 2026.' },
  { id: 'prsf', label: 'PRSF for Senior Security Officers', msg: 'Hi ETANN, I am an existing Senior Security Officer and need to complete PRSF before 31 Dec 2026.' },
  { id: 'new', label: "I'm new to security", msg: 'Hi ETANN, I am new to security and want to ask about the Basic Licensing courses.' },
  { id: 'other', label: 'Funding or another question', msg: 'Hi ETANN, I have a question about your security courses and funding.' },
];
const SEEN_KEY = 'etann_chat_greeted';

export function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [greet, setGreet] = useState(false);
  const panel = useRef<HTMLDivElement>(null);
  const btn = useRef<HTMLButtonElement>(null);

  // One gentle greeting per visit
  useEffect(() => {
    let seen = false;
    try { seen = sessionStorage.getItem(SEEN_KEY) === '1'; } catch { /* storage blocked */ }
    if (seen) return;
    const t = window.setTimeout(() => setGreet(true), 8000);
    return () => window.clearTimeout(t);
  }, []);
  const dismissGreet = () => { setGreet(false); try { sessionStorage.setItem(SEEN_KEY, '1'); } catch { /* ignore */ } };

  const toggle = () => {
    setOpen(o => {
      track('cta_click', { cta: o ? 'chat_close' : 'chat_open' });
      return !o;
    });
    dismissGreet();
  };

  // Esc closes; focus moves into the panel when it opens and back to the button when it closes
  useEffect(() => {
    if (!open) return;
    panel.current?.querySelector<HTMLElement>('a,button')?.focus();
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') { setOpen(false); btn.current?.focus(); } };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  return (
    <div className={`chat${open ? ' open' : ''}`}>
      {open && (
        <div className="chat-panel" id="chat-panel" role="dialog" aria-label="Chat with ETANN" ref={panel}>
          <div className="chat-head">
            <img src="img/etann-logo.svg" alt="" width={60} height={28} />
            <span><b>ETANN Academy</b><span className="chat-hrs"><span className="chat-dot" />{CONFIG.hours}</span></span>
            <button type="button" className="chat-x" onClick={toggle} aria-label="Close chat"><Icon name="x" /></button>
          </div>
          <div className="chat-body">
            <p className="chat-msg">Hi! Which course can we help you with? Pick one and we'll continue on WhatsApp.</p>
            <ul className="chat-replies">
              {REPLIES.map(r => (
                <li key={r.id}><WaLink loc={`chat_${r.id}`} className="chat-reply" msg={r.msg}>{r.label}<Icon name="arrow" /></WaLink></li>
              ))}
            </ul>
          </div>
          <div className="chat-foot">
            <WaLink loc="chat_whatsapp" className="chat-act wa"><Icon name="wa" />WhatsApp {CONFIG.waDisplay}</WaLink>
            <a className="chat-act" href={`tel:${CONFIG.phone}`} data-cta="chat_call" onClick={() => track('cta_click', { cta: 'chat_call' })}><Icon name="phone" />Call {CONFIG.phoneDisplay.replace('(+65) ', '')}</a>
          </div>
        </div>
      )}
      {greet && !open && (
        <div className="chat-greet" role="status">
          <button type="button" className="chat-greet-txt" onClick={toggle}>Need help choosing a course? Chat with us.</button>
          <button type="button" className="chat-greet-x" onClick={dismissGreet} aria-label="Dismiss message"><Icon name="x" /></button>
        </div>
      )}
      <button type="button" className="chat-btn" ref={btn} onClick={toggle} aria-expanded={open} aria-controls="chat-panel"
        aria-label={open ? 'Close chat' : 'Chat with ETANN on WhatsApp or phone'}>
        <Icon name={open ? 'x' : 'chat'} />
        {!open && <span className="chat-online" aria-hidden="true" />}
      </button>
    </div>
  );
}
