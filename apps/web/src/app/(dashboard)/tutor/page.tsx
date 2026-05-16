import { PageHeader } from '@/components/layout/page-header';
import { Card, CardContent } from '@/components/ui/card';

export const metadata = { title: 'Cá Vàng GPT' };

export default function TutorPage() {
  return (
    <div className="container mx-auto px-4 lg:px-6 py-8 max-w-4xl">
      <PageHeader
        title="🐠 Cá Vàng GPT"
        description="AI tutor 24/7. Hỏi gì cũng được — từ bài tập đến giải thích khái niệm."
      />
      <Card>
        <CardContent className="p-12 text-center">
          <div className="text-6xl">🐠💭</div>
          <h2 className="mt-4 text-xl font-semibold">Phase 7 — đang build</h2>
          <p className="mt-2 text-muted-foreground">
            Chat UI với mock streaming response sẽ có ở Phase 7 của FE_DEMO_PLAN.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
