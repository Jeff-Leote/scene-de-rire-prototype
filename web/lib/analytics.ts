declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

const GOOGLE_ADS_CONVERSION_ID = '17654685757';
const GOOGLE_ADS_CONVERSION_LABEL = '7o-nCJ7-9LkbEL3AtOJB';

/**
 * Conversion Google Ads déclenchée avant une redirection vers la billetterie externe.
 * Mêmes identifiants que sur l'ancien site (frontend/src/utils/googleAds.ts).
 */
export function trackBookingClick() {
  if (typeof window === 'undefined' || !window.gtag) return;
  window.gtag('event', 'conversion', {
    send_to: `AW-${GOOGLE_ADS_CONVERSION_ID}/${GOOGLE_ADS_CONVERSION_LABEL}`,
  });
}
