export interface FoodItem {
  id: string;
  name: string;
  color: string;
  calories: number;
  protein: number;
  fat: number;
  carbs: number;
  notes?: string; // free-form recipe / notes, one bullet per line
  hidden: boolean; // excluded from the default tray browse list, still findable via search
}

export interface DayEntry {
  id: string;
  foodItemId: string;
  date: string; // ISO yyyy-mm-dd
  hour: number; // 0-23, which hour box this entry sits in
  position: number; // display order within a day+hour slot, ascending
}

export interface DailyGoal {
  calories: number;
  protein: number;
  fat: number;
  carbs: number;
}

export interface GoalEntry extends DailyGoal {
  effectiveDate: string; // ISO yyyy-mm-dd; applies from this date forward until superseded
}

export interface EatingWindow {
  startHour: number; // 0-23, inclusive
  endHour: number; // 0-23, exclusive (the window covers [startHour, endHour))
}
