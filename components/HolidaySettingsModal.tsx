'use client';

import { useState, useEffect } from 'react';
import TimeSelect from '@/components/TimeSelect';
import { X } from 'lucide-react';

import type { Holiday } from '../types/holiday';

interface HolidaySettingsModalProps {
  holiday: Holiday;
  onClose: () => void;
  onSave: (settings: {
    enabled: boolean;
    reminderOffsets: number[];
    reminderTime: string;
  }) => Promise<void>;
}

export default function HolidaySettingsModal({
  holiday,
  onClose,
  onSave,
}: HolidaySettingsModalProps) {
  // Prevent background scroll when modal is open
  useEffect(() => {
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, []);

  const [enabled, setEnabled] = useState(holiday.enabled);
  const [reminderOffsets, setReminderOffsets] = useState<number[]>(
    holiday.reminderOffsets.length > 0 ? holiday.reminderOffsets : [0],
  );
  const [reminderTime, setReminderTime] = useState(holiday.reminderTime);
  const [isSaving, setIsSaving] = useState(false);

  // Simplified to most practical reminder options
  const availableOffsets = [
    { value: 0, label: 'Day of', icon: '📅' },
    { value: 1, label: '1 day before', icon: '⏰' },
    { value: 7, label: '1 week before', icon: '📆' },
    { value: 30, label: '1 month before', icon: '🗓️' },
  ];

  // 15-minute increments for all 24 hours
  const timeOptions = [];
  for (let hour = 0; hour < 24; hour++) {
    for (let min = 0; min < 60; min += 15) {
      const value = `${hour.toString().padStart(2, '0')}:${min.toString().padStart(2, '0')}`;
      let displayHour = hour % 12 === 0 ? 12 : hour % 12;
      const ampm = hour < 12 ? 'AM' : 'PM';
      const label = `${displayHour}:${min.toString().padStart(2, '0')} ${ampm}`;
      timeOptions.push({ value, label });
    }
  }

  const toggleOffset = (offset: number) => {
    if (reminderOffsets.includes(offset)) {
      setReminderOffsets(reminderOffsets.filter((o) => o !== offset));
    } else {
      setReminderOffsets([...reminderOffsets, offset].sort((a, b) => b - a));
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onSave({
        enabled,
        reminderOffsets,
        reminderTime,
      });
      onClose();
    } catch (error) {
      console.error('Error saving settings:', error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className='fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4'>
      <div className='bg-card rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto'>
        <div className='flex items-center justify-between p-6 border-b border-border'>
          <h2 className='text-xl font-semibold text-foreground'>
            {holiday.name}
          </h2>
          <button
            onClick={onClose}
            className='p-1 rounded-lg hover:bg-secondary transition-colors'
          >
            <X className='w-5 h-5' />
          </button>
        </div>

        <div className='p-6 space-y-6'>
          {/* Enable/Disable */}
          <div className='flex items-center justify-between'>
            <div>
              <h3 className='font-medium text-foreground'>
                Enable Email Notifications
              </h3>
              <p className='text-sm text-muted-foreground'>
                Receive email reminders for this holiday
              </p>
            </div>
            <label className='relative inline-flex items-center cursor-pointer'>
              <input
                type='checkbox'
                className='sr-only peer'
                checked={enabled}
                onChange={(e) => setEnabled(e.target.checked)}
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 dark:peer-focus:ring-primary/40 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary"></div>
            </label>
          </div>

          {enabled && (
            <>
              {/* Reminder Timing */}
              <div>
                <h3 className='font-medium text-foreground mb-3'>
                  When to Remind
                </h3>
                <div className='grid grid-cols-2 gap-2'>
                  {availableOffsets.map((offset) => {
                    const isDisabled =
                      holiday.daysUntil !== null &&
                      offset.value > holiday.daysUntil;
                    return (
                      <button
                        key={offset.value}
                        type='button'
                        disabled={isDisabled}
                        onClick={() => toggleOffset(offset.value)}
                        className={`flex items-center justify-center gap-2 p-3 rounded-lg border-2 transition-all ${
                          reminderOffsets.includes(offset.value)
                            ? 'border-primary bg-primary/10 text-primary font-semibold'
                            : isDisabled
                              ? 'border-muted bg-secondary text-muted-foreground opacity-50 cursor-not-allowed'
                              : 'border-border hover:border-primary/50 hover:bg-secondary/50 text-foreground'
                        }`}
                      >
                        <span className='text-lg'>{offset.icon}</span>
                        <div className='flex flex-col items-center'>
                          <span className='text-sm leading-tight'>
                            {offset.label}
                          </span>
                          {isDisabled && (
                            <span className='text-[10px] font-normal'>
                              Too late
                            </span>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
                <p className='text-xs text-muted-foreground mt-2'>
                  Select one or more reminder times
                </p>
              </div>

              {/* Time of Day */}
              <div>
                <h3 className='font-medium text-foreground mb-3'>
                  Time of Day
                </h3>
                <p className='text-xs text-muted-foreground mb-2'>
                  Reminders will be sent to your email address.
                </p>
                <div>
                  <TimeSelect
                    value={reminderTime}
                    onChange={setReminderTime}
                    options={timeOptions}
                  />
                </div>
                <p className='text-xs text-muted-foreground mt-2'>
                  Reminders will be sent at this time
                </p>
              </div>
            </>
          )}
        </div>

        <div className='flex items-center gap-3 p-6 border-t border-border'>
          <button
            onClick={onClose}
            className='flex-1 px-4 py-2 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/80 transition-colors'
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving || (enabled && reminderOffsets.length === 0)}
            className='flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
          >
            {isSaving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  );
}
