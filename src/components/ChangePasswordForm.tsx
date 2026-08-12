'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { useState } from 'react';
import {
  changePasswordSchema,
  type ChangePasswordFormValues
} from '../schemas';

export type ChangePasswordFormProps = {
  onSuccess?: () => void;
  className?: string;
};

export function ChangePasswordForm({
  onSuccess,
  className
}: ChangePasswordFormProps) {
  const router = useRouter();
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const currentPasswordErrorId = 'change-password-current-error';
  const newPasswordErrorId = 'change-password-new-error';
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting }
  } = useForm<ChangePasswordFormValues>({
    resolver: zodResolver(changePasswordSchema)
  });

  async function submitChangePassword(values: ChangePasswordFormValues) {
    setPasswordError('');
    setPasswordSuccess('');
    let response: Response;
    try {
      response = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(values)
      });
    } catch {
      setPasswordError('Network error. Check your connection and try again.');
      return;
    }
    if (response.status === 401) {
      router.push('/login');
      return;
    }
    if (!response.ok) {
      try {
        const body = await response.json();
        setPasswordError(
          body.detail && typeof body.detail === 'string'
            ? body.detail
            : 'Could not change password.'
        );
      } catch {
        setPasswordError('Could not change password.');
      }
      return;
    }
    reset();
    setPasswordSuccess('Password changed successfully.');
    onSuccess?.();
  }

  return (
    <form
      className={className}
      onSubmit={handleSubmit(submitChangePassword)}
      noValidate
    >
      <div className="mb-3">
        <label htmlFor="current-password" className="form-label">
          Current password
        </label>
        <input
          id="current-password"
          type="password"
          className={`form-control${errors.currentPassword ? ' is-invalid' : ''}`}
          autoComplete="current-password"
          aria-invalid={Boolean(errors.currentPassword)}
          aria-describedby={
            errors.currentPassword ? currentPasswordErrorId : undefined
          }
          {...register('currentPassword')}
        />
        {errors.currentPassword && (
          <div className="invalid-feedback" id={currentPasswordErrorId}>
            {errors.currentPassword.message}
          </div>
        )}
      </div>
      <div className="mb-3">
        <label htmlFor="new-password" className="form-label">
          New password
        </label>
        <input
          id="new-password"
          type="password"
          className={`form-control${errors.newPassword ? ' is-invalid' : ''}`}
          autoComplete="new-password"
          aria-invalid={Boolean(errors.newPassword)}
          aria-describedby={errors.newPassword ? newPasswordErrorId : undefined}
          {...register('newPassword')}
        />
        {errors.newPassword && (
          <div className="invalid-feedback" id={newPasswordErrorId}>
            {errors.newPassword.message}
          </div>
        )}
      </div>
      {passwordError && (
        <div className="alert-auth" role="alert">
          {passwordError}
        </div>
      )}
      {passwordSuccess && (
        <div className="alert-auth" role="status">
          {passwordSuccess}
        </div>
      )}
      <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
        {isSubmitting ? 'Please wait...' : 'Change Password'}
      </button>
    </form>
  );
}
