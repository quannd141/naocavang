/**
 * Standard API response envelope (per architecture.md rules §API Response Format).
 *
 * All endpoints return either ApiSuccess<T> or ApiError. Discriminate via `success`.
 */

export interface ApiSuccess<T> {
  success: true;
  data: T;
  meta?: ApiMeta;
}

export interface ApiError {
  success: false;
  error: {
    code: string;
    message: string;
    details?: unknown[];
  };
}

export interface ApiMeta {
  page?: number;
  pageSize?: number;
  total?: number;
  totalPages?: number;
}

export type ApiResponse<T> = ApiSuccess<T> | ApiError;
