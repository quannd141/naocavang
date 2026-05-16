'use client';

import Link from 'next/link';
import { BookMarked, GraduationCap, MessageCircle, Network, Plus, Sparkles, Zap } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useMockSession } from '@/lib/mock/use-session';

const STATS = [
  { label: 'Mind maps', value: 3, icon: Network, color: 'text-blue-600 bg-blue-100' },
  { label: 'Flashcards đến hạn', value: 12, icon: BookMarked, color: 'text-orange-600 bg-orange-100' },
  { label: 'Streak ôn (ngày)', value: 3, icon: Zap, color: 'text-brand-700 bg-brand-100' },
];

const RECENT = [
  { type: 'mindmap', title: 'Toán Lớp 10 — Hàm số bậc 2', subtitle: '8 nodes • cập nhật 2 giờ trước', href: '/mindmaps/mm-1', icon: Network },
  { type: 'flashcard', title: 'Tiếng Anh 600 từ vựng', subtitle: '24 cards • 12 đến hạn ôn', href: '/flashcards/fc-1', icon: BookMarked },
  { type: 'quiz', title: 'IELTS Reading — Practice Test 3', subtitle: '10 câu • điểm 7/10', href: '/quizzes/qz-1', icon: GraduationCap },
];

const QUICK_ACTIONS = [
  { title: 'Tạo mind map mới', description: 'Từ template hoặc paste text', href: '/mindmaps/new', icon: Network, color: 'bg-blue-500' },
  { title: 'Ôn flashcard hôm nay', description: '12 thẻ đang chờ bạn', href: '/flashcards', icon: BookMarked, color: 'bg-orange-500' },
  { title: 'Hỏi Cá Vàng GPT', description: 'AI tutor hỗ trợ 24/7', href: '/tutor', icon: MessageCircle, color: 'bg-brand-600' },
];

export default function DashboardHome() {
  const { user } = useMockSession();

  return (
    <div className="container mx-auto px-4 lg:px-6 py-8 max-w-6xl">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Chào {user?.name?.split(' ').pop() ?? 'bạn'} 👋
          </h1>
          <p className="mt-1 text-muted-foreground">
            Hôm nay bạn muốn học gì? Bắt đầu với 1 mind map mới hoặc ôn flashcard đến hạn.
          </p>
        </div>
        <Button asChild size="lg">
          <Link href="/mindmaps/new">
            <Plus className="h-4 w-4" /> Tạo mind map mới
          </Link>
        </Button>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        {STATS.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label}>
              <CardContent className="p-6 flex items-center gap-4">
                <div className={`h-12 w-12 rounded-lg flex items-center justify-center ${stat.color}`}>
                  <Icon className="h-6 w-6" />
                </div>
                <div>
                  <div className="text-3xl font-bold leading-none">{stat.value}</div>
                  <div className="text-sm text-muted-foreground mt-1">{stat.label}</div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="mt-10 grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-xl font-semibold">Hoạt động gần đây</h2>
          <Card>
            <CardContent className="p-0 divide-y divide-border">
              {RECENT.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="flex items-center gap-4 p-4 hover:bg-muted/50 transition-colors"
                  >
                    <div className="h-10 w-10 rounded-md bg-muted flex items-center justify-center">
                      <Icon className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium truncate">{item.title}</div>
                      <div className="text-xs text-muted-foreground">{item.subtitle}</div>
                    </div>
                    <Badge variant="outline" className="hidden sm:inline-flex">{item.type}</Badge>
                  </Link>
                );
              })}
            </CardContent>
          </Card>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-4">Bắt đầu nhanh</h2>
          <div className="space-y-3">
            {QUICK_ACTIONS.map((action) => {
              const Icon = action.icon;
              return (
                <Link key={action.href} href={action.href}>
                  <Card className="hover:border-brand-400 hover:shadow-md transition-all cursor-pointer">
                    <CardContent className="p-4 flex items-center gap-3">
                      <div className={`h-10 w-10 rounded-lg ${action.color} text-white flex items-center justify-center`}>
                        <Icon className="h-5 w-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-sm">{action.title}</div>
                        <div className="text-xs text-muted-foreground">{action.description}</div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        </div>
      </div>

      <Card className="mt-10 border-brand-300 bg-gradient-to-br from-brand-50 to-background">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-brand-600" /> Bạn còn 50 / 50 lượt AI tháng này
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Free plan reset vào ngày 1 hàng tháng. Cần thêm? Nâng cấp Premium để có 500 lượt/tháng và AI chất lượng cao hơn.
          </p>
          <Button asChild className="mt-4">
            <Link href="/settings#upgrade">💎 Xem Premium</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
