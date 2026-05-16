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
    const msg = Array.isArray(message) ? message.join('. ') : message ?? `HTTP ${res.status}`;
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

export const mindmapApi = {
  list: () => apiRequest<MindMapSummary[]>('/mindmaps'),
  get: (id: string) => apiRequest<MindMapFull>(`/mindmaps/${id}`),
  create: (input: {
    title: string;
    description?: string;
    data: object;
    subject?: string;
    tags?: string[];
  }) => apiRequest<MindMapFull>('/mindmaps', { method: 'POST', body: input }),
  createFromTemplate: (templateId: string) =>
    apiRequest<MindMapFull>(`/mindmaps/from-template/${templateId}`, { method: 'POST' }),
  update: (id: string, input: Partial<{ title: string; description: string; data: object; tags: string[]; isPublic: boolean }>) =>
    apiRequest<MindMapFull>(`/mindmaps/${id}`, { method: 'PATCH', body: input }),
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
    const qs = filters ? `?${new URLSearchParams(filters as Record<string, string>).toString()}` : '';
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
