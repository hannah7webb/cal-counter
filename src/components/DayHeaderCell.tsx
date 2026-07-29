import { formatColumnHeader } from '../lib/date';

interface DayHeaderCellProps {
  date: Date;
  isToday: boolean;
  isPast: boolean;
}

export function DayHeaderCell({ date, isToday, isPast }: DayHeaderCellProps) {
  return (
    <div
      className={`min-w-0 flex-1 border-r border-b px-2 py-2 text-center last:border-r-0 ${
        isToday
          ? 'border-accent/30 bg-accent-light/60'
          : `border-neutral-200 ${isPast ? 'bg-neutral-50' : 'bg-white'}`
      }`}
    >
      <div className={`text-sm font-semibold ${isToday ? 'text-accent' : 'text-neutral-700'}`}>
        {formatColumnHeader(date)}
      </div>
    </div>
  );
}
