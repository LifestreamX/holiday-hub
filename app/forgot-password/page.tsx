'use client';

import Link from 'next/link';
import { Calendar } from 'lucide-react';
import { useState, FormEvent } from 'react';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setMessage(null);

    if (loading) return;

    if (!email.trim()) {
      setError('Please enter your email address');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'An error occurred. Please try again.');
        setLoading(false);
        return;
      }

      setMessage(data.message);
      setEmail('');
    } catch (error) {
      console.error('Forgot password error:', error);
      setError('A network error occurred. Please check your connection.');
    } finally {
      setLoading(false);
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
            Forgot Password?
          </h1>
          <p className='text-muted-foreground mt-2'>
            Enter your email and we&apos;ll send you a reset link
          </p>
        </div>

        <div className='bg-card rounded-2xl shadow-xl p-8 text-foreground border border-primary/60'>
          {message ? (
            <div className='text-center'>
              <div className='p-4 rounded-xl border border-primary/20 bg-primary/10 text-primary mb-6'>
                {message}
              </div>
              <Link
                href='/login'
                className='text-primary hover:underline font-medium flex items-center justify-center gap-2'
              >
                ← Back to login
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className='space-y-4 text-left'>
              <div>
                <label
                  htmlFor='email'
                  className='block text-sm font-medium text-foreground mb-1'
                >
                  Email Address
                </label>
                <input
                  id='email'
                  type='email'
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className='w-full px-4 py-3 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary text-black'
                  placeholder='your@email.com'
                  disabled={loading}
                />
              </div>

              {error && (
                <div className='p-3 rounded-xl border border-red-300 bg-red-50 text-red-700 text-sm'>
                  {error}
                </div>
              )}

              <button
                type='submit'
                disabled={loading}
                className='w-full py-3 bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center shadow-sm mt-6'
              >
                {loading ? (
                  <div className='flex items-center gap-3'>
                    <svg
                      className='animate-spin h-5 w-5 text-primary-foreground'
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
                    <span>Sending...</span>
                  </div>
                ) : (
                  'Send Reset Link'
                )}
              </button>

              <div className='text-center text-sm text-muted-foreground pt-2'>
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
