'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FileText, Sparkles, Upload } from 'lucide-react';
import { useEffect, useState } from 'react';
import { PageHeader } from '@/components/layout/page-header';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ApiError, type TemplateSummary, aiApi, mindmapApi, templateApi } from '@/lib/api-client';
import { getAllMockMindMaps } from '@/lib/mock/mindmaps';

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

export default function NewMindMapPage() {
  const router = useRouter();
  const [remoteTemplates, setRemoteTemplates] = useState<TemplateSummary[]>([]);
  const [prompt, setPrompt] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const mockTemplates = getAllMockMindMaps();

  useEffect(() => {
    templateApi.list().then(setRemoteTemplates).catch(() => setRemoteTemplates([]));
  }, []);

  async function createBlank() {
    setBusy(true);
    setError(null);
    try {
      const mm = await mindmapApi.create({
        title: 'Mind map mới',
        data: {
          nodes: [{ id: 'root', position: { x: 400, y: 100 }, data: { label: 'Chủ đề chính', color: '#FFD700' } }],
          edges: [],
        },
      });
      router.push(`/mindmaps/${mm.id}`);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  }

  async function generateFromText() {
    if (prompt.trim().length < 10) {
      setError('Nhập ít nhất 10 ký tự để AI sinh mind map');
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const ai = await aiApi.generateMindMap(prompt, 'general');
      // Create a mind map with the AI-generated structure
      const mm = await mindmapApi.create({
        title: `[AI] ${prompt.slice(0, 60)}`,
        data: ai.mindmap as object,
      });
      router.push(`/mindmaps/${mm.id}`);
    } catch (err) {
      if (err instanceof ApiError && err.status === 403) {
        setError('Hết quota AI tháng này. Nâng cấp Premium để có thêm.');
      } else {
        setError((err as Error).message);
      }
    } finally {
      setBusy(false);
    }
  }

  async function useTemplate(templateId: string) {
    setBusy(true);
    setError(null);
    try {
      const mm = await mindmapApi.createFromTemplate(templateId);
      router.push(`/mindmaps/${mm.id}`);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="container mx-auto px-4 lg:px-6 py-8 max-w-6xl">
      <PageHeader
        title="Tạo mind map mới"
        description="Chọn cách bạn muốn bắt đầu — AI sinh từ text, blank, hay copy template"
      />

      {error && (
        <Card className="mb-4 border-red-300 bg-red-50">
          <CardContent className="p-3 text-sm text-red-700">⚠️ {error}</CardContent>
        </Card>
      )}

      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="h-10 w-10 rounded-lg bg-brand-100 flex items-center justify-center">
              <FileText className="h-5 w-5 text-brand-700" />
            </div>
            <div>
              <h3 className="font-semibold">📝 AI sinh từ text</h3>
              <p className="text-sm text-muted-foreground">Paste ghi chú hoặc gõ chủ đề, AI sinh mind map trong 30s</p>
            </div>
          </div>
          <Input
            placeholder="Ví dụ: Hàm số bậc 2 — định nghĩa, đồ thị, đỉnh, ứng dụng..."
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            disabled={busy}
          />
          <Button className="mt-3" onClick={generateFromText} disabled={busy}>
            {busy ? 'Đang sinh...' : 'Sinh mind map →'}
          </Button>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2 mb-10">
        <Card
          className="hover:border-brand-400 hover:shadow-md transition-all cursor-pointer"
          onClick={() => !busy && alert('Upload PDF — cần Gemini API key (PH-002). Hiện dùng "AI sinh từ text" được.')}
        >
          <CardContent className="p-6">
            <div className="h-12 w-12 rounded-lg bg-blue-100 flex items-center justify-center">
              <Upload className="h-6 w-6 text-blue-700" />
            </div>
            <h3 className="mt-4 font-semibold">📄 Upload PDF</h3>
            <p className="mt-1 text-sm text-muted-foreground">Slide bài giảng, sách giáo khoa, tài liệu (cần API key thật)</p>
          </CardContent>
        </Card>

        <Card
          className="hover:border-brand-400 hover:shadow-md transition-all cursor-pointer"
          onClick={() => !busy && createBlank()}
        >
          <CardContent className="p-6">
            <div className="h-12 w-12 rounded-lg bg-purple-100 flex items-center justify-center">
              <Sparkles className="h-6 w-6 text-purple-700" />
            </div>
            <h3 className="mt-4 font-semibold">⚡ Mind map trống</h3>
            <p className="mt-1 text-sm text-muted-foreground">Tự build từ đầu, drag & drop</p>
          </CardContent>
        </Card>
      </div>

      {remoteTemplates.length > 0 && (
        <>
          <h2 className="text-xl font-semibold mb-4">Templates từ thư viện</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 mb-8">
            {remoteTemplates.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => useTemplate(t.id)}
                disabled={busy}
                className="text-left"
              >
                <Card className="hover:border-brand-400 hover:shadow-md transition-all cursor-pointer h-full">
                  <div className="aspect-video bg-gradient-to-br from-brand-100 to-brand-50 flex items-center justify-center text-5xl">
                    📚
                  </div>
                  <CardContent className="p-4">
                    {t.subject && <Badge variant="outline">{SUBJECT_LABEL[t.subject] ?? t.subject}</Badge>}
                    <div className="font-semibold mt-2 line-clamp-2">{t.title}</div>
                    <div className="text-xs text-muted-foreground mt-2 line-clamp-2">{t.description}</div>
                    <div className="text-xs text-muted-foreground mt-2">⭐ {t.useCount} người đã dùng</div>
                  </CardContent>
                </Card>
              </button>
            ))}
          </div>
        </>
      )}

      <h2 className="text-xl font-semibold mb-4">Templates demo (mock, chưa lưu BE)</h2>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {mockTemplates.map((mm) => (
          <Link key={mm.id} href={`/mindmaps/${mm.id}`}>
            <Card className="hover:border-brand-400 hover:shadow-md transition-all cursor-pointer h-full">
              <div className="aspect-video bg-gradient-to-br from-brand-100 to-brand-50 flex items-center justify-center text-5xl">
                {mm.emoji}
              </div>
              <CardContent className="p-4">
                <Badge variant="outline">{mm.subject}</Badge>
                <div className="font-semibold mt-2 line-clamp-2">{mm.title}</div>
                <div className="text-xs text-muted-foreground mt-2 line-clamp-2">{mm.description}</div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <div className="mt-8 text-center">
        <Button variant="ghost" asChild>
          <Link href="/mindmaps">← Quay lại danh sách</Link>
        </Button>
      </div>
    </div>
  );
}
