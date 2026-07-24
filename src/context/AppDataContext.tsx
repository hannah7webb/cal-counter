import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import type { FoodItem, DayEntry, DailyGoal } from '../types';
import {
  loadFoodItems,
  saveFoodItems,
  loadDayEntries,
  saveDayEntries,
  loadGoal,
  saveGoal,
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
  updateEntryServings: (entryId: string, servings: number) => void;
  deleteEntry: (entryId: string) => void;
  moveEntry: (entryId: string, date: string) => void;
  getFoodItem: (id: string) => FoodItem | undefined;
  goal: DailyGoal | null;
  setGoal: (goal: DailyGoal) => void;
}

const AppDataContext = createContext<AppDataContextValue | null>(null);

function generateId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

export function AppDataProvider({ children }: { children: ReactNode }) {
  const [foodItems, setFoodItems] = useState<FoodItem[]>(loadFoodItems);
  const [dayEntries, setDayEntries] = useState<DayEntry[]>(loadDayEntries);
  const [goal, setGoalState] = useState<DailyGoal | null>(loadGoal);

  useEffect(() => {
    saveFoodItems(foodItems);
  }, [foodItems]);

  useEffect(() => {
    saveDayEntries(dayEntries);
  }, [dayEntries]);

  useEffect(() => {
    saveGoal(goal);
  }, [goal]);

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
    const entry: DayEntry = { id: generateId(), foodItemId, date, servings: 1 };
    setDayEntries((prev) => [...prev, entry]);
  }

  function updateEntryServings(entryId: string, servings: number) {
    setDayEntries((prev) => prev.map((e) => (e.id === entryId ? { ...e, servings } : e)));
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

  function setGoal(newGoal: DailyGoal) {
    setGoalState(newGoal);
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
        updateEntryServings,
        deleteEntry,
        moveEntry,
        getFoodItem,
        goal,
        setGoal,
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
