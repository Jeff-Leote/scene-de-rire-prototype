import Link from 'next/link';
import type { Spectacle } from '@prisma/client';
import HeroCarousel from './HeroCarousel';

export default function Hero({ slides }: { slides: Spectacle[] }) {
  return (
    <section className="bg-black px-6 pb-16 pt-8">
      <div className="mx-auto max-w-[1280px]">
        <HeroCarousel slides={slides} />

        <div className="mb-12 text-center">
          <h1 className="mb-6 text-4xl font-bold text-white md:text-5xl lg:text-6xl">L&apos;Espace Comédie Lille</h1>
          <p className="mx-auto mb-4 max-w-4xl text-xl text-gray-300 md:text-2xl">
            La référence pour découvrir et réserver les meilleurs spectacles d&apos;humour à Lille
          </p>
          <p className="mx-auto mb-8 max-w-3xl text-lg text-gray-400">
            Située en plein cœur de la ville, notre salle offre une expérience intime et chaleureuse pour apprécier les
            meilleurs humoristes dans des conditions optimales. Stand-up, comédies et soirées exceptionnelles vous
            attendent.
          </p>
          <div className="flex flex-col justify-center gap-4 sm:flex-row">
            <Link
              href="/programmation"
              className="rounded-lg bg-accent px-8 py-4 text-lg font-medium text-white transition duration-300 hover:bg-accent-hover"
            >
              Voir la programmation
            </Link>
            <Link
              href="/le-lieu"
              className="rounded-lg border border-accent px-8 py-4 text-lg font-medium text-accent transition duration-300 hover:bg-accent hover:text-white"
            >
              Découvrir le lieu
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
