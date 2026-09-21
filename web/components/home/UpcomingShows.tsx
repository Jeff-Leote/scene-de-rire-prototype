import Link from 'next/link';
import type { Spectacle } from '@prisma/client';
import SpectacleCard from '@/components/SpectacleCard';

export default function UpcomingShows({ shows }: { shows: Spectacle[] }) {
  return (
    <section className="bg-black py-12">
      <div className="mx-auto max-w-[1280px] px-6">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-2xl font-bold text-white sm:text-3xl lg:text-4xl">Prochains spectacles</h2>
          <Link
            href="/programmation"
            className="flex items-center text-sm font-medium text-accent transition duration-300 hover:text-accent-hover sm:text-base"
          >
            Voir tous les spectacles →
          </Link>
        </div>

        {shows.length === 0 ? (
          <p className="py-12 text-center text-lg text-gray-400">Aucun spectacle à venir pour le moment.</p>
        ) : (
          <div
            className={`grid gap-4 sm:gap-6 ${
              shows.length === 1
                ? 'grid-cols-1 justify-center'
                : shows.length === 2
                  ? 'grid-cols-1 sm:grid-cols-2'
                  : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
            }`}
          >
            {shows.map((show) => (
              <SpectacleCard key={show.id} show={show} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
