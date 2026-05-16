'use client';

import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { BookMarked, Check, GraduationCap, Network } from 'lucide-react';
import { PageHeader } from '@/components/layout/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { type Template, getMockTemplate } from '@/lib/mock/templates';

export default function TemplateDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [template, setTemplate] = useState<Template | undefined>();
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const t = getMockTemplate(params.id);
    if (!t) {
      router.push('/library');
      return;
    }
    setTemplate(t);
    setLoaded(true);
  }, [params.id, router]);

  if (!loaded || !template) {
    return <div className="p-8 text-muted-foreground">Đang tải template...</div>;
  }

  return (
    <div className="container mx-auto px-4 lg:px-6 py-8 max-w-4xl">
      <PageHeader
        title={`${template.emoji} ${template.title}`}
        description={template.description}
      />

      <div className="flex flex-wrap gap-2 mb-6">
        <Badge variant="outline">{template.subject}</Badge>
        <Badge variant="secondary">{template.grade}</Badge>
        <Badge>⭐ {template.uses.toLocaleString('vi-VN')} người đã dùng</Badge>
      </div>

      <Card className="mb-6">
        <CardContent className="p-6">
          <h2 className="text-lg font-semibold mb-3">Template bao gồm</h2>
          <ul className="space-y-2">
            {template.contents.map((item) => (
              <li key={item} className="flex items-start gap-2 text-sm">
                <Check className="h-4 w-4 text-brand-600 mt-0.5 shrink-0" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      <h2 className="text-lg font-semibold mb-3">Mở ngay</h2>
      <div className="grid gap-3 sm:grid-cols-3 mb-8">
        {template.mindmapId ? (
          <Link href={`/mindmaps/${template.mindmapId}`}>
            <Card className="hover:border-brand-400 hover:shadow-md transition-all cursor-pointer h-full">
              <CardContent className="p-4">
                <Network className="h-6 w-6 text-blue-600" />
                <div className="mt-2 font-semibold text-sm">Mở mind map</div>
                <div className="text-xs text-muted-foreground mt-1">Chỉnh sửa, lưu, export</div>
              </CardContent>
            </Card>
          </Link>
        ) : (
          <Card className="opacity-50">
            <CardContent className="p-4">
              <Network className="h-6 w-6 text-muted-foreground" />
              <div className="mt-2 font-semibold text-sm">Mind map (sắp ra)</div>
              <div className="text-xs text-muted-foreground mt-1">Đang hoàn thiện</div>
            </CardContent>
          </Card>
        )}

        {template.deckId ? (
          <Link href={`/flashcards/${template.deckId}/study`}>
            <Card className="hover:border-brand-400 hover:shadow-md transition-all cursor-pointer h-full">
              <CardContent className="p-4">
                <BookMarked className="h-6 w-6 text-orange-600" />
                <div className="mt-2 font-semibold text-sm">Bắt đầu ôn deck</div>
                <div className="text-xs text-muted-foreground mt-1">Flashcard + SM-2</div>
              </CardContent>
            </Card>
          </Link>
        ) : (
          <Card className="opacity-50">
            <CardContent className="p-4">
              <BookMarked className="h-6 w-6 text-muted-foreground" />
              <div className="mt-2 font-semibold text-sm">Deck (sắp ra)</div>
              <div className="text-xs text-muted-foreground mt-1">Đang hoàn thiện</div>
            </CardContent>
          </Card>
        )}

        {template.quizId ? (
          <Link href={`/quizzes/${template.quizId}`}>
            <Card className="hover:border-brand-400 hover:shadow-md transition-all cursor-pointer h-full">
              <CardContent className="p-4">
                <GraduationCap className="h-6 w-6 text-green-600" />
                <div className="mt-2 font-semibold text-sm">Làm quiz</div>
                <div className="text-xs text-muted-foreground mt-1">Trắc nghiệm + giải thích</div>
              </CardContent>
            </Card>
          </Link>
        ) : (
          <Card className="opacity-50">
            <CardContent className="p-4">
              <GraduationCap className="h-6 w-6 text-muted-foreground" />
              <div className="mt-2 font-semibold text-sm">Quiz (sắp ra)</div>
              <div className="text-xs text-muted-foreground mt-1">Đang hoàn thiện</div>
            </CardContent>
          </Card>
        )}
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <Button asChild className="flex-1">
          <Link href="/mindmaps/new">Tạo mind map từ template này</Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href="/library">← Quay lại templates</Link>
        </Button>
      </div>
    </div>
  );
}
