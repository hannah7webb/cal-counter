import { useState } from 'react';
import { SortableContext, horizontalListSortingStrategy } from '@dnd-kit/sortable';
import { useAppData } from '../context/AppDataContext';
import { FoodCard } from './FoodCard';
import { FoodForm } from './FoodForm';

export function FoodTray() {
  const { foodItems } = useAppData();
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);

  const trimmedSearch = search.trim().toLowerCase();
  const isSearching = trimmedSearch.length > 0;
  const filtered = foodItems
    .filter((item) => {
      if (!item.name.toLowerCase().includes(trimmedSearch)) return false;
      return isSearching || !item.hidden;
    })
    .sort((a, b) => a.position - b.position);

  return (
    <div className="flex min-h-24 shrink-0 flex-col gap-2 border-t border-neutral-200 bg-white px-2 py-2 sm:flex-row sm:items-center sm:gap-4 sm:px-4 sm:py-3 dark:border-neutral-800 dark:bg-black">
      <div className="flex w-full shrink-0 flex-col justify-center gap-1 sm:w-48 sm:self-stretch sm:border-r sm:border-neutral-200 sm:pr-4 dark:sm:border-neutral-800">
        <label htmlFor="food-search" className="text-xs font-medium text-neutral-400 dark:text-neutral-500">
          Food library
        </label>
        <input
          id="food-search"
          type="text"
          placeholder="Search foods..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="min-w-0 rounded-md border border-neutral-300 px-2.5 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-accent/40 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100"
        />
      </div>

      <div className="flex flex-1 min-w-0 items-center gap-2.5 overflow-x-auto sm:self-stretch">
        {showForm ? (
          <FoodForm onClose={() => setShowForm(false)} />
        ) : (
          <button
            type="button"
            onClick={() => setShowForm(true)}
            className="flex h-16 w-33 shrink-0 flex-col items-center justify-center gap-1 rounded-md border-2 border-dashed border-neutral-300 text-neutral-400 hover:border-accent hover:text-accent transition-colors dark:border-neutral-700 dark:text-neutral-500"
          >
            <span className="text-xl leading-none">+</span>
            <span className="text-xs font-medium">New food</span>
          </button>
        )}

        <SortableContext
          items={filtered.map((item) => `food-${item.id}`)}
          strategy={horizontalListSortingStrategy}
        >
          {filtered.map((item) => (
            <FoodCard key={item.id} item={item} />
          ))}
        </SortableContext>

        {filtered.length === 0 && isSearching && (
          <span className="text-sm text-neutral-400 px-2 dark:text-neutral-500">No foods match “{search}”.</span>
        )}
      </div>
    </div>
  );
}
