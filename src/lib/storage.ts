import type { FoodItem, DayEntry, GoalEntry } from '../types';

const FOOD_ITEMS_KEY = 'cal-counter:foodItems';
const DAY_ENTRIES_KEY = 'cal-counter:dayEntries';
const GOALS_KEY = 'cal-counter:goals';

const DEFAULT_FOOD_ITEMS: FoodItem[] = [
  { id: 'seed-1', name: 'Oatmeal', color: 'amber', calories: 150, protein: 5, fat: 3, carbs: 27 },
  { id: 'seed-2', name: 'Chicken Breast', color: 'rose', calories: 165, protein: 31, fat: 3.6, carbs: 0 },
  { id: 'seed-3', name: 'Brown Rice', color: 'orange', calories: 216, protein: 5, fat: 1.8, carbs: 45 },
  { id: 'seed-4', name: 'Broccoli', color: 'green', calories: 55, protein: 3.7, fat: 0.6, carbs: 11 },
  { id: 'seed-5', name: 'Greek Yogurt', color: 'sky', calories: 100, protein: 17, fat: 0.7, carbs: 6 },
  { id: 'seed-6', name: 'Almonds', color: 'purple', calories: 164, protein: 6, fat: 14, carbs: 6 },
];

export function loadFoodItems(): FoodItem[] {
  const raw = localStorage.getItem(FOOD_ITEMS_KEY);
  if (raw === null) return DEFAULT_FOOD_ITEMS;
  try {
    return JSON.parse(raw) as FoodItem[];
  } catch {
    return DEFAULT_FOOD_ITEMS;
  }
}

export function saveFoodItems(items: FoodItem[]): void {
  localStorage.setItem(FOOD_ITEMS_KEY, JSON.stringify(items));
}

export function loadDayEntries(): DayEntry[] {
  const raw = localStorage.getItem(DAY_ENTRIES_KEY);
  if (raw === null) return [];
  try {
    return JSON.parse(raw) as DayEntry[];
  } catch {
    return [];
  }
}

export function saveDayEntries(entries: DayEntry[]): void {
  localStorage.setItem(DAY_ENTRIES_KEY, JSON.stringify(entries));
}

export function loadGoals(): GoalEntry[] {
  const raw = localStorage.getItem(GOALS_KEY);
  if (raw === null) return [];
  try {
    return JSON.parse(raw) as GoalEntry[];
  } catch {
    return [];
  }
}

export function saveGoals(goals: GoalEntry[]): void {
  localStorage.setItem(GOALS_KEY, JSON.stringify(goals));
}
