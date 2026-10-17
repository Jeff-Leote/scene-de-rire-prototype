// @vitest-environment node
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

vi.mock('@/lib/email', () => ({ sendContactEmail: vi.fn().mockResolvedValue(undefined) }));
vi.mock('@/lib/settings', () => ({ getContactRecipientEmail: vi.fn().mockResolvedValue('cafe@example.com') }));

import { POST } from '@/app/api/contact/route';
import { sendContactEmail } from '@/lib/email';

const valid = {
  firstName: 'Camille',
  lastName: 'Durand',
  email: 'camille@example.com',
  subject: 'spectacle',
  message: 'Bonjour, avez-vous encore des places pour samedi ?',
};

function send(body: unknown, ip: string, headers: Record<string, string> = {}) {
  return POST(
    new Request('http://localhost/api/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'cf-connecting-ip': ip, ...headers },
      body: typeof body === 'string' ? body : JSON.stringify(body),
    })
  );
}

const startedAt = Date.now();
let testIndex = 0;

beforeEach(() => {
  vi.useFakeTimers({ toFake: ['Date'] });
  // Chaque test avance l'horloge de deux heures : les compteurs, d'une heure au plus, repartent à vide.
  testIndex += 1;
  vi.setSystemTime(startedAt + testIndex * 2 * 60 * 60 * 1000);
  vi.mocked(sendContactEmail).mockClear();
});

afterEach(() => {
  vi.useRealTimers();
});

describe('POST /api/contact', () => {
  it('envoie un message normal', async () => {
    const res = await send(valid, '10.0.0.1');

    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ success: true });
    expect(sendContactEmail).toHaveBeenCalledTimes(1);
    expect(sendContactEmail).toHaveBeenCalledWith({ to: 'cafe@example.com', ...valid });
  });

  it('refuse un message invalide sans envoyer d’e-mail', async () => {
    const res = await send({ ...valid, email: 'nope' }, '10.0.0.2');

    expect(res.status).toBe(400);
    expect(sendContactEmail).not.toHaveBeenCalled();
  });

  it('refuse un corps qui n’est pas du JSON', async () => {
    const res = await send('pas du json', '10.0.0.3');

    expect(res.status).toBe(400);
    expect(sendContactEmail).not.toHaveBeenCalled();
  });

  it('répond comme un succès au robot qui remplit le champ piège, sans envoyer d’e-mail', async () => {
    const res = await send({ ...valid, site_check: 'http://spam.example' }, '10.0.0.4');

    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ success: true });
    expect(sendContactEmail).not.toHaveBeenCalled();
  });

  it('refuse un corps trop volumineux', async () => {
    const res = await send({ ...valid, message: 'a'.repeat(30_000) }, '10.0.0.5');
    expect(res.status).toBe(413);

    const declared = await send(valid, '10.0.0.6', { 'content-length': '999999' });
    expect(declared.status).toBe(413);
    expect(sendContactEmail).not.toHaveBeenCalled();
  });

  it('refuse un corps envoyé en flux sans content-length qui dépasse la taille maximale', async () => {
    const chunk = new TextEncoder().encode('a'.repeat(10_000));
    const stream = new ReadableStream({
      start(controller) {
        for (let i = 0; i < 5; i += 1) controller.enqueue(chunk);
        controller.close();
      },
    });
    const res = await POST(
      new Request('http://localhost/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'cf-connecting-ip': '10.0.0.8' },
        body: stream,
        duplex: 'half',
      } as RequestInit)
    );

    expect(res.status).toBe(413);
    expect(sendContactEmail).not.toHaveBeenCalled();
  });

  it('refuse un envoi répété 10 fois en une minute depuis la même adresse', async () => {
    const statuses: number[] = [];
    for (let i = 0; i < 10; i += 1) {
      statuses.push((await send(valid, '10.0.0.7')).status);
    }

    expect(statuses.slice(0, 5)).toEqual([200, 200, 200, 200, 200]);
    expect(statuses.slice(5)).toEqual([429, 429, 429, 429, 429]);
    expect(sendContactEmail).toHaveBeenCalledTimes(5);

    const refused = await send(valid, '10.0.0.7');
    expect(Number(refused.headers.get('Retry-After'))).toBeGreaterThan(0);
  });

  it('applique un plafond global même avec des adresses différentes', async () => {
    let refused = 0;
    for (let i = 0; i < 40; i += 1) {
      const res = await send(valid, `10.1.0.${i}`);
      if (res.status === 429) refused += 1;
    }

    expect(sendContactEmail).toHaveBeenCalledTimes(30);
    expect(refused).toBe(10);
  });
});
