export function decodeJwtRoles(token: string): string[] {
  try {
    const payload = token.split('.')[1];
    if (!payload) return [];
    const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
    const padded = base64.padEnd(
      base64.length + ((4 - (base64.length % 4)) % 4),
      '='
    );
    const json = atob(padded);
    const parsed = JSON.parse(json) as { roles?: unknown };
    return Array.isArray(parsed.roles)
      ? parsed.roles.filter((role): role is string => typeof role === 'string')
      : [];
  } catch {
    return [];
  }
}
