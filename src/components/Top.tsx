import { useEffect, useState } from 'react';
import { CONFIG, courseUrl } from '../config';
import { STATS } from '../data/content';
import { useGuide } from '../lib/guide';
import { useRating, useReviews } from '../lib/reviews';
import type { Role } from '../data/courses';
import { track } from '../lib/analytics';
import { Icon, type IconName } from './Icon';
import { Cta, OutLink, WaLink } from './Links';
import { HeroBento } from './Gallery';

const DEADLINE_MS = new Date(CONFIG.deadline).getTime();

function remaining(now: number) {
  const ms = Math.max(0, DEADLINE_MS - now);
  return { days: Math.ceil(ms / 864e5), d: Math.floor(ms / 864e5), h: Math.floor(ms / 36e5) % 24, m: Math.floor(ms / 6e4) % 60 };
}

/** Time to the deadline. First render uses the build time (matches the static HTML), then goes live. */
export function useCountdown(tickMs = 30000) {
  const [now, setNow] = useState(__BUILD_TS__);
  useEffect(() => {
    setNow(Date.now());
    const t = setInterval(() => setNow(Date.now()), tickMs);
    return () => clearInterval(t);
  }, [tickMs]);
  return remaining(now);
}
export const useDaysLeft = () => useCountdown().days;

/** Ad message-match copy: all variants render, CSS shows the one matching <html data-v>. */
export function V({ d, obse, prsf, nw }: { d: React.ReactNode; obse: React.ReactNode; prsf: React.ReactNode; nw: React.ReactNode }) {
  return <>
    <span className="vx vx-default">{d}</span><span className="vx vx-obse">{obse}</span>
    <span className="vx vx-prsf">{prsf}</span><span className="vx vx-new">{nw}</span>
  </>;
}

export function Logo({ height = 44 }: { height?: number }) {
  return <img src="img/etann-logo.svg" alt="ETANN Academy" width={Math.round(height * 1290 / 600)} height={height} className="logo" />;
}

/** Real Google reviewers + live rating under the hero CTAs (same height before/after load, so no layout shift). */
function HeroProof() {
  const g = useReviews();
  const live = g.status === 'live' && g.rating;
  const faces = g.reviews.slice(0, 4);
  return (
    <a className={`h-proof${live ? ' on' : ''}`} href={g.placeUrl || CONFIG.reviewsUrl} target="_blank" rel="noopener" data-cta="hero_google_proof">
      {live ? <>
        <span className="h-faces" aria-hidden="true">
          {faces.map((r, i) => r.photo
            ? <img key={i} src={r.photo} alt="" width={36} height={36} referrerPolicy="no-referrer" />
            : <span key={i}>{r.author.slice(0, 1).toUpperCase()}</span>)}
        </span>
        <span className="h-txt"><b>{g.rating}<span className="h-star">★</span> on Google</b>from {g.count ? g.count.toLocaleString('en-SG') : ''} learner reviews</span>
      </> : <>
        <span className="h-badge" aria-hidden="true"><Icon name="shield" /></span>
        <span className="h-txt"><b>SSG-approved</b>WSQ training provider in Singapore</span>
      </>}
      <Icon name="ext" />
    </a>
  );
}

export function Hero() {
  return (
    <section className="hero" data-anim>
      <div className="wrap hero-top"><Logo /></div>
      <div className="wrap hero-grid">
        <div className="hero-copy">
          <h1>
            <V d={<>Existing Security Officer? <em>Stay deployable</em> in 2027.</>}
              obse={<><em>OBSE training</em> for existing Security Officers</>}
              prsf={<><em>PRSF training</em> for Senior Security Officers</>}
              nw={<>Start your <em>security officer</em> career in Singapore</>} />
          </h1>
          <p className="hero-sub">
            <V d="Complete your required training before the 31 December 2026 deadline."
              obse="Complete your Access Control Management (OBSE) module before 31 December 2026."
              prsf="Complete your Security Surveillance Management (PRSF) module before 31 December 2026."
              nw="Find the Basic Licensing courses you need for your first security officer licence." />
          </p>
          <p className="hero-txt">Check which course you may need, understand your funding options and connect with ETANN for the next available class.</p>
          <div className="hero-ctas">
            <Cta to="#situation" id="hero_primary" className="btn btn-primary">
              <V d="Check My Course" obse="Check My OBSE Requirement" prsf="Check My PRSF Requirement" nw="Find My Required Course" />
              <Icon name="arrow" />
            </Cta>
            <WaLink loc="hero" className="btn btn-glass"><Icon name="wa" className="ico wa-green" />WhatsApp ETANN</WaLink>
          </div>
          <p className="hero-meta"><Icon name="check" />Takes about 60 seconds · No obligation</p>
          <HeroProof />
        </div>
        <HeroBento />
      </div>
    </section>
  );
}

export function Deadline() {
  const { d, h, m } = useCountdown();
  const pad = (n: number) => String(n).padStart(2, '0');
  const rows: { icon: IconName; who: string; code: string; title: string; text: string; slug: string }[] = [
    { icon: 'shield', who: 'Existing Security Officer', code: 'OBSE', title: 'Access Control Management', text: 'Operate Basic Security Equipment module.', slug: 'access-control-management' },
    { icon: 'cam', who: 'Existing Senior Security Officer', code: 'PRSF', title: 'Security Surveillance Management', text: 'Perform Remote Surveillance Function module.', slug: 'security-surveillance-management' },
  ];
  return (
    <section className="dl" id="deadline" aria-labelledby="dl-h">
      <div className="wrap">
        <div className="dl-card glass">
          <div className="dl-top">
            <span className="kicker red"><Icon name="alert" />Important training deadline</span>
            <h2 className="dl-date" id="dl-h"><em>31 Dec</em> 2026</h2>
            <p>Applicable existing Security Officers and Senior Security Officers need to complete the required training by the deadline to maintain deployment eligibility from 1 January 2027.</p>
            <div className="count" role="timer" aria-label={`${d} days, ${h} hours and ${m} minutes left`}>
              <div><b>{d}</b><span>days</span></div>
              <div><b>{pad(h)}</b><span>hours</span></div>
              <div><b>{pad(m)}</b><span>mins</span></div>
            </div>
          </div>
          <div className="dl-rows">
            {rows.map(r => (
              <div className="dl-row" key={r.code}>
                <div className="dl-row-top"><span className="dl-ic"><Icon name={r.icon} /></span><span className="dl-code">{r.code}</span></div>
                <span className="dl-who">{r.who}</span>
                <h3>{r.title}</h3>
                <p>{r.text}</p>
                <span className="tag">Complete by 31 Dec 2026</span>
                <OutLink href={courseUrl(r.slug)} id={`deadline_${r.code.toLowerCase()}`} className="dl-link">View {r.code} course details<Icon name="ext" /></OutLink>
              </div>
            ))}
          </div>
        </div>
        <p className="dl-src">Source: Singapore Police Force, <a href={CONFIG.spfUrl} target="_blank" rel="noopener">Security Progressive Wage Model requirements</a>. Classes typically get busier as the deadline approaches.</p>
      </div>
    </section>
  );
}

const TILES: { role: Role | 'unsure'; icon: IconName; title: string; sub: React.ReactNode }[] = [
  { role: 'so', icon: 'shield', title: 'Existing Security Officer', sub: <>Usually needs <b>OBSE</b></> },
  { role: 'sso', icon: 'starUser', title: 'Senior Security Officer', sub: <>Usually needs <b>PRSF</b></> },
  { role: 'new', icon: 'plus', title: 'New to Security', sub: <><b>Basic Licensing</b> pathway</> },
  { role: 'sup', icon: 'up', title: 'Supervisor / Above', sub: <><b>PWM progression</b> modules</> },
];

export function Situation() {
  const { role, pick, chooseRole } = useGuide();
  const active = role || (pick === 'unsure' ? 'unsure' : '');
  const go = (r: Role | 'unsure') => {
    track('course_option_clicked', { option: r });
    chooseRole(r, 'situation_card');
    window.dispatchEvent(new Event('etann:loadform'));
    document.getElementById('form')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };
  return (
    <section className="sec" id="situation" aria-labelledby="sit-h">
      <div className="wrap">
        <div className="head reveal">
          <h2 id="sit-h">Which describes you?</h2>
          <p className="lead">Pick the one closest to you, then fill in the short form below. Our team confirms the right course before anything is booked.</p>
        </div>
        <div className="tiles reveal">
          {TILES.map((t, i) => (
            <button key={t.role} type="button" className={`tile${active === t.role ? ' sel' : ''}`} data-role={t.role} onClick={() => go(t.role)}>
              <span className="t-num">0{i + 1}</span>
              <span className="t-ic"><Icon name={t.icon} /></span>
              <span className="t-body"><span className="t-t">{t.title}</span><span className="t-c">{t.sub}</span></span>
              <span className="t-go"><Icon name="arrow" /></span>
            </button>
          ))}
          <button type="button" className={`tile unsure${active === 'unsure' ? ' sel' : ''}`} data-role="unsure" onClick={() => go('unsure')}>
            <span className="t-ic"><Icon name="q" /></span>
            <span className="t-body"><span className="t-t">Not sure which course you need?</span><span className="t-c">Check with ETANN and we'll confirm it for you</span></span>
            <span className="t-go"><Icon name="arrow" /></span>
          </button>
        </div>
        <div className="agency reveal">
          <span className="ag-ic"><Icon name="team" /></span>
          <p><b>Security agency or employer?</b> Book training for your officers, with help on SSG funding and Absentee Payroll.</p>
          <WaLink loc="agency" className="btn btn-outline btn-sm" msg="Hi ETANN, I'm from a security agency and would like to arrange training for our officers.">
            <Icon name="wa" className="ico wa-green" />Talk to us
          </WaLink>
        </div>
      </div>
    </section>
  );
}

export function TrustBar() {
  const rating = useRating();
  const items: { icon: IconName; b: string; s: string; count?: boolean }[] = [
    { icon: 'shield', b: 'SSG', s: 'approved training provider' },
    { icon: 'cap', b: STATS.trained, s: 'security officers trained', count: true },
    rating ? { icon: 'star', b: rating, s: 'Google rating out of 5' } : { icon: 'star', b: 'Google', s: 'reviews from our learners' },
    { icon: 'pin', b: 'SG', s: 'centre at Arumugam Road' },
  ];
  return (
    <section className="trust" aria-label="Why learners trust ETANN">
      <div className="trust-grid-bg" aria-hidden="true" />
      <div className="wrap trust-grid">
        {items.map(i => (
          <div className="ts" key={i.s}>
            <span className="ts-ic"><Icon name={i.icon} /></span>
            <b {...(i.count ? { 'data-count': '' } : {})}>{i.b}</b>
            <span>{i.s}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
