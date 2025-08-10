"use client";
import { useState } from 'react';

interface CounterProps {
  value: number | undefined;
  onChange: (value: number | undefined) => void;
}

/**
 * Counter component for incrementing/decrementing an optional numeric value.
 * A missing value is treated as zero until the user interacts with the field.
 * The component exposes small plus/minus buttons and an input field. Using
 * the minus button when the value is undefined has no effect. Holding the
 * Shift key while clicking the +/- buttons increases/decreases by 10.
 */
export default function Counter({ value, onChange }: CounterProps) {
  const [internal, setInternal] = useState<number | ''>(value ?? '');
  // Keep local state in sync with external changes
  // (external value is authoritative when it changes)
  if (value !== undefined && value !== (internal === '' ? undefined : internal)) {
    setInternal(value);
  }
  const commit = (val: number | '') => {
    setInternal(val);
    const parsed = val === '' ? undefined : Number(val);
    onChange(parsed);
  };
  const increment = (delta: number) => {
    const current = internal === '' || internal === undefined ? 0 : Number(internal);
    commit(current + delta);
  };
  return (
    <div className="flex items-center space-x-1">
      <button
        type="button"
        onClick={(e) => {
          const delta = e.shiftKey ? -10 : -1;
          increment(delta);
        }}
        className="px-2 py-1 rounded bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200"
      >
        -
      </button>
      <input
        type="number"
        className="w-20 px-2 py-1 border rounded bg-transparent border-gray-300 dark:border-gray-600"
        value={internal}
        onChange={(e) => {
          const val = e.target.value;
          commit(val === '' ? '' : Number(val));
        }}
      />
      <button
        type="button"
        onClick={(e) => {
          const delta = e.shiftKey ? 10 : 1;
          increment(delta);
        }}
        className="px-2 py-1 rounded bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200"
      >
        +
      </button>
    </div>
  );
}