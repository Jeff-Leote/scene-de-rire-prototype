import Link from 'next/link';
import Image from 'next/image';
import type { Artiste } from '@prisma/client';

export default function FeaturedArtists({ artistes }: { artistes: Artiste[] }) {
  return (
    <section className="bg-gray-950 py-16">
      <div className="mx-auto max-w-[1280px] px-6">
        <h2 className="mb-8 text-3xl font-bold text-white">Artistes déjà venus</h2>

        <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
          {artistes.map((artiste) => (
            <div key={artiste.id} className="group">
              <div className="relative aspect-square overflow-hidden rounded-full">
                <Image
                  src={`/assets/img/photo_artiste/${artiste.photo}`}
                  alt={`Portrait de ${artiste.name}`}
                  fill
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-accent opacity-0 transition-opacity duration-300 group-hover:opacity-20" />
              </div>
            </div>
          ))}
        </div>

        <div className="mt-10 text-center">
          <Link
            href="/artistes"
            className="inline-block rounded border-2 border-accent bg-transparent px-6 py-3 text-accent transition duration-300 hover:bg-accent hover:text-black"
          >
            Découvrir tous les artistes
          </Link>
        </div>
      </div>
    </section>
  );
}
