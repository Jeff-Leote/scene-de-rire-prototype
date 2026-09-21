import Link from 'next/link';

export default function CTA() {
  return (
    <section className="bg-gray-950 py-16">
      <div className="mx-auto max-w-[1280px] px-6 text-center">
        <h2 className="mb-6 text-3xl font-bold text-white">Prêt à rire ?</h2>
        <p className="mx-auto mb-8 max-w-2xl text-lg text-gray-300">
          Découvrez notre programmation et réservez vos places pour les meilleurs spectacles d&apos;humour.
        </p>

        <div className="flex flex-col justify-center gap-4 sm:flex-row">
          <Link
            href="/programmation"
            className="rounded-lg bg-accent px-8 py-4 font-bold text-white transition duration-300 hover:bg-accent-hover"
          >
            Voir les spectacles
          </Link>
          <Link
            href="/contact"
            className="rounded-lg border-2 border-accent px-8 py-4 font-bold text-accent transition duration-300 hover:bg-accent hover:text-white"
          >
            Contacter l&apos;équipe
          </Link>
        </div>
      </div>
    </section>
  );
}
