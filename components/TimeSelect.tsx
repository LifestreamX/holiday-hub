'use client';

import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

interface TimeOption {
  value: string;
  label: string;
}

interface Props {
  value: string;
  onChange: (v: string) => void;
  options: TimeOption[];
}

export default function TimeSelect({ value, onChange, options }: Props) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement | null>(null);
  const buttonRef = useRef<HTMLButtonElement | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const [portalEl] = useState(() =>
    typeof document !== 'undefined' ? document.createElement('div') : null,
  );
  const [menuStyle, setMenuStyle] = useState<React.CSSProperties>({});

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (!open) return;
      const target = e.target as Node;
      if (buttonRef.current?.contains(target)) return;
      if (menuRef.current?.contains(target)) return;
      setOpen(false);
    }
    function onEsc(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false);
    }
    document.addEventListener('mousedown', onClickOutside);
    window.addEventListener('keydown', onEsc);
    return () => {
      document.removeEventListener('mousedown', onClickOutside);
      window.removeEventListener('keydown', onEsc);
    };
  }, [open]);

  // Ensure portal element is mounted to document.body
  useEffect(() => {
    if (!portalEl) return;
    document.body.appendChild(portalEl);
    return () => {
      if (portalEl.parentNode) portalEl.parentNode.removeChild(portalEl);
    };
  }, [portalEl]);

  // Position the portal menu to sit under the button and stay fixed to viewport
  useEffect(() => {
    if (!open) return;
    const update = () => {
      const rect = buttonRef.current?.getBoundingClientRect();
      if (!rect) return;
      const vw = window.innerWidth;
      const desiredWidth = Math.max(rect.width, 320);
      const maxWidth = Math.min(desiredWidth, vw - 16); // keep 8px margin each side

      // Default left position
      let left = rect.left;

      // If the menu would overflow the right edge, shift it left
      if (left + maxWidth > vw - 8) {
        left = Math.max(8, vw - maxWidth - 8);
      }

      // On very small screens, make the menu full-width minus horizontal padding
      if (vw < 480) {
        setMenuStyle({
          position: 'fixed',
          left: 8,
          top: rect.bottom + 4,
          width: vw - 16,
          zIndex: 100000,
        });
      } else {
        setMenuStyle({
          position: 'fixed',
          left,
          top: rect.bottom + 4,
          width: maxWidth,
          zIndex: 100000,
        });
      }
    };
    update();
    window.addEventListener('resize', update);
    window.addEventListener('scroll', update, true);
    return () => {
      window.removeEventListener('resize', update);
      window.removeEventListener('scroll', update, true);
    };
  }, [open]);

  const selectedLabel = options.find((o) => o.value === value)?.label || value;

  return (
    <div ref={rootRef} className='relative inline-block text-left w-full'>
      <button
        ref={buttonRef}
        type='button'
        onClick={() => setOpen((s) => !s)}
        className='w-full flex items-center justify-between px-4 py-3 bg-card border-2 border-border rounded-md text-left text-foreground font-medium hover:shadow-sm transition-shadow'
      >
        <span>{selectedLabel}</span>
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

      {open &&
        portalEl &&
        createPortal(
          <div
            ref={menuRef}
            style={menuStyle}
            className='bg-card rounded-md shadow-lg'
          >
            <div className='max-h-80 overflow-auto dropdown-scroll'>
              {options.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => {
                    onChange(opt.value);
                    setOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2 hover:bg-primary/10 hover:text-primary transition-colors ${opt.value === value ? 'bg-primary/10 text-primary font-semibold' : ''}`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>,
          portalEl,
        )}
    </div>
  );
}
