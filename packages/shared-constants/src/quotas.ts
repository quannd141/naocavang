/**
 * Quota config by user tier — source of truth for both FE display + BE enforcement.
 *
 * Verify with real usage data after Sprint 3 (see VERIFY_LATER.md V-104, V-205).
 */

export const TIER_QUOTAS = {
  free: {
    aiGenPerMonth: 50,
    mindmapActive: 10,
    pdfPagesMax: 100,
    imageSizeMaxMB: 5,
    flashcardDecksMax: 20,
  },
  premium: {
    aiGenPerMonth: 500,
    mindmapActive: 100,
    pdfPagesMax: 300,
    imageSizeMaxMB: 20,
    flashcardDecksMax: 200,
  },
  pro: {
    aiGenPerMonth: 5_000,
    mindmapActive: 1_000,
    pdfPagesMax: 1_000,
    imageSizeMaxMB: 50,
    flashcardDecksMax: 2_000,
  },
  admin: {
    aiGenPerMonth: 100_000,
    mindmapActive: 100_000,
    pdfPagesMax: 10_000,
    imageSizeMaxMB: 100,
    flashcardDecksMax: 100_000,
  },
} as const;

export type TierName = keyof typeof TIER_QUOTAS;

export const TIER_PRICING_VND = {
  free: 0,
  premium: 99_000, // VND/tháng
  pro: 199_000, // VND/tháng
  group_5: 250_000, // VND/tháng cho 5 user
} as const;
