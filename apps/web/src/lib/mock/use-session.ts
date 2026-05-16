'use client';

import { useEffect, useState } from 'react';
import { ApiError, authApi } from '../api-client';
import { type MockUser, getMockSession, setMockSession } from './auth';

/**
 * Returns the current session. Reads localStorage first (instant), then
 * refreshes from /users/me in background to update quota / verify token.
 */
export function useMockSession(): { user: MockUser | null; loading: boolean } {
  const [user, setUser] = useState<MockUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const cached = getMockSession();
    setUser(cached);
    setLoading(false);

    // background refresh against BE — silent on failure
    authApi
      .me()
      .then((fresh) => {
        const merged: MockUser = {
          id: fresh.id,
          email: fresh.email,
          name: fresh.name,
          tier: fresh.tier,
          avatarUrl: fresh.avatarUrl ?? null,
          createdAt: cached?.createdAt ?? new Date().toISOString(),
        };
        setUser(merged);
        setMockSession(merged);
      })
      .catch((err: unknown) => {
        // 401 = stale token, clear it; network error = stay on cached
        if (err instanceof ApiError && err.status === 401) {
          setUser(null);
        }
      });

    function onStorage(e: StorageEvent) {
      if (e.key === 'nao-ca-vang:mock-session') setUser(getMockSession());
    }
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  return { user, loading };
}
