'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { mockGoogleLogin, mockRegister } from '@/lib/mock/auth';

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!name || !email || !password) {
      setError('Điền đầy đủ thông tin nhé');
      return;
    }
    if (password.length < 6) {
      setError('Mật khẩu tối thiểu 6 ký tự');
      return;
    }
    setLoading(true);
    try {
      await mockRegister({ name, email, password });
      router.push('/dashboard');
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }

  async function onGoogle() {
    setLoading(true);
    try {
      await mockGoogleLogin();
      router.push('/dashboard');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-12 bg-gradient-to-br from-brand-50 to-background">
      <div className="w-full max-w-md rounded-lg border border-border bg-card p-8 shadow-lg">
        <Link href="/" className="flex items-center gap-2 font-bold text-xl mb-6">
          <span className="text-3xl">🧠🐠</span>
          <span>Não Cá Vàng</span>
        </Link>

        <h1 className="text-3xl font-bold tracking-tight">Tạo tài khoản miễn phí</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Đã có tài khoản?{' '}
          <Link href="/login" className="font-medium text-brand-700 hover:underline">
            Đăng nhập
          </Link>
        </p>

        <form onSubmit={onSubmit} className="mt-8 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Họ tên</Label>
            <Input
              id="name"
              type="text"
              autoComplete="name"
              placeholder="Quân Nguyễn"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              placeholder="ban@gmail.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Mật khẩu</Label>
            <Input
              id="password"
              type="password"
              autoComplete="new-password"
              placeholder="Tối thiểu 6 ký tự"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <Button type="submit" className="w-full" size="lg" disabled={loading}>
            {loading ? 'Đang tạo...' : 'Đăng ký miễn phí →'}
          </Button>

          <p className="text-xs text-muted-foreground text-center">
            Bằng việc đăng ký, bạn đồng ý với{' '}
            <Link href="/terms" className="underline">Điều khoản</Link> &{' '}
            <Link href="/privacy" className="underline">Quyền riêng tư</Link>.
          </p>
        </form>

        <div className="my-6 flex items-center gap-4">
          <div className="h-px flex-1 bg-border" />
          <span className="text-xs text-muted-foreground">hoặc</span>
          <div className="h-px flex-1 bg-border" />
        </div>

        <Button
          type="button"
          variant="outline"
          className="w-full"
          size="lg"
          onClick={onGoogle}
          disabled={loading}
        >
          <span>🔵</span> Đăng ký với Google (demo)
        </Button>
      </div>
    </main>
  );
}
