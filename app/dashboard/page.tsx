'use client';

import { useState, useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Calendar, LogOut, Settings, Loader2 } from 'lucide-react';
import HolidayCard from '@/components/HolidayCard';
import HolidaySettingsModal from '@/components/HolidaySettingsModal';

interface Holiday {
  id: string;
  name: string;
  description: string;
  category: string;
  date: string | null;
  daysUntil: number | null;
  enabled: boolean;
  reminderOffsets: number[];
  reminderTime: string;
  deliveryMethod: string;
  hasPreference: boolean;
}

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [holidays, setHolidays] = useState<Holiday[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedHoliday, setSelectedHoliday] = useState<Holiday | null>(null);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  useEffect(() => {
    if (status === 'authenticated') {
      fetchHolidays();
    }
  }, [status]);

  const fetchHolidays = async () => {
    try {
      const response = await fetch('/api/holidays');
      if (response.ok) {
        const data = await response.json();
        setHolidays(data);
      }
    } catch (error) {
      console.error('Error fetching holidays:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggle = async (holidayId: string, enabled: boolean) => {
    const holiday = holidays.find((h) => h.id === holidayId);
    if (!holiday) return;

    try {
      const response = await fetch('/api/preferences', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          holidayId,
          enabled,
          reminderOffsets:
            holiday.reminderOffsets.length > 0 ? holiday.reminderOffsets : [1],
          reminderTime: holiday.reminderTime || '08:00',
          deliveryMethod: holiday.deliveryMethod || 'email',
        }),
      });

      if (response.ok) {
        setHolidays(
          holidays.map((h) =>
            h.id === holidayId ? { ...h, enabled, hasPreference: true } : h,
          ),
        );
      }
    } catch (error) {
      console.error('Error updating preference:', error);
    }
  };

  const handleSaveSettings = async (settings: {
    enabled: boolean;
    reminderOffsets: number[];
    reminderTime: string;
    deliveryMethod: string;
  }) => {
    if (!selectedHoliday) return;

    try {
      const response = await fetch('/api/preferences', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          holidayId: selectedHoliday.id,
          ...settings,
        }),
      });

      if (response.ok) {
        setHolidays(
          holidays.map((h) =>
            h.id === selectedHoliday.id
              ? { ...h, ...settings, hasPreference: true }
              : h,
          ),
        );
        setSelectedHoliday(null);
      }
    } catch (error) {
      console.error('Error saving settings:', error);
    }
  };

  if (status === 'loading' || isLoading) {
    return (
      <div className='min-h-screen bg-background flex items-center justify-center'>
        <Loader2 className='w-8 h-8 animate-spin text-primary' />
      </div>
    );
  }

  const upcomingHolidays = holidays.filter(
    (h) => h.daysUntil !== null && h.daysUntil >= 0,
  );
  const enabledHolidays = holidays.filter((h) => h.enabled);

  return (
    <div className='min-h-screen bg-background'>
      <nav className='border-b border-border bg-card'>
        <div className='container mx-auto px-4 py-4'>
          <div className='flex items-center justify-between'>
            <div className='flex items-center gap-2'>
              <Calendar className='w-8 h-8 text-primary' />
              <span className='text-2xl font-bold text-foreground'>
                Holiday Hub
              </span>
            </div>
            <div className='flex items-center gap-4'>
              <span className='text-sm text-muted-foreground'>
                {session?.user?.email}
              </span>
              <Link
                href='/settings'
                className='p-2 rounded-lg hover:bg-secondary transition-colors'
                title='Settings'
              >
                <Settings className='w-5 h-5 text-foreground' />
              </Link>
              <button
                onClick={() => signOut({ callbackUrl: '/' })}
                className='p-2 rounded-lg hover:bg-secondary transition-colors'
                title='Sign out'
              >
                <LogOut className='w-5 h-5 text-foreground' />
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className='container mx-auto px-4 py-8'>
        <div className='mb-8'>
          <h1 className='text-3xl font-bold text-foreground mb-2'>
            Your Holidays
          </h1>
          <p className='text-muted-foreground'>
            You have {enabledHolidays.length} active notifications
          </p>
        </div>

        {upcomingHolidays.length === 0 ? (
          <div className='text-center py-12'>
            <Calendar className='w-16 h-16 mx-auto mb-4 text-muted-foreground' />
            <h2 className='text-xl font-semibold text-foreground mb-2'>
              No holidays loaded
            </h2>
            <p className='text-muted-foreground'>
              Check back later or refresh the page.
            </p>
          </div>
        ) : (
          <div className='grid gap-6 md:grid-cols-2 lg:grid-cols-3'>
            {upcomingHolidays.map((holiday) => (
              <HolidayCard
                key={holiday.id}
                holiday={holiday}
                onToggle={handleToggle}
                onSettings={setSelectedHoliday}
              />
            ))}
          </div>
        )}
      </main>

      {selectedHoliday && (
        <HolidaySettingsModal
          holiday={selectedHoliday}
          onClose={() => setSelectedHoliday(null)}
          onSave={handleSaveSettings}
        />
      )}
    </div>
  );
}
