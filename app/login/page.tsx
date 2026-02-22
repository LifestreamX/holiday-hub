'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Calendar, Mail, Lock } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError('Invalid email or password');
        return;
      }

      router.push('/dashboard');
      router.refresh();
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
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
          <h1 className='text-2xl font-semibold text-white'>Welcome back</h1>
          <p className='text-gray-200 mt-2'>
            Sign in to manage your holiday notifications
          </p>
        </div>

        <div className='bg-white rounded-lg shadow-xl p-8'>
          <form onSubmit={handleSubmit} className='space-y-6'>
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
                  required
                  className='w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-900'
                  placeholder='you@example.com'
                />
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
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className='w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-900'
                  placeholder='••••••••'
                />
              </div>
            </div>

            <button
              type='submit'
              disabled={isLoading}
              className='w-full py-3 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
            >
              {isLoading ? 'Signing in...' : 'Sign In'}
            </button>
            <div className='mt-4 flex flex-col gap-2'>
              <button
                type='button'
                onClick={() => signIn('google')}
                className='w-full py-3 bg-[#4285F4] text-white rounded-lg font-medium hover:bg-[#357ae8] transition-colors flex items-center justify-center gap-2'
              >
                <svg
                  className='w-5 h-5'
                  viewBox='0 0 24 24'
                  fill='currentColor'
                >
                  <path d='M21.805 10.023h-9.765v3.977h5.588c-.241 1.262-1.021 2.337-2.17 3.047v2.537h3.508c2.051-1.892 3.239-4.684 3.239-7.561 0-.646-.058-1.273-.16-1.997z' />
                  <path d='M12.04 21.999c2.47 0 4.537-.815 6.049-2.217l-3.508-2.537c-.974.651-2.221 1.037-3.541 1.037-2.719 0-5.027-1.837-5.857-4.299h-3.561v2.701c1.504 2.963 4.646 5.318 8.418 5.318z' />
                  <path d='M6.183 13.983c-.273-.815-.429-1.684-.429-2.583s.156-1.768.429-2.583v-2.701h-3.561c-.729 1.462-1.146 3.073-1.146 5.284s.417 3.822 1.146 5.284l3.561-2.701z' />
                  <path d='M12.04 7.457c1.343 0 2.547.462 3.497 1.362l2.617-2.617c-1.512-1.402-3.579-2.217-6.049-2.217-3.772 0-6.914 2.355-8.418 5.318l3.561 2.701c.83-2.462 3.138-4.299 5.857-4.299z' />
                </svg>
                <span>Sign in with Google</span>
              </button>
              <button
                type='button'
                onClick={() => signIn('github')}
                className='w-full py-3 bg-[#24292F] text-white rounded-lg font-medium hover:bg-[#1b1f23] transition-colors flex items-center justify-center gap-2'
              >
                <svg
                  className='w-5 h-5'
                  viewBox='0 0 24 24'
                  fill='currentColor'
                >
                  <path d='M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.415-4.042-1.415-.546-1.387-1.333-1.757-1.333-1.757-1.089-.745.083-.729.083-.729 1.205.084 1.84 1.236 1.84 1.236 1.07 1.834 2.809 1.304 3.495.997.108-.775.418-1.304.762-1.604-2.665-.304-5.466-1.332-5.466-5.93 0-1.31.469-2.381 1.236-3.221-.124-.303-.535-1.523.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.553 3.297-1.23 3.297-1.23.653 1.653.242 2.873.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.61-2.803 5.624-5.475 5.921.43.371.823 1.102.823 2.222 0 1.606-.014 2.898-.014 3.293 0 .319.216.694.825.576C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12' />
                </svg>
                <span>Sign in with GitHub</span>
              </button>
            </div>
          </form>

          <div className='mt-6 text-center'>
            <span className='text-gray-600'>Don&apos;t have an account? </span>
            <Link
              href='/register'
              className='text-purple-600 font-medium hover:text-purple-700'
            >
              Sign up
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
