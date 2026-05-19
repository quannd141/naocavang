'use client';

import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import {
  ApiError,
  type FlashcardCard,
  type FlashcardDeckFull,
  flashcardApi,
} from '@/lib/api-client';

type Quality = 0 | 1 | 2 | 3 | 4;

interface ReviewEntry {
  cardId: string;
  quality: Quality;
}

const RATING_BUTTONS: { quality: Quality; label: string; sub: string; className: string }[] = [
  { quality: 0, label: 'Lại', sub: '< 1 phút', className: 'bg-red-500 hover:bg-red-600 text-white' },
  { quality: 2, label: 'Khó', sub: '< 10 phút', className: 'bg-orange-500 hover:bg-orange-600 text-white' },
  { quality: 3, label: 'Tốt', sub: '+ ngày', className: 'bg-green-500 hover:bg-green-600 text-white' },
  { quality: 4, label: 'Dễ', sub: '+ ngày × 1.3', className: 'bg-blue-500 hover:bg-blue-600 text-white' },
];

export default function StudyPage() {
  const params = useParams<{ deckId: string }>();
  const router = useRouter();
  const [deck, setDeck] = useState<FlashcardDeckFull | null>(null);
  const [queue, setQueue] = useState<FlashcardCard[]>([]);
  const [idx, setIdx] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [log, setLog] = useState<ReviewEntry[]>([]);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [nextReviewLabel, setNextReviewLabel] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const [d, due] = await Promise.all([
          flashcardApi.getDeck(params.deckId),
          flashcardApi.getDue(params.deckId, 50),
        ]);
        setDeck(d);
        // If no due cards, fall back to all cards for re-practice
        setQueue(due.length > 0 ? due : d.cards);
      } catch (err) {
        if (err instanceof ApiError && (err.status === 404 || err.status === 403)) {
          router.push('/flashcards');
          return;
        }
        setError(err instanceof ApiError ? err.message : (err as Error).message);
      }
    }
    load();
  }, [params.deckId, router]);

  const card = queue[idx];

  async function handleRate(quality: Quality) {
    if (!card || submitting) return;
    setSubmitting(true);
    setError(null);
    try {
      const result = await flashcardApi.review(card.id, quality);
      setNextReviewLabel(new Date(result.nextReviewAt).toLocaleDateString('vi-VN'));
    } catch (err) {
      // Don't block UX on save failure — log + continue
      setError(`Lưu review thất bại: ${err instanceof ApiError ? err.message : (err as Error).message}`);
    } finally {
      setSubmitting(false);
    }
    setLog((l) => [...l, { cardId: card.id, quality }]);

    if (idx + 1 < queue.length) {
      setIdx(idx + 1);
      setFlipped(false);
    } else {
      setDone(true);
    }
  }

  if (error && !deck) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <Card className="border-red-300 bg-red-50">
          <CardContent className="p-4 text-sm text-red-700">⚠️ {error}</CardContent>
        </Card>
      </div>
    );
  }
  if (!deck) return <div className="p-8 text-muted-foreground">Đang tải...</div>;

  if (done) {
    const correct = log.filter((l) => l.quality >= 3).length;
    const accuracy = log.length === 0 ? 0 : Math.round((correct / log.length) * 100);
    return (
      <div className="container mx-auto px-4 py-12 max-w-lg text-center">
        <div className="text-6xl">🎉</div>
        <h1 className="mt-4 text-3xl font-bold">Hoàn thành buổi ôn!</h1>
        <p className="mt-2 text-muted-foreground">
          Bạn đã ôn {log.length} thẻ trong deck {deck.title}.
        </p>

        <Card className="mt-8 text-left">
          <CardContent className="p-6 space-y-4">
            <Stat label="Tổng thẻ đã ôn" value={log.length.toString()} />
            <Stat label="Đúng (Tốt + Dễ)" value={`${correct} / ${log.length}`} />
            <Stat label="Độ chính xác" value={`${accuracy}%`} />
            {nextReviewLabel && (
              <Stat label="Thẻ vừa rồi sẽ ôn lại" value={nextReviewLabel} />
            )}
          </CardContent>
        </Card>

        {error && (
          <div className="mt-4 text-sm text-red-700">⚠️ {error}</div>
        )}

        <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
          <Button asChild>
            <Link href={`/flashcards/${deck.id}`}>Xem deck</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/flashcards">Deck khác</Link>
          </Button>
        </div>
      </div>
    );
  }

  if (!card) {
    return (
      <div className="p-8 text-center text-muted-foreground">
        <div className="text-5xl mb-3">✨</div>
        <div>Không còn thẻ nào đến hạn ôn cho deck này.</div>
        <Button asChild variant="ghost" className="mt-4">
          <Link href="/flashcards">← Quay lại</Link>
        </Button>
      </div>
    );
  }

  const progressPct = ((idx + (flipped ? 0.5 : 0)) / queue.length) * 100;

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2 text-sm">
          <Link href={`/flashcards/${deck.id}`} className="text-muted-foreground hover:underline">
            ← {deck.title}
          </Link>
          <Badge variant="outline">
            Thẻ {idx + 1} / {queue.length}
          </Badge>
        </div>
        <div className="h-2 bg-muted rounded-full overflow-hidden">
          <div className="h-full bg-brand-500 transition-all" style={{ width: `${progressPct}%` }} />
        </div>
      </div>

      <Card
        onClick={() => setFlipped((f) => !f)}
        className={cn(
          'min-h-[300px] cursor-pointer select-none border-2 transition-all',
          flipped ? 'border-brand-500 bg-brand-50' : 'hover:border-brand-300',
        )}
      >
        <CardContent className="flex flex-col items-center justify-center min-h-[300px] p-8 text-center">
          <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2">
            {flipped ? 'Mặt sau' : 'Mặt trước'}
          </div>
          <div className="text-2xl md:text-3xl font-semibold whitespace-pre-wrap">
            {flipped ? card.answer : card.question}
          </div>
          {!flipped && (
            <div className="mt-8 text-xs text-muted-foreground">Click hoặc Space để lật thẻ</div>
          )}
        </CardContent>
      </Card>

      {flipped ? (
        <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-3">
          {RATING_BUTTONS.map((btn) => (
            <button
              key={btn.quality}
              type="button"
              onClick={() => handleRate(btn.quality)}
              disabled={submitting}
              className={cn(
                'rounded-lg p-4 text-center font-semibold transition-all hover:scale-105 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed',
                btn.className,
              )}
            >
              <div className="text-lg">{btn.label}</div>
              <div className="text-xs opacity-80 mt-1">{btn.sub}</div>
            </button>
          ))}
        </div>
      ) : (
        <div className="mt-6 text-center">
          <Button size="lg" onClick={() => setFlipped(true)}>
            Xem đáp án (Space)
          </Button>
        </div>
      )}

      {error && (
        <div className="mt-4 text-sm text-red-700 text-center">⚠️ {error}</div>
      )}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-center">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="font-semibold">{value}</span>
    </div>
  );
}
