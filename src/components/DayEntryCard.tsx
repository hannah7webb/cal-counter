import { useState } from 'react';
import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import type { DayEntry } from '../types';
import { getSwatch } from '../lib/colors';
import { useAppData } from '../context/AppDataContext';

function round1(value: number): number {
  return Math.round(value * 10) / 10;
}

export function DayEntryCard({ entries }: { entries: DayEntry[] }) {
  const { getFoodItem, deleteEntry } = useAppData();
  const [expanded, setExpanded] = useState(false);

  const primary = entries[0];
  const count = entries.length;
  const food = getFoodItem(primary.foodItemId);

  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: `entry-${primary.id}`,
    data: { type: 'entry', entry: primary },
  });

  if (!food) return null;

  const swatch = getSwatch(food.color);
  const calories = Math.round(food.calories * count);
  const protein = round1(food.protein * count);
  const fat = round1(food.fat * count);
  const carbs = round1(food.carbs * count);
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

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="touch-pan-y rounded-md border-l-4 px-2.5 py-1.5 shadow-sm cursor-grab active:cursor-grabbing select-none"
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
          {count > 1 && <span className="text-xs text-neutral-500 shrink-0">×{count}</span>}
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
          <button
            type="button"
            onClick={() => deleteEntry(primary.id)}
            className="text-xs text-neutral-400 hover:text-rose-500 transition-colors"
          >
            Delete
          </button>
        </div>
      )}
    </div>
  );
}
