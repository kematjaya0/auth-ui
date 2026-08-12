import Link from 'next/link';
import { RegisterForm } from './RegisterForm';

export function RegisterPage() {
  return (
    <div className="auth-hero">
      <div className="auth-wrapper">
        <div className="text-center mb-4">
          <p className="auth-eyebrow mb-3">Get started</p>
          <h1 className="auth-wordmark mb-2">AuthKit</h1>
          <p
            className="text-muted"
            style={{ color: 'var(--color-moon-mist)', fontSize: 16 }}
          >
            Create your free account
          </p>
        </div>

        <div className="glass-card">
          <RegisterForm />
        </div>

        <p className="text-center mt-4" style={{ fontSize: 14 }}>
          <Link
            href="/login"
            className="text-muted"
            style={{ color: 'var(--color-moon-mist)' }}
          >
            Already registered?{' '}
            <span style={{ color: 'var(--color-frost-glow)' }}>Sign in</span>
          </Link>
        </p>
      </div>
    </div>
  );
}
