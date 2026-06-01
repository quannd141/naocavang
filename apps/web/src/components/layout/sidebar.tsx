'use client';

import { cn } from '@/lib/utils';
import {
  BookMarked,
  GraduationCap,
  Layout,
  MessageCircle,
  Network,
  Settings,
  Sparkles,
  Upload,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const NAV_ITEMS = [
  { href: '/dashboard', label: 'Tổng quan', icon: Layout },
  { href: '/upload', label: 'Tải PDF', icon: Upload },
  { href: '/mindmaps', label: 'Mind maps', icon: Network },
  { href: '/flashcards', label: 'Flashcards', icon: BookMarked },
  { href: '/quizzes', label: 'Quizzes', icon: GraduationCap },
  { href: '/tutor', label: 'Cá Vàng GPT', icon: MessageCircle },
  { href: '/library', label: 'Templates', icon: Sparkles },
  { href: '/settings', label: 'Cài đặt', icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden lg:flex w-60 flex-col border-r border-border bg-card">
      <div className="p-4 border-b border-border">
        <Link href="/dashboard" className="flex items-center gap-2 font-bold text-lg">
          <span className="text-2xl">🧠🐠</span>
          <span>Não Cá Vàng</span>
        </Link>
      </div>

      <nav className="flex-1 p-2 space-y-1 overflow-y-auto">
        {NAV_ITEMS.map((item) => {
          const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                active
                  ? 'bg-brand-500/15 text-brand-800'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground',
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-border">
        <div className="rounded-lg bg-gradient-to-br from-brand-100 to-brand-50 p-3 text-xs">
          <div className="font-semibold text-brand-800">💎 Lên Premium</div>
          <div className="text-brand-700 mt-1">10× AI quota, không quảng cáo</div>
          <Link
            href="/settings#upgrade"
            className="mt-2 inline-block text-brand-700 font-medium hover:underline"
          >
            Xem ngay →
          </Link>
        </div>
      </div>
    </aside>
  );
}
