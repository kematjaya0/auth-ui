import { NextResponse, type NextRequest } from 'next/server';
import type { AuthConfig } from './config';
import type { Problem } from './types';

export function cookieOptions(maxAge?: number) {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    path: '/',
    ...(maxAge === undefined ? {} : { maxAge })
  };
}

export function validateOrigin(
  config: AuthConfig,
  request: Request
): NextResponse | null {
  const origin = request.headers.get('origin');
  if (origin !== config.appOrigin)
    return jsonProblem(403, { title: 'Forbidden', detail: 'Invalid origin.' });
  return null;
}

export async function parseJson<T>(
  request: NextRequest,
  schema: {
    safeParse: (
      value: unknown
    ) => { success: true; data: T } | { success: false };
  }
) {
  let data: unknown;
  try {
    data = await request.json();
  } catch {
    return {
      error: jsonProblem(400, { title: 'Bad Request', detail: 'Invalid JSON.' })
    };
  }
  const parsed = schema.safeParse(data);
  if (!parsed.success)
    return {
      error: jsonProblem(422, {
        title: 'Validation Failed',
        detail: 'Invalid input.'
      })
    };
  return { data: parsed.data };
}

export function jsonProblem(status: number, problem: Problem) {
  return NextResponse.json(problem, { status, headers: noStoreHeaders() });
}

export function noStoreHeaders() {
  return { 'Cache-Control': 'no-store' };
}

export function safeJsonResponse(data: unknown, status: number) {
  if (status === 204)
    return new NextResponse(null, { status, headers: noStoreHeaders() });
  return NextResponse.json(data, { status, headers: noStoreHeaders() });
}

export async function backendFetch(
  config: AuthConfig,
  path: string,
  init: RequestInit,
  token?: string
) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10_000);
  try {
    return await fetch(`${config.backendBaseUrl}${path}`, {
      ...init,
      cache: 'no-store',
      signal: controller.signal,
      headers: {
        accept: 'application/ld+json, application/json',
        ...(init.body
          ? {
              'content-type':
                init.method === 'PATCH'
                  ? 'application/merge-patch+json'
                  : 'application/json'
            }
          : {}),
        ...(token ? { authorization: `Bearer ${token}` } : {})
      }
    });
  } finally {
    clearTimeout(timeout);
  }
}

function sanitizeUpstreamError(
  data: Record<string, unknown>
): Record<string, unknown> {
  const keep = new Set(['type', 'title', 'status', 'detail', 'violations']);
  const cleaned: Record<string, unknown> = {};
  for (const key of Object.keys(data)) {
    if (keep.has(key)) {
      if (key === 'violations' && Array.isArray(data[key])) {
        cleaned[key] = data[key].map((v: unknown) => {
          if (v && typeof v === 'object' && !Array.isArray(v)) {
            const {
              parameters: _parameters,
              template: _template,
              ...rest
            } = v as Record<string, unknown>;
            return rest;
          }
          return v;
        });
      } else {
        cleaned[key] = data[key];
      }
    }
  }
  return cleaned;
}

export async function backendJson(response: Response) {
  if (response.status === 204) return null;
  const text = await response.text();
  if (!text) return null;
  try {
    const parsed = JSON.parse(text) as unknown;
    if (
      response.status >= 400 &&
      parsed &&
      typeof parsed === 'object' &&
      !Array.isArray(parsed)
    ) {
      return sanitizeUpstreamError(parsed as Record<string, unknown>);
    }
    return parsed;
  } catch {
    return { title: response.statusText || 'Upstream error' };
  }
}
