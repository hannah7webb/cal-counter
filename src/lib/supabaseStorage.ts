import { supabase } from './supabaseClient';
import type { FoodItem, DayEntry, GoalEntry } from '../types';

interface FoodItemRow {
  id: string;
  name: string;
  color: string;
  calories: number;
  protein: number;
  fat: number;
  carbs: number;
  notes: string | null;
  hidden: boolean;
}

interface DayEntryRow {
  id: string;
  food_item_id: string;
  date: string;
  position: number;
}

interface GoalRow {
  effective_date: string;
  calories: number;
  protein: number;
  fat: number;
  carbs: number;
}

function mapFoodItem(row: FoodItemRow): FoodItem {
  return {
    id: row.id,
    name: row.name,
    color: row.color,
    calories: row.calories,
    protein: row.protein,
    fat: row.fat,
    carbs: row.carbs,
    notes: row.notes ?? undefined,
    hidden: row.hidden,
  };
}

function mapDayEntry(row: DayEntryRow): DayEntry {
  return { id: row.id, foodItemId: row.food_item_id, date: row.date, position: row.position };
}

function mapGoal(row: GoalRow): GoalEntry {
  return {
    effectiveDate: row.effective_date,
    calories: row.calories,
    protein: row.protein,
    fat: row.fat,
    carbs: row.carbs,
  };
}

export async function fetchAllData(userId: string): Promise<{
  foodItems: FoodItem[];
  dayEntries: DayEntry[];
  goals: GoalEntry[];
}> {
  const [foodItemsRes, dayEntriesRes, goalsRes] = await Promise.all([
    supabase.from('food_items').select('*').eq('user_id', userId),
    supabase.from('day_entries').select('*').eq('user_id', userId),
    supabase.from('goals').select('*').eq('user_id', userId),
  ]);

  if (foodItemsRes.error) throw foodItemsRes.error;
  if (dayEntriesRes.error) throw dayEntriesRes.error;
  if (goalsRes.error) throw goalsRes.error;

  return {
    foodItems: (foodItemsRes.data as FoodItemRow[]).map(mapFoodItem),
    dayEntries: (dayEntriesRes.data as DayEntryRow[]).map(mapDayEntry),
    goals: (goalsRes.data as GoalRow[]).map(mapGoal),
  };
}

export async function insertFoodItem(userId: string, item: FoodItem): Promise<void> {
  const { error } = await supabase.from('food_items').insert({
    id: item.id,
    user_id: userId,
    name: item.name,
    color: item.color,
    calories: item.calories,
    protein: item.protein,
    fat: item.fat,
    carbs: item.carbs,
    notes: item.notes ?? null,
    hidden: item.hidden,
  });
  if (error) throw error;
}

export async function updateFoodItemRow(item: FoodItem): Promise<void> {
  const { error } = await supabase
    .from('food_items')
    .update({
      name: item.name,
      color: item.color,
      calories: item.calories,
      protein: item.protein,
      fat: item.fat,
      carbs: item.carbs,
      notes: item.notes ?? null,
    })
    .eq('id', item.id);
  if (error) throw error;
}

export async function updateFoodItemHiddenRow(id: string, hidden: boolean): Promise<void> {
  const { error } = await supabase.from('food_items').update({ hidden }).eq('id', id);
  if (error) throw error;
}

export async function deleteFoodItemRow(id: string): Promise<void> {
  const { error } = await supabase.from('food_items').delete().eq('id', id);
  if (error) throw error;
}

export async function insertDayEntry(userId: string, entry: DayEntry): Promise<void> {
  const { error } = await supabase.from('day_entries').insert({
    id: entry.id,
    user_id: userId,
    food_item_id: entry.foodItemId,
    date: entry.date,
    position: entry.position,
  });
  if (error) throw error;
}

export async function deleteDayEntryRow(id: string): Promise<void> {
  const { error } = await supabase.from('day_entries').delete().eq('id', id);
  if (error) throw error;
}

export async function updateDayEntryDateRow(id: string, date: string, position: number): Promise<void> {
  const { error } = await supabase.from('day_entries').update({ date, position }).eq('id', id);
  if (error) throw error;
}

export async function updateDayEntryPositions(
  updates: { id: string; position: number }[],
): Promise<void> {
  const results = await Promise.all(
    updates.map(({ id, position }) =>
      supabase.from('day_entries').update({ position }).eq('id', id),
    ),
  );
  const failed = results.find((r) => r.error);
  if (failed?.error) throw failed.error;
}

export async function upsertGoalRow(userId: string, goal: GoalEntry): Promise<void> {
  const { error } = await supabase
    .from('goals')
    .upsert(
      {
        user_id: userId,
        effective_date: goal.effectiveDate,
        calories: goal.calories,
        protein: goal.protein,
        fat: goal.fat,
        carbs: goal.carbs,
      },
      { onConflict: 'user_id,effective_date' },
    );
  if (error) throw error;
}
