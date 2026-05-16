'use client';

import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Play } from 'lucide-react';
import { PageHeader } from '@/components/layout/page-header';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { type FlashcardDeck, getMockDeck } from '@/lib/mock/flashcards';

export default function DeckDetailPage() {
  const params = useParams<{ deckId: string }>();
  const router = useRouter();
  const [deck, setDeck] = useState<FlashcardDeck | undefined>();
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const d = getMockDeck(params.deckId);
    if (!d) {
      router.push('/flashcards');
      return;
    }
    setDeck(d);
    setLoaded(true);
  }, [params.deckId, router]);

  if (!loaded || !deck) {
    return <div className="p-8 text-muted-foreground">Đang tải...</div>;
  }

  return (
    <div className="container mx-auto px-4 lg:px-6 py-8 max-w-4xl">
      <PageHeader
        title={deck.title}
        description={deck.description}
        action={
          <Button asChild size="lg">
            <Link href={`/flashcards/${deck.id}/study`}>
              <Play className="h-4 w-4" /> Bắt đầu ôn
            </Link>
          </Button>
        }
      />

      <div className="flex gap-3 mb-6">
        <Badge variant="outline">{deck.subject}</Badge>
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
                  <div className="font-medium mt-1">{card.front}</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">Mặt sau</div>
                  <div className="text-muted-foreground mt-1">{card.back}</div>
                </div>
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
