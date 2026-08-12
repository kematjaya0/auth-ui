import type { TokenPair, UserProfile } from './types';

export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

export function isTokenPair(value: unknown): value is TokenPair {
  return (
    isRecord(value) &&
    typeof value.token === 'string' &&
    typeof value.refresh_token === 'string'
  );
}

export function isUserProfile(value: unknown): value is UserProfile {
  return (
    isRecord(value) &&
    typeof value.id === 'string' &&
    typeof value.email === 'string' &&
    Array.isArray(value.roles) &&
    value.roles.every((role): role is string => typeof role === 'string') &&
    typeof value.createdAt === 'string'
  );
}
