'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import type { ReactNode } from 'react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { authSchema, type AuthFormValues } from '../schemas';

export type AuthFormProps = {
  onSuccess?: () => void;
  successRedirect?: string;
  extraFields?: ReactNode;
  className?: string;
};

type BaseProps = AuthFormProps & {
  mode: 'login' | 'register';
};

const defaultRedirect: Record<BaseProps['mode'], string> = {
  login: '/dashboard',
  register: '/login'
};

export function AuthFormBase({
  mode,
  onSuccess,
  successRedirect,
  extraFields,
  className
}: BaseProps) {
  const router = useRouter();
  const [serverError, setServerError] = useState('');
  const emailErrorId = `${mode}-email-error`;
  const passwordErrorId = `${mode}-password-error`;
  const serverErrorId = `${mode}-server-error`;
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm<AuthFormValues>({ resolver: zodResolver(authSchema) });

  async function submit(values: AuthFormValues) {
    setServerError('');
    let response: Response;
    try {
      response = await fetch(`/api/auth/${mode}`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(values)
      });
    } catch {
      setServerError('Network error. Check your connection and try again.');
      return;
    }
    if (!response.ok) {
      const defaultMessage =
        mode === 'login' ? 'Login failed.' : 'Registration failed.';
      try {
        const body = await response.json();
        setServerError(
          body.detail && typeof body.detail === 'string'
            ? body.detail
            : defaultMessage
        );
      } catch {
        setServerError(defaultMessage);
      }
      return;
    }
    if (onSuccess) {
      onSuccess();
      return;
    }
    router.push(successRedirect ?? defaultRedirect[mode]);
  }

  return (
    <form
      className={className ?? 'auth-form'}
      onSubmit={handleSubmit(submit)}
      noValidate
    >
      <div className="mb-3">
        <label htmlFor={`${mode}-email`} className="form-label">
          Email
        </label>
        <input
          id={`${mode}-email`}
          type="email"
          className={`form-control${errors.email ? ' is-invalid' : ''}`}
          autoComplete="email"
          placeholder="Enter your email"
          aria-invalid={Boolean(errors.email)}
          aria-describedby={errors.email ? emailErrorId : undefined}
          {...register('email')}
        />
        {errors.email && (
          <div className="invalid-feedback" id={emailErrorId}>
            {errors.email.message}
          </div>
        )}
      </div>

      <div className="mb-3">
        <label htmlFor={`${mode}-password`} className="form-label">
          Password
        </label>
        <input
          id={`${mode}-password`}
          type="password"
          className={`form-control${errors.password ? ' is-invalid' : ''}`}
          autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
          placeholder={
            mode === 'login' ? 'Enter your password' : 'Create a password'
          }
          aria-invalid={Boolean(errors.password)}
          aria-describedby={errors.password ? passwordErrorId : undefined}
          {...register('password')}
        />
        {errors.password && (
          <div className="invalid-feedback" id={passwordErrorId}>
            {errors.password.message}
          </div>
        )}
      </div>

      {extraFields}

      {serverError && (
        <div className="alert-auth" id={serverErrorId} role="alert">
          {serverError}
        </div>
      )}

      <button
        type="submit"
        className="btn btn-primary w-100 mt-2"
        disabled={isSubmitting}
      >
        {isSubmitting
          ? 'Please wait...'
          : mode === 'login'
            ? 'Continue'
            : 'Create Account'}
      </button>
    </form>
  );
}
