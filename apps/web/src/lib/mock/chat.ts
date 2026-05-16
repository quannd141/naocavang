/**
 * Mock streaming chat — simulates AI typewriter response.
 * Replace with real SSE/WebSocket call when BE is ready.
 */

const RESPONSES: Record<string, string> = {
  default:
    'Đây là phản hồi mẫu từ Cá Vàng GPT. Trong production tôi sẽ kết nối tới Gemini Flash / Claude Haiku để trả lời câu hỏi cụ thể của bạn theo curriculum VN. Bạn có thể hỏi tôi về bài tập, giải thích khái niệm, sinh ví dụ, hoặc tóm tắt nội dung học.',
  pythagoras:
    'Định lý Pythagoras (Py-ta-go) phát biểu: Trong tam giác vuông, bình phương cạnh huyền bằng tổng bình phương 2 cạnh góc vuông.\n\n**Công thức:** a² + b² = c²\n\nTrong đó:\n- a, b: 2 cạnh góc vuông\n- c: cạnh huyền (đối diện góc vuông)\n\n**Ví dụ:** Tam giác có 2 cạnh góc vuông 3 và 4, cạnh huyền = √(9 + 16) = √25 = 5.\n\nĐịnh lý này được dùng nhiều trong tính khoảng cách, hình học không gian, và là nền tảng của lượng giác.',
  ielts:
    'Đây là template cho IELTS Speaking Part 2 — "Describe a memorable experience":\n\n**Câu mở:** "I\'d like to talk about a memorable experience that has had a profound impact on me — the time I first..."\n\n**Body (theo cue card):**\n1. **What it was** — bối cảnh chung\n2. **When and where** — thời gian, địa điểm\n3. **Who was involved** — người tham gia\n4. **Why it was memorable** — lý do nhớ mãi (tâm điểm)\n\n**Idioms band 7+:**\n- "It really stood out for me because..."\n- "I can still vividly recall..."\n- "Looking back, I realize that..."\n\n**Câu kết:** "All in all, this experience taught me the value of [bài học] and I often think back to it whenever..."',
  toan10:
    'Tóm tắt chương 1 — Toán Lớp 10 "Hàm số bậc 2":\n\n**1. Dạng tổng quát:** y = ax² + bx + c (a ≠ 0)\n\n**2. Đồ thị:** là Parabol với:\n- Đỉnh I(−b/2a; −Δ/4a)\n- Trục đối xứng: x = −b/2a\n- Bề lõm hướng lên nếu a > 0, hướng xuống nếu a < 0\n\n**3. Các dạng đặc biệt:**\n- Dạng đỉnh: y = a(x − h)² + k → đỉnh (h, k)\n- Dạng nghiệm: y = a(x − x₁)(x − x₂) khi parabol cắt Ox\n\n**4. Ứng dụng:**\n- Bài toán cực trị (diện tích max, thời gian rơi)\n- Bài toán bóng đá / ném vật\n- Tìm GTNN/GTLN của biểu thức bậc 2',
};

function pickResponse(prompt: string): string {
  const p = prompt.toLowerCase();
  if (p.includes('pythagoras') || p.includes('py-ta-go')) return RESPONSES.pythagoras;
  if (p.includes('ielts')) return RESPONSES.ielts;
  if (p.includes('hàm số') || p.includes('parabol') || p.includes('toán')) return RESPONSES.toan10;
  return RESPONSES.default;
}

/**
 * Stream tokens of a mock response. Calls onToken once per word.
 * Returns a promise resolved when streaming completes.
 */
export function streamMockResponse(
  prompt: string,
  onToken: (chunk: string) => void,
  options?: { wordDelayMs?: number; signal?: AbortSignal },
): Promise<void> {
  const text = pickResponse(prompt);
  const tokens = text.split(/(\s+)/); // keep whitespace as tokens
  const delay = options?.wordDelayMs ?? 35;

  return new Promise((resolve, reject) => {
    let i = 0;
    function step() {
      if (options?.signal?.aborted) {
        reject(new Error('Aborted'));
        return;
      }
      if (i >= tokens.length) {
        resolve();
        return;
      }
      onToken(tokens[i]!);
      i++;
      setTimeout(step, delay);
    }
    setTimeout(step, 200); // initial think delay
  });
}

export const SUGGESTED_PROMPTS = [
  'Giải thích định lý Pythagoras kèm ví dụ',
  'Cho mẫu IELTS Speaking Part 2 "Describe a memorable experience"',
  'Tóm tắt chương 1 Toán Lớp 10 — Hàm số bậc 2',
  'Cách học từ vựng tiếng Anh nhanh nhớ lâu',
];
