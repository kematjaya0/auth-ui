import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { LoginForm } from './LoginForm';

const push = vi.fn();
const router = { push };

vi.mock('next/navigation', () => ({ useRouter: () => router }));

describe('LoginForm', () => {
  beforeEach(() => {
    push.mockClear();
    vi.unstubAllGlobals();
  });

  it('associates inline errors with fields', async () => {
    render(<LoginForm />);
    await userEvent.click(screen.getByRole('button', { name: 'Continue' }));
    const email = screen.getByLabelText('Email');
    const password = screen.getByLabelText('Password');
    expect(await screen.findByText('Enter a valid email')).toHaveAttribute(
      'id',
      'login-email-error'
    );
    expect(password).toHaveAccessibleDescription('Use at least 6 characters');
    expect(email).toHaveAttribute('aria-describedby', 'login-email-error');
    expect(password).toHaveAttribute(
      'aria-describedby',
      'login-password-error'
    );
  });

  it('announces auth network failures', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('down')));
    render(<LoginForm />);
    await userEvent.type(screen.getByLabelText('Email'), 'a@example.com');
    await userEvent.type(
      screen.getByLabelText('Password'),
      'CorrectHorseBatteryStaple!1'
    );
    await userEvent.click(screen.getByRole('button', { name: 'Continue' }));
    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Network error. Check your connection and try again.'
    );
    expect(push).not.toHaveBeenCalled();
  });

  it('calls onSuccess instead of redirecting when provided', async () => {
    const onSuccess = vi.fn();
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(new Response(null, { status: 200 }))
    );
    render(<LoginForm onSuccess={onSuccess} />);
    await userEvent.type(screen.getByLabelText('Email'), 'a@example.com');
    await userEvent.type(
      screen.getByLabelText('Password'),
      'CorrectHorseBatteryStaple!1'
    );
    await userEvent.click(screen.getByRole('button', { name: 'Continue' }));
    await vi.waitFor(() => expect(onSuccess).toHaveBeenCalledTimes(1));
    expect(push).not.toHaveBeenCalled();
  });
});
