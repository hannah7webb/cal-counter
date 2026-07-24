import { useState } from 'react';
import { COLOR_PALETTE } from '../lib/colors';
import { useAppData } from '../context/AppDataContext';
import type { FoodItem } from '../types';

interface FoodFormProps {
  initial?: FoodItem;
  onClose: () => void;
  className?: string;
}

export function FoodForm({ initial, onClose, className }: FoodFormProps) {
  const { addFoodItem, updateFoodItem } = useAppData();
  const [name, setName] = useState(initial?.name ?? '');
  const [color, setColor] = useState(initial?.color ?? COLOR_PALETTE[0].id);
  const [calories, setCalories] = useState(initial ? String(initial.calories) : '');
  const [protein, setProtein] = useState(initial ? String(initial.protein) : '');
  const [fat, setFat] = useState(initial ? String(initial.fat) : '');
  const [carbs, setCarbs] = useState(initial ? String(initial.carbs) : '');
  const [notes, setNotes] = useState(initial?.notes ?? '');

  const canSubmit = name.trim().length > 0 && calories.trim().length > 0;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;
    const input = {
      name: name.trim(),
      color,
      calories: parseFloat(calories) || 0,
      protein: parseFloat(protein) || 0,
      fat: parseFloat(fat) || 0,
      carbs: parseFloat(carbs) || 0,
      notes: notes.trim() || undefined,
    };
    if (initial) {
      updateFoodItem(initial.id, input);
    } else {
      addFoodItem(input);
    }
    onClose();
  }

  return (
    <form
      onSubmit={handleSubmit}
      onPointerDown={(e) => e.stopPropagation()}
      className={
        className ??
        'flex w-75 shrink-0 flex-col gap-2 rounded-lg border border-neutral-200 bg-white p-3 shadow-sm'
      }
    >
      <div className="flex gap-2">
        <input
          autoFocus
          type="text"
          placeholder="Food name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="min-w-0 flex-1 rounded border border-neutral-300 px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-accent/40"
        />
        <div className="flex items-center gap-1">
          {COLOR_PALETTE.map((swatch) => (
            <button
              key={swatch.id}
              type="button"
              onClick={() => setColor(swatch.id)}
              aria-label={swatch.label}
              style={{ backgroundColor: swatch.dot }}
              className={`h-4 w-4 rounded-full transition-transform ${
                color === swatch.id ? 'ring-2 ring-offset-1 ring-accent scale-110' : ''
              }`}
            />
          ))}
        </div>
      </div>
      <div className="grid grid-cols-2 gap-1.5">
        <input
          type="number"
          placeholder="Calories"
          value={calories}
          onChange={(e) => setCalories(e.target.value)}
          className="min-w-0 rounded border border-neutral-300 px-1.5 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-accent/40"
        />
        <input
          type="number"
          placeholder="Protein (g)"
          value={protein}
          onChange={(e) => setProtein(e.target.value)}
          className="min-w-0 rounded border border-neutral-300 px-1.5 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-accent/40"
        />
        <input
          type="number"
          placeholder="Fat (g)"
          value={fat}
          onChange={(e) => setFat(e.target.value)}
          className="min-w-0 rounded border border-neutral-300 px-1.5 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-accent/40"
        />
        <input
          type="number"
          placeholder="Carbs (g)"
          value={carbs}
          onChange={(e) => setCarbs(e.target.value)}
          className="min-w-0 rounded border border-neutral-300 px-1.5 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-accent/40"
        />
      </div>
      <div>
        <div className="mb-0.5 leading-tight">
          <span className="text-xs text-neutral-500">serving size / recipe</span>{' '}
          <span className="text-[10px] text-neutral-400">(one item per line)</span>
        </div>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={2}
          className="w-full resize-none rounded border border-neutral-300 px-2 py-1 text-xs leading-relaxed focus:outline-none focus:ring-2 focus:ring-accent/40"
        />
      </div>
      <div className="flex items-center justify-end gap-2">
        <button
          type="button"
          onClick={onClose}
          className="text-xs text-neutral-400 hover:text-neutral-600"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={!canSubmit}
          className="rounded-md bg-accent px-2.5 py-1 text-xs font-medium text-white disabled:opacity-40"
        >
          {initial ? 'Save' : 'Add'}
        </button>
      </div>
    </form>
  );
}
