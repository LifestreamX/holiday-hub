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
  const [viewCountry, setViewCountry] = useState<string | null>(null);
  const [availableCountries, setAvailableCountries] = useState<
    {
      countryCode: string;
      name: string;
      count: number;
    }[]
  >([]);

  const totalCountryHolidays = useMemo(() => {
    return availableCountries.reduce((sum, c) => sum + (c.count || 0), 0);
  }, [availableCountries]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    console.log('[Dashboard] Session status:', status);
    if (status === 'unauthenticated') {
      console.log('[Dashboard] User not authenticated, redirecting to login');
      router.push('/login');
    }
  }, [status, router]);

  useEffect(() => {
    if (status === 'authenticated') {
      console.log('[Dashboard] User authenticated, fetching holidays');
      // initialize view country from session or default and fetch list of countries
      const defaultCountry = (session?.user as any)?.countryCode || 'US';
      setViewCountry(defaultCountry);
      fetchCountries();
      fetchHolidays(defaultCountry);
    } else {
      console.log('[Dashboard] Status not authenticated yet:', status);
    }
  }, [status]);

  const fetchHolidays = async (countryArg?: string) => {
    try {
      console.log('[Dashboard] Fetching holidays...');
      const target =
        countryArg ||
        viewCountry ||
        (session?.user as any)?.countryCode ||
        'US';
      // Support 'ALL' to mean no country filter (show every holiday)
      const params =
        target && target !== 'ALL'
          ? `?country=${encodeURIComponent(target)}`
          : '';
      const response = await fetch(`/api/holidays${params}`);
      console.log('[Dashboard] Response status:', response.status);

      if (response.ok) {
        const data = await response.json();
        console.log('[Dashboard] Received holidays:', data.length);
        setHolidays(data);
        setErrorMessage(null);
      } else {
        const body = await response.text().catch(() => '');
        console.error(
          '[Dashboard] Failed to fetch holidays:',
          response.status,
          response.statusText,
          body,
        );
        setErrorMessage(
          'Failed to load holidays. Please refresh or try again later.',
        );
        setHolidays([]);
      }
    } catch (error) {
      console.error('[Dashboard] Error fetching holidays:', error);
      setErrorMessage(
        'Network error while loading holidays. Check your connection.',
      );
      setHolidays([]);
    } finally {
      console.log('[Dashboard] Finished loading');
      setIsLoading(false);
    }
  };

  const fetchCountries = async () => {
    try {
      const res = await fetch('/api/holidays/countries');
      if (res.ok) {
        const data = await res.json();
        setAvailableCountries(data);
      }
    } catch (err) {
      console.error('Failed to load countries', err);
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

  // Filter and group holidays - MUST be before any early returns
  const upcomingHolidays = useMemo(() => {
    return holidays.filter((h) => h.daysUntil !== null && h.daysUntil >= 0);
  }, [holidays]);

  const enabledHolidays = useMemo(() => {
    return holidays.filter((h) => h.enabled);
  }, [holidays]);

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
    // Sort holidays within each category by daysUntil (closest first)
    groups.forEach((holidays) => {
      holidays.sort((a, b) => {
        if (a.daysUntil === null) return 1;
        if (b.daysUntil === null) return -1;
        return a.daysUntil - b.daysUntil;
      });
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
          {errorMessage && (
            <div className='mb-4 p-3 rounded border border-red-300 bg-red-50 text-red-700'>
              {errorMessage}
            </div>
          )}
          <h1 className='text-3xl font-bold text-foreground mb-2'>
            Your Holidays
          </h1>
          <p className='text-muted-foreground'>
            Showing {upcomingHolidays.length} holidays for{' '}
            <strong>
              {viewCountry === 'ALL'
                ? 'All countries'
                : availableCountries.find((c) => c.countryCode === viewCountry)
                    ?.name ||
                  viewCountry ||
                  'US'}
            </strong>{' '}
            • {enabledHolidays.length} active notifications
          </p>
          {enabledHolidays.length === 0 && (
            <div className='mt-3'>
              <button
                onClick={async () => {
                  try {
                    setIsLoading(true);
                    const res = await fetch('/api/preferences/enable-all', {
                      method: 'POST',
                    });
                    if (res.ok) {
                      await fetchHolidays();
                    } else {
                      console.error('Failed to enable all preferences');
                    }
                  } finally {
                    setIsLoading(false);
                  }
                }}
                className='mt-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors'
              >
                Enable notifications for all{' '}
                {availableCountries.find((c) => c.countryCode === viewCountry)
                  ?.name || viewCountry}
              </button>
            </div>
          )}
        </div>

        {/* Search and Filters */}
        <div className='mb-6 space-y-4'>
          {/* Search Bar + Country Selector */}
          <div className='flex items-center gap-4'>
            <div className='relative flex-1'>
              <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground' />
              <input
                type='text'
                placeholder='Search holidays...'
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className='w-full pl-10 pr-4 py-2 bg-card border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary'
              />
            </div>
            <div>
              <select
                value={viewCountry || 'US'}
                onChange={(e) => {
                  const v = e.target.value;
                  setViewCountry(v === 'ALL' ? 'ALL' : v);
                  setIsLoading(true);
                  fetchHolidays(v === 'ALL' ? 'ALL' : v);
                }}
                className='px-4 py-2 rounded-xl bg-card border border-border text-sm font-semibold'
                title='Select country to view holidays'
              >
                {availableCountries.length === 0 ? (
                  <option value=''>Loading…</option>
                ) : (
                  <>
                    <option value='ALL'>
                      All countries ({totalCountryHolidays})
                    </option>
                    {availableCountries.map((c) => (
                      <option key={c.countryCode} value={c.countryCode}>
                        {c.name} ({c.countryCode})
                      </option>
                    ))}
                  </>
                )}
              </select>
            </div>
          </div>

          {/* Category Filter */}
          <div className='flex items-center gap-3 overflow-x-auto pb-2 category-scrollbar'>
            <Filter className='w-5 h-5 text-primary flex-shrink-0' />
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-5 py-2.5 rounded-xl text-sm font-semibold whitespace-nowrap transition-all duration-200 shadow-sm ${
                selectedCategory === 'all'
                  ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg shadow-blue-500/30 scale-105'
                  : 'bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 text-gray-700 dark:text-gray-200 hover:shadow-md hover:scale-102 border border-gray-300 dark:border-gray-600'
              }`}
            >
              🎉 All ({upcomingHolidays.length})
            </button>
            {categories.map(({ category, count }) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-5 py-2.5 rounded-xl text-sm font-semibold whitespace-nowrap transition-all duration-200 shadow-sm ${
                  selectedCategory === category
                    ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg shadow-blue-500/30 scale-105'
                    : 'bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 text-gray-700 dark:text-gray-200 hover:shadow-md hover:scale-102 border border-gray-300 dark:border-gray-600'
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
