import { Card, CardContent } from '@/components/ui/card';

const FEATURES = [
  {
    icon: '🗺️',
    title: 'Mind map AI',
    description: 'Upload PDF / paste text → AI sinh mind map có hệ thống trong 30s. Edit, color-code, export PNG.',
  },
  {
    icon: '🎴',
    title: 'Flashcard tự động',
    description: 'Mỗi node mind map → flashcard. Spaced repetition SM-2 nhắc bạn ôn đúng lúc trước khi quên.',
  },
  {
    icon: '🧪',
    title: 'Quiz luyện thi',
    description: 'AI sinh trắc nghiệm + điền khuyết từ kiến thức bạn đã học. Câu sai tự thêm vào flashcard.',
  },
  {
    icon: '🐠',
    title: 'Cá Vàng GPT — AI tutor',
    description: 'Chat hỏi đáp 24/7 với AI hiểu curriculum VN. Giải thích bài tập, sinh ví dụ, tóm tắt chương.',
  },
  {
    icon: '📚',
    title: 'Templates VN sẵn có',
    description: 'Toán/Văn/Anh/Lý/Hoá/Sinh/Sử/Địa cấp THPT + IELTS/TOEIC/HSK. Một click dùng ngay.',
  },
  {
    icon: '🇻🇳',
    title: 'Tiếng Việt thuần + Giá Việt',
    description: 'UI 100% tiếng Việt, AI hiểu văn hoá VN. Free 50 AI/tháng • Premium 49k • Pro 149k.',
  },
];

export function Features() {
  return (
    <section id="features" className="container mx-auto px-4 py-24">
      <div className="text-center max-w-2xl mx-auto">
        <h2 className="text-3xl md:text-5xl font-bold tracking-tight">
          Tất cả tool học tập trong <span className="text-brand-600">1 nơi</span>
        </h2>
        <p className="mt-4 text-lg text-muted-foreground">
          Không còn phải chuyển qua lại giữa Anki, Quizlet, ChatGPT, Notion. Mọi thứ trong Não Cá Vàng.
        </p>
      </div>

      <div className="mt-16 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {FEATURES.map((feature) => (
          <Card key={feature.title} className="hover:border-brand-400 hover:shadow-md transition-all">
            <CardContent className="p-6">
              <div className="text-4xl">{feature.icon}</div>
              <h3 className="mt-4 text-xl font-semibold">{feature.title}</h3>
              <p className="mt-2 text-muted-foreground">{feature.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}
