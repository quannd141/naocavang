'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Plus, RefreshCw, Sparkles } from 'lucide-react';
import { PageHeader } from '@/components/layout/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  ApiError,
  type MindMapSummary,
  type QuizSummary,
  mindmapApi,
  quizApi,
} from '@/lib/api-client';

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

const DIFF_BADGE = {
  easy: { label: 'Dễ', variant: 'success' as const },
  medium: { label: 'Trung bình', variant: 'warning' as const },
  hard: { label: 'Khó', variant: 'danger' as const },
};

export default function QuizzesPage() {
  const [items, setItems] = useState<QuizSummary[] | null>(null);
  const [mindmaps, setMindmaps] = useState<MindMapSummary[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function load() {
    setError(null);
    try {
      const data = await quizApi.list();
      setItems(data);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : (err as Error).message);
      setItems([]);
    }
  }

  useEffect(() => {
    load();
    mindmapApi.list().then(setMindmaps).catch(() => setMindmaps([]));
  }, []);

  async function generateFromMindmap(mindmapId: string, title: string) {
    setBusy(true);
    setError(null);
    try {
      await quizApi.createFromMindmap(mindmapId);
      await load();
    } catch (err) {
      if (err instanceof ApiError && err.code === 'NO_NODES_TO_CONVERT') {
        setError(`Mind map "${title}" cần ít nhất 1 node có notes để tạo quiz.`);
      } else {
        setError(err instanceof ApiError ? err.message : (err as Error).message);
      }
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="container mx-auto px-4 lg:px-6 py-8 max-w-6xl">
      <PageHeader
        title="Quizzes"
        description="Luyện đề. Câu sai tự thêm vào flashcard cùng mind map."
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
        <div className="text-muted-foreground">Đang tải...</div>
      ) : items.length === 0 ? (
        <Card className="border-2 border-dashed">
          <CardContent className="text-center py-12">
            <div className="text-5xl mb-3">🧪</div>
            <div className="font-semibold">Chưa có quiz nào</div>
            <div className="text-sm text-muted-foreground mt-1 mb-6">
              Auto-gen short_answer quiz từ mind map đã có (cần node có notes).
            </div>

            {mindmaps.length === 0 ? (
              <div className="text-sm text-muted-foreground">
                Bạn cần có ít nhất 1 mind map.{' '}
                <Link href="/mindmaps/new" className="text-brand-700 underline">
                  Tạo mind map
                </Link>
              </div>
            ) : (
              <div className="max-w-md mx-auto">
                <div className="text-xs text-muted-foreground mb-2">
                  Chọn mind map:
                </div>
                <div className="space-y-2">
                  {mindmaps.slice(0, 5).map((mm) => (
                    <Button
                      key={mm.id}
                      variant="outline"
                      className="w-full justify-between"
                      disabled={busy}
                      onClick={() => generateFromMindmap(mm.id, mm.title)}
                    >
                      <span className="truncate">{mm.title}</span>
                      <Sparkles className="h-4 w-4 ml-2" />
                    </Button>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-2">
            {items.map((quiz) => {
              const diff = DIFF_BADGE[quiz.difficulty];
              return (
                <Card key={quiz.id} className="hover:border-brand-400 hover:shadow-md transition-all">
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex gap-2">
                          <Badge variant="outline">
                            {quiz.subject ? SUBJECT_LABEL[quiz.subject] ?? quiz.subject : 'Tổng hợp'}
                          </Badge>
                          <Badge variant={diff.variant}>{diff.label}</Badge>
                        </div>
                        <h3 className="mt-3 font-semibold">{quiz.title}</h3>
                        <div className="mt-2 text-sm text-muted-foreground">
                          {quiz.questionCount} câu • {quiz.attemptCount} lần làm
                        </div>
                      </div>
                      <div className="text-3xl">🧪</div>
                    </div>
                    <Button asChild className="mt-4 w-full">
                      <Link href={`/quizzes/${quiz.id}`}>Bắt đầu →</Link>
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {mindmaps.length > 0 && (
            <div className="mt-8">
              <div className="text-sm text-muted-foreground mb-2">
                💡 Tạo thêm quiz từ mind map khác:
              </div>
              <div className="flex flex-wrap gap-2">
                {mindmaps.slice(0, 5).map((mm) => (
                  <Button
                    key={mm.id}
                    variant="outline"
                    size="sm"
                    disabled={busy}
                    onClick={() => generateFromMindmap(mm.id, mm.title)}
                  >
                    <Plus className="h-3 w-3" /> {mm.title}
                  </Button>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
