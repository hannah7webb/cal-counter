import { useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import type { FoodItem } from '../types';
import { getSwatch } from '../lib/colors';
import { useAppData } from '../context/AppDataContext';
import { FoodForm } from './FoodForm';

export function FoodCard({ item }: { item: FoodItem }) {
  const { deleteFoodItem } = useAppData();
  const [expanded, setExpanded] = useState(false);
  const [editing, setEditing] = useState(false);
  const [anchor, setAnchor] = useState<{ left: number; bottom: number } | null>(null);
  const buttonRef = useRef<HTMLButtonElement | null>(null);

  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: `food-${item.id}`,
    data: { type: 'food', foodItem: item },
  });

  const swatch = getSwatch(item.color);

  const style = {
    transform: CSS.Translate.toString(transform),
    opacity: isDragging ? 0.4 : 1,
  };

  const notesLines = (item.notes ?? '')
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);

  function toggleExpanded() {
    if (!expanded && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setAnchor({ left: rect.left, bottom: window.innerHeight - rect.top + 8 });
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
        className="flex min-h-23 w-33 cursor-grab flex-col justify-between gap-1 rounded-lg border-l-4 px-3 py-2 text-left shadow-sm active:cursor-grabbing select-none"
        style={{ borderLeftColor: swatch.dot, backgroundColor: swatch.bg }}
      >
        <span className="text-sm font-medium text-neutral-800 leading-tight line-clamp-2">
          {item.name}
        </span>
        <div>
          <div className="text-xs text-neutral-500 leading-tight">
            {Math.round(item.calories)} cal
          </div>
          <div className="text-[10px] text-neutral-400 leading-tight">
            Protein {item.protein}g &middot; Fat {item.fat}g &middot; Carbs {item.carbs}g
          </div>
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
                className="fixed z-40 w-56 rounded-lg border border-neutral-200 bg-white p-3 shadow-lg"
              >
                <div className="flex items-start justify-between gap-2">
                  <span className="text-sm font-semibold text-neutral-800">{item.name}</span>
                  <button
                    type="button"
                    onClick={closePopover}
                    aria-label="Close"
                    className="text-neutral-400 hover:text-neutral-600"
                  >
                    ×
                  </button>
                </div>
                <div className="mt-1 text-xs text-neutral-500">{Math.round(item.calories)} cal</div>
                <div className="text-xs text-neutral-500">
                  Protein {item.protein}g &middot; Fat {item.fat}g &middot; Carbs {item.carbs}g
                </div>

                {notesLines.length > 0 && (
                  <ul className="mt-2 list-disc space-y-0.5 pl-4 text-xs text-neutral-600">
                    {notesLines.map((line, i) => (
                      <li key={i}>{line.replace(/^[-*]\s*/, '')}</li>
                    ))}
                  </ul>
                )}

                <div className="mt-2 flex items-center justify-end gap-3 border-t border-neutral-100 pt-2">
                  <button
                    type="button"
                    onClick={() => setEditing(true)}
                    className="text-xs text-neutral-500 hover:text-accent"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => deleteFoodItem(item.id)}
                    className="text-xs text-neutral-400 hover:text-rose-500"
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
                  className="flex w-64 flex-col gap-2 rounded-lg border border-neutral-200 bg-white p-3 shadow-lg"
                />
              </div>
            )}
          </>,
          document.body,
        )}
    </div>
  );
}
