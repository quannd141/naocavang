/**
 * Port for extracting plain text from a PDF buffer (F6).
 *
 * Hexagonal boundary (autonomous-mode Mock-First rule): the application service
 * depends only on this interface. In NIGHT_SHIFT_MODE we bind {@link
 * MockPdfExtractor}; with real uploads we bind a pdf-parse–backed adapter.
 */
export const PDF_EXTRACTOR = Symbol('PDF_EXTRACTOR');

export interface PdfExtractionResult {
  /** Concatenated text content across all pages. */
  text: string;
  /** Number of pages in the document (0 if unknown). */
  pageCount: number;
}

export interface PdfExtractor {
  extract(buffer: Buffer): Promise<PdfExtractionResult>;
}
