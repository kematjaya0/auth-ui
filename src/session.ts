import { cookies } from 'next/headers';
import { cache } from 'react';
import { isTokenPair, isUserProfile } from './api-shapes';
import type { AuthConfig } from './config';
import { backendFetch, backendJson } from './http';
import type { UserProfile } from './types';

async function fetchProfile(config: AuthConfig, token: string) {
  const response = await backendFetch(config, '/api/me', {}, token);
  if (!response.ok) return null;
  const data = await backendJson(response);
  return isUserProfile(data) ? data : null;
}

async function accessTokenFromRefresh(
  config: AuthConfig,
  refreshToken: string
) {
  const response = await backendFetch(config, '/api/token/refresh', {
    method: 'POST',
    body: JSON.stringify({ refresh_token: refreshToken })
  });
  if (!response.ok) return null;
  const data = await backendJson(response);
  return isTokenPair(data) ? data.token : null;
}

/**
 * Server-only read of the signed-in user, deduped per request via React `cache`.
 * Server Components can't write cookies, so an expired access token is refreshed
 * for this request only; the next `authedBackend` call persists the new pair.
 */
export const getCurrentUser = cache(
  async (config: AuthConfig): Promise<UserProfile | null> => {
    const jar = await cookies();
    const accessToken = jar.get(config.accessCookieName)?.value;
    if (accessToken) {
      const profile = await fetchProfile(config, accessToken);
      if (profile) return profile;
    }
    const refreshToken = jar.get(config.refreshCookieName)?.value;
    if (!refreshToken) return null;
    const freshToken = await accessTokenFromRefresh(config, refreshToken);
    return freshToken ? fetchProfile(config, freshToken) : null;
  }
);
