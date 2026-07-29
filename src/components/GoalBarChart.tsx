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
  /** Absolute units (e.g. calories) when set; otherwise green/yellow are
   * fractions of the goal value (e.g. 0.05 = 5%). */
  absolute?: boolean;
  green: number;
  yellow: number;
}

const BARS: BarConfig[] = [
  { key: 'calories', label: 'Cal', unit: ' cal', absolute: true, green: 99, yellow: 150 },
  { key: 'protein', label: 'Protein', unit: 'g', green: 0.05, yellow: 0.15 },
  { key: 'fat', label: 'Fat', unit: 'g', green: 0.15, yellow: 0.3 },
  { key: 'carbs', label: 'Carbs', unit: 'g', green: 0.2, yellow: 0.4 },
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
      {BARS.map((bar) => {
        const { key, label, unit, absolute, green, yellow } = bar;
        const goalValue = goal[key];
        const consumed = totals[key];
        const diff = Math.abs(consumed - goalValue);
        const isOver = consumed > goalValue;

        const greenThreshold = absolute ? green : green * goalValue;
        const yellowThreshold = absolute ? yellow : yellow * goalValue;

        const isGreen = goalValue > 0 && diff <= greenThreshold;
        const isYellow = goalValue > 0 && !isGreen && diff <= yellowThreshold;
        // Past the yellow range: red only signals overeating (surplus); a
        // deficit past yellow just keeps filling as purple, no penalty color.
        const isRed = goalValue > 0 && !isGreen && !isYellow && isOver;

        const pct = goalValue > 0 ? Math.min(100, Math.max(0, (consumed / goalValue) * 100)) : 0;
        const remainingPct = 100 - pct;
        const remaining = Math.max(0, goalValue - consumed);

        return (
          <div key={key} className="flex items-center gap-1">
            <span className="w-9 shrink-0 whitespace-nowrap text-[8px] text-neutral-400 dark:text-neutral-500">
              {label}
            </span>
            <div className="flex h-5 flex-1 overflow-hidden rounded-sm border border-neutral-200 bg-accent-light dark:border-neutral-700 dark:bg-accent/10">
              <div
                className={`flex min-w-0 items-center justify-center overflow-hidden transition-[width] duration-300 ${
                  pct > 0 ? 'px-1' : ''
                } ${
                  isGreen
                    ? 'bg-lime-500'
                    : isYellow
                      ? 'bg-amber-400'
                      : isRed
                        ? 'bg-rose-400'
                        : 'bg-accent'
                }`}
                style={{ width: `${pct}%` }}
              >
                <SegmentLabel
                  text={`${round1(consumed)}${unit}`}
                  className="whitespace-nowrap text-[8px] font-medium text-white"
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
                  className="whitespace-nowrap text-[8px] text-neutral-500 dark:text-neutral-400"
                />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
