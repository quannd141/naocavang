import { describe, expect, it } from 'vitest';
import { type ConsentRecord, hasConsented, parseConsent } from './consent';

describe('parseConsent', () => {
  it('returns null for null / empty input', () => {
    expect(parseConsent(null)).toBeNull();
    expect(parseConsent('')).toBeNull();
  });

  it('returns null for malformed JSON', () => {
    expect(parseConsent('{not json')).toBeNull();
  });

  it('returns null when version mismatches (stale policy)', () => {
    const stale = JSON.stringify({ version: 0, acceptedAt: '2026-01-01' });
    expect(parseConsent(stale, 1)).toBeNull();
  });

  it('returns null when acceptedAt is missing', () => {
    expect(parseConsent(JSON.stringify({ version: 1 }), 1)).toBeNull();
  });

  it('parses a valid current-version record', () => {
    const rec: ConsentRecord = { version: 1, acceptedAt: '2026-06-01T00:00:00.000Z' };
    expect(parseConsent(JSON.stringify(rec), 1)).toEqual(rec);
  });
});

describe('hasConsented (SSR-safe)', () => {
  it('returns false when window is undefined (server)', () => {
    // In the node test environment there is no window — must not throw.
    expect(hasConsented()).toBe(false);
  });
});
