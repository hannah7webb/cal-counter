import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import type { DayEntry, FoodItem } from '../types';
import { useAppData } from '../context/AppDataContext';
import { DayEntryCard } from './DayEntryCard';

export function groupEntries(entries: DayEntry[]): DayEntry[][] {
  const groups = new Map<string, DayEntry[]>();
  for (const entry of entries) {
    const group = groups.get(entry.foodItemId);
    if (group) {
      group.push(entry);
    } else {
      groups.set(entry.foodItemId, [entry]);
    }
  }
  return Array.from(groups.values()).sort((a, b) => {
    const posA = Math.min(...a.map((e) => e.position));
    const posB = Math.min(...b.map((e) => e.position));
    return posA - posB;
  });
}

export function groupSortableId(date: string, hour: number, foodItemId: string): string {
  return `entry-${date}-${hour}-${foodItemId}`;
}

type LayoutItem = { type: 'full'; group: DayEntry[] } | { type: 'pair'; groups: DayEntry[][] };

function groupCalories(group: DayEntry[], getFoodItem: (id: string) => FoodItem | undefined) {
  const food = getFoodItem(group[0].foodItemId);
  if (!food) return 0;
  return food.calories * group.length;
}

export function layoutHourGroups(
  groups: DayEntry[][],
  getFoodItem: (id: string) => FoodItem | undefined,
): LayoutItem[] {
  if (groups.length <= 1) {
    return groups.length === 1 ? [{ type: 'full', group: groups[0] }] : [];
  }

  let pairable = groups;
  let oddOneOut: DayEntry[] | null = null;

  if (groups.length % 2 === 1) {
    let maxCalories = -Infinity;
    let maxIndex = 0;
    groups.forEach((group, i) => {
      const cal = groupCalories(group, getFoodItem);
      if (cal > maxCalories) {
        maxCalories = cal;
        maxIndex = i;
      }
    });
    oddOneOut = groups[maxIndex];
    pairable = groups.filter((_, i) => i !== maxIndex);
  }

  const items: LayoutItem[] = [];
  for (let i = 0; i < pairable.length; i += 2) {
    items.push({ type: 'pair', groups: [pairable[i], pairable[i + 1]] });
  }
  if (oddOneOut) {
    items.push({ type: 'full', group: oddOneOut });
  }
  return items;
}

interface HourRowProps {
  date: string;
  hour: number;
  entries: DayEntry[];
  isToday: boolean;
  isPast: boolean;
  height?: number;
  contentRef?: (el: HTMLDivElement | null) => void;
}

export function HourRow({ date, hour, entries, isToday, isPast, height, contentRef }: HourRowProps) {
  const { getFoodItem } = useAppData();
  const { setNodeRef, isOver } = useDroppable({
    id: `day-${date}-hour-${hour}`,
    data: { type: 'hour', date, hour },
  });

  const groups = groupEntries(entries);
  const layout = layoutHourGroups(groups, getFoodItem);
  const bg = isOver
    ? 'bg-accent-light dark:bg-accent/20'
    : isToday
      ? 'bg-accent-light/60 dark:bg-accent/10'
      : isPast
        ? 'bg-neutral-50 dark:bg-neutral-900'
        : 'bg-white dark:bg-neutral-950';

  return (
    <div
      ref={setNodeRef}
      style={height !== undefined ? { height } : undefined}
      className={`border-b border-neutral-200 transition-colors dark:border-neutral-800 ${bg}`}
    >
      <div ref={contentRef} className="min-h-14 space-y-1.5 px-2 py-1.5">
        <SortableContext
          items={groups.map((g) => groupSortableId(date, hour, g[0].foodItemId))}
          strategy={verticalListSortingStrategy}
        >
          {layout.map((item, i) =>
            item.type === 'full' ? (
              <DayEntryCard key={item.group[0].foodItemId} entries={item.group} />
            ) : (
              <div
                key={i}
                className="grid grid-cols-2 items-stretch gap-1.5 has-data-[expanded=true]:items-start"
              >
                {item.groups.map((group) => (
                  <DayEntryCard key={group[0].foodItemId} entries={group} compact />
                ))}
              </div>
            ),
          )}
        </SortableContext>
      </div>
    </div>
  );
}
