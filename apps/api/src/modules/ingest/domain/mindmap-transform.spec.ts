import { describe, expect, it } from 'vitest';
import { mindMapDataSchema } from '../../mindmap/domain/mindmap-data.schema';
import { aiMindmapToCanvas, parseAiJson } from './mindmap-transform';

/** Mirrors the MockAiAdapter mindmap_gen output shape (keyed Record + parentId). */
const AI_MINDMAP = {
  version: 1,
  rootId: 'root',
  title: 'Demo',
  nodes: {
    root: { id: 'root', text: 'Chủ đề chính', color: 'blue', parentId: null, position: 0 },
    n1: { id: 'n1', text: 'Nhánh 1', color: 'green', parentId: 'root', position: 0 },
    n2: { id: 'n2', text: 'Nhánh 2', color: 'green', parentId: 'root', position: 1 },
  },
  edges: [
    { id: 'e1', source: 'root', target: 'n1' },
    { id: 'e2', source: 'root', target: 'n2' },
  ],
  viewport: { x: 0, y: 0, zoom: 1 },
};

describe('parseAiJson', () => {
  it('parses valid JSON', () => {
    expect(parseAiJson('{"a":1}')).toEqual({ a: 1 });
  });

  it('throws on invalid JSON', () => {
    expect(() => parseAiJson('{not json')).toThrow();
  });
});

describe('aiMindmapToCanvas', () => {
  it('converts keyed-Record nodes into a flat array with positions', () => {
    const out = aiMindmapToCanvas(AI_MINDMAP);
    expect(out.nodes).toHaveLength(3);
    const root = out.nodes.find((n) => n.id === 'root');
    expect(root?.data.label).toBe('Chủ đề chính');
    expect(root?.data.color).toBe('blue');
    expect(root?.position).toEqual({ x: 0, y: 0 });
  });

  it('places children one level to the right of the root', () => {
    const out = aiMindmapToCanvas(AI_MINDMAP);
    const n1 = out.nodes.find((n) => n.id === 'n1');
    expect(n1?.position.x).toBeGreaterThan(0);
  });

  it('preserves explicit edges', () => {
    const out = aiMindmapToCanvas(AI_MINDMAP);
    expect(out.edges).toHaveLength(2);
    expect(out.edges.map((e) => e.target).sort()).toEqual(['n1', 'n2']);
  });

  it('produces output that satisfies mindMapDataSchema', () => {
    const out = aiMindmapToCanvas(AI_MINDMAP);
    expect(() => mindMapDataSchema.parse(out)).not.toThrow();
  });

  it('accepts an array of nodes and derives edges from parentId when none given', () => {
    const out = aiMindmapToCanvas({
      nodes: [
        { id: 'a', label: 'A', parentId: null },
        { id: 'b', label: 'B', parentId: 'a' },
      ],
    });
    expect(out.nodes).toHaveLength(2);
    expect(out.edges).toEqual([expect.objectContaining({ source: 'a', target: 'b' })]);
  });

  it('falls back to the node id when a label is missing', () => {
    const out = aiMindmapToCanvas({ nodes: { x: { id: 'x' } } });
    expect(out.nodes[0]?.data.label).toBe('x');
  });

  it('dedupes repeated node ids and ignores self / dangling edges', () => {
    const out = aiMindmapToCanvas({
      nodes: [
        { id: 'a', label: 'A' },
        { id: 'a', label: 'dup' },
      ],
      edges: [
        { source: 'a', target: 'a' }, // self-loop dropped
        { source: 'a', target: 'ghost' }, // dangling dropped
      ],
    });
    expect(out.nodes).toHaveLength(1);
    expect(out.edges).toHaveLength(0);
  });

  it('returns empty structure for junk input without throwing', () => {
    expect(aiMindmapToCanvas(null)).toEqual({ nodes: [], edges: [] });
    expect(aiMindmapToCanvas('nope')).toEqual({ nodes: [], edges: [] });
  });

  it('truncates over-long labels to satisfy the schema bound', () => {
    const out = aiMindmapToCanvas({ nodes: { a: { id: 'a', text: 'x'.repeat(1000) } } });
    expect(out.nodes[0]?.data.label.length).toBe(500);
    expect(() => mindMapDataSchema.parse(out)).not.toThrow();
  });
});
