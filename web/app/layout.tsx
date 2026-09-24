import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import Script from 'next/script';
import Header from '@/components/Header';
import ConditionalFooter from '@/components/ConditionalFooter';
import { BASE_URL } from '@/lib/config';
import './globals.css';

const GA_MEASUREMENT_ID = 'G-WM0J08Y741';
const GOOGLE_ADS_ID = 'AW-17654685757';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: "L'Espace Comédie Lille - Spectacles d'humour à Lille | Stand-up & Comédies",
  description:
    "L'Espace Comédie Lille : la référence pour découvrir et réserver les meilleurs spectacles d'humour à Lille.",
  alternates: { canonical: '/' },
  icons: {
    icon: '/assets/img/logo-espace-comedie-lille.webp',
    shortcut: '/assets/img/logo-espace-comedie-lille.webp',
    apple: '/assets/img/logo-espace-comedie-lille.webp',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body className={`${inter.variable} font-sans`}>
        <Script src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`} strategy="afterInteractive" />
        <Script id="google-tag" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${GA_MEASUREMENT_ID}');
            gtag('config', '${GOOGLE_ADS_ID}');
          `}
        </Script>
        <Header />
        <main className="pt-20 md:pt-24">{children}</main>
        <ConditionalFooter />
      </body>
    </html>
  );
}
