import { useEffect, useRef, useState, type KeyboardEvent } from 'react';
import { courseUrl, mainSite } from '../config';
import { CATALOGUE, FEE_SOURCE } from '../data/courses';
import { getVariant, track } from '../lib/analytics';
import { Icon, type IconName } from './Icon';
import { Cta, OutLink, WaLink } from './Links';

const ICON: Record<string, IconName> = { basic: 'plus', senior: 'starUser', supervisor: 'up', elective: 'book' };
const WA_MSG: Record<string, string> = {
  basic: 'Hi ETANN, I am new to security and want to ask about the Basic Licensing courses.',
  senior: 'Hi ETANN, I would like to ask about the Senior Security Officer courses.',
  supervisor: 'Hi ETANN, I would like to ask about the Security Supervisor courses.',
  elective: 'Hi ETANN, I would like to ask about the security elective courses.',
};

/**
 * Course catalogue in the same categories as etannacademy.com (tabs), with full course fees.
 * All panels are in the static HTML; inactive ones are hidden. The PRSF ad variant opens on Senior.
 */
export function Courses() {
  const [active, setActive] = useState(CATALOGUE[0].id);
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);

  useEffect(() => { if (getVariant() === 'prsf') setActive('senior'); }, []);

  const choose = (id: string, focus = false) => {
    setActive(id);
    track('course_category_clicked', { category: id });
    if (focus) tabs.current[CATALOGUE.findIndex(g => g.id === id)]?.focus();
  };
  // Arrow keys move between tabs (WAI-ARIA tabs pattern)
  const onKey = (e: KeyboardEvent, i: number) => {
    const n = CATALOGUE.length;
    const j = e.key === 'ArrowRight' ? (i + 1) % n : e.key === 'ArrowLeft' ? (i - 1 + n) % n : e.key === 'Home' ? 0 : e.key === 'End' ? n - 1 : -1;
    if (j < 0) return;
    e.preventDefault();
    choose(CATALOGUE[j].id, true);
  };

  return (
    <section className="sec ct" id="courses" aria-labelledby="co-h">
      <div className="wrap">
        <div className="head head-row reveal">
          <div>
            <h2 id="co-h">WSQ security courses</h2>
            <p className="lead">Full course fees are before SSG funding. What you pay depends on your age, citizenship and the funding you qualify for.</p>
          </div>
          <OutLink href={mainSite('/all-courses/', 'all_courses')} id="all_courses" className="btn btn-outline">All courses<Icon name="ext" /></OutLink>
        </div>

        <div className="ct-tabs" role="tablist" aria-label="Course categories">
          {CATALOGUE.map((g, i) => (
            <button key={g.id} type="button" role="tab" id={`ct-tab-${g.id}`} aria-controls={`ct-panel-${g.id}`}
              aria-selected={active === g.id} tabIndex={active === g.id ? 0 : -1}
              className={`ct-tab ct-${g.id}`} ref={el => { tabs.current[i] = el; }}
              onClick={() => choose(g.id)} onKeyDown={e => onKey(e, i)}>
              <Icon name={ICON[g.id]} />{g.tab}<span className="ct-n">{g.items.length}</span>
            </button>
          ))}
        </div>

        {CATALOGUE.map(g => (
          <div key={g.id} className={`ct-panel ct-${g.id}`} role="tabpanel" id={`ct-panel-${g.id}`} aria-labelledby={`ct-tab-${g.id}`}
            hidden={active !== g.id}>
            <aside className="ct-intro">
              <span className="ct-ic"><Icon name={ICON[g.id]} /></span>
              <h3>{g.title}</h3>
              <p>{g.intro}</p>
              <span className="ct-count">{g.items.length} {g.items.length === 1 ? 'course' : 'courses'}</span>
              <div className="ct-ctas">
                <Cta to="#form" id={`courses_${g.id}_enquire`} className="btn btn-white btn-sm">Check my course<Icon name="arrow" /></Cta>
                <WaLink loc={`courses_${g.id}`} className="ct-wa" msg={WA_MSG[g.id]}><Icon name="wa" />Ask on WhatsApp</WaLink>
              </div>
            </aside>
            <ul className="ct-grid">
              {g.items.map(c => (
                <li key={c.slug + c.code}>
                  <OutLink href={courseUrl(c.slug)} id={`course_${g.id}_${c.slug}`} className="ct-card">
                    <span className="ct-top">
                      <span className="ct-code">{c.code}</span>
                      {c.due && <span className="ct-due"><span className="live" />Due 31 Dec 2026</span>}
                    </span>
                    <b className="ct-name">{c.name}</b>
                    <span className="ct-who"><Icon name="team" />{c.who}</span>
                    <span className="ct-meta">
                      <span><small>Full course fee</small><b>{c.fee}</b></span>
                      <span><small>Training</small><b>{c.hours} hours</b></span>
                    </span>
                    <span className="ct-go">View course details<Icon name="ext" /></span>
                  </OutLink>
                </li>
              ))}
            </ul>
          </div>
        ))}
        <p className="ct-src">Fees from ETANN's <a href={FEE_SOURCE} target="_blank" rel="noopener">course fee list</a>, before funding. Our team confirms your nett fee before you book.</p>
      </div>
    </section>
  );
}
