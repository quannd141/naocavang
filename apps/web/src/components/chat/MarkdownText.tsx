/**
 * Minimal markdown renderer for chat bubbles — handles **bold**, *italic*,
 * `code`, lists (-), and paragraphs. Avoids the weight of react-markdown
 * since chat content is mock & limited.
 */

import type React from 'react';

const BOLD = /\*\*([^*]+)\*\*/g;
const ITALIC = /\*([^*]+)\*/g;
const CODE = /`([^`]+)`/g;

function renderInline(text: string, keyPrefix: string): React.ReactNode {
  const parts: React.ReactNode[] = [];
  let lastIdx = 0;
  let key = 0;
  const matches: { start: number; end: number; node: React.ReactNode }[] = [];

  for (const m of text.matchAll(BOLD)) {
    matches.push({ start: m.index!, end: m.index! + m[0].length, node: <strong key={`${keyPrefix}-b-${key++}`}>{m[1]}</strong> });
  }
  for (const m of text.matchAll(CODE)) {
    matches.push({ start: m.index!, end: m.index! + m[0].length, node: <code key={`${keyPrefix}-c-${key++}`} className="rounded bg-muted px-1 text-xs">{m[1]}</code> });
  }

  matches.sort((a, b) => a.start - b.start);
  // remove overlaps (bold takes priority)
  const filtered: typeof matches = [];
  for (const m of matches) {
    if (!filtered.length || m.start >= filtered[filtered.length - 1]!.end) filtered.push(m);
  }

  for (const m of filtered) {
    if (m.start > lastIdx) {
      const slice = text.slice(lastIdx, m.start).replace(ITALIC, (_, g) => `__I__${g}__I__`);
      parts.push(...renderItalic(slice, `${keyPrefix}-t-${key++}`));
    }
    parts.push(m.node);
    lastIdx = m.end;
  }
  if (lastIdx < text.length) {
    const slice = text.slice(lastIdx);
    parts.push(...renderItalic(slice, `${keyPrefix}-t-${key++}`));
  }
  return parts;
}

function renderItalic(text: string, keyPrefix: string): React.ReactNode[] {
  const out: React.ReactNode[] = [];
  let lastIdx = 0;
  let key = 0;
  for (const m of text.matchAll(ITALIC)) {
    if (m.index! > lastIdx) out.push(text.slice(lastIdx, m.index!));
    out.push(<em key={`${keyPrefix}-i-${key++}`}>{m[1]}</em>);
    lastIdx = m.index! + m[0].length;
  }
  if (lastIdx < text.length) out.push(text.slice(lastIdx));
  return out;
}

export function MarkdownText({ children }: { children: string }) {
  const lines = children.split('\n');
  const blocks: React.ReactNode[] = [];
  let listBuf: string[] = [];

  function flushList() {
    if (!listBuf.length) return;
    const items = listBuf.slice();
    const ulKey = `ul-${blocks.length}`;
    blocks.push(
      <ul key={ulKey} className="list-disc pl-5 space-y-1 my-2">
        {items.map((item, i) => {
          // biome-ignore lint/suspicious/noArrayIndexKey: list items are static per render and may repeat text
          return <li key={i}>{renderInline(item, `${ulKey}-li-${i}`)}</li>;
        })}
      </ul>,
    );
    listBuf = [];
  }

  for (const raw of lines) {
    const line = raw.trimEnd();
    const listMatch = line.match(/^\s*[-*]\s+(.+)$/);
    if (listMatch) {
      listBuf.push(listMatch[1]!);
      continue;
    }
    flushList();
    if (line === '') {
      blocks.push(<div key={`gap-${blocks.length}`} className="h-2" />);
    } else {
      blocks.push(
        <p key={`p-${blocks.length}`} className="leading-relaxed">
          {renderInline(line, `p-${blocks.length}`)}
        </p>,
      );
    }
  }
  flushList();

  return <>{blocks}</>;
}
