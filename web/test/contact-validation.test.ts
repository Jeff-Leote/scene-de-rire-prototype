import { describe, it, expect } from 'vitest';
import { CONTACT_LIMITS, validateContact } from '@/lib/contact';
import { escapeHtml } from '@/lib/html';

const valid = {
  firstName: 'Camille',
  lastName: 'Durand',
  email: 'camille@example.com',
  subject: 'spectacle',
  message: 'Bonjour, avez-vous encore des places pour samedi ?',
};

describe('validateContact', () => {
  it('accepte une demande normale et retire les espaces autour des valeurs', () => {
    const result = validateContact({ ...valid, firstName: '  Camille  ' });
    expect(result).toEqual({ status: 'valid', data: valid });
  });

  it('refuse une demande dont un champ manque ou n’est pas du texte', () => {
    expect(validateContact({ ...valid, message: '' })).toMatchObject({ status: 'invalid' });
    expect(validateContact({ ...valid, lastName: 42 })).toMatchObject({ status: 'invalid' });
    expect(validateContact(null)).toMatchObject({ status: 'invalid' });
  });

  it('refuse une adresse e-mail invalide', () => {
    expect(validateContact({ ...valid, email: 'pas-un-email' })).toEqual({
      status: 'invalid',
      error: 'Adresse email invalide.',
    });
  });

  it('refuse un sujet hors liste', () => {
    expect(validateContact({ ...valid, subject: 'promo' })).toMatchObject({ status: 'invalid' });
  });

  it('refuse les champs trop longs', () => {
    expect(validateContact({ ...valid, firstName: 'a'.repeat(CONTACT_LIMITS.name + 1) })).toMatchObject({
      status: 'invalid',
    });
    expect(validateContact({ ...valid, message: 'a'.repeat(CONTACT_LIMITS.message + 1) })).toMatchObject({
      status: 'invalid',
    });
    expect(validateContact({ ...valid, email: `${'a'.repeat(CONTACT_LIMITS.email)}@example.com` })).toMatchObject({
      status: 'invalid',
    });
  });

  it('refuse les retours à la ligne dans le nom et l’e-mail', () => {
    expect(validateContact({ ...valid, firstName: 'Camille\r\nBcc: autre@example.com' })).toMatchObject({
      status: 'invalid',
    });
  });

  it('repère un robot grâce au champ piège', () => {
    expect(validateContact({ ...valid, site_check: 'http://spam.example' })).toEqual({ status: 'spam' });
    expect(validateContact({ ...valid, site_check: '' })).toMatchObject({ status: 'valid' });
  });
});

describe('escapeHtml', () => {
  it('neutralise le HTML d’un visiteur', () => {
    expect(escapeHtml('<script>alert("x")</script> & \'ok\'')).toBe(
      '&lt;script&gt;alert(&quot;x&quot;)&lt;/script&gt; &amp; &#39;ok&#39;'
    );
  });
});
