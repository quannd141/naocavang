'use client';

import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { Check, X } from 'lucide-react';
import { PageHeader } from '@/components/layout/page-header';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { type Quiz, type QuizQuestion, getMockQuiz } from '@/lib/mock/quizzes';

type Phase = 'intro' | 'play' | 'result';

export default function QuizPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [quiz, setQuiz] = useState<Quiz | undefined>();
  const [phase, setPhase] = useState<Phase>('intro');
  const [idx, setIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string | number>>({});

  useEffect(() => {
    const q = getMockQuiz(params.id);
    if (!q) {
      router.push('/quizzes');
      return;
    }
    setQuiz(q);
  }, [params.id, router]);

  if (!quiz) return <div className="p-8 text-muted-foreground">Đang tải...</div>;

  if (phase === 'intro') {
    return (
      <div className="container mx-auto px-4 lg:px-6 py-8 max-w-2xl">
        <PageHeader title={quiz.title} description={quiz.description} />
        <Card>
          <CardContent className="p-6 space-y-4">
            <div className="flex gap-3 flex-wrap">
              <Badge variant="outline">{quiz.subject}</Badge>
              <Badge variant="secondary">{quiz.questions.length} câu</Badge>
              <Badge variant="secondary">⏱ {quiz.timeMinutes} phút</Badge>
              <Badge variant={quiz.difficulty === 'easy' ? 'success' : quiz.difficulty === 'medium' ? 'warning' : 'danger'}>
                {quiz.difficulty === 'easy' ? 'Dễ' : quiz.difficulty === 'medium' ? 'Trung bình' : 'Khó'}
              </Badge>
            </div>
            <div className="text-sm text-muted-foreground space-y-1">
              <p>📝 Trắc nghiệm + Đúng/Sai + Điền khuyết</p>
              <p>💡 Câu sai sẽ tự động thêm vào flashcard để ôn lại</p>
              <p>📊 Kết quả lưu vào lịch sử học tập của bạn</p>
            </div>
            <Button size="lg" className="w-full" onClick={() => setPhase('play')}>
              Bắt đầu →
            </Button>
            <Button variant="ghost" asChild className="w-full">
              <Link href="/quizzes">Quay lại</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (phase === 'play') {
    const question = quiz.questions[idx];
    const total = quiz.questions.length;
    const progress = ((idx + 1) / total) * 100;
    const currentAnswer = answers[question.id];
    const canNext = currentAnswer !== undefined && currentAnswer !== '';

    return (
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="mb-6">
          <div className="flex justify-between mb-2 text-sm">
            <Link href="/quizzes" className="text-muted-foreground hover:underline">← Thoát</Link>
            <Badge variant="outline">Câu {idx + 1} / {total}</Badge>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div className="h-full bg-brand-500 transition-all" style={{ width: `${progress}%` }} />
          </div>
        </div>

        <Card>
          <CardContent className="p-6">
            <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2">
              {question.type === 'multi' ? 'Trắc nghiệm' : question.type === 'tf' ? 'Đúng / Sai' : 'Điền khuyết'}
            </div>
            <h2 className="text-xl font-semibold">{question.question}</h2>

            <div className="mt-6 space-y-2">
              {question.type === 'fill' ? (
                <Input
                  type="text"
                  placeholder="Nhập đáp án..."
                  value={(answers[question.id] as string) ?? ''}
                  onChange={(e) =>
                    setAnswers((a) => ({ ...a, [question.id]: e.target.value }))
                  }
                  autoFocus
                />
              ) : (
                question.options?.map((opt, i) => {
                  const selected = currentAnswer === i;
                  return (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setAnswers((a) => ({ ...a, [question.id]: i }))}
                      className={cn(
                        'w-full text-left rounded-md border-2 p-3 transition-all hover:bg-muted',
                        selected ? 'border-brand-500 bg-brand-50' : 'border-border',
                      )}
                    >
                      <span className="font-medium mr-2">{String.fromCharCode(65 + i)}.</span>
                      {opt}
                    </button>
                  );
                })
              )}
            </div>

            <div className="mt-6 flex justify-between">
              <Button
                variant="outline"
                onClick={() => setIdx(Math.max(0, idx - 1))}
                disabled={idx === 0}
              >
                ← Câu trước
              </Button>
              {idx + 1 < total ? (
                <Button onClick={() => setIdx(idx + 1)} disabled={!canNext}>
                  Câu sau →
                </Button>
              ) : (
                <Button onClick={() => setPhase('result')} disabled={!canNext}>
                  Nộp bài
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return <QuizResult quiz={quiz} answers={answers} onRetry={() => { setPhase('intro'); setAnswers({}); setIdx(0); }} />;
}

function QuizResult({
  quiz,
  answers,
  onRetry,
}: {
  quiz: Quiz;
  answers: Record<string, string | number>;
  onRetry: () => void;
}) {
  const scored = useMemo(() => {
    return quiz.questions.map((q) => {
      const ans = answers[q.id];
      let correct = false;
      if (q.type === 'fill') {
        const expected = (q.correctAnswer ?? '').toString().trim().toLowerCase();
        const actual = (ans ?? '').toString().trim().toLowerCase();
        correct = expected.length > 0 && actual === expected;
      } else {
        correct = ans === q.correctIndex;
      }
      return { q, ans, correct };
    });
  }, [quiz, answers]);

  const correctCount = scored.filter((s) => s.correct).length;
  const total = scored.length;
  const pct = Math.round((correctCount / total) * 100);
  const emoji = pct >= 80 ? '🏆' : pct >= 60 ? '👍' : pct >= 40 ? '💪' : '🐠';

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <div className="text-center">
        <div className="text-6xl">{emoji}</div>
        <h1 className="mt-4 text-3xl font-bold">
          Kết quả: {correctCount} / {total} câu ({pct}%)
        </h1>
        <p className="mt-2 text-muted-foreground">
          {pct >= 80 ? 'Tuyệt vời! Bạn nắm rất chắc kiến thức.' :
           pct >= 60 ? 'Khá tốt — vài câu sai để ôn lại.' :
           pct >= 40 ? 'Cần luyện thêm — chúng tôi đã thêm các câu sai vào flashcard.' :
           'Bắt đầu lại nhé — đừng nản!'}
        </p>
      </div>

      <div className="mt-8 space-y-3">
        {scored.map(({ q, ans, correct }, idx) => (
          <Card key={q.id} className={cn('border-2', correct ? 'border-green-300' : 'border-red-300')}>
            <CardContent className="p-5">
              <div className="flex items-start gap-3">
                <div className={cn(
                  'h-8 w-8 rounded-full flex items-center justify-center shrink-0 mt-0.5',
                  correct ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700',
                )}>
                  {correct ? <Check className="h-4 w-4" /> : <X className="h-4 w-4" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm text-muted-foreground">Câu {idx + 1}</div>
                  <div className="font-semibold mt-1">{q.question}</div>

                  <div className="mt-3 grid sm:grid-cols-2 gap-2 text-sm">
                    <div>
                      <div className="text-xs text-muted-foreground">Bạn chọn</div>
                      <div className={cn('mt-0.5 font-medium', correct ? 'text-green-700' : 'text-red-700')}>
                        {q.type === 'fill'
                          ? ((ans as string) || '(bỏ trống)')
                          : (typeof ans === 'number' && q.options ? q.options[ans] : '(không chọn)')}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-muted-foreground">Đáp án đúng</div>
                      <div className="mt-0.5 font-medium text-green-700">
                        {q.type === 'fill'
                          ? q.correctAnswer
                          : (q.options && q.correctIndex !== undefined ? q.options[q.correctIndex] : '')}
                      </div>
                    </div>
                  </div>

                  <div className="mt-3 rounded-md bg-muted/50 p-3 text-sm">
                    <span className="font-semibold">💡 Giải thích: </span>
                    {q.explanation}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
        <Button onClick={onRetry}>Làm lại</Button>
        <Button variant="outline" asChild>
          <Link href="/quizzes">Quiz khác</Link>
        </Button>
      </div>
    </div>
  );
}
