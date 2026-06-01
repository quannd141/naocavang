/**
 * Client-side PDF validation, mirroring the backend rules in
 * apps/api/.../domain/pdf-validation.ts. Pure + SSR-safe so it can be unit
 * tested and used to give instant feedback before a network round-trip.
 */

/** Keep in sync with the backend MAX_PDF_BYTES (10 MB). */
export const MAX_PDF_BYTES = 10 * 1024 * 1024;

export interface PdfFileLike {
  name: string;
  type: string;
  size: number;
}

export interface PdfValidation {
  ok: boolean;
  error?: string;
}

/** Validate a selected file before upload. Accepts the PDF mime OR a .pdf name. */
export function validatePdfFile(
  file: PdfFileLike | null | undefined,
  maxBytes = MAX_PDF_BYTES,
): PdfValidation {
  if (!file) return { ok: false, error: 'Chưa chọn file' };
  const isPdf = file.type === 'application/pdf' || /\.pdf$/i.test(file.name);
  if (!isPdf) return { ok: false, error: 'Chỉ chấp nhận file PDF (.pdf)' };
  if (file.size <= 0) return { ok: false, error: 'File rỗng, không có nội dung' };
  if (file.size > maxBytes) {
    const mb = Math.round(maxBytes / (1024 * 1024));
    return { ok: false, error: `File vượt quá giới hạn ${mb}MB` };
  }
  return { ok: true };
}

/** Human-readable file size. */
export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
