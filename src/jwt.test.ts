import { describe, expect, it } from 'vitest';
import { decodeJwtRoles } from './jwt';

function fakeJwt(payload: Record<string, unknown>): string {
  const base64url = (input: string) =>
    Buffer.from(input)
      .toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');
  return `${base64url(JSON.stringify({ alg: 'none' }))}.${base64url(JSON.stringify(payload))}.sig`;
}

describe('decodeJwtRoles', () => {
  it('extracts string roles from a valid token payload', () => {
    const token = fakeJwt({ roles: ['ROLE_USER', 'ROLE_ADMIN'] });
    expect(decodeJwtRoles(token)).toEqual(['ROLE_USER', 'ROLE_ADMIN']);
  });

  it('drops non-string entries from the roles array', () => {
    const token = fakeJwt({ roles: ['ROLE_USER', 42, null] });
    expect(decodeJwtRoles(token)).toEqual(['ROLE_USER']);
  });

  it('returns an empty array when roles is missing', () => {
    const token = fakeJwt({ sub: 'user@example.com' });
    expect(decodeJwtRoles(token)).toEqual([]);
  });

  it('returns an empty array for a malformed token', () => {
    expect(decodeJwtRoles('not-a-jwt')).toEqual([]);
    expect(decodeJwtRoles('')).toEqual([]);
  });
});
