'use client';

import { useState } from 'react';
import { Calendar, Bell, Settings as SettingsIcon } from 'lucide-react';

interface Holiday {
  id: string;
  name: string;
  description: string;
  category: string;
  countryCode?: string;
  countryName?: string;
  date: string | null;
  daysUntil: number | null;
  enabled: boolean;
  reminderOffsets: number[];
  reminderTime: string;
  hasPreference: boolean;
}

interface HolidayCardProps {
  holiday: Holiday;
  onToggle: (holidayId: string, enabled: boolean) => Promise<void>;
  onSettings: (holiday: Holiday) => void;
}

export default function HolidayCard({
  holiday,
  onToggle,
  onSettings,
}: HolidayCardProps) {
  const [isToggling, setIsToggling] = useState(false);

  const handleToggle = async () => {
    setIsToggling(true);
    try {
      await onToggle(holiday.id, !holiday.enabled);
    } finally {
      setIsToggling(false);
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'federal':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'cultural':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      case 'religious':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'commercial':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const getDaysUntilText = () => {
    if (holiday.daysUntil === null) return 'Date unavailable';
    if (holiday.daysUntil === 0) return 'Today!';
    if (holiday.daysUntil === 1) return 'Tomorrow';
    return `${holiday.daysUntil} days`;
  };

  const formatDate = () => {
    if (!holiday.date) return '';
    const date = new Date(holiday.date);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div className='bg-card border border-border rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow'>
      <div className='flex items-start justify-between mb-4'>
        <div className='flex-1'>
          <div className='flex items-center gap-3 mb-2'>
            <h3 className='text-xl font-semibold text-foreground'>
              {holiday.name}
            </h3>
            <span
              className={`px-2 py-1 text-xs font-medium rounded-full ${getCategoryColor(
                holiday.category,
              )}`}
            >
              {holiday.category}
            </span>
            {holiday.countryName ? (
              <span className='ml-2 inline-flex items-center justify-center px-2 py-1 text-xs font-medium rounded-full text-center bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200'>
                {holiday.countryName}
              </span>
            ) : holiday.countryCode ? (
              <span className='ml-2 inline-flex items-center justify-center px-2 py-1 text-xs font-medium rounded-full text-center bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200'>
                {holiday.countryCode}
              </span>
            ) : null}
          </div>
          <p className='text-sm text-muted-foreground'>{holiday.description}</p>
        </div>
      </div>

      <div className='flex items-center gap-4 mb-4'>
        <div className='flex items-center gap-2 text-sm'>
          <Calendar className='w-4 h-4 text-primary' />
          <span className='text-muted-foreground'>{formatDate()}</span>
        </div>
      </div>

      <div className='flex items-center justify-between pt-4 border-t border-border'>
        <div className='flex items-center gap-4'>
          <div className='text-center'>
            <div className='text-2xl font-bold text-primary'>
              {getDaysUntilText()}
            </div>
            {holiday.daysUntil !== null && holiday.daysUntil > 1 && (
              <div className='text-xs text-muted-foreground'>until holiday</div>
            )}
          </div>

          {holiday.enabled && holiday.reminderOffsets.length > 0 && (
            <div className='flex items-center gap-2 text-sm text-muted-foreground'>
              <Bell className='w-4 h-4' />
              <span>{holiday.reminderOffsets.length} reminders</span>
            </div>
          )}
        </div>

        <div className='flex items-center gap-2'>
          <button
            onClick={() => onSettings(holiday)}
            className='p-2 rounded-lg hover:bg-secondary transition-colors'
            title='Settings'
          >
            <SettingsIcon className='w-5 h-5 text-muted-foreground' />
          </button>

          <label className='relative inline-flex items-center cursor-pointer'>
            <input
              type='checkbox'
              className='sr-only peer'
              checked={holiday.enabled}
              onChange={handleToggle}
              disabled={isToggling}
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 dark:peer-focus:ring-primary/40 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary"></div>
          </label>
        </div>
      </div>
    </div>
  );
}
