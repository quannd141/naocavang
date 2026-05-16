/**
 * Mock mind map data — 3 templates ready for the editor.
 * Schema aligned with packages/shared-types/src/mindmap.ts
 */

export interface MindMapNode {
  id: string;
  position: { x: number; y: number };
  data: { label: string; color?: string; notes?: string };
}

export interface MindMapEdge {
  id: string;
  source: string;
  target: string;
}

export interface MindMap {
  id: string;
  title: string;
  subject: string;
  description: string;
  emoji: string;
  nodes: MindMapNode[];
  edges: MindMapEdge[];
  updatedAt: string;
}

const COLORS = {
  root: '#FFD700',
  branch: '#60A5FA',
  leaf: '#86EFAC',
  warn: '#FCA5A5',
} as const;

export const MOCK_MINDMAPS: MindMap[] = [
  {
    id: 'mm-toan10',
    title: 'Toán Lớp 10 — Hàm số bậc 2',
    subject: 'Toán',
    description: 'Lý thuyết hàm số bậc 2: dạng, đồ thị, đỉnh, trục đối xứng, ứng dụng',
    emoji: '🔢',
    updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    nodes: [
      { id: '1', position: { x: 400, y: 50 }, data: { label: 'Hàm số bậc 2', color: COLORS.root, notes: 'y = ax² + bx + c, a ≠ 0' } },
      { id: '2', position: { x: 150, y: 200 }, data: { label: 'Dạng tổng quát', color: COLORS.branch, notes: 'y = ax² + bx + c' } },
      { id: '3', position: { x: 400, y: 200 }, data: { label: 'Đồ thị Parabol', color: COLORS.branch } },
      { id: '4', position: { x: 650, y: 200 }, data: { label: 'Ứng dụng', color: COLORS.branch } },
      { id: '5', position: { x: 50, y: 360 }, data: { label: 'Dạng đỉnh', color: COLORS.leaf, notes: 'y = a(x - h)² + k' } },
      { id: '6', position: { x: 230, y: 360 }, data: { label: 'Phân tích thành nhân tử', color: COLORS.leaf, notes: 'y = a(x - x₁)(x - x₂)' } },
      { id: '7', position: { x: 350, y: 360 }, data: { label: 'Đỉnh I(-b/2a; -Δ/4a)', color: COLORS.leaf } },
      { id: '8', position: { x: 550, y: 360 }, data: { label: 'Trục đối xứng x = -b/2a', color: COLORS.leaf } },
      { id: '9', position: { x: 720, y: 360 }, data: { label: 'Bài toán cực trị', color: COLORS.warn, notes: 'Tìm max/min của diện tích, thời gian rơi...' } },
    ],
    edges: [
      { id: 'e1-2', source: '1', target: '2' },
      { id: 'e1-3', source: '1', target: '3' },
      { id: 'e1-4', source: '1', target: '4' },
      { id: 'e2-5', source: '2', target: '5' },
      { id: 'e2-6', source: '2', target: '6' },
      { id: 'e3-7', source: '3', target: '7' },
      { id: 'e3-8', source: '3', target: '8' },
      { id: 'e4-9', source: '4', target: '9' },
    ],
  },
  {
    id: 'mm-ielts',
    title: 'IELTS Speaking Part 2 — Templates',
    subject: 'IELTS',
    description: '5 nhóm chủ đề Part 2 với template chung và linking phrases',
    emoji: '🎤',
    updatedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    nodes: [
      { id: '1', position: { x: 400, y: 50 }, data: { label: 'Part 2 — Long turn 2 phút', color: COLORS.root, notes: 'Cue card → 1 phút prep → 1-2 phút nói' } },
      { id: '2', position: { x: 100, y: 180 }, data: { label: 'Describe a person', color: COLORS.branch } },
      { id: '3', position: { x: 280, y: 180 }, data: { label: 'Describe a place', color: COLORS.branch } },
      { id: '4', position: { x: 460, y: 180 }, data: { label: 'Describe an experience', color: COLORS.branch } },
      { id: '5', position: { x: 640, y: 180 }, data: { label: 'Describe an object', color: COLORS.branch } },
      { id: '6', position: { x: 820, y: 180 }, data: { label: 'Describe an event', color: COLORS.branch } },
      { id: '7', position: { x: 100, y: 340 }, data: { label: 'Linking phrases', color: COLORS.leaf, notes: 'To begin with / What strikes me most / I would say' } },
      { id: '8', position: { x: 300, y: 340 }, data: { label: 'Idioms band 7+', color: COLORS.leaf, notes: 'Off the top of my head / Bear in mind' } },
      { id: '9', position: { x: 500, y: 340 }, data: { label: 'Tense mix', color: COLORS.leaf, notes: 'Past + Present perfect + Past perfect' } },
      { id: '10', position: { x: 700, y: 340 }, data: { label: 'Cohesive markers', color: COLORS.leaf, notes: 'Furthermore / On top of that / Speaking of which' } },
      { id: '11', position: { x: 400, y: 500 }, data: { label: 'Câu mở bài chung', color: COLORS.warn, notes: 'I\'d like to talk about... that I find quite memorable because...' } },
      { id: '12', position: { x: 600, y: 500 }, data: { label: 'Câu kết thúc', color: COLORS.warn, notes: 'All in all, ... has had a profound impact on my life' } },
    ],
    edges: [
      { id: 'e1-2', source: '1', target: '2' },
      { id: 'e1-3', source: '1', target: '3' },
      { id: 'e1-4', source: '1', target: '4' },
      { id: 'e1-5', source: '1', target: '5' },
      { id: 'e1-6', source: '1', target: '6' },
      { id: 'e1-7', source: '1', target: '7' },
      { id: 'e1-8', source: '1', target: '8' },
      { id: 'e1-9', source: '1', target: '9' },
      { id: 'e1-10', source: '1', target: '10' },
      { id: 'e7-11', source: '7', target: '11' },
      { id: 'e10-12', source: '10', target: '12' },
    ],
  },
  {
    id: 'mm-su',
    title: 'Lịch sử VN — Cách mạng tháng 8',
    subject: 'Sử',
    description: 'Bối cảnh, diễn biến, kết quả, ý nghĩa Cách mạng tháng 8 năm 1945',
    emoji: '📜',
    updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    nodes: [
      { id: '1', position: { x: 450, y: 50 }, data: { label: 'CM tháng 8 / 1945', color: COLORS.root } },
      { id: '2', position: { x: 150, y: 180 }, data: { label: 'Bối cảnh', color: COLORS.branch } },
      { id: '3', position: { x: 450, y: 180 }, data: { label: 'Diễn biến', color: COLORS.branch } },
      { id: '4', position: { x: 750, y: 180 }, data: { label: 'Ý nghĩa', color: COLORS.branch } },
      { id: '5', position: { x: 50, y: 320 }, data: { label: 'Nhật đầu hàng Đồng minh', color: COLORS.leaf, notes: '15/8/1945' } },
      { id: '6', position: { x: 250, y: 320 }, data: { label: 'Pháp chưa kịp quay lại', color: COLORS.leaf } },
      { id: '7', position: { x: 350, y: 320 }, data: { label: 'Hội nghị Tân Trào', color: COLORS.leaf, notes: '13-15/8: phát động Tổng khởi nghĩa' } },
      { id: '8', position: { x: 500, y: 320 }, data: { label: 'Hà Nội', color: COLORS.leaf, notes: '19/8/1945' } },
      { id: '9', position: { x: 600, y: 320 }, data: { label: 'Huế 23/8 + Sài Gòn 25/8', color: COLORS.leaf } },
      { id: '10', position: { x: 720, y: 320 }, data: { label: 'Tuyên ngôn độc lập', color: COLORS.warn, notes: '2/9/1945 — Bác Hồ tại Ba Đình' } },
      { id: '11', position: { x: 900, y: 320 }, data: { label: 'Chấm dứt 80 năm Pháp thuộc', color: COLORS.warn } },
      { id: '12', position: { x: 70, y: 460 }, data: { label: 'Đảng đã chuẩn bị từ 1930', color: COLORS.leaf } },
      { id: '13', position: { x: 250, y: 460 }, data: { label: 'Mặt trận Việt Minh', color: COLORS.leaf, notes: 'Thành lập 19/5/1941' } },
      { id: '14', position: { x: 850, y: 460 }, data: { label: 'Mở đầu thời đại mới', color: COLORS.warn } },
      { id: '15', position: { x: 1050, y: 460 }, data: { label: 'Cảm hứng cho phong trào GP dân tộc thế giới', color: COLORS.warn } },
    ],
    edges: [
      { id: 'e1-2', source: '1', target: '2' },
      { id: 'e1-3', source: '1', target: '3' },
      { id: 'e1-4', source: '1', target: '4' },
      { id: 'e2-5', source: '2', target: '5' },
      { id: 'e2-6', source: '2', target: '6' },
      { id: 'e3-7', source: '3', target: '7' },
      { id: 'e3-8', source: '3', target: '8' },
      { id: 'e3-9', source: '3', target: '9' },
      { id: 'e4-10', source: '4', target: '10' },
      { id: 'e4-11', source: '4', target: '11' },
      { id: 'e2-12', source: '2', target: '12' },
      { id: 'e2-13', source: '2', target: '13' },
      { id: 'e4-14', source: '4', target: '14' },
      { id: 'e4-15', source: '4', target: '15' },
    ],
  },
];

export function getMockMindMap(id: string): MindMap | undefined {
  return MOCK_MINDMAPS.find((m) => m.id === id);
}

export function getAllMockMindMaps(): MindMap[] {
  return MOCK_MINDMAPS;
}

export const NODE_COLORS = COLORS;
