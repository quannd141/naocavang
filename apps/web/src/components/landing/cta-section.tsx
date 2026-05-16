import Link from 'next/link';
import { Button } from '@/components/ui/button';

export function CtaSection() {
  return (
    <section className="container mx-auto px-4 py-24">
      <div className="rounded-2xl bg-gradient-to-br from-brand-400 via-brand-500 to-brand-600 p-12 md:p-20 text-center text-foreground shadow-2xl">
        <h2 className="text-3xl md:text-5xl font-bold tracking-tight">
          Sẵn sàng đánh bại <span className="italic">não cá vàng</span>?
        </h2>
        <p className="mt-4 text-lg md:text-xl max-w-2xl mx-auto opacity-90">
          Đăng ký 60 giây. Tạo mind map đầu tiên trong 2 phút. Miễn phí.
        </p>
        <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
          <Button asChild size="lg" variant="default" className="bg-foreground text-background hover:bg-foreground/90">
            <Link href="/register">Dùng thử miễn phí →</Link>
          </Button>
          <Button asChild size="lg" variant="outline" className="border-foreground/30 bg-transparent hover:bg-foreground/10">
            <Link href="/library">Xem templates trước</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
