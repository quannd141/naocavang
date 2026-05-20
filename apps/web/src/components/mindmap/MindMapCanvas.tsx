'use client';

import '@xyflow/react/dist/style.css';

import {
  Background,
  BackgroundVariant,
  Controls,
  type Edge,
  MiniMap,
  type Node,
  ReactFlow,
  addEdge,
  type Connection,
  useEdgesState,
  useNodesState,
} from '@xyflow/react';
import { Palette, Plus, Save, Trash2 } from 'lucide-react';
import { useCallback, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { ConceptNode } from './ConceptNode';
import { NODE_COLORS } from '@/lib/mock/mindmaps';

const COLOR_PALETTE = [NODE_COLORS.root, NODE_COLORS.branch, NODE_COLORS.leaf, NODE_COLORS.warn, '#C4B5FD', '#FBA74D'];

interface Props {
  initialNodes: Node[];
  initialEdges: Edge[];
  title: string;
  onSave?: (nodes: Node[], edges: Edge[]) => void;
  readOnly?: boolean;
}

export function MindMapCanvas({ initialNodes, initialEdges, title, onSave, readOnly = false }: Props) {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [savedAt, setSavedAt] = useState<Date | null>(null);

  const nodeTypes = useMemo(() => ({ concept: ConceptNode }), []);

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge({ ...params, animated: false }, eds)),
    [setEdges],
  );

  const onSelectionChange = useCallback(
    ({ nodes: selected }: { nodes: Node[] }) => {
      setSelectedNodeId(selected[0]?.id ?? null);
    },
    [],
  );

  function addNode() {
    const id = `n-${Date.now()}`;
    const newNode: Node = {
      id,
      type: 'concept',
      position: { x: 400 + Math.random() * 200, y: 300 + Math.random() * 100 },
      data: { label: 'Ý mới', color: NODE_COLORS.leaf },
    };
    setNodes((nds) => [...nds, newNode]);
  }

  function deleteSelected() {
    if (!selectedNodeId) return;
    setNodes((nds) => nds.filter((n) => n.id !== selectedNodeId));
    setEdges((eds) => eds.filter((e) => e.source !== selectedNodeId && e.target !== selectedNodeId));
    setSelectedNodeId(null);
  }

  function changeColor(color: string) {
    if (!selectedNodeId) return;
    setNodes((nds) =>
      nds.map((n) =>
        n.id === selectedNodeId ? { ...n, data: { ...n.data, color } } : n,
      ),
    );
  }

  function handleSave() {
    onSave?.(nodes, edges);
    setSavedAt(new Date());
  }

  const styledNodes = useMemo(
    () => nodes.map((n) => ({ ...n, type: 'concept' })),
    [nodes],
  );

  return (
    <div className={`flex flex-col ${readOnly ? 'h-full' : 'h-[calc(100vh-4rem)]'}`}>
      {!readOnly && (
        <div className="flex items-center justify-between border-b border-border bg-card px-4 py-3 flex-wrap gap-2">
          <div>
            <h1 className="text-lg font-semibold">{title}</h1>
            <p className="text-xs text-muted-foreground">
              {nodes.length} nodes • {edges.length} kết nối
              {savedAt && ` • Đã lưu ${savedAt.toLocaleTimeString('vi-VN')}`}
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <Button variant="outline" size="sm" onClick={addNode}>
              <Plus className="h-4 w-4" /> Thêm node
            </Button>
            <Button variant="outline" size="sm" onClick={deleteSelected} disabled={!selectedNodeId}>
              <Trash2 className="h-4 w-4" /> Xoá
            </Button>

            <div className="flex items-center gap-1 border border-border rounded-md px-2 py-1">
              <Palette className="h-4 w-4 text-muted-foreground" />
              {COLOR_PALETTE.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => changeColor(c)}
                  disabled={!selectedNodeId}
                  className="h-5 w-5 rounded-full border border-gray-300 hover:scale-110 transition-transform disabled:opacity-30 disabled:cursor-not-allowed"
                  style={{ background: c }}
                  title={c}
                />
              ))}
            </div>

            <Button size="sm" onClick={handleSave}>
              <Save className="h-4 w-4" /> Lưu
            </Button>
          </div>
        </div>
      )}

      <div className="flex-1 bg-muted/20">
        <ReactFlow
          nodes={styledNodes}
          edges={edges}
          onNodesChange={readOnly ? undefined : onNodesChange}
          onEdgesChange={readOnly ? undefined : onEdgesChange}
          onConnect={readOnly ? undefined : onConnect}
          onSelectionChange={readOnly ? undefined : onSelectionChange}
          nodeTypes={nodeTypes}
          fitView
          fitViewOptions={{ padding: 0.2 }}
          nodesDraggable={!readOnly}
          nodesConnectable={!readOnly}
          elementsSelectable={!readOnly}
        >
          <Background variant={BackgroundVariant.Dots} gap={20} size={1} />
          <Controls />
          <MiniMap pannable zoomable nodeColor={(n) => (n.data as { color?: string }).color ?? '#FFD700'} />
        </ReactFlow>
      </div>
    </div>
  );
}
