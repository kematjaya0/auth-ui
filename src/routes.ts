import { cookies } from 'next/headers';
import { NextResponse, type NextRequest } from 'next/server';
import { isTokenPair } from './api-shapes';
import {
  authedBackend,
  clearTokenCookies,
  refreshTokens,
  setTokenCookies,
  tokenlessAuthResponse
} from './bff';
import type { AuthConfig } from './config';
import {
  backendFetch,
  backendJson,
  noStoreHeaders,
  parseJson,
  safeJsonResponse,
  validateOrigin
} from './http';
import { authSchema, changePasswordSchema } from './schemas';

export function createLoginRoute(config: AuthConfig) {
  return async function POST(request: NextRequest) {
    const badOrigin = validateOrigin(config, request);
    if (badOrigin) return badOrigin;
    const parsed = await parseJson(request, authSchema);
    if ('error' in parsed) return parsed.error;
    const response = await backendFetch(config, '/api/login', {
      method: 'POST',
      body: JSON.stringify(parsed.data)
    });
    const data = await backendJson(response);
    if (!response.ok || !isTokenPair(data))
      return safeJsonResponse(data, response.status);
    await setTokenCookies(config, data);
    return tokenlessAuthResponse();
  };
}

export function createRegisterRoute(config: AuthConfig) {
  return async function POST(request: NextRequest) {
    const badOrigin = validateOrigin(config, request);
    if (badOrigin) return badOrigin;
    const parsed = await parseJson(request, authSchema);
    if ('error' in parsed) return parsed.error;
    const response = await backendFetch(config, '/api/register', {
      method: 'POST',
      body: JSON.stringify(parsed.data)
    });
    return safeJsonResponse(await backendJson(response), response.status);
  };
}

export function createLogoutRoute(config: AuthConfig) {
  return async function POST(request: NextRequest) {
    const badOrigin = validateOrigin(config, request);
    if (badOrigin) return badOrigin;
    const jar = await cookies();
    const accessToken = jar.get(config.accessCookieName)?.value;
    const refreshToken = jar.get(config.refreshCookieName)?.value;
    if (accessToken && refreshToken) {
      await backendFetch(
        config,
        '/api/logout',
        { method: 'POST', body: JSON.stringify({ refreshToken }) },
        accessToken
      );
    }
    const response = new NextResponse(null, {
      status: 204,
      headers: noStoreHeaders()
    });
    await clearTokenCookies(config, response);
    return response;
  };
}

export function createRefreshRoute(config: AuthConfig) {
  return async function POST(request: NextRequest) {
    const badOrigin = validateOrigin(config, request);
    if (badOrigin) return badOrigin;
    if (await refreshTokens(config)) return tokenlessAuthResponse();
    const response = NextResponse.json(
      { title: 'Unauthorized' },
      { status: 401, headers: noStoreHeaders() }
    );
    await clearTokenCookies(config, response);
    return response;
  };
}

export function createMeRoute(config: AuthConfig) {
  return async function GET() {
    return authedBackend(config, '/api/me');
  };
}

export function createChangePasswordRoute(config: AuthConfig) {
  return async function POST(request: NextRequest) {
    const badOrigin = validateOrigin(config, request);
    if (badOrigin) return badOrigin;
    const parsed = await parseJson(request, changePasswordSchema);
    if ('error' in parsed) return parsed.error;
    return authedBackend(config, '/api/change-password', {
      method: 'POST',
      body: JSON.stringify(parsed.data)
    });
  };
}
