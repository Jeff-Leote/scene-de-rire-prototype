'use client';

import { trackBookingClick } from '@/lib/analytics';

export default function BookingLink({
  href,
  spectacleId,
  className,
  children,
}: {
  href: string;
  spectacleId?: number;
  className?: string;
  children: React.ReactNode;
}) {
  function handleClick() {
    trackBookingClick();
    // Fire-and-forget : le clic est enregistré avant la redirection, sans bloquer.
    if (typeof navigator !== 'undefined' && navigator.sendBeacon) {
      const body = JSON.stringify({ spectacleId: spectacleId ?? null });
      navigator.sendBeacon('/api/clic-billetterie', new Blob([body], { type: 'application/json' }));
    }
  }

  return (
    <a href={href} target="_blank" rel="noopener noreferrer" onClick={handleClick} className={className}>
      {children}
    </a>
  );
}
