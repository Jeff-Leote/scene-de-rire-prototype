import Link from 'next/link';
import { redirect } from 'next/navigation';
import type { Metadata } from 'next';
import { getUpcomingSpectaclesPage } from '@/lib/spectacles';
import SpectacleCard from '@/components/SpectacleCard';

export const metadata: Metadata = {
  title: "Programmation - L'Espace Comédie Lille",
  description:
    "Toute la programmation à venir de L'Espace Comédie Lille : stand-up, comédies et soirées d'humour à Lille.",
};

export const dynamic = 'force-dynamic';

const PAGE_SIZE = 9;

function parsePage(value: string | string[] | undefined) {
  const page = Number(Array.isArray(value) ? value[0] : value);
  return Number.isInteger(page) && page > 0 ? page : 1;
}

export default async function ProgrammationPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string | string[] }>;
}) {
  const page = parsePage((await searchParams).page);
  const { items, totalPages } = await getUpcomingSpectaclesPage(page, PAGE_SIZE);

  if (page > totalPages) {
    redirect(`/programmation?page=${totalPages}`);
  }

  return (
    <section className="bg-black py-16">
      <div className="mx-auto max-w-[1280px] px-6">
        <h1 className="mb-8 text-3xl font-bold text-white">Liste des spectacles</h1>

        {items.length === 0 ? (
          <p className="text-center text-gray-400">Aucun spectacle trouvé</p>
        ) : (
          <>
            <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3">
              {items.map((show) => (
                <SpectacleCard key={show.id} show={show} />
              ))}
            </div>

            <div className="flex items-center justify-center space-x-4">
              <Link
                href={`/programmation?page=${page - 1}`}
                aria-disabled={page === 1}
                className={`rounded px-4 py-2 font-bold text-white transition duration-300 ${
                  page === 1 ? 'pointer-events-none bg-accent/50' : 'bg-accent hover:bg-accent-hover'
                }`}
              >
                Précédent
              </Link>
              <span className="px-4 py-2 text-white">
                Page {page} / {totalPages}
              </span>
              <Link
                href={`/programmation?page=${page + 1}`}
                aria-disabled={page === totalPages}
                className={`rounded px-4 py-2 font-bold text-white transition duration-300 ${
                  page === totalPages ? 'pointer-events-none bg-accent/50' : 'bg-accent hover:bg-accent-hover'
                }`}
              >
                Suivant
              </Link>
            </div>
          </>
        )}
      </div>
    </section>
  );
}
