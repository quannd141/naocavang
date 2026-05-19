'use client';

import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useState } from 'react';
import { useEffect } from 'react';
import { Plus, Play, Trash2 } from 'lucide-react';
import { PageHeader } from '@/components/layout/page-header';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ApiError, type FlashcardDeckFull, flashcardApi } from '@/lib/api-client';

export default function DeckDetailPage() {
  const params = useParams<{ deckId: string }>();
  const router = useRouter();
  const [deck, setDeck] = useState<FlashcardDeckFull | null>(null);
  const [error, setError] = useState<string | null>(null);

  // add-card form state
  const [showAdd, setShowAdd] = useState(false);
  const [newQuestion, setNewQuestion] = useState('');
  const [newAnswer, setNewAnswer] = useState('');
  const [adding, setAdding] = useState(false);

  // delete-card state
  const [deletingId, setDeletingId] = useState<string | null>(null);

  async function reload() {
    const fresh = await flashcardApi.getDeck(params.deckId);
    setDeck(fresh);
  }

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

  async function handleAdd() {
    if (newQuestion.trim().length === 0 || newAnswer.trim().length === 0) {
      setError('Cần nhập cả câu hỏi và đáp án');
      return;
    }
    setAdding(true);
    setError(null);
    try {
      await flashcardApi.addCards(params.deckId, [
        { question: newQuestion.trim(), answer: newAnswer.trim() },
      ]);
      setNewQuestion('');
      setNewAnswer('');
      setShowAdd(false);
      await reload();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : (err as Error).message);
    } finally {
      setAdding(false);
    }
  }

  async function handleDelete(cardId: string) {
    if (!confirm('Xoá thẻ này?')) return;
    setDeletingId(cardId);
    setError(null);
    try {
      await flashcardApi.deleteCard(cardId);
      await reload();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : (err as Error).message);
    } finally {
      setDeletingId(null);
    }
  }

  if (error && !deck) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Card className="border-red-300 bg-red-50">
          <CardContent className="p-4 text-sm text-red-700">⚠️ {error}</CardContent>
        </Card>
      </div>
    );
  }
  if (!deck) return <div className="p-8 text-muted-foreground">Đang tải...</div>;

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

      {error && (
        <Card className="mb-4 border-red-300 bg-red-50">
          <CardContent className="p-3 text-sm text-red-700">⚠️ {error}</CardContent>
        </Card>
      )}

      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-semibold">Danh sách thẻ</h2>
        {showAdd ? (
          <Button size="sm" variant="ghost" onClick={() => setShowAdd(false)}>
            Huỷ
          </Button>
        ) : (
          <Button size="sm" variant="outline" onClick={() => setShowAdd(true)}>
            <Plus className="h-4 w-4" /> Thêm thẻ
          </Button>
        )}
      </div>

      {showAdd && (
        <Card className="mb-4 border-2 border-brand-300 bg-brand-50/40">
          <CardContent className="p-4 space-y-3">
            <div>
              <label htmlFor="new-q" className="text-xs text-muted-foreground">
                Mặt trước (câu hỏi)
              </label>
              <Input
                id="new-q"
                value={newQuestion}
                onChange={(e) => setNewQuestion(e.target.value)}
                placeholder="VD: Hàm số bậc 2 có dạng tổng quát là gì?"
                disabled={adding}
                autoFocus
              />
            </div>
            <div>
              <label htmlFor="new-a" className="text-xs text-muted-foreground">
                Mặt sau (đáp án)
              </label>
              <Input
                id="new-a"
                value={newAnswer}
                onChange={(e) => setNewAnswer(e.target.value)}
                placeholder="VD: y = ax² + bx + c, a ≠ 0"
                disabled={adding}
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={handleAdd} disabled={adding}>
                {adding ? 'Đang lưu...' : 'Lưu thẻ'}
              </Button>
              <Button variant="ghost" onClick={() => setShowAdd(false)} disabled={adding}>
                Huỷ
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardContent className="p-0 divide-y divide-border">
          {deck.cards.length === 0 ? (
            <div className="p-6 text-center text-sm text-muted-foreground">
              Chưa có thẻ nào. Click "Thêm thẻ" ở trên để bắt đầu.
            </div>
          ) : (
            deck.cards.map((card, idx) => (
              <div key={card.id} className="p-4 flex items-start gap-4">
                <div className="text-sm text-muted-foreground font-mono w-8 shrink-0">
                  #{idx + 1}
                </div>
                <div className="flex-1 grid sm:grid-cols-2 gap-3 min-w-0">
                  <div className="min-w-0">
                    <div className="text-xs text-muted-foreground">Mặt trước</div>
                    <div className="font-medium mt-1 whitespace-pre-wrap break-words">
                      {card.question}
                    </div>
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs text-muted-foreground">Mặt sau</div>
                    <div className="text-muted-foreground mt-1 whitespace-pre-wrap break-words">
                      {card.answer}
                    </div>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2 shrink-0">
                  <div className="text-xs text-muted-foreground text-right">
                    <div>EF {Number(card.easeFactor).toFixed(2)}</div>
                    <div>Interval {card.interval}d</div>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-red-600 hover:bg-red-50"
                    onClick={() => handleDelete(card.id)}
                    disabled={deletingId === card.id}
                    title="Xoá thẻ"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))
          )}
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
