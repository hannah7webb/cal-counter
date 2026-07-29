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
import { AppDataProvider, PreviewDataProvider, useAppData } from './context/AppDataContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { addDays, getThreeDayDates, getWeekDates, startOfWeek } from './lib/date';
import { getSwatch } from './lib/colors';
import { useIsMobile } from './hooks/useIsMobile';
import { isSupabaseConfigured } from './lib/supabaseClient';
import { WeekHeader } from './components/WeekHeader';
import { WeekGrid } from './components/WeekGrid';
import { FoodTray } from './components/FoodTray';
import { AuthScreen } from './components/auth/AuthScreen';
import { SetupRequired } from './components/auth/SetupRequired';
import type { DayEntry, FoodItem } from './types';

type DragPayload =
  | { type: 'food'; foodItem: FoodItem }
  | { type: 'entry'; entry: DayEntry };

function AppShell() {
  const { dayEntries, addEntry, moveEntry, reorderDayGroups, getFoodItem } = useAppData();
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

    const activeData = active.data.current as DragPayload | undefined;
    const overData = over.data.current as
      | { type: 'hour'; date: string; hour: number }
      | { type: 'entry'; entry: DayEntry }
      | undefined;
    if (!activeData || !overData) return;

    const overEntry: DayEntry | null = overData.type === 'entry' ? overData.entry : null;
    const targetDate = overEntry ? overEntry.date : overData.type === 'hour' ? overData.date : undefined;
    const targetHour = overEntry ? overEntry.hour : overData.type === 'hour' ? overData.hour : undefined;
    if (targetDate === undefined || targetHour === undefined) return;

    if (activeData.type === 'food') {
      addEntry(activeData.foodItem.id, targetDate, targetHour);
      return;
    }

    const activeEntry = activeData.entry;
    if (
      overEntry &&
      overEntry.date === activeEntry.date &&
      overEntry.hour === activeEntry.hour &&
      overEntry.foodItemId !== activeEntry.foodItemId
    ) {
      reorderDayGroups(activeEntry.date, activeEntry.hour, activeEntry.foodItemId, overEntry.foodItemId);
    } else if (activeEntry.date !== targetDate || activeEntry.hour !== targetHour) {
      moveEntry(activeEntry.id, targetDate, targetHour);
    }
  }

  const overlayContent = useMemo(() => {
    if (!activeDrag) return null;
    const food = activeDrag.type === 'food' ? activeDrag.foodItem : getFoodItem(activeDrag.entry.foodItemId);
    if (!food) return null;
    const swatch = getSwatch(food.color);
    return (
      <div
        style={{ borderLeftColor: swatch.dot, backgroundColor: swatch.bg }}
        className="w-33 rounded-lg border-l-4 px-3 py-2 shadow-lg"
      >
        <div className="text-sm font-medium text-neutral-800 truncate">{food.name}</div>
        <div className="text-xs text-neutral-500">{Math.round(food.calories)} cal</div>
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

function AuthGate() {
  const { session, loading } = useAuth();

  if (loading) return <div className="h-screen bg-neutral-50" />;

  if (!session) {
    return (
      <div className="relative h-screen overflow-hidden">
        <div className="pointer-events-none h-full select-none blur-sm" aria-hidden="true">
          <PreviewDataProvider>
            <AppShell />
          </PreviewDataProvider>
        </div>
        <div className="absolute inset-0 flex items-center justify-center bg-neutral-900/10 px-4">
          <AuthScreen />
        </div>
      </div>
    );
  }

  return (
    <AppDataProvider userId={session.user.id}>
      <AppShell />
    </AppDataProvider>
  );
}

function App() {
  if (!isSupabaseConfigured) return <SetupRequired />;

  return (
    <AuthProvider>
      <AuthGate />
    </AuthProvider>
  );
}

export default App;
