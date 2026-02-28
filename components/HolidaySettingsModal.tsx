'use client';

import { useState } from 'react';
import { X } from 'lucide-react';

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

interface HolidaySettingsModalProps {
  holiday: Holiday;
  onClose: () => void;
  onSave: (settings: {
    enabled: boolean;
    reminderOffsets: number[];
    reminderTime: string;
    deliveryMethod: string;
  }) => Promise<void>;
}

export default function HolidaySettingsModal({
  holiday,
  onClose,
  onSave,
}: HolidaySettingsModalProps) {
  const [enabled, setEnabled] = useState(holiday.enabled);
  const [reminderOffsets, setReminderOffsets] = useState<number[]>(
    holiday.reminderOffsets.length > 0 ? holiday.reminderOffsets : [1],
  );
  const [reminderTime, setReminderTime] = useState(holiday.reminderTime);
  const [deliveryMethod, setDeliveryMethod] = useState(holiday.deliveryMethod);
  const [isSaving, setIsSaving] = useState(false);

  const availableOffsets = [
    { value: 0, label: 'Day of' },
    { value: 1, label: '1 day before' },
    { value: 3, label: '3 days before' },
    { value: 7, label: '1 week before' },
    { value: 14, label: '2 weeks before' },
    { value: 30, label: '1 month before' },
  ];

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
        deliveryMethod,
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
                Enable Notifications
              </h3>
              <p className='text-sm text-muted-foreground'>
                Receive reminders for this holiday
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
                <div className='space-y-2'>
                  {availableOffsets.map((offset) => (
                    <label
                      key={offset.value}
                      className='flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-secondary cursor-pointer transition-colors'
                    >
                      <input
                        type='checkbox'
                        checked={reminderOffsets.includes(offset.value)}
                        onChange={() => toggleOffset(offset.value)}
                        className='w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary'
                      />
                      <span className='text-sm text-foreground'>
                        {offset.label}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Time of Day */}
              <div>
                <h3 className='font-medium text-foreground mb-3'>
                  Time of Day
                </h3>
                <div className='relative'>
                  <input
                    type='time'
                    value={reminderTime}
                    onChange={(e) => setReminderTime(e.target.value)}
                    className='w-full px-4 py-3 bg-card border-2 border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary text-foreground text-base font-medium hover:border-primary/50 transition-all cursor-pointer'
                    style={{
                      colorScheme: 'dark',
                      WebkitAppearance: 'none',
                      MozAppearance: 'textfield',
                    }}
                  />
                  <div className='absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground'>
                    <svg
                      className='w-5 h-5'
                      fill='none'
                      stroke='currentColor'
                      viewBox='0 0 24 24'
                    >
                      <path
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        strokeWidth={2}
                        d='M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z'
                      />
                    </svg>
                  </div>
                </div>
                <p className='text-xs text-muted-foreground mt-2'>
                  Click to select the time for daily reminders
                </p>
              </div>

              {/* Delivery Method */}
              <div>
                <h3 className='font-medium text-foreground mb-3'>
                  Delivery Method
                </h3>
                <div className='space-y-2'>
                  <label className='flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-secondary cursor-pointer transition-colors'>
                    <input
                      type='radio'
                      name='deliveryMethod'
                      value='email'
                      checked={deliveryMethod === 'email'}
                      onChange={(e) => setDeliveryMethod(e.target.value)}
                      className='w-4 h-4 text-primary border-gray-300 focus:ring-primary'
                    />
                    <div>
                      <div className='text-sm font-medium text-foreground'>
                        Email
                      </div>
                      <div className='text-xs text-muted-foreground'>
                        Receive reminders via email
                      </div>
                    </div>
                  </label>
                  <label className='flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-secondary cursor-pointer transition-colors'>
                    <input
                      type='radio'
                      name='deliveryMethod'
                      value='push'
                      checked={deliveryMethod === 'push'}
                      onChange={(e) => setDeliveryMethod(e.target.value)}
                      className='w-4 h-4 text-primary border-gray-300 focus:ring-primary'
                    />
                    <div>
                      <div className='text-sm font-medium text-foreground'>
                        Push
                      </div>
                      <div className='text-xs text-muted-foreground'>
                        Receive browser notifications
                      </div>
                    </div>
                  </label>
                  <label className='flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-secondary cursor-pointer transition-colors'>
                    <input
                      type='radio'
                      name='deliveryMethod'
                      value='both'
                      checked={deliveryMethod === 'both'}
                      onChange={(e) => setDeliveryMethod(e.target.value)}
                      className='w-4 h-4 text-primary border-gray-300 focus:ring-primary'
                    />
                    <div>
                      <div className='text-sm font-medium text-foreground'>
                        Both
                      </div>
                      <div className='text-xs text-muted-foreground'>
                        Email and push notifications
                      </div>
                    </div>
                  </label>
                </div>
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
