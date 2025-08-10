export interface Item {
  /**
   * The 1-based row index from the original worksheet where this item resides.
   */
  rowIndex: number;
  /** The category name derived from the nearest category row above this row. */
  kategori: string;
  /** The article number (ARTIKKELNR.) for this item. */
  artikkelnummer: string;
  /** The display name (VARENAVN) for this item. */
  navn: string;
  /** The unit to count (FORPAKNINGEN DU SKAL TELLE). */
  enhet: string;
  /** Additional package information (HVOR MYE ER DET I FORPAKNINGEN?). */
  pakningsinfo?: string;
  /** Price per packaging, used for warnings. */
  prisPerForpakning?: number;
  /** The counted amount for this item (ANTALL). */
  antall?: number;
}

export interface CountsByRow {
  [rowIndex: number]: number;
}