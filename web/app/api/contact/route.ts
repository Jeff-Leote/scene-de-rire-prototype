import { NextResponse } from 'next/server';
import { getContactRecipientEmail } from '@/lib/settings';
import { sendContactEmail } from '@/lib/email';
import { CONTACT_LIMITS, validateContact } from '@/lib/contact';
import { createRateLimiter } from '@/lib/rateLimit';

// Par adresse IP : de quoi corriger une faute de frappe, pas de quoi inonder la boîte.
const ipLimiter = createRateLimiter({ limit: 5, windowMs: 10 * 60 * 1000 });
// Plafond global : borne les envois même si l'adresse IP est falsifiée ou si les robots sont nombreux.
const globalLimiter = createRateLimiter({ limit: 30, windowMs: 60 * 60 * 1000 });

const TOO_MANY = 'Trop de messages envoyés. Réessayez dans quelques minutes.';

// Render passe par Cloudflare, qui renseigne cf-connecting-ip. L'en-tête x-forwarded-for peut
// être falsifié : il ne sert qu'en dernier recours, et le plafond global limite l'abus.
function clientIp(request: Request): string {
  const headers = request.headers;
  return (
    headers.get('cf-connecting-ip') ??
    headers.get('x-real-ip') ??
    headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    'inconnue'
  );
}

function tooMany(retryAfterSeconds: number) {
  return NextResponse.json({ error: TOO_MANY }, { status: 429, headers: { 'Retry-After': String(retryAfterSeconds) } });
}

// Lit le corps par morceaux et s'arrête dès que la taille maximale est dépassée : un envoi en
// flux continu, sans content-length, ne doit pas être chargé entièrement en mémoire.
async function readLimitedText(request: Request, maxBytes: number): Promise<string | null> {
  const reader = request.body?.getReader();
  if (!reader) return '';

  const decoder = new TextDecoder();
  let text = '';
  let bytes = 0;
  try {
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      bytes += value.byteLength;
      if (bytes > maxBytes) {
        await reader.cancel();
        return null;
      }
      text += decoder.decode(value, { stream: true });
    }
  } catch {
    return '';
  }
  return text + decoder.decode();
}

function tooLarge() {
  return NextResponse.json({ error: 'Message trop volumineux.' }, { status: 413 });
}

export async function POST(request: Request) {
  const ipCheck = ipLimiter.check(clientIp(request));
  if (!ipCheck.allowed) {
    return tooMany(ipCheck.retryAfterSeconds);
  }

  const declaredLength = Number(request.headers.get('content-length'));
  if (declaredLength > CONTACT_LIMITS.body) {
    return tooLarge();
  }
  const text = await readLimitedText(request, CONTACT_LIMITS.body);
  if (text === null) {
    return tooLarge();
  }

  let body: unknown;
  try {
    body = JSON.parse(text);
  } catch {
    return NextResponse.json({ error: 'Requête invalide.' }, { status: 400 });
  }

  const validation = validateContact(body);
  if (validation.status === 'spam') {
    // Réponse de succès sans envoi : le robot ne sait pas qu'il a été repéré.
    return NextResponse.json({ success: true });
  }
  if (validation.status === 'invalid') {
    return NextResponse.json({ error: validation.error }, { status: 400 });
  }

  const globalCheck = globalLimiter.check('global');
  if (!globalCheck.allowed) {
    return tooMany(globalCheck.retryAfterSeconds);
  }

  const to = await getContactRecipientEmail();
  if (!to) {
    return NextResponse.json({ error: 'Adresse de réception non configurée.' }, { status: 500 });
  }

  try {
    await sendContactEmail({ to, ...validation.data });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Erreur envoi email de contact:', error);
    return NextResponse.json({ error: "Impossible d'envoyer le message." }, { status: 500 });
  }
}
