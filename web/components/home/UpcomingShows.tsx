import Link from 'next/link';
import Image from 'next/image';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import type { Spectacle } from '@prisma/client';

function formatTime(date: Date) {
  return date.toISOString().slice(11, 16);
}

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
              <Link
                key={show.id}
                href={`/programmation/${show.id}`}
                className="flex w-full flex-col overflow-hidden rounded-lg bg-gray-900 shadow-lg transition duration-300 hover:scale-[1.02] hover:shadow-xl"
              >
                <div className="relative min-h-[36rem] w-full flex-1">
                  <Image
                    src={show.img}
                    alt={show.title}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    className="object-cover"
                  />
                  <div className="absolute right-4 top-4 rounded-full bg-accent px-3 py-1 text-xl font-bold text-white">
                    {format(show.dateSpectacle, 'd MMM', { locale: fr }).toUpperCase()}
                  </div>
                </div>

                <div className="bg-gray-900 p-4">
                  <h3 className="mb-1 line-clamp-2 text-lg font-bold text-white">{show.title}</h3>
                  <p className="mb-3 text-sm text-gray-400">
                    {format(show.dateSpectacle, 'EEEE d MMMM', { locale: fr })} - {formatTime(show.heureSpectacle)}
                  </p>
                  <span className="block w-full rounded bg-black py-2 text-center font-semibold text-white transition duration-300 hover:bg-accent">
                    RÉSERVER
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
