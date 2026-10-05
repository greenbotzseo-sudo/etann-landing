import { CONFIG } from '../config';
import { GUIDE, ROLE_TEXT, type Pick, type Role } from '../data/courses';
import { getAttribution, getVariant } from './analytics';

/** WhatsApp link prefilled with the visitor's situation and a short source reference for sales. */
export function waHref(role?: Role | '', pick?: Pick | '', withRef = false, custom?: string) {
  let msg = custom || "Hi ETANN, I'd like to check which security course I need.";
  if (role && !custom) {
    const c = pick ? GUIDE[pick].wa : '';
    msg = `Hi ETANN, I'm ${ROLE_TEXT[role]}${c ? ` looking for the ${c}` : ''}. Can you confirm my course and funding?`;
  }
  if (withRef) msg += ` (ref: ${getAttribution().utm_source || 'lp'}/${getVariant()})`;
  return `https://wa.me/${CONFIG.wa}?text=${encodeURIComponent(msg)}`;
}

/** Ask the enquiry form to start loading (used by CTAs that scroll towards it). */
export const LOAD_FORM_EVENT = 'etann:loadform';
export const requestFormLoad = () => window.dispatchEvent(new Event(LOAD_FORM_EVENT));
