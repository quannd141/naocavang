'use client';

import { Handle, Position, type NodeProps } from '@xyflow/react';
import { memo } from 'react';
import { cn } from '@/lib/utils';

export interface ConceptNodeData {
  label: string;
  color?: string;
  notes?: string;
}

function ConceptNodeComponent({ data, selected }: NodeProps) {
  const color = (data as ConceptNodeData).color ?? '#FFD700';
  const label = (data as ConceptNodeData).label ?? '';
  const notes = (data as ConceptNodeData).notes;
  return (
    <div
      className={cn(
        'rounded-xl border-2 px-4 py-3 shadow-md min-w-[140px] max-w-[240px] bg-white transition-all',
        selected ? 'border-brand-500 shadow-xl scale-105' : 'border-transparent',
      )}
      style={{ background: color }}
    >
      <Handle type="target" position={Position.Top} className="!bg-gray-600" />
      <div className="font-semibold text-sm text-gray-900 break-words">{label}</div>
      {notes && (
        <div className="mt-1 text-xs text-gray-700/80 line-clamp-3">{notes}</div>
      )}
      <Handle type="source" position={Position.Bottom} className="!bg-gray-600" />
    </div>
  );
}

export const ConceptNode = memo(ConceptNodeComponent);
