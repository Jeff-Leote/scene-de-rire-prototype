import { describe, it, expect } from 'vitest';
import { GET } from '@/app/api/health/route';

describe('GET /api/health', () => {
  it('répond 200 avec un corps minimal et sans cache', async () => {
    const res = GET();
    const body = await res.text();

    expect(res.status).toBe(200);
    expect(JSON.parse(body)).toEqual({ status: 'ok' });
    expect(body.length).toBeLessThan(100);
    expect(res.headers.get('Cache-Control')).toBe('no-store');
  });
});
