import { formatDateRange } from '../lib/date';

interface WeekHeaderProps {
  dates: Date[];
  onPrev: () => void;
  onNext: () => void;
  onToday: () => void;
}

export function WeekHeader({ dates, onPrev, onNext, onToday }: WeekHeaderProps) {
  return (
    <div className="flex shrink-0 items-center justify-between gap-2 border-b border-neutral-200 bg-white px-2 py-2 sm:px-4 sm:py-2.5">
      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={onPrev}
          aria-label="Previous"
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-neutral-500 hover:bg-neutral-100 hover:text-neutral-800 transition-colors"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M10 3L5 8L10 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <button
          type="button"
          onClick={onNext}
          aria-label="Next"
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-neutral-500 hover:bg-neutral-100 hover:text-neutral-800 transition-colors"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M6 3L11 8L6 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <button
          type="button"
          onClick={onToday}
          className="ml-1 shrink-0 rounded-md border border-neutral-200 px-2.5 py-1.5 text-sm font-medium text-neutral-600 hover:bg-neutral-50 hover:text-accent transition-colors sm:ml-2 sm:px-3"
        >
          Today
        </button>
      </div>
      <div className="truncate text-right text-xs font-medium text-neutral-500 sm:text-sm">
        {formatDateRange(dates[0], dates[dates.length - 1])}
      </div>
      <div className="hidden w-26 shrink-0 sm:block" aria-hidden />
    </div>
  );
}
