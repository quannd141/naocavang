'use client';

import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Play } from 'lucide-react';
import { PageHeader } from '@/components/layout/page-header';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ApiError, type FlashcardDeckFull, flashcardApi } from '@/lib/api-client';

export default function DeckDetailPage() {
  const params = useParams<{ deckId: string }>();
  const router = useRouter();
  const [deck, setDeck] = useState<FlashcardDeckFull | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    flashcardApi
      .getDeck(params.deckId)
      .then(setDeck)
      .catch((err: unknown) => {
        if (err instanceof ApiError && (err.status === 404 || err.status === 403)) {
          router.push('/flashcards');
          return;
        }
        setError(err instanceof ApiError ? err.message : (err as Error).message);
      });
  }, [params.deckId, router]);

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Card className="border-red-300 bg-red-50">
          <CardContent className="p-4 text-sm text-red-700">⚠️ {error}</CardContent>
        </Card>
      </div>
    );
  }
  if (!deck) {
    return <div className="p-8 text-muted-foreground">Đang tải...</div>;
  }

  return (
    <div className="container mx-auto px-4 lg:px-6 py-8 max-w-4xl">
      <PageHeader
        title={deck.title}
        description={`Mind map gốc: ${deck.mindmap.title}`}
        action={
          <Button asChild size="lg" disabled={deck.cards.length === 0}>
            <Link href={`/flashcards/${deck.id}/study`}>
              <Play className="h-4 w-4" /> Bắt đầu ôn
            </Link>
          </Button>
        }
      />

      <div className="flex gap-3 mb-6">
        {deck.mindmap.subject && <Badge variant="outline">{deck.mindmap.subject}</Badge>}
        <Badge variant="secondary">{deck.cards.length} cards</Badge>
      </div>

      <h2 className="text-lg font-semibold mb-3">Danh sách thẻ</h2>
      <Card>
        <CardContent className="p-0 divide-y divide-border">
          {deck.cards.map((card, idx) => (
            <div key={card.id} className="p-4 flex items-start gap-4">
              <div className="text-sm text-muted-foreground font-mono w-8 shrink-0">#{idx + 1}</div>
              <div className="flex-1 grid sm:grid-cols-2 gap-3">
                <div>
                  <div className="text-xs text-muted-foreground">Mặt trước</div>
                  <div className="font-medium mt-1 whitespace-pre-wrap">{card.question}</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">Mặt sau</div>
                  <div className="text-muted-foreground mt-1 whitespace-pre-wrap">{card.answer}</div>
                </div>
              </div>
              <div className="text-xs text-muted-foreground shrink-0 text-right">
                <div>EF {Number(card.easeFactor).toFixed(2)}</div>
                <div>Interval {card.interval}d</div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <div className="mt-6 text-center">
        <Button variant="ghost" asChild>
          <Link href="/flashcards">← Quay lại danh sách deck</Link>
        </Button>
      </div>
    </div>
  );
}
