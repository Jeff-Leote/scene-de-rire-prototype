import { describe, it, expect } from 'vitest';
import { formatSpectacleDate, formatSpectacleTime } from '@/lib/format';

describe('formatSpectacleDate', () => {
  it('formate une date en français long', () => {
    expect(formatSpectacleDate('2026-09-01')).toBe('mardi 1 septembre 2026');
  });
});

describe('formatSpectacleTime', () => {
  it('formate une heure en HH:mm', () => {
    expect(formatSpectacleTime('1970-01-01T20:00:00.000Z')).toBe('20:00');
  });
});
