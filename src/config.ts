/** Site-wide settings. Secrets and tracking IDs come from .env (see .env.example). */
export const CONFIG = {
  // SPlus endpoint the enquiry form posts to (same one the SPlus LeadCourseForm uses).
  leadApi: import.meta.env.VITE_SPLUS_LEAD_API || 'https://api.splus.one/web/v1/jobapplication/SaveLeadCourseForm',

  deadline: '2026-12-31T23:59:59+08:00',

  wa: '6587331539',
  waDisplay: '8733 1539',
  phone: '+6567412792',
  phoneDisplay: '(+65) 6741 2792',
  email: 'admin@etannsg.com',
  address: '12 Arumugam Road, LTC Building B, #02-02G, Singapore 409958',
  hours: 'Mon–Fri 9am–6pm · Sat 9am–1pm',
  uen: '201843068W',

  mainSite: 'https://etannacademy.com',
  privacyUrl: 'https://2e8066c5-0f94-4f31-b6c0-fa0672bc6e81.filesusr.com/ugd/a71bca_eddd060232d041ac8fc91ce65f03a9bc.pdf',
  termsUrl: 'https://etannacademy.com/wp-content/uploads/2026/06/etann-terms.pdf.pdf',
  spfUrl: 'https://www.police.gov.sg/E-Services/Apply-for-Security-Officer-Licence/Security-Progressive-Wage-Model-Requirements',
  // ETANN's Google Business listing (Place ID below), where its real reviews live
  reviewsUrl: 'https://www.google.com/maps/place/?q=place_id:ChIJO2HaHuAZ2jERIha01SQTxIg',
  mapsUrl: 'https://www.google.com/maps/search/?api=1&query=ETANN+Consultants+Pte+Ltd&query_place_id=ChIJO2HaHuAZ2jERIha01SQTxIg',

  // Live Google reviews. Without both values the page shows no rating or review text — only links to the listing.
  google: {
    mapsKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '',
    placeId: import.meta.env.VITE_GOOGLE_PLACE_ID || '',
  },

  // Google-reviews widget (Trustindex or Elfsight), used when Google's own API sends no review text.
  // Trustindex: the loader.js URL from its embed code. Elfsight: "elfsight:<app id>".
  reviewsWidget: import.meta.env.VITE_REVIEWS_WIDGET || '',

  tracking: {
    gads: import.meta.env.VITE_GADS_ID || '',
    gadsLeadLabel: import.meta.env.VITE_GADS_LEAD_LABEL || '',
    gadsWhatsAppLabel: import.meta.env.VITE_GADS_WHATSAPP_LABEL || '',
    metaPixel: import.meta.env.VITE_META_PIXEL_ID || '',
  },
} as const;

/**
 * Link to a page on the main ETANN site. No UTM tags: both sites report into one GA4 property (via GTM-MX932TBT),
 * so UTMs here would overwrite the visitor's real ad source.
 */
export function mainSite(path: string) {
  return new URL(path, CONFIG.mainSite).toString();
}

export const courseUrl = (slug: string) => mainSite(`/course-detail/${slug}/`);
