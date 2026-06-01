import { describe, expect, it } from 'vitest';
import { buildTutorPrompt, chunkReply } from './tutor-prompt';

describe('buildTutorPrompt', () => {
  it('includes the question, trimmed', () => {
    expect(buildTutorPrompt('  Định lý Pytago là gì?  ')).toBe(
      'Câu hỏi: Định lý Pytago là gì?',
    );
  });

  it('prepends topic context when provided', () => {
    const prompt = buildTutorPrompt('Cho ví dụ?', { topicTitle: 'Hàm số bậc hai', subject: 'math' });
    expect(prompt).toContain('Ngữ cảnh: học sinh đang học về "Hàm số bậc hai" (môn math).');
    expect(prompt).toContain('Câu hỏi: Cho ví dụ?');
    // context comes before the question
    expect(prompt.indexOf('Ngữ cảnh')).toBeLessThan(prompt.indexOf('Câu hỏi'));
  });

  it('omits subject parenthetical when only title is given', () => {
    const prompt = buildTutorPrompt('?', { topicTitle: 'Hệ tuần hoàn' });
    expect(prompt).toContain('về "Hệ tuần hoàn".');
    expect(prompt).not.toContain('(môn');
  });
});

describe('chunkReply', () => {
  it('returns [] for empty text', () => {
    expect(chunkReply('')).toEqual([]);
  });

  it('is lossless — chunks join back to the original', () => {
    const text = 'Định lý Pytago: trong tam giác vuông, bình phương cạnh huyền bằng tổng bình phương hai cạnh góc vuông.';
    expect(chunkReply(text, 20).join('')).toBe(text);
  });

  it('does not split mid-word', () => {
    const chunks = chunkReply('alpha beta gamma delta', 8);
    // reconstructed words are intact (none broken across chunks)
    expect(chunks.join('').split(/\s+/).filter(Boolean)).toEqual([
      'alpha',
      'beta',
      'gamma',
      'delta',
    ]);
  });

  it('produces multiple chunks for long text', () => {
    const text = 'a '.repeat(50).trim();
    expect(chunkReply(text, 10).length).toBeGreaterThan(1);
  });
});
