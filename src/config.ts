export type AuthConfig = {
  backendBaseUrl: string;
  appOrigin: string;
  accessCookieName: string;
  refreshCookieName: string;
  accessTtlSeconds: number;
  refreshTtlSeconds: number;
};

export type DefineAuthConfigInput = {
  backendBaseUrl: string;
  appOrigin: string;
  accessCookieName?: string;
  refreshCookieName?: string;
  accessTtlSeconds?: number;
  refreshTtlSeconds?: number;
};

const DAYS_30_IN_SECONDS = 60 * 60 * 24 * 30;

export function defineAuthConfig(input: DefineAuthConfigInput): AuthConfig {
  const isProduction = process.env.NODE_ENV === 'production';
  return {
    backendBaseUrl: input.backendBaseUrl,
    appOrigin: input.appOrigin,
    accessCookieName:
      input.accessCookieName ??
      (isProduction ? '__Host-access_token' : 'access_token'),
    refreshCookieName:
      input.refreshCookieName ??
      (isProduction ? '__Host-refresh_token' : 'refresh_token'),
    accessTtlSeconds: input.accessTtlSeconds ?? 900,
    refreshTtlSeconds: input.refreshTtlSeconds ?? DAYS_30_IN_SECONDS
  };
}
