import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import Header from '@/components/Header';
import ConditionalFooter from '@/components/ConditionalFooter';
import { BASE_URL } from '@/lib/config';
import './globals.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: "L'Espace Comédie Lille - Spectacles d'humour à Lille | Stand-up & Comédies",
  description:
    "L'Espace Comédie Lille : la référence pour découvrir et réserver les meilleurs spectacles d'humour à Lille.",
  alternates: { canonical: '/' },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body className={`${inter.variable} font-sans`}>
        <Header />
        <main className="pt-20 md:pt-24">{children}</main>
        <ConditionalFooter />
      </body>
    </html>
  );
}
