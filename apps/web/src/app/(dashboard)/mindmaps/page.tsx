import Link from 'next/link';
import { Plus } from 'lucide-react';
import { PageHeader } from '@/components/layout/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

export const metadata = { title: 'Mind maps' };

const PLACEHOLDER = [
  { id: 'mm-toan10', title: 'Toán Lớp 10 — Hàm số bậc 2', subject: 'Toán', nodes: 8, updated: '2 giờ trước' },
  { id: 'mm-ielts', title: 'IELTS Speaking Part 2 — Templates', subject: 'IELTS', nodes: 12, updated: 'Hôm qua' },
  { id: 'mm-su', title: 'Lịch sử VN — Cách mạng tháng 8', subject: 'Sử', nodes: 15, updated: '3 ngày trước' },
];

export default function MindMapsPage() {
  return (
    <div className="container mx-auto px-4 lg:px-6 py-8 max-w-6xl">
      <PageHeader
        title="Mind maps"
        description="Sơ đồ tư duy của bạn. Click để mở editor."
        action={
          <Button asChild>
            <Link href="/mindmaps/new"><Plus className="h-4 w-4" /> Tạo mới</Link>
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {PLACEHOLDER.map((mm) => (
          <Link key={mm.id} href={`/mindmaps/${mm.id}`}>
            <Card className="hover:border-brand-400 hover:shadow-md transition-all cursor-pointer h-full">
              <div className="aspect-video bg-gradient-to-br from-brand-100 to-brand-50 flex items-center justify-center text-5xl">
                🗺️
              </div>
              <CardContent className="p-4">
                <div className="text-xs font-medium text-brand-700">{mm.subject}</div>
                <div className="font-semibold mt-1 line-clamp-2">{mm.title}</div>
                <div className="text-xs text-muted-foreground mt-2">{mm.nodes} nodes • {mm.updated}</div>
              </CardContent>
            </Card>
          </Link>
        ))}

        <Link href="/mindmaps/new">
          <Card className="border-2 border-dashed hover:border-brand-500 hover:bg-brand-50 transition-all cursor-pointer h-full flex items-center justify-center min-h-[220px]">
            <CardContent className="text-center p-6">
              <Plus className="h-8 w-8 mx-auto text-muted-foreground" />
              <div className="mt-2 font-semibold">Tạo mind map mới</div>
              <div className="text-xs text-muted-foreground mt-1">Từ template hoặc paste text</div>
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  );
}
