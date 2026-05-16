import Link from 'next/link';
import { Button } from '@/components/ui/button';

const NAV_LINKS = [
  { href: '/#features', label: 'Tính năng' },
  { href: '/#how', label: 'Cách dùng' },
  { href: '/#pricing', label: 'Giá' },
  { href: '/#faq', label: 'FAQ' },
];

export function Header() {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-border bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2 font-bold text-xl">
          <span className="text-2xl">🧠🐠</span>
          <span className="hidden sm:inline">Não Cá Vàng</span>
        </Link>

        <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
          {NAV_LINKS.map((link) => (
            <Link key={link.href} href={link.href} className="text-muted-foreground hover:text-foreground transition-colors">
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Button asChild variant="ghost" size="sm">
            <Link href="/login">Đăng nhập</Link>
          </Button>
          <Button asChild size="sm">
            <Link href="/register">Dùng thử miễn phí</Link>
          </Button>
        </div>
      </div>
    </header>
  );
}
