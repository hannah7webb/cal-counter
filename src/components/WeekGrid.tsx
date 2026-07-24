import type { DayEntry } from '../types';
import { getWeekDates, isSameDay, toISODate } from '../lib/date';
import { DayColumn } from './DayColumn';

interface WeekGridProps {
  weekStart: Date;
  dayEntries: DayEntry[];
}

export function WeekGrid({ weekStart, dayEntries }: WeekGridProps) {
  const dates = getWeekDates(weekStart);
  const today = new Date();
  const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());

  return (
    <div className="flex min-h-0 flex-1">
      {dates.map((date) => {
        const isoDate = toISODate(date);
        const entries = dayEntries
          .filter((e) => e.date === isoDate)
          .sort((a, b) => a.id.localeCompare(b.id));
        return (
          <DayColumn
            key={isoDate}
            date={date}
            isoDate={isoDate}
            isToday={isSameDay(date, today)}
            isPast={date < todayStart}
            entries={entries}
          />
        );
      })}
    </div>
  );
}
