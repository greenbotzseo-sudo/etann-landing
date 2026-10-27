import { CONFIG } from './config';
import { CATALOGUE, FEE_SOURCE } from './data/courses';
import { FAQS } from './data/content';

/**
 * Structured data (JSON-LD) and llms.txt, generated at build time from the same data the page shows,
 * so search engines and AI assistants always read the current courses, fees and FAQs.
 * No rating or review markup: Google ignores self-published review stars, and they must never be invented.
 * No opening hours either until the page and the Google listing agree on them.
 */
export const SITE = 'https://lead.etannacademy.com/';
const ORG = `${SITE}#organization`;
const courseLink = (slug: string) => `${CONFIG.mainSite}/course-detail/${slug}/`;
const price = (fee: string) => fee.replace(/[^0-9.]/g, '');

export function schema() {
  const courses = CATALOGUE.flatMap(g => g.items.map(c => ({ ...c, group: g.title })));
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': ['EducationalOrganization', 'LocalBusiness'],
        '@id': ORG,
        name: 'ETANN Academy',
        legalName: 'ETANN Consultants Pte Ltd',
        identifier: { '@type': 'PropertyValue', propertyID: 'UEN', value: CONFIG.uen },
        url: CONFIG.mainSite + '/',
        logo: `${SITE}img/etann-logo.svg`,
        image: `${SITE}img/og.jpg`,
        description: 'SSG-approved WSQ security training provider in Singapore: Basic Licensing, Senior Security Officer, Supervisor and elective courses under the Security Progressive Wage Model.',
        telephone: CONFIG.phone,
        email: CONFIG.email,
        address: { '@type': 'PostalAddress', streetAddress: '12 Arumugam Road, LTC Building B, #02-02G', postalCode: '409958', addressLocality: 'Singapore', addressCountry: 'SG' },
        geo: { '@type': 'GeoCoordinates', latitude: 1.3250644, longitude: 103.8912437 },
        hasMap: CONFIG.reviewsUrl,
        areaServed: { '@type': 'Country', name: 'Singapore' },
        knowsAbout: ['WSQ security courses', 'Security Progressive Wage Model', 'OBSE', 'PRSF', 'Security officer licence', 'SkillsFuture funding'],
        sameAs: [CONFIG.mainSite + '/', CONFIG.reviewsUrl],
        contactPoint: [
          { '@type': 'ContactPoint', contactType: 'customer service', telephone: CONFIG.phone, email: CONFIG.email, areaServed: 'SG', availableLanguage: ['English'] },
          { '@type': 'ContactPoint', contactType: 'sales', url: `https://wa.me/${CONFIG.wa}`, areaServed: 'SG' },
        ],
      },
      {
        '@type': 'WebPage',
        '@id': `${SITE}#webpage`,
        url: SITE,
        name: 'OBSE & PRSF Course Singapore | Check Your Course & Funding | ETANN Academy',
        inLanguage: 'en-SG',
        isPartOf: { '@type': 'WebSite', '@id': `${SITE}#website`, url: SITE, name: 'ETANN Academy', publisher: { '@id': ORG } },
        about: { '@id': ORG },
        primaryImageOfPage: { '@type': 'ImageObject', url: `${SITE}img/og.jpg`, width: 1200, height: 630 },
        mainEntity: { '@id': `${SITE}#courses` },
      },
      {
        '@type': 'ItemList',
        '@id': `${SITE}#courses`,
        name: 'WSQ security courses at ETANN Academy',
        itemListElement: courses.map((c, i) => ({
          '@type': 'ListItem',
          position: i + 1,
          item: {
            '@type': 'Course',
            name: `${c.name} (${c.code})`,
            courseCode: c.code,
            description: `${c.group}: ${c.name} (${c.code}), for ${c.who.toLowerCase()}. ${c.hours} hours of instructor-led training at ETANN Academy, Singapore.${c.due ? ' Existing officers must complete it by 31 December 2026.' : ''}`,
            url: courseLink(c.slug),
            provider: { '@id': ORG },
            inLanguage: 'en',
            offers: { '@type': 'Offer', category: 'Paid', price: price(c.fee), priceCurrency: 'SGD', url: FEE_SOURCE, description: 'Full course fee before SSG funding' },
            hasCourseInstance: { '@type': 'CourseInstance', courseMode: 'Onsite', courseWorkload: `PT${c.hours}H`, location: { '@id': ORG } },
          },
        })),
      },
      {
        '@type': 'FAQPage',
        '@id': `${SITE}#faq`,
        mainEntity: FAQS.map(f => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })),
      },
    ],
  };
}

/** /llms.txt: a plain-text summary for AI assistants (GEO), built from the page data. */
export function llmsTxt() {
  return [
    '# ETANN Academy: WSQ security courses in Singapore',
    '',
    `> ETANN Academy (ETANN Consultants Pte Ltd, UEN ${CONFIG.uen}) is an SSG-approved training provider in Singapore for WSQ security courses under the Security Progressive Wage Model (PWM). Existing Security Officers must complete OBSE and existing Senior Security Officers must complete PRSF by 31 December 2026.`,
    '',
    '## Courses and full fees (before SSG funding)',
    ...CATALOGUE.flatMap(g => ['', `### ${g.title}`,
      ...g.items.map(c => `- [${c.name} (${c.code})](${courseLink(c.slug)}): ${c.who}, ${c.hours} hours, ${c.fee}${c.due ? '. Required by 31 Dec 2026' : ''}`)]),
    '',
    `Fees source: ${FEE_SOURCE}. What a learner pays depends on age, citizenship and eligible funding (SSG funding, SkillsFuture Credit, union schemes).`,
    '',
    '## Frequently asked questions',
    ...FAQS.flatMap(f => ['', `### ${f.q}`, f.a]),
    '',
    '## Contact',
    `- Enquiry form: ${SITE}#form`,
    `- WhatsApp: https://wa.me/${CONFIG.wa}`,
    `- Phone: ${CONFIG.phoneDisplay}`,
    `- Email: ${CONFIG.email}`,
    `- Address: ${CONFIG.address}`,
    `- Main website: ${CONFIG.mainSite}/`,
    `- Requirements source (Singapore Police Force): ${CONFIG.spfUrl}`,
    '',
  ].join('\n');
}
