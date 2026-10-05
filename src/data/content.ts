/** Page copy that isn't tied to a single component. Verify all claims against ETANN records before go-live. */

// The Google rating is never hard-coded: it is shown only when it loads live from Google (lib/reviews.tsx).
// 'trained' must match ETANN's own records.
export const STATS = { trained: '3,000+' };

export const FUNDING = [
  { pre: 'up to', amt: '50%', name: 'SSG course fee funding', text: 'Baseline subsidy on eligible WSQ courses.', who: 'SC & PR, 21+' },
  { pre: 'up to', amt: '70%', name: 'Mid-Career Enhanced Subsidy', text: 'Higher subsidy for mid-career learners.', who: 'SC, 40+' },
  { pre: 'use your', amt: 'Credit', name: 'SkillsFuture Credit', text: 'Can cover the remaining fee on eligible courses.', who: 'SC, 25+' },
  { pre: 'claim', amt: 'UTAP', name: 'NTUC Union Training Assistance', text: 'Union members may claim back part of the fees paid.', who: 'NTUC members' },
];

export const FACTORS = ['Course', 'Citizenship / PR', 'Age', 'Funding eligibility', 'SkillsFuture Credit', 'Other schemes'];

export const WHY = [
  { icon: 'check', title: 'Right course, first time', text: 'We confirm which module applies to your licence and rank before you book.' },
  { icon: 'coin', title: 'Funding handled for you', text: 'We explain your SSG and SkillsFuture options and help with the paperwork.' },
  { icon: 'wa', title: 'Real people on WhatsApp', text: 'Ask questions and get practical answers from our team.' },
  { icon: 'cal', title: 'Regular class dates', text: 'We send the next available dates that fit your work schedule.' },
  { icon: 'team', title: 'Agency & bulk bookings', text: 'Security agencies can arrange training for multiple officers.' },
  { icon: 'pin', title: 'Physical Singapore centre', text: '12 Arumugam Road, LTC Building B, near Macpherson.' },
] as const;

export const STEPS = [
  { title: 'Check your course', text: 'Complete the short form or WhatsApp us. We confirm the course and your funding. Free, no obligation.' },
  { title: 'Book your class', text: 'Choose from the next available dates. We help you register and apply your funding.' },
  { title: 'Attend & get certified', text: 'Complete the training and assessment to receive your WSQ Statement of Attainment.' },
];

export interface Faq { q: string; a: string; link?: { label: string; path: string } }
export const FAQS: Faq[] = [
  { q: 'Which course do I need as an existing Security Officer?',
    a: "Existing Security Officers need the OBSE module (Access Control Management). Existing Senior Security Officers need the PRSF module (Security Surveillance Management). Both must be completed by 31 December 2026. If you're unsure of your rank or training record, tell us in the form and we'll check.",
    link: { label: 'How to check your security rank (PDF)', path: '/wp-content/uploads/2026/05/To-check-on-Security-Rank_Redacted.pdf' } },
  { q: "I'm new to security. Where do I start?",
    a: "New officers complete the Basic Licensing Unit modules: Provide Guard & Patrol Services, Operate Basic Security Equipment, Recognise Terrorist Threats and Handle Security Incidents. At ETANN these are Guard & Patrol-Access Control Management, Threat Observation and Incident Response. We'll plan the full set with you.",
    link: { label: 'How to become a security officer in Singapore', path: '/how-to-become-a-security-officer-in-singapore-licence-courses-requirements/' } },
  { q: 'How much will the course cost me?',
    a: "It depends on the course, your citizenship or PR status, your age and which funding you're eligible for. SSG funding, SkillsFuture Credit and union schemes can reduce the fee significantly. Our team will calculate your actual amount before you commit.",
    link: { label: 'Course fees & funding', path: '/course-fees-and-funding/' } },
  { q: 'What happens after I submit the form?',
    a: "Our team contacts you on WhatsApp, usually within 1 business day, to confirm your course, your funding and the next available class. There's no obligation to enrol." },
  { q: 'How soon can I start?',
    a: 'We send you the next available class dates when we contact you. Classes get busier closer to the December 2026 deadline, so we recommend booking a few weeks ahead.',
    link: { label: 'View the class schedule', path: '/schedule/' } },
  { q: 'What documents do I need?',
    a: "Usually your NRIC, your current security officer licence (if you're upgrading) and Singpass access to use SkillsFuture Credit. We'll send you a checklist when you register." },
  { q: 'Can my employer or security agency pay for the training?',
    a: 'Yes. Employers can sponsor officers and may be eligible for SSG funding and Absentee Payroll. For agency or bulk bookings, email admin@etannsg.com.' },
];
