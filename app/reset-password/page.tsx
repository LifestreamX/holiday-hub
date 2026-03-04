'use client';

import Link from 'next/link';
import { useState, FormEvent, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!token) {
      setError('Invalid reset link. Please request a new password reset.');
    }
  }, [token]);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    if (loading) return;

    if (!token) {
      setError('Invalid reset link');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'An error occurred. Please try again.');
        setLoading(false);
        return;
      }

      setSuccess(true);
      setTimeout(() => {
        router.push('/login?reset=success');
      }, 2000);
    } catch (error) {
      console.error('Reset password error:', error);
      setError('A network error occurred. Please check your connection.');
      setLoading(false);
    }
  }

  return (
    <div className='min-h-screen bg-background flex items-center justify-center p-4'>
      <div className='w-full max-w-md'>
        <div className='text-center mb-8'>
          <Link href='/' className='inline-flex items-center gap-2 mb-4'>
            <svg
              xmlns='http://www.w3.org/2000/svg'
              viewBox='0 0 24 24'
              className='w-10 h-10 text-white'
              aria-hidden
            >
              <path
                fill='currentColor'
                d='M3 6a1 1 0 011-1h3a1 1 0 011 1v1h8V6a1 1 0 011-1h3a1 1 0 011 1v3a1 1 0 01-1 1h-1v8h1a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-1H8v1a1 1 0 01-1 1H4a1 1 0 01-1-1v-3a1 1 0 011-1h1V11H4a1 1 0 01-1-1V6z'
              />
            </svg>
            <span className='text-3xl font-bold text-primary'>Holiday Hub</span>
          </Link>
          <h1 className='text-2xl font-semibold text-foreground'>
            Reset Password
          </h1>
          <p className='text-muted-foreground mt-2'>Enter your new password</p>
        </div>

        <div className='bg-card rounded-lg shadow-xl p-8 text-foreground'>
          {success ? (
            <div>
              <div className='p-4 rounded border border-green-300 bg-green-50 text-green-700 mb-6'>
                Password reset successful! Redirecting to login...
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className='space-y-4'>
              <div>
                <label
                  htmlFor='password'
                  className='block text-sm font-medium text-gray-700 mb-1'
                >
                  New Password
                </label>
                <input
                  id='password'
                  type='password'
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  className='w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary'
                  placeholder='••••••••'
                  disabled={loading || !token}
                />
              </div>

              <div>
                <label
                  htmlFor='confirmPassword'
                  className='block text-sm font-medium text-gray-700 mb-1'
                >
                  Confirm New Password
                </label>
                <input
                  id='confirmPassword'
                  type='password'
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  minLength={6}
                  className='w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary'
                  placeholder='••••••••'
                  disabled={loading || !token}
                />
              </div>

              {error && (
                <div className='p-3 rounded border border-red-300 bg-red-50 text-red-700'>
                  {error}
                </div>
              )}

              <button
                type='submit'
                disabled={loading || !token}
                className='w-full py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center'
              >
                {loading ? (
                  <div className='flex items-center gap-3'>
                    <svg
                      className='animate-spin h-5 w-5 text-white'
                      xmlns='http://www.w3.org/2000/svg'
                      viewBox='0 0 24 24'
                      aria-hidden
                    >
                      <circle
                        className='opacity-25'
                        cx='12'
                        cy='12'
                        r='10'
                        stroke='currentColor'
                        strokeWidth='4'
                        fill='none'
                      />
                      <path
                        className='opacity-75'
                        fill='currentColor'
                        d='M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z'
                      />
                    </svg>
                    <span>Resetting...</span>
                  </div>
                ) : (
                  'Reset Password'
                )}
              </button>

              <div className='text-center text-sm text-muted-foreground mt-4'>
                <Link
                  href='/login'
                  className='text-primary hover:underline font-medium'
                >
                  ← Back to login
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ResetPasswordForm />
    </Suspense>
  );
}
