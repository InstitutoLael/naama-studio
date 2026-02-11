/**
 * Analytics utility for Naamá Studio
 * Wraps GA4 and custom event tracking.
 * 
 * SETUP: Replace 'G-XXXXXXXXXX' with your GA4 Measurement ID
 *        Replace 'XXXXXXXXXX' with your Microsoft Clarity ID
 */

export const GA_ID = 'G-XXXXXXXXXX'; // TODO: Replace with real GA4 ID
export const CLARITY_ID = 'XXXXXXXXXX'; // TODO: Replace with real Clarity ID

/**
 * Track a custom event via GA4
 */
export const trackEvent = (eventName, params = {}) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', eventName, params);
  }
};

// Pre-defined events for Naamá Studio
export const Events = {
  AGENDAR_CLICK: () => trackEvent('agendar_click', { method: 'cta_button' }),
  WHATSAPP_OPEN: (source) => trackEvent('whatsapp_open', { source }),
  SERVICE_EXPAND: (serviceName) => trackEvent('service_expand', { service: serviceName }),
  BOOKING_START: () => trackEvent('booking_start'),
  BOOKING_COMPLETE: (need) => trackEvent('booking_complete', { need }),
  GIFTCARD_START: () => trackEvent('giftcard_start'),
  GIFTCARD_SEND: (amount) => trackEvent('giftcard_send', { amount }),
  CONTACT_FORM_SUBMIT: () => trackEvent('contact_form_submit'),
  GALLERY_VIEW: (item) => trackEvent('gallery_view', { item }),
  INSTAGRAM_CLICK: () => trackEvent('instagram_click'),
  THEME_TOGGLE: (theme) => trackEvent('theme_toggle', { theme }),
};
