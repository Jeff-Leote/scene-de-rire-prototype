import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: "L'Espace Comédie Lille - Spectacles d'humour à Lille | Stand-up & Comédies",
  description:
    "L'Espace Comédie Lille : la référence pour découvrir et réserver les meilleurs spectacles d'humour à Lille.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body className="font-sans">{children}</body>
    </html>
  );
}
