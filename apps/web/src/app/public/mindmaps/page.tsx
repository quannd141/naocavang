'use client';

import Link from 'next/link';
import { Search } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ApiError, type PublicMindMapSummary, mindmapApi } from '@/lib/api-client';

const SUBJECT_FILTERS = [
  { id: 'all', label: 'Tất cả' },
  { id: 'math', label: 'Toán' },
  { id: 'physics', label: 'Lý' },
  { id: 'chemistry', label: 'Hoá' },
  { id: 'biology', label: 'Sinh' },
  { id: 'history', label: 'Sử' },
  { id: 'geography', label: 'Địa' },
  { id: 'literature', label: 'Văn' },
  { id: 'english', label: 'Anh' },
  { id: 'general', label: 'Tổng hợp' },
];

const SUBJECT_LABEL: Record<string, string> = {
  math: 'Toán',
  physics: 'Lý',
  chemistry: 'Hoá',
  biology: 'Sinh',
  history: 'Sử',
  geography: 'Địa',
  literature: 'Văn',
  english: 'Anh',
  general: 'Tổng hợp',
};

function normaliseForSearch(s: string): string {
  return s
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '') // strip combining diacritic marks
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'd')
    .toLowerCase();
}

function timeAgo(iso: string): string {
  const ms = Date.now() - new Date(iso).getTime();
  const m = Math.floor(ms / 60000);
  if (m < 1) return 'vừa xong';
  if (m < 60) return `${m} phút trước`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h} giờ trước`;
  const d = Math.floor(h / 24);
  if (d < 7) return `${d} ngày trước`;
  return new Date(iso).toLocaleDateString('vi-VN');
}

export default function PublicGalleryPage() {
  const [items, setItems] = useState<PublicMindMapSummary[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [subject, setSubject] = useState('all');

  useEffect(() => {
    mindmapApi
      .listPublic({ limit: 50 })
      .then(setItems)
      .catch((err) => {
        setError(err instanceof ApiError ? err.message : (err as Error).message);
        setItems([]);
      });
  }, []);

  const filtered = useMemo(() => {
    if (!items) return null;
    const q = normaliseForSearch(query.trim());
    return items.filter((mm) => {
      if (subject !== 'all' && (mm.subject ?? 'general') !== subject) return false;
      if (q.length === 0) return true;
      const haystack = normaliseForSearch(
        `${mm.title} ${mm.description ?? ''} ${mm.authorName} ${(mm.tags ?? []).join(' ')}`,
      );
      return haystack.includes(q);
    });
  }, [items, query, subject]);

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-white/80 backdrop-blur">
        <div className="container mx-auto flex items-center justify-between gap-4 px-4 py-3 lg:px-6">
          <Link href="/" className="font-bold text-brand-700">
            🐟 NãoCáVàng
          </Link>
          <div className="flex gap-2">
            <Button asChild variant="outline" size="sm">
              <Link href="/login">Đăng nhập</Link>
            </Button>
            <Button asChild size="sm">
              <Link href="/register">Tạo tài khoản</Link>
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto max-w-6xl px-4 py-8 lg:px-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight">🌍 Thư viện công khai</h1>
          <p className="mt-2 text-muted-foreground">
            Khám phá mind map được cộng đồng chia sẻ. Mở để xem, sao chép về tài khoản và học ngay.
          </p>
        </div>

        {error && (
          <Card className="mt-6 border-red-300 bg-red-50">
            <CardContent className="p-4 text-sm text-red-700">
              ⚠️ {error} — Kiểm tra BE đang chạy ở <code>http://localhost:3001</code>?
            </CardContent>
          </Card>
        )}

        {items && items.length > 0 && (
          <div className="mt-8 flex flex-col gap-3 md:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Tìm theo title, tác giả, mô tả... (bỏ qua dấu tiếng Việt)"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <div className="flex flex-wrap gap-1">
              {SUBJECT_FILTERS.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setSubject(s.id)}
                  className={`rounded-md border px-3 py-1 text-xs transition-colors ${
                    subject === s.id
                      ? 'border-brand-500 bg-brand-50 font-medium text-brand-700'
                      : 'border-border text-muted-foreground hover:bg-muted'
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="mt-6">
          {items === null ? (
            <div className="text-muted-foreground">Đang tải...</div>
          ) : items.length === 0 ? (
            <Card className="border-2 border-dashed">
              <CardContent className="py-16 text-center">
                <div className="mb-3 text-5xl">🌱</div>
                <div className="font-semibold">Chưa có mind map công khai nào</div>
                <div className="mt-1 text-sm text-muted-foreground">
                  Hãy là người đầu tiên chia sẻ — bật "🌍 Public" trên mind map của bạn.
                </div>
              </CardContent>
            </Card>
          ) : filtered && filtered.length === 0 ? (
            <Card className="border-2 border-dashed">
              <CardContent className="py-12 text-center">
                <div className="mb-3 text-4xl">🔍</div>
                <div className="font-semibold">Không có mind map khớp bộ lọc</div>
                <Button
                  variant="outline"
                  className="mt-4"
                  onClick={() => {
                    setQuery('');
                    setSubject('all');
                  }}
                >
                  Reset bộ lọc
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {(filtered ?? []).map((mm) => (
                <Link key={mm.id} href={`/public/mindmaps/${mm.id}`}>
                  <Card className="h-full cursor-pointer transition-all hover:border-brand-400 hover:shadow-md">
                    <div className="flex aspect-video items-center justify-center bg-gradient-to-br from-brand-100 to-brand-50 text-5xl">
                      🗺️
                    </div>
                    <CardContent className="p-4">
                      <div className="text-xs font-medium text-brand-700">
                        {mm.subject ? SUBJECT_LABEL[mm.subject] ?? mm.subject : 'Tổng hợp'}
                      </div>
                      <div className="mt-1 line-clamp-2 font-semibold">{mm.title}</div>
                      <div className="mt-2 text-xs text-muted-foreground">
                        bởi <strong>{mm.authorName}</strong> • {timeAgo(mm.updatedAt)}
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
