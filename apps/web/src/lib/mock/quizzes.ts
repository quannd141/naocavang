export type QuestionType = 'multi' | 'tf' | 'fill';

export interface QuizQuestion {
  id: string;
  type: QuestionType;
  question: string;
  options?: string[]; // for multi
  correctIndex?: number; // for multi or tf
  correctAnswer?: string; // for fill (case-insensitive contains)
  explanation: string;
}

export interface Quiz {
  id: string;
  title: string;
  subject: string;
  description: string;
  difficulty: 'easy' | 'medium' | 'hard';
  timeMinutes: number;
  questions: QuizQuestion[];
}

export const MOCK_QUIZZES: Quiz[] = [
  {
    id: 'qz-toan10',
    title: 'Toán 10 — Bài tập hàm số bậc 2',
    subject: 'Toán',
    description: '8 câu trắc nghiệm + điền khuyết về hàm số bậc 2',
    difficulty: 'medium',
    timeMinutes: 15,
    questions: [
      {
        id: 'q1',
        type: 'multi',
        question: 'Hàm số y = x² − 4x + 3 có đỉnh tại điểm nào?',
        options: ['I(2; −1)', 'I(−2; −1)', 'I(2; 3)', 'I(−2; 3)'],
        correctIndex: 0,
        explanation: 'x_I = −b/2a = 4/2 = 2 → y_I = 4 − 8 + 3 = −1. Vậy I(2; −1).',
      },
      {
        id: 'q2',
        type: 'tf',
        question: 'Parabol y = x² + 2x + 5 luôn cắt trục Ox tại 2 điểm phân biệt.',
        options: ['Đúng', 'Sai'],
        correctIndex: 1,
        explanation: 'Δ = 4 − 20 = −16 < 0 → parabol không cắt trục Ox.',
      },
      {
        id: 'q3',
        type: 'multi',
        question: 'Trục đối xứng của parabol y = 2x² + 8x − 3 là?',
        options: ['x = −2', 'x = 2', 'x = −4', 'x = 4'],
        correctIndex: 0,
        explanation: 'Trục đối xứng x = −b/2a = −8/(2·2) = −2.',
      },
      {
        id: 'q4',
        type: 'fill',
        question: 'Giá trị cực tiểu của hàm số y = x² − 6x + 10 là ___',
        correctAnswer: '1',
        explanation: 'y_min = −Δ/4a = −(36 − 40)/4 = 1. Hoặc thay x = 3: y = 9 − 18 + 10 = 1.',
      },
      {
        id: 'q5',
        type: 'multi',
        question: 'Parabol y = ax² + bx + c có a < 0 thì:',
        options: ['Bề lõm hướng lên', 'Bề lõm hướng xuống', 'Cắt trục Ox tại 2 điểm', 'Đỉnh là điểm cực tiểu'],
        correctIndex: 1,
        explanation: 'a < 0 → bề lõm hướng xuống, đỉnh là điểm cực đại.',
      },
      {
        id: 'q6',
        type: 'tf',
        question: 'Hai đồ thị y = x² và y = (x − 2)² có cùng hình dạng, khác vị trí.',
        options: ['Đúng', 'Sai'],
        correctIndex: 0,
        explanation: 'Cùng a = 1, khác đỉnh. Phép tịnh tiến không đổi hình dạng.',
      },
    ],
  },
  {
    id: 'qz-ielts-r',
    title: 'IELTS Reading — Practice Test 3',
    subject: 'IELTS',
    description: '5 câu trắc nghiệm dạng matching + completion',
    difficulty: 'hard',
    timeMinutes: 20,
    questions: [
      {
        id: 'q1',
        type: 'multi',
        question: 'According to the passage, the main cause of coral bleaching is:',
        options: ['Overfishing', 'Rising sea temperatures', 'Plastic pollution', 'Tourism'],
        correctIndex: 1,
        explanation: 'Coral bleaching xảy ra khi nhiệt độ nước biển tăng quá ngưỡng chịu đựng của tảo zooxanthellae.',
      },
      {
        id: 'q2',
        type: 'tf',
        question: 'The writer believes climate change is reversible within 50 years.',
        options: ['True', 'False'],
        correctIndex: 1,
        explanation: 'Tác giả nêu rõ "the damage may persist for centuries" → không thể đảo ngược trong 50 năm.',
      },
      {
        id: 'q3',
        type: 'fill',
        question: 'The Great Barrier Reef has lost approximately ___% of its corals since 1995.',
        correctAnswer: '50',
        explanation: 'Theo paragraph 3: "approximately half of the corals have been lost since 1995".',
      },
      {
        id: 'q4',
        type: 'multi',
        question: 'Which of the following is NOT mentioned as a solution?',
        options: ['Marine protected areas', 'Coral farming', 'Banning sunscreen', 'Building artificial islands'],
        correctIndex: 3,
        explanation: 'Bài viết đề cập 3 giải pháp đầu, không nói đến artificial islands.',
      },
    ],
  },
  {
    id: 'qz-su',
    title: 'Lịch sử 12 — Chương 1',
    subject: 'Sử',
    description: 'Trật tự thế giới sau Chiến tranh thế giới thứ 2',
    difficulty: 'easy',
    timeMinutes: 10,
    questions: [
      {
        id: 'q1',
        type: 'multi',
        question: 'Hội nghị Ianta (2/1945) diễn ra giữa lãnh đạo của:',
        options: ['Mỹ, Anh, Pháp', 'Mỹ, Liên Xô, Anh', 'Mỹ, Trung Quốc, Liên Xô', 'Mỹ, Anh, Trung Quốc'],
        correctIndex: 1,
        explanation: 'Tam cường gồm Roosevelt (Mỹ), Stalin (Liên Xô), Churchill (Anh).',
      },
      {
        id: 'q2',
        type: 'fill',
        question: 'Liên Hợp Quốc thành lập ngày ___ tháng 10 năm 1945.',
        correctAnswer: '24',
        explanation: '24/10/1945 — ngày Liên Hợp Quốc chính thức thành lập.',
      },
      {
        id: 'q3',
        type: 'tf',
        question: 'Trật tự 2 cực Ianta tan rã sau khi Liên Xô sụp đổ năm 1991.',
        options: ['Đúng', 'Sai'],
        correctIndex: 0,
        explanation: '1991 Liên Xô tan rã → kết thúc trật tự 2 cực Ianta, mở ra trật tự đa cực.',
      },
    ],
  },
  {
    id: 'qz-toeic',
    title: 'TOEIC Part 5 — Grammar 30 câu',
    subject: 'TOEIC',
    description: 'Incomplete sentences — grammar & vocabulary',
    difficulty: 'medium',
    timeMinutes: 20,
    questions: [
      {
        id: 'q1',
        type: 'multi',
        question: 'The committee ___ the proposal next Monday.',
        options: ['discuss', 'discusses', 'will discuss', 'discussed'],
        correctIndex: 2,
        explanation: '"next Monday" báo hiệu tương lai → will discuss.',
      },
      {
        id: 'q2',
        type: 'multi',
        question: 'Despite ___ very tired, she completed the report on time.',
        options: ['was', 'being', 'is', 'been'],
        correctIndex: 1,
        explanation: 'Despite + V-ing / N. → "being".',
      },
      {
        id: 'q3',
        type: 'fill',
        question: 'I look forward ___ hearing from you.',
        correctAnswer: 'to',
        explanation: '"look forward to + V-ing" là cấu trúc cố định.',
      },
    ],
  },
];

export function getMockQuiz(id: string): Quiz | undefined {
  return MOCK_QUIZZES.find((q) => q.id === id);
}
