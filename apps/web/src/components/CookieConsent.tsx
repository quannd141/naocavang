'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { hasConsented, recordConsent } from '@/lib/consent';

/**
 * Minimal cookie/storage notice. We only use functional storage (login session
 * + preferences), so this is an acknowledgement banner — no tracking opt-in. It
 * shows once per policy version, dismissed via localStorage.
 */
export function CookieConsent() {
  // Start hidden to avoid SSR/hydration mismatch; decide on the client after mount.
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!hasConsented()) setVisible(true);
  }, []);

  if (!visible) return null;

  function accept() {
    recordConsent(new Date().toISOString());
    setVisible(false);
  }

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 border-t border-border bg-white/95 backdrop-blur p-4 shadow-lg">
      <div className="container mx-auto flex flex-col items-center gap-3 sm:flex-row sm:justify-between">
        <p className="text-sm text-muted-foreground">
          🍪 Não Cá Vàng dùng cookie/lưu trữ cục bộ ở mức cần thiết để duy trì đăng nhập và ghi nhớ
          lựa chọn. Xem{' '}
          <Link href="/privacy" className="text-brand-700 underline">
            Chính sách quyền riêng tư
          </Link>
          .
        </p>
        <Button size="sm" onClick={accept} className="shrink-0">
          Đã hiểu
        </Button>
      </div>
    </div>
  );
}
