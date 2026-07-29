import { useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import type { DayEntry } from '../types';
import { formatColumnHeader } from '../lib/date';
import { useAppData } from '../context/AppDataContext';
import { HourRow } from './HourRow';
import { CurrentTimeLine } from './CurrentTimeLine';
import { GoalForm } from './GoalForm';
import { GoalBarChart } from './GoalBarChart';

interface DayColumnProps {
  date: Date;
  isoDate: string;
  isToday: boolean;
  isPast: boolean;
  entries: DayEntry[];
}

const HOURS = Array.from({ length: 24 }, (_, i) => i);
const DEFAULT_VISIBLE_HOUR = 7;

export function DayColumn({ date, isoDate, isToday, isPast, entries }: DayColumnProps) {
  const { getFoodItem, getGoalForDate, setGoalFromDate } = useAppData();

  const goal = getGoalForDate(isoDate);
  const [goalFormOpen, setGoalFormOpen] = useState(false);
  const [anchor, setAnchor] = useState<{ left: number; bottom: number } | null>(null);
  const goalLinkRef = useRef<HTMLButtonElement | null>(null);

  const scrollRef = useRef<HTMLDivElement | null>(null);
  const hourRefs = useRef<Record<number, HTMLDivElement | null>>({});

  useLayoutEffect(() => {
    const scrollEl = scrollRef.current;
    const targetEl = hourRefs.current[DEFAULT_VISIBLE_HOUR];
    if (scrollEl && targetEl) {
      scrollEl.scrollTop = targetEl.offsetTop;
    }
  }, [isoDate]);

  const totals = entries.reduce(
    (acc, entry) => {
      const food = getFoodItem(entry.foodItemId);
      if (!food) return acc;
      acc.calories += food.calories;
      acc.protein += food.protein;
      acc.fat += food.fat;
      acc.carbs += food.carbs;
      return acc;
    },
    { calories: 0, protein: 0, fat: 0, carbs: 0 },
  );

  function openGoalForm() {
    if (goalLinkRef.current) {
      const rect = goalLinkRef.current.getBoundingClientRect();
      const left = Math.min(rect.left, window.innerWidth - 240);
      setAnchor({ left: Math.max(8, left), bottom: window.innerHeight - rect.top + 8 });
    }
    setGoalFormOpen(true);
  }

  return (
    <div
      className={`flex min-w-0 flex-1 flex-col border-r border-neutral-200 last:border-r-0 ${
        isToday ? 'bg-accent-light/60' : isPast ? 'bg-neutral-50' : 'bg-white'
      }`}
    >
      <div
        className={`shrink-0 border-b px-2 py-2 text-center ${
          isToday ? 'border-accent/30' : 'border-neutral-200'
        }`}
      >
        <div className={`text-sm font-semibold ${isToday ? 'text-accent' : 'text-neutral-700'}`}>
          {formatColumnHeader(date)}
        </div>
      </div>

      <div ref={scrollRef} className="relative flex-1 min-h-0 overflow-y-auto">
        {HOURS.map((hour) => (
          <HourRow
            key={hour}
            ref={(el) => {
              hourRefs.current[hour] = el;
            }}
            date={isoDate}
            hour={hour}
            entries={entries.filter((e) => e.hour === hour)}
          />
        ))}
        {isToday && <CurrentTimeLine hourRefs={hourRefs} />}
      </div>

      <div className="shrink-0 border-t border-neutral-200 px-2 py-2 bg-neutral-50/80">
        <div className="text-sm font-semibold text-neutral-800 text-center">
          {Math.round(totals.calories)} cal
        </div>

        {goal && entries.length > 0 && (
          <div className="mt-2">
            <GoalBarChart totals={totals} goal={goal} />
          </div>
        )}

        <button
          ref={goalLinkRef}
          type="button"
          onClick={openGoalForm}
          className={`mt-1.5 w-full text-center text-[10px] font-medium hover:underline ${
            isPast ? 'text-neutral-400' : 'text-accent'
          }`}
        >
          {goal ? 'Edit goal' : 'Set goal'}
        </button>
      </div>

      {goalFormOpen &&
        anchor &&
        createPortal(
          <>
            <div className="fixed inset-0 z-30" onClick={() => setGoalFormOpen(false)} />
            <div style={{ left: anchor.left, bottom: anchor.bottom }} className="fixed z-40">
              <GoalForm
                initial={goal}
                onSubmit={(g) => setGoalFromDate(isoDate, g)}
                onClose={() => setGoalFormOpen(false)}
              />
            </div>
          </>,
          document.body,
        )}
    </div>
  );
}
