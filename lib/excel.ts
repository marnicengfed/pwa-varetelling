import type * as XLSXType from 'xlsx';
import { Item, CountsByRow } from './types';

/**
 * Finds the header row of the worksheet. The header row is defined as the row
 * where the first cell has a value equal to 'ANTALL' (case-insensitiv). If
 * none is found, returns -1.
 */
export function findHeaderRow(ws: XLSXType.WorkSheet): number {
  const XLSX = require('xlsx') as typeof XLSXType;
  const range = XLSX.utils.decode_range(ws['!ref'] as string);
  for (let r = range.s.r; r <= range.e.r; r++) {
    const cellAddress = XLSX.utils.encode_cell({ r, c: 0 });
    const cell = ws[cellAddress];
    if (cell && typeof cell.v === 'string') {
      const val = cell.v.toString().trim().toUpperCase();
      if (val === 'ANTALL') {
        return r;
      }
    }
  }
  return -1;
}

/**
 * Parses items from the provided workbook. It looks for a sheet named
 * `VARETELLINGSLISTE` if present. If not, the first sheet is used. The header
 * row is automatically detected using `findHeaderRow`, after which columns
 * are mapped based on their headers.
 *
 * @param workbook The workbook to parse.
 * @param preferredSheetName Optional preferred sheet to parse.
 */
export function parseItems(
  workbook: XLSXType.WorkBook,
  preferredSheetName?: string
): Item[] {
  const XLSX = require('xlsx') as typeof XLSXType;
  const sheetName =
    preferredSheetName && workbook.Sheets[preferredSheetName]
      ? preferredSheetName
      : workbook.Sheets['VARETELLINGSLISTE']
      ? 'VARETELLINGSLISTE'
      : workbook.SheetNames[0];
  const ws = workbook.Sheets[sheetName];
  if (!ws) {
    throw new Error('Fant ikke arket som skal parse');
  }
  const headerRow = findHeaderRow(ws);
  if (headerRow === -1) {
    throw new Error('Fant ikke header-raden (ANTALL)');
  }
  const range = XLSX.utils.decode_range(ws['!ref'] as string);
  // Map the columns by reading the header row
  const colMap: Record<string, number> = {};
  for (let c = range.s.c; c <= range.e.c; c++) {
    const cellAddress = XLSX.utils.encode_cell({ r: headerRow, c });
    const cell = ws[cellAddress];
    if (!cell || typeof cell.v !== 'string') continue;
    const header = cell.v.toString().trim().toUpperCase();
    if (header.includes('ANTALL')) colMap.antall = c;
    if (header.includes('ARTIKKEL')) colMap.artikkel = c;
    if (header.includes('VARENAVN')) colMap.navn = c;
    if (header.includes('FORPAKNINGEN') && header.includes('SKAL')) colMap.enhet = c;
    if (header.includes('HVOR') && header.includes('PAKNINGEN')) colMap.pakningsinfo = c;
    if (header.includes('PRIS') && header.includes('PER')) colMap.pris = c;
  }
  const items: Item[] = [];
  let currentKategori = '';
  for (let r = headerRow + 1; r <= range.e.r; r++) {
    // Determine if this row is a category row: no artikkelnummer but first cell has text
    const artCellAddress = XLSX.utils.encode_cell({ r, c: colMap.artikkel ?? 0 });
    const artCell = ws[artCellAddress];
    const artVal = artCell ? artCell.v : undefined;
    const firstCell = ws[XLSX.utils.encode_cell({ r, c: 0 })];
    const firstVal = firstCell ? firstCell.v : undefined;
    // Category row detection
    if ((!artVal || artVal === '') && firstVal && typeof firstVal === 'string' && firstVal.trim() !== '') {
      currentKategori = firstVal.toString().trim();
      continue;
    }
    if (!artVal || artVal === '') {
      // Skip empty rows
      continue;
    }
    const navnCell = ws[XLSX.utils.encode_cell({ r, c: colMap.navn ?? 0 })];
    const enhetCell = ws[XLSX.utils.encode_cell({ r, c: colMap.enhet ?? 0 })];
    const pakningCell = ws[XLSX.utils.encode_cell({ r, c: colMap.pakningsinfo ?? -1 })];
    const prisCell = ws[XLSX.utils.encode_cell({ r, c: colMap.pris ?? -1 })];
    const antallCell = ws[XLSX.utils.encode_cell({ r, c: colMap.antall ?? 0 })];
    const item: Item = {
      rowIndex: r + 1, // store 1-based index for Excel
      kategori: currentKategori,
      artikkelnummer: artVal?.toString() ?? '',
      navn: navnCell?.v?.toString() ?? '',
      enhet: enhetCell?.v?.toString() ?? '',
      pakningsinfo: pakningCell?.v?.toString() || undefined,
      prisPerForpakning: prisCell && typeof prisCell.v === 'number' ? Number(prisCell.v) : undefined,
      antall: antallCell && typeof antallCell.v === 'number' ? Number(antallCell.v) : undefined
    };
    items.push(item);
  }
  return items;
}

/**
 * Applies updated counts back into the original workbook and returns a Blob for
 * downloading. Only the cells in the ANTALL column are modified. The rest of
 * the workbook, including formulas and conditional formatting, remains
 * untouched. The caller is responsible for prompting the user to save the
 * returned blob as an `.xlsx` file.
 *
 * @param originalWorkbook The workbook loaded from the user's file upload.
 * @param counts A map of rowIndex (1-based) to new counts.
 * @param preferredSheetName Optional sheet name to write back into.
 */
export function applyCountsAndExport(
  originalWorkbook: XLSXType.WorkBook,
  counts: CountsByRow,
  preferredSheetName?: string
): Blob {
  const XLSX = require('xlsx') as typeof XLSXType;
  const sheetName =
    preferredSheetName && originalWorkbook.Sheets[preferredSheetName]
      ? preferredSheetName
      : originalWorkbook.Sheets['VARETELLINGSLISTE']
      ? 'VARETELLINGSLISTE'
      : originalWorkbook.SheetNames[0];
  const ws = originalWorkbook.Sheets[sheetName];
  const headerRow = findHeaderRow(ws);
  if (headerRow === -1) {
    throw new Error('Fant ikke header-raden ved eksport');
  }
  // Determine ANTALL column index
  const range = XLSX.utils.decode_range(ws['!ref'] as string);
  let antallCol = 0;
  for (let c = range.s.c; c <= range.e.c; c++) {
    const cellAddress = XLSX.utils.encode_cell({ r: headerRow, c });
    const cell = ws[cellAddress];
    if (cell && typeof cell.v === 'string' && cell.v.toString().trim().toUpperCase().includes('ANTALL')) {
      antallCol = c;
      break;
    }
  }
  // Write counts into sheet
  Object.entries(counts).forEach(([rowStr, value]) => {
    const rowIndex = parseInt(rowStr, 10) - 1; // convert back to zero-based row index
    const addr = XLSX.utils.encode_cell({ r: rowIndex, c: antallCol });
    const cell = ws[addr] || {};
    // assign new value and mark as number
    ws[addr] = { ...cell, v: value, t: 'n' };
  });
  // Create a binary array and convert to blob
  const out = XLSX.write(originalWorkbook, { bookType: 'xlsx', type: 'array' });
  const blob = new Blob([out], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  return blob;
}