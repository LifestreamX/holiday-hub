'use client';

import Link from 'next/link';
import { signIn } from 'next-auth/react';
import { useState, useEffect, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { Calendar } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [hydrated, setHydrated] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [registeredMessage, setRegisteredMessage] = useState<string | null>(
    null,
  );

  const handleCredentialsSubmit = async (e?: FormEvent) => {
    e?.preventDefault?.();
    setError(null);
    setErrorMessage(null);
    setLoading('credentials');

    try {
      // Trim email to avoid whitespace issues
      const trimmedEmail = email.trim();

      console.log('[Login] Attempting signin with email:', trimmedEmail);

      const result = await signIn('credentials', {
        email: trimmedEmail,
        password,
        redirect: false,
      });

      console.log('[Login] SignIn result:', result);
      console.debug('credentials signIn result', result);

      // If NextAuth returned no result (rare), fall back to a full redirect
      if (!result) {
        await signIn('credentials', {
          email,
          password,
          redirect: true,
          callbackUrl: '/dashboard',
        });
        return;
      }

      // Detect unverified email error
      if (
        result.error === 'EMAIL_NOT_VERIFIED' ||
        (typeof result.error === 'string' &&
          result.error.includes('EMAIL_NOT_VERIFIED'))
      ) {
        setError(
          'You must verify your email before logging in. Please check your inbox for a verification link.',
        );
        setLoading(null);
        return;
      }

      if (result.error) {
        setError('Invalid email or password');
        setLoading(null);
      } else if (result.ok) {
        router.push('/dashboard');
      } else {
        // Unexpected shape — surface a generic message
        setError('Sign-in failed. Please try again.');
        setLoading(null);
      }
    } catch (error: any) {
      // Detect thrown error for unverified email
      if (error?.message === 'EMAIL_NOT_VERIFIED') {
        setError(
          'You must verify your email before logging in. Please check your inbox for a verification link.',
        );
      } else {
        setError('An error occurred. Please try again.');
      }
      setLoading(null);
    }
  };

  const handleSignIn = async (provider: 'google' | 'github') => {
    try {
      setLoading(provider);
      setError(null);
      setErrorMessage(null);
      console.log(`[Login] Starting ${provider} OAuth flow`);

      // Clear error parameters from URL to prevent old errors from re-appearing
      if (window.history && window.history.replaceState) {
        const params = new URLSearchParams(window.location.search);
        params.delete('error');
        params.delete('registered');
        params.delete('reset');
        const newUrl = params.toString()
          ? `?${params.toString()}`
          : window.location.pathname;
        window.history.replaceState({}, '', newUrl);
      }

      // For OAuth providers, use redirect: true to let NextAuth handle the redirect
      const result = await signIn(provider, {
        callbackUrl: '/dashboard',
        redirect: true,
      });

      console.log(`[Login] ${provider} signIn result:`, result);
    } catch (error) {
      console.error(`[Login] ${provider} sign in error:`, error);
      setError(`${provider} sign-in failed. Please try again.`);
      setLoading(null);
    }
  };

  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [providersInfo, setProvidersInfo] = useState<Record<
    string,
    any
  > | null>(null);
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const error = params.get('error');
      const reg = params.get('registered');
      const reset = params.get('reset');
      if (reg) {
        setRegisteredMessage('Account created — please sign in.');
      }
      if (reset === 'success') {
        setRegisteredMessage(
          'Password reset successful! You can now sign in with your new password.',
        );
      }
      if (error) {
        console.log('[Login] Error param detected:', error);
        if (error === 'google' || error === 'github') {
          setErrorMessage(
            'There was an error with the OAuth provider. Please try again.',
          );
        } else if (error === 'OAuthAccountNotLinked') {
          setErrorMessage(
            'This account is linked with a different sign-in method.',
          );
        } else if (error === 'CredentialsSignin') {
          setErrorMessage('Invalid email or password.');
        } else if (error === 'AccessDenied') {
          setErrorMessage(
            'Access was denied. Please try again or contact support.',
          );
        } else if (error === 'Configuration' || error === 'OAuthSignin') {
          setErrorMessage(
            'There was a configuration error. Please try again in a moment.',
          );
        } else if (error === 'OAuthCallback') {
          setErrorMessage(
            'There was an error during sign-in. Please try again.',
          );
        } else {
          // For any other error, show a generic message but log the actual error
          console.error('[Login] Unknown error type:', error);
          setErrorMessage('Sign-in failed. Please try again.');
        }
      }
    } catch (e) {
      // ignore
    }
  }, []);

  useEffect(() => {
    try {
      const form = document.querySelector('form');
      if (form) form.setAttribute('data-hydrated', '1');
    } catch (e) {}
    setHydrated(true);
  }, []);
  useEffect(() => {
    // Keep the registered success message until the user dismisses it.
  }, [registeredMessage]);

  useEffect(() => {
    fetch('/api/auth/providers')
      .then((r) => r.json())
      .then((d) => setProvidersInfo(d))
      .catch(() => setProvidersInfo(null));
  }, []);

  return (
    <div className='min-h-screen bg-background flex items-center justify-center p-4'>
      <div className='w-full max-w-md'>
        <div className='text-center mb-8'>
          <Link href='/' className='inline-flex items-center gap-2 mb-4'>
            <Calendar className='w-10 h-10 text-primary' />
            <span className='text-3xl font-bold text-primary'>Holiday Hub</span>
          </Link>
          <h1 className='text-2xl font-semibold text-foreground'>Sign in</h1>
          <p className='text-muted-foreground mt-2'>Welcome back!</p>
        </div>

        <div className='bg-card rounded-lg shadow-xl p-8 text-foreground md:border-2 md:border-primary/60'>
          <form onSubmit={handleCredentialsSubmit} className='space-y-4 mb-6'>
            <div>
              <label
                htmlFor='email'
                className='block text-sm font-medium text-foreground mb-1'
              >
                Email
              </label>
              <input
                id='email'
                type='email'
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setError(null);
                }}
                required
                className='w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-black'
                placeholder='your@email.com'
                disabled={loading !== null}
              />
            </div>
            <div>
              <label
                htmlFor='password'
                className='block text-sm font-medium text-foreground mb-1'
              >
                Password
              </label>
              <input
                id='password'
                type='password'
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError(null);
                }}
                required
                className='w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-black'
                placeholder='••••••••'
                disabled={loading !== null}
              />
              <div className='text-right mt-1'>
                <Link
                  href='/forgot-password'
                  className='text-sm text-primary hover:underline'
                >
                  Forgot password?
                </Link>
              </div>
            </div>
            {registeredMessage && (
              <div
                aria-live='polite'
                className='p-3 rounded border border-green-300 bg-green-50 text-green-700 flex items-center justify-between'
              >
                <span>{registeredMessage}</span>
                <button
                  onClick={() => setRegisteredMessage(null)}
                  className='ml-4 text-sm text-green-700 underline'
                >
                  Dismiss
                </button>
              </div>
            )}
            {(errorMessage || error) && (
              <div className='p-3 rounded border border-red-300 bg-red-50 text-red-700'>
                {errorMessage || error}
              </div>
            )}
            <button
              type='submit'
              disabled={loading !== null}
              className='w-full py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center'
            >
              {loading === 'credentials' ? (
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
                  <span>Signing in...</span>
                </div>
              ) : (
                'Sign in'
              )}
            </button>
          </form>

          {/* Inline fallback removed: rely on React handlers for sign-in. */}

          <div className='relative mb-6'>
            <div className='absolute inset-0 flex items-center'>
              <div className='w-full border-t border-border'></div>
            </div>
            <div className='relative flex justify-center text-sm'>
              <span className='px-2 bg-card text-muted-foreground'>
                Or continue with
              </span>
            </div>
          </div>

          <div className='space-y-3'>
            <button
              onClick={() => handleSignIn('google')}
              disabled={loading !== null}
              className='w-full flex items-center justify-center gap-3 py-3 bg-white border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 transition font-medium text-black dark:text-black disabled:opacity-50 disabled:cursor-not-allowed shadow-sm'
            >
              <svg
                xmlns='http://www.w3.org/2000/svg'
                viewBox='0 0 48 48'
                className='w-5 h-5'
              >
                <path
                  fill='#EA4335'
                  d='M24 9.5c3.6 0 6.8 1.3 9.3 3.6l6.9-6.9C36.7 2.2 30.7 0 24 0 14.7 0 6.9 5.6 3 13.7l7.9 6.1C12.8 14.1 17.9 9.5 24 9.5z'
                />
                <path
                  fill='#34A853'
                  d='M46.5 24c0-1.6-.1-3.1-.4-4.6H24v9.1h12.7c-.5 2.9-2 5.3-4.3 6.9l6.9 5.3C43.8 37.2 46.5 31.2 46.5 24z'
                />
                <path
                  fill='#4A90E2'
                  d='M10.9 28.5A14.9 14.9 0 0 1 9.5 24c0-1.3.2-2.6.6-3.8L3 13.7C1.1 16.9 0 20.4 0 24c0 3.6 1 7.1 2.9 10.3l7.9-6.1z'
                />
                <path
                  fill='#FBBC05'
                  d='M24 48c6.7 0 12.7-2.2 17.4-5.9l-8.5-6.6C30.8 35.8 27.6 37 24 37c-6.1 0-11.2-4.6-12.1-10.5l-7.9 6.1C6.9 42.4 14.7 48 24 48z'
                />
              </svg>
              {loading === 'google' ? 'Signing in...' : 'Continue with Google'}
            </button>

            <button
              onClick={() => handleSignIn('github')}
              disabled={loading !== null}
              className='w-full flex items-center justify-center gap-3 py-3 bg-[#24292F] text-white rounded-lg hover:bg-[#1b1f23] transition font-medium disabled:opacity-50 disabled:cursor-not-allowed border border-gray-300 dark:border-gray-600 shadow-sm'
            >
              <svg className='w-5 h-5' viewBox='0 0 24 24' fill='currentColor'>
                <path d='M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.415-4.042-1.415-.546-1.387-1.333-1.757-1.333-1.757-1.089-.745.083-.729.083-.729 1.205.084 1.84 1.236 1.84 1.236 1.07 1.834 2.809 1.304 3.495.997.108-.775.418-1.304.762-1.604-2.665-.304-5.466-1.332-5.466-5.93 0-1.31.469-2.381 1.236-3.221-.124-.303-.535-1.523.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.553 3.297-1.23 3.297-1.23.653 1.653.242 2.873.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.61-2.803 5.624-5.475 5.921.43.371.823 1.102.823 2.222 0 1.606-.014 2.898-.014 3.293 0 .319.216.694.825.576C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12' />
              </svg>
              {loading === 'github' ? 'Signing in...' : 'Continue with GitHub'}
            </button>
          </div>

          <div className='text-center text-sm text-muted-foreground mt-6'>
            <span>Don&apos;t have an account? </span>
            <Link
              href='/register'
              className='text-primary hover:underline font-medium'
            >
              Sign up
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
