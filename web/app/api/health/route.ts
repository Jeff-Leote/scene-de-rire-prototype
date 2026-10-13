import { NextResponse } from 'next/server';

// Route de santé légère : quelques octets, aucun appel à la base de données. Elle sert à la
// surveillance (Uptime Kuma, Health Check Path de Render) et au ping interne anti-veille,
// pour ne pas télécharger la page d'accueil (230 Ko non compressés) à chaque vérification.
export const dynamic = 'force-dynamic';

export function GET() {
  return NextResponse.json({ status: 'ok' }, { headers: { 'Cache-Control': 'no-store' } });
}
