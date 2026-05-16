'use client';

import { simulateNetwork } from './delay';

export interface MockUser {
  id: string;
  email: string;
  name: string;
  tier: 'free' | 'premium' | 'pro';
  avatar?: string;
  createdAt: string;
}

const STORAGE_KEY = 'nao-ca-vang:mock-session';

function getStorage(): Storage | null {
  if (typeof window === 'undefined') return null;
  return window.localStorage;
}

export function getMockSession(): MockUser | null {
  const storage = getStorage();
  if (!storage) return null;
  const raw = storage.getItem(STORAGE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as MockUser;
  } catch {
    return null;
  }
}

export function setMockSession(user: MockUser): void {
  const storage = getStorage();
  if (!storage) return;
  storage.setItem(STORAGE_KEY, JSON.stringify(user));
}

export function clearMockSession(): void {
  const storage = getStorage();
  if (!storage) return;
  storage.removeItem(STORAGE_KEY);
}

export async function mockLogin(email: string, _password: string): Promise<MockUser> {
  await simulateNetwork();
  const user: MockUser = {
    id: 'mock-user-1',
    email,
    name: email.split('@')[0],
    tier: 'free',
    createdAt: new Date().toISOString(),
  };
  setMockSession(user);
  return user;
}

export async function mockRegister(input: {
  name: string;
  email: string;
  password: string;
}): Promise<MockUser> {
  await simulateNetwork();
  const user: MockUser = {
    id: 'mock-user-1',
    email: input.email,
    name: input.name,
    tier: 'free',
    createdAt: new Date().toISOString(),
  };
  setMockSession(user);
  return user;
}

export async function mockGoogleLogin(): Promise<MockUser> {
  await simulateNetwork(300, 600);
  const user: MockUser = {
    id: 'mock-user-google',
    email: 'demo@gmail.com',
    name: 'Quân Demo',
    tier: 'free',
    avatar: 'https://api.dicebear.com/9.x/avataaars/svg?seed=quan',
    createdAt: new Date().toISOString(),
  };
  setMockSession(user);
  return user;
}

export function mockLogout(): void {
  clearMockSession();
}
