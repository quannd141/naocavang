import Link from 'next/link';
import { Plus } from 'lucide-react';
import { PageHeader } from '@/components/layout/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export const metadata = { title: 'Quizzes' };

const QUIZZES = [
  { id: 'qz-toan10', title: 'Toán 10 — Bài tập hàm số bậc 2', subject: 'Toán', count: 8, time: '15 phút', difficulty: 'medium' },
  { id: 'qz-ielts-r', title: 'IELTS Reading — Practice Test 3', subject: 'IELTS', count: 10, time: '20 phút', difficulty: 'hard' },
  { id: 'qz-su', title: 'Lịch sử 12 — Chương 1', subject: 'Sử', count: 15, time: '25 phút', difficulty: 'easy' },
  { id: 'qz-toeic', title: 'TOEIC Part 5 — Grammar 30 câu', subject: 'TOEIC', count: 30, time: '20 phút', difficulty: 'medium' },
];

const DIFF_BADGE = {
  easy: { label: 'Dễ', variant: 'success' as const },
  medium: { label: 'Trung bình', variant: 'warning' as const },
  hard: { label: 'Khó', variant: 'danger' as const },
};

export default function QuizzesPage() {
  return (
    <div className="container mx-auto px-4 lg:px-6 py-8 max-w-6xl">
      <PageHeader
        title="Quizzes"
        description="Luyện đề trắc nghiệm AI sinh. Câu sai tự thêm vào flashcard."
        action={
          <Button asChild>
            <Link href="/quizzes/new"><Plus className="h-4 w-4" /> Tạo quiz</Link>
          </Button>
        }
      />

      <div className="grid gap-4 md:grid-cols-2">
        {QUIZZES.map((quiz) => {
          const diff = DIFF_BADGE[quiz.difficulty as keyof typeof DIFF_BADGE];
          return (
            <Card key={quiz.id} className="hover:border-brand-400 hover:shadow-md transition-all">
              <CardContent className="p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex gap-2">
                      <Badge variant="outline">{quiz.subject}</Badge>
                      <Badge variant={diff.variant}>{diff.label}</Badge>
                    </div>
                    <h3 className="mt-3 font-semibold">{quiz.title}</h3>
                    <div className="mt-2 text-sm text-muted-foreground">
                      {quiz.count} câu • {quiz.time}
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
    </div>
  );
}
