import { notFound } from 'next/navigation';
import Image from 'next/image';
import type { Metadata } from 'next';
import { getNextOccurrenceByTitle, getPhotosForCategory } from '@/lib/spectacles';
import BookingLink from '@/components/BookingLink';

const SPONSORED_SHOWS: Record<string, { title: string; schedule: string; videoUrl?: string }> = {
  'tchatcheur-comedy-club': {
    title: 'Tchatcheur comedy club',
    schedule: 'Les lundis, mardis, mercredis, vendredis à 20h, les samedis à 17h30, 19h00 et 20h30.',
    videoUrl: 'https://youtu.be/bjQdOh830G4',
  },
  'un-ado-peut-en-cacher-un-autre': {
    title: 'Un Ado peut en cacher un autre',
    schedule: 'Le dimanche à 17h00.',
  },
  'cheri-je-tai-trompe': {
    title: "Chéri je t'ai trompé (et c'est pas ça le pire...)",
    schedule: 'Le dimanche à 18h30.',
  },
  'kaci-dans-la-connerie-humaine': {
    title: 'Kaci dans La connerie humaine',
    schedule: 'Le dimanche à 20h00.',
  },
};

type Props = { params: Promise<{ slug: string }> };

export const dynamic = 'force-dynamic';

async function loadSponsoredShow(slug: string) {
  const config = SPONSORED_SHOWS[slug];
  if (!config) return null;
  const spectacle = await getNextOccurrenceByTitle(config.title);
  if (!spectacle) return null;
  return { spectacle, config };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const result = await loadSponsoredShow((await params).slug);
  if (!result) return { title: "Spectacle introuvable - L'Espace Comédie Lille" };

  const { spectacle } = result;
  return {
    title: `${spectacle.title} - L'Espace Comédie Lille`,
    description: spectacle.description.slice(0, 160),
    robots: { index: false, follow: true },
  };
}

export default async function SponsorisePage({ params }: Props) {
  const result = await loadSponsoredShow((await params).slug);
  if (!result) notFound();

  const { spectacle, config } = result;
  const photos = await getPhotosForCategory(spectacle.categoryId, 3);

  return (
    <section className="bg-black py-12">
      <div className="mx-auto max-w-[1280px] px-6">
        <div className="mb-8 rounded-xl bg-gray-900 p-6 shadow-2xl">
          <div className="grid grid-cols-1 items-center gap-8 md:grid-cols-3">
            <div className="relative aspect-[2/3] w-full overflow-hidden rounded-lg bg-black">
              <Image
                src={spectacle.img}
                alt={spectacle.title}
                fill
                sizes="(max-width: 768px) 100vw, 33vw"
                priority
                className="object-contain"
              />
            </div>
            <div className="md:col-span-2">
              <span className="mb-3 inline-block rounded-full bg-accent px-3 py-1 text-xs font-bold uppercase tracking-wide text-white">
                Spectacle récurrent
              </span>
              <h1 className="text-3xl font-bold leading-tight text-white md:text-5xl">{spectacle.title}</h1>
              <div className="mt-4 space-y-4">
                <div className="rounded-lg bg-gray-800 p-4">
                  <p className="text-xs uppercase tracking-wide text-gray-400">Programmation</p>
                  <p className="mt-1 text-white">{config.schedule}</p>
                </div>
                <div className="rounded-lg bg-gray-800 p-4">
                  <p className="text-xs uppercase tracking-wide text-gray-400">Lieu</p>
                  <p className="mt-1 text-white">{spectacle.lieu}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          <div className="md:col-span-2">
            <div className="mb-6 rounded-lg bg-gray-900 p-6">
              <h2 className="mb-4 text-2xl font-bold text-white">Description</h2>
              <p className="whitespace-pre-line text-gray-300">{spectacle.description}</p>
            </div>

            {photos.length > 0 && (
              <div className="mb-6 rounded-lg bg-gray-900 p-6">
                <h2 className="mb-6 text-2xl font-bold text-white">Photos additionnelles</h2>
                <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                  {photos.map((photo) => (
                    <div key={photo.id} className="relative h-64 overflow-hidden rounded-lg bg-black">
                      <Image
                        src={photo.imagePath}
                        alt={`Photo additionnelle ${photo.id}`}
                        fill
                        sizes="(max-width: 768px) 100vw, 33vw"
                        className="object-cover transition-transform duration-300 hover:scale-105"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {config.videoUrl && (
              <div className="mb-6 rounded-lg bg-gray-900 p-6">
                <h2 className="mb-4 text-2xl font-bold text-white">Vidéo</h2>
                <div className="aspect-video w-full overflow-hidden rounded bg-black">
                  <iframe
                    src={`https://www.youtube.com/embed/${config.videoUrl.split('/').pop()}`}
                    title="Vidéo YouTube"
                    className="h-full w-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                  />
                </div>
                <a
                  href={config.videoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 inline-flex items-center text-accent hover:text-accent-hover"
                >
                  Ouvrir sur YouTube
                </a>
              </div>
            )}
          </div>

          <div className="md:col-span-1">
            <div className="sticky top-24 rounded-lg bg-gray-900 p-6">
              <h2 className="mb-4 text-2xl font-bold text-white">Réserver</h2>
              <p className="mb-6 text-gray-300">
                Ne manquez pas ce spectacle exceptionnel ! Réservez vos places dès maintenant.
              </p>
              {spectacle.lienSpectacle ? (
                <BookingLink
                  href={spectacle.lienSpectacle}
                  className="block w-full rounded bg-accent py-3 text-center font-bold text-white transition duration-300 hover:bg-accent-hover"
                >
                  Réserver maintenant
                </BookingLink>
              ) : (
                <span className="block w-full cursor-not-allowed rounded bg-gray-700 py-3 text-center font-bold text-gray-400">
                  Lien de billetterie indisponible
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
