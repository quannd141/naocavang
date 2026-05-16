'use client';

import { useRouter } from 'next/navigation';
import { LogOut, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { mockLogout } from '@/lib/mock/auth';
import { useMockSession } from '@/lib/mock/use-session';

export function Topbar() {
  const router = useRouter();
  const { user } = useMockSession();

  function onLogout() {
    mockLogout();
    router.push('/login');
  }

  return (
    <header className="flex h-16 items-center justify-between border-b border-border bg-background px-4 lg:px-6">
      <div className="flex-1 max-w-md">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Tìm mind map, flashcard, quiz..."
            className="pl-10"
          />
        </div>
      </div>

      <div className="flex items-center gap-3">
        <Badge variant={user?.tier === 'free' ? 'secondary' : 'default'}>
          {user?.tier === 'free' ? 'Free' : user?.tier === 'premium' ? '💎 Premium' : '👑 Pro'}
        </Badge>

        <div className="hidden sm:flex items-center gap-2 text-sm">
          <div className="h-8 w-8 rounded-full bg-brand-200 flex items-center justify-center font-semibold text-brand-800">
            {user?.name?.charAt(0).toUpperCase() ?? '?'}
          </div>
          <div className="hidden md:block">
            <div className="font-medium text-sm leading-tight">{user?.name ?? 'Khách'}</div>
            <div className="text-xs text-muted-foreground leading-tight">{user?.email}</div>
          </div>
        </div>

        <Button variant="ghost" size="icon" onClick={onLogout} title="Đăng xuất">
          <LogOut className="h-4 w-4" />
        </Button>
      </div>
    </header>
  );
}
