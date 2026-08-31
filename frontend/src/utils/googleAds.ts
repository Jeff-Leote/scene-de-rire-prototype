/**
 * Utilitaires pour le suivi des conversions Google Ads
 */

// Configuration Google Ads
const CONVERSION_ID = '17654685757';
const CONVERSION_LABEL = '7o-nCJ7-9LkbEL3AtOJB';

/**
 * Déclare l'interface gtag pour TypeScript
 */
declare global {
  interface Window {
    gtag?: (
      command: string,
      targetId: string | Date,
      config?: {
        send_to?: string;
        value?: number;
        currency?: string;
        transaction_id?: string;
      }
    ) => void;
    dataLayer?: any[];
  }
}

/**
 * Envoie un événement de conversion Google Ads
 * @param value - Valeur de la conversion (optionnel)
 * @param currency - Devise (par défaut: EUR)
 * @param transactionId - ID de transaction unique (optionnel)
 */
export const trackGoogleAdsConversion = (value?: number, currency: string = 'EUR', transactionId?: string): void => {
  try {
    // Vérifier que gtag est disponible
    if (typeof window !== 'undefined' && window.gtag) {
      const config: {
        send_to: string;
        value?: number;
        currency?: string;
        transaction_id?: string;
      } = {
        send_to: `AW-${CONVERSION_ID}/${CONVERSION_LABEL}`,
        currency: currency,
      };

      if (value !== undefined) {
        config.value = value;
      }

      if (transactionId) {
        config.transaction_id = transactionId;
      }

      // Envoyer l'événement de conversion
      window.gtag('event', 'conversion', config);

      console.log('✅ Conversion Google Ads envoyée:', {
        conversion_id: CONVERSION_ID,
        conversion_label: CONVERSION_LABEL,
        value,
        currency,
        transaction_id: transactionId,
      });
    } else {
      console.warn('⚠️ gtag non disponible - conversion non envoyée');
    }
  } catch (error) {
    console.error("❌ Erreur lors de l'envoi de la conversion Google Ads:", error);
  }
};

/**
 * Envoie une conversion Google Ads lors d'un clic sur un lien de réservation
 * Utilisé avant une redirection vers une billetterie externe
 */
export const trackBookingClick = (spectacleTitle?: string): void => {
  // Créer un ID de transaction unique basé sur le timestamp
  const transactionId = `booking_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  // Envoyer la conversion
  trackGoogleAdsConversion(1.0, 'EUR', transactionId);

  // Optionnel: logger pour le debug
  if (spectacleTitle) {
    console.log(`📊 Conversion trackée pour: ${spectacleTitle}`);
  }
};
