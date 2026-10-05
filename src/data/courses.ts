/**
 * Course data. `slug` is the course page on etannacademy.com (/course-detail/<slug>/);
 * `form` is the exact course name in the SPlus enquiry form dropdown.
 */
export type Role = 'so' | 'sso' | 'new' | 'sup';
export type Pick = 'obse' | 'prsf' | 'entry' | 'sup' | 'unsure';

export interface Course { code?: string; name: string; form: string; slug: string; }

export const COURSES = {
  obse: { code: 'OBSE', name: 'Access Control Management', form: 'ACCESS CONTROL MANAGEMENT', slug: 'access-control-management' },
  prsf: { code: 'PRSF', name: 'Security Surveillance Management', form: 'SECURITY SURVEILLANCE MANAGEMENT', slug: 'security-surveillance-management' },
  pgps: { code: 'PGPS & OBSE', name: 'Guard & Patrol + Access Control', form: 'GUARD & PATROL-ACCESS CONTROL MANAGEMENT (PGPS & OBSE)', slug: 'guard-patrol-access-control-management-pgps-obse' },
  rtt: { code: 'RTT', name: 'Threat Observation', form: 'THREAT OBSERVATION', slug: 'threat-observation' },
  hsis: { code: 'HSIS', name: 'Incident Response', form: 'INCIDENT RESPONSE', slug: 'incident-response' },
  ss: { name: 'Guard and Patrol (Supervisor)', form: 'GUARD AND PATROL', slug: 'guard-and-patrol' },
  isp: { name: 'Capability Development', form: 'CAPABILITY DEVELOPMENT', slug: 'capability-development' },
  psdwlf: { name: 'Security Operation Compliance', form: 'SECURITY OPERATION COMPLIANCE', slug: 'security-operation-compliance' },
} satisfies Record<string, Course>;

export const ROLE_TEXT: Record<Role, string> = {
  so: 'an existing Security Officer',
  sso: 'a Senior Security Officer',
  new: 'new to security',
  sup: 'a Supervisor / above',
};
export const ROLE_DEFAULT: Record<Role, Pick> = { so: 'obse', sso: 'prsf', new: 'entry', sup: 'sup' };

interface GuideResult { title: string; courses: Course[]; pick?: string; wa: string; }

export const GUIDE: Record<Pick, GuideResult> = {
  obse: { title: 'OBSE: Access Control Management', courses: [COURSES.obse], wa: 'OBSE' },
  prsf: { title: 'PRSF: Security Surveillance Management', courses: [COURSES.prsf], wa: 'PRSF' },
  entry: {
    title: 'Basic Licensing modules (new officers)',
    courses: [COURSES.pgps, COURSES.rtt, COURSES.hsis],
    pick: "Pick any one and we'll plan the full set with you.",
    wa: 'Basic Licensing course',
  },
  sup: {
    title: 'Supervisor PWM modules',
    courses: [COURSES.ss, COURSES.isp, COURSES.psdwlf],
    pick: "Pick the one you're interested in and we'll confirm what applies to your rank.",
    wa: 'Supervisor course',
  },
  unsure: {
    title: "We'll confirm the right course for you",
    courses: [],
    pick: 'Choose the closest match. Our team confirms the right course before anything is booked.',
    wa: '',
  },
};

/**
 * Course catalogue shown on the page, in the same categories as etannacademy.com/all-courses/.
 * Course names, training hours and full course fees (before funding) are from
 * https://etannacademy.com/course-fees-and-funding/ (checked 5 Oct 2026; GST not stated there). Update both together.
 */
export interface CatCourse { code: string; name: string; slug: string; who: string; hours: number; fee: string; due?: boolean }
export interface CatGroup { id: string; tab: string; title: string; intro: string; items: CatCourse[] }

const due = { due: true } as const;
export const CATALOGUE: CatGroup[] = [
  {
    id: 'basic', tab: 'Basic Licensing', title: 'WSQ Basic Security Officer courses',
    intro: 'The Basic Licensing Unit courses for new officers getting their first security officer licence. OBSE is also the 31 December 2026 requirement for existing Security Officers.',
    items: [
      { code: 'PGPS & OBSE', name: 'Provide Guard and Patrol Services & Operate Basic Security Equipment', slug: 'guard-patrol-access-control-management-pgps-obse', who: 'New officers', hours: 24, fee: '$395' },
      { code: 'HSIS', name: 'Handle Security Incidents and Services', slug: 'incident-response', who: 'New officers', hours: 24, fee: '$320' },
      { code: 'RTT', name: 'Recognise Terrorist Threat', slug: 'threat-observation', who: 'New officers', hours: 16, fee: '$380' },
      { code: 'OBSE', name: 'Operate Basic Security Equipment', slug: 'access-control-management', who: 'Existing Security Officers', hours: 16, fee: '$363', ...due },
    ],
  },
  {
    id: 'senior', tab: 'Senior', title: 'WSQ Senior Security Officer courses',
    intro: 'Courses for Senior Security Officers, including PRSF, which existing Senior Security Officers must complete by 31 December 2026.',
    items: [
      { code: 'PRSF', name: 'Perform Remote Surveillance Function', slug: 'security-surveillance-management', who: 'Existing Senior Security Officers', hours: 16, fee: '$385', ...due },
      { code: 'MDCTB', name: 'Manage Disorderly Conduct & Threatening Behaviour', slug: 'deterrence', who: 'Senior Security Officers', hours: 16, fee: '$363' },
    ],
  },
  {
    id: 'supervisor', tab: 'Supervisor', title: 'WSQ Security Supervisor courses',
    intro: 'PWM modules for officers moving up to Security Supervisor and above.',
    items: [
      { code: 'SS', name: 'Supervise Security Officer', slug: 'guard-and-patrol', who: 'Security Supervisors', hours: 24, fee: '$450' },
      { code: 'ISP', name: 'Induct Security Personnel', slug: 'capability-development', who: 'Security Supervisors', hours: 20, fee: '$395' },
      { code: 'PSDWLF', name: 'Perform Supervisory Duties Within Legal Framework', slug: 'security-operation-compliance', who: 'Security Supervisors', hours: 20, fee: '$395' },
    ],
  },
  {
    id: 'elective', tab: 'Elective', title: 'WSQ recommended elective security courses',
    intro: 'Additional WSQ modules that widen the security roles and sites you can work on.',
    items: [
      { code: 'PAPP', name: 'Perform Security Duties at Protected Areas and Protected Places', slug: 'deterrence-papp', who: 'Licensed officers', hours: 20, fee: '$408.50' },
      { code: 'CSSPB', name: 'Conduct Security Screening of Person & Bag', slug: 'security-screening-management', who: 'Licensed officers', hours: 16, fee: '$391' },
      { code: 'CCTC', name: 'Conduct Crowd & Traffic Control', slug: 'crowd-traffic-control-management', who: 'Licensed officers', hours: 16, fee: '$435' },
    ],
  },
];

export const FEE_SOURCE = 'https://etannacademy.com/course-fees-and-funding/';
