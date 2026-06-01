/**
 * Build the AI prompts used by the PDF-ingest flow. Kept pure + bounded so a
 * very long document can't blow up the token budget — the source text is capped
 * before being embedded in the instruction.
 */

/** Upper bound on how much extracted text we feed the model in one request. */
export const MAX_PROMPT_CHARS = 12000;

/** Trim source text to a safe length, preserving a whole-character cut. */
export function truncateForPrompt(text: string, max = MAX_PROMPT_CHARS): string {
  const trimmed = text.trim();
  return trimmed.length <= max ? trimmed : trimmed.slice(0, max);
}

export function buildMindmapPrompt(text: string): string {
  return [
    'Bạn là trợ lý học tập. Dựa trên nội dung tài liệu dưới đây, hãy tạo một mind map',
    'tiếng Việt có cấu trúc cây: một node gốc là chủ đề chính và các nhánh con là ý chính.',
    'Trả về JSON đúng định dạng mindmap_gen.',
    '',
    '--- NỘI DUNG TÀI LIỆU ---',
    truncateForPrompt(text),
  ].join('\n');
}

export function buildFlashcardPrompt(text: string): string {
  return [
    'Bạn là trợ lý học tập. Dựa trên nội dung tài liệu dưới đây, hãy tạo các thẻ ghi nhớ',
    '(flashcard) dạng hỏi - đáp ngắn gọn bằng tiếng Việt, tập trung vào khái niệm quan trọng.',
    'Trả về JSON đúng định dạng flashcard_gen.',
    '',
    '--- NỘI DUNG TÀI LIỆU ---',
    truncateForPrompt(text),
  ].join('\n');
}
