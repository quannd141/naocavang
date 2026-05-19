'use client';

import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Network } from 'lucide-react';
import { PageHeader } from '@/components/layout/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  ApiError,
  type TemplateFull,
  mindmapApi,
  templateApi,
} from '@/lib/api-client';

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

const SUBJECT_EMOJI: Record<string, string> = {
  math: '🔢',
  physics: '⚙️',
  chemistry: '🧪',
  biology: '🧬',
  history: '📜',
  geography: '🌏',
  literature: '📖',
  english: '🇬🇧',
  general: '📚',
};

export default function TemplateDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [template, setTemplate] = useState<TemplateFull | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    templateApi
      .get(params.id)
      .then(setTemplate)
      .catch((err: unknown) => {
        if (err instanceof ApiError && err.status === 404) {
          router.push('/library');
          return;
        }
        setError(err instanceof ApiError ? err.message : (err as Error).message);
      });
  }, [params.id, router]);

  async function copyToMyMindmaps() {
    if (!template) return;
    setBusy(true);
    setError(null);
    try {
      const mm = await mindmapApi.createFromTemplate(template.id);
      router.push(`/mindmaps/${mm.id}`);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : (err as Error).message);
      setBusy(false);
    }
  }

  if (error && !template) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <Card className="border-red-300 bg-red-50">
          <CardContent className="p-4 text-sm text-red-700">⚠️ {error}</CardContent>
        </Card>
      </div>
    );
  }
  if (!template) {
    return <div className="p-8 text-muted-foreground">Đang tải template...</div>;
  }

  const emoji = (template.subject && SUBJECT_EMOJI[template.subject]) ?? '📚';
  const subjectLabel = template.subject
    ? SUBJECT_LABEL[template.subject] ?? template.subject
    : 'Tổng hợp';
  const nodeCount =
    typeof template.data === 'object' && template.data !== null && Array.isArray(template.data.nodes)
      ? template.data.nodes.length
      : 0;

  return (
    <div className="container mx-auto px-4 lg:px-6 py-8 max-w-4xl">
      <PageHeader
        title={`${emoji} ${template.title}`}
        description={template.description}
      />

      <div className="flex flex-wrap gap-2 mb-6">
        <Badge variant="outline">{subjectLabel}</Badge>
        {template.gradeLevel && <Badge variant="secondary">{template.gradeLevel}</Badge>}
        <Badge>⭐ {template.useCount.toLocaleString('vi-VN')} người đã dùng</Badge>
        <Badge variant="outline">{nodeCount} nodes</Badge>
        {template.tags?.map((tag) => (
          <Badge key={tag} variant="outline">
            #{tag}
          </Badge>
        ))}
      </div>

      {error && (
        <Card className="mb-6 border-red-300 bg-red-50">
          <CardContent className="p-4 text-sm text-red-700">⚠️ {error}</CardContent>
        </Card>
      )}

      <Card className="mb-6">
        <CardContent className="p-6">
          <h2 className="text-lg font-semibold mb-3">Tác giả</h2>
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-brand-100 flex items-center justify-center font-semibold text-brand-700">
              {template.authorName.charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="font-medium">{template.authorName}</div>
              <div className="text-xs text-muted-foreground">
                Tạo: {new Date(template.createdAt).toLocaleDateString('vi-VN')}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <h2 className="text-lg font-semibold mb-3">Mở</h2>
      <div className="grid gap-3 sm:grid-cols-2 mb-8">
        <Card className="hover:border-brand-400 hover:shadow-md transition-all">
          <CardContent className="p-5">
            <Network className="h-8 w-8 text-blue-600" />
            <h3 className="mt-3 font-semibold">Copy vào "Mind maps của tôi"</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Tạo bản copy độc lập để chỉnh sửa. Tăng useCount của template.
            </p>
            <Button className="mt-4 w-full" disabled={busy} onClick={copyToMyMindmaps}>
              {busy ? 'Đang copy...' : 'Copy & mở →'}
            </Button>
          </CardContent>
        </Card>

        <Card className="opacity-50">
          <CardContent className="p-5">
            <div className="h-8 w-8 rounded bg-muted flex items-center justify-center text-lg">📦</div>
            <h3 className="mt-3 font-semibold">Flashcard + Quiz từ template</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Sau khi copy mind map, vào /flashcards hoặc /quizzes để auto-gen từ nó.
            </p>
            <Button className="mt-4 w-full" variant="outline" disabled>
              Cần copy mind map trước
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="text-center">
        <Button variant="ghost" asChild>
          <Link href="/library">← Quay lại templates</Link>
        </Button>
      </div>
    </div>
  );
}
