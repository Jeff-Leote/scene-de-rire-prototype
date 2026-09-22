import Image from 'next/image';
import type { Metadata } from 'next';
import { getGalleryLieuImages } from '@/lib/lieu';
import CTA from '@/components/CTA';

export const metadata: Metadata = {
  title: "Le lieu - L'Espace Comédie Lille",
  description:
    "Découvrez L'Espace Comédie Lille : photos de la salle, infos pratiques, accès et FAQ pour votre soirée d'humour à Lille.",
  alternates: { canonical: '/le-lieu' },
};

export const dynamic = 'force-dynamic';

export default async function LeLieuPage() {
  const galleryImages = await getGalleryLieuImages();

  return (
    <>
      <section className="relative h-[500px] w-full overflow-hidden md:h-[700px]">
        <Image
          src="/assets/img/banniere lieu.webp"
          alt="L'Espace Comédie Lille - scène et salle"
          fill
          priority
          sizes="100vw"
          className="object-cover object-top opacity-80"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent" />
        <div className="relative mx-auto flex h-full max-w-[1280px] flex-col justify-end px-4 pb-8 md:px-8">
          <h1 className="mb-4 text-4xl font-bold text-accent md:text-5xl lg:text-6xl">
            Bienvenue à L&apos;Espace Comédie
          </h1>
          <p className="max-w-3xl text-xl text-white md:text-2xl">
            Votre destination incontournable pour des soirées de rire au cœur de la ville
          </p>
        </div>
      </section>

      <section className="bg-black py-16">
        <div className="mx-auto max-w-[1280px] px-4 md:px-8">
          <div className="mx-auto max-w-4xl text-center">
            <p className="mb-8 text-xl leading-relaxed md:text-2xl">
              Situé en plein cœur de la ville, L&apos;Espace Comédie vous accueille pour des soirées de rire et de
              découvertes humoristiques dans une ambiance conviviale et intimiste.
            </p>
            <p className="text-lg text-accent md:text-xl">136 rue Solférino, 59800 Lille</p>
          </div>
        </div>
      </section>

      <section className="bg-gray-950 py-12">
        <div className="mx-auto max-w-[1280px] px-4 md:px-8">
          <h2 className="mb-10 text-center text-3xl font-bold text-accent">Découvrez notre espace</h2>
          {galleryImages.length === 0 ? (
            <p className="text-center text-gray-400">Aucune photo disponible pour le moment.</p>
          ) : (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              {galleryImages.map((image) => (
                <div key={image.id} className="relative aspect-square overflow-hidden rounded-lg">
                  <Image
                    src={`/assets/img/image_path/${image.imagePath}`}
                    alt="Photo du lieu"
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    className="object-cover transition duration-500 hover:scale-105"
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="bg-black py-16">
        <div className="mx-auto max-w-[1280px] px-4 md:px-8">
          <div className="mx-auto max-w-4xl">
            <h2 className="mb-8 text-3xl font-bold text-accent">Comment venir ?</h2>

            <p className="mb-8 text-lg leading-relaxed">
              À deux pas du centre-ville, L&apos;Espace Comédie est facilement accessible en transports en commun ou à
              pied.
            </p>

            <div className="mb-12 grid grid-cols-1 gap-8 md:grid-cols-2">
              <div className="rounded-lg bg-gray-900 p-6">
                <h3 className="mb-4 text-xl font-semibold text-accent">Transports en commun</h3>
                <ul className="space-y-3">
                  <li>Métro : République – Beaux-Arts (Ligne M1) - 6 min à pied</li>
                  <li>Bus : L1, L5, 18, CITL (arrêts Wazemmes, Nationale, Porte de Douai)</li>
                  <li>Train : Depuis Lille Flandres/Europe via métro ou bus</li>
                  <li>Vélo : Stations V&apos;Lille à proximité</li>
                </ul>
              </div>

              <div className="rounded-lg bg-gray-900 p-6">
                <h3 className="mb-4 text-xl font-semibold text-accent">En voiture</h3>
                <ul className="space-y-3">
                  <li>Stationnement payant dans les rues avoisinantes</li>
                  <li>Parking gratuit le samedi et dimanche et en semaine à partir de 19h</li>
                  <li>Pensez à venir en avance les soirs de forte affluence</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-gray-950 py-12">
        <div className="mx-auto max-w-[1280px] px-4 md:px-8">
          <div className="mx-auto max-w-5xl">
            <h2 className="mb-8 text-center text-3xl font-bold text-accent">Nous situer</h2>
            <div className="relative mb-6 h-[400px] overflow-hidden rounded-lg">
              <iframe
                title="Google Map - L'Espace Comédie"
                src="https://www.google.com/maps?q=136+rue+Solférino,+59800+Lille&output=embed"
                width="100%"
                height="400"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
            <div className="flex justify-center">
              <a
                href="https://www.google.com/maps/dir/?api=1&destination=136+rue+Solférino,+59800+Lille"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center rounded-full bg-accent px-6 py-3 font-bold text-white transition duration-300 hover:bg-accent-hover"
              >
                Itinéraire depuis votre position
              </a>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-black py-16">
        <div className="mx-auto max-w-[1280px] px-4 md:px-8">
          <div className="mx-auto max-w-4xl">
            <h2 className="mb-12 text-center text-3xl font-bold text-accent">Infos pratiques</h2>

            <div className="mb-12 grid grid-cols-1 gap-8 md:grid-cols-2">
              <div className="rounded-lg bg-gray-900 p-6">
                <h3 className="mb-4 text-xl font-semibold text-accent">Horaires</h3>
                <ul className="space-y-3">
                  <li className="flex justify-between">
                    <span>Ouverture</span>
                    <span>18h00</span>
                  </li>
                  <li className="flex justify-between">
                    <span>Fermeture</span>
                    <span>23h00</span>
                  </li>
                  <li className="mt-4 text-sm text-accent">Les horaires peuvent varier selon les événements</li>
                </ul>
              </div>

              <div className="rounded-lg bg-gray-900 p-6">
                <h3 className="mb-4 text-xl font-semibold text-accent">Notre espace</h3>
                <ul className="space-y-3">
                  <li className="flex justify-between">
                    <span>Accessibilité PMR</span>
                    <span>Non</span>
                  </li>
                  <li className="flex justify-between">
                    <span>Toilette</span>
                    <span>Gratuit</span>
                  </li>
                </ul>
              </div>
            </div>

            <div className="rounded-lg bg-gray-900 p-8">
              <h3 className="mb-6 text-xl font-semibold text-accent">Questions fréquentes</h3>
              <div className="space-y-6">
                <div className="border-b border-gray-800 pb-4">
                  <h4 className="mb-2 text-lg font-medium">Où se situe l&apos;Espace Comédie ?</h4>
                  <p className="text-gray-300">
                    L&apos;Espace Comédie se trouve au 136 rue Solférino, en plein cœur de Lille. La salle se trouve au
                    sous-sol du Jager, l&apos;entrée se fait directement par le Jager. Un parking est à proximité pour
                    se garer facilement.
                  </p>
                </div>
                <div className="border-b border-gray-800 pb-4">
                  <h4 className="mb-2 text-lg font-medium">Faut-il réserver ?</h4>
                  <p className="text-gray-300">
                    Oui, on recommande de réserver en ligne sur notre billetterie sécurisée. Vous recevrez vos billets
                    par e-mail, il suffira de les présenter à l&apos;entrée (version papier ou sur téléphone). Il est
                    parfois possible de payer sur place si des places restent disponibles.
                  </p>
                </div>
                <div className="border-b border-gray-800 pb-4">
                  <h4 className="mb-2 text-lg font-medium">Est-il possible de boire et/ou manger sur place ?</h4>
                  <p className="text-gray-300">
                    Oui ! A l&apos;Espace Comédie vous pouvez profiter de boissons et de planches apéritives pendant,
                    avant ou après les spectacles. Les boissons sont servies et facturées exclusivement par le Jager,
                    titulaire de la licence IV.
                  </p>
                </div>
                <div>
                  <h4 className="mb-2 text-lg font-medium">
                    L&apos;Espace Comédie est-il accessible aux personnes à mobilité réduite (PMR) ?
                  </h4>
                  <p className="text-gray-300">
                    Notre salle se situe au sous-sol, sans ascenseur. L&apos;accès peut donc être difficile pour
                    certaines personnes à mobilité réduite. Nous avons déjà accueilli des spectateurs en fauteuil, aidés
                    par notre équipe pour descendre les escaliers. Si vous êtes concerné, n&apos;hésitez pas à nous
                    contacter en amont afin que nous puissions vous accompagner dans les meilleures conditions
                    possibles.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <CTA />
    </>
  );
}
