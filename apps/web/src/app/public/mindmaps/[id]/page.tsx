'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import type { Edge, Node } from '@xyflow/react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MindMapCanvas } from '@/components/mindmap/MindMapCanvas';
import { ApiError, type PublicMindMap, mindmapApi } from '@/lib/api-client';

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

export default function PublicMindMapView() {
  const params = useParams<{ id: string }>();
  const [mm, setMm] = useState<PublicMindMap | null>(null);
  const [status, setStatus] = useState<'loading' | 'ok' | 'notfound' | 'error'>('loading');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    mindmapApi
      .getPublic(params.id)
      .then((data) => {
        setMm(data);
        setStatus('ok');
      })
      .catch((err: unknown) => {
        if (err instanceof ApiError && err.status === 404) {
          setStatus('notfound');
          return;
        }
        setError(err instanceof ApiError ? err.message : (err as Error).message);
        setStatus('error');
      });
  }, [params.id]);

  if (status === 'loading') {
    return (
      <div className="flex h-screen items-center justify-center text-muted-foreground">
        Đang tải mind map...
      </div>
    );
  }

  if (status === 'notfound') {
    return (
      <div className="container mx-auto px-4 py-16 max-w-md text-center">
        <div className="text-5xl mb-3">🔒</div>
        <h1 className="text-2xl font-bold">Mind map này không công khai</h1>
        <p className="mt-2 text-muted-foreground">
          Có thể tác giả đã tắt chia sẻ hoặc link không tồn tại.
        </p>
        <Button asChild className="mt-6">
          <Link href="/">← Về trang chủ</Link>
        </Button>
      </div>
    );
  }

  if (status === 'error' || !mm) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-md">
        <Card className="border-red-300 bg-red-50">
          <CardContent className="p-4 text-sm text-red-700">⚠️ {error}</CardContent>
        </Card>
      </div>
    );
  }

  const { nodes, edges } = toCanvasInputs(mm.data);

  return (
    <div className="relative h-screen">
      <div className="absolute top-3 left-3 right-3 z-10 flex items-center justify-between gap-3 bg-white/95 backdrop-blur border border-border rounded-md shadow-sm p-3 text-sm">
        <div className="min-w-0 flex-1">
          <div className="font-semibold truncate">🌍 {mm.title}</div>
          <div className="text-xs text-muted-foreground truncate">
            Chia sẻ bởi <strong>{mm.authorName}</strong>
            {mm.subject && (
              <>
                {' • '}
                <Badge variant="outline" className="ml-1">
                  {mm.subject}
                </Badge>
              </>
            )}
          </div>
        </div>
        <div className="hidden sm:block text-xs text-muted-foreground shrink-0">
          Chế độ xem (read-only)
        </div>
        <Button asChild size="sm">
          <Link href="/register">Tạo mind map của bạn →</Link>
        </Button>
      </div>
      <MindMapCanvas
        title={`🌍 ${mm.title}`}
        initialNodes={nodes}
        initialEdges={edges}
        readOnly
      />
    </div>
  );
}
