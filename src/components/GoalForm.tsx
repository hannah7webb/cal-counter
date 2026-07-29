import { useState } from 'react';
import type { DailyGoal } from '../types';

interface GoalFormProps {
  initial: DailyGoal | null;
  onSubmit: (goal: DailyGoal) => void;
  onClose: () => void;
}

export function GoalForm({ initial, onSubmit, onClose }: GoalFormProps) {
  const [calories, setCalories] = useState(initial ? String(initial.calories) : '');
  const [protein, setProtein] = useState(initial ? String(initial.protein) : '');
  const [fat, setFat] = useState(initial ? String(initial.fat) : '');
  const [carbs, setCarbs] = useState(initial ? String(initial.carbs) : '');

  const canSubmit = calories.trim().length > 0;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;
    onSubmit({
      calories: parseFloat(calories) || 0,
      protein: parseFloat(protein) || 0,
      fat: parseFloat(fat) || 0,
      carbs: parseFloat(carbs) || 0,
    });
    onClose();
  }

  return (
    <form
      onSubmit={handleSubmit}
      onPointerDown={(e) => e.stopPropagation()}
      className="flex w-56 flex-col gap-2 rounded-lg border border-neutral-200 bg-white p-3 shadow-lg dark:border-neutral-700 dark:bg-neutral-900"
    >
      <div className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">Daily goal</div>
      <div className="grid grid-cols-2 gap-1.5">
        <div className="flex flex-col gap-0.5">
          <label htmlFor="goal-calories" className="text-[9px] text-neutral-500 dark:text-neutral-400">
            Calories
          </label>
          <input
            id="goal-calories"
            autoFocus
            type="number"
            value={calories}
            onChange={(e) => setCalories(e.target.value)}
            className="min-w-0 rounded border border-neutral-300 px-1.5 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-accent/40 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
          />
        </div>
        <div className="flex flex-col gap-0.5">
          <label htmlFor="goal-protein" className="text-[9px] text-neutral-500 dark:text-neutral-400">
            Protein (g)
          </label>
          <input
            id="goal-protein"
            type="number"
            value={protein}
            onChange={(e) => setProtein(e.target.value)}
            className="min-w-0 rounded border border-neutral-300 px-1.5 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-accent/40 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
          />
        </div>
        <div className="flex flex-col gap-0.5">
          <label htmlFor="goal-fat" className="text-[9px] text-neutral-500 dark:text-neutral-400">
            Fat (g)
          </label>
          <input
            id="goal-fat"
            type="number"
            value={fat}
            onChange={(e) => setFat(e.target.value)}
            className="min-w-0 rounded border border-neutral-300 px-1.5 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-accent/40 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
          />
        </div>
        <div className="flex flex-col gap-0.5">
          <label htmlFor="goal-carbs" className="text-[9px] text-neutral-500 dark:text-neutral-400">
            Carbs (g)
          </label>
          <input
            id="goal-carbs"
            type="number"
            value={carbs}
            onChange={(e) => setCarbs(e.target.value)}
            className="min-w-0 rounded border border-neutral-300 px-1.5 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-accent/40 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
          />
        </div>
      </div>
      <div className="flex items-center justify-end gap-2">
        <button
          type="button"
          onClick={onClose}
          className="text-xs text-neutral-400 hover:text-neutral-600 dark:text-neutral-500 dark:hover:text-neutral-300"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={!canSubmit}
          className="rounded-md bg-accent px-2.5 py-1 text-xs font-medium text-white disabled:opacity-40"
        >
          Save
        </button>
      </div>
    </form>
  );
}
