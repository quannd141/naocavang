import { z } from 'zod';

/**
 * Zod schema for mind map `data` JSONB payload.
 *
 * Goal: catch malformed structures (AI-generated, hand-crafted JSON, copy-paste
 * mistakes) before they reach the DB. The DB column is `Json`, so without this
 * validation any object would persist and break the canvas on load.
 *
 * Kept intentionally permissive on `data` extras — React Flow nodes carry many
 * UI-only fields we don't want to enumerate.
 */
export const mindMapNodeSchema = z
  .object({
    id: z.string().min(1).max(100),
    position: z
      .object({
        x: z.number().finite(),
        y: z.number().finite(),
      })
      .optional(),
    data: z
      .object({
        label: z.string().max(500).optional(),
        color: z.string().max(50).optional(),
        notes: z.string().max(5000).optional(),
      })
      .passthrough()
      .optional(),
  })
  .passthrough();

export const mindMapEdgeSchema = z
  .object({
    id: z.string().min(1).max(100).optional(),
    source: z.string().min(1).max(100),
    target: z.string().min(1).max(100),
  })
  .passthrough();

export const mindMapDataSchema = z
  .object({
    nodes: z.array(mindMapNodeSchema).max(500),
    edges: z.array(mindMapEdgeSchema).max(1000).optional().default([]),
  })
  .passthrough();

export type MindMapData = z.infer<typeof mindMapDataSchema>;
