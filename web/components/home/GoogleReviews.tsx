import { getGoogleReviews, getGoogleMapsUrl } from '@/lib/googleReviews';

function getInitials(name: string) {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('');
}

function Stars({ rating }: { rating: number }) {
  return (
    <span aria-hidden="true">
      {Array.from({ length: 5 }, (_, i) => (
        <span key={i} className={i < rating ? 'text-accent' : 'text-gray-600'}>
          ★
        </span>
      ))}
    </span>
  );
}

export default async function GoogleReviews() {
  const data = await getGoogleReviews(6);
  if (!data) return null;

  return (
    <section className="bg-black py-12">
      <div className="mx-auto max-w-[1280px] px-6">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-2xl font-bold text-white sm:text-3xl lg:text-4xl">Avis Google</h2>
          <div className="flex items-center gap-2 text-white">
            <Stars rating={Math.round(data.rating)} />
            <span className="text-sm text-gray-400">{data.rating.toFixed(1)} / 5</span>
          </div>
        </div>

        <div className="flex flex-wrap justify-center gap-6">
          {data.reviews.map((review, i) => (
            <div key={i} className="w-full rounded-lg bg-gray-900 p-6 md:w-[calc(50%-12px)] lg:w-[calc(33.333%-16px)]">
              <div className="mb-4 flex items-center">
                <div className="mr-3 flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-accent text-sm font-semibold text-white">
                  {getInitials(review.authorName)}
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-white">{review.authorName}</p>
                  <div className="mt-1 flex items-center gap-2">
                    <Stars rating={review.rating} />
                    <span className="text-sm text-gray-400">{review.relativeTime}</span>
                  </div>
                </div>
              </div>
              <p className="line-clamp-4 text-sm leading-relaxed text-gray-300">{review.text}</p>
              {review.authorUrl && (
                <a
                  href={review.authorUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 inline-flex items-center text-sm text-accent transition duration-300 hover:text-accent-hover"
                >
                  Voir sur Google
                </a>
              )}
            </div>
          ))}
        </div>

        <div className="mt-8 text-center">
          <a
            href={getGoogleMapsUrl()}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center rounded bg-accent px-6 py-3 font-bold text-white transition duration-300 hover:bg-accent-hover"
          >
            Voir tous les avis sur Google Maps
          </a>
        </div>
      </div>
    </section>
  );
}
