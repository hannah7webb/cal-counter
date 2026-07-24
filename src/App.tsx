import { useMemo, useState } from 'react';
import {
  DndContext,
  DragOverlay,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from '@dnd-kit/core';
import { AppDataProvider, useAppData } from './context/AppDataContext';
import { addDays, getThreeDayDates, getWeekDates, startOfWeek } from './lib/date';
import { getSwatch } from './lib/colors';
import { useIsMobile } from './hooks/useIsMobile';
import { WeekHeader } from './components/WeekHeader';
import { WeekGrid } from './components/WeekGrid';
import { FoodTray } from './components/FoodTray';
import type { DayEntry, FoodItem } from './types';

type DragPayload =
  | { type: 'food'; foodItem: FoodItem }
  | { type: 'entry'; entry: DayEntry };

function AppShell() {
  const { dayEntries, addEntry, moveEntry, getFoodItem } = useAppData();
  const isMobile = useIsMobile();
  const [anchorDate, setAnchorDate] = useState(() => new Date());
  const [activeDrag, setActiveDrag] = useState<DragPayload | null>(null);

  const dates = isMobile ? getThreeDayDates(anchorDate) : getWeekDates(startOfWeek(anchorDate));

  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 8 } }),
  );

  function handleDragStart(event: DragStartEvent) {
    setActiveDrag((event.active.data.current as DragPayload) ?? null);
  }

  function handleDragEnd(event: DragEndEvent) {
    setActiveDrag(null);
    const { active, over } = event;
    if (!over) return;

    const dropDate = over.data.current?.date as string | undefined;
    if (!dropDate) return;

    const payload = active.data.current as DragPayload | undefined;
    if (!payload) return;

    if (payload.type === 'food') {
      addEntry(payload.foodItem.id, dropDate);
    } else if (payload.type === 'entry') {
      if (payload.entry.date !== dropDate) {
        moveEntry(payload.entry.id, dropDate);
      }
    }
  }

  const overlayContent = useMemo(() => {
    if (!activeDrag) return null;
    const food = activeDrag.type === 'food' ? activeDrag.foodItem : getFoodItem(activeDrag.entry.foodItemId);
    if (!food) return null;
    const swatch = getSwatch(food.color);
    const servings = activeDrag.type === 'entry' ? activeDrag.entry.servings : 1;
    return (
      <div
        style={{ borderLeftColor: swatch.dot, backgroundColor: swatch.bg }}
        className="w-33 rounded-lg border-l-4 px-3 py-2 shadow-lg"
      >
        <div className="text-sm font-medium text-neutral-800 truncate">{food.name}</div>
        <div className="text-xs text-neutral-500">
          {Math.round(food.calories * servings)} cal
        </div>
      </div>
    );
  }, [activeDrag, getFoodItem]);

  return (
    <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div className="flex h-screen flex-col overflow-hidden">
        <WeekHeader
          dates={dates}
          onPrev={() => setAnchorDate((d) => addDays(d, isMobile ? -1 : -7))}
          onNext={() => setAnchorDate((d) => addDays(d, isMobile ? 1 : 7))}
          onToday={() => setAnchorDate(new Date())}
        />
        <WeekGrid dates={dates} dayEntries={dayEntries} />
        <FoodTray />
      </div>
      <DragOverlay>{overlayContent}</DragOverlay>
    </DndContext>
  );
}

function App() {
  return (
    <AppDataProvider>
      <AppShell />
    </AppDataProvider>
  );
}

export default App;
