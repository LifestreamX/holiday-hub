import Link from 'next/link';
import { Calendar, Bell, Users, Sparkles } from 'lucide-react';

export default function Home() {
  return (
    <div className='min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-700'>
      <nav className='container mx-auto px-4 py-6'>
        <div className='flex items-center justify-between'>
          <div className='flex items-center gap-2'>
            <Calendar className='w-8 h-8 text-white' />
            <span className='text-2xl font-bold text-white'>Holiday Hub</span>
          </div>
          <div className='flex items-center gap-4'>
            <Link
              href='/login'
              className='px-6 py-2 bg-white text-blue-900 rounded-lg font-medium hover:bg-gray-100 transition-colors'
            >
              Sign In / Sign Up
            </Link>
          </div>
        </div>
      </nav>

      <main className='container mx-auto px-4 py-20'>
        <div className='max-w-4xl mx-auto text-center'>
          <h1 className='text-5xl md:text-6xl font-bold text-white mb-6'>
            Never Miss a Holiday Again
          </h1>
          <p className='text-xl text-gray-200 mb-12'>
            Get customizable reminders for all your favorite holidays. Choose
            when and how you want to be notified. Sign up with Google or GitHub
            in seconds.
          </p>

          <div className='flex flex-wrap items-center justify-center gap-4 mb-20'>
            <Link
              href='/login'
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
              <h3 className='text-xl font-semibold mb-3'>Multi-Channel</h3>
              <p className='text-gray-200'>
                Receive notifications via email, browser push notifications, or
                both. Your choice.
              </p>
            </div>

            <div className='bg-white/10 backdrop-blur-lg rounded-lg p-8 text-white'>
              <Sparkles className='w-12 h-12 mb-4 mx-auto' />
              <h3 className='text-xl font-semibold mb-3'>All Major Holidays</h3>
              <p className='text-gray-200'>
                From federal holidays to cultural celebrations. We track them
                all automatically.
              </p>
            </div>
          </div>
        </div>
      </main>

      <footer className='container mx-auto px-4 py-8 mt-20 border-t border-white/20'>
        <div className='text-center text-gray-300'>
          <p>&copy; 2026 Holiday Hub. Never miss a celebration.</p>
        </div>
      </footer>
    </div>
  );
}
