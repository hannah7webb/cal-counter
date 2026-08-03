import { useRef, useState, type FormEvent } from 'react';
import { createPortal } from 'react-dom';
import { useAppData } from '../context/AppDataContext';
import { getWeekDates, startOfWeek, toISODate } from '../lib/date';

// One color per day of the week (Sun-Sat): red, yellow, orange, green, purple, blue, pink.
const DAY_COLORS = ['#f87171', '#facc15', '#fb923c', '#4ade80', '#c084fc', '#60a5fa', '#f472b6'];

export function WeeklyCalorieBar() {
  const { dayEntries, getFoodItem, weeklyCalorieGoal, setWeeklyCalorieGoal } = useAppData();
  const [formOpen, setFormOpen] = useState(false);
  const [anchor, setAnchor] = useState<{ left: number; top: number } | null>(null);
  const [draftGoal, setDraftGoal] = useState('');
  const buttonRef = useRef<HTMLButtonElement | null>(null);

  const weekDates = getWeekDates(startOfWeek(new Date()));
  const dayTotals = weekDates.map((date) => {
    const iso = toISODate(date);
    return dayEntries
      .filter((e) => e.date === iso)
      .reduce((sum, e) => sum + (getFoodItem(e.foodItemId)?.calories ?? 0), 0);
  });
  const totalConsumed = dayTotals.reduce((a, b) => a + b, 0);
  const goal = weeklyCalorieGoal ?? 0;
  const remaining = Math.max(0, goal - totalConsumed);
  const scale = goal > 0 && totalConsumed > goal ? goal / totalConsumed : 1;

  function openForm() {
    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setAnchor({ left: rect.left, top: rect.bottom + 8 });
    }
    setDraftGoal(weeklyCalorieGoal ? String(weeklyCalorieGoal) : '');
    setFormOpen(true);
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const parsed = Number(draftGoal);
    if (!Number.isFinite(parsed) || parsed <= 0) return;
    setWeeklyCalorieGoal(Math.round(parsed));
    setFormOpen(false);
  }

  const popover = formOpen && anchor && createPortal(
    <>
      <div className="fixed inset-0 z-30" onClick={() => setFormOpen(false)} />
      <form
        onSubmit={handleSubmit}
        style={{ left: anchor.left, top: anchor.top }}
        className="fixed z-40 flex w-52 flex-col gap-2 rounded-lg border border-neutral-200 bg-white p-3 shadow-lg dark:border-neutral-700 dark:bg-neutral-900"
      >
        <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
          Weekly calorie goal
        </label>
        <input
          type="number"
          min={1}
          autoFocus
          value={draftGoal}
          onChange={(e) => setDraftGoal(e.target.value)}
          className="rounded border border-neutral-300 px-2 py-1 text-sm text-neutral-800 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
        />
        <div className="flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={() => setFormOpen(false)}
            className="text-xs text-neutral-400 hover:text-neutral-600 dark:text-neutral-500 dark:hover:text-neutral-300"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="rounded-md bg-accent px-2.5 py-1 text-xs font-medium text-white"
          >
            Save
          </button>
        </div>
      </form>
    </>,
    document.body,
  );

  if (goal <= 0) {
    return (
      <div className="flex items-center px-2 py-1 sm:px-4">
        <button
          ref={buttonRef}
          type="button"
          onClick={openForm}
          className="text-xs text-neutral-400 hover:text-neutral-600 hover:underline transition-colors dark:text-neutral-500 dark:hover:text-neutral-300"
        >
          Set weekly calorie goal
        </button>
        {popover}
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 px-2 py-1.5 sm:px-4">
      <button
        ref={buttonRef}
        type="button"
        onClick={openForm}
        className="shrink-0 text-[10px] font-medium text-neutral-500 hover:text-accent transition-colors dark:text-neutral-400"
      >
        Week
      </button>
      <div className="relative h-3.5 flex-1 overflow-hidden rounded-sm border border-neutral-200 bg-neutral-100 dark:border-neutral-700 dark:bg-neutral-900">
        <div className="absolute inset-0 flex">
          {dayTotals.map((total, i) => {
            const pct = goal > 0 ? (total / goal) * 100 * scale : 0;
            if (pct <= 0) return null;
            return <div key={i} style={{ width: `${pct}%`, backgroundColor: DAY_COLORS[i] }} className="h-full" />;
          })}
        </div>
        <div className="pointer-events-none absolute inset-0">
          {weekDates.slice(0, -1).map((_, i) => (
            <div
              key={i}
              className="absolute top-0 h-full w-0.5 bg-black/60 dark:bg-white/70"
              style={{ left: `${((i + 1) * 100) / 7}%` }}
            />
          ))}
        </div>
      </div>
      <span className="shrink-0 whitespace-nowrap text-[10px] text-neutral-500 dark:text-neutral-400">
        {Math.round(totalConsumed)} / {goal} cal &middot; {Math.round(remaining)} left
      </span>
      {popover}
    </div>
  );
}
