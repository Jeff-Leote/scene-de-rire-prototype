import Link from 'next/link';
import Image from 'next/image';
import type { Lieu } from '@prisma/client';

export default function VenueTeaser({ mainImage }: { mainImage: Lieu | null }) {
  return (
    <section className="bg-gray-950 py-16">
      <div className="mx-auto max-w-[1280px] px-6">
        <div className="flex flex-col gap-12 md:flex-row">
          <div className="md:w-1/2">
            <h2 className="mb-6 text-3xl font-bold text-white">Notre salle</h2>
            <p className="mb-6 text-gray-300">
              En plein cœur de Lille, notre salle propose une ambiance conviviale et chaleureuse pour profiter des
              meilleurs humoristes dans d&apos;excellentes conditions. Grâce à une acoustique soignée et une visibilité
              optimale depuis chaque place, chaque spectacle devient un moment unique.
            </p>

            <div className="mb-6 grid grid-cols-2 gap-4">
              <span className="text-white">70 places assises</span>
              <span className="text-white">Café - Théâtre</span>
              <span className="text-white">Parking à proximité</span>
            </div>

            <Link
              href="/le-lieu"
              className="mt-4 inline-block rounded bg-accent px-6 py-3 text-white transition duration-300 hover:bg-accent-hover"
            >
              Comment s&apos;y rendre
            </Link>
          </div>

          <div className="md:w-1/2">
            <div className="relative h-[400px] overflow-hidden rounded-lg">
              {mainImage ? (
                <Image
                  src={`/assets/img/image_path/${mainImage.imagePath}`}
                  alt="Intérieur du comedy club"
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-gray-800 text-gray-400">
                  Aucune image principale
                </div>
              )}
              <div className="absolute inset-0 bg-black/30" />
              <div className="absolute bottom-6 right-6 rounded-lg bg-accent px-4 py-2 font-bold text-white">
                Ouverture des portes 1 heure avant le spectacle
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
