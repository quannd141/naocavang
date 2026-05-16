import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-brand-50 via-background to-background" />
      <div className="container mx-auto px-4 pt-20 pb-24 text-center">
        <Badge variant="outline" className="mx-auto border-brand-300 bg-brand-50">
          🎉 Beta — Miễn phí 50 lần AI mỗi tháng
        </Badge>

        <h1 className="mt-6 text-4xl font-bold tracking-tight md:text-6xl lg:text-7xl">
          Biến mọi thứ bạn học thành{' '}
          <span className="bg-gradient-to-r from-brand-500 to-brand-700 bg-clip-text text-transparent">
            mind map + flashcard
          </span>
          <br />
          tự động bằng AI
        </h1>

        <p className="mt-6 mx-auto max-w-2xl text-lg md:text-xl text-muted-foreground">
          Upload PDF, paste ghi chú, hoặc gõ chủ đề → AI sinh sơ đồ tư duy, flashcard và quiz trong 30 giây.
          Spaced repetition nhắc ôn đúng lúc trước khi <span className="italic">não cá vàng</span> kích hoạt.
        </p>

        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Button asChild size="lg">
            <Link href="/register">Dùng thử miễn phí →</Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link href="/login">Xem demo</Link>
          </Button>
        </div>

        <p className="mt-6 text-xs text-muted-foreground">
          Không cần thẻ tín dụng • Tiếng Việt thuần • Thanh toán VNPay/MoMo
        </p>

        <div className="mt-16 mx-auto max-w-5xl">
          <div className="aspect-video rounded-xl border border-border bg-card shadow-2xl overflow-hidden">
            <div className="h-full w-full bg-gradient-to-br from-brand-100 via-brand-50 to-background flex items-center justify-center">
              <div className="text-center p-8">
                <div className="text-6xl mb-4">🗺️🎴🧪</div>
                <p className="text-lg font-semibold">Mind map + Flashcard + Quiz + AI Tutor</p>
                <p className="text-sm text-muted-foreground mt-2">Screenshot demo sẽ thay vào đây</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
