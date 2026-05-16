export const metadata = {
  title: 'Bảng điều khiển',
};

export default function DashboardPage() {
  return (
    <main className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold">Bảng điều khiển</h1>
      <p className="mt-2 text-muted-foreground">
        Chào mừng quay lại! Hôm nay bạn muốn học gì?
      </p>

      {/* TODO(Sprint 2): dashboard widgets — mind map list, due flashcards, recent activity */}
      <div className="mt-8 rounded-md border border-dashed border-border bg-muted/30 p-12 text-center">
        <p className="text-muted-foreground">
          📚 Dashboard đầy đủ sẽ có ở Sprint 2 (mind map list + flashcard ôn hôm nay)
        </p>
      </div>
    </main>
  );
}
