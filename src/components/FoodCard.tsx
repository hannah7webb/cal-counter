import { useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { FoodItem } from '../types';
import { getSwatch } from '../lib/colors';
import { useAppData } from '../context/AppDataContext';
import { FoodForm } from './FoodForm';

export function FoodCard({ item }: { item: FoodItem }) {
  const { deleteFoodItem, setFoodItemHidden } = useAppData();
  const [expanded, setExpanded] = useState(false);
  const [editing, setEditing] = useState(false);
  const [anchor, setAnchor] = useState<{ left: number; bottom: number } | null>(null);
  const buttonRef = useRef<HTMLButtonElement | null>(null);

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: `food-${item.id}`,
    data: { type: 'food', foodItem: item },
  });

  const swatch = getSwatch(item.color);

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  const notesLines = (item.notes ?? '')
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);

  function toggleExpanded() {
    if (!expanded && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      const left = Math.min(rect.left, window.innerWidth - 272);
      setAnchor({ left: Math.max(8, left), bottom: window.innerHeight - rect.top + 8 });
    }
    setExpanded((v) => !v);
  }

  function closePopover() {
    setExpanded(false);
    setEditing(false);
  }

  return (
    <div ref={setNodeRef} style={style} className="relative shrink-0">
      <button
        ref={buttonRef}
        type="button"
        {...listeners}
        {...attributes}
        onClick={toggleExpanded}
        className="relative flex h-16 w-33 touch-pan-x cursor-grab flex-col justify-center gap-0.5 overflow-hidden rounded-md border-l-4 px-2.5 py-1.5 text-left shadow-sm active:cursor-grabbing select-none"
        style={{ borderLeftColor: swatch.dot }}
      >
        <div className="swatch-card absolute inset-0" style={{ backgroundColor: swatch.bg }} aria-hidden="true" />
        <div className="relative flex items-center gap-1">
          <span className="min-w-0 flex-1 truncate text-sm font-medium text-neutral-800 leading-tight dark:text-white">
            {item.name}
          </span>
          {item.hidden && (
            <span className="shrink-0 rounded-full bg-neutral-100 px-1.5 py-0.5 text-[8px] font-medium text-neutral-500 dark:bg-neutral-800 dark:text-neutral-400">
              Hidden
            </span>
          )}
        </div>
        <div className="relative truncate text-xs text-neutral-500 leading-tight dark:text-neutral-200">
          {Math.round(item.calories)} cal
        </div>
        <div className="relative truncate text-[9px] text-neutral-400 leading-tight dark:text-neutral-300">
          Protein {item.protein}g &middot; Fat {item.fat}g &middot; Carbs {item.carbs}g
        </div>
      </button>

      {expanded &&
        anchor &&
        createPortal(
          <>
            <div className="fixed inset-0 z-30" onClick={closePopover} />
            {!editing ? (
              <div
                style={{ left: anchor.left, bottom: anchor.bottom }}
                className="fixed z-40 w-56 rounded-lg border border-neutral-200 bg-white p-3 shadow-lg dark:border-neutral-700 dark:bg-neutral-900"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm font-semibold text-neutral-800 dark:text-neutral-100">{item.name}</span>
                    {item.hidden && (
                      <span className="rounded-full bg-neutral-100 px-1.5 py-0.5 text-[9px] font-medium text-neutral-500 dark:bg-neutral-800 dark:text-neutral-400">
                        Hidden
                      </span>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={closePopover}
                    aria-label="Close"
                    className="text-neutral-400 hover:text-neutral-600 dark:text-neutral-500 dark:hover:text-neutral-300"
                  >
                    ×
                  </button>
                </div>
                <div className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">{Math.round(item.calories)} cal</div>
                <div className="text-xs text-neutral-500 dark:text-neutral-400">
                  Protein {item.protein}g &middot; Fat {item.fat}g &middot; Carbs {item.carbs}g
                </div>

                {notesLines.length > 0 && (
                  <ul className="mt-2 list-disc space-y-0.5 pl-4 text-xs text-neutral-600 dark:text-neutral-300">
                    {notesLines.map((line, i) => (
                      <li key={i}>{line.replace(/^[-*]\s*/, '')}</li>
                    ))}
                  </ul>
                )}

                <div className="mt-2 flex items-center justify-end gap-3 border-t border-neutral-100 pt-2 dark:border-neutral-800">
                  <button
                    type="button"
                    onClick={() => setFoodItemHidden(item.id, !item.hidden)}
                    className="text-xs text-neutral-500 hover:text-accent dark:text-neutral-400"
                  >
                    {item.hidden ? 'Unhide' : 'Hide'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditing(true)}
                    className="text-xs text-neutral-500 hover:text-accent dark:text-neutral-400"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => deleteFoodItem(item.id)}
                    className="text-xs text-neutral-400 hover:text-rose-500 dark:text-neutral-500"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ) : (
              <div style={{ left: anchor.left, bottom: anchor.bottom }} className="fixed z-40">
                <FoodForm
                  initial={item}
                  onClose={closePopover}
                  className="flex w-64 flex-col gap-2 rounded-lg border border-neutral-200 bg-white p-3 shadow-lg dark:border-neutral-700 dark:bg-neutral-900"
                />
              </div>
            )}
          </>,
          document.body,
        )}
    </div>
  );
}
