import { randomUUID } from 'crypto';
import { prisma } from '@/lib/prisma';
import { createRateLimiter } from '@/lib/rateLimit';

// Par IP : 10 clics / minute couvrent largement un usage normal (une personne ne clique
// pas dix fois sur « Réserver » en une minute). Sert aussi de protection ciblée.
const ipLimiter = createRateLimiter({ limit: 10, windowMs: 60_000 });
// Plafond global : dernier filet si l'IP est falsifiée ou inconnue.
const globalLimiter = createRateLimiter({ limit: 200, windowMs: 60_000 });

function clientIp(request: Request): string {
  const h = request.headers;
  return (
    h.get('cf-connecting-ip') ?? h.get('x-real-ip') ?? h.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'inconnue'
  );
}

export async function POST(request: Request): Promise<Response> {
  const ip = clientIp(request);

  const ipCheck = ipLimiter.check(ip);
  if (!ipCheck.allowed) {
    return new Response(null, {
      status: 429,
      headers: { 'Retry-After': String(ipCheck.retryAfterSeconds) },
    });
  }

  const globalCheck = globalLimiter.check('global');
  if (!globalCheck.allowed) {
    return new Response(null, {
      status: 429,
      headers: { 'Retry-After': String(globalCheck.retryAfterSeconds) },
    });
  }

  const siteId = process.env.SITE_ID ?? '';
  if (!siteId) {
    return new Response(null, { status: 503 });
  }

  let spectacleId: number | null = null;
  try {
    const body = (await request.json()) as Record<string, unknown>;
    const raw = body['spectacleId'];
    if (typeof raw === 'number' && Number.isInteger(raw) && raw > 0) {
      spectacleId = raw;
    }
  } catch {
    // Corps absent ou invalide : clic global (spectacleId null)
  }

  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);

  try {
    // Atomique : INSERT ... ON CONFLICT DO UPDATE évite toute course entre deux requêtes
    // concurrentes. L'index NULLS NOT DISTINCT (PostgreSQL 15+) gère spectacle_id = NULL.
    await prisma.$executeRaw`
      INSERT INTO booking_click_daily (id, site_id, spectacle_id, day, count)
      VALUES (${randomUUID()}, ${siteId}, ${spectacleId}::int, ${today}::date, 1)
      ON CONFLICT (site_id, spectacle_id, day) DO UPDATE
        SET count = booking_click_daily.count + 1
    `;
  } catch {
    // Silencieux : un clic perdu ne doit pas bloquer la redirection.
  }

  return new Response(null, { status: 204 });
}

// navigator.sendBeacon ne suit pas les redirections : cette route doit rester
// sur la même origine que le site public.
export const runtime = 'nodejs';
