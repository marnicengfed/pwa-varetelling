"use client";
import { useState, useEffect } from 'react';
import * as XLSX from 'xlsx';
import { parseItems, applyCountsAndExport } from '@/lib/excel';
import { Item } from '@/lib/types';
import { db } from '@/lib/db';
import ItemList from '@/components/ItemList';
import Filters from '@/components/Filters';
import Checklist from '@/components/Checklist';
import CashCounter from '@/components/CashCounter';
import HistoryList from '@/components/HistoryList';

type Tab = 'tally' | 'checklist' | 'cash' | 'history';

/**
 * Attempts to extract a month-year string (YYYY-MM) from the provided file
 * name. It looks for Norwegian month names followed by a 4‑digit year. If
 * parsing fails, the current month and year are used.
 */
function parseMonthYearFromFile(name: string): string {
  const upper = name.toUpperCase();
  const months: Record<string, string> = {
    JANUAR: '01',
    FEBRUAR: '02',
    MARS: '03',
    APRIL: '04',
    MAI: '05',
    JUNI: '06',
    JULI: '07',
    AUGUST: '08',
    SEPTEMBER: '09',
    OKTOBER: '10',
    NOVEMBER: '11',
    DESEMBER: '12'
  };
  const monthMatch = Object.keys(months).find((m) => upper.includes(m));
  const yearMatch = upper.match(/20\d{2}/)?.[0];
  if (monthMatch && yearMatch) {
    return `${yearMatch}-${months[monthMatch]}`;
  }
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const year = String(now.getFullYear());
  return `${year}-${month}`;
}

export default function HomePage() {
  const [tab, setTab] = useState<Tab>('tally');
  const [fileName, setFileName] = useState<string>('');
  const [workbook, setWorkbook] = useState<XLSX.WorkBook | null>(null);
  const [items, setItems] = useState<Item[]>([]);
  const [counts, setCounts] = useState<Record<number, number>>({});
  const [monthYear, setMonthYear] = useState<string>('');
  const [categoryFilter, setCategoryFilter] = useState<string>('Alle');
  const [search, setSearch] = useState<string>('');
  const [showMissingOnly, setShowMissingOnly] = useState<boolean>(false);
  const [priceThreshold, setPriceThreshold] = useState<number>(1000);

  // Derived categories for filter
  const categories = Array.from(new Set(items.map((i) => i.kategori))).filter(
    (c) => c && c.trim() !== ''
  );

  // Handle file upload and parse workbook
  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const buffer = await file.arrayBuffer();
    const wb = XLSX.read(buffer, { type: 'array' });
    setWorkbook(wb);
    setFileName(file.name);
    const parsedItems = parseItems(wb);
    setItems(parsedItems);
    const my = parseMonthYearFromFile(file.name);
    setMonthYear(my);
    // Attempt to load existing counts for this month/file
    const rec = await db.counts
      .where({ monthYear: my, fileName: file.name })
      .first();
    if (rec) {
      setCounts(rec.counts);
    } else {
      setCounts({});
    }
    // Reset filters
    setCategoryFilter('Alle');
    setSearch('');
    setShowMissingOnly(false);
  }

  // Keep counts persisted to IndexedDB
  useEffect(() => {
    if (!monthYear || !fileName) return;
    const save = async () => {
      const record = {
        monthYear,
        fileName,
        counts,
        timestamp: Date.now()
      };
      await db.counts.put(record);
    };
    // Debounce saving to avoid thrashing
    const handle = setTimeout(() => {
      save();
    }, 300);
    return () => clearTimeout(handle);
  }, [counts, monthYear, fileName]);

  // Update counts when user changes a value
  function handleCountChange(rowIndex: number, value: number | undefined) {
    setCounts((prev) => {
      const next = { ...prev };
      if (value === undefined) {
        delete next[rowIndex];
      } else {
        next[rowIndex] = value;
      }
      return next;
    });
  }

  // Export updated workbook to file
  async function handleExport() {
    if (!workbook) return;
    const blob = applyCountsAndExport(workbook, counts);
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const safeName = fileName ? fileName.replace(/\.xlsx$/i, '') : 'varetelling';
    link.download = `${safeName}-oppdatert.xlsx`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    alert('Eksport fullført');
  }

  return (
    <div className="max-w-5xl mx-auto">
      {/* Navigation tabs */}
      <div className="flex space-x-4 mb-4 border-b border-gray-300 dark:border-gray-700">
        <button
          className={`px-3 py-2 ${tab === 'tally' ? 'border-b-2 border-blue-500 font-medium' : ''}`}
          onClick={() => setTab('tally')}
        >
          Varetelling
        </button>
        <button
          className={`px-3 py-2 ${
            tab === 'checklist' ? 'border-b-2 border-blue-500 font-medium' : ''
          }`}
          onClick={() => setTab('checklist')}
        >
          Sjekkliste
        </button>
        <button
          className={`px-3 py-2 ${tab === 'cash' ? 'border-b-2 border-blue-500 font-medium' : ''}`}
          onClick={() => setTab('cash')}
        >
          Pengetelling
        </button>
        <button
          className={`px-3 py-2 ${tab === 'history' ? 'border-b-2 border-blue-500 font-medium' : ''}`}
          onClick={() => setTab('history')}
        >
          Historikk
        </button>
      </div>
      {/* Content */}
      {tab === 'tally' && (
        <div>
          {!workbook && (
            <div className="space-y-4">
              <p>Last opp varetellingsfilen din (Excel) for å starte tellingen.</p>
              <input type="file" accept=".xlsx, .xls" onChange={handleFileChange} />
            </div>
          )}
          {workbook && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <div className="font-medium">{fileName}</div>
                <button
                  onClick={handleExport}
                  className="px-3 py-2 rounded bg-blue-600 text-white text-sm"
                >
                  Eksporter til original mal (.xlsx)
                </button>
              </div>
              <Filters
                categories={categories}
                categoryFilter={categoryFilter}
                onCategoryChange={setCategoryFilter}
                search={search}
                onSearchChange={setSearch}
                showMissingOnly={showMissingOnly}
                onShowMissingOnlyChange={setShowMissingOnly}
                priceThreshold={priceThreshold}
                onPriceThresholdChange={setPriceThreshold}
              />
              <ItemList
                items={items}
                counts={counts}
                onCountChange={handleCountChange}
                categoryFilter={categoryFilter}
                search={search}
                showMissingOnly={showMissingOnly}
                priceThreshold={priceThreshold}
              />
            </div>
          )}
        </div>
      )}
      {tab === 'checklist' && (
        <div>
          {monthYear ? (
            <Checklist monthYear={monthYear} />
          ) : (
            <p>Last opp en varetellingsfil for å hente riktig måned.</p>
          )}
        </div>
      )}
      {tab === 'cash' && (
        <div>
          {monthYear ? (
            <CashCounter monthYear={monthYear} />
          ) : (
            <p>Last opp en varetellingsfil for å hente riktig måned.</p>
          )}
        </div>
      )}
      {tab === 'history' && <HistoryList />}
    </div>
  );
}