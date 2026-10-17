type RateLimitResult = { allowed: boolean; retryAfterSeconds: number };

// Compteur en mémoire à fenêtre glissante. Suffisant pour une seule instance Render : il repart de
// zéro à chaque redémarrage et ne se partage pas entre plusieurs instances.
export function createRateLimiter({
  limit,
  windowMs,
  maxKeys = 5000,
}: {
  limit: number;
  windowMs: number;
  maxKeys?: number;
}) {
  const hits = new Map<string, number[]>();

  function prune(now: number) {
    for (const [key, times] of hits) {
      if ((times.at(-1) ?? 0) <= now - windowMs) {
        hits.delete(key);
      }
    }
  }

  return {
    check(key: string, now: number = Date.now()): RateLimitResult {
      const recent = (hits.get(key) ?? []).filter((time) => time > now - windowMs);

      if (recent.length >= limit) {
        hits.set(key, recent);
        return { allowed: false, retryAfterSeconds: Math.max(1, Math.ceil((recent[0] + windowMs - now) / 1000)) };
      }

      recent.push(now);
      hits.set(key, recent);
      if (hits.size > maxKeys) {
        prune(now);
      }
      // Borne dure : une attaque qui multiplie les clés ne doit pas faire grossir la mémoire sans limite.
      while (hits.size > maxKeys) {
        const oldest = hits.keys().next().value;
        if (oldest === undefined) break;
        hits.delete(oldest);
      }
      return { allowed: true, retryAfterSeconds: 0 };
    },
  };
}
