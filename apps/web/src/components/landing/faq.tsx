'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

const FAQS = [
  {
    q: 'Não Cá Vàng khác Quizlet, Anki, ChatGPT ở đâu?',
    a: 'Quizlet/Anki chỉ có flashcard. ChatGPT là chat thuần. Não Cá Vàng = mind map + flashcard + quiz + tutor + spaced repetition trong 1 platform, 100% tiếng Việt, hiểu chương trình học VN, giá Việt Nam.',
  },
  {
    q: 'AI có hiểu tiếng Việt và chương trình SGK VN không?',
    a: 'Có. Chúng tôi dùng Gemini Flash 2.0 + Claude Haiku/Sonnet — đều support tiếng Việt rất tốt. Templates đã chuẩn theo SGK Cánh Diều, Kết Nối Tri Thức, Chân Trời Sáng Tạo.',
  },
  {
    q: 'Tôi đang dùng Anki / Quizlet, có import được không?',
    a: 'Tính năng import Anki .apkg sẽ có ở v0.2 (Sprint 7). Quizlet CSV export cũng được hỗ trợ.',
  },
  {
    q: 'Spaced repetition là gì? Có thật sự hiệu quả không?',
    a: 'SR là kỹ thuật ôn flashcard ngay TRƯỚC khi não bạn quên (đường cong Ebbinghaus). Chúng tôi dùng SM-2 (chuẩn của SuperMemo + Anki). Nghiên cứu chỉ ra SR giúp nhớ lâu hơn 200% so với học cramming.',
  },
  {
    q: 'Free tier có giới hạn gì không?',
    a: '50 lần gọi AI sinh nội dung mỗi tháng (đủ ôn 1 môn ở mức trung bình). Không giới hạn ôn flashcard / quiz. Nâng Premium 49k khi cần thêm.',
  },
  {
    q: 'Thanh toán thế nào? Có thể cancel không?',
    a: 'VNPay, MoMo, ZaloPay đều OK. Cancel bất cứ lúc nào, không hỏi lý do. Còn hạn còn dùng. Refund 7 ngày nếu không hài lòng.',
  },
  {
    q: 'Dữ liệu cá nhân có an toàn không?',
    a: 'Có. Server đặt tại VN (theo Nghị định 53/2022). Mật khẩu hash bcrypt. Tuân thủ Nghị định 13/2023 PDPA. Bạn có quyền export + xoá toàn bộ dữ liệu bất cứ lúc nào.',
  },
  {
    q: 'Khi nào có app mobile?',
    a: 'Web responsive trước (mobile browser dùng ok). Native iOS/Android app sẽ ra ở v0.3 (Q4 2026).',
  },
];

export function FAQ() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section id="faq" className="container mx-auto px-4 py-24">
      <div className="text-center max-w-2xl mx-auto">
        <h2 className="text-3xl md:text-5xl font-bold tracking-tight">
          Câu hỏi <span className="text-brand-600">thường gặp</span>
        </h2>
        <p className="mt-4 text-lg text-muted-foreground">
          Còn thắc mắc? Email <a href="mailto:hello@naocavang.vn" className="text-brand-600 underline">hello@naocavang.vn</a>
        </p>
      </div>

      <div className="mt-12 max-w-3xl mx-auto space-y-2">
        {FAQS.map((faq, idx) => {
          const isOpen = open === idx;
          return (
            <div key={faq.q} className="rounded-lg border border-border bg-card overflow-hidden">
              <button
                type="button"
                onClick={() => setOpen(isOpen ? null : idx)}
                className="w-full flex items-center justify-between p-4 text-left font-semibold hover:bg-muted/50 transition-colors"
              >
                <span>{faq.q}</span>
                <ChevronDown
                  className={cn('h-5 w-5 text-muted-foreground transition-transform', isOpen && 'rotate-180')}
                />
              </button>
              {isOpen && (
                <div className="px-4 pb-4 text-muted-foreground">{faq.a}</div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
