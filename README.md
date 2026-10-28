# ETANN Academy — lead landing page (React)

The ads landing page for ETANN's WSQ security courses in Singapore. It's built with React + Vite + TypeScript, and the build pre-renders it to static HTML for fast first paint. The enquiry form is the SPlus LeadCourseForm, embedded by iframe.

## Run locally

```bash
npm install
npm run dev        # http://localhost:5173  (live reload while editing)
npm run build      # production build → dist/
npm run preview    # serve the production build at http://localhost:4173
```

Both servers also print a **Network** URL (for example `http://172.16.1.15:5173`) for testing on a phone on the same Wi-Fi.

Ad variants: `?v=obse`, `?v=prsf`, `?v=new`. If `utm_campaign` or `utm_term` contains those words, the page switches automatically.

## Configuration

| What | Where |
|---|---|
| SPlus form URL (credential), tracking IDs | `.env` (copy from `.env.example`; never commit `.env`) |
| Phone, WhatsApp, address, links, deadline | `src/config.ts` |
| Courses, fees, links to etannacademy.com | `src/data/courses.ts` |
| Funding, FAQs, steps, stats | `src/data/content.ts` |
| Colours and layout | `src/styles.css` (`:root` tokens at the top) |

**SPlus form URL:** `VITE_SPLUS_FORM_URL` in `.env` is the **production** SPlus form (`report.splus.one`, set 5 Oct 2026). If SPlus changes it, update `.env` and the `preconnect` host in `index.html`, then rebuild.

**Course links** go to `https://etannacademy.com/course-detail/<slug>/`, tagged `utm_source=lead.etannsg.com`. The courses section (`src/components/Courses.tsx`, data in `CATALOGUE` in `src/data/courses.ts`) uses tabs in the same categories as etannacademy.com. Course names, training hours and **full course fees** (before funding) come from https://etannacademy.com/course-fees-and-funding/ (checked 5 Oct 2026; that page doesn't say whether GST is included). Update fees in `CATALOGUE` when that page changes.

| Tab | Courses (code, hours, full fee) |
|---|---|
| Basic Licensing | PGPS & OBSE 24h $395 · HSIS 24h $320 · RTT 16h $380 · OBSE 16h $363 |
| Senior | PRSF 16h $385 · MDCTB 16h $363 |
| Supervisor | SS 24h $450 · ISP 20h $395 · PSDWLF 20h $395 |
| Elective | PAPP 20h $408.50 · CSSPB 16h $391 · CCTC 16h $435 |

The PRSF ad variant opens on the Senior tab. The OBSE and PRSF cards in the deadline section link to their course pages.

**Contact:** the header shows only the logo. Phone and WhatsApp live in the chat-style widget (`src/components/ChatWidget.tsx`), a button in the bottom-right corner. Its quick replies open WhatsApp with a matching pre-filled message, and a one-time greeting appears after 8 seconds. Events: `cta_click` with `chat_open`, `chat_close` and `chat_call`, and `whatsapp_click` with `loc` set to `chat_*`.

## Live Google reviews

ETANN's rating, review count and Google's most relevant reviews (up to 5) load **live from Google** on the visitor's first scroll or tap (or when the reviews section approaches). They fill the hero bento's feedback tiles and the reviews section, and the rating appears in the hero, trust band and "Why ETANN". **No review text or rating is hard-coded anywhere.** The earlier testimonials and the "4.9" figure couldn't be verified and were removed. Code: `src/lib/reviews.tsx`.

Setup (one time):
1. In Google Cloud Console, create a project with billing enabled, then enable **Maps JavaScript API** and **Places API (New)**.
2. Create an **API key** and restrict it:
   - **Application restriction:** HTTP referrers → `https://lead.etannsg.com/*` (plus `http://localhost:*/*` for testing).
   - **API restriction:** only the two APIs above.
3. Put it in `.env` as `VITE_GOOGLE_MAPS_API_KEY`. `VITE_GOOGLE_PLACE_ID` is already set to `ChIJO2HaHuAZ2jERIha01SQTxIg`, which is ETANN Consultants Pte Ltd (Training Provider). It was verified against the place code `0x31da19e01eda613b:0x88c41324d5b41622` in ETANN's Google Maps link.
4. Rebuild.

Notes:
- **Fallback:** without a key, or if Google fails, no rating or review text is shown. The hero tile, trust band and reviews section link to ETANN's Google listing instead.
- **Why not copy the reviews in?** Copying or scraping Google reviews into the page breaks Google Maps' terms, and the text would go stale. To quote a learner directly instead, get their written permission and add it as your own testimonial, not as a "Google review".
- **Display rules:** reviews are shown as Google returns them, with no filtering by stars, author names linked to their Google profiles, and "Google Maps" attribution, as Google Maps Platform policies require. Don't edit review text or hide low ratings.
- **Cost:** each visit where the visitor scrolls or taps makes one Place Details request (the hero shows reviews, so this is most visits). That's billed per request once the monthly free allowance is used. Check current Google Maps Platform pricing against your ad traffic, and set a **budget alert / quota cap** in Cloud Console.
- **Event:** `google_reviews_loaded`, or `google_reviews_error`, appears in the dataLayer.

## Hero bento grid

`src/components/Gallery.tsx` (`HeroBento`) fills the right side of the hero banner (below the headline on phones). It holds only **real learner photos and real Google feedback**: 12 learner photos plus up to 5 live Google reviews, with a "Google Maps" label on every review tile (the attribution Google requires). Until the key is set, it shows the photos only. Long reviews are clamped to 10 lines on screen; the text itself is never changed. Its two columns drift in opposite directions.
- **Behaviour:** it pauses on hover/focus and when off screen. Under "reduce motion" it stays still as a static bento grid.
- **Photos:** 12 real ETANN learner photos in `public/img/learners/` (360px and 640px WebP, EXIF stripped; originals in `Downloads/etann course cet`). Each tile takes the photo's own shape, so nothing is cropped. To add a photo, export both sizes, add it to `LEARNERS` in `Gallery.tsx` with its size, and place `<Photo n={…} />`. Make sure every learner shown has agreed to their photo being used in ads.

## Inside ETANN photos and Google reviews rows

Both use `src/components/Marquee.tsx`, a continuous row at constant speed that pauses on hover/focus and when off screen. Under "reduce motion" it becomes a swipeable row.
- **Inside ETANN** (`ClassSlider.tsx`, after "Why ETANN"): real class photos (`public/img/class/e1–e4`, plus learner photo `l12`), no captions. Every photo has the same height and the width of its own photo, so none is cropped. To add one, export `-600.webp` and `-1100.webp`, then add it to `SLIDES` with its size and alt text.
- **Live from Google:** the 5 live reviews in one moving row. Long reviews are clamped to 9 lines; the text itself is never changed.
- **Left out:** `etann review (2).jpg` from the photo folder looks AI-generated (garbled certificate and poster text, Gemini watermark). Don't use it as a "real learners" photo.

## Motion & performance

- **Design style:** flat and editorial, in ETANN's navy and red. There are no glows, gradient text, pill labels, colour blobs, 3D tilt or 3D logo; these were removed on 5 Oct 2026 because they made the page look templated or AI-made. The overrides live in the "Flat brand pass" block at the end of `src/styles.css`. Keep new sections to the same rules: real photos, plain headings, thin borders and solid buttons.
- **Compositor-only animation:** all animations use transform/opacity. Animated sections pause when off screen (`[data-anim]`). Card tilt only applies on mouse/trackpad devices.
- **Reduced motion:** with "reduce motion" turned on, all animation stops and everything stays visible.
- **Avoid `backdrop-filter`** (frosted glass). Testing showed it made mobile layout about 3× slower, so surfaces use near-opaque white instead.
- **Measured on 5 Oct 2026:** desktop Lighthouse 95–97. Mobile measured on a busy laptop scored 79–84, alongside the earlier simple page, which scored 77–86 under the same conditions (it scored 99 on an idle machine). Confirm with Google PageSpeed Insights on the live URL after deploy.

## Deploy

Run `npm run build`, then upload the **contents of `dist/`** to any HTTPS static host: a subdomain on the current server, Netlify, Cloudflare Pages or cPanel. Asset paths are relative, so it works at a domain root or in a sub-folder.

- The page is `noindex` (ads only). Remove that meta tag in `index.html` if it should rank in search.
- **Link previews** (WhatsApp, Facebook, LinkedIn): the `og:` tags in `index.html` use `https://lead.etannsg.com/` and `img/og.jpg` (a real ETANN class photo, 1200×630). If the page is deployed at another URL or sub-folder, update those two URLs.
- The form URL is set in the browser only, so it isn't baked into the HTML. The build fails if it is.

## Tracking

Events go to `window.dataLayer`; set `VITE_GTM_ID`, or the direct Google Ads / Meta IDs, in `.env`. Tags load on first interaction or 3s after load.

| Event | Fires when |
|---|---|
| `lp_page_view` | page load (with variant + UTMs) |
| `course_option_clicked`, `eligibility_started`, `eligibility_completed` | a "Which describes you?" tile chosen (role + the course it usually means); the page then scrolls to the form |
| `iframe_viewed`, `form_interaction` | form seen / first tap into the form |
| `whatsapp_click` | any WhatsApp link (Meta `Contact`, optional Ads conversion) |
| `course_category_clicked` | a course tab chosen (basic / senior / supervisor / elective) |
| `form_unavailable` | the SPlus form hadn't loaded after 15s, so the WhatsApp/call fallback was shown |
| `cta_click`, `outbound_click`, `scroll_depth` | CTAs, links to etannacademy.com, 25/50/75/90% |
| `form_started`, `form_submitted`, `form_success`, `form_error` | **only once SPlus adds `postMessage` events** |

UTMs and gclid are stored as first and last touch in `localStorage`. WhatsApp messages carry a `(ref: source/variant)` tag for sales.

**Waiting on SPlus:** the form doesn't report submissions or its height to the page yet. The listener is already built (`src/components/EnquiryForm.tsx`). SPlus needs to send:

```js
window.parent.postMessage({ source: 'splus-lead-form', type: 'form_success', course }, 'https://<landing-page-domain>');
window.parent.postMessage({ source: 'splus-lead-form', type: 'resize', height: document.documentElement.scrollHeight }, 'https://<landing-page-domain>');
```

Until then, form heights are fixed per breakpoint (the `.ff` rules in `styles.css`, measured from the production SPlus form on 5 Oct 2026). `--fcrop` trims empty space above the form card. `--fbot` trims the space below it until the visitor first clicks into the form; the frame then expands (`.ff.open`) to leave room for the course list, error messages and step 2. Re-measure these values if SPlus changes its layout.

## Tested (1 Oct 2026, headless Chrome)

- **Layout:** no horizontal scroll at 320, 360, 375, 390, 412, 430, 768 and 1280px.
- **Embedded form:** no inner scrolling at any width in any state (course list open, errors, step 2). Below 352px it's scaled to fit.
- **React:** no hydration errors or console warnings in the production build or in dev.
- **Lighthouse (5 Oct 2026, after the 3D/motion redesign):** desktop Performance 95–97. Mobile measured 79–84 on a busy machine, the same range as the earlier simple page under identical conditions (see "Motion & performance"). Accessibility 100, Best Practices 100. SEO shows 66 only because of `noindex`.
- **Live reviews (5 Oct 2026, real key):** ETANN's listing returned 4.9★ from 123 Google reviews and 5 reviews. They show in the hero bento, the reviews section, the hero, the trust band and "Why ETANN", credited to Google Maps. There's one billable Place Details request per visit (the second request seen is the browser's CORS preflight). No overflow from 320px to 1440px, and no console errors.
- **Not tested here:** real iPhone and Android devices, and a live form submission (it would create a real SPlus lead).

## Content to confirm

- The hero strip under the CTAs shows the live Google rating with 4 real reviewers' Google profile photos. Before reviews load, it shows "SSG-approved WSQ training provider" at the same height, so there's no layout shift.
- The contact section has a Google map (keyless embed, lazy-loaded) and a "Get directions" link to ETANN's exact Google listing.
- "3,000+ officers trained" is carried over from ETANN's current page, like the testimonials that turned out to be fake (now removed). Confirm it against ETANN's training records, or remove it from `STATS` in `src/data/content.ts`.

## Tracking, SEO and GEO

- **GTM `GTM-MX932TBT`** (shared with etannacademy.com) is hard-coded in `index.html`. GA4 `G-S4V8JQX4V0`, Google Ads and Meta Pixel tags are set up inside GTM, not in the page. Leave the `VITE_GADS_*` / `VITE_META_PIXEL_ID` env vars empty unless a tag is *not* in GTM, or conversions double count.
- **dataLayer events for GTM triggers** (Custom Event): `whatsapp_click`, `phone_click` (any `tel:` link), `generate_lead` (form success), plus `form_viewed`, `form_interaction`, `form_step`, `form_error`, `cta_click`, `scroll_depth`, `outbound_click`. Every event carries `utm_source`, `utm_medium`, `utm_campaign`, `lp_variant` and `device`.
- **`generate_lead`** fires when the enquiry form's submission is confirmed by SPlus, with `course` and `situation` (obse | prsf | new | supervisor | unsure).
- **Links to etannacademy.com carry no UTMs** (one GA4 property; UTMs would overwrite the ad source).
- **SEO**: indexable, canonical `https://lead.etannacademy.com/`, geo meta, Open Graph/Twitter tags, `robots.txt`, `sitemap.xml`. JSON-LD (organisation, web page, 12 courses with fees, FAQ) is generated at build time in `src/seo.ts` from the same data as the page.
- **GEO** (AI answer engines): `llms.txt` generated from the course, fee and FAQ data; AI crawlers allowed in `robots.txt`.

## Enquiry form (native, posts to SPlus)

The SPlus iframe has been replaced by the same two-step form built into the page (`src/components/EnquiryForm.tsx`, styles `.ca-*`).
- It posts SPlus's own payload to `https://api.splus.one/web/v1/jobapplication/SaveLeadCourseForm` (override with `VITE_SPLUS_LEAD_API`) and treats `EmpStatus && Status && Data.result === 1` as success, exactly as the SPlus form does.
- **SPlus must allow this site in CORS** (`Access-Control-Allow-Origin` for `https://lead.etannacademy.com`, and the Vercel URL if used). Until then the browser blocks the request and the form offers WhatsApp with the visitor's details filled in.
- Course and country IDs are SPlus's (client 36), copied from the LeadCourseForm. Update `COURSES` / `COUNTRIES` if SPlus changes them.
- The "Which describes you?" tiles pre-fill step 1. A hidden honeypot field drops bot submissions.
- No API key is in the page. If SPlus requires one, put it in a server-side proxy, never in a `VITE_` variable (those are public).
