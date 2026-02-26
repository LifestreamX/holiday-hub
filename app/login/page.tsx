'use client';

import Link from 'next/link';
import { signIn } from 'next-auth/react';
import { Calendar, GitHub } from 'lucide-react';

export default function LoginPage() {
  const callbackUrl = '/dashboard';

  return (
    <div className='min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-700 flex items-center justify-center p-4'>
      <div className='w-full max-w-md'>
        <div className='text-center mb-8'>
          <Link href='/' className='inline-flex items-center gap-2 mb-4'>
            <Calendar className='w-10 h-10 text-white' />
            <span className='text-3xl font-bold text-white'>Holiday Hub</span>
          </Link>
          <h1 className='text-2xl font-semibold text-white'>Welcome back</h1>
          <p className='text-gray-200 mt-2'>Sign in with GitHub or Google</p>
        </div>

        <div className='bg-white rounded-lg shadow-xl p-8'>
          <div className='space-y-4'>
            <button
              type='button'
              onClick={() => signIn('google', { callbackUrl })}
              className='w-full flex items-center justify-center gap-3 py-3 bg-white border-2 border-gray-300 rounded-lg hover:bg-gray-50 transition font-medium text-gray-700'
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
              Continue with Google
            </button>

            <button
              type='button'
              onClick={() => signIn('github', { callbackUrl })}
              className='w-full flex items-center justify-center gap-3 py-3 bg-[#24292F] text-white rounded-lg hover:bg-[#1b1f23] transition font-medium'
            >
              <GitHub className='w-5 h-5' />
              Continue with GitHub
            </button>

            <div className='text-center text-sm text-gray-500 pt-4'>
              <span>Don&apos;t have an account? </span>
              <Link
                href='/register'
                className='text-blue-600 hover:underline font-medium'
              >
                Sign up
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
