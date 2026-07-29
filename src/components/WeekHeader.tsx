import { useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { formatDateRange } from '../lib/date';
import { useAppData } from '../context/AppDataContext';
import { AccountMenu } from './auth/AccountMenu';
import { DarkModeToggle } from './DarkModeToggle';
import { EatingWindowForm } from './EatingWindowForm';

interface WeekHeaderProps {
  dates: Date[];
  onPrev: () => void;
  onNext: () => void;
  onToday: () => void;
}

export function WeekHeader({ dates, onPrev, onNext, onToday }: WeekHeaderProps) {
  const { eatingWindow, setEatingWindow } = useAppData();
  const [formOpen, setFormOpen] = useState(false);
  const [anchor, setAnchor] = useState<{ left: number; top: number } | null>(null);
  const eatingWindowButtonRef = useRef<HTMLButtonElement | null>(null);

  function openForm() {
    if (eatingWindowButtonRef.current) {
      const rect = eatingWindowButtonRef.current.getBoundingClientRect();
      setAnchor({ left: rect.left, top: rect.bottom + 8 });
    }
    setFormOpen(true);
  }

  return (
    <div className="flex shrink-0 items-center justify-between gap-2 border-b border-neutral-200 bg-white px-2 py-2 sm:px-4 sm:py-2.5 dark:border-neutral-800 dark:bg-black">
      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={onPrev}
          aria-label="Previous"
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-neutral-500 hover:bg-neutral-100 hover:text-neutral-800 transition-colors dark:text-neutral-200 dark:hover:bg-neutral-800 dark:hover:text-white"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M10 3L5 8L10 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <button
          type="button"
          onClick={onNext}
          aria-label="Next"
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-neutral-500 hover:bg-neutral-100 hover:text-neutral-800 transition-colors dark:text-neutral-200 dark:hover:bg-neutral-800 dark:hover:text-white"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M6 3L11 8L6 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <button
          type="button"
          onClick={onToday}
          className="ml-1 shrink-0 rounded-md border border-neutral-200 px-2.5 py-1.5 text-sm font-medium text-neutral-600 hover:bg-neutral-50 hover:text-accent transition-colors sm:ml-2 sm:px-3 dark:border-neutral-700 dark:text-white dark:hover:bg-neutral-800"
        >
          Today
        </button>
        <button
          ref={eatingWindowButtonRef}
          type="button"
          onClick={openForm}
          className="ml-1 shrink-0 text-xs text-neutral-400 hover:text-neutral-600 hover:underline transition-colors dark:text-neutral-500 dark:hover:text-neutral-300"
        >
          Edit eating window
        </button>
      </div>
      <div className="truncate text-right text-xs font-medium text-neutral-500 sm:text-sm dark:text-white">
        {formatDateRange(dates[0], dates[dates.length - 1])}
      </div>
      <div className="flex w-32 shrink-0 items-center justify-end gap-1">
        <DarkModeToggle />
        <AccountMenu />
      </div>

      {formOpen &&
        anchor &&
        createPortal(
          <>
            <div className="fixed inset-0 z-30" onClick={() => setFormOpen(false)} />
            <div style={{ left: anchor.left, top: anchor.top }} className="fixed z-40">
              <EatingWindowForm
                initial={eatingWindow}
                onSubmit={setEatingWindow}
                onClose={() => setFormOpen(false)}
              />
            </div>
          </>,
          document.body,
        )}
    </div>
  );
}
