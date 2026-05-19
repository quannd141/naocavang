'use client';

import Link from 'next/link';
import { Plus, RefreshCw, Search } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { PageHeader } from '@/components/layout/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ApiError } from '@/lib/api-client';
import { type MindMapSummary, mindmapApi } from '@/lib/api-client';

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

function normaliseForSearch(s: string): string {
  return s
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'd')
    .toLowerCase();
}

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

export default function MindMapsPage() {
  const [items, setItems] = useState<MindMapSummary[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [subject, setSubject] = useState<string>('all');

  async function load() {
    setError(null);
    try {
      const data = await mindmapApi.list();
      setItems(data);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : (err as Error).message);
      setItems([]);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(() => {
    if (!items) return null;
    const q = normaliseForSearch(query.trim());
    return items.filter((mm) => {
      if (subject !== 'all' && (mm.subject ?? 'general') !== subject) return false;
      if (q.length === 0) return true;
      const haystack = normaliseForSearch(
        `${mm.title} ${mm.description ?? ''} ${(mm.tags ?? []).join(' ')}`,
      );
      return haystack.includes(q);
    });
  }, [items, query, subject]);

  return (
    <div className="container mx-auto px-4 lg:px-6 py-8 max-w-6xl">
      <PageHeader
        title="Mind maps"
        description="Sơ đồ tư duy của bạn. Click để mở editor."
        action={
          <div className="flex gap-2">
            <Button variant="outline" onClick={load} title="Refresh">
              <RefreshCw className="h-4 w-4" />
            </Button>
            <Button asChild>
              <Link href="/mindmaps/new">
                <Plus className="h-4 w-4" /> Tạo mới
              </Link>
            </Button>
          </div>
        }
      />

      {error && (
        <Card className="mb-6 border-red-300 bg-red-50">
          <CardContent className="p-4 text-sm text-red-700">
            ⚠️ {error} — Kiểm tra BE đang chạy ở <code>http://localhost:3001</code>?
          </CardContent>
        </Card>
      )}

      {items && items.length > 0 && (
        <div className="mb-6 flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Tìm theo title, mô tả, tag... (bỏ qua dấu tiếng Việt)"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <div className="flex gap-1 flex-wrap">
            {SUBJECT_FILTERS.map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => setSubject(s.id)}
                className={`px-3 py-1 text-xs rounded-md border transition-colors ${
                  subject === s.id
                    ? 'border-brand-500 bg-brand-50 text-brand-700 font-medium'
                    : 'border-border text-muted-foreground hover:bg-muted'
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {items === null ? (
        <div className="text-muted-foreground">Đang tải...</div>
      ) : items.length === 0 ? (
        <Card className="border-2 border-dashed">
          <CardContent className="text-center py-16">
            <div className="text-5xl mb-3">🗺️</div>
            <div className="font-semibold">Chưa có mind map nào</div>
            <div className="text-sm text-muted-foreground mt-1">Bắt đầu với template hoặc tạo mới từ text</div>
            <Button asChild className="mt-4">
              <Link href="/mindmaps/new">Tạo mind map đầu tiên</Link>
            </Button>
          </CardContent>
        </Card>
      ) : filtered && filtered.length === 0 ? (
        <Card className="border-2 border-dashed">
          <CardContent className="text-center py-12">
            <div className="text-4xl mb-3">🔍</div>
            <div className="font-semibold">Không có mind map khớp bộ lọc</div>
            <div className="text-sm text-muted-foreground mt-1">
              Thử bỏ filter môn học hoặc xoá từ khoá tìm.
            </div>
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
            <Link key={mm.id} href={`/mindmaps/${mm.id}`}>
              <Card className="hover:border-brand-400 hover:shadow-md transition-all cursor-pointer h-full">
                <div className="aspect-video bg-gradient-to-br from-brand-100 to-brand-50 flex items-center justify-center text-5xl">
                  🗺️
                </div>
                <CardContent className="p-4">
                  <div className="text-xs font-medium text-brand-700">
                    {mm.subject ? SUBJECT_LABEL[mm.subject] ?? mm.subject : 'Tổng hợp'}
                  </div>
                  <div className="font-semibold mt-1 line-clamp-2">{mm.title}</div>
                  <div className="text-xs text-muted-foreground mt-2">{timeAgo(mm.updatedAt)}</div>
                </CardContent>
              </Card>
            </Link>
          ))}

          <Link href="/mindmaps/new">
            <Card className="border-2 border-dashed hover:border-brand-500 hover:bg-brand-50 transition-all cursor-pointer h-full flex items-center justify-center min-h-[220px]">
              <CardContent className="text-center p-6">
                <Plus className="h-8 w-8 mx-auto text-muted-foreground" />
                <div className="mt-2 font-semibold">Tạo mind map mới</div>
                <div className="text-xs text-muted-foreground mt-1">Từ template hoặc paste text</div>
              </CardContent>
            </Card>
          </Link>
        </div>
      )}
    </div>
  );
}
