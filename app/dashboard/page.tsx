'use client';

import { useState, useEffect, useMemo } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Calendar,
  LogOut,
  Settings,
  Loader2,
  Search,
  Filter,
} from 'lucide-react';
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

const CATEGORY_LABELS: Record<string, string> = {
  federal: '🏛️ Federal Holidays',
  state: '🏛️ State Holidays',
  'religious-christian': '✝️ Christian',
  'religious-jewish': '✡️ Jewish',
  'religious-islamic': '☪️ Islamic',
  'religious-hindu': '🕉️ Hindu',
  'religious-buddhist': '☸️ Buddhist',
  'religious-sikh': '☬ Sikh',
  cultural: '🎭 Cultural',
  'cultural-sports': '🏈 Sports',
  'cultural-shopping': '🛍️ Shopping',
  heritage: '🌍 Heritage & Awareness',
  awareness: '💡 Awareness',
  professional: '💼 Professional',
  military: '🎖️ Military',
  patriotic: '🇺🇸 Patriotic',
  civic: '🏛️ Civic',
  seasonal: '🍂 Seasonal',
};

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [holidays, setHolidays] = useState<Holiday[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedHoliday, setSelectedHoliday] = useState<Holiday | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

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

  // Filter and group holidays
  const upcomingHolidays = holidays.filter(
    (h) => h.daysUntil !== null && h.daysUntil >= 0,
  );

  const enabledHolidays = holidays.filter((h) => h.enabled);

  // Get unique categories with counts
  const categories = useMemo(() => {
    const categoryMap = new Map<string, number>();
    upcomingHolidays.forEach((h) => {
      categoryMap.set(h.category, (categoryMap.get(h.category) || 0) + 1);
    });
    return Array.from(categoryMap.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([cat, count]) => ({ category: cat, count }));
  }, [upcomingHolidays]);

  // Filter holidays by category and search
  const filteredHolidays = useMemo(() => {
    let filtered = upcomingHolidays;

    // Category filter
    if (selectedCategory !== 'all') {
      filtered = filtered.filter((h) => h.category === selectedCategory);
    }

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (h) =>
          h.name.toLowerCase().includes(query) ||
          h.description.toLowerCase().includes(query),
      );
    }

    return filtered;
  }, [upcomingHolidays, selectedCategory, searchQuery]);

  // Group by category for display
  const groupedHolidays = useMemo(() => {
    const groups = new Map<string, Holiday[]>();
    filteredHolidays.forEach((holiday) => {
      const cat = holiday.category;
      if (!groups.has(cat)) {
        groups.set(cat, []);
      }
      groups.get(cat)!.push(holiday);
    });
    return Array.from(groups.entries()).sort((a, b) => {
      // Sort by category priority
      const priorityOrder = [
        'federal',
        'state',
        'religious-christian',
        'cultural',
      ];
      const aIndex = priorityOrder.indexOf(a[0]);
      const bIndex = priorityOrder.indexOf(b[0]);
      if (aIndex !== -1 && bIndex !== -1) return aIndex - bIndex;
      if (aIndex !== -1) return -1;
      if (bIndex !== -1) return 1;
      return a[0].localeCompare(b[0]);
    });
  }, [filteredHolidays]);

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
            {upcomingHolidays.length} total holidays • {enabledHolidays.length}{' '}
            active notifications
          </p>
        </div>

        {/* Search and Filters */}
        <div className='mb-6 space-y-4'>
          {/* Search Bar */}
          <div className='relative'>
            <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground' />
            <input
              type='text'
              placeholder='Search holidays...'
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className='w-full pl-10 pr-4 py-2 bg-card border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary'
            />
          </div>

          {/* Category Filter */}
          <div className='flex items-center gap-2 overflow-x-auto pb-2'>
            <Filter className='w-5 h-5 text-muted-foreground flex-shrink-0' />
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                selectedCategory === 'all'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-card text-foreground hover:bg-secondary border border-border'
              }`}
            >
              All ({upcomingHolidays.length})
            </button>
            {categories.map(({ category, count }) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                  selectedCategory === category
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-card text-foreground hover:bg-secondary border border-border'
                }`}
              >
                {CATEGORY_LABELS[category] || category} ({count})
              </button>
            ))}
          </div>
        </div>

        {/* Holiday Display */}
        {filteredHolidays.length === 0 ? (
          <div className='text-center py-12'>
            <Calendar className='w-16 h-16 mx-auto mb-4 text-muted-foreground' />
            <h2 className='text-xl font-semibold text-foreground mb-2'>
              {searchQuery || selectedCategory !== 'all'
                ? 'No holidays found'
                : 'No holidays loaded'}
            </h2>
            <p className='text-muted-foreground'>
              {searchQuery || selectedCategory !== 'all'
                ? 'Try adjusting your filters or search query.'
                : 'Check back later or refresh the page.'}
            </p>
            {(searchQuery || selectedCategory !== 'all') && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('all');
                }}
                className='mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors'
              >
                Clear Filters
              </button>
            )}
          </div>
        ) : (
          <div className='space-y-8'>
            {groupedHolidays.map(([category, categoryHolidays]) => (
              <div key={category}>
                <h2 className='text-xl font-bold text-foreground mb-4 flex items-center gap-2'>
                  <span>{CATEGORY_LABELS[category] || category}</span>
                  <span className='text-sm font-normal text-muted-foreground'>
                    ({categoryHolidays.length})
                  </span>
                </h2>
                <div className='grid gap-6 md:grid-cols-2 lg:grid-cols-3'>
                  {categoryHolidays.map((holiday) => (
                    <HolidayCard
                      key={holiday.id}
                      holiday={holiday}
                      onToggle={handleToggle}
                      onSettings={setSelectedHoliday}
                    />
                  ))}
                </div>
              </div>
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
