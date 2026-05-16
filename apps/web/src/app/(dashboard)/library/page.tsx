import Link from 'next/link';
import { PageHeader } from '@/components/layout/page-header';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export const metadata = { title: 'Templates' };

const TEMPLATES = [
  { id: 't-toan10', title: 'Toán Lớp 10 — Bộ đề thi giữa kỳ', subject: 'Toán', grade: 'Lớp 10', uses: 1240, emoji: '🔢' },
  { id: 't-van12', title: 'Văn Lớp 12 — Phân tích tác phẩm', subject: 'Văn', grade: 'Lớp 12', uses: 980, emoji: '📖' },
  { id: 't-anh-thpt', title: 'Tiếng Anh THPT — Ngữ pháp', subject: 'Anh', grade: 'THPT', uses: 2100, emoji: '🇬🇧' },
  { id: 't-ly-10', title: 'Vật Lý 10 — Cơ học', subject: 'Lý', grade: 'Lớp 10', uses: 540, emoji: '⚙️' },
  { id: 't-hoa-11', title: 'Hoá 11 — Hữu cơ', subject: 'Hoá', grade: 'Lớp 11', uses: 720, emoji: '🧪' },
  { id: 't-sinh-12', title: 'Sinh 12 — Di truyền', subject: 'Sinh', grade: 'Lớp 12', uses: 380, emoji: '🧬' },
  { id: 't-su-vn', title: 'Sử VN — Toàn bộ giai đoạn', subject: 'Sử', grade: 'THPT', uses: 660, emoji: '📜' },
  { id: 't-dia-12', title: 'Địa Lý 12 — VN', subject: 'Địa', grade: 'Lớp 12', uses: 290, emoji: '🌏' },
  { id: 't-ielts-spk', title: 'IELTS Speaking — 50 Part 2 topics', subject: 'IELTS', grade: 'Adult', uses: 3400, emoji: '🎤' },
  { id: 't-toeic-r', title: 'TOEIC Reading — Bộ 1000 câu', subject: 'TOEIC', grade: 'Adult', uses: 1800, emoji: '🎯' },
  { id: 't-hsk-3', title: 'HSK 3 — 600 từ vựng', subject: 'HSK', grade: 'Adult', uses: 420, emoji: '🇨🇳' },
  { id: 't-cs', title: 'Cơ sở Tin học — ĐH năm 1', subject: 'Tin', grade: 'ĐH', uses: 510, emoji: '💻' },
];

export default function LibraryPage() {
  return (
    <div className="container mx-auto px-4 lg:px-6 py-8 max-w-6xl">
      <PageHeader
        title="Templates công đồng"
        description="Mind map + flashcard + quiz đã được tổng hợp sẵn theo curriculum VN."
      />

      <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {TEMPLATES.map((t) => (
          <Link key={t.id} href={`/library/${t.id}`}>
            <Card className="hover:border-brand-400 hover:shadow-md transition-all cursor-pointer h-full">
              <div className="aspect-square bg-gradient-to-br from-brand-100 to-brand-50 flex items-center justify-center text-6xl">
                {t.emoji}
              </div>
              <CardContent className="p-4">
                <div className="flex gap-2">
                  <Badge variant="outline">{t.subject}</Badge>
                  <Badge variant="secondary">{t.grade}</Badge>
                </div>
                <h3 className="mt-2 font-semibold text-sm line-clamp-2">{t.title}</h3>
                <div className="mt-2 text-xs text-muted-foreground">
                  ⭐ {t.uses.toLocaleString('vi-VN')} người đã dùng
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
