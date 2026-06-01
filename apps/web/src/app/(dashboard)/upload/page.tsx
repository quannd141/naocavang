'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ApiError, type IngestResult, ingestApi } from '@/lib/api-client';
import { formatBytes, validatePdfFile } from '@/lib/pdf-upload';
import { CheckCircle2, FileText, Loader2, Sparkles, UploadCloud, X } from 'lucide-react';
import Link from 'next/link';
import { useRef, useState } from 'react';

export default function UploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState('');
  const [subject, setSubject] = useState('');
  const [dragging, setDragging] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<IngestResult | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  function pick(selected: File | null | undefined) {
    setError(null);
    setResult(null);
    if (!selected) return;
    const check = validatePdfFile(selected);
    if (!check.ok) {
      setError(check.error ?? 'File không hợp lệ');
      return;
    }
    setFile(selected);
  }

  async function submit() {
    if (!file || busy) return;
    setBusy(true);
    setError(null);
    setResult(null);
    try {
      const res = await ingestApi.uploadPdf(file, {
        title: title.trim() || undefined,
        subject: subject.trim() || undefined,
      });
      setResult(res);
    } catch (err) {
      if (err instanceof ApiError && err.status === 0) {
        setError('Không kết nối được máy chủ. Hãy đảm bảo backend đang chạy rồi thử lại.');
      } else {
        setError(err instanceof ApiError ? err.message : (err as Error).message);
      }
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="container mx-auto max-w-2xl px-4 py-8 lg:py-12">
      <div className="flex items-center gap-3">
        <div className="h-11 w-11 rounded-xl bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center text-xl">
          📄
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Tải PDF lên</h1>
          <p className="text-sm text-muted-foreground">
            Biến tài liệu PDF thành mind map + flashcard tự động bằng AI.
          </p>
        </div>
      </div>

      {!result && (
        <Card className="mt-6">
          <CardContent className="p-5 space-y-5">
            {/* Drop zone */}
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              onDragOver={(e) => {
                e.preventDefault();
                setDragging(true);
              }}
              onDragLeave={() => setDragging(false)}
              onDrop={(e) => {
                e.preventDefault();
                setDragging(false);
                pick(e.dataTransfer.files?.[0]);
              }}
              className={`w-full rounded-xl border-2 border-dashed p-8 text-center transition-colors ${
                dragging ? 'border-brand-500 bg-brand-50' : 'border-border hover:border-brand-400'
              }`}
            >
              <UploadCloud className="mx-auto h-9 w-9 text-brand-500" />
              <p className="mt-2 text-sm font-medium">Kéo thả PDF vào đây, hoặc bấm để chọn</p>
              <p className="mt-1 text-xs text-muted-foreground">Tối đa 10MB · chỉ .pdf</p>
              <input
                ref={inputRef}
                type="file"
                accept="application/pdf,.pdf"
                className="hidden"
                onChange={(e) => pick(e.target.files?.[0])}
              />
            </button>

            {file && (
              <div className="flex items-center gap-3 rounded-lg border border-border bg-muted/30 p-3">
                <FileText className="h-5 w-5 shrink-0 text-brand-600" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{file.name}</p>
                  <p className="text-xs text-muted-foreground">{formatBytes(file.size)}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setFile(null)}
                  className="text-muted-foreground hover:text-foreground"
                  aria-label="Bỏ chọn file"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            )}

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="title">Tiêu đề (tuỳ chọn)</Label>
                <Input
                  id="title"
                  placeholder="Mặc định lấy từ tên file"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  maxLength={200}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="subject">Môn học (tuỳ chọn)</Label>
                <Input
                  id="subject"
                  placeholder="vd: biology, math"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  maxLength={40}
                />
              </div>
            </div>

            {error && (
              <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">
                ⚠️ {error}
              </p>
            )}

            <div className="flex items-center justify-between">
              <p className="text-xs text-muted-foreground">
                AI sẽ tạo 1 mind map và 1 bộ flashcard từ nội dung PDF.
              </p>
              <Button onClick={submit} disabled={!file || busy} size="lg">
                {busy ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" /> Đang xử lý…
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" /> Tạo từ PDF
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {result && (
        <ResultCard
          result={result}
          onReset={() => {
            setFile(null);
            setResult(null);
          }}
        />
      )}
    </div>
  );
}

function ResultCard({ result, onReset }: { result: IngestResult; onReset: () => void }) {
  return (
    <Card className="mt-6 border-green-200">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-green-700">
          <CheckCircle2 className="h-5 w-5" /> Đã tạo xong!
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap items-center gap-2 text-sm">
          <Badge variant="outline">{result.meta.pageCount} trang</Badge>
          <Badge variant="outline">{result.cardCount} thẻ</Badge>
          <Badge variant="outline">model: {result.meta.models.mindmap}</Badge>
        </div>
        <p className="text-sm">
          <span className="font-medium">{result.title}</span> đã được chuyển thành mind map
          {result.deckId ? ' và bộ flashcard' : ''}.
        </p>
        <div className="flex flex-wrap gap-2">
          <Button asChild>
            <Link href={`/mindmaps/${result.mindmapId}`}>Xem mind map →</Link>
          </Button>
          {result.deckId && (
            <Button asChild variant="outline">
              <Link href={`/flashcards/${result.deckId}`}>Học flashcard →</Link>
            </Button>
          )}
          <Button variant="ghost" onClick={onReset}>
            Tải file khác
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
