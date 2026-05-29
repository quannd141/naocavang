'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import {
  BookMarked,
  GraduationCap,
  MessageCircle,
  Network,
  Plus,
  Sparkles,
  Zap,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useMockSession } from '@/lib/mock/use-session';
import { ApiError, type UserStats, statsApi } from '@/lib/api-client';
import { ReviewActivityCard } from '@/components/dashboard/ReviewActivityCard';
import { DueForecastCard } from '@/components/dashboard/DueForecastCard';

const QUICK_ACTIONS = [
  { title: 'Tạo mind map mới', description: 'Từ template hoặc paste text', href: '/mindmaps/new', icon: Network, color: 'bg-blue-500' },
  { title: 'Ôn flashcard hôm nay', description: 'Cards đến hạn theo SM-2', href: '/flashcards', icon: BookMarked, color: 'bg-orange-500' },
  { title: 'Hỏi Cá Vàng GPT', description: 'AI tutor hỗ trợ 24/7', href: '/tutor', icon: MessageCircle, color: 'bg-brand-600' },
];

function timeAgo(iso: string): string {
  const ms = Date.now() - new Date(iso).getTime();
  const m = Math.floor(ms / 60000);
  if (m < 1) return 'vừa xong';
  if (m < 60) return `${m}p trước`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h trước`;
  const d = Math.floor(h / 24);
  if (d < 7) return `${d}d trước`;
  return new Date(iso).toLocaleDateString('vi-VN');
}

export default function DashboardHome() {
  const { user } = useMockSession();
  const [stats, setStats] = useState<UserStats | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    statsApi
      .me()
      .then(setStats)
      .catch((err) => {
        // dashboard should never block on stats — log + fall back to zeros
        setError(err instanceof ApiError ? err.message : (err as Error).message);
      });
  }, []);

  const statsTiles = [
    {
      label: 'Mind maps',
      value: stats?.mindmapCount ?? 0,
      icon: Network,
      color: 'text-blue-600 bg-blue-100',
    },
    {
      label: 'Flashcards đến hạn',
      value: stats?.dueCards ?? 0,
      icon: BookMarked,
      color: 'text-orange-600 bg-orange-100',
    },
    {
      label: stats?.streak === 0 && stats?.reviewsToday === 0
        ? 'Ôn để bắt đầu streak'
        : 'Streak ôn (ngày)',
      value: stats?.streak ?? 0,
      icon: Zap,
      color: 'text-brand-700 bg-brand-100',
    },
  ];

  // Build recent activity list: 3 most recent items, mix of mindmaps + decks.
  type RecentItem = {
    key: string;
    href: string;
    title: string;
    subtitle: string;
    icon: typeof Network | typeof BookMarked;
    type: 'mindmap' | 'flashcard';
    updatedAt: string;
  };
  const recentItems: RecentItem[] = [
    ...(stats?.recentMindmaps ?? []).map<RecentItem>((mm) => ({
      key: `mm-${mm.id}`,
      href: `/mindmaps/${mm.id}`,
      title: mm.title,
      subtitle: `Mind map • ${timeAgo(mm.updatedAt)}`,
      icon: Network,
      type: 'mindmap',
      updatedAt: mm.updatedAt,
    })),
    ...(stats?.recentDecks ?? []).map<RecentItem>((d) => ({
      key: `deck-${d.id}`,
      href: `/flashcards/${d.id}`,
      title: d.title,
      subtitle: d.dueCards > 0
        ? `Deck • ${d.dueCards} cards đến hạn • ${timeAgo(d.updatedAt)}`
        : `Deck • ${timeAgo(d.updatedAt)}`,
      icon: BookMarked,
      type: 'flashcard',
      updatedAt: d.updatedAt,
    })),
  ]
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 5);

  return (
    <div className="container mx-auto px-4 lg:px-6 py-8 max-w-6xl">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Chào {user?.name?.split(' ').pop() ?? 'bạn'} 👋
          </h1>
          <p className="mt-1 text-muted-foreground">
            {stats?.dueCards && stats.dueCards > 0
              ? `Hôm nay bạn có ${stats.dueCards} flashcard đến hạn ôn — bắt đầu ngay nhé!`
              : 'Hôm nay bạn muốn học gì? Bắt đầu với 1 mind map mới hoặc auto-gen flashcard.'}
          </p>
        </div>
        <Button asChild size="lg">
          <Link href="/mindmaps/new">
            <Plus className="h-4 w-4" /> Tạo mind map mới
          </Link>
        </Button>
      </div>

      {error && (
        <Card className="mt-6 border-red-300 bg-red-50">
          <CardContent className="p-3 text-sm text-red-700">⚠️ {error}</CardContent>
        </Card>
      )}

      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        {statsTiles.map((stat) => {
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

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <ReviewActivityCard />
        <DueForecastCard />
      </div>

      <div className="mt-10 grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-xl font-semibold">Hoạt động gần đây</h2>
          {recentItems.length === 0 ? (
            <Card className="border-2 border-dashed">
              <CardContent className="p-6 text-center text-sm text-muted-foreground">
                Chưa có hoạt động. Bắt đầu bằng cách{' '}
                <Link href="/mindmaps/new" className="text-brand-700 underline">
                  tạo mind map đầu tiên
                </Link>
                .
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="p-0 divide-y divide-border">
                {recentItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.key}
                      href={item.href}
                      className="flex items-center gap-4 p-4 hover:bg-muted/50 transition-colors"
                    >
                      <div className="h-10 w-10 rounded-md bg-muted flex items-center justify-center">
                        <Icon className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium truncate">{item.title}</div>
                        <div className="text-xs text-muted-foreground truncate">{item.subtitle}</div>
                      </div>
                      <Badge variant="outline" className="hidden sm:inline-flex">
                        {item.type}
                      </Badge>
                    </Link>
                  );
                })}
              </CardContent>
            </Card>
          )}
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
                      <div
                        className={`h-10 w-10 rounded-lg ${action.color} text-white flex items-center justify-center`}
                      >
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
            <Sparkles className="h-5 w-5 text-brand-600" />
            Bạn còn 50 / 50 lượt AI tháng này
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Free plan reset vào ngày 1 hàng tháng. Cần thêm? Nâng cấp Premium để có 500 lượt/tháng
            và AI chất lượng cao hơn.
          </p>
          <Button asChild className="mt-4">
            <Link href="/settings#upgrade">💎 Xem Premium</Link>
          </Button>
        </CardContent>
      </Card>

      {stats && stats.quizCount > 0 && (
        <div className="mt-6 text-xs text-muted-foreground text-center">
          📊 Tổng cộng: {stats.mindmapCount} mind maps • {stats.deckCount} decks •{' '}
          {stats.quizCount} quizzes • {stats.reviewsToday} reviews hôm nay
          <GraduationCap className="inline h-3 w-3 ml-1" />
        </div>
      )}
    </div>
  );
}
