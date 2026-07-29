import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { arrayMove } from '@dnd-kit/sortable';
import type { FoodItem, DayEntry, DailyGoal, GoalEntry } from '../types';
import {
  fetchAllData,
  insertFoodItem,
  updateFoodItemRow,
  updateFoodItemHiddenRow,
  deleteFoodItemRow,
  insertDayEntry,
  deleteDayEntryRow,
  updateDayEntrySlotRow,
  updateDayEntryPositions,
  upsertGoalRow,
} from '../lib/supabaseStorage';

interface FoodItemInput {
  name: string;
  color: string;
  calories: number;
  protein: number;
  fat: number;
  carbs: number;
  notes?: string;
}

interface AppDataContextValue {
  foodItems: FoodItem[];
  dayEntries: DayEntry[];
  addFoodItem: (input: FoodItemInput) => void;
  updateFoodItem: (id: string, input: FoodItemInput) => void;
  setFoodItemHidden: (id: string, hidden: boolean) => void;
  deleteFoodItem: (id: string) => void;
  addEntry: (foodItemId: string, date: string, hour: number) => void;
  deleteEntry: (entryId: string) => void;
  moveEntry: (entryId: string, date: string, hour: number) => void;
  reorderDayGroups: (
    date: string,
    hour: number,
    activeFoodItemId: string,
    overFoodItemId: string,
  ) => void;
  getFoodItem: (id: string) => FoodItem | undefined;
  getGoalForDate: (date: string) => DailyGoal | null;
  setGoalFromDate: (date: string, goal: DailyGoal) => void;
}

const AppDataContext = createContext<AppDataContextValue | null>(null);

function generateId(): string {
  return crypto.randomUUID();
}

function logError(action: string, error: unknown) {
  console.error(`Failed to ${action}:`, error);
}

export function AppDataProvider({
  userId,
  children,
}: {
  userId: string;
  children: ReactNode;
}) {
  const [foodItems, setFoodItems] = useState<FoodItem[]>([]);
  const [dayEntries, setDayEntries] = useState<DayEntry[]>([]);
  const [goals, setGoals] = useState<GoalEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetchAllData(userId)
      .then((data) => {
        if (cancelled) return;
        setFoodItems(data.foodItems);
        setDayEntries(data.dayEntries);
        setGoals(data.goals);
      })
      .catch((error) => logError('load your data', error))
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [userId]);

  function addFoodItem(input: FoodItemInput) {
    const item: FoodItem = { id: generateId(), hidden: false, ...input };
    setFoodItems((prev) => [...prev, item]);
    insertFoodItem(userId, item).catch((error) => logError('save the new food item', error));
  }

  function updateFoodItem(id: string, input: FoodItemInput) {
    const current = foodItems.find((f) => f.id === id);
    setFoodItems((prev) => prev.map((f) => (f.id === id ? { ...f, ...input } : f)));
    updateFoodItemRow({ id, hidden: current?.hidden ?? false, ...input }).catch((error) =>
      logError('update the food item', error),
    );
  }

  function setFoodItemHidden(id: string, hidden: boolean) {
    setFoodItems((prev) => prev.map((f) => (f.id === id ? { ...f, hidden } : f)));
    updateFoodItemHiddenRow(id, hidden).catch((error) => logError('update visibility', error));
  }

  function deleteFoodItem(id: string) {
    setFoodItems((prev) => prev.filter((f) => f.id !== id));
    setDayEntries((prev) => prev.filter((e) => e.foodItemId !== id));
    deleteFoodItemRow(id).catch((error) => logError('delete the food item', error));
  }

  function nextPositionForSlot(date: string, hour: number): number {
    const positions = dayEntries
      .filter((e) => e.date === date && e.hour === hour)
      .map((e) => e.position);
    return positions.length > 0 ? Math.max(...positions) + 1 : 0;
  }

  function addEntry(foodItemId: string, date: string, hour: number) {
    const entry: DayEntry = {
      id: generateId(),
      foodItemId,
      date,
      hour,
      position: nextPositionForSlot(date, hour),
    };
    setDayEntries((prev) => [...prev, entry]);
    insertDayEntry(userId, entry).catch((error) => logError('save the food entry', error));
  }

  function deleteEntry(entryId: string) {
    setDayEntries((prev) => prev.filter((e) => e.id !== entryId));
    deleteDayEntryRow(entryId).catch((error) => logError('delete the entry', error));
  }

  function moveEntry(entryId: string, date: string, hour: number) {
    const position = nextPositionForSlot(date, hour);
    setDayEntries((prev) =>
      prev.map((e) => (e.id === entryId ? { ...e, date, hour, position } : e)),
    );
    updateDayEntrySlotRow(entryId, date, hour, position).catch((error) =>
      logError('move the entry', error),
    );
  }

  function reorderDayGroups(
    date: string,
    hour: number,
    activeFoodItemId: string,
    overFoodItemId: string,
  ) {
    if (activeFoodItemId === overFoodItemId) return;

    const entriesForSlot = dayEntries.filter((e) => e.date === date && e.hour === hour);
    const order: string[] = [];
    for (const e of [...entriesForSlot].sort((a, b) => a.position - b.position)) {
      if (!order.includes(e.foodItemId)) order.push(e.foodItemId);
    }

    const oldIndex = order.indexOf(activeFoodItemId);
    const newIndex = order.indexOf(overFoodItemId);
    if (oldIndex === -1 || newIndex === -1) return;

    const newOrder = arrayMove(order, oldIndex, newIndex);
    const positionByFoodItemId = new Map(newOrder.map((id, i) => [id, i]));

    setDayEntries((prev) =>
      prev.map((e) =>
        e.date === date && e.hour === hour && positionByFoodItemId.has(e.foodItemId)
          ? { ...e, position: positionByFoodItemId.get(e.foodItemId)! }
          : e,
      ),
    );

    const updates = entriesForSlot.map((e) => ({
      id: e.id,
      position: positionByFoodItemId.get(e.foodItemId) ?? e.position,
    }));
    updateDayEntryPositions(updates).catch((error) => logError('reorder the entries', error));
  }

  function getFoodItem(id: string) {
    return foodItems.find((f) => f.id === id);
  }

  function getGoalForDate(date: string): DailyGoal | null {
    const applicable = goals.filter((g) => g.effectiveDate <= date);
    if (applicable.length === 0) return null;
    const latest = applicable.reduce((a, b) => (b.effectiveDate > a.effectiveDate ? b : a));
    const { effectiveDate: _effectiveDate, ...rest } = latest;
    const isAllZero = rest.calories === 0 && rest.protein === 0 && rest.fat === 0 && rest.carbs === 0;
    return isAllZero ? null : rest;
  }

  function setGoalFromDate(date: string, goal: DailyGoal) {
    const entry: GoalEntry = { effectiveDate: date, ...goal };
    setGoals((prev) => [...prev.filter((g) => g.effectiveDate !== date), entry]);
    upsertGoalRow(userId, entry).catch((error) => logError('save the goal', error));
  }

  if (loading) {
    return <div className="h-screen bg-neutral-50 dark:bg-black" />;
  }

  return (
    <AppDataContext.Provider
      value={{
        foodItems,
        dayEntries,
        addFoodItem,
        updateFoodItem,
        setFoodItemHidden,
        deleteFoodItem,
        addEntry,
        deleteEntry,
        moveEntry,
        reorderDayGroups,
        getFoodItem,
        getGoalForDate,
        setGoalFromDate,
      }}
    >
      {children}
    </AppDataContext.Provider>
  );
}

export function useAppData(): AppDataContextValue {
  const ctx = useContext(AppDataContext);
  if (!ctx) throw new Error('useAppData must be used within AppDataProvider');
  return ctx;
}

const noop = () => {};

const previewValue: AppDataContextValue = {
  foodItems: [],
  dayEntries: [],
  addFoodItem: noop,
  updateFoodItem: noop,
  setFoodItemHidden: noop,
  deleteFoodItem: noop,
  addEntry: noop,
  deleteEntry: noop,
  moveEntry: noop,
  reorderDayGroups: noop,
  getFoodItem: () => undefined,
  getGoalForDate: () => null,
  setGoalFromDate: noop,
};

/** Supplies an empty, read-only data context so the app shell can be rendered
 * as a visual backdrop (e.g. blurred behind the sign-in screen) without a real user. */
export function PreviewDataProvider({ children }: { children: ReactNode }) {
  return <AppDataContext.Provider value={previewValue}>{children}</AppDataContext.Provider>;
}
