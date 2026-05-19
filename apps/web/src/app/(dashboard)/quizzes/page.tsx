'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { Plus, RefreshCw, Search, Sparkles, Trash2 } from 'lucide-react';
import { PageHeader } from '@/components/layout/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  ApiError,
  type MindMapSummary,
  type QuizSummary,
  mindmapApi,
  quizApi,
} from '@/lib/api-client';

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
  const [query, setQuery] = useState('');
  const [difficulty, setDifficulty] = useState<'all' | 'easy' | 'medium' | 'hard'>('all');
  const [deletingId, setDeletingId] = useState<string | null>(null);

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

  const filtered = useMemo(() => {
    if (!items) return null;
    const q = normaliseForSearch(query.trim());
    return items.filter((quiz) => {
      if (difficulty !== 'all' && quiz.difficulty !== difficulty) return false;
      if (q.length === 0) return true;
      return normaliseForSearch(`${quiz.title} ${quiz.mindmapTitle}`).includes(q);
    });
  }, [items, query, difficulty]);

  async function handleDelete(quiz: QuizSummary) {
    if (!confirm(`Xoá quiz "${quiz.title}"? Hành động này không thể hoàn tác.`)) return;
    setDeletingId(quiz.id);
    setError(null);
    try {
      await quizApi.delete(quiz.id);
      await load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : (err as Error).message);
    } finally {
      setDeletingId(null);
    }
  }

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
          <div className="mb-6 flex flex-col md:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Tìm quiz theo title hoặc tên mind map..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <div className="flex gap-1">
              {(['all', 'easy', 'medium', 'hard'] as const).map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => setDifficulty(d)}
                  className={`px-3 py-1 text-xs rounded-md border transition-colors ${
                    difficulty === d
                      ? 'border-brand-500 bg-brand-50 text-brand-700 font-medium'
                      : 'border-border text-muted-foreground hover:bg-muted'
                  }`}
                >
                  {d === 'all' ? 'Tất cả' : d === 'easy' ? 'Dễ' : d === 'medium' ? 'TB' : 'Khó'}
                </button>
              ))}
            </div>
          </div>

          {filtered && filtered.length === 0 ? (
            <Card className="border-2 border-dashed">
              <CardContent className="text-center py-12">
                <div className="text-4xl mb-3">🔍</div>
                <div className="font-semibold">Không có quiz khớp bộ lọc</div>
                <Button
                  variant="outline"
                  className="mt-4"
                  onClick={() => {
                    setQuery('');
                    setDifficulty('all');
                  }}
                >
                  Reset bộ lọc
                </Button>
              </CardContent>
            </Card>
          ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {(filtered ?? []).map((quiz) => {
              const diff = DIFF_BADGE[quiz.difficulty];
              return (
                <Card key={quiz.id} className="hover:border-brand-400 hover:shadow-md transition-all relative group">
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between">
                      <div className="min-w-0 flex-1">
                        <div className="flex gap-2">
                          <Badge variant="outline">
                            {quiz.subject ? SUBJECT_LABEL[quiz.subject] ?? quiz.subject : 'Tổng hợp'}
                          </Badge>
                          <Badge variant={diff.variant}>{diff.label}</Badge>
                        </div>
                        <h3 className="mt-3 font-semibold pr-8 line-clamp-2">{quiz.title}</h3>
                        <div className="mt-2 text-sm text-muted-foreground">
                          {quiz.questionCount} câu • {quiz.attemptCount} lần làm
                        </div>
                      </div>
                      <div className="text-3xl">🧪</div>
                    </div>
                    <Button asChild className="mt-4 w-full">
                      <Link href={`/quizzes/${quiz.id}`}>Bắt đầu →</Link>
                    </Button>
                    <button
                      type="button"
                      onClick={() => handleDelete(quiz)}
                      disabled={deletingId === quiz.id}
                      title="Xoá quiz"
                      aria-label={`Xoá ${quiz.title}`}
                      className="absolute top-3 right-3 h-8 w-8 rounded-md bg-white/90 border border-border opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-red-600 hover:bg-red-50 disabled:opacity-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
          )}

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
