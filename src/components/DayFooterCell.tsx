import { useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import type { DayEntry } from '../types';
import { useAppData } from '../context/AppDataContext';
import { GoalForm } from './GoalForm';
import { GoalBarChart } from './GoalBarChart';

interface DayFooterCellProps {
  isoDate: string;
  isPast: boolean;
  entries: DayEntry[];
  isLastDay: boolean;
}

export function DayFooterCell({ isoDate, isPast, entries, isLastDay }: DayFooterCellProps) {
  const { getFoodItem, getGoalForDate, setGoalFromDate } = useAppData();

  const goal = getGoalForDate(isoDate);
  const [goalFormOpen, setGoalFormOpen] = useState(false);
  const [anchor, setAnchor] = useState<{ left: number; bottom: number } | null>(null);
  const goalLinkRef = useRef<HTMLButtonElement | null>(null);

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
      className={`shrink-0 border-t border-neutral-200 bg-neutral-50/80 px-2 py-2 dark:border-neutral-800 dark:bg-neutral-900/80 ${
        isLastDay ? '' : 'border-r'
      }`}
    >
      <div className="text-center text-sm font-semibold text-neutral-800 dark:text-white">
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
          isPast ? 'text-neutral-400 dark:text-neutral-500' : 'text-accent'
        }`}
      >
        {goal ? 'Edit goal' : 'Set goal'}
      </button>

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
