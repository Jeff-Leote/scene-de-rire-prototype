import Image from 'next/image';
import type { Metadata } from 'next';
import { getAllArtistes } from '@/lib/artistes';

export const metadata: Metadata = {
  title: "Nos artistes - L'Espace Comédie Lille",
  description: "Découvrez les humoristes déjà venus se produire à L'Espace Comédie Lille.",
  alternates: { canonical: '/artistes' },
};

export const dynamic = 'force-dynamic';

export default async function ArtistesPage() {
  const artistes = await getAllArtistes();

  return (
    <section className="bg-gray-950 py-16">
      <div className="mx-auto max-w-[1280px] px-6">
        <h1 className="mb-8 text-3xl font-bold text-white">Nos Artistes</h1>

        {artistes.length === 0 ? (
          <p className="text-center text-gray-400">Aucun artiste à afficher pour le moment.</p>
        ) : (
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            {artistes.map((artiste) => (
              <div key={artiste.id} className="group relative">
                <div className="relative aspect-[3/4] overflow-hidden rounded-lg">
                  <Image
                    src={`/assets/img/photo_artiste/${artiste.photo}`}
                    alt={`Portrait de ${artiste.name}`}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
                  <div className="absolute inset-0 flex translate-y-full transform flex-col justify-end p-6 transition-transform duration-500 group-hover:translate-y-0">
                    <h3 className="mb-2 text-2xl font-bold text-white">{artiste.name}</h3>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
