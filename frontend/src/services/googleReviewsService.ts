// Interfaces pour les avis Google
export interface GoogleReview {
  author_name: string;
  author_url?: string;
  profile_photo_url?: string;
  rating: number;
  relative_time_description: string;
  text: string;
}

export interface GoogleReviewsProps {
  placeId: string;
  apiKey: string;
  maxReviews?: number;
}

// Service pour récupérer les avis Google
export class GoogleReviewsService {
  private static readonly PROXY_URL = 'https://corsproxy.io/?';

  /**
   * Récupère les avis Google pour un lieu donné
   */
  static async fetchReviews(placeId: string, apiKey: string, maxReviews: number = 5): Promise<GoogleReview[]> {
    try {
      console.log('🔍 Tentative de chargement des avis...');
      console.log('Place ID:', placeId);
      console.log('API Key:', apiKey ? 'Présente' : 'Manquante');

      // Vérification des paramètres
      if (!placeId || !apiKey) {
        throw new Error('Place ID ou clé API manquante');
      }

      // Construction de l'URL avec la nouvelle API Places (New)
      const googleUrl = `https://places.googleapis.com/v1/places/${placeId}?fields=displayName,rating,reviews&languageCode=fr&key=${apiKey}`;
      const url = `${this.PROXY_URL}${encodeURIComponent(googleUrl)}`;
      console.log('URL de requête avec nouvelle API Places (français):', url);

      const response = await fetch(url);

      console.log('Status de la réponse:', response.status);
      console.log('Headers de la réponse:', response.headers);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Erreur HTTP:', response.status, errorText);
        throw new Error(`Erreur HTTP ${response.status}: ${errorText}`);
      }

      const data = await response.json();
      console.log('Données Google Places (New):', data);

      if (data.error) {
        console.error('Erreur API Google Places (New):', data.error);
        throw new Error(data.error.message || `Erreur API Google Places (New): ${data.error.code}`);
      }

      // La nouvelle API Places retourne les avis dans un format différent
      const reviewsData = data.reviews || [];
      console.log('Avis trouvés:', reviewsData.length);
      console.log('Format des avis:', reviewsData);

      // Adapter le format des avis pour notre composant
      const adaptedReviews = reviewsData.map((review: any) => ({
        author_name: review.authorAttribution?.displayName || 'Anonyme',
        author_url: review.authorAttribution?.uri || '',
        profile_photo_url: review.authorAttribution?.photoUri || '',
        rating: review.rating || 0,
        relative_time_description: review.publishTime
          ? new Date(review.publishTime).toLocaleDateString('fr-FR')
          : 'Récemment',
        text: review.text?.text || review.text || '',
      }));

      console.log('Avis adaptés:', adaptedReviews);
      return adaptedReviews.slice(0, maxReviews);
    } catch (error) {
      console.error('Erreur lors du chargement des avis:', error);
      throw new Error(
        `Impossible de charger les avis Google: ${error instanceof Error ? error.message : 'Erreur inconnue'}`
      );
    }
  }

  /**
   * Génère l'URL Google Maps pour un lieu
   */
  static getGoogleMapsUrl(placeId: string): string {
    return `https://www.google.com/maps/place/?q=place_id:${placeId}`;
  }

  /**
   * Formate une note en étoiles
   */
  static formatRating(rating: number): string {
    return '★'.repeat(Math.floor(rating)) + '☆'.repeat(5 - Math.floor(rating));
  }
}
