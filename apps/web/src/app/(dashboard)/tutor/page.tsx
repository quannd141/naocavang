'use client';

import { Send } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MarkdownText } from '@/components/chat/MarkdownText';
import { SUGGESTED_PROMPTS, streamMockResponse, streamText } from '@/lib/mock/chat';
import { ApiError, tutorApi } from '@/lib/api-client';
import { cn } from '@/lib/utils';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  streaming?: boolean;
}

export default function TutorPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: 'Xin chào! Mình là **Cá Vàng GPT** 🐠 — AI gia sư hiểu chương trình học Việt Nam. Hỏi mình bất cứ gì về bài tập, khái niệm, hay cách học.',
    },
  ]);
  const [input, setInput] = useState('');
  const [streaming, setStreaming] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages]);

  async function send(prompt: string) {
    if (!prompt.trim() || streaming) return;
    const userMsg: Message = { id: `u-${Date.now()}`, role: 'user', content: prompt };
    const assistantId = `a-${Date.now()}`;
    setMessages((m) => [...m, userMsg, { id: assistantId, role: 'assistant', content: '', streaming: true }]);
    setInput('');
    setStreaming(true);

    const appendToken = (token: string) =>
      setMessages((m) =>
        m.map((msg) =>
          msg.id === assistantId ? { ...msg, content: msg.content + token } : msg,
        ),
      );

    try {
      // Ask the real BE, then type the answer out for a streaming feel.
      // (True server-push streaming is deferred — EventSource can't send the
      // Bearer header this app uses.)
      const { answer } = await tutorApi.ask(prompt);
      await streamText(answer, appendToken);
    } catch (err) {
      if (err instanceof ApiError && err.status === 0) {
        // BE unreachable — fall back to the local mock so the demo still works.
        await streamMockResponse(prompt, appendToken);
      } else {
        const msg = err instanceof ApiError ? err.message : (err as Error).message;
        appendToken(`⚠️ ${msg}`);
      }
    } finally {
      setMessages((m) =>
        m.map((msg) => (msg.id === assistantId ? { ...msg, streaming: false } : msg)),
      );
      setStreaming(false);
    }
  }

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)]">
      <div className="border-b border-border bg-card px-4 lg:px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center text-xl">
            🐠
          </div>
          <div>
            <h1 className="font-semibold">Cá Vàng GPT</h1>
            <div className="text-xs text-muted-foreground flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
              <span>Online — sẵn sàng giúp bạn</span>
            </div>
          </div>
        </div>
        <Badge variant="outline">Beta</Badge>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 lg:p-6 space-y-4 bg-muted/20">
        {messages.map((msg) => (
          <ChatBubble key={msg.id} message={msg} />
        ))}

        {messages.length <= 1 && (
          <div className="mt-8">
            <p className="text-sm font-medium text-muted-foreground mb-3">💡 Thử các câu hỏi mẫu:</p>
            <div className="grid sm:grid-cols-2 gap-2 max-w-2xl">
              {SUGGESTED_PROMPTS.map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => send(p)}
                  className="text-left rounded-lg border border-border bg-card p-3 text-sm hover:border-brand-400 hover:bg-brand-50 transition-all"
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="border-t border-border bg-card p-4">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            send(input);
          }}
          className="flex gap-2 max-w-3xl mx-auto"
        >
          <Input
            type="text"
            placeholder="Hỏi Cá Vàng GPT điều gì đó..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={streaming}
            className="flex-1"
          />
          <Button type="submit" disabled={streaming || !input.trim()} size="lg">
            <Send className="h-4 w-4" />
            <span className="hidden sm:inline">Gửi</span>
          </Button>
        </form>
      </div>
    </div>
  );
}

function ChatBubble({ message }: { message: Message }) {
  const isUser = message.role === 'user';
  return (
    <div className={cn('flex gap-3 max-w-3xl', isUser ? 'ml-auto flex-row-reverse' : 'mr-auto')}>
      <div
        className={cn(
          'h-9 w-9 rounded-full flex items-center justify-center shrink-0 text-lg',
          isUser ? 'bg-brand-200' : 'bg-gradient-to-br from-brand-400 to-brand-600',
        )}
      >
        {isUser ? '🧑' : '🐠'}
      </div>
      <Card className={cn('max-w-[calc(100%-3rem)]', isUser ? 'bg-brand-50' : '')}>
        <CardContent className="p-3 text-sm break-words">
          {message.content ? (
            <MarkdownText>{message.content}</MarkdownText>
          ) : (
            <span className="text-muted-foreground italic">đang gõ...</span>
          )}
          {message.streaming && <span className="inline-block ml-1 w-2 h-4 bg-brand-600 animate-pulse align-middle" />}
        </CardContent>
      </Card>
    </div>
  );
}
