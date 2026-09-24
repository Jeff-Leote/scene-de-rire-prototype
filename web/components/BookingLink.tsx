'use client';

import { trackBookingClick } from '@/lib/analytics';

export default function BookingLink({
  href,
  className,
  children,
}: {
  href: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" onClick={trackBookingClick} className={className}>
      {children}
    </a>
  );
}
