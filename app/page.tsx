import Link from 'next/link';
import { Bell, Users, Sparkles, Calendar } from 'lucide-react';

export default function Home() {
  return (
    <div className='min-h-screen flex flex-col bg-background'>
      <nav className='container mx-auto px-4 py-4 md:py-6'>
        <div className='flex flex-col sm:flex-row items-center justify-between gap-4'>
          <div className='flex items-center gap-2'>
            <Calendar className='w-8 h-8 text-primary' />
            <span className='text-2xl font-bold text-primary'>Holiday Hub</span>
          </div>
          <div className='flex items-center gap-3 w-full sm:w-auto'>
            <Link
              href='/register'
              className='flex-1 sm:flex-none text-center px-4 sm:px-6 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors shadow'
            >
              Sign up
            </Link>
            <Link
              href='/login'
              className='flex-1 sm:flex-none text-center px-4 sm:px-6 py-2 border border-primary text-primary hover:bg-primary/10 rounded-lg font-medium transition-colors'
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
            <h1 className='text-5xl md:text-6xl font-bold text-primary mb-6'>
              Never Miss a Holiday Again
            </h1>
            <p className='text-xl text-muted-foreground mb-12'>
              Get customizable email reminders for all your favorite holidays.
              Choose when you want to be notified. Sign up with Google or GitHub
              in seconds.
            </p>

            <div className='flex flex-wrap items-center justify-center gap-4 mb-20'>
              <Link
                href='/register'
                className='px-8 py-4 bg-primary text-primary-foreground rounded-lg font-semibold text-lg hover:bg-primary/90 transition-colors shadow-lg'
              >
                Get Started Free
              </Link>
            </div>

            <div className='grid md:grid-cols-3 gap-8 mt-20'>
              <div className='bg-card rounded-lg p-8 text-foreground shadow'>
                <Bell className='w-12 h-12 mb-4 mx-auto' />
                <h3 className='text-xl font-semibold mb-3 text-primary'>
                  Smart Reminders
                </h3>
                <p className='text-muted-foreground'>
                  Set multiple reminders for each holiday. Get notified days,
                  weeks, or even a month in advance.
                </p>
              </div>

              <div className='bg-card rounded-lg p-8 text-foreground shadow'>
                <Users className='w-12 h-12 mb-4 mx-auto' />
                <h3 className='text-xl font-semibold mb-3 text-primary'>
                  Customizable
                </h3>
                <p className='text-muted-foreground'>
                  Choose exactly when to be reminded - from the day of, to a
                  month in advance. Personalize every holiday.
                </p>
              </div>

              <div className='bg-card rounded-lg p-8 text-foreground shadow'>
                <Sparkles className='w-12 h-12 mb-4 mx-auto' />
                <h3 className='text-xl font-semibold mb-3 text-primary'>
                  All Major Holidays
                </h3>
                <p className='text-muted-foreground'>
                  From federal holidays to cultural celebrations. We track them
                  all automatically.
                </p>
              </div>
            </div>
          </div>
        </main>
      </div>
      {/* Footer moved outside main content wrapper for true sticky bottom */}
      <footer className='container mx-auto px-4 py-8 border-t border-border mt-auto'>
        <div className='text-center text-muted-foreground'>
          <p>&copy; 2026 Holiday Hub. Never miss a celebration.</p>
        </div>
      </footer>
    </div>
  );
}
