'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import type { Spectacle } from '@prisma/client';

function formatDateLong(date: Date) {
  return date.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
}

function formatTime(date: Date) {
  return date.toISOString().slice(11, 16);
}

export default function HeroCarousel({ slides }: { slides: Spectacle[] }) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (slides.length <= 1) return;
    const timer = setInterval(() => setIndex((prev) => (prev + 1) % slides.length), 6000);
    return () => clearInterval(timer);
  }, [slides.length]);

  if (slides.length === 0) {
    return (
      <div className="flex h-[500px] items-center justify-center rounded-lg bg-gray-800">
        <p className="text-gray-400">Aucun spectacle disponible pour le moment</p>
      </div>
    );
  }

  const slide = slides[index];

  return (
    <div className="relative mb-12 h-[500px] overflow-hidden rounded-lg md:h-[700px]">
      <Image src={slide.img} alt={slide.title} fill priority sizes="100vw" className="object-cover" />
      <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent" />

      {slides.length > 1 && (
        <>
          <button
            aria-label="Précédent"
            className="absolute left-4 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-black/40 text-white hover:bg-black/60"
            onClick={() => setIndex((prev) => (prev - 1 + slides.length) % slides.length)}
          >
            ‹
          </button>
          <button
            aria-label="Suivant"
            className="absolute right-4 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-black/40 text-white hover:bg-black/60"
            onClick={() => setIndex((prev) => (prev + 1) % slides.length)}
          >
            ›
          </button>
        </>
      )}

      <div className="absolute bottom-0 left-0 w-full p-4 sm:p-6 lg:p-8">
        <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
          <span className="w-fit rounded-full bg-accent px-3 py-1 text-sm font-bold uppercase text-white">À venir</span>
          <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:gap-3">
            <span className="text-sm text-white sm:text-base">{formatDateLong(slide.dateSpectacle)}</span>
            <span className="text-sm font-medium text-accent sm:text-base">{formatTime(slide.heureSpectacle)}</span>
          </div>
        </div>

        <h1 className="mb-6 text-2xl font-bold leading-tight text-white sm:text-3xl md:text-4xl lg:text-5xl">
          {slide.title}
        </h1>

        <div className="flex flex-col gap-3 sm:flex-row sm:gap-4">
          <Link
            href={`/programmation/${slide.id}`}
            className="flex items-center justify-center rounded bg-accent px-4 py-3 font-medium text-white transition duration-300 hover:bg-accent-hover sm:justify-start sm:px-6"
          >
            Réserver maintenant
          </Link>
          <Link
            href={`/programmation/${slide.id}`}
            className="flex items-center justify-center rounded border border-accent px-4 py-3 font-medium text-accent transition duration-300 hover:bg-accent hover:text-white sm:justify-start sm:px-6"
          >
            Plus d&apos;infos
          </Link>
        </div>

        {slides.length > 1 && (
          <div className="mt-6 flex gap-2">
            {slides.map((_, i) => (
              <button
                key={i}
                aria-label={`Aller au slide ${i + 1}`}
                className={`h-2 w-2 rounded-full ${i === index ? 'bg-accent' : 'bg-gray-600'}`}
                onClick={() => setIndex(i)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
