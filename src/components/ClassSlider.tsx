import { Marquee } from './Marquee';

/**
 * "Inside ETANN" — real photos from ETANN classes, moving continuously (mid-page).
 * Every photo has the same height and its own width (from its aspect ratio), so none is cropped.
 *
 * Photos: public/img/class/ (600px + 1100px WebP) and public/img/learners/.
 */
const ONE = 'ETANN learner holding their course certificate';
const GROUP = 'ETANN learners holding their course certificates';
/** All genuine ETANN photos (class sessions interleaved with learners and their certificates). */
const SLIDES = [
  { src: 'class/e1', w: 1100, h: 830, alt: 'ETANN instructor teaching a class of learners' },
  { src: 'learners/l1', w: 640, h: 853, alt: ONE },
  { src: 'learners/l8', w: 640, h: 830, alt: GROUP },
  { src: 'class/e2', w: 1100, h: 830, alt: 'Learners following the course material in an ETANN classroom' },
  { src: 'learners/l3', w: 640, h: 853, alt: ONE },
  { src: 'learners/l7', w: 640, h: 422, alt: ONE },
  { src: 'learners/l4', w: 640, h: 853, alt: ONE },
  { src: 'class/e3', w: 1100, h: 830, alt: 'Security officers in class at ETANN' },
  { src: 'learners/l9', w: 640, h: 892, alt: GROUP },
  { src: 'learners/l10', w: 640, h: 853, alt: ONE },
  { src: 'learners/l12', w: 640, h: 853, alt: 'ETANN learner holding up his course certificate' },
  { src: 'class/e4', w: 1100, h: 830, alt: 'ETANN trainer guiding a small group of learners' },
  { src: 'learners/l5', w: 640, h: 853, alt: ONE },
  { src: 'learners/l2', w: 640, h: 853, alt: ONE },
  { src: 'learners/l6', w: 640, h: 853, alt: ONE },
  { src: 'learners/l11', w: 640, h: 853, alt: ONE },
];

const big = (src: string) => src.startsWith('class/');

export function ClassSlider() {
  return (
    <section className="sec cls" aria-labelledby="cls-h">
      <div className="wrap">
        <div className="head reveal">
          <h2 id="cls-h">Recent classes at ETANN</h2>
          <p className="lead">Photos from recent ETANN sessions at 12 Arumugam Road: instructor-led, small groups, practical training.</p>
        </div>
      </div>
      <Marquee label="Photos from ETANN classes" speed={45} className="cls-mq">
        {SLIDES.map(s => (
          <div className="cls-img" key={s.src} style={{ aspectRatio: `${s.w} / ${s.h}` }}>
            <img src={`img/${s.src}-${big(s.src) ? 600 : 360}.webp`}
              srcSet={big(s.src) ? `img/${s.src}-600.webp 600w, img/${s.src}-1100.webp 1100w` : `img/${s.src}-360.webp 360w, img/${s.src}-640.webp 640w`}
              sizes={s.w > s.h ? '(min-width: 900px) 540px, 80vw' : '(min-width: 900px) 300px, 45vw'} width={s.w} height={s.h} alt={s.alt} loading="lazy" decoding="async" />
          </div>
        ))}
      </Marquee>
    </section>
  );
}
