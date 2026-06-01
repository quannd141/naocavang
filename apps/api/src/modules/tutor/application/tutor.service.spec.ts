import { describe, expect, it, vi } from 'vitest';
import { TutorService } from './tutor.service';

type AnyFn = (...args: unknown[]) => unknown;
type Mock = ReturnType<typeof vi.fn<AnyFn>>;

function makeService() {
  const ai = { chat: vi.fn() as Mock };
  const service = new TutorService(ai as unknown as never);
  return { service, ai };
}

describe('TutorService.ask', () => {
  it('builds a prompt + system prompt, routes to ai.chat, returns answer + model', async () => {
    const { service, ai } = makeService();
    ai.chat.mockResolvedValue({ content: 'Trả lời mẫu', model: 'mock' });

    const result = await service.ask('user-1', 'Định lý Pytago?');

    expect(result).toEqual({ answer: 'Trả lời mẫu', model: 'mock' });
    expect(ai.chat).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: 'user-1',
        prompt: 'Câu hỏi: Định lý Pytago?',
        systemPrompt: expect.stringContaining('Cá Vàng GPT'),
      }),
    );
  });

  it('passes mind-map context into the prompt', async () => {
    const { service, ai } = makeService();
    ai.chat.mockResolvedValue({ content: 'x', model: 'mock' });

    await service.ask('u', 'Cho ví dụ?', { topicTitle: 'Hàm số', subject: 'math' });

    const call = ai.chat.mock.calls[0][0] as { prompt: string };
    expect(call.prompt).toContain('Hàm số');
    expect(call.prompt).toContain('Câu hỏi: Cho ví dụ?');
  });

  it('propagates quota errors from the router', async () => {
    const { service, ai } = makeService();
    ai.chat.mockRejectedValue(new Error('AI_QUOTA_EXCEEDED'));
    await expect(service.ask('u', 'hi')).rejects.toThrow('AI_QUOTA_EXCEEDED');
  });
});
