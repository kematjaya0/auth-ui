import { describe, expect, it } from 'vitest';
import { isTokenPair, isUserProfile } from './api-shapes';

describe('isTokenPair', () => {
  it('accepts a well-formed token pair', () => {
    expect(isTokenPair({ token: 'a', refresh_token: 'b' })).toBe(true);
  });

  it('rejects missing fields or wrong types', () => {
    expect(isTokenPair({ token: 'a' })).toBe(false);
    expect(isTokenPair({ token: 1, refresh_token: 'b' })).toBe(false);
    expect(isTokenPair(null)).toBe(false);
    expect(isTokenPair('nope')).toBe(false);
  });
});

describe('isUserProfile', () => {
  const valid = {
    id: '1',
    email: 'a@b.com',
    roles: ['ROLE_USER'],
    createdAt: '2026-01-01T00:00:00Z'
  };

  it('accepts a well-formed profile', () => {
    expect(isUserProfile(valid)).toBe(true);
  });

  it('rejects a profile with non-string roles entries', () => {
    expect(isUserProfile({ ...valid, roles: ['ROLE_USER', 1] })).toBe(false);
  });

  it('rejects missing fields', () => {
    const { createdAt, ...rest } = valid;
    void createdAt;
    expect(isUserProfile(rest)).toBe(false);
  });
});
