import { describe, it, expect } from 'vitest';
import nextConfig from '../next.config';

describe('configuration des images', () => {
  const images = nextConfig.images ?? {};

  it("n'autorise aucun hôte distant ni joker sur un domaine", () => {
    const patterns = images.remotePatterns ?? [];

    expect(patterns).toEqual([]);
    expect(JSON.stringify(patterns)).not.toContain('*');
  });

  it('limite les variantes générées par l’optimiseur', () => {
    expect(Math.max(...(images.deviceSizes ?? [0]))).toBeLessThanOrEqual(1920);
    expect(images.qualities).toEqual([75]);
  });
});
