import Link from 'next/link';
import Image from 'next/image';
import { ClockIcon, EnvelopeIcon, FacebookIcon, GoogleIcon, InstagramIcon, MapPinIcon, PhoneIcon } from './icons';

const NAV_LINKS = [
  { href: '/', label: 'Accueil' },
  { href: '/programmation', label: 'Programmation' },
  { href: '/le-lieu', label: 'Le lieu' },
  { href: '/artistes', label: 'Artistes' },
  { href: '/contact', label: 'Contact' },
];

const SOCIAL_LINKS = [
  { href: 'https://share.google/wyNIUTlnM8Zr7oszq', label: 'Google', Icon: GoogleIcon },
  { href: 'https://www.facebook.com/share/1FYTKaxZrB/?mibextid=wwXIfr', label: 'Facebook', Icon: FacebookIcon },
  {
    href: 'https://www.instagram.com/lespacecomedie?igsh=MTBrNXcydjZmYzhhaA==',
    label: 'Instagram',
    Icon: InstagramIcon,
  },
];

export default function Footer() {
  return (
    <footer className="border-t border-gray-800 bg-black pb-8 pt-16 text-white">
      <div className="mx-auto max-w-[1280px] px-6">
        <div className="mb-12 grid grid-cols-1 gap-8 md:grid-cols-4">
          <div>
            <Link href="/" className="mb-4 flex items-center">
              <Image
                src="/assets/img/logo-espace-comedie-lille.webp"
                alt="L'Espace Comédie Lille"
                width={120}
                height={48}
                className="h-12 w-auto"
              />
            </Link>
            <p className="mb-4 text-gray-400">
              La référence pour découvrir et réserver les meilleurs spectacles d&apos;humour.
            </p>
            <div className="flex space-x-4">
              {SOCIAL_LINKS.map(({ href, label, Icon }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={label}
                  className="text-gray-400 transition duration-300 hover:text-accent"
                >
                  <Icon />
                </a>
              ))}
            </div>
          </div>

          <div>
            <h3 className="mb-4 text-lg font-bold text-white">Navigation</h3>
            <ul className="space-y-2">
              {NAV_LINKS.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-gray-400 transition duration-300 hover:text-accent">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="mb-4 text-lg font-bold text-white">Informations</h3>
            <ul className="space-y-2">
              <li className="text-gray-400">FAQ</li>
              <li className="text-gray-400">Mentions légales</li>
              <li className="text-gray-400">CGV</li>
              <li className="text-gray-400">Politique de confidentialité</li>
            </ul>
          </div>

          <div>
            <h3 className="mb-4 text-lg font-bold text-white">Contact</h3>
            <ul className="space-y-2">
              <li className="flex items-center gap-2">
                <MapPinIcon className="shrink-0 text-accent" />
                <span className="text-gray-400">136 rue Solférino, 59000 Lille</span>
              </li>
              <li className="flex items-center gap-2">
                <PhoneIcon className="shrink-0 text-accent" />
                <span className="text-gray-400">06 67 16 09 43</span>
              </li>
              <li className="flex items-center gap-2">
                <EnvelopeIcon className="shrink-0 text-accent" />
                <span className="text-gray-400">lespacecomedie@gmail.com</span>
              </li>
              <li className="flex items-center gap-2">
                <ClockIcon className="shrink-0 text-accent" />
                <span className="text-gray-400">Lundi–Vendredi : 18h–23h • Samedi–Dimanche : 16h–22h</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 pt-8">
          <div className="flex flex-col items-center justify-between md:flex-row">
            <p className="mb-4 text-sm text-gray-500 md:mb-0">
              © {new Date().getFullYear()} L&apos;Espace Comédie Lille. Tous droits réservés.
            </p>
            <Image
              src="/assets/img/logo-espace-comedie-lille.webp"
              alt="L'Espace Comédie Lille"
              width={40}
              height={16}
              className="h-4 w-auto"
            />
          </div>
        </div>
      </div>
    </footer>
  );
}
