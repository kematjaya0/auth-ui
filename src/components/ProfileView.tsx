'use client';

import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import { isUserProfile } from '../api-shapes';
import type { UserProfile } from '../types';
import { ChangePasswordForm } from './ChangePasswordForm';

export type ProfileViewProps = {
  className?: string;
};

export function ProfileView({ className }: ProfileViewProps) {
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [profileError, setProfileError] = useState('');

  const loadProfile = useCallback(async () => {
    setProfileError('');
    let response: Response;
    try {
      response = await fetch('/api/auth/me', { cache: 'no-store' });
    } catch {
      setProfileError('Network error while loading profile.');
      return;
    }
    if (response.status === 401) {
      router.push('/login');
      return;
    }
    if (!response.ok) {
      setProfileError('Could not load profile.');
      return;
    }
    const data: unknown = await response.json();
    if (!isUserProfile(data)) {
      setProfileError('Unexpected profile response.');
      return;
    }
    setProfile(data);
  }, [router]);

  useEffect(() => {
    const timer = window.setTimeout(() => void loadProfile(), 0);
    return () => window.clearTimeout(timer);
  }, [loadProfile]);

  return (
    <div className={className}>
      <div className="mb-4">
        <h1
          className="fw-semibold fs-4 m-0"
          style={{ color: 'var(--color-charcoal)' }}
        >
          Profile
        </h1>
        <p className="m-0" style={{ fontSize: 14, color: 'var(--color-fog)' }}>
          View your account information and update your password.
        </p>
      </div>

      <div className="dash-card mb-4">
        <div className="dash-card-header">
          <div>
            <h2 className="dash-card-title">Account Information</h2>
          </div>
        </div>
        {profileError && (
          <div className="alert-auth" role="alert">
            {profileError}
          </div>
        )}
        {profile && (
          <dl className="row m-0">
            <dt className="col-sm-3">Email</dt>
            <dd className="col-sm-9">{profile.email}</dd>
            <dt className="col-sm-3">Roles</dt>
            <dd className="col-sm-9">{profile.roles.join(', ')}</dd>
            <dt className="col-sm-3">Member since</dt>
            <dd className="col-sm-9">
              {new Date(profile.createdAt).toLocaleDateString()}
            </dd>
          </dl>
        )}
      </div>

      <div className="dash-card">
        <div className="dash-card-header">
          <div>
            <h2 className="dash-card-title">Change Password</h2>
          </div>
        </div>
        <ChangePasswordForm />
      </div>
    </div>
  );
}
