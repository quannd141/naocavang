/**
 * Tutor prompt assembly + reply chunking. Pure functions — no IO, fully testable.
 *
 * The tutor ("Cá Vàng GPT") is a Vietnamese-curriculum study assistant. We build
 * a system prompt that pins persona + language, and a user prompt that optionally
 * grafts on a mind-map context so answers stay on-topic.
 */

export interface TutorContext {
  /** Title of the mind map / topic the user is studying, if any. */
  topicTitle?: string;
  /** Subject code (e.g. 'math', 'biology') for tone/terminology hints. */
  subject?: string;
}

export const TUTOR_SYSTEM_PROMPT =
  'Bạn là Cá Vàng GPT — gia sư AI thân thiện, hiểu chương trình học Việt Nam. ' +
  'Luôn trả lời bằng tiếng Việt, ngắn gọn, có ví dụ gần gũi và mẹo ghi nhớ. ' +
  'Nếu câu hỏi ngoài phạm vi học tập, lịch sự hướng người dùng quay lại việc học.';

/**
 * Build the user-facing prompt. When a study context is supplied it is prepended
 * so the model grounds its answer in what the learner is currently working on.
 */
export function buildTutorPrompt(question: string, context?: TutorContext): string {
  const q = question.trim();
  const parts: string[] = [];
  if (context?.topicTitle) {
    parts.push(`Ngữ cảnh: học sinh đang học về "${context.topicTitle}"${
      context.subject ? ` (môn ${context.subject})` : ''
    }.`);
  }
  parts.push(`Câu hỏi: ${q}`);
  return parts.join('\n');
}

/**
 * Split a reply into streamable chunks (~`size` chars) on word boundaries so the
 * FE can render it progressively. Never splits mid-word; preserves all content
 * when joined back. Returns [] for empty input.
 */
export function chunkReply(text: string, size = 24): string[] {
  if (!text) return [];
  const tokens = text.split(/(\s+)/); // keep whitespace tokens so join is lossless
  const chunks: string[] = [];
  let current = '';
  for (const t of tokens) {
    if (current.length > 0 && current.length + t.length > size) {
      chunks.push(current);
      current = '';
    }
    current += t;
  }
  if (current.length > 0) chunks.push(current);
  return chunks;
}
