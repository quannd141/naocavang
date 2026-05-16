const STEPS = [
  {
    n: '1',
    title: 'Đưa kiến thức vào',
    description: 'Upload PDF slide bài giảng, paste ghi chú, hoặc gõ chủ đề bạn muốn học.',
    icon: '📥',
  },
  {
    n: '2',
    title: 'AI biến hoá',
    description: 'Trong 30 giây, AI tạo ra mind map đầy đủ + 20-50 flashcard + quiz luyện tập.',
    icon: '✨',
  },
  {
    n: '3',
    title: 'Học và ôn đều đặn',
    description: 'Spaced repetition nhắc đúng thời điểm. 5-10 phút/ngày, nhớ cả tháng.',
    icon: '🎯',
  },
];

export function HowItWorks() {
  return (
    <section id="how" className="bg-muted/30 py-24">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-2xl mx-auto">
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight">
            3 bước từ <span className="text-brand-600">đọc</span> đến <span className="text-brand-600">nhớ</span>
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Khác Anki phải tự gõ flashcard, Não Cá Vàng tự sinh hết. Bạn chỉ việc ôn.
          </p>
        </div>

        <div className="mt-16 grid gap-8 md:grid-cols-3 relative">
          {STEPS.map((step, idx) => (
            <div key={step.n} className="relative text-center">
              <div className="mx-auto h-20 w-20 rounded-full bg-brand-500 text-foreground flex items-center justify-center text-3xl font-bold shadow-lg">
                {step.icon}
              </div>
              <div className="mt-2 text-sm font-medium text-brand-700">Bước {step.n}</div>
              <h3 className="mt-2 text-xl font-bold">{step.title}</h3>
              <p className="mt-2 text-muted-foreground">{step.description}</p>

              {idx < STEPS.length - 1 && (
                <div className="hidden md:block absolute top-10 left-[60%] w-[80%] border-t-2 border-dashed border-brand-300 -z-10" />
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
