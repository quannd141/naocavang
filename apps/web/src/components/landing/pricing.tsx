import Link from 'next/link';
import { Check } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

const TIERS = [
  {
    name: 'Free',
    price: '0đ',
    period: '/ mãi mãi',
    description: 'Đủ dùng cho học sinh ôn 1 môn',
    features: [
      '50 lần AI sinh mind map / tháng',
      '5 deck flashcard',
      '3 quiz mỗi tuần',
      'AI tutor chat 20 tin/ngày',
      'Templates VN sẵn có',
      'Lưu cloud không giới hạn dung lượng',
    ],
    cta: 'Bắt đầu miễn phí',
    href: '/register',
    highlighted: false,
  },
  {
    name: 'Premium',
    price: '49.000đ',
    period: '/ tháng',
    description: 'Cho HS THPT ôn nhiều môn cùng lúc',
    features: [
      '500 lần AI / tháng (gấp 10×)',
      'Không giới hạn deck',
      'Không giới hạn quiz',
      'AI tutor không giới hạn',
      'Upload PDF tới 50 trang',
      'Export PNG/PDF',
      'Ưu tiên xử lý',
    ],
    cta: 'Nâng cấp Premium',
    href: '/register?plan=premium',
    highlighted: true,
  },
  {
    name: 'Pro',
    price: '149.000đ',
    period: '/ tháng',
    description: 'Cho SV ĐH, researcher, IELTS 7.5+',
    features: [
      '5000 lần AI / tháng',
      'AI Claude Sonnet (chất lượng cao nhất)',
      'PDF không giới hạn trang',
      'Slide PPT + YouTube transcript',
      'Collaborate mind map (sắp ra)',
      'Custom AI prompt',
      'Support 1-1',
    ],
    cta: 'Nâng cấp Pro',
    href: '/register?plan=pro',
    highlighted: false,
  },
];

export function Pricing() {
  return (
    <section id="pricing" className="container mx-auto px-4 py-24">
      <div className="text-center max-w-2xl mx-auto">
        <h2 className="text-3xl md:text-5xl font-bold tracking-tight">
          Giá <span className="text-brand-600">phải chăng</span> cho học sinh Việt
        </h2>
        <p className="mt-4 text-lg text-muted-foreground">
          Rẻ hơn 1 ly trà sữa/tuần. Cancel bất cứ lúc nào. Thanh toán VNPay, MoMo, ZaloPay.
        </p>
      </div>

      <div className="mt-16 grid gap-6 md:grid-cols-3 max-w-5xl mx-auto">
        {TIERS.map((tier) => (
          <Card
            key={tier.name}
            className={cn(
              'relative',
              tier.highlighted && 'border-brand-500 border-2 shadow-xl scale-105',
            )}
          >
            {tier.highlighted && (
              <Badge className="absolute -top-3 left-1/2 -translate-x-1/2">Phổ biến nhất</Badge>
            )}
            <CardHeader>
              <CardTitle>{tier.name}</CardTitle>
              <div className="flex items-baseline gap-1 mt-2">
                <span className="text-4xl font-bold">{tier.price}</span>
                <span className="text-sm text-muted-foreground">{tier.period}</span>
              </div>
              <p className="text-sm text-muted-foreground mt-2">{tier.description}</p>
            </CardHeader>
            <CardContent className="space-y-3">
              <ul className="space-y-2">
                {tier.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm">
                    <Check className="h-4 w-4 text-brand-600 mt-0.5 shrink-0" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
              <Button
                asChild
                className="w-full mt-4"
                variant={tier.highlighted ? 'default' : 'outline'}
              >
                <Link href={tier.href}>{tier.cta}</Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}
