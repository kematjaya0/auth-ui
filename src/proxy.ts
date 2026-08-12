import { NextResponse, type NextRequest } from 'next/server';
import type { AuthConfig } from './config';
import { decodeJwtRoles } from './jwt';

export type AccessRule = {
  pattern: RegExp;
  roles: string[];
};

export type AuthProxyOptions = {
  /** Checked in order — the first matching rule (by path) wins. */
  accessRules?: AccessRule[];
  loginPath?: string;
  accessDeniedPath?: string;
};

export function createAuthProxy(
  config: AuthConfig,
  options: AuthProxyOptions = {}
) {
  const accessRules = options.accessRules ?? [];
  const loginPath = options.loginPath ?? '/login';
  const accessDeniedPath = options.accessDeniedPath ?? '/access-denied';

  return function proxy(request: NextRequest) {
    const accessToken = request.cookies.get(config.accessCookieName)?.value;
    const hasRefresh = request.cookies.has(config.refreshCookieName);
    if (!accessToken && !hasRefresh)
      return NextResponse.redirect(new URL(loginPath, request.url));

    const rule = accessRules.find((r) =>
      r.pattern.test(request.nextUrl.pathname)
    );
    if (rule && accessToken) {
      // If the access token is missing but a refresh token exists, don't check
      // roles here — let getCurrentUser() on the destination page refresh first
      // and be the final decision-maker.
      const roles = decodeJwtRoles(accessToken);
      const allowed = rule.roles.some((role) => roles.includes(role));
      if (!allowed)
        return NextResponse.redirect(new URL(accessDeniedPath, request.url));
    }

    return NextResponse.next();
  };
}
