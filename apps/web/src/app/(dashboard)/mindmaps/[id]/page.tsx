'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import type { Edge, Node } from '@xyflow/react';
import { MindMapCanvas } from '@/components/mindmap/MindMapCanvas';
import { getMockMindMap } from '@/lib/mock/mindmaps';

export default function MindMapEditor() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [mindmap, setMindmap] = useState<ReturnType<typeof getMockMindMap>>();
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const mm = getMockMindMap(params.id);
    if (!mm) {
      router.push('/mindmaps');
      return;
    }
    setMindmap(mm);
    setLoaded(true);
  }, [params.id, router]);

  if (!loaded || !mindmap) {
    return (
      <div className="flex h-screen items-center justify-center text-muted-foreground">
        Đang tải mind map...
      </div>
    );
  }

  const initialNodes: Node[] = mindmap.nodes.map((n) => ({
    id: n.id,
    type: 'concept',
    position: n.position,
    data: { label: n.data.label, color: n.data.color, notes: n.data.notes },
  }));
  const initialEdges: Edge[] = mindmap.edges.map((e) => ({
    id: e.id,
    source: e.source,
    target: e.target,
    type: 'default',
    style: { strokeWidth: 2, stroke: '#94a3b8' },
  }));

  function handleSave(nodes: Node[], edges: Edge[]) {
    if (typeof window === 'undefined') return;
    const key = `nao-ca-vang:mindmap:${mindmap!.id}`;
    window.localStorage.setItem(key, JSON.stringify({ nodes, edges, savedAt: new Date().toISOString() }));
  }

  return (
    <MindMapCanvas
      title={`${mindmap.emoji} ${mindmap.title}`}
      initialNodes={initialNodes}
      initialEdges={initialEdges}
      onSave={handleSave}
    />
  );
}
