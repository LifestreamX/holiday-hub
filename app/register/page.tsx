'use client';

import Link from 'next/link';
import { Calendar } from 'lucide-react';
import { signIn } from 'next-auth/react';
import { useState, FormEvent, useRef } from 'react';
import { useRouter } from 'next/navigation';

export default function RegisterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const confirmRef = useRef<HTMLInputElement | null>(null);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    // 1. Force the browser to stop the native form refresh immediately
    e.preventDefault();

    // 2. Prevent double-clicking from firing the function twice
    if (loading) return;

    setError(null);

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      confirmRef.current?.focus();
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading('credentials');

    try {
      const trimmedEmail = email.trim();
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: trimmedEmail, password }),
      });

      // 3. Safely handle non-200 responses without crashing the JSON parser
      if (!response.ok) {
        let errorMessage = 'Registration failed. Please try again.';
        try {
          const data = await response.json();
          errorMessage = data.error || errorMessage;
        } catch (parseError) {
          console.error('Failed to parse error response:', parseError);
        }

        setError(errorMessage);
        setLoading(null);
        return;
      }

      // 4. Success! Show check email message
      setSuccess(
        'Account created! Please check your email to verify your account before logging in.',
      );
      setLoading(null);
      setEmail('');
      setPassword('');
      setConfirmPassword('');
    } catch (error) {
      console.error('Registration error:', error);
      setError('A network error occurred. Please check your connection.');
      setLoading(null);
    }
  }

  async function handleSignIn(provider: 'google' | 'github') {
    try {
      setLoading(provider);
      setError(null);
      // Use redirect:true so NextAuth handles the full OAuth redirect flow
      await signIn(provider, { callbackUrl: '/dashboard', redirect: true });
    } catch (error) {
      console.error(`${provider} sign-in error:`, error);
      setError(`Failed to connect with ${provider}.`);
      setLoading(null);
    }
  }

  return (
    <div className='min-h-screen bg-background flex items-center justify-center p-4'>
      <div className='w-full max-w-md'>
        <div className='text-center mb-8'>
          <Link href='/' className='inline-flex items-center gap-2 mb-4'>
            <Calendar className='w-10 h-10 text-primary' />
            <span className='text-3xl font-bold text-primary'>Holiday Hub</span>
          </Link>
          <h1 className='text-2xl font-semibold text-foreground'>
            Create Account
          </h1>
          <p className='text-muted-foreground mt-2'>
            Get started with Holiday Hub
          </p>
        </div>
        <div className='bg-card rounded-lg shadow-xl p-8 text-foreground md:border-2 md:border-primary/60'>
          {success ? (
            <div className='p-4 mb-6 rounded border border-green-300 bg-green-50 text-green-700 text-center'>
              {success}
            </div>
          ) : (
            <form
              className='space-y-4 mb-6'
              onSubmit={(e) => {
                e.preventDefault();
                handleSubmit(e);
              }}
              autoComplete='off'
            >
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
                  onChange={(e) => setEmail(e.target.value)}
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
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  className='w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-black'
                  placeholder='••••••••'
                  disabled={loading !== null}
                />
              </div>
              <div>
                <label
                  htmlFor='confirmPassword'
                  className='block text-sm font-medium text-gray-700 mb-1'
                >
                  Confirm Password
                </label>
                <input
                  id='confirmPassword'
                  ref={confirmRef}
                  type='password'
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  minLength={6}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-black ${error?.toLowerCase().includes('match') ? 'border-red-500' : 'border-border'}`}
                  placeholder='••••••••'
                  disabled={loading !== null}
                />
              </div>
              {error && (
                <div className='p-3 rounded border border-red-300 bg-red-50 text-red-700'>
                  {error}
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
                    <span>Creating account...</span>
                  </div>
                ) : (
                  'Sign up'
                )}
              </button>
              <div
                aria-live='polite'
                className='min-h-[1.25rem] text-sm text-red-600'
              >
                {/* Error is also displayed at the top, but keeping this space reserved */}
              </div>
            </form>
          )}
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
              type='button'
              onClick={() => handleSignIn('google')}
              disabled={loading !== null}
              className='w-full flex items-center justify-center gap-3 py-3 bg-white border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-200 transition font-medium text-black dark:text-black disabled:opacity-50 disabled:cursor-not-allowed shadow-sm'
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
              {loading === 'google' ? 'Signing up...' : 'Continue with Google'}
            </button>
            <button
              type='button'
              onClick={() => handleSignIn('github')}
              disabled={loading !== null}
              className='w-full flex items-center justify-center gap-3 py-3 bg-[#24292F] text-white rounded-lg hover:bg-[#1b1f23] transition font-medium disabled:opacity-50 disabled:cursor-not-allowed border border-gray-300 dark:border-gray-600 shadow-sm'
            >
              <svg className='w-5 h-5' viewBox='0 0 24 24' fill='currentColor'>
                <path d='M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.415-4.042-1.415-.546-1.387-1.333-1.757-1.333-1.757-1.089-.745.083-.729.083-.729 1.205.084 1.84 1.236 1.84 1.236 1.07 1.834 2.809 1.304 3.495.997.108-.775.418-1.304.762-1.604-2.665-.304-5.466-1.332-5.466-5.93 0-1.31.469-2.381 1.236-3.221-.124-.303-.535-1.523.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.553 3.297-1.23 3.297-1.23.653 1.653.242 2.873.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.61-2.803 5.624-5.475 5.921.43.371.823 1.102.823 2.222 0 1.606-.014 2.898-.014 3.293 0 .319.216.694.825.576C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12' />
              </svg>
              {loading === 'github' ? 'Signing up...' : 'Continue with GitHub'}
            </button>
          </div>
          <div className='text-center text-sm text-muted-foreground mt-6'>
            <span>Already have an account? </span>
            <Link
              href='/login'
              className='text-primary hover:underline font-medium'
            >
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
