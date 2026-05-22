'use client';

import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Check, X } from 'lucide-react';
import { PageHeader } from '@/components/layout/page-header';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import {
  ApiError,
  type QuizAttemptResult,
  type QuizAttemptSummary,
  type QuizFull,
  quizApi,
} from '@/lib/api-client';

type Phase = 'intro' | 'play' | 'result';

const DIFF_LABEL = { easy: 'Dễ', medium: 'Trung bình', hard: 'Khó' } as const;
const DIFF_VARIANT = { easy: 'success', medium: 'warning', hard: 'danger' } as const;

export default function QuizPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [quiz, setQuiz] = useState<QuizFull | null>(null);
  const [attempts, setAttempts] = useState<QuizAttemptSummary[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [phase, setPhase] = useState<Phase>('intro');
  const [idx, setIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [startedAt, setStartedAt] = useState<number>(0);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<QuizAttemptResult | null>(null);

  useEffect(() => {
    quizApi
      .get(params.id)
      .then(setQuiz)
      .catch((err: unknown) => {
        if (err instanceof ApiError && (err.status === 404 || err.status === 403)) {
          router.push('/quizzes');
          return;
        }
        setError(err instanceof ApiError ? err.message : (err as Error).message);
      });
    quizApi
      .listAttempts(params.id)
      .then(setAttempts)
      .catch(() => {
        // History is non-critical — fail silently to avoid drowning the intro screen.
      });
  }, [params.id, router]);

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <Card className="border-red-300 bg-red-50">
          <CardContent className="p-4 text-sm text-red-700">⚠️ {error}</CardContent>
        </Card>
      </div>
    );
  }
  if (!quiz) return <div className="p-8 text-muted-foreground">Đang tải...</div>;

  async function startQuiz() {
    setStartedAt(Date.now());
    setPhase('play');
  }

  async function submitQuiz() {
    if (!quiz) return;
    setSubmitting(true);
    setError(null);
    try {
      const payload = quiz.questions.map((q) => ({
        questionId: q.id,
        answer: answers[q.id] ?? '',
      }));
      const timeSpentSec = Math.round((Date.now() - startedAt) / 1000);
      const r = await quizApi.submit(quiz.id, payload, timeSpentSec);
      setResult(r);
      setPhase('result');
    } catch (err) {
      setError(err instanceof ApiError ? err.message : (err as Error).message);
    } finally {
      setSubmitting(false);
    }
  }

  if (phase === 'intro') {
    return (
      <div className="container mx-auto px-4 lg:px-6 py-8 max-w-2xl">
        <PageHeader title={quiz.title} description={`Mind map: ${quiz.mindmap.title}`} />
        <Card>
          <CardContent className="p-6 space-y-4">
            <div className="flex gap-3 flex-wrap">
              {quiz.mindmap.subject && <Badge variant="outline">{quiz.mindmap.subject}</Badge>}
              <Badge variant="secondary">{quiz.questions.length} câu</Badge>
              <Badge variant={DIFF_VARIANT[quiz.difficulty]}>{DIFF_LABEL[quiz.difficulty]}</Badge>
            </div>
            <div className="text-sm text-muted-foreground space-y-1">
              <p>📝 Trắc nghiệm + Điền khuyết + Trả lời ngắn</p>
              <p>💡 Câu sai tự thêm vào flashcard cùng mind map (nếu đã có deck)</p>
              <p>📊 Kết quả lưu vào lịch sử học tập</p>
            </div>
            <Button size="lg" className="w-full" onClick={startQuiz}>
              {attempts.length > 0 ? 'Làm lại →' : 'Bắt đầu →'}
            </Button>
            <Button variant="ghost" asChild className="w-full">
              <Link href="/quizzes">Quay lại</Link>
            </Button>
          </CardContent>
        </Card>
        {attempts.length > 0 && <AttemptHistory attempts={attempts} />}
      </div>
    );
  }

  if (phase === 'play') {
    const question = quiz.questions[idx];
    const total = quiz.questions.length;
    const progress = ((idx + 1) / total) * 100;
    const currentAnswer = answers[question.id];
    const canNext = currentAnswer !== undefined && currentAnswer.trim() !== '';

    const isMcq = question.type === 'multiple_choice' && question.options && question.options.length > 0;

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
              {labelForType(question.type)}
            </div>
            <h2 className="text-xl font-semibold whitespace-pre-wrap">{question.question}</h2>

            <div className="mt-6 space-y-2">
              {isMcq ? (
                question.options?.map((opt, i) => {
                  const selected = currentAnswer === opt;
                  return (
                    <button
                      key={`${question.id}-opt-${i}`}
                      type="button"
                      onClick={() => setAnswers((a) => ({ ...a, [question.id]: opt }))}
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
              ) : (
                <Input
                  type="text"
                  placeholder="Nhập đáp án..."
                  value={(answers[question.id] as string) ?? ''}
                  onChange={(e) => setAnswers((a) => ({ ...a, [question.id]: e.target.value }))}
                  autoFocus
                />
              )}
            </div>

            {error && <div className="mt-4 text-sm text-red-700">⚠️ {error}</div>}

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
                <Button onClick={submitQuiz} disabled={!canNext || submitting}>
                  {submitting ? 'Đang chấm...' : 'Nộp bài'}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // result
  if (!result) return <div className="p-8 text-muted-foreground">Đang tải kết quả...</div>;
  return (
    <QuizResult
      result={result}
      onRetry={() => {
        setAnswers({});
        setIdx(0);
        setResult(null);
        setPhase('intro');
      }}
    />
  );
}

function AttemptHistory({ attempts }: { attempts: QuizAttemptSummary[] }) {
  const best = Math.max(...attempts.map((a) => a.score));
  const avg = Math.round(attempts.reduce((s, a) => s + a.score, 0) / attempts.length);
  return (
    <Card className="mt-6">
      <CardContent className="p-5 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-semibold">Lịch sử ({attempts.length} lần)</h3>
          <div className="text-xs text-muted-foreground">
            Cao nhất {best}% • Trung bình {avg}%
          </div>
        </div>
        <div className="rounded-md border border-border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted/40 text-muted-foreground">
              <tr>
                <th className="px-3 py-2 text-left font-medium">Ngày</th>
                <th className="px-3 py-2 text-right font-medium">Điểm</th>
                <th className="px-3 py-2 text-right font-medium hidden sm:table-cell">Thời gian</th>
              </tr>
            </thead>
            <tbody>
              {attempts.slice(0, 10).map((a) => {
                const d = new Date(a.completedAt);
                const dateLabel = d.toLocaleString('vi-VN', {
                  day: '2-digit',
                  month: '2-digit',
                  hour: '2-digit',
                  minute: '2-digit',
                });
                const mins = Math.floor(a.timeSpentSec / 60);
                const secs = a.timeSpentSec % 60;
                return (
                  <tr key={a.id} className="border-t border-border">
                    <td className="px-3 py-2">{dateLabel}</td>
                    <td className="px-3 py-2 text-right font-semibold">
                      <span
                        className={cn(
                          a.score >= 80
                            ? 'text-green-700'
                            : a.score >= 50
                              ? 'text-amber-700'
                              : 'text-red-700',
                        )}
                      >
                        {a.score}%
                      </span>
                    </td>
                    <td className="px-3 py-2 text-right text-muted-foreground hidden sm:table-cell">
                      {mins > 0 ? `${mins}m ` : ''}
                      {secs}s
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {attempts.length > 10 && (
          <div className="text-xs text-muted-foreground text-center">
            Hiện 10 lần gần nhất.
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function labelForType(type: string): string {
  if (type === 'multiple_choice') return 'Trắc nghiệm';
  if (type === 'cloze') return 'Điền khuyết';
  return 'Trả lời ngắn';
}

function QuizResult({
  result,
  onRetry,
}: {
  result: QuizAttemptResult;
  onRetry: () => void;
}) {
  const { score, correctCount, totalQuestions, results, wrongAnswersAddedToDeckId } = result;
  const emoji = score >= 80 ? '🏆' : score >= 60 ? '👍' : score >= 40 ? '💪' : '🐠';

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <div className="text-center">
        <div className="text-6xl">{emoji}</div>
        <h1 className="mt-4 text-3xl font-bold">
          Kết quả: {correctCount} / {totalQuestions} câu ({score}%)
        </h1>
        <p className="mt-2 text-muted-foreground">
          {score >= 80
            ? 'Tuyệt vời! Nắm rất chắc.'
            : score >= 60
              ? 'Khá tốt — vài câu sai để ôn lại.'
              : score >= 40
                ? 'Cần luyện thêm.'
                : 'Đừng nản — làm lại nhé!'}
        </p>
        {wrongAnswersAddedToDeckId && (
          <div className="mt-3 inline-block rounded-md bg-brand-50 border border-brand-200 px-4 py-2 text-sm text-brand-800">
            ✨ Đã thêm {totalQuestions - correctCount} câu sai vào{' '}
            <Link href={`/flashcards/${wrongAnswersAddedToDeckId}`} className="underline font-medium">
              deck flashcard cùng mind map
            </Link>
          </div>
        )}
      </div>

      <div className="mt-8 space-y-3">
        {results.map((r, idx) => (
          <Card
            key={r.questionId}
            className={cn('border-2', r.correct ? 'border-green-300' : 'border-red-300')}
          >
            <CardContent className="p-5">
              <div className="flex items-start gap-3">
                <div
                  className={cn(
                    'h-8 w-8 rounded-full flex items-center justify-center shrink-0 mt-0.5',
                    r.correct ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700',
                  )}
                >
                  {r.correct ? <Check className="h-4 w-4" /> : <X className="h-4 w-4" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm text-muted-foreground">Câu {idx + 1}</div>
                  <div className="font-semibold mt-1 whitespace-pre-wrap">{r.question}</div>

                  <div className="mt-3 grid sm:grid-cols-2 gap-2 text-sm">
                    <div>
                      <div className="text-xs text-muted-foreground">Bạn trả lời</div>
                      <div
                        className={cn(
                          'mt-0.5 font-medium whitespace-pre-wrap',
                          r.correct ? 'text-green-700' : 'text-red-700',
                        )}
                      >
                        {r.userAnswer || '(bỏ trống)'}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-muted-foreground">Đáp án đúng</div>
                      <div className="mt-0.5 font-medium text-green-700 whitespace-pre-wrap">
                        {r.correctAnswer}
                      </div>
                    </div>
                  </div>

                  {r.explanation && (
                    <div className="mt-3 rounded-md bg-muted/50 p-3 text-sm">
                      <span className="font-semibold">💡 Giải thích: </span>
                      {r.explanation}
                    </div>
                  )}
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
