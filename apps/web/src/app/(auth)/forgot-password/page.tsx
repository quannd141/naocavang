import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export const metadata = {
  title: 'Quên mật khẩu',
};

export default function ForgotPasswordPage() {
  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-12 bg-gradient-to-br from-brand-50 to-background">
      <div className="w-full max-w-md rounded-lg border border-border bg-card p-8 shadow-lg">
        <Link href="/" className="flex items-center gap-2 font-bold text-xl mb-6">
          <span className="text-3xl">🧠🐠</span>
          <span>Não Cá Vàng</span>
        </Link>

        <h1 className="text-3xl font-bold tracking-tight">Quên mật khẩu?</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Nhập email — chúng tôi sẽ gửi link đặt lại mật khẩu trong 5 phút.
        </p>

        <form className="mt-8 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" placeholder="ban@gmail.com" required />
          </div>
          <Button type="submit" className="w-full" size="lg" disabled>
            Gửi link đặt lại (demo — chưa hoạt động)
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          Nhớ ra rồi?{' '}
          <Link href="/login" className="text-brand-700 hover:underline">
            Quay lại đăng nhập
          </Link>
        </p>
      </div>
    </main>
  );
}
