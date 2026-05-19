'use client';

import Link from 'next/link';
import { Plus, RefreshCw, Sparkles } from 'lucide-react';
import { useEffect, useState } from 'react';
import { PageHeader } from '@/components/layout/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  ApiError,
  type FlashcardDeckSummary,
  type MindMapSummary,
  flashcardApi,
  mindmapApi,
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

export default function FlashcardsPage() {
  const [decks, setDecks] = useState<FlashcardDeckSummary[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [mindmaps, setMindmaps] = useState<MindMapSummary[]>([]);
  const [busy, setBusy] = useState(false);

  async function load() {
    setError(null);
    try {
      const data = await flashcardApi.listDecks();
      setDecks(data);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : (err as Error).message);
      setDecks([]);
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
      await flashcardApi.createFromMindmap(mindmapId);
      await load();
    } catch (err) {
      if (err instanceof ApiError && err.code === 'NO_NODES_TO_CONVERT') {
        setError(`Mind map "${title}" chưa có node nào để chuyển sang flashcard.`);
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
        title="Flashcards"
        description="Deck của bạn. SM-2 nhắc ôn đúng lúc trước khi quên."
        action={
          <div className="flex gap-2">
            <Button variant="outline" onClick={load} title="Refresh">
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        }
      />

      {error && (
        <Card className="mb-6 border-red-300 bg-red-50">
          <CardContent className="p-4 text-sm text-red-700">⚠️ {error}</CardContent>
        </Card>
      )}

      {decks === null ? (
        <div className="text-muted-foreground">Đang tải...</div>
      ) : decks.length === 0 ? (
        <Card className="border-2 border-dashed">
          <CardContent className="text-center py-12">
            <div className="text-5xl mb-3">🎴</div>
            <div className="font-semibold">Chưa có deck nào</div>
            <div className="text-sm text-muted-foreground mt-1 mb-6">
              Tạo deck tự động từ mind map đã có — mỗi node sẽ thành 1 thẻ Q/A.
            </div>

            {mindmaps.length === 0 ? (
              <div className="text-sm text-muted-foreground">
                Bạn cần có ít nhất 1 mind map.{' '}
                <Link href="/mindmaps/new" className="text-brand-700 underline">
                  Tạo mind map ngay
                </Link>
              </div>
            ) : (
              <div className="max-w-md mx-auto">
                <div className="text-xs text-muted-foreground mb-2">
                  Chọn mind map để auto-gen deck:
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
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {decks.map((deck) => {
              const mastery = computeMastery(deck);
              return (
                <Card key={deck.id} className="hover:border-brand-400 hover:shadow-md transition-all">
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <Badge variant="outline">
                          {deck.subject ? SUBJECT_LABEL[deck.subject] ?? deck.subject : 'Tổng hợp'}
                        </Badge>
                        <h3 className="mt-2 font-semibold line-clamp-2">{deck.title}</h3>
                      </div>
                      <div className="text-3xl">🎴</div>
                    </div>

                    <div className="mt-4 space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Tổng cards</span>
                        <span className="font-medium">{deck.totalCards}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Đến hạn ôn</span>
                        <span
                          className={`font-medium ${deck.dueCards > 0 ? 'text-orange-600' : 'text-green-600'}`}
                        >
                          {deck.dueCards > 0 ? `${deck.dueCards} cards` : 'Hoàn thành!'}
                        </span>
                      </div>
                      <div>
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-muted-foreground">Mastery</span>
                          <span className="font-medium">{mastery}%</span>
                        </div>
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full bg-brand-500 transition-all"
                            style={{ width: `${mastery}%` }}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 flex gap-2">
                      <Button asChild className="flex-1" disabled={deck.dueCards === 0}>
                        <Link href={`/flashcards/${deck.id}/study`}>
                          {deck.dueCards > 0 ? 'Bắt đầu ôn' : 'Đã xong'}
                        </Link>
                      </Button>
                      <Button asChild variant="outline">
                        <Link href={`/flashcards/${deck.id}`}>Xem</Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {mindmaps.length > 0 && (
            <div className="mt-8">
              <div className="text-sm text-muted-foreground mb-2">
                💡 Tạo thêm deck từ mind map khác:
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

/** Heuristic mastery from due ratio. 100% when nothing due, drops with more due cards. */
function computeMastery(deck: FlashcardDeckSummary): number {
  if (deck.totalCards === 0) return 0;
  const ratio = 1 - deck.dueCards / deck.totalCards;
  return Math.round(Math.max(0, Math.min(1, ratio)) * 100);
}
