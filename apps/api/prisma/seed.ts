/**
 * Prisma seed script.
 *
 * Seeds:
 *   - Admin user (dev only)
 *   - Demo templates (placeholder — full 50+ templates in Sprint 2)
 *
 * Run: pnpm --filter api db:seed
 */

import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main(): Promise<void> {
  // biome-ignore lint/suspicious/noConsoleLog: seed script intentionally logs
  console.log('🌱 Seeding database...');

  // Dev admin user
  const adminEmail = 'admin@nao-ca-vang.local';
  const adminPassword = await bcrypt.hash('AdminDev123!', 12);
  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      email: adminEmail,
      passwordHash: adminPassword,
      name: 'Admin Dev',
      tier: 'admin',
      aiQuotaMonthly: 100_000,
      mindmapQuotaMonthly: 100_000,
      emailVerifiedAt: new Date(),
    },
  });
  console.log(`✅ Admin user: ${admin.email}`);

  // Demo template (full library in Sprint 2 — FR-061)
  const demoTemplate = await prisma.template.upsert({
    where: { id: '00000000-0000-0000-0000-000000000001' },
    update: {},
    create: {
      id: '00000000-0000-0000-0000-000000000001',
      title: 'Demo: Hidrocacbon (Hóa lớp 12)',
      description: 'Mind map mẫu chương Hidrocacbon — Hóa học lớp 12',
      subject: 'chemistry',
      gradeLevel: 'grade-12',
      tags: ['hóa', 'lớp 12', 'demo'],
      isSystem: true,
      data: {
        version: 1,
        rootId: 'root',
        nodes: {
          root: {
            id: 'root',
            text: 'Hidrocacbon',
            color: 'blue',
            icon: null,
            imageUrl: null,
            parentId: null,
            position: 0,
          },
          ankan: {
            id: 'ankan',
            text: 'Ankan',
            color: 'green',
            icon: null,
            imageUrl: null,
            parentId: 'root',
            position: 0,
          },
          anken: {
            id: 'anken',
            text: 'Anken',
            color: 'green',
            icon: null,
            imageUrl: null,
            parentId: 'root',
            position: 1,
          },
          ankin: {
            id: 'ankin',
            text: 'Ankin',
            color: 'green',
            icon: null,
            imageUrl: null,
            parentId: 'root',
            position: 2,
          },
          aromatic: {
            id: 'aromatic',
            text: 'Hidrocacbon thơm',
            color: 'orange',
            icon: null,
            imageUrl: null,
            parentId: 'root',
            position: 3,
          },
        },
        edges: [
          { id: 'e1', source: 'root', target: 'ankan' },
          { id: 'e2', source: 'root', target: 'anken' },
          { id: 'e3', source: 'root', target: 'ankin' },
          { id: 'e4', source: 'root', target: 'aromatic' },
        ],
        viewport: { x: 0, y: 0, zoom: 1 },
      },
    },
  });
  console.log(`✅ Template seeded: ${demoTemplate.title}`);

  console.log('🌱 Seed complete.');
}

main()
  .catch((err) => {
    console.error('Seed failed:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
