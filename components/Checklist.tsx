"use client";
import { useEffect, useState } from 'react';
import { db, ChecklistRecord } from '@/lib/db';

interface ChecklistProps {
  monthYear: string;
}

/** Default checklist items to seed a new month. */
const DEFAULT_ITEMS: Omit<ChecklistRecord, 'id' | 'monthYear'>[] = [
  { text: 'Alle varer er telt', checked: false },
  { text: 'Eventuelle avvik er notert', checked: false },
  { text: 'Summert per kategori', checked: false }
];

/**
 * Renders a checklist for the given month. Items are persisted in IndexedDB.
 * Users can mark items as complete and optionally add a comment. Progress is
 * shown as x/y completed. Autosaving happens on every change.
 */
export default function Checklist({ monthYear }: ChecklistProps) {
  const [items, setItems] = useState<ChecklistRecord[]>([]);
  const total = items.length;
  const completed = items.filter((it) => it.checked).length;

  useEffect(() => {
    async function load() {
      const stored = await db.checklist.where('monthYear').equals(monthYear).toArray();
      if (stored.length > 0) {
        setItems(stored);
      } else {
        // Seed defaults
        const defaults = DEFAULT_ITEMS.map((it) => ({ ...it, monthYear }));
        const ids = await db.checklist.bulkAdd(defaults);
        const seeded = await db.checklist.where('monthYear').equals(monthYear).toArray();
        setItems(seeded);
      }
    }
    load();
  }, [monthYear]);

  async function toggleCheck(item: ChecklistRecord, checked: boolean) {
    const updated = { ...item, checked };
    await db.checklist.update(item.id!, updated);
    setItems((prev) => prev.map((it) => (it.id === item.id ? updated : it)));
  }

  async function updateComment(item: ChecklistRecord, comment: string) {
    const updated = { ...item, comment };
    await db.checklist.update(item.id!, updated);
    setItems((prev) => prev.map((it) => (it.id === item.id ? updated : it)));
  }

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Sjekkliste ({completed}/{total})</h2>
      <ul className="space-y-3">
        {items.map((item) => (
          <li key={item.id} className="border border-gray-200 dark:border-gray-700 p-3 rounded bg-white dark:bg-gray-800">
            <label className="flex items-start space-x-2">
              <input
                type="checkbox"
                checked={item.checked}
                onChange={(e) => toggleCheck(item, e.target.checked)}
                className="mt-1 form-checkbox"
              />
              <div className="flex-1">
                <div className="font-medium">{item.text}</div>
                <textarea
                  value={item.comment ?? ''}
                  placeholder="Kommentar"
                  onChange={(e) => updateComment(item, e.target.value)}
                  className="w-full mt-1 p-1 border border-gray-300 dark:border-gray-600 rounded bg-transparent text-sm"
                />
              </div>
            </label>
          </li>
        ))}
      </ul>
    </div>
  );
}