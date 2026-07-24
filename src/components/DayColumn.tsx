import { useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useDroppable } from '@dnd-kit/core';
import type { DayEntry } from '../types';
import { formatColumnHeader } from '../lib/date';
import { useAppData } from '../context/AppDataContext';
import { DayEntryCard } from './DayEntryCard';
import { GoalForm } from './GoalForm';
import { GoalBarChart } from './GoalBarChart';

interface DayColumnProps {
  date: Date;
  isoDate: string;
  isToday: boolean;
  isPast: boolean;
  entries: DayEntry[];
}

export function DayColumn({ date, isoDate, isToday, isPast, entries }: DayColumnProps) {
  const { getFoodItem, goal, setGoal } = useAppData();
  const { setNodeRef, isOver } = useDroppable({
    id: `day-${isoDate}`,
    data: { date: isoDate },
  });

  const [goalFormOpen, setGoalFormOpen] = useState(false);
  const [anchor, setAnchor] = useState<{ left: number; bottom: number } | null>(null);
  const goalLinkRef = useRef<HTMLButtonElement | null>(null);

  const totals = entries.reduce(
    (acc, entry) => {
      const food = getFoodItem(entry.foodItemId);
      if (!food) return acc;
      acc.calories += food.calories * entry.servings;
      acc.protein += food.protein * entry.servings;
      acc.fat += food.fat * entry.servings;
      acc.carbs += food.carbs * entry.servings;
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

      <div
        ref={setNodeRef}
        className={`flex-1 min-h-0 overflow-y-auto px-2 py-2 space-y-1.5 transition-colors ${
          isOver ? 'bg-accent-light' : ''
        }`}
      >
        {entries.map((entry) => (
          <DayEntryCard key={entry.id} entry={entry} />
        ))}
      </div>

      <div className="shrink-0 border-t border-neutral-200 px-2 py-2 bg-neutral-50/80">
        <div className="text-sm font-semibold text-neutral-800 text-center">
          {Math.round(totals.calories)} cal
        </div>
        <div className="text-[11px] text-neutral-500 text-center mt-0.5">
          Protein {Math.round(totals.protein)}g &middot; Fat {Math.round(totals.fat)}g &middot;{' '}
          Carbs {Math.round(totals.carbs)}g
        </div>

        {goal && entries.length > 0 && (
          <div className="mt-2">
            <GoalBarChart totals={totals} goal={goal} />
          </div>
        )}

        {!isPast && (
          <button
            ref={goalLinkRef}
            type="button"
            onClick={openGoalForm}
            className="mt-1.5 w-full text-center text-[11px] font-medium text-accent hover:underline"
          >
            {goal ? 'Edit goal' : 'Set goal'}
          </button>
        )}
      </div>

      {goalFormOpen &&
        anchor &&
        createPortal(
          <>
            <div className="fixed inset-0 z-30" onClick={() => setGoalFormOpen(false)} />
            <div style={{ left: anchor.left, bottom: anchor.bottom }} className="fixed z-40">
              <GoalForm
                initial={goal}
                onSubmit={setGoal}
                onClose={() => setGoalFormOpen(false)}
              />
            </div>
          </>,
          document.body,
        )}
    </div>
  );
}
