'use client';

/**
 * Auth adapter — bridges existing FE pages to real BE API.
 * Filename kept as 'mock/auth.ts' to avoid refactoring all import sites.
 * Behind the scenes: calls /api/auth/* on the NestJS backend.
 * If BE is unreachable, falls back to a local stub so demo still works offline.
 */

import { ApiError, authApi, clearApiToken, setApiToken } from '../api-client';
import { simulateNetwork } from './delay';

export interface MockUser {
  id: string;
  email: string;
  name: string;
  tier: 'free' | 'premium' | 'pro' | 'admin';
  avatar?: string;
  avatarUrl?: string | null;
  createdAt: string;
}

const USER_KEY = 'nao-ca-vang:mock-session';

function getStorage(): Storage | null {
  return typeof window === 'undefined' ? null : window.localStorage;
}

function persistUser(user: MockUser): void {
  const s = getStorage();
  if (s) s.setItem(USER_KEY, JSON.stringify(user));
}

function clearUser(): void {
  const s = getStorage();
  if (s) s.removeItem(USER_KEY);
}

export function getMockSession(): MockUser | null {
  const s = getStorage();
  if (!s) return null;
  const raw = s.getItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as MockUser;
  } catch {
    return null;
  }
}

export function setMockSession(user: MockUser): void {
  persistUser(user);
}

export function clearMockSession(): void {
  clearUser();
  clearApiToken();
}

function toMockUser(beUser: {
  id: string;
  email: string;
  name: string;
  tier: string;
  avatarUrl?: string | null;
}): MockUser {
  return {
    id: beUser.id,
    email: beUser.email,
    name: beUser.name,
    tier: beUser.tier as MockUser['tier'],
    avatarUrl: beUser.avatarUrl ?? null,
    createdAt: new Date().toISOString(),
  };
}

export async function mockLogin(email: string, password: string): Promise<MockUser> {
  try {
    const result = await authApi.login(email, password);
    const user = toMockUser(result.user);
    persistUser(user);
    return user;
  } catch (err) {
    if (err instanceof ApiError && err.status === 0) {
      // BE offline — graceful demo fallback
      await simulateNetwork();
      const user: MockUser = {
        id: 'offline-user',
        email,
        name: email.split('@')[0] ?? 'Demo',
        tier: 'free',
        createdAt: new Date().toISOString(),
      };
      persistUser(user);
      return user;
    }
    throw err;
  }
}

export async function mockRegister(input: {
  name: string;
  email: string;
  password: string;
}): Promise<MockUser> {
  try {
    const result = await authApi.register(input);
    const user = toMockUser(result.user);
    persistUser(user);
    return user;
  } catch (err) {
    if (err instanceof ApiError && err.status === 0) {
      await simulateNetwork();
      const user: MockUser = {
        id: 'offline-user',
        email: input.email,
        name: input.name,
        tier: 'free',
        createdAt: new Date().toISOString(),
      };
      persistUser(user);
      return user;
    }
    throw err;
  }
}

export async function mockGoogleLogin(): Promise<MockUser> {
  // Real Google OAuth blocked by PH-001 — keep demo bypass.
  await simulateNetwork(300, 600);
  const user: MockUser = {
    id: 'mock-user-google',
    email: 'demo@gmail.com',
    name: 'Quân Demo',
    tier: 'free',
    avatar: 'https://api.dicebear.com/9.x/avataaars/svg?seed=quan',
    createdAt: new Date().toISOString(),
  };
  // Try the seeded admin to get a real BE token; ignore failures.
  try {
    const result = await authApi.login('admin@nao-ca-vang.local', 'admin');
    persistUser(toMockUser(result.user));
    return toMockUser(result.user);
  } catch {
    setApiToken(null);
    persistUser(user);
    return user;
  }
}

export async function mockLogout(): Promise<void> {
  try {
    await authApi.logout();
  } catch {
    // ignore
  }
  clearUser();
}
