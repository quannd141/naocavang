'use client';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/api';
const TOKEN_KEY = 'nao-ca-vang:bearer';

export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly code?: string,
    readonly raw?: unknown,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return window.localStorage.getItem(TOKEN_KEY);
}

export function setApiToken(token: string | null): void {
  if (typeof window === 'undefined') return;
  if (token) window.localStorage.setItem(TOKEN_KEY, token);
  else window.localStorage.removeItem(TOKEN_KEY);
}

export function clearApiToken(): void {
  setApiToken(null);
}

export interface ApiRequestOptions {
  method?: 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE';
  body?: unknown;
  /** Skip auth header even if token exists */
  noAuth?: boolean;
  /** Don't unwrap { success, data } — return raw response */
  raw?: boolean;
}

export interface ApiEnvelope<T> {
  success: boolean;
  data: T;
}

export async function apiRequest<T>(path: string, opts: ApiRequestOptions = {}): Promise<T> {
  const url = `${BASE_URL}${path.startsWith('/') ? path : `/${path}`}`;
  const headers: Record<string, string> = {
    'content-type': 'application/json',
  };
  if (!opts.noAuth) {
    const token = getToken();
    if (token) headers.authorization = `Bearer ${token}`;
  }

  let res: Response;
  try {
    res = await fetch(url, {
      method: opts.method ?? 'GET',
      headers,
      body: opts.body ? JSON.stringify(opts.body) : undefined,
      credentials: 'omit',
    });
  } catch (err) {
    throw new ApiError(
      `Không kết nối được API (${(err as Error).message}). Kiểm tra BE đang chạy?`,
      0,
      'NETWORK_ERROR',
    );
  }

  const isJson = res.headers.get('content-type')?.includes('application/json');
  const body = isJson ? await res.json() : await res.text();

  if (!res.ok) {
    const code = (body as { code?: string })?.code;
    const message = (body as { message?: string | string[] })?.message;
    const msg = Array.isArray(message) ? message.join('. ') : (message ?? `HTTP ${res.status}`);
    throw new ApiError(msg, res.status, code, body);
  }

  if (opts.raw) return body as T;
  // BE wraps responses in { success, data }
  if (body && typeof body === 'object' && 'data' in (body as Record<string, unknown>)) {
    return (body as ApiEnvelope<T>).data;
  }
  return body as T;
}

// ---------- typed helpers ----------

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  tier: 'free' | 'premium' | 'pro' | 'admin';
  avatarUrl?: string | null;
  aiQuotaRemaining?: number;
  emailVerified?: boolean;
}

export interface LoginResponse {
  token: string;
  expiresAt: string;
  user: AuthUser;
}

export const authApi = {
  async login(email: string, password: string): Promise<LoginResponse> {
    const result = await apiRequest<LoginResponse>('/auth/login', {
      method: 'POST',
      body: { email, password },
      noAuth: true,
    });
    setApiToken(result.token);
    return result;
  },

  async register(input: { name: string; email: string; password: string }): Promise<LoginResponse> {
    await apiRequest<{ id: string; email: string; name: string }>('/auth/register', {
      method: 'POST',
      body: input,
      noAuth: true,
    });
    // BE register endpoint doesn't return a session — login immediately for UX parity with mock.
    return authApi.login(input.email, input.password);
  },

  async logout(): Promise<void> {
    try {
      await apiRequest('/auth/logout', { method: 'DELETE' });
    } catch {
      // ignore — clear local token regardless
    }
    clearApiToken();
  },

  async me(): Promise<AuthUser> {
    return apiRequest<AuthUser>('/users/me');
  },
};

export interface UserStats {
  mindmapCount: number;
  deckCount: number;
  quizCount: number;
  dueCards: number;
  reviewsToday: number;
  streak: number;
  recentMindmaps: Array<{
    id: string;
    title: string;
    subject: string | null;
    updatedAt: string;
  }>;
  recentDecks: Array<{
    id: string;
    title: string;
    mindmapId: string;
    dueCards: number;
    updatedAt: string;
  }>;
}

export interface ReviewActivity {
  /** Window length in days (clamped server-side to [1,90]). */
  days: number;
  /** One bucket per day, oldest first, ending today. */
  buckets: Array<{ date: string; count: number }>;
  /** Total reviews across the window. */
  total: number;
}

export const statsApi = {
  me: () => apiRequest<UserStats>('/users/me/stats'),
  activity: (days?: number) =>
    apiRequest<ReviewActivity>(`/users/me/activity${days ? `?days=${days}` : ''}`),
};

export interface UserExport {
  exportedAt: string;
  schemaVersion: number;
  user: { id: string; email: string; name: string; tier: string; createdAt: string };
  mindmaps: unknown[];
  flashcardDecks: unknown[];
  quizzes: unknown[];
}

export const userApi = {
  updateMe: (input: { name: string }) =>
    apiRequest<AuthUser>('/users/me', { method: 'PATCH', body: input }),
  changePassword: (input: { oldPassword: string; newPassword: string }) =>
    apiRequest<void>('/users/me/change-password', { method: 'POST', body: input }),
  exportData: () => apiRequest<UserExport>('/users/me/export'),
  deleteAccount: (input: { password?: string }) =>
    apiRequest<void>('/users/me', { method: 'DELETE', body: input }),
};

export interface MindMapSummary {
  id: string;
  title: string;
  description: string | null;
  subject: string | null;
  tags: string[];
  isPublic: boolean;
  sourceType: string;
  sourceTemplateId: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface MindMapFull extends MindMapSummary {
  userId: string;
  data: { nodes: unknown[]; edges: unknown[]; [key: string]: unknown };
}

export interface PublicMindMap {
  id: string;
  title: string;
  description: string | null;
  subject: string | null;
  tags: string[];
  data: { nodes: unknown[]; edges: unknown[]; [key: string]: unknown };
  authorName: string;
  sourceType: string;
  createdAt: string;
  updatedAt: string;
}

export interface PublicMindMapSummary {
  id: string;
  title: string;
  description: string | null;
  subject: string | null;
  tags: string[];
  authorName: string;
  createdAt: string;
  updatedAt: string;
}

export const mindmapApi = {
  list: () => apiRequest<MindMapSummary[]>('/mindmaps'),
  get: (id: string) => apiRequest<MindMapFull>(`/mindmaps/${id}`),
  getPublic: (id: string) => apiRequest<PublicMindMap>(`/public/mindmaps/${id}`, { noAuth: true }),
  listPublic: (opts?: { subject?: string; limit?: number }) => {
    const qs = new URLSearchParams();
    if (opts?.subject) qs.set('subject', opts.subject);
    if (opts?.limit) qs.set('limit', String(opts.limit));
    const suffix = qs.toString() ? `?${qs.toString()}` : '';
    return apiRequest<PublicMindMapSummary[]>(`/public/mindmaps${suffix}`, { noAuth: true });
  },
  create: (input: {
    title: string;
    description?: string;
    data: object;
    subject?: string;
    tags?: string[];
  }) => apiRequest<MindMapFull>('/mindmaps', { method: 'POST', body: input }),
  createFromTemplate: (templateId: string) =>
    apiRequest<MindMapFull>(`/mindmaps/from-template/${templateId}`, { method: 'POST' }),
  clone: (id: string) => apiRequest<MindMapFull>(`/mindmaps/${id}/clone`, { method: 'POST' }),
  update: (
    id: string,
    input: Partial<{
      title: string;
      description: string;
      data: object;
      tags: string[];
      isPublic: boolean;
    }>,
  ) => apiRequest<MindMapFull>(`/mindmaps/${id}`, { method: 'PATCH', body: input }),
  delete: (id: string) => apiRequest<void>(`/mindmaps/${id}`, { method: 'DELETE' }),
};

export interface TemplateSummary {
  id: string;
  title: string;
  description: string;
  subject: string | null;
  gradeLevel: string | null;
  tags: string[];
  authorName: string;
  useCount: number;
  likeCount: number;
  createdAt: string;
}

export interface TemplateFull extends TemplateSummary {
  data: { nodes: unknown[]; edges: unknown[]; [key: string]: unknown };
}

export const templateApi = {
  list: (filters?: { subject?: string; grade?: string }) => {
    const qs = filters
      ? `?${new URLSearchParams(filters as Record<string, string>).toString()}`
      : '';
    return apiRequest<TemplateSummary[]>(`/templates${qs}`);
  },
  get: (id: string) => apiRequest<TemplateFull>(`/templates/${id}`),
};

export interface AiMindMapResult {
  mindmap: unknown;
  meta: {
    model: string;
    inputTokens: number;
    outputTokens: number;
    latencyMs: number;
    costUsd: number;
  };
}

export const aiApi = {
  generateMindMap: (prompt: string, subject?: string) =>
    apiRequest<AiMindMapResult>('/ai/generate/mindmap', {
      method: 'POST',
      body: { prompt, subject },
    }),
};

// ---------- Tutor ----------

export interface TutorAnswer {
  answer: string;
  model: string;
}

export const tutorApi = {
  ask: (question: string, context?: { topicTitle?: string; subject?: string }) =>
    apiRequest<TutorAnswer>('/tutor/chat', {
      method: 'POST',
      body: { question, ...context },
    }),
};

// ---------- Ingest (PDF upload — F6) ----------

export interface IngestResult {
  mindmapId: string;
  deckId: string | null;
  title: string;
  cardCount: number;
  meta: {
    pageCount: number;
    textLength: number;
    models: { mindmap: string; flashcard: string };
  };
}

export const ingestApi = {
  /**
   * Upload a PDF as multipart/form-data. Cannot reuse apiRequest (which forces a
   * JSON content-type) — the browser must set the multipart boundary itself, so
   * we deliberately omit content-type here.
   */
  async uploadPdf(file: File, opts?: { title?: string; subject?: string }): Promise<IngestResult> {
    const url = `${BASE_URL}/ingest/pdf`;
    const form = new FormData();
    form.append('file', file);
    if (opts?.title) form.append('title', opts.title);
    if (opts?.subject) form.append('subject', opts.subject);

    const token = getToken();
    const headers: Record<string, string> = {};
    if (token) headers.authorization = `Bearer ${token}`;

    let res: Response;
    try {
      res = await fetch(url, { method: 'POST', headers, body: form, credentials: 'omit' });
    } catch (err) {
      throw new ApiError(
        `Không kết nối được API (${(err as Error).message}). Kiểm tra BE đang chạy?`,
        0,
        'NETWORK_ERROR',
      );
    }

    const isJson = res.headers.get('content-type')?.includes('application/json');
    const body = isJson ? await res.json() : await res.text();
    if (!res.ok) {
      const code = (body as { code?: string })?.code;
      const message = (body as { message?: string | string[] })?.message;
      const msg = Array.isArray(message) ? message.join('. ') : (message ?? `HTTP ${res.status}`);
      throw new ApiError(msg, res.status, code, body);
    }
    return (body as ApiEnvelope<IngestResult>).data;
  },
};

// ---------- Flashcards ----------

export interface FlashcardDeckSummary {
  id: string;
  title: string;
  mindmapId: string;
  subject: string | null;
  totalCards: number;
  dueCards: number;
  createdAt: string;
  updatedAt: string;
}

export interface FlashcardCard {
  id: string;
  deckId: string;
  question: string;
  answer: string;
  format: 'qa' | 'cloze' | 'mcq';
  easeFactor: string;
  interval: number;
  repetitions: number;
  nextReviewAt: string;
  lastReviewedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface FlashcardDeckFull {
  id: string;
  title: string;
  mindmapId: string;
  userId: string;
  cards: FlashcardCard[];
  mindmap: { id: string; title: string; subject: string | null };
  createdAt: string;
  updatedAt: string;
}

export interface ReviewResult {
  card: FlashcardCard;
  sm2: { easeFactor: number; interval: number; repetitions: number };
  nextReviewAt: string;
}

// ---------- Quiz ----------

export type QuizQuestionType = 'multiple_choice' | 'cloze' | 'short_answer';

export interface QuizSummary {
  id: string;
  title: string;
  difficulty: 'easy' | 'medium' | 'hard';
  mindmapId: string;
  mindmapTitle: string;
  subject: string | null;
  questionCount: number;
  attemptCount: number;
  createdAt: string;
}

export interface QuizQuestion {
  id: string;
  type: QuizQuestionType;
  question: string;
  options: string[] | null;
  position: number;
  correctAnswer?: string;
  explanation?: string | null;
}

export interface QuizFull {
  id: string;
  title: string;
  difficulty: 'easy' | 'medium' | 'hard';
  mindmapId: string;
  mindmap: { id: string; title: string; subject: string | null };
  questions: QuizQuestion[];
  createdAt: string;
}

export interface QuizAttemptResult {
  attemptId: string;
  score: number;
  correctCount: number;
  totalQuestions: number;
  results: Array<{
    questionId: string;
    type: QuizQuestionType;
    question: string;
    options: string[] | null;
    userAnswer: string;
    correctAnswer: string;
    explanation: string | null;
    correct: boolean;
  }>;
  wrongAnswersAddedToDeckId: string | null;
}

export const quizApi = {
  list: () => apiRequest<QuizSummary[]>('/quizzes'),
  get: (id: string, reveal = false) =>
    apiRequest<QuizFull>(`/quizzes/${id}${reveal ? '?reveal=true' : ''}`),
  createFromMindmap: (
    mindmapId: string,
    opts?: { title?: string; difficulty?: 'easy' | 'medium' | 'hard' },
  ) =>
    apiRequest<QuizFull>(`/quizzes/from-mindmap/${mindmapId}`, {
      method: 'POST',
      body: opts ?? {},
    }),
  delete: (id: string) => apiRequest<void>(`/quizzes/${id}`, { method: 'DELETE' }),
  submit: (
    quizId: string,
    answers: Array<{ questionId: string; answer: string }>,
    timeSpentSec?: number,
  ) =>
    apiRequest<QuizAttemptResult>(`/quizzes/${quizId}/attempts`, {
      method: 'POST',
      body: { answers, timeSpentSec },
    }),
  listAttempts: (quizId: string) => apiRequest<QuizAttemptSummary[]>(`/quizzes/${quizId}/attempts`),
};

export interface QuizAttemptSummary {
  id: string;
  score: number;
  timeSpentSec: number;
  completedAt: string;
}

export interface DueForecast {
  /** Cards due before today (need catching up). */
  overdue: number;
  /** One bucket per day, today-first. */
  buckets: Array<{ date: string; count: number }>;
  /** Cards due within the window (excludes overdue). */
  total: number;
  /** Window length in days (clamped server-side to [1,30]). */
  days: number;
}

export const flashcardApi = {
  listDecks: () => apiRequest<FlashcardDeckSummary[]>('/flashcards/decks'),
  getForecast: (days?: number) =>
    apiRequest<DueForecast>(`/flashcards/forecast${days ? `?days=${days}` : ''}`),
  getDeck: (id: string) => apiRequest<FlashcardDeckFull>(`/flashcards/decks/${id}`),
  createDeck: (input: {
    title: string;
    mindmapId: string;
    cards: Array<{ question: string; answer: string; format?: 'qa' | 'cloze' | 'mcq' }>;
  }) => apiRequest<FlashcardDeckFull>('/flashcards/decks', { method: 'POST', body: input }),
  createFromMindmap: (mindmapId: string, title?: string) =>
    apiRequest<FlashcardDeckFull>(`/flashcards/decks/from-mindmap/${mindmapId}`, {
      method: 'POST',
      body: title ? { title } : {},
    }),
  updateDeck: (id: string, input: { title?: string }) =>
    apiRequest<FlashcardDeckFull>(`/flashcards/decks/${id}`, { method: 'PATCH', body: input }),
  deleteDeck: (id: string) => apiRequest<void>(`/flashcards/decks/${id}`, { method: 'DELETE' }),
  getDue: (deckId: string, limit = 20) =>
    apiRequest<FlashcardCard[]>(`/flashcards/decks/${deckId}/due?limit=${limit}`),
  review: (cardId: string, quality: 0 | 1 | 2 | 3 | 4) =>
    apiRequest<ReviewResult>(`/flashcards/cards/${cardId}/review`, {
      method: 'POST',
      body: { quality },
    }),
  addCards: (
    deckId: string,
    cards: Array<{ question: string; answer: string; format?: 'qa' | 'cloze' | 'mcq' }>,
  ) =>
    apiRequest<{ count: number }>(`/flashcards/decks/${deckId}/cards`, {
      method: 'POST',
      body: { cards },
    }),
  deleteCard: (cardId: string) =>
    apiRequest<void>(`/flashcards/cards/${cardId}`, { method: 'DELETE' }),
};
