export const CONTACT_SUBJECTS = ['spectacle', 'partenariat', 'autre'] as const;

export const CONTACT_LIMITS = {
  name: 80,
  email: 254,
  message: 5000,
  body: 20000,
} as const;

const EMAIL_PATTERN = /^[^\s@]+@(?:[^\s@.]+\.)+[^\s@.]+$/;
const LINE_BREAK = /[\r\n]/;

export type ContactInput = {
  firstName: string;
  lastName: string;
  email: string;
  subject: (typeof CONTACT_SUBJECTS)[number];
  message: string;
};

export type ContactValidation =
  | { status: 'valid'; data: ContactInput }
  // Le champ piège « site_check » est rempli : c'est un robot, la demande est ignorée sans le lui dire.
  | { status: 'spam' }
  | { status: 'invalid'; error: string };

function asText(value: unknown): string | null {
  return typeof value === 'string' ? value.trim() : null;
}

export function validateContact(body: unknown): ContactValidation {
  const input = (typeof body === 'object' && body !== null ? body : {}) as Record<string, unknown>;

  if (typeof input.site_check === 'string' && input.site_check.trim() !== '') {
    return { status: 'spam' };
  }

  const firstName = asText(input.firstName);
  const lastName = asText(input.lastName);
  const email = asText(input.email);
  const subject = asText(input.subject);
  const message = asText(input.message);

  if (!firstName || !lastName || !email || !subject || !message) {
    return { status: 'invalid', error: 'Champs requis manquants.' };
  }
  if (firstName.length > CONTACT_LIMITS.name || lastName.length > CONTACT_LIMITS.name) {
    return { status: 'invalid', error: `Le prénom et le nom sont limités à ${CONTACT_LIMITS.name} caractères.` };
  }
  if (LINE_BREAK.test(firstName) || LINE_BREAK.test(lastName) || LINE_BREAK.test(email)) {
    return { status: 'invalid', error: 'Caractères non autorisés.' };
  }
  if (email.length > CONTACT_LIMITS.email || !EMAIL_PATTERN.test(email)) {
    return { status: 'invalid', error: 'Adresse email invalide.' };
  }
  if (!(CONTACT_SUBJECTS as readonly string[]).includes(subject)) {
    return { status: 'invalid', error: 'Sujet invalide.' };
  }
  if (message.length > CONTACT_LIMITS.message) {
    return { status: 'invalid', error: `Le message est limité à ${CONTACT_LIMITS.message} caractères.` };
  }

  return {
    status: 'valid',
    data: { firstName, lastName, email, subject: subject as ContactInput['subject'], message },
  };
}
