import Dexie, { type Table } from 'dexie';

/**
 * CountsRecord stores the per-row counts for a specific month and file. The
 * counts object is keyed by the 1‑based row index from the original
 * workbook.
 */
export interface CountsRecord {
  id?: number;
  monthYear: string;
  fileName: string;
  counts: Record<number, number>;
  /** Unix timestamp (ms) when this record was created or updated. */
  timestamp: number;
}

/**
 * ChecklistRecord stores a line item in a checklist for a given month. Users
 * can mark items as complete and add optional comments.
 */
export interface ChecklistRecord {
  id?: number;
  monthYear: string;
  text: string;
  checked: boolean;
  comment?: string;
}

/**
 * CashCountRecord stores cash counting results for a given month. Each record
 * contains the counts per denomination for each register (kasse) and the safe.
 */
export interface CashCountRecord {
  id?: number;
  monthYear: string;
  /** Counts per valør for Kasse 1 (number of coins/bills). */
  kasse1: Record<string, number>;
  /** Counts per valør for Kasse 2 (number of coins/bills). */
  kasse2: Record<string, number>;
  /** Counts per valør for the safe (number of rolls). */
  safe: Record<string, number>;
  /** Stored roll values at the time of counting. */
  rollValues: Record<string, number>;
  timestamp: number;
}

class InventoryDB extends Dexie {
  counts!: Table<CountsRecord, number>;
  checklist!: Table<ChecklistRecord, number>;
  cashCounts!: Table<CashCountRecord, number>;

  constructor() {
    super('inventoryDB');
    this.version(1).stores({
      counts: '++id, monthYear',
      checklist: '++id, monthYear',
      cashCounts: '++id, monthYear'
    });
  }
}

/**
 * The global IndexedDB instance used throughout the application. All
 * operations (autosaving, history, checklist and cash counting) go through
 * this object. Dexie automatically handles IndexedDB opening, migrations and
 * transactions.
 */
export const db = new InventoryDB();