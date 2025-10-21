import { useEffect, useState } from 'react';
import { GoogleReview, GoogleReviewsProps, GoogleReviewsService } from '../services/googleReviewsService';

const GoogleReviews = ({ placeId, apiKey, maxReviews = 5 }: GoogleReviewsProps) => {
  const [reviews, setReviews] = useState<GoogleReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        setLoading(true);
        setError(null);

        const reviewsData = await GoogleReviewsService.fetchReviews(placeId, apiKey, maxReviews);
        setReviews(reviewsData);
      } catch (err) {
        console.error('Erreur lors du chargement des avis:', err);
        setError(err instanceof Error ? err.message : 'Erreur inconnue');
      } finally {
        setLoading(false);
      }
    };

    if (placeId && apiKey) {
      fetchReviews();
    } else {
      setError('Place ID ou clé API manquante');
      setLoading(false);
    }
  }, [placeId, apiKey, maxReviews]);

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, index) => (
      <span
        key={index}
        className={`text-lg ${
          index < rating ? 'text-yellow-400' : 'text-gray-400'
        }`}
      >
        ★
      </span>
    ));
  };

  if (loading) {
    return (
      <section className="bg-gray-950 py-16">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl font-bold text-white mb-8">Avis Google</h2>
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
            <span className="ml-3 text-white">Chargement des avis...</span>
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="bg-gray-950 py-16">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl font-bold text-white mb-8">Avis Google</h2>
          <div className="text-center text-red-400">
            <p>{error}</p>
            <p className="text-sm mt-2">
              Les avis ne peuvent pas être affichés pour le moment.
            </p>
          </div>
        </div>
      </section>
    );
  }

  if (reviews.length === 0) {
    return (
      <section className="bg-gray-950 py-16">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl font-bold text-white mb-8">Avis Google</h2>
          <div className="text-center text-gray-400">
            <p>Aucun avis disponible pour le moment.</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="bg-gray-950 py-16">
      <div className="container mx-auto px-6">
        <h2 className="text-3xl font-bold text-white mb-8 text-center">
          Avis Google
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {reviews.map((review, index) => (
            <div
              key={index}
              className="bg-gray-800 rounded-lg p-6 border border-gray-700 hover:border-gray-600 transition-colors"
            >
              {/* En-tête de l'avis */}
              <div className="flex items-center mb-4">
                {review.profile_photo_url && (
                  <img
                    src={review.profile_photo_url}
                    alt={review.author_name}
                    className="w-10 h-10 rounded-full mr-3"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                )}
                <div className="flex-1">
                  <h3 className="text-white font-semibold">
                    {review.author_name}
                  </h3>
                  <div className="flex items-center mt-1">
                    {renderStars(review.rating)}
                    <span className="text-gray-400 text-sm ml-2">
                      {review.relative_time_description}
                    </span>
                  </div>
                </div>
              </div>

              {/* Contenu de l'avis */}
              <p className="text-gray-300 text-sm leading-relaxed line-clamp-4">
                {review.text}
              </p>

              {/* Lien vers l'avis Google */}
              {review.author_url && (
                <a
                  href={review.author_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center text-blue-400 hover:text-blue-300 text-sm mt-3 transition-colors"
                >
                  Voir sur Google
                  <svg
                    className="w-4 h-4 ml-1"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                    />
                  </svg>
                </a>
              )}
            </div>
          ))}
        </div>

        {/* Lien vers Google Maps */}
        <div className="text-center mt-8">
          <a
            href={GoogleReviewsService.getGoogleMapsUrl(placeId)}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg transition-colors"
          >
            <svg
              className="w-5 h-5 mr-2"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
            </svg>
            Voir tous les avis sur Google Maps
          </a>
        </div>
      </div>
    </section>
  );
};

export default GoogleReviews;
