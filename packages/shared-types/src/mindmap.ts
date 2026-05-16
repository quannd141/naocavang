/**
 * Mind map domain types — shared between FE editor and BE API.
 *
 * Lives in JSONB column (see ADR-002). Versioned via `version` field
 * so future schema changes can be migrated in app layer.
 */

export const MINDMAP_DATA_VERSION = 1 as const;

export type NodeColor =
  | 'gray'
  | 'red'
  | 'orange'
  | 'yellow'
  | 'green'
  | 'teal'
  | 'blue'
  | 'indigo'
  | 'purple'
  | 'pink';

export interface MindmapNode {
  id: string;
  text: string; // max 200 chars
  color: NodeColor;
  icon: string | null;
  imageUrl: string | null;
  parentId: string | null; // null = root
  position: number; // order among siblings
}

export interface MindmapEdge {
  id: string;
  source: string; // node id
  target: string; // node id
}

export interface MindmapViewport {
  x: number;
  y: number;
  zoom: number;
}

/**
 * Full mind map data structure — stored as JSONB.
 *
 * Keyed map for fast node lookup. Edges derived but kept for React Flow.
 */
export interface MindmapData {
  version: typeof MINDMAP_DATA_VERSION;
  rootId: string;
  nodes: Record<string, MindmapNode>;
  edges: MindmapEdge[];
  viewport: MindmapViewport;
}

export type MindmapSubject =
  | 'math'
  | 'physics'
  | 'chemistry'
  | 'biology'
  | 'history'
  | 'geography'
  | 'literature'
  | 'english'
  | 'civics'
  | 'informatics'
  | 'ielts'
  | 'toeic'
  | 'other';

export type MindmapSourceType = 'manual' | 'pdf' | 'text' | 'template';

export interface MindmapSummary {
  id: string;
  userId: string;
  title: string;
  description: string | null;
  subject: MindmapSubject | null;
  tags: string[];
  isPublic: boolean;
  sourceType: MindmapSourceType;
  nodeCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateMindmapDto {
  title: string;
  description?: string;
  subject?: MindmapSubject;
  tags?: string[];
  sourceTemplateId?: string;
}

export interface UpdateMindmapDto {
  title?: string;
  description?: string;
  data?: MindmapData;
  subject?: MindmapSubject;
  tags?: string[];
  isPublic?: boolean;
}
