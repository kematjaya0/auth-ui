import Link from 'next/link';
import { Suspense } from 'react';
import { LoginForm } from './LoginForm';
import { LoginToast } from './LoginToast';

export function LoginPage() {
  return (
    <div className="auth-hero">
      <Suspense>
        <LoginToast />
      </Suspense>
      <div className="auth-wrapper">
        <div className="text-center mb-4">
          <p className="auth-eyebrow mb-3">Welcome back</p>
          <h1 className="auth-wordmark mb-2">AuthKit</h1>
          <p
            className="text-muted"
            style={{ color: 'var(--color-moon-mist)', fontSize: 16 }}
          >
            Sign in to your account
          </p>
        </div>

        <div className="glass-card">
          <LoginForm />
        </div>

        <p className="text-center mt-4" style={{ fontSize: 14 }}>
          <Link
            href="/register"
            className="text-muted"
            style={{ color: 'var(--color-moon-mist)' }}
          >
            Need an account?{' '}
            <span style={{ color: 'var(--color-frost-glow)' }}>Register</span>
          </Link>
        </p>
      </div>
    </div>
  );
}
