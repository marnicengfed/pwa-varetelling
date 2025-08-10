"use client";
import { useState } from 'react';

interface FiltersProps {
  categories: string[];
  categoryFilter: string;
  onCategoryChange: (val: string) => void;
  search: string;
  onSearchChange: (val: string) => void;
  showMissingOnly: boolean;
  onShowMissingOnlyChange: (val: boolean) => void;
  priceThreshold: number;
  onPriceThresholdChange: (val: number) => void;
}

/**
 * Provides UI controls for filtering the item list. Users can choose a
 * category, search by name or article number, show only missing counts and
 * adjust the price threshold for warnings.
 */
export default function Filters({
  categories,
  categoryFilter,
  onCategoryChange,
  search,
  onSearchChange,
  showMissingOnly,
  onShowMissingOnlyChange,
  priceThreshold,
  onPriceThresholdChange
}: FiltersProps) {
  const [thresholdInput, setThresholdInput] = useState(priceThreshold.toString());
  return (
    <div className="space-y-2 mb-4">
      <div className="flex flex-col sm:flex-row sm:space-x-4 space-y-2 sm:space-y-0">
        <div className="flex-1">
          <label className="block text-sm font-medium mb-1">Kategori</label>
          <select
            value={categoryFilter}
            onChange={(e) => onCategoryChange(e.target.value)}
            className="w-full border border-gray-300 dark:border-gray-600 rounded px-2 py-1 bg-white dark:bg-gray-800"
          >
            <option value="Alle">Alle</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>
        <div className="flex-1">
          <label className="block text-sm font-medium mb-1">Søk</label>
          <input
            type="text"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Søk etter navn eller artikkelnummer"
            className="w-full border border-gray-300 dark:border-gray-600 rounded px-2 py-1 bg-white dark:bg-gray-800"
          />
        </div>
      </div>
      <div className="flex flex-col sm:flex-row sm:space-x-4 space-y-2 sm:space-y-0 items-center">
        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={showMissingOnly}
            onChange={(e) => onShowMissingOnlyChange(e.target.checked)}
            className="form-checkbox"
          />
          <span className="text-sm">Vis kun manglende tall</span>
        </label>
        <div className="flex items-center space-x-2">
          <label className="text-sm">Avviksgrense (NOK)</label>
          <input
            type="number"
            value={thresholdInput}
            onChange={(e) => {
              const val = e.target.value;
              setThresholdInput(val);
              const num = parseFloat(val);
              if (!isNaN(num)) onPriceThresholdChange(num);
            }}
            className="w-28 border border-gray-300 dark:border-gray-600 rounded px-2 py-1 bg-white dark:bg-gray-800"
          />
        </div>
      </div>
    </div>
  );
}