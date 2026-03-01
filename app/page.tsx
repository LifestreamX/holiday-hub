import Link from 'next/link';
import { Bell, Users, Sparkles } from 'lucide-react';

export default function Home() {
  return (
    <div className='min-h-screen flex flex-col bg-gradient-to-br from-slate-900 via-blue-900 to-slate-700'>
      <nav className='container mx-auto px-4 py-6'>
        <div className='flex items-center justify-between'>
          <div className='flex items-center gap-2'>
            <img
              src='/trone-lts.svg'
              alt='Trone LTS logo'
              className='w-8 h-8'
            />
            <span className='text-2xl font-bold text-white'>Holiday Hub</span>
          </div>
          <div className='flex items-center gap-4'>
            <Link
              href='/register'
              className='px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors'
            >
              Sign up
            </Link>
            <Link
              href='/login'
              className='px-6 py-2 bg-white text-blue-900 rounded-lg font-medium hover:bg-gray-100 transition-colors'
            >
              Sign in
            </Link>
          </div>
        </div>
      </nav>

      {/* Main content wrapper with flex-1 */}
      <div className='flex-1 flex flex-col'>
        <main className='flex-1 container mx-auto px-4 py-20'>
          <div className='max-w-4xl mx-auto text-center'>
            <h1 className='text-5xl md:text-6xl font-bold text-white mb-6'>
              Never Miss a Holiday Again
            </h1>
            <p className='text-xl text-gray-200 mb-12'>
              Get customizable email reminders for all your favorite holidays.
              Choose when you want to be notified. Sign up with Google or GitHub
              in seconds.
            </p>

            <div className='flex flex-wrap items-center justify-center gap-4 mb-20'>
              <Link
                href='/register'
                className='px-8 py-4 bg-white text-blue-900 rounded-lg font-semibold text-lg hover:bg-gray-100 transition-colors shadow-lg'
              >
                Get Started Free
              </Link>
            </div>

            <div className='grid md:grid-cols-3 gap-8 mt-20'>
              <div className='bg-white/10 backdrop-blur-lg rounded-lg p-8 text-white'>
                <Bell className='w-12 h-12 mb-4 mx-auto' />
                <h3 className='text-xl font-semibold mb-3'>Smart Reminders</h3>
                <p className='text-gray-200'>
                  Set multiple reminders for each holiday. Get notified days,
                  weeks, or even a month in advance.
                </p>
              </div>

              <div className='bg-white/10 backdrop-blur-lg rounded-lg p-8 text-white'>
                <Users className='w-12 h-12 mb-4 mx-auto' />
                <h3 className='text-xl font-semibold mb-3'>Customizable</h3>
                <p className='text-gray-200'>
                  Choose exactly when to be reminded - from the day of, to a
                  month in advance. Personalize every holiday.
                </p>
              </div>

              <div className='bg-white/10 backdrop-blur-lg rounded-lg p-8 text-white'>
                <Sparkles className='w-12 h-12 mb-4 mx-auto' />
                <h3 className='text-xl font-semibold mb-3'>
                  All Major Holidays
                </h3>
                <p className='text-gray-200'>
                  From federal holidays to cultural celebrations. We track them
                  all automatically.
                </p>
              </div>
            </div>
          </div>
        </main>
      </div>
      {/* Footer moved outside main content wrapper for true sticky bottom */}
      <footer className='container mx-auto px-4 py-8 border-t border-white/20 mt-auto'>
        <div className='text-center text-gray-300'>
          <p>&copy; 2026 Holiday Hub. Never miss a celebration.</p>
        </div>
      </footer>
    </div>
  );
}
