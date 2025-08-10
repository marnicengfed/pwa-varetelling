"use client";
import { useEffect, useState } from 'react';
import { db, CashCountRecord } from '@/lib/db';

interface CashCounterProps {
  monthYear: string;
}

const DENOMINATIONS = [1, 5, 10, 20, 50, 100, 200, 500, 1000];
const DEFAULT_ROLL_VALUES: Record<number, number> = {
  1: 50,
  5: 250,
  10: 500,
  20: 400,
  50: 500,
  100: 1000,
  200: 2000,
  500: 5000,
  1000: 10000
};

/**
 * Component for counting cash in two registers and the safe. Users input the
 * number of coins/bills for each denomination. For the safe, inputs are in
 * number of rolls and the value per roll can be edited. All values are
 * persisted in IndexedDB.
 */
export default function CashCounter({ monthYear }: CashCounterProps) {
  const [kasse1, setKasse1] = useState<Record<number, number>>({});
  const [kasse2, setKasse2] = useState<Record<number, number>>({});
  const [safeCounts, setSafeCounts] = useState<Record<number, number>>({});
  const [rollValues, setRollValues] = useState<Record<number, number>>(DEFAULT_ROLL_VALUES);

  // Load existing record or initialise defaults
  useEffect(() => {
    async function load() {
      const rec = await db.cashCounts.where('monthYear').equals(monthYear).first();
      if (rec) {
        setKasse1(rec.kasse1);
        setKasse2(rec.kasse2);
        setSafeCounts(rec.safe);
        setRollValues(rec.rollValues);
      }
    }
    load();
  }, [monthYear]);

  // Autosave whenever counts change
  useEffect(() => {
    const record: CashCountRecord = {
      monthYear,
      kasse1,
      kasse2,
      safe: safeCounts,
      rollValues,
      timestamp: Date.now()
    };
    db.cashCounts
      .put(record)
      .catch(() => {
        // ignore errors in development
      });
  }, [monthYear, kasse1, kasse2, safeCounts, rollValues]);

  const handleChange = (
    target: 'kasse1' | 'kasse2' | 'safe',
    denom: number,
    value: number
  ) => {
    if (target === 'kasse1') setKasse1((prev) => ({ ...prev, [denom]: value }));
    if (target === 'kasse2') setKasse2((prev) => ({ ...prev, [denom]: value }));
    if (target === 'safe') setSafeCounts((prev) => ({ ...prev, [denom]: value }));
  };

  const handleRollValueChange = (denom: number, value: number) => {
    setRollValues((prev) => ({ ...prev, [denom]: value }));
  };

  const sumKasse = (counts: Record<number, number>) => {
    return DENOMINATIONS.reduce((acc, denom) => acc + (counts[denom] || 0) * denom, 0);
  };
  const sumSafe = () => {
    return DENOMINATIONS.reduce(
      (acc, denom) => acc + (safeCounts[denom] || 0) * (rollValues[denom] ?? 0),
      0
    );
  };

  const total = sumKasse(kasse1) + sumKasse(kasse2) + sumSafe();

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Pengetelling</h2>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr>
              <th className="px-2 py-1">Valør</th>
              <th className="px-2 py-1">Kasse 1 (stk)</th>
              <th className="px-2 py-1">Kasse 2 (stk)</th>
              <th className="px-2 py-1">Safe (ruller)</th>
              <th className="px-2 py-1">Verdi pr rull (NOK)</th>
            </tr>
          </thead>
          <tbody>
            {DENOMINATIONS.map((denom) => (
              <tr key={denom} className="border-t border-gray-200 dark:border-gray-700">
                <td className="px-2 py-1 font-medium">{denom}</td>
                <td className="px-2 py-1">
                  <input
                    type="number"
                    min={0}
                    value={kasse1[denom] ?? ''}
                    onChange={(e) => handleChange('kasse1', denom, Number(e.target.value))}
                    className="w-20 p-1 border border-gray-300 dark:border-gray-600 rounded bg-transparent"
                  />
                </td>
                <td className="px-2 py-1">
                  <input
                    type="number"
                    min={0}
                    value={kasse2[denom] ?? ''}
                    onChange={(e) => handleChange('kasse2', denom, Number(e.target.value))}
                    className="w-20 p-1 border border-gray-300 dark:border-gray-600 rounded bg-transparent"
                  />
                </td>
                <td className="px-2 py-1">
                  <input
                    type="number"
                    min={0}
                    value={safeCounts[denom] ?? ''}
                    onChange={(e) => handleChange('safe', denom, Number(e.target.value))}
                    className="w-20 p-1 border border-gray-300 dark:border-gray-600 rounded bg-transparent"
                  />
                </td>
                <td className="px-2 py-1">
                  <input
                    type="number"
                    min={0}
                    value={rollValues[denom] ?? ''}
                    onChange={(e) => handleRollValueChange(denom, Number(e.target.value))}
                    className="w-28 p-1 border border-gray-300 dark:border-gray-600 rounded bg-transparent"
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="font-medium mt-2">
        Sum Kasse 1:{' '}
        {sumKasse(kasse1).toLocaleString('nb-NO', { style: 'currency', currency: 'NOK' })}
      </div>
      <div className="font-medium">
        Sum Kasse 2:{' '}
        {sumKasse(kasse2).toLocaleString('nb-NO', { style: 'currency', currency: 'NOK' })}
      </div>
      <div className="font-medium">
        Sum Safe:{' '}
        {sumSafe().toLocaleString('nb-NO', { style: 'currency', currency: 'NOK' })}
      </div>
      <div className="font-bold text-lg">
        Totalsum:{' '}
        {total.toLocaleString('nb-NO', { style: 'currency', currency: 'NOK' })}
      </div>
    </div>
  );
}