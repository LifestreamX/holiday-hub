'use client';
import { useEffect, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function VerifyEmailPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<
    'idle' | 'verifying' | 'success' | 'error'
  >('idle');
  const [message, setMessage] = useState('');
  const [checked, setChecked] = useState(false);
  const errorTimerRef = useRef<number | null>(null);

  useEffect(() => {
    setStatus('verifying');
    setMessage('Verifying your email...');
    const token = searchParams.get('token');
    if (!token) {
      // Delay showing the missing-token error briefly to avoid a
      // hydration/navigation flash where `searchParams` may be empty
      // momentarily on mount. If token still missing after 250ms,
      // show the error.
      const missingTimer = window.setTimeout(() => {
        setStatus('error');
        setMessage('Missing verification token.');
        setChecked(true);
      }, 500);
      return () => clearTimeout(missingTimer);
    }

    const fetchVerify = async () => {
      try {
        const res = await fetch(`/api/verify-email?token=${token}`);
        const data = await res.json().catch(() => ({}));
        if (res.ok) {
          if (errorTimerRef.current) {
            clearTimeout(errorTimerRef.current);
            errorTimerRef.current = null;
          }
          setStatus('success');
          setMessage('Your email has been verified! You can now log in.');
          setChecked(true);
          setTimeout(() => {
            setStatus('idle');
            setMessage('');
            router.push('/login');
          }, 3000);
        } else {
          // Delay showing the error briefly to avoid a transient flash
          // if a follow-up success response arrives shortly after.
          errorTimerRef.current = window.setTimeout(() => {
            setStatus('error');
            setMessage((data as any).error || 'Verification failed.');
            setChecked(true);
            errorTimerRef.current = null;
          }, 3000);
        }
      } catch (e) {
        errorTimerRef.current = window.setTimeout(() => {
          setStatus('error');
          setMessage('Verification failed.');
          setChecked(true);
          errorTimerRef.current = null;
        }, 3000);
      }
    };

    fetchVerify();

    return () => {
      if (errorTimerRef.current) {
        clearTimeout(errorTimerRef.current);
      }
    };
  }, [router, searchParams]);

  return (
    <div className='flex flex-col items-center justify-center min-h-screen'>
      <div className='bg-white p-8 rounded shadow-md w-full max-w-md text-center'>
        <h1 className='text-2xl font-bold mb-4 text-black'>
          Email Verification
        </h1>

        {(!checked || status === 'verifying' || status === 'success') && (
          <>
            {status === 'verifying' && (
              <p className='text-gray-700'>Verifying your email...</p>
            )}
            {status === 'success' && (
              <>
                <p className='text-green-600'>{message}</p>
                <p className='mt-4 text-green-600'>Redirecting to login...</p>
              </>
            )}
          </>
        )}

        {checked && status === 'error' && (
          <>
            <p className='text-red-500'>{message}</p>
            <p className='mt-4 text-gray-500'>
              If you believe this is a mistake, please try the link again or
              contact support.
            </p>
          </>
        )}
      </div>
    </div>
  );
}
