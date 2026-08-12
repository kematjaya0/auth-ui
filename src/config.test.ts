import { afterEach, describe, expect, it, vi } from 'vitest';
import { defineAuthConfig } from './config';

describe('defineAuthConfig', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('fills in defaults for a dev environment', () => {
    vi.stubEnv('NODE_ENV', 'development');
    const config = defineAuthConfig({
      backendBaseUrl: 'http://127.0.0.1:8000',
      appOrigin: 'http://127.0.0.1:3000'
    });
    expect(config).toEqual({
      backendBaseUrl: 'http://127.0.0.1:8000',
      appOrigin: 'http://127.0.0.1:3000',
      accessCookieName: 'access_token',
      refreshCookieName: 'refresh_token',
      accessTtlSeconds: 900,
      refreshTtlSeconds: 60 * 60 * 24 * 30
    });
  });

  it('uses __Host- prefixed cookie names in production', () => {
    vi.stubEnv('NODE_ENV', 'production');
    const config = defineAuthConfig({
      backendBaseUrl: 'https://api.example.com',
      appOrigin: 'https://example.com'
    });
    expect(config.accessCookieName).toBe('__Host-access_token');
    expect(config.refreshCookieName).toBe('__Host-refresh_token');
  });

  it('lets explicit overrides win over defaults', () => {
    const config = defineAuthConfig({
      backendBaseUrl: 'http://127.0.0.1:8000',
      appOrigin: 'http://127.0.0.1:3000',
      accessCookieName: 'custom_access',
      refreshCookieName: 'custom_refresh',
      accessTtlSeconds: 60,
      refreshTtlSeconds: 120
    });
    expect(config.accessCookieName).toBe('custom_access');
    expect(config.refreshCookieName).toBe('custom_refresh');
    expect(config.accessTtlSeconds).toBe(60);
    expect(config.refreshTtlSeconds).toBe(120);
  });
});
