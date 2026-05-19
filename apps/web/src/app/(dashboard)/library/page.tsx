'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { RefreshCw } from 'lucide-react';
import { PageHeader } from '@/components/layout/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ApiError, type TemplateSummary, templateApi } from '@/lib/api-client';

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

const SUBJECT_EMOJI: Record<string, string> = {
  math: '🔢',
  physics: '⚙️',
  chemistry: '🧪',
  biology: '🧬',
  history: '📜',
  geography: '🌏',
  literature: '📖',
  english: '🇬🇧',
  general: '📚',
};

export default function LibraryPage() {
  const [items, setItems] = useState<TemplateSummary[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setError(null);
    try {
      const data = await templateApi.list();
      setItems(data);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : (err as Error).message);
      setItems([]);
    }
  }

  useEffect(() => {
    load();
  }, []);

  return (
    <div className="container mx-auto px-4 lg:px-6 py-8 max-w-6xl">
      <PageHeader
        title="Templates cộng đồng"
        description="Mind map + flashcard + quiz đã được tổng hợp sẵn theo curriculum VN."
        action={
          <Button variant="outline" onClick={load} title="Refresh">
            <RefreshCw className="h-4 w-4" />
          </Button>
        }
      />

      {error && (
        <Card className="mb-6 border-red-300 bg-red-50">
          <CardContent className="p-4 text-sm text-red-700">⚠️ {error}</CardContent>
        </Card>
      )}

      {items === null ? (
        <div className="text-muted-foreground">Đang tải templates...</div>
      ) : items.length === 0 ? (
        <Card className="border-2 border-dashed">
          <CardContent className="text-center py-16">
            <div className="text-5xl mb-3">📚</div>
            <div className="font-semibold">Chưa có template nào</div>
            <div className="text-sm text-muted-foreground mt-1">
              Templates được seed thủ công bởi admin. Quay lại sau nhé!
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {items.map((t) => {
            const emoji = (t.subject && SUBJECT_EMOJI[t.subject]) ?? '📚';
            const subjectLabel = t.subject ? SUBJECT_LABEL[t.subject] ?? t.subject : 'Tổng hợp';
            return (
              <Link key={t.id} href={`/library/${t.id}`}>
                <Card className="hover:border-brand-400 hover:shadow-md transition-all cursor-pointer h-full">
                  <div className="aspect-square bg-gradient-to-br from-brand-100 to-brand-50 flex items-center justify-center text-6xl">
                    {emoji}
                  </div>
                  <CardContent className="p-4">
                    <div className="flex gap-2 flex-wrap">
                      <Badge variant="outline">{subjectLabel}</Badge>
                      {t.gradeLevel && <Badge variant="secondary">{t.gradeLevel}</Badge>}
                    </div>
                    <h3 className="mt-2 font-semibold text-sm line-clamp-2">{t.title}</h3>
                    <div className="mt-2 text-xs text-muted-foreground">
                      ⭐ {t.useCount.toLocaleString('vi-VN')} người đã dùng
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
