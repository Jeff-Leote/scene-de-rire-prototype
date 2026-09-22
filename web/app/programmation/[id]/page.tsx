import { notFound } from 'next/navigation';
import Image from 'next/image';
import type { Metadata } from 'next';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { getSpectacleById, getPhotosForCategory } from '@/lib/spectacles';

function formatTime(date: Date) {
  return date.toISOString().slice(11, 16);
}

type Props = { params: Promise<{ id: string }> };

async function loadSpectacle(idParam: string) {
  const id = Number(idParam);
  if (!Number.isInteger(id)) return null;
  return getSpectacleById(id);
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const spectacle = await loadSpectacle((await params).id);
  if (!spectacle) return { title: "Spectacle introuvable - L'Espace Comédie Lille" };

  const dateLabel = format(spectacle.dateSpectacle, 'EEEE d MMMM yyyy', { locale: fr });
  return {
    title: `${spectacle.title} - L'Espace Comédie Lille`,
    description: `${spectacle.title} le ${dateLabel} à ${formatTime(spectacle.heureSpectacle)} — ${spectacle.description.slice(0, 140)}`,
    alternates: { canonical: `/programmation/${spectacle.id}` },
  };
}

export default async function SpectacleDetailPage({ params }: Props) {
  const spectacle = await loadSpectacle((await params).id);
  if (!spectacle) notFound();

  const photos = await getPhotosForCategory(spectacle.categoryId, 3);
  const showsVideo = spectacle.title.toLowerCase().includes('tchatcheur comedy club');

  return (
    <section className="bg-black py-12">
      <div className="mx-auto max-w-[1280px] px-6">
        <div className="relative mb-8 h-[500px] overflow-hidden rounded-xl shadow-2xl md:h-[700px]">
          <Image
            src={spectacle.img}
            alt={spectacle.title}
            fill
            priority
            sizes="100vw"
            className="object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
            <span className="mb-6 inline-block rounded-full bg-accent px-4 py-2 text-sm font-bold uppercase tracking-wide text-white shadow-lg">
              {format(spectacle.dateSpectacle, 'd MMM', { locale: fr }).toUpperCase()}
            </span>
            <h1 className="mb-6 text-3xl font-bold leading-tight text-white drop-shadow-2xl md:text-5xl lg:text-6xl">
              {spectacle.title}
            </h1>
            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-base text-white/90 md:text-lg">
              <span className="font-medium">{format(spectacle.dateSpectacle, 'EEEE d MMMM yyyy', { locale: fr })}</span>
              <span className="font-medium">{formatTime(spectacle.heureSpectacle)}</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          <div className="md:col-span-2">
            <div className="mb-6 rounded-lg bg-gray-900 p-6">
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div>
                  <p className="text-sm text-gray-400">Date</p>
                  <p className="text-white">{format(spectacle.dateSpectacle, 'EEEE d MMMM yyyy', { locale: fr })}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-400">Heure</p>
                  <p className="text-white">{formatTime(spectacle.heureSpectacle)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-400">Lieu</p>
                  <p className="text-white">{spectacle.lieu}</p>
                </div>
              </div>
            </div>

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

            {showsVideo && (
              <div className="mb-6 rounded-lg bg-gray-900 p-6">
                <h2 className="mb-4 text-2xl font-bold text-white">Vidéo</h2>
                <div className="aspect-video w-full overflow-hidden rounded bg-black">
                  <iframe
                    src="https://www.youtube.com/embed/bjQdOh830G4"
                    title="Vidéo YouTube"
                    className="h-full w-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                  />
                </div>
                <a
                  href="https://youtu.be/bjQdOh830G4"
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
                <a
                  href={spectacle.lienSpectacle}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block w-full rounded bg-accent py-3 text-center font-bold text-white transition duration-300 hover:bg-accent-hover"
                >
                  Réserver maintenant
                </a>
              ) : (
                <span className="block w-full cursor-not-allowed rounded bg-gray-700 py-3 text-center font-bold text-gray-400">
                  Lien de billetterie indisponible
                </span>
              )}
              <div className="mt-6 space-y-2">
                <div className="flex items-center justify-between text-gray-300">
                  <span>Date</span>
                  <span>{format(spectacle.dateSpectacle, 'EEEE d MMM yyyy', { locale: fr })}</span>
                </div>
                <div className="flex items-center justify-between text-gray-300">
                  <span>Heure</span>
                  <span>{formatTime(spectacle.heureSpectacle)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
