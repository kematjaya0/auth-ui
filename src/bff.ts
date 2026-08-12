import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { isTokenPair } from './api-shapes';
import type { AuthConfig } from './config';
import {
  backendFetch,
  backendJson,
  cookieOptions,
  noStoreHeaders,
  safeJsonResponse
} from './http';
import type { TokenPair } from './types';

export async function setTokenCookies(config: AuthConfig, tokens: TokenPair) {
  const jar = await cookies();
  jar.set(
    config.accessCookieName,
    tokens.token,
    cookieOptions(config.accessTtlSeconds)
  );
  jar.set(
    config.refreshCookieName,
    tokens.refresh_token,
    cookieOptions(config.refreshTtlSeconds)
  );
}

export async function clearTokenCookies(
  config: AuthConfig,
  response?: NextResponse
) {
  const jar = response?.cookies ?? (await cookies());
  jar.set(config.accessCookieName, '', cookieOptions(0));
  jar.set(config.refreshCookieName, '', cookieOptions(0));
}

export async function refreshTokens(config: AuthConfig) {
  const jar = await cookies();
  const refreshToken = jar.get(config.refreshCookieName)?.value;
  if (!refreshToken) return false;
  const response = await backendFetch(config, '/api/token/refresh', {
    method: 'POST',
    body: JSON.stringify({ refresh_token: refreshToken })
  });
  if (!response.ok) return false;
  const data = await backendJson(response);
  if (!isTokenPair(data)) return false;
  await setTokenCookies(config, data);
  return true;
}

export async function authedBackend(
  config: AuthConfig,
  path: string,
  init: RequestInit = {}
) {
  const jar = await cookies();
  const token = jar.get(config.accessCookieName)?.value;
  let response = await backendFetch(config, path, init, token);
  if (response.status === 401 && (await refreshTokens(config))) {
    const freshToken = (await cookies()).get(config.accessCookieName)?.value;
    response = await backendFetch(config, path, init, freshToken);
  }
  if (response.status === 401) {
    return safeJsonResponse(await backendJson(response), 401);
  }
  return safeJsonResponse(await backendJson(response), response.status);
}

export function tokenlessAuthResponse() {
  return NextResponse.json(
    { ok: true },
    { status: 200, headers: noStoreHeaders() }
  );
}

export { isTokenPair };
