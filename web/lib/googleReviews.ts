const PLACE_ID = 'ChIJF94WEwDVwkcRpB4gPela0dE';

export type GoogleReview = {
  authorName: string;
  authorUrl?: string;
  photoUrl?: string;
  rating: number;
  relativeTime: string;
  text: string;
};

export type GoogleReviewsData = {
  rating: number;
  reviews: GoogleReview[];
};

export async function getGoogleReviews(maxReviews = 6): Promise<GoogleReviewsData | null> {
  const apiKey = process.env.GOOGLE_PLACES_API_KEY;
  if (!apiKey) return null;

  try {
    const url = `https://places.googleapis.com/v1/places/${PLACE_ID}?fields=rating,reviews&languageCode=fr&key=${apiKey}`;
    const res = await fetch(url, { next: { revalidate: 86400 } });
    if (!res.ok) return null;

    const data = await res.json();
    if (!data.reviews?.length) return null;

    const reviews: GoogleReview[] = data.reviews
      .slice(0, maxReviews)
      .map(
        (review: {
          authorAttribution?: { displayName?: string; uri?: string; photoUri?: string };
          rating?: number;
          relativePublishTimeDescription?: string;
          text?: { text?: string };
        }) => ({
          authorName: review.authorAttribution?.displayName || 'Anonyme',
          authorUrl: review.authorAttribution?.uri,
          photoUrl: review.authorAttribution?.photoUri,
          rating: review.rating || 0,
          relativeTime: review.relativePublishTimeDescription || '',
          text: review.text?.text || '',
        })
      );

    return { rating: data.rating || 0, reviews };
  } catch {
    return null;
  }
}

export function getGoogleMapsUrl(): string {
  return `https://www.google.com/maps/place/?q=place_id:${PLACE_ID}`;
}
