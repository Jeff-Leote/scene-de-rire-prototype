import { NextResponse } from 'next/server';
import { getContactRecipientEmail } from '@/lib/settings';
import { sendContactEmail } from '@/lib/email';

const EMAIL_PATTERN = /^\S+@\S+\.\S+$/;

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const { firstName, lastName, email, subject, message } = body ?? {};

  if (!firstName || !lastName || !email || !subject || !message) {
    return NextResponse.json({ error: 'Champs requis manquants.' }, { status: 400 });
  }
  if (typeof email !== 'string' || !EMAIL_PATTERN.test(email)) {
    return NextResponse.json({ error: 'Adresse email invalide.' }, { status: 400 });
  }

  const to = await getContactRecipientEmail();
  if (!to) {
    return NextResponse.json({ error: 'Adresse de réception non configurée.' }, { status: 500 });
  }

  try {
    await sendContactEmail({ to, firstName, lastName, email, subject, message });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Erreur envoi email de contact:', error);
    return NextResponse.json({ error: "Impossible d'envoyer le message." }, { status: 500 });
  }
}
