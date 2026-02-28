'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Calendar,
  ArrowLeft,
  Loader2,
  Globe,
  Bell,
  BellOff,
} from 'lucide-react';
import {
  isPushSupported,
  getNotificationPermission,
  subscribeToPush,
  unsubscribeFromPush,
  getCurrentSubscription,
} from '@/lib/pushNotifications';

export default function SettingsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [timezone, setTimezone] = useState('America/New_York');
  const [countryCode, setCountryCode] = useState('US');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [pushEnabled, setPushEnabled] = useState(false);
  const [pushSupported, setPushSupported] = useState(false);
  const [pushPermission, setPushPermission] =
    useState<NotificationPermission>('default');

  const timezones = [
    'America/New_York',
    'America/Chicago',
    'America/Denver',
    'America/Los_Angeles',
    'America/Phoenix',
    'America/Anchorage',
    'Pacific/Honolulu',
  ];

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  useEffect(() => {
    if (status === 'authenticated') {
      fetchUserSettings();
    }
  }, [status]);

  useEffect(() => {
    // Check push notification support
    setPushSupported(isPushSupported());
    setPushPermission(getNotificationPermission());

    // Check if user has an active subscription
    getCurrentSubscription().then((sub) => {
      setPushEnabled(!!sub);
    });
  }, []);

  const fetchUserSettings = async () => {
    try {
      const response = await fetch('/api/user');
      if (response.ok) {
        const data = await response.json();
        setTimezone(data.timezone);
        setCountryCode(data.countryCode);
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setMessage('');

    try {
      const response = await fetch('/api/user', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ timezone, countryCode }),
      });

      if (response.ok) {
        setMessage('Settings saved successfully!');
        setTimeout(() => setMessage(''), 3000);
      } else {
        setMessage('Failed to save settings');
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      setMessage('An error occurred');
    } finally {
      setIsSaving(false);
    }
  };

  const handleTogglePush = async () => {
    try {
      if (pushEnabled) {
        // Unsubscribe
        const success = await unsubscribeFromPush();
        if (success) {
          setPushEnabled(false);
          setMessage('Push notifications disabled');
          setTimeout(() => setMessage(''), 3000);
        }
      } else {
        // Subscribe
        const subscription = await subscribeToPush();
        if (subscription) {
          setPushEnabled(true);
          setPushPermission('granted');
          setMessage('Push notifications enabled!');
          setTimeout(() => setMessage(''), 3000);
        } else {
          setMessage('Failed to enable push notifications');
          setTimeout(() => setMessage(''), 3000);
        }
      }
    } catch (error) {
      console.error('Error toggling push:', error);
      setMessage('An error occurred');
      setTimeout(() => setMessage(''), 3000);
    }
  };

  if (status === 'loading' || isLoading) {
    return (
      <div className='min-h-screen bg-background flex items-center justify-center'>
        <Loader2 className='w-8 h-8 animate-spin text-primary' />
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-background'>
      <nav className='border-b border-border bg-card'>
        <div className='container mx-auto px-4 py-4'>
          <div className='flex items-center gap-4'>
            <Link
              href='/dashboard'
              className='p-2 rounded-lg hover:bg-secondary transition-colors'
              title='Back to dashboard'
            >
              <ArrowLeft className='w-5 h-5 text-foreground' />
            </Link>
            <div className='flex items-center gap-2'>
              <Calendar className='w-8 h-8 text-primary' />
              <span className='text-2xl font-bold text-foreground'>
                Holiday Hub
              </span>
            </div>
          </div>
        </div>
      </nav>

      <main className='container mx-auto px-4 py-8 max-w-2xl'>
        <div className='mb-8'>
          <h1 className='text-3xl font-bold text-foreground mb-2'>Settings</h1>
          <p className='text-muted-foreground'>
            Manage your account preferences
          </p>
        </div>

        <div className='bg-card border border-border rounded-lg p-6'>
          <form onSubmit={handleSubmit} className='space-y-6'>
            {message && (
              <div
                className={`rounded-lg p-4 text-sm ${
                  message.includes('success')
                    ? 'bg-green-50 border border-green-200 text-green-800'
                    : 'bg-red-50 border border-red-200 text-red-800'
                }`}
              >
                {message}
              </div>
            )}

            <div>
              <label
                htmlFor='email'
                className='block text-sm font-medium text-foreground mb-2'
              >
                Email Address
              </label>
              <input
                id='email'
                type='email'
                value={session?.user?.email || ''}
                disabled
                className='w-full px-4 py-3 bg-muted border border-border rounded-lg text-muted-foreground'
              />
              <p className='text-xs text-muted-foreground mt-1'>
                Email cannot be changed
              </p>
            </div>

            <div>
              <label
                htmlFor='timezone'
                className='block text-sm font-medium text-foreground mb-2'
              >
                Your Timezone
              </label>
              <div className='relative'>
                <Globe className='absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground' />
                <select
                  id='timezone'
                  value={timezone}
                  onChange={(e) => setTimezone(e.target.value)}
                  className='w-full pl-10 pr-4 py-3 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary appearance-none text-foreground hover:text-primary'
                >
                  {timezones.map((tz) => (
                    <option key={tz} value={tz}>
                      {tz.replace(/_/g, ' ')}
                    </option>
                  ))}
                </select>
              </div>
              <p className='text-xs text-muted-foreground mt-1'>
                Notifications will be sent based on this timezone
              </p>
            </div>

            <div>
              <label
                htmlFor='countryCode'
                className='block text-sm font-medium text-foreground mb-2'
              >
                Country
              </label>
              <select
                id='countryCode'
                value={countryCode}
                onChange={(e) => setCountryCode(e.target.value)}
                className='w-full px-4 py-3 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary appearance-none text-foreground'
              >
                <option value='US'>United States</option>
              </select>
              <p className='text-xs text-muted-foreground mt-1'>
                Determines which holidays are available
              </p>
            </div>

            <div className='pt-4 border-t border-border'>
              <div className='flex items-center justify-between mb-4'>
                <div>
                  <h3 className='text-sm font-medium text-foreground flex items-center gap-2'>
                    {pushEnabled ? (
                      <Bell className='w-4 h-4 text-primary' />
                    ) : (
                      <BellOff className='w-4 h-4 text-muted-foreground' />
                    )}
                    Push Notifications
                  </h3>
                  <p className='text-xs text-muted-foreground mt-1'>
                    {pushSupported
                      ? 'Receive browser notifications for holiday reminders'
                      : 'Push notifications are not supported in this browser'}
                  </p>
                </div>
                <button
                  type='button'
                  onClick={handleTogglePush}
                  disabled={!pushSupported}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    pushEnabled
                      ? 'bg-red-500 text-white hover:bg-red-600'
                      : 'bg-primary text-primary-foreground hover:bg-primary/90'
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  {pushEnabled ? 'Disable' : 'Enable'}
                </button>
              </div>
              {pushPermission === 'denied' && (
                <div className='bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-sm text-yellow-800'>
                  ⚠️ Notifications are blocked. Please enable them in your
                  browser settings.
                </div>
              )}
              {pushEnabled && (
                <div className='bg-green-50 border border-green-200 rounded-lg p-3 text-sm text-green-800'>
                  ✓ Push notifications are active. You'll receive browser
                  notifications for enabled holidays.
                </div>
              )}
            </div>

            <div className='flex items-center gap-4 pt-4'>
              <button
                type='submit'
                disabled={isSaving}
                className='px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
              >
                {isSaving ? 'Saving...' : 'Save Changes'}
              </button>
              <Link
                href='/dashboard'
                className='px-6 py-3 bg-secondary text-secondary-foreground rounded-lg font-medium hover:bg-secondary/80 transition-colors'
              >
                Cancel
              </Link>
            </div>
          </form>
        </div>

        <div className='mt-8 bg-card border border-border rounded-lg p-6'>
          <h2 className='text-lg font-semibold text-foreground mb-4'>
            About Holiday Hub
          </h2>
          <div className='space-y-2 text-sm text-muted-foreground'>
            <p>
              Holiday Hub sends you reminders for your favorite holidays via
              email and browser push notifications.
            </p>
            <p>
              All notifications are sent based on your timezone at the time you
              configure for each holiday.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
