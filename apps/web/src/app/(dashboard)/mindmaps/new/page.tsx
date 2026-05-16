'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Sparkles, Upload, FileText } from 'lucide-react';
import { PageHeader } from '@/components/layout/page-header';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { getAllMockMindMaps } from '@/lib/mock/mindmaps';

export default function NewMindMapPage() {
  const router = useRouter();
  const templates = getAllMockMindMaps();

  return (
    <div className="container mx-auto px-4 lg:px-6 py-8 max-w-6xl">
      <PageHeader
        title="Tạo mind map mới"
        description="Chọn cách bạn muốn bắt đầu — từ template, paste text, hay upload file"
      />

      <div className="grid gap-4 md:grid-cols-3 mb-10">
        <Card className="hover:border-brand-400 hover:shadow-md transition-all cursor-pointer" onClick={() => alert('Demo: AI sinh mind map từ text — cần Gemini API key (PH-002)')}>
          <CardContent className="p-6">
            <div className="h-12 w-12 rounded-lg bg-brand-100 flex items-center justify-center">
              <FileText className="h-6 w-6 text-brand-700" />
            </div>
            <h3 className="mt-4 font-semibold">📝 Từ text</h3>
            <p className="mt-1 text-sm text-muted-foreground">Paste ghi chú, AI sinh mind map trong 30s</p>
          </CardContent>
        </Card>

        <Card className="hover:border-brand-400 hover:shadow-md transition-all cursor-pointer" onClick={() => alert('Demo: Upload PDF — cần Gemini API key (PH-002)')}>
          <CardContent className="p-6">
            <div className="h-12 w-12 rounded-lg bg-blue-100 flex items-center justify-center">
              <Upload className="h-6 w-6 text-blue-700" />
            </div>
            <h3 className="mt-4 font-semibold">📄 Upload PDF</h3>
            <p className="mt-1 text-sm text-muted-foreground">Slide bài giảng, sách giáo khoa, tài liệu</p>
          </CardContent>
        </Card>

        <Card className="hover:border-brand-400 hover:shadow-md transition-all cursor-pointer" onClick={() => router.push('/mindmaps/mm-toan10')}>
          <CardContent className="p-6">
            <div className="h-12 w-12 rounded-lg bg-purple-100 flex items-center justify-center">
              <Sparkles className="h-6 w-6 text-purple-700" />
            </div>
            <h3 className="mt-4 font-semibold">⚡ Mind map trống</h3>
            <p className="mt-1 text-sm text-muted-foreground">Tự build từ đầu, drag & drop</p>
          </CardContent>
        </Card>
      </div>

      <h2 className="text-xl font-semibold mb-4">Hoặc chọn 1 template có sẵn</h2>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {templates.map((mm) => (
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
