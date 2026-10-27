/// <reference types="vite/client" />

declare const __BUILD_DAYS__: number;
declare const __BUILD_TS__: number;

interface ImportMetaEnv {
  readonly VITE_SPLUS_FORM_URL: string;
  readonly VITE_GADS_ID?: string;
  readonly VITE_GADS_LEAD_LABEL?: string;
  readonly VITE_GADS_WHATSAPP_LABEL?: string;
  readonly VITE_META_PIXEL_ID?: string;
  readonly VITE_GOOGLE_MAPS_API_KEY?: string;
  readonly VITE_GOOGLE_PLACE_ID?: string;
}

interface Window {
  dataLayer: unknown[];
  gtag?: (...args: unknown[]) => void;
  fbq?: ((...args: unknown[]) => void) & { callMethod?: (...a: unknown[]) => void; queue?: unknown[]; push?: unknown; loaded?: boolean; version?: string };
  _fbq?: unknown;
}
