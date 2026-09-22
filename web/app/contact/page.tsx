import type { Metadata } from 'next';
import {
  PhoneIcon,
  EnvelopeIcon,
  MapPinIcon,
  ClockIcon,
  GoogleIcon,
  FacebookIcon,
  InstagramIcon,
} from '@/components/icons';
import ContactForm from '@/components/contact/ContactForm';
import ContactFaq from '@/components/contact/ContactFaq';

export const metadata: Metadata = {
  title: "Contact - L'Espace Comédie Lille",
  description: "Contactez L'Espace Comédie Lille : téléphone, email, adresse et formulaire de contact.",
};

const SOCIAL_LINKS = [
  { href: 'https://share.google/wyNIUTlnM8Zr7oszq', label: 'Google', Icon: GoogleIcon },
  { href: 'https://www.facebook.com/share/1FYTKaxZrB/?mibextid=wwXIfr', label: 'Facebook', Icon: FacebookIcon },
  {
    href: 'https://www.instagram.com/lespacecomedie?igsh=MTBrNXcydjZmYzhhaA==',
    label: 'Instagram',
    Icon: InstagramIcon,
  },
];

export default function ContactPage() {
  return (
    <div className="bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 py-12 md:px-8">
        <section className="mx-auto mb-16 max-w-3xl text-center">
          <h1 className="mb-4 text-4xl font-bold text-gray-900 md:text-5xl">Contactez-nous</h1>
          <p className="text-xl text-gray-600">Une question ? Une suggestion ? Nous sommes à votre écoute.</p>
        </section>

        <div className="mb-16 flex flex-col gap-12 lg:flex-row">
          <section className="lg:w-1/3">
            <div className="rounded-xl bg-white p-8 shadow-md">
              <h2 className="mb-6 text-2xl font-bold text-accent">Nous joindre</h2>

              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <PhoneIcon className="mt-1 h-6 w-6 shrink-0 text-accent" />
                  <div>
                    <h3 className="mb-1 font-semibold text-gray-900">Téléphone</h3>
                    <span className="text-accent">06 67 16 09 43</span>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <EnvelopeIcon className="mt-1 h-6 w-6 shrink-0 text-accent" />
                  <div>
                    <h3 className="mb-1 font-semibold text-gray-900">Email</h3>
                    <a href="mailto:lespacecomedie@gmail.com" className="text-accent hover:underline">
                      lespacecomedie@gmail.com
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <MapPinIcon className="mt-1 h-6 w-6 shrink-0 text-accent" />
                  <div>
                    <h3 className="mb-1 font-semibold text-gray-900">Adresse</h3>
                    <p className="text-gray-700">
                      136 rue Solférino
                      <br />
                      59000 Lille
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <ClockIcon className="mt-1 h-6 w-6 shrink-0 text-accent" />
                  <div>
                    <h3 className="mb-1 font-semibold text-gray-900">Horaires d&apos;ouverture</h3>
                    <p className="text-gray-700">
                      Lundi–Vendredi : 18h–23h
                      <br />
                      Samedi–Dimanche : 16h–22h
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-10">
                <h3 className="mb-4 font-semibold text-gray-900">Suivez-nous</h3>
                <div className="flex space-x-4">
                  {SOCIAL_LINKS.map(({ href, label, Icon }) => (
                    <a
                      key={label}
                      href={href}
                      target="_blank"
                      rel="noreferrer"
                      aria-label={label}
                      className="rounded-full bg-black/10 p-3 text-accent transition duration-300 hover:bg-black/20"
                    >
                      <Icon />
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </section>

          <section className="lg:w-2/3">
            <div className="rounded-xl bg-white p-8 shadow-md">
              <h2 className="mb-6 text-2xl font-bold text-accent">Envoyez-nous un message</h2>
              <ContactForm />
            </div>
          </section>
        </div>

        <section className="mb-16">
          <div className="rounded-xl bg-white p-8 shadow-md">
            <h2 className="mb-6 text-2xl font-bold text-accent">Questions fréquentes</h2>
            <ContactFaq />
          </div>
        </section>
      </div>
    </div>
  );
}
