/**
 * Mock template metadata for /library + /library/[id].
 * Maps template ID → preview info + which mindmap/deck/quiz it "creates".
 */

export interface Template {
  id: string;
  title: string;
  subject: string;
  grade: string;
  emoji: string;
  description: string;
  uses: number;
  /** Mindmap ID created from this template (links to existing mock) */
  mindmapId?: string;
  /** Deck ID created from this template */
  deckId?: string;
  /** Quiz ID created from this template */
  quizId?: string;
  /** Bullet points shown on detail page */
  contents: string[];
}

export const MOCK_TEMPLATES: Template[] = [
  {
    id: 't-toan10',
    title: 'Toán Lớp 10 — Bộ đề thi giữa kỳ',
    subject: 'Toán', grade: 'Lớp 10', emoji: '🔢', uses: 1240,
    description: 'Bộ tài liệu đầy đủ cho học sinh Lớp 10 ôn thi giữa kỳ Toán — hàm số bậc 2, hệ thức Viet, đồ thị, ứng dụng',
    mindmapId: 'mm-toan10', deckId: 'toan-ct', quizId: 'qz-toan10',
    contents: [
      'Mind map "Hàm số bậc 2" (9 nodes)',
      'Deck "Công thức lượng giác" (5 flashcards)',
      'Quiz "Bài tập hàm số bậc 2" (6 câu trắc nghiệm + điền khuyết)',
      'Tips học hiệu quả từ giáo viên',
    ],
  },
  {
    id: 't-van12',
    title: 'Văn Lớp 12 — Phân tích tác phẩm',
    subject: 'Văn', grade: 'Lớp 12', emoji: '📖', uses: 980,
    description: 'Khung phân tích các tác phẩm trọng tâm chương trình Văn 12: Vợ chồng A Phủ, Rừng xà nu, Sóng, Đất nước',
    contents: [
      'Mind map "5 tác phẩm trọng tâm"',
      'Deck "20 luận điểm chính"',
      'Quiz "Trắc nghiệm tác phẩm" (15 câu)',
    ],
  },
  {
    id: 't-anh-thpt',
    title: 'Tiếng Anh THPT — Ngữ pháp',
    subject: 'Anh', grade: 'THPT', emoji: '🇬🇧', uses: 2100,
    description: '12 cấu trúc ngữ pháp quan trọng nhất THPT: thì, mệnh đề, câu điều kiện, bị động, đảo ngữ',
    deckId: 'eng-600',
    contents: [
      'Mind map "12 thì tiếng Anh"',
      'Deck "600 từ vựng cốt lõi"',
      'Quiz "Grammar 30 câu trắc nghiệm"',
    ],
  },
  {
    id: 't-ly-10',
    title: 'Vật Lý 10 — Cơ học',
    subject: 'Lý', grade: 'Lớp 10', emoji: '⚙️', uses: 540,
    description: 'Chương trình Lý 10: chuyển động, lực, công, năng lượng, va chạm',
    contents: [
      'Mind map "Định luật Newton"',
      'Deck "Công thức cơ học" (40 thẻ)',
      'Quiz "Bài tập tổng hợp" (20 câu)',
    ],
  },
  {
    id: 't-hoa-11',
    title: 'Hoá 11 — Hữu cơ',
    subject: 'Hoá', grade: 'Lớp 11', emoji: '🧪', uses: 720,
    description: 'Hidrocacbon, ancol, anđehit, axit cacboxylic — phản ứng đặc trưng và cơ chế',
    deckId: 'hoa-hc',
    contents: [
      'Mind map "Phân loại hợp chất hữu cơ"',
      'Deck "Phản ứng đặc trưng" (5 thẻ)',
      'Quiz "Nhận biết các chất" (10 câu)',
    ],
  },
  {
    id: 't-sinh-12',
    title: 'Sinh 12 — Di truyền',
    subject: 'Sinh', grade: 'Lớp 12', emoji: '🧬', uses: 380,
    description: 'Quy luật Mendel, ADN, ARN, đột biến gen, di truyền học người',
    contents: ['Mind map "Quy luật di truyền"', 'Deck "30 thuật ngữ"', 'Quiz "Bài tập di truyền"'],
  },
  {
    id: 't-su-vn',
    title: 'Sử VN — Toàn bộ giai đoạn',
    subject: 'Sử', grade: 'THPT', emoji: '📜', uses: 660,
    description: 'Lịch sử Việt Nam từ 1858 đến nay — các mốc sự kiện chính, nhân vật, ý nghĩa',
    mindmapId: 'mm-su', deckId: 'su-vn',
    contents: [
      'Mind map "Cách mạng tháng 8" (15 nodes)',
      'Deck "Mốc thời gian" (5 thẻ)',
      'Quiz "Trật tự thế giới sau WW2" (3 câu)',
    ],
  },
  {
    id: 't-dia-12',
    title: 'Địa Lý 12 — VN',
    subject: 'Địa', grade: 'Lớp 12', emoji: '🌏', uses: 290,
    description: 'Địa lý tự nhiên + kinh tế xã hội Việt Nam, các vùng kinh tế trọng điểm',
    contents: ['Mind map "7 vùng kinh tế"', 'Deck "Số liệu kinh tế VN"', 'Quiz "Bản đồ địa lý"'],
  },
  {
    id: 't-ielts-spk',
    title: 'IELTS Speaking — 50 Part 2 topics',
    subject: 'IELTS', grade: 'Adult', emoji: '🎤', uses: 3400,
    description: 'Template chuẩn cho IELTS Speaking Part 2: cấu trúc, idioms, linking phrases band 7+',
    mindmapId: 'mm-ielts', deckId: 'ielts-idiom',
    contents: [
      'Mind map "5 nhóm chủ đề Part 2" (12 nodes)',
      'Deck "50 Idioms band 7+" (6 thẻ)',
      'Quiz "IELTS Reading Practice 3" (4 câu)',
    ],
    quizId: 'qz-ielts-r',
  },
  {
    id: 't-toeic-r',
    title: 'TOEIC Reading — Bộ 1000 câu',
    subject: 'TOEIC', grade: 'Adult', emoji: '🎯', uses: 1800,
    description: 'Ngân hàng 1000 câu TOEIC Reading Part 5-7, có giải thích chi tiết',
    quizId: 'qz-toeic',
    contents: [
      'Mind map "Cấu trúc đề TOEIC"',
      'Deck "200 từ business"',
      'Quiz "Grammar 30 câu" (3 câu demo)',
    ],
  },
  {
    id: 't-hsk-3',
    title: 'HSK 3 — 600 từ vựng',
    subject: 'HSK', grade: 'Adult', emoji: '🇨🇳', uses: 420,
    description: '600 từ vựng + 300 câu mẫu cho HSK level 3, có pinyin và nghĩa tiếng Việt',
    contents: ['Mind map "Chủ đề HSK 3"', 'Deck "600 từ vựng"', 'Quiz "Đọc hiểu HSK 3"'],
  },
  {
    id: 't-cs',
    title: 'Cơ sở Tin học — ĐH năm 1',
    subject: 'Tin', grade: 'ĐH', emoji: '💻', uses: 510,
    description: 'Kiến thức nhập môn cho SV CNTT năm 1: hệ thống số, thuật toán, OOP cơ bản',
    contents: ['Mind map "OOP 4 trụ cột"', 'Deck "30 thuật ngữ tin học"', 'Quiz "Thuật toán" (10 câu)'],
  },
];

export function getMockTemplate(id: string): Template | undefined {
  return MOCK_TEMPLATES.find((t) => t.id === id);
}
