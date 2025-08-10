"use client";
import { useEffect, useState } from 'react';
import { db, CountsRecord } from '@/lib/db';

interface HistoryListProps {}

/**
 * Displays a history of saved counts. Each record corresponds to a month and
 * includes the file name and timestamp. Users can export the data as CSV.
 */
export default function HistoryList({}: HistoryListProps) {
  const [records, setRecords] = useState<CountsRecord[]>([]);

  useEffect(() => {
    async function load() {
      const all = await db.counts.orderBy('timestamp').reverse().toArray();
      setRecords(all);
    }
    load();
  }, []);

  async function exportCsv(record: CountsRecord) {
    // Generate CSV with rowIndex and count
    const rows = Object.entries(record.counts).map(([row, count]) => `${row},${count}`);
    const csvContent = `rowIndex,count\n${rows.join('\n')}`;
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${record.monthYear}-counts.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Historikk</h2>
      {records.length === 0 && <p>Ingen historikk tilgjengelig.</p>}
      {records.map((rec) => (
        <div key={rec.id} className="border border-gray-200 dark:border-gray-700 p-3 rounded bg-white dark:bg-gray-800 flex justify-between items-center">
          <div>
            <div className="font-medium">{rec.fileName}</div>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              {rec.monthYear} – {new Date(rec.timestamp).toLocaleDateString('nb-NO')}
            </div>
          </div>
          <button
            onClick={() => exportCsv(rec)}
            className="px-2 py-1 rounded bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-100 text-sm"
          >
            Eksporter CSV
          </button>
        </div>
      ))}
    </div>
  );
}