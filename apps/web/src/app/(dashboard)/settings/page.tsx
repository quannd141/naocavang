'use client';

import Link from 'next/link';
import { Check } from 'lucide-react';
import { PageHeader } from '@/components/layout/page-header';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useMockSession } from '@/lib/mock/use-session';

const TIERS = [
  { name: 'Free', price: '0đ', features: ['50 AI/tháng', '5 deck', 'AI tutor 20 tin/ngày'], current: true },
  { name: 'Premium', price: '49.000đ/th', features: ['500 AI/tháng', 'Không giới hạn deck', 'Ưu tiên xử lý'], current: false },
  { name: 'Pro', price: '149.000đ/th', features: ['5000 AI/tháng', 'Claude Sonnet (cao cấp)', 'Support 1-1'], current: false },
];

export default function SettingsPage() {
  const { user } = useMockSession();

  return (
    <div className="container mx-auto px-4 lg:px-6 py-8 max-w-4xl">
      <PageHeader title="Cài đặt" description="Quản lý tài khoản và gói dịch vụ" />

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Thông tin cá nhân</CardTitle>
            <CardDescription>Demo mode — thay đổi không lưu lên server</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Họ tên</Label>
              <Input id="name" defaultValue={user?.name ?? ''} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" defaultValue={user?.email ?? ''} disabled />
              <p className="text-xs text-muted-foreground">Đổi email cần xác minh — chưa hỗ trợ ở demo</p>
            </div>
            <Button>Lưu thay đổi</Button>
          </CardContent>
        </Card>

        <Card id="upgrade">
          <CardHeader>
            <CardTitle>Gói dịch vụ</CardTitle>
            <CardDescription>Gói hiện tại: {user?.tier === 'free' ? 'Free' : user?.tier}</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-3">
            {TIERS.map((tier) => (
              <div
                key={tier.name}
                className={`rounded-lg border-2 p-4 ${
                  tier.current ? 'border-brand-500 bg-brand-50' : 'border-border'
                }`}
              >
                <div className="flex items-center justify-between">
                  <h3 className="font-bold">{tier.name}</h3>
                  {tier.current && <Badge>Đang dùng</Badge>}
                </div>
                <div className="mt-2 text-2xl font-bold">{tier.price}</div>
                <ul className="mt-3 space-y-1 text-sm">
                  {tier.features.map((f) => (
                    <li key={f} className="flex items-start gap-2">
                      <Check className="h-4 w-4 text-brand-600 mt-0.5 shrink-0" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
                {!tier.current && (
                  <Button className="mt-4 w-full" size="sm">Nâng cấp</Button>
                )}
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Khu vực nguy hiểm</CardTitle>
            <CardDescription>Các hành động không thể hoàn tác</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium">Export dữ liệu</div>
                <div className="text-sm text-muted-foreground">Tải về tất cả mind map, flashcard, quiz</div>
              </div>
              <Button variant="outline">Export JSON</Button>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium text-red-700">Xoá tài khoản</div>
                <div className="text-sm text-muted-foreground">Xoá vĩnh viễn theo Nghị định 13/2023 PDPA</div>
              </div>
              <Button variant="destructive">Xoá</Button>
            </div>
          </CardContent>
        </Card>

        <div className="text-center text-sm text-muted-foreground">
          <Link href="/dashboard" className="hover:underline">← Quay lại Dashboard</Link>
        </div>
      </div>
    </div>
  );
}
