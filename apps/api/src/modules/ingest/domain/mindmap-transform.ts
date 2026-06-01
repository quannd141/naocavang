/**
 * Transform an AI `mindmap_gen` payload into the canvas/React-Flow `data` shape
 * that {@link mindMapDataSchema} (and the FE editor) expect.
 *
 * The AI/mock produces a *graph* keyed by node id with `text` + `parentId`:
 *   { rootId, nodes: { root: { id, text, parentId, color }, n1: {...} }, edges }
 *
 * The persisted/canvas format is a flat array with explicit positions:
 *   { nodes: [{ id, position: {x,y}, data: { label, color, notes } }], edges: [{id,source,target}] }
 *
 * This module owns that conversion + a deterministic tree layout, so the result
 * is stable (no randomness) and always satisfies the persistence schema bounds
 * (≤500 nodes, ≤1000 edges, id≤100, label≤500, notes≤5000, color≤50).
 */

const LEVEL_X = 260; // horizontal gap between depth levels
const NODE_Y = 120; // vertical gap between siblings on a level
const MAX_NODES = 500;
const MAX_EDGES = 1000;
const MAX_ID = 100;
const MAX_LABEL = 500;
const MAX_NOTES = 5000;
const MAX_COLOR = 50;

export interface CanvasNode {
  id: string;
  position: { x: number; y: number };
  data: { label: string; color?: string; notes?: string };
}

export interface CanvasEdge {
  id: string;
  source: string;
  target: string;
}

export interface CanvasMindmap {
  nodes: CanvasNode[];
  edges: CanvasEdge[];
}

interface NormNode {
  id: string;
  label: string;
  color?: string;
  notes?: string;
  parentId: string | null;
}

/** Parse AI JSON output; throws a typed Error if the content is not valid JSON. */
export function parseAiJson(content: string): unknown {
  try {
    return JSON.parse(content);
  } catch {
    throw new Error('AI output is not valid JSON');
  }
}

function clampId(value: string): string {
  return value.slice(0, MAX_ID);
}

function asString(value: unknown): string | undefined {
  return typeof value === 'string' ? value : undefined;
}

/** Read a label from any of the supported node shapes (text | label | data.label). */
function readLabel(n: Record<string, unknown>): string {
  const data = (n.data ?? {}) as Record<string, unknown>;
  const raw = asString(n.text) ?? asString(n.label) ?? asString(data.label) ?? '';
  return raw.trim().slice(0, MAX_LABEL);
}

function readColor(n: Record<string, unknown>): string | undefined {
  const data = (n.data ?? {}) as Record<string, unknown>;
  const raw = asString(n.color) ?? asString(data.color);
  return raw ? raw.slice(0, MAX_COLOR) : undefined;
}

function readNotes(n: Record<string, unknown>): string | undefined {
  const data = (n.data ?? {}) as Record<string, unknown>;
  const raw = asString(n.notes) ?? asString(data.notes);
  return raw ? raw.slice(0, MAX_NOTES) : undefined;
}

/** Normalise nodes from either a keyed Record or an array into a deduped list. */
function normaliseNodes(nodes: unknown): NormNode[] {
  const entries: Array<[string, Record<string, unknown>]> = [];
  if (Array.isArray(nodes)) {
    for (const n of nodes) {
      if (n && typeof n === 'object' && typeof (n as { id?: unknown }).id === 'string') {
        entries.push([(n as { id: string }).id, n as Record<string, unknown>]);
      }
    }
  } else if (nodes && typeof nodes === 'object') {
    for (const [key, value] of Object.entries(nodes as Record<string, unknown>)) {
      if (value && typeof value === 'object') {
        const obj = value as Record<string, unknown>;
        const id = asString(obj.id) ?? key;
        entries.push([id, obj]);
      }
    }
  }

  const seen = new Set<string>();
  const out: NormNode[] = [];
  for (const [rawId, n] of entries) {
    const id = clampId(rawId);
    if (!id || seen.has(id)) continue;
    seen.add(id);
    const label = readLabel(n);
    const parentRaw = asString(n.parentId);
    out.push({
      id,
      label: label || id,
      color: readColor(n),
      notes: readNotes(n),
      parentId: parentRaw ? clampId(parentRaw) : null,
    });
    if (out.length >= MAX_NODES) break;
  }
  return out;
}

/** Deterministic tree layout: depth → x, sibling index (centred) → y. */
function layout(nodes: NormNode[], rootId?: string): Map<string, { x: number; y: number }> {
  const byId = new Map(nodes.map((n) => [n.id, n]));
  const children = new Map<string, NormNode[]>();
  for (const n of nodes) {
    if (n.parentId && byId.has(n.parentId)) {
      const arr = children.get(n.parentId) ?? [];
      arr.push(n);
      children.set(n.parentId, arr);
    }
  }

  const explicitRoot = rootId ? byId.get(clampId(rootId)) : undefined;
  const root = explicitRoot ?? nodes.find((n) => !n.parentId || !byId.has(n.parentId)) ?? nodes[0];

  const levels: NormNode[][] = [];
  const visited = new Set<string>();
  if (root) {
    let frontier = [root];
    while (frontier.length > 0) {
      levels.push(frontier);
      for (const n of frontier) visited.add(n.id);
      const next: NormNode[] = [];
      for (const n of frontier) {
        for (const c of children.get(n.id) ?? []) {
          if (!visited.has(c.id)) {
            visited.add(c.id);
            next.push(c);
          }
        }
      }
      frontier = next;
    }
  }

  // Nodes unreachable from the root (cycles / dangling parentId) get their own column.
  const orphans = nodes.filter((n) => !visited.has(n.id));
  if (orphans.length > 0) levels.push(orphans);

  const pos = new Map<string, { x: number; y: number }>();
  levels.forEach((level, depth) => {
    level.forEach((n, i) => {
      const y = (i - (level.length - 1) / 2) * NODE_Y;
      pos.set(n.id, { x: depth * LEVEL_X, y });
    });
  });
  return pos;
}

/** Build edges, preferring explicit edges and falling back to parentId links. */
function buildEdges(rawEdges: unknown, nodes: NormNode[]): CanvasEdge[] {
  const ids = new Set(nodes.map((n) => n.id));
  const seen = new Set<string>();
  const out: CanvasEdge[] = [];

  const push = (source: string, target: string, id?: string): void => {
    if (!ids.has(source) || !ids.has(target) || source === target) return;
    const key = `${source}->${target}`;
    if (seen.has(key)) return;
    seen.add(key);
    out.push({ id: clampId(id || `e-${source}-${target}`), source, target });
  };

  if (Array.isArray(rawEdges)) {
    for (const e of rawEdges) {
      if (!e || typeof e !== 'object') continue;
      const edge = e as Record<string, unknown>;
      const source = asString(edge.source);
      const target = asString(edge.target);
      if (source && target) push(clampId(source), clampId(target), asString(edge.id));
    }
  }

  if (out.length === 0) {
    for (const n of nodes) {
      if (n.parentId) push(n.parentId, n.id);
    }
  }

  return out.slice(0, MAX_EDGES);
}

/**
 * Convert a parsed AI mindmap payload into canvas `data`. Defensive against
 * missing/extra fields — always returns a schema-valid structure (possibly with
 * zero nodes if the input had none; the caller guards emptiness).
 */
export function aiMindmapToCanvas(raw: unknown): CanvasMindmap {
  const obj = raw && typeof raw === 'object' ? (raw as Record<string, unknown>) : {};
  const rootId = asString(obj.rootId);
  const nodes = normaliseNodes(obj.nodes);
  const pos = layout(nodes, rootId);
  const canvasNodes: CanvasNode[] = nodes.map((n) => ({
    id: n.id,
    position: pos.get(n.id) ?? { x: 0, y: 0 },
    data: {
      label: n.label,
      ...(n.color ? { color: n.color } : {}),
      ...(n.notes ? { notes: n.notes } : {}),
    },
  }));
  return { nodes: canvasNodes, edges: buildEdges(obj.edges, nodes) };
}
