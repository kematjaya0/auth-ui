# @kematjaya/auth-ui

Login, register, profile, and change-password UI plus the server-side plumbing
(Route Handler factories, session resolution, edge proxy route guard) for
Next.js App Router projects backed by [`kematjaya/auth-bundle`](https://github.com/kematjaya0/auth-bundle).

No backend logic lives here — this package only talks to your backend's
`/api/login`, `/api/register`, `/api/token/refresh`, `/api/logout`, `/api/me`,
`/api/change-password` endpoints (the exact surface `kematjaya/auth-bundle`
exposes) through your own Next.js app acting as a backend-for-frontend, so
JWTs stay in HttpOnly cookies and never reach client JS.

## Installation

```bash
npm install @kematjaya/auth-ui
npm install react-hook-form @hookform/resolvers zod @kematjaya/bootstrap-ui-kit
```

### 1. Config — the one manual file

```ts
// src/config/auth.ts
import { defineAuthConfig } from '@kematjaya/auth-ui/config';

export const authConfig = defineAuthConfig({
  backendBaseUrl: process.env.API_INTERNAL_URL ?? 'http://127.0.0.1:8000',
  appOrigin: process.env.APP_ORIGIN ?? 'http://127.0.0.1:3000'
});
```

`accessCookieName`/`refreshCookieName`/`accessTtlSeconds`/`refreshTtlSeconds`
are all optional — defaults use `__Host-`-prefixed cookies in production, 15
minute access tokens, and 30 day refresh tokens.

### 2. Route Handlers

```ts
// src/app/api/auth/login/route.ts
import { createLoginRoute } from '@kematjaya/auth-ui/routes';
import { authConfig } from '@/config/auth';
export const POST = createLoginRoute(authConfig);
export const dynamic = 'force-dynamic';
export const revalidate = 0;
```

Repeat for the other five: `createRegisterRoute`, `createLogoutRoute`,
`createRefreshRoute`, `createMeRoute`, `createChangePasswordRoute` under
`src/app/api/auth/{register,logout,refresh,me,change-password}/route.ts`.

### 3. Pages

```ts
// src/app/login/page.tsx
export { LoginPage as default } from '@kematjaya/auth-ui/pages';
```

Same pattern for `src/app/register/page.tsx` (`RegisterPage`) and a profile
page of your choice (`ProfilePage`). Want custom layout instead? Import
`LoginForm`/`RegisterForm`/`ProfileView` directly from `@kematjaya/auth-ui`
and build your own page around them.

### 4. Session (Server Components)

```ts
// src/app/dashboard/layout.tsx
import { redirect } from 'next/navigation';
import { getCurrentUser } from '@kematjaya/auth-ui/session';
import { authConfig } from '@/config/auth';

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser(authConfig);
  if (!user) redirect('/login');
  return <>{children}</>;
}
```

### 5. Proxy (edge route guard)

```ts
// src/proxy.ts
import { createAuthProxy } from '@kematjaya/auth-ui/proxy';
import { authConfig } from '@/config/auth';
import { accessRules } from '@/config/access-control';

export const proxy = createAuthProxy(authConfig, { accessRules });
export const config = { matcher: ['/dashboard/:path*'] };
```

`accessRules` (path pattern → required roles) stays app-owned since it's
specific to your own routes — see the `AccessRule` type exported from
`@kematjaya/auth-ui/proxy`.

## Components

All named exports from `@kematjaya/auth-ui`, all `'use client'`, all take
`className?`; `LoginForm`/`RegisterForm` additionally take `onSuccess?`,
`successRedirect?`, and `extraFields?: ReactNode` for composition without
forking:

- `LoginForm`, `RegisterForm` — email/password forms, POST to
  `/api/auth/{login,register}`.
- `ProfileView` — account info + embeds `ChangePasswordForm`.
- `ChangePasswordForm` — standalone if you want it outside `ProfileView`.
- `LoginToast` — reads `?toast=` and renders a `@kematjaya/bootstrap-ui-kit`
  `Toast`; used by the default `LoginPage`.

## Types

`TokenPair`, `UserProfile`, `Problem` are exported from the package root —
this is the fixed contract matching `kematjaya/auth-bundle`'s API, not
derived from your app's own OpenAPI generation.

## Development

```bash
npm install
npm run build       # tsup -> dist/ (esm, cjs, d.ts per entry point)
npm run typecheck
npm run lint
npm run test         # vitest, config/jwt/type-guard unit tests
```
