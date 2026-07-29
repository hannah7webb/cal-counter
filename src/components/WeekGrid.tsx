import { useEffect, useLayoutEffect, useRef, useState, type UIEvent } from 'react';
import type { DayEntry } from '../types';
import { isSameDay, toISODate } from '../lib/date';
import { useNow } from '../hooks/useNow';
import { DayHeaderCell } from './DayHeaderCell';
import { DayFooterCell } from './DayFooterCell';
import { HourRow } from './HourRow';
import { CurrentTimeLine } from './CurrentTimeLine';

interface WeekGridProps {
  dates: Date[];
  dayEntries: DayEntry[];
}

const HOURS = Array.from({ length: 24 }, (_, i) => i);
const DEFAULT_VISIBLE_HOUR = 7;

function formatHourLabel(hour: number): string {
  const period = hour < 12 ? 'AM' : 'PM';
  const displayHour = hour % 12 === 0 ? 12 : hour % 12;
  return `${displayHour} ${period}`;
}

function contentKey(isoDate: string, hour: number): string {
  return `${isoDate}:${hour}`;
}

export function WeekGrid({ dates, dayEntries }: WeekGridProps) {
  const now = useNow();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  // Each column (the gutter + one per day) scrolls independently in the DOM,
  // but they're kept in lockstep via handleScroll below so the whole grid
  // reads as one shared timeline — this lets each day's footer size to its
  // own content instead of being forced to match the tallest sibling.
  const scrollEls = useRef<(HTMLDivElement | null)[]>([]);
  const hour7Ref = useRef<HTMLDivElement | null>(null);
  const isSyncing = useRef(false);

  // Every day's hour row still needs to line up horizontally with its
  // siblings. Since the columns are no longer one shared flex row (that's
  // what let footers size independently), row heights are instead measured
  // per hour across the visible days and applied explicitly to every
  // column's cell for that hour, so the grid lines stay aligned.
  const contentRefs = useRef<Map<string, HTMLDivElement>>(new Map());
  const resizeObserverRef = useRef<ResizeObserver | null>(null);
  const [rowHeights, setRowHeights] = useState<Record<number, number>>({});
  const gridRef = useRef<HTMLDivElement | null>(null);

  function handleScroll(e: UIEvent<HTMLDivElement>) {
    if (isSyncing.current) return;
    const top = e.currentTarget.scrollTop;
    isSyncing.current = true;
    for (const el of scrollEls.current) {
      if (el && el !== e.currentTarget) el.scrollTop = top;
    }
    isSyncing.current = false;
  }

  function applyDelta(delta: number) {
    const first = scrollEls.current[0];
    if (!first) return;
    let maxScroll = Infinity;
    for (const el of scrollEls.current) {
      if (el) maxScroll = Math.min(maxScroll, el.scrollHeight - el.clientHeight);
    }
    maxScroll = Math.max(0, maxScroll);
    const next = Math.max(0, Math.min(maxScroll, first.scrollTop + delta));
    isSyncing.current = true;
    for (const el of scrollEls.current) {
      if (el) el.scrollTop = next;
    }
    isSyncing.current = false;
  }

  useLayoutEffect(() => {
    const top = hour7Ref.current?.offsetTop ?? 0;
    for (const el of scrollEls.current) {
      if (el) el.scrollTop = top;
    }
  }, []);

  // No individual day (or the gutter) should ever scroll on its own — e.g.
  // trackpad momentum only applies native inertia to whichever single
  // element the wheel/touch events were dispatched to, so mirroring
  // scrollTop after the fact can't fully prevent a day from visibly
  // drifting ahead of the others for an instant. Capturing input at the
  // grid level and driving every column's scrollTop from one shared,
  // clamped value sidesteps that entirely: nothing ever scrolls except
  // through this single computation.
  useEffect(() => {
    const grid = gridRef.current;
    if (!grid) return;

    function onWheel(e: WheelEvent) {
      e.preventDefault();
      applyDelta(e.deltaY);
    }

    let touchY: number | null = null;
    function onTouchStart(e: TouchEvent) {
      touchY = e.touches[0]?.clientY ?? null;
    }
    function onTouchMove(e: TouchEvent) {
      if (touchY === null) return;
      const currentY = e.touches[0]?.clientY;
      if (currentY === undefined) return;
      e.preventDefault();
      applyDelta(touchY - currentY);
      touchY = currentY;
    }

    grid.addEventListener('wheel', onWheel, { passive: false });
    grid.addEventListener('touchstart', onTouchStart, { passive: true });
    grid.addEventListener('touchmove', onTouchMove, { passive: false });
    return () => {
      grid.removeEventListener('wheel', onWheel);
      grid.removeEventListener('touchstart', onTouchStart);
      grid.removeEventListener('touchmove', onTouchMove);
    };
  }, []);

  const isoDates = dates.map(toISODate);

  useLayoutEffect(() => {
    function measure() {
      const next: Record<number, number> = {};
      for (const hour of HOURS) {
        let max = 0;
        for (const isoDate of isoDates) {
          const el = contentRefs.current.get(contentKey(isoDate, hour));
          if (el) {
            max = Math.max(max, el.getBoundingClientRect().height);
            resizeObserverRef.current?.observe(el);
          }
        }
        next[hour] = max;
      }
      setRowHeights(next);
    }

    // Expanding/collapsing a food card (a local UI state, not a data change)
    // can grow or shrink its hour's content without dayEntries ever
    // changing, so a ResizeObserver on the actual content — rather than
    // just this effect's data-driven dependencies — is what keeps the
    // aligned row height (and the temporary "extends the hour box" growth)
    // in sync with it.
    const observer = new ResizeObserver(() => measure());
    resizeObserverRef.current = observer;

    measure();
    window.addEventListener('resize', measure);
    return () => {
      observer.disconnect();
      window.removeEventListener('resize', measure);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isoDates.join(','), dayEntries]);

  const dateInfos = dates.map((date, i) => {
    const isoDate = isoDates[i];
    const entries = dayEntries
      .filter((e) => e.date === isoDate)
      .sort((a, b) => a.id.localeCompare(b.id));
    return {
      date,
      isoDate,
      isToday: isSameDay(date, now),
      isPast: date < todayStart,
      entries,
    };
  });

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="flex shrink-0">
        <div className="w-10 shrink-0" />
        {dateInfos.map((d) => (
          <DayHeaderCell key={d.isoDate} date={d.date} isToday={d.isToday} isPast={d.isPast} />
        ))}
      </div>

      <div ref={gridRef} className="flex min-h-0 flex-1">
        <div
          ref={(el) => {
            scrollEls.current[0] = el;
          }}
          onScroll={handleScroll}
          className="scroll-sync w-10 shrink-0 overflow-y-auto"
        >
          {HOURS.map((hour) => (
            <div
              key={hour}
              ref={hour === DEFAULT_VISIBLE_HOUR ? hour7Ref : undefined}
              style={rowHeights[hour] !== undefined ? { height: rowHeights[hour] } : undefined}
              className="min-h-14 border-b border-neutral-200 pt-1.5 text-center text-[9px] text-neutral-400"
            >
              {formatHourLabel(hour)}
            </div>
          ))}
        </div>

        {dateInfos.map((d, i) => (
          <div
            key={d.isoDate}
            className="flex min-w-0 flex-1 flex-col border-r border-neutral-200 last:border-r-0"
          >
            <div
              ref={(el) => {
                scrollEls.current[i + 1] = el;
              }}
              onScroll={handleScroll}
              className="scroll-sync min-h-0 flex-1 overflow-y-auto"
            >
              {HOURS.map((hour) => (
                <div key={hour} className="relative">
                  <HourRow
                    date={d.isoDate}
                    hour={hour}
                    entries={d.entries.filter((e) => e.hour === hour)}
                    isToday={d.isToday}
                    isPast={d.isPast}
                    height={rowHeights[hour]}
                    contentRef={(el) => {
                      const key = contentKey(d.isoDate, hour);
                      if (el) contentRefs.current.set(key, el);
                      else contentRefs.current.delete(key);
                    }}
                  />
                  {d.isToday && hour === now.getHours() && (
                    <CurrentTimeLine minuteFraction={now.getMinutes() / 60} />
                  )}
                </div>
              ))}
            </div>
            <DayFooterCell isoDate={d.isoDate} isPast={d.isPast} entries={d.entries} />
          </div>
        ))}
      </div>
    </div>
  );
}
