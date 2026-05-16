'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import type { Edge, Node } from '@xyflow/react';
import { MindMapCanvas } from '@/components/mindmap/MindMapCanvas';
import { ApiError, type MindMapFull, mindmapApi } from '@/lib/api-client';
import { getMockMindMap } from '@/lib/mock/mindmaps';

interface LoadedMindMap {
  id: string;
  title: string;
  emoji: string;
  initialNodes: Node[];
  initialEdges: Edge[];
  /** If true, save() will PATCH to BE; otherwise localStorage only (mock seed). */
  remote: boolean;
}

function toCanvasInputs(data: unknown): { nodes: Node[]; edges: Edge[] } {
  if (!data || typeof data !== 'object') return { nodes: [], edges: [] };
  const d = data as { nodes?: unknown[]; edges?: unknown[] };
  const nodes = (d.nodes ?? []).map((n) => {
    const node = n as { id: string; position?: { x: number; y: number }; data?: Record<string, unknown> };
    return {
      id: node.id,
      type: 'concept',
      position: node.position ?? { x: 0, y: 0 },
      data: {
        label: (node.data?.label as string) ?? 'Node',
        color: node.data?.color as string | undefined,
        notes: node.data?.notes as string | undefined,
      },
    } satisfies Node;
  });
  const edges = (d.edges ?? []).map((e) => {
    const edge = e as { id?: string; source: string; target: string };
    return {
      id: edge.id ?? `e-${edge.source}-${edge.target}`,
      source: edge.source,
      target: edge.target,
      type: 'default',
      style: { strokeWidth: 2, stroke: '#94a3b8' },
    } satisfies Edge;
  });
  return { nodes, edges };
}

export default function MindMapEditor() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [state, setState] = useState<LoadedMindMap | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      // 1. Try real BE first
      try {
        const remote: MindMapFull = await mindmapApi.get(params.id);
        const { nodes, edges } = toCanvasInputs(remote.data);
        setState({
          id: remote.id,
          title: remote.title,
          emoji: '🗺️',
          initialNodes: nodes,
          initialEdges: edges,
          remote: true,
        });
        return;
      } catch (err) {
        if (err instanceof ApiError && (err.status === 404 || err.status === 403)) {
          // not found / forbidden in real DB — fall through to mock
        } else if (err instanceof ApiError && err.status === 0) {
          // BE offline — fall through
        } else if (err instanceof ApiError && err.status === 401) {
          router.push('/login');
          return;
        } else {
          setError((err as Error).message);
        }
      }

      // 2. Fallback to mock seed (so template IDs like mm-toan10 still open)
      const mm = getMockMindMap(params.id);
      if (!mm) {
        router.push('/mindmaps');
        return;
      }
      const nodes: Node[] = mm.nodes.map((n) => ({
        id: n.id,
        type: 'concept',
        position: n.position,
        data: { label: n.data.label, color: n.data.color, notes: n.data.notes },
      }));
      const edges: Edge[] = mm.edges.map((e) => ({
        id: e.id,
        source: e.source,
        target: e.target,
        type: 'default',
        style: { strokeWidth: 2, stroke: '#94a3b8' },
      }));
      setState({
        id: mm.id,
        title: mm.title,
        emoji: mm.emoji,
        initialNodes: nodes,
        initialEdges: edges,
        remote: false,
      });
    }
    load();
  }, [params.id, router]);

  if (error) {
    return <div className="p-8 text-red-700">⚠️ {error}</div>;
  }
  if (!state) {
    return (
      <div className="flex h-screen items-center justify-center text-muted-foreground">
        Đang tải mind map...
      </div>
    );
  }

  async function handleSave(nodes: Node[], edges: Edge[]) {
    if (!state) return;
    if (state.remote) {
      try {
        await mindmapApi.update(state.id, {
          data: {
            nodes: nodes.map((n) => ({ id: n.id, position: n.position, data: n.data })),
            edges: edges.map((e) => ({ id: e.id, source: e.source, target: e.target })),
          },
        });
      } catch (err) {
        if (typeof window !== 'undefined') {
          window.localStorage.setItem(
            `nao-ca-vang:mindmap:${state.id}:fallback`,
            JSON.stringify({ nodes, edges, error: (err as Error).message }),
          );
        }
      }
    } else if (typeof window !== 'undefined') {
      window.localStorage.setItem(
        `nao-ca-vang:mindmap:${state.id}`,
        JSON.stringify({ nodes, edges, savedAt: new Date().toISOString() }),
      );
    }
  }

  return (
    <MindMapCanvas
      title={`${state.emoji} ${state.title}${state.remote ? '' : ' (mock)'}`}
      initialNodes={state.initialNodes}
      initialEdges={state.initialEdges}
      onSave={handleSave}
    />
  );
}
