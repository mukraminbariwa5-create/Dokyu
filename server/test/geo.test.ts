import { describe, expect, it } from 'vitest';
import { distanceKm, isValidCoordinate, sortByDistance } from '../src/lib/geo.js';
import { redactUrl } from '../src/lib/redact.js';

const JOLO = { lat: 6.0535, lng: 121.0011 };
const ZAMBOANGA = { lat: 6.9214, lng: 122.079 };

describe('geo', () => {
  it('measures Jolo to Zamboanga City at about 150 km', () => {
    const d = distanceKm(JOLO, ZAMBOANGA);
    expect(d).toBeGreaterThan(140);
    expect(d).toBeLessThan(160);
  });

  it('rejects impossible coordinates', () => {
    expect(isValidCoordinate(91, 0)).toBe(false);
    expect(isValidCoordinate(Number.NaN, 0)).toBe(false);
    expect(isValidCoordinate(6.05, 121)).toBe(true);
  });

  it('sorts nearest first and puts unpinned offices last', () => {
    const sorted = sortByDistance(
      [
        { id: 'zam', ...ZAMBOANGA },
        { id: 'none', lat: null, lng: null },
        { id: 'jolo', lat: 6.054, lng: 121.002 },
      ],
      JOLO,
    );
    expect(sorted.map((s) => s.id)).toEqual(['jolo', 'zam', 'none']);
  });
});

describe('log redaction', () => {
  it('never logs coordinates or tokens', () => {
    expect(redactUrl('/api/v1/offices?agency=psa&lat=6.05&lng=121.0')).toBe(
      '/api/v1/offices?agency=psa&lat=[redacted]&lng=[redacted]',
    );
    expect(redactUrl('/release?qr=abc123')).toBe('/release?qr=[redacted]');
  });
});
