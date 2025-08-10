"use client";
import { Item } from '@/lib/types';
import Counter from './Counter';

interface ItemListProps {
  items: Item[];
  counts: Record<number, number | undefined>;
  onCountChange: (rowIndex: number, value: number | undefined) => void;
  categoryFilter: string;
  search: string;
  showMissingOnly: boolean;
  priceThreshold: number;
}

/**
 * Renders the list of items for counting. Category headings are displayed
 * whenever the category changes. Rows that exceed the price threshold are
 * highlighted with a red background. When showMissingOnly is true, only rows
 * without a count are displayed.
 */
export default function ItemList({
  items,
  counts,
  onCountChange,
  categoryFilter,
  search,
  showMissingOnly,
  priceThreshold
}: ItemListProps) {
  // Filter by category
  let filtered = items;
  if (categoryFilter && categoryFilter !== 'Alle') {
    filtered = filtered.filter((it) => it.kategori === categoryFilter);
  }
  // Filter by search term
  if (search && search.trim() !== '') {
    const term = search.toLowerCase();
    filtered = filtered.filter(
      (it) =>
        it.navn.toLowerCase().includes(term) ||
        it.artikkelnummer.toLowerCase().includes(term)
    );
  }
  // Filter missing only
  if (showMissingOnly) {
    filtered = filtered.filter((it) => counts[it.rowIndex] === undefined);
  }
  let currentCategory = '';
  return (
    <div className="space-y-4">
      {filtered.map((item) => {
        const isNewCategory = item.kategori !== currentCategory;
        if (isNewCategory) {
          currentCategory = item.kategori;
        }
        const count = counts[item.rowIndex];
        const price = item.prisPerForpakning ?? 0;
        const sum = typeof count === 'number' && price ? count * price : 0;
        const overThreshold = sum > priceThreshold;
        return (
          <div key={item.rowIndex} className="space-y-1">
            {isNewCategory && item.kategori && (
              <div className="mt-4 font-semibold text-lg text-gray-800 dark:text-gray-200">
                {item.kategori}
              </div>
            )}
            <div
              className={`flex flex-col sm:flex-row sm:items-center sm:space-x-4 p-2 rounded border border-gray-200 dark:border-gray-700 ${
                overThreshold ? 'bg-red-100 dark:bg-red-800' : 'bg-white dark:bg-gray-800'
              }`}
            >
              <div className="flex-1">
                <div className="font-medium">{item.navn}</div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  {item.enhet}
                  {item.pakningsinfo ? ` • ${item.pakningsinfo}` : ''}
                </div>
              </div>
              <Counter
                value={count}
                onChange={(val) => onCountChange(item.rowIndex, val)}
              />
              {overThreshold && (
                <span className="text-red-600 dark:text-red-300 text-xs ml-2">
                  Høy verdi – dobbeltsjekk (≈ {sum.toLocaleString('nb-NO', {
                    style: 'currency',
                    currency: 'NOK'
                  })})
                </span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}