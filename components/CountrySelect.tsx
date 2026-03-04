'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';

interface Country {
  countryCode: string;
  name: string;
  count?: number;
}

interface Props {
  value: string | null;
  onChange: (v: string) => void;
  options: Country[];
}

export default function CountrySelect({ value, onChange, options }: Props) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');

  const rootRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    function onEsc(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false);
    }
    window.addEventListener('keydown', onEsc);
    return () => window.removeEventListener('keydown', onEsc);
  }, []);

  // Close when clicking outside the component
  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (!open) return;
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, [open]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return options;
    return options.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.countryCode.toLowerCase().includes(q),
    );
  }, [options, query]);

  const selectedLabel = useMemo(() => {
    if (!value) return 'Select country';
    if (value === 'ALL') return 'All countries';
    const found = options.find((o) => o.countryCode === value);
    return found ? `${found.name} (${found.countryCode})` : value;
  }, [value, options]);

  return (
    <div ref={rootRef} className='relative inline-block text-left'>
      <button
        type='button'
        onClick={() => setOpen((s) => !s)}
        className='flex items-center gap-2 px-4 py-2 rounded-md bg-card border border-border text-sm font-semibold shadow-sm hover:shadow-md transition-shadow'
        aria-haspopup
        aria-expanded={open}
      >
        <span className='truncate max-w-xs'>{selectedLabel}</span>
        <svg
          className='w-4 h-4 text-muted-foreground'
          viewBox='0 0 20 20'
          fill='currentColor'
          aria-hidden
        >
          <path
            fillRule='evenodd'
            d='M5.23 7.21a.75.75 0 011.06.02L10 11.293l3.71-4.06a.75.75 0 111.1 1.02l-4.25 4.65a.75.75 0 01-1.1 0L5.21 8.27a.75.75 0 01.02-1.06z'
            clipRule='evenodd'
          />
        </svg>
      </button>

      {open && (
        <div className='absolute z-50 mt-2 w-72 bg-card rounded-md shadow-lg'>
          <div className='p-2'>
            <input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder='Search countries...'
              className='w-full px-3 py-2 rounded-md bg-background border border-border text-sm'
            />
          </div>
          <div className='max-h-56 overflow-auto dropdown-scroll'>
            <button
              onClick={() => {
                onChange('ALL');
                setOpen(false);
              }}
              className='w-full text-left px-3 py-2 hover:bg-primary/10 hover:text-primary transition-colors rounded-md'
            >
              All countries
            </button>
            {filtered.map((c) => (
              <button
                key={c.countryCode}
                onClick={() => {
                  onChange(c.countryCode);
                  setOpen(false);
                }}
                className='w-full text-left px-3 py-2 hover:bg-primary/10 hover:text-primary transition-colors flex items-center justify-between rounded-md'
              >
                <span>{c.name}</span>
                <span className='text-xs text-muted-foreground'>
                  {c.countryCode}
                </span>
              </button>
            ))}
            {filtered.length === 0 && (
              <div className='px-3 py-2 text-sm text-muted-foreground'>
                No results
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
