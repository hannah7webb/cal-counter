import { useState } from 'react';
import { useAppData } from '../context/AppDataContext';
import { FoodCard } from './FoodCard';
import { FoodForm } from './FoodForm';

export function FoodTray() {
  const { foodItems } = useAppData();
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);

  const filtered = foodItems.filter((item) =>
    item.name.toLowerCase().includes(search.trim().toLowerCase()),
  );

  return (
    <div className="flex min-h-35 shrink-0 flex-col gap-2 border-t border-neutral-200 bg-white px-2 py-2 sm:flex-row sm:items-center sm:gap-4 sm:px-4 sm:py-3">
      <div className="flex w-full shrink-0 flex-col justify-center gap-1 sm:w-48 sm:self-stretch sm:border-r sm:border-neutral-200 sm:pr-4">
        <label htmlFor="food-search" className="text-xs font-medium text-neutral-400">
          Food library
        </label>
        <input
          id="food-search"
          type="text"
          placeholder="Search foods..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="min-w-0 rounded-md border border-neutral-300 px-2.5 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-accent/40"
        />
      </div>

      <div className="flex flex-1 min-w-0 items-center gap-2.5 overflow-x-auto sm:self-stretch">
        {showForm ? (
          <FoodForm onClose={() => setShowForm(false)} />
        ) : (
          <button
            type="button"
            onClick={() => setShowForm(true)}
            className="flex h-23 w-25 shrink-0 flex-col items-center justify-center gap-1 rounded-lg border-2 border-dashed border-neutral-300 text-neutral-400 hover:border-accent hover:text-accent transition-colors"
          >
            <span className="text-xl leading-none">+</span>
            <span className="text-xs font-medium">New food</span>
          </button>
        )}

        {filtered.map((item) => (
          <FoodCard key={item.id} item={item} />
        ))}

        {filtered.length === 0 && (
          <span className="text-sm text-neutral-400 px-2">No foods match “{search}”.</span>
        )}
      </div>
    </div>
  );
}
