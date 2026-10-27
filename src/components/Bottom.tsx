import { useEffect, useRef } from 'react';
import { CONFIG, mainSite } from '../config';
import { FACTORS, FAQS, FUNDING, STATS, STEPS, WHY } from '../data/content';
import { Icon, Stars, type IconName } from './Icon';
import { Cta, OutLink, WaLink } from './Links';
import { Logo } from './Top';
import { Marquee } from './Marquee';
import { Spot } from './Illustrations';
import { ReviewsWidget } from './ReviewsWidget';
import { useRating, useReviews, type LiveReview } from '../lib/reviews';

export function Funding() {
  return (
    <section className="sec soft" id="funding" aria-labelledby="fu-h">
      <div className="wrap fund-grid">
        <div className="reveal">
          <h2 id="fu-h">Course fees and funding</h2>
          <p className="lead">There's no single price for everyone. What you pay depends on:</p>
          <ul className="factors">{FACTORS.map(f => <li key={f}><Icon name="check" />{f}</li>)}</ul>
          <p className="fund-note">Funding is subject to SSG and scheme eligibility rules at the time of enrolment. Employer-sponsored learners may also be eligible for Absentee Payroll. Our team works out your actual amount before you commit.</p>
          <div className="fund-cta">
            <Cta to="#form" id="funding" className="btn btn-primary">Check My Funding<Icon name="arrow" /></Cta>
            <OutLink href={mainSite('/course-fees-and-funding/', 'funding')} id="funding_page" className="text-link">Fees &amp; funding guide<Icon name="ext" /></OutLink>
          </div>
        </div>
        <div className="schemes reveal">
          {FUNDING.map(f => (
            <div className="scheme" key={f.name}>
              <div className="s-amt"><small>{f.pre}</small><span>{f.amt}</span></div>
              <div><h3>{f.name}</h3><p>{f.text}</p><span className="who">{f.who}</span></div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function Why() {
  const rating = useRating();
  return (
    <section className="sec why" id="why" aria-labelledby="why-h">
      <div className="wrap why-grid">
        <div className="why-side reveal">
          <h2 id="why-h">Why train with ETANN</h2>
          <p className="lead">ETANN Consultants Pte Ltd is an SSG-approved training provider for WSQ security courses, with classes at our own centre in Singapore.</p>
          <figure className="why-photo">
            <img src="img/class/e1-600.webp" srcSet="img/class/e1-600.webp 600w, img/class/e1-1100.webp 1100w" sizes="(min-width:900px) 440px, 100vw"
              width={1100} height={830} alt="ETANN instructor teaching a class of learners" loading="lazy" decoding="async" />
          </figure>
          <dl className="why-stats">
            <div><dt>Officers trained</dt><dd data-count>{STATS.trained}</dd></div>
            {rating && <div><dt>Google rating</dt><dd>{rating}<span className="why-star">★</span></dd></div>}
          </dl>
          <Cta to="#form" id="why_feature" className="btn btn-primary">Check my course<Icon name="arrow" /></Cta>
        </div>
        <ul className="why-list reveal">
          {WHY.map(w => (
            <li key={w.title}>
              <Spot name={w.icon} />
              <div><h3>{w.title}</h3><p>{w.text}</p></div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

/** A review straight from Google: author (linked to their Google profile), stars, time, unaltered text. */
function GoogleReview({ r }: { r: LiveReview }) {
  const initials = r.author.split(/\s+/).map(w => w[0]).slice(0, 2).join('').toUpperCase();
  const name = r.authorUrl ? <a href={r.authorUrl} target="_blank" rel="noopener nofollow">{r.author}</a> : r.author;
  return (
    <figure className="tq tq-g">
      <div className="tq-top"><Stars size={17} value={r.rating} /><span className="g-src">Google</span></div>
      <blockquote>{r.text}</blockquote>
      <figcaption>
        {r.photo
          ? <img className="av av-img" src={r.photo} alt="" width={46} height={46} loading="lazy" referrerPolicy="no-referrer" />
          : <span className="av">{initials}</span>}
        <span><b>{name}</b><span className="r">{r.when}</span></span>
      </figcaption>
    </figure>
  );
}

export function Testimonials() {
  const g = useReviews();
  const section = useRef<HTMLElement>(null);
  // Load Google reviews only as the visitor approaches this section.
  useEffect(() => {
    const el = section.current;
    if (!el || !('IntersectionObserver' in window)) { g.request(); return; }
    const io = new IntersectionObserver(en => { if (en[0].isIntersecting) { g.request(); io.disconnect(); } }, { rootMargin: '900px 0px' });
    io.observe(el);
    return () => io.disconnect();
  }, [g.request]);

  const live = g.status === 'live' && g.reviews.length > 0;
  const googleUrl = g.placeUrl || CONFIG.reviewsUrl;
  return (
    <section className="sec soft" aria-labelledby="t-h" ref={section} id="reviews">
      <div className="wrap">
        <div className="head head-row reveal">
          <div>
            <h2 id="t-h">What our learners say on Google</h2>
          </div>
          <a className="g-summary" href={googleUrl} target="_blank" rel="noopener" data-cta="google_reviews">
            <span className="g-badge" aria-hidden="true">G</span>
            {g.rating && <span className="g-score"><b>{g.rating}</b><Stars size={15} value={Number(g.rating)} /></span>}
            <span className="g-count">{g.count ? `${g.count.toLocaleString('en-SG')} Google reviews` : 'Google reviews'}<Icon name="ext" /></span>
          </a>
        </div>
        {!live && CONFIG.reviewsWidget
          ? <ReviewsWidget src={CONFIG.reviewsWidget} />
          : live
          ? <Marquee label="Google reviews of ETANN" speed={35} className="t-mq">
              {g.reviews.map((r, i) => <GoogleReview key={`${r.author}-${i}`} r={r} />)}
            </Marquee>
          : /* No live reviews (key not set, loading or failed): never show made-up quotes; link to the real ones. */
            <div className="g-empty reveal" aria-busy={g.status === 'loading'}>
              <span className="g-badge" aria-hidden="true">G</span>
              <p><b>Read real reviews from ETANN learners</b>See what officers who trained with us say on our Google listing.</p>
              <a className="btn btn-outline" href={googleUrl} target="_blank" rel="noopener" data-cta="google_reviews_empty">Open Google reviews<Icon name="ext" /></a>
            </div>}
        {live && (
          <p className="g-attr">
            Reviews and rating from <a href={googleUrl} target="_blank" rel="noopener">Google Maps</a>, shown as published.{' '}
            <a href={googleUrl} target="_blank" rel="noopener" data-cta="google_reviews_all">Read all reviews</a>
          </p>
        )}
      </div>
    </section>
  );
}

export function Steps() {
  return (
    <section className="sec" aria-labelledby="s-h">
      <div className="wrap">
        <div className="head reveal">
          <h2 id="s-h">How to enrol</h2>
        </div>
        <ol className="steps reveal">
          {STEPS.map(s => <li className="step" key={s.title}><span className="orb" aria-hidden="true" /><h3>{s.title}</h3><p>{s.text}</p></li>)}
        </ol>
      </div>
    </section>
  );
}

export function Faq() {
  return (
    <section className="sec soft" id="faq" aria-labelledby="faq-h">
      <div className="wrap faq-grid">
        <div className="faq-side reveal">
          <h2 id="faq-h">Common questions</h2>
          <div className="help">
            <h3>Still not sure?</h3>
            <p>Message us with your rank and licence status, and we'll tell you which course applies.</p>
            <WaLink loc="faq" />
          </div>
        </div>
        <div className="faq reveal">
          {FAQS.map(f => (
            <details key={f.q}>
              <summary>{f.q}</summary>
              <div className="a">
                <p>{f.a}</p>
                {f.link && <p><OutLink href={mainSite(f.link.path, 'faq')} id={`faq_${f.link.path.split('/').filter(Boolean).pop()}`} className="text-link">{f.link.label}<Icon name="ext" /></OutLink></p>}
              </div>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

export function FinalCta() {
  return (
    <section className="final" data-anim aria-labelledby="fin-h">
      <div className="wrap final-in">
        <div className="reveal">
          <h2 id="fin-h">Not sure which course you need?</h2>
          <p>Tell us your situation and we'll confirm the right course, your funding and the next class. Free, no obligation.</p>
          <div className="ctas">
            <Cta to="#form" id="final" className="btn btn-white">Check My Course &amp; Funding<Icon name="arrow" /></Cta>
            <WaLink loc="final" />
          </div>
        </div>
      </div>
    </section>
  );
}

export function Contact() {
  const items: { icon: IconName; k: string; v: string; href?: string; wa?: boolean; extra?: string }[] = [
    { icon: 'wa', k: 'WhatsApp', v: CONFIG.waDisplay, wa: true },
    { icon: 'phone', k: 'Phone', v: CONFIG.phoneDisplay, href: `tel:${CONFIG.phone}` },
    { icon: 'mail', k: 'Email', v: CONFIG.email, href: `mailto:${CONFIG.email}` },
    { icon: 'pin', k: 'Address', v: CONFIG.address, href: CONFIG.mapsUrl, extra: CONFIG.hours },
  ];
  return (
    <section className="sec contact-sec" id="contact" aria-labelledby="c-h">
      <div className="wrap">
        <div className="head reveal">
          <h2 id="c-h">Contact ETANN Academy</h2>
        </div>
        <div className="contact-grid reveal">
        <div className="contact">
          {items.map(i => {
            const inner = <><span className="ci-ic"><Icon name={i.icon} /></span><span><span className="k">{i.k}</span><span className="v">{i.v}</span>{i.extra && <span className="hrs">{i.extra}</span>}</span></>;
            return i.wa
              ? <WaLink key={i.k} loc="contact" className="ci">{inner}</WaLink>
              : <a key={i.k} className="ci" href={i.href} data-cta={i.k.toLowerCase()} {...(i.href?.startsWith('http') ? { target: '_blank', rel: 'noopener' } : {})}>{inner}</a>;
          })}
        </div>
        <div className="c-map">
          <iframe title="Map: ETANN Academy, 12 Arumugam Road, Singapore" loading="lazy" referrerPolicy="no-referrer-when-downgrade"
            src={`https://maps.google.com/maps?q=${encodeURIComponent('ETANN Consultants Pte Ltd, ' + CONFIG.address)}&z=16&output=embed`} />
          <a className="c-dir" href={CONFIG.mapsUrl} target="_blank" rel="noopener" data-cta="contact_directions"><Icon name="pin" />Get directions</a>
        </div>
        </div>
      </div>
    </section>
  );
}

export function Footer() {
  return (
    <footer className="foot">
      <div className="wrap foot-in">
        <Logo height={56} />
        <p>ETANN Consultants Pte Ltd · <b>UEN: {CONFIG.uen}</b> · SSG-approved training provider</p>
        <p className="foot-links">
          <OutLink href={mainSite('/', 'footer')} id="footer_main">etannacademy.com</OutLink> ·{' '}
          <a href={CONFIG.privacyUrl} target="_blank" rel="noopener">Privacy Policy</a> ·{' '}
          <a href={CONFIG.termsUrl} target="_blank" rel="noopener">Terms &amp; Conditions</a> · © {new Date(CONFIG.deadline).getFullYear()} ETANN Academy
        </p>
      </div>
    </footer>
  );
}
