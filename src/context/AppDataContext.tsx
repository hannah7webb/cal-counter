import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import type { FoodItem, DayEntry, DailyGoal, GoalEntry } from '../types';
import {
  fetchAllData,
  insertFoodItem,
  updateFoodItemRow,
  deleteFoodItemRow,
  insertDayEntry,
  deleteDayEntryRow,
  updateDayEntryDateRow,
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
  deleteFoodItem: (id: string) => void;
  addEntry: (foodItemId: string, date: string) => void;
  deleteEntry: (entryId: string) => void;
  moveEntry: (entryId: string, date: string) => void;
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
    const item: FoodItem = { id: generateId(), ...input };
    setFoodItems((prev) => [...prev, item]);
    insertFoodItem(userId, item).catch((error) => logError('save the new food item', error));
  }

  function updateFoodItem(id: string, input: FoodItemInput) {
    setFoodItems((prev) => prev.map((f) => (f.id === id ? { ...f, ...input } : f)));
    updateFoodItemRow({ id, ...input }).catch((error) => logError('update the food item', error));
  }

  function deleteFoodItem(id: string) {
    setFoodItems((prev) => prev.filter((f) => f.id !== id));
    setDayEntries((prev) => prev.filter((e) => e.foodItemId !== id));
    deleteFoodItemRow(id).catch((error) => logError('delete the food item', error));
  }

  function addEntry(foodItemId: string, date: string) {
    const entry: DayEntry = { id: generateId(), foodItemId, date };
    setDayEntries((prev) => [...prev, entry]);
    insertDayEntry(userId, entry).catch((error) => logError('save the food entry', error));
  }

  function deleteEntry(entryId: string) {
    setDayEntries((prev) => prev.filter((e) => e.id !== entryId));
    deleteDayEntryRow(entryId).catch((error) => logError('delete the entry', error));
  }

  function moveEntry(entryId: string, date: string) {
    setDayEntries((prev) => prev.map((e) => (e.id === entryId ? { ...e, date } : e)));
    updateDayEntryDateRow(entryId, date).catch((error) => logError('move the entry', error));
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
    return <div className="h-screen bg-neutral-50" />;
  }

  return (
    <AppDataContext.Provider
      value={{
        foodItems,
        dayEntries,
        addFoodItem,
        updateFoodItem,
        deleteFoodItem,
        addEntry,
        deleteEntry,
        moveEntry,
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
  deleteFoodItem: noop,
  addEntry: noop,
  deleteEntry: noop,
  moveEntry: noop,
  getFoodItem: () => undefined,
  getGoalForDate: () => null,
  setGoalFromDate: noop,
};

/** Supplies an empty, read-only data context so the app shell can be rendered
 * as a visual backdrop (e.g. blurred behind the sign-in screen) without a real user. */
export function PreviewDataProvider({ children }: { children: ReactNode }) {
  return <AppDataContext.Provider value={previewValue}>{children}</AppDataContext.Provider>;
}
