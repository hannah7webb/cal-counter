import { useState } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { DayEntry } from '../types';
import { getSwatch } from '../lib/colors';
import { useAppData } from '../context/AppDataContext';
import { groupSortableId } from './HourRow';

function round1(value: number): number {
  return Math.round(value * 10) / 10;
}

export function DayEntryCard({
  entries,
  compact = false,
}: {
  entries: DayEntry[];
  compact?: boolean;
}) {
  const { getFoodItem, deleteEntry } = useAppData();
  const [expanded, setExpanded] = useState(false);

  const primary = entries[0];
  const count = entries.length;
  const food = getFoodItem(primary.foodItemId);

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: groupSortableId(primary.date, primary.hour, primary.foodItemId),
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
    transform: CSS.Transform.toString(transform),
    transition,
    borderLeftColor: swatch.dot,
    opacity: isDragging ? 0.4 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      data-expanded={expanded}
      className={`relative touch-pan-y overflow-hidden rounded-md border-l-4 shadow-sm cursor-grab active:cursor-grabbing select-none ${
        compact ? 'min-w-0' : ''
      }`}
      {...listeners}
      {...attributes}
    >
      <div className="swatch-card absolute inset-0" style={{ backgroundColor: swatch.bg }} aria-hidden="true" />
      <div className={`relative ${compact ? 'px-1.5 py-1.5' : 'px-2.5 py-1.5'}`}>
        <button type="button" onClick={() => setExpanded((v) => !v)} className="w-full text-left">
          {compact ? (
            <>
              <div className="flex items-start justify-between gap-1">
                <span className="line-clamp-2 wrap-break-word text-[10px] font-medium leading-tight text-neutral-800 dark:text-white">
                  {food.name}
                </span>
                {count > 1 && (
                  <span className="shrink-0 text-[9px] text-neutral-500 dark:text-neutral-300">×{count}</span>
                )}
              </div>
              <div className="mt-1 text-[10px] text-neutral-500 leading-tight dark:text-neutral-200">{calories} cal</div>
              <div className="text-[9px] text-neutral-400 leading-tight dark:text-neutral-300">Protein {protein}g</div>
              <div className="text-[9px] text-neutral-400 leading-tight dark:text-neutral-300">Fat {fat}g</div>
              <div className="text-[9px] text-neutral-400 leading-tight dark:text-neutral-300">Carbs {carbs}g</div>
            </>
          ) : (
            <>
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm font-medium text-neutral-800 truncate dark:text-white">{food.name}</span>
                {count > 1 && <span className="text-xs text-neutral-500 shrink-0 dark:text-neutral-300">×{count}</span>}
              </div>
              <div className="text-xs text-neutral-500 leading-tight dark:text-neutral-200">{calories} cal</div>
              <div className="text-[9px] text-neutral-400 leading-tight dark:text-neutral-300">
                Protein {protein}g &middot; Fat {fat}g &middot; Carbs {carbs}g
              </div>
            </>
          )}
        </button>

        {expanded && (
          <div
            className="mt-2 pt-2 border-t border-neutral-200/70 dark:border-neutral-100/20"
            onPointerDown={(e) => e.stopPropagation()}
          >
            {notesLines.length > 0 && (
              <ul className="mb-2 list-disc space-y-0.5 pl-4 text-xs text-neutral-600 dark:text-neutral-200">
                {notesLines.map((line, i) => (
                  <li key={i}>{line.replace(/^[-*]\s*/, '')}</li>
                ))}
              </ul>
            )}
            <button
              type="button"
              onClick={() => deleteEntry(primary.id)}
              className="text-xs text-neutral-400 hover:text-rose-500 transition-colors dark:text-neutral-300"
            >
              Delete
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
