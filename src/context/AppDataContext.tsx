import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import type { FoodItem, DayEntry, DailyGoal, GoalEntry } from '../types';
import {
  loadFoodItems,
  saveFoodItems,
  loadDayEntries,
  saveDayEntries,
  loadGoals,
  saveGoals,
} from '../lib/storage';

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
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

export function AppDataProvider({ children }: { children: ReactNode }) {
  const [foodItems, setFoodItems] = useState<FoodItem[]>(loadFoodItems);
  const [dayEntries, setDayEntries] = useState<DayEntry[]>(loadDayEntries);
  const [goals, setGoals] = useState<GoalEntry[]>(loadGoals);

  useEffect(() => {
    saveFoodItems(foodItems);
  }, [foodItems]);

  useEffect(() => {
    saveDayEntries(dayEntries);
  }, [dayEntries]);

  useEffect(() => {
    saveGoals(goals);
  }, [goals]);

  function addFoodItem(input: FoodItemInput) {
    const item: FoodItem = { id: generateId(), ...input };
    setFoodItems((prev) => [...prev, item]);
  }

  function updateFoodItem(id: string, input: FoodItemInput) {
    setFoodItems((prev) => prev.map((f) => (f.id === id ? { ...f, ...input } : f)));
  }

  function deleteFoodItem(id: string) {
    setFoodItems((prev) => prev.filter((f) => f.id !== id));
    setDayEntries((prev) => prev.filter((e) => e.foodItemId !== id));
  }

  function addEntry(foodItemId: string, date: string) {
    const entry: DayEntry = { id: generateId(), foodItemId, date };
    setDayEntries((prev) => [...prev, entry]);
  }

  function deleteEntry(entryId: string) {
    setDayEntries((prev) => prev.filter((e) => e.id !== entryId));
  }

  function moveEntry(entryId: string, date: string) {
    setDayEntries((prev) => prev.map((e) => (e.id === entryId ? { ...e, date } : e)));
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
    setGoals((prev) => [...prev.filter((g) => g.effectiveDate !== date), { effectiveDate: date, ...goal }]);
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
