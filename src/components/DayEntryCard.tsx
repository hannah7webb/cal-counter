import { useState } from 'react';
import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import type { DayEntry } from '../types';
import { getSwatch } from '../lib/colors';
import { useAppData } from '../context/AppDataContext';

function round1(value: number): number {
  return Math.round(value * 10) / 10;
}

export function DayEntryCard({ entry }: { entry: DayEntry }) {
  const { getFoodItem, updateEntryServings, deleteEntry } = useAppData();
  const [expanded, setExpanded] = useState(false);
  const [servingsInput, setServingsInput] = useState(String(entry.servings));

  const food = getFoodItem(entry.foodItemId);

  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: `entry-${entry.id}`,
    data: { type: 'entry', entry },
  });

  if (!food) return null;

  const swatch = getSwatch(food.color);
  const calories = Math.round(food.calories * entry.servings);
  const protein = round1(food.protein * entry.servings);
  const fat = round1(food.fat * entry.servings);
  const carbs = round1(food.carbs * entry.servings);
  const notesLines = (food.notes ?? '')
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);

  const style = {
    transform: CSS.Translate.toString(transform),
    borderLeftColor: swatch.dot,
    backgroundColor: swatch.bg,
    opacity: isDragging ? 0.4 : 1,
  };

  function commitServings() {
    const value = parseFloat(servingsInput);
    if (!Number.isNaN(value) && value > 0) {
      updateEntryServings(entry.id, value);
    } else {
      setServingsInput(String(entry.servings));
    }
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="touch-none rounded-md border-l-4 px-2.5 py-1.5 shadow-sm cursor-grab active:cursor-grabbing select-none"
      {...listeners}
      {...attributes}
    >
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className="w-full text-left"
      >
        <div className="flex items-center justify-between gap-2">
          <span className="text-sm font-medium text-neutral-800 truncate">{food.name}</span>
          <span className="text-xs text-neutral-500 shrink-0">×{entry.servings}</span>
        </div>
        <div className="text-xs text-neutral-500 leading-tight">{calories} cal</div>
        <div className="text-[10px] text-neutral-400 leading-tight">
          Protein {protein}g &middot; Fat {fat}g &middot; Carbs {carbs}g
        </div>
      </button>

      {expanded && (
        <div
          className="mt-2 pt-2 border-t border-neutral-200/70"
          onPointerDown={(e) => e.stopPropagation()}
        >
          {notesLines.length > 0 && (
            <ul className="mb-2 list-disc space-y-0.5 pl-4 text-xs text-neutral-600">
              {notesLines.map((line, i) => (
                <li key={i}>{line.replace(/^[-*]\s*/, '')}</li>
              ))}
            </ul>
          )}
          <div className="flex items-center gap-2">
            <label className="text-xs text-neutral-500" htmlFor={`servings-${entry.id}`}>
              Servings
            </label>
            <input
              id={`servings-${entry.id}`}
              type="number"
              min="0.25"
              step="0.25"
              value={servingsInput}
              onChange={(e) => setServingsInput(e.target.value)}
              onBlur={commitServings}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  (e.target as HTMLInputElement).blur();
                }
              }}
              className="w-16 rounded border border-neutral-300 bg-white px-1.5 py-0.5 text-xs focus:outline-none focus:ring-2 focus:ring-accent/40"
            />
            <button
              type="button"
              onClick={() => deleteEntry(entry.id)}
              className="ml-auto text-xs text-neutral-400 hover:text-rose-500 transition-colors"
            >
              Delete
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
