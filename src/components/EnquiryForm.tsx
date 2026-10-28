import { useEffect, useId, useRef, useState, type FormEvent, type KeyboardEvent } from 'react';
import { CONFIG } from '../config';
import { track } from '../lib/analytics';
import { useGuide } from '../lib/guide';
import { WaLink } from './Links';
import { Icon } from './Icon';

/**
 * Course enquiry form: the same two-step design and fields as the SPlus LeadCourseForm, built into the page.
 * It posts the same payload to the same SPlus endpoint (SaveLeadCourseForm), so leads still land in SPlus.
 * Course and country IDs are SPlus's own (from the LeadCourseForm, client 36); update them here if SPlus changes them.
 */
const COURSES = [
  { id: 12, cat: 5, name: 'ACCESS CONTROL MANAGEMENT' },
  { id: 16, cat: 7, name: 'CAPABILITY DEVELOPMENT' },
  { id: 20, cat: 8, name: 'CROWD & TRAFFIC CONTROL MANAGEMENT' },
  { id: 18, cat: 8, name: 'DETERRENCE' },
  { id: 13, cat: 6, name: 'DETERRENCE' },
  { id: 7, cat: 5, name: 'GUARD & PATROL-ACCESS CONTROL MANAGEMENT (PGPS & OBSE)' },
  { id: 15, cat: 7, name: 'GUARD AND PATROL' },
  { id: 8, cat: 5, name: 'INCIDENT RESPONSE' },
  { id: 17, cat: 7, name: 'SECURITY OPERATION COMPLIANCE' },
  { id: 19, cat: 8, name: 'SECURITY SCREENING MANAGEMENT' },
  { id: 14, cat: 6, name: 'SECURITY SURVEILLANCE MANAGEMENT' },
  { id: 10, cat: 5, name: 'THREAT OBSERVATION' },
];
const COUNTRIES = [
  [1, 'SG (65)'], [2, 'MY (60)'], [3, 'IN (91)'], [4, 'KR (82)'], [5, 'JP (81)'], [6, 'USA (1)'], [7, 'CH (+86)'],
  [8, 'TW (+886)'], [9, 'TH (+66)'], [10, 'VT (+84)'], [11, 'PH (+63)'], [12, 'UAE (+971)'], [13, 'IDN (62)'], [14, 'MM (+95)'],
] as const;
const SPCLIENT_ID = 36;

type Licensed = '' | 'yes' | 'no';

/** generate_lead "situation" from what the visitor sent. */
function situation(licensed: Licensed, courseId: number) {
  if (licensed === 'no') return 'new';
  if (courseId === 12) return 'obse';
  if (courseId === 14) return 'prsf';
  if (COURSES.find(c => c.id === courseId)?.cat === 7) return 'supervisor';
  return 'unsure';
}

export function EnquiryForm() {
  const box = useRef<HTMLDivElement>(null);
  const { role, pick } = useGuide();
  const [step, setStep] = useState<1 | 2 | 'done'>(1);
  const [licensed, setLicensed] = useState<Licensed>('');
  const [course, setCourse] = useState('');
  const [name, setName] = useState('');
  const [country, setCountry] = useState('1');
  const [phone, setPhone] = useState('');
  const [hp, setHp] = useState(''); // honeypot: real visitors never see or fill it
  const [err1, setErr1] = useState('');
  const [err2, setErr2] = useState('');
  const [failed, setFailed] = useState(false);
  const [sending, setSending] = useState(false);
  const touched = useRef(false);
  const ids = useId();

  // The "Which describes you?" tiles pre-fill step 1, until the visitor changes it themselves.
  useEffect(() => {
    if (touched.current || !role) return;
    setLicensed(role === 'new' ? 'no' : 'yes');
    setCourse(pick === 'obse' ? '12' : pick === 'prsf' ? '14' : '');
  }, [role, pick]);

  // form_viewed, and form_interaction on the first focus inside the form.
  useEffect(() => {
    const el = box.current!;
    const io = 'IntersectionObserver' in window
      ? new IntersectionObserver(en => { if (en[0].isIntersecting) { track('form_viewed'); io!.disconnect(); } }, { threshold: 0.3 })
      : undefined;
    io?.observe(el);
    const onFocus = () => { track('form_interaction', { role: role || '(none)', course: pick || '(none)' }); el.removeEventListener('focusin', onFocus); };
    el.addEventListener('focusin', onFocus);
    return () => { io?.disconnect(); el.removeEventListener('focusin', onFocus); };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const pickLicensed = (v: Licensed) => { touched.current = true; setLicensed(v); setErr1(''); };
  const pickCourse = (v: string) => { touched.current = true; setCourse(v); setErr1(''); };

  const goStep2 = () => {
    if (!licensed) return setErr1('Please tell us whether you are licensed.');
    if (!course) return setErr1('Please select a course.');
    setStep(2);
    track('form_step', { step: 2, licensed, course: COURSES.find(c => String(c.id) === course)?.name });
  };

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    const n = name.trim(), p = phone.trim(), countryid = parseInt(country) || null;
    if (!n) return setErr2('Please enter your full name.');
    if (!countryid) return setErr2('Please select a country.');
    if (p.length < 6) return setErr2('Please enter a valid WhatsApp number.');
    const c = COURSES.find(x => String(x.id) === course)!;
    const sit = situation(licensed, c.id);
    const done = () => {
      setStep('done');
      track('form_submission', { course: c.name, situation: sit });
      track('generate_lead', { course: c.name, situation: sit, form: 'lp_native' });
    };
    if (hp) { done(); return; } // bot: pretend it worked, send nothing

    setSending(true); setErr2(''); setFailed(false);
    try {
      const res = await fetch(CONFIG.leadApi, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json; charset=utf-8' },
        body: JSON.stringify({
          name: n, phone: p, countryid,
          coursecat: c.cat || null, courseid: c.id || null, course: c.name,
          islicensed: licensed, spclientId: SPCLIENT_ID, formtypeid: null,
        }),
      });
      if (!res.ok) throw new Error(`Server error (${res.status})`);
      const data = await res.json();
      if (data?.EmpStatus === true && data?.Status === true && data?.Data?.result === 1) done();
      else { setErr2(data?.Message || 'Something went wrong. Please try again.'); track('form_error', { reason: 'rejected' }); }
    } catch (x) {
      // Network or CORS failure: keep the lead by offering WhatsApp with their details filled in.
      setFailed(true);
      setErr2("We couldn't send your enquiry just now. Please try again, or send it to us on WhatsApp.");
      track('form_error', { reason: String((x as Error)?.message || x).slice(0, 80) });
    } finally {
      setSending(false);
    }
  };

  const courseName = COURSES.find(c => String(c.id) === course)?.name || '';
  const waMsg = `Hi ETANN, I'd like course advice. Name: ${name.trim()}. Licensed security officer: ${licensed === 'yes' ? 'Yes' : 'No'}. Course: ${courseName}.`;

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

        <div className="ca-card" id="ff" ref={box}>
          <div className="ca-stepper" aria-hidden="true">
            <div className="ca-step">
              <div className={`ca-badge ${step === 1 ? 'active' : 'done'}`}><span>{step === 1 ? '1' : '✓'}</span></div>
              <span className={`ca-step-label${step === 1 ? ' active' : ''}`}>Your situation</span>
            </div>
            <div className="ca-line" />
            <div className="ca-step">
              <div className={`ca-badge${step === 1 ? '' : step === 2 ? ' active' : ' done'}`}><span>{step === 'done' ? '✓' : '2'}</span></div>
              <span className={`ca-step-label${step === 2 ? ' active' : ''}`}>Contact details</span>
            </div>
          </div>

          {step === 1 && (
            <div>
              <h3 className="ca-title">Get Free Course Advice</h3>
              <p className="ca-sub">Tell us your situation and we'll confirm which course you need within 1 business day.</p>
              <div className="ca-label" id={`${ids}lic`}>Are you currently a licensed Security Officer? <span className="ca-req">*</span></div>
              <div className="ca-opts" role="radiogroup" aria-labelledby={`${ids}lic`}>
                {([['yes', "Yes, I'm licensed"], ['no', "No, I'm new"]] as const).map(([v, t]) => (
                  <button key={v} type="button" role="radio" aria-checked={licensed === v} className={`ca-opt${licensed === v ? ' sel' : ''}`} onClick={() => pickLicensed(v)}>
                    <span className="ca-radio"><i /></span><span>{t}</span>
                  </button>
                ))}
              </div>
              <div className="ca-label" id={`${ids}course`}>Which course are you interested in? <span className="ca-req">*</span></div>
              <div className="ca-select-wrap">
                <SearchSelect labelId={`${ids}course`} value={course} onChange={pickCourse} placeholder="Select a course" search="Search course…"
                  options={COURSES.map(c => ({ value: String(c.id), label: c.name }))} />
              </div>
              {err1 && <div className="ca-err" role="alert" style={{ margin: '-14px 0 18px' }}>{err1}</div>}
              <button type="button" className="ca-btn ca-btn-primary" onClick={goStep2}>Continue → Step 2 of 2 →</button>
            </div>
          )}

          {step === 2 && (
            <form onSubmit={submit} noValidate>
              <h3 className="ca-title">Almost there!</h3>
              <p className="ca-sub">Leave your contact details and we'll reach out within 1 business day.</p>
              <label className="ca-label" htmlFor={`${ids}name`}>Full Name <span className="ca-req">*</span></label>
              <input id={`${ids}name`} className="ca-input" type="text" autoComplete="name" placeholder="e.g. Ahmad bin Yusof"
                value={name} onChange={e => { setName(e.target.value); setErr2(''); }} />
              <label className="ca-label" htmlFor={`${ids}phone`} id={`${ids}wa`} style={{ marginTop: 22 }}>WhatsApp Number <span className="ca-req">*</span></label>
              <div className="ca-contact">
                <div className="ca-country-select">
                  <SearchSelect labelId={`${ids}wa`} value={country} onChange={v => { setCountry(v); setErr2(''); }} placeholder="Country" search="Search country…"
                    options={COUNTRIES.map(([v, l]) => ({ value: String(v), label: l }))} />
                </div>
                <input id={`${ids}phone`} className="ca-input" type="tel" inputMode="tel" autoComplete="tel-national" placeholder="9123 4567"
                  value={phone} onChange={e => { setPhone(e.target.value); setErr2(''); }} />
              </div>
              <input className="ca-hp" type="text" name="company" tabIndex={-1} autoComplete="off" aria-hidden="true" value={hp} onChange={e => setHp(e.target.value)} />
              {err2 && <div className="ca-err" role="alert" style={{ marginTop: 14 }}>{err2}</div>}
              {failed && <WaLink loc="form_failed" className="btn btn-wa btn-block ca-wa" msg={waMsg}><Icon name="wa" />Send on WhatsApp</WaLink>}
              <button type="submit" className="ca-btn ca-btn-navy" disabled={sending}>{sending ? 'Sending…' : 'Send My Enquiry'}</button>
              <button type="button" className="ca-btn ca-btn-back" onClick={() => { setStep(1); setErr2(''); setFailed(false); }}>← Back</button>
              <p className="ca-note">By submitting you agree to our <a href={CONFIG.privacyUrl} target="_blank" rel="noopener">Privacy Policy</a>. Your details are never shared with third parties.</p>
            </form>
          )}

          {step === 'done' && (
            <div className="ca-success" role="status">
              <div className="ca-success-icon" aria-hidden="true">✓</div>
              <h3>Enquiry sent!</h3>
              <p>Thanks {name.trim().split(' ')[0] || 'there'}, our team will reach out on WhatsApp within 1 business day.</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

/** Searchable dropdown, matching the SPlus form's: a trigger button, a search box and a scrollable list. */
function SearchSelect({ value, onChange, options, placeholder, search, labelId }:
  { value: string; onChange: (v: string) => void; options: { value: string; label: string }[]; placeholder: string; search: string; labelId: string }) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState('');
  const [active, setActive] = useState(0);
  const root = useRef<HTMLDivElement>(null), trigger = useRef<HTMLButtonElement>(null);
  const input = useRef<HTMLInputElement>(null), list = useRef<HTMLDivElement>(null);
  const listId = useId();
  const shown = options.filter(o => !q || o.label.toLowerCase().includes(q.trim().toLowerCase()));
  const current = options.find(o => o.value === value);

  useEffect(() => {
    if (!open) return;
    setQ(''); input.current?.focus();
    const i = Math.max(0, options.findIndex(o => o.value === value)); setActive(i);
    const sel = list.current?.children[i] as HTMLElement | undefined;
    if (sel && list.current) list.current.scrollTop = sel.offsetTop - list.current.clientHeight / 2;
    const away = (e: PointerEvent) => { if (!root.current?.contains(e.target as Node)) setOpen(false); };
    document.addEventListener('pointerdown', away);
    return () => document.removeEventListener('pointerdown', away);
  }, [open]); // eslint-disable-line react-hooks/exhaustive-deps

  const choose = (v: string) => { onChange(v); setOpen(false); trigger.current?.focus(); };
  const onKey = (e: KeyboardEvent) => {
    if (e.key === 'Escape') { e.preventDefault(); setOpen(false); trigger.current?.focus(); }
    else if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault();
      const n = Math.min(shown.length - 1, Math.max(0, active + (e.key === 'ArrowDown' ? 1 : -1)));
      setActive(n); (list.current?.children[n] as HTMLElement | undefined)?.scrollIntoView({ block: 'nearest' });
    } else if (e.key === 'Enter') { e.preventDefault(); const o = shown[active] || shown[0]; if (o) choose(o.value); }
  };

  return (
    <div className={`ca-ss${open ? ' open' : ''}`} ref={root}>
      <button type="button" ref={trigger} className={`ca-ss-trigger${value ? ' filled' : ''}`} aria-haspopup="listbox" aria-expanded={open}
        aria-labelledby={labelId} aria-describedby={undefined} onClick={() => setOpen(o => !o)}>
        <span className="ca-ss-text">{current?.label || placeholder}</span>
      </button>
      <span className="ca-select-arrow" aria-hidden="true">▼</span>
      {open && (
        <div className="ca-ss-panel">
          <div className="ca-ss-search">
            <input ref={input} type="text" autoComplete="off" spellCheck={false} placeholder={search} value={q}
              role="combobox" aria-expanded="true" aria-controls={listId} aria-activedescendant={shown[active] ? `${listId}-${active}` : undefined}
              onChange={e => { setQ(e.target.value); setActive(0); }} onKeyDown={onKey} />
          </div>
          <div className="ca-ss-list" role="listbox" id={listId} ref={list} aria-labelledby={labelId}>
            {shown.map((o, i) => (
              <div key={o.value} id={`${listId}-${i}`} role="option" aria-selected={o.value === value}
                className={`ca-ss-opt${o.value === value ? ' selected' : ''}${i === active ? ' active' : ''}`}
                onMouseEnter={() => setActive(i)} onClick={() => choose(o.value)}>{o.label}</div>
            ))}
            {!shown.length && <div className="ca-ss-empty">No matches</div>}
          </div>
        </div>
      )}
    </div>
  );
}
