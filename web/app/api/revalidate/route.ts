import { createHash, timingSafeEqual } from 'crypto';
import { revalidateTag } from 'next/cache';
import { NextRequest, NextResponse } from 'next/server';

const ALLOWED_TAGS = ['spectacles', 'artistes', 'lieu'] as const;
type AllowedTag = (typeof ALLOWED_TAGS)[number];

function isValidSecret(received: string, expected: string): boolean {
  if (!expected || !received) return false;
  // Hachage SHA-256 des deux côtés : buffers de longueur fixe (32 octets)
  // — élimine toute fuite de timing liée à la longueur du token reçu.
  const hash = (s: string) => createHash('sha256').update(s).digest();
  return timingSafeEqual(hash(received), hash(expected));
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  const secret = process.env.REVALIDATE_SECRET ?? '';

  // 1. Vérification du secret (temps constant)
  const auth = req.headers.get('authorization') ?? '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : '';

  if (!isValidSecret(token, secret)) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  }

  // 2. Lecture du corps
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Corps JSON invalide' }, { status: 400 });
  }

  const rawTags = (
    Array.isArray((body as Record<string, unknown>)['tags'])
      ? ((body as Record<string, unknown>)['tags'] as unknown[])
      : []
  ).slice(0, 10);

  // 3. Revalidation (liste blanche stricte)
  const revalidated: AllowedTag[] = [];
  for (const tag of rawTags) {
    if (typeof tag === 'string' && (ALLOWED_TAGS as readonly string[]).includes(tag)) {
      revalidateTag(tag);
      revalidated.push(tag as AllowedTag);
    }
  }

  return NextResponse.json({ revalidated });
}
