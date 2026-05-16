import Link from 'next/link';
import { Plus } from 'lucide-react';
import { PageHeader } from '@/components/layout/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export const metadata = { title: 'Flashcards' };

const DECKS = [
  { id: 'eng-600', title: 'Tiếng Anh 600 từ vựng', subject: 'Tiếng Anh', cards: 24, due: 12, mastery: 45 },
  { id: 'toan-ct', title: 'Toán — Công thức lượng giác', subject: 'Toán', cards: 18, due: 3, mastery: 78 },
  { id: 'su-vn', title: 'Lịch sử VN — Mốc thời gian', subject: 'Sử', cards: 30, due: 8, mastery: 30 },
  { id: 'ielts-idiom', title: 'IELTS — 50 Idioms band 7+', subject: 'IELTS', cards: 50, due: 20, mastery: 15 },
  { id: 'hoa-hc', title: 'Hoá hữu cơ — Phản ứng đặc trưng', subject: 'Hoá', cards: 12, due: 0, mastery: 92 },
];

export default function FlashcardsPage() {
  return (
    <div className="container mx-auto px-4 lg:px-6 py-8 max-w-6xl">
      <PageHeader
        title="Flashcards"
        description="Deck của bạn. SM-2 nhắc ôn đúng lúc trước khi quên."
        action={
          <Button asChild>
            <Link href="/flashcards/new"><Plus className="h-4 w-4" /> Tạo deck</Link>
          </Button>
        }
      />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {DECKS.map((deck) => (
          <Card key={deck.id} className="hover:border-brand-400 hover:shadow-md transition-all">
            <CardContent className="p-5">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <Badge variant="outline">{deck.subject}</Badge>
                  <h3 className="mt-2 font-semibold line-clamp-2">{deck.title}</h3>
                </div>
                <div className="text-3xl">🎴</div>
              </div>

              <div className="mt-4 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Tổng cards</span>
                  <span className="font-medium">{deck.cards}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Đến hạn ôn</span>
                  <span className={`font-medium ${deck.due > 0 ? 'text-orange-600' : 'text-green-600'}`}>
                    {deck.due > 0 ? `${deck.due} cards` : 'Hoàn thành!'}
                  </span>
                </div>
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-muted-foreground">Mastery</span>
                    <span className="font-medium">{deck.mastery}%</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-brand-500 transition-all"
                      style={{ width: `${deck.mastery}%` }}
                    />
                  </div>
                </div>
              </div>

              <div className="mt-4 flex gap-2">
                <Button asChild className="flex-1" disabled={deck.due === 0}>
                  <Link href={`/flashcards/${deck.id}/study`}>
                    {deck.due > 0 ? 'Bắt đầu ôn' : 'Đã xong'}
                  </Link>
                </Button>
                <Button asChild variant="outline">
                  <Link href={`/flashcards/${deck.id}`}>Xem</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
