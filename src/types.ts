export interface FoodItem {
  id: string;
  name: string;
  color: string;
  calories: number;
  protein: number;
  fat: number;
  carbs: number;
  notes?: string; // free-form recipe / notes, one bullet per line
}

export interface DayEntry {
  id: string;
  foodItemId: string;
  date: string; // ISO yyyy-mm-dd
  servings: number;
}

export interface DailyGoal {
  calories: number;
  protein: number;
  fat: number;
  carbs: number;
}
