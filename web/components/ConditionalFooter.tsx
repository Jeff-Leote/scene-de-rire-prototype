'use client';

import { usePathname } from 'next/navigation';
import Footer from './Footer';

const PATHS_WITHOUT_FOOTER = ['/contact'];

export default function ConditionalFooter() {
  const pathname = usePathname();
  if (PATHS_WITHOUT_FOOTER.includes(pathname)) return null;
  return <Footer />;
}
