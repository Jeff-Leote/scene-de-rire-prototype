'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';

const NAV_LINKS = [
  { href: '/', label: 'Accueil' },
  { href: '/programmation', label: 'Programmation' },
  { href: '/le-lieu', label: 'Le lieu' },
  { href: '/artistes', label: 'Artistes' },
  { href: '/contact', label: 'Contact' },
];

const BOOKING_URL = 'https://www.billetweb.fr/multi_event.php?user=139847';

function NavLink({
  href,
  label,
  isActive,
  onClick,
}: {
  href: string;
  label: string;
  isActive: boolean;
  onClick?: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={
        isActive
          ? 'border-b-2 border-accent pb-1 text-accent'
          : 'pb-1 text-white transition duration-300 hover:text-accent'
      }
    >
      {label}
    </Link>
  );
}

export default function Header() {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <>
      <header className="fixed z-50 w-full bg-black px-6 py-4 text-white">
        <div className="mx-auto flex max-w-[1280px] items-center justify-between">
          <Link href="/" className="flex items-center">
            <Image
              src="/assets/img/logo-espace-comedie-lille.webp"
              alt="L'Espace Comédie Lille"
              width={160}
              height={64}
              className="h-12 w-auto md:h-16"
              priority
            />
          </Link>

          <nav className="hidden items-center space-x-8 md:flex">
            {NAV_LINKS.map((link) => (
              <NavLink key={link.href} href={link.href} label={link.label} isActive={pathname === link.href} />
            ))}
          </nav>

          <div className="flex items-center space-x-4">
            <a
              href={BOOKING_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden rounded bg-accent px-4 py-2 text-white transition duration-300 hover:bg-accent-hover md:inline-block"
            >
              Réserver
            </a>
            <button
              className="text-white focus:outline-none md:hidden"
              onClick={() => setIsMobileMenuOpen((open) => !open)}
              aria-label="Ouvrir le menu"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                {isMobileMenuOpen ? (
                  <path d="M18 6 6 18M6 6l12 12" strokeLinecap="round" />
                ) : (
                  <path d="M3 6h18M3 12h18M3 18h18" strokeLinecap="round" />
                )}
              </svg>
            </button>
          </div>
        </div>
      </header>

      <div className={`fixed inset-0 z-40 bg-black/95 ${isMobileMenuOpen ? 'block' : 'hidden'}`}>
        <div className="flex h-full flex-col items-center justify-center">
          <nav className="flex flex-col space-y-6 text-center">
            {NAV_LINKS.map((link) => (
              <NavLink
                key={link.href}
                href={link.href}
                label={link.label}
                isActive={pathname === link.href}
                onClick={() => setIsMobileMenuOpen(false)}
              />
            ))}
            <a
              href={BOOKING_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 rounded bg-accent px-6 py-3 text-xl text-white transition duration-300 hover:bg-accent-hover"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Réserver
            </a>
          </nav>
        </div>
      </div>
    </>
  );
}
