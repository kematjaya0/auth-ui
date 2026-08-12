'use client';

import { Toast } from '@kematjaya/bootstrap-ui-kit';
import { useSearchParams } from 'next/navigation';

export function LoginToast() {
  const searchParams = useSearchParams();
  const message = searchParams.get('toast');
  if (!message) return null;
  return <Toast message={message} />;
}
