import { useLayoutEffect, useRef, useState } from 'react';
import type { DailyGoal } from '../types';

interface Totals {
  calories: number;
  protein: number;
  fat: number;
  carbs: number;
}

interface GoalBarChartProps {
  totals: Totals;
  goal: DailyGoal;
}

interface BarConfig {
  key: keyof Totals;
  label: string;
  unit: string;
  tolerance: number; // percentage tolerance, used when absoluteWindow isn't set
  absoluteWindow?: { green: number; amber: number };
  /** When set, the amber tier only applies when over goal, not under. */
  amberOverOnly?: boolean;
}

const BARS: BarConfig[] = [
  {
    key: 'calories',
    label: 'Cal',
    unit: ' cal',
    tolerance: 0.05,
    absoluteWindow: { green: 100, amber: 120 },
    amberOverOnly: true,
  },
  { key: 'protein', label: 'Protein', unit: 'g', tolerance: 0.05 },
  { key: 'fat', label: 'Fat', unit: 'g', tolerance: 0.1, absoluteWindow: { green: 10, amber: 25 } },
  {
    key: 'carbs',
    label: 'Carbs',
    unit: 'g',
    tolerance: 0.1,
    absoluteWindow: { green: 15, amber: 50 },
    amberOverOnly: true,
  },
];

function round1(value: number): number {
  return Math.round(value * 10) / 10;
}

function SegmentLabel({ text, className }: { text: string; className: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const [fits, setFits] = useState(false);

  useLayoutEffect(() => {
    function measure() {
      const el = ref.current;
      const parent = el?.parentElement;
      if (!el || !parent) return;
      setFits(el.scrollWidth <= parent.clientWidth);
    }
    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, [text]);

  return (
    <span ref={ref} className={className} style={{ visibility: fits ? 'visible' : 'hidden' }}>
      {text}
    </span>
  );
}

export function GoalBarChart({ totals, goal }: GoalBarChartProps) {
  return (
    <div className="flex flex-col gap-1.5">
      {BARS.map(({ key, label, unit, tolerance, absoluteWindow, amberOverOnly }) => {
        const goalValue = goal[key];
        const consumed = totals[key];
        const diff = Math.abs(consumed - goalValue);

        let onTarget = false;
        let onTargetAmber = false;
        if (absoluteWindow) {
          onTarget = goalValue > 0 && diff < absoluteWindow.green;
          const inAmberRange = goalValue > 0 && !onTarget && diff < absoluteWindow.amber;
          onTargetAmber = amberOverOnly ? inAmberRange && consumed > goalValue : inAmberRange;
        } else {
          onTarget = goalValue > 0 && diff <= tolerance * goalValue;
        }

        const pct = goalValue > 0 ? Math.min(100, Math.max(0, (consumed / goalValue) * 100)) : 0;
        const remainingPct = 100 - pct;
        const remaining = Math.max(0, goalValue - consumed);
        const over = goalValue > 0 && consumed > goalValue && !onTarget && !onTargetAmber;

        return (
          <div key={key} className="flex items-center gap-1">
            <span className="w-9 shrink-0 whitespace-nowrap text-[9px] text-neutral-400">
              {label}
            </span>
            <div className="flex h-5 flex-1 overflow-hidden rounded-sm border border-neutral-200 bg-accent-light">
              <div
                className={`flex min-w-0 items-center justify-center overflow-hidden transition-[width] duration-300 ${
                  pct > 0 ? 'px-1' : ''
                } ${
                  onTarget
                    ? 'bg-lime-500'
                    : onTargetAmber
                      ? 'bg-amber-400'
                      : over
                        ? 'bg-rose-400'
                        : 'bg-accent'
                }`}
                style={{ width: `${pct}%` }}
              >
                <SegmentLabel
                  text={`${round1(consumed)}${unit}`}
                  className="whitespace-nowrap text-[9px] font-medium text-white"
                />
              </div>
              <div
                className={`flex min-w-0 items-center justify-center overflow-hidden transition-[width] duration-300 ${
                  remainingPct > 0 ? 'px-1' : ''
                }`}
                style={{ width: `${remainingPct}%` }}
              >
                <SegmentLabel
                  text={`${round1(remaining)}${unit}`}
                  className="whitespace-nowrap text-[9px] text-neutral-500"
                />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
