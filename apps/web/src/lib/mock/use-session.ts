'use client';

import { useEffect, useState } from 'react';
import { type MockUser, getMockSession } from './auth';

export function useMockSession(): { user: MockUser | null; loading: boolean } {
  const [user, setUser] = useState<MockUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setUser(getMockSession());
    setLoading(false);

    function onStorage() {
      setUser(getMockSession());
    }
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  return { user, loading };
}
