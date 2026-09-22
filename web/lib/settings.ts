import { prisma } from './prisma';

export async function getContactRecipientEmail(): Promise<string | null> {
  const setting = await prisma.settings.findUnique({ where: { key: 'contact_recipient_email' } });
  return setting?.value || process.env.CONTACT_RECIPIENT_EMAIL || process.env.SMTP_USER || null;
}
