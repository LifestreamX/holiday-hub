'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Calendar, Mail, Lock, Globe } from 'lucide-react';

export default function RegisterPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [timezone, setTimezone] = useState('America/New_York');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [passwordMismatch, setPasswordMismatch] = useState(false);
  const confirmRef = useRef<HTMLInputElement | null>(null);

  const timezones = [
    'America/New_York',
    'America/Chicago',
    'America/Denver',
    'America/Los_Angeles',
    'America/Phoenix',
    'America/Anchorage',
    'Pacific/Honolulu',
  ];

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleCreateAccount = async () => {
    console.log('handleCreateAccount called', { email, passwordLength: password.length, confirmLength: confirmPassword.length });
    // Trim whitespace
    const trimmedEmail = email.trim();

    // Validate email format
    if (!trimmedEmail) {
      setError('Email is required');
      setPasswordMismatch(false);
      return;
    }

    if (!validateEmail(trimmedEmail)) {
      setError('Please enter a valid email address');
      setPasswordMismatch(false);
      return;
    }

    // Validate password
    if (!password) {
      setError('Password is required');
      setPasswordMismatch(false);
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      setPasswordMismatch(false);
      return;
    }

    // Validate password match
    if (!confirmPassword) {
      console.log('validation: confirmPassword empty');
      setError('Please confirm your password');
      setPasswordMismatch(true);
      confirmRef.current?.focus();
      return;
    }

    if (password !== confirmPassword) {
      console.log('validation: passwords do not match', { password, confirmPassword });
      try { window?.alert?.('Passwords do not match'); } catch {};
      setError('Passwords do not match');
      setPasswordMismatch(true);
      confirmRef.current?.focus();
      return;
    }

    // All validations passed - clear errors and proceed
    setError('');
    setPasswordMismatch(false);
    setIsLoading(true);

    try {
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: trimmedEmail,
          password,
          timezone,
          countryCode: 'US',
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Failed to create account');
        setIsLoading(false);
        return;
      }

      // Success - redirect to login
      router.push('/login?registered=true');
    } catch (err) {
      setError('An error occurred. Please try again.');
      setIsLoading(false);
    }
  };

  return (
    <div className='min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-700 flex items-center justify-center p-4'>
      <div className='w-full max-w-md'>
        <div className='text-center mb-8'>
          <Link href='/' className='inline-flex items-center gap-2 mb-4'>
            <Calendar className='w-10 h-10 text-white' />
            <span className='text-3xl font-bold text-white'>Holiday Hub</span>
          </Link>
          <h1 className='text-2xl font-semibold text-white'>
            Create your account
          </h1>
          <p className='text-gray-200 mt-2'>
            Start receiving holiday notifications today
          </p>
        </div>

        <div className='bg-white rounded-lg shadow-xl p-8'>
          <div className='space-y-6'>
            {error && (
              <div className='bg-red-50 border border-red-200 text-red-800 rounded-lg p-4 text-sm'>
                {error}
              </div>
            )}

            <div>
              <label
                htmlFor='email'
                className='block text-sm font-medium text-gray-700 mb-2'
              >
                Email Address
              </label>
              <div className='relative'>
                <Mail className='absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400' />
                <input
                  id='email'
                  type='email'
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className='w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900'
                  placeholder='you@example.com'
                  autoComplete='email'
                />
              </div>
            </div>

            <div>
              <label
                htmlFor='timezone'
                className='block text-sm font-medium text-gray-700 mb-2'
              >
                Your Timezone
              </label>
              <div className='relative'>
                <Globe className='absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400' />
                <select
                  id='timezone'
                  value={timezone}
                  onChange={(e) => setTimezone(e.target.value)}
                  className='w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none bg-white text-gray-900 hover:text-blue-700'
                >
                  {timezones.map((tz) => (
                    <option key={tz} value={tz}>
                      {tz.replace('/_/g', ' ')}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label
                htmlFor='password'
                className='block text-sm font-medium text-gray-700 mb-2'
              >
                Password
              </label>
              <div className='relative'>
                <Lock className='absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400' />
                <input
                  id='password'
                  type='password'
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    // Clear mismatch flag and error if passwords now match
                    if (confirmPassword && e.target.value === confirmPassword) {
                      setPasswordMismatch(false);
                      setError('');
                    }
                  }}
                  className='w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900'
                  placeholder='At least 6 characters'
                  autoComplete='new-password'
                />
              </div>
            </div>

            <div>
              <label
                htmlFor='confirmPassword'
                className='block text-sm font-medium text-gray-700 mb-2'
              >
                Confirm Password
              </label>
              <div className='relative'>
                <Lock className='absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400' />
                <input
                  id='confirmPassword'
                  ref={confirmRef}
                  type='password'
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    // Clear mismatch flag and error if passwords now match
                    if (e.target.value === password) {
                      setPasswordMismatch(false);
                      setError('');
                    }
                  }}
                  aria-invalid={Boolean(passwordMismatch)}
                  className={`w-full pl-10 pr-4 py-3 rounded-lg focus:outline-none text-gray-900 ${
                    passwordMismatch
                      ? 'border border-red-500 focus:ring-2 focus:ring-red-500'
                      : 'border border-gray-300 focus:ring-2 focus:ring-blue-500'
                  }`}
                  placeholder='••••••••'
                  autoComplete='new-password'
                />
              </div>
              {(passwordMismatch ||
                (confirmPassword && password !== confirmPassword)) && (
                <p className='text-red-600 text-sm mt-1'>
                  Passwords do not match
                </p>
              )}
            </div>

            <button
              type='button'
              onClick={handleCreateAccount}
              disabled={isLoading}
              className='w-full py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
            >
              {isLoading ? 'Creating account...' : 'Create Account'}
            </button>
          </div>

          <div className='mt-6 text-center'>
            <span className='text-gray-600'>Already have an account? </span>
            <Link
              href='/login'
              className='text-blue-600 font-medium hover:text-blue-700'
            >
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
