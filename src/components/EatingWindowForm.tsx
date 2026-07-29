import { useState, type WheelEvent } from 'react';
import type { EatingWindow } from '../types';

interface EatingWindowFormProps {
  initial: EatingWindow;
  onSubmit: (window: EatingWindow) => void;
  onClose: () => void;
}

function formatHour(hour: number): string {
  const period = hour < 12 ? 'AM' : 'PM';
  const displayHour = hour % 12 === 0 ? 12 : hour % 12;
  return `${displayHour} ${period}`;
}

function HourStepper({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (next: number) => void;
}) {
  function step(delta: number) {
    onChange((value + delta + 24) % 24);
  }

  function handleWheel(e: WheelEvent<HTMLDivElement>) {
    e.preventDefault();
    step(e.deltaY < 0 ? 1 : -1);
  }

  return (
    <div className="flex flex-col gap-0.5">
      <label className="text-[9px] text-neutral-500 dark:text-neutral-400">{label}</label>
      <div
        onWheel={handleWheel}
        className="flex items-center justify-between gap-1 rounded border border-neutral-300 px-1.5 py-1 dark:border-neutral-700 dark:bg-neutral-800"
      >
        <span className="text-xs font-medium text-neutral-800 dark:text-neutral-100">
          {formatHour(value)}
        </span>
        <div className="flex flex-col">
          <button
            type="button"
            onClick={() => step(-1)}
            aria-label={`Move ${label.toLowerCase()} hour earlier`}
            className="text-neutral-400 hover:text-accent leading-none dark:text-neutral-500"
          >
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
              <path d="M2 6.5L5 3.5L8 6.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          <button
            type="button"
            onClick={() => step(1)}
            aria-label={`Move ${label.toLowerCase()} hour later`}
            className="text-neutral-400 hover:text-accent leading-none dark:text-neutral-500"
          >
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
              <path d="M2 3.5L5 6.5L8 3.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}

export function EatingWindowForm({ initial, onSubmit, onClose }: EatingWindowFormProps) {
  const [startHour, setStartHour] = useState(initial.startHour);
  const [endHour, setEndHour] = useState(initial.endHour);

  const canSubmit = startHour < endHour;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;
    onSubmit({ startHour, endHour });
    onClose();
  }

  return (
    <form
      onSubmit={handleSubmit}
      onPointerDown={(e) => e.stopPropagation()}
      className="flex w-56 flex-col gap-2 rounded-lg border border-neutral-200 bg-white p-3 shadow-lg dark:border-neutral-700 dark:bg-neutral-900"
    >
      <div className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">Eating window</div>
      <p className="text-[9px] text-neutral-400 dark:text-neutral-500">
        Applies from today onward — past days keep their own window.
      </p>
      <div className="grid grid-cols-2 gap-1.5">
        <HourStepper label="Start" value={startHour} onChange={setStartHour} />
        <HourStepper label="End" value={endHour} onChange={setEndHour} />
      </div>
      {!canSubmit && <p className="text-[9px] text-rose-500">Start must be before end.</p>}
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
