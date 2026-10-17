import { describe, it, expect } from 'vitest';
import { createRateLimiter } from '@/lib/rateLimit';

describe('createRateLimiter', () => {
  it('refuse au-delà de la limite dans la fenêtre, puis réautorise quand elle est passée', () => {
    const limiter = createRateLimiter({ limit: 3, windowMs: 60_000 });
    const start = 1_000_000;

    expect(limiter.check('ip', start).allowed).toBe(true);
    expect(limiter.check('ip', start + 1_000).allowed).toBe(true);
    expect(limiter.check('ip', start + 2_000).allowed).toBe(true);

    const refused = limiter.check('ip', start + 3_000);
    expect(refused.allowed).toBe(false);
    expect(refused.retryAfterSeconds).toBe(57);

    expect(limiter.check('ip', start + 60_001).allowed).toBe(true);
  });

  it('borne le nombre de clés gardées en mémoire', () => {
    const limiter = createRateLimiter({ limit: 1, windowMs: 60_000, maxKeys: 2 });

    expect(limiter.check('a', 0).allowed).toBe(true);
    expect(limiter.check('a', 1).allowed).toBe(false);
    limiter.check('b', 2);
    limiter.check('c', 3);

    // La clé la plus ancienne a été oubliée pour rester sous la borne.
    expect(limiter.check('a', 4).allowed).toBe(true);
  });

  it('compte chaque clé séparément', () => {
    const limiter = createRateLimiter({ limit: 1, windowMs: 60_000 });

    expect(limiter.check('a', 0).allowed).toBe(true);
    expect(limiter.check('a', 1).allowed).toBe(false);
    expect(limiter.check('b', 1).allowed).toBe(true);
  });
});
